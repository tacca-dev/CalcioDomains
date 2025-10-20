<script setup>
import { ref, onMounted } from 'vue'
import { callGetPromptFunction, callGPT4o } from '@/services/catalyst'
import { searchDomains } from '@/services/freename'

const domainName = ref('')
const loading = ref(false)
const error = ref(null)

// Data loaded at mount
const promptTemplate = ref('')
const coefficients = ref({})

// Search results
const mainDomainResult = ref(null)
const suggestionsResults = ref([])
const loadingSuggestions = ref(false)
const freenameApiResponse = ref(null)
const gptApiResponse = ref(null)

// Load prompt template and coefficients on mount
onMounted(async () => {
  try {
    const { prompt, coefficients: coeff } = await callGetPromptFunction()
    promptTemplate.value = prompt
    coefficients.value = coeff
    console.log('✅ Prompt template and coefficients loaded')
  } catch (err) {
    console.error('❌ Error loading initial data:', err)
  }
})

async function handleSearch() {
  if (!domainName.value.trim()) return

  loading.value = true
  error.value = null
  mainDomainResult.value = null
  suggestionsResults.value = []
  loadingSuggestions.value = false
  freenameApiResponse.value = null
  gptApiResponse.value = null

  try {
    // Step 1: Compile prompt template with domain name
    const compiledPrompt = promptTemplate.value.replace(/\{\{domain\}\}/g, domainName.value)

    // Step 2: Call GPT with compiled prompt
    const evaluation = await callGPT4o(compiledPrompt)
    gptApiResponse.value = evaluation // Store GPT response

    // Step 3: Build array of domains to search (main domain + suggestions)
    const mainDomain = `${domainName.value}.calcio`

    // Step 4: Check if main domain is reserved
    if (evaluation.category === 'Riservato') {
      // Domain is reserved - skip Freename API call
      mainDomainResult.value = {
        domain: mainDomain,
        reserved: true,
        category: evaluation.category,
        potentialCategory: evaluation.potential_category
      }
      loading.value = false // Show reserved message immediately
    } else {
      // Domain is not reserved - call Freename API
      try {
        const mainResult = await searchDomains([mainDomain])
        freenameApiResponse.value = mainResult // Store full API response
        const exactMatches = mainResult.data.result.find((r) => r.type === 'EXACT_MATCH')

        if (exactMatches) {
          const domainData = exactMatches.elements.find(
            (el) => el.type === 'SECOND_LEVEL_DOMAIN' && el.name === mainDomain
          )

          if (domainData) {
            const category = evaluation.category.toLowerCase()
            const coefficient = coefficients.value[category] || 1

            mainDomainResult.value = {
              domain: domainData.name,
              available: domainData.availabilityStatus === 'AVAILABLE',
              basePrice: domainData.price.amount,
              coefficient: coefficient,
              finalPrice: parseFloat((domainData.price.amount * coefficient).toFixed(2)),
              category: evaluation.category,
              reserved: false
            }
          }
        }

        loading.value = false // Main domain loaded, show it
      } catch (err) {
        console.error(`Error searching main domain:`, err)
        loading.value = false
      }
    }

    // Step 5: Search suggestions in batches of 5 (in background)
    loadingSuggestions.value = true
    const suggestions = []

    // Filter out reserved suggestions and build domains array
    const nonReservedSuggestions = evaluation.suggestions.filter((s) => s.category !== 'Riservato')
    const reservedSuggestions = evaluation.suggestions.filter((s) => s.category === 'Riservato')
    const suggestedDomains = nonReservedSuggestions.map((s) => `${s.domain}.calcio`)

    const batchSize = 5

    for (let i = 0; i < suggestedDomains.length; i += batchSize) {
      const batch = suggestedDomains.slice(i, i + batchSize)

      try {
        const batchResult = await searchDomains(batch)
        const exactMatches = batchResult.data.result.find((r) => r.type === 'EXACT_MATCH')

        if (exactMatches) {
          batch.forEach((domain) => {
            const domainData = exactMatches.elements.find(
              (el) => el.type === 'SECOND_LEVEL_DOMAIN' && el.name === domain
            )

            if (domainData) {
              // Find the suggestion data by domain name
              const domainWithoutTld = domain.replace('.calcio', '')
              const suggestionData = nonReservedSuggestions.find(
                (s) => s.domain === domainWithoutTld
              )
              const category = (suggestionData?.category || evaluation.category).toLowerCase()
              const coefficient = coefficients.value[category] || 1

              suggestions.push({
                domain: domainData.name,
                available: domainData.availabilityStatus === 'AVAILABLE',
                finalPrice: parseFloat((domainData.price.amount * coefficient).toFixed(2)),
                reserved: false
              })
            }
          })
        }
      } catch (err) {
        console.error(`Error searching suggestions batch:`, err)
      }
    }

    // Add reserved suggestions to the list (without price)
    reservedSuggestions.forEach((s) => {
      suggestions.push({
        domain: `${s.domain}.calcio`,
        available: false,
        finalPrice: null,
        reserved: true
      })
    })

    suggestionsResults.value = suggestions
    loadingSuggestions.value = false
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

      <!-- Main domain result -->
      <div v-if="mainDomainResult" class="result-section">
        <div v-if="mainDomainResult.reserved" class="result-card result-reserved">
          <h3 class="result-title">✗ {{ mainDomainResult.domain }} è riservato</h3>
          <p class="result-subtitle">Questo dominio non è disponibile per la registrazione</p>
        </div>
        <div v-else-if="mainDomainResult.available" class="result-card result-available">
          <h3 class="result-title">✓ {{ mainDomainResult.domain }} è disponibile!</h3>
          <div class="result-details">
            <p>Prezzo base: ${{ mainDomainResult.basePrice }}</p>
            <p>Moltiplicatore: {{ mainDomainResult.coefficient }}x</p>
            <p class="result-final-price">Prezzo finale: ${{ mainDomainResult.finalPrice }}</p>
          </div>
        </div>
        <div v-else class="result-card result-unavailable">
          <h3 class="result-title">✗ {{ mainDomainResult.domain }} non è disponibile</h3>
          <p class="result-subtitle">Prova uno dei suggerimenti qui sotto</p>
        </div>
      </div>

      <!-- Suggestions -->
      <div v-if="mainDomainResult" class="suggestions-section">
        <h3 class="suggestions-title">Suggerimenti</h3>

        <div v-if="loadingSuggestions" class="loading-spinner">
          <div class="spinner"></div>
          <p>Caricamento suggerimenti...</p>
        </div>

        <div v-else class="suggestions-grid">
          <div
            v-for="suggestion in suggestionsResults"
            :key="suggestion.domain"
            class="suggestion-card"
            :class="{ 'suggestion-reserved': suggestion.reserved }"
          >
            <span class="suggestion-domain">{{ suggestion.domain }}</span>
            <span v-if="suggestion.reserved" class="suggestion-reserved-label">Riservato</span>
            <span v-else class="suggestion-price">${{ suggestion.finalPrice }}</span>
          </div>
        </div>
      </div>

      <!-- API Response (Freename or GPT based on domain status) -->
      <div
        v-if="
          mainDomainResult && (mainDomainResult.reserved ? gptApiResponse : freenameApiResponse)
        "
        class="api-response-section"
      >
        <h3 class="api-response-title">
          {{ mainDomainResult.reserved ? 'Risposta AI' : 'Risposta API Freename' }}
        </h3>
        <pre class="api-response-content">{{
          JSON.stringify(mainDomainResult.reserved ? gptApiResponse : freenameApiResponse, null, 2)
        }}</pre>
      </div>
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
  font-weight: 700;
  color: var(--color-heading);
  letter-spacing: -0.01em;
}

.domains-text {
  font-size: 1rem;
  line-height: 1.6;
  color: var(--color-text);
  font-weight: 400;
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

/* Results */
.result-section {
  margin-top: 2rem;
}

.result-card {
  padding: 1.5rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
}

.result-available {
  background-color: #f0fdf4;
  border-color: #86efac;
}

.result-unavailable {
  background-color: #fef2f2;
  border-color: #fca5a5;
}

.result-reserved {
  background-color: #fef2f2;
  border-color: #fca5a5;
}

.result-title {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0 0 1rem 0;
  color: var(--color-heading);
  letter-spacing: -0.005em;
}

.result-subtitle {
  margin: 0;
  color: var(--color-text);
}

.result-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.result-details p {
  margin: 0;
  color: var(--color-text);
}

.result-final-price {
  font-weight: 600;
  font-size: 1.125rem;
  color: var(--color-heading);
  margin-top: 0.5rem;
}

/* Suggestions */
.suggestions-section {
  margin-top: 2rem;
}

.suggestions-title {
  font-size: 1.125rem;
  font-weight: 700;
  margin: 0 0 1rem 0;
  color: var(--color-heading);
  letter-spacing: -0.005em;
}

.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-heading);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-spinner p {
  margin: 0;
  color: var(--color-text);
}

.suggestions-grid {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.suggestion-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  border: 1px solid var(--color-border);
  background-color: #ffffff;
}

.suggestion-card:hover {
  background-color: var(--color-background-soft);
}

.suggestion-reserved {
  opacity: 0.6;
  cursor: not-allowed;
}

.suggestion-reserved:hover {
  background-color: #ffffff;
}

.suggestion-domain {
  font-size: 0.875rem;
  color: var(--color-text);
}

.suggestion-price {
  font-weight: 700;
  color: var(--color-heading);
}

.suggestion-reserved-label {
  font-size: 0.875rem;
  color: #dc2626;
  font-style: italic;
}

/* API Response */
.api-response-section {
  margin-top: 2rem;
}

.api-response-title {
  font-size: 1.125rem;
  font-weight: 700;
  margin: 0 0 1rem 0;
  color: var(--color-heading);
  letter-spacing: -0.005em;
}

.api-response-content {
  background-color: #f8f9fa;
  border: 1px solid var(--color-border);
  padding: 1rem;
  overflow-x: auto;
  font-size: 0.875rem;
  line-height: 1.5;
  color: #24292e;
  margin: 0;
  white-space: pre;
  font-family: 'Courier New', Courier, monospace;
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
