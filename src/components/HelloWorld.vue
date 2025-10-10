<script setup>
defineProps({
  msg: {
    type: String,
    required: true
  }
})
</script>

<template>
  <section class="welcome-section">
    <h1 class="welcome-title green">{{ msg }}</h1>
    <p class="welcome-summary">
      Hai configurato con successo un progetto utilizzando
      <a href="https://vitejs.dev/" target="_blank" rel="noopener">Vite</a>
      e
      <a href="https://vuejs.org/" target="_blank" rel="noopener">Vue 3</a>.
    </p>
    <p class="welcome-guidance">
      Inizia esplorando gli strumenti proposti qui sotto, così da organizzare velocemente lo
      sviluppo della tua interfaccia.
    </p>
  </section>
</template>

<style scoped>
.welcome-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.welcome-title {
  font-weight: 600;
  font-size: 2.6rem;
}

.welcome-summary,
.welcome-guidance {
  font-size: 1.1rem;
  line-height: 1.6;
  text-align: center;
}

@media (min-width: 1024px) {
  .welcome-section {
    align-items: flex-start;
  }

  .welcome-summary,
  .welcome-guidance {
    text-align: left;
  }
}
</style>
