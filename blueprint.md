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
- **Icons**: FontAwesome (free icons)
- **Authentication**: Firebase Auth with email/password and Google OAuth

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

## Current API Status (Production-Ready)

### Live Endpoints

#### Public Endpoints
- `GET /api/health` - Health check endpoint
- `GET /api/formats` - Get supported DDEX versions and profiles
- `POST /api/validate` - Validate DDEX XML content
  - Supports anonymous access (10 req/min rate limit)
  - Supports API key authentication (60 req/min rate limit)
  - Multi-version support (ERN 3.8.2, 4.2, 4.3)
  - Profile-specific validation

#### Authenticated Endpoints (Firebase Auth Required)
- `GET /api/keys` - List user's API keys
- `POST /api/keys` - Create new API key (max 5 per user)
- `DELETE /api/keys/:id` - Revoke API key (soft delete)

### Security Implementation
- **API Key Authentication**: SHA-256 hashed keys with `ddex_` prefix
- **Rate Limiting**: In-memory rate limiting with express-rate-limit
  - Anonymous: 10 requests/minute
  - Authenticated: 60 requests/minute
- **Firestore Security Rules**: Deployed and enforced
- **CORS**: Configured for production and development origins

### Example API Usage

```bash
# With API Key
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

## Project Structure

```
ddex-workbench/
├── src/                       # Vue 3 application source
│   ├── components/            # Vue components
│   │   └── NavBar.vue         # Navigation with auth state
│   ├── views/                 # Vue router views/pages
│   │   ├── SplashPage.vue     # Landing page with features overview
│   │   ├── ValidatorView.vue  # Main validator page
│   │   ├── SnippetsView.vue   # Community snippets page
│   │   ├── ApiDocsView.vue    # API documentation page
│   │   ├── UserSettings.vue   # User profile & API keys management
│   │   ├── auth/              # Authentication views
│   │   │   ├── LoginView.vue  # Login page
│   │   │   └── SignupView.vue # Registration page
│   │   └── legal/             # Legal pages
│   │       ├── PrivacyView.vue
│   │       ├── TermsView.vue
│   │       └── LicenseView.vue
│   ├── services/              # External service integrations
│   │   └── api.js             # API calls to Cloud Functions
│   ├── composables/           # Vue composables
│   │   └── useAuth.js         # Authentication composable
│   ├── utils/                 # Utility functions
│   │   └── themeManager.js    # Theme switching logic
│   ├── router/                # Vue Router configuration
│   │   └── index.js           # Routes with auth guards
│   ├── assets/                # Static assets and styles
│   │   ├── main.css           # Main stylesheet entry
│   │   ├── base.css           # CSS reset/normalize
│   │   ├── themes.css         # CSS custom properties
│   │   ├── components.css     # Reusable component classes
│   │   ├── fonts/             # Custom fonts
│   │   └── images/            # Images and icons
│   ├── App.vue                # Root component
│   ├── firebase.js            # Firebase configuration & exports
│   └── main.js                # Application entry point
├── functions/                 # Firebase Cloud Functions
│   ├── api/                   # API endpoints
│   │   ├── validate.js        # Validation endpoint ✓
│   │   ├── snippets.js        # Snippets CRUD (placeholder)
│   │   └── keys.js            # API key management ✓
│   ├── middleware/            # Express middleware
│   │   ├── apiKeyAuth.js      # API key authentication ✓
│   │   └── rateLimiter.js     # Rate limiting ✓
│   ├── validators/            # Validation modules
│   │   └── ernValidator.js    # Multi-version ERN validator ✓
│   ├── index.js               # Functions entry point ✓
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
├── firestore.rules            # Firestore security rules ✓
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

## Authentication Architecture

### Auth Flow

The application uses Firebase Authentication with the following features:

1. **Authentication Methods**:
   - Email/Password registration and login ✓
   - Google OAuth integration ✓
   - Persistent sessions with automatic token refresh ✓

2. **User Management**:
   - User profiles stored in Firestore `users` collection ✓
   - Display name customization ✓
   - API key generation and management ✓
   - Usage statistics tracking (pending)

