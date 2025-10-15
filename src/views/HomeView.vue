<template>
  <main class="home-container">
    <div class="hero-section">
      <h1 class="hero-title">
        Domini Blockchain <span class="highlight">.calcio</span> per Veri VISIONARI
      </h1>
      <p class="hero-subtitle">
        La prima piattaforma che unisce passione calcistica e tecnologia blockchain.
        Crea la tua community, coinvolgi i fan, costruisci il futuro.
      </p>
    </div>
  </main>
</template>

<script setup>
</script>

<style scoped>
.home-container {
  min-height: calc(100vh - 65px); /* Subtract navbar height */
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.hero-section {
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
}

.hero-title {
  font-size: 2.5rem;
  line-height: 1.2;
  margin-bottom: 1.5rem;
  color: #1a1a1a;
  font-weight: 600;
}

.highlight {
  color: #4b5563;
  font-weight: 700;
}

.hero-subtitle {
  font-size: 1.125rem;
  color: #6b7280;
  line-height: 1.6;
  max-width: 600px;
  margin: 0 auto;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .hero-title {
    font-size: 1.875rem;
    margin-bottom: 1.25rem;
  }

  .hero-subtitle {
    font-size: 1rem;
  }
}
</style>