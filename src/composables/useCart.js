import { ref, computed } from 'vue'
import { useToast } from './useToast'
import { useUser } from './useUser'
import { addDomainToCart, getUserCart, deleteFromCart, createCheckout, payWithCredits, getUserCoupons } from '@/services/catalyst'

// Stato globale del carrello (condiviso tra tutti i componenti)
const cartItems = ref([])
const showCartModal = ref(false)
const availableCoupons = ref([])
const selectedCoupon = ref(null)
const convertRestToCredit = ref(true) // Default: converti resto in credito

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
   * Importo sconto coupon applicato
   */
  const discountAmount = computed(() => {
    if (!selectedCoupon.value) return 0
    const total = parseFloat(cartTotal.value)
    return Math.min(selectedCoupon.value.amount, total)
  })

  /**
   * Coupon eccede totale?
   */
  const couponExceedsTotal = computed(() => {
    if (!selectedCoupon.value) return false
    return selectedCoupon.value.amount > parseFloat(cartTotal.value)
  })

  /**
   * Importo in eccesso del coupon
   */
  const excessAmount = computed(() => {
    if (!couponExceedsTotal.value) return 0
    return selectedCoupon.value.amount - parseFloat(cartTotal.value)
  })

  /**
   * Credito bonus da eccesso coupon
   */
  const creditBonus = computed(() => {
    return convertRestToCredit.value ? excessAmount.value : 0
  })

  /**
   * Totale finale da pagare (dopo sconto coupon)
   */
  const finalTotal = computed(() => {
    const total = parseFloat(cartTotal.value)
    return Math.max(0, total - discountAmount.value)
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

      // Carica anche i coupon disponibili
      await loadCoupons()
    } catch (error) {
      console.error('❌ Errore caricando carrello:', error)
      // Non mostrare toast - il caricamento è silenzioso
    }
  }

  /**
   * Carica coupon disponibili dal backend
   */
  async function loadCoupons() {
    try {
      if (!catalystRowId.value) {
        console.warn('Impossibile caricare coupon: catalystRowId non trovato')
        return
      }

      // Carica solo coupon con status 'available'
      const coupons = await getUserCoupons(catalystRowId.value)
      availableCoupons.value = coupons.filter(c => c.status === 'available')

      console.log('✅ Coupon caricati:', availableCoupons.value.length, 'disponibili')
    } catch (error) {
      console.error('❌ Errore caricando coupon:', error)
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

      // Passa coupon selezionato e flag conversione resto
      const result = await payWithCredits(
        catalystRowId.value,
        cartItems.value,
        totalAmount,
        selectedCoupon.value?.id || null,
        convertRestToCredit.value
      )

      console.log('✅ Pagamento completato:', result)

      // Svuota carrello locale (già svuotato nel backend)
      cartItems.value = []

      // Reset coupon selezionato
      selectedCoupon.value = null

      // Ricarica coupon (quello usato non sarà più available)
      await loadCoupons()

      // Aggiorna crediti usando useUser (sincronizza con tutti i componenti)
      const { updateCredits } = useUser()
      updateCredits(result.newCreditBalance)

      // Chiudi modal carrello
      showCartModal.value = false

      // Redirect alla pagina success con orderId
      const params = new URLSearchParams({
        order_id: result.orderId,
        type: 'credits'
      })
      if (result.creditBonus > 0) {
        params.append('credit_bonus', result.creditBonus)
      }
      window.location.href = `/success?${params.toString()}`

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

      // Passa coupon selezionato e flag conversione resto
      const result = await createCheckout(
        catalystRowId.value,
        cartItems.value,
        selectedCoupon.value?.id || null,
        convertRestToCredit.value
      )

      // Se ordine è gratuito (coupon ≥ totale), non c'è checkout URL
      if (result.free) {
        console.log('✅ Ordine gratuito completato:', result.orderId)

        // Svuota carrello locale
        cartItems.value = []

        // Reset coupon
        selectedCoupon.value = null

        // Ricarica coupon
        await loadCoupons()

        // Se c'è credito bonus, aggiorna
        if (result.creditBonus > 0) {
          const { updateCredits } = useUser()
          const newCredits = credits.value + result.creditBonus
          updateCredits(newCredits)
        }

        // Chiudi modal
        showCartModal.value = false

        // Redirect a success
        const params = new URLSearchParams({
          order_id: result.orderId,
          type: 'free'
        })
        if (result.creditBonus > 0) {
          params.append('credit_bonus', result.creditBonus)
        }
        window.location.href = `/success?${params.toString()}`
        return
      }

      // Altrimenti redirect a Stripe
      console.log('✅ Checkout Session creata:', result.sessionId)
      console.log('Redirect a:', result.checkoutUrl)

      // Chiudi modal carrello
      showCartModal.value = false

      // Redirect a Stripe
      window.location.href = result.checkoutUrl
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
    availableCoupons,
    selectedCoupon,
    convertRestToCredit,

    // Computed
    cartCount,
    cartTotal,
    discountAmount,
    couponExceedsTotal,
    excessAmount,
    creditBonus,
    finalTotal,

    // Methods
    addToCart,
    removeFromCart,
    loadCart,
    loadCoupons,
    clearCart,
    toggleCartModal,
    handlePayWithCredits,
    handlePayWithStripe
  }
}