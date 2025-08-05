<template>
  <div class="settings-page">
    <div class="container">
      <h1 class="page-title">Account Settings</h1>
      
      <!-- Show loading state while auth is loading -->
      <div v-if="authLoading" class="loading-state">
        <font-awesome-icon :icon="['fas', 'spinner']" spin size="2x" />
        <p>Loading your settings...</p>
      </div>
      
      <!-- Show settings only when auth is loaded and user exists -->
      <div v-else-if="user" class="settings-grid">
        <!-- Profile Settings -->
        <section class="settings-section card">
          <div class="card-header">
            <h2 class="section-title">Profile Information</h2>
          </div>
          <div class="card-body">
            <form @submit.prevent="updateProfile" class="settings-form">
              <div class="form-group">
                <label class="form-label">Display Name</label>
                <input
                  v-model="profileForm.displayName"
                  type="text"
                  class="form-input"
                  placeholder="Your display name"
                  :disabled="profileLoading"
                />
              </div>
              
              <div class="form-group">
                <label class="form-label">Email</label>
                <input
                  :value="user?.email"
                  type="email"
                  class="form-input"
                  disabled
                />
                <p class="form-help">Email cannot be changed</p>
              </div>

              <div v-if="profileSuccess" class="alert alert-success">
                Profile updated successfully!
              </div>

              <div v-if="profileError" class="alert alert-error">
                {{ profileError }}
              </div>

              <button type="submit" class="btn btn-primary" :disabled="profileLoading">
                <span v-if="profileLoading" class="flex items-center gap-sm">
                  <font-awesome-icon :icon="['fas', 'spinner']" spin />
                  Saving...
                </span>
                <span v-else>Save Changes</span>
              </button>
            </form>
          </div>
        </section>

        <!-- Usage Stats -->
        <section class="settings-section card">
          <div class="card-header">
            <h2 class="section-title">Usage Statistics</h2>
          </div>
          <div class="card-body">
            <div class="stats-grid">
              <div class="stat-item">
                <div class="stat-value">{{ stats.validations || 0 }}</div>
                <div class="stat-label">Total Validations</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ stats.snippets || 0 }}</div>
                <div class="stat-label">Snippets Created</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ stats.apiCalls || 0 }}</div>
                <div class="stat-label">API Calls</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ formatDate(user?.created) }}</div>
                <div class="stat-label">Member Since</div>
              </div>
            </div>
          </div>
        </section>

        <!-- Account Actions -->
        <section class="settings-section card">
          <div class="card-header">
            <h2 class="section-title">Account Actions</h2>
          </div>
          <div class="card-body">
            <div class="account-actions">
              <div class="action-item">
                <div class="action-info">
                  <h4 class="action-title">API Keys</h4>
                  <p class="action-description">Manage your API keys for programmatic access</p>
                </div>
                <router-link to="/api-keys" class="btn btn-secondary">
                  Manage Keys
                </router-link>
              </div>
              
              <div class="action-item">
                <div class="action-info">
                  <h4 class="action-title">Export Data</h4>
                  <p class="action-description">Download your data in JSON format</p>
                </div>
                <button class="btn btn-secondary" disabled>
                  Coming Soon
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
      
      <!-- Handle case where user is not authenticated -->
      <div v-else class="empty-state">
        <p>Please log in to view your settings.</p>
        <router-link to="/login" class="btn btn-primary mt-lg">
          Sign In
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { useAuth } from '@/composables/useAuth'

const { user, updateUserProfile, loading: authLoading } = useAuth()

// Profile state
const profileForm = reactive({
  displayName: ''
})
const profileLoading = ref(false)
const profileSuccess = ref(false)
const profileError = ref(null)

// Stats state
const stats = reactive({
  validations: 0,
  snippets: 0,
  apiCalls: 0
})

// Watch for user changes
watch(user, (newUser) => {
  if (newUser) {
    console.log('User loaded:', newUser);
    profileForm.displayName = newUser.displayName || ''
    // TODO: Load user stats
  }
})

// Also handle if user is already loaded on mount
onMounted(() => {
  console.log('UserSettings mounted, user:', user.value);
  if (user.value && !authLoading.value) {
    profileForm.displayName = user.value.displayName || ''
    // TODO: Load user stats
  }
})

// Profile methods
const updateProfile = async () => {
  profileLoading.value = true
  profileError.value = null
  profileSuccess.value = false
  
  try {
    await updateUserProfile({
      displayName: profileForm.displayName
    })
    profileSuccess.value = true
    setTimeout(() => {
      profileSuccess.value = false
    }, 3000)
  } catch (err) {
    profileError.value = err.message
  } finally {
    profileLoading.value = false
  }
}

// Utility methods
const formatDate = (date) => {
  if (!date) return 'N/A'
  // Handle Firestore timestamps and regular dates
  const d = date.toDate ? date.toDate() : (date._seconds ? new Date(date._seconds * 1000) : new Date(date))
  return d.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  })
}
</script>

<style scoped>
.settings-page {
  padding: var(--space-2xl) 0;
}

.page-title {
  font-size: var(--text-3xl);
  margin-bottom: var(--space-2xl);
}

.settings-grid {
  display: grid;
  gap: var(--space-xl);
}

.section-title {
  font-size: var(--text-xl);
  margin: 0;
}

.settings-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

/* Loading state */
.loading-state {
  text-align: center;
  padding: var(--space-3xl);
  color: var(--color-text-secondary);
}

.loading-state p {
  margin-top: var(--space-md);
}

/* Stats */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: var(--space-lg);
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  color: var(--color-primary);
  margin-bottom: var(--space-xs);
}

.stat-label {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}

/* Account Actions */
.account-actions {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.action-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-md);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-md);
}

.action-title {
  font-weight: var(--font-medium);
  margin-bottom: var(--space-xs);
}

.action-description {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}

/* Alerts */
.alert {
  padding: var(--space-md);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
}

.alert-success {
  background-color: var(--color-success);
  color: white;
}

.alert-error {
  background-color: var(--color-error);
  color: white;
}

/* Empty state */
.empty-state {
  text-align: center;
  padding: var(--space-xl);
}

/* Utilities */
.mt-lg {
  margin-top: var(--space-lg);
}

/* Responsive */
@media (max-width: 768px) {
  .action-item {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-sm);
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>