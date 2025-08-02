<template>
  <header class="app-header">
    <div class="container">
      <nav class="nav flex items-center justify-between">
        <!-- Logo/Brand -->
        <router-link to="/" class="nav-brand flex items-center gap-sm">
          <div class="brand-icon-wrapper">
            <font-awesome-icon 
              :icon="['fas', 'wrench']" 
              size="lg"
              class="brand-icon"
            />
          </div>
          <span class="brand-text font-semibold text-xl">DDEX Workbench</span>
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
              <font-awesome-icon 
                v-if="currentTheme === 'light'"
                :icon="['fas', 'sun']" 
              />
              <font-awesome-icon 
                v-else-if="currentTheme === 'dark'"
                :icon="['fas', 'moon']" 
              />
              <font-awesome-icon 
                v-else
                :icon="['fas', 'desktop']" 
              />
              <font-awesome-icon 
                :icon="['fas', 'chevron-down']" 
                size="xs"
              />
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
                  <font-awesome-icon 
                    :icon="['fas', theme.icon]" 
                  />
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
            <font-awesome-icon 
              :icon="['fas', showMobileMenu ? 'times' : 'bars']" 
            />
          </button>

          <!-- Sign In (placeholder for Phase 1) -->
          <button class="btn btn-primary btn-sm hidden-sm">
            <font-awesome-icon 
              :icon="['fas', 'sign-in-alt']" 
              class="mr-xs"
            />
            Sign In
          </button>
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
            <button class="btn btn-primary btn-sm w-full">
              <font-awesome-icon 
                :icon="['fas', 'sign-in-alt']" 
                class="mr-xs"
              />
              Sign In
            </button>
          </div>
        </div>
      </div>
    </transition>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

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
    icon: 'sun'
  },
  { 
    value: 'dark', 
    label: 'Dark',
    icon: 'moon'
  },
  { 
    value: 'auto', 
    label: 'System',
    icon: 'desktop'
  }
]

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

/* Brand Icon Wrapper */
.brand-icon-wrapper {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-primary);
  border-radius: var(--radius-md);
  flex-shrink: 0;
}

.brand-icon {
  color: white;
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

/* Utilities */
.w-full {
  width: 100%;
}

.mr-xs {
  margin-right: var(--space-xs);
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