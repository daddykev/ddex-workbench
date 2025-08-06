<!-- components/sandbox/ProductForm.vue -->
<template>
  <form class="product-form">
    <!-- Basic Info -->
    <div class="form-section-header">Basic Information</div>
    
    <div class="form-group">
      <label class="form-label">UPC/EAN</label>
      <input
        v-model="localProduct.upc"
        type="text"
        class="form-input"
        placeholder="00000000000000"
        maxlength="14"
        @input="updateProduct"
      />
      <p class="form-help">14-digit barcode (ICPN)</p>
    </div>

    <div class="form-group">
      <label class="form-label">Catalog Number</label>
      <input
        v-model="localProduct.catalogNumber"
        type="text"
        class="form-input"
        placeholder="CAT-001"
        @input="updateProduct"
      />
    </div>

    <div class="form-group">
      <label class="form-label">Release Title</label>
      <input
        v-model="localProduct.title"
        type="text"
        class="form-input"
        placeholder="Album or Single Title"
        required
        @input="updateProduct"
      />
    </div>

    <div class="form-group">
      <label class="form-label">Artist</label>
      <input
        v-model="localProduct.artist"
        type="text"
        class="form-input"
        placeholder="Artist Name"
        required
        @input="updateProduct"
      />
    </div>

    <div class="form-group">
      <label class="form-label">Label</label>
      <input
        v-model="localProduct.label"
        type="text"
        class="form-input"
        placeholder="Record Label"
        required
        @input="updateProduct"
      />
    </div>

    <!-- Metadata -->
    <div class="form-section-header">Metadata</div>

    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Release Type</label>
        <select
          v-model="localProduct.releaseType"
          class="form-select"
          @change="updateProduct"
        >
          <option value="Album">Album</option>
          <option value="Single">Single</option>
          <option value="EP">EP</option>
          <option value="Video">Video</option>
          <option value="VideoAlbum">Video Album</option>
        </select>
      </div>

      <div class="form-group">
        <label class="form-label">Genre</label>
        <input
          v-model="localProduct.genre"
          type="text"
          class="form-input"
          placeholder="e.g., Electronic, Hip Hop"
          @input="updateProduct"
        />
      </div>
    </div>

    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Release Date</label>
        <input
          v-model="localProduct.releaseDate"
          type="date"
          class="form-input"
          @input="updateProduct"
        />
      </div>

      <div class="form-group">
        <label class="form-label">Original Release Date</label>
        <input
          v-model="localProduct.originalReleaseDate"
          type="date"
          class="form-input"
          @input="updateProduct"
        />
      </div>
    </div>

    <div class="form-group">
      <label class="form-label">Parental Warning</label>
      <select
        v-model="localProduct.parentalWarning"
        class="form-select"
        @change="updateProduct"
      >
        <option value="">None</option>
        <option value="NotExplicit">Not Explicit</option>
        <option value="Explicit">Explicit</option>
        <option value="ExplicitContentEdited">Explicit Content Edited</option>
        <option value="NoAdviceAvailable">No Advice Available</option>
      </select>
    </div>

    <!-- Copyright -->
    <div class="form-section-header">Copyright Information</div>

    <div class="form-group">
      <label class="form-label">P Line (Sound Recording Copyright)</label>
      <input
        v-model="localProduct.pLineText"
        type="text"
        class="form-input"
        :placeholder="`${new Date().getFullYear()} ${localProduct.label || 'Label Name'}`"
        @input="updateProduct"
      />
      <p class="form-help">Do not include (P) symbol. Format: "2025 Label Name"</p>
    </div>

    <div class="form-group">
      <label class="form-label">C Line (Composition Copyright)</label>
      <input
        v-model="localProduct.cLineText"
        type="text"
        class="form-input"
        :placeholder="`${new Date().getFullYear()} ${localProduct.label || 'Label Name'}`"
        @input="updateProduct"
      />
      <p class="form-help">Do not include © or (C) symbol. Format: "2025 Label Name"</p>
    </div>

    <!-- Deal Configuration -->
    <div class="form-section-header">Deal Configuration</div>

    <!-- Territory Selection (applies to all deals) -->
    <div class="form-group">
      <label class="form-label">Territory</label>
      <select
        v-model="localProduct.territoryCode"
        class="form-select"
        @change="updateProduct"
      >
        <option value="Worldwide">Worldwide</option>
        <option value="US">United States</option>
        <option value="GB">United Kingdom</option>
        <option value="JP">Japan</option>
        <option value="DE">Germany</option>
        <option value="FR">France</option>
        <option value="CA">Canada</option>
        <option value="AU">Australia</option>
      </select>
    </div>

    <!-- Deal Validity Period -->
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Deal Start Date</label>
        <input
          v-model="localProduct.dealStartDate"
          type="date"
          class="form-input"
          @input="updateProduct"
        />
      </div>

      <div class="form-group">
        <label class="form-label">Deal End Date (Optional)</label>
        <input
          v-model="localProduct.dealEndDate"
          type="date"
          class="form-input"
          @input="updateProduct"
        />
      </div>
    </div>

    <!-- Commercial Models -->
    <div class="commercial-models-section">
      <div class="section-header">
        <label class="form-label">Commercial Models</label>
        <button
          type="button"
          @click="addCommercialModel"
          class="btn btn-sm btn-secondary"
        >
          <font-awesome-icon :icon="['fas', 'plus']" /> Add Commercial Model
        </button>
      </div>

      <div
        v-for="(model, index) in localProduct.commercialModels"
        :key="`model-${index}`"
        class="commercial-model-card"
      >
        <div class="model-header">
          <select
            v-model="model.type"
            class="form-select"
            @change="() => updateCommercialModel(index)"
          >
            <option value="PayAsYouGoModel">Pay As You Go</option>
            <option value="SubscriptionModel">Subscription</option>
            <option value="AdvertisementSupportedModel">Ad Supported</option>
            <option value="FreeOfChargeModel">Free of Charge</option>
          </select>
          <button
            type="button"
            @click="removeCommercialModel(index)"
            class="btn-icon"
            title="Remove commercial model"
            :disabled="localProduct.commercialModels.length === 1"
          >
            <font-awesome-icon :icon="['fas', 'trash']" />
          </button>
        </div>

        <div class="model-usage-types">
          <label class="form-label">Usage Types for {{ getModelDisplayName(model.type) }}</label>
          <div class="checkbox-group">
            <label 
              v-for="usageType in getAvailableUsageTypes(model.type)"
              :key="`${index}-${usageType.value}`"
              class="checkbox-label"
            >
              <input
                type="checkbox"
                :value="usageType.value"
                v-model="model.usageTypes"
                @change="updateProduct"
              />
              {{ usageType.label }}
            </label>
          </div>
          <p v-if="model.usageTypes.length === 0" class="form-error">
            Please select at least one usage type
          </p>
        </div>

        <!-- Optional: Price Information per Commercial Model -->
        <div v-if="model.type === 'PayAsYouGoModel'" class="price-section">
          <label class="form-label">Price Information (Optional)</label>
          <div class="form-row">
            <div class="form-group">
              <input
                v-model.number="model.price"
                type="number"
                step="0.01"
                min="0"
                class="form-input"
                placeholder="0.99"
                @input="updateProduct"
              />
            </div>
            <div class="form-group">
              <select
                v-model="model.currency"
                class="form-select"
                @change="updateProduct"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="JPY">JPY</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  </form>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'

