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
        :placeholder="`${new Date().getFullYear()} ${localProduct.label || 'Label Name'}, a Company Name`"
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
        :placeholder="`${new Date().getFullYear()} ${localProduct.label || 'Label Name'}, a Company Name`"
        @input="updateProduct"
      />
      <p class="form-help">Do not include © or (C) symbol. Format: "2025 Label Name"</p>
    </div>

    <!-- Deal Configuration -->
    <div class="form-section-header">Deal Configuration</div>

    <div class="form-row">
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

      <div class="form-group">
        <label class="form-label">Commercial Model</label>
        <select
          v-model="localProduct.commercialModel"
          class="form-select"
          @change="updateProduct"
        >
          <option value="PayAsYouGoModel">Pay As You Go</option>
          <option value="SubscriptionModel">Subscription</option>
          <option value="AdvertisementSupportedModel">Ad Supported</option>
        </select>
      </div>
    </div>

    <div class="form-group">
      <label class="form-label">Usage Types</label>
      <div class="checkbox-group">
        <label class="checkbox-label">
          <input
            type="checkbox"
            value="OnDemandStream"
            v-model="localProduct.usageTypes"
            @change="updateProduct"
          />
          On-Demand Stream
        </label>
        <label class="checkbox-label">
          <input
            type="checkbox"
            value="PermanentDownload"
            v-model="localProduct.usageTypes"
            @change="updateProduct"
          />
          Permanent Download
        </label>
        <label class="checkbox-label">
          <input
            type="checkbox"
            value="ConditionalDownload"
            v-model="localProduct.usageTypes"
            @change="updateProduct"
          />
          Conditional Download
        </label>
      </div>
    </div>

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
  if (!localProduct.value.usageTypes) {
    localProduct.value.usageTypes = ['OnDemandStream']
  }
  if (!localProduct.value.commercialModel) {
    localProduct.value.commercialModel = 'PayAsYouGoModel'
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
</script>

<style scoped>
/* Previous styles remain the same */
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
</style>