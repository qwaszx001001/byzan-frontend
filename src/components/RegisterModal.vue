<script setup>
import { ref, defineEmits } from 'vue'
import { useAuthStore } from '../stores/auth'
import { getAssetUrl } from '../utils/assets'
import SuccessModal from './SuccessModal.vue'
import ErrorModal from './ErrorModal.vue'

const emit = defineEmits(['close', 'openLogin'])

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

const auth = useAuthStore()

// Form data
const formData = ref({
  fullName: '',
  username: '',
  email: '',
  phoneNumber: '',
  password: '',
  confirmPassword: ''
})

// Form validation
const errors = ref({})
const isLoading = ref(false)
const showSuccess = ref(false)
const showError = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

const normalizePhone = (phone) => {
  if (!phone) return ''
  const digits = String(phone).replace(/[^\d+]/g, '')
  if (digits.startsWith('+')) return digits
  if (digits.startsWith('0')) return `+62${digits.slice(1)}`
  if (digits.startsWith('62')) return `+${digits}`
  return `+62${digits}`
}

// Asset URLs
const gradient3Src = getAssetUrl('gradient3.png')

const validateForm = () => {
  errors.value = {}

  if (!formData.value.fullName.trim()) {
    errors.value.fullName = 'Nama lengkap wajib diisi'
  }
  
  if (!formData.value.username.trim()) {
    errors.value.username = 'Username wajib diisi'
  } else if (formData.value.username.length < 3) {
    errors.value.username = 'Username minimal 3 karakter'
  }
  
  if (!formData.value.email.trim()) {
    errors.value.email = 'Email wajib diisi'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.value.email)) {
    errors.value.email = 'Format email tidak valid'
  }
  
  if (!formData.value.phoneNumber.trim()) {
    errors.value.phoneNumber = 'Nomor telepon wajib diisi'
  } else if (!/^[0-9+\-\s()]{10,15}$/.test(formData.value.phoneNumber)) {
    errors.value.phoneNumber = 'Format nomor telepon tidak valid'
  }
  
  if (!formData.value.password) {
    errors.value.password = 'Password wajib diisi'
  } else if (formData.value.password.length < 6) {
    errors.value.password = 'Password minimal 6 karakter'
  }
  
  if (!formData.value.confirmPassword) {
    errors.value.confirmPassword = 'Konfirmasi password wajib diisi'
  } else if (formData.value.password !== formData.value.confirmPassword) {
    errors.value.confirmPassword = 'Password tidak cocok'
  }
  
  return Object.keys(errors.value).length === 0
}

const handleSubmit = async () => {
  if (!validateForm()) return
  
  isLoading.value = true
  
  try {
    const payload = {
      full_name: formData.value.fullName.trim(),
      username: formData.value.username.trim(),
      email: formData.value.email.trim(),
      phone: normalizePhone(formData.value.phoneNumber),
      password: formData.value.password,
      confirm_password: formData.value.confirmPassword,
    }
    await auth.register(payload)
    
    formData.value = {
      fullName: '',
      username: '',
      email: '',
      phoneNumber: '',
      password: '',
      confirmPassword: ''
    }
    
    successMessage.value = 'Registrasi berhasil! Silakan login.'
    showSuccess.value = true
    
  } catch (error) {
    errorMessage.value = auth.error || error?.response?.data?.message || error?.message || 'Terjadi kesalahan saat registrasi. Silakan coba lagi.'
    showError.value = true
  } finally {
    isLoading.value = false
  }
}

const closeModal = () => {
  // Reset form when closing
  formData.value = {
    fullName: '',
    username: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: ''
  }
  errors.value = {}
  emit('close')
}

const openLogin = () => {
  emit('openLogin')
}

const handleCloseSuccess = () => {
  showSuccess.value = false
  closeModal()
  emit('openLogin')
}

const handleCloseError = () => {
  showError.value = false
}
</script>

