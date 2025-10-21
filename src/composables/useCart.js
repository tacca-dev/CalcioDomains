import { ref, computed } from 'vue'

// Stato globale del carrello (condiviso tra tutti i componenti)
const cartItems = ref([])
const showCartModal = ref(false)

export function useCart() {
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