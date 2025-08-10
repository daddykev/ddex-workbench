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
          
          <!-- UPDATED: SDK Quick Links showing both npm and pip -->
          <div class="hero-sdk-section">
            <div class="hero-sdk-banner">
              <span class="sdk-badge">NEW</span>
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
              <span class="sdk-badge">NEW</span>
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
              <div class="stat-value">ERN 4.3</div>
              <div class="stat-label">Latest Standard</div>
            </div>
            <div class="stat-divider"></div>
            <div class="stat">
              <div class="stat-value">100%</div>
              <div class="stat-label">Open Source</div>
            </div>
            <div class="stat-divider"></div>
            <div class="stat">
              <div class="stat-value">Free</div>
              <div class="stat-label">Forever</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Current Features -->
    <section class="features-section section bg-secondary">
      <div class="container">
        <div class="text-center features-header">
          <h2 class="text-3xl font-semibold mb-md">Available Now</h2>
          <p class="text-lg text-secondary">
            Essential tools for digital music supply chains
          </p>
        </div>
        
        <!-- Changed to 4-column grid on desktop, 2 on tablet -->
        <div class="grid grid-cols-md-2 grid-cols-lg-4 gap-lg">
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
                <li>Version migration hints</li>
              </ul>
              <router-link to="/validator" class="btn btn-primary mt-lg">
                Try Validator
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
                Community-driven collection of DDEX XML examples, patterns, and solutions 
                for common use cases.
              </p>
              <ul class="feature-list">
                <li>Version-specific examples</li>
                <li>Common patterns library</li>
                <li>Migration guides</li>
                <li>Community voting</li>
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
              <h3 class="feature-title">
                Official SDKs
                <span class="new-badge">NEW</span>
              </h3>
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

    <!-- The DDEX Migration Challenge -->
    <section class="challenge-section section">
      <div class="container">
        <div class="challenge-content">
          <div class="challenge-text">
            <h2 class="text-3xl font-semibold mb-lg">The ERN 4.3 Migration Challenge</h2>
            <p class="text-lg mb-md">
              DDEX is mandating ERN 4.3 migration by March 2026, sunsetting all previous versions. 
              This isn't a minor update—it's a complete re-architecture that breaks compatibility with existing systems.
            </p>
            <p class="mb-lg">
              The entire music industry faces a complex transition with limited time and resources. 
              DDEX Workbench validates ERN 4.3 with the latest XSD, business rules, and Schematron profiles.
              Migrate with less stress.
            </p>
            <div class="challenge-stats">
              <div class="stat-item">
                <font-awesome-icon :icon="['fas', 'clock']" class="stat-icon warning" />
                <span>Less than 7 months until ERN 3.x sunset</span>
              </div>
              <div class="stat-item">
                <font-awesome-icon :icon="['fas', 'code-branch']" class="stat-icon warning" />
                <span>Breaking changes require complete XML restructuring</span>
              </div>
              <div class="stat-item">
                <font-awesome-icon :icon="['fas', 'users']" class="stat-icon warning" />
                <span>Hundreds of aggregators need migration support</span>
              </div>
            </div>
          </div>
          <div class="challenge-image">
            <!-- Updated graphic to show solution -->
            <div class="challenge-graphic">
              <div class="solution-highlight">
                <div class="solution-label">Your Migration Path</div>
                <div class="solution-steps">
                  <div class="step">
                    <font-awesome-icon :icon="['fas', 'file-code']" />
                    <span>Validate existing ERN</span>
                  </div>
                  <div class="step-arrow">→</div>
                  <div class="step">
                    <font-awesome-icon :icon="['fas', 'wrench']" />
                    <span>Use Sandbox for ERN 4.3</span>
                  </div>
                  <div class="step-arrow">→</div>
                  <div class="step">
                    <font-awesome-icon :icon="['fas', 'check-circle']" />
                    <span>Deploy with confidence</span>
                  </div>
                </div>
              </div>
              <div class="timeline mt-lg">
                <div class="timeline-item">
                  <div class="timeline-date">Now</div>
                  <div class="timeline-label">Start Migration</div>
                </div>
                <div class="timeline-arrow">→</div>
                <div class="timeline-item highlight">
                  <div class="timeline-date">March 2026</div>
                  <div class="timeline-label">ERN 4.3</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Future Roadmap -->
    <section class="roadmap-section section bg-secondary">
      <div class="container">
        <div class="text-center mb-3xl">
          <h2 class="text-3xl font-semibold mb-md">Roadmap</h2>
          <p class="text-lg text-secondary mb-xl">
            Building a better DDEX ecosystem, one tool at a time
          </p>
        </div>

        <div class="roadmap-timeline">

          <!-- Phase 2: DDEX ERN Sandbox -->
          <div class="roadmap-item">
            <div class="roadmap-marker">
              <span class="roadmap-phase">Phase 2</span>
            </div>
            <div class="roadmap-content card">
              <div class="card-body">
                <h3 class="text-xl font-semibold mb-sm">ERN Sandbox</h3>
                <p class="text-secondary mb-md">
                  Visual form-based ERN creation without writing XML
                </p>
                <ul class="roadmap-features">
                  <li>Interactive forms for metadata and resources</li>
                  <li>Pre-built templates (Single, Album, Video)</li>
                  <li>Real-time XML generation with syntax highlighting</li>
                  <li>Human-friendly input (e.g., duration as MM:SS)</li>
                  <li>One-click validation and export</li>
                </ul>
                <div class="roadmap-footer">
                  <span class="roadmap-status">Q3 2025</span>
                  <router-link to="/sandbox" class="roadmap-beta-btn">
                    Public Beta
                  </router-link>
                </div>
              </div>
            </div>
          </div>

          <!-- Phase 3: DSR Flow -->
          <div class="roadmap-item">
            <div class="roadmap-marker">
              <span class="roadmap-phase">Phase 3</span>
            </div>
            <div class="roadmap-content card">
              <div class="card-body">
                <h3 class="text-xl font-semibold mb-sm">DSR-Flow</h3>
                <p class="text-secondary mb-md">
                  Digital Sales Reporting processor for financial reconciliation
                </p>
                <ul class="roadmap-features">
                  <li>Flat-file DSR validation</li>
                  <li>Multi-profile support (Basic Audio, UGC)</li>
                  <li>Automated processing pipelines</li>
                  <li>Financial reporting transformation</li>
                </ul>
                <span class="roadmap-status">Q4 2025</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta-section section">
      <div class="container">
        <div class="cta-box bg-primary text-center">
          <h2 class="text-3xl font-semibold mb-md">Ready to Start?</h2>
          <p class="text-lg mb-lg">
            Join the open-source movement to democratize digital music distribution
          </p>
          <div class="cta-actions">
            <router-link to="/validator" class="btn btn-secondary btn-lg">
              Try the Validator
            </router-link>
            <a 
              href="https://github.com/daddykev/ddex-workbench" 
              target="_blank" 
              rel="noopener"
              class="btn btn-outline btn-lg"
            >
              <font-awesome-icon :icon="['fab', 'github']" class="mr-sm" />
              View on GitHub
            </a>
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

