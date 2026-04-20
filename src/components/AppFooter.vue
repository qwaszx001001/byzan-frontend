<script setup>
import { getAssetUrl } from '../utils/assets'

const props = defineProps({
  isAuthenticated: { type: Boolean, default: false },
  user: { type: Object, default: null },
})

const emit = defineEmits(['logout'])

const footerLogo = getAssetUrl('e5953eaab12a20f86febfa843fd39a247183b510.png')
const instagramIcon = getAssetUrl('d6e9d911e05e4853dfe6b144f93286827d807a75.png')
const whatsappIcon = getAssetUrl('d9f04685c4960911b0fcce2f952a9c7057a7e680.png')
const youtubeIcon = getAssetUrl('dcee868fa23cefd86e0f9959a8f86193ce91c3c8.png')
const facebookIcon = getAssetUrl('4211d700a22f97457587d6472900c8916dd31370.png')
const homeIcon = getAssetUrl('1f8437822241c8162163d431a16249e9db1da3ca.png')

const handleLogout = () => emit('logout')
</script>

<template>
  <footer class="bg-[#121212] text-white py-6 px-6 md:px-20" id="footer">
    <div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-5 py-4 md:py-8">
      <!-- Footer Brand -->
      <div class="flex flex-col gap-4 md:gap6 lg:gap-8">
        <div class="flex items-center gap-3">
          <img :src="footerLogo" alt="Byzanedu Logo" class="w-18 h-14 grayscale brightness-0 invert"/>
          <span class="text-2xl font-semibold">Byzanedu.com</span>
        </div>
        <p class="text-lg font-normal leading-tight max-w-md">
          Bersama kita, Level Up Literasi, dengan sentuhan digitalisasi
        </p>
        <div class="flex gap-8">
          <a href="#"><img :src="instagramIcon" alt="Instagram" class="w-11  grayscale brightness-0 invert" /></a>
          <a href="#"><img :src="whatsappIcon" alt="WhatsApp" class="w-11 " /></a>
          <a href="#"><img :src="youtubeIcon" alt="YouTube" class="w-11 " /></a>
          <a href="#"><img :src="facebookIcon" alt="Facebook" class="w-11 " /></a>
        </div>
      </div>
      
      <!-- Footer Navigation -->
      <nav class="flex flex-col gap-4 ml-0 md:ml-5 justify-center">
        <a href="#products" class="text-base font-semibold text-white hover:text-gray-300">ByzanPost</a>
        <a href="#hero" class="text-base font-semibold text-white hover:text-gray-300">ByzanCourse</a>
        <a href="#products" class="text-base font-semibold text-white hover:text-gray-300">ByzanPedia</a>
        <a href="#about" class="text-base font-semibold text-white hover:text-gray-300">About Us</a>
      </nav>
      
      <!-- Footer Meta -->
      <div class="flex flex-col items-center md:items-end justify-between">
        <div class="flex items-center gap-4 pt-6">
          <a href="#hero">
            <img :src="homeIcon" alt="Home" class="w-10 h-10 grayscale brightness-0 invert me-0 md:me-8" />
          </a>
          <template v-if="!props.isAuthenticated">
            <router-link to="/login" class="bg-white px-3 py-1 rounded text-lg font-medium hover:bg-gray-100 transition-colors">
              <span class="text-black font-semibold">Log in</span>
            </router-link>
            <router-link to="/register" class="bg-green-600  px-3 py-1 rounded  hover:bg-green-700 transition-colors">
              <span class="text-white text-lg font-semibold">Sign in</span>
            </router-link>
          </template>
          <template v-else>
            <span class="font-semibold font-montserrat">{{ props.user?.full_name || props.user?.username || props.user?.email || 'User' }}</span>
            <button class="bg-green-600 text-white px-3 py-1 rounded text-lg font-medium hover:bg-green-700 transition-colors" type="button" @click="handleLogout">Logout</button>
          </template>
        </div>
        <p class="text-lg font-normal text-center md:text-right mt-4 md:mt-0">© 2025 Byzan Education. All Rights Reserved.</p>
      </div>
    </div>
  </footer>
</template>

<style scoped>
/* Custom utilities if needed */
</style>

