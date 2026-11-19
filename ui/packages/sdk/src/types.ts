// packages/sdk/src/types.ts

/**
 * DDEX Client configuration options
 */
export interface DDEXClientConfig {
  /** API base URL */
  baseURL?: string;
  /** API key for authentication */
  apiKey?: string;
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Environment (development, staging, production) */
  environment?: "development" | "staging" | "production";
  /**
   * Maximum number of retry attempts for network errors and 5xx responses
   * (default 3). 429 responses are never retried.
   */
  maxRetries?: number;
  /**
   * Base delay for retries in milliseconds (default 1000). Retries use
   * exponential backoff with jitter: about retryDelay * 2^attempt, capped at 30 s.
   */
  retryDelay?: number;
  /** Custom headers */
  headers?: Record<string, string>;
}

/**
 * Supported ERN versions
 */
export type ERNVersion = "3.8.2" | "4.2" | "4.3";

/**
 * Supported ERN profiles
 */
export type ERNProfile =
  | "AudioAlbum"
  | "AudioSingle"
  | "Video"
  | "Mixed"
  | "ReleaseByRelease"; // Only for ERN 3.8.2

/**
 * DDEX message types
 */
export type DDEXType = "ERN" | "DSR" | "RIN" | "MLC";

/**
 * Validation options
 */
export interface ValidationOptions {
  /** ERN version to validate against */
  version: ERNVersion;
  /** Optional profile for profile-specific validation */
  profile?: ERNProfile;
  /** Generate SVRL (Schematron Validation Report Language) report */
  generateSVRL?: boolean;
  /**
   * @deprecated Not supported by the API and no longer sent. The API doesn't
   * return passed rules. Will be removed in 2.0.
   */
  verbose?: boolean;
  /**
   * @deprecated Not supported by the API and no longer sent. Will be removed in 2.0.
   */
  customRules?: CustomValidationRule[];
}

/**
 * Custom validation rule
 * @deprecated Custom rules are not supported by the API. Will be removed in 2.0.
 */
export interface CustomValidationRule {
  /** Rule identifier */
  id: string;
  /** Rule description */
  description: string;
  /** XPath or JSONPath expression */
  path: string;
  /** Expected value or pattern */
  expected?: string | RegExp;
  /** Error message if rule fails */
  message: string;
  /** Severity level */
  severity?: "error" | "warning" | "info";
}

/**
 * Validation error detail
 */
export interface ValidationErrorDetail {
  /** Line number where error occurred */
  line: number;
  /** Column number where error occurred */
  column: number;
  /** Error message */
  message: string;
  /** Error severity */
  severity: "error" | "warning" | "info" | "fatal";
  /** Validation rule that failed */
  rule?: string;
  /** Context where error occurred */
  context?: string;
  /** Suggested fix */
  suggestion?: string;
  /** XPath to the error location */
  xpath?: string;
}

/**
 * Validation warning (subset of ValidationErrorDetail)
 */
export interface ValidationWarning extends ValidationErrorDetail {
  severity: "warning" | "info";
}

/**
 * Successfully passed validation rule
 */
export interface PassedRule {
  /** Rule name/identifier */
  name: string;
  /** Rule description */
  description: string;
  /** Rule severity level */
  severity: string;
  /** Context where rule was applied */
  context: string;
  /** Number of times rule passed */
  occurrences?: number;
}

/**
 * Validation step information
 */
export interface ValidationStep {
  /** Type of validation performed */
  type: "XSD" | "BusinessRules" | "Schematron" | "Custom";
  /** Duration in milliseconds */
  duration: number;
  /** Number of errors found */
  errorCount: number;
  /** Number of warnings found */
  warningCount?: number;
  /** Step status */
  status?: "passed" | "failed" | "skipped";
}

/**
 * Validation metadata
 */
export interface ValidationMetadata {
  /** Processing time in milliseconds */
  processingTime: number;
  /** Schema version used */
  schemaVersion: string;
  /** Profile used for validation */
  profile?: string;
  /** Timestamp of validation */
  validatedAt: string;
  /** Total error count */
  errorCount: number;
  /** Total warning count */
  warningCount: number;
  /** Validation steps performed */
  validationSteps: ValidationStep[];
  /** File information if applicable */
  fileInfo?: {
    name: string;
    size: number;
    hash?: string;
  };
  /** Validator version */
  validatorVersion?: string;
}

