<!-- views/SandboxView.vue -->
<template>
  <div class="sandbox-page">
    <div class="container">
      <!-- Header -->
      <div class="page-header">
        <h1 class="page-title">ERN Sandbox</h1>
        <p class="page-subtitle">
          Create valid DDEX ERN messages interactively
        </p>
      </div>

      <!-- Main Content -->
      <div class="sandbox-layout">
        <!-- Left Panel - Form -->
        <div class="sandbox-panel">
          <div class="panel-header">
            <h2 class="panel-title">Message Builder</h2>
            <select v-model="selectedTemplate" class="form-select" @change="loadTemplate">
              <option value="">Start from scratch</option>
              <option value="single">Audio Single Template</option>
              <option value="album">Audio Album Template</option>
              <option value="video">Video Template</option>
            </select>
          </div>

          <!-- Product Section -->
          <div class="form-section">
            <h3 class="section-title">Product Information</h3>
            <ProductForm 
              v-model="product" 
              :resources="resources"
              @update="handleProductUpdate"
            />
          </div>

          <!-- Resources Section -->
          <div class="form-section">
            <div class="section-header">
              <h3 class="section-title">Resources (Tracks/Videos)</h3>
              <button @click="addResource" class="btn btn-sm btn-primary">
                <font-awesome-icon :icon="['fas', 'plus']" /> Add Resource
              </button>
            </div>
            
            <div class="resources-list">
              <ResourceForm
                v-for="(resource, index) in resources"
                :key="resource.id"
                v-model="resources[index]"
                :index="index"
                @remove="removeResource(index)"
                @update="handleResourceUpdate"
              />
            </div>
          </div>
        </div>

        <!-- Right Panel - Preview -->
        <div class="sandbox-panel">
          <div class="panel-header">
            <h2 class="panel-title">ERN Preview</h2>
            <div class="panel-actions">
              <button 
                @click="copyToClipboard" 
                class="btn btn-sm btn-secondary"
                :disabled="!ernXml"
              >
                <font-awesome-icon :icon="['fas', 'copy']" /> Copy
              </button>
              <button 
                @click="validateERN" 
                class="btn btn-sm btn-primary"
                :disabled="!ernXml || validating"
              >
                <font-awesome-icon 
                  :icon="['fas', validating ? 'spinner' : 'check-circle']" 
                  :spin="validating"
                /> 
                Validate
              </button>
            </div>
          </div>

          <!-- XML Preview -->
          <div class="xml-preview" v-if="ernXml">
            <pre><code v-html="highlightedXml"></code></pre>
          </div>
          <div v-else class="empty-state">
            <font-awesome-icon :icon="['fas', 'file-code']" />
            <p>Fill in the form to generate ERN XML</p>
          </div>

          <!-- Validation Results -->
          <div v-if="validationResult" class="validation-results mt-lg">
            <div 
              class="validation-status"
              :class="validationResult.valid ? 'valid' : 'invalid'"
            >
              <font-awesome-icon 
                :icon="['fas', validationResult.valid ? 'check-circle' : 'exclamation-circle']" 
              />
              <span>{{ validationResult.valid ? 'Valid ERN' : 'Validation Failed' }}</span>
            </div>
            
            <div v-if="!validationResult.valid" class="errors-list">
              <div 
                v-for="(error, index) in validationResult.errors" 
                :key="index"
                class="error-item"
              >
                <span class="error-line">Line {{ error.line }}:</span>
                <span class="error-message">{{ error.message }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Debug Panel (remove in production) -->
      <div v-if="debugMode" class="debug-panel">
        <h3>Debug Info</h3>
        <pre>{{ debugInfo }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import ProductForm from '@/components/sandbox/ProductForm.vue'
import ResourceForm from '@/components/sandbox/ResourceForm.vue'
import ernBuilder from '@/services/ernBuilder'
import { validateERN as validateERNApi } from '@/services/api'

// Debug mode flag
const debugMode = ref(true) // Set to false in production

// Data
const selectedTemplate = ref('')
const product = ref({
  upc: '',
  releaseReference: 'R0',
  title: '',
  artist: '',
  label: '',
  releaseType: 'Album',
  territoryCode: 'Worldwide',
  tracks: []
})

const resources = ref([])
const ernXml = ref('')
const validating = ref(false)
const validationResult = ref(null)
const isGenerating = ref(false)

// Debug info
const debugInfo = computed(() => ({
  productTitle: product.value.title,
  resourceCount: resources.value.length,
  isGenerating: isGenerating.value,
  lastResourceId: resources.value[resources.value.length - 1]?.id || null
}))

// Computed
const highlightedXml = computed(() => {
  if (!ernXml.value) return ''
  
  // Simple XML syntax highlighting
  return ernXml.value
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/(&lt;\/?[\w:]+)(.*?)(&gt;)/g, '<span class="xml-tag">$1$2$3</span>')
    .replace(/(\w+)=/g, '<span class="xml-attr">$1</span>=')
    .replace(/"([^"]*)"/g, '"<span class="xml-value">$1</span>"')
    .replace(/(&lt;!--.*?--&gt;)/g, '<span class="xml-comment">$1</span>')
})

