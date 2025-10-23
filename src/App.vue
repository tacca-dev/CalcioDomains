<script setup>
import { watch } from 'vue'
import { RouterView } from 'vue-router'
import { useAuth0 } from '@auth0/auth0-vue'
import NavBar from './components/NavBar.vue'
import CartModal from './components/CartModal.vue'
import ToastContainer from './components/ToastContainer.vue'
import { useUser } from './composables/useUser'

// Auth0
const { isAuthenticated, user, getAccessTokenSilently } = useAuth0()

// User composable
const { initialize, isInitialized } = useUser()

// Inizializza i dati utente quando l'utente fa login
watch([isAuthenticated, user], async ([authenticated, userData]) => {
  if (authenticated && userData && !isInitialized.value) {
    try {
      console.log('🚀 Inizializzazione dati utente globali...')
      await initialize(userData, getAccessTokenSilently)
      console.log('✅ Dati utente inizializzati con successo')
    } catch (error) {
      console.error('❌ Errore inizializzando dati utente:', error)
    }
  }
}, { immediate: true })
</script>

<template>
  <div class="app">
    <NavBar />
    <div class="app-container">
      <RouterView />
    </div>
    <CartModal />
    <ToastContainer />
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  background: #f8f9fa;
}

.app-container {
  width: 100%;
}
</style>
