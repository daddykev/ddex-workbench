<template>
  <div class="pricing-view">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="container">
        <div class="hero-content text-center">
          <h1 class="hero-title">Simple, Transparent Pricing</h1>
          <p class="hero-subtitle">
            Start free and scale as you grow. Core validation tools always open source.
          </p>
        </div>
      </div>
    </section>

    <!-- Pricing Tiers -->
    <section class="pricing-section section">
      <div class="container">
        <div class="pricing-grid">
          <!-- Free Tier -->
          <div class="pricing-card">
            <div class="card-header">
              <h3 class="tier-name">Open Source</h3>
              <div class="tier-price">
                <span class="price-amount">$0</span>
                <span class="price-period">forever</span>
              </div>
              <p class="tier-description">
                Perfect for independent artists and developers
              </p>
            </div>
            
            <div class="card-body">
              <ul class="feature-list">
                <li class="feature-item">
                  <font-awesome-icon :icon="['fas', 'check']" class="feature-icon" />
                  ERN 4.3 validation
                </li>
                <li class="feature-item">
                  <font-awesome-icon :icon="['fas', 'check']" class="feature-icon" />
                  Web validator interface
                </li>
                <li class="feature-item">
                  <font-awesome-icon :icon="['fas', 'check']" class="feature-icon" />
                  10 API requests/minute
                </li>
                <li class="feature-item">
                  <font-awesome-icon :icon="['fas', 'check']" class="feature-icon" />
                  Community snippets access
                </li>
                <li class="feature-item">
                  <font-awesome-icon :icon="['fas', 'check']" class="feature-icon" />
                  Basic error reporting
                </li>
                <li class="feature-item">
                  <font-awesome-icon :icon="['fas', 'check']" class="feature-icon" />
                  MIT licensed codebase
                </li>
              </ul>
            </div>
            
            <div class="card-footer">
              <router-link to="/validator" class="btn btn-secondary btn-block">
                Start Validating
              </router-link>
            </div>
          </div>

          <!-- Pro Tier -->
          <div class="pricing-card featured">
            <div class="featured-badge">Most Popular</div>
            <div class="card-header">
              <h3 class="tier-name">Pro</h3>
              <div class="tier-price">
                <span class="price-amount">$49</span>
                <span class="price-period">per month</span>
              </div>
              <p class="tier-description">
                For labels and distribution platforms
              </p>
            </div>
            
            <div class="card-body">
              <ul class="feature-list">
                <li class="feature-item emphasized">
                  <font-awesome-icon :icon="['fas', 'check']" class="feature-icon" />
                  Everything in Open Source
                </li>
                <li class="feature-item">
                  <font-awesome-icon :icon="['fas', 'check']" class="feature-icon" />
                  1,000 API requests/minute
                </li>
                <li class="feature-item">
                  <font-awesome-icon :icon="['fas', 'check']" class="feature-icon" />
                  90-day validation history
                </li>
                <li class="feature-item">
                  <font-awesome-icon :icon="['fas', 'check']" class="feature-icon" />
                  Batch processing (100 files)
                </li>
                <li class="feature-item">
                  <font-awesome-icon :icon="['fas', 'check']" class="feature-icon" />
                  Advanced error analytics
                </li>
                <li class="feature-item">
                  <font-awesome-icon :icon="['fas', 'check']" class="feature-icon" />
                  Custom validation profiles
                </li>
                <li class="feature-item">
                  <font-awesome-icon :icon="['fas', 'check']" class="feature-icon" />
                  Priority support (48hr)
                </li>
                <li class="feature-item">
                  <font-awesome-icon :icon="['fas', 'check']" class="feature-icon" />
                  Create & vote on snippets
                </li>
              </ul>
            </div>
            
            <div class="card-footer">
              <button class="btn btn-primary btn-block" @click="startProTrial">
                Start 14-Day Free Trial
              </button>
            </div>
          </div>

          <!-- Enterprise Tier -->
          <div class="pricing-card">
            <div class="card-header">
              <h3 class="tier-name">Enterprise</h3>
              <div class="tier-price">
                <span class="price-amount">Custom</span>
                <span class="price-period">pricing</span>
              </div>
              <p class="tier-description">
                For major labels and enterprise platforms
              </p>
            </div>
            
            <div class="card-body">
              <ul class="feature-list">
                <li class="feature-item emphasized">
                  <font-awesome-icon :icon="['fas', 'check']" class="feature-icon" />
                  Everything in Pro
                </li>
                <li class="feature-item">
                  <font-awesome-icon :icon="['fas', 'check']" class="feature-icon" />
                  Unlimited API requests
                </li>
                <li class="feature-item">
                  <font-awesome-icon :icon="['fas', 'check']" class="feature-icon" />
                  99.9% uptime SLA
                </li>
                <li class="feature-item">
                  <font-awesome-icon :icon="['fas', 'check']" class="feature-icon" />
                  Custom validation rules
                </li>
                <li class="feature-item">
                  <font-awesome-icon :icon="['fas', 'check']" class="feature-icon" />
                  Private snippet repos
                </li>
                <li class="feature-item">
                  <font-awesome-icon :icon="['fas', 'check']" class="feature-icon" />
                  White-label options
                </li>
                <li class="feature-item">
                  <font-awesome-icon :icon="['fas', 'check']" class="feature-icon" />
                  Dedicated support
                </li>
                <li class="feature-item">
                  <font-awesome-icon :icon="['fas', 'check']" class="feature-icon" />
                  On-premise deployment
                </li>
              </ul>
            </div>
            
            <div class="card-footer">
              <button class="btn btn-secondary btn-block" @click="contactSales">
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- FAQ Section -->
    <section class="faq-section section bg-secondary">
      <div class="container">
        <h2 class="section-title text-center">Frequently Asked Questions</h2>
        
        <div class="faq-grid">
          <div class="faq-item">
            <h3 class="faq-question">Is the core validation really free forever?</h3>
            <p class="faq-answer">
              Yes! The ERN 4.3 validation engine and basic web interface will always be 
              free and open source under the MIT license. We believe essential infrastructure 
              should be accessible to everyone.
            </p>
          </div>
          
          <div class="faq-item">
            <h3 class="faq-question">What counts as an API request?</h3>
            <p class="faq-answer">
              Each validation submission counts as one request. This includes both 
              successful validations and those that return errors. File uploads and 
              text submissions are counted the same way.
            </p>
          </div>
          
          <div class="faq-item">
            <h3 class="faq-question">Can I switch between plans?</h3>
            <p class="faq-answer">
              Absolutely! You can upgrade or downgrade at any time. When upgrading, 
              you'll get immediate access to Pro features. When downgrading, you'll 
              keep Pro features until the end of your billing period.
            </p>
          </div>
          
          <div class="faq-item">
            <h3 class="faq-question">Do you offer discounts for non-profits?</h3>
            <p class="faq-answer">
              Yes, we offer 50% off Pro plans for registered non-profits working in 
              music education or artist development. Contact us with your organization 
              details to apply.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta-section section">
      <div class="container">
        <div class="cta-content text-center">
          <h2 class="cta-title">Ready to modernize your DDEX workflow?</h2>
          <p class="cta-subtitle">
            Join thousands of music industry professionals using DDEX Workbench
          </p>
          <div class="cta-buttons">
            <router-link to="/validator" class="btn btn-primary btn-lg">
              Try Free Validator
            </router-link>
            <router-link to="/docs/api" class="btn btn-secondary btn-lg">
              View API Docs
            </router-link>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const startProTrial = () => {
  // Navigate to signup with pro trial flag
  router.push('/signup?plan=pro-trial')
}

