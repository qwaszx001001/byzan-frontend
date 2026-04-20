<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import AppHeader from '../../components/AppHeader.vue'
import AppFooter from '../../components/AppFooter.vue'
import { getAssetUrl } from '../../utils/assets'
import api from '../../services/api'
import { dummyCourses } from '../../data/dummyCourses.js'
import SuccessModal from '../../components/SuccessModal.vue'
import ErrorModal from '../../components/ErrorModal.vue'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const isAuthenticated = computed(() => auth.isAuthenticated)

const logout = () => {
  auth.logout()
  router.push('/')
}

const course = ref(null)
const modules = ref([])
const lessons = ref([])
const currentLesson = ref(null)
const selectedModule = ref(null)
const modulesById = ref({})
const recommendedCourses = ref([])
const loading = ref(false)
const error = ref(null)
const openModules = ref(new Set()) // Track which modules are open
const completingLessonId = ref(null)
const completeError = ref(null)
const questions = ref([])
const questionsLoading = ref(false)
const questionsError = ref(null)
const questionText = ref('')
const asking = ref(false)
const showAskSuccess = ref(false)
const showAskError = ref(false)
const askSuccessMessage = ref('')
const askErrorMessage = ref('')

const dummyRecommendedCourses = [
  {
    id: 2,
    title: "Kursus Nahwu",
    image: null,
    thumbnail: null,
    featured_image: null
  },
  {
    id: 3,
    title: "Kurusus Mantiq",
    image: null,
    thumbnail: null,
    featured_image: null
  }
]

// Asset URLs
const videoThumbnailSrc = getAssetUrl('8de126a496aa3535b193b674681ac3ff0368a390.png')
const videoControlsSrc = getAssetUrl('8ad04e2f52531bfc929daeb6f0c3501eef56302e.png')
const instructorAvatarSrc = getAssetUrl('28f5b8e9d2c7d6c0b8900264c40a99813e027bab.png')
const starIconSrc = getAssetUrl('ae82f0fc275cc9614de9be18a7b57f7d24b16b0d.png')
const checkedIconSrc = getAssetUrl('016b68354b9cc166fe7e60d6e02b4f4b4d6fccf3.png')
const recommendedCourse1Src = getAssetUrl('f72456441df4efd0eb5ecfda62f6b31c8d4550ef.png')
const recommendedCourse2Src = getAssetUrl('8b82b59be50686891c798f549c89a0972e85b15e.png')

// Durasi pelajaran dalam API berupa menit, format label sederhana
const formatLessonDuration = (minutes) => {
  if (!minutes && minutes !== 0) return '-'
  if (minutes >= 60) {
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    return m ? `${h} jam ${m} menit` : `${h} jam`
  }
  return `${minutes} menit`
}

// Durasi kursus: menit → label
const formatCourseDuration = (minutes) => {
  if (!minutes && minutes !== 0) return '-'
  if (minutes >= 60) {
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    return m ? `${h} jam ${m} menit` : `${h} jam`
  }
  return `${minutes} menit`
}

