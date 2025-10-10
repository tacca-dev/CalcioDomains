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
}

.domains-text {
  font-size: 1rem;
  line-height: 1.5;
  color: #1f2933;
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
  border: 1px solid #d0d7e2;
}

.domains-suffix {
  display: flex;
  align-items: center;
  padding: 0 0.75rem;
  border: 1px solid #d0d7e2;
  background-color: #f3f4f6;
}

.domains-button {
  padding: 0.5rem 1rem;
  border: 1px solid #d0d7e2;
  background-color: #ffffff;
}

.domains-button:focus,
.domains-button:hover {
  background-color: #f3f4f6;
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