const contactSales = () => {
  // Open contact form or mailto
  window.location.href = 'mailto:sales@ddex-workbench.org?subject=Enterprise%20Inquiry'
}
</script>

<style scoped>
/* Hero Section */
.hero-section {
  padding: var(--space-3xl) 0 var(--space-2xl);
  background-color: var(--color-bg-secondary);
  border-bottom: 1px solid var(--color-border);
}

.hero-title {
  font-size: var(--text-4xl);
  margin-bottom: var(--space-md);
  color: var(--color-heading);
}

.hero-subtitle {
  font-size: var(--text-lg);
  color: var(--color-text-secondary);
  max-width: 600px;
  margin: 0 auto;
}

/* Pricing Grid */
.pricing-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: var(--space-xl);
  max-width: 1200px;
  margin: 0 auto;
}

/* Pricing Cards */
.pricing-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  position: relative;
  display: flex;
  flex-direction: column;
  transition: all var(--transition-base);
}

.pricing-card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}

.pricing-card.featured {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-md);
}

.featured-badge {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--color-primary);
  color: white;
  padding: var(--space-xs) var(--space-md);
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
}

/* Card Structure */
.card-header {
  padding: var(--space-xl);
  text-align: center;
  border-bottom: 1px solid var(--color-border);
}

.tier-name {
  font-size: var(--text-2xl);
  margin-bottom: var(--space-md);
  color: var(--color-heading);
}