/**
 * Validation result
 */
export interface ValidationResult {
  /** Whether the document is valid */
  valid: boolean;
  /** List of validation errors */
  errors: ValidationErrorDetail[];
  /** List of validation warnings */
  warnings: ValidationWarning[];
  /** Validation metadata */
  metadata: ValidationMetadata;
  /** SVRL (Schematron Validation Report Language) XML report */
  svrl?: string;
  /**
   * Successfully passed rules.
   * @deprecated The API doesn't return passed rules; this is always undefined.
   */
  passedRules?: PassedRule[];
  /** Summary statistics */
  summary?: ValidationSummary;
}

/**
 * Validation summary statistics
 */
export interface ValidationSummary {
  /** Total number of rules checked */
  totalRules: number;
  /** Number of rules passed */
  passedRules: number;
  /** Number of rules failed */
  failedRules: number;
  /** Compliance percentage */
  complianceRate: number;
  /** Profile compliance status */
  profileCompliant?: boolean;
  /** Schema compliance status */
  schemaCompliant: boolean;
}

/**
 * API key information
 */
export interface ApiKey {
  /** Unique key identifier */
  id: string;
  /** Key name/description */
  name: string;
  /** Creation timestamp (ISO 8601) */
  created: string;
  /** Requests allowed per minute with this key */
  rateLimit: number;
  /** API key value; only returned when the key is created */
  key?: string;
  /** Last used timestamp (ISO 8601), or null if never used. Not in the create response. */
  lastUsed?: string | null;
  /** Number of requests made with this key. Not in the create response. */
  requestCount?: number;
  /** Whether the key is active (listing only returns active keys). Not in the create response. */
  active?: boolean;
  /** Owner's user ID. Not in the create response. */
  userId?: string;
}

/**
 * Supported formats response
 */
export interface SupportedFormats {
  /** Supported DDEX types */
  types: DDEXType[];
  /** Supported versions by type */
  versions: Record<DDEXType, ERNVersion[]>;
  /** Supported profiles by version */
  profiles: Record<ERNVersion, ERNProfile[]>;
  /** Feature support matrix */
  features?: Record<string, boolean>;
}

/**
 * Health check response
 */
export interface HealthStatus {
  /** Service status */
  status: "healthy" | "degraded" | "unhealthy";
  /** Response timestamp */
  timestamp: string;
  /** Service version */
  version: string;
  /** Individual service checks */
  services?: {
    api: boolean;
    validation: boolean;
    database?: boolean;
  };
  /** Response time in milliseconds */
  responseTime?: number;
}

/**
 * Batch validation options
 */
export interface BatchValidationOptions {
  /** Maximum parallel validations */
  concurrency?: number;
  /** Stop on first error */
  stopOnError?: boolean;
  /** Progress callback */
  onProgress?: (completed: number, total: number) => void;
}

/**
 * Batch validation result
 */
export interface BatchValidationResult {
  /** Total files processed */
  totalFiles: number;
  /** Number of valid files */
  validFiles: number;
  /** Number of invalid files */
  invalidFiles: number;
  /** Individual file results */
  results: Array<{
    filename: string;
    result: ValidationResult;
  }>;
  /** Total processing time */
  processingTime: number;
}

/**
 * SVRL statistics parsed from report
 */
export interface SVRLStatistics {
  /**
   * Total number of failed-assert elements (all roles). The API's SVRL
   * doesn't include successful-report elements, so passed checks aren't counted.
   */
  assertions: number;
  /** failed-assert elements with role "error" or "fatal" (or no role) */
  failures: number;
  /** failed-assert elements with role "warning" or "info" */
  warnings: number;
  /** Number of fired rules */
  firedRules: number;
  /** Profile tested */
  profile?: string;
  /** Schema version */
  schemaVersion?: string;
}

/**
 * File validation options
 */
export interface FileValidationOptions extends ValidationOptions {
  /** File encoding */
  encoding?: BufferEncoding;
  /** Include file hash in metadata */
  includeHash?: boolean;
}

/**
 * URL validation options  
 */
export interface URLValidationOptions extends ValidationOptions {
  /** Custom headers for fetching URL */
  headers?: Record<string, string>;
  /** Timeout for fetching URL */
  fetchTimeout?: number;
}