import { ref, computed } from 'vue'

// Stato globale del carrello (condiviso tra tutti i componenti)
const cartItems = ref([])
const showCartModal = ref(false)

// Funzione helper per controllare autenticazione
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
   * Controlla se l'utente è autenticato, altrimenti mostra alert
   * @returns {boolean} true se autenticato, false altrimenti
   */
  function checkAuthentication() {
    const authenticated = isAuthenticatedFn ? isAuthenticatedFn.value : true

    if (!authenticated) {
      alert(
        'Devi effettuare il login per aggiungere domini al carrello.\n\nClicca su "Login" nella barra di navigazione per accedere.'
      )
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
   * @param {Object} domain - Oggetto dominio con { domain_name, price, category }
   */
  async function addToCart(domain) {
    // Controlla autenticazione
    if (!checkAuthentication()) {
      return { success: false, error: 'Not authenticated' }
    }

    try {
      // TODO: Chiamare funzione Catalyst add-to-cart
      // const response = await fetch('...', {
      //   method: 'POST',
      //   body: JSON.stringify({
      //     userId: currentUser.id,
      //     domainName: domain.domain_name,
      //     finalPrice: Math.round(domain.price * 100), // converti in centesimi
      //     category: domain.category
      //   })
      // })

      // Per ora aggiungi localmente
      cartItems.value.push({
        id: Date.now(), // temporaneo, poi sarà ROWID dal database
        domain_name: domain.domain,
        price: domain.finalPrice,
        category: domain.category
      })

      console.log('✅ Dominio aggiunto al carrello:', domain.domain)
      return { success: true }
    } catch (error) {
      console.error('❌ Errore aggiungendo al carrello:', error)
      throw error
    }
  }

  /**
   * Rimuovi item dal carrello
   * @param {number} itemId - ID dell'item da rimuovere
   */
  async function removeFromCart(itemId) {
    try {
      // TODO: Chiamare DELETE su Catalyst
      // await fetch(`.../cart-items/${itemId}`, { method: 'DELETE' })

      // Per ora rimuovi localmente
      const index = cartItems.value.findIndex((item) => item.id === itemId)
      if (index !== -1) {
        cartItems.value.splice(index, 1)
      }

      console.log('✅ Item rimosso dal carrello')
    } catch (error) {
      console.error('❌ Errore rimuovendo dal carrello:', error)
      throw error
    }
  }

  /**
   * Carica carrello dal backend
   */
  async function loadCart() {
    try {
      // TODO: Chiamare funzione Catalyst get-cart
      // const response = await fetch('...', {
      //   method: 'POST',
      //   body: JSON.stringify({ userId: currentUser.id })
      // })
      // const data = await response.json()
      // cartItems.value = data.items

      console.log('✅ Carrello caricato')
    } catch (error) {
      console.error('❌ Errore caricando carrello:', error)
      throw error
    }
  }

  /**
   * Svuota completamente il carrello
   */
  async function clearCart() {
    try {
      // TODO: Chiamare DELETE su Catalyst per tutti gli items dell'utente
      // await fetch('...', { method: 'DELETE' })

      cartItems.value = []
      console.log('✅ Carrello svuotato')
    } catch (error) {
      console.error('❌ Errore svuotando carrello:', error)
      throw error
    }
  }

  /**
   * Procedi al checkout con Stripe
   */
  async function checkout() {
    try {
      // TODO: Chiamare funzione Catalyst create-checkout
      // const response = await fetch('...', {
      //   method: 'POST',
      //   body: JSON.stringify({
      //     userId: currentUser.id,
      //     cartItems: cartItems.value
      //   })
      // })
      // const data = await response.json()
      // window.location.href = data.checkoutUrl

      console.log('🚀 Redirect a Stripe Checkout... (TODO)')
      alert('Checkout Stripe - TODO: implementare create-checkout function')
    } catch (error) {
      console.error('❌ Errore durante checkout:', error)
      throw error
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
    showCartModal.value = !showCartModal.value
  }

  return {
    // State
    cartItems,
    showCartModal,

    // Computed
    cartCount,
    cartTotal,

    // Methods
    addToCart,
    removeFromCart,
    loadCart,
    clearCart,
    checkout,
    toggleCartModal
  }
}