<template>
  <div class="profile-container">
    <!-- Header -->
    <div class="profile-header">
      <button class="back-button" @click="$router.push('/dashboard')">
        <span class="icon">←</span>
        Torna alla Dashboard
      </button>
      <h1 class="page-title">PROFILO UTENTE</h1>
      <p class="subtitle">Gestisci il tuo profilo e personalizza la tua esperienza</p>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Caricamento profilo...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-banner">
      <span class="error-icon">⚠️</span>
      <div class="error-content">
        <strong>Errore nel caricamento del profilo</strong>
        <p>{{ error }}</p>
      </div>
    </div>

    <!-- Profile Content -->
    <div v-else class="profile-content">
      <!-- Editable User Profile -->
      <div class="edit-section">
        <h2 class="section-title">INFORMAZIONI PROFILO</h2>
        <p class="section-description">Personalizza il tuo profilo pubblico</p>

        <form @submit.prevent="handleSaveProfile" class="edit-form">
          <!-- Avatar Upload -->
          <div class="form-group avatar-group">
            <label>Avatar</label>

            <!-- Preview -->
            <div class="avatar-preview-container">
              <div class="avatar-preview">
                <img
                  v-if="avatarPreview || currentAvatarUrl"
                  :src="avatarPreview || currentAvatarUrl"
                  alt="Avatar preview"
                  class="avatar-image"
                />
                <div v-else class="avatar-placeholder">
                  <span class="avatar-placeholder-icon">👤</span>
                </div>
              </div>
            </div>

            <!-- Input file -->
            <input
              id="avatar"
              type="file"
              accept="image/jpeg,image/png"
              @change="handleFileChange"
              class="file-input"
              ref="fileInput"
            />

            <div class="file-hints">
              <p>📐 Dimensioni consigliate: 200x200px</p>
              <p>📁 Formati supportati: JPEG, PNG (max 5MB)</p>
              <p>🔄 L'immagine verrà ridimensionata automaticamente</p>
            </div>

            <button
              v-if="avatarPreview"
              type="button"
              class="button button-remove"
              @click="removeAvatar"
            >
              Rimuovi nuova immagine
            </button>
          </div>

          <!-- Nome visualizzato -->
          <div class="form-group">
            <label for="displayName">Nome Visualizzato *</label>
            <input
              id="displayName"
              v-model="formData.name"
              type="text"
              placeholder="Es: Mario Rossi"
              class="form-input"
              required
            />
            <span class="field-hint">Questo è il nome che verrà mostrato agli altri utenti</span>
          </div>

          <!-- Nickname (univoco) -->
          <div class="form-group">
            <label for="nickname">Nickname *</label>
            <input
              id="nickname"
              v-model="formData.nickname"
              type="text"
              placeholder="Es: mariorossi"
              class="form-input"
              required
              pattern="^[a-zA-Z0-9_-]{3,20}$"
            />
            <span class="field-hint unique-hint">
              ⚠️ Deve essere univoco (3-20 caratteri, solo lettere, numeri, _ e -)
            </span>
            <span v-if="nicknameError" class="error-hint">{{ nicknameError }}</span>
          </div>

          <!-- Action Buttons -->
          <div class="form-actions">
            <button
              type="button"
              class="button button-secondary"
              @click="resetForm"
              :disabled="isSaving"
            >
              Annulla
            </button>
            <button
              type="submit"
              class="button button-primary"
              :disabled="isSaving"
            >
              <span v-if="isSaving">Salvataggio...</span>
              <span v-else>Salva Modifiche</span>
            </button>
          </div>
        </form>

        <!-- Success Message -->
        <div v-if="successMessage" class="success-banner">
          <span class="success-icon">✓</span>
          <span>{{ successMessage }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuth0 } from '@auth0/auth0-vue'
import axios from 'axios'

const { user, getAccessTokenSilently } = useAuth0()

// State
const isLoading = ref(false)
const isSaving = ref(false)
const error = ref(null)
const successMessage = ref('')
const nicknameError = ref('')

// Form data - nuovo formato
const formData = ref({
  name: '',
  nickname: '',
  avatar: null
})

// Avatar state
const avatarPreview = ref(null)
const currentAvatarUrl = ref(null)
const fileInput = ref(null)