3. **Protected Routes**:
   - `/settings` - Requires authentication ✓
   - `/login`, `/signup` - Redirects to home if already authenticated ✓
   - API endpoints - Optional authentication for higher rate limits ✓

### Auth Composable

The `useAuth` composable provides reactive authentication state:

```javascript
const { 
  user,              // Current user object
  loading,           // Auth initialization state
  error,             // Last auth error
  isAuthenticated,   // Computed auth status
  login,             // Email/password login
  signup,            // Create new account
  loginWithGoogle,   // Google OAuth
  logout,            // Sign out
  updateUserProfile  // Update user data
} = useAuth()
```

## Data Models

### Firestore Collections

```typescript
// users collection
interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  created: Timestamp;
  role: 'user' | 'admin';
  // Stats (denormalized for performance)
  validationCount?: number;
  snippetCount?: number;
  apiCallCount?: number;
}

// api_keys collection ✓
interface ApiKey {
  id: string;
  userId: string;
  name: string;
  hashedKey: string;    // SHA-256 hashed
  created: Timestamp;
  lastUsed?: Timestamp;
  requestCount: number;
  rateLimit: number;
  active: boolean;
}

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
  metadata?: {
    fileSize?: number;
    processingTime: number;
  };
}

// user_votes subcollection (under users)
interface UserVote {
  snippetId: string;
  vote: 1 | -1;       // upvote or downvote
  timestamp: Timestamp;
}
```

## Phase 1 Features

### 1. Landing Page ✓
- **Modern hero section** with value proposition
- **Feature cards** for Validator, Snippets, and API
- **ERN 4.3 migration urgency** messaging
- **Future roadmap** preview (DSR-Flow, DDEX Workbench)
- **Call-to-action** for immediate engagement

### 2. Web Validator Interface ✓
- **File Upload**: Drag-and-drop or file picker for XML files
- **Text Input**: Direct XML pasting with syntax highlighting
- **Version Selection**: Choose between ERN 3.8.2, 4.2, or 4.3
- **Profile Selection**: Dynamic profile options based on selected version
- **Validation Results**: 
  - Clear pass/fail status
  - Line-by-line error highlighting
  - Detailed error messages with DDEX KB links
  - Version-specific validation rules
- **History Tracking**: Save validation history for authenticated users (pending)

### 3. Authentication System ✓
- **Registration**: Email/password with display name
- **Login Options**: Email/password or Google OAuth
- **User Settings**: 
  - Profile management ✓
  - API key generation ✓
  - Usage statistics (pending)
- **Session Management**: Persistent login with automatic token refresh

### 4. Public Validation API ✓
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

