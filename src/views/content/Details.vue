<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "../../stores/auth";
import AppHeader from "../../components/AppHeader.vue";
import AppFooter from "../../components/AppFooter.vue";
import { getAssetUrl } from "../../utils/assets";
import api from "../../services/api";
import CardArticle from "./CardArticle.vue";
import SuccessModal from "../../components/SuccessModal.vue";
import ErrorModal from "../../components/ErrorModal.vue";

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

const isAuthenticated = computed(() => auth.isAuthenticated);

const logout = () => {
  auth.logout();
  router.push("/");
};

const article = ref(null);
const relatedPosts = ref([]);
const comments = ref([]);
const loading = ref(false);
const error = ref(null);
const commentText = ref("");
const myPostRating = ref(0);
const commentsLoading = ref(false);
const commentsError = ref(null);
const posting = ref(false);
const showPostSuccess = ref(false);
const showPostError = ref(false);
const postSuccessMessage = ref("");
const postErrorMessage = ref("");

const API_ORIGIN = (() => {
  try {
    return new URL(api.defaults.baseURL).origin;
  } catch {
    return "";
  }
})();
const normalizeMediaUrl = (url) => {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  const path = String(url);
  return path.startsWith("/") ? `${API_ORIGIN}${path}` : `${API_ORIGIN}/${path}`;
};

// Categories
const categories = ref([]);

// Asset URLs
const heroImageSrc = getAssetUrl(
  "daeb9afe8aebd8556996bfa0833246d5028a91c4.jpeg"
);
const authorAvatarSrc = getAssetUrl("331_3.svg");
const starIconSrc = getAssetUrl("ae82f0fc275cc9614de9be18a7b57f7d24b16b0d.png");
const quoteIconSrc = getAssetUrl(
  "2a6f6ff0084482b1a5764d9085c850e6e3603844.png"
);
const shareIconSrc = getAssetUrl(
  "302df890445600c802bb7578df1f7711f87104a0.png"
);
const replyArrowSrc = getAssetUrl(
  "c7c104945c9f6515191c5d535a892383f03d3f3c.png"
);
const courseImageSrc = getAssetUrl(
  "f72456441df4efd0eb5ecfda62f6b31c8d4550ef.png"
);
const moreIconSrc = getAssetUrl("aee2435b15a9cce768a68b112f666ce2dce167d6.png");
const postBgImageSrc = getAssetUrl(
  "225af3722f1df4cd0f5e6f2971ee059fa2da3e75.png"
);

// Related post images
const relatedPostImages = [
  {
    bg: postBgImageSrc,
    main: getAssetUrl("1eb5de3a3867ea93bd81861d06ccae3d18edf967.png"),
  },
  {
    bg: postBgImageSrc,
    main: getAssetUrl("fae23bb4188728f84d6eb8c1388ad51a8488ffac.png"),
  },
  {
    bg: postBgImageSrc,
    main: getAssetUrl("6ae8f60de6196d73aa8e6441c6e3a837b224c3f5.png"),
  },
];

const toDisplayDate = (iso) => {
  if (!iso) return ""
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return String(iso)
  return d.toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" })
}

const escapeHtml = (s) => String(s ?? "")
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;");

const formatPlainTextToHtml = (text) => {
  const escaped = escapeHtml(text);
  return escaped
    .replace(/\r\n\r\n/g, "<br><br>")
    .replace(/\n\n/g, "<br><br>")
    .replace(/\r\n/g, "<br>")
    .replace(/\n/g, "<br>");
};

const formattedContentHtml = computed(() => {
  const raw = article.value?.content;
  if (!raw || typeof raw !== "string") return "";
  return formatPlainTextToHtml(raw);
});

