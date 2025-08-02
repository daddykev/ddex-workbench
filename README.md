# DDEX Workbench

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Vue 3](https://img.shields.io/badge/Vue-3.x-4FC08D.svg)](https://vuejs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-v9-FFA000.svg)](https://firebase.google.com/)

> An open-source suite of modern, accessible tools for working with DDEX standards in the digital music industry.

## 🎯 Vision

DDEX Workbench aims to democratize access to the digital music supply chain by providing web-based, collaborative tools that lower the barrier to entry for DDEX implementation. From independent artists to major labels, our tools make DDEX standards accessible to everyone.

## 🚀 Project Overview

### Phase 1: DDEX Connect (Current Focus)
A modern web-based ERN 4.3 validator with community knowledge sharing capabilities.

**Why it matters:**
- DDEX is mandating migration to ERN 4.3 by March 2025
- Zero maintained open-source tools currently support ERN 4.3
- The industry urgently needs accessible validation tools

### Key Features

#### Web Validator Interface
- **Drag-and-drop** file upload for XML files
- **Monaco editor** for pasting and editing XML directly
- **Line-by-line error highlighting** with detailed messages
- **DDEX KB links** for understanding and fixing errors
- Support for ERN 4.3 (expandable to other versions)

#### Public Validation API
```javascript
// POST /api/validate
{
  "content": "<xml>...</xml>",
  "type": "ERN",
  "version": "4.3",
  "profile": "AudioAlbum"
}
```

#### Community Knowledge Base
- Searchable snippet library for common DDEX patterns
- Community voting and comments
- Real-world examples for complex scenarios
- Direct integration with validator

## 🛠️ Tech Stack

### Frontend
- **Vue 3** with Composition API
- **Vite** for lightning-fast builds
- **Monaco Editor** for XML editing

### Backend
- **Firebase** platform
- **Cloud Functions** for serverless validation
- **Firestore** for data persistence
- **Firebase Auth** for user management
- **Cloud Storage** for file handling

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
- [ ] Core validation engine
- [ ] Web interface development
- [ ] Public API endpoints
- [ ] Community knowledge base
- [ ] Documentation and launch

### Phase 2: DSR-Flow
Digital Sales Reporting processor for financial data workflows

### Phase 3: DDEX Workbench
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