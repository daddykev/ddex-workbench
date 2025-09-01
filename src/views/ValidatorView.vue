<template>
  <div class="validator-view">
    <!-- Hero Section -->
    <section class="hero-section bg-primary">
      <div class="container">
        <div class="hero-content text-center">
          <h1 class="hero-title">DDEX ERN Validator</h1>
          <p class="hero-subtitle">
            Validate your Electronic Release Notification messages with XSD schemas, business rules, and Schematron profiles
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
            <button 
              @click="inputMethod = 'url'"
              class="tab-button"
              :class="{ active: inputMethod === 'url' }"
            >
              <font-awesome-icon :icon="['fas', 'link']" />
              Load from URL
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

          <!-- Security Warning Alert -->
          <div v-if="securityError" class="security-warning alert alert-warning mb-lg">
            <div class="flex items-start gap-sm">
              <font-awesome-icon 
                :icon="['fas', 'exclamation-triangle']" 
                class="text-warning mt-xs"
              />
              <div class="flex-1">
                <strong>Security Warning</strong>
                <p class="text-sm mt-xs">{{ securityError }}</p>
              </div>
              <button 
                @click="securityError = null"
                class="btn btn-sm btn-ghost"
              >
                <font-awesome-icon :icon="['fas', 'times']" />
              </button>
            </div>
          </div>

          <!-- Paste Method -->
          <div v-else-if="inputMethod === 'paste'" class="paste-area">
            <div class="form-group">
              <label class="form-label">
                Paste your XML content
                <span v-if="securityError" class="text-warning text-sm ml-sm">
                  (Security warning detected)
                </span>
              </label>
              <div class="editor-container">
                <textarea 
                  v-model="xmlContent"
                  class="form-textarea xml-input"
                  :class="{ 'has-errors': realtimeErrors.length > 0 }"
                  rows="15"
                  placeholder="<?xml version='1.0' encoding='UTF-8'?>
