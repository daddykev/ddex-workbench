<template>
  <div class="legal-page">
    <!-- Hero Section -->
    <section class="hero-section bg-primary">
      <div class="container">
        <div class="hero-content text-center">
          <h1 class="hero-title">Terms of Service</h1>
          <p class="hero-subtitle">
            Last updated: January 15, 2025
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
              <li><a href="#description" @click="scrollToSection('description')">Description of Service</a></li>
              <li><a href="#user-accounts" @click="scrollToSection('user-accounts')">User Accounts</a></li>
              <li><a href="#acceptable-use" @click="scrollToSection('acceptable-use')">Acceptable Use</a></li>
              <li><a href="#api-usage" @click="scrollToSection('api-usage')">API Usage</a></li>
              <li><a href="#intellectual-property" @click="scrollToSection('intellectual-property')">Intellectual Property</a></li>
              <li><a href="#disclaimers" @click="scrollToSection('disclaimers')">Disclaimers</a></li>
              <li><a href="#limitation" @click="scrollToSection('limitation')">Limitation of Liability</a></li>
              <li><a href="#termination" @click="scrollToSection('termination')">Termination</a></li>
              <li><a href="#changes" @click="scrollToSection('changes')">Changes to Terms</a></li>
              <li><a href="#contact" @click="scrollToSection('contact')">Contact Information</a></li>
            </ul>
          </div>

          <div class="legal-main">
            <section id="acceptance" class="legal-section">
              <h2>1. Acceptance of Terms</h2>
              <p>
                By accessing or using DDEX Connect ("Service"), you agree to be bound by these Terms of Service ("Terms"). 
                If you disagree with any part of these terms, then you may not access the Service.
              </p>
              <p>
                These Terms apply to all visitors, users, and others who access or use the Service, including but not limited to 
                users of our web application, API services, and any related documentation or tools.
              </p>
            </section>

            <section id="description" class="legal-section">
              <h2>2. Description of Service</h2>
              <p>
                DDEX Connect provides tools and services for validating DDEX (Digital Data Exchange) standard files, including:
              </p>
              <ul>
                <li>Web-based ERN (Electronic Release Notification) validation</li>
                <li>RESTful API for programmatic validation</li>
                <li>Community-driven snippet library</li>
                <li>Documentation and educational resources</li>
              </ul>
              <p>
                The Service is provided on an "as-is" basis. We reserve the right to modify, suspend, or discontinue 
                any part of the Service at any time without notice.
              </p>
            </section>

            <section id="user-accounts" class="legal-section">
              <h2>3. User Accounts</h2>
              <h3>Account Creation</h3>
              <p>
                To access certain features of the Service, you may be required to create an account. 
                You must provide accurate, complete, and current information during registration.
              </p>
              
              <h3>Account Security</h3>
              <p>You are responsible for:</p>
              <ul>
                <li>Maintaining the confidentiality of your account credentials</li>
                <li>All activities that occur under your account</li>
                <li>Notifying us immediately of any unauthorized use</li>
              </ul>

              <h3>Age Requirements</h3>
              <p>
                You must be at least 13 years old to use the Service. By using the Service, you represent and warrant 
                that you meet this age requirement.
              </p>
            </section>

            <section id="acceptable-use" class="legal-section">
              <h2>4. Acceptable Use</h2>
              <p>You agree not to use the Service to:</p>
              <ul>
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe upon the intellectual property rights of others</li>
                <li>Upload or transmit viruses or malicious code</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Interfere with or disrupt the Service or servers</li>
                <li>Collect or harvest user data without permission</li>
                <li>Use the Service for any unlawful or unauthorized purpose</li>
              </ul>

              <div class="warning-box">
                <strong>Violation Notice:</strong> We reserve the right to terminate or suspend access to our Service 
                immediately, without prior notice, for any breach of these Terms.
              </div>
            </section>

            <section id="api-usage" class="legal-section">
              <h2>5. API Usage</h2>
              <h3>API Terms</h3>
              <p>If you use our API services, you additionally agree to:</p>
              <ul>
                <li>Use API keys only for your own applications</li>
                <li>Not share, sell, or transfer API keys</li>
                <li>Respect rate limits and usage quotas</li>
                <li>Not use the API to create competing services</li>
                <li>Properly attribute DDEX Connect in your applications</li>
              </ul>

              <h3>Rate Limits</h3>
              <table class="terms-table">
                <thead>
                  <tr>
                    <th>Plan</th>
                    <th>Rate Limit</th>
                    <th>Monthly Quota</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Anonymous</td>
                    <td>10 requests/minute</td>
                    <td>1,000 requests</td>
                  </tr>
                  <tr>
                    <td>Free Account</td>
                    <td>60 requests/minute</td>
                    <td>10,000 requests</td>
                  </tr>
                  <tr>
                    <td>Pro Account</td>
                    <td>300 requests/minute</td>
                    <td>100,000 requests</td>
                  </tr>
                </tbody>
              </table>
            </section>

            <section id="intellectual-property" class="legal-section">
              <h2>6. Intellectual Property</h2>
              <h3>Our Content</h3>
              <p>
                The Service and its original content (excluding user-generated content) are and will remain 
                the property of DDEX Connect and its licensors. The Service is protected by copyright, trademark, 
                and other laws.
              </p>

              <h3>User Content</h3>
              <p>
                By posting content to the Service (such as code snippets), you grant us a non-exclusive, 
                worldwide, royalty-free license to use, modify, publicly display, and distribute such content 
                in connection with the Service.
              </p>
              <p>
                You represent and warrant that you have the right to grant this license and that your content 
                does not infringe any third party's rights.
              </p>

              <h3>DDEX Standards</h3>
              <p>
                DDEX standards and schemas are the property of DDEX Limited. Our Service uses these standards 
                under license. Users must comply with DDEX's terms when using these standards.
              </p>
            </section>

            <section id="disclaimers" class="legal-section">
              <h2>7. Disclaimers</h2>
              <p>
                THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT 
                NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
              </p>
              <p>We do not warrant that:</p>
              <ul>
                <li>The Service will be uninterrupted or error-free</li>
                <li>Validation results are 100% accurate or complete</li>
                <li>The Service will meet your specific requirements</li>
                <li>Any errors in the Service will be corrected</li>
              </ul>

              <div class="info-box">
                <strong>Note:</strong> While we strive for accuracy, DDEX Connect validation should not be the sole 
                method of verifying DDEX compliance. Always refer to official DDEX documentation and perform 
                additional testing as needed.
              </div>
            </section>

            <section id="limitation" class="legal-section">
              <h2>8. Limitation of Liability</h2>
              <p>
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, DDEX CONNECT SHALL NOT BE LIABLE FOR ANY INDIRECT, 
                INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, 
                WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER 
                INTANGIBLE LOSSES.
              </p>
              <p>
                Our total liability for any claims under these Terms shall not exceed the amount you paid us, 
                if any, for accessing the Service in the 12 months preceding the claim.
              </p>
            </section>

            <section id="termination" class="legal-section">
              <h2>9. Termination</h2>
              <p>
                We may terminate or suspend your account immediately, without prior notice or liability, 
                for any reason whatsoever, including without limitation if you breach the Terms.
              </p>
              <p>Upon termination, your right to use the Service will cease immediately. 
                All provisions of the Terms which by their nature should survive termination shall survive.
              </p>
            </section>

            <section id="changes" class="legal-section">
              <h2>10. Changes to Terms</h2>
              <p>
                We reserve the right to modify or replace these Terms at any time. If a revision is material, 
                we will try to provide at least 30 days notice prior to any new terms taking effect.
              </p>
              <p>
                By continuing to access or use our Service after revisions become effective, you agree to be 
                bound by the revised terms.
              </p>
            </section>

            <section id="contact" class="legal-section">
              <h2>11. Contact Information</h2>
              <p>If you have any questions about these Terms, please contact us:</p>
              <div class="contact-info">
                <p><strong>Email:</strong> legal@ddex-connect.org</p>
                <p><strong>GitHub:</strong> <a href="https://github.com/ddex-connect/ddex-workbench/issues" target="_blank" rel="noopener">Open an issue</a></p>
                <p><strong>Address:</strong> [Your Address Here]</p>
              </div>

              <div class="legal-footer">
                <p>
                  These Terms of Service were created for DDEX Connect and are governed by the laws of [Your Jurisdiction].
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