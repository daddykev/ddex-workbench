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
      <!-- Basic Information -->
      <div class="form-section-header">Basic Information</div>
      
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

      <!-- Metadata -->
      <div class="form-section-header">Metadata</div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Genre</label>
          <input
            v-model="localResource.genre"
            type="text"
            class="form-input"
            placeholder="e.g., Electronic, Hip Hop"
            @input="updateResource"
          />
        </div>

        <div class="form-group">
          <label class="form-label">Language</label>
          <select
            v-model="localResource.languageOfPerformance"
            class="form-select"
            @change="updateResource"
          >
            <option value="">Select Language</option>
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
            <option value="ja">Japanese</option>
            <option value="ko">Korean</option>
            <option value="pt">Portuguese</option>
            <option value="it">Italian</option>
            <option value="nl">Dutch</option>
            <option value="sv">Swedish</option>
          </select>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Parental Warning</label>
          <select
            v-model="localResource.parentalWarning"
            class="form-select"
            @change="updateResource"
          >
            <option value="">None</option>
            <option value="NotExplicit">Not Explicit</option>
            <option value="Explicit">Explicit</option>
            <option value="ExplicitContentEdited">Explicit Content Edited</option>
            <option value="NoAdviceAvailable">No Advice Available</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Creation Date</label>
          <input
            v-model="localResource.creationDate"
            type="date"
            class="form-input"
            @input="updateResource"
          />
        </div>
      </div>

      <!-- Technical Details -->
      <div class="form-section-header">Technical Details</div>

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

      <!-- Audio Technical Details (for audio resources) -->
      <div v-if="localResource.type !== 'Video'" class="form-row">
        <div class="form-group">
          <label class="form-label">Audio Codec</label>
          <select
            v-model="localResource.codecType"
            class="form-select"
            @change="updateResource"
          >
            <option value="PCM">PCM (WAV)</option>
            <option value="MP3">MP3</option>
            <option value="AAC">AAC</option>
            <option value="FLAC">FLAC</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Bit Rate (kbps)</label>
          <input
            v-model="localResource.bitRate"
            type="text"
            class="form-input"
            placeholder="1411 for CD quality"
            @input="updateResource"
          />
        </div>
      </div>

      <div v-if="localResource.type !== 'Video'" class="form-row">
        <div class="form-group">
          <label class="form-label">Sampling Rate (Hz)</label>
          <select
            v-model="localResource.samplingRate"
            class="form-select"
            @change="updateResource"
          >
            <option value="44100">44100 (CD)</option>
            <option value="48000">48000</option>
            <option value="96000">96000</option>
            <option value="192000">192000</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Bits Per Sample</label>
          <select
            v-model="localResource.bitsPerSample"
            class="form-select"
            @change="updateResource"
          >
            <option value="16">16-bit</option>
            <option value="24">24-bit</option>
            <option value="32">32-bit</option>
          </select>
        </div>
      </div>

      <!-- Video Technical Details (for video resources) -->
      <div v-if="localResource.type !== 'MusicalWorkSoundRecording'" class="form-row">
        <div class="form-group">
          <label class="form-label">Video Codec</label>
          <select
            v-model="localResource.codecType"
            class="form-select"
            @change="updateResource"
          >
            <option value="H264">H.264</option>
            <option value="H265">H.265 (HEVC)</option>
            <option value="VP9">VP9</option>
            <option value="AV1">AV1</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Aspect Ratio</label>
          <select
            v-model="localResource.aspectRatio"
            class="form-select"
            @change="updateResource"
          >
            <option value="16:9">16:9 (Widescreen)</option>
            <option value="4:3">4:3 (Standard)</option>
            <option value="21:9">21:9 (Ultrawide)</option>
            <option value="1:1">1:1 (Square)</option>
            <option value="9:16">9:16 (Vertical)</option>
          </select>
        </div>
      </div>

      <!-- Copyright -->
      <div class="form-section-header">Copyright Information</div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">P Year</label>
          <input
            v-model="localResource.pLineYear"
            type="text"
            class="form-input"
            placeholder="2025"
            maxlength="4"
            @input="updateResource"
          />
        </div>

        <div class="form-group">
          <label class="form-label">P Line Text</label>
          <input
            v-model="localResource.pLineText"
            type="text"
            class="form-input"
            :placeholder="`${localResource.pLineYear || '2025'} Label Name, a Company Name`"
            @input="updateResource"
          />
          <p class="form-help">No (P) symbol. Format: "2025 Label Name"</p>
        </div>
      </div>

      <!-- Preview Details -->
      <div class="form-section-header">Preview Configuration</div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Preview Start (seconds)</label>
          <input
            v-model.number="previewStart"
            type="number"
            class="form-input"
            placeholder="30"
            min="0"
            @input="updatePreview"
          />
        </div>

        <div class="form-group">
          <label class="form-label">Preview End (seconds)</label>
          <input
            v-model.number="previewEnd"
            type="number"
            class="form-input"
            placeholder="60"
            min="0"
            @input="updatePreview"
          />
        </div>
      </div>

      <!-- Contributors -->
      <div class="form-section-header">Contributors (Optional)</div>
      
      <div class="contributors-section">
        <div 
          v-for="(contributor, cIndex) in localResource.contributors" 
          :key="`contrib-${cIndex}`"
          class="contributor-row"
        >
          <input
            v-model="contributor.name"
            type="text"
            class="form-input"
            placeholder="Contributor Name"
            @input="updateResource"
          />
          <select
            v-model="contributor.role"
            class="form-select"
            @change="updateResource"
          >
            <option value="Producer">Producer</option>
            <option value="Composer">Composer</option>
            <option value="Lyricist">Lyricist</option>
            <option value="Mixer">Mixer</option>
            <option value="Engineer">Engineer</option>
            <option value="FeaturedArtist">Featured Artist</option>
          </select>
          <button
            @click="removeContributor(cIndex)"
            class="btn-icon"
            title="Remove contributor"
          >
            <font-awesome-icon :icon="['fas', 'times']" />
          </button>
        </div>
        
        <button
          @click="addContributor"
          class="btn btn-sm btn-secondary"
        >
          <font-awesome-icon :icon="['fas', 'plus']" /> Add Contributor
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue'

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
const previewStart = ref(30)
const previewEnd = ref(60)

