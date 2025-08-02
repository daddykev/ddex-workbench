<template>
  <div class="snippets-view">
    <!-- Hero Section -->
    <section class="hero-section bg-secondary">
      <div class="container">
        <div class="hero-content text-center">
          <h1 class="hero-title">DDEX Code Snippets</h1>
          <p class="hero-subtitle">
            Community-driven collection of DDEX patterns, examples, and solutions
          </p>
          
          <!-- Search Bar -->
          <div class="search-container mt-xl">
            <div class="search-box">
              <font-awesome-icon :icon="['fas', 'search']" class="search-icon" />
              <input 
                v-model="searchQuery"
                type="text"
                class="search-input"
                placeholder="Search snippets, tags, or descriptions..."
                @input="handleSearch"
              >
              <button 
                v-if="searchQuery"
                @click="searchQuery = ''"
                class="search-clear"
              >
                <font-awesome-icon :icon="['fas', 'times']" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Filters and Content -->
    <section class="section">
      <div class="container">
        <div class="content-grid">
          <!-- Sidebar Filters -->
          <aside class="filters-sidebar">
            <div class="filter-section">
              <h3 class="filter-title">Categories</h3>
              <div class="filter-options">
                <label 
                  v-for="category in categories" 
                  :key="category.value"
                  class="filter-option"
                >
                  <input 
                    type="radio"
                    name="category"
                    :value="category.value"
                    v-model="selectedCategory"
                    @change="filterSnippets"
                  >
                  <span>{{ category.label }}</span>
                  <span class="filter-count">{{ category.count }}</span>
                </label>
              </div>
            </div>

            <div class="filter-section">
              <h3 class="filter-title">Popular Tags</h3>
              <div class="tags-cloud">
                <button 
                  v-for="tag in popularTags" 
                  :key="tag.name"
                  @click="toggleTag(tag.name)"
                  class="tag-pill"
                  :class="{ active: selectedTags.includes(tag.name) }"
                >
                  {{ tag.name }}
                  <span class="tag-count">{{ tag.count }}</span>
                </button>
              </div>
            </div>

            <div class="filter-section">
              <h3 class="filter-title">Sort By</h3>
              <select v-model="sortBy" @change="sortSnippets" class="form-select">
                <option value="popular">Most Popular</option>
                <option value="recent">Most Recent</option>
                <option value="votes">Most Votes</option>
                <option value="views">Most Viewed</option>
              </select>
            </div>
          </aside>

          <!-- Main Content -->
          <main class="snippets-content">
            <!-- Results Header -->
            <div class="results-header flex items-center justify-between mb-lg">
              <p class="text-secondary">
                Showing {{ filteredSnippets.length }} snippets
                <span v-if="searchQuery || selectedCategory !== 'all' || selectedTags.length">
                  (filtered)
                </span>
              </p>
              <button 
                v-if="isAuthenticated"
                class="btn btn-primary btn-sm"
                @click="showCreateModal = true"
              >
                <font-awesome-icon :icon="['fas', 'plus']" class="icon-left" />
                Add Snippet
              </button>
            </div>

            <!-- Snippets List -->
            <div v-if="loading" class="loading-state">
              <font-awesome-icon :icon="['fas', 'spinner']" class="spinner-icon" spin />
              <p class="text-secondary mt-md">Loading snippets...</p>
            </div>

            <div v-else-if="filteredSnippets.length === 0" class="empty-state">
              <font-awesome-icon :icon="['fas', 'frown']" class="empty-icon" />
              <h3 class="text-xl mb-sm">No snippets found</h3>
              <p class="text-secondary">Try adjusting your filters or search query</p>
            </div>

            <div v-else class="snippets-list">
              <article 
                v-for="snippet in paginatedSnippets" 
                :key="snippet.id"
                class="snippet-card card card-hover"
              >
                <div class="snippet-header">
                  <div>
                    <h3 class="snippet-title">
                      <a @click="viewSnippet(snippet)" class="snippet-link">
                        {{ snippet.title }}
                      </a>
                    </h3>
                    <p class="snippet-meta text-sm text-secondary">
                      by <span class="font-medium">{{ snippet.author.displayName }}</span>
                      • {{ formatDate(snippet.created) }}
                      • {{ snippet.views }} views
                    </p>
                  </div>
                  <div class="snippet-category">
                    <span class="category-badge" :class="`category-${snippet.category}`">
                      {{ getCategoryLabel(snippet.category) }}
                    </span>
                  </div>
                </div>

                <p class="snippet-description">
                  {{ snippet.description }}
                </p>

                <div class="snippet-preview">
                  <pre class="code-preview"><code>{{ truncateCode(snippet.content) }}</code></pre>
                </div>

                <div class="snippet-tags">
                  <span 
                    v-for="tag in snippet.tags" 
                    :key="tag"
                    @click="toggleTag(tag)"
                    class="tag-sm"
                  >
                    {{ tag }}
                  </span>
                </div>

                <div class="snippet-footer">
                  <div class="snippet-actions">
                    <button 
                      @click="voteSnippet(snippet, 1)"
                      class="action-btn"
                      :class="{ active: snippet.userVote === 1 }"
                    >
                      <font-awesome-icon :icon="['fas', 'arrow-up']" />
                      <span>{{ snippet.votes }}</span>
                    </button>
                    
                    <button class="action-btn">
                      <font-awesome-icon :icon="['fas', 'comment']" />
                      <span>{{ snippet.commentCount }}</span>
                    </button>
                  </div>

                  <div class="snippet-buttons">
                    <button 
                      @click="copySnippet(snippet)"
                      class="btn btn-secondary btn-sm"
                    >
                      <font-awesome-icon :icon="['fas', 'copy']" class="icon-left" />
                      Copy
                    </button>
                    <button 
                      @click="openInValidator(snippet)"
                      class="btn btn-primary btn-sm"
                    >
                      Validate
                    </button>
                  </div>
                </div>
              </article>
            </div>

            <!-- Pagination -->
            <div v-if="totalPages > 1" class="pagination">
              <button 
                @click="currentPage--"
                :disabled="currentPage === 1"
                class="pagination-btn"
              >
                <font-awesome-icon :icon="['fas', 'chevron-left']" />
              </button>
              
              <div class="pagination-numbers">
                <button 
                  v-for="page in visiblePages" 
                  :key="page"
                  @click="currentPage = page"
                  class="pagination-number"
                  :class="{ active: currentPage === page }"
                  :disabled="page === '...'"
                >
                  {{ page }}
                </button>
              </div>
              
              <button 
                @click="currentPage++"
                :disabled="currentPage === totalPages"
                class="pagination-btn"
              >
                <font-awesome-icon :icon="['fas', 'chevron-right']" />
              </button>
            </div>
          </main>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
