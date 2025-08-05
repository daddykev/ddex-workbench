<template>
  <div class="api-page">
    <div class="container">
      <h1 class="page-title">API Keys</h1>
      <p class="page-subtitle">Manage your API access credentials for DDEX Workbench</p>
      
      <!-- Show loading state while auth is loading -->
      <div v-if="authLoading" class="loading-state">
        <font-awesome-icon :icon="['fas', 'spinner']" spin size="2x" />
        <p>Loading your API keys...</p>
      </div>
      
      <!-- Show API keys when auth is loaded and user exists -->
      <div v-else-if="user" class="api-content">
        <!-- API Keys Section -->
        <section class="api-section card">
          <div class="card-header">
            <h2 class="section-title">Your API Keys</h2>
            <p class="section-subtitle">
              Use API keys to authenticate requests to the DDEX Workbench API. 
              Keep your keys secure and never share them publicly.
            </p>
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
                    <span v-if="key.lastUsed">· Last used {{ formatDate(key.lastUsed) }}</span>
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
              <font-awesome-icon :icon="['fas', 'key']" size="2x" class="text-tertiary mb-md" />
              <p class="text-secondary">No API keys created yet</p>
              <p class="text-sm text-tertiary">Create your first API key to start using the DDEX Workbench API</p>
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
                  <p class="form-help">Give your key a descriptive name to remember its purpose</p>
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

        <!-- API Usage Guide -->
        <section class="usage-section card">
          <div class="card-header">
            <h2 class="section-title">Using Your API Key</h2>
          </div>
          <div class="card-body">
            <p class="mb-lg">Include your API key in the request header:</p>
            <div class="code-example">
              <pre><code>X-API-Key: ddex_your-api-key-here</code></pre>
            </div>
            <p class="mt-lg mb-md">Example with cURL:</p>
            <div class="code-example">
              <pre><code>curl -X POST https://api.ddex-workbench.org/v1/validate \
  -H "Content-Type: application/json" \
  -H "X-API-Key: ddex_your-api-key-here" \
  -d '{"content": "...", "type": "ERN", "version": "4.3"}'</code></pre>
            </div>
            <div class="info-box mt-lg">
              <p class="text-sm">
                <strong>Rate Limits:</strong> API keys allow 60 requests per minute. 
                Anonymous requests are limited to 10 requests per minute.
              </p>
            </div>
            <p class="mt-lg">
              <router-link to="/api" class="btn btn-secondary">
                <font-awesome-icon :icon="['fas', 'book']" class="mr-xs" />
                View Full API Documentation
              </router-link>
            </p>
          </div>
        </section>
      </div>
      
      <!-- Handle case where user is not authenticated -->
      <div v-else class="empty-state">
        <p>Please log in to manage your API keys.</p>
        <router-link to="/login" class="btn btn-primary mt-lg">
          Sign In
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { getApiKeys, createApiKey, revokeApiKey } from '@/services/api'

const { user, loading: authLoading } = useAuth()

// API Keys state
const apiKeys = ref([])
const newKeyName = ref('')
const newKey = ref(null)
const keyLoading = ref(false)
const copied = ref(false)

// Watch for user changes
watch(user, async (newUser) => {
  if (newUser) {
    await loadApiKeys()
  }
})

// Also handle if user is already loaded on mount
onMounted(async () => {
  if (user.value && !authLoading.value) {
    await loadApiKeys()
  }
})

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
  if (!confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) return
  
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
.api-page {
  padding: var(--space-2xl) 0;
}

.page-title {
  font-size: var(--text-3xl);
  margin-bottom: var(--space-sm);
}

.page-subtitle {
  font-size: var(--text-lg);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-2xl);
}

.api-content {
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

/* Code examples */
.code-example {
  background: var(--color-bg-tertiary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-md);
  overflow-x: auto;
}

.code-example pre {
  margin: 0;
}

.code-example code {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  color: var(--color-text);
}

/* Info box */
.info-box {
  background: var(--color-primary-light);
  border-radius: var(--radius-md);
  padding: var(--space-md);
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

.mb-md {
  margin-bottom: var(--space-md);
}

.mb-lg {
  margin-bottom: var(--space-lg);
}

/* Responsive */
@media (max-width: 768px) {
  .api-key-item {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-sm);
  }
  
  .code-example {
    font-size: var(--text-xs);
  }
}
</style>