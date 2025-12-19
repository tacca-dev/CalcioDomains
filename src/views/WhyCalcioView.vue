<template>
  <div class="why-calcio-view">
    <header class="hero-section">
      <div class="container">
        <h1 class="title">Perché un dominio <span class="highlight">.calcio</span>?</h1>
        <p class="subtitle">
          Scopri come la tecnologia blockchain sta rivoluzionando l'identità digitale nel mondo del
          calcio!
        </p>
      </div>
    </header>

    <section class="content-section">
      <div class="container">
        <div class="grid">
          <div class="card">
            <div class="icon-wrapper">🛡️</div>
            <h3>Proprietà Vera</h3>
            <p>
              A differenza dei domini tradizionali (.com, .it), un dominio blockchain è un NFT
              (Non-Fungible Token) di tua proprietà esclusiva. Nessuno può revocarlo o censurarlo.
            </p>
          </div>
          <div class="card">
            <div class="icon-wrapper">♾️</div>
            <h3>Senza Rinnovi</h3>
            <p>
              Acquisti il tuo dominio una volta e resta tuo per sempre. Non ci sono canoni annuali
              di rinnovo o scadenze da ricordare.
            </p>
          </div>
          <div class="card">
            <div class="icon-wrapper">⚽</div>
            <h3>Identità per Tifosi</h3>
            <p>
              Mostra la tua passione. Un dominio .calcio è il modo perfetto per identificarti nel
              Web3 come vero appassionato o professionista del settore.
            </p>
          </div>
          <div class="card">
            <div class="icon-wrapper">💳</div>
            <h3>Semplifica i Pagamenti</h3>
            <p>
              Usa il tuo nome (es. mario.calcio) al posto di lunghi e complessi indirizzi wallet per
              ricevere criptovalute dai tuoi amici o fan.
            </p>
          </div>
        </div>
      </div>
    </section>

    <section class="use-cases-section">
      <div class="container">
        <h2 class="section-title">Casi d'Uso Possibili</h2>
        <div class="use-case-item">
          <div class="use-case-content">
            <h4>Personal Branding</h4>
            <p>
              Sei un calciatore, un giornalista o un content creator? Un dominio .calcio consolida
              il tuo brand nel futuro di internet.
            </p>
          </div>
        </div>
        <div class="use-case-item">
          <div class="use-case-content">
            <h4>Fan Club & Community</h4>
            <p>
              Crea un'identità digitale univoca per il tuo club o gruppo di tifosi, aprendo le porte
              a esperienze esclusive nel metaverso.
            </p>
          </div>
        </div>
        <div class="use-case-item">
          <div class="use-case-content">
            <h4>Ecosystem Interoperability</h4>
            <p>
              Utilizza il tuo dominio .calcio attraverso diverse applicazioni decentralizzate
              (DApps), giochi blockchain e piattaforme social Web3.
            </p>
          </div>
        </div>
      </div>
    </section>

    <section class="cta-section">
      <div class="container">
        <h2>Pronto a scendere in campo?</h2>
        <p>Assicurati oggi stesso il tuo nome nel futuro del calcio digitale.</p>
        <router-link to="/domains" class="cta-button">Cerca il tuo dominio</router-link>
      </div>
    </section>
  </div>
</template>

<script setup>
// No logic needed for this static informational page
</script>

<style scoped>
.why-calcio-view {
  color: #1a1a1a;
  line-height: 1.6;
}

.container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.hero-section {
  background: #f9fafb;
  padding: 5rem 0;
  text-align: center;
  border-bottom: 1px solid #e5e7eb;
}

.title {
  font-size: 3rem;
  font-weight: 700;
  line-height: 1.6;
  margin-bottom: 1rem;
}

.highlight {
  display: inline;
  color: #4b5563;
  font-weight: 400;
}

.subtitle {
  font-size: 1.25rem;
  color: #6b7280;
  font-weight: 400;
  max-width: 700px;
  margin: 0 auto;
}

.content-section {
  padding: 5rem 0;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
}

.card {
  padding: 2rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.icon-wrapper {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.card h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
}

.card p {
  color: #6b7280;
  font-size: 0.95rem;
}

.use-cases-section {
  background: #f3f4f6;
  padding: 5rem 0;
}

.section-title {
  text-align: center;
  font-size: 2.25rem;
  font-weight: 700;
  margin-bottom: 3rem;
}

.use-case-item {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  border: 1px solid #e5e7eb;
}

.use-case-content h4 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.use-case-content p {
  color: #6b7280;
}

.cta-section {
  padding: 5rem 0;
  text-align: center;
}

.cta-section h2 {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.cta-section p {
  font-size: 1.125rem;
  color: #6b7280;
  margin-bottom: 2rem;
}

.cta-button {
  display: inline-block;
  background: #1a1a1a;
  color: white;
  padding: 0.75rem 2rem;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  transition: background 0.2s ease;
}

.cta-button:hover {
  background: #4b5563;
}

@media (max-width: 768px) {
  .title {
    font-size: 2.25rem;
  }

  .hero-section {
    padding: 3rem 0;
  }

  .content-section,
  .use-cases-section,
  .cta-section {
    padding: 3rem 0;
  }
}
</style>
