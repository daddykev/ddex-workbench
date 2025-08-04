<!-- views/DeveloperView.vue -->
<template>
  <div class="developer-page">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="container">
        <div class="hero-content">
          <div class="hero-intro">
            <h1 class="hero-title">
              Meet the Developer
            </h1>
            <p class="hero-subtitle">
              When a Grammy-winning engineer tackles digital distribution challenges
            </p>
          </div>
          
          <div class="developer-profile">
            <div class="profile-header">
              <h2 class="profile-name">Kevin Marques Moo</h2>
              <p class="profile-aka">aka Daddy Kev</p>
            </div>
            
            <div class="profile-badges">
              <span class="badge badge-cto">
                <font-awesome-icon :icon="['fas', 'wrench']" />
                CTO, Alpha Pup Records
              </span>
              <span class="badge badge-grammy">
                <font-awesome-icon :icon="['fas', 'trophy']" />
                GRAMMY® Award Winner
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- The Story Section -->
    <section class="story-section section">
      <div class="container">
        <div class="story-grid">
          <div class="story-content">
            <h2 class="section-title">Fully stacked dev</h2>
            
            <div class="story-block">
              <p class="lead-text">
                For over 25 years, I've been building operational systems for the music industry.
                My first label Celestial was founded in 1998, and I've been building
                custom release databases ever since. First on FileMaker, then on PHP/MySQL, and since 2017 on Google Cloud.
              </p>

              <p>
                As CTO of Alpha Pup Records, I transformed an indie label into a globally recognized, 
                Spotify-preferred distributor by engineering a proprietary, cloud-based digital supply chain that 
                required custom integrations with over 40 DDEX delivery points. Our distribution business was
                eventually migrated to Virgin Music Group in 2023, where I continue to innovate with Alpha Pup's
                musical output and operational tech stack.
              </p>
              
              <p>
                Today the world of digital distribution stands at an inflection point. The impending March 2026
                deadline for DDEX ERN 4.3 compliance looms large, and the pressure is on for all stakeholders to adapt.
                DDEX standards like MEAD and RDR are critical for the future of music distribution, yet
                the tools available to navigate these complexities are largely outdated and inaccessible.
              </p>
              
              <p class="highlight-text">
                That's why I'm building DDEX Workbench: to democratize access to the digital music 
                supply chain with modern, accessible tools that anyone can use.
              </p>

              <p>
                As a self-taught coder since the age of 8, I've built a wide range of projects, from simple websites to complex data pipelines.
                Fittingly, one of my first coding projects was a database on the VIC-20 for my action figure collection.
                Today, I bring that same passion for data architecture to the DDEX open source ecosystem, starting with a modern ERN 4.3 validator,
                with much more to come.
              </p>

            </div>
          </div>
          
          <div class="credentials-sidebar">
            <div class="card">
              <h3 class="card-title">Technical Expertise</h3>
              <ul class="skill-list">
                <li>
                  <strong>Standards:</strong> DDEX ERN/DSR, XML
                </li>
                <li>
                  <strong>Languages:</strong> JavaScript, Vue, Python, SQL, Bash
                </li>
                <li>
                  <strong>Cloud:</strong> Google Cloud, AWS
                </li>
                <li>
                  <strong>Systems:</strong> Digital Supply Chain, Distribution Ops, Streaming Analytics
                </li>
              </ul>
            </div>
            
            <div class="card mt-lg">
              <h3 class="card-title">Industry Experience</h3>
              <ul class="experience-list">
                <li>25+ years in music technology</li>
                <li>Managed 40+ DDEX integrations</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Vision Section -->
    <section class="vision-section bg-secondary section">
      <div class="container">
        <h2 class="section-title text-center mb-xl">The Vision Behind DDEX Workbench</h2>
        
        <div class="vision-grid">
          <div class="vision-card">
            <div class="vision-icon">
              <font-awesome-icon :icon="['fas', 'lightbulb']" size="2x" />
            </div>
            <h3>The Problem</h3>
            <p>
              The March 2026 deprecation of ERN 3.x approaches, yet no modern open-source tools exist for ERN 4.3.
            </p>
          </div>
          
          <div class="vision-card">
            <div class="vision-icon">
              <font-awesome-icon :icon="['fas', 'code']" size="2x" />
            </div>
            <h3>The Solution</h3>
            <p>
              DDEX Workbench brings my experience building enterprise distribution systems to the 
              open-source community, starting with the industry's first modern ERN 4.3 validator and API.
            </p>
          </div>
          
          <div class="vision-card">
            <div class="vision-icon">
              <font-awesome-icon :icon="['fas', 'users']" size="2x" />
            </div>
            <h3>The Impact</h3>
            <p>
              By lowering technical barriers, we empower independent creators and teams to participate fully 
              in the digital music economy.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Connect Section -->
    <section class="connect-section section">
      <div class="container text-center">
        <h2 class="section-title mb-md">Let's Build Together</h2>
        <p class="connect-text mb-xl">
          I believe the future of music distribution should be open, accessible, and artist-centric. 
          Join me in building tools that empower creators.
        </p>
        
        <div class="connect-links flex justify-center gap-lg">
          <a 
            href="https://www.linkedin.com/in/daddykev/" 
            target="_blank" 
            rel="noopener"
            class="social-link"
          >
            <font-awesome-icon :icon="['fab', 'linkedin']" size="lg" />
            LinkedIn
          </a>
          <a 
            href="https://github.com/daddykev/ddex-workbench" 
            target="_blank" 
            rel="noopener"
            class="social-link"
          >
            <font-awesome-icon :icon="['fab', 'github']" size="lg" />
            GitHub
          </a>
          <a 
            href="mailto:daddykev@gmail.com" 
            class="social-link"
          >
            <font-awesome-icon :icon="['fas', 'envelope']" size="lg" />
            Email
          </a>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
