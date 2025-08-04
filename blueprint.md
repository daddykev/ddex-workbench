# DDEX Workbench - Blueprint

## Project Overview

DDEX Workbench is an open-source suite of tools for working with DDEX standards, starting with ERN validation (supporting versions 3.8.2, 4.2, and 4.3) and expanding to include DSR processing and collaborative metadata management.

### Vision
Create modern, accessible tools that lower the barrier to entry for DDEX implementation, serving everyone from independent artists to major labels.

### Official App
**URL**: [https://ddex-workbench.org](https://ddex-workbench.org)

### Phase 1: DDEX ERN Validation
A web-based ERN validator supporting multiple versions (3.8.2, 4.2, 4.3) with comprehensive API documentation and community knowledge sharing capabilities.

## Technical Architecture

### Backend
- **Platform**: Firebase
- **Functions**: Node.js 18+ Cloud Functions (for validation and API keys only)
- **Database**: Firestore (direct client access for snippets, server validation for API operations)
- **Authentication**: Firebase Auth
- **Hosting**: Firebase Hosting
- **Storage**: Cloud Storage (for file uploads)

### Data Access Strategy
- **Snippets**: Direct Firestore access from client using Firebase SDK
  - Eliminates CORS issues
  - Faster performance (no HTTP overhead)
  - Real-time updates capability
  - Security enforced through Firestore rules
- **Validation**: Server-side Cloud Functions (requires XML processing)
- **API Keys**: Server-side Cloud Functions (requires secure key generation)

## Current API Status (Production-Ready)

### Live Endpoints

#### Public Endpoints
- `GET /api/health` - Health check endpoint
- `GET /api/formats` - Get supported DDEX versions and profiles
- `POST /api/validate` - Validate DDEX XML content
  - No authentication required for basic access
  - Supports anonymous access (10 req/min rate limit)
  - Supports API key authentication (60 req/min rate limit)
  - Multi-version support (ERN 3.8.2, 4.2, and 4.3)
  - Profile-specific validation
  - Three-stage validation pipeline (XSD, Business Rules, Profile)

#### Authenticated Endpoints (Firebase Auth Required)
- `GET /api/keys` - List user's API keys
- `POST /api/keys` - Create new API key (max 5 per user)
- `DELETE /api/keys/:id` - Revoke API key (soft delete)

#### Direct Firestore Operations (No API Required)
- **Snippets CRUD**: Create, read, update, delete operations handled directly through Firestore SDK
- **Voting**: User votes stored in subcollections, counts updated atomically
- **Real-time Updates**: Capability for live snippet updates (future enhancement)

This architectural change simplifies the stack and improves performance while maintaining security through Firestore rules.

### Security Implementation
- **API Key Authentication**: SHA-256 hashed keys with `ddex_` prefix
- **Rate Limiting**: In-memory rate limiting with express-rate-limit
  - Anonymous: 10 requests/minute
  - Authenticated: 60 requests/minute
- **Firestore Security Rules**: Deployed and enforced
- **CORS**: Configured for production and development origins
- **Trust Proxy**: Enabled for Cloud Functions environment

### Example API Usage

```bash
# Anonymous validation
curl -X POST https://api.ddex-workbench.org/v1/validate \
  -H "Content-Type: application/json" \
  -d '{
    "content": "<?xml version=\"1.0\"?>...",
    "type": "ERN",
    "version": "4.3",
    "profile": "AudioAlbum"
  }'

# With API Key for higher rate limits
curl -X POST https://api.ddex-workbench.org/v1/validate \
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
│   │   ├── NavBar.vue         # Navigation with auth state
│   │   ├── CreateSnippetModal.vue  # Modal for creating new snippets
│   │   └── EditSnippetModal.vue    # Modal for editing existing snippets
│   ├── views/                 # Vue router views/pages
│   │   ├── SplashPage.vue     # Landing page with features overview
│   │   ├── ValidatorView.vue  # Enhanced validator with real-time validation
│   │   ├── ApiDocsView.vue    # Comprehensive API documentation
│   │   ├── SnippetsView.vue   # Community snippets page with CRUD operations
│   │   ├── DeveloperView.vue  # Developer CV
│   │   ├── UserSettings.vue   # User profile & API keys management
│   │   ├── NotFoundView.vue   # 404 page
│   │   ├── auth/              # Authentication views
│   │   │   ├── LoginView.vue  # Login page
│   │   │   └── SignupView.vue # Registration page
│   │   └── legal/             # Legal pages
│   │       ├── PrivacyView.vue
│   │       ├── TermsView.vue
│   │       └── LicenseView.vue
│   ├── services/              # External service integrations
│   │   ├── api.js             # API calls for validation and API keys only
│   │   └── snippets.js        # Direct Firestore operations for snippets
│   ├── composables/           # Vue composables
│   │   └── useAuth.js         # Authentication composable
│   ├── utils/                 # Utility functions
│   │   ├── themeManager.js    # Theme switching logic
│   │   └── debounce.js        # Debounce utility for real-time validation
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
│   │   ├── validate.js        # Enhanced validation endpoint
│   │   └── keys.js            # API key management
│   ├── middleware/            # Express middleware
│   │   ├── apiKeyAuth.js      # API key authentication
│   │   └── rateLimiter.js     # Rate limiting with trust proxy fix
│   ├── validators/            # Validation modules
│   │   ├── ernValidator.js    # Multi-version ERN validator
│   │   ├── xsdValidator.js    # XSD schema validation (libxmljs2)
│   │   ├── schematronValidator.js # Profile-specific validation
│   │   └── validationOrchestrator.js # Combines all validators
│   ├── schemas/               # Schema management
│   │   ├── manager/           
│   │   │   └── schemaManager.js # Schema download/cache management
│   │   ├── ern/               # Downloaded XSD schemas
│   │   │   ├── 4.3/           # ERN 4.3 schemas
│   │   │   ├── 4.2/           # ERN 4.2 schemas
│   │   │   └── 3.8.2/         # ERN 3.8.2 schemas
│   │   └── schematron/        # Schematron rules (future)
│   ├── scripts/               # Utility scripts
│   │   └── downloadSchemas.js # Pre-download XSD schemas
│   ├── index.js               # Functions entry with trust proxy
│   ├── package.json           # Functions dependencies
│   └── package-lock.json      # Locked dependencies
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
├── cors.json                  # CORS configuration for Storage
├── .firebaserc                # Firebase project alias (git ignored)
├── .gitignore                 # Git ignore file
├── .env                       # Environment variables (git ignored)
├── .env.example               # Environment variables template
├── package.json               # Project dependencies
├── package-lock.json          # Locked dependencies
├── README.md                  # Project documentation
├── LICENSE                    # MIT License
├── CONTRIBUTING.md            # Contribution guidelines
└── blueprint.md               # This file - project blueprint
```

## Enhanced Validation Architecture

### Validation Pipeline

The enhanced validator now implements a three-stage validation pipeline that matches and exceeds the official DDEX validator:

1. **XSD Schema Validation** (`xsdValidator.js`)
   - Uses `libxmljs2` for native XML schema validation
   - Validates against official DDEX XSD schemas downloaded from ddex.net
   - Provides detailed error messages with line/column numbers
   - Checks XML structure and data types

2. **Business Rules Validation** (`ernValidator.js`)
   - Custom validation logic for ERN-specific rules
   - Multi-version support (3.8.2, 4.2, 4.3)
   - Checks required elements, references, and relationships
   - Validates ISRC, ISNI, and other identifiers

3. **Profile Validation** (`schematronValidator.js`)
   - Profile-specific rules (AudioAlbum, AudioSingle, Video, etc.)
   - Currently implements simplified profile validation
   - Prepared for full Schematron integration
   - Validates profile-specific requirements

### Validation Orchestrator

The `validationOrchestrator.js` coordinates all three validators:

```javascript
// Validation flow
1. XSD Validation → Stop if fatal errors
2. Business Rules → Continue even with errors
3. Profile Rules → Only if profile specified
4. Aggregate Results → Sort by line number, separate warnings
```

### Schema Management

- **Pre-download Strategy**: Schemas are downloaded before deployment using `scripts/downloadSchemas.js`
- **Version Support**: Full XSD schemas for ERN 3.8.2, 4.2, and 4.3
- **Namespace Handling**: Proper namespace resolution for imports
- **Fallback Support**: Development mode can download schemas on-demand

### Frontend Enhancements

The `ValidatorView.vue` component now includes:

- **Three Input Methods**: File upload, paste, URL loading
- **Real-time Validation**: Debounced validation as you type
- **Advanced Options**: Validation mode, strict mode, reference checking
- **Enhanced Error Display**: 
  - Grouped errors by line/type/severity
  - Collapsible error groups
  - Searchable and filterable errors
  - Error context with XML snippets
  - DDEX Knowledge Base links
- **Validation Timeline**: Visual representation of validation steps with timing
- **Export Options**: Download PDF reports (pending), share results, copy response
- **Validation History**: View recent validations (authenticated users)
- **Mobile Responsive**: Full functionality on all devices

### API Documentation Page

The `ApiDocsView.vue` provides comprehensive API documentation:

- **Interactive Code Examples**: 
  - Support for cURL, JavaScript, Python, and PHP
  - Complete working examples for common use cases
  - File validation examples
- **Detailed Endpoint Documentation**:
  - Request/response formats
  - Parameter descriptions
  - Authentication requirements
  - Rate limiting information
- **Live Response Examples**: Actual JSON responses for all endpoints
- **Version Information**: Supported DDEX versions and profiles with descriptions
- **Sticky Navigation**: Easy navigation through documentation sections
- **Mobile Responsive**: Optimized for all screen sizes

## Authentication Architecture

### Auth Flow

The application uses Firebase Authentication with the following features:

1. **Authentication Methods**:
   - Email/Password registration and login
   - Google OAuth integration
   - Persistent sessions with automatic token refresh

2. **User Management**:
   - User profiles stored in Firestore `users` collection
   - Display name customization
   - API key generation and management
   - Usage statistics tracking (pending)

3. **Protected Routes**:
   - `/settings` - Requires authentication
   - `/login`, `/signup` - Redirects to home if already authenticated
   - API endpoints - Optional authentication for higher rate limits

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
  warningCount: number;
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

### API Response Types

```typescript
// Validation Response
interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  metadata: ValidationMetadata;
}

interface ValidationError {
  line: number;
  column: number;
  message: string;
  severity: 'error' | 'warning' | 'info';
  rule: string;
  context?: string;    // XML snippet showing error
  suggestion?: string; // Helpful suggestion for fixing
}

interface ValidationMetadata {
  processingTime: number;
  schemaVersion: string;
  profile?: string;
  validatedAt: string;
  errorCount: number;
  warningCount: number;
  validationSteps: ValidationStep[];
}

interface ValidationStep {
  type: 'XSD' | 'BusinessRules' | 'Schematron';
  duration: number;
  errorCount: number;
}
```

## Phase 1 Features

### 1. Landing Page
- **Modern hero section** with value proposition
- **Feature cards** for Validator, Snippets, and API
- **ERN 4.3 migration urgency** messaging
- **Future roadmap** preview (DSR-Flow, DDEX Workbench)
- **Call-to-action** for immediate engagement

### 2. Web Validator Interface
- **File Upload**: Drag-and-drop or file picker for XML files
- **Text Input**: Direct XML pasting with syntax highlighting
- **URL Loading**: Load XML from external URLs
- **Version Selection**: Choose between ERN 3.8.2, 4.2, or 4.3
- **Profile Selection**: Dynamic profile options based on selected version
- **Real-time Validation**: Validate as you type with debouncing
- **Advanced Options**: Validation mode, strict mode, reference checking
- **Validation Results**: 
  - Clear pass/fail status with processing timeline
  - Grouped errors by type/line/severity with collapsible sections
  - Searchable and filterable error list
  - Detailed error messages with DDEX KB links
  - Error context showing XML snippets
  - Version-specific validation rules
  - Separate warnings from errors
  - Share results functionality
- **Export Options**: Download validation reports (pending)
- **History Tracking**: View recent validations for authenticated users (UI complete, backend pending)

### 3. Authentication System
- **Registration**: Email/password with display name
- **Login Options**: Email/password or Google OAuth
- **User Settings**: 
  - Profile management
  - API key generation and management
  - Usage statistics (UI complete, tracking pending)
- **Session Management**: Persistent login with automatic token refresh

### 4. Public Validation API
```typescript
// POST /validate
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
    "rule": string,
    "context": string,
    "suggestion": string
  }],
  "warnings": [...],
  "metadata": {
    "processingTime": number,
    "schemaVersion": string,
    "profile": string,
    "validatedAt": string,
    "errorCount": number,
    "warningCount": number,
    "validationSteps": [{
      "type": "XSD" | "BusinessRules" | "Schematron",
      "duration": number,
      "errorCount": number
    }]
  }
}

// Authentication via API Key (optional)
headers: {
  "X-API-Key": "ddex_your-api-key"
}
```

### 5. API Documentation
- **Comprehensive Documentation Page**: Full API reference with examples
- **Interactive Code Examples**: 4 languages with syntax highlighting
- **Live Response Examples**: Actual API responses
- **Authentication Guide**: How to get and use API keys
- **Rate Limiting Info**: Clear limits and upgrade paths
- **Version Support**: Detailed ERN version information
- **Error Reference**: Complete error response documentation

### 6. Community Knowledge Base (Pending)
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

### 7. User Features
- **Anonymous Usage**:
  - Core validation without login
  - Read API documentation
  - Basic API access (rate limited to 10 req/min)
- **Authenticated Features**:
  - View validation history (UI ready)
  - Generate and manage API keys
  - Higher API rate limits (60 req/min)
  - Contribute and vote on snippets (pending)
  - Usage analytics dashboard (UI ready)

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
- **Auth Components**: `.auth-page`, `.auth-card`, `.user-menu`, `.user-avatar`

### Utility Classes

Semantic utility classes for:
- **Spacing**: `.mt-md`, `.p-lg`, `.mb-xl` (margin/padding with size modifiers)
- **Typography**: `.text-primary`, `.text-lg`, `.font-semibold`
- **Display**: `.hidden`, `.block`, `.flex`
- **Colors**: `.bg-surface`, `.text-error`, `.border-primary`

## Implementation Roadmap

### Week 1-2: Project Setup
- [x] Initialize monorepo structure
- [x] Configure Firebase project
- [x] Setup Vue 3 + Vite app
- [x] Implement CSS architecture and theme system
- [x] Configure CI/CD (GitHub Actions)
- [x] Setup development environment docs

### Week 3-4: Core Validation Engine
- [x] Implement XML parser wrapper
- [x] Build multi-version ERN validator
- [x] Support ERN 3.8.2, 4.2, and 4.3
- [x] Create error formatter
- [x] Profile-specific validation

### Week 5-6: Web Interface
- [x] Design and implement UI components
- [x] Implement theme switcher
- [x] File upload functionality
- [x] Direct XML input
- [x] URL loading functionality
- [x] Results display with error details
- [x] Responsive design
- [x] Dynamic profile selection based on version
- [x] Real-time validation

### Week 7-8: Authentication & User Features
- [x] Firebase Auth integration
- [x] Login/Signup pages
- [x] User settings page
- [x] API key management UI
- [x] Protected routes
- [x] Auth state in navigation
- [ ] Usage statistics tracking (backend)
- [ ] Validation history (backend)

### Week 9-10: API Development
- [x] REST API endpoints
- [x] Multi-version validation endpoint
- [x] API key validation
- [x] Rate limiting implementation
- [x] API documentation page (comprehensive)
- [x] Trust proxy configuration
- [x] Interactive code examples
- [ ] Client SDK (npm package)
- [ ] File upload endpoint

### Week 11-12: Enhanced Validation
- [x] XSD schema validation integration
- [x] Schema download scripts
- [x] Validation orchestrator
- [x] Profile-specific validation
- [x] Enhanced error reporting with context
- [x] Validation steps timeline
- [x] Collapsible error groups
- [x] Error search and filtering
- [x] DDEX KB links integration
- [ ] Full Schematron integration
- [ ] PDF report generation

### Week 13-14: Knowledge Base (Next Phase)
- [ ] Snippet management UI
- [ ] Search and filtering
- [ ] Voting system implementation
- [ ] Comment system
- [ ] Moderation tools
- [ ] Snippet categories

### Week 15-16: Polish & Launch
- [ ] Performance optimization
- [ ] Security audit
- [ ] Complete test coverage
- [ ] Documentation site
- [ ] Marketing website
- [ ] Launch announcement

## API Security Implementation

1. **Authentication Security**:
   - Firebase Auth handles password hashing and session management
   - OAuth integration for secure third-party login
   - Secure token storage and automatic refresh
   - HTTPS-only for all auth operations

2. **API Security**:
   - API key generation with secure random tokens
   - SHA-256 key hashing before storage
   - Rate limiting per key
   - Request validation and sanitization

3. **Input Validation**:
   - File size limits (10MB default)
   - XML bomb protection
   - Content type verification
   - XSS prevention in user content

4. **Data Privacy**:
   - No storage of validated content (unless explicitly saved)
   - User data isolation
   - GDPR compliance considerations
   - Secure API key handling

## Current Production Status

### What's Live:
- Full authentication system with Google OAuth ✓
- API key generation and management ✓
- Multi-version ERN validation (3.8.2, 4.2, 4.3) ✓
- Enhanced three-stage validation pipeline ✓
- Rate-limited public API ✓
- Comprehensive API documentation with interactive examples ✓
- Secure Firestore rules ✓
- User settings management ✓
- Theme switching (light/dark/auto) ✓
- Real-time validation with debouncing ✓
- Advanced validation options ✓
- URL loading support ✓
- Enhanced error display with:
  - Grouping by line/type/severity ✓
  - Collapsible sections ✓
  - Search and filtering ✓
  - Error context with XML snippets ✓
  - DDEX KB links ✓
- Validation timeline visualization ✓
- Share results functionality ✓

### Tested & Confirmed:
- API key authentication working ✓
- Rate limiting enforced (10/60 req/min) ✓
- XSD schema validation (with pre-downloaded schemas) ✓
- Business rules validation ✓
- Profile-specific validation ✓
- Namespace XML parsing working ✓
- Error reporting with detailed messages ✓
- CORS properly configured ✓
- Trust proxy enabled ✓
- API documentation fully functional ✓
- Interactive code examples in 4 languages ✓

### API Base URL:
```
https://api.ddex-workbench.org/v1
```

### Live Application:
```
https://ddex-workbench.web.app
```

## Success Metrics

- **Adoption**: 1000+ validations/week within 3 months
- **User Growth**: 500+ registered users in first quarter
- **API Usage**: 50+ active API keys
- **Community**: 100+ contributed snippets
- **Performance**: <2s validation for typical files ✓ (Currently ~2-100ms depending on mode)
- **Reliability**: 99.9% uptime

## Next Immediate Steps

1. **Complete Backend Features**:
   - Implement validation history storage
   - Add usage statistics tracking
   - Create file upload endpoint
   - Build PDF report generation

2. **Begin Knowledge Base Phase**:
   - Implement snippets API endpoints
   - Build snippet management UI
   - Add voting system
   - Create comment functionality

3. **Polish for Launch**:
   - Create npm client SDK
   - Performance optimization
   - Security audit
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
- Collaborative features groundwork
- Real-time capabilities (via Firebase) ✓

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

## Deployment Process

1. **Pre-deployment**:
   ```bash
   cd functions
   node scripts/downloadSchemas.js  # Download XSD schemas
   cd ..
   ```

2. **Deploy**:
   ```bash
   firebase deploy
   ```

3. **Post-deployment Verification**:
   - Test at https://ddex-workbench.web.app
   - Verify all validation modes work
   - Check real-time validation
   - Test file upload and URL loading
   - Confirm API documentation displays correctly
   - Test interactive code examples