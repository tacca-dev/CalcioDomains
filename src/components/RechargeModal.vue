<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <!-- Header -->
      <div class="modal-header">
        <h2 class="modal-title">⚡ Ricarica Crediti</h2>
        <button class="close-button" @click="$emit('close')" aria-label="Chiudi">
          ×
        </button>
      </div>

      <!-- Body -->
      <div class="modal-body">
        <p class="modal-description">
          Seleziona il taglio di ricarica
          <span v-if="firstRechargeBonusAvailable" class="bonus-note">• Prima ricarica: +50% bonus</span>
          <span v-else class="bonus-note">• Bonus progressivi: 5%-20% in base all'importo</span>
        </p>

        <!-- Packages list -->
        <div class="packages-list">
          <label
            v-for="pkg in packages"
            :key="pkg.amount"
            class="package-option"
            :class="{ selected: selectedPackage?.amount === pkg.amount }"
          >
            <input
              type="radio"
              name="package"
              :value="pkg"
              v-model="selectedPackage"
              class="package-radio"
            />
            <div class="package-content">
              <div class="package-amount">{{ pkg.amount.toLocaleString('it-IT') }} €</div>
              <div class="package-info">
                {{ pkg.amount.toLocaleString('it-IT') }} € crediti
                <span v-if="getBonusAmount(pkg.amount) > 0" class="bonus-badge">
                  + {{ getBonusAmount(pkg.amount).toLocaleString('it-IT') }} € coupon (+{{ getBonusPercentage(pkg.amount) }}%)
                </span>
              </div>
            </div>
          </label>
        </div>
      </div>

      <!-- Footer -->
      <div class="modal-footer">
        <button class="button-secondary" @click="$emit('close')">
          Annulla
        </button>
        <button
          class="button-primary"
          @click="handleProceed"
          :disabled="!selectedPackage || loading"
        >
          {{ loading ? 'Caricamento...' : 'Procedi al pagamento →' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useUser } from '@/composables/useUser'

// Emits
const emit = defineEmits(['close', 'recharge'])

// User data (to check first recharge bonus eligibility)
const { firstRechargeBonusAvailable } = useUser()

// State
const selectedPackage = ref(null)
const couponCode = ref('')
const loading = ref(false)

// Available packages
const packages = [
  { amount: 500 },
  { amount: 1000 },
  { amount: 2500 },
  { amount: 5000 },
  { amount: 10000 }
]

// Get bonus percentage for display
const getBonusPercentage = (amount) => {
  if (firstRechargeBonusAvailable.value) {
    return 50
  }

  const bonusPercentages = {
    500: 0,
    1000: 5,
    2500: 10,
    5000: 15,
    10000: 20
  }

  return bonusPercentages[amount] || 0
}

// Calculate bonus amount based on recharge amount and user status
const getBonusAmount = (amount) => {
  const percentage = getBonusPercentage(amount)
  return amount * (percentage / 100)
}

// Handle proceed to payment
const handleProceed = () => {
  if (!selectedPackage.value) return

  loading.value = true
  emit('recharge', {
    amount: selectedPackage.value.amount,
    coupon: couponCode.value || null
  })
}
</script>

<style scoped>
/* Modal overlay */
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
  padding: 1rem;
}

/* Modal content */
.modal-content {
  background: white;
  border-radius: 8px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

/* Header */
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.close-button {
  background: none;
  border: none;
  font-size: 2rem;
  line-height: 1;
  color: #6b7280;
  cursor: pointer;
  padding: 0;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.close-button:hover {
  background: #f3f4f6;
  color: #1a1a1a;
}

/* Body */
.modal-body {
  padding: 1.5rem;
}

.modal-description {
  font-size: 0.95rem;
  color: #6b7280;
  margin: 0 0 1.5rem 0;
}

.bonus-note {
  color: #10b981;
  font-weight: 500;
}

/* Packages list */
.packages-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.package-option {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: white;
}

.package-option:hover {
  border-color: #d1d5db;
  background: #f9fafb;
}

.package-option.selected {
  border-color: #10b981;
  background: #ecfdf5;
}

.package-radio {
  appearance: none;
  width: 1.25rem;
  height: 1.25rem;
  border: 2px solid #d1d5db;
  border-radius: 50%;
  cursor: pointer;
  position: relative;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.package-radio:checked {
  border-color: #10b981;
  background: #10b981;
}

.package-radio:checked::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 0.5rem;
  height: 0.5rem;
  background: white;
  border-radius: 50%;
}

.package-content {
  flex: 1;
}

.package-amount {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 0.25rem;
}

.package-info {
  font-size: 0.875rem;
  color: #6b7280;
}

.bonus-badge {
  display: inline-block;
  color: #10b981;
  font-weight: 600;
  margin-left: 0.25rem;
}

/* Footer */
.modal-footer {
  display: flex;
  gap: 0.75rem;
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.button-secondary,
.button-primary {
  flex: 1;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.button-secondary {
  background: white;
  color: #6b7280;
  border: 1px solid #e5e7eb;
}

.button-secondary:hover {
  background: #f9fafb;
  border-color: #d1d5db;
}

.button-primary {
  background: #10b981;
  color: white;
  border: 1px solid #10b981;
}

.button-primary:hover:not(:disabled) {
  background: #059669;
  border-color: #059669;
}

.button-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Responsive */
@media (max-width: 640px) {
  .modal-content {
    max-height: 100vh;
    border-radius: 0;
  }

  .modal-footer {
    flex-direction: column-reverse;
  }

  .button-secondary,
  .button-primary {
    width: 100%;
  }
}
</style>