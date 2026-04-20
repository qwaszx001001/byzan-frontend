<script setup>
import { computed, onMounted, ref } from 'vue'
import AppFooter from '../components/AppFooter.vue'
import AppHeader from '../components/AppHeader.vue'
import { getAssetUrl } from '../utils/assets'
import { useAuthStore } from '../stores/auth'
import { CarouselCard, CarouselCardItem } from 'vue-carousel-card'
import 'vue-carousel-card/styles/index.css'

// Components registration untuk Composition API
const components = {
  CarouselCard,
  CarouselCardItem
}

const auth = useAuthStore()



const isAuthenticated = computed(() => auth.isAuthenticated)
const displayName = computed(() => auth.user?.name || auth.user?.email || '')

const heroBackgroundSrc = getAssetUrl('9c94e32a83719ff8f61468240cd520818cd948cf.png')
const heroGradientSrc = getAssetUrl('1546614f57dbcbddaad5b7f9eda092ce3f610db4.png')
const scrollIndicatorSrc = getAssetUrl('6b67e94644a008c44eb8be2a796f9a04f64046af.png')
const aboutImageSrc = getAssetUrl('d6e9d911e05e4853dfe6b144f93286827d807a75.png')
const byzantiumLogoSrc = getAssetUrl('byzantiumlogo.png')
const bookImageSrc = getAssetUrl('book.png')

// Assets untuk Features Section (disamakan dengan about/Index.vue)
const brainImgSrc = getAssetUrl('brain.png')
const cloudImgSrc = getAssetUrl('cloud.png')
const gradient3Src = getAssetUrl('gradient3.png')
const gradient4Src = getAssetUrl('gradient4.jpg')
const featuresBg1Src = getAssetUrl('a4172cfc499709269cb30af84c815743998b654c.png')
const planePaperSrc = getAssetUrl('plane-paper.png')
const featuresBg2Src = getAssetUrl('389_106.svg')
const postCardImageSrc = getAssetUrl('54f333db7281a49580cc7f2362aa68664d3460ec.png')
const courseImageSrc = getAssetUrl('5bd5c69c68fe54919744198aea008ec38c5ccf96.png')
const courseOverlaySrc = getAssetUrl('389_27.svg')
const pediaImage1Src = getAssetUrl('54f333db7281a49580cc7f2362aa68664d3460ec.png')
const pediaImage2Src = getAssetUrl('3b647ba86b93a6f6ad4d4e23cbca320ddd9bae05.png')

const productImages = {
  course: getAssetUrl('45f53bfabc85748aba3e23079278b1ae83c9ca3c.png'),
  pedia: getAssetUrl('5bd5c69c68fe54919744198aea008ec38c5ccf96.png'),
  post: getAssetUrl('4211d700a22f97457587d6472900c8916dd31370.png'),
}

// Data untuk cards features
const cardsData = [
  {
    id: 'post',
    title: 'Byzan Post',
    link: '/byzanpost',
    linkText: 'Click Here For Reading',
    image: postCardImageSrc,
    alt: 'Byzan Post'
  },
  {
    id: 'course',
    title: 'Byzan Course',
    link: '/course',
    linkText: 'Click Here For Free Course',
    image: courseImageSrc,
    alt: 'Byzan Course'
  },
  {
    id: 'pedia',
    title: 'Byzan Pedia',
    link: '/byzanpedia',
    linkText: 'Click Here For Reading',
    image: pediaImage2Src,
    alt: 'Byzan Pedia'
  },
    {
    id: 'cooming-soon',
    title: 'Cooming Soon',
    link: '/byzanpost',
    linkText: 'Cooming Soon..',
    image: postCardImageSrc,
    alt: 'Byzan Post'
  },
]

const heroBackgroundStyle = computed(() => ({
  '--hero-gradient-image': `url(${heroGradientSrc})`,
}))

const logout = () => {
  auth.logout()
}

// Vue Carousel Card configuration
const carouselCardRef = ref()
const currentSlide = ref(1) // Start with course card (index 1)
const windowWidth = ref(window.innerWidth)

// Computed carousel height based on screen size
const carouselHeight = computed(() => {
  if (windowWidth.value <= 480) return '350px'
  if (windowWidth.value <= 768) return '400px'
  return '500px'
})

// Handle window resize
const handleResize = () => {
  windowWidth.value = window.innerWidth
}

