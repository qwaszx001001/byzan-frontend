<template>
  <!-- Popup Overlay -->
  <div 
    v-if="isVisible"
    class="fixed inset-0 bg-white/20 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    @click.self="closeModal"
  >
    <!-- Popup Content -->
    <div class="bg-white rounded-3xl max-w-4xl w-full py-12 px-10 md:px-16 lg:px-20 relative shadow-2xl overflow-hidden grid-background">
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
        class="absolute top-[30%] -left-[30%] h-full object-cover object-top-right pointer-events-none"
        style="z-index: 0;"
      />
      <img 
        :src="gradient3Src" 
        alt="Background Gradient" 
        class="absolute -top-[40%] -right-[35%] -rotate-195 h-full object-cover object-top-right pointer-events-none"
        style="z-index: 0;"
      />

      <!-- Content -->
      <div class="relative gap-12 flex flex-col md:flex-row w-full z-10" style="z-index: 10;">


        <div class="flex flex-col gap-4 justify-center items-center md:items-start flex-1">
          <!-- Header -->
          <div class="mb-6">
            <h2 class="text-primary text-2xl md:text-3xl lg:text-5xl font-bold font-montserrat mb-4">Upload Naskah</h2>
          </div>

          <!-- Form -->
          <form @submit.prevent="submitForm" class="w-full space-y-4">
            <!-- Email Field -->
            <div class="mb-4">
              <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                id="email"
                v-model="form.email"
                type="email"
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white/80 backdrop-blur-sm"
                placeholder="contoh@email.com"
              />
            </div>

            <!-- Judul Buku Field -->
            <div class="mb-4">
              <label for="judulBuku" class="block text-sm font-medium text-gray-700 mb-2">
                Judul Buku *
              </label>
              <input
                id="judulBuku"
                v-model="form.judulBuku"
                type="text"
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white/80 backdrop-blur-sm"
                placeholder="Masukkan judul buku"
              />
            </div>

            <!-- Deskripsi Buku Field -->
            <div class="mb-6">
              <label for="deskripsiBuku" class="block text-sm font-medium text-gray-700 mb-2">
                Deskripsi Buku *
              </label>
              <textarea
                id="deskripsiBuku"
                v-model="form.deskripsiBuku"
                rows="4"
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none bg-white/80 backdrop-blur-sm"
                placeholder="Berikan deskripsi singkat tentang buku Anda"
              ></textarea>
            </div>

            <!-- Action Buttons -->
            <div class="mt-6 flex gap-4 justify-end">
              <button
                type="button"
                @click="closeModal"
                class="px-8 py-3 text-gray-700 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors duration-200 font-medium min-w-[120px]"
              >
                Batal
              </button>
              <button
                type="submit"
                :disabled="isSubmitting"
                class="px-8 py-3 bg-black text-white rounded-full hover:bg-gray-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium min-w-[120px]"
              >
                {{ isSubmitting ? 'Mengirim...' : 'Kirim' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { getAssetUrl } from '../utils/assets'

const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'submit'])

const isSubmitting = ref(false)

// Asset URLs
const gradient3Src = getAssetUrl('gradient3.png')

const form = reactive({
  email: '',
  judulBuku: '',
  deskripsiBuku: ''
})

const closeModal = () => {
  emit('close')
  resetForm()
}

const resetForm = () => {
  form.email = ''
  form.judulBuku = ''
  form.deskripsiBuku = ''
}

const submitForm = async () => {
  if (isSubmitting.value) return

  isSubmitting.value = true
  
  try {
    // Emit form data to parent component
    await emit('submit', { ...form })
    
    // Reset form after successful submission
    resetForm()
  } catch (error) {
    console.error('Error submitting form:', error)
  } finally {
    isSubmitting.value = false
  }
}
</script>

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
</style>