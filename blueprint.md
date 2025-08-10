# DDEX Workbench - Blueprint

## Project Overview

DDEX Workbench is an open-source suite of tools for working with DDEX standards, starting with ERN validation (supporting versions 3.8.2, 4.2, and 4.3) and expanding to include DSR processing and collaborative metadata management.

### Vision
Create modern, accessible tools that lower the barrier to entry for DDEX implementation, serving everyone from independent artists to major labels.

### Official App
**URL**: [https://ddex-workbench.org](https://ddex-workbench.org)

### Phase 1: DDEX ERN Validation
A web-based ERN validator supporting multiple versions (3.8.2, 4.2, 4.3) with comprehensive API documentation, multiple SDK options, and community knowledge sharing capabilities.

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

## Available SDKs

### JavaScript/TypeScript SDK ✅
**npm Package**: [@ddex-workbench/sdk](https://www.npmjs.com/package/@ddex-workbench/sdk)
- Full TypeScript support
- Browser and Node.js compatible
- Promise-based API
- Version: 1.0.0+

```bash
npm install @ddex-workbench/sdk
```

### Python SDK ✅
**PyPI Package**: [ddex-workbench](https://pypi.org/project/ddex-workbench/)
- Full type hints with dataclasses
- Python 3.7+ support
- Async support with retry logic
- Version: 1.0.0+

```bash
pip install ddex-workbench
```

## Quick Start Examples

### JavaScript/TypeScript
```javascript
import { DDEXClient } from '@ddex-workbench/sdk';

const client = new DDEXClient({ apiKey: 'ddex_your-api-key' });
const result = await client.validate(xmlContent, { version: '4.3' });
```

### Python
```python
from ddex_workbench import DDEXClient

client = DDEXClient(api_key="ddex_your-api-key")
result = client.validate(xml_content, version="4.3")
```

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

## Strategic Positioning

### From Library to Platform

DDEX Workbench represents a paradigm shift in approach:

- **Traditional Model**: Language-specific libraries requiring technical expertise
- **Our Model**: Web-based, collaborative platforms accessible to all skill levels
- **Value Proposition**: Lower the barrier to entry while providing enterprise-grade capabilities

### The Firebase Advantage

Our technical architecture leverages Firebase's integrated ecosystem to deliver capabilities that standalone libraries cannot match:

- **Serverless Scale**: Handle validation requests from individual artists to major labels without infrastructure management
- **Real-time Collaboration**: Enable teams to work on releases simultaneously—a first for DDEX tooling
- **Unified Platform**: Authentication, storage, database, and functions in one coherent system

### Competitive Advantage: Open Profile Validation

A key differentiator for DDEX Workbench is our approach to profile validation:

- **No Proprietary Dependencies**: While official DDEX Schematron files require membership or special access, our validator provides equivalent validation using built-in rules
- **Transparent Validation**: Unlike black-box validators, our rules are open source and clearly documented
- **Comprehensive Coverage**: Full support for all standard profiles (AudioAlbum, AudioSingle, Video, Mixed, Classical, Ringtone, DJ)
- **Version Intelligence**: Rules adapt automatically to ERN version differences
- **Community Benefit**: Democratizes access to professional-grade DDEX validation

### Innovation Through Simplification

The ERN Message Sandbox represents our commitment to democratizing DDEX:

- **Learning by Doing**: Users can create valid ERN messages without reading 200+ pages of specification
- **Progressive Complexity**: Start with minimal required fields, add complexity as needed
- **Instant Feedback**: Real-time validation shows what works and what doesn't
- **Template Library**: Common scenarios pre-configured for quick starts
- **Export to Production**: Generated ERN messages can be used in real workflows

## Project Structure

```
ddex-workbench/
├── src/                       # Vue 3 application source
│   ├── components/            # Vue components
│   │   ├── NavBar.vue         # Navigation with auth state
│   │   ├── CreateSnippetModal.vue  # Modal for creating new snippets
│   │   ├── EditSnippetModal.vue    # Modal for editing existing snippets
│   │   └── sandbox/           # ERN Sandbox components
│   │       ├── ProductForm.vue     # Product metadata form
│   │       └── ResourceForm.vue    # Resource (track/video) form
│   ├── views/                 # Vue router views/pages
│   │   ├── SplashPage.vue     # Landing page with features overview
│   │   ├── ValidatorView.vue  # Enhanced validator with real-time validation
│   │   ├── ApiDocsView.vue    # Comprehensive API documentation
│   │   ├── SnippetsView.vue   # Community snippets page with CRUD operations
│   │   ├── SandboxView.vue    # ERN Sandbox message builder
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
│   │   ├── snippets.js        # Direct Firestore operations for snippets
│   │   ├── ernBuilder.js      # ERN XML generation service
│   │   └── deezerApi.js       # Deezer API wrapper for metadata import
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
│   │   ├── keys.js            # API key management
│   │   └── deezer.js          # Deezer API proxy endpoints
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
│   │   └── schematron/        # Empty - Schematron validation uses built-in rules
│   ├── scripts/               # Utility scripts
│   │   └── downloadSchemas.js # Pre-download XSD schemas
│   ├── index.js               # Functions entry with trust proxy
│   ├── package.json           # Functions dependencies
│   └── package-lock.json      # Locked dependencies
├── packages/                  # SDK packages
│   ├── sdk/                   # JavaScript/TypeScript SDK ✅
│   │   ├── src/               # SDK source code
│   │   │   ├── client.ts      # Main API client class
│   │   │   ├── validator.ts   # High-level validation helper
│   │   │   ├── types.ts       # TypeScript type definitions
│   │   │   ├── errors.ts      # Custom error classes and utilities
│   │   │   └── index.ts       # SDK entry point and exports
│   │   ├── dist/              # Built SDK files (git ignored)
│   │   │   ├── index.js       # CommonJS build
│   │   │   ├── index.mjs      # ES module build
│   │   │   ├── index.d.ts     # TypeScript declarations
│   │   │   └── *.map          # Source maps
│   │   ├── README.md          # SDK documentation and usage examples
│   │   ├── package.json       # SDK dependencies and scripts
│   │   ├── package-lock.json  # Locked SDK dependencies
│   │   ├── tsconfig.json      # TypeScript configuration
│   │   └── tsup.config.ts     # Build configuration
│   └── python-sdk/            # Python SDK ✅
│       ├── ddex_workbench/    # Python package source
│       │   ├── __init__.py    # Package initialization
│       │   ├── client.py      # Main API client class
│       │   ├── validator.py   # High-level validation helpers
│       │   ├── types.py       # Type definitions with dataclasses
│       │   ├── errors.py      # Exception classes
│       │   ├── utils.py       # Utility functions
│       │   └── py.typed       # Type hint marker
│       ├── tests/             # Test suite
│       │   ├── __init__.py
│       │   ├── test_client.py
│       │   ├── test_validator.py
│       │   └── test_integration.py
│       ├── examples/          # Example scripts
│       │   ├── basic_validation.py
│       │   ├── batch_processing.py
│       │   └── ci_integration.py
│       ├── README.md          # Python SDK documentation
│       ├── setup.py           # Package configuration
│       ├── requirements.txt   # Dependencies
│       ├── requirements-dev.txt # Development dependencies
│       ├── tox.ini            # Testing configuration
│       ├── MANIFEST.in        # Package manifest
│       ├── CHANGELOG.md       # Version history
│       └── LICENSE            # MIT License
├── public/                    # Static public assets
│   └── favicon.ico
├── docs/                      # Documentation
│   ├── API.md                 # API documentation
│   ├── SDK_JS.md              # JavaScript SDK guide
│   ├── SDK_PYTHON.md          # Python SDK guide
│   └── SETUP.md               # Setup instructions
├── .firebase/                 # Firebase cache (git ignored)
├── .vscode/                   # VS Code settings (git ignored)
├── index.html                 # HTML entry point
├── vite.config.js             # Vite configuration
├── firebase.json              # Firebase configuration
├── firestore.rules            # Firestore security rules
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
   - Profile-specific rules (AudioAlbum, AudioSingle, Video, Mixed, Classical, Ringtone, DJ)
   - Implements comprehensive built-in validation rules equivalent to official Schematron
   - No dependency on proprietary Schematron files - rules derived from DDEX specifications
   - Validates all profile-specific requirements with version awareness (3.8.2, 4.2, 4.3)

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

### Schematron Approach

Unlike XSD schemas which are publicly available, DDEX Schematron files for profile validation are not publicly accessible. Our solution:

- **Built-in Rules**: Comprehensive validation rules implemented directly in JavaScript
- **No Download Required**: No need to fetch or store Schematron (.sch) files
- **Equivalent Coverage**: Our rules provide the same validation coverage as official Schematron
- **Transparent Logic**: Rules are readable and maintainable, not black-box validation
- **Version-Aware**: Different rule sets for ERN 3.8.2, 4.2, and 4.3

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
- **Export Options**: Download JSON and text reports, share results, copy response
- **Mobile Responsive**: Full functionality on all devices

### API Documentation Page

The `ApiDocsView.vue` provides comprehensive API documentation:

- **Interactive Code Examples**: 
  - Support for cURL, JavaScript (SDK), Python (SDK), and PHP
  - Complete working examples for common use cases
  - File validation examples
- **Detailed Endpoint Documentation**:
  - Request/response formats
  - Parameter descriptions
  - Authentication requirements
  - Rate limiting information
- **Live Response Examples**: Actual JSON responses for all endpoints
- **Version Information**: Supported DDEX versions and profiles with descriptions
- **SDK Installation**: Both npm and PyPI packages documented
- **Sticky Navigation**: Easy navigation through documentation sections
- **Mobile Responsive**: Optimized for all screen sizes

## Multi-Language SDK Support

### Language Coverage
- ✅ **JavaScript/TypeScript** - Published to npm as `@ddex-workbench/sdk`
- ✅ **Python** - Published to PyPI as `ddex-workbench`
- 🔄 **PHP** - Planned for Phase 2
- 🔄 **Ruby** - Community contribution welcome
- 🔄 **Java** - Community contribution welcome
- 🔄 **Go** - Community contribution welcome

### SDK Feature Parity

| Feature | JavaScript SDK | Python SDK |
|---------|---------------|------------|
| Basic Validation | ✅ | ✅ |
| Batch Processing | ✅ | ✅ |
| Auto-detection | ✅ | ✅ |
| Type Safety | ✅ TypeScript | ✅ Type Hints |
| Retry Logic | ✅ | ✅ |
| File Upload | ✅ | ✅ |
| URL Validation | ✅ | ✅ |
| Report Generation | ✅ | ✅ |
| CI/CD Examples | ✅ | ✅ |
| Async Support | ✅ | ✅ |
| Published | ✅ npm | ✅ PyPI |

### SDK Publishing Status ✅

#### JavaScript SDK
The SDK is officially published to npm as `@ddex-workbench/sdk`:
- **npm Package**: [https://www.npmjs.com/package/@ddex-workbench/sdk](https://www.npmjs.com/package/@ddex-workbench/sdk)
- **Version**: 1.0.0+ (Semantic versioning)
- **License**: MIT
- **Weekly Downloads**: Growing 📈
- **Bundle Formats**: CommonJS, ESM, TypeScript definitions
- **Documentation**: Comprehensive README with examples

#### Python SDK
The SDK is officially published to PyPI as `ddex-workbench`:
- **PyPI Package**: [https://pypi.org/project/ddex-workbench/](https://pypi.org/project/ddex-workbench/)
- **Version**: 1.0.0+ (Semantic versioning)
- **License**: MIT
- **Downloads**: Track via [pypistats.org](https://pypistats.org/packages/ddex-workbench)
- **Python Support**: 3.7+ with full type hints
- **Documentation**: Comprehensive README with examples

### Browser Support

- Modern browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- Internet Explorer is not supported
- Requires Promise and async/await support

### Node.js Support

- Node.js 14.0.0 or higher
- Full ESM and CommonJS support
- Native FormData handling for file uploads

### Python Support

- Python 3.7.0 or higher
- Full type hints with dataclasses
- Async support with retry logic
- Compatible with CPython and PyPy

### Related Documentation

- [JavaScript SDK Documentation](https://www.npmjs.com/package/@ddex-workbench/sdk) - npm package page
- [Python SDK Documentation](https://pypi.org/project/ddex-workbench/) - PyPI package page
- [JavaScript SDK Source Code](https://github.com/daddykev/ddex-workbench/tree/main/packages/sdk) - GitHub repository
- [Python SDK Source Code](https://github.com/daddykev/ddex-workbench/tree/main/packages/python-sdk) - GitHub repository
- [API Documentation](https://ddex-workbench.org/api) - REST API reference
- [Code Examples](https://github.com/daddykev/ddex-workbench/tree/main/packages) - Sample implementations

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

// user_votes subcollection (under users)
interface UserVote {
  snippetId: string;
  vote: 1 | -1;       // upvote or downvote
  timestamp: Timestamp;
}

// Sandbox Data Models (in-memory only, not persisted)
interface SandboxProduct {
  upc: string;                  // 14-digit ICPN
  releaseReference: string;     // Internal reference (e.g., "R0")
  title: string;
  artist: string;
  label: string;
  releaseType: 'Album' | 'Single' | 'EP' | 'Video' | 'VideoAlbum';
  territoryCode: string;        // e.g., "Worldwide", "US", "GB"
  tracks: Array<{
    resourceReference: string;  // Links to resource
    sequenceNumber: number;
  }>;
}

interface SandboxResource {
  id: number;                   // Temporary ID for UI
  isrc: string;                 // 12-character ISRC
  resourceReference: string;    // e.g., "A1", "A2"
  title: string;
  artist: string;
  duration: string;             // ISO 8601 duration (e.g., "PT3M45S")
  type: 'MusicalWorkSoundRecording' | 'MusicalWorkVideoRecording' | 'Video';
  pLineYear: string;            // Copyright year
  pLineText: string;            // Full copyright text
  previewStartTime: number;     // In seconds
  fileUri: string;              // File reference
  territoryCode: string;
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
- **Future roadmap** preview
- **Call-to-action** for immediate engagement

### 2. Web Validator Interface
- **File Upload**: Drag-and-drop or file picker for XML files
- **Text Input**: Direct XML pasting with syntax highlighting
- **URL Loading**: Load XML from external URLs
- **Version Selection**: Choose between ERN 3.8.2, 4.2, or 4.3
- **Profile Selection**: Dynamic profile options based on selected version
- **Real-time Validation**: Validate as you type with debouncing
- **Advanced Options**: 
  - Validation mode (full, XSD only, business rules only, quick check)
  - Strict mode (treat warnings as errors)
  - Reference validation checking
- **Validation Results**: 
  - Clear pass/fail status with processing timeline
  - Validation steps visualization (XSD, Business Rules, Schematron) with timing
  - Grouped errors by type/line/severity with collapsible sections
  - Searchable and filterable error list
  - Detailed error messages with DDEX KB links
  - Error context showing XML snippets
  - Version-specific validation rules
  - Separate warnings from errors
  - Share results functionality
- **Export Options**: 
  - JSON report download
  - Text report download
  - Copy summary to clipboard

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
- **Interactive Code Examples**: Multiple languages with syntax highlighting
  - cURL
  - JavaScript (using SDK)
  - Python (using SDK)
  - PHP
- **Live Response Examples**: Actual API responses
- **Authentication Guide**: How to get and use API keys
- **Rate Limiting Info**: Clear limits and upgrade paths
- **Version Support**: Detailed ERN version information
- **SDK Installation**: Both npm and PyPI packages
- **Error Reference**: Complete error response documentation

### 6. Community Snippets Library
- **Direct Firestore Integration**: No API required, uses Firebase SDK
- **Features**:
  - Create, edit, delete snippets (authenticated users)
  - Search and filter by category, tags, version
  - Copy snippet to validator
  - Vote system (UI complete, implementation pending)
- **Categories**: Common Patterns, Complex Scenarios, Migration Examples

### 7. User Features
- **Anonymous Usage**:
  - Core validation without login
  - Read API documentation
  - View community snippets
  - Basic API access (rate limited to 10 req/min)
- **Authenticated Features**:
  - Generate and manage API keys
  - Higher API rate limits (60 req/min)
  - Create, edit, and manage snippets
  - Vote on snippets (pending implementation)

### 8. ERN Sandbox
- **Interactive Message Builder**: Visual form-based ERN creation
- **Deezer Integration** (NEW):
  - Import real album metadata by UPC/EAN
  - Automatic track listing with durations
  - ISRC batch retrieval with rate limiting
  - Instant population of all required fields
- **Templates**: Pre-filled templates for common scenarios
  - Audio Single
  - Audio Album  
  - Music Video
- **Product Form**: 
  - UPC/EAN entry with Deezer lookup
  - Release metadata (auto-filled from Deezer)
  - Release type selection
  - Territory configuration
- **Resource Management**:
  - Add/remove tracks or videos dynamically
  - ISRC entry (auto-filled from Deezer when available)
  - Duration input with human-readable format (MM:SS)
  - Copyright (P-line) information
  - File references
- **Real-time Features**:
  - Live XML generation as you type
  - Syntax-highlighted XML preview
  - One-click validation
  - Copy to clipboard
- **Validation Integration**: Seamlessly validate generated ERN messages

### 9. Deezer Metadata Import

The ERN Sandbox now features seamless integration with the Deezer API for automatic metadata import:

**Key Features**:
- **UPC/EAN Lookup**: Enter a product's barcode to instantly import metadata
- **Automatic Track Import**: All tracks from an album are imported with:
  - Track titles and artists
  - Duration information (converted to ISO 8601)
  - Track ordering/sequencing
  - Explicit content flags
- **ISRC Retrieval**: Optional batch fetching of ISRCs for all tracks
  - Rate-limited to respect Deezer API limits
  - Progress indicator during batch operations
  - Automatic retry on failures

**Technical Implementation**:
- **Backend Proxy**: Cloud Functions proxy to avoid CORS issues
- **Rate Limiting**: Intelligent batching to stay within API limits
- **Data Transformation**: Automatic conversion from Deezer format to DDEX ERN
- **Error Handling**: Graceful fallbacks when data is unavailable

**User Workflow**:
1. Enter UPC/EAN in the import field
2. Click "Import from Deezer"
3. Album and track data auto-populates the form
4. Optionally fetch ISRCs (with time estimate)
5. Edit/enhance the imported data as needed
6. Generate valid ERN XML instantly

**Benefits**:
- **Time Savings**: Reduce manual data entry from hours to seconds
- **Accuracy**: Minimize typos and data entry errors
- **Completeness**: Get comprehensive metadata including ISRCs
- **Real-World Testing**: Use actual release data for validation testing

**API Endpoints**:
```typescript
// Backend endpoints (proxied through Cloud Functions)
GET  /api/deezer/album/:upc        // Search album by UPC
GET  /api/deezer/album/:id/tracks  // Get all tracks for album
GET  /api/deezer/track/:id         // Get single track with ISRC
POST /api/deezer/tracks/batch-isrc // Batch fetch ISRCs for efficiency
```

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

### Week 9-10: API Development
- [x] REST API endpoints
- [x] Multi-version validation endpoint
- [x] API key validation
- [x] Rate limiting implementation
- [x] API documentation page (comprehensive)
- [x] Trust proxy configuration
- [x] Interactive code examples
- [x] JavaScript/TypeScript SDK (npm package) ✅
- [x] Python SDK (PyPI package) ✅
- [ ] File upload endpoint

### Week 11-12: Enhanced Validation
- [x] XSD schema validation integration
- [x] Schema download scripts (XSD only)
- [x] Validation orchestrator
- [x] Profile-specific validation (comprehensive built-in rules)
- [x] Enhanced error reporting with context
- [x] Validation steps timeline
- [x] Collapsible error groups
- [x] Error search and filtering
- [x] DDEX KB links integration
- [x] Schematron-equivalent validation (built-in rules)
- [x] JSON and text report generation

### Week 13-14: Community Features
- [x] Snippet management UI
- [x] Direct Firestore integration for snippets
- [x] Search and filtering
- [x] Snippet categories
- [x] Copy to validator functionality
- [ ] Voting system implementation
- [ ] Usage analytics tracking

### Week 15-16: Polish & Launch
- [x] JSON and text report generation
- [x] ERN Message Sandbox implementation
- [ ] Performance optimization
- [ ] Security audit
- [ ] Complete test coverage

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
- JavaScript SDK on npm (@ddex-workbench/sdk) ✓
- Python SDK on PyPI (ddex-workbench) ✓
- Enhanced three-stage validation pipeline ✓
- Rate-limited public API ✓
- Comprehensive API documentation with SDK examples ✓
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
- Profile-specific validation ✓ (comprehensive built-in rules equivalent to Schematron)
- BETA: ERN Sandbox with interactive form builder ✓
- BETA: Deezer API integration for metadata import ✓
- BETA: UPC/EAN lookup with automatic data population ✓
- BETA: Batch ISRC retrieval with rate limiting ✓
- BETA: Real-time ERN XML generation ✓

### SDK Availability:
```bash
# JavaScript/TypeScript
npm install @ddex-workbench/sdk

# Python
pip install ddex-workbench
```

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
- JavaScript SDK published to npm ✓
- Python SDK published to PyPI ✓

### API Base URL:
```
https://api.ddex-workbench.org/v1
```

### Live Application:
```
https://ddex-workbench.org
```

## Success Metrics

- **Adoption**: 1000+ validations/week within 3 months
- **User Growth**: 500+ registered users in first quarter
- **API Usage**: 50+ active API keys
- **SDK Downloads**: 
  - npm: Track via npm stats for @ddex-workbench/sdk
  - PyPI: Track via [pypistats.org](https://pypistats.org/packages/ddex-workbench) for ddex-workbench
- **Community**: 100+ contributed snippets
- **Performance**: <2s validation for typical files ✓ (Currently ~2-100ms depending on mode)
- **Reliability**: 99.9% uptime

## Future Phases Integration

### Phase 2 (ERN Sandbox) In-progress:
- Interactive form-based ERN creation ✓
- Multiple templates (Single, Album, Video) ✓
- Real-time XML generation ✓
- Integrated validation ✓

### Phase 3 (DSR-Flow) Preparation:
- Shared authentication system
- Common UI components library
- Reusable validation patterns
- API infrastructure foundation

## SDK Development Guidelines

### For SDK Contributors

#### Python SDK Maintenance
```bash
# Version update process
cd packages/python-sdk
# 1. Update version in setup.py and __init__.py
# 2. Update CHANGELOG.md
# 3. Build and test
python -m build
pytest tests/
# 4. Publish to PyPI
twine upload dist/*
# 5. Tag release
git tag python-sdk-v1.x.x
git push origin python-sdk-v1.x.x
```

#### JavaScript SDK Maintenance
```bash
# Version update process
cd packages/sdk
# 1. Update version in package.json
# 2. Build and test
npm run build
npm test
# 3. Publish to npm
npm publish
# 4. Tag release
git tag js-sdk-v1.x.x
git push origin js-sdk-v1.x.x
```

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
   node scripts/downloadSchemas.js  # Download XSD schemas (Note: Schematron validation uses built-in rules)
   cd ..
   ```

2. **Deploy**:
   ```bash
   firebase deploy
   ```

3. **SDK Updates**:
   ```bash
   # JavaScript SDK
   cd packages/sdk
   npm run build && npm publish
   
   # Python SDK
   cd packages/python-sdk
   python -m build && twine upload dist/*
   ```

4. **Post-deployment Verification**:
   - Test at https://ddex-workbench.org
   - Verify all validation modes work
   - Check real-time validation
   - Test file upload and URL loading
   - Confirm API documentation displays correctly
   - Test interactive code examples
   - Verify SDK installations from npm and PyPI