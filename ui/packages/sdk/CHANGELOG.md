# Changelog

## [1.1.0] - 2026-11-18

### Changed
- **Rate limits (429):** a 429 response now throws `RateLimitError` immediately. It is never retried automatically.
  `retryAfter` comes from the response body's `error.retryAfter`, falling back to the `Retry-After` header, then 60 seconds.
  `RateLimitError` also exposes `limit`, `remaining`, `reset` and `policy` from the standard `RateLimit-*` headers.
- **Retries:** network errors and 5xx responses are still retried (up to `maxRetries`), now with exponential backoff and
  jitter (about `retryDelay * 2^attempt`, capped at 30 s) instead of a fixed 1 s delay.
- **Client identification:** the `User-Agent` version now comes from `package.json` at build time (it said `1.1.0` while the
  package was 1.0.2). In browsers, where scripts can't set `User-Agent`, the SDK sends `X-Client` instead.
- `parseSVRL()` counts `failed-assert` elements by `role` (error/fatal vs. warning/info). The API's SVRL doesn't contain
  `successful-report` elements, so `assertions` is now the total number of failed assertions.
- Requires Node.js 22 or later (`engines.node` is `>=22`; the `npm` engine entry was removed). `@types/node` (dev only)
  is now `^22` to match.
- The `ApiKey` type now matches what the API returns: `id`, `name`, `created`, `rateLimit`, plus `key` (create
  response only) and `lastUsed`, `requestCount`, `active` and `userId` (list response only). The old `createdAt` and
  `usage` fields, which the API never sent, were removed.

### Deprecated
- `listApiKeys()`, `createApiKey()` and `revokeApiKey()`: API key management requires a signed-in session and isn't
  supported from the SDK. Manage keys at https://ddex-workbench.org/api-keys. Each method logs a one-time warning, and
  they will be removed in 2.0. They still call the API's `/keys` routes, so they work if you set an
  `Authorization: Bearer <Firebase ID token>` header yourself (e.g. via the `headers` option).
- `validator.getProfileCompliance()` and `validator.generateSummary()`: they always report 0 passed rules and a 0%
  compliance rate, because the API doesn't return passed rules. Each logs a one-time warning. They will be removed in 2.0.
- `ValidationOptions.verbose` and `ValidationOptions.customRules`: the API doesn't support them and they are no longer sent.
  They will be removed in 2.0.

### Removed
- `Classical`, `Ringtone` and `DJ` from the `ERNProfile` type (and from `detectProfile()`). The API doesn't support these
  profiles. This is a type-level removal: plain JavaScript callers can still pass the strings, and the API accepts them
  but has no rules for them, so only the version-wide checks run.

### Security
- Raised the minimum `axios` to 1.21.1 and `form-data` to 4.0.6, which fix the high-severity advisories in earlier versions.
- Updated dev dependencies with `npm audit fix`.

## [1.0.2] - 2025-09-02

> **Corrections (added 2026-11-19)**
> - The server-side rules and SVRL support this release relies on went live on the API on 2025-09-05, after the release.
> - Profile support is AudioAlbum, AudioSingle, Video and Mixed, plus ReleaseByRelease for ERN 3.8.2, not "all DDEX
>   profiles". The API has no rules for Classical, Ringtone or DJ, and 1.1.0 removed them from `ERNProfile`.
> - `validateFile()` was removed in 1.0.1 because it uploaded the file to an endpoint the API doesn't have. In 1.0.2 it
>   came back as a Node.js-only method that reads the file locally and sends its content to `/validate`.

### Added
- **Schematron Validation Support**: Full support for profile-specific validation using comprehensive built-in rules
  - Version-specific schematron rules for ERN 3.8.2, 4.2, and 4.3
  - All DDEX profiles supported (AudioAlbum, AudioSingle, Video, Mixed, Classical, Ringtone, DJ, ReleaseByRelease)
