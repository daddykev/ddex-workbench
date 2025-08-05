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
          <router-link to="/validator" class="nav-link">Validator</router-link>
          <router-link to="/snippets" class="nav-link">Snippets</router-link>
          <router-link to="/api" class="nav-link">API Docs</router-link>
        </div>

        <!-- Right side actions -->
        <div class="nav-actions flex items-center gap-md">
          <!-- Desktop-only actions (theme + auth) -->
          <div class="desktop-actions flex items-center gap-md">
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
                    @click="selectTheme(theme.value)"
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

            <!-- Auth Actions -->
            <div v-if="!authLoading" class="auth-actions">
              <!-- Authenticated User Menu -->
              <div v-if="isAuthenticated" class="user-menu">
                <button 
                  @click="toggleUserMenu"
                  class="user-menu-button flex items-center gap-xs"
                >
                  <span class="user-name">{{ displayName }}</span>
                  <div class="user-avatar">
                    {{ userInitials }}
                  </div>
                  <font-awesome-icon 
                    :icon="['fas', 'chevron-down']" 
                    size="xs"
                  />
                </button>
                
                <!-- User Dropdown -->
                <transition name="dropdown">
                  <div v-if="showUserMenu" class="user-dropdown card">
                    <div class="dropdown-header">
                      <div class="user-info">
                        <p class="user-info-name">{{ user.displayName || user.email }}</p>
                        <p class="user-info-email">{{ user.email }}</p>
                      </div>
                    </div>
                    <div class="dropdown-divider"></div>
                    <router-link 
                      to="/settings" 
                      class="dropdown-item"
                      @click="showUserMenu = false"
                    >
                      <font-awesome-icon :icon="['fas', 'wrench']" />
                      <span>Settings</span>
                    </router-link>
                    <router-link 
                      to="/api-keys" 
                      class="dropdown-item"
                      @click="showUserMenu = false"
                    >
                      <font-awesome-icon :icon="['fas', 'code']" />
                      <span>API Keys</span>
                    </router-link>
                    <router-link 
                      v-if="user && user.role === 'admin'"
                      to="/admin/users" 
                      class="dropdown-item"
                      @click="showUserMenu = false"
                    >
                      <font-awesome-icon :icon="['fas', 'users']" />
                      <span>Admin Users</span>
                    </router-link>
                    <div class="dropdown-divider"></div>
                    <button 
                      @click="handleLogout"
                      class="dropdown-item text-error"
                    >
                      <font-awesome-icon :icon="['fas', 'sign-out-alt']" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </transition>
              </div>
              
              <!-- Sign In Button (Guest) -->
              <router-link v-else to="/login" class="btn btn-primary btn-sm">
                <font-awesome-icon 
                  :icon="['fas', 'sign-in-alt']" 
                  class="mr-xs"
                />
                Sign In
              </router-link>
            </div>
          </div>

          <!-- Mobile Menu Toggle -->
          <button 
            @click="showMobileMenu = !showMobileMenu"
            class="mobile-menu-toggle btn btn-secondary btn-sm"
            :aria-label="showMobileMenu ? 'Close menu' : 'Open menu'"
          >
            <font-awesome-icon 
              :icon="['fas', showMobileMenu ? 'times' : 'bars']" 
            />
          </button>
        </div>
      </nav>
    </div>

    <!-- Mobile Menu -->
    <transition name="slide-down">
      <div v-if="showMobileMenu" class="mobile-menu">
        <div class="container">
          <div class="mobile-nav-links">
            <router-link to="/validator" class="mobile-nav-link" @click="showMobileMenu = false">
              Validator
            </router-link>
            <router-link to="/snippets" class="mobile-nav-link" @click="showMobileMenu = false">
              Snippets
            </router-link>
            <router-link to="/api" class="mobile-nav-link" @click="showMobileMenu = false">
              API Docs
            </router-link>
            
            <div class="mobile-nav-divider"></div>
            
            <!-- Mobile Theme Section -->
            <div class="mobile-theme-section">
              <p class="mobile-section-label">Theme</p>
              <div class="mobile-theme-options">
                <button 
                  v-for="theme in themes" 
                  :key="theme.value"
                  @click="selectTheme(theme.value)"
                  class="mobile-theme-option"
                  :class="{ active: themePreference === theme.value }"
                >
                  <font-awesome-icon 
                    :icon="['fas', theme.icon]" 
                  />
                  <span>{{ theme.label }}</span>
                </button>
              </div>
            </div>
            
            <div class="mobile-nav-divider"></div>
            
            <!-- Mobile Auth Section -->
            <div v-if="!authLoading" class="mobile-auth-section">
              <!-- Authenticated Mobile Menu -->
              <div v-if="isAuthenticated">
                <div class="mobile-user-info">
                  <div class="user-avatar">{{ userInitials }}</div>
                  <div>
                    <p class="user-info-name">{{ user.displayName || user.email }}</p>
                    <p class="user-info-email">{{ user.email }}</p>
                  </div>
                </div>
                <router-link 
                  to="/settings" 
                  class="mobile-nav-link"
                  @click="showMobileMenu = false"
                >
                  <font-awesome-icon :icon="['fas', 'wrench']" class="mr-sm" />
                  Settings
                </router-link>
                <router-link 
                  to="/api-keys" 
                  class="mobile-nav-link"
                  @click="showMobileMenu = false"
                >
                  <font-awesome-icon :icon="['fas', 'code']" class="mr-sm" />
                  API Keys
                </router-link>
                <router-link 
                  v-if="isAuthenticated && user && user.role === 'admin'"
                  to="/admin/users" 
                  class="mobile-nav-link"
                  @click="showMobileMenu = false"
                >
                  <font-awesome-icon :icon="['fas', 'users']" class="mr-sm" />
                  Admin Users
                </router-link>            
                <button 
                  @click="handleLogout"
                  class="mobile-nav-link text-error w-full text-left"
                >
                  <font-awesome-icon :icon="['fas', 'sign-out-alt']" class="mr-sm" />
                  Sign Out
                </button>
              </div>
              
              <!-- Guest Mobile Menu -->
              <router-link 
                v-else 
                to="/login" 
                class="btn btn-primary btn-sm w-full"
                @click="showMobileMenu = false"
              >
                <font-awesome-icon 
                  :icon="['fas', 'sign-in-alt']" 
                  class="mr-xs"
                />
                Sign In
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </header>
</template>

