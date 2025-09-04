# DDEX Workbench

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Vue 3](https://img.shields.io/badge/Vue-3.x-4FC08D.svg)](https://vuejs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-v9-FFA000.svg)](https://firebase.google.com/)
[![npm version](https://img.shields.io/npm/v/@ddex-workbench/sdk.svg)](https://www.npmjs.com/package/@ddex-workbench/sdk)
[![PyPI version](https://img.shields.io/pypi/v/ddex-workbench.svg)](https://pypi.org/project/ddex-workbench/)

> Modern, open-source DDEX validation tools for the music industry.

**Live at: [https://ddex-workbench.org](https://ddex-workbench.org)**

## 🎉 Version 1.0.2 Released!

Major enhancements now available in both SDKs:
- **🆕 SVRL Report Generation** - Detailed Schematron Validation Report Language output
- **🆕 Auto-Detection** - Automatic ERN version and profile detection
- **🆕 Concurrent Processing** - Parallel batch validation with configurable workers
- **🆕 Profile Compliance** - Detailed compliance statistics and reporting
- **🆕 Advanced Error Filtering** - Type-based error categorization and analysis

## 🎯 Vision

DDEX Workbench democratizes access to the digital music supply chain by providing web-based, collaborative tools that lower the barrier to entry for DDEX implementation. From independent artists to major labels, our tools make DDEX standards accessible to everyone.

## 🚀 Project Overview

A production-ready web-based ERN validator supporting multiple versions with comprehensive validation and API access.

**Why it matters:**
- DDEX is mandating migration to ERN 4.3 by March 2026
- Zero maintained open-source tools currently support ERN 4.3
- The industry needs accessible validation tools

### Current Features (Production-Ready)

#### ✅ Multi-Version ERN Support
- **ERN 4.3** - Latest standard (recommended)
- **ERN 4.2** - Previous ERN 4.x version
- **ERN 3.8.2** - Legacy support with migration hints
- **Profile validation** - AudioAlbum, AudioSingle, Video, Mixed, Classical, and more

#### ✅ Enhanced Three-Stage Validation Pipeline (v1.0.2)
- **XSD Schema Validation** - Structure and data type validation
- **Business Rules** - ERN-specific requirement checking
- **Enhanced Schematron** - Comprehensive profile-specific validation with SVRL reporting
- **Profile Compliance** - Detailed compliance statistics (pass rate, rule counts)
- **Auto-Detection** - Automatically detect ERN version and profile from content

#### ✅ Modern Web Interface
- **Three input methods**: File upload, paste XML, or load from URL
- **Real-time validation** as you type (with debouncing)
- **Advanced options**: Validation mode, strict mode, reference checking
- **Enhanced error display**:
  - Grouped by line/type/severity
  - Collapsible error sections
  - Searchable and filterable
  - Error context with XML snippets
  - Direct links to DDEX Knowledge Base
  - Advanced error categorization (v1.0.2)
- **Validation steps visualization**: Shows timing for each validation stage
- **Export capabilities**:
  - JSON report download
  - Text report download
  - **SVRL report download** (v1.0.2)
  - Copy summary to clipboard
  - Share results functionality
- **Theme system** with light/dark/auto modes
- **Fully responsive** for all devices

## 📦 JavaScript/TypeScript SDK

### Installation
```bash
npm install @ddex-workbench/sdk
```

### Quick Example with v1.0.2 Features
```javascript
import { DDEXClient } from '@ddex-workbench/sdk';

const client = new DDEXClient({
  apiKey: 'ddex_your-api-key' // Optional - for higher rate limits
});

// Auto-detect version and profile (v1.0.2)
const version = client.validator.detectVersion(xmlContent);
const profile = client.validator.detectProfile(xmlContent);

// Validate with SVRL report generation (v1.0.2)
const result = await client.validateWithSVRL(xmlContent, {
  version,
  profile,
  verbose: true
});

if (result.valid) {
  console.log('✅ Valid DDEX file!');
  console.log(`Compliance Rate: ${result.profileCompliance?.complianceRate}%`);
} else {
  console.log(`❌ Found ${result.errors.length} errors`);
  result.errors.forEach(error => {
    console.log(`  Line ${error.line}: ${error.message}`);
  });
}

// Save SVRL report (v1.0.2)
if (result.svrl) {
  fs.writeFileSync('validation-report.svrl', result.svrl);
}

// Batch validation with concurrency (v1.0.2)
const files = ['file1.xml', 'file2.xml', 'file3.xml'];
const batchResult = await client.validator.validateBatch(
  files,
  { version: '4.3', profile: 'AudioAlbum' },
  { maxWorkers: 8 }
);
```

### Why Use the JavaScript SDK?
- **TypeScript Support** - Full type definitions with IntelliSense
- **Auto-Detection** (v1.0.2) - Automatically detect ERN version and profile
- **SVRL Reports** (v1.0.2) - Generate detailed validation reports
- **Concurrent Processing** (v1.0.2) - Process multiple files in parallel
- **Automatic Retry Logic** - Built-in exponential backoff for resilience
- **Cross-Platform** - Works in Node.js and browsers
- **Small Bundle** - Only ~6KB gzipped

**📦 View on npm**: [https://www.npmjs.com/package/@ddex-workbench/sdk](https://www.npmjs.com/package/@ddex-workbench/sdk)

## 🐍 Python SDK

### Installation
```bash
pip install ddex-workbench
```

### Quick Example with v1.0.2 Features
```python
from ddex_workbench import DDEXClient
from pathlib import Path

# Initialize client
client = DDEXClient(api_key="ddex_your-api-key")

# Auto-detect and validate (v1.0.2)
with open('release.xml', 'r') as f:
    xml_content = f.read()
    
version = client.validator.detect_version(xml_content)
profile = client.validator.detect_profile(xml_content)

# Validate with SVRL and compliance reporting (v1.0.2)
result = client.validate_with_svrl(
    xml_content,
    version=version,
    profile=profile,
    verbose=True
)

if result.valid:
    print("✅ Valid DDEX file!")
    if result.profile_compliance:
        print(f"Compliance Rate: {result.profile_compliance.compliance_rate:.1%}")
else:
    print(f"❌ Found {len(result.errors)} errors")
    for error in result.errors:
        print(f"  Line {error.line}: {error.message}")

# Save SVRL report (v1.0.2)
if result.svrl:
    Path('report.svrl').write_text(result.svrl)

# Batch validation with concurrency (v1.0.2)
files = list(Path("releases").glob("*.xml"))
batch_result = client.validator.validate_batch(
    files=files,
    version="4.3",
    profile="AudioAlbum",
    max_workers=8  # Process 8 files concurrently
)
print(f"Validated {batch_result.total_files} files in {batch_result.processing_time:.2f}s")
```

### Why Use the Python SDK?
- **Type Hints** - Full type annotations with dataclasses
- **Auto-Detection** (v1.0.2) - Automatically detect ERN version and profile
- **SVRL Reports** (v1.0.2) - Generate compliance documentation
- **Concurrent Processing** (v1.0.2) - Batch validate with parallel processing
- **Async Support** - Built-in async/await support with retry logic
- **Python 3.7+** - Compatible with modern Python versions
- **CI/CD Ready** - Examples for integration with GitHub Actions

**📦 View on PyPI**: [https://pypi.org/project/ddex-workbench/](https://pypi.org/project/ddex-workbench/)

## 🌐 Public Validation API

**Base URL**: `https://api.ddex-workbench.org/v1`

### Standard Validation
```javascript
// POST /validate
{
  "content": "<?xml version=\"1.0\"?>...",
  "type": "ERN",
  "version": "4.3",  // or "4.2", "3.8.2"
  "profile": "AudioAlbum"
}
```

### Enhanced Validation with v1.0.2 Features
```javascript
// POST /validate
{
  "content": "<?xml version=\"1.0\"?>...",
  "type": "ERN",
  "version": "4.3",
  "profile": "AudioAlbum",
  "options": {
    "generateSVRL": true,      // v1.0.2: Generate SVRL report
    "verbose": true,           // v1.0.2: Include passed rules
    "includeMetadata": true    // v1.0.2: Extract metadata
  }
}

// Response includes (v1.0.2):
{
  "valid": true,
  "errors": [...],
  "warnings": [...],
  "metadata": {...},
  "svrl": "<?xml version=\"1.0\"?>...",  // SVRL report
  "profileCompliance": {
    "profile": "AudioAlbum",
    "version": "4.3",
    "complianceRate": 95.5,
    "totalRules": 200,
    "passedRules": 191,
    "failedRules": 9
  }
}
```

### API Documentation
- Interactive code examples (cURL, JavaScript, Python, PHP)
- Live response examples
- Complete endpoint reference
- Authentication guide
- Version and profile information
- SVRL report format documentation

## ⚡ Performance Improvements (v1.0.2)

- **Validation Speed**: 2-100ms for typical files
- **Batch Processing**: Up to 8x faster with parallel processing
- **SVRL Generation**: Adds only 10-20ms to validation time
- **Auto-Detection**: Near-instant (<5ms) version and profile detection
- **Memory Efficiency**: Streaming XML parsing for large files
- **Concurrent Processing**: Handle multiple files simultaneously

## ✅ Production-Ready Features
- Multi-version ERN validation (3.8.2, 4.2, 4.3)
- Enhanced three-stage validation pipeline with SVRL
- Auto-detection of ERN version and profile
- Concurrent batch processing
- Profile compliance reporting
- Real-time validation
- Authentication & API keys
- Community snippets library
- Public REST API
- **Official JavaScript/TypeScript SDK v1.0.2+** - [@ddex-workbench/sdk](https://www.npmjs.com/package/@ddex-workbench/sdk)
- **Official Python SDK v1.0.2+** - [ddex-workbench](https://pypi.org/project/ddex-workbench/)
- Comprehensive API documentation
- Theme system (light/dark/auto)

## 🛠️ Tech Stack

### Frontend
- **Vue 3** with Composition API
- **Vite** for lightning-fast builds
- **Custom CSS Architecture** with utility-first approach
- **Firebase SDK** for direct Firestore access

### Backend
- **Firebase Cloud Functions** for validation API
- **Firestore** for data persistence
- **Firebase Auth** for user management
- **Express.js** for API routing
- **libxmljs2** for XSD validation

### Validation Engine
- **Multi-version support** (ERN 3.8.2, 4.2, 4.3)
- **XSD schema validation** with pre-downloaded schemas
- **Enhanced Schematron validation** (v1.0.2) with built-in rules
- **SVRL report generation** (v1.0.2)
- **Auto-detection capabilities** (v1.0.2)
- **Comprehensive error reporting** with context

## 📦 Installation

### Prerequisites
- Node.js 18+
- npm or yarn
- Firebase CLI (`npm install -g firebase-tools`)

### Setup

1. Clone the repository:
```bash
git clone https://github.com/daddykev/ddex-workbench.git
cd ddex-workbench
```

2. Install dependencies:
```bash
npm install
cd functions && npm install && cd ..
```

3. Create `.env` file from template:
```bash
cp .env.example .env
# Edit .env with your Firebase config
```

4. Configure Firebase:
```bash
firebase login
firebase use --add
```

5. Download XSD schemas:
```bash
cd functions
node scripts/downloadSchemas.js
cd ..
```

6. Run development server:
```bash
npm run dev
```

## 🔧 Development

### Running locally
```bash
# Frontend development
npm run dev

# Firebase emulators (backend)
firebase emulators:start

# Run both frontend and emulators
npm run dev:full
```

### Building for production
```bash
npm run build
firebase deploy
```

### Testing validation
```bash
# Test the API with v1.0.2 features
curl -X POST http://localhost:5001/your-project/us-central1/app/api/validate \
  -H "Content-Type: application/json" \
  -d '{"content": "<?xml>...", "type": "ERN", "version": "4.3", "options": {"generateSVRL": true}}'
```

## 🗺️ Roadmap

### Phase 1: DDEX ERN Validation ✅
- [x] Project setup and architecture
- [x] Core validation engine with multi-version support
- [x] Web interface with real-time validation
- [x] Authentication system with Google OAuth
- [x] Theme system (light/dark/auto)
- [x] Public API with rate limiting
- [x] API key management
- [x] Comprehensive API documentation
- [x] Three-stage validation pipeline
- [x] Enhanced error display with grouping/filtering
- [x] Community snippet library
- [x] JSON and text report generation
- [x] Official JavaScript/TypeScript SDK v1.0.2+
- [x] Official Python SDK v1.0.2+
- [x] SVRL report generation (v1.0.2)
- [x] Auto-detection features (v1.0.2)
- [x] Concurrent batch processing (v1.0.2)
- [x] Profile compliance reporting (v1.0.2)

### Phase 2: ERN Sandbox (In Progress)
- [x] Interactive form-based ERN creation
- [x] Deezer API integration for metadata import
- [x] Real-time XML generation
- [ ] Template library expansion
- [ ] Export to production systems

### Phase 3: DSR-Flow (Q4 2025)
Digital Sales Reporting processor for financial data workflows

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Quick Start for Contributors
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📚 Documentation

- [Technical Blueprint](blueprint.md) - Detailed technical architecture and implementation details
- [API Documentation](https://ddex-workbench.org/api) - Live interactive API docs
- [JavaScript SDK Documentation](https://www.npmjs.com/package/@ddex-workbench/sdk) - npm package documentation
- [Python SDK Documentation](https://pypi.org/project/ddex-workbench/) - PyPI package documentation
- [Setup Guide](docs/SETUP.md) - Detailed development environment setup

## 🎯 Performance & Metrics

### Current Performance
- **Validation speed**: 2-100ms depending on file size and complexity
- **Batch processing**: Up to 8x faster with v1.0.2 parallel processing
- **API response time**: <200ms average
- **Uptime**: 99.95% target

### SDK Downloads
- **JavaScript SDK**: 50+ weekly downloads
- **Python SDK**: 50+ weekly downloads

## 🔄 Upgrading to v1.0.2

### JavaScript/TypeScript
```bash
npm update @ddex-workbench/sdk
```

### Python
```bash
pip install --upgrade ddex-workbench
```

### What's New
- **SVRL Report Generation**: Generate detailed validation reports in Schematron Validation Report Language format
- **Auto-Detection**: Automatically detect ERN version and profile from XML content
- **Concurrent Processing**: Process multiple files in parallel with configurable workers
- **Profile Compliance**: Get detailed compliance statistics including pass rates
- **Enhanced Error Filtering**: Advanced categorization and filtering of validation errors
- **Performance**: Up to 8x faster batch processing with parallel validation

### Breaking Changes
None - v1.0.2 is fully backward compatible

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- DDEX for maintaining the industry standards
- The music technology community for insights and feedback
- All contributors who help make DDEX more accessible

## 📞 Contact & Support

- **Live App**: [https://ddex-workbench.org](https://ddex-workbench.org)
- **API**: [https://api.ddex-workbench.org/v1](https://api.ddex-workbench.org/v1)
- **JavaScript SDK**: [@ddex-workbench/sdk](https://www.npmjs.com/package/@ddex-workbench/sdk) v1.0.2+
- **Python SDK**: [ddex-workbench](https://pypi.org/project/ddex-workbench/) v1.0.2+
- **GitHub Issues**: For bug reports and feature requests
- **Email**: daddykev@gmail.com

---

Built for the music industry by the open-source community.