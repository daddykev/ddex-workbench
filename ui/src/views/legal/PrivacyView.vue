<template>
  <div class="legal-page">
    <!-- Hero Section -->
    <section class="hero-section bg-secondary">
      <div class="container">
        <div class="hero-content text-center">
          <h1 class="hero-title">Privacy Policy</h1>
          <p class="hero-subtitle">
            Last updated: November 19, 2026
          </p>
        </div>
      </div>
    </section>

    <!-- Content Section -->
    <section class="section">
      <div class="container">
        <div class="legal-content">
          <div class="legal-nav">
            <h3 class="nav-title">Contents</h3>
            <ul class="nav-list">
              <li><a href="#overview" @click="scrollToSection('overview')">Overview</a></li>
              <li><a href="#open-source" @click="scrollToSection('open-source')">Open Source Commitment</a></li>
              <li><a href="#information-we-collect" @click="scrollToSection('information-we-collect')">Information We Collect</a></li>
              <li><a href="#information-we-dont-collect" @click="scrollToSection('information-we-dont-collect')">Information We Don't Collect</a></li>
              <li><a href="#how-we-use" @click="scrollToSection('how-we-use')">How We Use Information</a></li>
              <li><a href="#data-storage" @click="scrollToSection('data-storage')">Data Storage</a></li>
              <li><a href="#third-parties" @click="scrollToSection('third-parties')">Third-Party Services</a></li>
              <li><a href="#analytics" @click="scrollToSection('analytics')">Analytics</a></li>
              <li><a href="#your-rights" @click="scrollToSection('your-rights')">Your Rights</a></li>
              <li><a href="#contact" @click="scrollToSection('contact')">Contact Us</a></li>
            </ul>
          </div>

          <div class="legal-main">
            <section id="overview" class="legal-section">
              <h2>Overview</h2>
              <p>
                DDEX Workbench is an open-source project committed to transparency and user privacy. 
                We collect only the minimal information necessary to provide our DDEX validation services 
                and maintain a functional platform.
              </p>
              <div class="info-box">
                <strong>Key Points:</strong>
                <ul>
                  <li>We do NOT sell your data to anyone</li>
                  <li>We do NOT store your validated XML files unless you explicitly save them</li>
                  <li>We collect only the information needed to run the service, plus basic usage analytics (see <a href="#analytics" @click="scrollToSection('analytics')">Analytics</a> below)</li>
                  <li>Our application code is open source (MIT) and auditable</li>
                </ul>
              </div>
            </section>

            <section id="open-source" class="legal-section">
              <h2>Open Source Commitment</h2>
              <p>
                DDEX Workbench is released under the MIT License. Our commitment to open source means:
              </p>
              <ul>
                <li>Our code is publicly available on <a href="https://github.com/daddykev/ddex-workbench" target="_blank" rel="noopener">GitHub</a></li>
                <li>You can review exactly how we handle your data</li>
                <li>The application code is open source under the MIT License. The validation rule files are not included in the repository, so a self-hosted instance validates XSD and business rules only once rule support is added in a future change.</li>
                <li>We welcome community contributions and oversight</li>
              </ul>
            </section>

            <section id="information-we-collect" class="legal-section">
              <h2>Information We Collect</h2>
              <h3>Account Information (Optional)</h3>
              <p>If you choose to create an account, we collect:</p>
              <ul>
                <li><strong>Email address</strong> - for authentication and account recovery</li>
                <li><strong>Display name</strong> - for personalization (can be a pseudonym)</li>
                <li><strong>Authentication tokens</strong> - managed by Firebase Auth</li>
              </ul>

              <h3>Service Usage Data</h3>
              <p>To improve our service, we collect:</p>
              <ul>
                <li><strong>API usage statistics</strong> - request counts for rate limiting</li>
                <li><strong>Validation metadata</strong> - file size, processing time, ERN version (NOT file content)</li>
                <li><strong>Error logs</strong> - for debugging (sanitized of personal data)</li>
              </ul>

              <h3>Technical Information</h3>
              <ul>
                <li><strong>Standard server request logs</strong> (IP address, browser user-agent, timestamps), retained by Google Cloud for operations and security</li>
                <li><strong>IP address</strong> - for rate limiting and security</li>
              </ul>
            </section>

            <section id="information-we-dont-collect" class="legal-section">
              <h2>Information We DON'T Collect</h2>
              <div class="warning-box">
                <strong>Important:</strong> We do NOT:
                <ul>
                  <li>Store the content of your validated XML files</li>
                  <li>Track or analyze your DDEX file contents</li>
                  <li>Collect payment information (service is free)</li>
                  <li>Use advertising cookies, advertising pixels, or ad networks</li>
                  <li>Share or sell any user data</li>
                  <li>Perform any data mining on your content</li>
                </ul>
              </div>
              <p>
                When you validate a file, it is processed in memory and immediately discarded after 
                validation completes. The only exception is if you explicitly choose to save a snippet 
                for community sharing.
              </p>
            </section>

            <section id="how-we-use" class="legal-section">
              <h2>How We Use Information</h2>
              <p>We use collected information solely to:</p>
              <ul>
                <li>Authenticate users who choose to create accounts</li>
                <li>Enforce rate limits to ensure fair usage</li>
                <li>Debug and improve the validation service</li>
                <li>Understand page usage and site traffic</li>
                <li>Respond to support requests</li>
                <li>Comply with legal obligations</li>
              </ul>
              <p>
                We will never use your information for marketing, advertising, or any purpose 
                other than providing and improving the DDEX validation service.
              </p>
            </section>

            <section id="data-storage" class="legal-section">
              <h2>Data Storage</h2>
              <p>
                We use Firebase (Google Cloud Platform) for our infrastructure:
              </p>
              <ul>
                <li><strong>Authentication</strong> - Managed by Firebase Auth with industry-standard security</li>
                <li><strong>Database</strong> - User profiles and API keys stored in Firestore</li>
                <li><strong>Temporary Processing</strong> - XML validation happens in serverless functions with no persistent storage</li>
              </ul>
              <p>
                All data is encrypted in transit using HTTPS and at rest using Google's encryption standards.
                Requests to our API (api.ddex-workbench.org) pass through Cloudflare before reaching
                our Firebase functions. We do not maintain any other servers or databases.
              </p>
            </section>

            <section id="third-parties" class="legal-section">
              <h2>Third-Party Services</h2>
              <p>We use minimal third-party services:</p>
              <ul>
                <li>
                  <strong>Firebase/Google Cloud</strong> - Hosting, serverless functions, database, and
                  authentication (email/password sign-in)<br>
                  <a href="https://firebase.google.com/support/privacy" target="_blank" rel="noopener">Firebase Privacy Policy</a>
                </li>
                <li>
                  <strong>Google Sign-In</strong> - Optional sign-in with your Google account, handled by
                  Firebase Authentication<br>
                  <a href="https://policies.google.com/privacy" target="_blank" rel="noopener">Google Privacy Policy</a>
                </li>
                <li>
                  <strong>Cloudflare</strong> - Proxies requests to api.ddex-workbench.org<br>
                  <a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noopener">Cloudflare Privacy Policy</a>
                </li>
                <li>
                  <strong>Deezer</strong> - When you use metadata import in the ERN Sandbox, the UPC/EAN or
                  track identifiers you enter are sent through our server to Deezer's public API to look up
                  release metadata. No account information is sent.<br>
                  <a href="https://www.deezer.com/legal/personal-datas" target="_blank" rel="noopener">Deezer Privacy Policy</a>
                </li>
                <li>
                  <strong>Google Analytics</strong> - Measures page usage and site traffic (see
                  <a href="#analytics" @click="scrollToSection('analytics')">Analytics</a> below)<br>
                  <a href="https://policies.google.com/privacy" target="_blank" rel="noopener">Google Privacy Policy</a>
                </li>
              </ul>
              <p>
                Other than Google Analytics, we do not use any analytics services, and we do not use
                advertising networks or tracking pixels.
              </p>
            </section>

            <section id="analytics" class="legal-section">
              <h2>Analytics</h2>
              <p>
                We use Google Analytics to understand page usage and site traffic, such as which pages
                are visited and how visitors find the site.
              </p>
              <ul>
                <li><strong>Cookies</strong> - Google Analytics sets first-party cookies (<code>_ga</code>) to distinguish visitors</li>
                <li><strong>What we don't send</strong> - We do not send your XML content, files, or account details to Google Analytics</li>
                <li>
                  <strong>Opting out</strong> - You can opt out with Google's
                  <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener">Google Analytics Opt-out Browser Add-on</a>
                </li>
              </ul>
            </section>

            <section id="your-rights" class="legal-section">
              <h2>Your Rights</h2>
              <p>You have complete control over your data:</p>
              
              <h3>For All Users</h3>
              <ul>
                <li>Use the service anonymously without creating an account</li>
                <li>Validate files without any data retention</li>
                <li>Access our source code to verify our practices</li>
              </ul>

              <h3>For Registered Users</h3>
              <ul>
                <li><strong>Access</strong> - Request a copy of your account data</li>
                <li><strong>Correction</strong> - Update your display name on the account settings page</li>
                <li><strong>Deletion</strong> - Request deletion of your account and all associated data</li>
                <li><strong>Portability</strong> - Request your data in JSON format</li>
              </ul>

              <p>
                To make a request, email us at
                <a href="mailto:daddykev@gmail.com">daddykev@gmail.com</a>.
              </p>
            </section>

            <section id="contact" class="legal-section">
              <h2>Contact Us</h2>
              <p>
                For privacy-related questions or concerns:
              </p>
              <div class="contact-info">
                <p><strong>Email:</strong> <a href="mailto:daddykev@gmail.com">daddykev@gmail.com</a></p>
                <p><strong>GitHub Issues:</strong> <a href="https://github.com/daddykev/ddex-workbench/issues" target="_blank" rel="noopener">Open an issue</a></p>
                <p><strong>Response Time:</strong> We aim to respond within 48 hours</p>
              </div>

              <div class="legal-footer">
                <p>
                  This privacy policy is part of our commitment to transparency as an open-source project. 
                  We believe in protecting user privacy through minimal data collection and open practices.
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
const scrollToSection = (sectionId) => {
  const element = document.getElementById(sectionId)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}
