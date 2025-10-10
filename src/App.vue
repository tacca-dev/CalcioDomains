<script setup>
import { RouterView } from 'vue-router'
</script>

<template>
  <div class="app-container">
    <RouterView />
  </div>
</template>

<style scoped>
.app-container {
  max-width: 640px;
  margin: 0 auto;
  padding: 3rem 1.5rem;
}
</style>
