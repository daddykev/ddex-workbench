<template>
  <div class="not-found-page">
    <div class="container">
      <div class="not-found-content">
        <!-- Illustration -->
        <div class="illustration">
          <svg width="300" height="300" viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
            <!-- Background circle -->
            <circle cx="150" cy="150" r="140" fill="var(--color-bg-secondary)" stroke="var(--color-border)" stroke-width="2"/>
            
            <!-- 404 text -->
            <text x="150" y="130" text-anchor="middle" fill="var(--color-primary)" font-size="72" font-weight="700" font-family="var(--font-sans)">404</text>
            
            <!-- XML brackets -->
            <path d="M80 160 L60 180 L80 200" stroke="var(--color-text-tertiary)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M220 160 L240 180 L220 200" stroke="var(--color-text-tertiary)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
            
            <!-- Error icon -->
            <circle cx="150" cy="180" r="8" fill="var(--color-error)"/>
            <path d="M150 174 L150 182 M150 186 L150 186.5" stroke="white" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>

        <!-- Error Message -->
        <div class="error-content text-center">
          <h1 class="error-title">Page Not Found</h1>
          <p class="error-subtitle">
            Looks like this DDEX element doesn't exist in our schema
          </p>
          
          <div class="error-details">
            <div class="code-snippet">
              <pre><code>&lt;Error&gt;
  &lt;Code&gt;404&lt;/Code&gt;
  &lt;Message&gt;The requested page "{{ $route.path }}" was not found&lt;/Message&gt;
  &lt;Suggestion&gt;Check the URL or try one of the links below&lt;/Suggestion&gt;
&lt;/Error&gt;</code></pre>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="action-buttons">
            <router-link to="/" class="btn btn-primary">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" class="mr-xs">
                <path d="M8 1l-6 6.5h2v7a.5.5 0 00.5.5h3a.5.5 0 00.5-.5v-4h2v4a.5.5 0 00.5.5h3a.5.5 0 00.5-.5v-7h2L8 1z"/>
              </svg>
              Go to Validator
            </router-link>
            <button @click="goBack" class="btn btn-secondary">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" class="mr-xs">
                <path d="M11.354 1.646a.5.5 0 010 .708L5.707 8l5.647 5.646a.5.5 0 01-.708.708l-6-6a.5.5 0 010-.708l6-6a.5.5 0 01.708 0z"/>
              </svg>
              Go Back
            </button>
          </div>

          <!-- Helpful Links -->
          <div class="helpful-links">
            <h3>Helpful Links</h3>
            <div class="links-grid">
              <router-link to="/" class="link-card">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="var(--color-primary)">
                  <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/>
                </svg>
                <div>
                  <h4>DDEX Validator</h4>
                  <p>Validate your ERN 4.3 files</p>
                </div>
              </router-link>
              
              <router-link to="/snippets" class="link-card">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="var(--color-secondary)">
                  <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/>
                </svg>
                <div>
                  <h4>Code Snippets</h4>
                  <p>Browse DDEX examples</p>
                </div>
              </router-link>
              
              <router-link to="/api" class="link-card">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="var(--color-info)">
                  <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6z"/>
                </svg>
                <div>
                  <h4>API Documentation</h4>
                  <p>Learn about our API</p>
                </div>
              </router-link>
              
              <a href="https://kb.ddex.net" target="_blank" rel="noopener" class="link-card">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="var(--color-warning)">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/>
                </svg>
                <div>
                  <h4>DDEX Knowledge Base</h4>
                  <p>Official DDEX resources</p>
                </div>
              </a>
            </div>
          </div>

          <!-- Search Suggestion -->
          <div class="search-suggestion">
            <p class="text-secondary">Looking for something specific?</p>
            <div class="search-box-mini">
              <input 
                v-model="searchQuery"
                @keyup.enter="performSearch"
                type="text" 
                placeholder="Search snippets or documentation..."
                class="search-input-mini"
              >
              <button @click="performSearch" class="search-btn-mini">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M11.742 10.344a6.5 6.5 0 10-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 001.415-1.414l-3.85-3.85a1.007 1.007 0 00-.115-.1zM12 6.5a5.5 5.5 0 11-11 0 5.5 5.5 0 0111 0z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const searchQuery = ref('')

const goBack = () => {
  if (window.history.length > 1) {
    router.go(-1)
  } else {
    router.push('/')
  }
}

const performSearch = () => {
  if (searchQuery.value.trim()) {
    router.push({
      path: '/snippets',
      query: { search: searchQuery.value.trim() }
    })
  }
}
</script>

<style scoped>
.not-found-page {
  min-height: calc(100vh - 64px);
  display: flex;
  align-items: center;
  padding: var(--space-2xl) 0;
}

.not-found-content {
  max-width: 800px;
  margin: 0 auto;
}

.illustration {
  display: flex;
  justify-content: center;
  margin-bottom: var(--space-2xl);
}

.error-title {
  font-size: var(--text-3xl);
  margin-bottom: var(--space-sm);
  color: var(--color-heading);
}

.error-subtitle {
  font-size: var(--text-lg);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-xl);
}

.code-snippet {
  background-color: var(--color-bg-tertiary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-lg);
  margin-bottom: var(--space-2xl);
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.code-snippet code {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  color: var(--color-text);
  line-height: 1.5;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: var(--space-md);
  margin-bottom: var(--space-3xl);
}

.helpful-links {
  margin-bottom: var(--space-2xl);
}

.helpful-links h3 {
  font-size: var(--text-lg);
  margin-bottom: var(--space-lg);
  text-align: center;
  color: var(--color-heading);
}

.links-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: var(--space-md);
  max-width: 600px;
  margin: 0 auto;
}

.link-card {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-md);
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  text-decoration: none;
  transition: all var(--transition-base);
}

.link-card:hover {
  border-color: var(--color-border-dark);
  box-shadow: var(--shadow-sm);
  transform: translateY(-2px);
}

.link-card h4 {
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  color: var(--color-heading);
  margin-bottom: var(--space-xs);
}

.link-card p {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  margin: 0;
}

.search-suggestion {
  text-align: center;
  padding-top: var(--space-xl);
  border-top: 1px solid var(--color-border);
}

.search-box-mini {
  display: flex;
  max-width: 400px;
  margin: var(--space-md) auto 0;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.search-input-mini {
  flex: 1;
  padding: var(--space-sm) var(--space-md);
  border: none;
  background-color: var(--color-surface);
  font-size: var(--text-base);
  color: var(--color-text);
}

.search-input-mini:focus {
  outline: none;
}

.search-btn-mini {
  padding: 0 var(--space-md);
  background-color: var(--color-primary);
  border: none;
  color: white;
  cursor: pointer;
  transition: background-color var(--transition-base);
}

.search-btn-mini:hover {
  background-color: var(--color-primary-hover);
}

/* Utility */
.mr-xs {
  margin-right: var(--space-xs);
}

/* Responsive */
@media (max-width: 768px) {
  .not-found-page {
    padding: var(--space-xl) 0;
  }
  
  .illustration svg {
    width: 200px;
    height: 200px;
  }
  
  .error-title {
    font-size: var(--text-2xl);
  }
  
  .error-subtitle {
    font-size: var(--text-base);
  }
  
  .code-snippet {
    padding: var(--space-md);
    font-size: var(--text-xs);
  }
  
  .action-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .links-grid {
    grid-template-columns: 1fr;
  }
}
</style>