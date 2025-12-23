<template>
  <section class="success-wrapper">
    <div class="success-container">
      <!-- Loading state -->
      <div v-if="processing" class="loading-state">
        <div class="spinner"></div>
        <p>{{ isRecharge ? 'Processando la tua ricarica...' : 'Processando il tuo ordine...' }}</p>
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="error-state">
        <div class="error-icon">❌</div>
        <h1 class="error-title">Errore</h1>
        <p class="error-message">{{ error }}</p>
        <router-link to="/dashboard" class="btn-primary">Torna alla dashboard</router-link>
      </div>

      <!-- Success state -->
      <div v-else class="success-state">
        <div class="success-icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        </div>

        <h1 class="success-title">{{ isFreeOrder ? 'Ordine completato!' : 'Pagamento completato!' }}</h1>
        <p class="success-subtitle">
          {{ isFreeOrder ? 'Il tuo ordine è stato completato gratuitamente con il coupon' :
             isRecharge ? 'La tua ricarica è stata completata con successo' :
             'Grazie per il tuo acquisto' }}
        </p>

        <div v-if="creditBonus > 0" class="bonus-info">
          <p class="bonus-icon">🎁</p>
          <p class="bonus-text">Hai ricevuto <strong>{{ creditBonus.toFixed(2) }} €</strong> di credito bonus dal resto del coupon!</p>
        </div>

        <div v-if="sessionId" class="order-info">
          <p class="info-label">ID Sessione:</p>
          <p class="info-value">{{ sessionId }}</p>
        </div>

        <div v-if="!isCreditsPayment && !isFreeOrder" class="test-notice">
          <p>⚠️ <strong>TEST MODE</strong></p>
          <p>Nessun addebito reale è stato effettuato. Questo è un pagamento di test su Stripe.</p>
        </div>

        <div class="success-actions">
          <router-link v-if="!isRecharge" to="/domains" class="btn-primary">Cerca altri domini</router-link>
          <router-link to="/dashboard" class="btn-primary">Torna alla dashboard</router-link>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuth0 } from '@auth0/auth0-vue'
import { createOrder, deleteFromCart, getUserCart, processRecharge } from '@/services/catalyst'
import { useCart } from '@/composables/useCart'
import { useUser } from '@/composables/useUser'

const route = useRoute()
const { user, getAccessTokenSilently } = useAuth0()
const { loadCart } = useCart({ user, getAccessTokenSilently })
const { updateCredits, addCoupon } = useUser()

const sessionId = ref(null)
const processing = ref(true)
const error = ref(null)
const isRecharge = ref(false)
const isCreditsPayment = ref(false)
const isFreeOrder = ref(false)
const creditBonus = ref(0)

