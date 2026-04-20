<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import AppHeader from '../../components/AppHeader.vue'
import AppFooter from '../../components/AppFooter.vue'
import { getAssetUrl } from '../../utils/assets'
import SuccessModal from '../../components/SuccessModal.vue'
import ErrorModal from '../../components/ErrorModal.vue'
import api from '../../services/api'
import { dummyCourses } from '../../data/dummyCourses.js'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const isAuthenticated = computed(() => auth.isAuthenticated)

const logout = () => {
  auth.logout()
  router.push('/')
}

const course = ref(null)
const episodes = ref([])
const modules = ref([])
const selectedEpisode = ref(null)
const loading = ref(false)
const error = ref(null)
const buying = ref(false)
const buyError = ref(null)
const buyResult = ref(null)
const isEnrolled = ref(false)
const showBuySuccess = ref(false)
const showBuyError = ref(false)
const buySuccessMessage = ref('')
const buyErrorMessage = ref('')
const comments = ref([])
const commentsLoading = ref(false)
const commentsError = ref(null)
const commentText = ref('')
const postingComment = ref(false)
const showCommentSuccess = ref(false)
const showCommentError = ref(false)
const commentSuccessMessage = ref('')
const commentErrorMessage = ref('')
const reviews = ref([])
const reviewsLoading = ref(false)
const reviewsError = ref(null)
const myRating = ref(0)
const postingReview = ref(false)
const showReviewSuccess = ref(false)
const showReviewError = ref(false)
const reviewSuccessMessage = ref('')
const reviewErrorMessage = ref('')

// Asset URLs
const heroBgSrc = getAssetUrl('f72456441df4efd0eb5ecfda62f6b31c8d4550ef.png')
const playIconSrc = getAssetUrl('9a547643480954a4248860f428682b092062617f.png')
const infoIconSrc = getAssetUrl('8da0219f435a8ec02d6e88d85e21d30fe0732392.png')
const playlistBgSrc = getAssetUrl('182_172.svg')
const videoThumbSrc = getAssetUrl('f72456441df4efd0eb5ecfda62f6b31c8d4550ef.png')
const playButtonSrc = getAssetUrl('5ab5d018e020264bbf31917e0b26c52426cb4496.png')
const characterSrc = getAssetUrl('f03fc1fe80df6a818fe525b8ffb90ced101f3d78.png')

// Gunakan thumbnail course sebagai hero background bila tersedia
const heroImageSrc = computed(() => {
  const c = course.value || {}
  return c.thumbnail_url || c.thumbnail || c.image || c.featured_image || heroBgSrc
})

