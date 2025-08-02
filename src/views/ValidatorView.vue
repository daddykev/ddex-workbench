<template>
  <div class="validator-view">
    <!-- Hero Section -->
    <section class="hero-section bg-primary">
      <div class="container">
        <div class="hero-content text-center">
          <h1 class="hero-title">DDEX ERN 4.3 Validator</h1>
          <p class="hero-subtitle">
            Validate your Electronic Release Notification files against the latest DDEX standards
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
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z"/>
              </svg>
              Upload File
            </button>
            <button 
              @click="inputMethod = 'paste'"
              class="tab-button"
              :class="{ active: inputMethod === 'paste' }"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"/>
                <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"/>
              </svg>
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
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" class="mb-md">
                  <path d="M24 32V16m0 0l-6 6m6-6l6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  <path d="M12 40h24a4 4 0 004-4V12a4 4 0 00-4-4H12a4 4 0 00-4 4v24a4 4 0 004 4z" stroke="currentColor" stroke-width="2"/>
                </svg>
                
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
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="var(--color-primary)">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"/>
                    <path d="M14 2v6h6" stroke="white" stroke-width="2"/>
                  </svg>
                  <div>
                    <p class="font-medium">{{ selectedFile.name }}</p>
                    <p class="text-sm text-secondary">{{ formatFileSize(selectedFile.size) }}</p>
                  </div>
                </div>
                <button 
                  @click="clearFile"
                  class="btn btn-secondary btn-sm"
                >
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
                  <option value="4.2" disabled>ERN 4.2 (Coming Soon)</option>
                  <option value="3.8.2" disabled>ERN 3.8.2 (Coming Soon)</option>
                </select>
              </div>
              
              <div class="form-group mb-0">
                <label class="form-label">Profile</label>
                <select v-model="validationOptions.profile" class="form-select">
                  <option value="AudioAlbum">Audio Album</option>
                  <option value="AudioSingle">Audio Single</option>
                  <option value="Video">Video</option>
                  <option value="Mixed">Mixed</option>
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
                <svg class="spinner" width="20" height="20" viewBox="0 0 20 20">
                  <circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="2" fill="none" stroke-dasharray="40" stroke-dashoffset="10"/>
                </svg>
                Validating...
              </span>
              <span v-else>Validate XML</span>
            </button>
          </div>

          <!-- Validation Results -->
          <div v-if="validationResult" class="validation-results mt-2xl">
            <div 
              class="result-header"
              :class="validationResult.valid ? 'result-success' : 'result-error'"
            >
              <div class="flex items-center gap-sm">
                <svg v-if="validationResult.valid" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                </svg>
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
                      View Spec →
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
                  Download Report
                </button>
                <button class="btn btn-secondary">
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
import { ref, computed } from 'vue'
import { validateERN } from '@/services/api'

// State
const inputMethod = ref('upload')
const isDragging = ref(false)
const selectedFile = ref(null)
const xmlContent = ref('')
const isValidating = ref(false)
const validationResult = ref(null)

const validationOptions = ref({
  version: '4.3',
  profile: 'AudioAlbum'
})

// Computed
const canValidate = computed(() => {
  return inputMethod.value === 'upload' ? selectedFile.value : xmlContent.value.trim()
})

// Methods
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
  if (fileInput.value) {
    fileInput.value.value = ''
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
    // Handle error appropriately
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

/* Spinner Animation */
@keyframes spin {
  to { transform: rotate(360deg); }
}

.spinner {
  animation: spin 1s linear infinite;
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