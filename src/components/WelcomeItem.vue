<template>
  <article class="resource-card">
    <div class="resource-icon">
      <slot name="icon"></slot>
    </div>
    <div class="resource-details">
      <h3 class="resource-title">
        <slot name="heading"></slot>
      </h3>
      <div class="resource-description">
        <slot></slot>
      </div>
    </div>
  </article>
</template>

<style scoped>
.resource-card {
  margin-top: 2rem;
  display: flex;
  position: relative;
}

.resource-details {
  flex: 1;
  margin-left: 1rem;
}

.resource-icon {
  display: flex;
  place-items: center;
  place-content: center;
  width: 32px;
  height: 32px;
  color: var(--color-text);
}

.resource-title {
  font-size: 1.2rem;
  font-weight: 500;
  margin-bottom: 0.4rem;
  color: var(--color-heading);
}

.resource-description {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

@media (min-width: 1024px) {
  .resource-card {
    margin-top: 0;
    padding: 0.4rem 0 1rem calc(var(--section-gap) / 2);
  }

  .resource-icon {
    top: calc(50% - 25px);
    left: -26px;
    position: absolute;
    border: 1px solid var(--color-border);
    background: var(--color-background);
    border-radius: 8px;
    width: 50px;
    height: 50px;
  }

  .resource-card:before {
    content: ' ';
    border-left: 1px solid var(--color-border);
    position: absolute;
    left: 0;
    bottom: calc(50% + 25px);
    height: calc(50% - 25px);
  }

  .resource-card:after {
    content: ' ';
    border-left: 1px solid var(--color-border);
    position: absolute;
    left: 0;
    top: calc(50% + 25px);
    height: calc(50% - 25px);
  }

  .resource-card:first-of-type:before {
    display: none;
  }

  .resource-card:last-of-type:after {
    display: none;
  }
}
</style>
