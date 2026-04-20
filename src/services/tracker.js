import api from './api'

// Safe navigation tracking utility
// If VITE_TRACKING_ENDPOINT is set, it will POST events there.
// Otherwise, it logs to console and returns.
export function trackNavigation(to, from, user) {
  try {
    const endpoint = import.meta.env.VITE_TRACKING_ENDPOINT || null
    const payload = {
      event: 'route_change',
      timestamp: new Date().toISOString(),
      to: {
        name: to.name || null,
        path: to.fullPath || to.path,
        params: to.params || {},
        query: to.query || {},
      },
      from: from && from.name ? {
        name: from.name,
        path: from.fullPath || from.path,
      } : null,
      user: user ? { id: user.id, email: user.email, username: user.username } : null,
      ua: navigator.userAgent,
    }

    if (!endpoint) {
      // Fallback log if no endpoint configured
      console.debug('[trackNavigation]', payload)
      return Promise.resolve({ ok: true, logged: true })
    }

    return api.post(endpoint, payload).catch((e) => {
      // Fail silently; tracking should never block navigation
      console.debug('[trackNavigation:error]', e?.response?.status || e?.message)
      return { ok: false, error: e }
    })
  } catch (err) {
    console.debug('[trackNavigation:exception]', err?.message)
    return Promise.resolve({ ok: false, error: err })
  }
}