onMounted(async () => {
  try {
    loading.value = true;
    const articleId = route.params.id;

    // Fetch categories for mapping id -> name/slug
    try {
      const { data } = await api.get("/posts/categories/");
      categories.value = Array.isArray(data) ? data : data?.results || [];
    } catch (e) {
      categories.value = [];
    }

    try {
      const { data } = await api.get(`/posts/id/${articleId}/`);
      article.value = {
        ...data,
        thumbnail: normalizeMediaUrl(data?.thumbnail_url || data?.thumbnail) || data?.thumbnail || null,
        date: toDisplayDate(data?.published_at || data?.created_at),
        rating_avg: data?.rating_avg ?? 0,
        rating_count: data?.rating_count ?? 0,
      };
      await fetchPostComments();

      try {
        const params = {};
        const slug = data?.category?.slug || null;
        if (slug) params.category = slug;
        const { data: relatedData } = await api.get("/posts/", { params });
        const list = Array.isArray(relatedData)
          ? relatedData
          : relatedData?.results || [];
        relatedPosts.value = list
          .filter((p) => String(p.id) !== String(articleId))
          .slice(0, 3)
          .map((p) => ({
            ...p,
            thumbnail: normalizeMediaUrl(p?.thumbnail_url || p?.thumbnail) || p?.thumbnail || null,
          }));
      } catch (e) {
        relatedPosts.value = [];
      }
    } catch (e) {
      error.value = e.response?.data?.message || e.message || "Gagal memuat artikel";
      article.value = null;
      relatedPosts.value = [];
      comments.value = [];
    }
  } catch (e) {
    error.value = e.message || "Gagal memuat artikel";
    article.value = null;
    relatedPosts.value = [];
    comments.value = [];
  } finally {
    loading.value = false;
  }
});

const categoriesMapById = computed(() => {
  const map = {};
  for (const cat of categories.value) {
    map[cat.id] = cat;
  }
  return map;
});

const getCategorySlugById = (id) => categoriesMapById.value[id]?.slug || "";

const displayCategoryName = (category) => {
  if (category && typeof category === "object") {
    return category.name || "Article";
  }
  if (typeof category === "number") {
    return categoriesMapById.value[category]?.name || "Article";
  }
  return category || "Article";
};

const handleSubmitComment = async (e) => {
  e.preventDefault();
  if (!commentText.value.trim() && !myPostRating.value) return;

  if (!isAuthenticated.value) {
    router.push({ name: "login", query: { redirect: route.fullPath } });
    return;
  }

  try {
    posting.value = true;
    showPostSuccess.value = false;
    showPostError.value = false;
    postSuccessMessage.value = "";
    postErrorMessage.value = "";

    const payload = {
      rating: Number(myPostRating.value || 0),
      comment: String(commentText.value || "").trim(),
    };
    const slug = String(article.value?.slug || "").trim();
    if (!slug) throw new Error("Slug tidak ditemukan");
    const { data } = await api.post(`/posts/${encodeURIComponent(slug)}/comments/`, payload);
    postSuccessMessage.value = "Komentar berhasil disimpan.";
    showPostSuccess.value = true;
    commentText.value = "";
    myPostRating.value = 0;
    if (data) {
      const normalized = {
        ...data,
        user: data?.user || null,
      };
      const replaced = comments.value.map((c) => (c.id === normalized.id ? normalized : c));
      const exists = replaced.some((c) => c.id === normalized.id);
      comments.value = exists ? replaced : [normalized, ...replaced];
    } else {
      await fetchPostComments();
    }
  } catch (e) {
    console.error("Failed to post comment:", e);
    const resData = e.response?.data;
    if (resData && typeof resData === "object") {
      const messages = Object.entries(resData)
        .map(([k, v]) => (Array.isArray(v) ? `${k}: ${v.join(", ")}` : `${k}: ${v}`))
        .join(" | ");
      postErrorMessage.value = messages;
    } else {
      postErrorMessage.value = e.response?.data?.message || e.response?.data?.error || e.message || "Gagal menyimpan komentar.";
    }
    showPostError.value = true;
  } finally {
    posting.value = false;
  }
};

const formatDateTime = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toLocaleString("id-ID", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
};

const formatUserName = (u) => {
  if (!u) return "User";
  if (typeof u === "string") {
    const text = u.trim();
    if (text.startsWith("{") && text.endsWith("}")) {
      try {
        const parsed = JSON.parse(text);
        return parsed?.full_name || parsed?.username || parsed?.email || "User";
      } catch {
        return text;
      }
    }
    return text;
  }
  if (typeof u === "object") return u.full_name || u.username || u.email || "User";
  return "User";
};

const setPostRating = (v) => {
  const n = Number(v);
  if (Number.isFinite(n) && n >= 1 && n <= 5) myPostRating.value = n;
};