<template>
  <!-- Popup Overlay -->
  <div 
    v-if="show"
    class="fixed top-0 left-0 right-0 bottom-0 bg-white/20 backdrop-blur-sm flex items-center justify-center z-[10001] p-4"
    @click.self="closeModal"
    style="width: 100vw; height: 100vh;"
  >
    <SuccessModal
      :show="showSuccess"
      title="Registrasi Berhasil"
      :message="successMessage"
      @close="handleCloseSuccess"
    />
    <ErrorModal
      :show="showError"
      title="Registrasi Gagal"
      :message="errorMessage"
      @close="handleCloseError"
    />
    <!-- Popup Content -->
    <div class="bg-white rounded-3xl max-w-4xl w-full py-8 px-10 md:px-16 lg:px-20 relative shadow-2xl overflow-hidden grid-background max-h-[90vh]">
      <!-- Close Button -->
      <button 
        @click="closeModal"
        class="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded-full text-gray-600 hover:text-gray-800 transition-colors z-10"
      >
        ✕
      </button>

      <!-- Background Gradient Image -->
      <img 
        :src="gradient3Src" 
        alt="Background Gradient" 
        class="absolute top-[30%] -left-[30%] object-cover object-top-right pointer-events-none"
        style="z-index: 0;"
      />
      <img 
        :src="gradient3Src" 
        alt="Background Gradient" 
        class="absolute -top-[40%] -right-[35%] -rotate-195 h-full object-cover object-top-right pointer-events-none"
        style="z-index: 0;"
      />

      <!-- Content -->
      <div class="relative flex flex-col md:flex-row w-full z-10" style="z-index: 10;">

        <div class="flex flex-col gap-2 justify-center items-center md:items-start flex-1">
          <!-- Header -->
          <div class="mb-3">
            <h2 class="text-primary text-xl md:text-2xl lg:text-3xl font-bold font-montserrat mb-2">Daftar Sekarang</h2>

            <!-- Description -->
            <p class="text-sm text-center md:text-left opacity-90">
              Mulai perjalanan belajar Anda bersama ByzanEducation
            </p>
          </div>

          <!-- Form -->
          <form @submit.prevent="handleSubmit" class="w-full space-y-2">
            <!-- Full Name -->
            <div>
              <label for="fullName" class="block text-sm font-medium text-gray-700 mb-2">
                Nama Lengkap <span class="text-red-500">*</span>
              </label>
              <input
                id="fullName"
                v-model="formData.fullName"
                type="text"
                class="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white/80 backdrop-blur-sm transition-colors duration-200"
                :class="{ 'border-red-500': errors.fullName }"
                placeholder="Masukkan nama lengkap"
              />
              <p v-if="errors.fullName" class="mt-1 text-sm text-red-500">{{ errors.fullName }}</p>
            </div>

            <!-- Username -->
            <div>
              <label for="username" class="block text-sm font-medium text-gray-700 mb-2">
                Username <span class="text-red-500">*</span>
              </label>
              <input
                id="username"
                v-model="formData.username"
                type="text"
                class="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white/80 backdrop-blur-sm transition-colors duration-200"
                :class="{ 'border-red-500': errors.username }"
                placeholder="Masukkan username"
              />
              <p v-if="errors.username" class="mt-1 text-sm text-red-500">{{ errors.username }}</p>
            </div>

            <!-- Email -->
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
                Email <span class="text-red-500">*</span>
              </label>
              <input
                id="email"
                v-model="formData.email"
                type="email"
                class="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white/80 backdrop-blur-sm transition-colors duration-200"
                :class="{ 'border-red-500': errors.email }"
                placeholder="contoh@email.com"
              />
              <p v-if="errors.email" class="mt-1 text-sm text-red-500">{{ errors.email }}</p>
            </div>

            <!-- Phone Number -->
            <div>
              <label for="phoneNumber" class="block text-sm font-medium text-gray-700 mb-2">
                Nomor Telepon <span class="text-red-500">*</span>
              </label>
              <input
                id="phoneNumber"
                v-model="formData.phoneNumber"
                type="tel"
                class="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white/80 backdrop-blur-sm transition-colors duration-200"
                :class="{ 'border-red-500': errors.phoneNumber }"
                placeholder="08xxxxxxxxxx"
              />
              <p v-if="errors.phoneNumber" class="mt-1 text-sm text-red-500">{{ errors.phoneNumber }}</p>
            </div>

            <!-- Password -->
            <div>
              <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
                Password <span class="text-red-500">*</span>
              </label>
              <input
                id="password"
                v-model="formData.password"
                type="password"
                class="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white/80 backdrop-blur-sm transition-colors duration-200"
                :class="{ 'border-red-500': errors.password }"
                placeholder="Minimal 6 karakter"
              />
              <p v-if="errors.password" class="mt-1 text-sm text-red-500">{{ errors.password }}</p>
            </div>

            <!-- Confirm Password -->
            <div>
              <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-2">
                Konfirmasi Password <span class="text-red-500">*</span>
              </label>
              <input
                id="confirmPassword"
                v-model="formData.confirmPassword"
                type="password"
                class="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white/80 backdrop-blur-sm transition-colors duration-200"
                :class="{ 'border-red-500': errors.confirmPassword }"
                placeholder="Ulangi password"
              />
              <p v-if="errors.confirmPassword" class="mt-1 text-sm text-red-500">{{ errors.confirmPassword }}</p>
            </div>

            <!-- Submit Button -->
            <div class="flex gap-4 justify-center mt-4">
              <button
                type="button"
                @click="closeModal"
                class="px-8 py-3 text-gray-700 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors duration-200 font-medium min-w-[120px]"
              >
                Batal
              </button>
              <button
                type="submit"
                :disabled="isLoading"
                class="px-8 py-3 bg-black text-white rounded-full hover:bg-gray-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium min-w-[120px]"
              >
                <span v-if="!isLoading">Daftar</span>
                <span v-else class="flex items-center justify-center">
                  <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Mendaftar...
                </span>
              </button>
            </div>
            <div class="mt-6 text-center">
            <p class="text-sm text-gray-600">
              Sudah punya akun? 
              <button 
                type="button" 
                @click="openLogin" 
                class="text-primary font-semibold hover:underline focus:outline-none"
              >
                Klik untuk login
              </button>
            </p>
          </div>
          </form>

          <!-- Login Link -->

        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.fixed {
  animation: fadeIn 0.3s ease-out;
}

/* Grid background pattern */
.grid-background {
  position: relative;
}

.grid-background::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    linear-gradient(rgba(156, 163, 175, 0.205) 1px, transparent 1px),
    linear-gradient(90deg, rgba(156, 163, 175, 0.195) 1px, transparent 1px);
  background-size: 40px 40px;
  opacity: 1;
  pointer-events: none;
  z-index: 1;
}

/* Alternative: try to use the SVG image */
.grid-background::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url('/image/70_1222.svg');
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  opacity: 0.3;
  pointer-events: none;
  z-index: 0;
}

/* Custom scrollbar for modal */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
