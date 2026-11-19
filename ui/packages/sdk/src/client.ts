// packages/sdk/src/client.ts
import axios, { AxiosInstance, AxiosError, AxiosHeaders } from "axios";
import {
  DDEXClientConfig,
  ValidationResult,
  ValidationOptions,
  ApiKey,
  SupportedFormats,
  HealthStatus,
  BatchValidationOptions,
  BatchValidationResult,
  FileValidationOptions,
  URLValidationOptions,
} from "./types";
import {
  DDEXError,
  RateLimitError,
  AuthenticationError,
  ValidationError,
  NetworkError,
} from "./errors";
import { DDEXValidator } from "./validator";
import { warnDeprecated, KEY_MANAGEMENT_DEPRECATION } from "./deprecation";

/** SDK version, injected from package.json at build time (see tsup.config.ts). */
declare const __SDK_VERSION__: string;
export const SDK_VERSION: string =
  typeof __SDK_VERSION__ !== "undefined" ? __SDK_VERSION__ : "0.0.0-dev";

/** Upper bound for a single retry delay, in milliseconds. */
const MAX_RETRY_DELAY = 30000;

const isBrowser = (): boolean =>
  typeof window !== "undefined" && typeof document !== "undefined";

const toNumber = (value: unknown): number | undefined => {
  if (value === undefined || value === null || value === "") return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
};

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
      baseURL: config.baseURL || "https://api.ddex-workbench.org/v1",
      apiKey: config.apiKey,
      timeout: config.timeout || 30000,
      environment: config.environment || "production",
      maxRetries: config.maxRetries || 3,
      retryDelay: config.retryDelay || 1000,
      ...config,
    };

    // Browsers don't allow scripts to set User-Agent, so identify the SDK with
    // X-Client there instead.
    const clientId = `ddex-workbench-sdk/${SDK_VERSION} (${this.getEnvironment()})`;

    // Create axios instance
    this.client = axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
      headers: {
        "Content-Type": "application/json",
        ...(isBrowser() ? { "X-Client": clientId } : { "User-Agent": clientId }),
        ...this.config.headers,
      },
    });

    // Add API key if provided
    if (this.config.apiKey) {
      this.client.defaults.headers.common["X-API-Key"] = this.config.apiKey;
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
   *   profile: 'AudioAlbum',
   *   generateSVRL: true
   * });
   * ```
   */
  async validate(
    content: string,
    options: ValidationOptions,
  ): Promise<ValidationResult> {
    try {
      const response = await this.retryableRequest(() =>
        this.client.post<ValidationResult>("/validate", {
          content,
          type: "ERN",
          version: options.version,
          profile: options.profile,
          generateSVRL: options.generateSVRL,
        }),
      );

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Validate with SVRL report generation
   *
   * @param content - XML content as string
   * @param options - Validation options
   * @returns Validation result with SVRL report
   *
   * @example
   * ```typescript
   * const result = await client.validateWithSVRL(xmlContent, {
   *   version: '4.3',
   *   profile: 'AudioAlbum'
   * });
   * 
   * if (result.svrl) {
   *   console.log('SVRL report generated');
   * }
   * ```
   */
  async validateWithSVRL(
    content: string,
    options: ValidationOptions,
  ): Promise<ValidationResult> {
    return this.validate(content, {
      ...options,
      generateSVRL: true,
    });
  }

  /**
   * Validate a file
   *
   * @param filePath - Path to XML file
   * @param options - Validation options
   * @returns Validation result
   */
  async validateFile(
    filePath: string,
    options: FileValidationOptions,
  ): Promise<ValidationResult> {
    try {
      // In browser environment, this would need to be handled differently
      if (typeof window !== "undefined") {
        throw new Error("File validation is not supported in browser environment");
      }

      // Use dynamic imports for Node.js modules
      const fs = await import("fs/promises");
      const path = await import("path");
      
      const content = await fs.readFile(filePath, options.encoding || "utf-8");
      const stats = await fs.stat(filePath);
      
      const result = await this.validate(content.toString(), options);
      
      // Add file metadata
      result.metadata.fileInfo = {
        name: path.basename(filePath),
        size: stats.size,
      };
      
      if (options.includeHash) {
        const crypto = await import("crypto");
        const hash = crypto
          .createHash("sha256")
          .update(content)
          .digest("hex");
        result.metadata.fileInfo.hash = hash;
      }
      
      return result;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Validate XML from URL
   *
   * @param url - URL to fetch XML from
   * @param options - Validation options
   * @returns Validation result
   */
  async validateURL(
    url: string,
    options: URLValidationOptions,
  ): Promise<ValidationResult> {
    try {
      const response = await axios.get(url, {
        timeout: options.fetchTimeout || this.config.timeout,
        headers: options.headers,
        responseType: "text",
      });

      return this.validate(response.data, options);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Batch validate multiple XML contents
   *
   * @param items - Array of XML contents with their options
   * @param batchOptions - Batch processing options
   * @returns Batch validation results
   */
  async validateBatch(
    items: Array<{ content: string; options: ValidationOptions; filename?: string }>,
    batchOptions: BatchValidationOptions = {},
  ): Promise<BatchValidationResult> {
    const startTime = Date.now();
    const concurrency = batchOptions.concurrency || 3;
    const results: Array<{ filename: string; result: ValidationResult }> = [];
    
    let validFiles = 0;
    let completed = 0;

    // Process in chunks for concurrency control
    for (let i = 0; i < items.length; i += concurrency) {
      const chunk = items.slice(i, i + concurrency);
      
      const chunkResults = await Promise.all(
        chunk.map(async (item) => {
          try {
            const result = await this.validate(item.content, item.options);
            if (result.valid) validFiles++;
            
            completed++;
            if (batchOptions.onProgress) {
              batchOptions.onProgress(completed, items.length);
            }
            
            return {
              filename: item.filename || `file_${completed}`,
              result,
            };
          } catch (error) {
            completed++;
            if (batchOptions.onProgress) {
              batchOptions.onProgress(completed, items.length);
            }
            
            if (batchOptions.stopOnError) {
              throw error;
            }
            
            // Create error result
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            return {
              filename: item.filename || `file_${completed}`,
              result: {
                valid: false,
                errors: [{
                  line: 0,
                  column: 0,
                  message: errorMessage,
                  severity: "fatal" as const,
                }],
                warnings: [],
                metadata: {
                  processingTime: 0,
                  schemaVersion: item.options.version,
                  validatedAt: new Date().toISOString(),
                  errorCount: 1,
                  warningCount: 0,
                  validationSteps: [],
                },
              },
            };
          }
        }),
      );
      
      results.push(...chunkResults);
    }

    return {
      totalFiles: items.length,
      validFiles,
      invalidFiles: items.length - validFiles,
      results,
      processingTime: Date.now() - startTime,
    };
  }

  /**
   * Get supported formats and versions
   *
   * @returns Supported formats information
   */
  async getSupportedFormats(): Promise<SupportedFormats> {
    try {
      const response = await this.client.get<SupportedFormats>("/formats");
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Check API health status
   *
   * @returns Health status information
   */
  async checkHealth(): Promise<HealthStatus> {
    try {
      const startTime = Date.now();
      const response = await this.client.get<HealthStatus>("/health");
      
      return {
        ...response.data,
        responseTime: Date.now() - startTime,
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * List API keys (requires authentication)
   *
   * @deprecated API key management requires a signed-in session and isn't
   * supported from the SDK. Manage keys at https://ddex-workbench.org/api-keys.
   * Will be removed in 2.0. (If you set an `Authorization: Bearer <Firebase ID token>`
   * header yourself, it still works.)
   *
   * @returns List of API keys
   */
  async listApiKeys(): Promise<ApiKey[]> {
    warnDeprecated("listApiKeys()", KEY_MANAGEMENT_DEPRECATION);
    try {
      const response = await this.client.get<ApiKey[]>("/keys");
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Create a new API key (requires authentication)
   *
   * @deprecated API key management requires a signed-in session and isn't
   * supported from the SDK. Manage keys at https://ddex-workbench.org/api-keys.
   * Will be removed in 2.0. (If you set an `Authorization: Bearer <Firebase ID token>`
   * header yourself, it still works.)
   *
   * @param name - Name for the API key
   * @returns Created API key
   */
  async createApiKey(name: string): Promise<ApiKey> {
    warnDeprecated("createApiKey()", KEY_MANAGEMENT_DEPRECATION);
    try {
      const response = await this.client.post<ApiKey>("/keys", { name });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Revoke an API key (requires authentication)
   *
   * @deprecated API key management requires a signed-in session and isn't
   * supported from the SDK. Manage keys at https://ddex-workbench.org/api-keys.
   * Will be removed in 2.0. (If you set an `Authorization: Bearer <Firebase ID token>`
   * header yourself, it still works.)
   *
   * @param keyId - ID of the key to revoke
   */
  async revokeApiKey(keyId: string): Promise<void> {
    warnDeprecated("revokeApiKey()", KEY_MANAGEMENT_DEPRECATION);
    try {
      await this.client.delete(`/keys/${keyId}`);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Setup axios interceptors for retry logic
   */
  private setupInterceptors(): void {
    // Response interceptor for retry logic is handled in retryableRequest
    this.client.interceptors.response.use(
      (response) => response,
      (error) => Promise.reject(error),
    );
  }

  /**
   * Execute request with retry logic. Network errors and 5xx responses are
   * retried with exponential backoff and jitter; 429 and other 4xx responses
   * are never retried.
   */
  private async retryableRequest<T>(request: () => Promise<T>): Promise<T> {
    const maxRetries = this.config.maxRetries ?? 3;
    for (let attempt = 0; ; attempt++) {
      try {
        return await request();
      } catch (error) {
        if (attempt >= maxRetries || !this.shouldRetry(error)) {
          throw error;
        }
        await this.delay(this.getRetryDelay(attempt));
      }
    }
  }

  /**
   * Check if request should be retried
   */
  private shouldRetry(error: unknown): boolean {
    if (!axios.isAxiosError(error)) return false;

    const status = error.response?.status;
    // Retry on network errors or 5xx status codes only (never on 429)
    return !status || status >= 500;
  }

  /**
   * Backoff delay for a retry attempt (0-based): retryDelay * 2^attempt,
   * capped at 30 s, with "equal jitter" (between half and all of that value).
   */
  private getRetryDelay(attempt: number): number {
    const base = this.config.retryDelay ?? 1000;
    const exp = Math.min(MAX_RETRY_DELAY, base * 2 ** attempt);
    return exp / 2 + Math.random() * (exp / 2);
  }

  /**
   * Delay helper for retry logic
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Handle and transform axios errors
   */
  private handleError(error: unknown): Error {
    if (!axios.isAxiosError(error)) {
      return error instanceof Error ? error : new Error(String(error));
    }

    const axiosError = error as AxiosError<{
      error?: { message?: string; code?: string; retryAfter?: number };
    }>;
    const message =
      axiosError.response?.data?.error?.message ||
      axiosError.message ||
      "An unknown error occurred";

    const status = axiosError.response?.status;

    switch (status) {
      case 401:
        return new AuthenticationError(message);
      case 429: {
        // Prefer the JSON body's error.retryAfter (always readable, even
        // cross-origin), then the Retry-After header, then 60 s.
        // AxiosHeaders lookups are case-insensitive
        const headers = AxiosHeaders.from(
          (axiosError.response?.headers ?? {}) as Record<string, string>,
        );
        const header = (name: string): unknown => headers.get(name);
        const retryAfter =
          toNumber(axiosError.response?.data?.error?.retryAfter) ??
          toNumber(header("retry-after")) ??
          60;
        return new RateLimitError(message, retryAfter, {
          limit: toNumber(header("ratelimit-limit")),
          remaining: toNumber(header("ratelimit-remaining")),
          reset: toNumber(header("ratelimit-reset")),
          policy: (header("ratelimit-policy") as string | undefined) || undefined,
        });
      }
      case 422:
        return new ValidationError(message);
      case 400:
        return new ValidationError(message);
      case 404:
        return new DDEXError(`Resource not found: ${message}`);
      case 500:
      case 502:
      case 503:
      case 504:
        return new NetworkError(`Server error: ${message}`);
      default:
        if (!axiosError.response) {
          return new NetworkError(`Network error: ${message}`);
        }
        return new DDEXError(message);
    }
  }

  /**
   * Get current environment
   */
  private getEnvironment(): string {
    if (isBrowser()) {
      return `browser/${this.config.environment}`;
    }
    if (typeof process !== "undefined" && process.versions?.node) {
      return `node/${process.version}/${this.config.environment}`;
    }
    return this.config.environment || "unknown";
  }

  /**
   * Update API key
   *
   * @param apiKey - New API key
   */
  setApiKey(apiKey: string): void {
    this.config.apiKey = apiKey;
    this.client.defaults.headers.common["X-API-Key"] = apiKey;
  }

  /**
   * Remove API key
   */
  clearApiKey(): void {
    this.config.apiKey = undefined;
    delete this.client.defaults.headers.common["X-API-Key"];
  }

  /**
   * Get current configuration
   */
  getConfig(): Readonly<DDEXClientConfig> {
    return { ...this.config };
  }
}