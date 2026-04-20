import { defineStore } from 'pinia'
import api from '../services/api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    user: JSON.parse(localStorage.getItem('userData') || 'null'),
    loading: false,
    error: null,
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
  },
  actions: {
    async login(credentials) {
      this.loading = true; this.error = null
      try {
        const payload = (() => {
          const password = credentials.password
          const uname = credentials.username || credentials.email
          if (credentials.email) return { email: credentials.email, password }
          if (credentials.username) return { username: credentials.username, password }
          return { email: uname, password }
        })()

        // Utamakan endpoint login sesuai dokumentasi; fallback ke token bila gagal
        let data
        try {
          ({ data } = await api.post('/auth/login/', payload, { withCredentials: false }))
        } catch (e1) {
          ({ data } = await api.post('/auth/token/', payload, { withCredentials: false }))
        }
        const accessToken = data?.access || data?.token
        if (!accessToken) throw new Error('Response login tidak mengandung token')
        this.token = accessToken
        localStorage.setItem('token', accessToken)
        if (data?.refresh) localStorage.setItem('refresh_token', data.refresh)
        const userData = data?.user || data?.profile || null
        if (userData) {
          this.user = userData
          localStorage.setItem('userData', JSON.stringify(userData))
        }
      } catch (err) {
        const resData = err.response?.data
        if (resData && typeof resData === 'object') {
          const messages = Object.entries(resData)
            .map(([k, v]) => Array.isArray(v) ? `${k}: ${v.join(', ')}` : `${k}: ${v}`)
            .join(' | ')
          this.error = messages
        } else {
          this.error = err.response?.data?.message || err.message
        }
        throw err
      } finally {
        this.loading = false
      }
    },
    async refreshToken() {
      this.loading = true; this.error = null
      try {
        const refresh = localStorage.getItem('refresh_token')
        if (!refresh) throw new Error('Refresh token tidak tersedia')
        const { data } = await api.post('/auth/token/refresh/', { refresh }, { withCredentials: false })
        if (!data.access) throw new Error('Access token tidak ada pada response refresh')
        this.token = data.access
        localStorage.setItem('token', data.access)
        return data
      } catch (err) {
        this.error = err.response?.data?.message || err.message
        throw err
      } finally {
        this.loading = false
      }
    },
    async register(payload) {
      this.loading = true; this.error = null
      try {
        const { data } = await api.post('/auth/register/', payload, { withCredentials: false })
        // Banyak API register tidak mengembalikan token; arahkan user untuk login.
        this.user = data
        return data
      } catch (err) {
        const resData = err.response?.data
        if (resData && typeof resData === 'object') {
          const messages = Object.entries(resData)
            .map(([k, v]) => Array.isArray(v) ? `${k}: ${v.join(', ')}` : `${k}: ${v}`)
            .join(' | ')
          this.error = messages
        } else {
          this.error = err.response?.data?.message || err.response?.data?.error || err.message
        }
        throw err
      } finally {
        this.loading = false
      }
    },
    async fetchMe() {
      try {
        const { data } = await api.get('/users/me')
        this.user = data
      } catch (err) {
        this.error = err.response?.data?.message || err.message
      }
    },
    logout() {
      this.token = null
      this.user = null
      localStorage.removeItem('token')
      localStorage.removeItem('userData')
      localStorage.removeItem('refresh_token')
    }
  }
})
