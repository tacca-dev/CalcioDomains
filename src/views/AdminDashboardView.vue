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

        <!-- Loading state -->
        <div v-if="usersLoading || domainsLoading || couponsLoading" class="state-message">
          Caricamento statistiche...
        </div>

        <!-- Statistics cards -->
        <div v-else class="stats-grid">
          <!-- Utenti -->
          <div class="stat-card">
            <div class="stat-content">
              <h3 class="stat-title">Utenti</h3>
              <div class="stat-details">
                <div class="stat-row">
                  <span class="stat-label">Totale Registrati</span>
                  <span class="stat-value">{{ usersData.length }}</span>
                </div>
                <div class="stat-row">
                  <span class="stat-label">Amministratori</span>
                  <span class="stat-value">{{ totalAdmins }}</span>
                </div>
                <div class="stat-row">
                  <span class="stat-label">Utenti Standard</span>
                  <span class="stat-value">{{ totalRegularUsers }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Domini -->
          <div class="stat-card">
            <div class="stat-content">
              <h3 class="stat-title">Domini</h3>
              <div class="stat-details">
                <div class="stat-row">
                  <span class="stat-label">Totale Venduti</span>
                  <span class="stat-value">{{ domainsData.length }}</span>
                </div>
                <div class="stat-row">
                  <span class="stat-label">Revenue Totale</span>
                  <span class="stat-value highlight">{{ formatCurrency(totalRevenue) }}</span>
                </div>
                <div class="stat-row">
                  <span class="stat-label">Prezzo Medio</span>
                  <span class="stat-value">{{ formatCurrency(averageDomainPrice) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Coupon -->
          <div class="stat-card">
            <div class="stat-content">
              <h3 class="stat-title">Coupon</h3>
              <div class="stat-details">
                <div class="stat-row">
                  <span class="stat-label">Totale Creati</span>
                  <span class="stat-value">{{ couponsData.length }}</span>
                </div>
                <div class="stat-row">
                  <span class="stat-label">Disponibili</span>
                  <span class="stat-value success">{{ availableCoupons }}</span>
                </div>
                <div class="stat-row">
                  <span class="stat-label">Usati</span>
                  <span class="stat-value muted">{{ usedCoupons }}</span>
                </div>
                <div class="stat-row">
                  <span class="stat-label">Valore Totale Disponibile</span>
                  <span class="stat-value">{{ formatCurrency(totalAvailableCouponValue) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Ordini -->
          <div class="stat-card">
            <div class="stat-content">
              <h3 class="stat-title">Ordini</h3>
              <div class="stat-details">
                <div class="stat-row">
                  <span class="stat-label">Totale Ordini Pagati</span>
                  <span class="stat-value">{{ totalOrders }}</span>
                </div>
                <div class="stat-row">
                  <span class="stat-label">Ordine Medio</span>
                  <span class="stat-value">{{ formatCurrency(averageOrderValue) }}</span>
                </div>
                <div class="stat-row">
                  <span class="stat-label">Domini per Ordine (Media)</span>
                  <span class="stat-value">{{ averageDomainsPerOrder }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Crediti -->
          <div class="stat-card">
            <div class="stat-content">
              <h3 class="stat-title">Crediti Utenti</h3>
              <div class="stat-details">
                <div class="stat-row">
                  <span class="stat-label">Credito Totale Sistema</span>
                  <span class="stat-value highlight">{{ formatCurrency(totalSystemCredits) }}</span>
                </div>
                <div class="stat-row">
                  <span class="stat-label">Credito Medio per Utente</span>
                  <span class="stat-value">{{ formatCurrency(averageUserCredits) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
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

        <!-- Loading state -->
        <div v-if="promptsLoading" class="state-message">
          Caricamento prompt...
        </div>

        <!-- Error state -->
        <div v-else-if="promptsError" class="state-message error">
          Errore: {{ promptsError }}
        </div>

        <!-- Prompts editor -->
        <div v-else>
          <p class="section-description">
            Modifica i prompt AI utilizzati dal sistema per la valutazione dei domini.
          </p>

          <div class="prompts-list">
            <div v-for="prompt in promptsData" :key="prompt.rowId" class="prompt-item">
              <div class="prompt-header">
                <label class="prompt-label">{{ prompt.keyname }}</label>
                <span v-if="modifiedPrompts.has(prompt.rowId)" class="modified-indicator">*</span>
              </div>
              <p v-if="prompt.description" class="prompt-description">{{ prompt.description }}</p>
              <textarea
                v-model="prompt.content"
                class="prompt-textarea"
                rows="8"
                @input="markPromptAsModified(prompt.rowId)"
              ></textarea>
            </div>
          </div>

          <div class="pricing-actions">
            <button
              @click="savePromptChanges"
              :disabled="modifiedPrompts.size === 0 || savingPrompts"
              class="save-button"
            >
              {{ savingPrompts ? 'Salvataggio...' : 'Salva Modifiche' }}
            </button>
            <button
              @click="resetPromptChanges"
              :disabled="modifiedPrompts.size === 0"
              class="cancel-button"
            >
              Annulla
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUser } from '@/composables/useUser'
import { useToast } from '@/composables/useToast'
import { getAllUsersAdmin, getAllDomainsAdmin, getAllCouponsAdmin, getPricingConfig, updateDomainLevel, getPromptsAdmin, updatePrompt } from '@/services/catalyst'

const router = useRouter()
const { isAdmin, isInitialized, enableAdminMode, disableAdminMode } = useUser()
const { showToast } = useToast()

// MOCK AUTH MODE: Hardcoded to true for Builder.io preview
const isMockAuth = true

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

// Prompts management state
const promptsData = ref([])
const originalPrompts = ref([])
const promptsLoading = ref(false)
const promptsError = ref(null)
const modifiedPrompts = ref(new Set())
const savingPrompts = ref(false)

// Load users data
const loadUsers = async () => {
  usersLoading.value = true
  usersError.value = null

  try {
    // MOCK AUTH MODE: Use mock data
    if (isMockAuth) {
      console.log('🔧 MOCK AUTH: Utenti mock')
      usersData.value = [
        {
          ROWID: '999999',
          nickname: 'devuser',
          email: 'dev@calciodomains.local',
          credits: 100,
          isAdmin: true,
          createdAt: new Date().toISOString()
        },
        {
          ROWID: '999998',
          nickname: 'testuser',
          email: 'test@calciodomains.local',
          credits: 50,
          isAdmin: false,
          createdAt: new Date().toISOString()
        }
      ]
      usersLoading.value = false
      return
    }

    const users = await getAllUsersAdmin()
    usersData.value = users
    console.log('Loaded', users.length, 'users')
  } catch (error) {
    console.error('Error loading users:', error)
    usersError.value = error.message || 'Errore nel caricamento degli utenti'
    showToast({ message: 'Errore nel caricamento degli utenti', type: 'error' })
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

// Statistics computed properties
const totalAdmins = computed(() => {
  return usersData.value.filter(user => user.isAdmin).length
})

const totalRegularUsers = computed(() => {
  return usersData.value.filter(user => !user.isAdmin).length
})

const totalRevenue = computed(() => {
  return domainsData.value.reduce((sum, domain) => sum + (domain.price || 0), 0)
})

const averageDomainPrice = computed(() => {
  if (domainsData.value.length === 0) return 0
  return totalRevenue.value / domainsData.value.length
})

const availableCoupons = computed(() => {
  return couponsData.value.filter(coupon => coupon.status === 'available').length
})

const usedCoupons = computed(() => {
  return couponsData.value.filter(coupon => coupon.status === 'used').length
})

const totalAvailableCouponValue = computed(() => {
  return couponsData.value
    .filter(coupon => coupon.status === 'available')
    .reduce((sum, coupon) => sum + (coupon.amount || 0), 0)
})

const totalOrders = computed(() => {
  // Count unique orders from domains (since each domain has purchaseDate from an order)
  const orderDates = new Set()
  usersData.value.forEach(user => {
    if (user.totalOrders > 0) {
      orderDates.add(user.rowId + '-' + user.totalOrders)
    }
  })
  return usersData.value.reduce((sum, user) => sum + (user.totalOrders || 0), 0)
})

const averageOrderValue = computed(() => {
  if (totalOrders.value === 0) return 0
  return totalRevenue.value / totalOrders.value
})

const averageDomainsPerOrder = computed(() => {
  if (totalOrders.value === 0) return 0
  return (domainsData.value.length / totalOrders.value).toFixed(1)
})

const totalSystemCredits = computed(() => {
  return usersData.value.reduce((sum, user) => sum + (user.credits || 0), 0)
})

const averageUserCredits = computed(() => {
  if (usersData.value.length === 0) return 0
  return totalSystemCredits.value / usersData.value.length
})

// Load domains data
const loadDomains = async () => {
  domainsLoading.value = true
  domainsError.value = null

  try {
    // MOCK AUTH MODE: Use mock data
    if (isMockAuth) {
      console.log('🔧 MOCK AUTH: Domini mock')
      domainsData.value = [
        {
          ROWID: '1',
          domainName: 'esempio.calcio',
          category: 'premium',
          level: 3,
          buyerNickname: 'devuser',
          buyerEmail: 'dev@calciodomains.local',
          purchaseDate: new Date().toISOString()
        },
        {
          ROWID: '2',
          domainName: 'test.football',
          category: 'standard',
          level: 1,
          buyerNickname: 'testuser',
          buyerEmail: 'test@calciodomains.local',
          purchaseDate: new Date().toISOString()
        }
      ]
      domainsLoading.value = false
      return
    }

    const domains = await getAllDomainsAdmin()
    domainsData.value = domains
    console.log('Loaded', domains.length, 'domains')
  } catch (error) {
    console.error('Error loading domains:', error)
    domainsError.value = error.message || 'Errore nel caricamento dei domini'
    showToast({ message: 'Errore nel caricamento dei domini', type: 'error' })
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
    // MOCK AUTH MODE: Use mock data
    if (isMockAuth) {
      console.log('🔧 MOCK AUTH: Coupon mock con 3 esempi')
      couponsData.value = [
        {
          ROWID: 'mock-coupon-1',
          id: 'mock-coupon-1',
          couponCode: 'SUMMER2024',
          amount: 10,
          discountPercentage: 20,
          status: 'available',
          ownerNickname: 'devuser',
          ownerEmail: 'dev@calciodomains.local',
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          ROWID: 'mock-coupon-2',
          id: 'mock-coupon-2',
          couponCode: 'WELCOME10',
          amount: 5,
          discountPercentage: 10,
          status: 'available',
          ownerNickname: 'devuser',
          ownerEmail: 'dev@calciodomains.local',
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          ROWID: 'mock-coupon-3',
          id: 'mock-coupon-3',
          couponCode: 'PROMO15',
          amount: 7.5,
          discountPercentage: 15,
          status: 'used',
          ownerNickname: 'testuser',
          ownerEmail: 'test@calciodomains.local',
          createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          expiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]
      couponsLoading.value = false
      return
    }

    const coupons = await getAllCouponsAdmin()
    couponsData.value = coupons
    console.log('Loaded', coupons.length, 'coupons:', coupons)
  } catch (error) {
    console.error('Error loading coupons:', error)
    couponsError.value = error.message || 'Errore nel caricamento dei coupon'
    showToast({ message: 'Errore nel caricamento dei coupon', type: 'error' })
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
    // MOCK AUTH MODE: Use mock data
    if (isMockAuth) {
      console.log('🔧 MOCK AUTH: Prezzi mock')
      const mockLevels = [
        { rowId: '1', level: 1, coefficient: 1.0 },
        { rowId: '2', level: 2, coefficient: 1.5 },
        { rowId: '3', level: 3, coefficient: 2.0 }
      ]
      domainLevels.value = mockLevels
      originalLevels.value = JSON.parse(JSON.stringify(mockLevels))
      modifiedLevels.value.clear()
      pricingLoading.value = false
      return
    }

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
    showToast({ message: 'Errore nel caricamento configurazione prezzi', type: 'error' })
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

    showToast({ message: 'Modifiche salvate con successo', type: 'success' })
    modifiedLevels.value.clear()
  } catch (error) {
    console.error('Error saving pricing changes:', error)
    showToast({ message: 'Errore nel salvataggio delle modifiche', type: 'error' })
  } finally {
    savingPricing.value = false
  }
}

// Reset pricing changes
const resetPricingChanges = () => {
  domainLevels.value = JSON.parse(JSON.stringify(originalLevels.value))
  modifiedLevels.value.clear()
}

// Load prompts data
const loadPrompts = async () => {
  promptsLoading.value = true
  promptsError.value = null

  try {
    // MOCK AUTH MODE: Use mock data
    if (isMockAuth) {
      console.log('🔧 MOCK AUTH: Prompts mock')
      const mockPrompts = [
        {
          rowId: '1',
          category: 'system',
          promptText: 'Mock system prompt for dev mode'
        }
      ]
      promptsData.value = mockPrompts
      originalPrompts.value = JSON.parse(JSON.stringify(mockPrompts))
      modifiedPrompts.value.clear()
      promptsLoading.value = false
      return
    }

    console.log('Loading prompts...')
    const prompts = await getPromptsAdmin()
    promptsData.value = prompts
    // Keep a copy of original values
    originalPrompts.value = JSON.parse(JSON.stringify(prompts))
    modifiedPrompts.value.clear()
    console.log('Loaded', prompts.length, 'prompts')
  } catch (error) {
    console.error('Error loading prompts:', error)
    promptsError.value = error.message || 'Errore nel caricamento dei prompt'
    showToast({ message: 'Errore nel caricamento dei prompt', type: 'error' })
  } finally {
    promptsLoading.value = false
  }
}

// Mark prompt as modified
const markPromptAsModified = (rowId) => {
  modifiedPrompts.value.add(rowId)
}

// Save prompt changes
const savePromptChanges = async () => {
  if (modifiedPrompts.value.size === 0) return

  savingPrompts.value = true

  try {
    // Update each modified prompt
    const updates = Array.from(modifiedPrompts.value).map(rowId => {
      const prompt = promptsData.value.find(p => p.rowId === rowId)
      return updatePrompt(prompt.rowId, prompt.content)
    })

    await Promise.all(updates)

    // Reload prompts to get fresh data
    await loadPrompts()

    showToast({ message: 'Prompt aggiornati con successo', type: 'success' })
    modifiedPrompts.value.clear()
  } catch (error) {
    console.error('Error saving prompt changes:', error)
    showToast({ message: 'Errore nel salvataggio dei prompt', type: 'error' })
  } finally {
    savingPrompts.value = false
  }
}

// Reset prompt changes
const resetPromptChanges = () => {
  promptsData.value = JSON.parse(JSON.stringify(originalPrompts.value))
  modifiedPrompts.value.clear()
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
    showToast({ message: 'Accesso negato: solo gli amministratori possono accedere a questa pagina', type: 'error' })
    router.push('/dashboard')
    return
  }

  // Abilita admin mode
  enableAdminMode()
  console.log('Admin dashboard accessed successfully')

  // Load all admin data (don't block on errors)
  try {
    await Promise.all([loadUsers(), loadDomains(), loadCoupons(), loadPricing(), loadPrompts()])
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

/* Statistics */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
}

.stat-card {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1.5rem;
  transition: all 0.15s;
}

.stat-card:hover {
  border-color: #d1d5db;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.stat-content {
  width: 100%;
}

.stat-title {
  font-size: 1rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 1rem 0;
}

.stat-details {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.stat-label {
  font-size: 0.875rem;
  color: #6b7280;
  flex: 1;
}

.stat-value {
  font-size: 0.95rem;
  font-weight: 600;
  color: #1a1a1a;
  white-space: nowrap;
}

.stat-value.highlight {
  color: #10b981;
  font-size: 1.1rem;
}

.stat-value.success {
  color: #10b981;
}

.stat-value.muted {
  color: #6b7280;
}

/* Prompts management */
.prompts-list {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  margin-bottom: 1.5rem;
}

.prompt-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.prompt-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.prompt-label {
  font-weight: 600;
  color: #1a1a1a;
  font-size: 1rem;
  text-transform: capitalize;
}

.prompt-description {
  color: #6b7280;
  font-size: 0.875rem;
  margin: 0;
}

.prompt-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  font-size: 0.95rem;
  font-family: 'Courier New', monospace;
  line-height: 1.5;
  resize: vertical;
  transition: border-color 0.15s;
}

.prompt-textarea:focus {
  outline: none;
  border-color: #10b981;
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

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .stat-card {
    padding: 1.25rem;
  }
}
</style>