// import { getSnippets, voteSnippet as voteSnippetApi } from '@/services/api'

const router = useRouter()

// State
const searchQuery = ref('')
const selectedCategory = ref('all')
const selectedTags = ref([])
const sortBy = ref('popular')
const currentPage = ref(1)
const itemsPerPage = 10
const loading = ref(false)
const showCreateModal = ref(false)
const isAuthenticated = ref(false) // TODO: Get from auth service

// Mock data - replace with API calls
const snippets = ref([
  {
    id: '1',
    title: 'Basic ERN 4.3 Audio Album Structure',
    description: 'Complete example of a minimal ERN 4.3 message for a single audio album release',
    content: `<?xml version="1.0" encoding="UTF-8"?>
<ern:NewReleaseMessage xmlns:ern="http://ddex.net/xml/ern/43"
                       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                       MessageSchemaVersionId="ern/43"
                       LanguageAndScriptCode="en">
  <MessageHeader>
    <MessageId>MSG_12345678</MessageId>
    <MessageCreatedDateTime>2025-01-15T10:00:00Z</MessageCreatedDateTime>
  </MessageHeader>
  <!-- ... more content ... -->
</ern:NewReleaseMessage>`,
    category: 'basic',
    tags: ['ERN 4.3', 'Audio Album', 'Template'],
    author: {
      uid: 'user1',
      displayName: 'John Doe'
    },
    votes: 42,
    userVote: 0,
    commentCount: 5,
    views: 234,
    created: new Date('2025-01-10')
  },
  {
    id: '2',
    title: 'Immersive Audio (Dolby Atmos) Configuration',
    description: 'How to properly configure immersive audio tracks in ERN 4.3',
    content: `<SoundRecording>
  <SoundRecordingType>MusicalWorkSoundRecording</SoundRecordingType>
  <TechnicalDetails>
    <TechnicalResourceDetailsReference>TECH_12345</TechnicalResourceDetailsReference>
    <AudioCodecType>DolbyAtmos</AudioCodecType>
    <NumberOfChannels>7.1.4</NumberOfChannels>
    <!-- Immersive audio specific details -->
  </TechnicalDetails>
</SoundRecording>`,
    category: 'advanced',
    tags: ['ERN 4.3', 'Immersive Audio', 'Dolby Atmos', 'Technical'],
    author: {
      uid: 'user2',
      displayName: 'Jane Smith'
    },
    votes: 28,
    userVote: 1,
    commentCount: 12,
    views: 156,
    created: new Date('2025-01-12')
  }
])