.sdk-badge {
  background: var(--color-success);
  color: white;
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  font-weight: var(--font-semibold);
  font-size: var(--text-xs);
}

.npm-icon {
  color: #CB3837;
  font-size: var(--text-lg);
}

.python-icon {
  color: #3776AB;
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

/* SDK buttons - horizontal layout */
.sdk-buttons {
  display: flex;
  gap: var(--space-sm);
  margin-top: var(--space-lg);
}

.sdk-buttons .btn {
  flex: 1;
  justify-content: center;
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

/* New badge for SDK card */
.new-badge {
  display: inline-block;
  background: var(--color-success);
  color: white;
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  margin-left: var(--space-xs);
  vertical-align: super;
}

/* SDK buttons */
.sdk-buttons {
  display: flex;
  gap: var(--space-sm);
  justify-content: center;
  margin-top: var(--space-lg);
}

/* Grid adjustment for 4 columns */
.grid-cols-lg-4 {
  grid-template-columns: repeat(4, 1fr);
}

/* Challenge Section */
.challenge-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-2xl);
  align-items: center;
}

.challenge-stats {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  color: var(--color-text-secondary);
}

.stat-icon {
  color: var(--color-warning);
  font-size: var(--text-xl);
}

.stat-icon.warning {
  color: var(--color-warning);
}

.stat-item.success {
  background: var(--color-success-light);
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-md);
  margin-top: var(--space-sm);
}

