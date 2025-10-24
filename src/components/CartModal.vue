<template>
  <!-- Overlay -->
  <Transition name="fade">
    <div v-if="showCartModal" class="modal-overlay" @click="toggleCartModal"></div>
  </Transition>

  <!-- Modal -->
  <Transition name="slide">
    <div v-if="showCartModal" class="modal-container">
      <div class="modal-header">
        <h2 class="modal-title">Carrello ({{ cartCount }})</h2>
        <button class="close-button" @click="toggleCartModal" aria-label="Chiudi carrello">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <div class="modal-body">
        <!-- Empty cart state -->
        <div v-if="cartItems.length === 0" class="empty-cart">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="empty-icon"
          >
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
          <p>Il tuo carrello è vuoto</p>
        </div>

        <!-- Cart items -->
        <div v-else class="cart-items">
          <div v-for="item in cartItems" :key="item.id" class="cart-item">
            <div class="item-info">
              <span class="item-domain">{{ item.domain_name }}</span>
              <span class="item-category">{{ item.category }}</span>
            </div>
            <div class="item-actions">
              <span class="item-price">${{ item.price.toFixed(2) }}</span>
              <button
                class="remove-button"
                @click="removeFromCart(item.domain_name)"
                aria-label="Rimuovi dal carrello"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path
                    d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                  ></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Coupon Section -->
      <div v-if="cartItems.length > 0 && availableCoupons.length > 0" class="coupon-section">
        <h3 class="coupon-title">Coupon Disponibili</h3>

        <div class="coupon-list">
          <label class="coupon-option">
            <input
              type="radio"
              name="coupon"
              :value="null"
              v-model="selectedCoupon"
              class="coupon-radio"
            />
            <span class="coupon-label">Nessun coupon</span>
          </label>

          <label
            v-for="coupon in availableCoupons"
            :key="coupon.id"
            class="coupon-option"
          >
            <input
              type="radio"
              name="coupon"
              :value="coupon"
              v-model="selectedCoupon"
              class="coupon-radio"
            />
            <div class="coupon-info">
              <span class="coupon-code">{{ coupon.couponCode }}</span>
              <span class="coupon-amount">-{{ coupon.amount.toFixed(2) }} €</span>
            </div>
          </label>
        </div>

        <!-- Avviso coupon eccessivo -->
        <div v-if="couponExceedsTotal" class="coupon-warning">
          <p class="warning-text">
            ⚠️ Questo coupon vale più del totale ordine
          </p>
          <label class="convert-checkbox">
            <input
              type="checkbox"
              v-model="convertRestToCredit"
            />
            <span>Converti resto in credito (+{{ excessAmount.toFixed(2) }} €)</span>
          </label>
        </div>
      </div>

      <!-- Footer -->
      <div v-if="cartItems.length > 0" class="modal-footer">
        <!-- Riepilogo con sconto -->
        <div class="summary-section">
          <div class="summary-row">
            <span class="summary-label">Subtotale:</span>
            <span class="summary-value">{{ parseFloat(cartTotal).toFixed(2) }} €</span>
          </div>
          <div v-if="selectedCoupon" class="summary-row discount-row">
            <span class="summary-label">Sconto coupon:</span>
            <span class="summary-value">-{{ discountAmount.toFixed(2) }} €</span>
          </div>
          <div v-if="creditBonus > 0" class="summary-row bonus-row">
            <span class="summary-label">Credito bonus:</span>
            <span class="summary-value">+{{ creditBonus.toFixed(2) }} €</span>
          </div>
          <div class="summary-row total-row">
            <span class="total-label">Totale:</span>
            <span class="total-amount">{{ finalTotal.toFixed(2) }} €</span>
          </div>
        </div>

        <!-- Pulsanti pagamento -->
        <div v-if="finalTotal > 0" class="footer-actions">
          <button class="clear-button" @click="handleClearCart">Svuota carrello</button>
          <button
            class="checkout-button credit-button"
            @click="handlePayWithCredits"
            :disabled="userCredits < finalTotal"
            :title="userCredits < finalTotal ? 'Credito insufficiente' : 'Paga con il tuo credito'"
          >
            Paga {{ finalTotal.toFixed(2) }} € con Credito
          </button>
          <button class="checkout-button stripe-button" @click="handlePayWithStripe">
            Paga {{ finalTotal.toFixed(2) }} € con Carta
          </button>
        </div>

        <!-- Ordine gratuito -->
        <div v-else class="footer-actions">
          <button class="clear-button" @click="handleClearCart">Svuota carrello</button>
          <button class="checkout-button free-button" @click="handlePayWithStripe">
            ✓ Completa Ordine Gratuito
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { watch } from 'vue'
import { useCart } from '@/composables/useCart'
import { useUser } from '@/composables/useUser'
import { useAuth0 } from '@auth0/auth0-vue'

// Auth0
const { isAuthenticated, loginWithRedirect, user, getAccessTokenSilently } = useAuth0()

// User composable per sapere quando i dati sono pronti
const { isInitialized } = useUser()