const categories = ref([
  { value: 'all', label: 'All Categories', count: 47 },
  { value: 'basic', label: 'Basic Patterns', count: 15 },
  { value: 'advanced', label: 'Advanced Scenarios', count: 12 },
  { value: 'migration', label: 'Migration Guides', count: 8 },
  { value: 'technical', label: 'Technical Details', count: 12 }
])

const popularTags = ref([
  { name: 'ERN 4.3', count: 35 },
  { name: 'Audio Album', count: 24 },
  { name: 'DSR', count: 18 },
  { name: 'Migration', count: 15 },
  { name: 'Immersive Audio', count: 12 },
  { name: 'UGC', count: 10 },
  { name: 'Technical', count: 9 },
  { name: 'Template', count: 8 }
])

// Computed
const filteredSnippets = computed(() => {
  let result = [...snippets.value]
  
  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(snippet => 
      snippet.title.toLowerCase().includes(query) ||
      snippet.description.toLowerCase().includes(query) ||
      snippet.tags.some(tag => tag.toLowerCase().includes(query))
    )
  }
  
  // Filter by category
  if (selectedCategory.value !== 'all') {
    result = result.filter(snippet => snippet.category === selectedCategory.value)
  }
  
  // Filter by tags
  if (selectedTags.value.length > 0) {
    result = result.filter(snippet => 
      selectedTags.value.some(tag => snippet.tags.includes(tag))
    )
  }
  
  // Sort
  result.sort((a, b) => {
    switch (sortBy.value) {
      case 'recent':
        return b.created - a.created
      case 'votes':
        return b.votes - a.votes
      case 'views':
        return b.views - a.views
      case 'popular':
      default:
        return (b.votes + b.views) - (a.votes + a.views)
    }
  })
  
  return result
})

const totalPages = computed(() => 
  Math.ceil(filteredSnippets.value.length / itemsPerPage)
)

const paginatedSnippets = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredSnippets.value.slice(start, end)
})

const visiblePages = computed(() => {
  const pages = []
  const total = totalPages.value
  const current = currentPage.value
  
  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    if (current <= 3) {
      for (let i = 1; i <= 5; i++) {
        pages.push(i)
      }
      pages.push('...')
      pages.push(total)
    } else if (current >= total - 2) {
      pages.push(1)
      pages.push('...')
      for (let i = total - 4; i <= total; i++) {
        pages.push(i)
      }
    } else {
      pages.push(1)
      pages.push('...')
      for (let i = current - 1; i <= current + 1; i++) {
        pages.push(i)
      }
      pages.push('...')
      pages.push(total)
    }
  }
  
  return pages
})

// Methods
const handleSearch = () => {
  currentPage.value = 1
}

const filterSnippets = () => {
  currentPage.value = 1
}

const sortSnippets = () => {
  currentPage.value = 1
}

const toggleTag = (tag) => {
  const index = selectedTags.value.indexOf(tag)
  if (index > -1) {
    selectedTags.value.splice(index, 1)
  } else {
    selectedTags.value.push(tag)
  }
  filterSnippets()
}

