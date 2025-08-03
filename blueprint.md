# DDEX Workbench

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Vue 3](https://img.shields.io/badge/Vue-3.x-4FC08D.svg)](https://vuejs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-v9-FFA000.svg)](https://firebase.google.com/)

> Modern, open-source DDEX validation tools that exceed industry standards. Validate ERN files with XSD schemas, business rules, and profile-specific checks—all in a beautiful web interface.

🚀 **Live Application**: [https://ddex-workbench.org](https://ddex-workbench.org)

## 🎯 Why DDEX Workbench?

The music industry is mandating DDEX ERN 4.3 by March 2026, yet there are **zero maintained open-source tools** that support it properly. We're changing that.

### What Makes Us Different

- **🔍 Three-Stage Validation**: XSD schema validation + business rules + profile checks (exceeds official validator)
- **⚡ Real-Time Validation**: See errors as you type with intelligent debouncing
- **🌐 Modern Web Interface**: No installation required—works in any browser
- **📊 Multi-Version Support**: ERN 3.8.2, 4.2, and 4.3 in one tool
- **🔐 Production-Ready API**: Public REST API with optional authentication
- **🎨 Beautiful UX**: Dark/light themes, mobile responsive, accessible

## ✨ Features

### 🎯 Advanced ERN Validator

#### Three Input Methods
- **Drag & Drop**: Upload XML files with visual feedback
- **Direct Input**: Paste XML with syntax highlighting and real-time validation
- **URL Loading**: Validate files hosted anywhere

#### Comprehensive Validation
- **XSD Schema Validation**: Using official DDEX schemas
- **Business Rules Engine**: Version-specific rules for ERN compliance
- **Profile Validation**: AudioAlbum, AudioSingle, Video, Mixed profiles
- **Smart Error Display**: Grouped, searchable, with line numbers and DDEX KB links

#### Enhanced Features
- **Real-Time Mode**: Validate as you type
- **Validation Timeline**: Visual breakdown of validation steps
- **Advanced Options**: Strict mode, reference checking, validation modes
- **Error Search & Filter**: Find specific issues quickly
- **Mobile Responsive**: Full functionality on all devices

### 🔑 Authentication & API

- **Public Access**: No login required for validation
- **Google OAuth**: Quick signup/login
- **API Keys**: Generate keys for programmatic access
- **Rate Limiting**: 10 req/min anonymous, 60 req/min with API key
- **User Dashboard**: Manage API keys and view usage stats

### 🚀 Performance

- **Fast**: 2-100ms validation time depending on file size
- **Scalable**: Firebase Functions auto-scaling
- **Reliable**: 99.9% uptime target
- **Secure**: Input sanitization, rate limiting, CORS protection

## 📡 API Usage

### Public Validation Endpoint

```bash
# Validate ERN 4.3 file
curl -X POST https://us-central1-ddex-workbench.cloudfunctions.net/app/api/validate \
  -H "Content-Type: application/json" \
  -d '{
    "content": "<?xml version=\"1.0\"?>...",
    "type": "ERN",
    "version": "4.3",
    "profile": "AudioAlbum"
  }'

# With API key for higher rate limits
curl -X POST https://us-central1-ddex-workbench.cloudfunctions.net/app/api/validate \
  -H "Content-Type: application/json" \
  -H "X-API-Key: ddex_YOUR_KEY_HERE" \
  -d '{
    "content": "<?xml version=\"1.0\"?>...",
    "type": "ERN",
    "version": "4.3",
    "profile": "AudioAlbum"
  }'
```

### Response Format

```json
{
  "valid": false,
  "errors": [{
    "line": 42,
    "column": 15,
    "message": "Element 'ISRC': This element is not expected",
    "severity": "error",
    "rule": "XSD-Schema",
    "context": "<SoundRecordingId>..."
  }],
  "warnings": [],
  "metadata": {
    "processingTime": 45,
    "schemaVersion": "ERN 4.3",
    "profile": "AudioAlbum",
    "validatedAt": "2025-08-03T12:00:00Z",
    "errorCount": 1,
    "warningCount": 0,
    "validationSteps": [
      { "type": "XSD", "duration": 23, "errorCount": 1 },
      { "type": "BusinessRules", "duration": 15, "errorCount": 0 },
      { "type": "Schematron", "duration": 7, "errorCount": 0 }
    ]
  }
}
```

### Get Supported Formats

```bash
curl https://us-central1-ddex-workbench.cloudfunctions.net/app/api/formats
```

## 🛠️ Tech Stack

### Frontend
- **Vue 3** with Composition API
- **Vite** for lightning-fast builds
- **Custom CSS Architecture** with theme support
- **FontAwesome** icons
- **Axios** for API calls

### Backend
- **Firebase Functions** (Node.js 18+)
- **Express.js** REST API
- **libxmljs2** for XSD validation
- **Firestore** for data persistence
- **Firebase Auth** for user management

### Validation Engine
- **Multi-stage Pipeline**: XSD → Business Rules → Profile Validation
- **Official DDEX Schemas**: Pre-downloaded for performance
- **Custom Business Rules**: Version-specific ERN validation
- **Error Enhancement**: Detailed messages with suggestions

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Firebase CLI (`npm install -g firebase-tools`)
- A Firebase project

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/ddex-workbench.git
cd ddex-workbench

# Install dependencies
npm install
cd functions && npm install && cd ..

# Configure Firebase
firebase use --add
# Select your Firebase project

# Create .env file
cp .env.example .env
# Add your Firebase config to .env

# Download DDEX schemas
cd functions
node scripts/downloadSchemas.js
cd ..

# Run development server
npm run dev

# In another terminal, run Firebase emulators
firebase emulators:start
```

### Deploy to Production

```bash
# Build frontend
npm run build

# Deploy everything
firebase deploy
```

## 📦 Project Structure

```
ddex-workbench/
├── src/                    # Vue application
│   ├── views/              # Page components
│   │   ├── ValidatorView.vue  # Main validator interface
│   │   └── ...
│   ├── services/api.js     # API client
│   └── ...
├── functions/              # Backend API
│   ├── validators/         # Validation logic
│   │   ├── ernValidator.js
│   │   ├── xsdValidator.js
│   │   └── schematronValidator.js
│   ├── schemas/           # DDEX XSD schemas
│   └── ...
└── ...
```

## 🗺️ Roadmap

### ✅ Phase 1: DDEX Validator (Current)
- [x] Multi-version ERN validation (3.8.2, 4.2, 4.3)
- [x] XSD schema validation
- [x] Business rules engine
- [x] Real-time validation
- [x] Authentication system
- [x] Public API with rate limiting
- [x] API key management
- [ ] Validation history
- [ ] PDF report generation

### 🔄 Phase 2: Community Features (Sep 2025)
- [ ] Code snippets library
- [ ] Community voting
- [ ] Comments and discussions
- [ ] Integration examples
- [ ] npm SDK package

### 📊 Phase 3: DSR-Flow (Oct 2025)
- [ ] Digital Sales Reporting processor
- [ ] Multi-profile DSR support
- [ ] Financial reconciliation tools

### 🎯 Phase 4: Full Workbench (Nov 2025)
- [ ] Collaborative metadata editor
- [ ] Template management
- [ ] Team workspaces
- [ ] Batch processing

## 🤝 Contributing

We welcome contributions! See our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Quick Contribution Guide

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`npm test`)
5. Commit (`git commit -m 'Add amazing feature'`)
6. Push (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Development Tips

- Use the Vue devtools for debugging
- Check Firebase emulator logs for backend issues
- Run `npm run lint` before committing
- Add tests for new validation rules

## 📚 Documentation

- [API Documentation](docs/API.md) - Complete API reference
- [Setup Guide](docs/SETUP.md) - Detailed setup instructions
- [Validation Rules](docs/VALIDATION.md) - How validation works
- [Contributing](CONTRIBUTING.md) - How to contribute

## 🙏 Acknowledgments

- DDEX for maintaining the industry standards
- The open-source community for inspiration
- Early adopters for feedback and testing
- Contributors who make this project better

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/ddex-workbench/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/ddex-workbench/discussions)
- **Email**: support@ddex-workbench.org

---

<p align="center">
  Built with ❤️ for the music industry by the open-source community
</p>

<p align="center">
  <a href="https://ddex-workbench.org">Try it now</a> •
  <a href="https://github.com/yourusername/ddex-workbench">Star on GitHub</a> •
</p>