.tier-price {
  margin-bottom: var(--space-sm);
}

.price-amount {
  font-size: var(--text-4xl);
  font-weight: var(--font-bold);
  color: var(--color-heading);
}

.price-period {
  font-size: var(--text-base);
  color: var(--color-text-secondary);
  margin-left: var(--space-xs);
}

.tier-description {
  color: var(--color-text-secondary);
  font-size: var(--text-base);
}

.card-body {
  padding: var(--space-xl);
  flex: 1;
}

.card-footer {
  padding: var(--space-xl);
  padding-top: 0;
}

/* Feature List */
.feature-list {
  list-style: none;
}

.feature-item {
  display: flex;
  align-items: flex-start;
  gap: var(--space-sm);
  margin-bottom: var(--space-md);
  color: var(--color-text);
}

.feature-item.emphasized {
  font-weight: var(--font-semibold);
  color: var(--color-heading);
  padding-bottom: var(--space-sm);
  margin-bottom: var(--space-md);
  border-bottom: 1px solid var(--color-border);
}

.feature-icon {
  color: var(--color-success);
  flex-shrink: 0;
  margin-top: 2px;
}

/* Buttons */
.btn-block {
  width: 100%;
}

/* FAQ Section */
.faq-section {
  background-color: var(--color-bg-secondary);
}

.section-title {
  font-size: var(--text-3xl);
  margin-bottom: var(--space-2xl);
  color: var(--color-heading);
}

.faq-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: var(--space-2xl);
  max-width: 1000px;
  margin: 0 auto;
}

.faq-item {
  background: var(--color-surface);
  padding: var(--space-xl);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
}

.faq-question {
  font-size: var(--text-lg);
  margin-bottom: var(--space-md);
  color: var(--color-heading);
}

.faq-answer {
  color: var(--color-text-secondary);
  line-height: var(--leading-relaxed);
}

/* CTA Section */
.cta-section {
  padding: var(--space-3xl) 0;
}

.cta-content {
  max-width: 800px;
  margin: 0 auto;
}

.cta-title {
  font-size: var(--text-3xl);
  margin-bottom: var(--space-md);
  color: var(--color-heading);
}

.cta-subtitle {
  font-size: var(--text-lg);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-xl);
}

.cta-buttons {
  display: flex;
  gap: var(--space-md);
  justify-content: center;
}

/* Responsive */
@media (max-width: 768px) {
  .pricing-grid {
    grid-template-columns: 1fr;
  }
  
  .faq-grid {
    grid-template-columns: 1fr;
  }
  
  .cta-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .cta-buttons .btn {
    width: 100%;
    max-width: 300px;
  }
}
</style>