// Add window resize listener
onMounted(() => {
  // Tidak memanggil endpoint /me; UI tidak bergantung pada profil.
  // Set initial center card
  currentSlide.value = 1
  
  // Add resize listener
  window.addEventListener('resize', handleResize)
})

// Cleanup on unmount
import { onUnmounted } from 'vue'
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

// Handle slide change
const changeHandle = (index) => {
  currentSlide.value = index
}

// Navigation methods
const nextSlide = () => {
  carouselCardRef.value?.next()
}

const prevSlide = () => {
  carouselCardRef.value?.prev()
}

const goToSlide = (index) => {
  carouselCardRef.value?.setActiveItem(index)
}

// Smooth scroll to features section
const smoothScrollToFeatures = (event) => {
  event.preventDefault()
  const featuresSection = document.getElementById('features')
  if (featuresSection) {
    featuresSection.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    })
  }
}
</script>



<template>
    <div class="font-montserrat mx-auto bg-light text-[--color-text] relative ">
    <AppHeader :is-authenticated="isAuthenticated" :user="auth.user" @logout="logout" />

    <div class="overflow-x-hidden">
      <section id="hero" class="h-screen relative flex flex-col items-center justify-start text-center text-[--color-text] -mt-[79px]">
      <div class="absolute inset-0 z-0 pointer-events-none" aria-hidden="true" :style="heroBackgroundStyle">
        <img
          :src="heroBackgroundSrc"
          alt="Group of students"
          class="absolute inset-0 w-full h-full object-cover object-center block min-w-full min-h-full"
          @error="console.error('Failed to load hero background:', heroBackgroundSrc)"
          @load="console.log('Hero background loaded:', heroBackgroundSrc)"
        />
        <div class="hero-gradient hero-gradient-1 absolute bg-cover w-[1800px] h-[2000px] top-[37px] right-0 translate-x-1/2 rotate-[55.48deg] z-0 animate-gradient-pulse"></div>
        <div class="hero-gradient hero-gradient-2 absolute bg-cover w-[1000px] h-[1000px] top-120 -left-[500px]  rotate-[210.35deg] z-1 animate-gradient-shift"></div>
      </div>
      <div class="pt-32 max-w-[780px] mx-auto flex flex-col items-center gap-6 relative z-2">
        <h1 class="flex flex-col gap-2">
          <span class="font-comic-neue font-bold text-xl md:text-2xl lg:text-3xl capitalize text-shadow-white">Bersama Kita</span>
          <span class="font-comfortaa font-bold text-2xl md:text-3xl lg:text-5xl capitalize text-shadow-white">Level Up Literasi !</span>
          <span class="font-montserrat font-semibold text-[18.5px] text-[#009444] text-primary text-shadow-white-sm">dengan sentuhan digitalisasi</span>
        </h1>
        <!-- <p v-if="isAuthenticated" class="mt-6 text-lg font-medium text-dark">
          Selamat datang kembali, {{ displayName }}
        </p> -->
      </div>
      <a href="#features" @click="smoothScrollToFeatures" class="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[50px] h-[61px] z-1" aria-label="Scroll to products">
        <img :src="scrollIndicatorSrc" alt="Scroll down arrow" class="w-full animate-bounce" />
      </a>
    </section>

    <section id="features" class="relative pt-[68px] pb-[203px] md:min-h-screen">
      <!-- <section id="features" class="relative pt-[68px] pb-[203px] bg-[#0a1e2a]"> -->
      <div class="absolute top-0 left-0 w-full h-full">
        <!-- <img :src="featuresBg1Src" alt="Abstract background" class="absolute top-0 left-1/2 transform -translate-x-1/2 w-full h-[1080px] max-w-none object-cover z-0" /> -->
        <img :src="gradient3Src" alt="Gradient Decoration" class="absolute top-[10vh] left-0 -translate-x-1/2 w-[250vw] object-cover z-0" />
        <img :src="featuresBg2Src" alt="Grid background" class="absolute top-0 left-1/2 transform -translate-x-1/2 w-[1823px] h-[994px] opacity-50 max-w-none object-cover" />
        <img :src="brainImgSrc" alt="Brain Image" class="absolute top-10 md:top-16 lg:top-20 left-6 md:left-20 lg:left-32 w-40 md:w-64 lg:w-[270px] object-cover z-0 animate-wiggle" />
        <img :src="planePaperSrc" alt="Plane Image" class="absolute top-20 md:top-32 lg:top-40 right-6 md:right-20 lgright-32 w-16 md:w-32 lg:w-[132px] object-cover z-0 animate-float" />
        <img :src="cloudImgSrc" alt="Cloud Image" class="absolute bottom-10 left-20 w-full object-cover z-0 animate-drift" />
        <img :src="bookImageSrc" alt="Book Image" class="absolute -bottom-6 md:-bottom-10 right-28 w-24 md:w-40 lg:w-[210px] object-cover z-1 animate-sway" />

      </div>

      <div class="relative z-2 text-center max-w-full mx-auto px-5 w-full">
        <div class="flex flex-col gap-1 mt-6 md:mt-12 lg:pt-20">
          <h2 class="text-lg md:text-xl lg:text-3xl font-semibold pb-0 lg:pb-4">Byzan Education</h2>
          <h3 class="text-xl md:text-2xl lg:text-5xl font-comfortaa font-semibold">Boost Your Literacy!</h3>
          <h2 class="font-montserrat font-semibold text-lg md:text-2xl lg:text-3xl text-green-600">Learn, Grow, and Sharing with Us.</h2>
        </div>

        <div class="rounded-lg max-w-7xl mx-auto mt-6">
          <div class="w-full max-w-6xl mx-auto my-8 px-0 md:px-6 lg:px-8 relative ">
          <CarouselCard 
            ref="carouselCardRef"
            :interval="3000"
            :autoplay="true"
            :height="carouselHeight"
            type="card"
            :itemsToShow="1"
            arrow="always"
            :pause-on-hover="true"
            :initial-index="1"
            class="relative responsive-carousel"
            @change="changeHandle"
          >
            <CarouselCardItem 
            class="bg-none!"
              v-for="(card, index) in cardsData" 
              :key="card.id"
              :name="card.id"
            >
              <div 
                :class="[
                  'w-full rounded-3xl p-3 sm:p-4 md:p-5 box-border flex flex-col items-center justify-center text-center transition-all duration-700 ease-out mx-auto carousel-card-content',
                  index === currentSlide 
                    ? 'bg-white scale-100 opacity-100 z-10' 
                    : 'bg-white/20 backdrop-blur-2xl hover:scale-95 hover:-translate-y-2 hover:opacity-90'
                ]"
                :style="{
                  height: windowWidth <= 480 ? '280px' : windowWidth <= 768 ? '320px' : '380px'
                }"
              >
                <div class="w-full aspect-3/4 rounded-2xl overflow-hidden mb-4 md:mb-5 relative">
                  <img 
                    :src="card.image" 
                    :alt="card.alt" 
                    class="w-full h-full object-cover rounded-2xl transition-transform duration-400 hover:scale-105" 
                  />
                </div>
                <div class="flex-1 flex flex-col justify-center items-center">
                  <h3 
                    :class="[
                      'font-montserrat font-bold text-slate-800 leading-tight mb-3 md:mb-4 transition-all duration-300',
                      index === currentSlide ? 'text-lg lg:text-2xl md:text-4xl text-green-600!' : 'text-xl md:text-2xl'
                    ]"
                  >
                    {{ card.title }}
                  </h3>
                  <router-link 
                    :to="card.link" 
                    :class="[
                      'mt-2 font-montserrat font-semibold text-white no-underline rounded-full transition-all duration-300 inline-block',
                      index === currentSlide 
                        ? 'text-sm px-2 md:px-6 py-1 md:py-3 bg-linear-to-r from-green-600 to-green-500 hover:shadow-lg hover:shadow-green-500/30 hover:from-green-500 hover:to-green-600' 
                        : 'text-xs px-2 md:px-4 py-2 bg-white/20 hover:-translate-y-1 hover:bg-white/30'
                    ]"
                  >
                    <span :class="[index === currentSlide ? 'text-white' : '']">
                      {{ card.linkText }}
                    </span>
                  </router-link>
                </div>
              </div>
            </CarouselCardItem>
          </CarouselCard>
        </div>
        </div>
      </div>
    </section>

    <section id="about" class="w-full min-h-screen mx-auto py-20 px-6 relative overflow-hidden">
      <div class="absolute inset-0 z-0 pointer-events-none" aria-hidden="true">
        <div 
          class="absolute inset-0 bg-cover bg-center bg-no-repeat "
          :style="{ backgroundImage: `url(${gradient4Src})` }"
        ></div>
      </div>
        <img :src="cloudImgSrc" alt="Cloud Image" class="absolute top-[80%] left-48 w-full object-cover z-0 scale-x-[-1] animate-drift" />
        <div class="relative flex justify-center items-center my-6 md:my-12  w-full">
          <img :src="planePaperSrc" alt="Decoration" class="w-10 md:w-16 lg:w-36 pb-2 rotate-24 object-cover z-0 scale-x-[-1] animate-float" />
          <h2 class="text-white font-bold text-2xl md:text-3xl lg:text-5xl">About Byzan Education</h2>
        </div>
      <div class="flex flex-col lg:flex-row gap-12 items-stretch mx-auto md:px-24 relative z-10">
        <div class="flex justify-center items-center">
        <img :src="byzantiumLogoSrc" alt="Logo" class="w-24 md:w-40 lg:w-64 rounded-2xl object-cover" />
      </div>
      <div class="bg-white flex-1 pt-4 md:pt-8 lg:pt-16 px-8  rounded-2xl lg:rounded-e-4xl lg:rounded-s-4xl lg:rounded-bl-none  shadow-lg">
        <div class="flex flex-col items-center justify-center h-full gap-2 px-4 md:px-16">
          <p class="font-comfortaa text-sm md:text-lg lg:text-xl font-light text-justify"> Nama Byzan merupakan singkatan dari 
          <span class="text-green-600">“Biziyadatil Ulumina Likhidmatil Ummat”</span>
          yang bermakna “Dengan bertambahnya ilmu kita, untuk berkhidmat kepada umat.” Filosofi ini menjadi dasar setiap langkah kami — bahwa ilmu harus tumbuh dan memberi manfaat bagi banyak orang. </p>
          <p class="font-comfortaa text-sm md:text-lg lg:text-xl font-light text-justify pt-4">
            Melalui sentuhan digital, Byzan Education mengajak generasi muda untuk belajar dengan lebih kritis, lebih terarah, dan fokus. Kami ingin membentuk generasi yang mampu berpikir mendalam, memiliki pandangan luas, serta siap berkontribusi nyata bagi masa depan yang lebih cerdas.
          </p>
          <a href="#" class="bg-green-600 self-start px-2 py-1 md:py-2 md:px-4 rounded-full my-4 hover:shadow-lg hover:shadow-green-500/30 hover:bg-green-500 flex items-center justify-center transition-all duration-300">
            <span class="text-white font-bold text-sm md:text-base">Read More</span>
          </a>
        </div>
      </div>
      </div>
    </section>
    </div>


    <AppFooter :is-authenticated="isAuthenticated" :user="auth.user" @logout="logout" />
  </div>
