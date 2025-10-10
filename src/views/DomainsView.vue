<template>
  <section class="domains-page">
    <div class="domains-content">
      <h1 class="domains-title">Cerca Domini .calcio</h1>
      <p class="domains-subtitle">
        Trova e verifica la disponibilità del tuo dominio .calcio perfetto. Registrazione istantanea, proprietà 100% tua.
      </p>
      <form class="domain-search-form" @submit.prevent>
        <div class="search-panel">
          <span class="search-icon" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M15.5 14C16.88 12.39 17.5 10.26 17.09 8.03C16.59 5.26 14.27 3.05 11.48 2.62C7.08003 1.95 3.27003 5.76 3.94003 10.16C4.37003 12.95 6.58003 15.27 9.35003 15.77C11.59 16.17 13.82 15.55 15.44 14.17L20.3 19.02C20.69 19.41 21.32 19.41 21.71 19.02C22.1 18.63 22.1 18 21.71 17.61L16.86 12.75C16.76 12.64 16.63 12.56 16.5 12.53C16.18 12.44 15.82 12.53 15.56 12.79L15.5 12.85V14Z"
                fill="currentColor"
              />
            </svg>
          </span>
          <input
            class="search-input"
            type="text"
            name="domain"
            placeholder="Inserisci il nome del dominio..."
            aria-label="Cerca dominio .calcio"
          />
          <span class="search-extension">.calcio</span>
          <button class="search-button" type="submit">
            <span class="button-icon" aria-hidden="true">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13 5L20 12L13 19V5Z" fill="currentColor" />
              </svg>
            </span>
            <span class="button-label">Cerca</span>
          </button>
        </div>
      </form>
    </div>
  </section>
</template>

<style scoped>
.domains-page {
  display: flex;
  justify-content: center;
  padding: 4rem 1.5rem;
}

.domains-content {
  max-width: 56rem;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.domains-title {
  font-size: 2.25rem;
  font-weight: 700;
  line-height: 1.2;
}

.domains-subtitle {
  font-size: 1.125rem;
  color: #4a4a4a;
  line-height: 1.5;
}

.domain-search-form {
  width: 100%;
}

.search-panel {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background-color: #ffffff;
  border: 1px solid #d9e2ec;
  border-radius: 999px;
  padding: 0.75rem 1rem;
  box-shadow: 0 6px 18px rgba(15, 33, 55, 0.08);
}

.search-icon {
  color: #7a8aa0;
  display: flex;
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 1rem;
  color: #1f2a37;
}

.search-input::placeholder {
  color: #9aa5b1;
}

.search-extension {
  font-weight: 600;
  color: #2f855a;
}

.search-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background-color: #38a169;
  color: #ffffff;
  border: none;
  border-radius: 999px;
  padding: 0.5rem 1.25rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;
}

.search-button:focus,
.search-button:hover {
  background-color: #2f855a;
}

.button-icon {
  display: flex;
}

@media (max-width: 640px) {
  .domains-page {
    padding: 3rem 1rem;
  }

  .domains-title {
    font-size: 1.75rem;
  }

  .search-panel {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
    border-radius: 1.5rem;
  }

  .search-button {
    width: 100%;
    justify-content: center;
  }
}
</style>
