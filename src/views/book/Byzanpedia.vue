<script setup>
import { computed, ref } from "vue";
import { useAuthStore } from "../../stores/auth";
import { useRouter } from "vue-router";
import AppHeader from "../../components/AppHeader.vue";
import AppFooter from "../../components/AppFooter.vue";
import UploadNaskahPopup from "../../components/UploadNaskahPopup.vue";
import QomusInfoPopup from "../../components/QomusInfoPopup.vue";
import SuccessModal from "../../components/SuccessModal.vue";
import ErrorModal from "../../components/ErrorModal.vue";
import { getAssetUrl } from "../../utils/assets";
import { emailService } from "../../services/email";

const auth = useAuthStore();
const router = useRouter();

const isAuthenticated = computed(() => auth.isAuthenticated);

// Upload popup state
const showUploadPopup = ref(false);

// Qomus info popup state
const showQomusPopup = ref(false);
const showSuccess = ref(false);
const showError = ref(false);
const successMessage = ref("");
const errorMessage = ref("");

const logout = () => {
  auth.logout();
  router.push("/");
};

// Handle upload popup
const openUploadPopup = () => {
  showUploadPopup.value = true;
};

const closeUploadPopup = () => {
  showUploadPopup.value = false;
};

// Handle Qomus info popup
const openQomusPopup = () => {
  showQomusPopup.value = true;
};

const closeQomusPopup = () => {
  showQomusPopup.value = false;
};

const handleManuscriptSubmission = async (formData) => {
  try {
    const result = await emailService.sendManuscriptSubmission(formData);
    
    if (result.success) {
      successMessage.value = result.message || "Berhasil dikirim.";
      showSuccess.value = true;
      closeUploadPopup();
    }
  } catch (error) {
    errorMessage.value = error?.message || "Terjadi kesalahan. Silakan coba lagi.";
    showError.value = true;
  }
};

// Asset URLs
const bgImg1Src = getAssetUrl("3b647ba86b93a6f6ad4d4e23cbca320ddd9bae05.png");
const bgImg2Src = getAssetUrl("9ff92377ed91b288fee44b24989c7670ee2d50be.png");
const bgImg4Src = getAssetUrl("a4aa778fcd58ceecc24b6d085754fb0170db27d0.png");
const bgImg5Src = getAssetUrl("15f47f71f80b6474e00a66edd9fef321a837f795.png");
const bookPromoSrc = getAssetUrl(
  "4816d2ebbaf9ddf9ad6a1e1f99f7b9bfb15fada7.png"
);
const aboutLogoSrc = getAssetUrl(
  "e5953eaab12a20f86febfa843fd39a247183b510.png"
);
const cloudBackgroundSrc = getAssetUrl("70_1448.svg");
const greenGradientSrc = getAssetUrl("green-gradient.png");
</script>