</template>

<style>

/* Custom gradient background */
.hero-gradient {
  background-image: var(--hero-gradient-image);
}

.carousel-card-mask{
  background: transparent !important;
}

/* Vue Carousel Card Override Styles */
.carousel-card .carousel-card-item {
  padding: 0 10px;
}

.carousel-card .carousel-card-item.is-active {
  z-index: 10;
}

/* Vue Carousel Card Navigation & Indicators Override */
.carousel-card .carousel-arrow {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  width: 48px;
  height: 48px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  color: rgb(30 41 59);
  font-size: 1.25rem;
  backdrop-filter: blur(4px);
  transition: all 0.3s ease;
}

.carousel-card .carousel-arrow:hover {
  background: rgb(255, 255, 255);
  transform: scale(1.1);
  box-shadow: 0 25px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.carousel-card .carousel-indicators {
  bottom: -40px;
}

.carousel-card .carousel-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  border: none;
  margin: 0 6px;
  transition: all 0.3s ease;
}

.carousel-card .carousel-indicator.is-active {
  background: rgb(22 163 74);
  transform: scale(1.25);
}

/* Sweep animation */
#features::after {
  content: "";
  position: absolute;
  inset: 0;
  left: -30%;
  width: 60%;
  height: 100%;
  background: radial-gradient(
    60% 120% at 50% 50%,
    rgba(96, 233, 83, 0.25) 0%,
    rgba(96, 233, 83, 0.15) 35%,
    rgba(96, 233, 83, 0.08) 55%,
    rgba(96, 233, 83, 0.0) 70%
  );
  filter: blur(30px);
  transform: translateX(-120%);
  animation: sweepOverlay 10s ease-in-out infinite;
  pointer-events: none;
}

