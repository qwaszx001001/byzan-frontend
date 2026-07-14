<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppHeader from '../../components/AppHeader.vue'
import AppFooter from '../../components/AppFooter.vue'
import SuccessModal from '../../components/SuccessModal.vue'
import ErrorModal from '../../components/ErrorModal.vue'
import { useAuthStore } from '../../stores/auth'
import api from '../../services/api'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const isAuthenticated = computed(() => auth.isAuthenticated)

const code = ref(String(route.params.code || '').trim())
const verifying = ref(false)
const verified = ref(false)
const message = ref('')

const showSuccess = ref(false)
const showError = ref(false)

const logout = () => {
  auth.logout()
  router.push('/')
}

const verify = async () => {
  const c = String(code.value || '').trim()
  if (!c) return

  verifying.value = true
  verified.value = false
  message.value = ''
  showSuccess.value = false
  showError.value = false

  try {
    const res = await api.get(`/certificates/${encodeURIComponent(c)}/verify/`)
    const data = res?.data
    verified.value = true
    if (data && typeof data === 'object' && Object.keys(data).length) {
      message.value = data?.message || 'Sertifikat valid.'
    } else {
      message.value = 'Sertifikat valid.'
    }
    showSuccess.value = true
  } catch (e) {
    const resData = e.response?.data
    if (resData && typeof resData === 'object') {
      const messages = Object.entries(resData)
        .map(([k, v]) => Array.isArray(v) ? `${k}: ${v.join(', ')}` : `${k}: ${v}`)
        .join(' | ')
      message.value = messages
    } else {
      message.value = e.response?.data?.message || e.response?.data?.error || e.message || 'Sertifikat tidak valid.'
    }
    showError.value = true
  } finally {
    verifying.value = false
  }
}

onMounted(() => {
  if (code.value) verify()
})
</script>

<template>
  <div class="page">
    <AppHeader :is-authenticated="isAuthenticated" :user="auth.user" @logout="logout" />
    <SuccessModal :show="showSuccess" title="Valid" :message="message" @close="showSuccess = false" />
    <ErrorModal :show="showError" title="Tidak Valid" :message="message" @close="showError = false" />

    <main class="content">
      <div class="card">
        <h1 class="title">Verifikasi Sertifikat</h1>
        <p class="subtitle">Masukkan code sertifikat untuk mengecek validitas.</p>

        <form class="form" @submit.prevent="verify">
          <input v-model="code" type="text" class="input" placeholder="Contoh: ABCD1234" />
          <button class="btn" type="submit" :disabled="verifying || !code">
            {{ verifying ? 'Memeriksa...' : 'Verifikasi' }}
          </button>
        </form>

        <!-- Shimmer loading saat memverifikasi -->
        <div v-if="verifying" class="result-skeleton">
          <div class="sk-icon shimmer"></div>
          <div class="sk-line shimmer"></div>
          <div class="sk-line sk-line--sm shimmer"></div>
        </div>
      </div>
    </main>

    <AppFooter :is-authenticated="isAuthenticated" :user="auth.user" @logout="logout" />
  </div>
</template>

<style scoped>
.page {
  max-width: 100%;
  margin: 0 auto;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #ffffff;
}
.content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 16px;
}
.card {
  width: 100%;
  max-width: 520px;
  border: 1px solid #e0e0e0;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.08);
}
.title {
  margin: 0 0 8px 0;
  font-family: 'Montserrat', sans-serif;
  font-size: 24px;
  font-weight: 800;
  color: #009444;
  line-height: 1.2;
}
.subtitle {
  margin: 0 0 16px 0;
  font-family: 'Montserrat', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #666666;
}
.form {
  display: flex;
  gap: 12px;
}
.input {
  flex: 1;
  min-width: 0;
  height: 44px;
  padding: 0 14px;
  border-radius: 10px;
  border: 1px solid #d9d9d9;
  font-family: 'Montserrat', sans-serif;
  font-size: 14px;
}
.input:focus {
  outline: none;
  border-color: #009444;
  box-shadow: 0 0 0 3px rgba(0, 148, 68, 0.15);
}
.btn {
  height: 44px;
  padding: 0 18px;
  border-radius: 10px;
  border: none;
  background: #009444;
  color: #ffffff;
  font-family: 'Montserrat', sans-serif;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.2s;
  white-space: nowrap;
}
.btn:hover:not(:disabled) {
  opacity: 0.9;
}
.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Mobile: input & tombol stack vertikal biar nggak sempit */
/* ===== Shimmer loading ===== */
.result-skeleton {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin-top: 24px;
}
.sk-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
}
.sk-line {
  width: 80%;
  height: 14px;
  border-radius: 6px;
}
.sk-line--sm {
  width: 55%;
  height: 12px;
}
.shimmer {
  position: relative;
  overflow: hidden;
  background-color: #e5e7eb;
}
.shimmer::after {
  content: '';
  position: absolute;
  inset: 0;
  transform: translateX(-100%);
  background: linear-gradient(90deg, rgba(229,231,235,0) 0%, rgba(255,255,255,0.6) 50%, rgba(229,231,235,0) 100%);
  animation: shimmer 1.4s infinite;
}
@keyframes shimmer { 100% { transform: translateX(100%); } }

@media (prefers-reduced-motion: reduce) {
  .shimmer::after { animation: none; }
}

@media (max-width: 480px) {
  .card {
    padding: 20px;
  }
  .title {
    font-size: 22px;
  }
  .form {
    flex-direction: column;
  }
  .btn {
    width: 100%;
  }
}
</style>