<script setup>
import { computed, ref, onMounted, onUnmounted } from "vue";
import { useAuthStore } from "../../stores/auth";
import { useRouter } from "vue-router";
import AppHeader from "../../components/AppHeader.vue";
import AppFooter from "../../components/AppFooter.vue";
import { getAssetUrl } from "../../utils/assets";
import { CarouselCard, CarouselCardItem } from "vue-carousel-card";
import 'vue-carousel-card/styles/index.css'


const auth = useAuthStore();
const router = useRouter();

const isAuthenticated = computed(() => auth.isAuthenticated);
const postCardImageSrc = getAssetUrl('54f333db7281a49580cc7f2362aa68664d3460ec.png')
const courseImageSrc = getAssetUrl('5bd5c69c68fe54919744198aea008ec38c5ccf96.png')
const pediaImage2Src = getAssetUrl('3b647ba86b93a6f6ad4d4e23cbca320ddd9bae05.png')




const logout = () => {
  auth.logout();
  router.push("/");
};

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

// Asset URLs
const heroBgGradientSrc = getAssetUrl(
  "1546614f57dbcbddaad5b7f9eda092ce3f610db4.png"
);
const heroImageSrc = getAssetUrl(
  "9225467f6bbd20d904d0887f5ae9ddcd26a6e1f4.png"
);
const aboutIconSrc = getAssetUrl(
  "c29de5aa1fc5f0701ae31f5c8e6620820754d49e.png"
);
const featuresBg1Src = getAssetUrl(
  "a4172cfc499709269cb30af84c815743998b654c.png"
);
const featuresBg2Src = getAssetUrl("389_106.svg");

const courseOverlaySrc = getAssetUrl("389_27.svg");
const pediaImage1Src = getAssetUrl(
  "54f333db7281a49580cc7f2362aa68664d3460ec.png"
);

// Rotasi otomatis kartu fitur: yang berada di tengah akan berganti
const centerIndex = ref(1); // 0: Post, 1: Course, 2: Pedia (awal: Course di tengah)
const rotateIntervalMs = 6500;
let rotateTimer;

const isCenter = (i) => centerIndex.value === i;
const leftIndex = computed(() => (centerIndex.value + 2) % 3);
const rightIndex = computed(() => (centerIndex.value + 1) % 3);

const positionClasses = (i) => ({
  "card-center": isCenter(i),
  "card-side": !isCenter(i),
  "pos-left": i === leftIndex.value,
  "pos-center": i === centerIndex.value,
  "pos-right": i === rightIndex.value,
});

const titleClass = (i) =>
  isCenter(i) ? "card-title-center" : "card-title-side";
const linkClass = (i) => (isCenter(i) ? "card-link-center" : "card-link");

const startAuto = () => {
  stopAuto();
  rotateTimer = setInterval(() => {
    centerIndex.value = (centerIndex.value + 1) % 3;
  }, rotateIntervalMs);
};

const stopAuto = () => {
  if (rotateTimer) clearInterval(rotateTimer);
};

const pauseAuto = () => stopAuto();
const resumeAuto = () => startAuto();

const goLeft = () => {
  stopAuto();
  centerIndex.value = (centerIndex.value + 2) % 3;
};

const goRight = () => {
  stopAuto();
  centerIndex.value = (centerIndex.value + 1) % 3;
};

// Keyboard arrows
const onKeyDown = (e) => {
  if (e.key === "ArrowLeft") goLeft();
  if (e.key === "ArrowRight") goRight();
};

// Touch swipe (mobile)
const touchStartX = ref(0);
const onTouchStart = (e) => {
  touchStartX.value = e.changedTouches?.[0]?.clientX || 0;
};
const onTouchEnd = (e) => {
  const endX = e.changedTouches?.[0]?.clientX || 0;
  const delta = endX - touchStartX.value;
  if (Math.abs(delta) > 40) {
    if (delta < 0) goRight();
    else goLeft();
  }
};

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

// Handle slide change
const changeHandle = (index) => {
  currentSlide.value = index
}

