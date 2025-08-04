// services/api.js
import axios from 'axios'
import { auth } from '../firebase'

// API configuration
const API_CONFIG = {
  development: {
    // Still use Firebase Functions directly in development
    baseURL: 'http://localhost:5001/ddex-workbench/us-central1/app',
    timeout: 30000
  },
  production: {
    // Use the branded API domain in production
    baseURL: 'https://api.ddex-workbench.org/v1',
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
      // Only add auth token for endpoints that require it
      const authRequiredEndpoints = [
        '/api/keys',
        '/api/validations/history',
        '/api/validations/*/export'
      ];
      
      const requiresAuth = authRequiredEndpoints.some(endpoint => 
        config.url.includes(endpoint)
      );
      
      if (requiresAuth) {
        const user = auth.currentUser;
        if (user) {
          const token = await user.getIdToken();
          config.headers.Authorization = `Bearer ${token}`;
        }
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