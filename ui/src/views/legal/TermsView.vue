<template>
  <div class="legal-page">
    <!-- Hero Section -->
    <section class="hero-section bg-primary">
      <div class="container">
        <div class="hero-content text-center">
          <h1 class="hero-title">Terms of Service</h1>
          <p class="hero-subtitle">
            Last updated: August 1, 2025
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
              <li><a href="#acceptance" @click="scrollToSection('acceptance')">Acceptance of Terms</a></li>
              <li><a href="#open-source" @click="scrollToSection('open-source')">Open Source License</a></li>
              <li><a href="#description" @click="scrollToSection('description')">Service Description</a></li>
              <li><a href="#acceptable-use" @click="scrollToSection('acceptable-use')">Acceptable Use</a></li>
              <li><a href="#api-usage" @click="scrollToSection('api-usage')">API Usage</a></li>
              <li><a href="#user-content" @click="scrollToSection('user-content')">User Content</a></li>
              <li><a href="#disclaimers" @click="scrollToSection('disclaimers')">Disclaimers</a></li>
              <li><a href="#limitation" @click="scrollToSection('limitation')">Limitation of Liability</a></li>
              <li><a href="#changes" @click="scrollToSection('changes')">Changes to Terms</a></li>
              <li><a href="#contact" @click="scrollToSection('contact')">Contact</a></li>
            </ul>
          </div>

          <div class="legal-main">
            <section id="acceptance" class="legal-section">
              <h2>1. Acceptance of Terms</h2>
              <p>
                By using DDEX Workbench, you agree to these Terms of Service. DDEX Workbench is a free, 
                open-source tool for validating DDEX standard files. If you don't agree with these terms, 
                you may still use our open-source code under the MIT License by hosting your own instance.
              </p>
            </section>

            <section id="open-source" class="legal-section">
              <h2>2. Open Source License</h2>
              <p>
                DDEX Workbench is released under the <strong>MIT License</strong>. This means:
              </p>
              <ul>
                <li>The software is provided free of charge</li>
                <li>You can use, copy, modify, and distribute the software</li>
                <li>You can use it for commercial purposes</li>
                <li>The software is provided "as is" without warranty</li>
              </ul>
              <p>
                The full license text is available in our 
                <a href="https://github.com/daddykev/ddex-workbench/blob/main/LICENSE" target="_blank" rel="noopener">GitHub repository</a>.
              </p>
              <div class="info-box">
                <strong>Note:</strong> These Terms apply to the hosted service at ddex-workbench.org. 
                If you self-host the application, only the MIT License applies.
              </div>
            </section>

            <section id="description" class="legal-section">
              <h2>3. Service Description</h2>
              <p>
                DDEX Workbench provides free tools for validating DDEX (Digital Data Exchange) files:
              </p>
              <ul>
                <li><strong>Web Validator</strong> - Validate ERN files (versions 3.8.2, 4.2, and 4.3)</li>
                <li><strong>REST API</strong> - Programmatic validation for developers</li>
                <li><strong>Community Snippets</strong> - Share and discover DDEX examples (coming soon)</li>
                <li><strong>Documentation</strong> - Learn about DDEX validation</li>
              </ul>
              <p>
                The service is provided free of charge with no premium tiers or paid features. 
                We may introduce optional donations in the future to support hosting costs.
              </p>
            </section>

            <section id="acceptable-use" class="legal-section">
              <h2>4. Acceptable Use</h2>
              <p>
                We believe in open access, but please use the service responsibly:
              </p>
              
              <h3>DO:</h3>
              <ul>
                <li>Use the service for legitimate DDEX validation needs</li>
                <li>Report bugs and contribute improvements</li>
                <li>Share the service with others who might benefit</li>
                <li>Respect rate limits to ensure availability for all users</li>
              </ul>

              <h3>DON'T:</h3>
              <ul>
                <li>Attempt to overwhelm or abuse the service</li>
                <li>Use the service for illegal activities</li>
                <li>Upload malicious files or code</li>
                <li>Violate others' intellectual property rights</li>
                <li>Circumvent rate limits or security measures</li>
              </ul>
            </section>

            <section id="api-usage" class="legal-section">
              <h2>5. API Usage</h2>
              <h3>Rate Limits</h3>
              <p>To ensure fair access for everyone:</p>
              <table class="terms-table">
                <thead>
                  <tr>
                    <th>Access Type</th>
                    <th>Rate Limit</th>
                    <th>Cost</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Anonymous</td>
                    <td>10 requests/minute</td>
                    <td>Free</td>
                  </tr>
                  <tr>
                    <td>Authenticated (API Key)</td>
                    <td>60 requests/minute</td>
                    <td>Free</td>
                  </tr>
                </tbody>
              </table>

              <h3>API Guidelines</h3>
              <ul>
                <li>API keys are free and for personal use</li>
                <li>Don't share or sell API keys</li>
                <li>Include proper attribution when using our API</li>
                <li>Cache responses when appropriate</li>
              </ul>

              <p>
                If you need higher rate limits for a legitimate use case, 
                <a href="mailto:api@ddex-workbench.org">contact us</a> - we're happy to help 
                open-source projects and educational institutions.
              </p>
            </section>

            <section id="user-content" class="legal-section">
              <h2>6. User Content</h2>
              <h3>Your Files</h3>
              <p>
                When you validate files:
              </p>
              <ul>
                <li>Files are processed in memory only</li>
                <li>We don't store your validated XML content</li>
                <li>Validation results are temporary and not logged</li>
                <li>You retain all rights to your content</li>
              </ul>

              <h3>Community Snippets (Future Feature)</h3>
              <p>
                If you choose to share snippets:
              </p>
              <ul>
                <li>You grant us a license to display them publicly</li>
                <li>You confirm you have the right to share the content</li>
                <li>Snippets will be available under a permissive license</li>
                <li>You can delete your snippets at any time</li>
              </ul>
            </section>

            <section id="disclaimers" class="legal-section">
              <h2>7. Disclaimers</h2>
              <div class="warning-box">
                <strong>No Warranty:</strong> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, 
                EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
                FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
              </div>
              <p>
                Specifically:
              </p>
              <ul>
                <li>We don't guarantee 100% uptime (though we try our best)</li>
                <li>Validation results should be verified independently</li>
                <li>We're not affiliated with or endorsed by DDEX</li>
                <li>The service may change or be discontinued</li>
              </ul>
              <p>
                For mission-critical validation needs, we recommend running your own instance 
                using our open-source code.
              </p>
            </section>

            <section id="limitation" class="legal-section">
              <h2>8. Limitation of Liability</h2>
              <p>
                IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, 
                DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, 
                ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER 
                DEALINGS IN THE SOFTWARE.
              </p>
              <p>
                This is a free service provided for the benefit of the music technology community. 
                Please use it accordingly and at your own risk.
              </p>
            </section>

            <section id="changes" class="legal-section">
              <h2>9. Changes to Terms</h2>
              <p>
                We may update these terms occasionally. Changes will be posted here with an updated date. 
                Significant changes will be announced on our GitHub repository.
              </p>
              <p>
                Your continued use of the service after changes constitutes acceptance of the new terms.
              </p>
            </section>

            <section id="contact" class="legal-section">
              <h2>10. Contact</h2>
              <p>Questions about these terms? We're here to help:</p>
              <div class="contact-info">
                <p><strong>Email:</strong> legal@ddex-workbench.org</p>
                <p><strong>GitHub:</strong> <a href="https://github.com/daddykev/ddex-workbench/issues" target="_blank" rel="noopener">Open an issue</a></p>
                <p><strong>Contributing:</strong> <a href="https://github.com/daddykev/ddex-workbench/blob/main/CONTRIBUTING.md" target="_blank" rel="noopener">Contribution Guidelines</a></p>
              </div>

              <div class="legal-footer">
                <p>
                  Thank you for using DDEX Workbench! We're proud to provide this tool to the music 
                  technology community and look forward to your contributions and feedback.
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
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-hover) 100%);
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
  background-color: #fef3c7;
  border: 1px solid #f59e0b;
  color: #92400e;
}

.terms-table {
  width: 100%;
  margin: var(--space-md) 0;
  border-collapse: collapse;
}

.terms-table th {
  background-color: var(--color-bg-secondary);
  padding: var(--space-sm) var(--space-md);
  text-align: left;
  font-weight: var(--font-semibold);
  border-bottom: 2px solid var(--color-border);
}

.terms-table td {
  padding: var(--space-sm) var(--space-md);
  border-bottom: 1px solid var(--color-border);
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
  
  .terms-table {
    font-size: var(--text-sm);
  }
  
  .terms-table th,
  .terms-table td {
    padding: var(--space-xs) var(--space-sm);
  }
}
</style>