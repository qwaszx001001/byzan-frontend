<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import AppHeader from '../../components/AppHeader.vue'
import AppFooter from '../../components/AppFooter.vue'
import { getAssetUrl } from '../../utils/assets'
import api from '../../services/api'
import SuccessModal from '../../components/SuccessModal.vue'
import ErrorModal from '../../components/ErrorModal.vue'

const router = useRouter()
const auth = useAuthStore()

const isAuthenticated = computed(() => auth.isAuthenticated)

const logout = () => {
  auth.logout()
  router.push('/')
}

const myCourses = ref([])
const completedCourses = ref([])
const inProgressCourses = ref([])
const loading = ref(false)
const error = ref(null)
const downloadingCourseId = ref(null)
const showCertSuccess = ref(false)
const showCertError = ref(false)
const certSuccessMessage = ref('')
const certErrorMessage = ref('')

// Asset URLs
const emptyStateIconSrc = getAssetUrl('c29de5aa1fc5f0701ae31f5c8e6620820754d49e.png')
const starIconSrc = getAssetUrl('ae82f0fc275cc9614de9be18a7b57f7d24b16b0d.png')

// Normalisasi URL media dari API (thumbnail/video) agar tidak di-resolve oleh dev server
const API_ORIGIN = (() => {
  try {
    return new URL(api.defaults.baseURL).origin
  } catch {
    return ''
  }
})()
const normalizeMediaUrl = (url) => {
  if (!url) return null
  if (/^https?:\/\//i.test(url)) return url
  const path = String(url)
  return path.startsWith('/') ? `${API_ORIGIN}${path}` : `${API_ORIGIN}/${path}`
}

onMounted(async () => {
  try {
    loading.value = true
    // Fetch daftar kursus milik user
    try {
      const { data } = await api.get('/courses/my/')
      const list = Array.isArray(data) ? data : (data?.results || [])

      // Map response langsung ke bentuk kartu UI, normalisasi field gambar dan video
      myCourses.value = list.map((c) => ({
        id: c.id,
        title: c.title,
        image: normalizeMediaUrl(c.thumbnail_url || c.thumbnail || c.image || c.image_url || c.featured_image || null),
        video_url: normalizeMediaUrl(c.video_url || c.youtube_url || null),
        rating: c.rating || c.rate || null,
        episodes_count: c.episodes_count || c.total_lessons || null,
        completed_lessons: c.completed_lessons ?? null,
        instructor: c.instructor || c.instructor_name || null,
        progress: Number(c.progress_percent ?? c.progress ?? 0),
        is_enrolled: Boolean(c.is_enrolled),
        status: (c.completed || c.is_completed || Number(c.progress_percent ?? c.progress ?? 0) >= 100) ? 'completed' : 'in_progress',
        last_episode_id: c.last_episode_id || null,
      }))

      // Dengan endpoint baru, status kelulusan mungkin tidak ada; tampilkan semua sebagai in-progress
      completedCourses.value = myCourses.value.filter(course => course.status === 'completed')
      inProgressCourses.value = myCourses.value.filter(course => course.status !== 'completed')
    } catch (e) {
      // Tangani 401 dengan pesan yang jelas
      if (e?.response?.status === 401) {
        error.value = 'Anda belum login atau sesi telah berakhir. Silakan login terlebih dahulu.'
      } else {
        console.warn('API tidak tersedia, menggunakan empty state:', e)
      }
      myCourses.value = []
      completedCourses.value = []
      inProgressCourses.value = []
    }
  } catch (e) {
    error.value = e.message || 'Gagal memuat kursus Anda'
    myCourses.value = []
  } finally {
    loading.value = false
  }
})

const goToLearning = (courseId) => {
  router.push({ name: 'course-learning', params: { courseId } })
}

const goToCourseDetails = (courseId) => {
  router.push({ name: 'course-details', params: { id: courseId } })
}

const continueCourse = (course) => {
  if (course.last_episode_id) {
    router.push({
      name: 'course-learning',
      params: { courseId: course.id },
      query: { episodeId: course.last_episode_id },
    })
  } else {
    goToLearning(course.id)
  }
}

const downloadBlobAsFile = (blob, filename) => {
  const objectUrl = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = objectUrl
  a.download = filename
  a.rel = 'noopener'
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(objectUrl), 10000)
}

