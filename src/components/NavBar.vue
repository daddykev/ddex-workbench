<template>
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

        <!-- Desktop Navigation -->
        <div class="nav-main hidden-sm flex items-center gap-lg">
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
              <component :is="themeIcon" />
              <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                <path d="M6 8L2 4h8L6 8z"/>
              </svg>
            </button>
            
            <!-- Theme Menu Dropdown -->
            <transition name="dropdown">
              <div v-if="showThemeMenu" class="theme-menu card">
                <button 
                  v-for="theme in themes" 
                  :key="theme.value"
                  @click="$emit('theme-change', theme.value)"
                  class="theme-option"
                  :class="{ active: themePreference === theme.value }"
                >
                  <component :is="theme.icon" />
                  <span>{{ theme.label }}</span>
                </button>
              </div>
            </transition>
          </div>

          <!-- Mobile Menu Toggle -->
          <button 
            @click="showMobileMenu = !showMobileMenu"
            class="mobile-menu-toggle btn btn-secondary btn-sm hidden block-sm"
            :aria-label="showMobileMenu ? 'Close menu' : 'Open menu'"
          >
            <svg v-if="!showMobileMenu" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"/>
            </svg>
            <svg v-else width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"/>
            </svg>
          </button>

          <!-- Sign In (placeholder for Phase 1) -->
          <button class="btn btn-primary btn-sm hidden-sm">Sign In</button>
        </div>
      </nav>
    </div>

    <!-- Mobile Menu -->
    <transition name="slide-down">
      <div v-if="showMobileMenu" class="mobile-menu">
        <div class="container">
          <div class="mobile-nav-links">
            <router-link to="/" class="mobile-nav-link" @click="showMobileMenu = false">
              Validator
            </router-link>
            <router-link to="/snippets" class="mobile-nav-link" @click="showMobileMenu = false">
              Snippets
            </router-link>
            <router-link to="/api" class="mobile-nav-link" @click="showMobileMenu = false">
              API Docs
            </router-link>
            <div class="mobile-nav-divider"></div>
            <button class="btn btn-primary btn-sm w-full">Sign In</button>
          </div>
        </div>
      </div>
    </transition>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, h } from 'vue'

// Props
const props = defineProps({
  currentTheme: {
    type: String,
    required: true
  },
  themePreference: {
    type: String,
    required: true
  }
})

// Emits
const emit = defineEmits(['theme-change'])

// State
const showThemeMenu = ref(false)
const showMobileMenu = ref(false)

// Theme configuration
const themes = [
  { 
    value: 'light', 
    label: 'Light',
    icon: h('svg', { width: 20, height: 20, viewBox: '0 0 20 20', fill: 'currentColor' },
      h('path', { d: 'M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z' })
    )
  },
  { 
    value: 'dark', 
    label: 'Dark',
    icon: h('svg', { width: 20, height: 20, viewBox: '0 0 20 20', fill: 'currentColor' },
      h('path', { d: 'M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z' })
    )
  },
  { 
    value: 'auto', 
    label: 'System',
    icon: h('svg', { width: 20, height: 20, viewBox: '0 0 20 20', fill: 'currentColor' },
      h('path', { d: 'M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z' })
    )
  }
]

// Computed
const themeIcon = computed(() => {
  const theme = themes.find(t => t.value === (props.themePreference === 'auto' ? props.currentTheme : props.themePreference))
  return theme?.icon || themes[2].icon // Default to auto icon
})

// Methods
const toggleThemeMenu = (e) => {
  e.stopPropagation()
  showThemeMenu.value = !showThemeMenu.value
}

const handleClickOutside = () => {
  showThemeMenu.value = false
}

// Lifecycle
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
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

/* Mobile Menu */
.mobile-menu-toggle {
  display: none;
}

.mobile-menu {
  background-color: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  box-shadow: var(--shadow-md);
}

.mobile-nav-links {
  padding: var(--space-md) 0;
}

.mobile-nav-link {
  display: block;
  padding: var(--space-sm) 0;
  color: var(--color-text);
  font-weight: var(--font-medium);
  text-decoration: none;
  transition: color var(--transition-base);
}

.mobile-nav-link:hover {
  color: var(--color-primary);
}

.mobile-nav-link.router-link-active {
  color: var(--color-primary);
}

.mobile-nav-divider {
  height: 1px;
  background-color: var(--color-border);
  margin: var(--space-md) 0;
}

.w-full {
  width: 100%;
}

/* Transitions */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
  transform: translateY(-100%);
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .mobile-menu-toggle {
    display: flex;
  }
}
</style>