# Changelog

## [1.0.2] - 2025-09-02

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