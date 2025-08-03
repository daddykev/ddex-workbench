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
              When a Grammy-winning engineer meets digital distribution challenges
            </p>
          </div>
          
          <div class="developer-profile">
            <div class="profile-header">
              <h2 class="profile-name">Kevin Marques Moo</h2>
              <p class="profile-aka">aka Daddy Kev</p>
            </div>
            
            <div class="profile-badges">
              <span class="badge badge-grammy">
                <font-awesome-icon :icon="['fas', 'trophy']" />
                Grammy Award Winner
              </span>
              <span class="badge badge-cto">
                <font-awesome-icon :icon="['fas', 'wrench']" />
                CTO, Alpha Pup Records
              </span>
              <span class="badge badge-engineer">
                <font-awesome-icon :icon="['fas', 'microphone']" />
                800+ Engineering Credits
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
            <h2 class="section-title">From Studio to Code</h2>
            
            <div class="story-block">
              <p class="lead-text">
                In 2021, I won a Grammy Award for Best Progressive R&B Album for engineering 
                Thundercat's "It Is What It Is."  But while that golden gramophone sits on my shelf, 
                my real passion has always been at the intersection of music and technology.
              </p>
              
              <p>
                For over 20 years, I've been building systems that power the modern music industry. 
                As CTO of Alpha Pup Records, I transformed an indie label into a globally recognized, 
                Spotify-preferred distributor by engineering a proprietary digital supply chain that 
                manages integrations with over 50 DDEX delivery points.
              </p>
              
              <p>
                I've seen firsthand how the complexity of DDEX standards creates barriers for independent 
                artists and labels. The same artists I've worked with in the studio—Thundercat, Kamasi 
                Washington, Flying Lotus—often struggle with the technical requirements of digital distribution.
              </p>
              
              <p class="highlight-text">
                That's why I'm building DDEX Workbench: to democratize access to the digital music 
                supply chain with modern, accessible tools that anyone can use.
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
                  <strong>Languages:</strong> JavaScript, Vue, Python, SQL
                </li>
                <li>
                  <strong>Cloud:</strong> Google Cloud, AWS, Firebase
                </li>
                <li>
                  <strong>Systems:</strong> Digital Supply Chain, Distribution Ops
                </li>
              </ul>
            </div>
            
            <div class="card mt-lg">
              <h3 class="card-title">Industry Experience</h3>
              <ul class="experience-list">
                <li>20+ years in music technology</li>
                <li>Managed 50+ DDEX integrations</li>
                <li>100B+ rows of streaming data processed</li>
                <li>Built comprehensive royalty systems</li>
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
              Working with artists and labels, I witnessed the pain of DDEX implementation daily. 
              The March 2025 ERN 4.3 deadline approaches, yet no modern open-source tools exist.
            </p>
          </div>
          
          <div class="vision-card">
            <div class="vision-icon">
              <font-awesome-icon :icon="['fas', 'code']" size="2x" />
            </div>
            <h3>The Solution</h3>
            <p>
              DDEX Workbench brings my experience building enterprise distribution systems to the 
              open-source community, starting with the industry's first modern ERN 4.3 validator.
            </p>
          </div>
          
          <div class="vision-card">
            <div class="vision-icon">
              <font-awesome-icon :icon="['fas', 'users']" size="2x" />
            </div>
            <h3>The Impact</h3>
            <p>
              By lowering technical barriers, we empower independent artists to participate fully 
              in the digital music economy—just like the artists I've championed throughout my career.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Career Highlights -->
    <section class="highlights-section section">
      <div class="container">
        <h2 class="section-title text-center mb-xl">Career Highlights</h2>
        
        <div class="timeline">
          <div class="timeline-item">
            <div class="timeline-date">2021</div>
            <div class="timeline-content">
              <h3>Grammy Award</h3>
              <p>Won Best Progressive R&B Album for engineering Thundercat's "It Is What It Is" </p>
            </div>
          </div>
          
          <div class="timeline-item">
            <div class="timeline-date">2004-Present</div>
            <div class="timeline-content">
              <h3>CTO, Alpha Pup Records</h3>
              <p>Transformed indie label into Spotify-preferred distributor with proprietary DDEX systems</p>
            </div>
          </div>
          
          <div class="timeline-item">
            <div class="timeline-date">2006-2018</div>
            <div class="timeline-content">
              <h3>Founder, Low End Theory</h3>
              <p>Created legendary LA club night that influenced a generation of producers worldwide</p>
            </div>
          </div>
          
          <div class="timeline-item">
            <div class="timeline-date">1997-Present</div>
            <div class="timeline-content">
              <h3>Producer/Engineer</h3>
              <p>800+ official credits working with Thundercat, Kamasi Washington, Flying Lotus</p>
            </div>
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
            href="https://github.com/daddykev" 
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