const getCategoryLabel = (category) => {
  const cat = categories.value.find(c => c.value === category)
  return cat ? cat.label : category
}

const formatDate = (date) => {
  const days = Math.floor((new Date() - date) / (1000 * 60 * 60 * 24))
  if (days === 0) return 'today'
  if (days === 1) return 'yesterday'
  if (days < 7) return `${days} days ago`
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`
  return date.toLocaleDateString()
}

const truncateCode = (code) => {
  const lines = code.split('\n')
  if (lines.length > 8) {
    return lines.slice(0, 8).join('\n') + '\n  ...'
  }
  return code
}

const viewSnippet = (snippet) => {
  // Navigate to snippet detail page or open modal
  console.log('View snippet:', snippet.id)
}

const voteSnippet = async (snippet, vote) => {
  if (!isAuthenticated.value) {
    // Prompt to sign in
    return
  }
  
  // Toggle vote
  if (snippet.userVote === vote) {
    snippet.userVote = 0
    snippet.votes--
  } else {
    if (snippet.userVote !== 0) {
      snippet.votes -= snippet.userVote
    }
    snippet.userVote = vote
    snippet.votes += vote
  }
  
  // TODO: Call API to persist vote
}

const copySnippet = async (snippet) => {
  try {
    await navigator.clipboard.writeText(snippet.content)
    // TODO: Show success toast
  } catch (err) {
    console.error('Failed to copy:', err)
  }
}

const openInValidator = (snippet) => {
  // Navigate to validator with snippet content
  router.push({
    path: '/',
    query: { snippet: snippet.id }
  })
}

// Lifecycle
onMounted(() => {
  // TODO: Load snippets from API
})
</script>

<style scoped>
/* Hero Section */
.hero-section {
  padding: var(--space-2xl) 0;
  color: white;
  background: linear-gradient(135deg, var(--color-secondary) 0%, var(--color-secondary-hover) 100%);
}

.hero-title {
  font-size: var(--text-3xl);
  margin-bottom: var(--space-sm);
  color: white;
}

.hero-subtitle {
  font-size: var(--text-lg);
  opacity: 0.9;
  max-width: 600px;
  margin: 0 auto;
}

/* Search Box */
.search-container {
  max-width: 600px;
  margin: 0 auto;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: var(--space-md);
  color: var(--color-text-secondary);
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: var(--space-md) var(--space-xl);
  padding-left: calc(var(--space-xl) + 24px);
  font-size: var(--text-base);
  background-color: white;
  border: 2px solid transparent;
  border-radius: var(--radius-full);
  box-shadow: var(--shadow-lg);
  transition: all var(--transition-base);
  color: var(--color-text);
}

.search-input:focus {
  outline: none;
  border-color: white;
  box-shadow: var(--shadow-lg), 0 0 0 3px rgba(255, 255, 255, 0.3);
}

.search-clear {
  position: absolute;
  right: var(--space-md);
  padding: var(--space-xs);
  background: none;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: color var(--transition-base);
}

.search-clear:hover {
  color: var(--color-text);
}

/* Content Grid */
.content-grid {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: var(--space-2xl);
}

/* Filters Sidebar */
.filters-sidebar {
  position: sticky;
  top: calc(64px + var(--space-lg));
  height: fit-content;
}

.filter-section {
  margin-bottom: var(--space-2xl);
}

.filter-title {
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  margin-bottom: var(--space-md);
  color: var(--color-heading);
}

.filter-options {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.filter-option {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  transition: color var(--transition-base);
}

.filter-option:hover {
  color: var(--color-text);
}

.filter-option input[type="radio"] {
  margin-right: var(--space-sm);
}

.filter-count {
  margin-left: auto;
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
}

/* Tags Cloud */
.tags-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
}

.tag-pill {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-xs) var(--space-sm);
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--transition-base);
}

.tag-pill:hover {
  background-color: var(--color-surface);
  color: var(--color-text);
}

.tag-pill.active {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
}

.tag-count {
  font-size: var(--text-xs);
  opacity: 0.8;
}

/* Snippets List */
.snippet-card {
  padding: var(--space-lg);
  margin-bottom: var(--space-lg);
}

.snippet-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--space-md);
}

.snippet-title {
  font-size: var(--text-lg);
  margin-bottom: var(--space-xs);
}

.snippet-link {
  color: var(--color-heading);
  text-decoration: none;
  cursor: pointer;
  transition: color var(--transition-base);
}

.snippet-link:hover {
  color: var(--color-primary);
}

.snippet-meta {
  color: var(--color-text-secondary);
}

.category-badge {
  display: inline-block;
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  text-transform: uppercase;
}

.category-basic {
  background-color: var(--color-info);
  color: white;
}

.category-advanced {
  background-color: var(--color-warning);
  color: var(--color-text);
}

.category-migration {
  background-color: var(--color-secondary);
  color: white;
}

.category-technical {
  background-color: var(--color-primary);
  color: white;
}

.snippet-description {
  margin-bottom: var(--space-md);
  color: var(--color-text-secondary);
  line-height: var(--leading-relaxed);
}

.snippet-preview {
  margin-bottom: var(--space-md);
}

.code-preview {
  background-color: var(--color-bg-tertiary);
  padding: var(--space-md);
  border-radius: var(--radius-md);
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  overflow-x: auto;
}

.snippet-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
  margin-bottom: var(--space-md);
}

.tag-sm {
  display: inline-block;
  padding: var(--space-xs) var(--space-sm);
  background-color: var(--color-bg-secondary);
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--transition-base);
}

.tag-sm:hover {
  background-color: var(--color-primary-light);
  color: var(--color-primary);
}

.snippet-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: var(--space-md);
  border-top: 1px solid var(--color-border);
}

.snippet-actions {
  display: flex;
  gap: var(--space-md);
}

.action-btn {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-xs) var(--space-sm);
  background: none;
  border: none;
  color: var(--color-text-secondary);
  font-size: var(--text-sm);
  cursor: pointer;
  transition: color var(--transition-base);
}

.action-btn:hover {
  color: var(--color-text);
}

.action-btn.active {
  color: var(--color-primary);
}

.snippet-buttons {
  display: flex;
  gap: var(--space-sm);
}

/* Empty State */
.loading-state,
.empty-state {
  text-align: center;
  padding: var(--space-3xl) 0;
}

.spinner-icon {
  font-size: 48px;
  color: var(--color-primary);
}

.empty-icon {
  font-size: 64px;
  color: var(--color-text-tertiary);
  margin-bottom: var(--space-md);
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--space-sm);
  margin-top: var(--space-2xl);
}

.pagination-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text);
  cursor: pointer;
  transition: all var(--transition-base);
}

.pagination-btn:hover:not(:disabled) {
  background-color: var(--color-bg-secondary);
  border-color: var(--color-border-dark);
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-numbers {
  display: flex;
  gap: var(--space-xs);
}

.pagination-number {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 36px;
  height: 36px;
  padding: 0 var(--space-sm);
  background: none;
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  font-size: var(--text-sm);
  cursor: pointer;
  transition: all var(--transition-base);
}

.pagination-number:hover:not(:disabled) {
  background-color: var(--color-bg-secondary);
  color: var(--color-text);
}

.pagination-number.active {
  background-color: var(--color-primary);
  color: white;
}

.pagination-number:disabled {
  cursor: default;
  color: var(--color-text-tertiary);
}

/* Icons */
.icon-left {
  margin-right: var(--space-xs);
}

/* Responsive */
@media (max-width: 992px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
  
  .filters-sidebar {
    position: static;
    margin-bottom: var(--space-xl);
    padding: var(--space-lg);
    background-color: var(--color-bg-secondary);
    border-radius: var(--radius-lg);
  }
}

@media (max-width: 768px) {
  .hero-title {
    font-size: var(--text-2xl);
  }
  
  .snippet-header {
    flex-direction: column;
    gap: var(--space-sm);
  }
  
  .snippet-footer {
    flex-direction: column;
    gap: var(--space-md);
    align-items: flex-start;
  }
  
  .results-header {
    flex-direction: column;
    gap: var(--space-md);
    align-items: flex-start;
  }
}

/* Utility */
.mr-xs {
  margin-right: var(--space-xs);
}
</style>