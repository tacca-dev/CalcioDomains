<template>
  <div class="modal-overlay" @click.self="close">
    <div class="modal-content">
      <!-- Header -->
      <div class="modal-header">
        <h2>Trasferisci Coupon</h2>
        <button class="btn-close" @click="close">×</button>
      </div>

      <!-- Body -->
      <div class="modal-body">
        <!-- Coupon Info -->
        <div class="coupon-info">
          <div class="coupon-code">{{ coupon.couponCode }}</div>
          <div class="coupon-amount">{{ coupon.amount.toFixed(2) }} €</div>
          <div class="coupon-origin">
            {{ couponOrigin }}
          </div>
        </div>

        <!-- Search -->
        <div class="search-section">
          <label>Cerca destinatario:</label>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Scrivi il nickname..."
            class="search-input"
            :disabled="loadingUsers"
          />
        </div>

        <!-- Loading users -->
        <div v-if="loadingUsers" class="loading-state">
          Caricamento utenti...
        </div>

        <!-- Search Results -->
        <div v-else-if="searchResults.length > 0" class="results-section">
          <div
            v-for="user in searchResults"
            :key="user.rowId"
            class="user-result"
            :class="{ selected: selectedUser?.rowId === user.rowId }"
            @click="selectUser(user)"
          >
            <div class="user-info">
              <div class="user-nickname">@{{ user.nickname }}</div>
              <div class="user-email">{{ user.email }}</div>
            </div>
            <div class="user-action">
              {{ selectedUser?.rowId === user.rowId ? '✓' : '→' }}
            </div>
          </div>
        </div>

        <!-- No results -->
        <div v-else-if="searchQuery && searchQuery.trim().length >= 2" class="no-results">
          Nessun utente trovato
        </div>

        <!-- Selected User -->
        <div v-if="selectedUser" class="selected-section">
          <label>Destinatario selezionato:</label>
          <div class="selected-user">
            <span>@{{ selectedUser.nickname }}</span>
            <button class="btn-remove" @click="selectedUser = null">×</button>
          </div>
        </div>

        <!-- Error -->
        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <!-- Success -->
        <div v-if="success" class="success-message">
          ✓ Coupon trasferito con successo!
        </div>
      </div>

      <!-- Footer -->
      <div class="modal-footer">
        <button class="btn-secondary" @click="close" :disabled="loading">
          Annulla
        </button>
        <button
          class="btn-primary"
          @click="handleTransfer"
          :disabled="!selectedUser || loading || success"
        >
          {{ loading ? 'Trasferimento...' : 'Trasferisci' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getAllUsers, getCouponTransferHistory, transferCoupon } from '@/services/catalyst'
import { useUser } from '@/composables/useUser'

const props = defineProps({
  coupon: {
    type: Object,
    required: true
  },
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'transferred'])

const router = useRouter()
const { catalystRowId } = useUser()

// State
const searchQuery = ref('')
const allUsers = ref([])
const selectedUser = ref(null)
const loading = ref(false)
const loadingUsers = ref(true)
const error = ref(null)
const success = ref(false)
const couponOrigin = ref('Caricamento...')

// Computed: filtered users based on search query
const searchResults = computed(() => {
  if (!searchQuery.value || searchQuery.value.trim().length < 2) {
    return []
  }

  const query = searchQuery.value.trim().toLowerCase()

  return allUsers.value
    .filter(u => {
      // Escludi l'utente corrente
      if (u.rowId === catalystRowId.value) return false

      // Cerca nel nickname
      return u.nickname.toLowerCase().includes(query)
    })
    .slice(0, 10) // Limita a 10 risultati
})

// Load all users and coupon origin on mount
onMounted(async () => {
  try {
    // Carica tutti gli utenti
    const users = await getAllUsers()
    allUsers.value = users
    loadingUsers.value = false
    console.log('✅ Caricati', users.length, 'utenti')
  } catch (err) {
    console.error('Error loading users:', err)
    loadingUsers.value = false
    error.value = 'Impossibile caricare gli utenti'
  }

  try {
    // Carica storia del coupon
    const history = await getCouponTransferHistory(props.coupon.id)
    if (history) {
      couponOrigin.value = `Ricevuto da @${history.fromNickname}`
    } else {
      couponOrigin.value = 'Ottenuto tramite ricarica'
    }
  } catch (err) {
    console.error('Error loading coupon history:', err)
    couponOrigin.value = 'Origine sconosciuta'
  }
})

// Select user
const selectUser = (user) => {
  selectedUser.value = user
  error.value = null
}

// Transfer coupon
const handleTransfer = async () => {
  if (!selectedUser.value) return

  error.value = null
  loading.value = true

  try {
    await transferCoupon(
      props.coupon.id,
      catalystRowId.value,
      selectedUser.value.rowId
    )

    success.value = true

    // Close modal and redirect to dashboard after 1.5s
    setTimeout(() => {
      emit('transferred')
      close()
      // Navigate to dashboard with force reload
      router.push('/dashboard').then(() => {
        window.location.reload()
      })
    }, 1500)
  } catch (err) {
    error.value = err.message || 'Errore durante il trasferimento'
    loading.value = false
  }
}

// Close modal
const close = () => {
  if (loading.value) return
  emit('update:modelValue', false)
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #1a1a1a;
}

.btn-close {
  background: none;
  border: none;
  font-size: 2rem;
  line-height: 1;
  cursor: pointer;
  padding: 0;
  color: #6b7280;
}

.btn-close:hover {
  color: #1a1a1a;
}

.modal-body {
  padding: 2rem;
}

.coupon-info {
  background: linear-gradient(135deg, #f9fafb 0%, #ecfdf5 100%);
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  border: 1px solid #e5e7eb;
}

.coupon-code {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #1a1a1a;
}

.coupon-amount {
  font-size: 1.75rem;
  color: #10b981;
  font-weight: 700;
  margin-bottom: 0.75rem;
}

.coupon-origin {
  font-size: 0.95rem;
  color: #6b7280;
  font-style: italic;
}

.search-section {
  margin-bottom: 1.5rem;
}

.search-section label {
  display: block;
  font-size: 0.95rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: #1a1a1a;
}

.search-input {
  width: 100%;
  padding: 1rem;
  border: 2px solid #d1d5db;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.results-section {
  max-height: 250px;
  overflow-y: auto;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  margin-bottom: 1rem;
}

.user-result {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e5e7eb;
  cursor: pointer;
  transition: background 0.2s;
}

.user-result:last-child {
  border-bottom: none;
}

.user-result:hover {
  background: #f9fafb;
}

.user-result.selected {
  background: #ecfdf5;
}

.user-nickname {
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.user-email {
  font-size: 0.875rem;
  color: #6b7280;
}

.user-action {
  font-size: 1.25rem;
  color: #10b981;
}

.loading-state {
  padding: 2rem;
  text-align: center;
  color: #6b7280;
  font-size: 0.95rem;
}

.no-results {
  padding: 2rem;
  text-align: center;
  color: #6b7280;
  font-size: 0.95rem;
}

.selected-section {
  margin-bottom: 1.5rem;
}

.selected-section label {
  display: block;
  font-size: 0.95rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: #1a1a1a;
}

.selected-user {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  background: #ecfdf5;
  border: 2px solid #10b981;
  border-radius: 8px;
}

.selected-user span {
  font-size: 1.05rem;
  font-weight: 600;
  color: #10b981;
}

.btn-remove {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6b7280;
  padding: 0;
  line-height: 1;
}

.btn-remove:hover {
  color: #ef4444;
}

.error-message {
  padding: 0.75rem;
  background: #fee2e2;
  color: #dc2626;
  border-radius: 6px;
  margin-bottom: 1rem;
  font-size: 0.875rem;
}

.success-message {
  padding: 0.75rem;
  background: #d1fae5;
  color: #065f46;
  border-radius: 6px;
  margin-bottom: 1rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.modal-footer {
  display: flex;
  gap: 1rem;
  padding: 2rem;
  border-top: 1px solid #e5e7eb;
}

.btn-secondary,
.btn-primary {
  flex: 1;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
}

.btn-secondary:hover:not(:disabled) {
  background: #e5e7eb;
}

.btn-primary {
  background: #10b981;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #059669;
}

.btn-primary:disabled,
.btn-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>