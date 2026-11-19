# DDEX Workbench

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Vue 3](https://img.shields.io/badge/Vue-3.x-4FC08D.svg)](https://vuejs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-v12-FFA000.svg)](https://firebase.google.com/)
[![npm version](https://img.shields.io/npm/v/@ddex-workbench/sdk.svg)](https://www.npmjs.com/package/@ddex-workbench/sdk)
[![PyPI version](https://img.shields.io/pypi/v/ddex-workbench.svg)](https://pypi.org/project/ddex-workbench/)

> Open-source DDEX ERN validation tools for the music industry.

**Live at: [https://ddex-workbench.org](https://ddex-workbench.org)**

DDEX Workbench is a web-based validator and public API for DDEX ERN (Electronic Release Notification) messages, with official JavaScript/TypeScript and Python SDKs. It aims to make DDEX implementation accessible to everyone, from independent artists to major labels.

## Features

### ERN versions and profiles
- **ERN 4.3** (recommended), **ERN 4.2** and **ERN 3.8.2**
- **Profiles:** AudioAlbum, AudioSingle, Video and Mixed, plus ReleaseByRelease for ERN 3.8.2 only

### Validation pipeline
Each request runs these stages in order:
1. **XSD schema validation** against the official DDEX schemas, using WebAssembly-based `xmllint-wasm`. If the XML isn't well-formed, validation stops here.
2. **Business rules**: ERN-specific checks such as cross-references between resources, releases, parties and deals, identifier formats (ISRC), durations, dates and territory codes.
3. **Version-specific rules**, whenever a profile is given: 648 version-specific rules generated from the official DDEX XSD schemas via DDEX Rosetta; the rule files are not part of this repository.
4. **SVRL report**, only when requested (`generateSVRL`).

Warnings are reported separately from errors, and `valid` reflects errors only.

### Web validator
- Three input methods: file upload, paste XML, or load from URL
- Optional real-time validation while you type
- Errors grouped by line, type or severity, with links to the DDEX Knowledge Base
- A timeline showing the duration of each validation stage
- JSON and text report downloads, plus SVRL view, copy and download
- Light, dark and auto themes

### ERN Sandbox
For signed-in users. It builds ERN 4.3 messages from interactive forms:
- Imports release metadata from Deezer by UPC/EAN, including the track listing, ISRCs and durations
- Starts from scratch or from Audio Single, Audio Album or Video templates
- Generates valid ERN 4.3 XML as you edit, using placeholder party IDs (DPIDs) for the message sender and recipient
- Validates the generated message in one click

### Accounts and community
- Email/password and Google sign-in, with password reset
- API keys for programmatic access, managed at [ddex-workbench.org/api-keys](https://ddex-workbench.org/api-keys)
- A community library of ERN snippets

## Public API

**Base URL:** `https://api.ddex-workbench.org/v1`

### Quickstart

Validate a minimal ERN 4.3 message with a single raw-XML request:

```bash
curl -X POST "https://api.ddex-workbench.org/v1/validate?version=4.3" -H "Content-Type: application/xml" -d '<ern:NewReleaseMessage xmlns:ern="http://ddex.net/xml/ern/43" AvsVersionId="9" LanguageAndScriptCode="en"><MessageHeader><MessageId>MSG-0001</MessageId><MessageSender><PartyId>PADPIDA0000000000S</PartyId></MessageSender><MessageRecipient><PartyId>PADPIDA0000000000R</PartyId></MessageRecipient><MessageCreatedDateTime>2026-01-01T00:00:00Z</MessageCreatedDateTime></MessageHeader><PartyList><Party><PartyReference>P1</PartyReference><PartyName><FullName>Example Artist</FullName></PartyName></Party><Party><PartyReference>P2</PartyReference><PartyName><FullName>Example Label</FullName></PartyName></Party></PartyList><ResourceList><SoundRecording><ResourceReference>A1</ResourceReference><Type>MusicalWorkSoundRecording</Type><SoundRecordingEdition><ResourceId><ISRC>USRC17607839</ISRC></ResourceId></SoundRecordingEdition><DisplayTitleText>Example Track</DisplayTitleText><DisplayTitle><TitleText>Example Track</TitleText></DisplayTitle><DisplayArtistName>Example Artist</DisplayArtistName><DisplayArtist><ArtistPartyReference>P1</ArtistPartyReference><DisplayArtistRole>MainArtist</DisplayArtistRole></DisplayArtist><Duration>PT3M30S</Duration><ParentalWarningType>NotExplicit</ParentalWarningType></SoundRecording></ResourceList><ReleaseList><Release><ReleaseReference>R0</ReleaseReference><ReleaseType>Single</ReleaseType><ReleaseId><ICPN>00000000000000</ICPN></ReleaseId><DisplayTitleText>Example Single</DisplayTitleText><DisplayTitle><TitleText>Example Single</TitleText></DisplayTitle><DisplayArtistName>Example Artist</DisplayArtistName><DisplayArtist><ArtistPartyReference>P1</ArtistPartyReference><DisplayArtistRole>MainArtist</DisplayArtistRole></DisplayArtist><ReleaseLabelReference>P2</ReleaseLabelReference><Genre><GenreText>Pop</GenreText></Genre><ParentalWarningType>NotExplicit</ParentalWarningType><ResourceGroup><ResourceGroupContentItem><ReleaseResourceReference>A1</ReleaseResourceReference></ResourceGroupContentItem></ResourceGroup></Release></ReleaseList><DealList><ReleaseDeal><DealReleaseReference>R0</DealReleaseReference><Deal><DealTerms><TerritoryCode>Worldwide</TerritoryCode><ValidityPeriod><StartDate>2026-01-01</StartDate></ValidityPeriod><CommercialModelType>SubscriptionModel</CommercialModelType><UseType>OnDemandStream</UseType></DealTerms></Deal></ReleaseDeal></DealList></ern:NewReleaseMessage>'
```

### Request formats

`POST /validate` accepts two formats:

- **JSON body** (`Content-Type: application/json`): `{ "content": "<xml…>", "type": "ERN", "version": "4.3", "profile": "AudioAlbum", "generateSVRL": true }`
- **Raw XML** (`Content-Type: application/xml` or `text/xml`): the message is the request body, and `type`, `version`, `profile` and `generateSVRL` are query parameters, for example `/validate?version=4.3&profile=AudioAlbum`.

`version` is required. `type` defaults to `ERN`. In a JSON request, body fields take precedence over query parameters.

### Rate limits

| Caller | Limit | Counted per |
|---|---|---|
| Anonymous | 10 requests/minute | IP address |
| API key (`X-API-Key` header) | 60 requests/minute | key |
| Signed-in web user (Firebase ID token) | 60 requests/minute | account |

An API key takes precedence over a sign-in token. Responses carry `RateLimit-*` headers, and a 429 also carries `Retry-After`. Requests larger than 10 MB are rejected with a 413.

The full reference (endpoints, response format, error codes and code samples) is at **[ddex-workbench.org/api](https://ddex-workbench.org/api)**.

## SDKs

Both SDKs are at 1.1.0. API keys are managed at [ddex-workbench.org/api-keys](https://ddex-workbench.org/api-keys), not through the SDKs.

### JavaScript/TypeScript

```bash
npm install @ddex-workbench/sdk
```

Requires Node.js 22 or later, or a modern browser.

```javascript
import fs from 'node:fs';
import { DDEXClient } from '@ddex-workbench/sdk';

const client = new DDEXClient({
  apiKey: 'ddex_your-api-key' // Optional: raises the rate limit to 60/min
});

const xmlContent = fs.readFileSync('release.xml', 'utf-8');

// Detect the ERN version and profile from the message
const version = client.validator.detectVersion(xmlContent);
const profile = client.validator.detectProfile(xmlContent);

// Validate and request an SVRL report
const result = await client.validateWithSVRL(xmlContent, { version, profile });

if (result.valid) {
  console.log('Valid DDEX message');
} else {
  console.log(`Found ${result.errors.length} errors`);
  result.errors.forEach(error => console.log(`  Line ${error.line}: ${error.message}`));
}

if (result.svrl) {
  fs.writeFileSync('validation-report.svrl', result.svrl);
}

// Validate several messages, three at a time
const batch = await client.validateBatch(
  [
    { content: xml1, options: { version: '4.3', profile: 'AudioAlbum' } },
    { content: xml2, options: { version: '4.3', profile: 'AudioSingle' } }
  ],
  { concurrency: 3 }
);
console.log(`Valid: ${batch.validFiles}/${batch.totalFiles}`);
```

See the [JavaScript SDK README](ui/packages/sdk/README.md) or [npm](https://www.npmjs.com/package/@ddex-workbench/sdk).

### Python

```bash
pip install ddex-workbench
```

Requires Python 3.10 or later.

```python
from pathlib import Path
from ddex_workbench import DDEXClient

client = DDEXClient(api_key="ddex_your-api-key")  # Optional: raises the rate limit to 60/min

xml_content = Path("release.xml").read_text()

# Detect the ERN version and profile from the message
version = client.validator.detect_version(xml_content)
profile = client.validator.detect_profile(xml_content)

# Validate and request an SVRL report
result, svrl = client.validate_with_svrl(xml_content, version=version, profile=profile)

if result.valid:
    print("Valid DDEX message")
else:
    print(f"Found {len(result.errors)} errors")
    for error in result.errors:
        print(f"  Line {error.line}: {error.message}")

if svrl:
    Path("validation-report.svrl").write_text(svrl)

# Validate a folder of messages, four at a time
batch_result = client.validator.validate_batch(
    files=list(Path("releases").glob("*.xml")),
    version="4.3",
    profile="AudioAlbum",
    max_workers=4
)
print(f"Validated {batch_result.total_files} files in {batch_result.processing_time:.2f}s")
```

See the [Python SDK README](ui/packages/python-sdk/README.md) or [PyPI](https://pypi.org/project/ddex-workbench/).

## Tech stack

- **Frontend:** Vue 3 (Composition API), Vue Router and Vite, with a custom utility-first CSS architecture. It reads and writes Firestore directly through the Firebase SDK for snippets and user profiles.
- **Backend:** an Express app on Firebase Cloud Functions (Node.js 22), with Firestore and Firebase Authentication.
- **Edge:** a Cloudflare Worker ([`cloudflare/worker.js`](cloudflare/worker.js)) fronts `api.ddex-workbench.org`, maps `/v1/*` to the function, and handles CORS.
- **Validation:** `xmllint-wasm` for XSD, plus JavaScript business rules and version-specific rules.

## Local development

### Prerequisites
- Node.js 22+
- Python 3.10+ (only for the Python SDK)
- Firebase CLI (`npm install -g firebase-tools`)

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/daddykev/ddex-workbench.git
   cd ddex-workbench/ui
   ```

2. Install dependencies:
   ```bash
   npm install
   cd functions && npm install && cd ..
   ```

3. Create `ui/.env` from the template and fill in your Firebase web app config:
   ```bash
   cp .env.example .env
   ```

4. Select your Firebase project:
   ```bash
   firebase login
   firebase use --add
   ```

5. Download the DDEX XSD schemas into `ui/functions/schemas/ern/` (gitignored):
   ```bash
   cd functions && npm run schemas:download && cd ..
   ```
   DDEX no longer serves the ERN 3.8.2 schema, so that version fails to download; keep an existing copy of `schemas/ern/3.8.2/`.

6. Install the validation rules. The rule files (`ui/functions/validators/rules/schematron-{382,42,43}.js`) are private and not part of this repository, and they are required for `/validate`. Without them, `POST /validate` returns `503 VALIDATION_RULES_UNAVAILABLE`, and every other endpoint keeps working.

7. Run the frontend and the emulators (Firebase commands run from `ui/`):
   ```bash
   npm run dev                  # Vite dev server
   firebase emulators:start     # Functions, Firestore and Auth emulators
   ```

See [docs/SETUP.md](docs/SETUP.md) for the full guide.

### npm scripts

| Location | Scripts |
|---|---|
| `ui/` | `dev`, `build`, `preview` |
| `ui/functions/` | `serve`, `shell`, `start`, `deploy`, `logs`, `schemas:download` |
| `ui/packages/sdk/` | `build`, `dev`, `test`, `test:coverage`, `lint`, `format`, `docs` |

## Documentation

- [API reference](https://ddex-workbench.org/api): live, interactive API docs
- [Technical blueprint](docs/blueprint.md): current architecture, data models and deployment
- [Setup guide](docs/SETUP.md): local development environment
- [Contributing](CONTRIBUTING.md)

## Contributing

Contributions are welcome. See the [Contributing Guidelines](CONTRIBUTING.md).

## License

The application code is licensed under the MIT License; see [LICENSE](LICENSE). The validation rule files are not part of this repository.

## Acknowledgments

- DDEX, for maintaining the industry standards
- The music technology community, for insights and feedback
- Everyone who contributes to making DDEX more accessible

## Contact

- **Live app:** [https://ddex-workbench.org](https://ddex-workbench.org)
- **API:** `https://api.ddex-workbench.org/v1` (see [the API reference](https://ddex-workbench.org/api))
- **GitHub Issues:** [bug reports and feature requests](https://github.com/daddykev/ddex-workbench/issues)
- **Email:** daddykev@gmail.com
