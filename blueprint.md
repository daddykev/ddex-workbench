# DDEX Workbench - Blueprint

## Project Overview

DDEX Workbench is an open-source suite of tools for working with DDEX standards, starting with ERN validation (supporting versions 3.8.2, 4.2, and 4.3) and expanding to include DSR processing and collaborative metadata management.

### Vision
Create modern, accessible tools that lower the barrier to entry for DDEX implementation, serving everyone from independent artists to major labels.

### Official App
**URL**: [https://ddex-workbench.org](https://ddex-workbench.org)

### Phase 1: DDEX Connect (The Validator)
A web-based ERN validator supporting multiple versions (3.8.2, 4.2, 4.3) with community knowledge sharing capabilities.

## Technical Architecture

### Frontend
- **Framework**: Vue 3 with Composition API
- **Build Tool**: Vite
- **HTTP Client**: Axios
- **Code Editor**: Monaco Editor (for XML display/editing)
- **Styling**: Custom CSS with utility classes and theme support

### Backend
- **Platform**: Firebase
- **Functions**: Node.js 18+ Cloud Functions
- **Database**: Firestore
- **Authentication**: Firebase Auth
- **Hosting**: Firebase Hosting
- **Storage**: Cloud Storage (for file uploads)

### Validation Engine
- **XML Parser**: fast-xml-parser (for performance and flexibility)
- **Multi-Version Support**: ERN 3.8.2, 4.2, and 4.3
- **Validator Module**: Custom `ernValidator.js` with version-specific rules
- **Profile Support**: AudioAlbum, AudioSingle, Video, Mixed, ReleaseByRelease (3.8.2 only)

## Project Structure

```
ddex-workbench/
├── src/                       # Vue 3 application source
│   ├── components/            # Vue components
│   │   └── NavBar.vue/        # Navigation UI component
│   ├── views/                 # Vue router views/pages
│   │   ├── ValidatorView.vue  # Main validator page
│   │   ├── SnippetsView.vue   # Community snippets page
│   │   └── ApiDocsView.vue    # API documentation page
│   ├── services/              # External service integrations
│   │   ├── firebase.js        # Firebase configuration
│   │   └── api.js             # API calls to Cloud Functions
│   ├── composables/           # Vue composables
│   ├── utils/                 # Utility functions
│   │   └── themeManager.js    # Theme switching logic
│   ├── router/                # Vue Router configuration
│   ├── assets/                # Static assets and styles
│   │   ├── main.css           # Main stylesheet entry
│   │   ├── base.css           # CSS reset/normalize
│   │   ├── themes.css         # CSS custom properties
│   │   ├── components.css     # Reusable component classes
│   │   ├── fonts/             # Custom fonts
│   │   └── images/            # Images and icons
│   ├── App.vue                # Root component
│   ├── firebase.js            # Firebase project config
│   └── main.js                # Application entry point
├── functions/                 # Firebase Cloud Functions
│   ├── api/                   # API endpoints
│   │   ├── validate.js        # Validation endpoint
│   │   └── snippets.js        # Snippets CRUD
│   ├── validators/            # Validation modules
│   │   └── ernValidator.js    # Multi-version ERN validator
│   ├── index.js               # Functions entry point
│   └── package.json           # Functions dependencies
├── public/                    # Static public assets
│   └── favicon.ico
├── docs/                      # Documentation
│   ├── API.md                 # API documentation
│   └── SETUP.md               # Setup instructions
├── .firebase/                 # Firebase cache (git ignored)
├── .vscode/                   # VS Code settings (git ignored)
├── index.html                 # HTML entry point
├── vite.config.js             # Vite configuration
├── firebase.json              # Firebase configuration
├── firestore.rules            # Firestore security rules
├── firestore.indexes.json     # Firestore indexes
├── storage.rules              # Storage security rules
├── .firebaserc                # Firebase project alias (git ignored)
├── .gitignore                 # Git ignore file
├── .env                       # Environment variables (git ignored)
├── .env.example               # Environment variables template
├── package.json               # Project dependencies
├── package-lock.json          # Locked dependencies
├── README.md                  # Project documentation
├── LICENSE                    # MIT License
└── CONTRIBUTING.md            # Contribution guidelines
```

## ERN Validator Architecture

### Multi-Version Support

The `ernValidator.js` module provides comprehensive validation for three major ERN versions:

- **ERN 4.3**: Latest version with removed UpdateIndicator, enhanced metadata capabilities
- **ERN 4.2**: Previous major version with similar structure to 4.3
- **ERN 3.8.2**: Legacy version still widely used, includes UpdateIndicator and ReleaseDetailsByTerritory

### Version-Specific Rules

Each ERN version has distinct validation requirements:

#### ERN 4.3 & 4.2
- No UpdateIndicator element (removed in ERN 4.x)
- Required elements: MessageHeader, ReleaseList, ResourceList, DealList
- Simplified territorial handling without DetailsByTerritory
- PartyList for centralized party information

#### ERN 3.8.2
- Optional UpdateIndicator element
- Legacy ReleaseDetailsByTerritory structure
- Additional profile: ReleaseByRelease
- Migration suggestions for users to upgrade to 4.3

### Profile Validation

The validator supports profile-specific rules:
- **AudioAlbum**: Validates album structure, expects ReleaseType 'Album' or 'EP'
- **AudioSingle**: Ensures single release structure
- **Video**: Checks for video resources in ResourceList
- **Mixed**: Allows various content types with minimal restrictions
- **ReleaseByRelease**: Available only in ERN 3.8.2

## Phase 1 Features

### 1. Web Validator Interface
- **File Upload**: Drag-and-drop or file picker for XML files
- **Text Input**: Direct XML pasting with syntax highlighting
- **Version Selection**: Choose between ERN 3.8.2, 4.2, or 4.3
- **Profile Selection**: Dynamic profile options based on selected version
- **Validation Results**: 
  - Clear pass/fail status
  - Line-by-line error highlighting
  - Detailed error messages with DDEX KB links
  - Version-specific validation rules

### 2. Public Validation API
```typescript
// POST /api/validate
{
  "content": "<xml>...</xml>",
  "type": "ERN",
  "version": "4.3",  // or "4.2", "3.8.2"
  "profile": "AudioAlbum"
}

// Response
{
  "valid": boolean,
  "errors": [{
    "line": number,
    "column": number,
    "message": string,
    "severity": "error" | "warning" | "info",
    "rule": string
  }],
  "metadata": {
    "processingTime": number,
    "schemaVersion": string,
    "profile": string,
    "validatedAt": string
  }
}

// GET /api/validate/formats
// Returns supported versions and profiles
{
  "types": ["ERN"],
  "versions": [{
    "version": "4.3",
    "profiles": ["AudioAlbum", "AudioSingle", "Video", "Mixed"],
    "status": "recommended"
  }, {
    "version": "4.2",
    "profiles": ["AudioAlbum", "AudioSingle", "Video", "Mixed"],
    "status": "supported"
  }, {
    "version": "3.8.2",
    "profiles": ["AudioAlbum", "AudioSingle", "Video", "Mixed", "ReleaseByRelease"],
    "status": "supported"
  }]
}
```

### 3. Community Knowledge Base
- **Snippet Categories**:
  - Common Patterns
  - Complex Scenarios
  - Migration Examples (ERN 3.8.2 to 4.3)
  - Version-specific examples
- **Features**:
  - Search and filter by version
  - Upvote/downvote
  - Comments (authenticated users)
  - Copy to validator button
  - Tags for discovery

### 4. User Features
- **Anonymous Usage**: Core validation without login
- **Authenticated Features**:
  - Save validation history with version info
  - Contribute snippets
  - Vote and comment
  - API key for higher rate limits

## CSS Architecture

### Design System Overview

Our CSS architecture follows a utility-first approach with semantic component classes:

1. **`assets/main.css`**: Entry point that imports all other CSS files
2. **`assets/base.css`**: CSS reset, base typography, and global styles
3. **`assets/themes.css`**: CSS custom properties supporting light/dark/auto themes
4. **`assets/components.css`**: Reusable component classes and utility classes

### Theme System

- **Light/Dark/Auto modes**: Automatic theme detection with manual override
- **CSS Custom Properties**: All colors, spacing, and other design tokens
- **High Contrast Support**: Accessibility considerations for better readability
- **Theme Manager**: JavaScript utility (`utils/themeManager.js`) for theme switching

### Component Classes

Semantic, reusable classes for common UI patterns:
- **Buttons**: `.btn`, `.btn-primary`, `.btn-secondary`, size variants
- **Cards**: `.card`, `.card-header`, `.card-body`, `.card-footer`
- **Forms**: `.form-group`, `.form-label`, `.form-input`, `.form-error`
- **Layout**: `.container`, `.section`, `.grid`, `.flex`

### Utility Classes

Semantic utility classes for:
- **Spacing**: `.mt-md`, `.p-lg`, `.mb-xl` (margin/padding with size modifiers)
- **Typography**: `.text-primary`, `.text-lg`, `.font-semibold`
- **Display**: `.hidden`, `.block`, `.flex`
- **Colors**: `.bg-surface`, `.text-error`, `.border-primary`

## Data Models

### Firestore Collections

```typescript
// snippets collection
interface Snippet {
  id: string;
  title: string;
  description: string;
  content: string;
  category: string;
  tags: string[];
  ernVersion?: string;  // "3.8.2", "4.2", or "4.3"
  author: {
    uid: string;
    displayName: string;
  };
  votes: number;
  created: Timestamp;
  updated: Timestamp;
}

// validation_history collection (authenticated users)
interface ValidationHistory {
  id: string;
  userId: string;
  timestamp: Timestamp;
  fileName?: string;
  valid: boolean;
  errorCount: number;
  version: string;      // ERN version used
  profile: string;
}

// api_keys collection
interface ApiKey {
  id: string;
  userId: string;
  key: string;
  created: Timestamp;
  lastUsed: Timestamp;
  requestCount: number;
  rateLimit: number;
}
```

## Implementation Roadmap

### Week 1-2: Project Setup ✓
- [x] Initialize monorepo structure
- [x] Configure Firebase project
- [x] Setup Vue 3 + Vite app
- [x] Implement CSS architecture and theme system
- [x] Configure CI/CD (GitHub Actions)
- [x] Setup development environment docs

### Week 3-4: Core Validation Engine ✓
- [x] Implement XML parser wrapper
- [x] Build multi-version ERN validator
- [x] Support ERN 3.8.2, 4.2, and 4.3
- [x] Create error formatter
- [x] Profile-specific validation

### Week 5-6: Web Interface ✓
- [x] Design and implement UI components
- [x] Implement theme switcher
- [x] File upload functionality
- [x] Direct XML input
- [x] Results display with error details
- [x] Responsive design
- [x] Dynamic profile selection based on version

### Week 7-8: API Development
- [x] REST API endpoints
- [x] Multi-version validation endpoint
- [x] Formats discovery endpoint
- [ ] Rate limiting
- [ ] API documentation
- [ ] Client SDK (npm package)
- [ ] Integration tests

### Week 9-10: Knowledge Base
- [ ] Snippet management UI
- [ ] Search and filtering
- [ ] Voting system
- [ ] Authentication flow
- [ ] Moderation tools

### Week 11-12: Polish & Launch
- [ ] Performance optimization
- [ ] CSS optimization
- [ ] Security audit
- [ ] Documentation site
- [ ] Example integrations
- [ ] Launch announcement

## Security Considerations

1. **Input Validation**:
   - File size limits (10MB default)
   - XML bomb protection
   - Content type verification

2. **Rate Limiting**:
   - Anonymous: 10 requests/minute
   - Authenticated: 60 requests/minute
   - API Key: Configurable

3. **Authentication**:
   - Firebase Auth with email/Google
   - JWT verification for API calls
   - Role-based access for moderation

4. **Data Privacy**:
   - No storage of validated content (unless explicitly saved)
   - Encrypted API keys
   - GDPR compliance

## Community Engagement

1. **Documentation**:
   - Comprehensive API docs
   - Integration examples
   - Video tutorials
   - Contributing guide

2. **Outreach**:
   - DDEX working group presentation
   - Blog post series
   - Conference talks
   - Partner with music tech organizations

3. **Support**:
   - GitHub Issues
   - Discord community
   - Stack Overflow monitoring
   - Regular office hours

## Success Metrics

- **Adoption**: 1000+ validations/week within 3 months
- **API Usage**: 50+ registered developers
- **Community**: 100+ contributed snippets
- **Performance**: <2s validation for typical files
- **Reliability**: 99.9% uptime

## Future Phases Integration

### Phase 2 (DSR-Flow) Preparation:
- Shared authentication system
- Common UI components library
- Reusable validation patterns

### Phase 3 (DDEX Workbench) Foundation:
- User management system
- Project/workspace concept
- Collaborative features groundwork

## Open Source Strategy

1. **License**: MIT License
2. **Contribution Model**: 
   - Clear contributing guidelines
   - Code of conduct
   - Issue templates
   - PR review process
3. **Transparency**:
   - Public roadmap
   - Regular releases
   - Community calls