<ern:NewReleaseMessage...>"
                  @input="handleXmlInput"
                ></textarea>
                
                <!-- Real-time validation indicator -->
                <div v-if="validationOptions.realtime && xmlContent" class="realtime-indicator">
                  <div v-if="isValidatingRealtime" class="flex items-center gap-xs text-sm">
                    <font-awesome-icon :icon="['fas', 'spinner']" spin />
                    Validating...
                  </div>
                  <div v-else-if="realtimeErrors.length > 0" class="flex items-center gap-xs text-sm text-error">
                    <font-awesome-icon :icon="['fas', 'exclamation-circle']" />
                    {{ realtimeErrors.length }} issues found
                  </div>
                  <div v-else-if="xmlContent.length > 100" class="flex items-center gap-xs text-sm text-success">
                    <font-awesome-icon :icon="['fas', 'check-circle']" />
                    Valid
                  </div>
                </div>
              </div>
              
              <div class="flex justify-between items-center mt-xs">
                <span class="text-sm text-secondary">
                  {{ xmlContent.length }} characters
                  <span v-if="xmlContent">
                    • {{ countLines(xmlContent) }} lines
                  </span>
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

          <!-- URL Method -->
          <div v-else-if="inputMethod === 'url'" class="url-area">
            <div class="form-group">
              <label class="form-label">Enter XML URL</label>
              <div class="flex gap-sm">
                <input 
                  v-model="xmlUrl"
                  type="url"
                  class="form-input flex-1"
                  placeholder="https://example.com/release.xml"
                  @keyup.enter="loadFromUrl"
                >
                <button 
                  @click="loadFromUrl"
                  :disabled="!xmlUrl || isLoadingUrl"
                  class="btn btn-primary"
                >
                  <span v-if="isLoadingUrl" class="flex items-center gap-xs">
                    <font-awesome-icon :icon="['fas', 'spinner']" spin />
                    Loading...
                  </span>
                  <span v-else>
                    <font-awesome-icon :icon="['fas', 'download']" class="mr-xs" />
                    Load
                  </span>
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
                <select 
                  v-model="validationOptions.version" 
                  class="form-select"
                  @change="updateAvailableProfiles"
                >
                  <option value="4.3">ERN 4.3 (Latest)</option>
                  <option value="4.2">ERN 4.2</option>
                  <option value="3.8.2">ERN 3.8.2</option>
                </select>
              </div>
              
              <div class="form-group mb-0">
                <label class="form-label">Profile</label>
                <select v-model="validationOptions.profile" class="form-select">
                  <option value="">No Profile (Schema Only)</option>
                  <option 
                    v-for="profile in availableProfiles" 
                    :key="profile"
                    :value="profile"
                  >
                    {{ profile }}
                  </option>
                </select>
              </div>

              <div class="form-group mb-0">
                <label class="form-label">Validation Mode</label>
                <select v-model="validationOptions.mode" class="form-select">
                  <option value="full">Full Validation (XSD + Business Rules + Schematron)</option>
                  <option value="xsd">XSD Schema Only</option>
                  <option value="business">Business Rules Only</option>
                  <option value="quick">Quick Check (XSD + Basic Rules)</option>
                </select>
              </div>
              
              <div class="form-group mb-0">
                <label class="form-label flex items-center gap-xs">
                  <input 
                    v-model="validationOptions.realtime" 
                    type="checkbox"
                    class="form-checkbox"
                  >
                  Real-time Validation
                </label>
                <p class="form-help">Validate as you type (paste mode only)</p>
              </div>
            </div>

            <!-- Advanced Options (Collapsible) -->
            <div class="advanced-options mt-md">
              <button 
                @click="showAdvanced = !showAdvanced"
                class="text-sm text-primary flex items-center gap-xs"
              >
                <font-awesome-icon 
                  :icon="['fas', 'chevron-right']" 
                  :class="{ 'rotate-90': showAdvanced }"
                  class="transition-transform"
                />
                Advanced Options
              </button>
              
              <div v-if="showAdvanced" class="advanced-content mt-md">
                <div class="grid grid-cols-2 gap-md">
                  <div class="form-group mb-0">
                    <label class="form-label flex items-center gap-xs">
                      <input 
                        v-model="validationOptions.strictMode" 
                        type="checkbox"
                        class="form-checkbox"
                      >
                      Strict Mode
                    </label>
                    <p class="form-help">Treat warnings as errors</p>
                  </div>
                  
                  <div class="form-group mb-0">
                    <label class="form-label flex items-center gap-xs">
                      <input 
                        v-model="validationOptions.validateReferences" 
                        type="checkbox"
                        class="form-checkbox"
                      >
                      Validate References
                    </label>
                    <p class="form-help">Check resource and party references</p>
                  </div>

                  <div class="form-group mb-0">
                    <label class="form-label flex items-center gap-xs">
                      <input 
                        v-model="validationOptions.generateSVRL" 
                        type="checkbox"
                        class="form-checkbox"
                        :disabled="!validationOptions.profile"
                      >
                      Generate SVRL Report
                    </label>
                    <p class="form-help">
                      Generate Schematron Validation Report
                      <span v-if="!validationOptions.profile" class="text-warning">
                        (Requires profile selection)
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Validate Button -->
          <div class="flex justify-center mt-xl mb-xl">
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
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-sm">
                  <font-awesome-icon 
                    :icon="['fas', validationResult.valid ? 'check-circle' : 'exclamation-circle']" 
                    size="lg"
                  />
                  <div>
                    <h2 class="text-2xl font-semibold">
                      {{ validationResult.valid ? 'Valid DDEX File' : 'Validation Failed' }}
                    </h2>
                    <p class="text-sm opacity-90 mt-xs">
                      {{ validationResult.metadata.errorCount || 0 }} errors, 
                      {{ validationResult.metadata.warningCount || 0 }} warnings • 
                      Processed in {{ validationResult.metadata.processingTime }}ms
                    </p>
                  </div>
                </div>
                
                <button 
                  @click="clearResults"
                  class="btn btn-sm"
                  :class="validationResult.valid ? 'btn-success-outline' : 'btn-error-outline'"
                >
                  <font-awesome-icon :icon="['fas', 'times']" />
                </button>
              </div>
            </div>

            <!-- SVRL Report Notification -->
            <div v-if="validationResult.svrl" class="svrl-notification card mt-lg p-lg">
              <div class="flex items-start gap-md">
                <div class="svrl-icon">
                  <font-awesome-icon :icon="['fas', 'file-alt']" size="lg" class="text-primary" />
                </div>
                <div class="flex-1">
                  <h4 class="font-semibold mb-xs">SVRL Report Generated</h4>
                  <p class="text-sm text-secondary mb-sm">
                    Schematron Validation Report Language (SVRL) report has been generated for profile: {{ validationOptions.profile }}
                  </p>
                  <div class="flex gap-sm">
                    <button 
                      @click="viewSVRL"
                      class="btn btn-sm btn-secondary"
                    >
                      <font-awesome-icon :icon="['fas', 'eye']" class="mr-xs" />
                      View SVRL
                    </button>
                    <button 
                      @click="downloadSVRL"
                      class="btn btn-sm btn-primary"
                    >
                      <font-awesome-icon :icon="['fas', 'download']" class="mr-xs" />
                      Download SVRL
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- SVRL Viewer Modal -->
            <div v-if="showSVRLViewer" class="svrl-modal-overlay" @click.self="showSVRLViewer = false">
              <div class="svrl-modal card">
                <div class="svrl-modal-header">
                  <h3 class="text-lg font-semibold">SVRL Report</h3>
                  <button 
                    @click="showSVRLViewer = false"
                    class="btn btn-sm btn-ghost"
                  >
                    <font-awesome-icon :icon="['fas', 'times']" />
                  </button>
                </div>
                <div class="svrl-modal-body">
                  <pre class="svrl-content">{{ formattedSVRL }}</pre>
                </div>
                <div class="svrl-modal-footer">
                  <button 
                    @click="copySVRL"
                    class="btn btn-sm btn-secondary"
                  >
                    <font-awesome-icon :icon="['fas', 'copy']" class="mr-xs" />
                    Copy to Clipboard
                  </button>
                  <button 
                    @click="showSVRLViewer = false"
                    class="btn btn-sm btn-primary"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>

            <!-- Validation Steps -->
            <div v-if="validationResult.metadata.validationSteps && validationResult.metadata.validationSteps.length > 0" class="validation-steps card mt-lg p-lg">
              <h3 class="text-lg font-semibold mb-md">Validation Steps</h3>
              <div class="steps-grid">
                <div 
                  v-for="(step, index) in validationResult.metadata.validationSteps" 
                  :key="step.type"
                  class="step-row"
                >
                  <div class="step-label">
                    <div class="step-icon-inline" :class="{ 'step-success': step.errorCount === 0, 'step-error': step.errorCount > 0 }">
                      <font-awesome-icon 
                        :icon="['fas', step.errorCount > 0 ? 'times' : 'check']" 
                        size="sm"
                      />
                    </div>
                    <span class="text-sm text-secondary">{{ step.type }}</span>
                  </div>
                  <div class="step-value">
                    <span class="font-medium">{{ step.duration }}ms</span>
                    <span class="text-sm text-secondary ml-sm">
                      • {{ step.errorCount }} {{ step.errorCount === 1 ? 'issue' : 'issues' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Fallback if validation steps are missing but validation succeeded -->
            <div v-else-if="validationResult.valid" class="validation-steps card mt-lg p-lg">
              <h3 class="text-lg font-semibold mb-md">Validation Complete</h3>
              <div class="validation-complete-info">
                <div class="flex items-center gap-md">
                  <div class="step-icon-inline step-success">
                    <font-awesome-icon :icon="['fas', 'check']" />
                  </div>
                  <div>
                    <p class="font-medium">All validation checks passed</p>
                    <p class="text-sm text-secondary">
                      Processed in {{ validationResult.metadata.processingTime }}ms
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Error Summary -->
            <div v-if="!validationResult.valid && ((validationResult.errors && validationResult.errors.length) || (validationResult.warnings && validationResult.warnings.length))" class="error-summary mt-lg">
              <!-- Tab Navigation for Errors/Warnings -->
              <div class="error-tabs flex gap-sm mb-md">
                <button 
                  @click="errorTab = 'all'"
                  class="tab-button tab-button-sm"
                  :class="{ active: errorTab === 'all' }"
                >
                  All Issues ({{ totalIssues }})
                </button>
                <button 
                  v-if="validationResult.errors && validationResult.errors.length"
                  @click="errorTab = 'errors'"
                  class="tab-button tab-button-sm"
                  :class="{ active: errorTab === 'errors' }"
                >
                  <font-awesome-icon :icon="['fas', 'exclamation-circle']" class="mr-xs text-error" />
                  Errors ({{ validationResult.errors.length }})
                </button>
                <button 
                  v-if="validationResult.warnings && validationResult.warnings.length"
                  @click="errorTab = 'warnings'"
                  class="tab-button tab-button-sm"
                  :class="{ active: errorTab === 'warnings' }"
                >
                  <font-awesome-icon :icon="['fas', 'exclamation-triangle']" class="mr-xs text-warning" />
                  Warnings ({{ validationResult.warnings.length }})
                </button>
              </div>

              <!-- Filter and Search -->
              <div class="error-controls flex gap-md mb-md">
                <div class="flex-1">
                  <input 
                    v-model="errorSearch"
                    type="text"
                    class="form-input form-input-sm"
                    placeholder="Search errors..."
                  >
                </div>
                <select v-model="errorGroupBy" class="form-select form-select-sm">
                  <option value="line">Group by Line</option>
                  <option value="type">Group by Type</option>
                  <option value="severity">Group by Severity</option>
                </select>
              </div>

              <!-- Grouped Errors Display -->
              <div class="errors-container">
                <div 
                  v-for="(group, key) in groupedAndFilteredErrors" 
                  :key="key"
                  class="error-group"
                >
                  <h4 class="error-group-header" @click="toggleGroup(key)">
                    <font-awesome-icon 
                      :icon="['fas', 'chevron-right']" 
                      :class="{ 'rotate-90': !collapsedGroups[key] }"
                      class="mr-xs transition-transform"
                    />
                    {{ formatGroupHeader(key, errorGroupBy) }} 
                    <span class="badge badge-sm ml-xs">{{ group.length }}</span>
                  </h4>
                  
                  <transition name="collapse">
                    <div v-show="!collapsedGroups[key]" class="error-group-items">
                      <div 
                        v-for="(error, index) in group" 
                        :key="`${key}-${index}`"
                        class="error-item card"
                        :class="`error-${error.severity}`"
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
                            <span v-if="error.rule" class="text-sm text-tertiary">
                              • {{ error.rule }}
                            </span>
                          </div>
                          <button 
                            v-if="error.rule && error.rule.includes('DDEX')"
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
                        
                        <div v-if="error.suggestion" class="error-suggestion mt-md">
                          <p class="text-sm text-info">
                            <font-awesome-icon :icon="['fas', 'lightbulb']" class="mr-xs" />
                            {{ error.suggestion }}
                          </p>
                        </div>
                      </div>
                    </div>
                  </transition>
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
                    <p class="font-medium">{{ validationOptions.profile || 'None' }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-secondary">Validation Mode</p>
                    <p class="font-medium">{{ formatValidationMode(validationOptions.mode) }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-secondary">Processing Time</p>
                    <p class="font-medium">{{ validationResult.metadata.processingTime }}ms</p>
                  </div>
                </div>
              </div>
              
              <div class="flex gap-md mt-lg">
                <!-- Export Menu Container -->
                <div class="export-menu-container">
                  <button 
                    @click="showExportMenu = !showExportMenu"
                    class="btn btn-primary"
                  >
                    <font-awesome-icon :icon="['fas', 'download']" class="mr-xs" />
                    Export Report
                    <font-awesome-icon 
                      :icon="['fas', 'chevron-down']" 
                      size="sm"
                      class="ml-xs"
                    />
                  </button>
                  
                  <!-- Export Dropdown Menu -->
                  <transition name="dropdown">
                    <div v-if="showExportMenu" class="export-menu card">
                      <button 
                        @click="exportAsJSON"
                        class="export-option"
                      >
                        <font-awesome-icon :icon="['fas', 'file-code']" class="mr-sm" />
                        Export as JSON
                      </button>
                      <button 
                        @click="exportAsText"
                        class="export-option"
                      >
                        <font-awesome-icon :icon="['fas', 'file']" class="mr-sm" />
                        Export as Text
                      </button>
                      <button 
                        v-if="validationResult.svrl"
                        @click="downloadSVRL"
                        class="export-option"
                      >
                        <font-awesome-icon :icon="['fas', 'file-code']" class="mr-sm" />
                        Export as SVRL
                      </button>
                      <button 
                        class="export-option disabled"
                        disabled
                      >
                        <font-awesome-icon :icon="['fas', 'file']" class="mr-sm" />
                        Export as PDF
                        <span class="badge badge-sm ml-auto">Coming Soon</span>
                      </button>
                      <div class="export-divider"></div>
                      <button 
                        @click="copyResultsToClipboard($event)"
                        class="export-option"
                      >
                        <font-awesome-icon :icon="['fas', 'copy']" class="mr-sm" />
                        Copy Summary
                      </button>
                    </div>
                  </transition>
                </div>
                
                <button @click="shareResult" class="btn btn-secondary">
                  <font-awesome-icon :icon="['fas', 'share']" class="mr-xs" />
                  Share Result
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
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { validateERN, getSupportedFormats } from '@/services/api'
import { debounce } from '@/utils/debounce'

import { 
  validateXMLSecurity, 
  validateFileType, 
  validateURL,
  sanitizeFileName 
} from '@/utils/xmlSecurity'

// Router
const router = useRouter()

// Auth
const { user, isAuthenticated } = useAuth()

// State
const inputMethod = ref('upload')
const isDragging = ref(false)
const selectedFile = ref(null)
const xmlContent = ref('')
const xmlUrl = ref('')
const isLoadingUrl = ref(false)
const isValidating = ref(false)
const isValidatingRealtime = ref(false)
const validationResult = ref(null)
const realtimeErrors = ref([])
const errorTab = ref('all')
const errorSearch = ref('')
const errorGroupBy = ref('line')
const collapsedGroups = ref({})
const showAdvanced = ref(false)
const showExportMenu = ref(false)
const showSVRLViewer = ref(false)

// Dynamic profiles support
const supportedFormats = ref(null)
const availableProfiles = ref(['AudioAlbum', 'AudioSingle', 'Video', 'Mixed'])

// Security refs
const securityError = ref(null)

const validationOptions = ref({
  version: '4.3',
  profile: 'AudioAlbum',
  mode: 'full',
  realtime: false,
  strictMode: false,
  validateReferences: true,
  generateSVRL: false  // New option for SVRL generation
})

// Computed
const canValidate = computed(() => {
  if (inputMethod.value === 'upload') return selectedFile.value
  if (inputMethod.value === 'paste') return xmlContent.value.trim()
  if (inputMethod.value === 'url') return xmlUrl.value.trim()
  return false
})

const totalIssues = computed(() => {
  if (!validationResult.value) return 0
  const errors = validationResult.value.errors?.length || 0
  const warnings = validationResult.value.warnings?.length || 0
  return errors + warnings
})

const formattedSVRL = computed(() => {
  if (!validationResult.value?.svrl) return ''
  
  // If SVRL is already a string, return it
  if (typeof validationResult.value.svrl === 'string') {
    return validationResult.value.svrl
  }
  
  // If it's an object, stringify it
  return JSON.stringify(validationResult.value.svrl, null, 2)
})

const displayedErrors = computed(() => {
  if (!validationResult.value) return []
  
  let errors = []
  if (errorTab.value === 'all') {
    errors = [
      ...(validationResult.value.errors || []), 
      ...(validationResult.value.warnings || [])
    ]
  } else if (errorTab.value === 'errors') {
    errors = validationResult.value.errors || []
  } else if (errorTab.value === 'warnings') {
    errors = validationResult.value.warnings || []
  }
  
  // Apply search filter
  if (errorSearch.value) {
    const search = errorSearch.value.toLowerCase()
    errors = errors.filter(error => 
      (error.message && error.message.toLowerCase().includes(search)) ||
      (error.rule && error.rule.toLowerCase().includes(search))
    )
  }
  
  return errors
})

const groupedAndFilteredErrors = computed(() => {
  const errors = displayedErrors.value
  const groups = {}
  
  errors.forEach(error => {
    let key
    switch (errorGroupBy.value) {
      case 'type':
        key = error.rule?.split('-')[0] || 'Other'
        break
      case 'severity':
        key = error.severity
        break
      case 'line':
      default:
        key = `Line ${error.line}`
        break
    }
    
    if (!groups[key]) groups[key] = []
    groups[key].push(error)
  })
  
  // Sort groups
  const sortedGroups = {}
  Object.keys(groups).sort((a, b) => {
    if (errorGroupBy.value === 'line') {
      return parseInt(a.split(' ')[1]) - parseInt(b.split(' ')[1])
    }
    return a.localeCompare(b)
  }).forEach(key => {
    sortedGroups[key] = groups[key]
  })
  
  return sortedGroups
})

// Real-time validation debounced function
const validateRealtime = debounce(async () => {
  if (!validationOptions.value.realtime || !xmlContent.value || xmlContent.value.length < 100) {
    realtimeErrors.value = []
    return
  }
  
  isValidatingRealtime.value = true
  
  try {
    const result = await validateERN({
      content: xmlContent.value,
      type: 'ERN',
      version: validationOptions.value.version,
      profile: validationOptions.value.profile,
      mode: 'quick' // Quick mode for real-time
    })
    
    realtimeErrors.value = result.errors || []
  } catch (error) {
    console.error('Real-time validation error:', error)
    realtimeErrors.value = []
  } finally {
    isValidatingRealtime.value = false
  }
}, 500)

// Load supported formats on mount
onMounted(async () => {
  try {
    const formats = await getSupportedFormats()
    supportedFormats.value = formats
    updateAvailableProfiles()
  } catch (error) {
    console.error('Failed to load supported formats:', error)
  }

  // Check if coming from snippets with content
  const storedContent = sessionStorage.getItem('validatorContent')
  const storedVersion = sessionStorage.getItem('validatorVersion')
  const storedInputMethod = sessionStorage.getItem('validatorInputMethod')

  if (storedContent) {
    // Set the input method to paste
    inputMethod.value = storedInputMethod || 'paste'
    
    // Load the content
    xmlContent.value = storedContent
    
    // Set the version if provided
    if (storedVersion) {
      validationOptions.value.version = storedVersion
      // Update available profiles for the new version
      updateAvailableProfiles()
    }
    
    // Clear the session storage to prevent reloading on refresh
    sessionStorage.removeItem('validatorContent')
    sessionStorage.removeItem('validatorVersion')
    sessionStorage.removeItem('validatorInputMethod')
    
    // If real-time validation is enabled, trigger it
    if (validationOptions.value.realtime) {
      validateRealtime()
    }
  }
  
  // Click outside handler for export menu
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

// Watch for version changes to update available profiles
watch(() => validationOptions.value.version, () => {
  updateAvailableProfiles()
})

// Watch for profile changes to enable/disable SVRL generation
watch(() => validationOptions.value.profile, (newProfile) => {
  // Disable SVRL generation if no profile is selected
  if (!newProfile) {
    validationOptions.value.generateSVRL = false
  }
})

// Watch for real-time validation
watch(xmlContent, (newContent) => {
  if (validationOptions.value.realtime && newContent) {
    validateRealtime()
  }
})

// Methods
const handleClickOutside = (e) => {
  if (!e.target.closest('.export-menu-container')) {
    showExportMenu.value = false
  }
}

const updateAvailableProfiles = () => {
  if (!supportedFormats.value) return
  
  const versionConfig = supportedFormats.value.versions.find(
    v => v.version === validationOptions.value.version
  )
  
  if (versionConfig) {
    availableProfiles.value = versionConfig.profiles
    // Reset profile if current selection is not available
    if (!versionConfig.profiles.includes(validationOptions.value.profile)) {
      validationOptions.value.profile = versionConfig.profiles[0] || ''
    }
  }
}

const handleDrop = async (e) => {
  e.preventDefault()
  isDragging.value = false
  
  const files = e.dataTransfer.files
  if (files.length > 0) {
    const file = files[0]
    
    // Validate file type
    const fileValidation = validateFileType(file)
    if (!fileValidation.valid) {
      securityError.value = fileValidation.error
      alert(fileValidation.error)
      return
    }
    
    // Read and validate content
    const reader = new FileReader()
    reader.onload = async (event) => {
      const content = event.target.result
      
      // Validate XML security
      const securityValidation = validateXMLSecurity(content)
      if (!securityValidation.valid) {
        securityError.value = securityValidation.error
        alert(`Security Warning: ${securityValidation.error}`)
        return
      }
      
      selectedFile.value = file
      securityError.value = null
    }
    
    reader.readAsText(file)
  }
}

const handleFileSelect = async (e) => {
  const files = e.target.files
  if (files.length > 0) {
    const file = files[0]
    
    // Validate file type and size
    const fileValidation = validateFileType(file)
    if (!fileValidation.valid) {
      securityError.value = fileValidation.error
      alert(fileValidation.error)
      return
    }
    
    // Read and validate content
    const reader = new FileReader()
    reader.onload = async (event) => {
      const content = event.target.result
      
      // Validate XML security
      const securityValidation = validateXMLSecurity(content)
      if (!securityValidation.valid) {
        securityError.value = securityValidation.error
        alert(`Security Warning: ${securityValidation.error}`)
        selectedFile.value = null
        return
      }
      
      // If all validations pass, set the file
      selectedFile.value = file
      securityError.value = null
    }
    
    reader.onerror = () => {
      alert('Failed to read file')
    }
    
    reader.readAsText(file)
  }
}

const clearFile = () => {
  selectedFile.value = null
  const fileInput = document.querySelector('input[type="file"]')
  if (fileInput) {
    fileInput.value = ''
  }
}

const loadFromUrl = async () => {
  if (!xmlUrl.value) return
  
  // Validate URL
  const urlValidation = validateURL(xmlUrl.value)
  if (!urlValidation.valid) {
    securityError.value = urlValidation.error
    alert(urlValidation.error)
    return
  }
  
  isLoadingUrl.value = true
  securityError.value = null
  
  try {
    // Add timeout for fetch
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout
    
    const response = await fetch(xmlUrl.value, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/xml, text/xml, text/plain'
      }
    })
    
    clearTimeout(timeoutId)
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    // Check content type
    const contentType = response.headers.get('content-type')
    if (contentType && !contentType.includes('xml') && !contentType.includes('text')) {
      throw new Error('URL does not return XML content')
    }
    
    const content = await response.text()
    
    // Validate XML security
    const securityValidation = validateXMLSecurity(content)
    if (!securityValidation.valid) {
      throw new Error(securityValidation.error)
    }
    
    xmlContent.value = content
    inputMethod.value = 'paste'
  } catch (error) {
    if (error.name === 'AbortError') {
      alert('Request timeout: URL took too long to respond')
    } else {
      alert(`Failed to load XML: ${error.message}`)
    }
    securityError.value = error.message
  } finally {
    isLoadingUrl.value = false
  }
}

const handleXmlInput = (e) => {
  // Update line numbers if needed
  if (validationOptions.value.realtime) {
    validateRealtime()
  }
}

const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

const countLines = (text) => {
  return text.split('\n').length
}

const validateXML = async () => {
  // Clear previous results
  validationResult.value = null
  securityError.value = null
  
  let content = ''
  
  // Get content based on input method
  if (inputMethod.value === 'upload' && selectedFile.value) {
    const reader = new FileReader()
    content = await new Promise((resolve, reject) => {
      reader.onload = (e) => resolve(e.target.result)
      reader.onerror = reject
      reader.readAsText(selectedFile.value)
    })
  } else if (inputMethod.value === 'paste') {
    content = xmlContent.value
  }
  
  if (!content) {
    alert('Please provide XML content to validate')
    return
  }
  
  // Security validation before sending to API
  const securityValidation = validateXMLSecurity(content)
  if (!securityValidation.valid) {
    securityError.value = securityValidation.error
    validationResult.value = {
      valid: false,
      errors: [{
        line: 0,
        column: 0,
        message: `Security Check Failed: ${securityValidation.error}`,
        severity: 'error',
        rule: 'Security'
      }],
      warnings: [],  // Add empty warnings array
      metadata: {
        processingTime: 0,
        schemaVersion: validationOptions.value.version,
        validatedAt: new Date().toISOString(),
        errorCount: 1,
        warningCount: 0,
        validationSteps: []  // Add empty validation steps
      }
    }
    return
  }
  
  isValidating.value = true
  
  try {
    // Build payload with SVRL option if enabled
    const payload = {
      content,
      type: 'ERN',
      version: validationOptions.value.version,
      profile: validationOptions.value.profile,
      mode: validationOptions.value.mode,
      strictMode: validationOptions.value.strictMode,
      validateReferences: validationOptions.value.validateReferences
    }
    
    // Add SVRL generation flag if enabled and profile is selected
    if (validationOptions.value.generateSVRL && validationOptions.value.profile) {
      payload.generateSVRL = true
    }
    
    const result = await validateERN(payload)
    
    // Ensure result has all expected properties
    validationResult.value = {
      valid: result.valid || false,
      errors: result.errors || [],
      warnings: result.warnings || [],
      svrl: result.svrl || null,  // Include SVRL if present
      metadata: result.metadata || {
        processingTime: 0,
        schemaVersion: validationOptions.value.version,
        validatedAt: new Date().toISOString(),
        errorCount: result.errors?.length || 0,
        warningCount: result.warnings?.length || 0,
        validationSteps: []
      }
    }
    
    // Optional: Save to history if you implemented the function
    // saveToHistory(validationResult.value)
    
  } catch (error) {
    console.error('Validation error:', error)
    validationResult.value = {
      valid: false,
      errors: [{
        line: 0,
        column: 0,
        message: error.message || 'Validation failed',
        severity: 'error',
        rule: 'API Error'
      }],
      warnings: [],
      metadata: {
        processingTime: 0,
        schemaVersion: validationOptions.value.version,
        validatedAt: new Date().toISOString(),
        errorCount: 1,
        warningCount: 0,
        validationSteps: []
      }
    }
  } finally {
    isValidating.value = false
  }
}

watch(xmlContent, (newContent) => {
  if (newContent && inputMethod.value === 'paste') {
    // Clear any previous security errors
    securityError.value = null
    
    // Validate security (but don't block, just warn)
    const securityValidation = validateXMLSecurity(newContent)
    if (!securityValidation.valid) {
      securityError.value = securityValidation.error
      // Don't prevent validation, but show warning
      console.warn('Security warning:', securityValidation.error)
    }
  }
  
  // Continue with existing real-time validation if enabled
  if (validationOptions.value.realtime && newContent) {
    validateRealtime()
  }
})

const readFileAsText = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target.result)
    reader.onerror = reject
    reader.readAsText(file)
  })
}