// Methods with logging
const generateERN = async () => {
  console.log('[generateERN] Starting generation...')
  
  // Prevent concurrent generation
  if (isGenerating.value) {
    console.log('[generateERN] Already generating, skipping...')
    return
  }
  
  isGenerating.value = true
  
  try {
    if (!product.value.title || resources.value.length === 0) {
      console.log('[generateERN] Missing title or resources, clearing XML')
      ernXml.value = ''
      return
    }
    
    // Update product tracks based on resources
    product.value.tracks = resources.value.map((resource, index) => ({
      resourceReference: resource.resourceReference,
      sequenceNumber: index + 1
    }))
    
    console.log('[generateERN] Building ERN with:', {
      product: product.value,
      resourceCount: resources.value.length
    })
    
    ernXml.value = ernBuilder.buildERN(product.value, resources.value)
    validationResult.value = null
    
    console.log('[generateERN] Generation complete')
  } catch (error) {
    console.error('[generateERN] Error:', error)
  } finally {
    // Use nextTick to ensure Vue has processed all updates
    await nextTick()
    isGenerating.value = false
  }
}

const addResource = () => {
  console.log('[addResource] Adding new resource...')
  
  const newResource = {
    id: Date.now(),
    isrc: '',
    resourceReference: `A${resources.value.length + 1}`,
    title: '',
    artist: product.value.artist || '', // Default to product artist
    duration: 'PT0M0S',
    type: 'MusicalWorkSoundRecording',
    pLineYear: new Date().getFullYear().toString(),
    pLineText: '',
    previewStartTime: 0,
    fileUri: '',
    territoryCode: 'Worldwide'
  }
  
  console.log('[addResource] New resource:', newResource)
  resources.value.push(newResource)
  
  // Manually trigger generation after adding
  generateERN()
}

const removeResource = (index) => {
  console.log('[removeResource] Removing resource at index:', index)
  
  resources.value.splice(index, 1)
  
  // Re-number resource references
  resources.value.forEach((resource, i) => {
    resource.resourceReference = `A${i + 1}`
  })
  
  console.log('[removeResource] Resources after removal:', resources.value.length)
  generateERN()
}

const handleProductUpdate = () => {
  console.log('[handleProductUpdate] Product updated')
  generateERN()
}

const handleResourceUpdate = () => {
  console.log('[handleResourceUpdate] Resource updated')
  generateERN()
}

const loadTemplate = () => {
  console.log('[loadTemplate] Loading template:', selectedTemplate.value)
  
  switch (selectedTemplate.value) {
    case 'single':
      loadSingleTemplate()
      break
    case 'album':
      loadAlbumTemplate()
      break
    case 'video':
      loadVideoTemplate()
      break
    default:
      resetForm()
  }
  generateERN()
}