@keyframes sweepOverlay {
  from { transform: translateX(-120%); }
  to { transform: translateX(120%); }
}

#features:hover::after {
  animation-play-state: paused;
}

@media (prefers-reduced-motion: reduce) {
  #features::after {
    animation: none;
  }
}

/* Custom Animation Classes */
@keyframes wiggle {
  0%, 100% { transform: rotate(12deg); }
  25% { transform: rotate(8deg); }
  75% { transform: rotate(16deg); }
}

@keyframes float {
  0%, 100% { transform: rotate(44deg) translateY(0px); }
  50% { transform: rotate(44deg) translateY(-10px); }
}

@keyframes drift {
  0%, 100% { transform: translateX(0px); }
  50% { transform: translateX(15px); }
}

@keyframes sway {
  0%, 100% { transform: rotate(-2deg); }
  50% { transform: rotate(2deg); }
}

.animate-wiggle {
  animation: wiggle 4s ease-in-out infinite;
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}

.animate-drift {
  animation: drift 6s ease-in-out infinite;
}

.animate-sway {
  animation: sway 3.5s ease-in-out infinite;
}

/* Gradient Background Animations */
@keyframes gradientPulse {
  0%, 100% { 
    opacity: 1;
    filter: brightness(1) hue-rotate(0deg);
  }
  25% { 
    opacity: 0.3;
    filter: brightness(1.2) hue-rotate(5deg);
  }
  50% { 
    opacity: 0.5;
    filter: brightness(0.8) hue-rotate(-5deg);
  }
  75% { 
    opacity: 0.8;
    filter: brightness(1.1) hue-rotate(3deg);
  }
}

