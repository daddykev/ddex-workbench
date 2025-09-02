// packages/sdk/src/index.ts
export { DDEXClient } from "./client";
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