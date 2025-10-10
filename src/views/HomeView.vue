<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

onMounted(() => {
  router.replace({ name: 'domains' })
})
</script>

<template>
  <main>
    <p>Reindirizzamento…</p>
  </main>
</template>