<script setup>
// [Script section remains the same as before]
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

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

// Router
const router = useRouter()

// Auth composable
const { user, isAuthenticated, loading: authLoading, logout } = useAuth()

// State
const showThemeMenu = ref(false)
const showMobileMenu = ref(false)
const showUserMenu = ref(false)

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

// Computed
const displayName = computed(() => {
  if (!user.value) return ''
  return user.value.displayName || user.value.email.split('@')[0]
})

const userInitials = computed(() => {
  if (!user.value) return ''
  const name = user.value.displayName || user.value.email
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
})

// Methods
const toggleThemeMenu = (e) => {
  e.stopPropagation()
  showThemeMenu.value = !showThemeMenu.value
  showUserMenu.value = false
}

const toggleUserMenu = (e) => {
  e.stopPropagation()
  showUserMenu.value = !showUserMenu.value
  showThemeMenu.value = false
}

const selectTheme = (theme) => {
  emit('theme-change', theme)
  showThemeMenu.value = false
  showMobileMenu.value = false
}

const handleLogout = async () => {
  showUserMenu.value = false
  showMobileMenu.value = false
  
  try {
    await logout()
    // Only redirect if we're on a protected route
    if (router.currentRoute.value.meta.requiresAuth) {
      router.push('/')
    }
  } catch (error) {
    console.error('Logout error:', error)
  }
}

const handleClickOutside = (e) => {
  if (!e.target.closest('.theme-switcher')) {
    showThemeMenu.value = false
  }
  if (!e.target.closest('.user-menu')) {
    showUserMenu.value = false
  }
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

/* Desktop Actions Container - FIXED */
.desktop-actions {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

/* Auth Actions */
.auth-actions {
  display: flex;
  align-items: center;
}

/* User Menu */
.user-menu {
  position: relative;
}

.user-menu-button {
  padding: var(--space-xs) var(--space-sm);
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: all var(--transition-base);
}

.user-menu-button:hover {
  background-color: var(--color-bg-secondary);
}

.user-name {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-avatar {
  width: 28px;
  height: 28px;
  background-color: var(--color-primary);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  flex-shrink: 0;
}

.user-dropdown {
  position: absolute;
  top: calc(100% + var(--space-xs));
  right: 0;
  min-width: 240px;
  padding: 0;
  box-shadow: var(--shadow-lg);
  z-index: var(--z-dropdown);
}

.dropdown-header {
  padding: var(--space-md);
  background-color: var(--color-bg-secondary);
  border-bottom: 1px solid var(--color-border);
}

.user-info-name {
  font-weight: var(--font-medium);
  margin-bottom: var(--space-xs);
}

.user-info-email {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  width: 100%;
  padding: var(--space-sm) var(--space-md);
  background: none;
  border: none;
  color: var(--color-text);
  font-size: var(--text-sm);
  text-decoration: none;
  cursor: pointer;
  transition: all var(--transition-base);
  text-align: left;
}

.dropdown-item:hover {
  background-color: var(--color-bg-secondary);
}

.dropdown-item.text-error {
  color: var(--color-error);
}

.dropdown-divider {
  height: 1px;
  background-color: var(--color-border);
  margin: 0;
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
  background: none;
  border: none;
  cursor: pointer;
  font-size: var(--text-base);
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

/* Mobile Theme Section */
.mobile-theme-section {
  padding: var(--space-sm) 0;
}

.mobile-section-label {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-sm);
}

.mobile-theme-options {
  display: flex;
  gap: var(--space-sm);
}

.mobile-theme-option {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-xs);
  padding: var(--space-sm);
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text);
  font-size: var(--text-sm);
  cursor: pointer;
  transition: all var(--transition-base);
}

.mobile-theme-option:hover {
  background-color: var(--color-bg-tertiary);
}

.mobile-theme-option.active {
  color: var(--color-primary);
  background-color: var(--color-primary-light);
  border-color: var(--color-primary);
}

/* Mobile Auth Section */
.mobile-auth-section {
  padding-top: var(--space-sm);
}

.mobile-user-info {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-md) 0;
  border-bottom: 1px solid var(--color-border);
  margin-bottom: var(--space-md);
}

/* Utilities */
.w-full {
  width: 100%;
}

.text-left {
  text-align: left;
}

.mr-xs {
  margin-right: var(--space-xs);
}

.mr-sm {
  margin-right: var(--space-sm);
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

/* Mobile Responsive - THIS IS THE KEY FIX */
@media (max-width: 768px) {
  /* Hide desktop actions on mobile */
  .desktop-actions {
    display: none !important;
  }
  
  /* Show mobile menu toggle on mobile */
  .mobile-menu-toggle {
    display: flex;
  }
  
  .user-name {
    display: none;
  }
}
</style>