// Load user data from Catalyst
const loadUserMetadata = async () => {
  try {
    isLoading.value = true
    error.value = null

    // 1. Get catalystRowId from Auth0 (SOLO questo!)
    const token = await getAccessTokenSilently({
      authorizationParams: {
        audience: 'https://dev-giylww0unln6dunq.eu.auth0.com/api/v2/',
        scope: 'read:current_user'
      }
    })

    const auth0Response = await axios.get(
      `https://dev-giylww0unln6dunq.eu.auth0.com/api/v2/users/${user.value.sub}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )

    const catalystRowId = auth0Response.data.user_metadata?.catalystRowId

    if (!catalystRowId) {
      throw new Error('catalystRowId non trovato in Auth0. Contatta il supporto.')
    }

    // 2. Fetch user data from Catalyst DB
    const catalystResponse = await axios.post(
      'https://calciodomains-20105566495.development.catalystserverless.eu/server/get_user_data',
      { catalystRowId }
    )

    // Parse response (Catalyst wraps in "output")
    const parsedData = catalystResponse.data.output
      ? (typeof catalystResponse.data.output === 'string'
          ? JSON.parse(catalystResponse.data.output)
          : catalystResponse.data.output)
      : catalystResponse.data

    if (!parsedData.success) {
      throw new Error(parsedData.error || 'Errore nel caricamento dati')
    }

    const userData = parsedData.data

    // 3. Populate form with Catalyst data
    formData.value = {
      name: userData.name || '',
      nickname: userData.nickname || '',
      avatar: null
    }

    // 4. Load avatar if exists
    if (userData.avatar_file_id) {
      currentAvatarUrl.value = `https://calciodomains-20105566495.development.catalystserverless.eu/server/get_avatar?rowId=${catalystRowId}&t=${Date.now()}`
    }

  } catch (err) {
    console.error('Error loading user data:', err)
    error.value = err.response?.data?.error || err.message || 'Impossibile caricare i dati del profilo'
  } finally {
    isLoading.value = false
  }
}

// Handle file change (avatar upload)
const handleFileChange = (event) => {
  const file = event.target.files[0]

  if (!file) return

  // Validazione tipo file
  const validTypes = ['image/jpeg', 'image/png']
  if (!validTypes.includes(file.type)) {
    error.value = 'Formato file non valido. Usa JPEG o PNG.'
    if (fileInput.value) {
      fileInput.value.value = ''
    }
    return
  }

  // Validazione dimensione (max 5MB)
  const maxSize = 5 * 1024 * 1024 // 5MB
  if (file.size > maxSize) {
    error.value = 'File troppo grande. Dimensione massima: 5MB.'
    if (fileInput.value) {
      fileInput.value.value = ''
    }
    return
  }

  // Salva file
  formData.value.avatar = file
  error.value = null

  // Crea preview
  const reader = new FileReader()
  reader.onload = (e) => {
    avatarPreview.value = e.target.result
  }
  reader.readAsDataURL(file)
}