.stat-item.success .stat-icon {
  color: var(--color-success);
}

.challenge-graphic {
  background: var(--color-bg-secondary);
  padding: var(--space-2xl);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
}

.solution-highlight {
  background: var(--color-primary-light);
  padding: var(--space-lg);
  border-radius: var(--radius-md);
  margin-bottom: var(--space-lg);
}

.solution-label {
  font-weight: var(--font-semibold);
  color: var(--color-primary);
  margin-bottom: var(--space-md);
  text-align: center;
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

.step span {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}

.step-arrow {
  color: var(--color-text-tertiary);
}

.timeline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-lg);
}

.timeline-item {
  text-align: center;
  flex: 1;
}

.timeline-date {
  font-weight: var(--font-semibold);
  color: var(--color-text);
  margin-bottom: var(--space-xs);
}

.timeline-label {
  color: var(--color-text-secondary);
  font-size: var(--text-sm);
}

.timeline-item.highlight .timeline-date {
  color: var(--color-primary);
}

.timeline-arrow {
  font-size: var(--text-2xl);
  color: var(--color-text-tertiary);
}

/* Roadmap Section */
.roadmap-timeline {
  max-width: 800px;
  margin: 0 auto;
  position: relative;
}

.roadmap-timeline::before {
  content: '';
  position: absolute;
  left: 30px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: var(--color-border);
}

.roadmap-item {
  position: relative;
  padding-left: 80px;
  margin-bottom: var(--space-2xl);
}

.roadmap-marker {
  position: absolute;
  left: 0;
  top: 0;
  width: 60px;
  height: 60px;
  background: var(--color-primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: var(--font-bold);
  font-size: var(--text-xs);
}

.roadmap-phase {
  text-align: center;
  line-height: 1.2;
}

.roadmap-features {
  list-style: none;
  margin-bottom: var(--space-md);
}

.roadmap-features li {
  padding-left: var(--space-lg);
  position: relative;
  margin-bottom: var(--space-xs);
  color: var(--color-text-secondary);
  font-size: var(--text-sm);
}

.roadmap-features li::before {
  content: '•';
  position: absolute;
  left: 0;
  color: var(--color-primary);
}

.roadmap-status {
  display: inline-block;
  padding: var(--space-xs) var(--space-sm);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
  font-weight: var(--font-medium);
}

.roadmap-footer {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.roadmap-beta-btn {
  display: inline-block;
  padding: var(--space-xs) var(--space-sm);
  background: var(--color-success);
  color: white;
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  text-decoration: none;
  transition: all var(--transition-base);
}

.roadmap-beta-btn:hover {
  background: var(--color-success);
  color: white;
  transform: scale(1.05);
  box-shadow: 0 2px 8px rgba(52, 168, 83, 0.3);
}

/* Dark theme adjustments */
[data-theme="dark"] .stat-item.success {
  background: rgba(65, 196, 100, 0.1);
}

[data-theme="dark"] .solution-highlight {
  background: rgba(66, 133, 244, 0.1);
}

[data-theme="dark"] .roadmap-beta-btn {
  background: var(--color-success);
  color: var(--color-bg);
}

[data-theme="dark"] .roadmap-beta-btn:hover {
  background: var(--color-success);
  color: var(--color-bg);
  box-shadow: 0 2px 8px rgba(65, 196, 100, 0.4);
}

/* CTA Section */
.cta-box {
  padding: var(--space-3xl);
  border-radius: var(--radius-xl);
  color: white;
}

.cta-box h2 {
  color: white;
}

.cta-actions {
  display: flex;
  gap: var(--space-md);
  justify-content: center;
}

.btn-outline {
  background: transparent;
  border: 2px solid white;
  color: white;
}

.btn-outline:hover {
  background: white;
  color: var(--color-primary);
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
  .grid-cols-lg-4 {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 1024px) and (min-width: 768px) {
  .grid-cols-lg-4 {
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
  
  .challenge-content {
    grid-template-columns: 1fr;
  }
  
  .solution-steps {
    flex-direction: column;
  }
  
  .step-arrow {
    transform: rotate(90deg);
  }
  
  .grid-cols-lg-4 {
    grid-template-columns: 1fr;
  }
  
  .cta-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .cta-actions .btn {
    width: 100%;
    max-width: 300px;
  }
}
</style>