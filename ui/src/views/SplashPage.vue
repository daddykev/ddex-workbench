<template>
  <div class="splash-page">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="container">
        <div class="hero-content text-center">
          <h1 class="hero-title">
            DDEX Workbench
          </h1>
          <p class="hero-subtitle">
            Open-source DDEX validation, processing, and creation tools
          </p>
          <div class="hero-actions">
            <router-link to="/validator" class="btn btn-primary btn-lg">
              Start Validating
            </router-link>
            <router-link to="/api" class="btn btn-hero-secondary btn-lg">
              <font-awesome-icon :icon="['fas', 'code']" class="mr-sm" />
              View API Docs
            </router-link>
          </div>
          
          <!-- SDK Quick Links showing both npm and pip -->
          <div class="hero-sdk-section">
            <div class="hero-sdk-banner">
              <font-awesome-icon :icon="['fab', 'npm']" class="npm-icon" />
              <span>JavaScript/TypeScript:</span>
              <code class="sdk-install">npm install @ddex-workbench/sdk</code>
              <a 
                href="https://www.npmjs.com/package/@ddex-workbench/sdk" 
                target="_blank" 
                rel="noopener"
                class="sdk-link"
              >
                View on npm →
              </a>
            </div>
            
            <div class="hero-sdk-banner">
              <font-awesome-icon :icon="['fab', 'python']" class="python-icon" />
              <span>Python SDK:</span>
              <code class="sdk-install">pip install ddex-workbench</code>
              <a 
                href="https://pypi.org/project/ddex-workbench/" 
                target="_blank" 
                rel="noopener"
                class="sdk-link"
              >
                View on PyPI →
              </a>
            </div>
          </div>
          
          <div class="hero-stats">
            <div class="stat">
              <div class="stat-value">648</div>
              <div class="stat-label">Validation Rules</div>
            </div>
            <div class="stat-divider"></div>
            <div class="stat">
              <div class="stat-value">3</div>
              <div class="stat-label">ERN Versions</div>
            </div>
            <div class="stat-divider"></div>
            <div class="stat">
              <div class="stat-value">606</div>
              <div class="stat-label">Complex Types</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Current Features -->
    <section class="features-section section bg-secondary">
      <div class="container">
        <div class="text-center features-header">
          <h2 class="text-3xl font-semibold mb-md">Features</h2>
          <p class="text-lg text-secondary">
            Essential tools for digital music supply chains
          </p>
        </div>

        <!-- 3-column grid on desktop, 2 on tablet, 1 on mobile -->
        <div class="grid grid-cols-md-2 grid-cols-lg-3 gap-lg">
          <!-- DDEX Validator -->
          <div class="feature-card card card-hover">
            <div class="card-body">
              <div class="feature-icon">
                <font-awesome-icon :icon="['fas', 'check-circle']" size="3x" />
              </div>
              <h3 class="feature-title">DDEX Validator</h3>
              <p class="feature-description">
                Validate against DDEX standards. Support for ERN 3.8.2, 4.2, and 4.3 
                with profile-specific rules.
              </p>
              <ul class="feature-list">
                <li>Instant validation results</li>
                <li>Detailed error messages</li>
                <li>Line-by-line error tracking</li>
              </ul>
              <router-link to="/validator" class="btn btn-primary mt-lg">
                Try Validator
              </router-link>
            </div>
          </div>

          <!-- ERN Sandbox -->
          <div class="feature-card card card-hover">
            <div class="card-body">
              <div class="feature-icon">
                <font-awesome-icon :icon="['fas', 'edit']" size="3x" />
              </div>
              <h3 class="feature-title">ERN Sandbox</h3>
              <p class="feature-description">
                Build valid ERN 4.3 messages with a form-based editor, import metadata from a UPC/EAN,
                and validate in one click.
              </p>
              <ul class="feature-list">
                <li>Form-based message builder</li>
                <li>Metadata import by UPC/EAN</li>
                <li>Live ERN 4.3 XML preview</li>
                <li>One-click validation</li>
              </ul>
              <p class="text-sm text-tertiary text-center mb-sm">Sign in required</p>
              <router-link to="/sandbox" class="btn btn-primary">
                Open Sandbox
              </router-link>
            </div>
          </div>

          <!-- Code Snippets -->
          <div class="feature-card card card-hover">
            <div class="card-body">
              <div class="feature-icon">
                <font-awesome-icon :icon="['fas', 'code']" size="3x" />
              </div>
              <h3 class="feature-title">Code Snippets</h3>
              <p class="feature-description">
                Community-contributed ERN examples and patterns.
              </p>
              <ul class="feature-list">
                <li>Version-specific examples</li>
                <li>Common patterns library</li>
              </ul>
              <router-link to="/snippets" class="btn btn-primary mt-lg">
                Browse Snippets
              </router-link>
            </div>
          </div>

          <!-- API Access -->
          <div class="feature-card card card-hover">
            <div class="card-body">
              <div class="feature-icon">
                <font-awesome-icon :icon="['fas', 'wrench']" size="3x" />
              </div>
              <h3 class="feature-title">Developer API</h3>
              <p class="feature-description">
                RESTful API for programmatic validation. Integrate DDEX validation directly 
                into your workflow.
              </p>
              <ul class="feature-list">
                <li>Simple REST endpoints</li>
                <li>JSON responses</li>
                <li>Rate limiting protection</li>
                <li>API key management</li>
              </ul>
              <router-link to="/api" class="btn btn-primary mt-lg">
                API Documentation
              </router-link>
            </div>
          </div>

          <!-- Official SDKs Feature Card -->
          <div class="feature-card card card-hover">
            <div class="card-body">
              <div class="feature-icon sdk-icons">
                <font-awesome-icon :icon="['fab', 'npm']" size="3x" />
                <font-awesome-icon :icon="['fab', 'python']" size="3x" />
              </div>
              <h3 class="feature-title">Official SDKs</h3>
              <p class="feature-description">
                Native SDKs for JavaScript/TypeScript and Python. Easy integration with type safety.
              </p>
              <ul class="feature-list">
                <li>Full type support</li>
                <li>Auto retry logic</li>
                <li>Cross-platform</li>
                <li>Lightweight & fast</li>
              </ul>
              <div class="sdk-buttons">
                <a 
                  href="https://www.npmjs.com/package/@ddex-workbench/sdk" 
                  target="_blank"
                  rel="noopener"
                  class="btn btn-primary"
                >
                  npm
                </a>
                <a 
                  href="https://pypi.org/project/ddex-workbench/" 
                  target="_blank"
                  rel="noopener"
                  class="btn btn-primary"
                >
                  PyPI
                </a>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>

    <!-- How it works -->
    <section class="how-section section">
      <div class="container">
        <div class="text-center features-header">
          <h2 class="text-3xl font-semibold mb-md">How it works</h2>
        </div>
        <div class="solution-highlight">
          <div class="solution-steps">
            <div class="step">
              <font-awesome-icon :icon="['fas', 'check-circle']" />
              <strong class="step-title">Validate</strong>
              <span>Check ERN 3.8.2, 4.2 and 4.3 messages against the official XSDs, business rules and 648 version-specific rules.</span>
            </div>
            <div class="step-arrow">→</div>
            <div class="step">
              <font-awesome-icon :icon="['fas', 'wrench']" />
              <strong class="step-title">Build</strong>
              <span>Create an ERN 4.3 message in the Sandbox, optionally importing release metadata by UPC/EAN.</span>
            </div>
            <div class="step-arrow">→</div>
            <div class="step">
              <font-awesome-icon :icon="['fas', 'code']" />
              <strong class="step-title">Automate</strong>
              <span>Validate from your own pipeline with the REST API or the JavaScript and Python SDKs.</span>
            </div>
          </div>
        </div>
      </div>
    </section>

  </div>
