<template>
  <div id="app" :data-theme="currentTheme">
    <!-- Header -->
    <header class="app-header">
      <div class="container">
        <nav class="nav flex items-center justify-between">
          <!-- Logo/Brand -->
          <router-link to="/" class="nav-brand flex items-center gap-sm">
            <svg class="brand-icon" width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="var(--color-primary)"/>
              <path d="M8 12h16M8 16h16M8 20h16" stroke="white" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <span class="brand-text font-semibold text-xl">DDEX Connect</span>
          </router-link>

          <!-- Main Navigation -->
          <div class="nav-main flex items-center gap-lg">
            <router-link to="/" class="nav-link">Validator</router-link>
            <router-link to="/snippets" class="nav-link">Snippets</router-link>
            <router-link to="/api" class="nav-link">API Docs</router-link>
          </div>

          <!-- Right side actions -->
          <div class="nav-actions flex items-center gap-md">
            <!-- Theme Switcher -->
            <div class="theme-switcher">
              <button 
                @click="toggleThemeMenu" 
                class="btn btn-secondary btn-sm flex items-center gap-xs"
                :aria-label="`Current theme: ${themePreference}`"
              >
                <svg v-if="currentTheme === 'light'" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"/>
                </svg>
                <svg v-else-if="currentTheme === 'dark'" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/>
                </svg>
                <svg v-else width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z"/>
                </svg>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                  <path d="M6 8L2 4h8L6 8z"/>
                </svg>
              </button>
              
              <!-- Theme Menu Dropdown -->
              <div v-if="showThemeMenu" class="theme-menu card">
                <button 
                  v-for="theme in themes" 
                  :key="theme.value"
                  @click="setTheme(theme.value)"
                  class="theme-option"
                  :class="{ active: themePreference === theme.value }"
                >
                  <svg v-if="theme.value === 'light'" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"/>
                  </svg>
                  <svg v-else-if="theme.value === 'dark'" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/>
                  </svg>
                  <svg v-else width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z"/>
                  </svg>
                  <span>{{ theme.label }}</span>
                </button>
              </div>
            </div>

            <!-- Sign In (placeholder for Phase 1) -->
            <button class="btn btn-primary btn-sm">Sign In</button>
          </div>
        </nav>
      </div>
    </header>

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
        <div class="footer-content flex flex-col items-center gap-md text-center">
          <p class="text-secondary">
            Open source DDEX tools for the music industry
          </p>
          <div class="footer-links flex gap-lg text-sm">
            <a href="https://github.com/yourusername/ddex-workbench" target="_blank" rel="noopener">
              GitHub
            </a>
            <router-link to="/privacy">Privacy</router-link>
            <router-link to="/terms">Terms</router-link>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import themeManager from '@/utils/themeManager'

// Theme management
const currentTheme = ref('light')
const themePreference = ref('auto')
const showThemeMenu = ref(false)

const themes = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'auto', label: 'System' }
]

// Initialize theme on mount
onMounted(() => {
  // ThemeManager initializes itself, we just need to get the current state
  currentTheme.value = themeManager.getCurrentTheme()
  themePreference.value = themeManager.getThemePreference()
  
  // Listen for theme changes
  window.addEventListener('theme-changed', handleThemeChange)
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  window.removeEventListener('theme-changed', handleThemeChange)
  document.removeEventListener('click', handleClickOutside)
})

// Theme methods
const handleThemeChange = (event) => {
  currentTheme.value = themeManager.getCurrentTheme()
  themePreference.value = themeManager.getThemePreference()
}

const toggleThemeMenu = (e) => {
  e.stopPropagation()
  showThemeMenu.value = !showThemeMenu.value
}

const setTheme = (theme) => {
  themeManager.setTheme(theme)
  showThemeMenu.value = false
}

const handleClickOutside = () => {
  showThemeMenu.value = false
}
</script>

<style scoped>
/* Header Styles */
.app-header {
  background-color: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  z-index: var(--z-dropdown);
}

.nav {
  height: 64px;
}

.nav-brand {
  text-decoration: none;
  color: var(--color-heading);
  transition: opacity var(--transition-base);
}

.nav-brand:hover {
  opacity: 0.8;
}

.brand-icon {
  flex-shrink: 0;
}

.nav-link {
  padding: var(--space-sm) var(--space-md);
  color: var(--color-text-secondary);
  font-weight: var(--font-medium);
  text-decoration: none;
  border-radius: var(--radius-md);
  transition: all var(--transition-base);
}

.nav-link:hover {
  color: var(--color-text);
  background-color: var(--color-bg-secondary);
}

.nav-link.router-link-active {
  color: var(--color-primary);
  background-color: var(--color-primary-light);
}

/* Theme Switcher */
.theme-switcher {
  position: relative;
}

.theme-menu {
  position: absolute;
  top: calc(100% + var(--space-xs));
  right: 0;
  min-width: 160px;
  padding: var(--space-xs);
  box-shadow: var(--shadow-lg);
  z-index: var(--z-dropdown);
}

.theme-option {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  width: 100%;
  padding: var(--space-sm) var(--space-md);
  background: none;
  border: none;
  border-radius: var(--radius-sm);
  color: var(--color-text);
  font-size: var(--text-sm);
  cursor: pointer;
  transition: all var(--transition-base);
  text-align: left;
}

.theme-option:hover {
  background-color: var(--color-bg-secondary);
}

.theme-option.active {
  color: var(--color-primary);
  background-color: var(--color-primary-light);
}

/* Main Content */
.app-main {
  min-height: calc(100vh - 64px - 120px); /* header - footer */
  background-color: var(--color-bg);
}

/* Footer */
.app-footer {
  background-color: var(--color-bg-secondary);
  border-top: 1px solid var(--color-border);
  padding: var(--space-xl) 0;
  margin-top: var(--space-3xl);
}

.footer-links a {
  color: var(--color-text-secondary);
  text-decoration: none;
  transition: color var(--transition-base);
}

.footer-links a:hover {
  color: var(--color-primary);
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
  .nav-main {
    display: none;
  }
  
  .brand-text {
    font-size: var(--text-lg);
  }
}
</style>