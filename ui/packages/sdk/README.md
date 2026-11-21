# DDEX Workbench SDK

[![npm version](https://img.shields.io/npm/v/@ddex-workbench/sdk.svg)](https://www.npmjs.com/package/@ddex-workbench/sdk)
[![npm downloads](https://img.shields.io/npm/dm/@ddex-workbench/sdk.svg)](https://www.npmjs.com/package/@ddex-workbench/sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![JavaScript](https://img.shields.io/badge/JavaScript-Ready-yellow.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

Official JavaScript/TypeScript SDK for [DDEX Workbench](https://ddex-workbench.org) - Open-source DDEX validation and processing tools.

## Features

- 🚀 **Comprehensive Validation** - XSD Schema → Business Rules → Schematron profile rules (when a profile is given)
- 📋 **SVRL Reports** - Generate Schematron Validation Report Language (SVRL) XML reports
- 🎯 **Profile-Specific Validation** - AudioAlbum, AudioSingle, Video and Mixed profiles (plus ReleaseByRelease for ERN 3.8.2 and 3.8.3)
- 📦 **TypeScript Support** - Full type definitions with IntelliSense
- 🌐 **Universal** - Works in Node.js and browsers
- 🔄 **Auto-retry** - Retries network errors and 5xx responses with exponential backoff and jitter (429s are never retried)
- 🔍 **Auto-detection** - Automatic ERN version and profile detection
- 📊 **Batch Processing** - Validate multiple files with concurrency control
- 🔑 **API Key Support** - Send an API key for higher rate limits

## Installation

```bash
npm install @ddex-workbench/sdk
# or
yarn add @ddex-workbench/sdk
# or
pnpm add @ddex-workbench/sdk
```

Requires Node.js 22 or later (or any modern browser).

## Quick Start

```javascript
import { DDEXClient } from '@ddex-workbench/sdk';

const client = new DDEXClient({
  apiKey: 'ddex_your-api-key' // Optional - for higher rate limits
});

// Basic validation
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

## Advanced Features

### Three-Stage Validation Pipeline

Every validation request runs the first two stages; the third runs when you pass a `profile`:

1. **XSD Schema Validation** - Validates XML structure against official DDEX schemas
2. **Business Rules Validation** - Checks ERN-specific rules and requirements
3. **Schematron Profile Validation** - Validates profile-specific requirements (AudioAlbum, AudioSingle, Video, Mixed, or ReleaseByRelease for 3.8.x)

### SVRL Report Generation

Generate detailed Schematron Validation Report Language reports for compliance documentation:

```javascript
// Generate SVRL report
const result = await client.validateWithSVRL(xmlContent, {
  version: '4.3',
  profile: 'AudioAlbum'
});

if (result.svrl) {
  // Parse SVRL statistics
  const stats = client.validator.parseSVRL(result.svrl);
  console.log(`Assertions: ${stats.assertions}`);
  console.log(`Failures: ${stats.failures}`);
  console.log(`Warnings: ${stats.warnings}`);
  
  // Save SVRL report
  fs.writeFileSync('validation-report.svrl', result.svrl);
}
```

### Auto-Detection

Let the SDK detect version and profile automatically:

```javascript
const validator = client.validator;

// Auto-detect version
const version = validator.detectVersion(xmlContent);
console.log(`Detected version: ${version}`); // "4.3"

// Auto-detect profile
const profile = validator.detectProfile(xmlContent);
console.log(`Detected profile: ${profile}`); // "AudioAlbum"

// Validate with auto-detection
const result = await validator.validateAuto(xmlContent);
```

### Batch Validation

Process multiple files efficiently with concurrency control:

```javascript
const files = [
  { content: xml1, options: { version: '4.3', profile: 'AudioAlbum' }},
  { content: xml2, options: { version: '4.2', profile: 'AudioSingle' }},
  { content: xml3, options: { version: '3.8.3', profile: 'AudioAlbum' }},
  { content: xml4, options: { version: '3.8.2', profile: 'Video' }}
];

const results = await client.validateBatch(files, {
  concurrency: 3,
  stopOnError: false,
  onProgress: (completed, total) => {
    console.log(`Progress: ${completed}/${total}`);
  }
});

console.log(`Valid files: ${results.validFiles}/${results.totalFiles}`);
```

### Profile Compliance

Validate with a profile and check the result:

```javascript
const result = await client.validate(xmlContent, {
  version: '4.3',
  profile: 'AudioAlbum'
});

console.log(`Profile compliant: ${validator.getSchematronErrors(result).length === 0}`);
console.log(`Errors: ${result.errors.length}, warnings: ${result.warnings.length}`);
```

> **Deprecated:** `validator.getProfileCompliance()` and `validator.generateSummary()` always
> report 0 passed rules and a 0% compliance rate, because the API doesn't return passed rules.
> They log a one-time warning and will be removed in 2.0.

### Error Analysis

Filter and analyze different types of validation errors:

```javascript
const result = await client.validate(xmlContent, {
  version: '4.3',
  profile: 'AudioAlbum'
});

// Get specific error types
const schematronErrors = validator.getSchematronErrors(result);
const xsdErrors = validator.getXSDErrors(result);
const businessErrors = validator.getBusinessRuleErrors(result);
const criticalErrors = validator.getCriticalErrors(result);

// Format errors for display
const formatted = validator.formatErrors(result.errors, {
  groupByRule: true,
  includeContext: true,
  includeSuggestions: true,
  maxErrors: 10
});
console.log(formatted);
```

### URL and File Validation

Validate XML from URLs or local files:

```javascript
// Validate from URL
const urlResult = await client.validateURL(
  'https://example.com/release.xml',
  { version: '4.3', profile: 'AudioAlbum' }
);

// Validate local file (Node.js only)
const fileResult = await client.validateFile(
  './releases/new-album.xml',
  { 
    version: '4.3', 
    profile: 'AudioAlbum',
    includeHash: true  // Include SHA-256 hash
  }
);
```

## Supported Versions & Profiles

### ERN Versions
- **ERN 4.3**
- **ERN 4.2**
- **ERN 3.8.3**: accepts historical ISO 3166-3 territory codes (e.g. `YUCS`) where 3.8.2 allows only current ones
- **ERN 3.8.2**

### Profiles

| Profile | ERN 3.8.2 | ERN 3.8.3 | ERN 4.2 | ERN 4.3 | Description |
|---------|-----------|-----------|---------|---------|-------------|
| AudioAlbum | ✅ | ✅ | ✅ | ✅ | Full album releases |
| AudioSingle | ✅ | ✅ | ✅ | ✅ | Single track releases |
| Video | ✅ | ✅ | ✅ | ✅ | Music video releases |
| Mixed | ✅ | ✅ | ✅ | ✅ | Mixed media releases |
| ReleaseByRelease | ✅ | ✅ | ❌ | ❌ | Release-by-release (3.8.x only) |

## API Configuration

### Getting an API key

Sign in at [ddex-workbench.org](https://ddex-workbench.org) and create a key on the
[API Keys page](https://ddex-workbench.org/api-keys). Keys are created and revoked there,
not through the SDK.

### Authentication

API keys are optional but recommended for production use:

- **Without an API key**: 10 requests/minute per IP address
- **With an API key**: 60 requests/minute per key

```javascript
// Set API key after initialization
client.setApiKey('ddex_your-api-key');

// Remove API key
client.clearApiKey();

// Get current config
const config = client.getConfig();
```

### Custom Configuration

```javascript
const client = new DDEXClient({
  apiKey: 'ddex_your-api-key',
  baseURL: 'https://api.ddex-workbench.org/v1',  // Default
  timeout: 30000,  // 30 seconds
  maxRetries: 3,     // retries for network errors and 5xx responses
  retryDelay: 1000,  // base backoff delay; grows exponentially with jitter, capped at 30 s
  environment: 'production'
});
```

In Node.js the SDK identifies itself with a `User-Agent` header (`ddex-workbench-sdk/<version>`).
Browsers don't allow scripts to set `User-Agent`, so there it sends `X-Client` instead.

## TypeScript Support

Full TypeScript support with comprehensive type definitions:

```typescript
import { 
  DDEXClient,
  ValidationResult,
  ValidationOptions,
  ERNVersion,
  ERNProfile,
  ValidationErrorDetail,
  SVRLStatistics
} from '@ddex-workbench/sdk';

const client = new DDEXClient();

const options: ValidationOptions = {
  version: '4.3',
  profile: 'AudioAlbum',
  generateSVRL: true
};

const result: ValidationResult = await client.validate(xmlContent, options);

// TypeScript knows all the types
result.errors.forEach((error: ValidationErrorDetail) => {
  console.log(`${error.severity}: ${error.message}`);
});
```

## Error Handling

Comprehensive error handling with specific error types:

```javascript
import { 
  RateLimitError, 
  ValidationError,
  AuthenticationError,
  NetworkError 
} from '@ddex-workbench/sdk';

try {
  const result = await client.validate(xmlContent, options);
} catch (error) {
  if (error instanceof RateLimitError) {
    // 429s are never retried automatically. retryAfter comes from the response
    // body (error.retryAfter), falling back to the Retry-After header.
    console.log(`Rate limited. Retry after ${error.retryAfter} seconds`);
    // From the RateLimit-* headers, when the API exposes them
    console.log(`Limit: ${error.limit}, remaining: ${error.remaining}`);
  } else if (error instanceof ValidationError) {
    console.log(`Validation error: ${error.getSummary()}`);
  } else if (error instanceof AuthenticationError) {
    console.log('Invalid API key');
  } else if (error instanceof NetworkError) {
    console.log(`Network error: ${error.message}`);
    if (error.isRetryable()) {
      // Retry the request
    }
  }
}
```

## Examples

### Complete Validation Workflow

```javascript
import { DDEXClient } from '@ddex-workbench/sdk';
import fs from 'fs';

async function validateRelease(filePath) {
  const client = new DDEXClient({ apiKey: 'ddex_your-api-key' });
  const validator = client.validator;
  
  // Read XML file
  const xmlContent = fs.readFileSync(filePath, 'utf-8');
  
  // Auto-detect version and profile
  const version = validator.detectVersion(xmlContent);
  const profile = validator.detectProfile(xmlContent);
  
  console.log(`Detected: ERN ${version}, Profile: ${profile}`);
  
  // Validate with SVRL generation
  const result = await client.validateWithSVRL(xmlContent, {
    version,
    profile
  });
  
  console.log('\n📊 Validation Summary:');
  console.log(`├─ Valid: ${result.valid ? '✅' : '❌'}`);
  console.log(`├─ Schema Compliant: ${validator.getXSDErrors(result).length === 0 ? '✅' : '❌'}`);
  console.log(`├─ Profile Compliant: ${validator.getSchematronErrors(result).length === 0 ? '✅' : '❌'}`);
  console.log(`├─ Errors: ${result.errors.length}`);
  console.log(`├─ Warnings: ${result.warnings.length}`);
  console.log(`└─ Processing Time: ${result.metadata.processingTime}ms`);
  
  // Show validation steps
  console.log('\n🔍 Validation Steps:');
  result.metadata.validationSteps.forEach(step => {
    const status = step.errorCount === 0 ? '✅' : '❌';
    console.log(`├─ ${step.type}: ${status} (${step.duration}ms)`);
  });
  
  // Show errors by category
  if (!result.valid) {
    console.log('\n❌ Errors:');
    
    const schematronErrors = validator.getSchematronErrors(result);
    const xsdErrors = validator.getXSDErrors(result);
    const businessErrors = validator.getBusinessRuleErrors(result);
    
    if (xsdErrors.length > 0) {
      console.log(`\n  XSD Schema Errors (${xsdErrors.length}):`);
      xsdErrors.slice(0, 3).forEach(e => 
        console.log(`    Line ${e.line}: ${e.message}`)
      );
    }
    
    if (businessErrors.length > 0) {
      console.log(`\n  Business Rule Errors (${businessErrors.length}):`);
      businessErrors.slice(0, 3).forEach(e => 
        console.log(`    Line ${e.line}: ${e.message}`)
      );
    }
    
    if (schematronErrors.length > 0) {
      console.log(`\n  Profile Errors (${schematronErrors.length}):`);
      schematronErrors.slice(0, 3).forEach(e => 
        console.log(`    ${e.message}`)
      );
    }
  }
  
  // Save SVRL report if generated
  if (result.svrl) {
    const reportPath = filePath.replace('.xml', '-validation-report.svrl');
    fs.writeFileSync(reportPath, result.svrl);
    console.log(`\n📄 SVRL report saved to: ${reportPath}`);
  }
  
  return result;
}

// Run validation
validateRelease('./release.xml').catch(console.error);
```

## Browser Usage

The SDK works in modern browsers. With a bundler (Vite, webpack, etc.), import it as usual.
Without one, the ES module build imports `axios` by name, so add an import map for it:

```html
<script type="importmap">
{ "imports": { "axios": "https://unpkg.com/axios@1/dist/esm/axios.min.js" } }
</script>
<script type="module">
import { DDEXClient } from 'https://unpkg.com/@ddex-workbench/sdk@1/dist/index.mjs';

const client = new DDEXClient();
const result = await client.validate(xmlContent, {
  version: '4.3',
  profile: 'AudioAlbum'
});
</script>
```

**Note**: File system operations (`validateFile`) are not available in browsers.

## API Rate Limits

- **Anonymous**: 10 requests per minute per IP address
- **With an API key**: 60 requests per minute per key
- **Batch validation**: Counts as one request per file

Responses carry `RateLimit-*` headers; a 429 also carries `Retry-After`. Requests over 10 MB are rejected with a 413.

## Support

- 📚 [API Reference](https://ddex-workbench.org/api)
- 💬 [GitHub Issues](https://github.com/daddykev/ddex-workbench/issues)
- 👨🏻‍💻 [Developer CV](https://ddex-workbench.org/developer)
- 📧 [Developer Email](mailto:daddykev@gmail.com)

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Related Projects

- [DDEX Workbench](https://ddex-workbench.org) - Web application
- [ddex-workbench Python SDK](https://pypi.org/project/ddex-workbench/) - Python SDK
- [DDEX Knowledge Base](https://kb.ddex.net) - Official DDEX documentation

---

Built for the music industry.