// Initialize default values
onMounted(() => {
  // Set default technical specs if not present
  if (!localResource.value.codecType) {
    localResource.value.codecType = localResource.value.type === 'Video' ? 'H264' : 'PCM'
  }
  if (!localResource.value.bitRate && localResource.value.type !== 'Video') {
    localResource.value.bitRate = '1411'
  }
  if (!localResource.value.samplingRate && localResource.value.type !== 'Video') {
    localResource.value.samplingRate = '44100'
  }
  if (!localResource.value.bitsPerSample && localResource.value.type !== 'Video') {
    localResource.value.bitsPerSample = '16'
  }
  if (!localResource.value.channels && localResource.value.type !== 'Video') {
    localResource.value.channels = '2'
  }
  if (!localResource.value.aspectRatio && localResource.value.type !== 'MusicalWorkSoundRecording') {
    localResource.value.aspectRatio = '16:9'
  }
  if (!localResource.value.contributors) {
    localResource.value.contributors = []
  }
  if (!localResource.value.pLineYear) {
    localResource.value.pLineYear = new Date().getFullYear().toString()
  }
  
  // Set preview details if they exist
  if (localResource.value.previewDetails) {
    previewStart.value = localResource.value.previewDetails.startPoint || 30
    previewEnd.value = localResource.value.previewDetails.endPoint || 60
  }
})

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
  // Extract year from P-line text if present
  const pLineMatch = localResource.value.pLineText?.match(/^(\d{4})\s/)
  if (pLineMatch) {
    localResource.value.pLineYear = pLineMatch[1]
  }
  
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

const updatePreview = () => {
  if (previewStart.value || previewEnd.value) {
    localResource.value.previewDetails = {
      startPoint: previewStart.value || 0,
      endPoint: previewEnd.value || 60
    }
  }
  updateResource()
}

const addContributor = () => {
  if (!localResource.value.contributors) {
    localResource.value.contributors = []
  }
  localResource.value.contributors.push({
    name: '',
    role: 'Producer'
  })
  updateResource()
}

const removeContributor = (index) => {
  localResource.value.contributors.splice(index, 1)
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

.form-section-header {
  font-weight: var(--font-semibold);
  color: var(--color-primary);
  padding-bottom: var(--space-xs);
  border-bottom: 1px solid var(--color-border);
  margin-top: var(--space-sm);
  font-size: var(--text-sm);
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

.contributors-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.contributor-row {
  display: grid;
  grid-template-columns: 1fr 150px auto;
  gap: var(--space-sm);
  align-items: center;
}
</style>