// Composable carrello con autenticazione
const {
  cartItems,
  showCartModal,
  cartCount,
  cartTotal,
  removeFromCart,
  clearCart,
  toggleCartModal,
  loadCart,
  loadCoupons,
  userCredits,
  handlePayWithCredits,
  handlePayWithStripe,
  // Coupon
  availableCoupons,
  selectedCoupon,
  convertRestToCredit,
  discountAmount,
  couponExceedsTotal,
  excessAmount,
  creditBonus,
  finalTotal
} = useCart({
  isAuthenticated,
  login: loginWithRedirect,
  user,
  getAccessTokenSilently
})

// Carica il carrello quando useUser è inizializzato
watch(isInitialized, (initialized) => {
  if (initialized && isAuthenticated.value) {
    console.log('🔄 useUser inizializzato, carico carrello e coupon...')
    loadCart()
    loadCoupons()
  }
}, { immediate: true })

async function handleClearCart() {
  if (confirm('Sei sicuro di voler svuotare il carrello?')) {
    await clearCart()
  }
}
</script>

<style scoped>
/* Overlay */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
}

/* Modal Container */
.modal-container {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  max-width: 400px;
  background-color: white;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
}

/* Header */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid var(--color-border);
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
  color: var(--color-heading);
}

.close-button {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text);
  transition: color 0.2s;
}

.close-button:hover {
  color: var(--color-heading);
}

/* Body */
.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
}

.empty-cart {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 3rem 1rem;
  color: var(--color-text);
}

.empty-icon {
  color: var(--color-border);
}

.empty-cart p {
  margin: 0;
  font-size: 1rem;
}

/* Cart Items */
.cart-items {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.cart-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background-color: white;
}

.item-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.item-domain {
  font-weight: 600;
  color: var(--color-heading);
  font-size: 0.9375rem;
}

.item-category {
  font-size: 0.8125rem;
  color: var(--color-text);
}

.item-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.item-price {
  font-weight: 600;
  color: var(--color-heading);
}

.remove-button {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.375rem;
  background: none;
  border: none;
  cursor: pointer;
  color: #dc2626;
  transition: opacity 0.2s;
}

.remove-button:hover {
  opacity: 0.7;
}

/* Footer */
.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid var(--color-border);
  background-color: var(--color-background-soft);
}

.total-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--color-border);
}

.total-label {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-heading);
}

.total-amount {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-heading);
}

.footer-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.clear-button {
  padding: 0.625rem 1rem;
  background-color: white;
  color: var(--color-text);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.clear-button:hover {
  background-color: var(--color-background-soft);
}

.checkout-button {
  padding: 0.75rem 1rem;
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
}

.credit-button {
  background-color: #3b82f6;
}

.credit-button:hover:not(:disabled) {
  background-color: #2563eb;
}

.credit-button:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
  opacity: 0.6;
}

.stripe-button {
  background-color: #22c55e;
}

.stripe-button:hover {
  background-color: #16a34a;
}

.free-button {
  background-color: #10b981;
}

.free-button:hover {
  background-color: #059669;
}

/* Coupon Section */
.coupon-section {
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--color-border);
  background-color: #f9fafb;
}

.coupon-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-heading);
  margin: 0 0 0.75rem 0;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.coupon-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.coupon-option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: white;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.coupon-option:hover {
  border-color: #10b981;
  background: #f0fdf4;
}

.coupon-radio {
  appearance: none;
  width: 1.125rem;
  height: 1.125rem;
  border: 2px solid #d1d5db;
  border-radius: 50%;
  cursor: pointer;
  position: relative;
  flex-shrink: 0;
  transition: all 0.2s;
}

.coupon-radio:checked {
  border-color: #10b981;
  background: #10b981;
}

.coupon-radio:checked::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 0.375rem;
  height: 0.375rem;
  background: white;
  border-radius: 50%;
}

.coupon-label {
  font-size: 0.875rem;
  color: var(--color-text);
}

.coupon-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex: 1;
}

.coupon-code {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-heading);
}

.coupon-amount {
  font-size: 0.875rem;
  font-weight: 600;
  color: #10b981;
}

.coupon-warning {
  margin-top: 0.75rem;
  padding: 0.75rem;
  background: #fef3c7;
  border: 1px solid #fde68a;
  border-radius: 4px;
}

.warning-text {
  margin: 0 0 0.5rem 0;
  font-size: 0.8125rem;
  color: #92400e;
  font-weight: 500;
}

.convert-checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 0.8125rem;
  color: #78350f;
}

.convert-checkbox input[type="checkbox"] {
  width: 1rem;
  height: 1rem;
  cursor: pointer;
}

/* Summary Section */
.summary-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--color-border);
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
}

.summary-label {
  color: var(--color-text);
}

.summary-value {
  font-weight: 500;
  color: var(--color-heading);
}

.discount-row .summary-value {
  color: #10b981;
}

.bonus-row .summary-value {
  color: #f59e0b;
}

.total-row {
  font-size: 1rem;
  padding-top: 0.5rem;
  border-top: 1px solid var(--color-border);
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}

/* Responsive */
@media (max-width: 640px) {
  .modal-container {
    max-width: 100%;
  }
}
</style>