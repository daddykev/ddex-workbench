<template>
  <div class="validator-view">
    <!-- Hero Section -->
    <section class="hero-section bg-primary">
      <div class="container">
        <div class="hero-content text-center">
          <h1 class="hero-title">DDEX ERN Validator</h1>
          <p class="hero-subtitle">
            Validate your Electronic Release Notification messages
          </p>
        </div>
      </div>
    </section>

    <!-- Validator Section -->
    <section class="validator-section section">
      <div class="container">
        <div class="validator-container">
          <!-- Input Methods Tabs -->
          <div class="input-tabs flex gap-sm mb-lg">
            <button 
              @click="inputMethod = 'upload'"
              class="tab-button"
              :class="{ active: inputMethod === 'upload' }"
            >
              <font-awesome-icon :icon="['fas', 'cloud-upload-alt']" />
              Upload File
            </button>
            <button 
              @click="inputMethod = 'paste'"
              class="tab-button"
              :class="{ active: inputMethod === 'paste' }"
            >
              <font-awesome-icon :icon="['fas', 'clipboard']" />
              Paste XML
            </button>
          </div>

          <!-- Upload Method -->
          <div v-if="inputMethod === 'upload'" class="upload-area">
            <div 
              class="dropzone"
              :class="{ 'drag-over': isDragging }"
              @drop="handleDrop"
              @dragover.prevent="isDragging = true"
              @dragleave="isDragging = false"
            >
              <input 
                ref="fileInput"
                type="file"
                accept=".xml"
                @change="handleFileSelect"
                class="hidden"
              >
              
              <div class="dropzone-content">
                <font-awesome-icon 
                  :icon="['fas', 'cloud-upload-alt']" 
                  size="3x"
                  class="mb-md"
                />
                
                <p class="text-lg font-medium mb-sm">
                  Drop your XML file here
                </p>
                <p class="text-secondary text-sm mb-md">
                  or click to browse
                </p>
                <button 
                  @click="$refs.fileInput.click()"
                  class="btn btn-primary"
                >
                  Choose File
                </button>
              </div>
            </div>
            
            <!-- File info if selected -->
            <div v-if="selectedFile" class="file-info card mt-md">
              <div class="flex items-center justify-between p-md">
                <div class="flex items-center gap-sm">
                  <font-awesome-icon 
                    :icon="['fas', 'file-code']" 
                    size="lg"
                    class="text-primary"
                  />
                  <div>
                    <p class="font-medium">{{ selectedFile.name }}</p>
                    <p class="text-sm text-secondary">{{ formatFileSize(selectedFile.size) }}</p>
                  </div>
                </div>
                <button 
                  @click="clearFile"
                  class="btn btn-secondary btn-sm"
                >
                  <font-awesome-icon :icon="['fas', 'times']" class="mr-xs" />
                  Remove
                </button>
              </div>
            </div>
          </div>

          <!-- Paste Method -->
          <div v-else class="paste-area">
            <div class="form-group">
              <label class="form-label">Paste your XML content</label>
              <textarea 
                v-model="xmlContent"
                class="form-textarea xml-input"
                rows="15"
                placeholder="<?xml version='1.0' encoding='UTF-8'?>
