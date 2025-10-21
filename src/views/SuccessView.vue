<template>
  <section class="success-wrapper">
    <div class="success-container">
      <!-- Loading state -->
      <div v-if="processing" class="loading-state">
        <div class="spinner"></div>
        <p>Processando il tuo ordine...</p>
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

        <h1 class="success-title">Pagamento completato!</h1>
        <p class="success-subtitle">Grazie per il tuo acquisto</p>

        <div v-if="sessionId" class="order-info">
          <p class="info-label">ID Sessione:</p>
          <p class="info-value">{{ sessionId }}</p>
        </div>

        <div class="test-notice">
          <p>⚠️ <strong>TEST MODE</strong></p>
          <p>Nessun addebito reale è stato effettuato. Questo è un pagamento di test su Stripe.</p>
        </div>

        <div class="success-actions">
          <router-link to="/domains" class="btn-primary">Cerca altri domini</router-link>
          <router-link to="/dashboard" class="btn-secondary">Torna alla dashboard</router-link>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuth0 } from '@auth0/auth0-vue'
import { createOrder, deleteFromCart, getUserCart } from '@/services/catalyst'
import { useCart } from '@/composables/useCart'

const route = useRoute()
const { user, getAccessTokenSilently } = useAuth0()
const { loadCart } = useCart({ user, getAccessTokenSilently })

const sessionId = ref(null)
const processing = ref(true)
const error = ref(null)

async function getCatalystRowId() {
  try {
    const token = await getAccessTokenSilently({
      authorizationParams: {
        audience: 'https://dev-giylww0unln6dunq.eu.auth0.com/api/v2/',
        scope: 'read:current_user'
      }
    })

    const response = await fetch(
      `https://dev-giylww0unln6dunq.eu.auth0.com/api/v2/users/${user.value.sub}`,
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

  if (!sessionId.value) {
    error.value = 'Session ID mancante'
    processing.value = false
    return
  }

  console.log('Processing payment success for session:', sessionId.value)

  try {
    const catalystRowId = await getCatalystRowId()
    if (!catalystRowId) {
      throw new Error('Impossibile identificare l\'utente')
    }

    const cartItems = await getUserCart(catalystRowId)

    if (!cartItems || cartItems.length === 0) {
      console.warn('Carrello già vuoto o ordine già processato')
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

    console.log('Ordine creato con successo')

    const domainNames = cartItems.map(item => item.domain_name)
    await deleteFromCart(catalystRowId, domainNames)

    console.log('Carrello svuotato')

    await loadCart()

    processing.value = false
  } catch (err) {
    console.error('Errore processando ordine:', err)
    error.value = err.message || 'Errore processando l\'ordine'
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