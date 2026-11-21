# DDEX Workbench Python SDK

[![PyPI version](https://img.shields.io/pypi/v/ddex-workbench.svg)](https://pypi.org/project/ddex-workbench/)
[![Python versions](https://img.shields.io/pypi/pyversions/ddex-workbench.svg)](https://pypi.org/project/ddex-workbench/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Documentation](https://img.shields.io/badge/docs-website-blue.svg)](https://ddex-workbench.org/api)

Official Python SDK for [DDEX Workbench](https://ddex-workbench.org) - Open-source DDEX validation and processing tools for the music industry.

## Highlights

- **Enhanced Schematron Rules**: Comprehensive business rule validation with meaningful, actionable SVRL reports
- **SVRL Report Generation**: Generate detailed validation reports in Schematron Validation Report Language format
- **Auto-Detection**: Automatically detect ERN version and profile from XML content
- **Concurrent Batch Processing**: Validate multiple files in parallel with configurable worker pools
- **URL and File Validation**: Validate XML directly from URLs or files with optional hash generation
- **Advanced Error Filtering**: Separate and analyze errors by type (Schematron, XSD, Business Rules)
- **Profile Error Breakdown**: Count Schematron, XSD and business-rule errors for a profile
- **Metadata Extraction**: Extract message IDs, creation dates, and release counts from XML
- **Enhanced Error Classes**: Specialized error handling for parsing, files, configuration, and API errors
- **Dynamic API Keys**: Set, change or clear the API key without recreating the client

See [CHANGELOG.md](CHANGELOG.md) for full details.

## Features

- 🚀 **Simple API** - Intuitive methods for all DDEX validation operations
- 🔧 **Full Type Safety** - Type hints, dataclasses, and IDE autocomplete support
- 🌐 **Smart Networking** - Connection pooling, retry logic, and timeout handling
- 📊 **Flexible Validation** - Support for ERN 3.8.2, 3.8.3, 4.2, and 4.3 with the AudioAlbum, AudioSingle, Video and Mixed profiles (plus ReleaseByRelease for 3.8.x)
- 🎯 **Comprehensive Error Reporting** - Detailed errors with line numbers, context, and suggestions
- 📈 **Multiple Report Formats** - JSON, CSV, text, and SVRL output formats
- 🔑 **API Key Support** - Send an API key for higher rate limits
- ⚡ **High Performance** - Efficient XML processing and parallel batch operations
- 🛡️ **Robust Error Handling** - Specialized exception classes for different error scenarios
- 📦 **Zero Configuration** - Works out of the box with sensible defaults

## Installation

```bash
pip install ddex-workbench
```

For development:
```bash
pip install "ddex-workbench[dev]"
```

## Quick Start

```python
from ddex_workbench import DDEXClient

# Initialize client (API key optional for higher rate limits)
client = DDEXClient(api_key="ddex_your-api-key")

# Validate ERN XML
with open("release.xml", "r") as f:
    xml_content = f.read()

result = client.validate(xml_content, version="4.3", profile="AudioAlbum")

if result.valid:
    print("✅ Validation passed!")
else:
    print(f"❌ Found {len(result.errors)} errors:")
    for error in result.errors[:5]:
        print(f"  Line {error.line}: {error.message}")
```

## Feature Guide

### Auto-Detection and Validation

```python
# Automatically detect version and profile
result = client.validator.validate_auto(xml_content)

# Just detect without validating
version = client.validator.detect_version(xml_content)
profile = client.validator.detect_profile(xml_content)

# Extract metadata
metadata = client.validator.extract_metadata(xml_content)
print(f"Message ID: {metadata['message_id']}")
print(f"Release Count: {metadata['release_count']}")
```

### Batch Processing with Concurrency

```python
from pathlib import Path

# Validate multiple files concurrently
xml_files = list(Path("releases").glob("*.xml"))

batch_result = client.validator.validate_batch(
    files=xml_files,
    version="4.3",
    profile="AudioAlbum",
    max_workers=8  # Process 8 files concurrently
)

print(f"Validated {batch_result.total_files} files in {batch_result.processing_time:.2f}s")
print(f"Valid: {batch_result.valid_files}, Invalid: {batch_result.invalid_files}")
```

### SVRL Report Generation

```python
# Generate SVRL (Schematron Validation Report Language) report
result, svrl = client.validate_with_svrl(
    content=xml_content,
    version="4.3",
    profile="AudioAlbum"
)

if svrl:
    with open("validation-report.svrl", "w") as f:
        f.write(svrl)
    print("SVRL report saved")

# Or use validation options
from ddex_workbench import ValidationOptions

options = ValidationOptions(generate_svrl=True)

result = client.validate(xml_content, version="4.3", options=options)
```

### Profile Error Breakdown

```python
# Validate against a profile and count errors by stage
result = client.validate(xml_content, version="4.3", profile="AudioAlbum")

print(f"Schematron Errors: {len(client.validator.get_schematron_errors(result))}")
print(f"XSD Errors: {len(client.validator.get_xsd_errors(result))}")
print(f"Business Rule Errors: {len(client.validator.get_business_rule_errors(result))}")
```

> `client.validator.get_profile_compliance()` is deprecated: the API doesn't report passed rules,
> so its `passed_rules`, `total_rules` and `pass_rate` are estimates. It warns once and will be
> removed in 2.0.

### Enhanced Error Filtering and Analysis

```python
# Filter errors by type
schematron_errors = client.validator.get_schematron_errors(result)
xsd_errors = client.validator.get_xsd_errors(result)
business_errors = client.validator.get_business_rule_errors(result)
critical_errors = client.validator.get_critical_errors(xml_content, "4.3")

# Format errors with grouping
formatted = client.validator.format_errors(
    result,
    group_by_rule=True,
    include_context=True,
    max_per_group=5
)
print(formatted)

# Generate comprehensive summary
summary_text = client.validator.generate_summary(result)
print(summary_text)
```

### URL and File Validation

```python
# Validate from URL
result = client.validator.validate_url(
    url="https://example.com/release.xml",
    version="4.3",
    profile="AudioAlbum"
)

# Validate file with hash generation
result = client.validator.validate_file(
    filepath=Path("release.xml"),
    version="4.3",
    generate_hash=True  # Adds MD5 and SHA256 to metadata
)

print(f"File hash: {result.metadata['file_hash_sha256']}")
```

## Usage Examples

### Basic Validation

```python
from ddex_workbench import DDEXClient

client = DDEXClient()

# Validate with specific version
result = client.validate(xml_content, version="4.3")

# Validate with profile
result = client.validate(xml_content, version="4.3", profile="AudioAlbum")

# Check validation status
if result.valid:
    print("Validation passed!")
else:
    print(f"Errors: {len(result.errors)}")
    print(f"Warnings: {len(result.warnings)}")
```

### Advanced Validation Options

```python
from ddex_workbench import DDEXClient, ValidationOptions

client = DDEXClient()

# Configure validation options
options = ValidationOptions(
    generate_svrl=True            # Generate SVRL report
)
# verbose, include_passed_rules, custom_rules and max_errors are deprecated
# since 1.1.0: the API doesn't support them and they are no longer sent.

result = client.validate(
    content=xml_content,
    version="4.3",
    profile="AudioAlbum",
    options=options
)

if result.svrl:
    print("SVRL report generated")
```

### Getting an API key

Sign in at [ddex-workbench.org](https://ddex-workbench.org) and create a key on the
[API Keys page](https://ddex-workbench.org/api-keys). Keys are created and revoked there,
not through the SDK.

### Setting the API Key

```python
client = DDEXClient()

# Set API key dynamically
client.set_api_key("ddex_your-api-key")

# Update API key
client.set_api_key("ddex_new-api-key")

# Clear API key (use anonymous mode)
client.clear_api_key()

# Get current configuration
config = client.get_config()
print(f"Base URL: {config['base_url']}")
print(f"Timeout: {config['timeout']}s")
```

### Error Handling

```python
from ddex_workbench import (
    DDEXClient,
    DDEXError,
    RateLimitError,
    ValidationError,
    AuthenticationError,
    ParseError,
    FileError,
    NetworkError
)

client = DDEXClient()

try:
    result = client.validate(xml_content, version="4.3")
except RateLimitError as e:
    # 429s are never retried automatically. retry_after comes from the
    # response body (error.retryAfter), falling back to the Retry-After header;
    # limit / remaining / reset come from the RateLimit-* headers.
    print(f"Rate limited. Retry after {e.retry_after} seconds")
    print(e.get_retry_message())
except AuthenticationError:
    print("Invalid API key")
except ParseError as e:
    print(f"XML parsing error at {e.get_location()}: {e.message}")
except FileError as e:
    print(f"File error: {e.message}")
    if e.filepath:
        print(f"File: {e.filepath}")
except NetworkError as e:
    print(f"Network error: {e.message}")
    if e.can_retry:
        print(e.get_retry_message())
except ValidationError as e:
    print(f"Validation failed: {e.get_summary()}")
except DDEXError as e:
    print(f"DDEX error: {e}")
```

### Health Check and Status

```python
# Check API health
health = client.health()
print(f"API Status: {health.status}")
print(f"Version: {health.version}")
print(f"Timestamp: {health.timestamp}")

# Get supported formats
formats = client.formats()
print(f"Supported formats: {formats.formats}")
print(f"ERN versions: {formats.versions}")
print(f"Profiles: {formats.profiles}")
```

### Context Manager

```python
# Automatic session cleanup
with DDEXClient(api_key="ddex_key") as client:
    result = client.validate(xml_content, version="4.3")
    # Session automatically closed after block
```

## Configuration

```python
from ddex_workbench import DDEXClient

# Full configuration
client = DDEXClient(
    api_key="ddex_your-api-key",           # Optional API key
    base_url="https://api.ddex-workbench.org/v1",  # API endpoint
    timeout=30,                             # Request timeout in seconds
    max_retries=3,                          # Retries for connection errors and 5xx (never 429)
    retry_delay=1.0,                        # Backoff base: exponential, with jitter
    verify_ssl=True                         # SSL verification
)
```

## Supported Versions and Profiles

### ERN Versions
- **ERN 4.3**
- **ERN 4.2**
- **ERN 3.8.3**: accepts historical ISO 3166-3 territory codes (e.g. `YUCS`) where 3.8.2 allows only current ones
- **ERN 3.8.2**

### Profiles by Version

**ERN 4.3, 4.2, 3.8.3 and 3.8.2:**
- AudioAlbum
- AudioSingle
- Video
- Mixed

**ERN 3.8.x only (3.8.2 and 3.8.3):**
- ReleaseByRelease

`ERNProfile.CLASSICAL`, `RINGTONE` and `DJ` are deprecated: the API doesn't support these
profiles. Passing one to `validate()` emits a `DeprecationWarning`, and they will be removed in 2.0.

## Requirements

- Python 3.10+
- requests 2.28+
- urllib3 2.x

## Development

```bash
# Clone repository
git clone https://github.com/daddykev/ddex-workbench.git
cd ddex-workbench/ui/packages/python-sdk

# Install development dependencies
pip install -e ".[dev]"

# Run tests
pytest

# Run tests with coverage
pytest --cov=ddex_workbench --cov-report=html

# Run linting
flake8 ddex_workbench
black --check ddex_workbench
mypy ddex_workbench

# Format code
black ddex_workbench
isort ddex_workbench
```

## CI/CD Integration

```python
# example_ci.py
from ddex_workbench import DDEXClient
from pathlib import Path
import sys

client = DDEXClient()

# Validate all releases
releases = Path("releases").glob("*.xml")
all_valid = True

for release_file in releases:
    result = client.validator.validate_file(release_file, version="4.3")
    
    if not result.valid:
        all_valid = False
        print(f"❌ {release_file.name}: {len(result.errors)} errors")
        
        # Show first 3 errors
        for error in result.errors[:3]:
            print(f"  Line {error.line}: {error.message}")
    else:
        print(f"✅ {release_file.name}: Valid")

# Exit with appropriate code
sys.exit(0 if all_valid else 1)
```

## Testing

```bash
# Run all tests
pytest

# Run specific test file
pytest tests/test_client.py

# Run integration tests (against the live API)
DDEX_INTEGRATION_TEST=true pytest tests/test_integration.py

# Run with coverage
pytest --cov=ddex_workbench --cov-report=html
```

## Documentation

- 🌐 [API Reference](https://ddex-workbench.org/api)
- 📖 [DDEX Standards](https://kb.ddex.net)

## Contributing

We welcome contributions! Please see our [Contributing Guide](https://github.com/daddykev/ddex-workbench/blob/main/CONTRIBUTING.md) for details.

### Quick Start for Contributors
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes with tests
4. Run the test suite (`pytest`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## Support

- 💬 [GitHub Issues](https://github.com/daddykev/ddex-workbench/issues) - Bug reports and feature requests
- 📧 [Email](mailto:daddykev@gmail.com) - Direct support
- 🌐 [Website](https://ddex-workbench.org) - Web application
- 📚 [API Reference](https://ddex-workbench.org/api) - Endpoints, rate limits and code samples

## License

MIT License - see [LICENSE](LICENSE) for details.

## Related Projects

- [DDEX Workbench Web App](https://ddex-workbench.org) - Web-based validation interface
- [@ddex-workbench/sdk](https://www.npmjs.com/package/@ddex-workbench/sdk) - JavaScript/TypeScript SDK
- [DDEX Knowledge Base](https://kb.ddex.net) - Official DDEX documentation

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a detailed version history.

### Recent Updates (v1.1.0)
- Rate limits: a 429 raises `RateLimitError` immediately (no automatic retry), with `retry_after` from the response body and `limit` / `remaining` / `reset` from the `RateLimit-*` headers
- Connection errors and 5xx responses are retried with exponential backoff and jitter
- Fixed request URLs dropping the `/v1` path segment of the base URL
- `verbose`, `include_passed_rules`, `custom_rules` and `max_errors` are deprecated and no longer sent
- Requires Python 3.10+ and urllib3 2.x
- Removed the unused `ddex-validate` console-script entry point
- API key management methods (`create_api_key()`, `list_api_keys()`, `delete_api_key()`) are deprecated; manage keys at https://ddex-workbench.org/api-keys
- `get_profile_compliance()` is deprecated (its pass rate is estimated)
- The `Classical`, `Ringtone` and `DJ` profiles are deprecated (the API doesn't support them)

## Acknowledgments

Built with ❤️ for the music industry by the DDEX Workbench team.

Special thanks to:
- The DDEX organization for maintaining industry standards
- The music technology community for feedback and support
- All contributors who help make DDEX more accessible

---

**DDEX Workbench** - Making DDEX validation simple, fast, and reliable.