// Ekstrak thumbnail YouTube dari video_url
const getYouTubeId = (url) => {
  if (!url) return null
  try {
    const u = new URL(url)
    const host = u.hostname.replace('www.', '')
    if (host.includes('youtube.com')) {
      // youtube.com/watch?v=ID atau youtube.com/embed/ID
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
    // abaikan kesalahan parsing
  }
  return null
}

const getYouTubeThumbnail = (url) => {
  const id = getYouTubeId(url)
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null
}

// Sumber thumbnail utama untuk pemutar
const thumbnailSrc = computed(() => {
  const lesson = currentLesson.value
  const lessonThumb = getYouTubeThumbnail(lesson?.video_url)
  if (lessonThumb) return lessonThumb
  const courseThumbFromVideo = getYouTubeThumbnail(course.value?.video_url)
  if (courseThumbFromVideo) return courseThumbFromVideo
  return course.value?.thumbnail_url || videoThumbnailSrc
})

// Tidak gunakan sampleCourse; data diambil langsung dari API

// Rekomendasi kursus opsional

const loadCourseData = async (courseId, lessonId, moduleId) => {
  try {
    const { data: courseData } = await api.get(`/courses/${courseId}/`)
    return courseData || null
  } catch (e) {
    console.warn('Failed to fetch course detail from API, using dummy data:', e)
    // Gunakan data dummy jika API gagal - cari berdasarkan courseId
    const dummyCourseData = dummyCourses.find(c => c.id === parseInt(courseId)) || dummyCourses[0]
    return dummyCourseData
  }
}

const loadRecommendedCourses = async (courseId) => {
  try {
    const { data } = await api.get('/courses/')
    const list = Array.isArray(data) ? data : (data?.results || [])
    return list
      .filter(c => c.id !== parseInt(courseId))
      .slice(0, 2)
  } catch (e) {
    console.warn('Failed to fetch recommended courses from API, using dummy data:', e)
    // Gunakan data dummy jika API gagal
    return dummyRecommendedCourses
  }
}

const mapCourseFromApi = (c) => {
  if (!c) return null
  const priceValue = Number(c.price ?? 0)
  return {
    id: c.id,
    title: c.title || '',
    description: c.description || '',
    thumbnail: c.thumbnail_url || c.thumbnail || c.image || c.featured_image || null,
    thumbnail_url: c.thumbnail_url || c.thumbnail || null,
    price: priceValue,
    is_free: priceValue === 0,
    createdAt: c.created_at || c.createdAt || null,
    instructor_username: c.instructor_name || c.instructor_username || null,
    rate: c.rating_avg ?? c.rate ?? c.rating ?? null,
    totalRates: c.rating_count ?? c.totalRates ?? null,
    totalEnrolments: c.buyers_count ?? c.totalEnrolments ?? null,
    chapters: Array.isArray(c.chapters) ? c.chapters : null,
  }
}

const buildModulesFromChapters = (chapters) => {
  const list = Array.isArray(chapters) ? chapters : []
  return [...list]
    .sort((a, b) => (a?.order ?? 0) - (b?.order ?? 0))
    .map((ch) => ({
      id: ch?.id,
      title: ch?.title || '',
      order_index: ch?.order ?? 0,
      lessons: Array.isArray(ch?.lessons) ? ch.lessons : [],
    }))
}

const parseLessonsResponse = (data, fallbackChapters) => {
  const chaptersFromResponse = Array.isArray(data?.chapters) ? data.chapters : null
  if (chaptersFromResponse) {
    const mods = buildModulesFromChapters(chaptersFromResponse)
    const flat = mods.flatMap((m) => {
      const lessonsList = Array.isArray(m.lessons) ? m.lessons : []
      return [...lessonsList]
        .sort((a, b) => (a?.order ?? a?.order_index ?? 0) - (b?.order ?? b?.order_index ?? 0))
        .map((l) => ({
          id: l?.id,
          title: l?.title || '',
          order_index: l?.order ?? l?.order_index ?? 0,
          duration: l?.duration_seconds != null ? Math.round(Number(l.duration_seconds) / 60) : (l?.duration ?? null),
          completed: Boolean(l?.is_completed || l?.completed),
          content: l?.content || null,
          video_url: l?.youtube_url || l?.video_url || null,
          module: m.id,
        }))
    })
    return { modules: mods, lessons: flat }
  }

  const list = Array.isArray(data) ? data : (Array.isArray(data?.results) ? data.results : [])
  if (!Array.isArray(list) || list.length === 0) {
    const mods = buildModulesFromChapters(fallbackChapters)
    const flat = mods.flatMap((m) => {
      const lessonsList = Array.isArray(m.lessons) ? m.lessons : []
      return [...lessonsList]
        .sort((a, b) => (a?.order ?? a?.order_index ?? 0) - (b?.order ?? b?.order_index ?? 0))
        .map((l) => ({
          id: l?.id,
          title: l?.title || '',
          order_index: l?.order ?? l?.order_index ?? 0,
          duration: l?.duration_seconds != null ? Math.round(Number(l.duration_seconds) / 60) : (l?.duration ?? null),
          completed: Boolean(l?.is_completed || l?.completed),
          content: l?.content || null,
          video_url: l?.youtube_url || l?.video_url || null,
          module: m.id,
        }))
    })
    return { modules: mods, lessons: flat }
  }

  const moduleMap = new Map()
  const ensureModule = (id, title, order) => {
    const key = id || 0
    if (!moduleMap.has(key)) {
      moduleMap.set(key, { id: key, title: title || '', order_index: order ?? 0, lessons: [] })
    }
    return moduleMap.get(key)
  }

  const mappedLessons = list.map((l) => {
    const chapterId = l?.chapter_id || l?.chapter || l?.chapter?.id || 0
    const chapterTitle = l?.chapter_title || l?.chapter?.title || ''
    const chapterOrder = l?.chapter_order || l?.chapter?.order || 0
    ensureModule(chapterId, chapterTitle, chapterOrder)
    return {
      id: l?.id,
      title: l?.title || '',
      order_index: l?.order ?? l?.order_index ?? 0,
      duration: l?.duration_seconds != null ? Math.round(Number(l.duration_seconds) / 60) : (l?.duration ?? null),
      completed: Boolean(l?.is_completed || l?.completed),
      content: l?.content || null,
      video_url: l?.youtube_url || l?.video_url || null,
      module: chapterId,
    }
  })

  const mods = [...moduleMap.values()].sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
  return { modules: mods, lessons: mappedLessons.sort((a, b) => (a.order_index || 0) - (b.order_index || 0)) }
}

const courseStats = computed(() => {
  const ratingRaw = course.value?.rate
  const rating = ratingRaw == null ? null : Number(ratingRaw)
  const ratingCountRaw = course.value?.totalRates
  const ratingCount = ratingCountRaw == null ? 0 : Number(ratingCountRaw)
  const buyersRaw = course.value?.totalEnrolments
  const buyers = buyersRaw == null ? 0 : Number(buyersRaw)
  const durationMinutes = lessons.value.reduce((sum, l) => sum + (Number(l?.duration ?? 0) || 0), 0)
  return { rating, ratingCount, buyers, durationMinutes }
})

onMounted(async () => {
  try {
    loading.value = true
    const courseId = route.params.courseId || route.query.courseId
    const lessonId = route.params.lessonId || route.query.lessonId
    const moduleId = route.params.moduleId || route.query.moduleId

    if (!isAuthenticated.value) {
      error.value = 'Anda belum login. Silakan login terlebih dahulu.'
      return
    }

    if (courseId) {
      const rawCourse = await loadCourseData(courseId, lessonId, moduleId)
      course.value = mapCourseFromApi(rawCourse) || rawCourse
      const fallbackChapters = Array.isArray(rawCourse?.chapters) ? rawCourse.chapters : null

      try {
        const { data } = await api.get(`/courses/my/lessons/${courseId}/`)
        const parsed = parseLessonsResponse(data, fallbackChapters)
        modules.value = parsed.modules
        lessons.value = parsed.lessons
      } catch (eLessons) {
        if (eLessons?.response?.status === 401) {
          error.value = 'Anda belum login atau sesi telah berakhir. Silakan login kembali.'
          return
        }
        if (eLessons?.response?.status === 403) {
          error.value = 'Kursus ini belum Anda beli.'
          modules.value = []
          lessons.value = []
          return
        }
        const parsed = parseLessonsResponse([], fallbackChapters)
        modules.value = parsed.modules
        lessons.value = parsed.lessons
      }

      // Preselect module jika ada di URL
      if (moduleId) {
        const foundModule = modules.value.find(m => m.id === parseInt(moduleId))
        if (foundModule) {
          selectedModule.value = foundModule
          modulesById.value[foundModule.id] = foundModule
          // Auto-open module dari URL
          openModules.value.add(foundModule.id)
        }
      }
      // Jika tidak ada moduleId, pilih Bab pertama agar episode tidak campur
      if (!selectedModule.value && modules.value.length > 0) {
        selectedModule.value = modules.value[0]
        modulesById.value[selectedModule.value.id] = selectedModule.value
        // Auto-open first module jika tidak ada moduleId di URL
        openModules.value.add(modules.value[0].id)
      }

      // Set current lesson
      if (lessonId) {
        const foundLesson = lessons.value.find(lesson => lesson.id === parseInt(lessonId))
        currentLesson.value = foundLesson || lessons.value[0] || null
      } else {
        currentLesson.value = lessons.value[0] || null
      }
      await fetchQuestions(currentLesson.value?.id)

      // Load recommended courses (dengan fallback ke data dummy)
      recommendedCourses.value = await loadRecommendedCourses(courseId)
    } else {
      // Jika tidak ada courseId, gunakan data dummy
      console.warn('No courseId provided, using dummy data')
      const dummyCourseData = dummyCourses[0]
      course.value = dummyCourseData
      modules.value = dummyCourseData.modules
      
      const flattened = []
      for (const m of modules.value) {
        const ml = Array.isArray(m.lessons) ? m.lessons : []
        flattened.push(...ml.map(l => ({ ...l, module: m.id })))
      }
      flattened.sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
      lessons.value = flattened
      
      selectedModule.value = modules.value[0] || null
      if (selectedModule.value) {
        modulesById.value[selectedModule.value.id] = selectedModule.value
        // Auto-open first module untuk dummy data
        openModules.value.add(selectedModule.value.id)
      }
      currentLesson.value = lessons.value[0] || null
      await fetchQuestions(currentLesson.value?.id)
      recommendedCourses.value = dummyRecommendedCourses
    }
  } catch (e) {
    console.error('Error in onMounted:', e)
    // Fallback terakhir ke data dummy jika semua gagal
    const dummyCourseData = dummyCourses[0]
    course.value = dummyCourseData
    modules.value = dummyCourseData.modules
    
    const flattened = []
    for (const m of modules.value) {
      const ml = Array.isArray(m.lessons) ? m.lessons : []
      flattened.push(...ml.map(l => ({ ...l, module: m.id })))
    }
    flattened.sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
    lessons.value = flattened
    
    selectedModule.value = modules.value[0] || null
    if (selectedModule.value) {
      modulesById.value[selectedModule.value.id] = selectedModule.value
      // Auto-open first module untuk fallback data
      openModules.value.add(selectedModule.value.id)
    }
    currentLesson.value = lessons.value[0] || null
    await fetchQuestions(currentLesson.value?.id)
    recommendedCourses.value = dummyRecommendedCourses
    
    error.value = null // Reset error karena kita sudah ada fallback data
  } finally {
    loading.value = false
  }
})

const toggleModule = (moduleId) => {
  if (openModules.value.has(moduleId)) {
    openModules.value.delete(moduleId)
  } else {
    openModules.value.add(moduleId)
  }
}

const selectLesson = (lesson) => {
  currentLesson.value = lesson
  completeError.value = null
  questionsError.value = null
  showAskSuccess.value = false
  showAskError.value = false
  askSuccessMessage.value = ''
  askErrorMessage.value = ''
  questionText.value = ''
  fetchQuestions(lesson?.id)
  
  // Find the module containing this lesson
  const lessonModule = modules.value.find(m => {
    return lessons.value.some(l => 
      l.id === lesson.id && ((l.module === m.id) || (l.module?.id === m.id))
    )
  })
  
  // Auto-open the module containing this lesson
  if (lessonModule && !openModules.value.has(lessonModule.id)) {
    openModules.value.add(lessonModule.id)
  }
  
  // Update selectedModule to match the lesson's module
  if (lessonModule) {
    selectedModule.value = lessonModule
    modulesById.value[lessonModule.id] = lessonModule
  }
  
  // Update URL with both moduleId and lessonId
  router.replace({
    query: {
      ...route.query,
      moduleId: lessonModule?.id || selectedModule.value?.id,
      lessonId: lesson.id,
    },
  })
}

const completeLesson = async (lesson) => {
  if (!lesson?.id) return
  completeError.value = null
  if (!isAuthenticated.value) {
    router.push({ name: 'login', query: { redirect: route.fullPath } })
    return
  }

  if (lesson.completed) return
  completingLessonId.value = lesson.id
  try {
    const lid = Number(lesson.id)
    try {
      await api.post('/courses/lesson/complete/', { lesson_id: lid })
    } catch (e1) {
      const status = e1?.response?.status
      if (status && status >= 400 && status < 500) {
        try {
          await api.post('/courses/lesson/complete/', { id: lid })
        } catch (e2) {
          if (e2?.response?.status && e2.response.status >= 400 && e2.response.status < 500) {
            await api.post('/courses/lesson/complete/')
          } else {
            throw e2
          }
        }
      } else {
        throw e1
      }
    }

    lessons.value = lessons.value.map((l) => (l.id === lesson.id ? { ...l, completed: true, is_completed: true } : l))
    if (currentLesson.value?.id === lesson.id) {
      currentLesson.value = { ...currentLesson.value, completed: true, is_completed: true }
    }
  } catch (e) {
    const resData = e.response?.data
    if (resData && typeof resData === 'object') {
      const messages = Object.entries(resData)
        .map(([k, v]) => Array.isArray(v) ? `${k}: ${v.join(', ')}` : `${k}: ${v}`)
        .join(' | ')
      completeError.value = messages
    } else {
      completeError.value = e.response?.data?.message || e.response?.data?.error || e.message || 'Gagal menandai lesson selesai'
    }
  } finally {
    completingLessonId.value = null
  }
}

const formatDateTime = (iso) => {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return String(iso)
  return d.toLocaleString('id-ID', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
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

const fetchQuestions = async (lessonId) => {
  if (!lessonId) {
    questions.value = []
    return
  }
  if (!isAuthenticated.value) return
  questionsLoading.value = true
  questionsError.value = null
  try {
    const { data } = await api.get(`/courses/lessons/${lessonId}/questions/`)
    questions.value = Array.isArray(data) ? data : (data?.results || [])
  } catch (e) {
    if (e?.response?.status === 403) {
      questionsError.value = 'Anda belum membeli kursus ini.'
    } else if (e?.response?.status === 401) {
      questionsError.value = 'Sesi berakhir. Silakan login kembali.'
    } else {
      questionsError.value = e.response?.data?.message || e.message || 'Gagal memuat pertanyaan'
    }
    questions.value = []
  } finally {
    questionsLoading.value = false
  }
}

const submitQuestion = async () => {
  const lessonId = currentLesson.value?.id
  const text = String(questionText.value || '').trim()
  if (!lessonId || !text) return

  showAskSuccess.value = false
  showAskError.value = false
  askSuccessMessage.value = ''
  askErrorMessage.value = ''

  if (!isAuthenticated.value) {
    router.push({ name: 'login', query: { redirect: route.fullPath } })
    return
  }

  asking.value = true
  try {
    const { data } = await api.post(`/courses/lessons/${lessonId}/questions/`, { question: text })
    questionText.value = ''
    askSuccessMessage.value = 'Pertanyaan berhasil dikirim.'
    showAskSuccess.value = true
    if (data) {
      questions.value = [data, ...questions.value]
    } else {
      await fetchQuestions(lessonId)
    }
  } catch (e) {
    const resData = e.response?.data
    if (resData && typeof resData === 'object') {
      const messages = Object.entries(resData)
        .map(([k, v]) => Array.isArray(v) ? `${k}: ${v.join(', ')}` : `${k}: ${v}`)
        .join(' | ')
      askErrorMessage.value = messages
    } else {
      askErrorMessage.value = e.response?.data?.message || e.response?.data?.error || e.message || 'Gagal mengirim pertanyaan'
    }
    showAskError.value = true
  } finally {
    asking.value = false
  }
}

const selectModule = async (module) => {
  selectedModule.value = module
  // Detail modul sudah tersedia dari course.modules
  modulesById.value[module.id] = module
  // If there are lessons for this module, select the first one
  const firstLesson = lessons.value.find(l => (l.module === module.id) || (l.module?.id === module.id))
  if (firstLesson) {
    selectLesson(firstLesson)
  }
  // Update URL with selected moduleId
  router.replace({
    query: {
      ...route.query,
      moduleId: module.id,
    },
  })
}

const visibleLessons = computed(() => {
  if (!selectedModule.value) return lessons.value
  return lessons.value.filter(l => (l.module === selectedModule.value.id) || (l.module?.id === selectedModule.value.id))
})

// Sumber pemutaran video
const playUrl = computed(() => currentLesson.value?.video_url || course.value?.video_url || null)
const youTubeId = computed(() => getYouTubeId(playUrl.value))
const isYouTube = computed(() => !!youTubeId.value)
const youtubeEmbedSrc = computed(() => youTubeId.value ? `https://www.youtube.com/embed/${youTubeId.value}?rel=0&modestbranding=1` : null)
// Jika bukan YouTube dan playUrl tersedia, gunakan tag video
const isVideoFile = computed(() => !!playUrl.value && !isYouTube.value)

const goToCourse = (courseSlug) => {
  router.push({ name: 'course-details', params: { id: courseSlug } })
}
</script>

<template>
  <div class="w-full max-w-none mx-auto bg-white overflow-hidden">
    <AppHeader :is-authenticated="isAuthenticated" :user="auth.user" @logout="logout" />
    <SuccessModal
      :show="showAskSuccess"
      title="Berhasil"
      :message="askSuccessMessage"
      @close="showAskSuccess = false"
    />
    <ErrorModal
      :show="showAskError"
      title="Gagal"
      :message="askErrorMessage"
      @close="showAskError = false"
    />

    <section id="main-content" class="pb-16">
      <div v-if="loading" class="text-center py-10 font-['Montserrat']">Memuat course...</div>
      <div v-else-if="error" class="text-center py-10 font-['Montserrat']">{{ error }}</div>
      <div v-else-if="course" class="grid grid-cols-1 lg:grid-cols-[1021fr_350fr] w-full">
        <main>
          <div class="bg-[#212121] relative">
            <div class="relative w-full h-auto max-w-full aspect-video rounded-lg overflow-hidden">
              <iframe
                v-if="isYouTube"
                class="w-full h-full"
                :src="youtubeEmbedSrc"
                title="YouTube video player"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowfullscreen
              ></iframe>
              <video v-else-if="isVideoFile" class="w-full h-full" :src="playUrl" controls></video>
              <img v-else :src="thumbnailSrc" alt="Course video thumbnail" class="w-full h-full object-cover" />
            </div>
          </div>

          <div class="bg-white px-4 lg:px-18 py-3.5 -mt-px">
            <h1 class="text-2xl lg:text-[34px] font-bold text-[#009444] mb-2 font-['Montserrat']">{{ course.title }}</h1>
            <div v-if="currentLesson" class="flex flex-col gap-3">
              <p class="text-base lg:text-xl font-medium m-0 font-['Montserrat']">
                Lesson {{ String(currentLesson.order_index || currentLesson.orderIndex || 1).padStart(2, '0') }} | {{ currentLesson.title }}
              </p>
              <div class="flex items-center gap-3">
                <button
                  type="button"
                  class="bg-[#009444] text-white border-0 rounded-lg px-4 py-2 cursor-pointer font-['Montserrat'] font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
                  :disabled="completingLessonId === currentLesson.id || currentLesson.completed"
                  @click="completeLesson(currentLesson)"
                >
                  {{ currentLesson.completed ? 'Sudah Selesai' : (completingLessonId === currentLesson.id ? 'Memproses...' : 'Tandai Selesai') }}
                </button>
                <p v-if="completeError" class="m-0 text-sm font-['Montserrat'] text-red-600 font-semibold">{{ completeError }}</p>
              </div>
            </div>
          </div>

          <div class="flex flex-col lg:flex-row items-start lg:items-center px-4 lg:px-18 py-7 lg:py-[27px] flex-wrap gap-5">
            <div class="flex items-center gap-2 bg-[#009444] text-white px-px py-px rounded-lg">
              <img
                :src="instructorAvatarSrc"
                :alt="'Instruktur'"
                class="w-12 h-12 rounded-full object-cover"
              />
              <div class="flex flex-col pr-18">
                <p class="text-xl font-semibold m-0 font-['Montserrat']">
                    Instruktur
                </p>
                <p class="text-[11px] font-medium m-0 font-['Montserrat']">
                   {{ course.instructor_username || 'Instruktur' }}
                </p>
              </div>
            </div>

            <div class="flex items-start gap-10 flex-wrap">
              <!-- <div class="text-center font-['Montserrat']">
                <span class="text-xl font-semibold block">{{ course.is_free ? 'Gratis' : 'Berbayar' }}</span>
                <span class="text-[11px] font-medium block mt-2">Tipe</span>
              </div> -->
              <!-- <div class="text-center font-['Montserrat']">
                <span class="text-xl font-semibold block">{{ course.level || '-' }}</span>
                <span class="text-[11px] font-medium block mt-2">Level</span>
              </div> -->
              <div class="text-center font-montserrat">
                <div class="flex items-center">
                  <span class="text-xl font-semibold block mr-2">{{ courseStats.rating ?? 'N/A' }}</span>
                  <img :src="starIconSrc" alt="Star" class="w-5 h-5 object-contain" />
                </div>
                <span class="text-[11px] font-medium block mt-2">{{ courseStats.ratingCount }} Peringkat</span>
              </div>
              <div class="text-center font-['Montserrat']">
                <span class="text-xl font-semibold block">{{ courseStats.buyers }}</span>
                <span class="text-[11px] font-medium block mt-2">Peserta</span>
              </div>
              <div class="text-center font-['Montserrat']">
                <span class="text-xl font-semibold block">{{ formatCourseDuration(courseStats.durationMinutes) }}</span>
                <span class="text-[11px] font-medium block mt-2">Durasi</span>
              </div>
              <!-- <div class="text-center font-['Montserrat']" v-if="course.price">
                <span class="text-xl font-semibold block">Rp {{ String(course.price).replace(/\B(?=(\d{3})+(?!\d))/g, '.') }}</span>
                <span class="text-[11px] font-medium block mt-2">Harga</span>
              </div> -->
            </div>
          </div>

          <article class="px-4 lg:px-18 pt-11 font-['Comfortaa'] text-[15px] font-medium leading-[30px]">
            <template v-if="currentLesson?.content">
              <div v-html="currentLesson.content" class="[&>p]:mb-4 [&>p:last-child]:mb-0 course-content"></div>
            </template>
            <template v-else-if="course.content">
              <div v-html="course.content" class="[&>p]:mb-4 [&>p:last-child]:mb-0 course-content"></div>
            </template>
            <template v-else-if="course.description">
              <p v-for="(paragraph, index) in course.description.split('\n\n')" :key="index" class="mb-4 last:mb-0">
                {{ paragraph }}
              </p>
            </template>
            <p v-else>-</p>
          </article>

          <section class="px-4 lg:px-18 pt-10">
            <div class="rounded-2xl border border-gray-200 p-5">
              <div class="flex items-center justify-between gap-3 mb-4">
                <h2 class="m-0 text-xl font-bold text-[#009444] font-['Montserrat']">Q&A Lesson</h2>
                <p v-if="currentLesson" class="m-0 text-xs text-gray-600 font-semibold font-['Montserrat']">
                  Lesson {{ String(currentLesson.order_index || currentLesson.orderIndex || 1).padStart(2, '0') }}
                </p>
              </div>

              <div v-if="!isAuthenticated" class="flex items-center justify-between gap-3">
                <p class="m-0 text-sm text-gray-600 font-semibold font-['Montserrat']">Login dulu untuk bertanya.</p>
                <button
                  type="button"
                  class="bg-[#009444] text-white border-0 rounded-lg px-4 py-2 cursor-pointer font-['Montserrat'] font-semibold"
                  @click="router.push({ name: 'login', query: { redirect: route.fullPath } })"
                >
                  Login
                </button>
              </div>

              <div v-else class="flex flex-col gap-4">
                <form class="flex flex-col gap-3" @submit.prevent="submitQuestion">
                  <textarea
                    v-model="questionText"
                    class="w-full min-h-[96px] rounded-lg border border-gray-300 bg-white p-3 font-['Montserrat'] text-sm outline-none focus:ring-2 focus:ring-[#009444]"
                    placeholder="Tulis pertanyaan tentang lesson ini..."
                    required
                  ></textarea>
                  <div class="flex items-center justify-end">
                    <button
                      type="submit"
                      class="bg-[#009444] text-white border-0 rounded-lg px-4 py-2 cursor-pointer font-['Montserrat'] font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
                      :disabled="asking || !currentLesson"
                    >
                      {{ asking ? 'Mengirim...' : 'Kirim Pertanyaan' }}
                    </button>
                  </div>
                </form>

                <p v-if="questionsLoading" class="m-0 text-sm text-gray-600 font-semibold font-['Montserrat']">Memuat pertanyaan...</p>
                <p v-else-if="questionsError" class="m-0 text-sm text-red-600 font-semibold font-['Montserrat']">{{ questionsError }}</p>

                <div v-else class="flex flex-col gap-3">
                  <div v-if="questions.length === 0" class="text-sm text-gray-600 font-semibold font-['Montserrat']">Belum ada pertanyaan.</div>
                  <div v-for="q in questions" :key="q.id" class="rounded-xl bg-gray-50 p-4">
                    <div class="flex items-center justify-between gap-3 mb-2">
                      <p class="m-0 text-sm font-bold text-black font-['Montserrat']">{{ formatUserName(q.user) }}</p>
                      <p class="m-0 text-xs text-gray-600 font-semibold font-['Montserrat']">{{ formatDateTime(q.created_at) }}</p>
                    </div>
                    <p class="m-0 text-sm text-gray-800 font-semibold font-['Montserrat']">{{ q.question }}</p>
                    <div v-if="q.answer" class="mt-3 border-l-4 border-[#009444] pl-3">
                      <div class="flex items-center justify-between gap-3 mb-1">
                        <p class="m-0 text-xs text-gray-600 font-bold font-['Montserrat']">{{ formatUserName(q.answered_by || 'Admin') }}</p>
                        <p class="m-0 text-xs text-gray-600 font-semibold font-['Montserrat']">{{ formatDateTime(q.answered_at) }}</p>
                      </div>
                      <p class="m-0 text-sm text-gray-800 font-['Montserrat']">{{ q.answer }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>

        <aside class="bg-white border-l border-gray-200">
          <div class="p-5 sticky top-5">
            <ul class="flex flex-col gap-2">
              <template v-for="m in modules" :key="m.id">
                <!-- Bab Header with Toggle -->
                <li class="px-2 pt-3 pb-2 border-gray-300 mb-2 transition-all duration-300 hover:-translate-y-1 cursor-pointer" @click="toggleModule(m.id)">
                  <div class="flex justify-between items-center">
                    <p class="m-0 text-base font-bold leading-[1.4] font-montserrat">
                      <span class="font-bold mr-2">Bab {{ m.order_index || m.orderIndex || m.id }}: </span>
                      <span class="font-semibold">{{ m.title }}</span>
                    </p>
                    <span class="transition-transform duration-300 ease-in-out text-[#009444] flex items-center" :class="{ 'rotate-180': openModules.has(m.id) }">
                      <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                        <path d="M1 1L6 6L11 1" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    </span>
                  </div>
                </li>
                <!-- Episodes untuk bab ini (collapsible with smooth transition) -->
                <Transition name="accordion">
                  <div v-if="openModules.has(m.id)" class="overflow-hidden">
                    <li 
                      v-for="(lesson, index) in lessons.filter(l => (l.module === m.id) || (l.module?.id === m.id))" 
                      :key="`lesson-${lesson.id}`"
                      @click="selectLesson(lesson)" 
                      :class="{ 'bg-gray-100 translate-x-0.5 shadow-[0_1px_3px_rgba(0,148,68,0.2)]': lesson.id === currentLesson?.id }"
                      class="flex items-start gap-3 px-3 py-2 ml-4 rounded-md transition-all duration-300 ease-in-out transform-gpu cursor-pointer hover:bg-gray-100 hover:translate-x-1 hover:shadow-[0_2px_4px_rgba(0,0,0,0.1)]"
                    >
                      <div class="shrink-0 w-4 h-4 bg-gray-300 rounded-sm mt-1 relative transition-all duration-200 ease-in-out transform-gpu" :class="{ 'bg-[#009444] scale-105 shadow-[0_2px_4px_rgba(0,148,68,0.3)]': lesson.completed || lesson.id === currentLesson?.id }">
                        <img v-if="lesson.completed || lesson.id === currentLesson?.id" :src="checkedIconSrc" alt="Checked" class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4" />
                      </div>
                      <p class="m-0 text-sm font-medium leading-[1.4] font-['Montserrat']">
                        <span class="text-lg font-bold">Eps. {{ index + 1 }}</span><br />
                        <span class="font-semibold">{{ lesson.title }} ({{ formatLessonDuration(lesson.duration) }})</span>
                      </p>
                    </li>
                  </div>
                </Transition>
              </template>
            </ul>

            <div class="mt-27 text-center">
              <h2 class="text-xl font-medium mb-10! font-['Montserrat']">Rekomendasi Kursus</h2>
              <div
                v-for="recCourse in recommendedCourses"
                :key="recCourse.id"
                class="bg-gray-100 rounded-[27.5px] px-3.5 pt-3.5 pb-4 mb-9 last:mb-0 shadow-[6.3px_5.3px_13.6px_0px_rgba(0,0,0,0.05)] shadow-[inset_9.5px_9px_7.3px_0px_rgba(255,255,255,0.1)] backdrop-blur-[10px] transition-all duration-200 cursor-pointer hover:-translate-y-0.5 hover:shadow-[8px_7px_16px_0px_rgba(0,0,0,0.1)]"
                @click="goToCourse(recCourse.id || recCourse.slug)"
              >
                <div class="rounded-[14px] overflow-hidden mb-3 shadow-[inset_2.6px_2.1px_2.1px_0px_rgba(255,255,255,0.25)]">
                  <img
                    :src="recCourse.image || recCourse.thumbnail || recCourse.featured_image || recommendedCourse1Src"
                    :alt="recCourse.title"
                    class="w-full h-auto block"
                  />
                </div>
                <h3 class="text-[33.6px] font-bold text-[#009444] mb-1.5 font-['Montserrat']">{{ recCourse.title }}</h3>
                <a href="#" class="text-[13.4px] font-semibold text-black no-underline transition-opacity duration-200 font-['Montserrat'] hover:opacity-70" @click.prevent="goToCourse(recCourse.id || recCourse.slug)">Click Here For Free Course</a>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </section>

    <AppFooter :is-authenticated="isAuthenticated" :user="auth.user" @logout="logout" />
  </div>
</template>

<style>
/* Accordion Animation */
.accordion-enter-active,
.accordion-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.accordion-enter-from {
  opacity: 0;
  max-height: 0;
  transform: translateY(-10px);
}

.accordion-enter-to {
  opacity: 1;
  max-height: 1000px;
  transform: translateY(0);
}

.accordion-leave-from {
  opacity: 1;
  max-height: 1000px;
  transform: translateY(0);
}

.accordion-leave-to {
  opacity: 0;
  max-height: 0;
  transform: translateY(-10px);
}

 .course-content h1 {
  font-family: 'Montserrat', sans-serif;
  font-size: 34px;
  font-weight: bold;
}
.course-content h2 {
  font-family: 'Montserrat', sans-serif;
  font-size: 24px;
  font-weight: bold;
}
.course-content h3 {
  font-family: 'Montserrat', sans-serif;
  font-size: 24px;
  font-weight: bold;
}
.course-content p {
  font-family: 'Comfortaa', cursive;
  font-size: 15px;
  font-weight: 500;
  line-height: 30px;
}
.course-content ul {
  font-family: 'Comfortaa', cursive;
  font-size: 15px;
  font-weight: 500;
  line-height: 30px;
  list-style-type: disc;
  padding-left: 20px;
}

.course-content ul li {
  list-style-type: disc;
}
.course-content ol {
  font-family: 'Comfortaa', cursive;
  font-size: 15px;
  font-weight: 500;
  line-height: 30px;
  list-style-type: decimal;
  padding-left: 20px;
}
.course-content a {
  font-family: 'Comfortaa', cursive;
  font-size: 15px;
  font-weight: 500;
  line-height: 30px;
  text-decoration: underline;
}
</style>
