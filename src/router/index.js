import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import DomainsView from '../views/DomainsView.vue'
import DashboardView from '../views/DashboardView.vue'
import ProfileView from '../views/ProfileView.vue'
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
      path: '/profile',
      name: 'profile',
      component: ProfileView
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

export default router
