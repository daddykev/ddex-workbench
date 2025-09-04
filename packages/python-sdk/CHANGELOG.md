# Changelog

All notable changes to the DDEX Workbench Python SDK will be documented in this file.

## [1.0.2] - 2025-09-02

### Added
- **Schematron Validation Support**: Full support for profile-specific validation using comprehensive built-in rules
  - Version-specific schematron rules for ERN 3.8.2, 4.2, and 4.3
  - All DDEX profiles supported (AudioAlbum, AudioSingle, Video, Mixed, Classical, Ringtone, DJ, ReleaseByRelease)
- **SVRL Generation**: Generate Schematron Validation Report Language (SVRL) XML reports
  - New `validate_with_svrl()` method for automatic SVRL generation
  - `generate_svrl` option in validation options
  - SVRL parsing utilities to extract statistics
- **Enhanced Validation Methods**:
  - `validate_auto()` - Automatic version detection and validation
  - `validate_batch()` - Batch process multiple XML files with concurrency control
  - `validate_file()` - Direct file validation with hash generation support
  - `validate_url()` - Validate XML directly from URLs
- **Profile Compliance Reporting**:
  - `get_profile_compliance()` - Detailed compliance reports with pass/fail rates
  - `generate_summary()` - Comprehensive validation summaries with statistics
  - Verbose mode to include successfully passed rules in responses
- **Advanced Error Analysis**:
  - `get_schematron_errors()` - Filter schematron-specific errors
  - `get_xsd_errors()` - Filter XSD schema errors
  - `get_business_rule_errors()` - Filter business rule errors
  - `get_critical_errors()` - Get only critical/fatal errors
  - `format_errors()` - Format errors with grouping and context options
- **Metadata Extraction**:
  - `detect_version()` - Auto-detect ERN version from XML content
  - `detect_profile()` - Auto-detect profile from XML content
  - `extract_metadata()` - Extract message ID, creation date, and release count
- **New Error Classes**:
  - `ParseError` - For XML parsing issues with line/column info
  - `FileError` - For file operation errors
  - `TimeoutError` - For timeout scenarios
  - `ConfigurationError` - For configuration issues
  - `APIError` - For API-specific errors with status codes
  - `NetworkError` - Enhanced with retry logic
  - `UnsupportedVersionError` - For version mismatch errors
  - `ProfileError` - For profile validation errors

### Changed
- **Enhanced Type Definitions**:
  - Added `PassedRule` type for successful validation rules
  - Added `ValidationWarning` type distinct from errors
  - Added `ValidationSummary` type for compliance statistics
  - Added `SVRLStatistics` type for SVRL report parsing
  - Added `BatchValidationResult` for batch operations
  - Extended `ValidationOptions` with new parameters
- **Client Enhancements**:
  - Added `set_api_key()` and `clear_api_key()` methods for dynamic API key management
  - Added `get_config()` to retrieve current configuration
  - Improved retry logic with exponential backoff
  - Better environment detection for User-Agent headers

### Fixed
- Improved type hints for better IDE support
- Fixed error inheritance chain for proper isinstance checks
- Enhanced request error handling with proper type guards
- Resolved circular import issues between client and validator modules

### Internal
- Refactored validation orchestration to support three-stage pipeline (XSD → Business Rules → Schematron)
- Added comprehensive docstrings for all public methods
- Improved code organization with separation of concerns

## [1.0.1] - 2025-08-21

### Fixed
- Corrected API endpoint paths to match documentation (removed `/api` prefix)
- All endpoints now correctly route through Cloudflare Worker proxy

### Removed
- Removed `validate_file()` method to simplify SDK (users can read files themselves)
- File upload functionality removed in favor of simpler content-based validation

### Changed
- Updated User-Agent version to 1.0.1

## [1.0.0] - 2025-08-10

### Added
- Initial release of DDEX Workbench Python SDK
- Support for ERN validation (versions 3.8.2, 4.2, 4.3)
- Batch processing capabilities
- Auto-detection of ERN versions
- Comprehensive error handling
- Full type hints and type safety
- Multiple report formats (JSON, CSV, text)
- CI/CD integration examples
- Rate limiting and retry logic
- API key management

[1.0.2]: https://github.com/daddykev/ddex-workbench/releases/tag/python-sdk-v1.0.2
[1.0.1]: https://github.com/daddykev/ddex-workbench/releases/tag/python-sdk-v1.0.1
[1.0.0]: https://github.com/daddykev/ddex-workbench/releases/tag/python-sdk-v1.0.0