const loadSingleTemplate = () => {
  console.log('[loadSingleTemplate] Loading single template')
  
  product.value = {
    upc: '00000000000000',
    releaseReference: 'R0',
    title: 'Example Single',
    artist: 'Example Artist',
    label: 'Example Label',
    releaseType: 'Single',
    territoryCode: 'Worldwide',
    commercialModels: [
      {
        type: 'PayAsYouGoModel',
        usageTypes: ['PermanentDownload'],
        price: 0.99,
        currency: 'USD'
      },
      {
        type: 'SubscriptionModel',
        usageTypes: ['OnDemandStream'],
        price: null,
        currency: 'USD'
      }
    ],
    dealStartDate: new Date().toISOString().split('T')[0],
    tracks: []
  }
  
  resources.value = [{
    id: Date.now(),
    isrc: 'USEXM0000001',
    resourceReference: 'A1',
    title: 'Example Track',
    artist: 'Example Artist',
    duration: 'PT3M30S',
    type: 'MusicalWorkSoundRecording',
    pLineYear: '2024',
    pLineText: '(P) 2024 Example Label',
    previewStartTime: 30,
    fileUri: 'example_track.wav',
    territoryCode: 'Worldwide'
  }]
}

const loadAlbumTemplate = () => {
  console.log('[loadAlbumTemplate] Loading album template')
  
  product.value = {
    upc: '00000000000001',
    releaseReference: 'R0',
    title: 'Example Album',
    artist: 'Example Artist',
    label: 'Example Label',
    releaseType: 'Album',
    territoryCode: 'Worldwide',
    tracks: []
  }
  
  resources.value = [
    {
      id: Date.now(),
      isrc: 'USEXM0000001',
      resourceReference: 'A1',
      title: 'Track 1',
      artist: 'Example Artist',
      duration: 'PT3M30S',
      type: 'MusicalWorkSoundRecording',
      pLineYear: '2024',
      pLineText: '(P) 2024 Example Label',
      previewStartTime: 30,
      fileUri: 'track_001.wav',
      territoryCode: 'Worldwide'
    },
    {
      id: Date.now() + 1,
      isrc: 'USEXM0000002',
      resourceReference: 'A2',
      title: 'Track 2',
      artist: 'Example Artist',
      duration: 'PT4M15S',
      type: 'MusicalWorkSoundRecording',
      pLineYear: '2024',
      pLineText: '(P) 2024 Example Label',
      previewStartTime: 45,
      fileUri: 'track_002.wav',
      territoryCode: 'Worldwide'
    }
  ]
}

const loadVideoTemplate = () => {
  console.log('[loadVideoTemplate] Loading video template')
  
  product.value = {
    upc: '00000000000002',
    releaseReference: 'R0',
    title: 'Example Music Video',
    artist: 'Example Artist',
    label: 'Example Label',
    releaseType: 'Video',
    territoryCode: 'Worldwide',
    tracks: []
  }
  
  resources.value = [{
    id: Date.now(),
    isrc: 'USEXM0000003',
    resourceReference: 'A1',
    title: 'Example Music Video',
    artist: 'Example Artist',
    duration: 'PT4M0S',
    type: 'MusicalWorkVideoRecording',
    pLineYear: '2024',
    pLineText: '(P) 2024 Example Label',
    previewStartTime: 60,
    fileUri: 'example_video.mp4',
    territoryCode: 'Worldwide'
  }]
}

const resetForm = () => {
  console.log('[resetForm] Resetting form')
  
  product.value = {
    upc: '',
    releaseReference: 'R0',
    title: '',
    artist: '',
    label: '',
    releaseType: 'Album',
    territoryCode: 'Worldwide',
    tracks: []
  }
  resources.value = []
  ernXml.value = ''
  validationResult.value = null
}

const copyToClipboard = async () => {
  console.log('[copyToClipboard] Copying to clipboard')
  
  try {
    await navigator.clipboard.writeText(ernXml.value)
    console.log('[copyToClipboard] Successfully copied')
  } catch (err) {
    console.error('[copyToClipboard] Failed to copy:', err)
  }
}

