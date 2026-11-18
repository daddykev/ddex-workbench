<template>
  <Teleport to="body">
    <div v-if="show" class="modal-backdrop" @click="handleBackdropClick">
      <div class="modal-container" @click.stop>
        <div class="modal card">
          <div class="modal-header">
            <h2 class="modal-title">Edit DDEX Snippet</h2>
            <button @click="$emit('close')" class="modal-close">
              <font-awesome-icon :icon="['fas', 'times']" />
            </button>
          </div>
          
          <form @submit.prevent="handleSubmit" class="modal-body">
            <div class="form-group">
              <label class="form-label">Title *</label>
              <input
                v-model="form.title"
                type="text"
                class="form-input"
                placeholder="e.g., Basic ERN 4.3 Audio Album"
                required
                :disabled="loading"
              />
            </div>
            
            <div class="form-group">
              <label class="form-label">Description *</label>
              <textarea
                v-model="form.description"
                class="form-textarea"
                rows="3"
                placeholder="Brief description of what this snippet demonstrates..."
                required
                :disabled="loading"
              />
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Category *</label>
                <select v-model="form.category" class="form-select" required :disabled="loading">
                  <option value="">Select category</option>
                  <option value="basic">Basic Patterns</option>
                  <option value="advanced">Advanced Scenarios</option>
                  <option value="migration">Migration Guides</option>
                  <option value="technical">Technical Details</option>
                  <option value="official">Official Samples</option>
                </select>
              </div>
              
              <div class="form-group">
                <label class="form-label">ERN Version</label>
                <select v-model="form.ernVersion" class="form-select" :disabled="loading">
                  <option value="4.3">ERN 4.3</option>
                  <option value="4.2">ERN 4.2</option>
                  <option value="3.8.2">ERN 3.8.2</option>
                </select>
              </div>
            </div>
            
            <div class="form-group">
              <label class="form-label">XML Content *</label>
              <div class="content-input-wrapper">
                <textarea
                  v-model="form.content"
                  class="form-textarea code-textarea"
                  rows="12"
                  placeholder="Paste your DDEX XML content here..."
                  required
                  :disabled="loading"
                  spellcheck="false"
                />
                <div class="content-actions">
                  <button 
                    type="button"
                    @click="loadFromFile"
                    class="btn btn-secondary btn-sm"
                    :disabled="loading"
                  >
                    <font-awesome-icon :icon="['fas', 'upload']" class="mr-xs" />
                    Load from File
                  </button>
                  <button 
                    type="button"
                    @click="validateContent"
                    class="btn btn-secondary btn-sm"
                    :disabled="loading || !form.content"
                  >
                    <font-awesome-icon :icon="['fas', 'check']" class="mr-xs" />
                    Validate
                  </button>
                </div>
              </div>
              <input 
                ref="fileInput"
                type="file"
                accept=".xml"
                style="display: none"
                @change="handleFileLoad"
              />
            </div>
            
            <div class="form-group">
              <label class="form-label">Tags</label>
              <input
                v-model="tagInput"
                type="text"
                class="form-input"
                placeholder="Enter tags separated by commas (e.g., Audio Album, Template)"
                @keydown.enter.prevent="addTag"
                :disabled="loading"
              />
              <div v-if="form.tags.length > 0" class="tags-display">
                <span 
                  v-for="(tag, index) in form.tags" 
                  :key="tag"
                  class="tag-item"
                >
                  {{ tag }}
                  <button 
                    type="button"
                    @click="removeTag(index)"
                    class="tag-remove"
                    :disabled="loading"
                  >
                    <font-awesome-icon :icon="['fas', 'times']" size="xs" />
                  </button>
                </span>
              </div>
            </div>
            
            <div v-if="validationResult" class="validation-result" :class="validationResult.valid ? 'valid' : 'invalid'">
              <font-awesome-icon 
                :icon="['fas', validationResult.valid ? 'check-circle' : 'exclamation-circle']" 
                class="mr-sm"
              />
              {{ validationResult.message }}
            </div>
            
            <div v-if="error" class="alert alert-error">
              {{ error }}
            </div>
          </form>
          
          <div class="modal-footer">
            <button 
              type="button"
              @click="$emit('close')"
              class="btn btn-secondary"
              :disabled="loading"
            >
              Cancel
            </button>
            <button 
              type="submit"
              @click="handleSubmit"
              class="btn btn-primary"
              :disabled="loading || !isValid || !hasChanges"
            >
              <span v-if="loading" class="flex items-center gap-sm">
                <font-awesome-icon :icon="['fas', 'spinner']" spin />
                Saving...
              </span>
              <span v-else>Save Changes</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { updateSnippet } from '@/services/snippets'
import { validateERN } from '@/services/api'  // Keep validation through API

const props = defineProps({
  show: {
    type: Boolean,
    required: true
  },
  snippet: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'updated'])

const fileInput = ref(null)
const loading = ref(false)
const error = ref(null)
const tagInput = ref('')
const validationResult = ref(null)

const form = reactive({
  title: '',
  description: '',
  content: '',
  category: '',
  tags: [],
  ernVersion: '4.3'
})

