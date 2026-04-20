<script setup>
import { ref, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { getAssetUrl } from '../../utils/assets'
import SuccessModal from '../../components/SuccessModal.vue'
import ErrorModal from '../../components/ErrorModal.vue'

const props = defineProps({
  isModal: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'openRegister'])

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const form = reactive({ email: '', password: '' })
const showPassword = ref(false)
const showSuccess = ref(false)
const showError = ref(false)

const decorGridSrc = getAssetUrl('189_641.svg')
const decorGradientSrc = getAssetUrl('1fc0d4fdf08dabc7e59b35987474afc4af53522b.png')
const emailIconSrc = getAssetUrl('13e43ebf5f62eabbda48ea5302967399e071d8e1.png')
const passwordIconSrc = getAssetUrl('6d294b2d8f0ae1e8b140ce1ca6617953a6632de0.png')
const verifiedIconSrc = getAssetUrl('189_654.svg')
const togglePasswordIconSrc = getAssetUrl('4918794ed8019be8bdfe4c68bf68d034dd64d2bd.png')

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

const handleRegisterClick = () => {
  if (props.isModal) {
    // If this is a modal, emit to parent to handle register modal
    emit('openRegister')
  } else {
    // If standalone page, navigate to register
    router.push('/register')
  }
}

const handleClose = () => {
  if (props.isModal) {
    emit('close')
  } else {
    const redirect = route.query.redirect || '/'
    router.push(redirect === '/login' ? '/' : String(redirect))
  }
}

const onSubmit = async () => {
  try {
    await auth.login(form)
    showSuccess.value = true
    if (props.isModal) {
      // For modal mode, close the modal after successful login
      setTimeout(() => {
        emit('close')
      }, 1500)
    } else {
      const redirect = route.query.redirect || '/'
      router.push(String(redirect))
    }
  } catch (e) {
    showError.value = true
  }
}

</script>

<template>
  <main :class="props.isModal ? 'login-modal-content min-h-screen fixed top-0 left-0 right-0 bottom-0 bg-white/20 backdrop-blur-sm flex items-center justify-center' : 'login-modal-page'">
    <div class="login-card">
      <div class="card-background-decor">
        <img :src="decorGridSrc" alt="Grid pattern" class="decor-grid" />
        <img :src="decorGradientSrc" alt="Gradient decoration" class="decor-gradient-1" />
        <img :src="decorGradientSrc" alt="Gradient decoration" class="decor-gradient-2" />
      </div>

      <div class="login-content">
        <button class="close-button" aria-label="Close" @click="handleClose">x</button>

        <h1 class="login-title">Login</h1>
        <p class="login-subtitle">Halo, Selamat datang kembali di <br />Byzan Education!</p>

        <form class="login-form" @submit.prevent="onSubmit">
          <div class="form-group">
            <img :src="emailIconSrc" alt="Email icon" class="input-icon" />
            <input
              v-model="form.email"
              type="email"
              id="email"
              name="email"
              class="form-input"
              placeholder="Email"
              required
            />
            <div class="verified-status">
              <img :src="verifiedIconSrc" alt="Verified icon" class="verified-icon" />
              <span>Verified</span>
            </div>
          </div>

          <div class="form-group">
            <img :src="passwordIconSrc" alt="Password icon" class="input-icon" />
            <input
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              id="password"
              name="password"
              class="form-input"
              placeholder="Password"
              required
            />
            <button
              type="button"
              class="toggle-password"
              aria-label="Toggle password visibility"
              @click="togglePasswordVisibility"
            >
              <img :src="togglePasswordIconSrc" alt="Toggle visibility icon" />
            </button>
          </div>

          <p v-if="auth.error" class="error-message">{{ auth.error }}</p>

          <button type="submit" class="submit-button" :disabled="auth.loading">
            {{ auth.loading ? 'Loading...' : 'Masuk' }}
          </button>
        </form>

        <SuccessModal
          :show="showSuccess"
          title="Login Berhasil"
          message="Anda berhasil masuk."
          @close="showSuccess = false"
        />
        <ErrorModal
          :show="showError"
          title="Login Gagal"
          :message="auth.error || 'Terjadi kesalahan saat login'"
          @close="showError = false"
        />

        <p class="register-link">
          Belum punya akun? <button type="button" @click="handleRegisterClick" class="register-button">Daftar</button>
        </p>
      </div>
    </div>
  </main>
</template>

<style scoped>


.login-modal-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
  background-color: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(2px);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9999;
  background-color: rgba(0, 0, 0, 0.5);
}

