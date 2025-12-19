<template>
  <nav class="navbar">
    <div class="navbar-container">
      <div class="navbar-left">
        <router-link to="/" class="nav-brand"> CalcioDomains </router-link>
        <div class="nav-links">
          <router-link to="/" class="nav-link" active-class="active"> Home </router-link>
          <router-link to="/domains" class="nav-link" active-class="active"> Domini </router-link>
          <router-link to="/perche-calcio" class="nav-link" active-class="active">
            Perché .calcio
          </router-link>
        </div>
      </div>
      <div class="navbar-right">
        <!-- Cart Icon (always visible) -->
        <CartIcon v-if="!isLoading" />

        <!-- Show loading state -->
        <div v-if="isLoading" class="loading-text">Caricamento...</div>

        <!-- Show login button when not authenticated -->
        <button v-else-if="!isAuthenticated" @click="login" class="login-button">Login</button>

        <!-- Show dashboard buttons when authenticated -->
        <template v-else>
          <!-- Admin mode badge -->
          <div v-if="adminMode" class="admin-badge">ADMIN MODE</div>

          <!-- Dashboard button -->
          <button @click="$router.push('/dashboard')" class="dashboard-button">Dashboard</button>

          <!-- Admin Panel button (only for admins) -->
          <button v-if="isAdmin" @click="$router.push('/admin')" class="admin-button">
            Admin Panel
          </button>
        </template>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { RouterLink } from 'vue-router'
import CartIcon from './CartIcon.vue'
import { useUser } from '@/composables/useUser'
// import { ref, onMounted } from 'vue'
// import { isAuthenticated as checkAuth, getCurrentUser, signIn, signOut } from '../services/auth'

/** LOGIN AUTH0 - START */
import { useAuth0 } from '@auth0/auth0-vue'
import { computed } from 'vue'

// MOCK AUTH MODE: Hardcoded to true for Builder.io preview
const isMockAuth = true

// Get Auth0 functions and state
const {
  loginWithRedirect,
  isAuthenticated: auth0IsAuthenticated,
  isLoading: auth0IsLoading
} = useAuth0()

// Override Auth0 state in mock auth mode
const isAuthenticated = computed(() => (isMockAuth ? true : auth0IsAuthenticated.value))
const isLoading = computed(() => (isMockAuth ? false : auth0IsLoading.value))

// Get user state
const { isAdmin, adminMode, isInitialized } = useUser()

// Debug log per capire lo stato
console.log('NavBar - isInitialized:', isInitialized.value)
console.log('NavBar - isAdmin:', isAdmin.value)
console.log('NavBar - adminMode:', adminMode.value)

// Login function
const login = () => {
  loginWithRedirect({
    redirect_uri: 'https://calciodomains-yqdhfgao.onslate.eu/'
  })
}
/** LOGIN AUTH0 - END */

/** CATALYST NATIVE AUTHENTICATION - START */
// const user = ref(null)
// const isAuthenticated = ref(false)
// const isLoading = ref(true)

// // Check authentication status on mount
// onMounted(async () => {
//   console.log('[NavBar] Component mounted, checking authentication...')
//   try {
//     isLoading.value = true
//     console.log('[NavBar] Loading state set to true')

//     const authenticated = await checkAuth()
//     console.log('[NavBar] Authentication check result:', authenticated)
//     isAuthenticated.value = authenticated

//     if (authenticated) {
//       console.log('[NavBar] User is authenticated, fetching user details...')
//       const userDetails = await getCurrentUser()
//       console.log('[NavBar] User details received:', userDetails)
//       user.value = userDetails
//     } else {
//       console.log('[NavBar] User is not authenticated')
//     }
//   } catch (error) {
//     console.error('[NavBar] Error checking authentication:', error)
//   } finally {
//     isLoading.value = false
//     console.log('[NavBar] Loading complete. isAuthenticated:', isAuthenticated.value, 'user:', user.value)
//   }
// })

// // Login function
// const login = () => {
//   signIn()
// }

// // Logout function
// const logout = () => {
//   signOut()
// }
/** CATALYST NATIVE AUTHENTICATION - END */
</script>

<style scoped>
.navbar {
  background: white;
  border-bottom: 1px solid #e5e7eb;
  position: sticky;
  top: 0;
  z-index: 100;
}

.navbar-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.navbar-left {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.nav-brand {
  text-decoration: none;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a1a1a;
}

.nav-brand:hover {
  color: #4b5563;
}

.nav-links {
  display: flex;
  gap: 1rem;
}

.nav-link {
  color: #6b7280;
  text-decoration: none;
  font-size: 0.95rem;
  padding: 0.5rem 0.75rem;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.nav-link:hover {
  color: #1a1a1a;
  background: #f9fafb;
}

.nav-link.active {
  color: #1a1a1a;
  background: #f3f4f6;
}

.navbar-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.login-button {
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

.login-button:hover {
  background: #f9fafb;
  border-color: #d1d5db;
}

.login-button:active {
  background: #f3f4f6;
}

.dashboard-button {
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

.dashboard-button:hover {
  background: #f9fafb;
  border-color: #d1d5db;
}

.dashboard-button:active {
  background: #f3f4f6;
}

.admin-button {
  background: #10b981;
  color: white;
  border: 1px solid #10b981;
  padding: 0.5rem 1rem;
  font-size: 0.95rem;
  font-weight: 500;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.admin-button:hover {
  background: #059669;
  border-color: #059669;
}

.admin-button:active {
  background: #047857;
}

.admin-badge {
  background: #ecfdf5;
  color: #10b981;
  border: 1px solid #10b981;
  padding: 0.375rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 700;
  border-radius: 4px;
  letter-spacing: 0.5px;
}

.loading-text {
  color: #6b7280;
  font-size: 0.95rem;
}

.user-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-email {
  color: #4b5563;
  font-size: 0.95rem;
}

.logout-button {
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

.logout-button:hover {
  background: #f9fafb;
  border-color: #d1d5db;
}

.logout-button:active {
  background: #f3f4f6;
}

/* Mobile responsiveness */
@media (max-width: 640px) {
  .navbar-container {
    padding: 0.75rem 1rem;
  }

  .nav-brand {
    font-size: 1.1rem;
  }

  .nav-links {
    gap: 0.5rem;
  }

  .nav-link {
    padding: 0.4rem 0.6rem;
    font-size: 0.9rem;
  }

  .login-button {
    padding: 0.4rem 0.8rem;
    font-size: 0.9rem;
  }
}
</style>
