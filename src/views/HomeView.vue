<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import TheWelcome from '../components/TheWelcome.vue'

const router = useRouter()

onMounted(() => {
  router.replace({ name: 'domains' })
})
</script>

<template>
  <main>
    <TheWelcome />
  </main>
</template>
