<script setup>
import { onMounted, computed, reactive, ref } from "vue";
import { useAuthStore } from "../../stores/auth";
import { useRouter } from "vue-router";
import AppHeader from "../../components/AppHeader.vue";
import AppFooter from "../../components/AppFooter.vue";
import { getAssetUrl } from "../../utils/assets";
import api from "../../services/api";
import { CirclePlus } from "lucide-vue-next";

const auth = useAuthStore();
const router = useRouter();

const currentUserId = ref(null);
const successMsg = ref("");
const errorMsg = ref("");
const loading = ref(false);
// Non-editable sidebar fields
const profileName = ref("Your Full Name");
const profileRole = ref("author");

const emailVerified = ref(false);

async function loadProfile() {
  try {
    const { data } = await api.get("/auth/profile/");
    currentUserId.value = data?.id ?? null;
    emailVerified.value = Boolean(data?.email_verified);
    form.gender = data?.gender || form.gender;
    form.firstName = data?.first_name || "";
    form.lastName = data?.last_name || "";
    form.email = data?.email || "";
    form.phone = data?.phone || "";
    form.birthday = data?.birthday || "";
    form.country = data?.country || "";
    form.address = data?.address || "";
    form.city = data?.city || "";
    form.instagram = data?.instagram_link || "";
    form.facebook = data?.facebook_link || "";
    profileRole.value = data?.username || profileRole.value;
    const nameCandidate = `${data?.first_name || ""} ${data?.last_name || ""}`.trim();
    profileName.value = nameCandidate || data?.full_name || data?.email || profileName.value;
    if (data) {
      auth.user = data;
      localStorage.setItem("userData", JSON.stringify(data));
    }
  } catch (err) {
    errorMsg.value = err.response?.data?.message || err.message;
  }
}

async function savePersonalInfo() {
  errorMsg.value = "";
  successMsg.value = "";
  loading.value = true;
  try {
    const fullName = `${String(form.firstName || "").trim()} ${String(form.lastName || "").trim()}`
      .trim()
      .replace(/\s+/g, " ");
    const payload = {
      gender: form.gender,
      first_name: form.firstName,
      last_name: form.lastName,
      email: form.email,
      phone: form.phone,
      birthday: form.birthday,
      country: form.country,
      address: form.address,
      city: form.city,
      instagram_link: form.instagram,
      facebook_link: form.facebook,
      full_name: fullName,
    };
    const { data } = await api.put("/auth/profile/", payload);
    if (data) {
      auth.user = data;
      localStorage.setItem("userData", JSON.stringify(data));
      emailVerified.value = Boolean(data?.email_verified);
      const nameCandidate = `${data?.first_name || ""} ${data?.last_name || ""}`.trim();
      profileName.value = nameCandidate || data?.full_name || data?.email || profileName.value;
    }
    successMsg.value = "Profil berhasil diperbarui.";
  } catch (err) {
    const resData = err.response?.data;
    if (resData && typeof resData === "object") {
      const messages = Object.entries(resData)
        .map(([k, v]) =>
          Array.isArray(v) ? `${k}: ${v.join(", ")}` : `${k}: ${v}`
        )
        .join(" | ");
      errorMsg.value = messages;
    } else {
      errorMsg.value = err.response?.data?.message || err.message;
    }
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadProfile();
});

// const user = computed(() => auth.user || {})

const form = reactive({
  gender: "male",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  birthday: "",
  country: "",
  address: "",
  city: "",
  instagram: "",
  facebook: "",
});

// Update form when user data is loaded
if (auth.user) {
  form.firstName = auth.user.first_name || "";
  form.lastName = auth.user.last_name || "";
  form.email = auth.user.email || "";
  form.phone = auth.user.phone || "";
  form.birthday = auth.user.birthday || "";
  form.country = auth.user.country || "";
  form.address = auth.user.address || "";
  form.city = auth.user.city || "";
  form.instagram = auth.user.instagram || "";
  form.facebook = auth.user.facebook || "";
  profileRole.value = auth.user.role || profileRole.value;
  const nameCandidate = `${auth.user.first_name || ""} ${
    auth.user.last_name || ""
  }`.trim();
  profileName.value =
    nameCandidate ||
    auth.user.full_name ||
    auth.user.email ||
    profileName.value;
}

const isAuthenticated = computed(() => auth.isAuthenticated);

const logout = () => {
  auth.logout();
  router.push("/");
};

