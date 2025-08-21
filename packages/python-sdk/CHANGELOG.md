# Changelog

All notable changes to the DDEX Workbench Python SDK will be documented in this file.

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

### Features
- `DDEXClient` - Main client for API interactions
- `DDEXValidator` - High-level validation helpers
- Complete error classes for robust error handling
- Utility functions for XML processing and reporting
- Example scripts for common use cases

[1.0.1]: https://github.com/daddykev/ddex-workbench/releases/tag/python-sdk-v1.0.1
[1.0.0]: https://github.com/daddykev/ddex-workbench/releases/tag/python-sdk-v1.0.0