const generateCertificatePdf = async (certificate) => {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' })
  const w = doc.internal.pageSize.getWidth()
  const h = doc.internal.pageSize.getHeight()

  const primary = [0, 148, 68]
  const light = [100, 251, 95]

  doc.setFillColor(247, 255, 249)
  doc.rect(0, 0, w, h, 'F')

  doc.setDrawColor(...primary)
  doc.setLineWidth(6)
  doc.rect(36, 36, w - 72, h - 72)

  doc.setDrawColor(...light)
  doc.setLineWidth(2)
  doc.rect(54, 54, w - 108, h - 108)

  const fullName = certificate?.user_full_name || certificate?.user_email || 'Student'
  const courseTitle = certificate?.course_title || 'Course'
  const certificateNumber = certificate?.certificate_number || certificate?.code || ''
  const verifyUrl = certificate?.verify_url || ''
  const issuedAt = certificate?.issued_at ? new Date(certificate.issued_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : ''

  doc.setTextColor(...primary)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(42)
  doc.text('CERTIFICATE', w / 2, 150, { align: 'center' })

  doc.setTextColor(102, 102, 102)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.text('OF COMPLETION', w / 2, 178, { align: 'center' })

  doc.setDrawColor(230, 230, 230)
  doc.setLineWidth(1)
  doc.line(w / 2 - 220, 205, w / 2 + 220, 205)

  doc.setTextColor(128, 128, 128)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.text('This is to certify that', w / 2, 260, { align: 'center' })

  doc.setTextColor(0, 0, 0)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(52)
  doc.text(fullName, w / 2, 330, { align: 'center' })

  doc.setDrawColor(230, 230, 230)
  doc.setLineWidth(1)
  doc.line(w / 2 - 320, 350, w / 2 + 320, 350)

  doc.setTextColor(128, 128, 128)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.text('has successfully completed the course', w / 2, 400, { align: 'center' })

  doc.setTextColor(0, 0, 0)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(30)
  doc.text(courseTitle, w / 2, 450, { align: 'center', maxWidth: w - 220 })

  doc.setTextColor(102, 102, 102)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(12)
  doc.text(`Certificate No: ${certificateNumber}`, 90, h - 140)
  doc.text(`Issued: ${issuedAt}`, 90, h - 120)
  if (verifyUrl) {
    doc.text('Verify:', 90, h - 100)
    doc.setTextColor(...primary)
    doc.textWithLink(verifyUrl, 140, h - 100, { url: verifyUrl })
  }

  doc.setTextColor(0, 0, 0)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.text('Authorized Signature', w - 250, h - 120, { align: 'center' })
  doc.setDrawColor(0, 0, 0)
  doc.setLineWidth(1)
  doc.line(w - 390, h - 100, w - 110, h - 100)

  const fileSafe = String(certificateNumber || 'certificate').replace(/[^\w.-]+/g, '_')
  doc.save(`${fileSafe}.pdf`)
}

const downloadCertificate = async (course) => {
  if (!course?.id) return
  if (!isAuthenticated.value) {
    router.push({ name: 'login', query: { redirect: '/my-courses' } })
    return
  }

  downloadingCourseId.value = course.id
  showCertSuccess.value = false
  showCertError.value = false
  certSuccessMessage.value = ''
  certErrorMessage.value = ''

  try {
    const res = await api.get(`/courses/${course.id}/certificate/`, { responseType: 'blob' })
    const contentType = String(res.headers?.['content-type'] || '')
    const contentDisposition = String(res.headers?.['content-disposition'] || '')
    const blob = res.data

    if (contentType.includes('application/json')) {
      const text = await blob.text()
      const data = text ? JSON.parse(text) : {}
      const cert = data?.certificate || data
      if (cert && typeof cert === 'object' && (cert?.code || cert?.certificate_number)) {
        await generateCertificatePdf(cert)
        certSuccessMessage.value = cert?.verify_url ? `Sertifikat berhasil dibuat. Verifikasi: ${cert.verify_url}` : 'Sertifikat berhasil dibuat.'
        showCertSuccess.value = true
        return
      }
      const certificateUrl = data?.certificate_url || data?.url || data?.file_url || data?.file || null
      const verifyUrl = data?.verify_url || null
      const code = data?.code || null
      if (certificateUrl) {
        window.open(certificateUrl, '_blank')
        certSuccessMessage.value = 'Sertifikat berhasil dibuka.'
      } else {
        certSuccessMessage.value = verifyUrl
          ? `Sertifikat berhasil dibuat. Verifikasi: ${verifyUrl}`
          : (code ? `Sertifikat berhasil dibuat. Code: ${code}` : 'Sertifikat berhasil dibuat.')
      }
      showCertSuccess.value = true
      return
    }

    if (blob && typeof blob.size === 'number' && blob.size > 1024) {
      const match = /filename\*?=(?:UTF-8''|")?([^;"\n]+)(?:"|;|\n|$)/i.exec(contentDisposition)
      const rawName = match?.[1] ? decodeURIComponent(match[1].replace(/"/g, '').trim()) : ''
      const fallbackName = `certificate-course-${course.id}.pdf`
      const filename = rawName || fallbackName
      downloadBlobAsFile(blob, filename)
      certSuccessMessage.value = 'Sertifikat berhasil diunduh.'
      showCertSuccess.value = true
      return
    }

    throw new Error('Respons sertifikat tidak valid dari server')
  } catch (e) {
    const resData = e.response?.data
    if (resData && typeof resData === 'object') {
      const messages = Object.entries(resData)
        .map(([k, v]) => Array.isArray(v) ? `${k}: ${v.join(', ')}` : `${k}: ${v}`)
        .join(' | ')
      certErrorMessage.value = messages
    } else {
      certErrorMessage.value = e.response?.data?.message || e.response?.data?.error || e.message || 'Gagal mengambil sertifikat'
    }
    showCertError.value = true
  } finally {
    downloadingCourseId.value = null
  }
}
</script>

<template>
  <div class="page-container">
    <AppHeader :is-authenticated="isAuthenticated" :user="auth.user" @logout="logout" />
    <SuccessModal
      :show="showCertSuccess"
      title="Berhasil"
      :message="certSuccessMessage"
      @close="showCertSuccess = false"
    />
    <ErrorModal
      :show="showCertError"
      title="Gagal"
      :message="certErrorMessage"
      @close="showCertError = false"
    />

    <main class="main-content">
      <div class="page-header">
        <h1 class="page-title">Kursus Saya</h1>
        <p class="page-subtitle">Kelola dan lanjutkan pembelajaran Anda</p>
      </div>

      <div v-if="loading" class="loading">Memuat kursus Anda...</div>
      <div v-else-if="error" class="error">{{ error }}</div>
      <div v-else-if="myCourses.length === 0" class="empty-state">
        <img :src="emptyStateIconSrc" alt="Empty state" class="empty-icon" />
        <h2>Belum Ada Kursus</h2>
        <p>Anda belum mendaftar ke kursus manapun. Mulai pembelajaran Anda sekarang!</p>
        <router-link to="/course" class="btn btn-primary">Jelajahi Kursus</router-link>
      </div>

      <div v-else class="courses-container">
        <!-- In Progress Courses -->
        <section v-if="inProgressCourses.length > 0" class="courses-section">
          <div class="section-header">
            <h2 class="section-title">Sedang Dipelajari</h2>
            <span class="section-count">{{ inProgressCourses.length }} kursus</span>
          </div>

          <div class="courses-grid">
            <div
              v-for="course in inProgressCourses"
              :key="course.id"
              class="course-card progress-card"
              @click="continueCourse(course)"
            >
              <div class="course-image-wrapper">
                <template v-if="course.image">
                  <img
                    :src="course.image"
                    :alt="course.title"
                    class="course-image"
                  />
                </template>
                <template v-else-if="course.video_url">
                  <video
                    class="course-image"
                    :src="course.video_url"
                    muted
                    autoplay
                    playsinline
                    loop
                    preload="metadata"
                  ></video>
                </template>
                <template v-else>
                  <img
                    :src="emptyStateIconSrc"
                    :alt="course.title"
                    class="course-image"
                  />
                </template>
                <div class="progress-overlay">
                  <div class="progress-bar">
                    <div
                      class="progress-fill"
                      :style="{ width: `${course.progress || 0}%` }"
                    ></div>
                  </div>
                  <span class="progress-text">{{ course.progress || 0 }}%</span>
                </div>
              </div>

              <div class="course-content">
                <h3 class="course-title">{{ course.title }}</h3>
                <p class="course-instructor" v-if="course.instructor">
                  {{ typeof course.instructor === 'object' ? course.instructor.name : course.instructor }}
                </p>
                <div class="course-meta">
                  <div class="course-rating" v-if="course.rating">
                    <img :src="starIconSrc" alt="Star" class="star-icon-small" />
                    <span>{{ course.rating }}</span>
                  </div>
                  <span class="course-episodes" v-if="course.episodes_count">
                    {{ course.episodes_count }} episode
                  </span>
                </div>
                <button class="btn-continue" @click.stop="continueCourse(course)">
                  Lanjutkan Belajar
                </button>
                <button
                  v-if="course.is_enrolled && Number(course.progress || 0) >= 100"
                  class="btn-certificate"
                  :disabled="downloadingCourseId === course.id"
                  @click.stop="downloadCertificate(course)"
                >
                  {{ downloadingCourseId === course.id ? 'Memproses...' : 'Download Certificate' }}
                </button>
              </div>
            </div>
          </div>
        </section>

        <!-- Completed Courses -->
        <section v-if="completedCourses.length > 0" class="courses-section">
          <div class="section-header">
            <h2 class="section-title">Selesai</h2>
            <span class="section-count">{{ completedCourses.length }} kursus</span>
          </div>

          <div class="courses-grid">
            <div
              v-for="course in completedCourses"
              :key="course.id"
              class="course-card completed-card"
              @click="goToCourseDetails(course.id)"
            >
              <div class="course-image-wrapper">
                <template v-if="course.image">
                  <img
                    :src="course.image"
                    :alt="course.title"
                    class="course-image"
                  />
                </template>
                <template v-else-if="course.video_url">
                  <video
                    class="course-image"
                    :src="course.video_url"
                    muted
                    autoplay
                    playsinline
                    loop
                    preload="metadata"
                  ></video>
                </template>
                <template v-else>
                  <img
                    :src="emptyStateIconSrc"
                    :alt="course.title"
                    class="course-image"
                  />
                </template>
                <div class="completed-badge">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="currentColor"/>
                  </svg>
                  Selesai
                </div>
              </div>

              <div class="course-content">
                <h3 class="course-title">{{ course.title }}</h3>
                <p class="course-instructor" v-if="course.instructor">
                  {{ typeof course.instructor === 'object' ? course.instructor.name : course.instructor }}
                </p>
                <div class="course-meta">
                  <div class="course-rating" v-if="course.rating">
                    <img :src="starIconSrc" alt="Star" class="star-icon-small" />
                    <span>{{ course.rating }}</span>
                  </div>
                  <span class="course-episodes" v-if="course.episodes_count">
                    {{ course.episodes_count }} episode
                  </span>
                </div>
                <button class="btn-review" @click.stop="goToCourseDetails(course.id)">
                  Lihat Detail
                </button>
                <button
                  v-if="course.is_enrolled && Number(course.progress || 0) >= 100"
                  class="btn-certificate"
                  :disabled="downloadingCourseId === course.id"
                  @click.stop="downloadCertificate(course)"
                >
                  {{ downloadingCourseId === course.id ? 'Memproses...' : 'Download Certificate' }}
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>

    <AppFooter :is-authenticated="isAuthenticated" :user="auth.user" @logout="logout" />
  </div>
</template>

<style scoped>


:root {
  --primary-green: #009444;
  --light-green: #64fb5f;
  --text-dark: #000000;
  --text-light: #ffffff;
  --bg-white: #ffffff;
  --bg-light-gray: #f5f5f5;
  --bg-dark: #121212;
  --border-color: #e0e0e0;
  --text-gray: #666666;
}

* {
  box-sizing: border-box;
}

.page-container {
  max-width: 100%;
  margin: 0 auto;
  background-color: var(--bg-white);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  padding: 40px 72px;
  width: 100%;
}

.page-header {
  margin-bottom: 48px;
}

.page-title {
  font-family: 'Montserrat', sans-serif;
  font-size: 48px;
  font-weight: 700;
  color: var(--primary-green);
  margin: 0 0 8px 0;
}

.page-subtitle {
  font-family: 'Montserrat', sans-serif;
  font-size: 20px;
  font-weight: 500;
  color: var(--text-gray);
  margin: 0;
}

.loading,
.error {
  text-align: center;
  padding: 60px 20px;
  font-family: 'Montserrat', sans-serif;
  font-size: 18px;
}

.error {
  color: #d32f2f;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 80px 20px;
  max-width: 600px;
  margin: 0 auto;
}

.empty-icon {
  width: 200px;
  height: 200px;
  margin: 0 auto 32px;
  opacity: 0.5;
}

.empty-state h2 {
  font-family: 'Montserrat', sans-serif;
  font-size: 32px;
  font-weight: 700;
  color: var(--text-dark);
  margin: 0 0 16px 0;
}

.empty-state p {
  font-family: 'Montserrat', sans-serif;
  font-size: 18px;
  color: var(--text-gray);
  margin: 0 0 32px 0;
  line-height: 1.6;
}

.btn {
  display: inline-block;
  padding: 12px 32px;
  border-radius: 5px;
  font-family: 'Montserrat', sans-serif;
  font-size: 18px;
  font-weight: 600;
  text-decoration: none;
  border: none;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn:hover {
  opacity: 0.9;
}

.btn-primary {
  background-color: var(--primary-green);
  color: var(--text-light);
}

/* Courses Section */
.courses-section {
  margin-bottom: 64px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.section-title {
  font-family: 'Montserrat', sans-serif;
  font-size: 32px;
  font-weight: 700;
  color: var(--text-dark);
  margin: 0;
}

.section-count {
  font-family: 'Montserrat', sans-serif;
  font-size: 16px;
  font-weight: 500;
  color: var(--text-gray);
}

.courses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 32px;
}

/* Course Card */
.course-card {
  background-color: var(--bg-white);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.course-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.course-image-wrapper {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
  background-color: var(--bg-light-gray);
}

.course-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.progress-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
  padding: 16px;
  color: var(--text-light);
}

.progress-bar {
  width: 100%;
  height: 6px;
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  background-color: var(--light-green);
  transition: width 0.3s;
}

.progress-text {
  font-family: 'Montserrat', sans-serif;
  font-size: 14px;
  font-weight: 600;
}

.completed-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background-color: var(--primary-green);
  color: var(--text-light);
  padding: 8px 12px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: 'Montserrat', sans-serif;
  font-size: 14px;
  font-weight: 600;
}

.completed-badge svg {
  width: 18px;
  height: 18px;
}

.course-content {
  padding: 20px;
}

.course-title {
  font-family: 'Montserrat', sans-serif;
  font-size: 20px;
  font-weight: 700;
  color: var(--text-dark);
  margin: 0 0 8px 0;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-clamp: 2;
}

.course-instructor {
  font-family: 'Montserrat', sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-gray);
  margin: 0 0 12px 0;
}

.course-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
  font-family: 'Montserrat', sans-serif;
}

.course-rating {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-dark);
}