onMounted(() => {
  startAuto();
  window.addEventListener("keydown", onKeyDown);
  // Set initial center card for carousel
  currentSlide.value = 1;
  // Add resize listener
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  stopAuto();
  window.removeEventListener("keydown", onKeyDown);
  window.removeEventListener('resize', handleResize);
});
</script>

<template>
  <div class="max-w-full mx-auto relative">
    <AppHeader
      :is-authenticated="isAuthenticated"
      :user="auth.user"
      @logout="logout"
    />

    <section id="hero" class="relative h-[90vh] md:h-[75vh] overflow-hidden">
      <div class="absolute inset-0 z-0">
        <img
          :src="heroBgGradientSrc"
          alt="Gradient background"
          class="rotate-12 md:h-100vh lg:w-[2440px] -translate-x-1/2 translate-y-[-25%] absolute scale-x-[-1] max-w-none"
        />
        <div
          class="absolute bottom-0 lg:right-24 top-auto left-auto mt-5 lg:mt-0 flex justify-center lg:justify-end items-end"
        >
          <img
            :src="heroImageSrc"
            alt="Three cartoon characters waving"
            class="w-[60%] h-auto object-contain"
          />
        </div>
      </div>

      <div class="relative z-10 h-full max-w-full mx-auto px-8 md:px-12 lg:px-24 w-full flex flex-col lg:justify-center lg:items-start justify-start items-center pt-[30%] lg:pt-0 pb-16 lg:pb-0 box-border gap-8">
        <div class="flex flex-col">
          <h1
          class="font-extrabold text-5xl md:text-6xl lg:text-8xl text-white"
        >
          About Us.
        </h1>
        <h2
          class="font-semibold text-3xl lg:text-4xl text-white"
        >
          Byzan Education
        </h2>
        </div>
        <div
          class="relative w-full lg:w-[615px] lg:h-[174px] h-auto bg-gray-100 rounded-[39px_36px_38px_0px] backdrop-blur-[10px] shadow-[inset_18px_17px_13.9px_0px_rgba(255,255,255,0.1),12px_10px_25.8px_0px_rgba(0,0,0,0.05)] p-12 md:pb-5 box-border"
        >
          <span
            class="absolute -top-4 left-6 font-extrabold text-5xl lg:text-[59.6px] text-black leading-tight"
            >"
          </span>
          <p class="font-bold text-lg lg:text-xl leading-tight pl-5 m-0">
            Byzan Education hadir sebagai ruang belajar digital yang berfokus
            pada misi besar: Bersama Kita, Level Up Literasi!
          </p>
        </div>
      </div>
    </section>

    <section id="about" class="bg-white w-full py-24">
      <div class="max-w-[1440px] px-8 md:px-12 lg:px-24 mx-auto box-border">
        <div
          class="flex flex-col lg:flex-row gap-4 items-start mb-6 md:mb-12"
        >
           <img
            :src="aboutIconSrc"
            alt="Byzan Education Icon"
            class="w-20 md:w-60  shrink-0 object-cover"
          />
          <div class="font-montserrat text-wrap">
            <h3
              class="font-bold text-3xl mb-4"
            >
              Byzan Education
            </h3>
            <p
              class="font-medium text-xl leading-relaxed text-justify mb-4"
            >
              Byzan Education adalah platform yang bergerak di bidang pendidikan
              dan literasi keilmuan islam, dengan misi menghadirkan pengalaman
              belajar yang mudah, menyenangkan, dan relevan dengan sentuhan
              digitalisasi.
            </p>
            <br>
            <p
              class="font-medium text-xl leading-relaxed text-justify"
            >
              Berawal dari semangat untuk belajar dan berbagi manfaat, Byzan
              lahir sebagai ruang bagi siapa saja yang ingin mengenal dan
              mempelajari Islam — baik dari dasar maupun pada level yang lebih
              mendalam. Kami percaya bahwa setiap orang, tanpa memandang latar
              belakangnya, berhak untuk mendapatkan akses terhadap ilmu yang
              benar dan kredibel.
            </p>
          </div>
        </div>

        <div class="w-full">
          <div class="mb-8">
            <h4 class="font-bold text-3xl text-black mb-4">Visi</h4>
            <p class="font-medium text-xl leading-relaxed m-0">
              Menjadi platform digital pembelajaran Islam yang inklusif,
              kredibel, dan modern, yang menghubungkan siapa saja dengan ilmu
              agama secara mudah dan menyenangkan.
            </p>
          </div>
          <div>
            <h4 class="font-bold text-3xl text-black mb-4">Tujuan Kami</h4>
            <p class="font-medium text-xl leading-relaxed m-0">
              Kami berharap Byzan Education menjadi platform lintas generasi —
              tempat semua kalangan dapat tumbuh bersama, belajar bersama, dan
              berkhidmat bersama. Karena masa depan yang cerdas, berawal dari
              satu hal sederhana: meningkatkan literasi kita hari ini.
            </p>
          </div>
        </div>
      </div>
    </section>


    <section
      id="features"
      class="relative bg-[#0a1e2a] overflow-hidden min-h-screen flex flex-col justify-center items-center"
    >
      <div class="absolute inset-0 overflow-hidden">
        <img
          :src="featuresBg1Src"
          alt="Abstract background"
          class="absolute top-0 left-1/2 transform -translate-x-1/2 w-full max-w-none object-cover"
        />
        <img
          :src="featuresBg2Src"
          alt="Grid background"
          class="absolute top-0 left-1/2 transform -translate-x-1/2 w-[1823px] h-[994px] opacity-50 max-w-none object-cover"
        />
      </div>

      <div class="relative z-10 text-center max-w-full mx-auto px-5 w-full">
        <h2 class="font-semibold text-3xl text-white mb-40">
          Learn, Grow, and Sharing with Us.
        </h2>

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
                        ? 'text-sm px-2 md:px-6 py-1 md:py-3 bg-gradient-to-r from-green-600 to-green-500 hover:shadow-lg hover:shadow-green-500/30 hover:from-green-500 hover:to-green-600' 
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

    <AppFooter
      :is-authenticated="isAuthenticated"
      :user="auth.user"
      @logout="logout"
    />
  </div>
