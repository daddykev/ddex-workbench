import axios from 'axios'
import { auth } from '../firebase'

// API configuration
const API_CONFIG = {
  development: {
    baseURL: 'http://localhost:5001/your-project-id/us-central1',
    timeout: 30000
  },
  production: {
    baseURL: import.meta.env.VITE_API_BASE_URL || 'https://us-central1-your-project-id.cloudfunctions.net',
    timeout: 30000
  }
}

// Get current environment config
const config = import.meta.env.DEV ? API_CONFIG.development : API_CONFIG.production

// Create axios instance
const apiClient = axios.create({
  baseURL: config.baseURL,
  timeout: config.timeout,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  async (config) => {
    try {
      // Get current user token if authenticated
      const user = auth.currentUser
      if (user) {
        const token = await user.getIdToken()
        config.headers.Authorization = `Bearer ${token}`
      }
    } catch (error) {
      console.warn('Failed to get auth token:', error)
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Extract meaningful error message
    const errorMessage = error.response?.data?.error?.message || 
                        error.response?.data?.message || 
                        error.message || 
                        'An unexpected error occurred'
    
    // Create enhanced error object
    const enhancedError = new Error(errorMessage)
    enhancedError.status = error.response?.status
    enhancedError.code = error.response?.data?.error?.code
    enhancedError.details = error.response?.data?.error?.details
    
    // Log errors in development
    if (import.meta.env.DEV) {
      console.error('API Error:', {
        message: errorMessage,
        status: error.response?.status,
        endpoint: error.config?.url,
        method: error.config?.method,
        data: error.response?.data
      })
    }
    
    return Promise.reject(enhancedError)
  }
)

/**
 * Validation API
 */

/**
 * Validate DDEX XML content
 * @param {Object} payload
 * @param {string} payload.content - XML content to validate
 * @param {string} payload.type - Type of DDEX document (e.g., 'ERN')
 * @param {string} payload.version - DDEX version (e.g., '4.3')
 * @param {string} payload.profile - DDEX profile (e.g., 'AudioAlbum')
 * @returns {Promise<ValidationResult>}
 */
export const validateERN = async (payload) => {
  const response = await apiClient.post('/api/validate', payload)
  return response.data
}

/**
 * Validate DDEX XML file
 * @param {File} file - XML file to validate
 * @param {Object} options
 * @param {string} options.type - Type of DDEX document
 * @param {string} options.version - DDEX version
 * @param {string} options.profile - DDEX profile
 * @returns {Promise<ValidationResult>}
 */
export const validateFile = async (file, options) => {
  // For files larger than 1MB, show a warning
  if (file.size > 1024 * 1024) {
    console.warn('Large file detected. Upload may take longer.')
  }
  
  const formData = new FormData()
  formData.append('file', file)
  formData.append('type', options.type)
  formData.append('version', options.version)
  formData.append('profile', options.profile)
  
  const response = await apiClient.post('/api/validate/file', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
  
  return response.data
}

/**
 * Get validation history for authenticated user
 * @param {Object} params
 * @param {number} params.limit - Number of records to fetch
 * @param {string} params.startAfter - Cursor for pagination
 * @returns {Promise<ValidationHistoryResponse>}
 */
export const getValidationHistory = async (params = {}) => {
  const response = await apiClient.get('/api/validations/history', { params })
  return response.data
}

/**
 * Snippets API
 */

/**
 * Get snippets with filtering and pagination
 * @param {Object} params
 * @param {string} params.category - Filter by category
 * @param {string[]} params.tags - Filter by tags
 * @param {string} params.search - Search query
 * @param {string} params.sort - Sort order (votes, recent)
 * @param {number} params.limit - Number of results
 * @param {string} params.startAfter - Cursor for pagination
 * @returns {Promise<SnippetsResponse>}
 */
export const getSnippets = async (params = {}) => {
  const response = await apiClient.get('/api/snippets', { params })
  return response.data
}

/**
 * Get single snippet by ID
 * @param {string} snippetId
 * @returns {Promise<Snippet>}
 */
export const getSnippet = async (snippetId) => {
  const response = await apiClient.get(`/api/snippets/${snippetId}`)
  return response.data
}

/**
 * Create new snippet (requires authentication)
 * @param {Object} snippet
 * @param {string} snippet.title
 * @param {string} snippet.description
 * @param {string} snippet.content
 * @param {string} snippet.category
 * @param {string[]} snippet.tags
 * @returns {Promise<Snippet>}
 */
export const createSnippet = async (snippet) => {
  const response = await apiClient.post('/api/snippets', snippet)
  return response.data
}

/**
 * Update snippet (requires authentication and ownership)
 * @param {string} snippetId
 * @param {Object} updates
 * @returns {Promise<Snippet>}
 */
export const updateSnippet = async (snippetId, updates) => {
  const response = await apiClient.patch(`/api/snippets/${snippetId}`, updates)
  return response.data
}

/**
 * Delete snippet (requires authentication and ownership)
 * @param {string} snippetId
 * @returns {Promise<void>}
 */
export const deleteSnippet = async (snippetId) => {
  await apiClient.delete(`/api/snippets/${snippetId}`)
}

/**
 * Vote on snippet (requires authentication)
 * @param {string} snippetId
 * @param {number} vote - 1 for upvote, -1 for downvote, 0 to remove vote
 * @returns {Promise<VoteResult>}
 */
export const voteSnippet = async (snippetId, vote) => {
  const response = await apiClient.post(`/api/snippets/${snippetId}/vote`, { vote })
  return response.data
}

/**
 * Comment on snippet (requires authentication)
 * @param {string} snippetId
 * @param {string} content
 * @returns {Promise<Comment>}
 */
export const addComment = async (snippetId, content) => {
  const response = await apiClient.post(`/api/snippets/${snippetId}/comments`, { content })
  return response.data
}

/**
 * API Keys Management
 */

/**
 * Get user's API keys
 * @returns {Promise<ApiKey[]>}
 */
export const getApiKeys = async () => {
  const response = await apiClient.get('/api/keys')
  return response.data
}

/**
 * Create new API key
 * @param {Object} options
 * @param {string} options.name - Friendly name for the key
 * @param {number} options.rateLimit - Custom rate limit (if allowed)
 * @returns {Promise<ApiKey>}
 */
export const createApiKey = async (options = {}) => {
  const response = await apiClient.post('/api/keys', options)
  return response.data
}

/**
 * Revoke API key
 * @param {string} keyId
 * @returns {Promise<void>}
 */
export const revokeApiKey = async (keyId) => {
  await apiClient.delete(`/api/keys/${keyId}`)
}

/**
 * Utility Functions
 */

/**
 * Check API health status
 * @returns {Promise<HealthStatus>}
 */
export const checkHealth = async () => {
  const response = await apiClient.get('/api/health')
  return response.data
}

/**
 * Get supported DDEX versions and profiles
 * @returns {Promise<SupportedFormats>}
 */
export const getSupportedFormats = async () => {
  const response = await apiClient.get('/api/formats')
  return response.data
}

/**
 * Export validation report
 * @param {string} validationId
 * @param {string} format - 'pdf' or 'json'
 * @returns {Promise<Blob>}
 */
export const exportValidationReport = async (validationId, format = 'pdf') => {
  const response = await apiClient.get(`/api/validations/${validationId}/export`, {
    params: { format },
    responseType: 'blob'
  })
  
  return response.data
}

/**
 * Type Definitions (for reference)
 */

// ValidationResult type
// {
//   valid: boolean,
//   errors: Array<{
//     line: number,
//     column: number,
//     message: string,
//     severity: 'error' | 'warning',
//     rule: string,
//     context?: string
//   }>,
//   metadata: {
//     processingTime: number,
//     schemaVersion: string,
//     validatedAt: string
//   }
// }

// Snippet type
// {
//   id: string,
//   title: string,
//   description: string,
//   content: string,
//   category: string,
//   tags: string[],
//   author: {
//     uid: string,
//     displayName: string
//   },
//   votes: number,
//   userVote?: number,
//   commentCount: number,
//   created: string,
//   updated: string
// }

// ApiKey type
// {
//   id: string,
//   name: string,
//   key: string, // Only shown on creation
//   created: string,
//   lastUsed: string,
//   requestCount: number,
//   rateLimit: number
// }

export default apiClient