<ern:NewReleaseMessage...>"
              ></textarea>
              <div class="flex justify-between items-center mt-xs">
                <span class="text-sm text-secondary">
                  {{ xmlContent.length }} characters
                </span>
                <button 
                  v-if="xmlContent"
                  @click="xmlContent = ''"
                  class="text-sm text-primary"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>

          <!-- Validation Options -->
          <div class="validation-options card mt-lg p-lg">
            <h3 class="text-lg font-semibold mb-md">Validation Options</h3>
            <div class="grid grid-cols-2 gap-md">
              <div class="form-group mb-0">
                <label class="form-label">Standard Version</label>
                <select v-model="validationOptions.version" class="form-select">
                  <option value="4.3">ERN 4.3 (Latest)</option>
                  <option value="4.2">ERN 4.2</option>
                  <option value="3.8.2">ERN 3.8.2</option>
                </select>
              </div>
              
              <div class="form-group mb-0">
                <label class="form-label">Profile</label>
                <select v-model="validationOptions.profile" class="form-select">
                  <option 
                    v-for="profile in availableProfiles" 
                    :key="profile"
                    :value="profile"
                  >
                    {{ profile }}
                  </option>
                </select>
              </div>
            </div>
          </div>

          <!-- Validate Button -->
          <div class="flex justify-center mt-xl">
            <button 
              @click="validateXML"
              :disabled="!canValidate || isValidating"
              class="btn btn-primary btn-lg"
            >
              <span v-if="isValidating" class="flex items-center gap-sm">
                <font-awesome-icon 
                  :icon="['fas', 'spinner']" 
                  spin 
                />
                Validating...
              </span>
              <span v-else>
                <font-awesome-icon :icon="['fas', 'check']" class="mr-xs" />
                Validate XML
              </span>
            </button>
          </div>

          <!-- Validation Results -->
          <div v-if="validationResult" class="validation-results mt-2xl">
            <div 
              class="result-header"
              :class="validationResult.valid ? 'result-success' : 'result-error'"
            >
              <div class="flex items-center gap-sm">
                <font-awesome-icon 
                  :icon="['fas', validationResult.valid ? 'check-circle' : 'exclamation-circle']" 
                  size="lg"
                />
                <h2 class="text-2xl font-semibold">
                  {{ validationResult.valid ? 'Valid DDEX File' : 'Validation Failed' }}
                </h2>
              </div>
              <p class="text-sm mt-xs">
                Processed in {{ validationResult.metadata.processingTime }}ms
              </p>
            </div>

            <!-- Error List -->
            <div v-if="!validationResult.valid && validationResult.errors.length" class="errors-list mt-lg">
              <h3 class="text-lg font-semibold mb-md">
                {{ validationResult.errors.length }} {{ validationResult.errors.length === 1 ? 'Error' : 'Errors' }} Found
              </h3>
              
              <div class="errors-container">
                <div 
                  v-for="(error, index) in validationResult.errors" 
                  :key="index"
                  class="error-item card"
                >
                  <div class="error-header flex items-start justify-between">
                    <div class="flex items-center gap-sm">
                      <span 
                        class="error-badge"
                        :class="`badge-${error.severity}`"
                      >
                        {{ error.severity }}
                      </span>
                      <span class="text-sm text-secondary">
                        Line {{ error.line }}, Column {{ error.column }}
                      </span>
                    </div>
                    <button 
                      v-if="error.rule"
                      class="text-sm text-primary"
                      @click="openDDEXReference(error.rule)"
                    >
                      View Spec 
                      <font-awesome-icon 
                        :icon="['fas', 'external-link-alt']" 
                        size="sm"
                      />
                    </button>
                  </div>
                  
                  <p class="error-message mt-sm">
                    {{ error.message }}
                  </p>
                  
                  <div v-if="error.context" class="error-context mt-md">
                    <pre class="code-snippet">{{ error.context }}</pre>
                  </div>
                </div>
              </div>
            </div>

            <!-- Success Details -->
            <div v-if="validationResult.valid" class="success-details mt-lg">
              <div class="card p-lg">
                <h3 class="text-lg font-semibold mb-md">Validation Summary</h3>
                <div class="grid grid-cols-2 gap-md">
                  <div>
                    <p class="text-sm text-secondary">Schema Version</p>
                    <p class="font-medium">{{ validationResult.metadata.schemaVersion }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-secondary">Profile</p>
                    <p class="font-medium">{{ validationOptions.profile }}</p>
                  </div>
                </div>
              </div>
              
              <div class="flex gap-md mt-lg">
                <button class="btn btn-primary">
                  <font-awesome-icon :icon="['fas', 'download']" class="mr-xs" />
                  Download Report
                </button>
                <button class="btn btn-secondary">
                  <font-awesome-icon :icon="['fas', 'code']" class="mr-xs" />
                  View in Snippets
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { validateERN, getSupportedFormats } from '@/services/api'

// State
const inputMethod = ref('upload')
const isDragging = ref(false)
const selectedFile = ref(null)
const xmlContent = ref('')
const isValidating = ref(false)
const validationResult = ref(null)

// Dynamic profiles support
const supportedFormats = ref(null)
const availableProfiles = ref(['AudioAlbum', 'AudioSingle', 'Video', 'Mixed'])

const validationOptions = ref({
  version: '4.3',
  profile: 'AudioAlbum'
})

// Computed
const canValidate = computed(() => {
  return inputMethod.value === 'upload' ? selectedFile.value : xmlContent.value.trim()
})

// Load supported formats on mount
onMounted(async () => {
  try {
    const formats = await getSupportedFormats()
    supportedFormats.value = formats
    updateAvailableProfiles()
  } catch (error) {
    console.error('Failed to load supported formats:', error)
    // Continue with default profiles if API fails
  }
})

// Watch for version changes to update available profiles
watch(() => validationOptions.value.version, () => {
  updateAvailableProfiles()
})

// Methods
const updateAvailableProfiles = () => {
  if (!supportedFormats.value) return
  
  const versionConfig = supportedFormats.value.versions.find(
    v => v.version === validationOptions.value.version
  )
  
  if (versionConfig) {
    availableProfiles.value = versionConfig.profiles
    // Reset profile if current selection is not available
    if (!versionConfig.profiles.includes(validationOptions.value.profile)) {
      validationOptions.value.profile = versionConfig.profiles[0]
    }
  }
}

const handleDrop = (e) => {
  e.preventDefault()
  isDragging.value = false
  
  const files = e.dataTransfer.files
  if (files.length > 0 && files[0].type === 'text/xml') {
    selectedFile.value = files[0]
  }
}

const handleFileSelect = (e) => {
  const files = e.target.files
  if (files.length > 0) {
    selectedFile.value = files[0]
  }
}

const clearFile = () => {
  selectedFile.value = null
  if ($refs.fileInput) {
    $refs.fileInput.value = ''
  }
}

const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

const validateXML = async () => {
  isValidating.value = true
  validationResult.value = null
  
  try {
    let content = xmlContent.value
    
    if (inputMethod.value === 'upload' && selectedFile.value) {
      content = await readFileAsText(selectedFile.value)
    }
    
    const result = await validateERN({
      content,
      type: 'ERN',
      version: validationOptions.value.version,
      profile: validationOptions.value.profile
    })
    
    validationResult.value = result
  } catch (error) {
    console.error('Validation error:', error)
    // Show error message to user
    validationResult.value = {
      valid: false,
      errors: [{
        line: 0,
        column: 0,
        message: error.message || 'An error occurred during validation',
        severity: 'error',
        rule: 'System Error'
      }],
      metadata: {
        processingTime: 0,
        schemaVersion: `ERN ${validationOptions.value.version}`,
        validatedAt: new Date().toISOString()
      }
    }
  } finally {
    isValidating.value = false
  }
}

const readFileAsText = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target.result)
    reader.onerror = reject
    reader.readAsText(file)
  })
}

