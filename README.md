# DDEX Workbench

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Vue 3](https://img.shields.io/badge/Vue-3.x-4FC08D.svg)](https://vuejs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-v9-FFA000.svg)](https://firebase.google.com/)

> Modern, open-source DDEX validation tools for the music industry.

**Live at: [https://ddex-workbench.org](https://ddex-workbench.org)**

## 🎯 Vision

DDEX Workbench democratizes access to the digital music supply chain by providing web-based, collaborative tools that lower the barrier to entry for DDEX implementation. From independent artists to major labels, our tools make DDEX standards accessible to everyone.

## 🚀 Project Overview

### Phase 1: DDEX ERN Validator (Live Now!)
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
- **Profile validation** - AudioAlbum, AudioSingle, Video, Mixed, and more

#### ✅ Three-Stage Validation Pipeline
- **XSD Schema Validation** - Structure and data type validation
- **Business Rules** - ERN-specific requirement checking
- **Profile Validation** - Profile-specific rules with built-in Schematron-equivalent coverage

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
- **Validation steps visualization**: Shows timing for each validation stage
- **Export capabilities**:
  - JSON report download
  - Text report download
  - Copy summary to clipboard
  - Share results functionality
- **Theme system** with light/dark/auto modes
- **Fully responsive** for all devices

#### ✅ Authentication & API Keys
- **Firebase Auth** with email/password and Google OAuth
- **API key management** for programmatic access
- **User profiles** with customization options
- **Rate limiting**: 10 req/min (anonymous), 60 req/min (authenticated)

#### ✅ Community Snippets Library
- **Browse** validated DDEX examples
- **Create and manage** snippets (authenticated users)
- **Search and filter** by category, tags, or version
- **Copy to validator** for quick testing
- **Direct Firestore integration** for real-time updates

#### ✅ Public Validation API

**Base URL**: `https://api.ddex-workbench.org/v1`

```javascript
// POST /validate
{
  "content": "<?xml version=\"1.0\"?>...",
  "type": "ERN",
  "version": "4.3",  // or "4.2", "3.8.2"
  "profile": "AudioAlbum"
}

// Optional authentication for higher rate limits
headers: {
  "X-API-Key": "ddex_your-api-key"
}
```

#### ✅ Comprehensive API Documentation
- Interactive code examples (cURL, JavaScript, Python, PHP)
- Live response examples
- Complete endpoint reference
- Authentication guide
- Version and profile information

#### 🚧 Coming Soon
- Usage analytics dashboard

### 🎉 Official SDK Now Available!

We're excited to announce that the **DDEX Workbench SDK** is now available on npm! This makes it easier than ever to integrate DDEX validation into your applications.

#### Installation
```bash
npm install @ddex-workbench/sdk
```

#### Quick Example
```javascript
import { DDEXClient } from '@ddex-workbench/sdk';

const client = new DDEXClient({
  apiKey: 'ddex_your-api-key' // Optional - for higher rate limits
});

// Validate ERN XML
const result = await client.validate(xmlContent, {
  version: '4.3',
  profile: 'AudioAlbum'
});

if (result.valid) {
  console.log('✅ Valid DDEX file!');
} else {
  console.log(`❌ Found ${result.errors.length} errors`);
  result.errors.forEach(error => {
    console.log(`  Line ${error.line}: ${error.message}`);
  });
}
```

#### Why Use the SDK?
- **TypeScript Support** - Full type definitions with IntelliSense
- **Automatic Retry Logic** - Built-in exponential backoff for resilience
- **Cross-Platform** - Works in Node.js and browsers
- **Simplified API** - Clean, promise-based interface
- **Error Handling** - Structured errors with helpful messages
- **Small Bundle** - Only ~6KB gzipped

**📦 View on npm**: [https://www.npmjs.com/package/@ddex-workbench/sdk](https://www.npmjs.com/package/@ddex-workbench/sdk)

**📚 Full Documentation**: [SDK README](https://github.com/daddykev/ddex-workbench/tree/main/packages/sdk#readme)
```

Also update the "Coming Soon" section to reflect the SDK is now live:

```markdown
#### ✅ Production-Ready Features
- Multi-version ERN validation (3.8.2, 4.2, 4.3)
- Three-stage validation pipeline
- Real-time validation
- Authentication & API keys
- Community snippets library
- Public REST API
- **Official npm SDK** - [@ddex-workbench/sdk](https://www.npmjs.com/package/@ddex-workbench/sdk)
- Comprehensive API documentation
- Theme system (light/dark/auto)

#### 🚧 Coming Soon
- Usage analytics dashboard
- Batch validation UI
- ERN Sandbox enhancements

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
- **Built-in profile validation** (no proprietary dependencies)
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
# Test the API
curl -X POST http://localhost:5001/your-project/us-central1/app/api/validate \
  -H "Content-Type: application/json" \
  -d '{"content": "<?xml>...", "type": "ERN", "version": "4.3"}'
```

## 🗺️ Roadmap

### Phase 1: DDEX ERN Validation
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
- [ ] Usage analytics

### Phase 2: ERN Sandbox (Q3 2025)
Visual, form-based ERN creation

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
- [Strategic Overview](overview.md) - Market analysis and business case
- [API Documentation](https://ddex-workbench.web.app/api) - Live interactive API docs
- [Setup Guide](docs/SETUP.md) - Detailed development environment setup

## 🎯 Performance & Metrics

### Current Performance
- **Validation speed**: 2-100ms depending on file size and mode
- **API response time**: <200ms average
- **Uptime**: 99.9% target

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- DDEX for maintaining the industry standards
- The music technology community for insights and feedback
- All contributors who help make DDEX more accessible

## 📞 Contact & Support

- **Live App**: [https://ddex-workbench.org](https://ddex-workbench.org)
- **API**: [https://api.ddex-workbench.org/v1](https://api.ddex-workbench.org/v1)
- **GitHub Issues**: For bug reports and feature requests
- **Email**: daddykev@gmail.com

---

Built with ❤️ for the music industry by the open-source community.