</template>

<script setup>
// No imports needed for this static page
</script>

<style scoped>
/* Hero Section */
.hero-section {
  padding: var(--space-3xl) 0;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-hover) 100%);
  color: white;
}

/* Ensure primary button in hero maintains white text */
.hero-section .btn-primary {
  background-color: white;
  color: var(--color-primary);
  border: 1px solid white;
}

.hero-section .btn-primary:hover {
  background-color: rgba(255, 255, 255, 0.9);
  color: var(--color-primary);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.hero-title {
  font-size: clamp(2rem, 5vw, 3rem);
  margin-bottom: var(--space-lg);
  line-height: 1.2;
  color: white !important; /* Ensure white in both modes */
}

.hero-subtitle {
  font-size: var(--text-xl);
  opacity: 0.9;
  max-width: 800px;
  margin: 0 auto var(--space-xl);
  line-height: 1.6;
  color: white;
}

.hero-actions {
  display: flex;
  gap: var(--space-md);
  justify-content: center;
  margin-bottom: var(--space-xl);
}

/* Custom hero secondary button for better contrast */
.btn-hero-secondary {
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
}

.btn-hero-secondary:hover {
  background-color: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.4);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* SDK Section - now supports multiple banners */
.hero-sdk-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-sm);
  margin-bottom: var(--space-xl);
}

