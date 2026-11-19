# Changelog

All notable changes to the DDEX Workbench Python SDK will be documented in this file.

## [1.1.0] - 2026-11-18

### Changed
- **Rate limits (429):** a 429 response now raises `RateLimitError` immediately. Previously urllib3 retried 429s, and
  once the retries ran out the error could surface as a `NetworkError`. `retry_after` comes from the response body's
  `error.retryAfter`, falling back to the `Retry-After` header, then 60 seconds. `limit`, `remaining`, and the new `reset`
  and `policy` attributes come from the standard `RateLimit-*` headers (the SDK used to read `X-RateLimit-*`, which the
  API doesn't send).
- **Retries:** connection errors and 5xx responses are still retried (up to `max_retries`) with exponential backoff, now
  with jitter. When retries run out, a 5xx raises `ServerError` with its status code.
- Error messages for other 4xx responses now use the API's `error.message` (they used to show the whole error object).
- Requires Python 3.10 or later (classifiers 3.10 to 3.14) and urllib3 2.x (`urllib3>=2,<3`; the SDK imports
  `urllib3.util.retry` directly).
- The `dev` extra is now the single list of development dependencies; `requirements-dev.txt` just installs `.[dev]`.

### Fixed
- Request URLs dropped the last path segment of the base URL (`urljoin(".../v1", "validate")` gave `.../validate`).
  The base URL is now always joined with a trailing slash, so requests go to `.../v1/validate`.
- `create_api_key()`, `list_api_keys()` and `delete_api_key()` called `/api-keys`, which doesn't exist. They now call
  the API's `/keys` routes. They also parse the real responses: `list_api_keys()` accepts the bare list the API returns,
  `ApiKey` is built from the API's `created` / `lastUsed` / `requestCount` / `rateLimit` fields (new `rate_limit`
  attribute), and `delete_api_key()` handles the empty 204 response. (These methods are also deprecated; see below.)

### Deprecated
- `create_api_key()`, `list_api_keys()` and `delete_api_key()`: API key management requires a signed-in session and
  isn't supported from the SDK. Manage keys at https://ddex-workbench.org/api-keys. Each method emits a one-time
  `DeprecationWarning`, and they will be removed in 2.0. They work if you set
  `client.session.headers["Authorization"] = f"Bearer {firebase_id_token}"` yourself.
- `validator.get_profile_compliance()`: the API doesn't report passed rules, so `passed_rules`, `total_rules` and
  `pass_rate` are estimated from the error count. It emits a one-time `DeprecationWarning` and will be removed in 2.0.
  Use `validate()` with a profile and the `get_*_errors()` helpers instead.
- `ValidationOptions.verbose`, `include_passed_rules`, `custom_rules` and `max_errors`: the API doesn't support them and
  they are no longer sent. The fields remain for compatibility and will be removed in 2.0.
- `ERNProfile.CLASSICAL`, `RINGTONE` and `DJ`: the API doesn't support these profiles. The members remain so existing
  code doesn't break, but passing one (or the string `"Classical"`, `"Ringtone"` or `"DJ"`) to `validate()` emits a
  `DeprecationWarning`. They will be removed in 2.0. `detect_profile()` no longer returns them.

### Removed
- The `ddex-validate` console-script entry point. It pointed to a `ddex_workbench.cli` module that doesn't exist.

## [1.0.2] - 2025-09-02

> **Corrections (added 2026-11-19)**
> - The server-side rules and SVRL support this release relies on went live on the API on 2025-09-05, after the release.
> - Profile support is AudioAlbum, AudioSingle, Video and Mixed, plus ReleaseByRelease for ERN 3.8.2, not "all DDEX
>   profiles". The API has no rules for Classical, Ringtone or DJ; 1.1.0 deprecated those `ERNProfile` members.
> - `validate_file()` was removed in 1.0.1 because it uploaded the file to `/api/validate/file`, which the API doesn't
>   have. In 1.0.2 it came back on `client.validator`, reading the file locally and sending its content to `/validate`.

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

[1.1.0]: https://github.com/daddykev/ddex-workbench/compare/python-sdk-v1.0.2...python-sdk-v1.1.0
[1.0.2]: https://github.com/daddykev/ddex-workbench/compare/python-sdk-v1.0.1...python-sdk-v1.0.2
[1.0.1]: https://github.com/daddykev/ddex-workbench/tree/python-sdk-v1.0.1/packages/python-sdk
[1.0.0]: https://pypi.org/project/ddex-workbench/1.0.0/