// No complex logic needed for this static page
</script>

<style scoped>
/* Hero Section */
.hero-section {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-hover) 100%);
  color: white;
  padding: var(--space-3xl) 0;
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
}

.hero-title {
  font-size: var(--text-4xl);
  margin-bottom: var(--space-sm);
  color: white;
}

.hero-subtitle {
  font-size: var(--text-xl);
  opacity: 0.9;
  margin-bottom: var(--space-2xl);
}

.developer-profile {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: var(--radius-lg);
  padding: var(--space-xl);
  margin-top: var(--space-xl);
}

.profile-name {
  font-size: var(--text-3xl);
  margin-bottom: var(--space-xs);
  color: white;
}

.profile-aka {
  font-size: var(--text-lg);
  opacity: 0.9;
  margin-bottom: var(--space-lg);
}

.profile-badges {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
  justify-content: center;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-xs) var(--space-md);
  background: rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
}

/* Story Section */
.story-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: var(--space-2xl);
  align-items: start;
}

.story-content {
  max-width: 800px;
}

.section-title {
  font-size: var(--text-3xl);
  margin-bottom: var(--space-xl);
  color: var(--color-heading);
}

.lead-text {
  font-size: var(--text-lg);
  line-height: var(--leading-relaxed);
  color: var(--color-text);
  margin-bottom: var(--space-lg);
}

.story-block p {
  margin-bottom: var(--space-lg);
  line-height: var(--leading-relaxed);
}

.highlight-text {
  font-size: var(--text-lg);
  font-weight: var(--font-medium);
  color: var(--color-primary);
  border-left: 4px solid var(--color-primary);
  padding-left: var(--space-lg);
  margin: var(--space-xl) 0;
}

/* Credentials Sidebar */
.credentials-sidebar .card {
  padding: var(--space-lg);
}

.card-title {
  font-size: var(--text-lg);
  margin-bottom: var(--space-md);
  color: var(--color-heading);
}

.skill-list,
.experience-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.skill-list li,
.experience-list li {
  padding-left: var(--space-lg);
  position: relative;
}

.skill-list li::before,
.experience-list li::before {
  content: "→";
  position: absolute;
  left: 0;
  color: var(--color-primary);
}

/* Vision Section */
.vision-section {
  background-color: var(--color-bg-secondary);
}

.vision-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--space-xl);
}

.vision-card {
  text-align: center;
  padding: var(--space-xl);
}

.vision-icon {
  margin-bottom: var(--space-lg);
  color: var(--color-primary);
}

.vision-card h3 {
  font-size: var(--text-xl);
  margin-bottom: var(--space-md);
  color: var(--color-heading);
}

/* Timeline */
.timeline {
  position: relative;
  padding-left: var(--space-2xl);
}

.timeline::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 2px;
  background: var(--color-border);
}

.timeline-item {
  position: relative;
  margin-bottom: var(--space-2xl);
}

.timeline-item::before {
  content: "";
  position: absolute;
  left: calc(-1 * var(--space-2xl) - 5px);
  top: 0;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--color-primary);
  border: 2px solid var(--color-bg);
}

.timeline-date {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-xs);
}

.timeline-content h3 {
  font-size: var(--text-lg);
  margin-bottom: var(--space-xs);
  color: var(--color-heading);
}

/* Connect Section */
.connect-text {
  font-size: var(--text-lg);
  color: var(--color-text-secondary);
  max-width: 600px;
  margin: 0 auto;
}

.social-link {
  display: inline-flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-lg);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text);
  text-decoration: none;
  transition: all var(--transition-base);
}

.social-link:hover {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
}

/* Responsive */
@media (max-width: 768px) {
  .hero-title {
    font-size: var(--text-3xl);
  }
  
  .profile-name {
    font-size: var(--text-2xl);
  }
  
  .story-grid {
    grid-template-columns: 1fr;
  }
  
  .credentials-sidebar {
    order: -1;
  }
  
  .vision-grid {
    grid-template-columns: 1fr;
  }
  
  .timeline {
    padding-left: var(--space-lg);
  }
  
  .timeline-item::before {
    left: calc(-1 * var(--space-lg) - 5px);
  }
}

/* Utilities */
.bg-secondary {
  background-color: var(--color-bg-secondary);
}

.mt-lg {
  margin-top: var(--space-lg);
}

.mb-md {
  margin-bottom: var(--space-md);
}

.mb-xl {
  margin-bottom: var(--space-xl);
}
</style>