- **SVRL Generation**: Generate Schematron Validation Report Language (SVRL) XML reports
  - New `validateWithSVRL()` method for automatic SVRL generation
  - `generateSVRL` option in validation options
  - SVRL parsing utilities to extract statistics
- **Enhanced Validation Methods**:
  - `validateAuto()` - Automatic version detection and validation
  - `validateBatch()` - Batch process multiple XML files with concurrency control
  - `validateFile()` - Direct file validation with hash generation support
  - `validateURL()` - Validate XML directly from URLs
- **Profile Compliance Reporting**:
  - `getProfileCompliance()` - Detailed compliance reports with pass/fail rates
  - `generateSummary()` - Comprehensive validation summaries with statistics
  - Verbose mode to include successfully passed rules in responses
- **Advanced Error Analysis**:
  - `getSchematronErrors()` - Filter schematron-specific errors
  - `getXSDErrors()` - Filter XSD schema errors
  - `getBusinessRuleErrors()` - Filter business rule errors
  - `getCriticalErrors()` - Get only critical/fatal errors
  - `formatErrors()` - Format errors with grouping and context options
- **Metadata Extraction**:
  - `detectVersion()` - Auto-detect ERN version from XML content
  - `detectProfile()` - Auto-detect profile from XML content
  - `extractMetadata()` - Extract message ID, creation date, and release count
- **New Error Classes**:
  - `AuthenticationError` - For API key issues
  - `ValidationError` - For validation-specific errors with field details
  - `NetworkError` - For network and server errors with retry logic
  - `NotFoundError` - For missing resources
  - `ParseError` - For XML parsing issues with line/column info
  - `FileError` - For file operation errors
  - `TimeoutError` - For timeout scenarios
  - `ConfigurationError` - For configuration issues
  - `APIError` - For API-specific errors with status codes

### Changed
- **Enhanced Type Definitions**:
  - Added `PassedRule` type for successful validation rules
  - Added `ValidationWarning` type distinct from errors
  - Added `ValidationSummary` type for compliance statistics
  - Added `SVRLStatistics` type for SVRL report parsing
  - Added `BatchValidationOptions` and `BatchValidationResult` types
  - Added `FileValidationOptions` and `URLValidationOptions` types
  - Extended `ValidationOptions` with `generateSVRL`, `verbose`, and `customRules`
  - Enhanced `ValidationResult` with optional `svrl` and `passedRules` fields
- **Improved Error Handling**:
  - All errors now properly extend base `DDEXError` class
  - Added error helper methods (`getRetryMessage()`, `getSummary()`, `getLocation()`)
  - Better error context with suggestions and XPath locations
- **Client Enhancements**:
  - Added `setApiKey()` and `clearApiKey()` methods for dynamic API key management
  - Added `getConfig()` to retrieve current configuration
  - Improved retry logic with exponential backoff
  - Better environment detection for User-Agent headers

### Fixed
- Improved TypeScript type exports for better IDE support
- Fixed error prototype chain for proper instanceof checks
- Enhanced axios error handling with proper type guards

### Internal
- Refactored validation orchestration to support three-stage pipeline (XSD → Business Rules → Schematron)
- Added comprehensive JSDoc comments for all public methods
- Improved code organization with separation of concerns

## [1.0.1] - 2025-08-21

### Fixed
- Corrected API endpoint paths to match documentation (removed `/api` prefix)
- All endpoints now correctly route through Cloudflare Worker proxy

### Removed
- Removed `validateFile()` method to simplify SDK (users can read files themselves)
- Removed form-data dependency

### Changed
- Updated User-Agent version to 1.0.1

[1.1.0]: https://github.com/daddykev/ddex-workbench/compare/js-sdk-v1.0.2...js-sdk-v1.1.0
[1.0.2]: https://github.com/daddykev/ddex-workbench/compare/js-sdk-v1.0.1...js-sdk-v1.0.2
[1.0.1]: https://github.com/daddykev/ddex-workbench/tree/js-sdk-v1.0.1/packages/sdk