// packages/sdk/src/errors.ts
/**
 * Custom error types for DDEX Workbench SDK
 */

/**
 * Base error class for all DDEX SDK errors
 */
export class DDEXError extends Error {
  public readonly code: string;
  public readonly statusCode?: number;
  public readonly details?: any;

  constructor(
    message: string,
    code: string = 'DDEX_ERROR',
    statusCode?: number,
    details?: any
  ) {
    super(message);
    this.name = 'DDEXError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    
    // Maintains proper stack trace for where error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * Rate limit exceeded error
 */
export class RateLimitError extends DDEXError {
  public readonly retryAfter?: number;

  constructor(
    message: string = 'Rate limit exceeded',
    retryAfter?: number
  ) {
    super(message, 'RATE_LIMIT_EXCEEDED', 429);
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
  }

  /**
   * Get human-readable retry message
   */
  getRetryMessage(): string {
    if (this.retryAfter) {
      return `Please retry after ${this.retryAfter} seconds`;
    }
    return 'Please retry later';
  }
}