@keyframes gradientShift {
  0%, 100% { 
    opacity: 0.9;
    filter: saturate(1) blur(0px) brightness(1);
  }
  20% { 
    opacity: 0.3;
    filter: saturate(1.3) blur(1px) brightness(1.2);
  }
  40% { 
    opacity: 0.6;
    filter: saturate(0.8) blur(0.5px) brightness(0.9);
  }
  60% { 
    opacity: 0.8;
    filter: saturate(1.1) blur(0px) brightness(1.1);
  }
  80% { 
    opacity: 0.4;
    filter: saturate(1.2) blur(1px) brightness(1.3);
  }
}

.animate-gradient-pulse {
  animation: gradientPulse 7s ease-in-out infinite;
}

.animate-gradient-shift {
  animation: gradientShift 9s ease-in-out infinite;
}

/* Text Shadow Classes */
.text-shadow-white {
  text-shadow: 
    0 0 2px rgba(255, 255, 255, 0.5),
    1px 1px 1px rgba(255, 255, 255, 0.4),
    -1px -1px 1px rgba(255, 255, 255, 0.4);
}

.text-shadow-white-sm {
  text-shadow: 
    0 0 1px rgba(255, 255, 255, 0.4),
    1px 1px 1px rgba(255, 255, 255, 0.3),
    -1px -1px 1px rgba(255, 255, 255, 0.3);
}

/* Responsive Carousel Styles - Using flexible approach */
.responsive-carousel {
  width: 100%;
  max-width: 100%;
}

.responsive-carousel .carousel-card-mask {
  background: transparent !important;
}

.responsive-carousel .carousel-card-item {
  padding: 0 8px;
  transition: all 0.3s ease;
}

.carousel-card-content {
  max-width: 100%;
  margin: 0 auto;
}

/* Responsive image container */
.carousel-card-content .w-full.aspect-3\/4 {
  width: 100%;
  aspect-ratio: 4/3;
  max-height: 60%;
}

/* Responsive text adjustments */
@media (max-width: 640px) {
  .responsive-carousel .carousel-card-item {
    padding: 0 4px;
  }
  
  .carousel-card-content {
    padding: 12px !important;
  }
  
  .carousel-card-content h3 {
    font-size: 1rem !important;
    margin-bottom: 8px !important;
  }
  
  .carousel-card-content .w-full.aspect-3\/4 {
    margin-bottom: 12px !important;
    max-height: 50%;
  }
}

@media (max-width: 480px) {
  .carousel-card-content {
    padding: 8px !important;
  }
  
  .carousel-card-content h3 {
    font-size: 0.9rem !important;
    margin-bottom: 6px !important;
  }
}

</style>
