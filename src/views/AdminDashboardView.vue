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
        <div class="search-box">
          <input
            v-model="couponsSearchQuery"
            type="text"
            placeholder="Cerca per codice o proprietario..."
            class="search-input"
          />
        </div>

        <!-- Loading state -->
        <div v-if="couponsLoading" class="state-message">
          Caricamento coupon...
        </div>

        <!-- Error state -->
        <div v-else-if="couponsError" class="state-message error">
          Errore: {{ couponsError }}
        </div>

        <!-- Coupons table -->
        <div v-else-if="filteredCoupons.length > 0" class="table-container">
          <table class="users-table">
            <thead>
              <tr>
                <th>Codice</th>
                <th>Proprietario</th>
                <th>Importo</th>
                <th>Status</th>
                <th>Ultimo Trasferimento</th>
                <th>Data Creazione</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="coupon in filteredCoupons" :key="coupon.couponId">
                <td class="nickname-cell">{{ coupon.couponCode }}</td>
                <td class="email-cell">{{ coupon.ownerNickname }}</td>
                <td class="credits-cell">{{ formatCurrency(coupon.amount) }}</td>
                <td>
                  <span :class="coupon.status === 'available' ? 'status-available' : 'status-used'">
                    {{ coupon.status === 'available' ? 'Disponibile' : 'Usato' }}
                  </span>
                </td>
                <td class="email-cell">
                  <span v-if="coupon.lastTransferFrom">
                    Da {{ coupon.lastTransferFrom }}<br/>
                    <span class="date-cell">{{ formatDate(coupon.lastTransferDate) }}</span>
                  </span>
                  <span v-else>-</span>
                </td>
                <td class="date-cell">{{ formatDate(coupon.createdAt) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Empty state -->
        <div v-else class="state-message">
          <span v-if="couponsSearchQuery">Nessun coupon trovato per "{{ couponsSearchQuery }}"</span>
          <span v-else>Nessun coupon nel sistema</span>
        </div>
      </div>

      <!-- Prezzi -->
      <div v-if="activeTab === 'pricing'" class="content-section">
        <h2>Gestione Prezzi</h2>

        <!-- Loading state -->
        <div v-if="pricingLoading" class="state-message">
          Caricamento configurazione prezzi...
        </div>

        <!-- Error state -->
        <div v-else-if="pricingError" class="state-message error">
          Errore: {{ pricingError }}
        </div>

        <!-- Pricing config -->
        <div v-else>
          <h3 class="section-subtitle">Coefficienti Categorie Domini</h3>
          <p class="section-description">
            Modifica i coefficienti moltiplicativi per ogni categoria di dominio.
          </p>

          <div class="pricing-grid">
            <div v-for="level in domainLevels" :key="level.rowId" class="pricing-item">
              <label class="pricing-label">{{ level.level }}</label>
              <input
                v-model.number="level.coefficient"
                type="number"
                step="0.01"
                min="0.01"
                class="pricing-input"
                @input="markAsModified(level.rowId)"
              />
              <span v-if="modifiedLevels.has(level.rowId)" class="modified-indicator">*</span>
            </div>
          </div>

          <div class="pricing-actions">
            <button
              @click="savePricingChanges"
              :disabled="modifiedLevels.size === 0 || savingPricing"
              class="save-button"
            >
              {{ savingPricing ? 'Salvataggio...' : 'Salva Modifiche' }}
            </button>
            <button
              @click="resetPricingChanges"
              :disabled="modifiedLevels.size === 0"
              class="cancel-button"
            >
              Annulla
            </button>
          </div>

          <div class="bonus-info">
            <h3 class="section-subtitle">Bonus Ricariche</h3>
            <p class="bonus-description">
              <strong>Bonus Primo Ricarico:</strong> 50% dell'importo ricaricato (configurato nel backend)
            </p>
          </div>
        </div>
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
import { getAllUsersAdmin, getAllDomainsAdmin, getAllCouponsAdmin, getPricingConfig, updateDomainLevel } from '@/services/catalyst'

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

// Coupons management state
const couponsData = ref([])
const couponsLoading = ref(false)
const couponsError = ref(null)
const couponsSearchQuery = ref('')

// Pricing management state
const domainLevels = ref([])
const originalLevels = ref([])
const pricingLoading = ref(false)
const pricingError = ref(null)
const modifiedLevels = ref(new Set())
const savingPricing = ref(false)

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

// Load coupons data
const loadCoupons = async () => {
  couponsLoading.value = true
  couponsError.value = null

  try {
    const coupons = await getAllCouponsAdmin()
    couponsData.value = coupons
    console.log('Loaded', coupons.length, 'coupons:', coupons)
  } catch (error) {
    console.error('Error loading coupons:', error)
    couponsError.value = error.message || 'Errore nel caricamento dei coupon'
    showToast('Errore nel caricamento dei coupon', 'error')
  } finally {
    couponsLoading.value = false
  }
}

// Filtered coupons based on search query
const filteredCoupons = computed(() => {
  if (!couponsSearchQuery.value.trim()) {
    return couponsData.value
  }

  const query = couponsSearchQuery.value.toLowerCase().trim()

  return couponsData.value.filter(coupon => {
    const couponCode = (coupon.couponCode || '').toLowerCase()
    const ownerNickname = (coupon.ownerNickname || '').toLowerCase()
    const ownerEmail = (coupon.ownerEmail || '').toLowerCase()
    return couponCode.includes(query) || ownerNickname.includes(query) || ownerEmail.includes(query)
  })
})

// Load pricing config
const loadPricing = async () => {
  pricingLoading.value = true
  pricingError.value = null

  try {
    console.log('Loading pricing config...')
    const levels = await getPricingConfig()
    domainLevels.value = levels
    // Keep a copy of original values
    originalLevels.value = JSON.parse(JSON.stringify(levels))
    modifiedLevels.value.clear()
    console.log('Loaded', levels.length, 'domain levels')
  } catch (error) {
    console.error('Error loading pricing config:', error)
    pricingError.value = error.message || 'Errore nel caricamento configurazione prezzi'
    showToast('Errore nel caricamento configurazione prezzi', 'error')
  } finally {
    pricingLoading.value = false
  }
}

// Mark level as modified
const markAsModified = (rowId) => {
  modifiedLevels.value.add(rowId)
}

// Save pricing changes
const savePricingChanges = async () => {
  if (modifiedLevels.value.size === 0) return

  savingPricing.value = true

  try {
    // Update each modified level
    const updates = Array.from(modifiedLevels.value).map(rowId => {
      const level = domainLevels.value.find(l => l.rowId === rowId)
      return updateDomainLevel(level.rowId, level.coefficient)
    })

    await Promise.all(updates)

    // Reload pricing config to get fresh data
    await loadPricing()

    showToast('Modifiche salvate con successo', 'success')
    modifiedLevels.value.clear()
  } catch (error) {
    console.error('Error saving pricing changes:', error)
    showToast('Errore nel salvataggio delle modifiche', 'error')
  } finally {
    savingPricing.value = false
  }
}

// Reset pricing changes
const resetPricingChanges = () => {
  domainLevels.value = JSON.parse(JSON.stringify(originalLevels.value))
  modifiedLevels.value.clear()
}

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

  // Load all admin data (don't block on errors)
  try {
    await Promise.all([loadUsers(), loadDomains(), loadCoupons(), loadPricing()])
  } catch (error) {
    console.error('Error loading admin data:', error)
    // Errors are already handled in individual load functions
  }
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

/* Coupon status badges */
.status-available {
  font-weight: 500;
  color: #10b981;
}

.status-used {
  font-weight: 500;
  color: #6b7280;
}

/* Pricing management */
.section-subtitle {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 0.5rem 0;
}

.section-description {
  color: #6b7280;
  font-size: 0.95rem;
  margin: 0 0 1.5rem 0;
}

.pricing-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.pricing-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.pricing-label {
  font-weight: 500;
  color: #374151;
  font-size: 0.95rem;
  text-transform: capitalize;
}

.pricing-input {
  padding: 0.5rem 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  font-size: 0.95rem;
  transition: border-color 0.15s;
}

.pricing-input:focus {
  outline: none;
  border-color: #10b981;
}

.modified-indicator {
  color: #10b981;
  font-weight: 700;
  margin-left: 0.25rem;
}

.pricing-actions {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 2rem;
}

.save-button {
  padding: 0.5rem 1.5rem;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s;
}

.save-button:hover:not(:disabled) {
  background: #059669;
}

.save-button:disabled {
  background: #d1d5db;
  cursor: not-allowed;
}

.cancel-button {
  padding: 0.5rem 1.5rem;
  background: white;
  color: #374151;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
}

.cancel-button:hover:not(:disabled) {
  background: #f9fafb;
}

.cancel-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.bonus-info {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #e5e7eb;
}

.bonus-description {
  color: #374151;
  font-size: 0.95rem;
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