// Authentication via API Key
headers: {
  "X-API-Key": "your-api-key"
}
```

### 5. Community Knowledge Base (Pending)
- **Snippet Categories**:
  - Common Patterns
  - Complex Scenarios
  - Migration Examples (ERN 3.8.2 to 4.3)
  - Version-specific examples
- **Features**:
  - Search and filter by version
  - Upvote/downvote (authenticated)
  - Comments (authenticated)
  - Copy to validator button
  - Tags for discovery
- **Contribution**: Authenticated users can submit snippets

### 6. User Features
- **Anonymous Usage**: ✓
  - Core validation without login
  - Read-only access to snippets
  - Basic API access (rate limited)
- **Authenticated Features**: ✓
  - Save validation history (pending)
  - Contribute and vote on snippets (pending)
  - Generate API keys ✓
  - Higher API rate limits ✓
  - Usage analytics dashboard (pending)

## CSS Architecture ✓

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
- **Auth Components**: `.auth-page`, `.auth-card`, `.user-menu`, `.user-avatar`

### Utility Classes

Semantic utility classes for:
- **Spacing**: `.mt-md`, `.p-lg`, `.mb-xl` (margin/padding with size modifiers)
- **Typography**: `.text-primary`, `.text-lg`, `.font-semibold`
- **Display**: `.hidden`, `.block`, `.flex`
- **Colors**: `.bg-surface`, `.text-error`, `.border-primary`

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

### Week 7-8: Authentication & User Features ✓
- [x] Firebase Auth integration
- [x] Login/Signup pages
- [x] User settings page
- [x] API key management UI
- [x] Protected routes
- [x] Auth state in navigation
- [ ] Usage statistics tracking
- [ ] Validation history

### Week 9-10: API Development ✓ (Current Phase - 90% Complete)
- [x] REST API endpoints
- [x] Multi-version validation endpoint
- [x] API key validation
- [x] Rate limiting implementation
- [x] API documentation page
- [ ] Client SDK (npm package)
- [ ] Integration examples
- [ ] File upload endpoint

### Week 11-12: Knowledge Base (Next Phase)
- [ ] Snippet management UI
- [ ] Search and filtering
- [ ] Voting system implementation
- [ ] Comment system
- [ ] Moderation tools
- [ ] Snippet categories

### Week 13-14: Polish & Launch
- [ ] Performance optimization
- [ ] Security audit
- [ ] Complete test coverage
- [ ] Documentation site
- [ ] Marketing website
- [ ] Launch announcement

## API Security Implementation ✓

1. **Authentication Security**:
   - Firebase Auth handles password hashing and session management ✓
   - OAuth integration for secure third-party login ✓
   - Secure token storage and automatic refresh ✓
   - HTTPS-only for all auth operations ✓

2. **API Security**:
   - API key generation with secure random tokens ✓
   - SHA-256 key hashing before storage ✓
   - Rate limiting per key ✓
   - Request validation and sanitization ✓

3. **Input Validation**:
   - File size limits (10MB default) ✓
   - XML bomb protection ✓
   - Content type verification ✓
   - XSS prevention in user content ✓

4. **Data Privacy**:
   - No storage of validated content (unless explicitly saved) ✓
   - User data isolation ✓
   - GDPR compliance considerations
   - Secure API key handling ✓

## Current Production Status

### What's Live:
- Full authentication system with Google OAuth
- API key generation and management
- Multi-version ERN validation (3.8.2, 4.2, 4.3)
- Rate-limited public API
- Secure Firestore rules
- User settings management
- Theme switching (light/dark/auto)

### Tested & Confirmed:
- API key authentication working
- Rate limiting enforced (10/60 req/min)
- Namespace XML parsing working
- Error reporting with detailed messages
- CORS properly configured

### API Base URL:
```
https://us-central1-ddex-workbench.cloudfunctions.net/app
```

## Success Metrics

- **Adoption**: 1000+ validations/week within 3 months
- **User Growth**: 500+ registered users in first quarter
- **API Usage**: 50+ active API keys
- **Community**: 100+ contributed snippets
- **Performance**: <2s validation for typical files ✓ (Currently ~2ms)
- **Reliability**: 99.9% uptime

## Next Immediate Steps

1. **Complete API Development Phase**:
   - Add validation history tracking
   - Create file upload endpoint
   - Build npm client SDK
   - Add integration examples

2. **Begin Knowledge Base Phase**:
   - Implement snippets API endpoints
   - Build snippet management UI
   - Add voting system
   - Create comment functionality

3. **Polish for Launch**:
   - Update all documentation with live examples
   - Add comprehensive error handling
   - Implement usage analytics
   - Create marketing materials

## Future Phases Integration

### Phase 2 (DSR-Flow) Preparation:
- Shared authentication system ✓
- Common UI components library ✓
- Reusable validation patterns ✓
- API infrastructure foundation ✓

### Phase 3 (DDEX Workbench) Foundation:
- User management system ✓
- Project/workspace concept (planned)
- Collaborative features groundwork ✓
- Real-time capabilities (via Firebase)

## Open Source Strategy

1. **License**: MIT License
2. **Contribution Model**: 
   - Clear contributing guidelines
   - Code of conduct
   - Issue templates
   - PR review process
3. **Community Building**:
   - Public roadmap
   - Regular releases
   - Community calls
   - Discord server (planned)