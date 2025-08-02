<template>
  <div class="legal-page">
    <!-- Hero Section -->
    <section class="hero-section bg-secondary">
      <div class="container">
        <div class="hero-content text-center">
          <h1 class="hero-title">Privacy Policy</h1>
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
              <li><a href="#overview" @click="scrollToSection('overview')">Overview</a></li>
              <li><a href="#information-we-collect" @click="scrollToSection('information-we-collect')">Information We Collect</a></li>
              <li><a href="#how-we-use" @click="scrollToSection('how-we-use')">How We Use Your Information</a></li>
              <li><a href="#data-storage" @click="scrollToSection('data-storage')">Data Storage & Security</a></li>
              <li><a href="#third-parties" @click="scrollToSection('third-parties')">Third-Party Services</a></li>
              <li><a href="#your-rights" @click="scrollToSection('your-rights')">Your Rights</a></li>
              <li><a href="#cookies" @click="scrollToSection('cookies')">Cookies</a></li>
              <li><a href="#changes" @click="scrollToSection('changes')">Changes to This Policy</a></li>
              <li><a href="#contact" @click="scrollToSection('contact')">Contact Us</a></li>
            </ul>
          </div>

          <div class="legal-main">
            <section id="overview" class="legal-section">
              <h2>Overview</h2>
              <p>
                DDEX Connect ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, 
                use, disclose, and safeguard your information when you use our DDEX validation services and website.
              </p>
              <p>
                By using our services, you agree to the collection and use of information in accordance with this policy. 
                If you do not agree with the terms of this privacy policy, please do not access the site or use our services.
              </p>
            </section>

            <section id="information-we-collect" class="legal-section">
              <h2>Information We Collect</h2>
              <h3>Information You Provide</h3>
              <ul>
                <li><strong>Account Information:</strong> When you create an account, we collect your email address, username, and password (encrypted).</li>
                <li><strong>Profile Information:</strong> You may optionally provide additional information such as your name, company, and profile picture.</li>
                <li><strong>API Keys:</strong> We generate and store API keys for authenticated access to our services.</li>
                <li><strong>User Content:</strong> Code snippets, comments, and other content you submit to our platform.</li>
              </ul>

              <h3>Information Collected Automatically</h3>
              <ul>
                <li><strong>Usage Data:</strong> We collect information about how you interact with our services, including pages visited, features used, and actions taken.</li>
                <li><strong>Device Information:</strong> Browser type, operating system, IP address, and device identifiers.</li>
                <li><strong>Log Data:</strong> Server logs that include IP addresses, browser type, referring/exit pages, and timestamps.</li>
              </ul>

              <div class="info-box">
                <strong>Important:</strong> We do not store the content of XML files you validate through our service unless you explicitly save them as snippets.
              </div>
            </section>

            <section id="how-we-use" class="legal-section">
              <h2>How We Use Your Information</h2>
              <p>We use the collected information for various purposes:</p>
              <ul>
                <li>To provide and maintain our services</li>
                <li>To authenticate users and manage accounts</li>
                <li>To process API requests and track usage for rate limiting</li>
                <li>To improve our services and develop new features</li>
                <li>To communicate with you about updates, security alerts, and support</li>
                <li>To detect, prevent, and address technical issues</li>
                <li>To comply with legal obligations</li>
              </ul>
            </section>

            <section id="data-storage" class="legal-section">
              <h2>Data Storage & Security</h2>
              <p>
                We implement appropriate technical and organizational security measures to protect your personal information against 
                unauthorized access, alteration, disclosure, or destruction.
              </p>
              <h3>Security Measures Include:</h3>
              <ul>
                <li>Encryption of sensitive data in transit and at rest</li>
                <li>Regular security audits and updates</li>
                <li>Access controls and authentication mechanisms</li>
                <li>Secure data centers with physical security controls</li>
              </ul>
              <p>
                Your data is stored on Firebase infrastructure (Google Cloud Platform) in secure data centers. 
                For more information about Firebase's security practices, visit 
                <a href="https://firebase.google.com/support/privacy" target="_blank" rel="noopener">Firebase Privacy & Security</a>.
              </p>
            </section>

            <section id="third-parties" class="legal-section">
              <h2>Third-Party Services</h2>
              <p>We use the following third-party services that may collect information:</p>
              <ul>
                <li><strong>Firebase (Google):</strong> For authentication, database, hosting, and analytics</li>
                <li><strong>GitHub:</strong> For OAuth authentication (if you choose to sign in with GitHub)</li>
                <li><strong>Cloudflare:</strong> For CDN and DDoS protection</li>
              </ul>
              <p>
                These services have their own privacy policies, and we encourage you to review them. 
                We are not responsible for the privacy practices of these third parties.
              </p>
            </section>

            <section id="your-rights" class="legal-section">
              <h2>Your Rights</h2>
              <p>You have the following rights regarding your personal data:</p>
              <ul>
                <li><strong>Access:</strong> Request a copy of your personal data</li>
                <li><strong>Correction:</strong> Request correction of inaccurate data</li>
                <li><strong>Deletion:</strong> Request deletion of your account and associated data</li>
                <li><strong>Portability:</strong> Request your data in a machine-readable format</li>
                <li><strong>Objection:</strong> Object to certain uses of your data</li>
              </ul>
              <p>
                To exercise these rights, please contact us at privacy@ddex-connect.org. 
                We will respond to your request within 30 days.
              </p>
            </section>

            <section id="cookies" class="legal-section">
              <h2>Cookies</h2>
              <p>
                We use cookies and similar tracking technologies to enhance your experience on our website. 
                These include:
              </p>
              <ul>
                <li><strong>Essential Cookies:</strong> Required for authentication and core functionality</li>
                <li><strong>Preference Cookies:</strong> Remember your settings like theme preference</li>
                <li><strong>Analytics Cookies:</strong> Help us understand how users interact with our services</li>
              </ul>
              <p>
                You can control cookies through your browser settings. Note that disabling certain cookies 
                may limit the functionality of our services.
              </p>
            </section>

            <section id="changes" class="legal-section">
              <h2>Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any changes by 
                posting the new Privacy Policy on this page and updating the "Last updated" date.
              </p>
              <p>
                For significant changes, we will provide a more prominent notice, such as an email 
                notification or an in-app notification.
              </p>
            </section>

            <section id="contact" class="legal-section">
              <h2>Contact Us</h2>
              <p>If you have questions about this Privacy Policy or our privacy practices, please contact us:</p>
              <div class="contact-info">
                <p><strong>Email:</strong> privacy@ddex-connect.org</p>
                <p><strong>GitHub:</strong> <a href="https://github.com/ddex-connect/ddex-workbench/issues" target="_blank" rel="noopener">Open an issue</a></p>
                <p><strong>Address:</strong> [Your Address Here]</p>
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

.info-box {
  padding: var(--space-md);
  background-color: var(--color-primary-light);
  border: 1px solid var(--color-primary);
  border-radius: var(--radius-md);
  margin: var(--space-lg) 0;
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