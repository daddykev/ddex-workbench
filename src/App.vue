<template>
  <div id="app" :data-theme="currentTheme">
    <!-- Navigation Bar -->
    <NavBar 
      :current-theme="currentTheme"
      :theme-preference="themePreference"
      @theme-change="setTheme"
    />

    <!-- Email Verification Banner -->
    <EmailVerificationBanner />

    <!-- Main Content -->
    <main class="app-main">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <!-- Footer -->
    <footer class="app-footer">
      <div class="container">
        <div class="footer-content">
          <div class="footer-brand">
            <h3 class="footer-title">DDEX Workbench</h3>
            <p class="footer-tagline text-secondary">
              Open source DDEX validation tools for the music industry
            </p>
          </div>
          
          <div class="footer-grid">
            <!-- Resources -->
            <div class="footer-section">
              <h4 class="footer-heading">Resources</h4>
              <ul class="footer-links">
                <li><router-link to="/api">API Documentation</router-link></li>
                <li><router-link to="/snippets">Code Snippets</router-link></li>
                <li><a href="https://kb.ddex.net" target="_blank" rel="noopener">DDEX Knowledge Base</a></li>
              </ul>
            </div>
            
            <!-- Community -->
            <div class="footer-section">
              <h4 class="footer-heading">Community</h4>
              <ul class="footer-links">
                <li><a href="https://github.com/daddykev/ddex-workbench" target="_blank" rel="noopener">GitHub</a></li>
                <li><router-link to="/developer">Developer CV</router-link></li>
                <li><router-link to="/contribute">Contribute</router-link></li>
              </ul>
            </div>
            
            <!-- Legal -->
            <div class="footer-section">
              <h4 class="footer-heading">Legal</h4>
              <ul class="footer-links">
                <li><router-link to="/privacy">Privacy Policy</router-link></li>
                <li><router-link to="/terms">Terms of Service</router-link></li>
                <li><router-link to="/license">MIT License</router-link></li>
              </ul>
            </div>
          </div>
          
          <div class="footer-bottom">
            <p class="text-sm text-tertiary text-center">
              © 2025 DDEX Workbench. Open source under MIT License.
            </p>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import NavBar from '@/components/NavBar.vue'
import EmailVerificationBanner from '@/components/EmailVerificationBanner.vue'
import themeManager from '@/utils/themeManager'

// Theme management
const currentTheme = ref('light')
const themePreference = ref('auto')

// Initialize theme on mount
onMounted(() => {
  // ThemeManager initializes itself, we just need to get the current state
  currentTheme.value = themeManager.getCurrentTheme()
  themePreference.value = themeManager.getThemePreference()
  
  // Listen for theme changes
  window.addEventListener('theme-changed', handleThemeChange)
})

// Theme methods
const handleThemeChange = (event) => {
  currentTheme.value = themeManager.getCurrentTheme()
  themePreference.value = themeManager.getThemePreference()
}

const setTheme = (theme) => {
  themeManager.setTheme(theme)
}
</script>

<style scoped>
/* Main Content */
.app-main {
  min-height: calc(100vh - 64px - 280px); /* header - footer */
  background-color: var(--color-bg);
}

/* Footer */
.app-footer {
  background-color: var(--color-bg-secondary);
  border-top: 1px solid var(--color-border);
  padding: var(--space-2xl) 0 var(--space-xl);
  margin-top: var(--space-3xl);
}

.footer-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-2xl);
}

.footer-brand {
  text-align: center;
  margin-bottom: var(--space-lg);
}

.footer-title {
  font-size: var(--text-2xl);
  margin-bottom: var(--space-xs);
  color: var(--color-heading);
}

.footer-tagline {
  font-size: var(--text-base);
}

.footer-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-2xl);
  margin-bottom: var(--space-2xl);
}

.footer-heading {
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  color: var(--color-heading);
  margin-bottom: var(--space-md);
}

.footer-links {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.footer-links a {
  color: var(--color-text-secondary);
  text-decoration: none;
  font-size: var(--text-sm);
  transition: color var(--transition-base);
}

.footer-links a:hover {
  color: var(--color-primary);
}

.footer-bottom {
  padding-top: var(--space-2xl);
  border-top: 1px solid var(--color-border);
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .app-main {
    min-height: calc(100vh - 64px - 400px); /* Adjust for taller mobile footer */
  }
  
  .footer-grid {
    grid-template-columns: 1fr;
    text-align: center;
  }
  
  .footer-brand {
    margin-bottom: var(--space-xl);
  }
}
</style>