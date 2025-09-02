// packages/sdk/src/errors.ts

/**
 * Base error class for DDEX SDK errors
 */
export class DDEXError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "DDEXError";
    Object.setPrototypeOf(this, DDEXError.prototype);
  }
}

/**
 * Rate limit error
 */
export class RateLimitError extends DDEXError {
  constructor(
    message: string,
    public readonly retryAfter: number,
  ) {
    super(message, "RATE_LIMIT_EXCEEDED");
    this.name = "RateLimitError";
    Object.setPrototypeOf(this, RateLimitError.prototype);
  }

  /**
   * Get a formatted retry message
   */
  getRetryMessage(): string {
    return `Rate limit exceeded. Please retry after ${this.retryAfter} seconds.`;
  }
}

/**
 * Authentication error
 */
export class AuthenticationError extends DDEXError {
  constructor(message: string) {
    super(message, "AUTHENTICATION_FAILED");
    this.name = "AuthenticationError";
    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }
}

/**
 * Validation error
 */
export class ValidationError extends DDEXError {
  constructor(
    message: string,
    public readonly validationErrors?: Array<{
      field?: string;
      message: string;
      code?: string;
    }>,
  ) {
    super(message, "VALIDATION_ERROR");
    this.name = "ValidationError";
    Object.setPrototypeOf(this, ValidationError.prototype);
  }

  /**
   * Get a summary of validation errors
   */
  getSummary(): string {
    if (!this.validationErrors || this.validationErrors.length === 0) {
      return this.message;
    }

    const errors = this.validationErrors
      .map((e) => (e.field ? `${e.field}: ${e.message}` : e.message))
      .join(", ");

    return `${this.message}: ${errors}`;
  }
}

/**
 * Network error
 */
export class NetworkError extends DDEXError {
  constructor(
    message: string,
    public readonly statusCode?: number,
  ) {
    super(message, "NETWORK_ERROR");
    this.name = "NetworkError";
    Object.setPrototypeOf(this, NetworkError.prototype);
  }

  /**
   * Check if error is retryable
   */
  isRetryable(): boolean {
    if (!this.statusCode) return true;
    return this.statusCode >= 500 && this.statusCode < 600;
  }
}

/**
 * Not found error
 */
export class NotFoundError extends DDEXError {
  constructor(
    message: string,
    public readonly resource?: string,
  ) {
    super(message, "NOT_FOUND");
    this.name = "NotFoundError";
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

/**
 * Configuration error
 */
export class ConfigurationError extends DDEXError {
  constructor(
    message: string,
    public readonly field?: string,
  ) {
    super(message, "CONFIGURATION_ERROR");
    this.name = "ConfigurationError";
    Object.setPrototypeOf(this, ConfigurationError.prototype);
  }
}

/**
 * Timeout error
 */
export class TimeoutError extends DDEXError {
  constructor(
    message: string,
    public readonly timeout: number,
  ) {
    super(message, "TIMEOUT");
    this.name = "TimeoutError";
    Object.setPrototypeOf(this, TimeoutError.prototype);
  }
}

/**
 * File error
 */
export class FileError extends DDEXError {
  constructor(
    message: string,
    public readonly filePath?: string,
  ) {
    super(message, "FILE_ERROR");
    this.name = "FileError";
    Object.setPrototypeOf(this, FileError.prototype);
  }
}

/**
 * Parse error for XML parsing issues
 */
export class ParseError extends DDEXError {
  constructor(
    message: string,
    public readonly line?: number,
    public readonly column?: number,
  ) {
    super(message, "PARSE_ERROR");
    this.name = "ParseError";
    Object.setPrototypeOf(this, ParseError.prototype);
  }

  /**
   * Get formatted error location
   */
  getLocation(): string {
    if (this.line !== undefined && this.column !== undefined) {
      return `Line ${this.line}, Column ${this.column}`;
    }
    if (this.line !== undefined) {
      return `Line ${this.line}`;
    }
    return "Unknown location";
  }
}

/**
 * API error wrapper for server errors
 */
export class APIError extends DDEXError {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly response?: unknown,
  ) {
    super(message, `API_ERROR_${statusCode}`);
    this.name = "APIError";
    Object.setPrototypeOf(this, APIError.prototype);
  }

  /**
   * Check if error is client error (4xx)
   */
  isClientError(): boolean {
    return this.statusCode >= 400 && this.statusCode < 500;
  }

  /**
   * Check if error is server error (5xx)
   */
  isServerError(): boolean {
    return this.statusCode >= 500 && this.statusCode < 600;
  }
}