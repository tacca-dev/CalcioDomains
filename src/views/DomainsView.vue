<script setup>
import { onMounted, ref } from 'vue'
import { searchDomain } from '@/services/catalyst'
import { authenticateFreename } from '@/services/freename'

const domainName = ref('')
const loading = ref(false)
const error = ref(null)
const result = ref(null)

onMounted(async () => {
    try {
      const token = await authenticateFreename()
      console.log('✅ Authentication successful! Token:', token)
    } catch (error) {
      console.error('❌ Authentication failed:', error)
    }
  })
  
async function handleSearch() {
  if (!domainName.value.trim()) return

  loading.value = true
  error.value = null
  result.value = null

  try {
    result.value = await searchDomain(domainName.value)
    console.log('Search result:', result.value)
  } catch (err) {
    error.value = 'Errore durante la ricerca del dominio'
    console.error(err)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section class="domains-wrapper">
    <div class="domains-body">
      <h1 class="domains-heading">Cerca Domini .calcio</h1>
      <p class="domains-text">
        Trova e verifica la disponibilità del tuo dominio .calcio perfetto. Registrazione
        istantanea, proprietà 100% tua.
      </p>
      <form class="domains-form" @submit.prevent="handleSearch">
        <div class="domains-input-group">
          <input
            v-model="domainName"
            class="domains-field"
            type="text"
            name="domain"
            placeholder="Inserisci il nome del dominio..."
            aria-label="Cerca dominio .calcio"
            :disabled="loading"
          />
          <span class="domains-suffix">.calcio</span>
          <button class="domains-button" type="submit" :disabled="loading">
            {{ loading ? 'Ricerca...' : 'Cerca' }}
          </button>
        </div>
        <p v-if="error" class="error-message">{{ error }}</p>
      </form>
    </div>
  </section>
</template>

<style scoped>
.domains-wrapper {
  padding: 2rem 1.5rem;
}

.domains-body {
  max-width: 38rem;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.domains-heading {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-heading);
}

.domains-text {
  font-size: 1rem;
  line-height: 1.5;
  color: var(--color-text);
}

.domains-form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.domains-input-group {
  display: flex;
  align-items: stretch;
  gap: 0.5rem;
}

.domains-field {
  flex: 1;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--color-border);
  background-color: #ffffff;
}

.domains-suffix {
  display: flex;
  align-items: center;
  padding: 0 0.75rem;
  border: 1px solid var(--color-border);
  background-color: var(--color-background-soft);
}

.domains-button {
  padding: 0.5rem 1rem;
  border: 1px solid var(--color-border);
  background-color: #ffffff;
  color: var(--color-heading);
}

.domains-button:focus,
.domains-button:hover {
  background-color: var(--color-background-soft);
}

.domains-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  color: #dc2626;
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

@media (max-width: 640px) {
  .domains-input-group {
    flex-direction: column;
  }

  .domains-suffix,
  .domains-button {
    text-align: center;
  }
}
</style>