</script>

<style scoped>
/* Previous styles remain the same */
.legal-page {
  min-height: 100vh;
}

.hero-section {
  padding: var(--space-2xl) 0;
  background: linear-gradient(135deg, var(--color-secondary) 0%, var(--color-secondary-hover) 100%);
  color: white;
}

.hero-title {
  font-size: var(--text-3xl);
  margin-bottom: var(--space-sm);
  color: white;
}

.hero-subtitle {
  font-size: var(--text-lg);
  opacity: 0.9;
}

.legal-content {
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: var(--space-2xl);
  max-width: 1000px;
  margin: 0 auto;
}

.legal-nav {
  position: sticky;
  top: calc(64px + var(--space-lg));
  height: fit-content;
}

.nav-title {
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  margin-bottom: var(--space-md);
  color: var(--color-heading);
}

.nav-list {
  list-style: none;
}

.nav-list li {
  margin-bottom: var(--space-xs);
}

.nav-list a {
  display: block;
  padding: var(--space-xs) var(--space-sm);
  color: var(--color-text-secondary);
  text-decoration: none;
  border-radius: var(--radius-sm);
  font-size: var(--text-sm);
  transition: all var(--transition-base);
}

.nav-list a:hover {
  color: var(--color-text);
  background-color: var(--color-bg-secondary);
}

