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
            @input="onSearchInput"
          />
        </div>

        <!-- Search Results -->
        <div v-if="searchResults.length > 0" class="results-section">
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
        <div v-else-if="searchQuery && !searching" class="no-results">
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
import { searchUsersByNickname, getCouponTransferHistory, transferCoupon } from '@/services/catalyst'
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

const { catalystRowId } = useUser()

// State
const searchQuery = ref('')
const searchResults = ref([])
const selectedUser = ref(null)
const loading = ref(false)
const searching = ref(false)
const error = ref(null)
const success = ref(false)
const couponOrigin = ref('Caricamento...')

let searchTimeout = null

// Load coupon origin on mount
onMounted(async () => {
  try {
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

// Search users with debounce
const onSearchInput = () => {
  if (searchTimeout) clearTimeout(searchTimeout)

  if (!searchQuery.value || searchQuery.value.trim().length < 2) {
    searchResults.value = []
    return
  }

  searching.value = true

  searchTimeout = setTimeout(async () => {
    try {
      const results = await searchUsersByNickname(searchQuery.value.trim())
      // Filter out current user
      searchResults.value = results.filter(u => u.rowId !== catalystRowId.value)
      searching.value = false
    } catch (err) {
      console.error('Error searching users:', err)
      searchResults.value = []
      searching.value = false
    }
  }, 300)
}

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

    // Close modal after 1.5s
    setTimeout(() => {
      emit('transferred')
      close()
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
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
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
  padding: 1.5rem;
}

.coupon-info {
  background: #f9fafb;
  padding: 1rem;
  border-radius: 6px;
  margin-bottom: 1.5rem;
}

.coupon-code {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.coupon-amount {
  font-size: 1.25rem;
  color: #10b981;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.coupon-origin {
  font-size: 0.875rem;
  color: #6b7280;
}

.search-section {
  margin-bottom: 1rem;
}

.search-section label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: #374151;
}

.search-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.95rem;
}

.search-input:focus {
  outline: none;
  border-color: #10b981;
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

.no-results {
  padding: 2rem;
  text-align: center;
  color: #6b7280;
  font-size: 0.95rem;
}

.selected-section {
  margin-bottom: 1rem;
}

.selected-section label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: #374151;
}

.selected-user {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: #ecfdf5;
  border: 1px solid #10b981;
  border-radius: 6px;
}

.selected-user span {
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
  gap: 0.75rem;
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.btn-secondary,
.btn-primary {
  flex: 1;
  padding: 0.75rem;
  border-radius: 6px;
  font-size: 0.95rem;
  font-weight: 500;
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