.hero-sdk-banner {
  display: inline-flex;
  align-items: center;
  gap: var(--space-sm);
  background: rgba(255, 255, 255, 0.1);
  padding: var(--space-sm) var(--space-lg);
  border-radius: var(--radius-full);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  font-size: var(--text-sm);
  color: white;
}

.npm-icon {
  color: rgba(255, 255, 255, 0.95);  /* Nearly white with slight opacity */
  font-size: var(--text-lg);
}

.python-icon {
  color: rgba(255, 255, 255, 0.95);  /* Nearly white with slight opacity */
  font-size: var(--text-lg);
}

.sdk-install {
  background: rgba(0, 0, 0, 0.2);
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  font-family: var(--font-mono);
  color: white;
}

.sdk-link {
  color: white;
  text-decoration: underline;
  transition: opacity var(--transition-base);
}

.sdk-link:hover {
  opacity: 0.8;
}

.hero-stats {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--space-2xl);
  padding-top: var(--space-xl);
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  max-width: 600px;
  margin: 0 auto;
}

.stat {
  text-align: center;
}

.stat-value {
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  color: white;
}

.stat-label {
  font-size: var(--text-sm);
  opacity: 0.8;
  color: white;
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: rgba(255, 255, 255, 0.3);
}

/* Features Section */
.features-header {
  margin-bottom: var(--space-3xl); /* Increased from 2xl */
}

.feature-card {
  height: 100%;
  transition: transform var(--transition-base);
  display: flex;
  flex-direction: column;
}

.feature-card .card-body {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.feature-card:hover {
  transform: translateY(-4px);
}

.feature-icon {
  color: var(--color-primary);
  margin-bottom: var(--space-lg);
}

/* SDK icons container - display both icons horizontally */
.sdk-icons {
  display: flex;
  gap: var(--space-lg);
  justify-content: flex-start;
}

.feature-title {
  font-size: var(--text-xl);
  margin-bottom: var(--space-md);
}

.feature-description {
  color: var(--color-text-secondary);
  margin-bottom: var(--space-lg);
}

.feature-list {
  list-style: none;
  margin-bottom: var(--space-lg);
  flex-grow: 1; /* This pushes the buttons to the bottom */
}

.feature-list li {
  padding-left: var(--space-lg);
  position: relative;
  margin-bottom: var(--space-sm);
  color: var(--color-text-secondary);
}

.feature-list li::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: var(--color-success);
  font-weight: bold;
}

/* Make all feature card buttons full width */
.feature-card .btn {
  width: 100%;
}

/* SDK buttons - ensure they're at the bottom and full width */
.sdk-buttons {
  display: flex;
  gap: var(--space-sm);
  margin-top: auto; /* Push to bottom */
}

.sdk-buttons .btn {
  flex: 1;
  justify-content: center;
}

/* Grid adjustment for 3 columns */
.grid-cols-lg-3 {
  grid-template-columns: repeat(3, 1fr);
}

/* How it works */
.solution-highlight {
  background: var(--color-primary-light);
  padding: var(--space-lg);
  border-radius: var(--radius-md);
  margin-bottom: var(--space-lg);
}

.solution-steps {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-sm);
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-xs);
  flex: 1;
  text-align: center;
}

.step svg {
  font-size: var(--text-2xl);
  color: var(--color-primary);
}

.step-title {
  color: var(--color-text);
}

.step span {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}

.step-arrow {
  color: var(--color-text-tertiary);
}

/* Dark theme adjustments */
[data-theme="dark"] .solution-highlight {
  background: rgba(66, 133, 244, 0.1);
}

/* Utilities */
.mr-sm {
  margin-right: var(--space-sm);
}

.mt-lg {
  margin-top: var(--space-lg);
}

/* Responsive */
@media (min-width: 1024px) {
  .grid-cols-lg-3 {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 1024px) and (min-width: 768px) {
  .grid-cols-lg-3 {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .hero-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .hero-sdk-section {
    gap: var(--space-sm);
  }
  
  .hero-sdk-banner {
    flex-direction: column;
    text-align: center;
    gap: var(--space-xs);
    padding: var(--space-sm) var(--space-md);
    font-size: var(--text-xs);
  }
  
  .hero-stats {
    flex-direction: column;
    gap: var(--space-lg);
  }
  
  .stat-divider {
    width: 40px;
    height: 1px;
  }
  
  .solution-steps {
    flex-direction: column;
  }
  
  .step-arrow {
    transform: rotate(90deg);
  }
  
  .grid-cols-lg-3 {
    grid-template-columns: 1fr;
  }
}
</style>