.star-icon-small {
  width: 18px;
  height: 18px;
}

.course-episodes {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-gray);
}

.btn-continue,
.btn-review {
  width: 100%;
  padding: 10px 20px;
  border-radius: 5px;
  font-family: 'Montserrat', sans-serif;
  font-size: 16px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn-continue {
  background-color: var(--primary-green);
  color: var(--text-light);
}

.btn-review {
  background-color: var(--bg-light-gray);
  color: var(--text-dark);
}

.btn-certificate {
  width: 100%;
  margin-top: 10px;
  padding: 10px 20px;
  border-radius: 5px;
  font-family: 'Montserrat', sans-serif;
  font-size: 16px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: opacity 0.2s;
  background-color: var(--primary-green);
  color: var(--text-light);
}

.btn-certificate:hover:not(:disabled) {
  opacity: 0.9;
}

.btn-certificate:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-continue:hover,
.btn-review:hover {
  opacity: 0.9;
}

@media (max-width: 1024px) {
  .main-content {
    padding: 32px 40px;
  }

  .courses-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 24px;
  }
}

@media (max-width: 768px) {
  .main-content {
    padding: 24px 20px;
  }

  .page-title {
    font-size: 36px;
  }

  .page-subtitle {
    font-size: 18px;
  }

  .section-title {
    font-size: 24px;
  }

  .courses-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
}
</style>
