<template>
  <button class="cart-icon-button" @click="toggleCartModal" aria-label="Apri carrello">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <circle cx="9" cy="21" r="1"></circle>
      <circle cx="20" cy="21" r="1"></circle>
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
    </svg>
    <span v-if="cartCount > 0" class="cart-badge">{{ cartCount }}</span>
  </button>
</template>

<script setup>
import { useCart } from '@/composables/useCart'
import { useAuth0 } from '@auth0/auth0-vue'

// Auth0
const { isAuthenticated, loginWithRedirect } = useAuth0()

// Composable carrello con autenticazione
const { cartCount, toggleCartModal } = useCart({
  isAuthenticated,
  login: loginWithRedirect
})
</script>

<style scoped>
.cart-icon-button {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-heading);
  transition: color 0.2s;
}

.cart-icon-button:hover {
  color: #22c55e;
}

.cart-badge {
  position: absolute;
  top: 0;
  right: 0;
  background-color: #ef4444;
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 50%;
  min-width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
}
</style>