.legal-section {
  margin-bottom: var(--space-2xl);
  scroll-margin-top: 80px;
}

.legal-section h2 {
  font-size: var(--text-xl);
  margin-bottom: var(--space-md);
  color: var(--color-heading);
}

.legal-section h3 {
  font-size: var(--text-lg);
  margin-top: var(--space-lg);
  margin-bottom: var(--space-sm);
  color: var(--color-heading);
}

.legal-section p {
  margin-bottom: var(--space-md);
  line-height: var(--leading-relaxed);
  color: var(--color-text);
}

.legal-section ul {
  margin-left: var(--space-lg);
  margin-bottom: var(--space-md);
}

.legal-section li {
  margin-bottom: var(--space-sm);
  line-height: var(--leading-relaxed);
}

.info-box,
.warning-box {
  padding: var(--space-md);
  border-radius: var(--radius-md);
  margin: var(--space-lg) 0;
}

.info-box {
  background-color: var(--color-primary-light);
  border: 1px solid var(--color-primary);
}

.warning-box {
  background-color: var(--color-secondary-light);
  border: 1px solid var(--color-secondary);
}

.contact-info {
  background-color: var(--color-bg-secondary);
  padding: var(--space-lg);
  border-radius: var(--radius-md);
  margin-top: var(--space-md);
}

.contact-info p {
  margin-bottom: var(--space-sm);
}

.legal-footer {
  margin-top: var(--space-2xl);
  padding-top: var(--space-lg);
  border-top: 1px solid var(--color-border);
  color: var(--color-text-secondary);
}

@media (max-width: 768px) {
  .legal-content {
    grid-template-columns: 1fr;
  }
  
  .legal-nav {
    position: static;
    margin-bottom: var(--space-xl);
    padding: var(--space-lg);
    background-color: var(--color-bg-secondary);
    border-radius: var(--radius-lg);
  }
  
  .hero-title {
    font-size: var(--text-2xl);
  }
}
</style>