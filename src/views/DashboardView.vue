<template>
  <div class="dashboard-container">
    <!-- Header with greeting -->
    <div class="dashboard-header">
      <div class="header-user">
        <div class="user-avatar-container">
          <img
            v-if="userAvatar"
            :src="userAvatar"
            alt="Avatar"
            class="user-avatar"
          />
          <div v-else class="user-avatar-placeholder">
            <span class="avatar-placeholder-icon">👤</span>
          </div>
        </div>
        <div class="user-info">
          <h1 class="greeting">CIAO, {{ userName }}</h1>
          <p class="subtitle">Gestisci i tuoi domini blockchain .calcio</p>
        </div>
      </div>

      <div class="header-actions">
        <button class="action-button" @click="$router.push('/profile')">
          <span class="icon">⚙</span>
          Profilo
        </button>
        <button class="action-button logout" @click="handleLogout">
          <span class="icon">↪</span>
          Esci
        </button>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-header">
          <span class="stat-label">Crediti</span>
        </div>
        <div class="stat-value">{{ userCredits.toFixed(2) }} €</div>
        <div class="stat-description">Saldo disponibile</div>
        <button class="stat-action" @click="showRechargeModal = true">💳 Ricarica</button>
      </div>

      <div class="stat-card">
        <div class="stat-header">
          <span class="stat-label">COUPON</span>
        </div>
        <div class="stat-value">0</div>
      </div>

      <div class="stat-card">
        <div class="stat-header">
          <span class="stat-label">DOMINI ACQUISTATI</span>
        </div>
        <div class="stat-value">{{ totalDomainsOwned }}</div>
      </div>

      <div class="stat-card">
        <div class="stat-header">
          <span class="stat-label">TOTALE SPESO</span>
        </div>
        <div class="stat-value">{{ totalSpent.toFixed(2) }} €</div>
        <div class="stat-description">Acquisti e spese totali</div>
      </div>

      <div class="stat-card">
        <div class="stat-header">
          <span class="stat-label">TOTALE VENDUTO</span>
        </div>
        <div class="stat-value">0 €</div>
        <div class="stat-description">Guadagni dalle vendite</div>
      </div>
    </div>

    <!-- Action Tabs -->
    <div class="action-tabs">
      <button
        class="tab-button"
        :class="{ active: activeTab === 'domini' }"
        @click="activeTab = 'domini'"
      >
        I Miei Domini
      </button>
      <button
        class="tab-button"
        :class="{ active: activeTab === 'coupons' }"
        @click="activeTab = 'coupons'"
      >
        I Miei Coupons
      </button>
      <button
        class="tab-button"
        :class="{ active: activeTab === 'operazioni' }"
        @click="activeTab = 'operazioni'"
      >
        Operazioni
      </button>
      <button
        class="tab-button primary"
        @click="$router.push('/domains')"
      >
        Cerca Nuovi Domini
      </button>
    </div>

    <!-- Tab Content -->
    <div class="tab-content">
      <!-- I Miei Domini Tab -->
      <div v-if="activeTab === 'domini'" class="empty-state">
        <div class="empty-icon">🔍</div>
        <h2 class="empty-title">NESSUN DOMINIO BLOCKCHAIN TROVATO</h2>
        <p class="empty-description">Non hai ancora acquistato nessun dominio blockchain .calcio</p>
      </div>

      <!-- I Miei Coupons Tab -->
      <div v-if="activeTab === 'coupons'" class="empty-state">
        <div class="empty-icon">🎁</div>
        <h2 class="empty-title">NESSUN COUPON DISPONIBILE</h2>
        <p class="empty-description">Non hai ancora ricevuto nessun coupon sconto</p>
      </div>

      <!-- Operazioni Tab -->
      <div v-if="activeTab === 'operazioni'">
        <!-- Loading state -->
        <div v-if="ordersLoading" class="loading-state">
          <div class="spinner"></div>
          <p>Caricamento operazioni...</p>
        </div>

        <!-- Empty state -->
        <div v-else-if="userOrders.length === 0" class="empty-state">
          <div class="empty-icon">📋</div>
          <h2 class="empty-title">NESSUNA OPERAZIONE REGISTRATA</h2>
          <p class="empty-description">Non hai ancora effettuato nessun acquisto completato</p>
        </div>

        <!-- Orders list -->
        <div v-else class="orders-list">
          <div v-for="order in userOrders" :key="order.id" class="order-card">
            <div class="order-header">
              <div class="order-info">
                <span class="order-id">Ordine #{{ order.id }}</span>
                <span class="order-date">{{ formatDate(order.createdAt) }}</span>
              </div>
              <div class="order-status">
                <span class="status-badge status-paid">✓ Completato</span>
              </div>
            </div>

            <div class="order-body">
              <div class="order-domains">
                <h4 class="domains-title">Domini acquistati:</h4>
                <ul class="domains-list">
                  <li v-for="domain in order.domains" :key="domain.domain_name" class="domain-item">
                    <span class="domain-name">{{ domain.domain_name }}</span>
                    <span class="domain-price">{{ domain.price.toFixed(2) }} €</span>
                  </li>
                </ul>
              </div>
            </div>

            <div class="order-footer">
              <div class="order-total">
                <span class="total-label">Totale pagato:</span>
                <span class="total-amount">{{ order.totalAmount.toFixed(2) }} €</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recharge Modal -->
    <RechargeModal
      v-if="showRechargeModal"
      @close="showRechargeModal = false"
      @recharge="handleRecharge"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuth0 } from '@auth0/auth0-vue'
