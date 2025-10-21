<template>
  <nav class="navbar">
    <div class="navbar-container">
      <div class="navbar-left">
        <router-link to="/" class="nav-brand">
          CalcioDomains
        </router-link>
        <div class="nav-links">
          <router-link to="/" class="nav-link" active-class="active">
            Home
          </router-link>
          <router-link to="/domains" class="nav-link" active-class="active">
            Domini
          </router-link>
        </div>
      </div>
      <div class="navbar-right">
        <!-- Cart Icon (only show when authenticated) -->
        <CartIcon v-if="isAuthenticated && !isLoading" />

        <!-- Show loading state -->
        <div v-if="isLoading" class="loading-text">
          Caricamento...
        </div>

        <!-- Show login button when not authenticated -->
        <button
          v-else-if="!isAuthenticated"
          @click="login"
          class="login-button"
        >
          Login
        </button>

        <!-- Show dashboard button when authenticated -->
        <button
          v-else
          @click="$router.push('/dashboard')"
          class="dashboard-button"
        >
          Dashboard
        </button>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { RouterLink } from 'vue-router'
import CartIcon from './CartIcon.vue'
// import { ref, onMounted } from 'vue'
// import { isAuthenticated as checkAuth, getCurrentUser, signIn, signOut } from '../services/auth'

/** LOGIN AUTH0 - START */
import { useAuth0 } from '@auth0/auth0-vue'

// Get Auth0 functions and state
const {
  loginWithRedirect,
  isAuthenticated,
  isLoading
} = useAuth0()

// Login function
const login = () => {
  loginWithRedirect({
    redirect_uri: 'https://calciodomains-yqdhfgao.onslate.eu/'
  });
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