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
        <div class="search-box">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Cerca per nickname o email..."
            class="search-input"
          />
        </div>

        <!-- Loading state -->
        <div v-if="usersLoading" class="state-message">
          Caricamento utenti...
        </div>

        <!-- Error state -->
        <div v-else-if="usersError" class="state-message error">
          Errore: {{ usersError }}
        </div>

        <!-- Users table -->
        <div v-else-if="filteredUsers.length > 0" class="table-container">
          <table class="users-table">
            <thead>
              <tr>
                <th>Nickname</th>
                <th>Email</th>
                <th>Credito</th>
                <th>N. Domini</th>
                <th>Ruolo</th>
                <th>Registrazione</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in filteredUsers" :key="user.rowId">
                <td class="nickname-cell">{{ user.nickname }}</td>
                <td class="email-cell">{{ user.email }}</td>
                <td class="credits-cell">{{ formatCurrency(user.credits) }}</td>
                <td class="orders-cell">{{ user.totalOrders }}</td>
                <td class="role-cell">
                  <span v-if="user.isAdmin">ADMIN</span>
                  <span v-else>USER</span>
                </td>
                <td class="date-cell">{{ formatDate(user.createdAt) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Empty state -->
        <div v-else class="state-message">
          <span v-if="searchQuery">Nessun utente trovato per "{{ searchQuery }}"</span>
          <span v-else>Nessun utente registrato</span>
        </div>
      </div>

      <!-- Domini -->
      <div v-if="activeTab === 'domains'" class="content-section">
        <h2>Gestione Domini</h2>
        <div class="search-box">
          <input
            v-model="domainsSearchQuery"
            type="text"
            placeholder="Cerca per dominio o acquirente..."
            class="search-input"
          />
        </div>

        <!-- Loading state -->
        <div v-if="domainsLoading" class="state-message">
          Caricamento domini...
        </div>

        <!-- Error state -->
        <div v-else-if="domainsError" class="state-message error">
          Errore: {{ domainsError }}
        </div>

        <!-- Domains table -->
        <div v-else-if="filteredDomains.length > 0" class="table-container">
          <table class="users-table">
            <thead>
              <tr>
                <th>Dominio</th>
                <th>Acquirente</th>
                <th>Prezzo</th>
                <th>Categoria</th>
                <th>Data Acquisto</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(domain, index) in filteredDomains" :key="index">
                <td class="nickname-cell">{{ domain.domainName }}</td>
                <td class="email-cell">{{ domain.buyerNickname }}</td>
                <td class="credits-cell">{{ formatCurrency(domain.price) }}</td>
                <td>{{ domain.category }}</td>
                <td class="date-cell">{{ formatDate(domain.purchaseDate) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Empty state -->
        <div v-else class="state-message">
          <span v-if="domainsSearchQuery">Nessun dominio trovato per "{{ domainsSearchQuery }}"</span>
          <span v-else>Nessun dominio venduto</span>
        </div>
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
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUser } from '@/composables/useUser'
import { useToast } from '@/composables/useToast'
import { getAllUsersAdmin, getAllDomainsAdmin } from '@/services/catalyst'

const router = useRouter()
const { isAdmin, isInitialized, enableAdminMode, disableAdminMode } = useUser()
const { showToast } = useToast()

const activeTab = ref('stats')

// Users management state
const usersData = ref([])
const usersLoading = ref(false)
const usersError = ref(null)
const searchQuery = ref('')

// Domains management state
const domainsData = ref([])
const domainsLoading = ref(false)
const domainsError = ref(null)
const domainsSearchQuery = ref('')

// Load users data
const loadUsers = async () => {
  usersLoading.value = true
  usersError.value = null

  try {
    const users = await getAllUsersAdmin()
    usersData.value = users
    console.log('Loaded', users.length, 'users')
  } catch (error) {
    console.error('Error loading users:', error)
    usersError.value = error.message || 'Errore nel caricamento degli utenti'
    showToast('Errore nel caricamento degli utenti', 'error')
  } finally {
    usersLoading.value = false
  }
}

// Filtered users based on search query
const filteredUsers = computed(() => {
  if (!searchQuery.value.trim()) {
    return usersData.value
  }

  const query = searchQuery.value.toLowerCase().trim()

  return usersData.value.filter(user => {
    const nickname = (user.nickname || '').toLowerCase()
    const email = (user.email || '').toLowerCase()
    return nickname.includes(query) || email.includes(query)
  })
})

// Load domains data
const loadDomains = async () => {
  domainsLoading.value = true
  domainsError.value = null

  try {
    const domains = await getAllDomainsAdmin()
    domainsData.value = domains
    console.log('Loaded', domains.length, 'domains')
  } catch (error) {
    console.error('Error loading domains:', error)
    domainsError.value = error.message || 'Errore nel caricamento dei domini'
    showToast('Errore nel caricamento dei domini', 'error')
  } finally {
    domainsLoading.value = false
  }
}

// Filtered domains based on search query
const filteredDomains = computed(() => {
  if (!domainsSearchQuery.value.trim()) {
    return domainsData.value
  }

  const query = domainsSearchQuery.value.toLowerCase().trim()

  return domainsData.value.filter(domain => {
    const domainName = (domain.domainName || '').toLowerCase()
    const buyerNickname = (domain.buyerNickname || '').toLowerCase()
    const buyerEmail = (domain.buyerEmail || '').toLowerCase()
    return domainName.includes(query) || buyerNickname.includes(query) || buyerEmail.includes(query)
  })
})

// Format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount)
}

// Format date
const formatDate = (dateString) => {
  if (!dateString) return '-'

  try {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('it-IT', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date)
  } catch (error) {
    return dateString
  }
}

// Verifica permessi admin all'accesso
onMounted(async () => {
  console.log('AdminDashboard onMounted - isInitialized:', isInitialized.value, 'isAdmin:', isAdmin.value)

  if (!isInitialized.value) {
    console.warn('User not initialized, redirecting to dashboard')
    router.push('/dashboard')
    return
  }

  // Verifica che l'utente sia admin
  if (!isAdmin.value) {
    console.warn('User is not admin, access denied')
    showToast('Accesso negato: solo gli amministratori possono accedere a questa pagina', 'error')
    router.push('/dashboard')
    return
  }

  // Abilita admin mode
  enableAdminMode()
  console.log('Admin dashboard accessed successfully')

  // Load users and domains data
  await Promise.all([loadUsers(), loadDomains()])
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

/* Search box */
.search-box {
  margin-bottom: 1.5rem;
  max-width: 400px;
}

.search-input {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  font-size: 0.95rem;
  transition: border-color 0.15s;
}

.search-input:focus {
  outline: none;
  border-color: #10b981;
}

/* State messages */
.state-message {
  padding: 2rem;
  text-align: center;
  color: #6b7280;
  font-size: 1rem;
}

.state-message.error {
  color: #dc2626;
}

/* Users table */
.table-container {
  overflow-x: auto;
  margin-top: 1rem;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.95rem;
}

.users-table thead {
  background: #f9fafb;
  border-bottom: 2px solid #e5e7eb;
}

.users-table th {
  padding: 0.75rem 1rem;
  text-align: left;
  font-weight: 600;
  color: #1a1a1a;
  white-space: nowrap;
}

.users-table tbody tr {
  border-bottom: 1px solid #e5e7eb;
  transition: background 0.1s;
}

.users-table tbody tr:hover {
  background: #f9fafb;
}

.users-table td {
  padding: 0.75rem 1rem;
  color: #374151;
}

.nickname-cell {
  font-weight: 500;
  color: #1a1a1a;
}

.email-cell {
  color: #6b7280;
}

.credits-cell {
  font-weight: 500;
  color: #10b981;
}

.orders-cell {
  text-align: center;
  font-weight: 500;
}

.role-cell {
  font-weight: 500;
  color: #374151;
}

.date-cell {
  color: #6b7280;
  font-size: 0.875rem;
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

  .search-box {
    max-width: 100%;
  }

  .users-table {
    font-size: 0.875rem;
  }

  .users-table th,
  .users-table td {
    padding: 0.5rem 0.75rem;
  }
}
</style>
