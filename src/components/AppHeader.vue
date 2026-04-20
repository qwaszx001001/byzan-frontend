<script setup>
import { computed, ref, onMounted, onBeforeUnmount, watch } from "vue";
import { useRoute } from "vue-router";
import { getAssetUrl } from "../utils/assets";
import Login from "../views/auth/Login.vue";
import RegisterModal from "./RegisterModal.vue";
import { LogOut, UserRoundPen } from "lucide-vue-next";

const props = defineProps({
  isAuthenticated: {
    type: Boolean,
    default: false,
  },
  user: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(["logout"]);

// Mobile menu state
const isMobileMenuOpen = ref(false);
// Login modal state
const showLoginModal = ref(false);
// Register modal state
const showRegisterModal = ref(false);

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
};

const openLoginModal = () => {
  showLoginModal.value = true;
  // Add ESC key listener
  document.addEventListener("keydown", handleEscapeKey);
};

const closeLoginModal = () => {
  showLoginModal.value = false;
  // Remove ESC key listener
  document.removeEventListener("keydown", handleEscapeKey);
};

const handleEscapeKey = (event) => {
  if (event.key === "Escape") {
    if (showLoginModal.value) {
      closeLoginModal();
    }
    if (showRegisterModal.value) {
      closeRegisterModal();
    }
  }
};

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false;
};

const openRegisterModal = () => {
  showRegisterModal.value = true;
  // Add ESC key listener
  document.addEventListener("keydown", handleEscapeKey);
};

const closeRegisterModal = () => {
  showRegisterModal.value = false;
  // Remove ESC key listener
  document.removeEventListener("keydown", handleEscapeKey);
};

const handleOpenRegister = () => {
  closeLoginModal();
  openRegisterModal();
};

const handleOpenLogin = () => {
  closeRegisterModal();
  openLoginModal();
};

const logoSrc = getAssetUrl("b352837f9c6525fe1f4bc0ce6aa884b855acf72a.png");
const homeIconSrc = getAssetUrl("1f8437822241c8162163d431a16249e9db1da3ca.png");

const handleLogout = () => {
  closeUserMenu();
  emit("logout");
};

// User menu (desktop) state and handlers
const isUserMenuOpen = ref(false);
const userMenuRef = ref(null);

const toggleUserMenu = () => {
  isUserMenuOpen.value = !isUserMenuOpen.value;
};

// Close the user menu when auth state changes (e.g., after login)
watch(
  () => props.isAuthenticated,
  (val) => {
    if (val) {
      isUserMenuOpen.value = false;
    }
  }
);

const closeUserMenu = () => {
  isUserMenuOpen.value = false;
};

const handleDocumentClick = (e) => {
  const el = userMenuRef.value;
  if (!el) return;
  if (!el.contains(e.target)) {
    closeUserMenu();
  }
};

onMounted(() => {
  document.addEventListener("click", handleDocumentClick);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleDocumentClick);
});

const userInitials = computed(() => {
  const name =
    props.user?.full_name || props.user?.username || props.user?.email || "";
  if (!name) return "U";
  return name
    .split(" ")
    .map((n) => n[0] || "")
    .slice(0, 2)
    .join("")
    .toUpperCase();
});

// Active tab detection based on current route name
const route = useRoute();
const routeName = computed(() => String(route.name || ""));
const isActive = (section) => {
  const name = routeName.value;
  const mapping = {
    home: ["home"],
    course: ["course", "course-details", "course-learning"],
    byzanpedia: ["byzanpedia"],
    byzanpost: ["byzanpost", "byzanpost-details"],
    about: ["about"],
  };
  return (mapping[section] || []).includes(name);
};
</script>