</template>

<!-- Styles migrated to Tailwind CSS -->
<style scoped>
/* Dynamic card positioning classes */
.pos-left {
  order: 1;
}
.pos-center {
  order: 2;
}
.pos-right {
  order: 3;
}

.card-side {
  width: 333px;
  height: 283px;
  background-color: rgba(217, 217, 217, 0.4);
  border-radius: 22px;
  backdrop-filter: blur(3px);
  box-shadow: 2.6px 7.9px 14.3px 6.1px rgba(255, 255, 255, 0.5);
  padding: 15px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: all 0.4s ease;
}

.card-center {
  width: 499px;
  height: 467px;
  background-color: #f5f5f5;
  border-radius: 46px;
  backdrop-filter: blur(10px);
  box-shadow: inset 15.8px 14.9px 12.2px 0px rgba(255, 255, 255, 0.1),
    10.5px 8.8px 22.6px 0px rgba(0, 0, 0, 0.05);
  padding: 23px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  transform: scale(1.01);
  transition: all 0.4s ease;
}

.card-title-side {
  font-family: "Montserrat", sans-serif;
  font-weight: 700;
  font-size: 40px;
  color: #ffffff;
  line-height: 1.2;
  margin: 0 0 10px 0;
}

.card-title-center {
  font-family: "Montserrat", sans-serif;
  font-weight: 700;
  font-size: 61px;
  color: #009444;
  line-height: 1.2;
  margin: 0 0 10px 0;
}

.card-link {
  font-family: "Montserrat", sans-serif;
  font-weight: 600;
  font-size: 13px;
  color: #ffffff;
  text-decoration: none;
  transition: opacity 0.2s;
}

.card-link:hover {
  opacity: 0.8;
}

.card-link-center {
  font-family: "Montserrat", sans-serif;
  font-weight: 600;
  font-size: 16.7px;
  color: #000000;
  text-decoration: none;
  transition: opacity 0.2s;
}

.card-link-center:hover {
  opacity: 0.8;
}

@media (max-width: 992px) {
  .card-center {
    order: -1;
  }
  .card-side,
  .card-center {
    width: 100%;
    max-width: 500px;
  }
}

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
