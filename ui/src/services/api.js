// services/api.js
import axios from 'axios'
import { auth } from '../firebase'

// API configuration. VITE_API_BASE_URL (see .env.example) overrides the
// default base URL for either mode.
const API_CONFIG = {
  development: {
    // Firebase Functions emulator
    baseURL: 'http://localhost:5001/ddex-workbench/us-central1/app',
    timeout: 30000
  },
  production: {
    // Branded API domain (the Cloudflare Worker in cloudflare/worker.js)
    baseURL: 'https://api.ddex-workbench.org/v1',
    timeout: 30000
  }
}

// Get current environment config
const modeConfig = import.meta.env.DEV ? API_CONFIG.development : API_CONFIG.production
const config = {
  ...modeConfig,
  baseURL: import.meta.env.VITE_API_BASE_URL || modeConfig.baseURL
}

/**
 * Thrown when the API returns 429. `retryAfter` is the number of seconds
 * until requests are accepted again.
 */
export class RateLimitError extends Error {
  constructor(message, retryAfter) {
    super(message)
    this.name = 'RateLimitError'
    this.status = 429
    this.retryAfter = retryAfter
  }
}

// Create axios instance
const apiClient = axios.create({
  baseURL: config.baseURL,
  timeout: config.timeout,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor to add the signed-in user's ID token. /api/keys requires it;
// on validation requests it identifies the user for the higher rate limit.
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const user = auth.currentUser;
      if (user) {
        const token = await user.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.warn('Failed to get auth token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Rate limited: surface a typed error with the wait time
    if (error.response?.status === 429) {
      const headerSeconds = Number(error.response.headers?.['retry-after'])
      const bodySeconds = Number(error.response.data?.error?.retryAfter)
      const retryAfter = bodySeconds || headerSeconds || 60
      return Promise.reject(new RateLimitError(
        error.response.data?.error?.message || 'Rate limit exceeded',
        retryAfter
      ))
    }

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