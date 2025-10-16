<template>
  <div class="dashboard-container">
    <!-- Header with greeting -->
    <div class="dashboard-header">
      <h1 class="greeting">CIAO, {{ userName }}</h1>
      <p class="subtitle">Gestisci i tuoi domini blockchain .calcio</p>

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
          <span class="stat-icon">💳</span>
          <span class="stat-label">Crediti</span>
        </div>
        <div class="stat-value">0 €</div>
        <div class="stat-description">Saldo disponibile</div>
        <button class="stat-action">💳 Ricarica</button>
      </div>

      <div class="stat-card">
        <div class="stat-header">
          <span class="stat-icon">🎁</span>
          <span class="stat-label">COUPON</span>
        </div>
        <div class="stat-value">0</div>
      </div>

      <div class="stat-card">
        <div class="stat-header">
          <span class="stat-icon">🌐</span>
          <span class="stat-label">DOMINI ACQUISTATI</span>
        </div>
        <div class="stat-value">0</div>
      </div>

      <div class="stat-card">
        <div class="stat-header">
          <span class="stat-icon">💰</span>
          <span class="stat-label">TOTALE SPESO</span>
        </div>
        <div class="stat-value">0 €</div>
        <div class="stat-description">Acquisti e spese totali</div>
      </div>

      <div class="stat-card">
        <div class="stat-header">
          <span class="stat-icon">📈</span>
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
      <div v-if="activeTab === 'operazioni'" class="empty-state">
        <div class="empty-icon">📋</div>
        <h2 class="empty-title">NESSUNA OPERAZIONE REGISTRATA</h2>
        <p class="empty-description">Non hai ancora effettuato nessuna operazione (acquisti, vendite, ricariche)</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth0 } from '@auth0/auth0-vue'

const router = useRouter()
const { user, logout } = useAuth0()

// Active tab state
const activeTab = ref('domini')

const userName = computed(() => {
  if (!user.value) return 'UTENTE'
  const name = user.value.name || user.value.nickname || user.value.email
  return name.toUpperCase()
})

const handleLogout = () => {
  logout({
    logoutParams: {
      returnTo: 'https://calciodomains-yqdhfgao.onslate.eu'
    }
  })
}
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

.greeting {
  font-size: 1.75rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 0.25rem 0;
}

.subtitle {
  color: #6b7280;
  margin: 0 0 1rem 0;
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
}
</style>