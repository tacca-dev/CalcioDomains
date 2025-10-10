<script setup>
import { RouterLink, RouterView } from 'vue-router'
import HelloWorld from './components/HelloWorld.vue'
</script>

<template>
  <header class="app-header">
    <img alt="Vue logo" class="brand-logo" src="@/assets/logo.svg" width="125" height="125" />

    <div class="header-content">
      <HelloWorld msg="You did it!" />

      <nav class="primary-nav" aria-label="Navigazione principale">
        <ul class="nav-links">
          <li>
            <RouterLink class="nav-link" to="/">Home</RouterLink>
          </li>
          <li>
            <RouterLink class="nav-link" to="/about">About</RouterLink>
          </li>
        </ul>
      </nav>
    </div>
  </header>

  <RouterView />
</template>

<style scoped>
.app-header {
  line-height: 1.5;
  max-height: 100vh;
}

.brand-logo {
  display: block;
  margin: 0 auto 2rem;
}

.header-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.primary-nav {
  width: 100%;
  margin-top: 2rem;
}

.nav-links {
  display: flex;
  justify-content: center;
  list-style: none;
  padding: 0;
  margin: 0;
  font-size: 12px;
  text-align: center;
}

.nav-link {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

.nav-links li:first-of-type .nav-link {
  border: 0;
}

.nav-link.router-link-exact-active {
  color: var(--color-text);
}

.nav-link.router-link-exact-active:hover {
  background-color: transparent;
}

@media (min-width: 1024px) {
  .app-header {
    display: flex;
    align-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .brand-logo {
    margin: 0 2rem 0 0;
  }

  .header-content {
    align-items: flex-start;
  }

  .primary-nav {
    width: auto;
    margin-top: 1rem;
  }

  .nav-links {
    justify-content: flex-start;
    font-size: 1rem;
    margin: 0;
  }

  .nav-link {
    padding: 1rem;
  }

  .nav-links li:first-of-type .nav-link {
    padding-left: 0;
  }
}
</style>
