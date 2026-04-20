<script setup>
import { reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import AppHeader from '../../components/AppHeader.vue'
import AppFooter from '../../components/AppFooter.vue'
import { getAssetUrl } from '../../utils/assets'

const auth = useAuthStore()
const router = useRouter()

const form = reactive({
  gender: '',
  firstName: '',
  lastName: '',
  email: '',
  username: '',
  password: '',
  password2: '',
  phone_number: '',
  birthday: '',
  country: '',
  address: '',
  city: '',
})

const isAuthenticated = computed(() => auth.isAuthenticated)

const logout = () => {
  auth.logout()
  router.push('/')
}

const selectGender = (gender) => {
  form.gender = gender
}

// Convert date from YYYY-MM-DD to DD/MM/YYYY (avoid timezone issues)
const formatBirthday = (dateString) => {
  if (!dateString) return ''
  const parts = dateString.split('-')
  if (parts.length !== 3) return ''
  const [year, month, day] = parts
  return `${day.padStart(2,'0')}/${month.padStart(2,'0')}/${year}`
}

// Normalize phone number to E.164 for Indonesia (+62)
const normalizePhone = (phone) => {
  if (!phone) return ''
  const digits = String(phone).replace(/[^\d+]/g, '')
  if (digits.startsWith('+')) return digits
  if (digits.startsWith('0')) return `+62${digits.slice(1)}`
  if (digits.startsWith('62')) return `+${digits}`
  return `+62${digits}`
}

const onSubmit = async () => {
  // Validate password match
  if (form.password !== form.password2) {
    auth.error = 'Password tidak cocok'
    return
  }

  try {
    const fullName = `${String(form.firstName || '').trim()} ${String(form.lastName || '').trim()}`.trim().replace(/\s+/g, ' ')
    const payload = {
      full_name: fullName,
      username: form.username,
      email: form.email,
      phone: normalizePhone(form.phone_number),
      password: form.password,
      confirm_password: form.password2,
    }

    await auth.register(payload)
    router.push('/')
  } catch (e) {
    // Error ditampilkan di bawah
  }
}

// Asset URLs
const backgroundGradientSrc = getAssetUrl('1546614f57dbcbddaad5b7f9eda092ce3f610db4.png')
const bannerBgSrc = getAssetUrl('a4172cfc499709269cb30af84c815743998b654c.png')
const profilePicSrc = getAssetUrl('418ce2a6ab9bbfb81b05025a5cbf21a6e735def0.png')
const addPhotoIconSrc = getAssetUrl('189_554.svg')
const addPhotoBgSrc = getAssetUrl('6ccd223db609c590b56edaca230b879807e5948a.png')
// Radio button icons
// Selected: 189_506.svg = Male, 189_509.svg = Female  
// Unselected: 189_252.svg = unselected male, 189_253.svg = unselected female
const maleRadioSelectedSrc = getAssetUrl('189_506.svg')
const femaleRadioSelectedSrc = getAssetUrl('189_509.svg')
const maleRadioUnselectedSrc = getAssetUrl('189_252.svg')
const femaleRadioUnselectedSrc = getAssetUrl('189_253.svg')
const verifiedIconSrc = getAssetUrl('189_520.svg')
const dropdownArrowSrc = getAssetUrl('b68de90c44e40ada0ed4723e2922d3b77ad3c496.png')
const calendarIconSrc = getAssetUrl('63ef912b6bfe38e6d5bc8586f55fe1b9d46a5ac4.png')
const paperPlaneSrc = getAssetUrl('15f47f71f80b6474e00a66edd9fef321a837f795.png')
</script>

<template>
  <div class="page-wrapper" :style="{ backgroundImage: `url('${backgroundGradientSrc}')` }">
    <AppHeader :is-authenticated="isAuthenticated" :user="auth.user" @logout="logout" />

    <main class="account-section">
      <div class="banner-bg" :style="{ backgroundImage: `url('${bannerBgSrc}')` }"></div>

      <div class="container account-container">
        <aside class="profile-sidebar">
          <div class="profile-picture-wrapper">
            <img :src="profilePicSrc" alt="User profile picture" class="profile-picture" />
            <button type="button" class="add-photo-btn" aria-label="Add photo">
              <img :src="addPhotoIconSrc" alt="Add photo icon background" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%" />
              <img :src="addPhotoBgSrc" alt="Add photo icon" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%" />
            </button>
          </div>
          <h2 class="profile-name">Your Full Name</h2>
          <p class="profile-role">author</p>
          <button type="button" class="btn btn-dark">Edit Profile</button>
        </aside>

        <form class="account-form" @submit.prevent="onSubmit">
          <h1 class="form-title">Create Account</h1>

          <div class="form-grid">
             <div class="form-group">
            <label for="gender">Gender<span class="required-star">*</span></label>
            <select id="gender" v-model="form.gender" class="form-control" required>
              <option disabled value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
            <div class="form-group">
              <label for="first-name">First Name<span class="required-star">*</span></label>
              <input type="text" id="first-name" v-model="form.firstName" class="form-control" required />
            </div>

            <div class="form-group">
              <label for="last-name">Last Name<span class="required-star">*</span></label>
              <input type="text" id="last-name" v-model="form.lastName" class="form-control" required />
            </div>

            <div class="form-group">
              <label for="gmail">Gmail<span class="required-star">*</span></label>
              <div class="input-wrapper">
                <input type="email" id="gmail" v-model="form.email" class="form-control" required />
                <div class="verified-badge">
                  <img :src="verifiedIconSrc" alt="Verified icon" />
                  <span>Verified</span>
                </div>
              </div>
            </div>

            <div class="form-group">
              <label for="phone_number">Phone Number<span class="required-star">*</span></label>
              <div class="input-wrapper">
                <input type="tel" id="phone_number" v-model="form.phone_number" class="form-control phone-input" required />
                <div class="country-code-badge">
                  <span>+62</span>
                  <img :src="dropdownArrowSrc" alt="Dropdown arrow" />
                </div>
              </div>
            </div>

            <div class="form-group">
              <label for="birthday">Birthday<span class="required-star">*</span></label>
              <div class="input-wrapper">
                <input type="date" id="birthday" v-model="form.birthday" class="form-control" required />
              
              </div>
            </div>

            <div class="form-group">
              <label for="country">Country<span class="required-star">*</span></label>
              <input type="text" id="country" v-model="form.country" class="form-control" required />
            </div>

            <div class="form-group grid-full-width">
              <label for="address">Address</label>
              <input type="text" id="address" v-model="form.address" class="form-control" />
            </div>

            <div class="form-group grid-full-width">
              <label for="city">City<span class="required-star">*</span></label>
              <input type="text" id="city" v-model="form.city" class="form-control" required />
            </div>

            <div class="form-group grid-full-width">
              <label for="username">Username<span class="required-star">*</span></label>
              <input type="text" id="username" v-model="form.username" class="form-control" required />
            </div>

            <div class="form-group">
              <label for="password">Password<span class="required-star">*</span></label>
              <input type="password" id="password" v-model="form.password" class="form-control" required />
            </div>

            <div class="form-group">
              <label for="password2">Repeat Password<span class="required-star">*</span></label>
              <input type="password" id="password2" v-model="form.password2" class="form-control" required />
            </div>
          </div>

          <div class="form-actions">
            <p v-if="auth.error" class="error-message">{{ auth.error }}</p>
            <button type="submit" class="btn btn-dark" :disabled="auth.loading">
              {{ auth.loading ? 'Creating...' : 'Create' }}
            </button>
          </div>
        </form>
      </div>

      <img :src="paperPlaneSrc" alt="Paper plane decoration" class="paper-plane-deco" />
    </main>

    <AppFooter :is-authenticated="isAuthenticated" :user="auth.user" @logout="logout" />
  </div>
</template>

<style scoped>
/* Visually hide radios but tetap interaktif via label */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.radio-label {
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}


.page-wrapper {
  max-width: 100%;
  margin: 0 auto;
  position: relative;
  min-height: 100vh;
  background-size: cover;
  background-position: top center;
  background-repeat: no-repeat;
}

.container {
  width: 100%;
  padding-left: 80px;
  padding-right: 80px;
  margin-left: auto;
  margin-right: auto;
  box-sizing: border-box;
}

.btn {
  padding: 8px 24px;
  border-radius: 5px;
  font-weight: 600;
  font-size: 18px;
  text-align: center;
  border: none;
  cursor: pointer;
  font-family: 'Montserrat', sans-serif;
  transition: opacity 0.2s;
}

.btn-primary {
  background-color: var(--primary-color, #009444);
  color: var(--light-color, #ffffff);
}

.btn-dark {
  background-color: var(--dark-color, #000000);
  color: var(--light-color, #ffffff);
  border-radius: 25px;
  padding: 15px 40px;
  font-size: 18.6px;
  font-weight: 700;
}

.btn-dark:hover:not(:disabled) {
  opacity: 0.8;
}

.btn-dark:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.required-star {
  color: red;
}

.account-section {
  position: relative;
  padding-top: 158px;
  padding-bottom: 100px;
  min-height: 100vh;
  display: flex;
  align-items: flex-start;
}

.banner-bg {
  position: absolute;
  top: 0px;
  left: 0;
  width: 100%;
  height: 206px;
  background-size: cover;
  background-position: center;
  z-index: 1;
}

.account-container {
  display: flex;
  gap: 53px;
  align-items: flex-start;
  position: relative;
  z-index: 3;
}

.profile-sidebar {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding-top: 28px;
}

.profile-picture-wrapper {
  position: relative;
  width: 179px;
  height: 179px;
  margin-bottom: 13px;
}

.profile-picture {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
}

.add-photo-btn {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 44px;
  height: 44px;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
}

.add-photo-btn img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.profile-name {
  font-size: 18.6px;
  font-weight: 700;
  margin-bottom: 8px;
  font-family: 'Montserrat', sans-serif;
}

.profile-role {
  font-size: 15px;
  font-weight: 400;
  margin-bottom: 38px;
  font-family: 'Montserrat', sans-serif;
}

.account-form {
  margin-top: 48px;
  flex-grow: 1;
  position: relative;
  z-index: 3;
}

.form-title {
  font-size: 25px;
  font-weight: 600;
  margin-bottom: 14px;
  font-family: 'Montserrat', sans-serif;
}

.gender-group {
  display: flex !important;
  flex-direction: row !important;
  gap: 45px;
  margin-bottom: 28px;
  position: relative;
  z-index: 4;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  font-family: 'Montserrat', sans-serif;
  user-select: none;
}

.radio-label:hover {
  opacity: 0.8;
}

.radio-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  pointer-events: none;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 28px 42px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.form-group.grid-full-width {
  grid-column: 1 / -1;
}

.form-group label {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-gray, #808080);
  font-family: 'Montserrat', sans-serif;
}

.form-control {
  background-color: var(--input-bg, #d9d9d9);
  border: none;
  border-radius: 9px;
  height: 47px;
  padding: 0 15px;
  font-size: 14px;
  width: 100%;
  box-sizing: border-box;
  font-family: 'Montserrat', sans-serif;
}

.form-control:focus {
  outline: 2px solid var(--primary-color, #009444);
  outline-offset: 2px;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.verified-badge {
  position: absolute;
  right: 15px;
  display: flex;
  align-items: center;
  gap: 5px;
  color: var(--primary-color, #009444);
  font-size: 12px;
  font-weight: 600;
  font-family: 'Montserrat', sans-serif;
  pointer-events: none;
}

.verified-badge img {
  width: 18px;
  height: 18px;
}

.country-code-badge {
  position: absolute;
  left: 8px;
  top: 50%;
  transform: translateY(-50%);
  background-color: var(--light-color, #ffffff);
  border-radius: 5px;
  padding: 5px 8px;
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 15px;
  font-weight: 600;
  font-family: 'Montserrat', sans-serif;
  pointer-events: none;
}

.country-code-badge img {
  width: 18px;
  height: 19px;
}

.phone-input {
  padding-left: 85px;
}

.input-icon {
  position: absolute;
  right: 0;
  top: 0;
  height: 100%;
  width: auto;
  pointer-events: none;
}

.form-actions {
  margin-top: 17px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;
}

.error-message {
  color: #ff0000;
  font-size: 14px;
  font-weight: 600;
  margin: 0;
  font-family: 'Montserrat', sans-serif;
}

.paper-plane-deco {
  position: absolute;
  left: 80px;
  bottom: 100px;
  width: 116px;
  transform: rotate(157.26deg);
  z-index: 0;
}

@media (max-width: 1200px) {
  .container {
    padding-left: 40px;
    padding-right: 40px;
  }

  .account-container {
    flex-direction: column;
    align-items: center;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .form-group.grid-full-width {
    grid-column: auto;
  }

  .form-actions {
    justify-content: center;
  }

  .paper-plane-deco {
    display: none;
  }
}

@media (max-width: 768px) {
  .container {
    padding-left: 20px;
    padding-right: 20px;
  }

  .gender-group {
    gap: 24px;
  }

  .form-grid {
    gap: 20px;
  }
}
</style>
