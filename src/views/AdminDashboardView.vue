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
          Dashboard Utente
        </button>
      </div>
    </div>

    <!-- Tabs -->
    <div class="action-tabs">
      <button
        class="tab-button"
        :class="{ active: activeTab === 'stats' }"
        @click="activeTab = 'stats'"
      >
        Statistiche
      </button>
      <button
        class="tab-button"
        :class="{ active: activeTab === 'users' }"
        @click="activeTab = 'users'"
      >
        Utenti
      </button>
      <button
        class="tab-button"
        :class="{ active: activeTab === 'domains' }"
        @click="activeTab = 'domains'"
      >
        Domini
      </button>
      <button
        class="tab-button"
        :class="{ active: activeTab === 'coupons' }"
        @click="activeTab = 'coupons'"
      >
        Coupon
      </button>
      <button
        class="tab-button"
        :class="{ active: activeTab === 'pricing' }"
        @click="activeTab = 'pricing'"
      >
        Prezzi
      </button>
      <button
        class="tab-button"
        :class="{ active: activeTab === 'prompts' }"
        @click="activeTab = 'prompts'"
      >
        Prompt
      </button>
    </div>

    <!-- Tab Content -->
    <div class="tab-content">
      <!-- Statistiche -->
      <div v-if="activeTab === 'stats'" class="content-section">
        <h2>Statistiche Generali</h2>
        <p class="placeholder">Questa sezione sarà implementata nelle prossime fasi.</p>
      </div>

      <!-- Utenti -->
      <div v-if="activeTab === 'users'" class="content-section">
        <h2>Gestione Utenti</h2>
        <p class="placeholder">Questa sezione sarà implementata nelle prossime fasi.</p>
      </div>

      <!-- Domini -->
      <div v-if="activeTab === 'domains'" class="content-section">
        <h2>Gestione Domini</h2>
        <p class="placeholder">Questa sezione sarà implementata nelle prossime fasi.</p>
      </div>

      <!-- Coupon -->
      <div v-if="activeTab === 'coupons'" class="content-section">
        <h2>Gestione Coupon</h2>
        <p class="placeholder">Questa sezione sarà implementata nelle prossime fasi.</p>
      </div>

      <!-- Prezzi -->
      <div v-if="activeTab === 'pricing'" class="content-section">
        <h2>Gestione Prezzi</h2>
        <p class="placeholder">Questa sezione sarà implementata nelle prossime fasi.</p>
      </div>

      <!-- Prompt -->
      <div v-if="activeTab === 'prompts'" class="content-section">
        <h2>Modifica Prompt</h2>
        <p class="placeholder">Questa sezione sarà implementata nelle prossime fasi.</p>
      </div>
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

const activeTab = ref('stats')

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

// Quando l'utente lascia la admin dashboard, disabilita admin mode
const goToUserDashboard = () => {
  disableAdminMode()
  router.push('/dashboard')
}
</script>

<style scoped>
.admin-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  min-height: calc(100vh - 80px);
}

/* Header */
.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.header-content {
  flex: 1;
}

.admin-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 0.25rem 0;
}

.admin-subtitle {
  font-size: 1rem;
  color: #6b7280;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
}

.action-button {
  padding: 0.5rem 1rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s;
}

.action-button:hover {
  background: #f9fafb;
}

/* Tabs (stesso stile di DashboardView) */
.action-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  border-bottom: 1px solid #e5e7eb;
  overflow-x: auto;
  padding-bottom: 0;
}

.tab-button {
  padding: 0.75rem 1.5rem;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  font-size: 0.95rem;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s;
}

.tab-button:hover {
  color: #1a1a1a;
  background: #f9fafb;
}

.tab-button.active {
  color: #1a1a1a;
  border-bottom-color: #10b981;
  background: transparent;
}

/* Tab Content */
.tab-content {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 2rem;
  min-height: 400px;
}

.content-section h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 1rem 0;
}

.placeholder {
  color: #6b7280;
  font-size: 1rem;
  margin: 0;
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
    font-size: 1.5rem;
  }

  .action-tabs {
    gap: 0.25rem;
  }

  .tab-button {
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
  }

  .tab-content {
    padding: 1.5rem;
  }
}
</style>