const fetchPostComments = async () => {
  const postId = route.params.id;
  if (!postId) return;
  if (!isAuthenticated.value) return;

  commentsLoading.value = true;
  commentsError.value = null;
  try {
    const slug = String(article.value?.slug || "").trim();
    if (!slug) throw new Error("Slug tidak ditemukan");
    const { data } = await api.get(`/posts/${encodeURIComponent(slug)}/comments/`);
    comments.value = Array.isArray(data) ? data : data?.results || [];
  } catch (e) {
    commentsError.value = e.response?.data?.message || e.message || "Gagal memuat komentar.";
    comments.value = [];
  } finally {
    commentsLoading.value = false;
  }
};
</script>

<template>
  <div class="relative bg-white">
    <AppHeader
      :is-authenticated="isAuthenticated"
      :user="auth.user"
      @logout="logout"
    />
    <SuccessModal
      :show="showPostSuccess"
      title="Berhasil"
      :message="postSuccessMessage"
      @close="showPostSuccess = false"
    />
    <ErrorModal
      :show="showPostError"
      title="Gagal"
      :message="postErrorMessage"
      @close="showPostError = false"
    />

    <main class="max-w-[1440px] mx-auto">
      <div v-if="loading" class="text-center p-10">Memuat artikel...</div>
      <div v-else-if="error" class="text-center p-10">{{ error }}</div>
      <div v-else-if="article" class="grid lg:grid-cols-3 gap-6 items-start">
        <article
          class="w-full lg:col-span-2 lg:py-10"
          style="box-shadow: 12px 0 12px rgba(0, 0, 0, 0.12)"
        >
          <img
            :src="
              article.thumbnail ||
              article.featured_image ||
              article.heroImage ||
              article.image ||
              heroImageSrc
            "
            :alt="article.title"
            class="w-full mb-7 object-cover"
          />

          <div class="mx-4 md:mx-8 lg:mx-0 lg:pe-8">
            <h1 class="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-primary mb-4! md:mb-6! lg:mb-8!">
              {{ article.title }}
            </h1>

            <div
              class="flex items-center gap-2 md:gap-4 mb-7 text-sm md:text-base flex-wrap"
            >
              <img
                :src="article.author?.avatar || authorAvatarSrc"
                :alt="article.author?.name || 'Author'"
                class="w-8 h-8 md:w-12 md:h-12 rounded-full object-cover"
              />
              <span class="font-medium text-base md:text-lg">{{
                typeof article.author === "number"
                  ? `Author #${article.author}`
                  : article.author?.username || article.author?.email || "Author"
              }}</span>
              <span class="text-gray-500">|</span>
              <span
                class="inline-block bg-[#64fb5f] text-black px-2.5 py-1 rounded-full text-xs font-semibold uppercase"
                >{{ displayCategoryName(article.category) }}</span
              >
              <span class="text-gray-500">|</span>
              <time class="post-date">{{
                article.date || "19 Juli 2025"
              }}</time>
              <span class="text-gray-500">|</span>
              <div class="flex items-center gap-2">
                <span class="">{{ Number(article.rating_avg ?? 0).toFixed(1) }}</span>
                <img :src="starIconSrc" alt="Star" class="w-10 h-8" />
                <span class="text-gray-500">({{ article.rating_count ?? 0 }})</span>
              </div>
            </div>

            <div class="prose max-w-none text-base leading-relaxed text-justify">
              <template v-if="article.body && article.body.length > 0">
                <template v-for="(item, index) in article.body" :key="index">
                  <p v-if="item.type === 'paragraph'" v-html="item.content"></p>
                  <hr
                    v-else-if="item.type === 'separator'"
                    class="border-t border-black my-9"
                  />
                </template>
              </template>
              <div v-else v-html="formattedContentHtml"></div>
            </div>

            <section id="comments" class="mt-12">
              <h2 class="text-lg font-medium mb-2 text-gray-600">Comments</h2>

              <form
                class="mb-10"
                @submit.prevent="handleSubmitComment"
              >
                <div class="flex items-center gap-2 mb-3">
                  <button
                    v-for="i in 5"
                    :key="`post-rate-${i}`"
                    type="button"
                    class="text-2xl border-0 bg-transparent cursor-pointer transition-opacity hover:opacity-80"
                    :class="i <= myPostRating ? 'text-[#009444]' : 'text-gray-300'"
                    @click="setPostRating(i)"
                    :title="`Beri rating ${i}`"
                  >
                    ★
                  </button>
                </div>
                <textarea
                  v-model="commentText"
                  placeholder="Write your comment..."
                  class="w-full min-h-[96px] border border-gray-300 rounded-lg p-3 text-sm resize-vertical font-['Montserrat'] outline-none focus:ring-2 focus:ring-[#009444]"
                ></textarea>
                <div class="flex justify-end mt-3">
                  <button
                    type="submit"
                    class="bg-[#009444] text-white border-0 rounded-lg px-5 py-2 font-['Montserrat'] font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
                    :disabled="posting"
                  >
                    {{ posting ? 'Mengirim...' : 'Kirim' }}
                  </button>
                </div>
              </form>

              <div class="border p-4 rounded-md">
                <div v-if="!isAuthenticated" class="text-center p-5 text-gray-500">
                  <p>Login dulu untuk melihat komentar.</p>
                </div>
                <div v-else-if="commentsLoading" class="text-center p-5 text-gray-500">
                  <p>Memuat komentar...</p>
                </div>
                <div v-else-if="commentsError" class="text-center p-5 text-red-600">
                  <p>{{ commentsError }}</p>
                </div>
                <div v-else v-for="comment in comments" :key="comment.id" class="mb-5">
                  <p class="text-sm leading-7 mb-2">
                    <strong>{{
                      formatUserName(comment.user) || comment.author || comment.author_name || "Anonymous"
                    }}</strong
                    ><br />
                    {{ comment.comment || comment.text || comment.content }}
                  </p>
                  <p class="text-xs text-gray-500 font-semibold m-0">
                    <span v-if="comment.rating">Rating: {{ comment.rating }} | </span>{{ formatDateTime(comment.created_at || comment.updated_at) }}
                  </p>
                  <p v-if="comment.replies" class="text-sm text-gray-700 font-medium mt-2 mb-0">
                    {{ comment.replies }}
                  </p>
                  <a
                    href="#"
                    class="inline-flex items-center gap-2 text-xs border px-2 py-0.5 rounded-sm"
                    @click.prevent
                  >
                    <img
                      :src="replyArrowSrc"
                      alt="Reply arrow"
                      class="w-4 h-3 transform rotate-180"
                    />
                    Balas
                  </a>
                </div>
                <div
                  v-if="isAuthenticated && !commentsLoading && !commentsError && comments.length === 0"
                  class="text-center p-5 text-gray-500"
                >
                  <p>Belum ada komentar. Jadilah yang pertama!</p>
                </div>
              </div>
            </section>
          </div>
        </article>

        <aside class="mx-4 md:mx-8 lg:mx-0 lg:my-24">
          <div class="bg-white flex flex-col items-center rounded-lg">
            <div class="bg-gray-100 rounded-2xl p-4 text-center w-full mb-6">
              <div class="rounded-lg overflow-hidden mb-3">
                <img
                  :src="courseImageSrc"
                  alt="Kursus Nahwu"
                  class="w-full h-auto block"
                />
              </div>
              <h3 class="font-bold text-2xl text-primary mb-2">Kursus Nahwu</h3>
              <p class="font-semibold text-base">Click Here For Free Course</p>
            </div>

            <img :src="moreIconSrc" alt="More options" class="w-10 h-10 mb-6" />

            <router-link
              to="/byzanpost"
              class="inline-block bg-primary text-white px-4 py-2 rounded-md mb-8"
            >
              <span class="text-white">Read More</span>
            </router-link>

            <div v-for="post in relatedPosts" :key="post.id" class="mb-6">
              <CardArticle
                :article="post"
                :article-images="relatedPostImages.map((i) => i.main || i.bg)"
                :display-category-name="displayCategoryName"
              />
            </div>
          </div>
        </aside>
      </div>
    </main>

    <AppFooter
      :is-authenticated="isAuthenticated"
      :user="auth.user"
      @logout="logout"
    />
  </div>
</template>

<!-- Styles migrated to Tailwind — legacy CSS removed -->