async function getCatalystRowId() {
  try {
    const token = await getAccessTokenSilently({
      authorizationParams: {
        audience: 'https://logintest-calcio-domains.eu.auth0.com/api/v2/',
        scope: 'read:current_user'
      }
    })

    const response = await fetch(
      `https://logintest-calcio-domains.eu.auth0.com/api/v2/users/${user.value.sub}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )

    if (!response.ok) {
      throw new Error('Errore recuperando dati Auth0')
    }

    const auth0Data = await response.json()
    return auth0Data.user_metadata?.catalystRowId
  } catch (err) {
    console.error('Errore ottenendo catalystRowId:', err)
    return null
  }
}

onMounted(async () => {
  sessionId.value = route.query.session_id || null
  const orderId = route.query.order_id || null
  const paymentType = route.query.type || 'order' // 'order', 'recharge', 'credits', or 'free'

  // Set isRecharge based on payment type BEFORE processing
  isRecharge.value = paymentType === 'recharge'

  // For free order (100% coupon), we have order_id and bonus info
  if (paymentType === 'free') {
    if (!orderId) {
      error.value = 'Order ID mancante'
      processing.value = false
      return
    }
    console.log('Processing free order (100% coupon):', orderId)
    isFreeOrder.value = true
    creditBonus.value = parseFloat(route.query.credit_bonus || 0)

    // Load cart to clear state
    try {
      const catalystRowId = await getCatalystRowId()
      if (catalystRowId) {
        await loadCart()
        // Update credits if bonus was added
        if (creditBonus.value > 0) {
          const { getUserData } = await import('@/services/catalyst')
          const userData = await getUserData(catalystRowId)
          updateCredits(userData.credits)
        }
      }
    } catch (err) {
      console.error('Error loading cart after free order:', err)
    }

    processing.value = false
    return
  }

  // For credits payment, we have order_id instead of session_id
  if (paymentType === 'credits') {
    if (!orderId) {
      error.value = 'Order ID mancante'
      processing.value = false
      return
    }
    console.log('Processing credits payment for order:', orderId)
    creditBonus.value = parseFloat(route.query.credit_bonus || 0)

    // Update credits if bonus was added
    if (creditBonus.value > 0) {
      try {
        const catalystRowId = await getCatalystRowId()
        if (catalystRowId) {
          const { getUserData } = await import('@/services/catalyst')
          const userData = await getUserData(catalystRowId)
          updateCredits(userData.credits)
        }
      } catch (err) {
        console.error('Error updating credits:', err)
      }
    }

    // Credits payment is already complete, just show success
    isCreditsPayment.value = true
    processing.value = false
    return
  }

  // For Stripe payments (order or recharge), we need session_id
  if (!sessionId.value) {
    error.value = 'Session ID mancante'
    processing.value = false
    return
  }

  console.log('Processing payment success for session:', sessionId.value)
  console.log('Payment type:', paymentType)

  try {
    const catalystRowId = await getCatalystRowId()
    if (!catalystRowId) {
      throw new Error('Impossibile identificare l\'utente')
    }

    // Handle recharge - process and add credits
    if (paymentType === 'recharge') {
      console.log('💳 Processando ricarica...')

      const result = await processRecharge(catalystRowId, sessionId.value)

      if (result.alreadyProcessed) {
        console.log('⚠️ Ricarica già processata in precedenza:', {
          creditsAdded: result.creditsAdded,
          currentBalance: result.newBalance
        })
      } else {
        console.log('✅ Ricarica completata:', {
          creditsAdded: result.creditsAdded,
          newBalance: result.newBalance,
          bonusCoupon: result.bonusCoupon || 'none'
        })

        // Update credits in useUser composable
        updateCredits(result.newBalance)

        // If first recharge bonus coupon was created, add it to user state
        if (result.bonusCoupon) {
          console.log('🎁 Bonus coupon ricevuto:', result.bonusCoupon.couponCode)

          // Add coupon to user state (format matches get-user-coupons response)
          addCoupon({
            id: null, // Will be set by database
            stripeCouponId: result.bonusCoupon.stripeCouponId,
            couponCode: result.bonusCoupon.couponCode,
            amount: result.bonusCoupon.amount,
            status: 'available',
            createdAt: new Date().toISOString(),
            usedAt: null,
            expiresAt: null
          })
        }
      }
      processing.value = false
      return
    }

    // Handle domain order - create order and clear cart
    console.log('📦 Processando ordine domini...')
    const cartItems = await getUserCart(catalystRowId)

    if (!cartItems || cartItems.length === 0) {
      console.warn('Carrello vuoto - ordine potrebbe essere già stato processato')
      processing.value = false
      return
    }

    const totalAmount = cartItems.reduce((sum, item) => sum + item.price, 0)

    await createOrder(
      catalystRowId,
      sessionId.value,
      totalAmount,
      cartItems
    )

    console.log('✅ Ordine creato con successo')

    const domainNames = cartItems.map(item => item.domain_name)
    await deleteFromCart(catalystRowId, domainNames)

    console.log('✅ Carrello svuotato')

    await loadCart()

    processing.value = false
  } catch (err) {
    console.error('❌ Errore:', err)
    error.value = err.message || (isRecharge.value ? 'Errore processando la ricarica' : 'Errore processando l\'ordine')
    processing.value = false
  }
})
</script>

<style scoped>
.success-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 8rem);
  padding: 2rem 1.5rem;
}

.success-container {
  max-width: 600px;
  width: 100%;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.loading-state,
.error-state,
.success-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  width: 100%;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid var(--color-border);
  border-top-color: #22c55e;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-state p {
  font-size: 1.125rem;
  color: var(--color-text);
}

.error-state {
  gap: 1rem;
}

.error-icon {
  font-size: 4rem;
}

.error-title {
  font-size: 2rem;
  font-weight: 700;
  color: #dc2626;
  margin: 0;
}

.error-message {
  font-size: 1rem;
  color: var(--color-text);
  margin: 0;
}

.success-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: #d1fae5;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #22c55e;
}

.success-title {
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
  color: var(--color-heading);
}

.success-subtitle {
  font-size: 1.125rem;
  color: var(--color-text);
  margin: 0;
}

.bonus-info {
  padding: 1.5rem;
  background-color: #d1fae5;
  border: 1px solid #22c55e;
  border-radius: 4px;
  width: 100%;
  text-align: center;
}

.bonus-icon {
  font-size: 2rem;
  margin: 0 0 0.5rem 0;
}

.bonus-text {
  font-size: 1rem;
  color: #065f46;
  margin: 0;
}

.bonus-text strong {
  color: #047857;
}

.order-info {
  padding: 1.5rem;
  background-color: var(--color-background-soft);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  width: 100%;
}

.info-label {
  font-size: 0.875rem;
  color: var(--color-text);
  margin: 0 0 0.5rem 0;
}

.info-value {
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.875rem;
  color: var(--color-heading);
  margin: 0;
  word-break: break-all;
}

.test-notice {
  padding: 1rem 1.5rem;
  background-color: #fef3c7;
  border: 1px solid #fbbf24;
  border-radius: 4px;
  width: 100%;
}

.test-notice p {
  margin: 0;
  font-size: 0.875rem;
  color: #92400e;
}

.test-notice p:first-child {
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.success-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;
  margin-top: 1rem;
}

.btn-primary,
.btn-secondary {
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s;
  display: inline-block;
}

.btn-primary {
  background-color: #22c55e;
  color: white;
}

.btn-primary:hover {
  background-color: #16a34a;
}

.btn-secondary {
  background-color: white;
  color: var(--color-heading);
  border: 1px solid var(--color-border);
}

.btn-secondary:hover {
  background-color: var(--color-background-soft);
}

@media (min-width: 640px) {
  .success-actions {
    flex-direction: row;
    justify-content: center;
  }
}
</style>