// Asset URLs
const backgroundGradientSrc = getAssetUrl(
  "1546614f57dbcbddaad5b7f9eda092ce3f610db4.png"
);
const bannerBgSrc1 = getAssetUrl(
  "a4172cfc499709269cb30af84c815743998b654c.png"
);
const profilePicSrc = getAssetUrl(
  "418ce2a6ab9bbfb81b05025a5cbf21a6e735def0.png"
);
const addPhotoIconSrc = getAssetUrl("189_454.svg");
const addPhotoBgSrc = getAssetUrl(
  "6ccd223db609c590b56edaca230b879807e5948a.png"
);
const achievementIconSrc = getAssetUrl(
  "c850c338d40acc539bc807ca76604bca27fb3bcc.png"
);
const starIconSrc = getAssetUrl("ae82f0fc275cc9614de9be18a7b57f7d24b16b0d.png");
const addBannerIconSrc = getAssetUrl("189_450.svg");
const maleRadioSrc = getAssetUrl("189_252.svg");
const femaleRadioSrc = getAssetUrl("189_253.svg");
const verifiedIconSrc = getAssetUrl("189_278.svg");
const dropdownArrowSrc = getAssetUrl(
  "b68de90c44e40ada0ed4723e2922d3b77ad3c496.png"
);
const calendarIconSrc = getAssetUrl(
  "63ef912b6bfe38e6d5bc8586f55fe1b9d46a5ac4.png"
);
const paperPlaneSrc = getAssetUrl(
  "15f47f71f80b6474e00a66edd9fef321a837f795.png"
);
const uploadIconSrc = getAssetUrl(
  "01c3adcbea95698ef537b77d0f0f8f2978cf8cdf.png"
);
</script>

