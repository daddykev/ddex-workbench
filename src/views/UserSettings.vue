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

        <!-- API Keys Section -->
        <section class="settings-section card">
          <div class="card-header">
            <h2 class="section-title">API Keys</h2>
            <p class="section-subtitle">Manage your API access credentials</p>
          </div>
          <div class="card-body">
            <!-- API Key List -->
            <div v-if="apiKeys.length > 0" class="api-keys-list">
              <div v-for="key in apiKeys" :key="key.id" class="api-key-item">
                <div class="api-key-info">
                  <h4 class="api-key-name">{{ key.name }}</h4>
                  <p class="api-key-meta">
                    Created {{ formatDate(key.created) }} · 
                    {{ key.requestCount }} requests
                  </p>
                </div>
                <button 
                  @click="revokeKey(key.id)"
                  class="btn btn-secondary btn-sm"
                  :disabled="keyLoading"
                >
                  Revoke
                </button>
              </div>
            </div>
            
            <div v-else class="empty-state">
              <p class="text-secondary">No API keys created yet</p>
            </div>

            <!-- Create New Key -->
            <div class="create-key-section">
              <h3 class="text-lg font-semibold mb-md">Create New Key</h3>
              <form @submit.prevent="createNewKey" class="create-key-form">
                <div class="form-group">
                  <label class="form-label">Key Name</label>
                  <input
                    v-model="newKeyName"
                    type="text"
                    class="form-input"
                    placeholder="e.g., Production App"
                    required
                    :disabled="keyLoading"
                  />
                </div>
                
                <button type="submit" class="btn btn-primary" :disabled="keyLoading || !newKeyName">
                  <font-awesome-icon :icon="['fas', 'plus']" class="mr-xs" />
                  Create API Key
                </button>
              </form>
            </div>

            <!-- New Key Display -->
            <div v-if="newKey" class="new-key-display">
              <div class="alert alert-info">
                <p class="font-semibold mb-sm">New API Key Created!</p>
                <p class="text-sm mb-md">Copy this key now. You won't be able to see it again.</p>
                <div class="key-display">
                  <code>{{ newKey }}</code>
                  <button 
                    @click="copyKey"
                    class="btn btn-sm"
                    :class="copied ? 'btn-success' : 'btn-secondary'"
                  >
                    <font-awesome-icon 
                      :icon="['fas', copied ? 'check' : 'copy']" 
                    />
                  </button>
                </div>
              </div>
            </div>
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
import { getApiKeys, createApiKey, revokeApiKey } from '@/services/api'

const { user, updateUserProfile, loading: authLoading } = useAuth()

// Profile state
const profileForm = reactive({
  displayName: ''
})
const profileLoading = ref(false)
const profileSuccess = ref(false)
const profileError = ref(null)

// API Keys state
const apiKeys = ref([])
const newKeyName = ref('')
const newKey = ref(null)
const keyLoading = ref(false)
const copied = ref(false)

// Stats state
const stats = reactive({
  validations: 0,
  snippets: 0,
  apiCalls: 0
})

// Watch for user changes
watch(user, async (newUser) => {
  if (newUser) {
    console.log('User loaded:', newUser);
    profileForm.displayName = newUser.displayName || ''
    await loadApiKeys()
    // TODO: Load user stats
  }
})

// Also handle if user is already loaded on mount
onMounted(async () => {
  console.log('UserSettings mounted, user:', user.value);
  if (user.value && !authLoading.value) {
    profileForm.displayName = user.value.displayName || ''
    await loadApiKeys()
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

// API Key methods
const loadApiKeys = async () => {
  try {
    console.log('Loading API keys...');
    const keys = await getApiKeys();
    console.log('Received keys:', keys);
    // Handle both array and wrapped response
    apiKeys.value = Array.isArray(keys) ? keys : (keys.keys || []);
  } catch (err) {
    console.error('Failed to load API keys:', err);
  }
}

const createNewKey = async () => {
  keyLoading.value = true
  newKey.value = null
  
  try {
    const key = await createApiKey({ name: newKeyName.value })
    newKey.value = key.key
    newKeyName.value = ''
    await loadApiKeys()
  } catch (err) {
    console.error('Failed to create API key:', err)
  } finally {
    keyLoading.value = false
  }
}

const revokeKey = async (keyId) => {
  if (!confirm('Are you sure you want to revoke this API key?')) return
  
  keyLoading.value = true
  try {
    await revokeApiKey(keyId)
    await loadApiKeys()
  } catch (err) {
    console.error('Failed to revoke API key:', err)
  } finally {
    keyLoading.value = false
  }
}

const copyKey = async () => {
  try {
    await navigator.clipboard.writeText(newKey.value)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy:', err)
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

.section-subtitle {
  color: var(--color-text-secondary);
  font-size: var(--text-sm);
  margin-top: var(--space-xs);
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

/* API Keys */
.api-keys-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  margin-bottom: var(--space-xl);
}

.api-key-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-md);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-md);
}

.api-key-name {
  font-weight: var(--font-medium);
  margin-bottom: var(--space-xs);
}

.api-key-meta {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}

.create-key-section {
  border-top: 1px solid var(--color-border);
  padding-top: var(--space-xl);
}

.create-key-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.new-key-display {
  margin-top: var(--space-lg);
}

.key-display {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  background: var(--color-bg-tertiary);
  padding: var(--space-sm);
  border-radius: var(--radius-md);
}

.key-display code {
  flex: 1;
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  word-break: break-all;
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

.alert-info {
  background-color: var(--color-info);
  color: white;
}

/* Empty state */
.empty-state {
  text-align: center;
  padding: var(--space-xl);
}

/* Utilities */
.mr-xs {
  margin-right: var(--space-xs);
}

.mt-lg {
  margin-top: var(--space-lg);
}

/* Responsive */
@media (max-width: 768px) {
  .api-key-item {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-sm);
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>