const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  },
  resources: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue', 'update'])

const localProduct = ref({ ...props.modelValue })

// Initialize default values
onMounted(() => {
  // Initialize commercial models if not present
  if (!localProduct.value.commercialModels || localProduct.value.commercialModels.length === 0) {
    localProduct.value.commercialModels = [{
      type: 'PayAsYouGoModel',
      usageTypes: ['PermanentDownload'],
      price: null,
      currency: 'USD'
    }]
  }
  
  if (!localProduct.value.releaseDate) {
    localProduct.value.releaseDate = new Date().toISOString().split('T')[0]
  }
  if (!localProduct.value.dealStartDate) {
    localProduct.value.dealStartDate = new Date().toISOString().split('T')[0]
  }
  
  // Set year defaults
  const currentYear = new Date().getFullYear().toString()
  if (!localProduct.value.pLineYear) {
    localProduct.value.pLineYear = currentYear
  }
  if (!localProduct.value.cLineYear) {
    localProduct.value.cLineYear = currentYear
  }
})

watch(() => props.modelValue, (newVal) => {
  localProduct.value = { ...newVal }
}, { deep: true })

const updateProduct = () => {
  // Extract year from copyright lines if present
  const pLineMatch = localProduct.value.pLineText?.match(/^(\d{4})\s/)
  if (pLineMatch) {
    localProduct.value.pLineYear = pLineMatch[1]
  }
  
  const cLineMatch = localProduct.value.cLineText?.match(/^(\d{4})\s/)
  if (cLineMatch) {
    localProduct.value.cLineYear = cLineMatch[1]
  }
  
  emit('update:modelValue', localProduct.value)
  emit('update')
}