import axios from 'axios'
import { getUserData, getAvatarUrl, getUserOrders, createRechargeCheckout } from '@/services/catalyst'
import RechargeModal from '@/components/RechargeModal.vue'
import { useToast } from '@/composables/useToast'

const { user, getAccessTokenSilently, logout } = useAuth0()

// Toast notifications
const { error: toastError } = useToast()

// Active tab state
const activeTab = ref('domini')

// User data from Catalyst
const userName = ref('UTENTE')
const userAvatar = ref(null)
const userOrders = ref([])
const ordersLoading = ref(false)
const userCredits = ref(0)
const totalDomainsOwned = ref(0)
const totalSpent = ref(0)

// Recharge modal
const showRechargeModal = ref(false)

// Load user data from Catalyst
const loadUserData = async () => {
  try {
    if (!user.value) return

    // 1. Get catalystRowId from Auth0
    const token = await getAccessTokenSilently({
      authorizationParams: {
        audience: 'https://dev-giylww0unln6dunq.eu.auth0.com/api/v2/',
        scope: 'read:current_user'
      }
    })

    const auth0Response = await axios.get(
      `https://dev-giylww0unln6dunq.eu.auth0.com/api/v2/users/${user.value.sub}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )

    const catalystRowId = auth0Response.data.user_metadata?.catalystRowId

    if (!catalystRowId) {
      console.warn('catalystRowId non trovato, uso dati Auth0 come fallback')
      userName.value = (user.value.name || user.value.nickname || user.value.email || 'UTENTE').toUpperCase()
      return
    }

    // 2. Fetch user data from Catalyst using centralized function
    const userData = await getUserData(catalystRowId)

    // Set user name
    userName.value = (userData.name || userData.nickname || user.value.email || 'UTENTE').toUpperCase()

    // Set avatar if exists
    if (userData.avatar_file_id) {
      userAvatar.value = getAvatarUrl(catalystRowId)
    }

    // Set user credits
    userCredits.value = parseFloat(userData.credits || 0)
    console.log('💰 Crediti caricati:', userCredits.value)

  } catch (err) {
    console.error('Error loading user data:', err)
    // Fallback to Auth0 data
    if (user.value) {
      userName.value = (user.value.name || user.value.nickname || user.value.email || 'UTENTE').toUpperCase()
    }
  }
}

// Load user orders
const loadUserOrders = async () => {
  try {
    ordersLoading.value = true

    if (!user.value) return

    // Get catalystRowId from Auth0
    const token = await getAccessTokenSilently({
      authorizationParams: {
        audience: 'https://dev-giylww0unln6dunq.eu.auth0.com/api/v2/',
        scope: 'read:current_user'
      }
    })

    const auth0Response = await axios.get(
      `https://dev-giylww0unln6dunq.eu.auth0.com/api/v2/users/${user.value.sub}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )

    const catalystRowId = auth0Response.data.user_metadata?.catalystRowId

    if (!catalystRowId) {
      console.warn('catalystRowId non trovato')
      return
    }

    // Fetch orders (getUserOrders returns only 'paid' orders)
    const orders = await getUserOrders(catalystRowId)
    userOrders.value = orders

    // Calculate stats from completed orders only
    if (orders && orders.length > 0) {
      // Count total domains (each order has multiple domains)
      let domainsCount = 0
      let totalAmount = 0

      orders.forEach(order => {
        // Only count domains from completed orders (status = 'paid')
        if (order.domains && Array.isArray(order.domains)) {
          domainsCount += order.domains.length
        }
        totalAmount += parseFloat(order.totalAmount || 0)
      })

      totalDomainsOwned.value = domainsCount
      totalSpent.value = totalAmount

      console.log('✅ Ordini completati:', orders.length)
      console.log('📊 Domini acquistati:', domainsCount)
      console.log('💸 Totale speso:', totalAmount.toFixed(2), '€')
    } else {
      totalDomainsOwned.value = 0
      totalSpent.value = 0
      console.log('✅ Nessun ordine completato trovato')
    }
  } catch (err) {
    console.error('Error loading user orders:', err)
  } finally {
    ordersLoading.value = false
  }
}

// Format date helper
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('it-IT', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

const handleLogout = () => {
  logout({
    logoutParams: {
      returnTo: 'https://calciodomains-yqdhfgao.onslate.eu'
    }
  })
}

// Handle recharge: create checkout session and redirect to Stripe
const handleRecharge = async (rechargeData) => {
  try {
    if (!user.value) {
      toastError('Devi effettuare il login per ricaricare', 3000)
      showRechargeModal.value = false
      return
    }

    console.log('🚀 Creazione Stripe Checkout Session per ricarica...', rechargeData)

    // Get catalystRowId from Auth0
    const token = await getAccessTokenSilently({
      authorizationParams: {
        audience: 'https://dev-giylww0unln6dunq.eu.auth0.com/api/v2/',
        scope: 'read:current_user'
      }
    })

    const auth0Response = await axios.get(
      `https://dev-giylww0unln6dunq.eu.auth0.com/api/v2/users/${user.value.sub}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )

    const catalystRowId = auth0Response.data.user_metadata?.catalystRowId

    if (!catalystRowId) {
      toastError('Impossibile identificare l\'utente. Riprova ad effettuare il login.', 4000)
      showRechargeModal.value = false
      return
    }

    // Create recharge checkout session
    const { checkoutUrl, sessionId } = await createRechargeCheckout(
      catalystRowId,
      rechargeData.amount,
      rechargeData.coupon
    )

    console.log('✅ Recharge Checkout Session creata:', sessionId)
    console.log('Redirect a:', checkoutUrl)

    // Redirect to Stripe Checkout
    window.location.href = checkoutUrl
  } catch (error) {
    console.error('❌ Errore durante la creazione della ricarica:', error)
    toastError('Errore creando la sessione di pagamento. Riprova.', 4000)
    showRechargeModal.value = false
  }
}

// Load user data on mount
onMounted(() => {
  loadUserData()
  loadUserOrders()
})
</script>

<style scoped>
.dashboard-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
}

/* Header */
.dashboard-header {
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.header-user {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.user-avatar-container {
  flex-shrink: 0;
}

.user-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #e5e7eb;
}

.user-avatar-placeholder {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #f3f4f6;
  border: 3px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-placeholder-icon {
  font-size: 2.5rem;
  opacity: 0.3;
}

.user-info {
  flex: 1;
}

.greeting {
  font-size: 1.75rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 0.25rem 0;
}

.subtitle {
  color: #6b7280;
  margin: 0;
  font-size: 0.95rem;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
}

.action-button {
  background: white;
  border: 1px solid #e5e7eb;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #1a1a1a;
  transition: all 0.2s ease;
}

.action-button:hover {
  background: #f9fafb;
  border-color: #d1d5db;
}

.action-button .icon {
  font-size: 1rem;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  padding: 1.25rem;
}

.stat-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.stat-icon {
  font-size: 1.25rem;
}

.stat-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.stat-value {
  font-size: 1.875rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 0.25rem;
}

.stat-description {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 1rem;
}

.stat-action {
  background: #10b981;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  width: 100%;
  transition: background 0.2s ease;
}

.stat-action:hover {
  background: #059669;
}

/* Verification Banner */
.verification-banner {
  background: #fef3c7;
  border: 1px solid #fde68a;
  border-radius: 4px;
  padding: 1rem 1.25rem;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 2rem;
}

.banner-icon {
  font-size: 1.25rem;
  flex-shrink: 0;
}

.banner-content {
  flex: 1;
}

.banner-content strong {
  display: block;
  color: #92400e;
  margin-bottom: 0.25rem;
  font-size: 0.95rem;
}

.banner-content p {
  color: #78350f;
  margin: 0;
  font-size: 0.875rem;
}

.banner-action {
  background: white;
  border: 1px solid #fde68a;
  color: #92400e;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.banner-action:hover {
  background: #fefce8;
}

/* Action Tabs */
.action-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.tab-button {
  background: white;
  border: 1px solid #e5e7eb;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  color: #1a1a1a;
  transition: all 0.2s ease;
}

.tab-button:hover {
  background: #f9fafb;
  border-color: #d1d5db;
}

.tab-button.active {
  background: #fff7ed;
  border-color: #fb923c;
  color: #ea580c;
}

.tab-button.primary {
  background: #10b981;
  border-color: #10b981;
  color: white;
}

.tab-button.primary:hover {
  background: #059669;
  border-color: #059669;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.empty-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 0.5rem 0;
  letter-spacing: 0.025em;
}

.empty-description {
  color: #6b7280;
  margin: 0;
  font-size: 0.95rem;
}

/* Loading State */
.loading-state {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
}

.spinner {
  width: 40px;
  height: 40px;
  margin: 0 auto 1rem;
  border: 3px solid #e5e7eb;
  border-top-color: #10b981;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-state p {
  color: #6b7280;
  margin: 0;
  font-size: 0.95rem;
}

/* Orders List */
.orders-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.order-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.order-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.order-id {
  font-weight: 600;
  color: #1a1a1a;
  font-size: 0.95rem;
}

.order-date {
  font-size: 0.875rem;
  color: #6b7280;
}

.order-status {
  flex-shrink: 0;
}

.status-badge {
  padding: 0.375rem 0.75rem;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 500;
}

.status-paid {
  background: #d1fae5;
  color: #065f46;
}

.order-body {
  padding: 1.25rem;
}

.order-domains {
  margin: 0;
}

.domains-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #6b7280;
  margin: 0 0 0.75rem 0;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.domains-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.domain-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: #f9fafb;
  border-radius: 4px;
  border: 1px solid #e5e7eb;
}

.domain-name {
  font-weight: 500;
  color: #1a1a1a;
  font-size: 0.95rem;
}

.domain-price {
  font-weight: 600;
  color: #10b981;
  font-size: 0.95rem;
}

.order-footer {
  padding: 1rem 1.25rem;
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
}

.order-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.total-label {
  font-size: 0.95rem;
  font-weight: 500;
  color: #6b7280;
}

.total-amount {
  font-size: 1.25rem;
  font-weight: 700;
  color: #10b981;
}

/* Responsive */
@media (max-width: 768px) {
  .dashboard-container {
    padding: 1rem;
  }

  .greeting {
    font-size: 1.5rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .header-actions {
    flex-direction: column;
  }

  .action-button {
    width: 100%;
    justify-content: center;
  }

  .verification-banner {
    flex-direction: column;
  }

  .banner-action {
    width: 100%;
  }

  .action-tabs {
    flex-direction: column;
  }

  .tab-button {
    width: 100%;
  }

  .order-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .domain-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}
</style>