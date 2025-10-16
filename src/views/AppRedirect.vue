<template>
  <div class="redirect-container">
    <div class="loading-spinner">
      <p>Login completato, reindirizzamento...</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { isAuthenticated, getCurrentUser } from '../services/auth'

const router = useRouter()

onMounted(async () => {
  console.log('[AppRedirect] Component mounted after login')

  try {
    // Verifica che l'utente sia effettivamente autenticato
    console.log('[AppRedirect] Checking authentication status...')
    const authenticated = await isAuthenticated()

    if (authenticated) {
      console.log('[AppRedirect] User authenticated, fetching user details...')
      const user = await getCurrentUser()
      console.log('[AppRedirect] User details:', user)

      // Attendi un momento per assicurarsi che tutto sia caricato
      await new Promise(resolve => setTimeout(resolve, 500))

      console.log('[AppRedirect] Redirecting to home...')
      router.push('/')
    } else {
      console.warn('[AppRedirect] User not authenticated after login redirect')
      // Reindirizza comunque alla home, la NavBar gestirà lo stato
      router.push('/')
    }
  } catch (error) {
    console.error('[AppRedirect] Error during post-login redirect:', error)
    // In caso di errore, reindirizza comunque alla home
    router.push('/')
  }
})
</script>

<style scoped>
.redirect-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #f9fafb;
}

.loading-spinner {
  text-align: center;
  padding: 2rem;
}

.loading-spinner p {
  color: #6b7280;
  font-size: 1rem;
  margin: 0;
}
</style>