const openDDEXReference = (rule) => {
  // Open DDEX knowledge base reference
  window.open(`https://kb.ddex.net/reference/${rule}`, '_blank')
}
</script>

<style scoped>
/* Hero Section */
.hero-section {
  padding: var(--space-3xl) 0;
  color: white;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-hover) 100%);
}

.hero-title {
  font-size: var(--text-4xl);
  margin-bottom: var(--space-md);
  color: white;
}

.hero-subtitle {
  font-size: var(--text-lg);
  opacity: 0.9;
  max-width: 600px;
  margin: 0 auto;
}

/* Input Tabs */
.tab-button {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-sm) var(--space-lg);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-weight: var(--font-medium);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--transition-base);
}

.tab-button:hover {
  background-color: var(--color-bg-secondary);
  color: var(--color-text);
}

.tab-button.active {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
}

/* Upload Area */
.dropzone {
  border: 2px dashed var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-3xl);
  text-align: center;
  transition: all var(--transition-base);
  background-color: var(--color-bg-secondary);
}

.dropzone.drag-over {
  border-color: var(--color-primary);
  background-color: var(--color-primary-light);
}

.dropzone-content {
  color: var(--color-text-secondary);
}

/* XML Input */
.xml-input {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  line-height: 1.5;
  resize: vertical;
}

/* Validation Results */
.result-header {
  padding: var(--space-lg);
  border-radius: var(--radius-lg);
  color: white;
}

.result-success {
  background-color: var(--color-success);
}

.result-error {
  background-color: var(--color-error);
}

/* Error Items */
.error-item {
  padding: var(--space-lg);
  margin-bottom: var(--space-md);
}

.error-badge {
  display: inline-block;
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  text-transform: uppercase;
}

.badge-error {
  background-color: var(--color-error);
  color: white;
}

.badge-warning {
  background-color: var(--color-warning);
  color: var(--color-text);
}

.error-message {
  color: var(--color-text);
  line-height: var(--leading-relaxed);
}

.code-snippet {
  background-color: var(--color-bg-tertiary);
  padding: var(--space-md);
  border-radius: var(--radius-md);
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  overflow-x: auto;
}

/* Utilities */
.mr-xs {
  margin-right: var(--space-xs);
}

.gap-sm {
  gap: var(--space-sm);
}

/* Responsive */
@media (max-width: 768px) {
  .hero-title {
    font-size: var(--text-3xl);
  }
  
  .dropzone {
    padding: var(--space-xl);
  }
  
  .grid-cols-2 {
    grid-template-columns: 1fr;
  }
  
  .tab-button {
    flex: 1;
    justify-content: center;
  }
}
</style>