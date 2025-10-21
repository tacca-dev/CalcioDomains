<script setup>
import { RouterView } from 'vue-router'
import NavBar from './components/NavBar.vue'
import CartModal from './components/CartModal.vue'
</script>

<template>
  <div class="app">
    <NavBar />
    <div class="app-container">
      <RouterView />
    </div>
    <CartModal />
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  background: #f8f9fa;
}

.app-container {
  width: 100%;
}
</style>
