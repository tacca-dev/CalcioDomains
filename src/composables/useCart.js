import { ref, computed } from 'vue'
import { useToast } from './useToast'
import { useUser } from './useUser'
import { addDomainToCart, getUserCart, deleteFromCart, createCheckout, payWithCredits } from '@/services/catalyst'

// Stato globale del carrello (condiviso tra tutti i componenti)
const cartItems = ref([])
const showCartModal = ref(false)

// Toast globale
const { warning, success, error: toastError } = useToast()

// User composable (per catalystRowId e crediti)
const { catalystRowId, credits } = useUser()

// Funzioni helper per controllare autenticazione
let isAuthenticatedFn = null
let loginFn = null

export function useCart(options = {}) {
  // Ricevi funzioni di autenticazione come opzioni
  if (options.isAuthenticated) {
    isAuthenticatedFn = options.isAuthenticated
  }
  if (options.login) {
    loginFn = options.login
  }

  /**
   * Controlla se l'utente è autenticato, altrimenti mostra toast
   * @returns {boolean} true se autenticato, false altrimenti
   */
  function checkAuthentication() {
    const authenticated = isAuthenticatedFn ? isAuthenticatedFn.value : true

    if (!authenticated) {
      warning('Devi effettuare il login per accedere al carrello. Clicca su "Login" nella barra di navigazione.', 5000)
      return false
    }
    return true
  }
  /**
   * Numero totale di items nel carrello
   */
  const cartCount = computed(() => cartItems.value.length)

  /**
   * Totale del carrello in euro
   */
  const cartTotal = computed(() => {
    const total = cartItems.value.reduce((sum, item) => sum + item.price, 0)
    return total.toFixed(2)
  })

  /**
   * Aggiungi dominio al carrello
   * @param {Object} domain - Oggetto dominio con { domain, finalPrice, category }
   */
  async function addToCart(domain) {
    // Controlla autenticazione
    if (!checkAuthentication()) {
      return { success: false, error: 'Not authenticated' }
    }

    try {
      // Usa catalystRowId dalla cache di useUser
      if (!catalystRowId.value) {
        toastError('Impossibile identificare l\'utente. Riprova ad effettuare il login.', 4000)
        return { success: false, error: 'No catalystRowId' }
      }

      // Chiama funzione Catalyst add-to-cart
      const cartItem = await addDomainToCart(
        catalystRowId.value,
        domain.domain,
        domain.finalPrice,
        domain.category
      )

      // Aggiungi al carrello locale
      cartItems.value.push({
        id: cartItem.cartItemId,
        domain_name: domain.domain,
        price: domain.finalPrice,
        category: domain.category
      })

      console.log('Dominio aggiunto al carrello:', domain.domain)
      success(`${domain.domain} aggiunto al carrello`, 3000)
      return { success: true }
    } catch (error) {
      console.error('❌ Errore aggiungendo al carrello:', error)

      // Mostra errore specifico se dominio già nel carrello
      if (error.message && error.message.includes('already in cart')) {
        toastError('Questo dominio è già nel carrello', 3000)
      } else if (error.message && error.message.includes('riservato')) {
        toastError('Dominio temporaneamente riservato da un altro utente', 4000)
      } else {
        toastError('Errore aggiungendo al carrello. Riprova.', 3000)
      }

      return { success: false, error: error.message }
    }
  }

  /**
   * Rimuovi item dal carrello per nome dominio
   * @param {string} domainName - Nome del dominio da rimuovere
   */
  async function removeFromCart(domainName) {
    try {
      if (!catalystRowId.value) {
        toastError('Impossibile identificare l\'utente', 3000)
        return
      }

      // Chiama funzione Catalyst delete-from-cart
      await deleteFromCart(catalystRowId.value, domainName)

      // Ricarica il carrello dal database per evitare inconsistenze
      const items = await getUserCart(catalystRowId.value)
      cartItems.value = items

      console.log('✅ Item rimosso dal carrello:', domainName)
      success('Dominio rimosso dal carrello', 2000)
    } catch (error) {
      console.error('❌ Errore rimuovendo dal carrello:', error)
      toastError('Errore rimuovendo dal carrello. Riprova.', 3000)
    }
  }

  /**
   * Carica carrello dal backend
   */
  async function loadCart() {
    try {
      // Controlla autenticazione senza mostrare toast (controllo silenzioso)
      const authenticated = isAuthenticatedFn ? isAuthenticatedFn.value : true
      if (!authenticated) {
        return
      }

      if (!catalystRowId.value) {
        console.warn('Impossibile caricare carrello: catalystRowId non trovato')
        return
      }

      // Chiama funzione Catalyst get-cart
      const items = await getUserCart(catalystRowId.value)

      // Aggiorna carrello locale
      cartItems.value = items

      console.log('✅ Carrello caricato:', items.length, 'items')
    } catch (error) {
      console.error('❌ Errore caricando carrello:', error)
      // Non mostrare toast - il caricamento è silenzioso
    }
  }

  /**
   * Svuota completamente il carrello
   */
  async function clearCart() {
    try {
      if (!catalystRowId.value) {
        toastError('Impossibile identificare l\'utente', 3000)
        return
      }

      // Ottieni tutti i nomi dei domini nel carrello
      const domainNames = cartItems.value.map(item => item.domain_name)

      if (domainNames.length > 0) {
        // Chiama funzione Catalyst delete-from-cart con tutti i domini
        await deleteFromCart(catalystRowId.value, domainNames)
      }

      // Ricarica il carrello dal database per evitare inconsistenze
      const items = await getUserCart(catalystRowId.value)
      cartItems.value = items

      console.log('✅ Carrello svuotato')
      success('Carrello svuotato', 2000)
    } catch (error) {
      console.error('❌ Errore svuotando carrello:', error)
      toastError('Errore svuotando il carrello. Riprova.', 3000)
    }
  }



  /**
   * Paga con crediti
   */
  async function handlePayWithCredits() {
    try {
      if (!catalystRowId.value) {
        toastError('Impossibile identificare l\'utente. Riprova ad effettuare il login.', 4000)
        return
      }

      console.log('💰 Pagamento con crediti in corso...')

      const totalAmount = parseFloat(cartTotal.value)

      const result = await payWithCredits(catalystRowId.value, cartItems.value, totalAmount)

      console.log('✅ Pagamento completato:', result)

      // Svuota carrello locale (già svuotato nel backend)
      cartItems.value = []

      // Aggiorna crediti usando useUser (sincronizza con tutti i componenti)
      const { updateCredits } = useUser()
      updateCredits(result.newCreditBalance)

      // Chiudi modal carrello
      showCartModal.value = false

      // Redirect alla pagina success con orderId
      window.location.href = `/success?order_id=${result.orderId}&type=credits`

    } catch (error) {
      console.error('❌ Errore durante pagamento con crediti:', error)

      if (error.message && error.message.includes('Insufficient credits')) {
        toastError('Crediti insufficienti per completare l\'acquisto', 4000)
      } else {
        toastError('Errore processando il pagamento. Riprova.', 4000)
      }
    }
  }

  /**
   * Paga con Stripe
   */
  async function handlePayWithStripe() {
    try {
      if (!catalystRowId.value) {
        toastError('Impossibile identificare l\'utente. Riprova ad effettuare il login.', 4000)
        return
      }

      console.log('🚀 Creazione Stripe Checkout Session...')

      const { checkoutUrl, sessionId } = await createCheckout(catalystRowId.value, cartItems.value)

      console.log('✅ Checkout Session creata:', sessionId)
      console.log('Redirect a:', checkoutUrl)

      // Chiudi modal carrello
      showCartModal.value = false

      // Redirect a Stripe
      window.location.href = checkoutUrl
    } catch (error) {
      console.error('❌ Errore durante checkout Stripe:', error)
      toastError('Errore creando la sessione di pagamento. Riprova.', 4000)
    }
  }

  /**
   * Mostra/nascondi modal carrello
   */
  function toggleCartModal() {
    // Controlla autenticazione prima di aprire il modal
    if (!showCartModal.value && !checkAuthentication()) {
      return
    }

    // I crediti sono già disponibili in useUser, non serve caricarli
    showCartModal.value = !showCartModal.value
  }

  return {
    // State
    cartItems,
    showCartModal,
    userCredits: credits, // Alias per compatibilità con componenti esistenti

    // Computed
    cartCount,
    cartTotal,

    // Methods
    addToCart,
    removeFromCart,
    loadCart,
    clearCart,
    toggleCartModal,
    handlePayWithCredits,
    handlePayWithStripe
  }
}