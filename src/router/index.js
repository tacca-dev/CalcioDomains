import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import DomainsView from '../views/DomainsView.vue'
import DashboardView from '../views/DashboardView.vue'
import AdminDashboardView from '../views/AdminDashboardView.vue'
import ProfileView from '../views/ProfileView.vue'
import SuccessView from '../views/SuccessView.vue'
import CancelView from '../views/CancelView.vue'
import { useUser } from '../composables/useUser'
import { useToast } from '../composables/useToast'
// import AppRedirect from '../views/AppRedirect.vue'
/** LOGIN AUTH0 - START */
// import AuthCallback from '../views/AuthCallback.vue'
/** LOGIN AUTH0 - END */

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/domains',
      name: 'domains',
      component: DomainsView
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView
    },
    {
      path: '/admin',
      name: 'admin',
      component: AdminDashboardView,
      meta: { requiresAdmin: true }
    },
    {
      path: '/profile',
      name: 'profile',
      component: ProfileView
    },
    {
      path: '/success',
      name: 'success',
      component: SuccessView
    },
    {
      path: '/cancel',
      name: 'cancel',
      component: CancelView
    },
    /** CATALYST NATIVE AUTHENTICATION - START */
    // {
    //   path: '/app',
    //   name: 'app-redirect',
    //   component: AppRedirect
    // },
    /** CATALYST NATIVE AUTHENTICATION - END */
    /** LOGIN AUTH0 - START */
    // Auth0 SDK handles callback automatically, no need for custom route
    // {
    //   path: '/auth-callback',
    //   name: 'auth-callback',
    //   component: AuthCallback
    // },
    /** LOGIN AUTH0 - END */
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue')
    }
  ]
})

// Navigation guard per proteggere le route admin
router.beforeEach((to, next) => {
  // Verifica se la route richiede permessi admin
  if (to.meta.requiresAdmin) {
    const { isAdmin, isInitialized, enableAdminMode } = useUser()

    // Verifica che l'utente sia inizializzato
    if (!isInitialized.value) {
      console.warn('User not initialized, redirecting to dashboard')
      next('/dashboard')
      return
    }

    // Verifica che l'utente sia admin
    if (!isAdmin.value) {
      console.warn('User is not admin, access denied')
      const { showToast } = useToast()
      showToast('Accesso negato: solo gli amministratori possono accedere a questa pagina', 'error')
      next('/dashboard')
      return
    }

    // Admin verificato, abilita admin mode e procedi
    enableAdminMode()
    next()
  } else {
    // Route pubblica, procedi normalmente
    next()
  }
})

export default router