const clearResults = () => {
  validationResult.value = null
  errorTab.value = 'all'
  errorSearch.value = ''
  collapsedGroups.value = {}
  showSVRLViewer.value = false
}

const toggleGroup = (key) => {
  collapsedGroups.value[key] = !collapsedGroups.value[key]
}

const formatGroupHeader = (key, groupBy) => {
  if (groupBy === 'severity') {
    return key.charAt(0).toUpperCase() + key.slice(1) + 's'
  }
  return key
}

const formatValidationMode = (mode) => {
  const modes = {
    'full': 'Full Validation',
    'xsd': 'XSD Schema Only',
    'business': 'Business Rules Only',
    'quick': 'Quick Check'
  }
  return modes[mode] || mode
}

const openDDEXReference = (rule) => {
  // Extract the actual rule ID and open DDEX knowledge base
  const ruleId = rule.split('-').pop()
  window.open(`https://kb.ddex.net/reference/${ruleId}`, '_blank')
}

// SVRL-specific methods
const viewSVRL = () => {
  showSVRLViewer.value = true
}

const downloadSVRL = () => {
  showExportMenu.value = false
  
  if (!validationResult.value?.svrl) return
  
  const svrlContent = typeof validationResult.value.svrl === 'string' 
    ? validationResult.value.svrl 
    : JSON.stringify(validationResult.value.svrl, null, 2)
  
  const blob = new Blob([svrlContent], { type: 'application/xml' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `ddex-svrl-report-${new Date().toISOString().split('T')[0]}.xml`
  a.click()
  URL.revokeObjectURL(url)
}

const copySVRL = () => {
  const svrlContent = formattedSVRL.value
  
  navigator.clipboard.writeText(svrlContent).then(() => {
    // Show temporary success message
    const originalText = 'Copy to Clipboard'
    const button = document.querySelector('.svrl-modal-footer button:first-child')
    if (button) {
      button.innerHTML = '<i class="fas fa-check mr-xs"></i>Copied!'
      button.classList.add('text-success')
      
      setTimeout(() => {
        button.innerHTML = `<i class="fas fa-copy mr-xs"></i>${originalText}`
        button.classList.remove('text-success')
      }, 2000)
    }
  })
}

const exportAsJSON = () => {
  showExportMenu.value = false
  
  // Create a comprehensive export object
  const exportData = {
    metadata: {
      exportedAt: new Date().toISOString(),
      validatedAt: validationResult.value.metadata.validatedAt,
      tool: 'DDEX Workbench Validator',
      version: '1.0.0'
    },
    validation: {
      valid: validationResult.value.valid,
      ernVersion: validationOptions.value.version,
      profile: validationOptions.value.profile || 'None',
      mode: validationOptions.value.mode,
      processingTime: validationResult.value.metadata.processingTime + 'ms',
      errorCount: validationResult.value.metadata.errorCount,
      warningCount: validationResult.value.metadata.warningCount
    },
    validationSteps: validationResult.value.metadata.validationSteps,
    errors: validationResult.value.errors || [],
    warnings: validationResult.value.warnings || [],
    svrl: validationResult.value.svrl || null  // Include SVRL if available
  }
  
  // Create and download the file
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `ddex-validation-${new Date().toISOString().split('T')[0]}.json`
  a.click()
  URL.revokeObjectURL(url)
}

const exportAsText = () => {
  showExportMenu.value = false
  
  // Create a human-readable text report
  let report = `DDEX VALIDATION REPORT
======================
Generated: ${new Date().toLocaleString()}

SUMMARY
-------
Status: ${validationResult.value.valid ? 'VALID' : 'INVALID'}
ERN Version: ${validationOptions.value.version}
Profile: ${validationOptions.value.profile || 'None'}
Validation Mode: ${formatValidationMode(validationOptions.value.mode)}
Processing Time: ${validationResult.value.metadata.processingTime}ms
Total Errors: ${validationResult.value.metadata.errorCount}
Total Warnings: ${validationResult.value.metadata.warningCount}
SVRL Report: ${validationResult.value.svrl ? 'Generated' : 'Not Generated'}

VALIDATION STEPS
----------------
`

  if (validationResult.value.metadata.validationSteps) {
    validationResult.value.metadata.validationSteps.forEach(step => {
      report += `${step.type}: ${step.duration}ms (${step.errorCount} issues)\n`
    })
  }

  if (validationResult.value.errors?.length > 0) {
    report += `
ERRORS
------
`
    validationResult.value.errors.forEach((error, index) => {
      report += `
${index + 1}. Line ${error.line}, Column ${error.column}
   Rule: ${error.rule}
   Message: ${error.message}
`
      if (error.context) {
        report += `   Context: ${error.context}\n`
      }
      if (error.suggestion) {
        report += `   Suggestion: ${error.suggestion}\n`
      }
    })
  }

  if (validationResult.value.warnings?.length > 0) {
    report += `
WARNINGS
--------
`
    validationResult.value.warnings.forEach((warning, index) => {
      report += `
${index + 1}. Line ${warning.line}, Column ${warning.column}
   Rule: ${warning.rule}
   Message: ${warning.message}
`
      if (warning.context) {
        report += `   Context: ${warning.context}\n`
      }
      if (warning.suggestion) {
        report += `   Suggestion: ${warning.suggestion}\n`
      }
    })
  }

  // Create and download the file
  const blob = new Blob([report], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `ddex-validation-report-${new Date().toISOString().split('T')[0]}.txt`
  a.click()
  URL.revokeObjectURL(url)
}

const copyResultsToClipboard = (event) => {
  showExportMenu.value = false
  
  const summary = `DDEX Validation: ${validationResult.value.valid ? 'VALID' : 'INVALID'}
ERN ${validationOptions.value.version} • ${validationOptions.value.profile || 'No Profile'}
${validationResult.value.metadata.errorCount} errors, ${validationResult.value.metadata.warningCount} warnings
Processed in ${validationResult.value.metadata.processingTime}ms
${validationResult.value.svrl ? 'SVRL Report Generated' : ''}`
  
  navigator.clipboard.writeText(summary).then(() => {
    // Show a temporary success message
    const button = event.target.closest('button')
    const originalText = button.innerHTML
    button.innerHTML = '<i class="fas fa-check mr-xs"></i>Copied!'
    button.classList.add('text-success')
    
    setTimeout(() => {
      button.innerHTML = originalText
      button.classList.remove('text-success')
    }, 2000)
  })
}

const shareResult = () => {
  // Generate shareable link
  const shareData = {
    title: 'DDEX Validation Result',
    text: `DDEX ERN ${validationOptions.value.version} validation: ${validationResult.value.valid ? 'Valid' : 'Invalid'}`,
    url: window.location.href
  }
  
  if (navigator.share) {
    navigator.share(shareData)
  } else {
    // Fallback: copy to clipboard
    navigator.clipboard.writeText(shareData.url)
    alert('Link copied to clipboard!')
  }
}
</script>

<style scoped>
/* Existing styles remain the same... */
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

.tab-button-sm {
  padding: var(--space-xs) var(--space-md);
  font-size: var(--text-sm);
}

/* Upload Area */
.dropzone {
  border: 2px dashed var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-3xl);
  text-align: center;
  transition: all var(--transition-base);
  background-color: var(--color-bg-secondary);
  cursor: pointer;
}

.dropzone.drag-over {
  border-color: var(--color-primary);
  background-color: var(--color-primary-light);
}

.dropzone-content {
  color: var(--color-text-secondary);
}

/* XML Input */
.editor-container {
  position: relative;
}

.xml-input {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  line-height: 1.5;
  resize: vertical;
}

.xml-input.has-errors {
  border-color: var(--color-error);
}

.realtime-indicator {
  position: absolute;
  top: var(--space-sm);
  right: var(--space-sm);
  background: var(--color-surface);
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
}

/* Validation Options */
.form-checkbox {
  width: 1rem;
  height: 1rem;
  cursor: pointer;
}

.form-help {
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
  margin-top: var(--space-xs);
}

.advanced-options {
  border-top: 1px solid var(--color-border);
  padding-top: var(--space-md);
}

.rotate-90 {
  transform: rotate(90deg);
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

.btn-success-outline {
  background: transparent;
  border: 1px solid white;
  color: white;
}

.btn-error-outline {
  background: transparent;
  border: 1px solid white;
  color: white;
}

/* SVRL Notification Styles */
.svrl-notification {
  background-color: var(--color-surface);
  border-left: 4px solid var(--color-primary);
}

.svrl-icon {
  flex-shrink: 0;
}

/* SVRL Modal Styles */
.svrl-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-modal);
  padding: var(--space-lg);
}

.svrl-modal {
  max-width: 800px;
  width: 100%;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  background: var(--color-surface);
}

.svrl-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-lg);
  border-bottom: 1px solid var(--color-border);
}