<template>
  <div
    class="relative w-full bg-cover bg-top bg-no-repeat min-h-screen"
    :style="{ backgroundImage: `url('${backgroundGradientSrc}')` }"
  >
    <AppHeader
      :is-authenticated="isAuthenticated"
      :user="auth.user"
      @logout="logout"
    />

    <main id="user-profile" class="pt-0 relative">
      <div
        class="absolute top-0 left-0 w-full h-[30vh] bg-cover bg-center z-10"
        :style="{ backgroundImage: `url('${bannerBgSrc1}')` }"
      >
        <button
          class="absolute bottom-0 translate-y-1/2 right-[10%] cursor-pointer"
          type="button"
          aria-label="Add photo"
        >
          <CirclePlus class="w-11 h-11 text-white bg-black rounded-full" />
        </button>
      </div>

      <div
        class="max-w-[1440px] px-4 md:px-16 lg:px-20 mx-auto box-border relative"
      >
        <div class="relative z-20 flex flex-col md:flex-row gap-6 pt-[20vh]">
          <aside class="mt-4 gap-5 md:w-sm">
            <div class="text-center relative">
              <div class="relative w-fit mx-auto">
                <div
                  class="w-44 h-44 rounded-full overflow-hidden mx-auto shadow-lg"
                >
                  <img
                    :src="profilePicSrc"
                    alt="User Profile Picture"
                    class="w-full h-full object-cover"
                  />
                </div>
                <button
                  class="absolute bottom-0 right-0 cursor-pointer"
                  type="button"
                  aria-label="Add photo"
                >
                  <CirclePlus
                    class="w-11 h-11 text-white bg-black rounded-full"
                  />
                </button>
              </div>
              <h1 class="mt-7 text-lg font-bold mb-2 font-montserrat">
                {{ profileName }}
              </h1>
              <p class="text-base font-normal mt-0 mb-6 font-montserrat">
                {{ profileRole }}
              </p>
              <button
                class="w-37 h-12 bg-black text-white rounded-3xl text-lg font-bold transition-opacity hover:opacity-80 border-0 cursor-pointer font-montserrat"
                type="button"
              >
                Edit Profile
              </button>
            </div>

            <div
              class="bg-white rounded-2xl mt-4 p-6 relative flex flex-col gap-4"
            >
              <img
                :src="achievementIconSrc"
                alt="Pennant"
                class="absolute top-4 right-4 w-10 h-10"
              />
              <h2
                class="text-xl font-bold text-green-600 text-center m-0 font-montserrat"
              >
                achievement
              </h2>
              <div class="text-center">
                <p class="text-xs font-semibold m-0 mb-1 font-montserrat">
                  Articles Posted
                </p>
                <div class="bg-gray-300 rounded-lg py-1 mb-1">
                  <span class="text-xl font-bold font-montserrat">0012</span>
                </div>
                <div class="flex flex-col items-center gap-0.5">
                  <span class="text-xs font-medium font-montserrat"
                    >Reader Rating</span
                  >
                  <div class="flex gap-1">
                    <img :src="starIconSrc" alt="star" class="w-3 h-4" />
                    <img :src="starIconSrc" alt="star" class="w-3 h-4" />
                    <img :src="starIconSrc" alt="star" class="w-3 h-4" />
                    <img :src="starIconSrc" alt="star" class="w-3 h-4" />
                    <img
                      :src="starIconSrc"
                      alt="star"
                      class="w-2 h-4 object-cover object-left"
                    />
                  </div>
                  <span class="text-xs font-medium font-montserrat"
                    >4.7/5.0</span
                  >
                </div>
              </div>
              <div class="text-center">
                <p class="text-xs font-semibold m-0 mb-1 font-montserrat">
                  Book Published
                </p>
                <div class="bg-gray-300 rounded-lg py-1 mb-1">
                  <span class="text-xl font-bold font-montserrat">02</span>
                </div>
                <a
                  href="#"
                  class="text-blue-600 text-xs font-medium underline no-underline font-montserrat"
                  >My Library</a
                >
              </div>
            </div>
          </aside>

          <div class="pt-44 relative w-full">
            <h2 class="text-2xl font-semibold m-0 mb-4 font-montserrat">
              Personal Information
            </h2>

            <form @submit.prevent="savePersonalInfo">
              <div class="flex flex-col mb-2">
                <label
                  class="text-xs font-semibold text-gray-500 font-montserrat"
                  >Gender<span class="text-red-500">*</span></label
                >
                <div class="flex gap-6">
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      v-model="form.gender"
                      value="male"
                      class="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 focus:ring-green-500 focus:ring-2"
                      required
                    />
                    <span
                      class="text-sm font-semibold text-gray-700 font-montserrat"
                      >Male</span
                    >
                  </label>
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      v-model="form.gender"
                      value="female"
                      class="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 focus:ring-green-500 focus:ring-2"
                      required
                    />
                    <span
                      class="text-sm font-semibold text-gray-700 font-montserrat"
                      >Female</span
                    >
                  </label>
                </div>
              </div>
              <div class="grid grid-cols-2 gap-x-6 gap-y-2">
                <div class="flex flex-col">
                  <label
                    for="first-name"
                    class="text-xs font-semibold text-gray-500 font-montserrat"
                    >First Name<span class="text-red-500">*</span></label
                  >
                  <input
                    type="text"
                    id="first-name"
                    v-model="form.firstName"
                    class="bg-gray-300 border-0 rounded-lg h-12 px-4 text-sm w-full box-border font-montserrat focus:outline-green-500 focus:outline-2 focus:outline-offset-2"
                    required
                  />
                </div>

                <div class="flex flex-col">
                  <label
                    for="last-name"
                    class="text-xs font-semibold text-gray-500 font-montserrat"
                    >Last Name<span class="text-red-500">*</span></label
                  >
                  <input
                    type="text"
                    id="last-name"
                    v-model="form.lastName"
                    class="bg-gray-300 border-0 rounded-lg h-12 px-4 text-sm w-full box-border font-montserrat focus:outline-green-500 focus:outline-2 focus:outline-offset-2"
                    required
                  />
                </div>

                <div class="flex flex-col">
                  <label
                    for="email"
                    class="text-xs font-semibold text-gray-500 font-montserrat"
                    >Email<span class="text-red-500">*</span></label
                  >
                  <div class="relative flex items-center">
                    <input
                      type="email"
                      id="email"
                      v-model="form.email"
                      class="bg-gray-300 border-0 rounded-lg h-12 px-4 text-sm w-full box-border font-montserrat disabled:bg-gray-400 disabled:cursor-not-allowed disabled:opacity-90 focus:outline-green-500 focus:outline-2 focus:outline-offset-2"
                      required
                      disabled
                    />
                    <div
                      v-if="emailVerified"
                      class="absolute right-4 flex items-center gap-1 text-green-600 text-xs font-semibold font-montserrat"
                    >
                      <img
                        :src="verifiedIconSrc"
                        alt="Verified"
                        class="w-4 h-4"
                      />
                      <span>Verified</span>
                    </div>
                    <div
                      v-else
                      class="absolute right-4 flex items-center gap-1 text-gray-600 text-xs font-semibold font-montserrat"
                    >
                      <span>Unverified</span>
                    </div>
                  </div>
                </div>

                <div class="flex flex-col">
                  <label
                    for="phone"
                    class="text-xs font-semibold text-gray-500 font-montserrat"
                    >Phone Number<span class="text-red-500">*</span></label
                  >
                  <div class="relative flex items-center">
                    <input
                      type="tel"
                      id="phone"
                      v-model="form.phone"
                      class="bg-gray-300 border-0 rounded-lg h-12 px-4 text-sm w-full box-border font-montserrat focus:outline-green-500 focus:outline-2 focus:outline-offset-2"
                      required
                    />
                    <!-- <div class="country-code-selector">
                      <span>+62</span>
                      <img :src="dropdownArrowSrc" alt="Dropdown arrow" />
                    </div> -->
                  </div>
                </div>

                <div class="flex flex-col">
                  <label
                    for="birthday"
                    class="text-xs font-semibold text-gray-500 font-montserrat"
                    >Birthday<span class="text-red-500">*</span></label
                  >
                  <div class="relative flex items-center">
                    <input
                      type="date"
                      id="birthday"
                      v-model="form.birthday"
                      class="bg-gray-300 border-0 rounded-lg h-12 px-4 text-sm w-full box-border font-montserrat focus:outline-green-500 focus:outline-2 focus:outline-offset-2"
                      required
                    />
                  </div>
                </div>

                <div class="flex flex-col">
                  <label
                    for="country"
                    class="text-xs font-semibold text-gray-500 font-montserrat"
                    >Country<span class="text-red-500">*</span></label
                  >
                  <input
                    type="text"
                    id="country"
                    v-model="form.country"
                    class="bg-gray-300 border-0 rounded-lg h-12 px-4 text-sm w-full box-border font-montserrat focus:outline-green-500 focus:outline-2 focus:outline-offset-2"
                    required
                  />
                </div>

                <div class="flex flex-col col-span-2">
                  <label
                    for="address"
                    class="text-xs font-semibold text-gray-500 font-montserrat"
                    >Address</label
                  >
                  <textarea
                    id="address"
                    v-model="form.address"
                    rows="3"
                    class="bg-gray-300 border-0 rounded-lg min-h-12 px-4 py-3 text-sm w-full box-border font-montserrat focus:outline-green-500 focus:outline-2 focus:outline-offset-2 resize-none"
                  ></textarea>
                </div>

                <div class="flex flex-col">
                  <label
                    for="city"
                    class="text-xs font-semibold text-gray-500 font-montserrat"
                    >City<span class="text-red-500">*</span></label
                  >
                  <input
                    type="text"
                    id="city"
                    v-model="form.city"
                    class="bg-gray-300 border-0 rounded-lg h-12 px-4 text-sm w-full box-border font-montserrat focus:outline-green-500 focus:outline-2 focus:outline-offset-2"
                    required
                  />
                </div>

                <div class="flex flex-col">
                  <label
                    for="instagram"
                    class="text-xs font-semibold text-gray-500 font-montserrat"
                    >Instagram Link</label
                  >
                  <input
                    type="url"
                    id="instagram"
                    v-model="form.instagram"
                    class="bg-gray-300 border-0 rounded-lg h-12 px-4 text-sm w-full box-border font-montserrat focus:outline-green-500 focus:outline-2 focus:outline-offset-2"
                  />
                </div>

                <div class="flex flex-col">
                  <label
                    for="facebook"
                    class="text-xs font-semibold text-gray-500 font-montserrat"
                    >Facebook Link</label
                  >
                  <input
                    type="url"
                    id="facebook"
                    v-model="form.facebook"
                    class="bg-gray-300 border-0 rounded-lg h-12 px-4 text-sm w-full box-border font-montserrat focus:outline-green-500 focus:outline-2 focus:outline-offset-2"
                  />
                </div>
              </div>
              <div class="mt-4">
                <button
                  type="submit"
                  class="w-50 h-11 bg-green-600 text-white rounded-3xl text-base font-bold border-0 cursor-pointer font-montserrat"
                  :disabled="loading"
                >
                  {{ loading ? "Saving..." : "Save Changes" }}
                </button>
              </div>
            </form>

            <p
              v-if="successMsg"
              class="mt-3 text-green-600 text-sm font-semibold"
            >
              {{ successMsg }}
            </p>
            <p v-if="errorMsg" class="mt-3 text-red-600 text-sm font-semibold">
              {{ errorMsg }}
            </p>

            <img
              :src="paperPlaneSrc"
              alt="Paper plane decoration"
              class="absolute w-29 h-26 right-44 bottom-4 scale-x-[-1] animate-float"
            />
            <button
              class="absolute right-9 bottom-8 w-37 h-12 bg-white border border-black rounded-3xl text-lg font-bold text-black transition-all hover:bg-black hover:text-white font-montserrat"
              type="button"
            >
              Settings
            </button>
          </div>
        </div>

        <div
          class="mt-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 pb-36"
        >
          <div
            class="flex-1 bg-white rounded-2xl p-6 flex justify-between items-center cursor-pointer transition-transform hover:-translate-y-1 hover:shadow-lg"
          >
            <div>
              <h3 class="text-xl font-bold m-0 mb-1 font-montserrat">
                Upload Your Article
              </h3>
              <p class="text-sm font-bold text-green-600 m-0 font-montserrat">
                Byzan Post
              </p>
            </div>
            <img :src="uploadIconSrc" alt="Upload" class="w-19 h-14" />
          </div>

          <div
            class="flex-1 bg-white rounded-2xl p-6 flex justify-between items-center cursor-pointer transition-transform hover:-translate-y-1 hover:shadow-lg"
          >
            <div>
              <h3 class="text-xl font-bold m-0 mb-1 font-montserrat">
                Publish Your Book
              </h3>
              <p class="text-sm font-bold text-green-600 m-0 font-montserrat">
                Byzan Pedia
              </p>
            </div>
            <img :src="uploadIconSrc" alt="Upload" class="w-19 h-14" />
          </div>

          <div
            class="flex-1 bg-white rounded-2xl p-6 flex justify-between items-center cursor-pointer transition-transform hover:-translate-y-1 hover:shadow-lg"
          >
            <div>
              <h3 class="text-xl font-bold m-0 mb-1 font-montserrat">
                Join Course instructor
              </h3>
              <p class="text-sm font-bold text-green-600 m-0 font-montserrat">
                Byzan Course
              </p>
            </div>
            <img :src="uploadIconSrc" alt="Upload" class="w-19 h-14" />
          </div>
        </div>
      </div>
    </main>

    <AppFooter
      :is-authenticated="isAuthenticated"
      :user="auth.user"
      @logout="logout"
    />
  </div>
