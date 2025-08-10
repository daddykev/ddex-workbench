# DDEX Workbench Python SDK

[![PyPI version](https://img.shields.io/pypi/v/ddex-workbench.svg)](https://pypi.org/project/ddex-workbench/)
[![Python versions](https://img.shields.io/pypi/pyversions/ddex-workbench.svg)](https://pypi.org/project/ddex-workbench/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Documentation](https://img.shields.io/badge/docs-latest-blue.svg)](https://ddex-workbench.org/docs)

Official Python SDK for [DDEX Workbench](https://ddex-workbench.org) - Open-source DDEX validation and processing tools for the music industry.

## Features

- 🚀 **Simple API** - Intuitive methods for all DDEX operations
- 🔧 **Type Safety** - Full type hints and dataclass models
- 🌐 **Async Support** - Built-in connection pooling and retry logic
- 📊 **Batch Processing** - Validate multiple files efficiently
- 🎯 **Auto-detection** - Automatic ERN version detection
- 📈 **Detailed Reports** - Comprehensive validation reports in multiple formats
- 🔑 **API Key Management** - Built-in authentication handling

## Installation

```bash
pip install ddex-workbench
```

For development:
```bash
pip install ddex-workbench[dev]
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

## Usage Examples

### Basic Validation

```python
from ddex_workbench import DDEXClient

client = DDEXClient()

# Validate with specific version
result = client.validate(xml_content, version="4.3")

# Validate with profile
result = client.validate(xml_content, version="4.3", profile="AudioAlbum")

# Validate file directly
result = client.validate_file("path/to/release.xml", version="4.3")

# Validate from URL
result = client.validate_url("https://example.com/release.xml", version="4.3")
```

### Auto-detect Version

```python
# Automatically detect ERN version
result = client.validator.validate_auto(xml_content)
print(f"Detected version: {result.metadata.schema_version}")
```

### Batch Processing

```python
from pathlib import Path

# Validate all XML files in a directory
xml_files = Path("releases").glob("*.xml")

for xml_file in xml_files:
    result = client.validate_file(xml_file, version="4.3")
    status = "✅ Valid" if result.valid else f"❌ {len(result.errors)} errors"
    print(f"{xml_file.name}: {status}")
```

### Parallel Batch Validation

```python
# Validate multiple files in parallel
items = [
    (xml1_content, "4.3", "AudioAlbum"),
    (xml2_content, "4.3", "AudioSingle"),
    (xml3_content, "4.2", None)
]

results = client.validator.validate_batch(items, max_workers=5)

for i, result in enumerate(results):
    print(f"File {i+1}: {'Valid' if result.valid else 'Invalid'}")
```

### Directory Validation

```python
from pathlib import Path

# Validate entire directory
results = client.validator.validate_directory(
    Path("releases"),
    version="4.3",
    pattern="*.xml",
    recursive=True
)

# Generate summary
valid_count = sum(1 for r in results.values() if r.valid)
print(f"Valid: {valid_count}/{len(results)}")
```

### Error Analysis

```python
# Group errors by severity
errors_by_severity = result.get_errors_by_severity()
for severity, errors in errors_by_severity.items():
    print(f"{severity}: {len(errors)} errors")

# Group errors by line
errors_by_line = result.get_errors_by_line()
for line, errors in errors_by_line.items():
    print(f"Line {line}: {len(errors)} errors")

# Filter specific errors
from ddex_workbench.utils import filter_errors

critical_errors = filter_errors(
    result.errors,
    severity="error",
    rule_pattern="ERN.*"
)
```

### Generate Reports

```python
from ddex_workbench.utils import format_validation_report

# Text report
text_report = format_validation_report(result, format_type="text")
print(text_report)

# JSON report
json_report = format_validation_report(result, format_type="json")
with open("report.json", "w") as f:
    f.write(json_report)

# CSV report
csv_report = format_validation_report(result, format_type="csv")
with open("report.csv", "w") as f:
    f.write(csv_report)
```

### API Key Management

```python
# For authenticated endpoints (requires Firebase auth token)
auth_token = "your_firebase_auth_token"

# List API keys
keys = client.list_api_keys(auth_token)
for key in keys:
    print(f"{key.name}: {key.request_count} requests")

# Create new API key
new_key = client.create_api_key("Production Key", auth_token)
print(f"New API key: {new_key.key}")  # Save this! Only shown once

# Revoke API key
client.revoke_api_key(key_id, auth_token)
```

### Utility Functions

```python
from ddex_workbench.utils import (
    detect_ern_version,
    extract_message_id,
    calculate_file_hash,
    create_summary_statistics
)

# Detect version
version = detect_ern_version(xml_content)
print(f"Detected version: {version}")

# Extract message ID
message_id = extract_message_id(xml_content)
print(f"Message ID: {message_id}")

# Calculate file hash
file_hash = calculate_file_hash(Path("release.xml"))
print(f"SHA256: {file_hash}")

# Create summary statistics
results = [result1, result2, result3]
stats = create_summary_statistics(results)
print(f"Validity rate: {stats['validity_rate']:.1f}%")
```

## Command Line Interface

```bash
# Validate a file
ddex-validate release.xml --version 4.3 --profile AudioAlbum

# Validate directory
ddex-validate releases/ --version 4.3 --recursive

# Auto-detect version
ddex-validate release.xml --auto

# Generate report
ddex-validate release.xml --version 4.3 --report report.json --format json
```

## Configuration

```python
from ddex_workbench import DDEXClient

# Full configuration
client = DDEXClient(
    api_key="ddex_your-api-key",           # Optional API key
    base_url="https://api.ddex-workbench.org/v1",  # API endpoint
    timeout=30,                             # Request timeout in seconds
    max_retries=3,                          # Max retry attempts
    retry_delay=1.0,                        # Initial retry delay
    verify_ssl=True                         # SSL verification
)

# Update API key
client.set_api_key("new_api_key")

# Remove API key
client.clear_api_key()
```

## Error Handling

```python
from ddex_workbench.errors import (
    DDEXError,
    RateLimitError,
    ValidationError,
    AuthenticationError,
    NotFoundError
)

try:
    result = client.validate(xml_content, version="4.3")
except RateLimitError as e:
    print(f"Rate limited. Retry after {e.retry_after} seconds")
    print(e.get_retry_message())
except AuthenticationError:
    print("Invalid API key")
except ValidationError as e:
    print(f"Validation error: {e.get_summary()}")
except DDEXError as e:
    print(f"DDEX error: {e}")
```

## Advanced Features

### Context Manager

```python
# Automatic session cleanup
with DDEXClient(api_key="ddex_key") as client:
    result = client.validate(xml_content, version="4.3")
    # Session automatically closed after block
```

### Connection Pooling

The SDK automatically manages connection pooling for optimal performance:

```python
# Reuses connections for multiple requests
client = DDEXClient()
for xml_file in xml_files:
    result = client.validate_file(xml_file, version="4.3")
```

### Retry Logic

Built-in exponential backoff retry for transient failures:

```python
# Automatically retries on 5xx errors
client = DDEXClient(max_retries=3, retry_delay=1.0)
```

## Supported Versions

- **ERN 4.3** (Recommended)
- **ERN 4.2**
- **ERN 3.8.2**

## Supported Profiles

- AudioAlbum
- AudioSingle
- Video
- Mixed
- Classical
- Ringtone
- DJ
- ReleaseByRelease (ERN 3.8.2 only)

## Requirements

- Python 3.7+
- requests 2.28+

## Development

```bash
# Clone repository
git clone https://github.com/daddykev/ddex-workbench.git
cd ddex-workbench/packages/python-sdk

# Install development dependencies
pip install -e ".[dev]"

# Run tests
pytest

# Run tests with coverage
pytest --cov=ddex_workbench

# Run linting
flake8 ddex_workbench
black --check ddex_workbench
mypy ddex_workbench

# Format code
black ddex_workbench
isort ddex_workbench

# Run all checks with tox
tox
```

## Testing

```bash
# Run all tests
pytest

# Run specific test file
pytest tests/test_client.py

# Run with coverage
pytest --cov=ddex_workbench --cov-report=html

# Run integration tests
pytest -m integration

# Run tests in parallel
pytest -n auto
```

## Documentation

Full documentation available at [https://ddex-workbench.org/docs](https://ddex-workbench.org/docs)

## Contributing

We welcome contributions! Please see our [Contributing Guide](https://github.com/daddykev/ddex-workbench/blob/main/CONTRIBUTING.md) for details.

## Support

- 📚 [Documentation](https://ddex-workbench.org/docs)
- 💬 [GitHub Issues](https://github.com/daddykev/ddex-workbench/issues)
- 📧 [Email Support](mailto:support@ddex-workbench.org)
- 🌐 [Website](https://ddex-workbench.org)

## License

MIT License - see [LICENSE](LICENSE) for details.

## Related Projects

- [DDEX Workbench](https://ddex-workbench.org) - Web application
- [@ddex-workbench/sdk](https://www.npmjs.com/package/@ddex-workbench/sdk) - JavaScript/TypeScript SDK
- [DDEX Knowledge Base](https://kb.ddex.net) - Official DDEX documentation

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history.

---

Built with ❤️ for the music industry by the DDEX Workbench team.