// Track original values to detect changes
const originalForm = reactive({
  title: '',
  description: '',
  content: '',
  category: '',
  tags: [],
  ernVersion: '4.3'
})

const isValid = computed(() => {
  return form.title && form.description && form.content && form.category
})

const hasChanges = computed(() => {
  return form.title !== originalForm.title ||
    form.description !== originalForm.description ||
    form.content !== originalForm.content ||
    form.category !== originalForm.category ||
    form.ernVersion !== originalForm.ernVersion ||
    JSON.stringify(form.tags) !== JSON.stringify(originalForm.tags)
})

// Watch for snippet changes to populate form
watch(() => props.snippet, (newSnippet) => {
  if (newSnippet) {
    form.title = newSnippet.title
    form.description = newSnippet.description
    form.content = newSnippet.content
    form.category = newSnippet.category
    form.tags = [...(newSnippet.tags || [])]
    form.ernVersion = newSnippet.ernVersion || '4.3'
    
    // Store original values
    originalForm.title = newSnippet.title
    originalForm.description = newSnippet.description
    originalForm.content = newSnippet.content
    originalForm.category = newSnippet.category
    originalForm.tags = [...(newSnippet.tags || [])]
    originalForm.ernVersion = newSnippet.ernVersion || '4.3'
  }
}, { immediate: true })

const handleBackdropClick = (e) => {
  if (!loading.value) {
    emit('close')
  }
}

const loadFromFile = () => {
  fileInput.value.click()
}

const handleFileLoad = (e) => {
  const file = e.target.files[0]
  if (!file) return
  
  const reader = new FileReader()
  reader.onload = (e) => {
    form.content = e.target.result
  }
  reader.readAsText(file)
}

const addTag = () => {
  const tags = tagInput.value
    .split(',')
    .map(tag => tag.trim())
    .filter(tag => tag && !form.tags.includes(tag))
  
  form.tags.push(...tags)
  tagInput.value = ''
}

const removeTag = (index) => {
  form.tags.splice(index, 1)
}

const validateContent = async () => {
  try {
    validationResult.value = null
    const result = await validateERN({
      content: form.content,
      type: 'ERN',
      version: form.ernVersion,
      profile: 'AudioAlbum' // Default profile
    })
    
    validationResult.value = {
      valid: result.valid,
      message: result.valid 
        ? 'XML is valid!' 
        : `Found ${result.errors.length} error(s)`
    }
  } catch (err) {
    validationResult.value = {
      valid: false,
      message: 'Validation failed: ' + err.message
    }
  }
}

const handleSubmit = async () => {
  if (!isValid.value || loading.value || !hasChanges.value) return
  
  loading.value = true
  error.value = null
  
  try {
    // Process tags from input field if any
    if (tagInput.value) {
      addTag()
    }
    
    const updatedSnippet = await updateSnippet(props.snippet.id, {
      title: form.title,
      description: form.description,
      content: form.content,
      category: form.category,
      tags: form.tags,
      ernVersion: form.ernVersion
    })
    
    emit('updated', updatedSnippet)
    emit('close')
  } catch (err) {
    error.value = err.message || 'Failed to update snippet'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* Same styles as CreateSnippetModal */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: var(--z-modal);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-lg);
}

.modal-container {
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  display: flex;
}

.modal {
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-lg);
  border-bottom: 1px solid var(--color-border);
}

.modal-title {
  font-size: var(--text-xl);
  margin: 0;
}

.modal-close {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  border-radius: var(--radius-md);
  transition: all var(--transition-base);
}

.modal-close:hover {
  background-color: var(--color-bg-secondary);
  color: var(--color-text);
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-lg);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-md);
  padding: var(--space-lg);
  border-top: 1px solid var(--color-border);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-lg);
}

.content-input-wrapper {
  position: relative;
}

.code-textarea {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  line-height: 1.5;
}

.content-actions {
  position: absolute;
  top: var(--space-sm);
  right: var(--space-sm);
  display: flex;
  gap: var(--space-sm);
}

.tags-display {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
  margin-top: var(--space-sm);
}

.tag-item {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-xs) var(--space-sm);
  background-color: var(--color-primary-light);
  color: var(--color-primary);
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
}

.tag-remove {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  background: none;
  border: none;
  color: var(--color-primary);
  cursor: pointer;
  border-radius: 50%;
  transition: all var(--transition-base);
}

.tag-remove:hover {
  background-color: var(--color-primary);
  color: white;
}

.validation-result {
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  display: flex;
  align-items: center;
}

.validation-result.valid {
  background-color: var(--color-success);
  color: white;
}

.validation-result.invalid {
  background-color: var(--color-error);
  color: white;
}

.alert {
  padding: var(--space-md);
  border-radius: var(--radius-md);
  margin-top: var(--space-md);
}

.alert-error {
  background-color: var(--color-error);
  color: white;
}

/* Utilities */
.mr-xs {
  margin-right: var(--space-xs);
}

.mr-sm {
  margin-right: var(--space-sm);
}

/* Mobile responsive */
@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .content-actions {
    position: static;
    margin-top: var(--space-sm);
    justify-content: flex-start;
  }
}
</style>