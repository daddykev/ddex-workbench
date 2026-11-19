// packages/sdk/src/index.ts
export { DDEXClient, SDK_VERSION } from "./client";
export { DDEXValidator } from "./validator";

// Export all types
export type {
  DDEXClientConfig,
  ERNVersion,
  ERNProfile,
  DDEXType,
  ValidationOptions,
  ValidationErrorDetail,
  ValidationWarning,
  PassedRule,
  ValidationStep,
  ValidationMetadata,
  ValidationResult,
  ValidationSummary,
  SupportedFormats,
  HealthStatus,
  ApiKey,
  CustomValidationRule,
  BatchValidationOptions,
  BatchValidationResult,
  SVRLStatistics,
  FileValidationOptions,
  URLValidationOptions,
} from "./types";
export type { RateLimitInfo } from "./errors";

// Export all error classes
export {
  DDEXError,
  RateLimitError,
  AuthenticationError,
  ValidationError,
  NetworkError,
  NotFoundError,
  ConfigurationError,
  TimeoutError,
  FileError,
  ParseError,
  APIError,
} from "./errors";