<template>
  <header
    class="sticky top-0 z-100 px-9 bg-white md:bg-white/40 backdrop-blur-sm shadow-[0px_-2px_35.7px_-1px_rgba(0,0,0,0.25)] h-20"
    id="header"
  >
    <div
      class="max-w-[1440px] mx-auto flex items-center justify-between h-full z-100 relative"
    >
      <router-link to="/" class="flex items-center gap-4 md:gap-7">
        <img :src="logoSrc" alt="Byzanedu Logo" class="w-12 md:w-16 auto" />
        <span class="text-xl md:text-2xl font-semibold">Byzanedu.com</span>
      </router-link>

      <!-- Desktop Navigation -->
      <nav class="hidden lg:flex items-center gap-[23px]">
        <router-link
          :to="{ name: 'home' }"
          class="text-lg font-semibold relative py-2 transition-colors duration-300 mr-[45px] nav-link"
          :class="{ active: isActive('home') }"
          aria-label="Home"
        >
          <img :src="homeIconSrc" alt="Home" class="w-[41px] h-[41px] block" />
        </router-link>
        <router-link
          :to="{ name: 'course' }"
          class="text-lg font-semibold relative py-2 transition-colors duration-300 nav-link"
          :class="{ active: isActive('course') }"
          >Byzan<span class="font-extrabold">Course</span></router-link
        >
        <router-link
          :to="{ name: 'byzanpedia' }"
          class="text-lg font-semibold relative py-2 transition-colors duration-300 nav-link"
          :class="{ active: isActive('byzanpedia') }"
          >Byzan<span class="font-extrabold">Pedia</span></router-link
        >
        <router-link
          :to="{ name: 'byzanpost' }"
          class="text-lg font-semibold relative py-2 transition-colors duration-300 nav-link"
          :class="{ active: isActive('byzanpost') }"
          >Byzan<span class="font-extrabold">Post</span></router-link
        >
        <router-link
          :to="{ name: 'about' }"
          class="text-lg font-semibold relative py-2 transition-colors duration-300 nav-link"
          :class="{ active: isActive('about') }"
          >About Us</router-link
        >
      </nav>

      <!-- Right side content -->
      <div class="md:flex items-center gap-4 hidden">
        <!-- Desktop Auth Actions: avatar with dropdown -->
        <div v-if="!props.isAuthenticated">
          <button
            @click="openLoginModal"
            class="text-lg py-[4.5px] px-[13px] bg-primary rounded hover:bg-primary/90 transition-colors"
          >
            <span class="text-white">Sign in</span>
          </button>
        </div>
        <div v-else class="relative" ref="userMenuRef">
          <button
            @click.stop="toggleUserMenu"
            type="button"
            class="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 text-gray-800 font-semibold"
          >
            {{ userInitials }}
          </button>
          <div
            v-if="isUserMenuOpen"
            class="absolute right-0 mt-2 w-44 bg-white rounded shadow-lg z-50 p-2"
          >
            <router-link
              to="/personal-info"
              class="flex items-center gap-2 w-full rounded-lg px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
              <UserRoundPen class="inline" />
              <span>Profile</span>
              </router-link
            >
            <div class="border border-gray-200 my-2"></div>
            <button
              type="button"
              class="flex items-center gap-2 w-full rounded-lg px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              @click="handleLogout"
            >
              <LogOut />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
      <div class="flex md:hidden">
        <button
          @click="toggleMobileMenu"
          class="p-3 rounded-md hover:bg-gray-100 transition-colors hamburger-btn"
          type="button"
          style="display: block !important; z-index: 9999; position: relative"
          :class="{ active: isMobileMenuOpen }"
        >
          <div class="w-6 h-6 flex flex-col justify-center items-center">
            <span
              class="hamburger-line block w-5 h-0.5 bg-gray-700 transition-all duration-300 ease-in-out mb-1"
            ></span>
            <span
              class="hamburger-line block w-5 h-0.5 bg-gray-700 transition-all duration-300 ease-in-out mb-1"
            ></span>
            <span
              class="hamburger-line block w-5 h-0.5 bg-gray-700 transition-all duration-300 ease-in-out"
            ></span>
          </div>
        </button>
      </div>
    </div>

    <!-- Mobile Menu -->
    <nav
      class="lg:hidden fixed top-[79px] left-0 right-0 bg-white backdrop-blur-xl transition-all duration-300 ease-in-out"
      :class="
        isMobileMenuOpen
          ? 'translate-y-0 opacity-100'
          : '-translate-y-full opacity-0'
      "
    >
      <div class="px-4 py-3 flex flex-col gap-2">
        <router-link
          :to="{ name: 'home' }"
          class="flex w-fit items-center gap-2 py-2 text-base font-medium nav-link mobile-nav-link"
          :class="{ active: isActive('home') }"
          aria-label="Home"
        >
          <img :src="homeIconSrc" alt="Home" class="w-6 h-6" />
          <span>Home</span>
        </router-link>

        <router-link
          :to="{ name: 'course' }"
          class="block w-fit py-2 text-base font-medium nav-link mobile-nav-link"
          :class="{ active: isActive('course') }"
        >
          Byzan<span class="font-extrabold">Course</span>
        </router-link>

        <router-link
          :to="{ name: 'byzanpedia' }"
          class="block w-fit py-2 text-base font-medium nav-link mobile-nav-link"
          :class="{ active: isActive('byzanpedia') }"
        >
          Byzan<span class="font-extrabold">Pedia</span>
        </router-link>

        <router-link
          :to="{ name: 'byzanpost' }"
          class="block w-fit py-2 text-base font-medium nav-link mobile-nav-link"
          :class="{ active: isActive('byzanpost') }"
        >
          Byzan<span class="font-extrabold">Post</span>
        </router-link>

        <router-link
          :to="{ name: 'about' }"
          class="block w-fit py-2 text-base font-medium nav-link mobile-nav-link"
          :class="{ active: isActive('about') }"
        >
          About Us
        </router-link>

        <!-- Mobile Auth Actions -->
        <div class="pt-3 flex gap-2">
          <button
            v-if="!props.isAuthenticated"
            @click="
              openLoginModal;
              closeMobileMenu();
            "
            class="block w-full text-center py-2 px-3 text-sm bg-primary rounded hover:bg-primary/90 transition-colors"
          >
            <span class="text-white"> Sign in </span>
          </button>
          <div v-else class="space-y-2">
            <router-link
              to="/personal-info"
              class="flex items-center gap-2 w-full rounded-lg py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
              <UserRoundPen class="inline" />
              <span>Profile</span>
            </router-link>
            <button
              type="button"
              class="flex items-center gap-2 w-full rounded-lg py-2 text-sm text-gray-700 hover:bg-gray-100"
              @click="handleLogout"
            >
              <LogOut />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- Login Modal -->
    <div v-if="showLoginModal" @click="closeLoginModal" class="modal-backdrop">
      <Login
        :isModal="true"
        @close="closeLoginModal"
        @openRegister="handleOpenRegister"
        @click.stop
      />
    </div>

    <!-- Register Modal -->
    <RegisterModal
      :show="showRegisterModal"
      @close="closeRegisterModal"
      @openLogin="handleOpenLogin"
    />
  </header>
