<template>
  <div class="profile-container">
    <!-- Header -->
    <div class="profile-header">
      <button class="back-button" @click="$router.push('/dashboard')">
        <span class="icon">←</span>
        Torna alla Dashboard
      </button>
      <h1 class="page-title">PROFILO UTENTE</h1>
      <p class="subtitle">Visualizza e modifica le tue informazioni personali</p>
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
      <!-- Read-only Auth0 Info -->
      <div class="info-section">
        <h2 class="section-title">INFORMAZIONI ACCOUNT</h2>
        <p class="section-description">Questi dati sono gestiti da Auth0 e non possono essere modificati da qui</p>

        <div class="info-grid">
          <div class="info-item">
            <label>Email</label>
            <div class="info-value">{{ user?.email || 'Non disponibile' }}</div>
            <span v-if="user?.email_verified" class="verified-badge">✓ Verificata</span>
            <span v-else class="unverified-badge">✗ Non verificata</span>
          </div>

          <div class="info-item">
            <label>Nome</label>
            <div class="info-value">{{ user?.name || 'Non disponibile' }}</div>
          </div>

          <div class="info-item">
            <label>Nickname</label>
            <div class="info-value">{{ user?.nickname || 'Non disponibile' }}</div>
          </div>

          <div class="info-item">
            <label>Ultimo Accesso</label>
            <div class="info-value">{{ formatDate(user?.updated_at) }}</div>
          </div>
        </div>
      </div>

      <!-- Editable User Metadata -->
      <div class="edit-section">
        <h2 class="section-title">INFORMAZIONI PERSONALIZZATE</h2>
        <p class="section-description">Questi campi puoi modificarli liberamente</p>

        <form @submit.prevent="handleSaveProfile" class="edit-form">
          <div class="form-group">
            <label for="firstName">Nome</label>
            <input
              id="firstName"
              v-model="formData.firstName"
              type="text"
              placeholder="Inserisci il tuo nome"
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label for="lastName">Cognome</label>
            <input
              id="lastName"
              v-model="formData.lastName"
              type="text"
              placeholder="Inserisci il tuo cognome"
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label for="phone">Telefono</label>
            <input
              id="phone"
              v-model="formData.phone"
              type="tel"
              placeholder="+39 123 456 7890"
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label for="company">Azienda (opzionale)</label>
            <input
              id="company"
              v-model="formData.company"
              type="text"
              placeholder="Nome azienda"
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label for="country">Paese</label>
            <select id="country" v-model="formData.country" class="form-input">
              <option value="">Seleziona paese</option>
              <option value="IT">Italia</option>
              <option value="CH">Svizzera</option>
              <option value="FR">Francia</option>
              <option value="DE">Germania</option>
              <option value="ES">Spagna</option>
              <option value="other">Altro</option>
            </select>
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

// Form data
const formData = ref({
  firstName: '',
  lastName: '',
  phone: '',
  company: '',
  country: ''
})

// Format date helper
const formatDate = (dateString) => {
  if (!dateString) return 'Non disponibile'
  const date = new Date(dateString)
  return date.toLocaleDateString('it-IT', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Load user metadata
const loadUserMetadata = async () => {
  try {
    isLoading.value = true
    error.value = null

    // Get Management API token
    const token = await getAccessTokenSilently({
      authorizationParams: {
        audience: 'https://dev-giylww0unln6dunq.eu.auth0.com/api/v2/',
        scope: 'read:current_user'
      }
    })

    // Fetch full user profile with metadata
    const response = await axios.get(
      `https://dev-giylww0unln6dunq.eu.auth0.com/api/v2/users/${user.value.sub}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )

    // Load existing metadata into form
    const metadata = response.data.user_metadata || {}
    formData.value = {
      firstName: metadata.firstName || '',
      lastName: metadata.lastName || '',
      phone: metadata.phone || '',
      company: metadata.company || '',
      country: metadata.country || ''
    }
  } catch (err) {
    console.error('Error loading user metadata:', err)
    error.value = err.response?.data?.message || 'Impossibile caricare i dati del profilo'
  } finally {
    isLoading.value = false
  }
}

// Update user profile
const handleSaveProfile = async () => {
  try {
    isSaving.value = true
    error.value = null
    successMessage.value = ''

    // Get Management API token with update scope
    const token = await getAccessTokenSilently({
      authorizationParams: {
        audience: 'https://dev-giylww0unln6dunq.eu.auth0.com/api/v2/',
        scope: 'update:current_user_metadata'
      }
    })

    // Update user metadata
    await axios.patch(
      `https://dev-giylww0unln6dunq.eu.auth0.com/api/v2/users/${user.value.sub}`,
      {
        user_metadata: formData.value
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    )

    successMessage.value = 'Profilo aggiornato con successo!'

    // Hide success message after 3 seconds
    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
  } catch (err) {
    console.error('Error updating profile:', err)
    error.value = err.response?.data?.message || 'Impossibile salvare le modifiche'
  } finally {
    isSaving.value = false
  }
}

// Reset form to original metadata values
const resetForm = () => {
  loadUserMetadata()
  successMessage.value = ''
  error.value = null
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