// packages/sdk/src/types.ts
/**
 * DDEX Workbench SDK Type Definitions
 */

export interface DDEXClientConfig {
  /** API base URL */
  baseURL: string;
  /** API key for authentication */
  apiKey?: string;
  /** Request timeout in milliseconds */
  timeout: number;
  /** Environment (production, development, custom) */
  environment: 'production' | 'development' | 'custom';
  /** Maximum number of retries for failed requests */
  maxRetries: number;
  /** Delay between retries in milliseconds */
  retryDelay: number;
}

export type ERNVersion = '4.3' | '4.2' | '3.8.2';
export type ERNProfile = 
  | 'AudioAlbum' 
  | 'AudioSingle' 
  | 'Video' 
  | 'Mixed' 
  | 'Classical'
  | 'Ringtone'
  | 'DJ'
  | 'ReleaseByRelease';

export type DDEXType = 'ERN' | 'DSR';

export interface ValidationOptions {
  /** Type of DDEX document */
  type?: DDEXType;
  /** DDEX version */
  version: ERNVersion;
  /** Profile for validation */
  profile?: ERNProfile;
  /** Validation mode */
  mode?: 'full' | 'quick' | 'xsd' | 'business';
  /** Strict mode (treat warnings as errors) */
  strict?: boolean;
}

export interface ValidationErrorDetail {
  /** Line number where error occurred */
  line: number;
  /** Column number where error occurred */
  column: number;
  /** Error message */
  message: string;
  /** Error severity */
  severity: 'error' | 'warning' | 'info';
  /** Validation rule that triggered the error */
  rule: string;
  /** Context showing the error location */
  context?: string;
  /** Suggestion for fixing the error */
  suggestion?: string;
}

export interface ValidationStep {
  /** Type of validation step */
  type: 'XSD' | 'BusinessRules' | 'Schematron';
  /** Duration in milliseconds */
  duration: number;
  /** Number of errors found */
  errorCount: number;
}

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
}

export interface ValidationResult {
  /** Whether the document is valid */
  valid: boolean;
  /** List of validation errors */
  errors: ValidationErrorDetail[];
  /** List of validation warnings */
  warnings: ValidationErrorDetail[];
  /** Validation metadata */
  metadata: ValidationMetadata;
}

export interface SupportedFormats {
  /** Supported DDEX types */
  types: string[];
  /** Supported versions with profiles */
  versions: Array<{
    version: string;
    profiles: string[];
    status: 'recommended' | 'supported' | 'deprecated';
  }>;
}

export interface HealthStatus {
  /** Service status */
  status: 'healthy' | 'degraded' | 'unhealthy';
  /** Service version */
  version: string;
  /** Timestamp */
  timestamp: string;
  /** Additional details */
  details?: Record<string, any>;
}

export interface ApiKey {
  /** Key ID */
  id: string;
  /** Friendly name */
  name: string;
  /** The actual key (only shown on creation) */
  key?: string;
  /** Creation timestamp */
  created: string;
  /** Last used timestamp */
  lastUsed?: string;
  /** Request count */
  requestCount: number;
  /** Rate limit */
  rateLimit: number;
}