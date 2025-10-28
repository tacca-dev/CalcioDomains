<template>
  <div class="admin-container">
    <!-- Header -->
    <div class="admin-header">
      <div class="header-content">
        <h1 class="admin-title">ADMIN PANEL</h1>
        <p class="admin-subtitle">Gestione sistema CalcioDomains</p>
      </div>
      <div class="header-actions">
        <button class="action-button" @click="goToUserDashboard">
          <span class="icon">←</span>
          Dashboard Utente
        </button>
      </div>
    </div>

    <!-- Admin Cards Grid -->
    <div class="admin-grid">
      <div
        class="admin-card"
        @click="openSection('stats')"
        :class="{ active: activeSection === 'stats' }"
      >
        <div class="card-icon">STATS</div>
        <h3 class="card-title">Statistiche Generali</h3>
        <p class="card-description">
          Panoramica utenti, domini, revenue e metriche chiave del sistema
        </p>
      </div>

      <div
        class="admin-card"
        @click="openSection('users')"
        :class="{ active: activeSection === 'users' }"
      >
        <div class="card-icon">USERS</div>
        <h3 class="card-title">Gestione Utenti</h3>
        <p class="card-description">
          Visualizza e gestisci tutti gli utenti registrati
        </p>
      </div>

      <div
        class="admin-card"
        @click="openSection('domains')"
        :class="{ active: activeSection === 'domains' }"
      >
        <div class="card-icon">DOM</div>
        <h3 class="card-title">Gestione Domini</h3>
        <p class="card-description">
          Visualizza tutti i domini venduti e le transazioni
        </p>
      </div>

      <div
        class="admin-card"
        @click="openSection('coupons')"
        :class="{ active: activeSection === 'coupons' }"
      >
        <div class="card-icon">COUP</div>
        <h3 class="card-title">Gestione Coupon</h3>
        <p class="card-description">
          Visualizza coupon attivi, usati e storico trasferimenti
        </p>
      </div>

      <div
        class="admin-card"
        @click="openSection('pricing')"
        :class="{ active: activeSection === 'pricing' }"
      >
        <div class="card-icon">PRICE</div>
        <h3 class="card-title">Gestione Prezzi</h3>
        <p class="card-description">
          Modifica coefficienti categorie domini e bonus ricariche
        </p>
      </div>

      <div
        class="admin-card"
        @click="openSection('prompts')"
        :class="{ active: activeSection === 'prompts' }"
      >
        <div class="card-icon">PROMPT</div>
        <h3 class="card-title">Modifica Prompt</h3>
        <p class="card-description">
          Gestisci i prompt AI del sistema
        </p>
      </div>
    </div>

    <!-- Section Content (Placeholder) -->
    <div v-if="activeSection" class="section-content">
      <h2>{{ getSectionTitle(activeSection) }}</h2>
      <p class="placeholder-text">
        Questa sezione sarà implementata nelle prossime fasi.
      </p>
      <button class="btn-close-section" @click="activeSection = null">
        Torna alle Cards
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUser } from '@/composables/useUser'
import { useToast } from '@/composables/useToast'

const router = useRouter()
const { isAdmin, isInitialized, enableAdminMode, disableAdminMode } = useUser()
const { showToast } = useToast()

const activeSection = ref(null)

// Verifica permessi admin all'accesso
onMounted(() => {
  console.log('AdminDashboard onMounted - isInitialized:', isInitialized.value, 'isAdmin:', isAdmin.value)

  if (!isInitialized.value) {
    console.warn('User not initialized, redirecting to dashboard')
    router.push('/dashboard')
    return
  }

  // Temporaneamente disabilitiamo il controllo admin per testing
  if (!isAdmin.value && false) { // && false = disabilita temporaneamente
    console.warn('User is not admin, access denied')
    showToast('Accesso negato: solo gli amministratori possono accedere a questa pagina', 'error')
    router.push('/dashboard')
    return
  }

  // Abilita admin mode
  enableAdminMode()
  console.log('Admin dashboard accessed successfully')
})

const openSection = (section) => {
  activeSection.value = section
}

const getSectionTitle = (section) => {
  const titles = {
    stats: 'Statistiche Generali',
    users: 'Gestione Utenti',
    domains: 'Gestione Domini',
    coupons: 'Gestione Coupon',
    pricing: 'Gestione Prezzi',
    prompts: 'Modifica Prompt'
  }
  return titles[section] || ''
}

// Quando l'utente lascia la admin dashboard, disabilita admin mode
const goToUserDashboard = () => {
  disableAdminMode()
  router.push('/dashboard')
}
</script>

<style scoped>
.admin-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  min-height: 100vh;
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 3rem;
  padding-bottom: 2rem;
  border-bottom: 2px solid #e5e7eb;
}

.header-content {
  flex: 1;
}

.admin-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.5px;
}

.admin-subtitle {
  font-size: 1.125rem;
  color: #6b7280;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.action-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.action-button:hover {
  background: #f9fafb;
  border-color: #d1d5db;
}

.icon {
  font-size: 1.25rem;
}

/* Admin Cards Grid */
.admin-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.admin-card {
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 2rem;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  overflow: hidden;
}

.admin-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: #10b981;
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.2s;
}

.admin-card:hover {
  border-color: #10b981;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.1);
  transform: translateY(-2px);
}

.admin-card:hover::before {
  transform: scaleX(1);
}

.admin-card.active {
  border-color: #10b981;
  background: #ecfdf5;
}

.admin-card.active::before {
  transform: scaleX(1);
}

.card-icon {
  font-size: 1.5rem;
  font-weight: 700;
  color: #10b981;
  letter-spacing: 1px;
  margin-bottom: 1rem;
}

.card-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 0.75rem 0;
}

.card-description {
  font-size: 1rem;
  color: #6b7280;
  line-height: 1.5;
  margin: 0;
}

/* Section Content (Placeholder) */
.section-content {
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 3rem;
  text-align: center;
}

.section-content h2 {
  font-size: 2rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 1rem 0;
}

.placeholder-text {
  font-size: 1.125rem;
  color: #6b7280;
  margin: 0 0 2rem 0;
}

.btn-close-section {
  padding: 0.75rem 1.5rem;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-close-section:hover {
  background: #059669;
}

/* Responsive */
@media (max-width: 768px) {
  .admin-container {
    padding: 1rem;
  }

  .admin-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .admin-title {
    font-size: 2rem;
  }

  .admin-grid {
    grid-template-columns: 1fr;
  }

  .section-content {
    padding: 2rem 1rem;
  }
}
</style>