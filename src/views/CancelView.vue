<template>
  <section class="cancel-wrapper">
    <div class="cancel-container">
      <div class="cancel-icon">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="64"
          height="64"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="15" y1="9" x2="9" y2="15"></line>
          <line x1="9" y1="9" x2="15" y2="15"></line>
        </svg>
      </div>

      <h1 class="cancel-title">Pagamento Cancellato</h1>
      <p class="cancel-subtitle">Il pagamento non è stato completato</p>

      <div class="info-box">
        <template v-if="isRecharge">
          <p>La ricarica è stata annullata.</p>
          <p>Puoi riprovare in qualsiasi momento dalla tua dashboard.</p>
        </template>
        <template v-else>
          <p>Non ti preoccupare, il tuo ordine è stato salvato.</p>
          <p>Puoi tornare indietro e riprovare: il tuo ordine è salvato per due ore.</p>
        </template>
      </div>

      <div class="cancel-actions">
        <router-link v-if="!isRecharge" to="/cart" class="btn-primary" @click="openCart">Torna al tuo ordine</router-link>
        <router-link to="/dashboard" class="btn-primary">Torna alla dashboard</router-link>
        <router-link v-if="!isRecharge" to="/domains" class="btn-secondary">Cerca altri domini</router-link>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useCart } from '@/composables/useCart'

const route = useRoute()
const { toggleCartModal } = useCart()

const isRecharge = ref(false)

onMounted(() => {
  const paymentType = route.query.type || 'order'
  isRecharge.value = paymentType === 'recharge'
})

function openCart() {
  toggleCartModal()
}
</script>

<style scoped>
.cancel-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 8rem);
  padding: 2rem 1.5rem;
}

.cancel-container {
  max-width: 600px;
  width: 100%;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.cancel-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: #fee2e2;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #dc2626;
}

.cancel-title {
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
  color: var(--color-heading);
}

.cancel-subtitle {
  font-size: 1.125rem;
  color: var(--color-text);
  margin: 0;
}

.info-box {
  padding: 1.5rem;
  background-color: var(--color-background-soft);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  width: 100%;
}

.info-box p {
  margin: 0;
  font-size: 0.9375rem;
  color: var(--color-text);
  line-height: 1.6;
}

.info-box p:first-child {
  margin-bottom: 0.5rem;
}

.cancel-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;
  margin-top: 1rem;
}

.btn-primary,
.btn-secondary {
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s;
  display: inline-block;
}

.btn-primary {
  background-color: #22c55e;
  color: white;
}

.btn-primary:hover {
  background-color: #16a34a;
}

.btn-secondary {
  background-color: white;
  color: var(--color-heading);
  border: 1px solid var(--color-border);
}

.btn-secondary:hover {
  background-color: var(--color-background-soft);
}

@media (min-width: 640px) {
  .cancel-actions {
    flex-direction: row;
    justify-content: center;
  }
}
</style>
