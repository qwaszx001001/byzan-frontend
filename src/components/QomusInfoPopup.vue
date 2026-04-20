<script setup>
import { getAssetUrl } from '../utils/assets'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close'])

const closePopup = () => {
  emit('close')
}

// Asset URLs - menggunakan gambar yang sama dari Byzanpedia.vue
const bookImageSrc = getAssetUrl('4816d2ebbaf9ddf9ad6a1e1f99f7b9bfb15fada7.png')
const gradient3Src = getAssetUrl('gradient3.png')
</script>

<template>
  <!-- Popup Overlay -->
  <div 
    v-if="show"
    class="fixed inset-0 bg-white/20 backdrop-blur-sm flex items-center justify-center z-999 p-4"
    @click.self="closePopup"
  >
    <!-- Popup Content -->
    <div class="bg-white rounded-3xl max-w-4xl w-full py-12 px-10 md:px-16 lg:px-20 relative shadow-2xl overflow-hidden grid-background">
      <!-- Close Button -->
      <button 
        @click="closePopup"
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
      <div class="relative md:gap-12 flex flex-col md:flex-row w-full z-10" style="z-index: 10;">
        <!-- Book Image -->
        <div class="flex justify-center">
          <img 
            :src="bookImageSrc" 
            alt="Qomus Saku" 
            class="w-64 lg:h-full h-auto object-contain"
          />
        </div>

        <div class="flex flex-col gap-4 justify-center items-center md:items-start">
          <!-- Title -->
          <h2 class="text-primary text-2xl md:text-3xl lg:text-5xl font-bold font-montserrat text-center md:text-left">
            Tentang<br>
            Qomus Saku
          </h2>

          <!-- Description -->
          <div class="text-sm text-center md:text-left opacity-90 leading-relaxed max-w-lg">
            <p class="mb-4">
              Qomus adalah buku kamus tiga bahasa yang memuat kosakata Bahasa Inggris, Bahasa Indonesia, dan Bahasa Arab dalam satu referensi. 
            </p>
            <p class="mb-4">
              Buku ini dirancang untuk membantu pengguna memahami arti kata, terjemahan, serta penggunaan dasar dalam ketiga bahasa tersebut.
            </p>
            <p>
              Cocok digunakan oleh pelajar, mahasiswa, maupun masyarakat umum sebagai panduan belajar bahasa secara praktis dan mudah dipahami.
            </p>
          </div>

          <!-- Action Button -->
          <div class="mt-6">
            <button 
              @click="closePopup"
              class="px-8 py-3 bg-black text-white rounded-full hover:bg-gray-800 transition-colors duration-200 font-medium"
            >
              Tutup
            </button>
          </div>
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
</style>