// Normalize possible backticks/spaces from API example strings
const normalizeVideoUrl = (u) => {
  if (!u || typeof u !== 'string') return u
  return u.replace(/`/g, '').trim()
}

// Current selected video src for preview
const selectedVideoSrc = computed(() => normalizeVideoUrl(selectedEpisode.value?.video_url))

// Extract YouTube ID from various URL forms
const getYouTubeId = (url) => {
  if (!url) return null
  try {
    const u = new URL(url)
    const host = u.hostname.replace('www.', '')
    if (host.includes('youtube.com')) {
      const vid = u.searchParams.get('v')
      if (vid) return vid
      const parts = u.pathname.split('/')
      const embedIndex = parts.indexOf('embed')
      if (embedIndex !== -1 && parts[embedIndex + 1]) return parts[embedIndex + 1]
    }
    if (host === 'youtu.be') {
      return u.pathname.slice(1)
    }
  } catch (e) {
    // ignore
  }
  return null
}

const getYouTubeThumbnailUrl = (url) => {
  const clean = normalizeVideoUrl(url)
  const vid = getYouTubeId(clean)
  if (!vid) return null
  return `https://img.youtube.com/vi/${vid}/hqdefault.jpg`
}

// Up to 3 episodes with video_url for multi-preview (from dummy data)
const previewEpisodes = computed(() => {
  const list = episodes.value || []
  const filtered = list.filter(e => !!normalizeVideoUrl(e.video_url))
  if (filtered.length > 0) {
    return filtered.slice(0, 3).map(e => {
      const vid = getYouTubeId(normalizeVideoUrl(e.video_url))
      const embed = vid ? `https://www.youtube-nocookie.com/embed/${vid}` : normalizeVideoUrl(e.video_url)
      return {
        id: e.id,
        title: e.title || e.name || `Video ${e.id}`,
        video_url: embed,
        thumbnail: e.thumbnail || e.featured_image || getYouTubeThumbnailUrl(e.video_url) || videoThumbSrc,
      }
    })
  }
  return []
})

// Prefer Episode 2: find by order_index=2, else fallback to second, else first
const episodeTwo = computed(() => {
  const list = episodes.value || []
  let target = list.find(ep => (ep.order_index || ep.episode) === 2)
  if (!target) target = list[1] || list[0] || null
  return target
})

const previewChapters = computed(() => {
  const list = modules.value || []
  return list.slice(0, 3)
})

// onMounted(async () => {
//   const courseId = route.params.id
//   if (!courseId) {
//     error.value = 'Course ID tidak ditemukan'
//     return
//   }

//   try {
//     loading.value = true
//     const { data } = await api.get(`/course/course/${courseId}/`)
//     course.value = data
//     // Try determine enrollment/access state from course payload if backend provides flags
//     isEnrolled.value = !!(data?.is_enrolled || data?.enrolled || data?.has_access || data?.user_enrolled)
//     // Parse modules and lessons if present
//     if (Array.isArray(data.modules)) {
//       const sortedModules = [...data.modules].sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
//       modules.value = sortedModules
//       const lessonsFlat = sortedModules.flatMap(m => (Array.isArray(m.lessons) ? m.lessons : []).map(l => ({
//         ...l,
//         module_id: m.id,
//         module_title: m.title,
//         video_url: normalizeVideoUrl(l.video_url),
//       })))
//       episodes.value = lessonsFlat
//     }
    
//     // Fallbacks if modules not provided but videos/episodes exist
//     if (episodes.value.length === 0) {
//       if (data.videos || data.episodes) {
//         episodes.value = Array.isArray(data.videos) ? data.videos : 
//                         Array.isArray(data.episodes) ? data.episodes : []
//       } else {
//         // Minimal fallback sample
//         episodes.value = [
//           { id: 1, title: 'Iftitah - Bab Kalam', episode: '01' },
//           { id: 2, title: 'Iftitah - Bab Kalam', episode: '02' },
//           { id: 3, title: 'Iftitah - Bab Kalam', episode: '03' },
//         ]
//       }
//     }

//     // Set default selected episode for preview: prefer one with video_url
//     selectedEpisode.value = episodes.value.find(e => !!normalizeVideoUrl(e.video_url))
//       || (episodeTwo.value || episodes.value[0] || null)
//   } catch (e) {
//     error.value = e.response?.data?.message || e.message || 'Gagal memuat data course'
//     console.error('Error loading course:', e)
//   } finally {
//     loading.value = false
//   }
// })

const mapApiCourseDetails = (data) => {
  const priceValue = Number(data?.price ?? 0)
  return {
    id: data?.id,
    title: data?.title ?? '',
    description: data?.description ?? '',
    thumbnail: data?.thumbnail_url || data?.thumbnail || '',
    thumbnail_url: data?.thumbnail_url || data?.thumbnail || '',
    price: priceValue,
    is_free: priceValue === 0,
    createdAt: data?.created_at || data?.createdAt || new Date().toISOString(),
    is_enrolled: Boolean(data?.is_enrolled),
    chapters: Array.isArray(data?.chapters) ? data.chapters : [],
    total_lessons: data?.total_lessons ?? 0,
  }
}

const hydrateFromCourseDetails = (c) => {
  const chapters = Array.isArray(c?.chapters) ? c.chapters : []
  const sortedChapters = [...chapters].sort((a, b) => (a?.order ?? 0) - (b?.order ?? 0))
  modules.value = sortedChapters.map((ch) => ({
    id: ch?.id,
    title: ch?.title ?? '',
    order_index: ch?.order ?? 0,
    lessons: Array.isArray(ch?.lessons) ? ch.lessons : [],
  }))

  episodes.value = sortedChapters.flatMap((ch) => {
    const lessons = Array.isArray(ch?.lessons) ? ch.lessons : []
    const sortedLessons = [...lessons].sort((a, b) => (a?.order ?? 0) - (b?.order ?? 0))
    return sortedLessons.map((l) => ({
      id: l?.id,
      title: l?.title ?? '',
      order_index: l?.order ?? 0,
      duration_seconds: l?.duration_seconds ?? null,
      is_completed: Boolean(l?.is_completed),
      module_id: ch?.id,
      module_title: ch?.title ?? '',
      video_url: normalizeVideoUrl(l?.youtube_url),
    }))
  })

  selectedEpisode.value = episodes.value.find((e) => !!normalizeVideoUrl(e.video_url))
    || (episodeTwo.value || episodes.value[0] || null)
}

const formatDateTime = (iso) => {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return String(iso)
  return d.toLocaleString('id-ID', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const formatUserName = (u) => {
  if (!u) return 'User'
  if (typeof u === 'string') {
    const text = u.trim()
    if (text.startsWith('{') && text.endsWith('}')) {
      try {
        const parsed = JSON.parse(text)
        return parsed?.full_name || parsed?.username || parsed?.email || 'User'
      } catch {
        return text
      }
    }
    return text
  }
  if (typeof u === 'object') return u.full_name || u.username || u.email || 'User'
  return 'User'
}

const fetchComments = async () => {
  const courseId = route.params.id
  if (!courseId) return
  if (!isAuthenticated.value) return
  commentsLoading.value = true
  commentsError.value = null
  try {
    const { data } = await api.get(`/courses/${courseId}/comments/`)
    comments.value = Array.isArray(data) ? data : (data?.results || [])
  } catch (e) {
    commentsError.value = e.response?.data?.message || e.message || 'Gagal memuat komentar'
    comments.value = []
  } finally {
    commentsLoading.value = false
  }
}

const fetchReviews = async () => {
  const courseId = route.params.id
  if (!courseId) return
  if (!isAuthenticated.value) return
  reviewsLoading.value = true
  reviewsError.value = null
  try {
    const { data } = await api.get(`/courses/${courseId}/reviews/`)
    const list = Array.isArray(data) ? data : (data?.results || [])
    reviews.value = list
    const currentUserKey = auth.user?.full_name || auth.user?.username || auth.user?.email || null
    const mine = currentUserKey
      ? list.find((r) => formatUserName(r.user) === currentUserKey)
      : null
    if (mine?.rating != null) myRating.value = Number(mine.rating)
  } catch (e) {
    reviewsError.value = e.response?.data?.message || e.message || 'Gagal memuat rating'
    reviews.value = []
  } finally {
    reviewsLoading.value = false
  }
}

const setRating = (value) => {
  const v = Number(value)
  if (Number.isFinite(v) && v >= 1 && v <= 5) myRating.value = v
}

const submitReview = async () => {
  const courseId = route.params.id
  const rating = Number(myRating.value)
  if (!courseId || !rating) return

  showReviewSuccess.value = false
  showReviewError.value = false
  reviewSuccessMessage.value = ''
  reviewErrorMessage.value = ''

  if (!isAuthenticated.value) {
    router.push({ name: 'login', query: { redirect: route.fullPath } })
    return
  }

  postingReview.value = true
  try {
    const { data } = await api.post(`/courses/${courseId}/reviews/`, { rating })
    reviewSuccessMessage.value = 'Rating berhasil disimpan.'
    showReviewSuccess.value = true
    if (data) {
      const replaced = reviews.value.map((r) => (r.id === data.id ? data : r))
      const exists = replaced.some((r) => r.id === data.id)
      reviews.value = exists ? replaced : [data, ...replaced]
    } else {
      await fetchReviews()
    }
  } catch (e) {
    const resData = e.response?.data
    if (resData && typeof resData === 'object') {
      const messages = Object.entries(resData)
        .map(([k, v]) => Array.isArray(v) ? `${k}: ${v.join(', ')}` : `${k}: ${v}`)
        .join(' | ')
      reviewErrorMessage.value = messages
    } else {
      reviewErrorMessage.value = e.response?.data?.message || e.response?.data?.error || e.message || 'Gagal menyimpan rating'
    }
    showReviewError.value = true
  } finally {
    postingReview.value = false
  }
}

const submitComment = async () => {
  const courseId = route.params.id
  const text = String(commentText.value || '').trim()
  if (!courseId || !text) return
  showCommentSuccess.value = false
  showCommentError.value = false
  commentSuccessMessage.value = ''
  commentErrorMessage.value = ''

  if (!isAuthenticated.value) {
    router.push({ name: 'login', query: { redirect: route.fullPath } })
    return
  }

  postingComment.value = true
  try {
    const { data } = await api.post(`/courses/${courseId}/comments/`, { comment: text })
    commentText.value = ''
    commentSuccessMessage.value = 'Komentar berhasil dikirim.'
    showCommentSuccess.value = true
    if (data) {
      comments.value = [data, ...comments.value]
    } else {
      await fetchComments()
    }
  } catch (e) {
    const resData = e.response?.data
    if (resData && typeof resData === 'object') {
      const messages = Object.entries(resData)
        .map(([k, v]) => Array.isArray(v) ? `${k}: ${v.join(', ')}` : `${k}: ${v}`)
        .join(' | ')
      commentErrorMessage.value = messages
    } else {
      commentErrorMessage.value = e.response?.data?.message || e.response?.data?.error || e.message || 'Gagal mengirim komentar'
    }
    showCommentError.value = true
  } finally {
    postingComment.value = false
  }
}

const loadCourseDetails = async () => {
  const courseId = route.params.id
  if (!courseId) {
    error.value = 'Course ID tidak ditemukan'
    return
  }

  try {
    loading.value = true
    error.value = null
    const { data } = await api.get(`/courses/${courseId}/`)
    const mapped = mapApiCourseDetails(data)
    course.value = mapped
    isEnrolled.value = Boolean(mapped?.is_enrolled)
    hydrateFromCourseDetails(mapped)
    await fetchComments()
    await fetchReviews()
  } catch (e) {
    error.value = e.response?.data?.message || e.message || 'Gagal memuat data course'
    const fallback = dummyCourses.find((c) => c.id === Number(courseId)) || dummyCourses[0] || null
    if (fallback) {
      course.value = fallback
      isEnrolled.value = Boolean(fallback?.is_enrolled)
      if (Array.isArray(fallback?.modules)) {
        const sortedModules = [...fallback.modules].sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
        modules.value = sortedModules
        const lessonsFlat = sortedModules.flatMap((m) => (Array.isArray(m.lessons) ? m.lessons : []).map((l) => ({
          ...l,
          module_id: m.id,
          module_title: m.title,
          video_url: normalizeVideoUrl(l.video_url),
        })))
        episodes.value = lessonsFlat
        selectedEpisode.value = episodes.value.find((ep) => !!normalizeVideoUrl(ep.video_url))
          || (episodeTwo.value || episodes.value[0] || null)
      }
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadCourseDetails()
})

const goToLearning = (episode) => {
  try {
    const cid = route.params.id || course.value?.id
    if (!cid || !episode?.id) return
    const query = { lessonId: episode.id }
    if (episode.module_id) {
      query.moduleId = episode.module_id
    }
    router.push({ name: 'courseuser-learning', params: { courseId: cid }, query })
  } catch (e) {
    console.warn('Failed to navigate to learning:', e)
  }
}

const playVideo = (episode) => {
  // Preview inline if video_url available; else navigate to Learning
  if (episode?.video_url) {
    selectedEpisode.value = episode
  } else {
    goToLearning(episode)
  }
}

const showInfo = () => {
  // Handle info button click
  console.log('Show course info')
}

const handleBuy = async () => {
  buyError.value = null
  buyResult.value = null
  showBuySuccess.value = false
  showBuyError.value = false
  buySuccessMessage.value = ''
  buyErrorMessage.value = ''
  if (!isAuthenticated.value) {
    router.push({ name: 'login', query: { redirect: route.fullPath } })
    return
  }
  const courseId = route.params.id
  if (!courseId) {
    buyError.value = 'Course ID tidak ditemukan'
    return
  }
  if (isEnrolled.value) {
    // Already enrolled, no-op
    return
  }
  try {
    buying.value = true
    const cid = Number(courseId)
    let data
    try {
      ;({ data } = await api.post('/courses/buy/balance/', { course_id: cid }))
    } catch (e1) {
      const status = e1?.response?.status
      if (status && status >= 400 && status < 500) {
        try {
          ;({ data } = await api.post('/courses/buy/balance/', { id: cid }))
        } catch (e2) {
          if (e2?.response?.status && e2.response.status >= 400 && e2.response.status < 500) {
            ;({ data } = await api.post('/courses/buy/balance/'))
          } else {
            throw e2
          }
        }
      } else {
        throw e1
      }
    }

    buyResult.value = data || { status: 'success' }
    isEnrolled.value = true
    if (course.value) {
      course.value.is_enrolled = true
    }
    buySuccessMessage.value = (course.value?.is_free || !Number(course.value?.price))
      ? 'Enroll gratis berhasil.'
      : 'Pembelian kursus berhasil.'
    showBuySuccess.value = true
  } catch (e) {
    const resData = e.response?.data
    if (resData && typeof resData === 'object') {
      const messages = Object.entries(resData)
        .map(([k, v]) => Array.isArray(v) ? `${k}: ${v.join(', ')}` : `${k}: ${v}`)
        .join(' | ')
      buyError.value = messages
    } else {
      buyError.value = e.response?.data?.message || e.response?.data?.error || e.message || 'Gagal membeli/enroll course'
    }
    buyErrorMessage.value = buyError.value
    showBuyError.value = true
    console.error('Buy error:', e)
  } finally {
    buying.value = false
  }
}
</script>

<template>
  <div class="w-full max-w-full mx-auto relative bg-white">
    <AppHeader :is-authenticated="isAuthenticated" :user="auth.user" @logout="logout" />
    <SuccessModal
      :show="showBuySuccess"
      title="Berhasil"
      :message="buySuccessMessage"
      @close="showBuySuccess = false"
    />
    <ErrorModal
      :show="showBuyError"
      title="Gagal"
      :message="buyErrorMessage"
      @close="showBuyError = false"
    />
    <SuccessModal
      :show="showCommentSuccess"
      title="Berhasil"
      :message="commentSuccessMessage"
      @close="showCommentSuccess = false"
    />
    <ErrorModal
      :show="showCommentError"
      title="Gagal"
      :message="commentErrorMessage"
      @close="showCommentError = false"
    />
    <SuccessModal
      :show="showReviewSuccess"
      title="Berhasil"
      :message="reviewSuccessMessage"
      @close="showReviewSuccess = false"
    />
    <ErrorModal
      :show="showReviewError"
      title="Gagal"
      :message="reviewErrorMessage"
      @close="showReviewError = false"
    />

    <section id="hero" class="relative w-full h-screen flex flex-col justify-end items-start text-white overflow-hidden">
      <div class="absolute -top-[75px] left-0 w-full h-[calc(100%+75px)]">
        <img :src="heroImageSrc" :alt="course?.title || 'Course background'" class="w-full h-full object-cover" />
        <div class="absolute top-0 left-0 w-full h-1/4 bg-gradient-to-b from-black to-transparent"></div>
        <!-- Transparent Teal to Green Gradient Overlay -->
        <div class="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-primary via-cyan-500/30 to-transparent"></div>
      </div>

      <div class="relative z-10 flex flex-col gap-4 py-12 justify-end px-8 md:px-20 lg:px-24">
        <h1 class="font-['Montserrat'] text-xl md:text-3xl lg:text-5xl font-bold leading-tight mb-3">
          {{ course?.title || 'Kursus ilmu Jurumiyah' }}
        </h1>
        <p class="font-['Montserrat'] text-sm md:text-md lg:text-xl font-medium mb-11">
          {{ course?.subtitle || 'Dengan Metode Mesir' }} | {{ episodes.length || 0 }} Episode
        </p>

        <div class="flex items-center gap-4">
          <!-- <button class="flex items-center justify-center h-12 px-6 md:px-8 lg:px-12 bg-white/50 rounded-lg border-0 cursor-pointer transition-opacity duration-200 hover:opacity-80" 
          @click="goToLearning(episodeTwo || episodes[0])"
          >
            <img :src="playIconSrc" alt="Play Icon" class="w-8" />
          </button> -->
           <RouterLink :to="`/course/${course?.id}/learning`" class="flex items-center justify-center h-12 px-6 md:px-8 lg:px-12 bg-white/50 rounded-lg border-0 cursor-pointer transition-opacity duration-200 hover:opacity-80" 
          >
            <img :src="playIconSrc" alt="Play Icon" class="w-8" />
          </RouterLink>
          <button class="flex items-center justify-center h-[50px] w-[50px] bg-transparent border-0 cursor-pointer transition-opacity duration-200 hover:opacity-80" @click="showInfo">
            <img :src="infoIconSrc" alt="Info Icon" class="w-full h-full" />
          </button>
          <button
            class="flex items-center justify-center h-[50px] min-w-[150px] px-4 bg-[#009444] text-white rounded-lg border-0 cursor-pointer font-['Montserrat'] font-semibold transition-opacity duration-200 hover:opacity-80 disabled:opacity-60 disabled:cursor-not-allowed"
            :disabled="buying || isEnrolled"
            @click="handleBuy"
            :title="buying ? 'Memproses...' : (isEnrolled ? 'Sudah enroll' : ((course?.is_free || !Number(course?.price)) ? 'Enroll Gratis' : 'Beli (Saldo)'))"
          >
            {{ isEnrolled ? 'Sudah Enroll' : ((course?.is_free || !Number(course?.price)) ? 'Enroll Gratis' : 'Beli (Saldo)') }}
          </button>
        </div>

        <p class="font-['Montserrat'] text-[15px] font-medium leading-relaxed text-justify max-w-[533px]">
          {{ course?.description || 'Kitab Jurumiyah merupakan gerbang awal dalam mempelajari tata bahasa Arab — kunci penting untuk memahami Al-Qur\'an, hadits, dan literatur keislaman klasik.' }}
        </p>
      </div>
    </section>

    <section id="playlist" class="relative py-10 pb-24 bg-black/20 backdrop-blur-sm overflow-hidden">
      <div class="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-t to-primary via-cyan-500/30 from-transparent"></div>
      <div class="absolute top-0 left-1/2 transform -translate-x-1/2 w-[1808px] h-[713px] -z-10 pointer-events-none">
        <img :src="playlistBgSrc" alt="Decorative background" class="w-full h-full object-contain" />
      </div>

      <div class="mx-auto px-8 md:px-20 lg:px-24 relative z-10">
        <!-- Inline Multi Video Preview (3 items) -->
        <div class="grid grid-cols-3 gap-6 items-start mb-8" v-if="previewEpisodes.length > 0">
          <div class="flex flex-col gap-2" v-for="ep in previewEpisodes" :key="ep.id">
            <div class="relative h-[240px] w-full rounded-xl overflow-hidden bg-black">
              <img :src="ep.thumbnail" :alt="ep.title || 'Video Preview'" class="w-full h-full object-cover block" loading="lazy" />
              <button
                type="button"
                class="absolute inset-0 flex items-center justify-center bg-black/20 border-0 cursor-pointer transition-opacity duration-200 hover:opacity-90"
                @click="goToLearning(ep)"
              >
                <img :src="playButtonSrc" alt="Play" class="w-16 h-16" />
              </button>
            </div>
            <div class="flex flex-col gap-2">
              <h3 class="font-['Montserrat'] text-xl font-bold text-white m-0">{{ ep.title || 'Video Preview' }}</h3>
              <button class="bg-primary text-white border-0 rounded-lg px-4 py-2.5 cursor-pointer font-['Montserrat'] font-semibold w-fit disabled:opacity-60 disabled:cursor-not-allowed" @click="goToLearning(ep)">
                Buka Belajar
              </button>
            </div>
          </div>
        </div>

        <div v-if="previewChapters.length" class="mb-10">
          <h3 class="font-['Montserrat'] text-xl md:text-2xl font-bold text-white m-0 mb-4">Bab</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div
              v-for="ch in previewChapters"
              :key="`chapter-${ch.id}`"
              class="bg-black/20 rounded-xl backdrop-blur-sm shadow-[0px_3px_10px_rgba(255,255,255,0.12)] p-4 text-white"
            >
              <p class="font-['Montserrat'] font-bold m-0 mb-2">{{ ch.title }}</p>
              <p class="font-['Montserrat'] text-sm opacity-90 m-0 mb-3">{{ (ch.lessons?.length || 0) }} Lesson</p>
              <div v-if="(ch.lessons?.length || 0) > 0" class="flex flex-col gap-2">
                <div
                  v-for="ls in (ch.lessons || []).slice(0, 3)"
                  :key="`lesson-${ch.id}-${ls.id}`"
                  class="flex items-center justify-between gap-3 bg-white/10 rounded-lg px-3 py-2"
                >
                  <div class="flex items-center gap-3 min-w-0">
                    <img
                      v-if="getYouTubeThumbnailUrl(ls.youtube_url)"
                      :src="getYouTubeThumbnailUrl(ls.youtube_url)"
                      :alt="ls.title"
                      class="w-12 h-8 rounded-md object-cover shrink-0"
                      loading="lazy"
                    />
                    <span class="font-['Montserrat'] text-sm font-semibold truncate">{{ ls.title }}</span>
                  </div>
                  <span v-if="ls.duration_seconds != null" class="font-['Montserrat'] text-xs opacity-80 whitespace-nowrap">{{ Math.round(Number(ls.duration_seconds) / 60) }}m</span>
                </div>
              </div>
              <p v-else class="font-['Montserrat'] text-sm opacity-80 m-0">Belum ada lesson</p>
            </div>
          </div>
        </div>

        <div v-if="loading" class="text-center py-10 text-white font-['Montserrat']">
          <p>Memuat video...</p>
        </div>

        <div v-if="error" class="text-center py-10 text-red-400 font-['Montserrat']">
          <p>{{ error }}</p>
        </div>

        <div class="relative pl-20 md:pl-24 lg:pl-0 lg:flex">
          <div class="bg-black/20 rounded-t-[20px] rounded-br-[20px] backdrop-blur-sm shadow-[0px_3px_10px_rgba(255,255,255,0.25)] p-10 xl:p-8 max-w-full text-white font-['Comfortaa'] text-[23px] xl:text-xl leading-normal text-justify h-fit my-12">
            {{ course?.description }}
          </div>


          <img :src="characterSrc" alt="3D character mascot" class="h-120 scale-x-[-1]" />
        </div>

        <div class="mt-10 bg-black/20 rounded-[20px] backdrop-blur-sm shadow-[0px_3px_10px_rgba(255,255,255,0.25)] p-6 text-white">
          <h3 class="font-['Montserrat'] text-xl md:text-2xl font-bold m-0 mb-4">Rating</h3>

          <div v-if="!isAuthenticated" class="flex flex-col gap-3 mb-8">
            <p class="m-0 font-['Montserrat'] text-sm opacity-90">Login dulu untuk memberi rating.</p>
            <button
              type="button"
              class="bg-primary text-white border-0 rounded-lg px-4 py-2.5 cursor-pointer font-['Montserrat'] font-semibold w-fit"
              @click="router.push({ name: 'login', query: { redirect: route.fullPath } })"
            >
              Login
            </button>
          </div>

          <div v-else class="flex flex-col gap-4 mb-8">
            <div class="flex items-center justify-between gap-3 flex-wrap">
              <div class="flex items-center gap-2">
                <button
                  v-for="i in 5"
                  :key="`rate-${i}`"
                  type="button"
                  class="text-2xl border-0 bg-transparent cursor-pointer transition-opacity hover:opacity-80"
                  :class="i <= myRating ? 'text-[#64fb5f]' : 'text-white/40'"
                  @click="setRating(i)"
                  :title="`Beri rating ${i}`"
                >
                  ★
                </button>
              </div>
              <button
                type="button"
                class="bg-primary text-white border-0 rounded-lg px-4 py-2.5 cursor-pointer font-['Montserrat'] font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
                :disabled="postingReview || !myRating"
                @click="submitReview"
              >
                {{ postingReview ? 'Menyimpan...' : 'Simpan Rating' }}
              </button>
            </div>

            <p v-if="reviewsLoading" class="m-0 font-['Montserrat'] text-sm opacity-90">Memuat rating...</p>
            <p v-else-if="reviewsError" class="m-0 font-['Montserrat'] text-sm text-red-300 font-semibold">{{ reviewsError }}</p>
            <div v-else class="flex flex-col gap-3">
              <div v-if="reviews.length === 0" class="font-['Montserrat'] text-sm opacity-90">Belum ada rating.</div>
              <div v-for="r in reviews" :key="r.id" class="bg-white/10 rounded-lg p-4">
                <div class="flex items-center justify-between gap-3 mb-2">
                  <p class="m-0 font-['Montserrat'] font-bold text-sm">{{ formatUserName(r.user) }}</p>
                  <p class="m-0 font-['Montserrat'] text-xs opacity-80">{{ formatDateTime(r.updated_at || r.created_at) }}</p>
                </div>
                <p class="m-0 font-['Montserrat'] text-sm opacity-95">Rating: {{ r.rating }}</p>
              </div>
            </div>
          </div>

          <h3 class="font-['Montserrat'] text-xl md:text-2xl font-bold m-0 mb-4">Komentar</h3>

          <div v-if="!isAuthenticated" class="flex flex-col gap-3">
            <p class="m-0 font-['Montserrat'] text-sm opacity-90">Login dulu untuk melihat dan menulis komentar.</p>
            <button
              type="button"
              class="bg-primary text-white border-0 rounded-lg px-4 py-2.5 cursor-pointer font-['Montserrat'] font-semibold w-fit"
              @click="router.push({ name: 'login', query: { redirect: route.fullPath } })"
            >
              Login
            </button>
          </div>

          <div v-else class="flex flex-col gap-4">
            <form class="flex flex-col gap-3" @submit.prevent="submitComment">
              <textarea
                v-model="commentText"
                class="w-full min-h-[96px] rounded-lg border border-white/20 bg-white/10 text-white p-3 font-['Montserrat'] text-sm outline-none focus:ring-2 focus:ring-primary"
                placeholder="Tulis komentar..."
                required
              ></textarea>
              <div class="flex items-center justify-end gap-3">
                <button
                  type="submit"
                  class="bg-primary text-white border-0 rounded-lg px-4 py-2.5 cursor-pointer font-['Montserrat'] font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
                  :disabled="postingComment"
                >
                  {{ postingComment ? 'Mengirim...' : 'Kirim' }}
                </button>
              </div>
            </form>

            <p v-if="commentsLoading" class="m-0 font-['Montserrat'] text-sm opacity-90">Memuat komentar...</p>
            <p v-else-if="commentsError" class="m-0 font-['Montserrat'] text-sm text-red-300 font-semibold">{{ commentsError }}</p>
            <div v-else class="flex flex-col gap-3">
              <div v-if="comments.length === 0" class="font-['Montserrat'] text-sm opacity-90">Belum ada komentar.</div>
              <div v-for="c in comments" :key="c.id" class="bg-white/10 rounded-lg p-4">
                <div class="flex items-center justify-between gap-3 mb-2">
                  <p class="m-0 font-['Montserrat'] font-bold text-sm">{{ formatUserName(c.user) }}</p>
                  <p class="m-0 font-['Montserrat'] text-xs opacity-80">{{ formatDateTime(c.created_at) }}</p>
                </div>
                <p class="m-0 font-['Montserrat'] text-sm opacity-95">{{ c.comment }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <AppFooter :is-authenticated="isAuthenticated" :user="auth.user" @logout="logout" />
  </div>
</template>
