<!-- components/sandbox/ResourceForm.vue -->
<template>
  <div class="resource-card">
    <div class="resource-header">
      <h4 class="resource-title">
        Resource {{ index + 1 }} ({{ localResource.resourceReference }})
      </h4>
      <button
        @click="$emit('remove')"
        class="btn-icon"
        title="Remove resource"
      >
        <font-awesome-icon :icon="['fas', 'trash']" />
      </button>
    </div>

    <div class="resource-form">
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Resource Type</label>
          <select
            v-model="localResource.type"
            class="form-select"
            @change="updateResource"
          >
            <option value="MusicalWorkSoundRecording">Audio Recording</option>
            <option value="MusicalWorkVideoRecording">Music Video</option>
            <option value="Video">Video</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">ISRC</label>
          <input
            v-model="localResource.isrc"
            type="text"
            class="form-input"
            placeholder="USEXM0000001"
            maxlength="12"
            @input="updateResource"
          />
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Title</label>
        <input
          v-model="localResource.title"
          type="text"
          class="form-input"
          placeholder="Track or Video Title"
          required
          @input="updateResource"
        />
      </div>

      <div class="form-group">
        <label class="form-label">Artist</label>
        <input
          v-model="localResource.artist"
          type="text"
          class="form-input"
          placeholder="Artist Name"
          required
          @input="updateResource"
        />
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Duration</label>
          <input
            v-model="durationInput"
            type="text"
            class="form-input"
            placeholder="3:45"
            @input="updateDuration"
          />
          <p class="form-help">Format: MM:SS or HH:MM:SS</p>
        </div>

        <div class="form-group">
          <label class="form-label">File URI</label>
          <input
            v-model="localResource.fileUri"
            type="text"
            class="form-input"
            placeholder="track_001.wav"
            @input="updateResource"
          />
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">℗ Year</label>
          <input
            v-model="localResource.pLineYear"
            type="text"
            class="form-input"
            placeholder="2024"
            maxlength="4"
            @input="updateResource"
          />
        </div>

        <div class="form-group">
          <label class="form-label">℗ Text</label>
          <input
            v-model="localResource.pLineText"
            type="text"
            class="form-input"
            placeholder="(P) 2024 Label Name"
            @input="updateResource"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  },
  index: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['update:modelValue', 'update', 'remove'])

const localResource = ref({ ...props.modelValue })

// Convert ISO duration to human-readable format
const durationInput = computed({
  get() {
    const duration = localResource.value.duration
    if (!duration || !duration.startsWith('PT')) return ''
    
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
    if (!match) return ''
    
    const hours = match[1] || ''
    const minutes = match[2] || '0'
    const seconds = match[3] || '0'
    
    if (hours) {
      return `${hours}:${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')}`
    } else {
      return `${minutes}:${seconds.padStart(2, '0')}`
    }
  },
  set(value) {
    // Will be handled by updateDuration
  }
})

watch(() => props.modelValue, (newVal) => {
  localResource.value = { ...newVal }
}, { deep: true })

const updateResource = () => {
  emit('update:modelValue', localResource.value)
  emit('update')
}

const updateDuration = (event) => {
  const value = event.target.value
  if (!value) {
    localResource.value.duration = 'PT0M0S'
    updateResource()
    return
  }
  
  // Parse duration input (MM:SS or HH:MM:SS)
  const parts = value.split(':').map(p => parseInt(p) || 0)
  let hours = 0, minutes = 0, seconds = 0
  
  if (parts.length === 2) {
    [minutes, seconds] = parts
  } else if (parts.length === 3) {
    [hours, minutes, seconds] = parts
  }
  
  // Convert to ISO 8601 duration
  let duration = 'PT'
  if (hours > 0) duration += `${hours}H`
  if (minutes > 0) duration += `${minutes}M`
  if (seconds > 0) duration += `${seconds}S`
  
  if (duration === 'PT') duration = 'PT0M0S'
  
  localResource.value.duration = duration
  updateResource()
}
</script>

<style scoped>
.resource-card {
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-md);
}

.resource-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-md);
}

.resource-title {
  font-size: var(--text-base);
  margin: 0;
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

.resource-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
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