const validateERN = async () => {
  console.log('[validateERN] Starting validation')
  
  validating.value = true
  validationResult.value = null
  
  try {
    const result = await validateERNApi({
      content: ernXml.value,
      type: 'ERN',
      version: '4.3',
      profile: product.value.releaseType === 'Album' ? 'AudioAlbum' : 
               product.value.releaseType === 'Single' ? 'AudioSingle' : 
               'Video'
    })
    
    console.log('[validateERN] Validation result:', result)
    validationResult.value = result
  } catch (error) {
    console.error('[validateERN] Validation failed:', error)
    validationResult.value = {
      valid: false,
      errors: [{
        line: 0,
        message: 'Failed to validate: ' + error.message
      }]
    }
  } finally {
    validating.value = false
  }
}

// Initialize with an empty resource on mount
console.log('[SandboxView] Component mounted')
</script>

<style scoped>
/* Previous styles remain the same */

/* Debug Panel */
.debug-panel {
  margin-top: var(--space-xl);
  padding: var(--space-lg);
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

.debug-panel h3 {
  margin-bottom: var(--space-md);
  color: var(--color-warning);
}

.debug-panel pre {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}

/* Rest of styles... */
.sandbox-page {
  padding: var(--space-2xl) 0;
  min-height: calc(100vh - 64px - 280px);
}

.page-header {
  text-align: center;
  margin-bottom: var(--space-2xl);
}

.page-title {
  font-size: var(--text-3xl);
  margin-bottom: var(--space-sm);
}

.page-subtitle {
  color: var(--color-text-secondary);
  font-size: var(--text-lg);
}

.sandbox-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-xl);
  align-items: start;
}

.sandbox-panel {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.panel-header {
  padding: var(--space-lg);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.panel-title {
  font-size: var(--text-xl);
  margin: 0;
}

.panel-actions {
  display: flex;
  gap: var(--space-sm);
}

.form-section {
  padding: var(--space-lg);
  border-bottom: 1px solid var(--color-border);
}

.form-section:last-child {
  border-bottom: none;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-lg);
}

.section-title {
  font-size: var(--text-lg);
  margin: 0;
}

.resources-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.xml-preview {
  padding: var(--space-lg);
  background: var(--color-bg);
  overflow-x: auto;
  max-height: 600px;
  overflow-y: auto;
}

.xml-preview pre {
  margin: 0;
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  line-height: 1.5;
}

/* XML Syntax Highlighting */
.xml-tag {
  color: var(--color-primary);
  font-weight: var(--font-medium);
}

.xml-attr {
  color: var(--color-secondary);
}

.xml-value {
  color: var(--color-warning);
}

.xml-comment {
  color: var(--color-text-tertiary);
  font-style: italic;
}

.empty-state {
  padding: var(--space-3xl);
  text-align: center;
  color: var(--color-text-tertiary);
}

.empty-state svg {
  font-size: 3rem;
  margin-bottom: var(--space-md);
}

.validation-results {
  padding: var(--space-lg);
  border-top: 1px solid var(--color-border);
}

.validation-status {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  font-weight: var(--font-medium);
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-md);
}

.validation-status.valid {
  background-color: var(--color-success);
  color: white;
}

.validation-status.invalid {
  background-color: var(--color-error);
  color: white;
}

.errors-list {
  margin-top: var(--space-md);
}

.error-item {
  padding: var(--space-sm);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-sm);
  margin-bottom: var(--space-sm);
  font-size: var(--text-sm);
}

.error-line {
  font-weight: var(--font-medium);
  margin-right: var(--space-sm);
}

/* Mobile Responsive */
@media (max-width: 1200px) {
  .sandbox-layout {
    grid-template-columns: 1fr;
  }
  
  .sandbox-panel:first-child {
    margin-bottom: var(--space-xl);
  }
}
</style>