</template>

<style scoped>
.nav-link {
  color: var(--color-text);
  position: relative;
}

.nav-link:hover {
  color: var(--color-primary);
}

.nav-link::before {
  content: "";
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0%;
  height: 4px;
  background-color: transparent;
  display: block;
  transition: background-color 0.3s ease;
}

.nav-link.active::after {
  content: "";
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 100%;
  height: 4px;
  background-color: var(--primary-green);
  display: block;
}

/* Debug untuk memastikan active state terdeteksi */
.nav-link.active {
  color: var(--color-primary);
}

/* Hamburger menu menggunakan SVG, tidak perlu CSS khusus */

/* Mobile Navigation */
.mobile-nav-link {
  position: relative;
  border-bottom: 1px solid #f3f4f6;
}

.mobile-nav-link:last-child {
  border-bottom: none;
}

.mobile-nav-link.active {
  color: var(--color-primary);
}

/* Hamburger Menu Animation */
.hamburger-btn.active .hamburger-line:nth-child(1) {
  transform: rotate(45deg) translate(4.1px, 4.1px);
}

.hamburger-btn.active .hamburger-line:nth-child(2) {
  opacity: 0;
}

.hamburger-btn.active .hamburger-line:nth-child(3) {
  transform: rotate(-45deg) translate(4.1px, -4.1px);
}

/* Mobile hamburger styling - simple and clean */

/* Modal backdrop */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

/* User dropdown */
.user-dropdown {
  min-width: 10rem;
}
</style>