// Remove avatar preview
const removeAvatar = () => {
  formData.value.avatar = null
  avatarPreview.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

// Update user profile - NEW LOGIC
const handleSaveProfile = async () => {
  try {
    isSaving.value = true
    error.value = null
    successMessage.value = ''
    nicknameError.value = ''

    // 1. Get catalystRowId from Auth0
    const token = await getAccessTokenSilently({
      authorizationParams: {
        audience: 'https://dev-giylww0unln6dunq.eu.auth0.com/api/v2/',
        scope: 'read:current_user'
      }
    })

    const auth0Response = await axios.get(
      `https://dev-giylww0unln6dunq.eu.auth0.com/api/v2/users/${user.value.sub}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )

    const catalystRowId = auth0Response.data.user_metadata?.catalystRowId

    if (!catalystRowId) {
      throw new Error('catalystRowId non trovato. Contatta il supporto.')
    }

    // 2. Prepare FormData for file upload
    const formDataToSend = new FormData()
    formDataToSend.append('catalystRowId', catalystRowId)
    formDataToSend.append('name', formData.value.name)
    formDataToSend.append('nickname', formData.value.nickname)

    if (formData.value.avatar) {
      formDataToSend.append('avatar', formData.value.avatar)
    }

    // 3. Send to Catalyst update_user (advancedIO)
    const updateResponse = await axios.post(
      'https://calciodomains-20105566495.development.catalystserverless.eu/server/update_user_catalyst',
      formDataToSend,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    )

    // Parse response
    const result = updateResponse.data

    if (!result.success) {
      // Check se errore è nickname già esistente
      if (result.error && result.error.includes('nickname')) {
        nicknameError.value = 'Questo nickname è già in uso. Scegline un altro.'
        return
      }
      throw new Error(result.error || 'Errore durante aggiornamento')
    }

    successMessage.value = 'Profilo aggiornato con successo!'

    // Refresh avatar preview se caricato
    if (result.data && result.data.avatar_url) {
      currentAvatarUrl.value = `https://calciodomains-20105566495.development.catalystserverless.eu${result.data.avatar_url}&t=${Date.now()}`
      avatarPreview.value = null
      formData.value.avatar = null
      if (fileInput.value) {
        fileInput.value.value = ''
      }
    }

    // Hide success message after 3 seconds
    setTimeout(() => {
      successMessage.value = ''
    }, 3000)

  } catch (err) {
    console.error('Error updating profile:', err)
    error.value = err.response?.data?.error || err.message || 'Impossibile salvare le modifiche'
  } finally {
    isSaving.value = false
  }
}

// Reset form to original values
const resetForm = () => {
  loadUserMetadata()
  avatarPreview.value = null
  nicknameError.value = ''
  successMessage.value = ''
  error.value = null

  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

// Load metadata on mount
onMounted(() => {
  loadUserMetadata()
})
</script>

<style scoped>
.profile-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
}

/* Header */
.profile-header {
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.back-button {
  background: white;
  border: 1px solid #e5e7eb;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #1a1a1a;
  margin-bottom: 1rem;
  transition: all 0.2s ease;
}

.back-button:hover {
  background: #f9fafb;
  border-color: #d1d5db;
}

.back-button .icon {
  font-size: 1.2rem;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 0.25rem 0;
}

.subtitle {
  color: #6b7280;
  margin: 0;
  font-size: 0.95rem;
}

/* Loading State */
.loading-state {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
}

.spinner {
  width: 40px;
  height: 40px;
  margin: 0 auto 1rem;
  border: 3px solid #e5e7eb;
  border-top-color: #1a1a1a;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Error Banner */
.error-banner {
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 4px;
  padding: 1rem 1.25rem;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 2rem;
}

.error-icon {
  font-size: 1.25rem;
  flex-shrink: 0;
}

.error-content {
  flex: 1;
}

.error-content strong {
  display: block;
  color: #991b1b;
  margin-bottom: 0.25rem;
}

.error-content p {
  color: #7f1d1d;
  margin: 0;
  font-size: 0.875rem;
}

/* Success Banner */
.success-banner {
  background: #f0fdf4;
  border: 1px solid #86efac;
  border-radius: 4px;
  padding: 1rem 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 1rem;
  color: #166534;
  font-weight: 500;
}

.success-icon {
  font-size: 1.25rem;
  flex-shrink: 0;
}

/* Sections */
.info-section,
.edit-section {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 0.5rem 0;
  letter-spacing: 0.025em;
}

.section-description {
  color: #6b7280;
  font-size: 0.875rem;
  margin: 0 0 1.5rem 0;
}

/* Info Grid */
.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.25rem;
}

.info-item {
  position: relative;
}

.info-item label {
  display: block;
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
}

.info-value {
  font-size: 1rem;
  color: #1a1a1a;
  padding: 0.5rem 0;
}

.verified-badge {
  display: inline-block;
  margin-top: 0.5rem;
  padding: 0.25rem 0.5rem;
  background: #d1fae5;
  color: #065f46;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 4px;
}

.unverified-badge {
  display: inline-block;
  margin-top: 0.5rem;
  padding: 0.25rem 0.5rem;
  background: #fee2e2;
  color: #991b1b;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 4px;
}

/* Form */
.edit-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #1a1a1a;
  margin-bottom: 0.5rem;
}

.form-input {
  padding: 0.625rem 0.875rem;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  font-size: 0.95rem;
  color: #1a1a1a;
  transition: all 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: #1a1a1a;
  background: #fafafa;
}

.form-input::placeholder {
  color: #9ca3af;
}

/* Field hints */
.field-hint {
  font-size: 0.8rem;
  color: #6b7280;
  margin-top: 0.25rem;
  display: block;
}

.unique-hint {
  color: #f59e0b;
  font-weight: 500;
}

.error-hint {
  color: #dc2626;
  font-size: 0.8rem;
  margin-top: 0.25rem;
  display: block;
  font-weight: 500;
}

/* Avatar Upload */
.avatar-group {
  padding: 1rem;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.avatar-preview-container {
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
}

.avatar-preview {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid #e5e7eb;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
}

.avatar-placeholder-icon {
  font-size: 4rem;
  opacity: 0.3;
}

/* File input */
.file-input {
  display: block;
  width: 100%;
  padding: 0.75rem;
  border: 2px dashed #d1d5db;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
  background: white;
}

.file-input:hover {
  border-color: #1a1a1a;
  background: #fafafa;
}

.file-input::-webkit-file-upload-button {
  padding: 0.5rem 1rem;
  background: #1a1a1a;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  margin-right: 1rem;
}

.file-input::-webkit-file-upload-button:hover {
  background: #000000;
}

.file-hints {
  margin-top: 0.75rem;
  padding: 0.75rem;
  background: white;
  border-radius: 4px;
  border: 1px solid #e5e7eb;
}

.file-hints p {
  margin: 0.25rem 0;
  font-size: 0.8rem;
  color: #6b7280;
}

.button-remove {
  background: #ef4444;
  color: white;
  margin-top: 0.75rem;
  width: 100%;
  border: none;
}

.button-remove:hover:not(:disabled) {
  background: #dc2626;
}

/* Form Actions */
.form-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.button {
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.button-secondary {
  background: white;
  border-color: #e5e7eb;
  color: #1a1a1a;
}

.button-secondary:hover:not(:disabled) {
  background: #f9fafb;
  border-color: #d1d5db;
}

.button-primary {
  background: #1a1a1a;
  color: white;
}

.button-primary:hover:not(:disabled) {
  background: #000000;
}

/* Responsive */
@media (max-width: 768px) {
  .profile-container {
    padding: 1rem;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
  }

  .button {
    width: 100%;
  }
}
</style>