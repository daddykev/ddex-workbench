# Changelog

## [1.0.1] - 2025-08-21

### Fixed
- Corrected API endpoint paths to match documentation (removed `/api` prefix)
- All endpoints now correctly route through Cloudflare Worker proxy

### Removed
- Removed `validateFile()` method to simplify SDK (users can read files themselves)
- Removed form-data dependency

### Changed
- Updated User-Agent version to 1.0.1