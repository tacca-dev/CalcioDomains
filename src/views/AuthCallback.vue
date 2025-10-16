<!--
/** LOGIN AUTH0 - START */
Questo componente gestisce il callback di Auth0.
Attualmente commentato e non in uso.
/** LOGIN AUTH0 - END */
-->
<template>
  <div class="auth-callback-container">
    <div class="loading-card">
      <div v-if="!error" class="loading-content">
        <div class="spinner"></div>
        <h2>Autenticazione in corso...</h2>
        <p>Attendere prego</p>
      </div>

      <div v-else class="error-content">
        <h2>Errore di autenticazione</h2>
        <p>{{ error }}</p>
        <button @click="goHome" class="home-button">
          Torna alla Home
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth0 } from '@auth0/auth0-vue'

const router = useRouter()
const { user, isAuthenticated, getAccessTokenSilently } = useAuth0()
const error = ref(null)

// Catalyst backend URL
const CATALYST_BASE_URL = 'https://calciodomains-20105566495.development.catalystserverless.eu/server'

onMounted(async () => {
  try {
    // Wait for Auth0 SDK to complete the callback and get the token
    // The SDK handles PKCE code_verifier internally
    console.log('Waiting for Auth0 to complete authentication...')

    // Wait a bit for Auth0 SDK to process the callback
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Check if authenticated
    if (!isAuthenticated.value) {
      throw new Error('Autenticazione non completata')
    }

    console.log('Auth0 authentication completed, user:', user.value)

    // Get the Auth0 access token (already validated by Auth0 SDK)
    const accessToken = await getAccessTokenSilently()
    console.log('Got access token from Auth0')

    // Now send this validated token to Catalyst for third-party authentication
    const response = await fetch(`${CATALYST_BASE_URL}/exchange-auth0-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        auth0Token: accessToken,
        userInfo: {
          email: user.value?.email,
          name: user.value?.name,
          picture: user.value?.picture,
          sub: user.value?.sub
        }
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Exchange token error:', errorText)
      throw new Error('Errore durante lo scambio del token con Catalyst')
    }

    const data = await response.json()
    console.log('Catalyst response:', data)

    // Store Catalyst token if provided
    if (data.token || data.catalystToken) {
      localStorage.setItem('catalyst_token', data.token || data.catalystToken)
    }

    // Store user info if provided
    if (data.user) {
      localStorage.setItem('user_info', JSON.stringify(data.user))
    }

    // Redirect to home or dashboard
    router.push('/')

  } catch (err) {
    console.error('Auth callback error:', err)
    error.value = err.message || 'Si è verificato un errore durante l\'autenticazione'
  }
})

const goHome = () => {
  router.push('/')
}
</script>

<style scoped>
.auth-callback-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
}

.loading-card {
  background: white;
  border-radius: 8px;
  padding: 3rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  text-align: center;
  max-width: 400px;
  width: 100%;
}

.loading-content h2,
.error-content h2 {
  font-size: 1.5rem;
  color: #1a1a1a;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.loading-content p,
.error-content p {
  color: #6b7280;
  margin-bottom: 1.5rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e5e7eb;
  border-top-color: #4b5563;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 1.5rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-content {
  color: #dc2626;
}

.home-button {
  background: white;
  color: #1a1a1a;
  border: 1px solid #e5e7eb;
  padding: 0.5rem 1rem;
  font-size: 0.95rem;
  font-weight: 500;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.home-button:hover {
  background: #f9fafb;
  border-color: #d1d5db;
}

.home-button:active {
  background: #f3f4f6;
}
</style>