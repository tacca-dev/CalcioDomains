import { ref, readonly } from 'vue'
import { getUserData } from '@/services/catalyst'

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

      // 3. Salva TUTTO in memoria per l'intera sessione
      catalystRowId.value = rowId
      email.value = userData.email
      name.value = userData.name
      nickname.value = userData.nickname
      credits.value = parseFloat(userData.credits || 0)
      avatar.value = userData.avatar_file_id
      stripeCustomerId.value = userData.stripe_customer_id

      isInitialized.value = true

      console.log('✅ Dati utente inizializzati e salvati in memoria:', {
        catalystRowId: rowId,
        email: email.value,
        credits: credits.value
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
    isInitialized.value = false
    isInitializing.value = false
    console.log('🧹 Dati utente puliti')
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

  return {
    // State IMMUTABILE (readonly per sicurezza)
    catalystRowId: readonly(catalystRowId),
    email: readonly(email),
    name: readonly(name),
    nickname: readonly(nickname),
    stripeCustomerId: readonly(stripeCustomerId),

    // State MUTABILE (può cambiare durante la sessione)
    credits,
    avatar,

    // Flags
    isInitialized: readonly(isInitialized),
    isInitializing: readonly(isInitializing),

    // Methods
    initialize,
    updateCredits,
    updateAvatar,
    updateNickname,
    clearAll,
    forceReload
  }
}