</template>

<style scoped>
/* Custom widths for Tailwind */
.w-37 {
  width: 9.25rem;
}
.w-50 {
  width: 12.5rem;
}
.w-29 {
  width: 7.25rem;
}
.h-26 {
  height: 6.5rem;
}
.w-19 {
  width: 4.75rem;
}
.rotate-157 {
  transform: rotate(157deg);
}

/* Responsive classes */
@media (max-width: 1200px) {
  .px-20 {
    padding-left: 2.5rem;
    padding-right: 2.5rem;
  }
  .grid-cols-\[323px_1fr\] {
    grid-template-columns: 280px 1fr;
  }
}

@media (max-width: 992px) {
  .grid-cols-\[323px_1fr\] {
    grid-template-columns: 1fr;
  }
  .pt-12 {
    padding-top: 7.5rem;
  }
  .pt-44 {
    padding-top: 1.25rem;
  }
  .absolute.top-36 {
    top: 0.625rem;
  }
  .absolute.right-0 {
    right: 0.625rem;
  }
  /* Only center elements inside the aside (sidebar) on small screens.
     Avoid globally targeting .flex-col which breaks form field widths. */
  aside .flex-col {
    align-items: center;
  }
  .-mt-25 {
    margin-top: -6.25rem;
  }
  .flex-col:last-child {
    flex-direction: column;
  }
  .mt-24 {
    margin-top: 2.5rem;
  }
  .pb-36 {
    padding-bottom: 5rem;
  }
  .absolute.w-29,
  .absolute.right-9 {
    display: none;
  }
}

@media (max-width: 768px) {
  .px-20 {
    padding-left: 1.25rem;
    padding-right: 1.25rem;
  }
  .grid-cols-2 {
    grid-template-columns: 1fr;
  }
  .col-span-2 {
    grid-column: span 1;
  }
}
</style>
