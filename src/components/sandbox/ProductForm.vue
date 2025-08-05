<!-- components/sandbox/ProductForm.vue -->
<template>
  <form class="product-form">
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
        </select>
      </div>
    </div>
  </form>
</template>

<script setup>
import { ref, watch } from 'vue'

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

watch(() => props.modelValue, (newVal) => {
  localProduct.value = { ...newVal }
}, { deep: true })

const updateProduct = () => {
  emit('update:modelValue', localProduct.value)
  emit('update')
}
</script>

<style scoped>
.product-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
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
</style>