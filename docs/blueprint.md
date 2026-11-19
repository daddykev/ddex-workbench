# DDEX Workbench: Technical Blueprint

This document describes how DDEX Workbench works today: its architecture, validation pipeline, API, data models, SDKs, and how it is deployed and released.

## Overview

DDEX Workbench is an open-source web application and public API for validating DDEX ERN (Electronic Release Notification) messages. It supports ERN **4.3** (recommended), **4.2** and **3.8.2**.

- **Web app:** https://ddex-workbench.org
- **API:** `https://api.ddex-workbench.org/v1` (reference at https://ddex-workbench.org/api)
- **SDKs:** `@ddex-workbench/sdk` on npm and `ddex-workbench` on PyPI, both at 1.1.0
- **Versions:** the app and the API service are 1.1.0. `/health` reports the version from `ui/functions/package.json`.

The application code is MIT-licensed. The version-specific validation rules are private and are not part of the repository (see [Validation rules](#validation-rules)).

## Architecture

```
Browser ──► Firebase Hosting (Vue 3 SPA)
   │            │
   │            ├──► Firebase Auth
   │            └──► Firestore (snippets, user profiles; direct SDK access)
   │
   └──► api.ddex-workbench.org ──► Cloudflare Worker ──► Cloud Function "app" (Express)
                                                               ├──► Firestore (API keys)
                                                               └──► Deezer API (proxy)
```

### Firebase services in use

| Service | Used for |
|---|---|
| **Hosting** | The built Vue SPA (`ui/dist`), with every path rewritten to `index.html` |
| **Cloud Functions** | A single HTTPS function, `app` (us-central1), on Node.js 22, which serves the Express API |
| **Firestore** | `users`, `api_keys` and `snippets` collections |
| **Authentication** | Email/password (with email verification and password reset) and Google sign-in |
| **Analytics (GA4)** | Production builds on `ddex-workbench.org` only |

Cloud Storage isn't used: `ui/storage.rules` denies all access.

### Cloudflare Worker

`cloudflare/worker.js` fronts `api.ddex-workbench.org`:
- It strips the `/v1` prefix and forwards the request (method, headers, body and query string) to `https://us-central1-ddex-workbench.cloudfunctions.net/app`.
- It handles CORS for the API. It answers `OPTIONS` preflights with 204, and sets `Access-Control-Allow-Origin: *` on responses. It allows the `Content-Type`, `Authorization`, `X-API-Key` and `X-Client` headers, and exposes `RateLimit-Policy`, `RateLimit-Limit`, `RateLimit-Remaining`, `RateLimit-Reset` and `Retry-After`.

The Express app has its own CORS allow-list (`ui/functions/index.js`) for direct calls to the function, such as from the web app in development.

### Client IP and proxies

Anonymous rate limiting is keyed by client IP. `ui/functions/middleware/clientIp.js` resolves the IP by walking `X-Forwarded-For` from the right. It skips only Google front-end and Cloudflare addresses, and uses `CF-Connecting-IP` only when the peer is a verified Cloudflare address.

## Data access strategy

- **Direct Firestore access** from the browser for snippets and user profiles, enforced by `ui/firestore.rules`. This avoids an API round trip and CORS for simple CRUD.
- **The API (Cloud Function)** for validation, API key management (which needs server-side key generation and hashing), and the Deezer proxy (which avoids browser CORS limits).

The web app calls the function directly. In development that is `http://localhost:5001/ddex-workbench/us-central1/app`, and in production it is `https://api.ddex-workbench.org/v1` (see `ui/src/services/api.js`). When a user is signed in, it sends their Firebase ID token as `Authorization: Bearer <token>`.

## Validation pipeline

`ui/functions/validators/validationOrchestrator.js` runs these stages in order:

1. **XSD schema validation** (`xsdValidator.js`): `xmllint-wasm` 5.x checks the message against the official DDEX XSDs in `ui/functions/schemas/ern/<version>/`. If the XML isn't well-formed (a parser error), the pipeline **stops here**.
2. **Business rules** (`ernValidator.js`): ERN-specific checks, such as references between resources, releases, parties and deals, identifiers, durations, dates and territory codes.
3. **Version-specific rules** (`schematronValidator.js`), **whenever a profile is given**: 648 version-specific rules (ERN 3.8.2: 236, 4.2: 191, 4.3: 221) generated from the official DDEX XSD schemas via DDEX Rosetta.
4. **SVRL report** (`ui/functions/utils/svrlGenerator.js`), **only when requested** with `generateSVRL`. It is built from stage 3's results, so it needs a profile.

The response is assembled as follows:
- Issues with severity `warning` or `info` go to `warnings`. Issues with severity `error` or `fatal` go to `errors`.
- `valid` is `true` when there are no errors. Warnings don't affect it.
- Each issue's `message` and `context` are cut to 300 characters.
- Each stage returns at most 100 issues. The number left out is reported in `metadata.truncatedErrors`.
- `metadata.validationSteps` lists each stage that ran, with its duration and its full error and warning counts.

### Profiles

| Profile | ERN 4.3 | ERN 4.2 | ERN 3.8.2 |
|---|---|---|---|
| AudioAlbum | ✅ | ✅ | ✅ |
| AudioSingle | ✅ | ✅ | ✅ |
| Video | ✅ | ✅ | ✅ |
| Mixed | ✅ | ✅ | ✅ |
| ReleaseByRelease | | | ✅ |

These come from `ERN_CONFIGS` in `ernValidator.js`, which `/formats` also returns.

### Validation rules

The rule modules, `ui/functions/validators/rules/schematron-{382,42,43}.js`, are **private and gitignored**. They are loaded when the function starts. If they are missing, the server logs a startup error, `POST /validate` returns **503 `VALIDATION_RULES_UNAVAILABLE`**, and every other endpoint keeps working.

## API

The base URL is `https://api.ddex-workbench.org/v1`. The Worker maps `/v1/<path>` to `/<path>` on the function. The function also serves every route under `/api/<path>`; the web app uses these paths.

### Endpoints

| Method | Path | Auth | Rate limited | Purpose |
|---|---|---|---|---|
| `GET` | `/health` | None | No | `{ status, timestamp, service, version }` |
| `GET` | `/formats` | Optional | Yes | Supported types, versions and profiles |
| `POST` | `/validate` | Optional (API key or ID token) | Yes | Validate an ERN message |
| `GET` | `/validate/formats` | Optional | Yes | Same as `/formats` |
| `GET` | `/keys` | Firebase ID token | No | List the caller's API keys |
| `POST` | `/keys` | Firebase ID token | No | Create a key (`{ name }`). The key is returned once. |
| `DELETE` | `/keys/:keyId` | Firebase ID token | No | Revoke a key (soft delete; 204) |
| `GET` | `/deezer/album/:upc` | None | No | Look up an album by UPC/EAN |
| `GET` | `/deezer/album/:albumId/tracks` | None | No | An album's track list |
| `GET` | `/deezer/track/:trackId` | None | No | Track details (including ISRC) |
| `POST` | `/deezer/tracks/batch-isrc` | None | No | ISRCs for several tracks |

### `/validate` request formats

1. **A JSON body** (`Content-Type: application/json`):
   ```json
   { "content": "<ern:NewReleaseMessage …>", "type": "ERN", "version": "4.3", "profile": "AudioAlbum", "generateSVRL": true }
   ```
   `generateSVRL` may also be sent as `options.generateSVRL`.
2. **Raw XML** (`Content-Type: application/xml` or `text/xml`): the message is the request body, and `type`, `version`, `profile` and `generateSVRL` (`true` or `1`) are query parameters:
   ```bash
   curl -X POST -H "Content-Type: application/xml" --data-binary @release.xml \
     "https://api.ddex-workbench.org/v1/validate?version=4.3&profile=AudioAlbum"
   ```

`version` is required, and `type` defaults to `ERN` (the only supported type). In a JSON request, body fields take precedence over query parameters.

### Authentication and rate limits

`ui/functions/middleware/apiKeyAuth.js` identifies the caller, and `ui/functions/middleware/rateLimiter.js` applies the limit for that caller (one-minute windows):

| Caller | How it's identified | Limit | Counted per |
|---|---|---|---|
| API key | `X-API-Key: ddex_…`, or `Authorization: Bearer ddex_…` | 60/min | key |
| Signed-in web user | `Authorization: Bearer <Firebase ID token>` | 60/min | account |
| Anonymous | none | 10/min | client IP (IPv6 grouped by /56) |

- An API key takes precedence over a sign-in token.
- An invalid or revoked key returns **401 `INVALID_API_KEY`**. An invalid or expired ID token is treated as anonymous.
- Responses carry the `RateLimit-Policy`, `RateLimit-Limit`, `RateLimit-Remaining` and `RateLimit-Reset` headers. A 429 also carries `Retry-After`, and its body is `{ error: { code: "RATE_LIMIT_EXCEEDED", message, retryAfter } }`.
- Counters are held in memory, so each function instance counts separately.
- A valid key's `lastUsed` and `requestCount` are updated in the background.

### Limits and errors

| Status | When |
|---|---|
| 400 | Missing content, missing `version`, an unsupported `type`, or an empty raw-XML body |
| 400 (HTML) | Malformed JSON. The Functions runtime parses the body before Express and returns its own HTML error page. |
| 401 `INVALID_API_KEY` | The API key is malformed, unknown or revoked |
| 404 | Unknown endpoint |
| 413 | The request body is larger than 10 MB |
| 429 `RATE_LIMIT_EXCEEDED` | The rate limit was exceeded |
| 503 `VALIDATION_RULES_UNAVAILABLE` | The rule files aren't installed (`POST /validate` only) |
| 500 | Internal error |

## Authentication and routes

- Sign-in uses email/password or Google (popup). Sign-up sends a verification email, and password reset is available.
- `ui/src/composables/useAuth.js` holds reactive auth state and merges in the user's Firestore profile.
- A user's `users/{uid}` document is created at sign-up, or at their first Google sign-in, with `role: 'user'`.

Route guards in `ui/src/router/index.js`:

| Route | Meta | Behaviour |
|---|---|---|
| `/settings` | `requiresAuth` | Signed-out users are redirected to `/login?redirect=<path>` |
| `/api-keys` | `requiresAuth` | Signed-out users are redirected to `/login?redirect=<path>` |
| `/sandbox` | `requiresAuth` | Signed-out users are redirected to `/login?redirect=<path>` |
| `/admin/users` | `requiresAuth`, `requiresAdmin` | Signed-out users are redirected to `/login?redirect=<path>`; non-admins are redirected to `/` |
| `/login`, `/signup` | `requiresGuest` | Signed-in users are redirected to `/` |

After sign-in, `LoginView.vue` returns the user to the `redirect` path, but only if it's a same-site path (it starts with `/`, and not `//` or `/\`).

Public routes: `/`, `/validator`, `/snippets`, `/api`, `/developer`, `/contribute`, `/privacy`, `/terms` and `/license`, plus a 404 catch-all.

## Firestore data models

Only fields the code reads or writes are listed.

```typescript
// users/{uid}: written by useAuth.js, snippets.js and AdminUsers.vue
{
  displayName: string,
  email: string,
  photoURL?: string,        // Google sign-in only
  created: Date,
  role: 'user' | 'admin',   // changed only by admins (AdminUsers.vue)
  snippetCount?: number     // incremented and decremented by snippets.js
}

// api_keys/{id}: written by functions/api/keys.js and middleware/apiKeyAuth.js
{
  userId: string,
  name: string,
  hashedKey: string,        // SHA-256 of the key; keys look like "ddex_…"
  created: Timestamp,
  lastUsed: Timestamp | null,
  requestCount: number,
  rateLimit: number,        // stored as 60; the limiter's tiers apply
  active: boolean           // false once revoked
}
// At most 5 active keys per user.

// snippets/{id}: written by src/services/snippets.js
{
  title: string,
  description: string,
  content: string,          // XML
  category: string,
  tags: string[],
  ernVersion: '3.8.2' | '4.2' | '4.3',
  author: { uid: string, displayName: string },
  created: Timestamp,
  updated: Timestamp
}
```

Security (`ui/firestore.rules`):
- **users:** users can read and update their own document but can't change their own `role`. Admins can read every user and update other users. No one can delete a user document.
- **api_keys:** owners can read and update their own keys. Deletes are refused (revocation is a soft delete).
- **snippets:** anyone can read. Signed-in users can create snippets, and only the author can update or delete one.

Indexes (`ui/firestore.indexes.json`): `snippets` on `category` with `created`, ascending and descending.

## ERN Sandbox and Deezer import

The Sandbox (`ui/src/views/SandboxView.vue`, with `components/sandbox/ProductForm.vue` and `ResourceForm.vue`) requires sign-in. It builds ERN 4.3 messages with `ui/src/services/ernBuilder.js`:
- **Templates:** Audio Single, Audio Album and Video, or start from scratch.
- **Deezer import:** look up a release by UPC/EAN to fill in its title, artist, label, release date and track list, with ISRCs and durations. `ui/src/services/deezerApi.js` calls the API's `/deezer/*` proxy (`ui/functions/api/deezer.js`).
- **Output:** valid ERN 4.3 XML, generated as you edit. `MessageSender` and `MessageRecipient` use placeholder DPIDs (`PADPIDA0000000000S` and `PADPIDA0000000000R`), and a catalog number without a label DPID gets `PADPIDA2023081501R`. Replace these with real party IDs before using a message outside the Sandbox.
- **Validation:** the generated message can be validated in one click.

## CSS architecture

The styling is utility-first, with semantic component classes in `ui/src/assets/`:

1. **`main.css`**: the entry point, which imports the other files
2. **`base.css`**: reset, typography and global styles
3. **`themes.css`**: CSS custom properties (design tokens) for the light, dark and auto themes
4. **`components.css`**: reusable component classes (`.btn`, `.card`, `.form-*`, `.container`, `.section`, …) and utility classes for spacing, typography, display and colour

`ui/src/utils/themeManager.js` switches themes by setting `data-theme` on the root element. Components use the custom properties (for example `var(--color-surface)`, `var(--color-text)` and `var(--color-border)`) rather than hard-coded colours.

## SDKs (1.1.0)

| | JavaScript/TypeScript | Python |
|---|---|---|
| Package | `@ddex-workbench/sdk` (npm) | `ddex-workbench` (PyPI) |
| Source | `ui/packages/sdk/` | `ui/packages/python-sdk/` |
| Runtime | Node.js ≥ 22, or a modern browser | Python ≥ 3.10 |
| Build | tsup (CommonJS + ESM + `.d.ts`) | setuptools (`python -m build`) |
| Tests | vitest (`npm test`) | pytest (`pip install -e ".[dev]"`, then `pytest`) |
| Batch concurrency | `validateBatch(items, { concurrency })` | `validator.validate_batch(..., max_workers=4)` |

Both SDKs support validation with an optional profile, SVRL generation, version and profile detection, batch validation, file and URL validation, error filtering by stage, and typed errors (including `RateLimitError`, which exposes `retryAfter` and the `RateLimit-*` values). 429 responses are never retried. Network errors and 5xx responses are retried with exponential backoff and jitter. There is no Python CLI.

Deprecated in 1.1.0, and to be removed in 2.0:
- The API key management methods. In JS these are `listApiKeys()`, `createApiKey()` and `revokeApiKey()`; in Python, `create_api_key()`, `list_api_keys()` and `delete_api_key()`. Keys are managed at https://ddex-workbench.org/api-keys.
- JS `validator.getProfileCompliance()` and `validator.generateSummary()`, and Python `validator.get_profile_compliance()`. The API doesn't return passed rules, so their figures aren't meaningful.
- The Python `ERNProfile.CLASSICAL`, `RINGTONE` and `DJ` profiles. (JS removed `Classical`, `Ringtone` and `DJ` from its `ERNProfile` type in 1.1.0.)
- The `verbose` and `customRules` options (Python: `verbose`, `custom_rules`, `include_passed_rules` and `max_errors`). They are no longer sent.

## Project structure

Tracked files, plus the two gitignored directories that deployment needs:

```
ddex-workbench/
├── cloudflare/
│   └── worker.js                  # Worker in front of api.ddex-workbench.org (/v1 mapping, CORS)
├── docs/
│   ├── blueprint.md               # This document
│   └── SETUP.md                   # Local development guide
├── ui/
│   ├── functions/                 # Cloud Functions (Express API)
│   │   ├── api/
│   │   │   ├── deezer.js          # Deezer proxy routes
│   │   │   ├── keys.js            # API key CRUD (Firebase ID token)
│   │   │   └── validate.js        # POST /validate (JSON and raw XML)
│   │   ├── middleware/
│   │   │   ├── apiKeyAuth.js      # Identifies the caller: API key, ID token or anonymous
│   │   │   ├── clientIp.js        # Client IP behind Cloudflare and Google proxies
│   │   │   └── rateLimiter.js     # 10/min anonymous, 60/min key or user
│   │   ├── schemas/ern/           # GITIGNORED: DDEX XSDs (npm run schemas:download)
│   │   ├── scripts/
│   │   │   └── downloadSchemas.js # Fetches the XSDs into schemas/ern/<version>/
│   │   ├── test/
│   │   │   ├── fixtures/
│   │   │   │   └── api-responses.md
│   │   │   ├── debug-xmllint.js
│   │   │   ├── test-preload-issue.js
│   │   │   ├── test-xmllint-datatypes.js
│   │   │   ├── test-xmllint-v5.js
│   │   │   └── test-xsd-validator.js
│   │   ├── utils/
│   │   │   └── svrlGenerator.js   # SVRL report output
│   │   ├── validators/
│   │   │   ├── ernValidator.js            # Business rules; ERN_CONFIGS (versions and profiles)
│   │   │   ├── rules/                     # GITIGNORED: private rule modules (installed separately)
│   │   │   ├── schematronValidator.js     # Loads the rules; sets rulesStatus
│   │   │   ├── validationOrchestrator.js  # The pipeline, truncation, errors and warnings
│   │   │   └── xsdValidator.js            # xmllint-wasm
│   │   ├── .gitignore
│   │   ├── index.js               # Express app, body limit, routes; exports the "app" function
│   │   ├── package-lock.json
│   │   └── package.json           # Service version reported by /health
│   ├── packages/
│   │   ├── python-sdk/
│   │   │   ├── ddex_workbench/
│   │   │   │   ├── __init__.py    # __version__
│   │   │   │   ├── _deprecation.py
│   │   │   │   ├── client.py      # DDEXClient
│   │   │   │   ├── errors.py
│   │   │   │   ├── py.typed
│   │   │   │   ├── types.py
│   │   │   │   ├── utils.py
│   │   │   │   └── validator.py   # DDEXValidator helpers
│   │   │   ├── examples/
│   │   │   │   ├── advanced_validation.py
│   │   │   │   ├── basic_usage.py
│   │   │   │   ├── basic_validation.py
│   │   │   │   ├── batch_processing.py
│   │   │   │   └── ci_integration.py
│   │   │   ├── tests/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── test_client.py
│   │   │   │   └── test_validator.py
│   │   │   ├── .gitignore
│   │   │   ├── CHANGELOG.md
│   │   │   ├── LICENSE
│   │   │   ├── MANIFEST.in
│   │   │   ├── pyproject.toml     # Package metadata and version
│   │   │   ├── README.md
│   │   │   ├── requirements-dev.txt
│   │   │   ├── requirements.txt
│   │   │   ├── setup.py
│   │   │   └── tox.ini            # Also holds the pytest config
│   │   └── sdk/
│   │       ├── src/
│   │       │   ├── client.ts      # DDEXClient
│   │       │   ├── deprecation.ts
│   │       │   ├── errors.ts
│   │       │   ├── index.ts
│   │       │   ├── types.ts
│   │       │   └── validator.ts   # DDEXValidator helpers
│   │       ├── test/
│   │       │   └── client.test.ts
│   │       ├── .gitignore
│   │       ├── .npmignore
│   │       ├── CHANGELOG.md
│   │       ├── LICENSE
│   │       ├── package-lock.json
│   │       ├── package.json
│   │       ├── README.md
│   │       ├── tsconfig.json
│   │       ├── tsup.config.ts
│   │       └── vitest.config.ts
│   ├── public/                    # Favicons
│   │   ├── apple-touch-icon.png
│   │   ├── favicon-16x16.png
│   │   └── favicon-32x32.png
│   ├── src/                       # Vue 3 app
│   │   ├── assets/                # base.css, components.css, main.css, themes.css
│   │   ├── components/
│   │   │   ├── sandbox/
│   │   │   │   ├── ProductForm.vue
│   │   │   │   └── ResourceForm.vue
│   │   │   ├── CreateSnippetModal.vue
│   │   │   ├── EditSnippetModal.vue
│   │   │   ├── EmailVerificationBanner.vue
│   │   │   └── NavBar.vue
│   │   ├── composables/
│   │   │   ├── useAuth.js         # Auth state and actions
│   │   │   └── useRateLimit.js    # 429 countdown in the UI
│   │   ├── router/
│   │   │   └── index.js           # Routes and auth guards
│   │   ├── services/
│   │   │   ├── api.js             # API client (attaches the ID token)
│   │   │   ├── deezerApi.js
│   │   │   ├── ernBuilder.js      # ERN 4.3 generation for the Sandbox
│   │   │   └── snippets.js        # Direct Firestore CRUD
│   │   ├── utils/
│   │   │   ├── debounce.js
│   │   │   ├── themeManager.js
│   │   │   └── xmlSecurity.js
│   │   ├── views/
│   │   │   ├── auth/
│   │   │   │   ├── LoginView.vue
│   │   │   │   └── SignupView.vue
│   │   │   ├── legal/
│   │   │   │   ├── LicenseView.vue
│   │   │   │   ├── PrivacyView.vue
│   │   │   │   └── TermsView.vue
│   │   │   ├── AdminUsers.vue
│   │   │   ├── ApiDocsView.vue    # Live API reference (/api)
│   │   │   ├── ContributeView.vue
│   │   │   ├── DeveloperView.vue
│   │   │   ├── NotFoundView.vue
│   │   │   ├── SandboxView.vue
│   │   │   ├── SnippetsView.vue
│   │   │   ├── SplashPage.vue
│   │   │   ├── UserApi.vue        # API key management (/api-keys)
│   │   │   ├── UserSettings.vue
│   │   │   └── ValidatorView.vue
│   │   ├── App.vue
│   │   ├── firebase.js            # Firebase init and GA4
│   │   └── main.js
│   ├── .env.example
│   ├── .env.production
│   ├── cors.json
│   ├── firebase.json              # Hosting, functions, Firestore, Storage and emulators
│   ├── firestore.indexes.json
│   ├── firestore.rules
│   ├── index.html
│   ├── jsconfig.json
│   ├── package-lock.json
│   ├── package.json               # App version; dev, build and preview scripts
│   ├── storage.rules              # Denies all access (Storage isn't used)
│   └── vite.config.js
├── .vscode/
│   └── extensions.json
├── .gitignore
├── CONTRIBUTING.md
├── LICENSE
└── README.md
```

How the gitignored directories are obtained:
- **`ui/functions/schemas/ern/`:** run `cd ui/functions && npm run schemas:download`. DDEX no longer serves the ERN 3.8.2 schema, so that version fails to download and the script keeps any existing copy. Keep a backup of `schemas/ern/3.8.2/`.
- **`ui/functions/validators/rules/`:** the private rule modules (`schematron-382.js`, `schematron-42.js` and `schematron-43.js`) are generated from the DDEX XSDs via DDEX Rosetta and installed separately. Without them, `POST /validate` returns 503.

## Deployment

The `firebase` commands run from `ui/`. The order is the Worker, then functions, then hosting.

1. **Prepare the gitignored inputs** (the function deploy uploads them):
   ```bash
   cd ui/functions
   npm run schemas:download          # XSDs into schemas/ern/ (3.8.2 must already exist locally)
   ls validators/rules/              # schematron-382.js, schematron-42.js, schematron-43.js
   cd ..
   ```
2. **Back up** the schemas and rules outside the repository. Neither directory is in git, and ERN 3.8.2 can no longer be downloaded:
   ```bash
   tar -czf ~/ddex-workbench-private-$(date +%F).tgz functions/schemas/ern functions/validators/rules
   ```
3. **Cloudflare Worker** (when `cloudflare/worker.js` changes), deployed by hand in the Cloudflare dashboard: open Workers & Pages → `ddex-api-proxy` → Edit code, paste in the full contents of `cloudflare/worker.js`, and click Deploy. `cloudflare/worker.js` in the repository is the source of truth, so paste it in after every change to it. There is no wrangler config in the repository. The Worker's attachment to `api.ddex-workbench.org` is configured in the dashboard.
4. **Functions:**
   ```bash
   firebase deploy --only functions
   ```
5. **Hosting:**
   ```bash
   npm run build
   firebase deploy --only hosting
   ```
6. **Firestore rules and indexes**, when they change:
   ```bash
   firebase deploy --only firestore
   ```
7. **Verify:**
   - `curl https://api.ddex-workbench.org/v1/health` reports the expected version.
   - The quickstart on https://ddex-workbench.org/api returns `"valid": true`.

## Releasing the SDKs

Tags are named `js-sdk-vX.Y.Z` and `python-sdk-vX.Y.Z`. The existing tags are `js-sdk-v1.0.1`, `js-sdk-v1.0.2`, `js-sdk-v1.1.0`, `python-sdk-v1.0.1`, `python-sdk-v1.0.2` and `python-sdk-v1.1.0`.

### JavaScript (npm)

```bash
cd ui/packages/sdk
# 1. Bump "version" in package.json (the User-Agent version is read from it at build time)
# 2. Update CHANGELOG.md
npm test
npm publish        # prepublishOnly runs the build
```
The npm account uses two-factor authentication: `npm publish` prints a URL and waits while you approve the publish in the browser.

### Python (PyPI)

```bash
cd ui/packages/python-sdk
# 1. Bump the version in both pyproject.toml and ddex_workbench/__init__.py (__version__)
# 2. Update CHANGELOG.md
pip install -e ".[dev]" && pytest
rm -rf dist && python -m build
twine upload dist/*    # username __token__, password: a PyPI API token
```

### Tag the release

```bash
git tag js-sdk-vX.Y.Z        # or python-sdk-vX.Y.Z
git push origin js-sdk-vX.Y.Z
```

README fixes in either package reach npm and PyPI only with the next published release.

---

**Last Updated**: 2026-11-19
