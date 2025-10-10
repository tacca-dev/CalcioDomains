<script setup>
import TheWelcome from '../components/TheWelcome.vue'
</script>

<template>
  <main class="home-showcase">
    <TheWelcome />
  </main>
</template>

<style scoped>
.home-showcase {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
  padding-bottom: 3rem;
}

@media (min-width: 1024px) {
  .home-showcase {
    padding-left: calc(var(--section-gap) / 3);
  }
}
</style>
