// packages/sdk/src/client.ts
import axios, { AxiosInstance, AxiosError } from 'axios';
import { 
  DDEXClientConfig,
  ValidationResult,
  ValidationOptions,
  ApiKey,
  SupportedFormats,
  HealthStatus
} from './types';
import { 
  DDEXError,
  RateLimitError
} from './errors';
import { DDEXValidator } from './validator';

/**
 * DDEX Workbench API Client
 * 
 * @example
 * ```typescript
 * import { DDEXClient } from '@ddex-workbench/sdk';
 * 
 * const client = new DDEXClient({
 *   apiKey: 'ddex_your-api-key',
 *   environment: 'production'
 * });
 * 
 * const result = await client.validate(xmlContent, {
 *   version: '4.3',
 *   profile: 'AudioAlbum'
 * });
 * ```
 */
export class DDEXClient {
  private readonly client: AxiosInstance;
  private readonly config: DDEXClientConfig;
  public readonly validator: DDEXValidator;

  constructor(config: Partial<DDEXClientConfig> = {}) {
    this.config = {
      baseURL: config.baseURL || 'https://api.ddex-workbench.org/v1',
      apiKey: config.apiKey,
      timeout: config.timeout || 30000,
      environment: config.environment || 'production',
      maxRetries: config.maxRetries || 3,
      retryDelay: config.retryDelay || 1000,
      ...config
    };

    // Create axios instance
    this.client = axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': `ddex-workbench-sdk/1.0.0 (${this.getEnvironment()})`
      }
    });

    // Add API key if provided
    if (this.config.apiKey) {
      this.client.defaults.headers.common['X-API-Key'] = this.config.apiKey;
    }

    // Add request interceptor for retry logic
    this.setupInterceptors();

    // Create validator instance
    this.validator = new DDEXValidator(this);
  }

  /**
   * Validate DDEX XML content
   * 
   * @param content - XML content as string
   * @param options - Validation options
   * @returns Validation result with errors and metadata
   * 
   * @example
   * ```typescript
   * const result = await client.validate(xmlContent, {
   *   version: '4.3',
   *   profile: 'AudioAlbum'
   * });
   * 
   * if (!result.valid) {
   *   console.log('Validation errors:', result.errors);
   * }
   * ```
   */
  async validate(
    content: string,
    options: ValidationOptions
  ): Promise<ValidationResult> {
    try {
      const response = await this.client.post<ValidationResult>(
        '/api/validate',
        {
          content,
          type: options.type || 'ERN',
          version: options.version,
          profile: options.profile
        }
      );

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Validate DDEX XML file
   * 
   * @param file - File object or Buffer (Node.js)
   * @param options - Validation options
   * @returns Validation result
   * 
   * @example
   * ```typescript
   * // Browser
   * const file = document.getElementById('file-input').files[0];
   * const result = await client.validateFile(file, {
   *   version: '4.3',
   *   profile: 'AudioAlbum'
   * });
   * 
   * // Node.js
   * const buffer = fs.readFileSync('path/to/file.xml');
   * const result = await client.validateFile(buffer, {
   *   version: '4.3',
   *   profile: 'AudioAlbum'
   * });
   * ```
   */
  async validateFile(
    file: File | Buffer,
    options: ValidationOptions
  ): Promise<ValidationResult> {
    try {
      const formData = await this.createFormData();
      
      if (typeof window !== 'undefined' && file instanceof File) {
        // Browser environment
        formData.append('file', file);
      } else if (typeof Buffer !== 'undefined' && Buffer.isBuffer(file)) {
        // Node.js environment
        formData.append('file', file, 'document.xml');
      } else {
        throw new DDEXError('Invalid file type. Expected File or Buffer.', 'INVALID_FILE');
      }

      formData.append('type', options.type || 'ERN');
      formData.append('version', options.version);
      if (options.profile) {
        formData.append('profile', options.profile);
      }

      const response = await this.client.post<ValidationResult>(
        '/api/validate/file',
        formData,
        {
          headers: await this.getFormDataHeaders(formData)
        }
      );

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Validate XML from URL
   * 
   * @param url - URL to XML file
   * @param options - Validation options
   * @returns Validation result
   * 
   * @example
   * ```typescript
   * const result = await client.validateURL(
   *   'https://example.com/release.xml',
   *   { version: '4.3', profile: 'AudioAlbum' }
   * );
   * ```
   */
  async validateURL(
    url: string,
    options: ValidationOptions
  ): Promise<ValidationResult> {
    try {
      // Fetch XML content from URL
      const xmlResponse = await axios.get(url, {
        responseType: 'text',
        timeout: this.config.timeout
      });

      return this.validate(xmlResponse.data, options);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw new DDEXError(`XML file not found at URL: ${url}`, 'FILE_NOT_FOUND');
      }
      throw this.handleError(error);
    }
  }

  /**
   * Get supported DDEX formats and versions
   * 
   * @returns Supported formats, versions, and profiles
   * 
   * @example
   * ```typescript
   * const formats = await client.getSupportedFormats();
   * console.log('Supported versions:', formats.versions);
   * ```
   */
  async getSupportedFormats(): Promise<SupportedFormats> {
    try {
      const response = await this.client.get<SupportedFormats>('/api/formats');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Check API health status
   * 
   * @returns Health status of the API
   * 
   * @example
   * ```typescript
   * const health = await client.checkHealth();
   * if (health.status === 'healthy') {
   *   console.log('API is operational');
   * }
   * ```
   */
  async checkHealth(): Promise<HealthStatus> {
    try {
      const response = await this.client.get<HealthStatus>('/api/health');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * API Key Management (requires authentication)
   */

  /**
   * List API keys for authenticated user
   * 
   * @param authToken - Firebase auth token
   * @returns List of API keys
   */
  async listApiKeys(authToken: string): Promise<ApiKey[]> {
    try {
      const response = await this.client.get<ApiKey[]>('/api/keys', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Create new API key
   * 
   * @param name - Friendly name for the key
   * @param authToken - Firebase auth token
   * @returns New API key (only shown once)
   */
  async createApiKey(name: string, authToken: string): Promise<ApiKey> {
    try {
      const response = await this.client.post<ApiKey>(
        '/api/keys',
        { name },
        {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Revoke API key
   * 
   * @param keyId - API key ID to revoke
   * @param authToken - Firebase auth token
   */
  async revokeApiKey(keyId: string, authToken: string): Promise<void> {
    try {
      await this.client.delete(`/api/keys/${keyId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Update API key for this client instance
   * 
   * @param apiKey - New API key
   */
  setApiKey(apiKey: string): void {
    this.config.apiKey = apiKey;
    this.client.defaults.headers.common['X-API-Key'] = apiKey;
  }

  /**
   * Remove API key from this client instance
   */
  clearApiKey(): void {
    this.config.apiKey = undefined;
    delete this.client.defaults.headers.common['X-API-Key'];
  }

  /**
   * Private helper methods
   */

  private setupInterceptors(): void {
    // Response interceptor for retry logic
    this.client.interceptors.response.use(
      response => response,
      async error => {
        const config = error.config;
        
        // Check if we should retry
        if (
          !config || 
          config.__retryCount >= this.config.maxRetries ||
          !this.shouldRetry(error)
        ) {
          return Promise.reject(error);
        }

        // Increment retry count
        config.__retryCount = config.__retryCount || 0;
        config.__retryCount++;

        // Calculate delay with exponential backoff
        const delay = this.config.retryDelay * Math.pow(2, config.__retryCount - 1);

        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay));

        return this.client(config);
      }
    );
  }

  private shouldRetry(error: AxiosError): boolean {
    // Retry on network errors or 5xx status codes
    return !error.response || (error.response.status >= 500 && error.response.status < 600);
  }

  private handleError(error: any): Error {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const message = error.response?.data?.error?.message || error.message;

      if (status === 429) {
        const retryAfter = error.response?.headers['retry-after'];
        return new RateLimitError(message, retryAfter ? parseInt(retryAfter) : undefined);
      }

      return new DDEXError(message, 'API_ERROR', status, error.response?.data);
    }

    return error;
  }

  private async createFormData(): Promise<any> {
    // Use appropriate FormData implementation
    if (typeof window !== 'undefined') {
      // Browser environment
      return new window.FormData();
    } else {
      // Node.js environment - dynamic import
      try {
        const FormDataNode = (await import('form-data')).default;
        return new FormDataNode();
      } catch (e) {
        throw new DDEXError('form-data package is required for Node.js file uploads', 'MISSING_DEPENDENCY');
      }
    }
  }

  private async getFormDataHeaders(formData: any): Promise<any> {
    if (typeof window !== 'undefined') {
      // Browser - headers are set automatically
      return {};
    }
    // Node.js - need to get headers from form-data
    if (formData && typeof formData.getHeaders === 'function') {
      return formData.getHeaders();
    }
    return {};
  }

  private getEnvironment(): string {
    if (typeof window !== 'undefined') {
      return 'browser';
    }
    if (typeof process !== 'undefined' && process.versions?.node) {
      return `node/${process.version}`;
    }
    return 'unknown';
  }
}