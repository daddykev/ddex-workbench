# DDEX Workbench

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Vue 3](https://img.shields.io/badge/Vue-3.x-4FC08D.svg)](https://vuejs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-v9-FFA000.svg)](https://firebase.google.com/)

> An open-source suite of modern, accessible tools for working with DDEX standards.

## 🎯 Vision

DDEX Workbench aims to democratize access to the digital music supply chain by providing web-based, collaborative tools that lower the barrier to entry for DDEX implementation. From independent artists to major labels, our tools make DDEX standards accessible to everyone.

## 🚀 Project Overview

### Phase 1: DDEX Validation (Current Focus)
A modern web-based ERN validator supporting multiple versions with community knowledge sharing capabilities.

**Why it matters:**
- DDEX is mandating migration to ERN 4.3 by March 2026
- Zero maintained open-source tools currently support ERN 4.3
- The industry urgently needs accessible validation tools

### Key Features

#### 🎯 Multi-Version ERN Support
- **ERN 4.3** - Latest standard with full ERN 4.x features
- **ERN 4.2** - Previous ERN 4.x version
- **ERN 3.8.2** - Legacy support with migration hints
- **Profile-specific validation** for AudioAlbum, AudioSingle, Video, Mixed, and ReleaseByRelease (3.8.2 only)

#### 🎨 Modern Web Interface
- **Drag-and-drop** file upload for XML files
- **Direct XML input** with syntax highlighting
- **Real-time validation** with line-by-line error highlighting
- **DDEX KB links** for understanding and fixing errors
- **Theme system** with light/dark/auto modes
- **Responsive design** for mobile and desktop

#### 🔐 Authentication & User Features
- **Firebase Auth** integration with email/password and Google OAuth
- **User profiles** with customizable display names
- **API key management** for programmatic access
- **Validation history** tracking (authenticated users)
- **Higher rate limits** for authenticated API usage

#### 📡 Public Validation API
```javascript
// POST /api/validate
{
  "content": "<xml>...</xml>",
  "type": "ERN",
  "version": "4.3",  // or "4.2", "3.8.2"
  "profile": "AudioAlbum"
}

// Authentication via API Key
headers: {
  "X-API-Key": "your-api-key"
}
```

#### 📚 Community Knowledge Base
- **Searchable snippet library** for common DDEX patterns
- **Version-specific examples** with migration guides
- **Community voting and comments** (authenticated)
- **Real-world examples** for complex scenarios
- **Direct integration** with validator ("Copy to Validator" button)

## 🛠️ Tech Stack

### Frontend
- **Vue 3** with Composition API
- **Vite** for lightning-fast builds
- **Custom CSS Architecture** with utility classes and theme support
- **FontAwesome** for icons

### Backend
- **Firebase** platform
- **Cloud Functions** for serverless validation
- **Firestore** for data persistence
- **Firebase Auth** for user management
- **Cloud Storage** for file handling

### Validation Engine
- **Multi-version support** with custom `ernValidator.js`
- **Version-specific rules** for ERN 3.8.2, 4.2, and 4.3
- **Profile validation** with business rule checking
- **Fast XML parsing** with detailed error reporting

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
cd functions && npm install
```

3. Configure Firebase:
```bash
firebase login
firebase init
```

4. Create `.env` file from template:
```bash
cp .env.example .env
# Edit .env with your Firebase config
```

5. Run development server:
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

## 🗺️ Roadmap

### Phase 1: DDEX Connect (Weeks 1-12)
- [x] Project setup and architecture
- [x] Core validation engine with multi-version support
- [x] Web interface development
- [x] Authentication system
- [x] Theme system (light/dark/auto)
- [ ] Public API endpoints (in progress)
- [ ] Community knowledge base
- [ ] Documentation and launch

### Phase 2: DSR-Flow (Sep 2025)
Digital Sales Reporting processor for financial data workflows

### Phase 3: DDEX Workbench (Oct 2025)
Full collaborative metadata management platform

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Quick Start for Contributors
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📚 Documentation

- [Technical Blueprint](docs/blueprint.md) - Detailed technical architecture
- [Strategic Overview](docs/overview.md) - Market analysis and vision
- [API Documentation](docs/API.md) - REST API reference
- [Setup Guide](docs/SETUP.md) - Detailed setup instructions

## 🎯 Success Metrics

- 1,000+ validations/week within 3 months
- 50+ registered API developers
- 100+ community-contributed snippets
- <2 second validation for typical files
- 99.9% uptime

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- DDEX for maintaining the industry standards
- The music technology community for insights and feedback
- All contributors who help make DDEX more accessible

## 📞 Contact & Support

- **GitHub Issues**: For bug reports and feature requests
- **Discord**: [Join our community](https://discord.gg/ddex-workbench)
- **Email**: daddykev@gmail.com

---

Built with ❤️ for the music industry by the open-source community.