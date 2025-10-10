<template>
  <section class="domains-wrapper">
    <div class="domains-body">
      <h1 class="domains-heading">Cerca Domini .calcio</h1>
      <p class="domains-text">
        Trova e verifica la disponibilità del tuo dominio .calcio perfetto. Registrazione istantanea, proprietà 100% tua.
      </p>
      <form class="domains-form" @submit.prevent>
        <div class="domains-input-group">
          <input
            class="domains-field"
            type="text"
            name="domain"
            placeholder="Inserisci il nome del dominio..."
            aria-label="Cerca dominio .calcio"
          />
          <span class="domains-suffix">.calcio</span>
          <button class="domains-button" type="submit">Cerca</button>
        </div>
      </form>
    </div>
  </section>
</template>

<style scoped>
.domains-wrapper {
  padding: 2rem 1rem;
}

.domains-body {
  max-width: 40rem;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.domains-heading {
  font-size: 1.75rem;
  font-weight: 600;
}

.domains-text {
  font-size: 1rem;
}

.domains-form {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.domains-input-group {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.domains-field {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #cbd5e1;
}

.domains-suffix {
  padding: 0.5rem;
  border: 1px solid #cbd5e1;
}

.domains-button {
  padding: 0.5rem 1rem;
  border: 1px solid #cbd5e1;
  background-color: transparent;
}

@media (max-width: 640px) {
  .domains-input-group {
    flex-direction: column;
    align-items: stretch;
  }

  .domains-suffix,
  .domains-button {
    text-align: center;
  }
}
</style>
