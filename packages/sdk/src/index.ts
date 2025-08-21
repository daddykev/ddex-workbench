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
  ValidationStep,
  ValidationMetadata,
  ValidationResult,
  SupportedFormats,
  HealthStatus,
  ApiKey,
} from "./types";

// Export only the essential error classes that exist
export { DDEXError, RateLimitError } from "./errors";