const getModelDisplayName = (modelType) => {
  const names = {
    'PayAsYouGoModel': 'Pay As You Go',
    'SubscriptionModel': 'Subscription',
    'AdvertisementSupportedModel': 'Ad Supported',
    'FreeOfChargeModel': 'Free of Charge'
  }
  return names[modelType] || modelType
}

const getAvailableUsageTypes = (modelType) => {
  // Based on DDEX standards, different commercial models support different usage types
  const usageTypesByModel = {
    'PayAsYouGoModel': [
      { value: 'PermanentDownload', label: 'Permanent Download' },
      { value: 'ConditionalDownload', label: 'Conditional Download' },
      { value: 'TetheredDownload', label: 'Tethered Download' },
      { value: 'PayPerView', label: 'Pay Per View' }
    ],
    'SubscriptionModel': [
      { value: 'OnDemandStream', label: 'On-Demand Stream' },
      { value: 'ConditionalDownload', label: 'Conditional Download' },
      { value: 'TetheredDownload', label: 'Tethered Download' },
      { value: 'SubscriptionDownload', label: 'Subscription Download' },
      { value: 'NonInteractiveStream', label: 'Non-Interactive Stream' }
    ],
    'AdvertisementSupportedModel': [
      { value: 'OnDemandStream', label: 'On-Demand Stream' },
      { value: 'NonInteractiveStream', label: 'Non-Interactive Stream' },
      { value: 'WebcastStream', label: 'Webcast Stream' },
      { value: 'FreePreview', label: 'Free Preview' }
    ],
    'FreeOfChargeModel': [
      { value: 'FreePreview', label: 'Free Preview' },
      { value: 'OnDemandStream', label: 'On-Demand Stream' },
      { value: 'PermanentDownload', label: 'Permanent Download (Free)' },
      { value: 'ConditionalDownload', label: 'Conditional Download' }
    ]
  }
  
  return usageTypesByModel[modelType] || []
}

const addCommercialModel = () => {
  if (!localProduct.value.commercialModels) {
    localProduct.value.commercialModels = []
  }
  
  localProduct.value.commercialModels.push({
    type: 'SubscriptionModel',
    usageTypes: ['OnDemandStream'],
    price: null,
    currency: 'USD'
  })
  
  updateProduct()
}

const removeCommercialModel = (index) => {
  if (localProduct.value.commercialModels.length > 1) {
    localProduct.value.commercialModels.splice(index, 1)
    updateProduct()
  }
}

const updateCommercialModel = (index) => {
  // Clear usage types when commercial model changes
  // as different models support different usage types
  localProduct.value.commercialModels[index].usageTypes = []
  
  // Set a default usage type based on the model
  const modelType = localProduct.value.commercialModels[index].type
  const availableTypes = getAvailableUsageTypes(modelType)
  
  if (availableTypes.length > 0) {
    localProduct.value.commercialModels[index].usageTypes = [availableTypes[0].value]
  }
  
  updateProduct()
}
</script>

<style scoped>
.product-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.form-section-header {
  font-weight: var(--font-semibold);
  color: var(--color-primary);
  padding-bottom: var(--space-xs);
  border-bottom: 1px solid var(--color-border);
  margin-top: var(--space-md);
}

.form-section-header:first-child {
  margin-top: 0;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-md);
}

.form-help {
  font-size: var(--text-sm);
  color: var(--color-text-tertiary);
  margin-top: var(--space-xs);
}

.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  margin-top: var(--space-sm);
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  font-size: var(--text-sm);
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  cursor: pointer;
}

.commercial-models-section {
  margin-top: var(--space-md);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-md);
}

.commercial-model-card {
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-md);
  margin-bottom: var(--space-md);
}

.model-header {
  display: flex;
  gap: var(--space-sm);
  margin-bottom: var(--space-md);
}

.model-header .form-select {
  flex: 1;
}

.model-usage-types {
  margin-bottom: var(--space-md);
}

.price-section {
  padding-top: var(--space-md);
  border-top: 1px solid var(--color-border);
}

.form-error {
  color: var(--color-error);
  font-size: var(--text-sm);
  margin-top: var(--space-xs);
}

.btn-icon {
  background: none;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  padding: var(--space-xs);
  transition: color var(--transition-base);
}

.btn-icon:hover {
  color: var(--color-error);
}

.btn-icon:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>