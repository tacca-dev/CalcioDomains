import { ref, readonly, computed } from 'vue'
import { getUserData, getUserCoupons } from '@/services/catalyst'

// ============================================
// STATE GLOBALE (condiviso tra tutti i componenti)
// ============================================

// Dati IMMUTABILI durante la sessione
const catalystRowId = ref(null)
const email = ref(null)
const name = ref(null)
const nickname = ref(null)

// Dati MUTABILI (sincronizzati con backend quando cambiano)
const credits = ref(0)
const avatar = ref(null)
const stripeCustomerId = ref(null)

// Coupon management
const availableCoupons = ref([])
const firstRechargeBonusAvailable = ref(false)
const isAdmin = ref(false)

// Admin mode state (persisted in localStorage)
const adminMode = ref(localStorage.getItem('adminMode') === 'true')

// Flags
const isInitialized = ref(false)
const isInitializing = ref(false)

/**
 * Composable per gestire i dati utente
 * - Carica TUTTO una sola volta all'inizio della sessione
 * - Mantiene i dati in memoria per tutta la sessione
 * - Aggiorna localmente quando l'utente fa azioni (ricarica, acquisto, modifica profilo)
 * - Garantisce consistenza tra frontend e database
 */
export function useUser() {
  // DEV MODE: Check for dev_mode query parameter (for Builder.io preview)
  const urlParams = new URLSearchParams(window.location.search)
  const isDevMode = urlParams.get('dev_mode') === 'true'

  if (isDevMode) {
    console.log('🔧 DEV MODE ATTIVO: Utilizzo mock user per Builder.io preview')

    // Return mock admin user with all necessary data
    return {
      // State IMMUTABILE
      catalystRowId: readonly(ref('999999')),
      email: readonly(ref('dev@calciodomains.local')),
      name: readonly(ref('Dev User')),
      nickname: readonly(ref('devuser')),
      stripeCustomerId: readonly(ref('cus_mock_stripe_id')),
      isAdmin: readonly(ref(true)),

      // State MUTABILE
      credits: ref(100),
      avatar: ref(null),

      // Coupon state
      availableCoupons: readonly(ref([])),
      availableCouponsCount: computed(() => 0),
      firstRechargeBonusAvailable: readonly(ref(false)),

      // Admin state
      adminMode: readonly(ref(true)),

      // Flags
      isInitialized: readonly(ref(true)),
      isInitializing: readonly(ref(false)),

      // Mock methods (no-op functions)
      initialize: async () => { console.log('DEV MODE: initialize() chiamato ma ignorato') },
      updateCredits: () => { console.log('DEV MODE: updateCredits() chiamato ma ignorato') },
      updateAvatar: () => { console.log('DEV MODE: updateAvatar() chiamato ma ignorato') },
      updateNickname: () => { console.log('DEV MODE: updateNickname() chiamato ma ignorato') },
      addCoupon: () => { console.log('DEV MODE: addCoupon() chiamato ma ignorato') },
      refreshCoupons: async () => { console.log('DEV MODE: refreshCoupons() chiamato ma ignorato') },
      clearAll: () => { console.log('DEV MODE: clearAll() chiamato ma ignorato') },
      forceReload: async () => { console.log('DEV MODE: forceReload() chiamato ma ignorato') },
      toggleAdminMode: () => { console.log('DEV MODE: toggleAdminMode() chiamato ma ignorato') },
      enableAdminMode: () => { console.log('DEV MODE: enableAdminMode() chiamato ma ignorato') },
      disableAdminMode: () => { console.log('DEV MODE: disableAdminMode() chiamato ma ignorato') }
    }
  }

  /**
   * Computed: numero di coupon disponibili (status = 'available')
   */
  const availableCouponsCount = computed(() =>
    availableCoupons.value.filter(c => c.status === 'available').length
  )

  /**
   * Ottieni catalystRowId da Auth0 user metadata
   * Questa funzione viene chiamata UNA SOLA VOLTA per sessione
   */
  async function getCatalystRowIdFromAuth0(user, getAccessTokenSilently) {
    try {
      console.log('🔄 Recupero catalystRowId da Auth0...')

      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: 'https://dev-giylww0unln6dunq.eu.auth0.com/api/v2/',
          scope: 'read:current_user'
        }
      })

      const response = await fetch(
        `https://dev-giylww0unln6dunq.eu.auth0.com/api/v2/users/${user.sub}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      if (!response.ok) {
        throw new Error('Errore recuperando dati Auth0')
      }

      const auth0Data = await response.json()
      const rowId = auth0Data.user_metadata?.catalystRowId

      if (!rowId) {
        throw new Error('catalystRowId non trovato in Auth0 user_metadata')
      }

      console.log('✅ CatalystRowId recuperato:', rowId)
      return rowId
    } catch (error) {
      console.error('❌ Errore ottenendo catalystRowId:', error)
      throw error
    }
  }

  /**
   * Inizializza i dati utente
   * Chiamata UNA SOLA VOLTA quando l'utente fa login
   * Carica TUTTI i dati dal database e li mantiene in memoria
   *
   * @param {Object} auth0User - User object da Auth0
   * @param {Function} getAccessTokenSilently - Funzione Auth0 per ottenere token
   */
  async function initialize(auth0User, getAccessTokenSilently) {
    // Se già inizializzato, non fare nulla
    if (isInitialized.value) {
      console.log('📦 Dati utente già inizializzati (dalla cache)')
      return
    }

    // Se c'è già un'inizializzazione in corso, attendi
    if (isInitializing.value) {
      console.log('⏳ Inizializzazione già in corso, attendo...')
      while (isInitializing.value) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
      return
    }

    try {
      isInitializing.value = true
      console.log('🚀 Inizializzazione dati utente...')

      // 1. Ottieni catalystRowId da Auth0 (una volta sola)
      const rowId = await getCatalystRowIdFromAuth0(auth0User, getAccessTokenSilently)

      // 2. Ottieni TUTTI i dati dal database Catalyst (una volta sola)
      console.log('🔄 Caricamento dati utente dal database...')
      const userData = await getUserData(rowId)

      // 3. Carica i coupon utente
      console.log('🔄 Caricamento coupon utente...')
      const coupons = await getUserCoupons(rowId)

      // 4. Salva TUTTO in memoria per l'intera sessione
      catalystRowId.value = rowId
      email.value = userData.email
      name.value = userData.name
      nickname.value = userData.nickname
      credits.value = parseFloat(userData.credits || 0)
      avatar.value = userData.avatar_file_id
      stripeCustomerId.value = userData.stripe_customer_id
      // Coupon data
      availableCoupons.value = coupons
      firstRechargeBonusAvailable.value = !userData.first_recharge_bonus_claimed
      isAdmin.value = userData.is_admin

      isInitialized.value = true

      console.log('✅ Dati utente inizializzati e salvati in memoria:', {
        catalystRowId: rowId,
        email: email.value,
        credits: credits.value,
        coupons: coupons.length,
        firstRechargeBonusAvailable: firstRechargeBonusAvailable.value,
        isAdmin: isAdmin.value
      })
    } catch (error) {
      console.error('❌ Errore durante inizializzazione:', error)
      throw error
    } finally {
      isInitializing.value = false
    }
  }

  /**
   * Aggiorna i crediti localmente dopo un'azione (ricarica o acquisto)
   * NON chiama il backend, assume che il backend abbia già aggiornato
   * Mantiene consistenza tra frontend e database
   *
   * @param {number} newAmount - Nuovo saldo crediti dal backend
   */
  function updateCredits(newAmount) {
    const oldAmount = credits.value
    credits.value = parseFloat(newAmount)
    console.log(`💰 Crediti aggiornati: ${oldAmount.toFixed(2)} € → ${credits.value.toFixed(2)} €`)
  }

  /**
   * Aggiorna l'avatar localmente dopo modifica profilo
   *
   * @param {string} newAvatarFileId - Nuovo file ID avatar
   */
  function updateAvatar(newAvatarFileId) {
    avatar.value = newAvatarFileId
    console.log('🖼️ Avatar aggiornato:', newAvatarFileId)
  }

  /**
   * Aggiorna il nickname localmente dopo modifica profilo
   *
   * @param {string} newNickname - Nuovo nickname
   */
  function updateNickname(newNickname) {
    nickname.value = newNickname
    console.log('👤 Nickname aggiornato:', newNickname)
  }

  /**
   * Aggiunge un nuovo coupon alla lista (chiamato dopo first recharge bonus)
   *
   * @param {Object} newCoupon - Nuovo coupon da aggiungere
   */
  function addCoupon(newCoupon) {
    availableCoupons.value.unshift(newCoupon) // Aggiungi in testa (più recente)
    firstRechargeBonusAvailable.value = false // Bonus claimed
    console.log('🎁 Nuovo coupon aggiunto:', newCoupon.couponCode)
  }

  /**
   * Pulisce tutti i dati (chiamato al logout)
   */
  function clearAll() {
    catalystRowId.value = null
    email.value = null
    name.value = null
    nickname.value = null
    credits.value = 0
    avatar.value = null
    stripeCustomerId.value = null
    availableCoupons.value = []
    firstRechargeBonusAvailable.value = false
    isAdmin.value = false
    adminMode.value = false
    localStorage.removeItem('adminMode')
    isInitialized.value = false
    isInitializing.value = false
    console.log('Dati utente puliti')
  }

  /**
   * Forza il reload di TUTTI i dati dal database
   * Usare SOLO se necessario (es. dopo errori di sincronizzazione)
   */
  async function forceReload(auth0User, getAccessTokenSilently) {
    console.log('🔄 Force reload dei dati utente...')
    isInitialized.value = false
    await initialize(auth0User, getAccessTokenSilently)
  }

  /**
   * Refresh coupons list (after transfer or use)
   */
  const refreshCoupons = async () => {
    if (!catalystRowId.value) {
      console.warn('Cannot refresh coupons: user not initialized')
      return
    }

    try {
      console.log('Ricaricamento coupon...')
      const coupons = await getUserCoupons(catalystRowId.value)
      availableCoupons.value = coupons
      console.log('Coupon ricaricati:', coupons.length)
    } catch (error) {
      console.error('Errore ricaricamento coupon:', error)
      throw error
    }
  }

  /**
   * Toggle admin mode (switch between user and admin dashboard)
   * Persists state in localStorage
   */
  function toggleAdminMode() {
    if (!isAdmin.value) {
      console.warn('User is not an admin, cannot toggle admin mode')
      return
    }

    adminMode.value = !adminMode.value
    localStorage.setItem('adminMode', adminMode.value.toString())
    console.log('Admin mode:', adminMode.value ? 'enabled' : 'disabled')
  }

  /**
   * Enable admin mode
   */
  function enableAdminMode() {
    if (!isAdmin.value) {
      console.warn('User is not an admin, cannot enable admin mode')
      return
    }

    adminMode.value = true
    localStorage.setItem('adminMode', 'true')
    console.log('Admin mode enabled')
  }

  /**
   * Disable admin mode
   */
  function disableAdminMode() {
    adminMode.value = false
    localStorage.setItem('adminMode', 'false')
    console.log('Admin mode disabled')
  }

  return {
    // State IMMUTABILE (readonly per sicurezza)
    catalystRowId: readonly(catalystRowId),
    email: readonly(email),
    name: readonly(name),
    nickname: readonly(nickname),
    stripeCustomerId: readonly(stripeCustomerId),
    isAdmin: readonly(isAdmin),

    // State MUTABILE (può cambiare durante la sessione)
    credits,
    avatar,

    // Coupon state
    availableCoupons: readonly(availableCoupons),
    availableCouponsCount,
    firstRechargeBonusAvailable: readonly(firstRechargeBonusAvailable),

    // Admin state
    adminMode: readonly(adminMode),

    // Flags
    isInitialized: readonly(isInitialized),
    isInitializing: readonly(isInitializing),

    // Methods
    initialize,
    updateCredits,
    updateAvatar,
    updateNickname,
    addCoupon,
    refreshCoupons,
    clearAll,
    forceReload,

    // Admin methods
    toggleAdminMode,
    enableAdminMode,
    disableAdminMode
  }
}
