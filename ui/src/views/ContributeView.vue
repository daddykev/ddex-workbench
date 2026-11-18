<!-- src/views/ContributeView.vue -->
<template>
  <div class="container section pt-xl"> <!-- Added pt-xl class -->
    <div class="content-wrapper">
      <h1 class="text-3xl font-semibold mb-lg">Contributing to DDEX Workbench</h1>
      
      <div class="card mb-xl">
        <div class="card-body">
          <p class="mb-md">
            We welcome contributions to DDEX Workbench! This project aims to make DDEX standards
            more accessible to the music industry through open-source tools.
          </p>
          
          <h2 class="text-xl font-semibold mb-md">How to Contribute</h2>
          
          <div class="steps">
            <div class="step">
              <h3 class="font-semibold mb-sm">1. Fork the Repository</h3>
              <p>Fork the project on GitHub and clone your fork locally.</p>
            </div>
            
            <div class="step">
              <h3 class="font-semibold mb-sm">2. Create a Feature Branch</h3>
              <code>git checkout -b feature/amazing-feature</code>
            </div>
            
            <div class="step">
              <h3 class="font-semibold mb-sm">3. Make Your Changes</h3>
              <p>Write code, add tests, and update documentation as needed.</p>
            </div>
            
            <div class="step">
              <h3 class="font-semibold mb-sm">4. Commit Your Changes</h3>
              <code>git commit -m 'feat: add amazing feature'</code>
            </div>
            
            <div class="step">
              <h3 class="font-semibold mb-sm">5. Push and Create PR</h3>
              <p>Push to your fork and open a Pull Request to the main repository.</p>
            </div>
          </div>
          
          <div class="mt-xl">
            <a 
              href="https://github.com/daddykev/ddex-workbench/blob/main/CONTRIBUTING.md" 
              target="_blank" 
              rel="noopener"
              class="btn btn-primary mr-md"
            >
              View Full Guidelines
            </a>
            <a 
              href="https://github.com/daddykev/ddex-workbench" 
              target="_blank" 
              rel="noopener"
              class="btn btn-secondary"
            >
              View on GitHub
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.content-wrapper {
  max-width: 800px;
  margin: 0 auto;
}

.steps {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
  margin: var(--space-lg) 0;
}

.step {
  padding: var(--space-md);
  background-color: var(--color-bg-secondary);
  border-radius: var(--radius-md);
  border-left: 3px solid var(--color-primary);
}

.step code {
  display: inline-block;
  margin-top: var(--space-sm);
  padding: var(--space-xs) var(--space-sm);
  background-color: var(--color-bg-tertiary);
  border-radius: var(--radius-sm);
  font-family: var(--font-mono);
  font-size: var(--text-sm);
}
</style>