.svrl-modal-body {
  flex: 1;
  overflow: auto;
  padding: var(--space-lg);
}

.svrl-content {
  background-color: var(--color-bg-secondary);
  padding: var(--space-md);
  border-radius: var(--radius-md);
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  white-space: pre-wrap;
  word-break: break-word;
  overflow-x: auto;
}

.svrl-modal-footer {
  display: flex;
  gap: var(--space-sm);
  justify-content: flex-end;
  padding: var(--space-lg);
  border-top: 1px solid var(--color-border);
}

.steps-grid {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.step-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-md);
  padding: var(--space-sm) 0;
  border-bottom: 1px solid var(--color-border-light);
}

.step-row:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.step-label {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.step-value {
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.step-icon-inline {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.step-icon-inline.step-success {
  background-color: var(--color-success);
  color: white;
}

.step-icon-inline.step-error {
  background-color: var(--color-error);
  color: white;
}

/* Validation complete fallback */
.validation-complete-info {
  padding: 0;
}

/* Export Menu */
.export-menu-container {
  position: relative;
}

.export-menu {
  position: absolute;
  top: calc(100% + var(--space-xs));
  left: 0;
  min-width: 200px;
  padding: var(--space-xs);
  box-shadow: var(--shadow-lg);
  z-index: var(--z-dropdown);
}

.export-option {
  display: flex;
  align-items: center;
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

.export-option:hover:not(:disabled) {
  background-color: var(--color-bg-secondary);
}

.export-option.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.export-divider {
  height: 1px;
  background-color: var(--color-border);
  margin: var(--space-xs) 0;
}

.badge {
  display: inline-block;
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  background-color: var(--color-bg-tertiary);
  color: var(--color-text-secondary);
}

/* Error Display */
.error-controls {
  padding: var(--space-md);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-md);
}

.form-input-sm,
.form-select-sm {
  padding: var(--space-xs) var(--space-sm);
  font-size: var(--text-sm);
}

.error-group {
  margin-bottom: var(--space-lg);
}

.error-group-header {
  display: flex;
  align-items: center;
  padding: var(--space-sm) var(--space-md);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-md);
  font-weight: var(--font-semibold);
  cursor: pointer;
  user-select: none;
  transition: all var(--transition-base);
}

.error-group-header:hover {
  background: var(--color-bg-tertiary);
}

.error-group-items {
  margin-top: var(--space-sm);
}

/* Error Items */
.error-item {
  padding: var(--space-lg);
  margin-bottom: var(--space-sm);
  transition: all var(--transition-base);
}

.error-item:hover {
  box-shadow: var(--shadow-md);
}

.error-item.error-warning {
  border-left: 4px solid var(--color-warning);
}

.error-item.error-error {
  border-left: 4px solid var(--color-error);
}

.error-badge {
  display: inline-block;
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  text-transform: uppercase;
}

.badge-sm {
  padding: 2px var(--space-xs);
  font-size: var(--text-xs);
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
  white-space: pre-wrap;
}

.error-suggestion {
  padding: var(--space-sm) var(--space-md);
  background: var(--color-info-light);
  border-radius: var(--radius-md);
  border-left: 3px solid var(--color-info);
}

/* Transitions */
.collapse-enter-active,
.collapse-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.collapse-enter-from,
.collapse-leave-to {
  opacity: 0;
  max-height: 0;
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Utilities */
.mr-xs {
  margin-right: var(--space-xs);
}

.ml-xs {
  margin-left: var(--space-xs);
}

.ml-sm {
  margin-left: var(--space-sm);
}

.mr-sm {
  margin-right: var(--space-sm);
}

.ml-auto {
  margin-left: auto;
}

.mt-xs {
  margin-top: var(--space-xs);
}

.mb-xs {
  margin-bottom: var(--space-xs);
}

.mb-sm {
  margin-bottom: var(--space-sm);
}

.gap-xs {
  gap: var(--space-xs);
}

.gap-sm {
  gap: var(--space-sm);
}

.gap-md {
  gap: var(--space-md);
}

.transition-transform {
  transition: transform var(--transition-base);
}

.text-error {
  color: var(--color-error);
}

.text-warning {
  color: var(--color-warning);
}

.text-success {
  color: var(--color-success);
}

.text-info {
  color: var(--color-info);
}

.text-tertiary {
  color: var(--color-text-tertiary);
}

.opacity-90 {
  opacity: 0.9;
}

.security-warning {
  background-color: var(--color-warning-light);
  border: 1px solid var(--color-warning);
  border-radius: var(--radius-md);
  padding: var(--space-md);
}

.alert-warning {
  background-color: #fff3cd;
  border-color: #ffc107;
  color: #856404;
}

[data-theme="dark"] .alert-warning {
  background-color: #3d3200;
  border-color: #ffc107;
  color: #fff3cd;
}

.text-warning {
  color: var(--color-warning);
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
    font-size: var(--text-sm);
    padding: var(--space-sm);
  }
  
  .step-row {
    grid-template-columns: 1fr;
    gap: var(--space-xs);
  }
  
  .step-value {
    padding-left: calc(24px + var(--space-sm)); /* Align with icon */
  }
  
  .error-controls {
    flex-direction: column;
  }
  
  .export-menu {
    left: auto;
    right: 0;
  }
  
  .svrl-modal {
    max-height: 90vh;
  }
}
</style>