<template>
  <div class="w-full max-w-none mx-auto relative">
    <AppHeader
      :is-authenticated="isAuthenticated"
      :user="auth.user"
      @logout="logout"
    />
    <SuccessModal
      :show="showSuccess"
      title="Berhasil"
      :message="successMessage"
      @close="showSuccess = false"
    />
    <ErrorModal
      :show="showError"
      title="Gagal"
      :message="errorMessage"
      @close="showError = false"
    />

    <div class="overflow-hidden">
      <section id="hero" class="relative w-full h-screen mt-0 z-0">
        <!-- Background Images -->
        <div class="absolute top-0 left-0 w-full h-full -z-1">
          <img
            :src="bgImg1Src"
            alt="Library background"
            class="absolute h-full w-full left-0 pointer-events-none select-none"
          />
          <img
            :src="bgImg2Src"
            alt="Color overlay"
            class="absolute top-[605px] -left-[631px] w-[1316px] h-[892px] pointer-events-none select-none animate-gradient-pulse"
          />
          <img
            :src="bgImg2Src"
            alt="Color overlay"
            class="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 origin-top-left pointer-events-none select-none"
          />
          <img
            :src="bgImg4Src"
            alt="Decorative element"
            class="absolute bottom-[20%] md:bottom-[15%] lg:bottom-[10%] left-10 md:left-20 w-48 md:w-72 lg:w-xs pointer-events-none select-none animate-drift"
          />
          <img
            :src="bgImg5Src"
            alt="Decorative element"
            class="absolute bottom-[10%] right-[40%] w-24 md:w-32 -rotate-[21.27deg] pointer-events-none select-none animate-float"
          />
        </div>

        <!-- Content -->
        <div
          class="relative h-full flex flex-col md:flex-row items-center justify-start max-w-7xl mx-auto md:-translate-y-20"
        >
          <img
            :src="bookPromoSrc"
            alt="Qomus Saku book"
            class="w-48 md:w-sm lg:w-md md:-translate-y-24 mt-32 md:mt-0"
          />
          <div
            class="bg-black/5 backdrop-blur-sm shadow-[0px_4px_4px_rgba(255,255,255,0.25)] rounded-4xl rounded-bl-none text-white relative p-6 md:p-8 lg:p-10"
          >
            <h1
              class="text-2xl md:text-4xl lg:text-6xl leading-[1.2] m-0 font-montserrat"
            >
              <span class="font-extrabold">Byzan</span
              ><span class="font-medium">Pedia</span>
            </h1>
            <p
              class="font-bold text-[#64fb5f] -mt-2.5 mb-2.5 font-montserrat text-3xl md:text-3xl lg:text-5xl"
            >
              Penerbit Buku
            </p>
            <p
              class="font-bold m-0 font-montserrat text-3xl md:text-3xl lg:text-4xl pb-2 md:pb-4"
            >
              By Byzan Education
            </p>
            <button
              @click="openQomusPopup"
              class="absolute bottom-0 left-4 translate-y-1/2 bg-black rounded-lg px-4 py-2 text-white font-semibold hover:bg-gray-800 transition-colors cursor-pointer"
            >
              Cek Sekarang
            </button>
          </div>
        </div>
      </section>
      <section class="pb-12 md:pb-0 relative">
        <img
          :src="cloudBackgroundSrc"
          alt="background lines"
          class="absolute -top-[15%] w-[125%] left-0 z-1 object-cover object-center animate-drift scale-x-[-1]"
        />
        <img
          :src="greenGradientSrc"
          alt="green gradient"
          class="absolute top-0 left-0 right-0 w-full h-full -z-1 object-cover object-center"
        />
        <div
          class="relative w-[90%] md:w-[80%] lg:w-[70%] -translate-y-12 md:-translate-y-20 z-1 bg-black/20 rounded-[54px] rounded-br-none backdrop-blur-md shadow-[0px_4px_4px_0px_rgba(255,255,255,0.25)] text-white p-4 md:p-8 lg:p-10 mx-4 md:mx-auto mb-10 md:mb-0"
        >
          <p
            class="font-comfortaa text-sm md:text-lg lg:text-xl font-semibold leading-normal md:leading-[1.7] text-justify max-w-[980px]"
          >
            <span class="inline-flex me-4">
              <img
                :src="aboutLogoSrc"
                alt="ByzanCourse Logo"
                class="w-[72px] h-[58px]"
              />
            </span>
            <span
              class="text-2xl md:text-3xl lg:text-5xl font-medium m-0 p-0 font-montserrat"
              ><span class="font-extrabold">Byzan</span>Pedia</span
            >
            adalah penerbit buku yang dikelola oleh Byzan Education. Fitur ini
            berfungsi sebagai ruang dokumentasi dan publikasi karya tulis, baik
            berupa buku ilmu pengetahuan, novel, buku panduan, ensiklopedia, dan
            lain sebagainya. <br />
            <br />
            Anda dapat mengirimkan naskah siap cetak untuk dipublikasikan secara
            profesional dan legal. Jika Anda memiliki naskah yang belum
            sepenuhnya siap, tim Byzanedu juga dapat membantu dalam proses
            penulisan ulang, penyusunan layout, hingga pembuatan desain sampul.
            <br />
            <br />
            Inisiatif ini merupakan bagian dari komitmen kami untuk
            mengembangkan budaya literasi baca-tulis melalui karya-karya yang
            diterbitkan.
          </p>
        </div>
       <div class="w-[90%] md:w-[80%] lg:w-[70%] mx-auto relative z-1 px-10 pb-10 -translate-y-10">
         <button 
           @click="openUploadPopup"
           class="bg-black px-8 py-2 rounded-3xl font-semibold hover:bg-gray-800 transition-colors duration-200 cursor-pointer"
         >
          <span class="text-white">Upload Naskah</span>
          </button>
       </div>
      </section>
    </div>

    <AppFooter
      :is-authenticated="isAuthenticated"
      :user="auth.user"
      @logout="logout"
    />

    <!-- Upload Naskah Popup -->
    <UploadNaskahPopup
      :is-visible="showUploadPopup"
      @close="closeUploadPopup"
      @submit="handleManuscriptSubmission"
    />

    <!-- Qomus Info Popup -->
    <QomusInfoPopup
      :show="showQomusPopup"
      @close="closeQomusPopup"
    />
  </div>
</template>