.login-modal-content {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.login-card {
  max-width: 693px;
  width: 100%;
  background-color: var(--color-white, #ffffff);
  border-radius: 39.5px;
  box-shadow: 0px 13px 18px 10px rgba(0, 0, 0, 0.25);
  position: relative;
  overflow: hidden;
}

.card-background-decor {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.decor-grid {
  position: absolute;
  top: -299px;
  left: -519px;
  width: 1727px;
  height: 942px;
  opacity: 0.5;
}

.decor-gradient-1 {
  position: absolute;
  top: 252px;
  left: -236px;
  width: 630px;
  height: 460px;
}

.decor-gradient-2 {
  position: absolute;
  top: -263px;
  left: 420px;
  width: 701px;
  height: 564px;
  transform: rotate(169.84deg);
}

.login-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 42px 74px 60px;
}

.close-button {
  position: absolute;
  top: 20px;
  right: 35px;
  background: none;
  border: none;
  cursor: pointer;
  font-family: 'Nerko One', cursive;
  font-size: 36px;
  color: var(--primary-green, #009444);
  opacity: 0.8;
  padding: 0;
  line-height: 1;
  transition: opacity 0.2s;
}

.close-button:hover {
  opacity: 1;
}

.login-title {
  color: var(--primary-green, #009444);
  font-size: 40px;
  font-weight: 700;
  margin: 0 0 14px 0;
  font-family: 'Montserrat', sans-serif;
}

.login-subtitle {
  color: var(--black, #000000);
  font-size: 16px;
  font-weight: 500;
  text-align: center;
  line-height: 1.25;
  margin: 0 0 48px 0;
  font-family: 'Montserrat', sans-serif;
}

.login-form {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 38px;
}

.form-group {
  display: flex;
  align-items: center;
  gap: 12px;
  background-color: var(--light-gray, #d9d9d9);
  border-radius: 11px;
  padding: 0 16px;
  height: 56px;
  width: 100%;
}

.input-icon {
  height: 24px;
  width: auto;
  flex-shrink: 0;
}

.form-input {
  flex-grow: 1;
  border: none;
  background: transparent;
  outline: none;
  font-family: 'Montserrat', sans-serif;
  font-size: 18px;
  font-weight: 600;
  color: #333;
  width: 100%;
}

.form-input::placeholder {
  color: var(--text-gray, #808080);
  font-weight: 600;
}

.verified-status {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--primary-green, #009444);
  font-size: 14px;
  font-weight: 600;
  flex-shrink: 0;
}

.verified-icon {
  width: 21px;
  height: 21px;
}

.toggle-password {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.toggle-password img {
  width: 35px;
  height: auto;
}

.error-message {
  color: #ff0000;
  font-size: 14px;
  font-weight: 600;
  margin: -20px 0 0 0;
  text-align: center;
  font-family: 'Montserrat', sans-serif;
}

.submit-button {
  background-color: var(--black, #000000);
  color: var(--color-white, #ffffff);
  border-radius: 20px;
  height: 40px;
  border: none;
  font-family: 'Montserrat', sans-serif;
  font-size: 19px;
  font-weight: 600;
  padding: 0 40px;
  cursor: pointer;
  margin-top: 10px;
  transition: opacity 0.2s;
}

.submit-button:hover:not(:disabled) {
  opacity: 0.8;
}

.submit-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.register-link {
  margin-top: 20px;
  font-size: 14px;
  color: var(--black, #000000);
  font-family: 'Montserrat', sans-serif;
}

.register-link a,
.register-button {
  color: var(--primary-green, #009444);
  font-weight: 600;
  text-decoration: none;
  background: none;
  border: none;
  cursor: pointer;
  font-family: 'Montserrat', sans-serif;
  font-size: 14px;
}

.register-link a:hover,
.register-button:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .login-card {
    max-width: 90vw;
  }

  .login-content {
    padding: 40px 25px;
  }

  .login-title {
    font-size: 32px;
  }

  .login-subtitle {
    font-size: 14px;
    margin-bottom: 30px;
  }

  .login-form {
    gap: 20px;
  }

  .form-group {
    height: 50px;
    padding: 0 12px;
  }

  .submit-button {
    width: 100%;
    margin-top: 20px;
  }
}
</style>
