# DDEX Workbench SDK

[![npm version](https://img.shields.io/npm/v/@ddex-workbench/sdk.svg)](https://www.npmjs.com/package/@ddex-workbench/sdk)
[![npm downloads](https://img.shields.io/npm/dm/@ddex-workbench/sdk.svg)](https://www.npmjs.com/package/@ddex-workbench/sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![JavaScript](https://img.shields.io/badge/JavaScript-Ready-yellow.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

Official JavaScript/TypeScript SDK for [DDEX Workbench](https://ddex-workbench.org) - Open-source DDEX validation and processing tools.

## Features

- 🚀 **Comprehensive Validation** - Three-stage pipeline: XSD Schema → Business Rules → Schematron Profile Validation
- 📋 **SVRL Reports** - Generate Schematron Validation Report Language (SVRL) XML reports
- 🎯 **Profile-Specific Validation** - Full support for AudioAlbum, AudioSingle, Video, Mixed, Classical, Ringtone, DJ profiles
- 📦 **TypeScript Support** - Full type definitions with IntelliSense
- 🌐 **Universal** - Works in Node.js and browsers
- 🔄 **Auto-retry** - Built-in retry logic with exponential backoff
- 🔍 **Auto-detection** - Automatic ERN version and profile detection
- 📊 **Batch Processing** - Validate multiple files with concurrency control
- 🔑 **API Key Management** - Optional authentication for higher rate limits
- 📈 **Compliance Reports** - Detailed profile compliance statistics

## Installation

```bash
npm install @ddex-workbench/sdk
# or
yarn add @ddex-workbench/sdk
# or
pnpm add @ddex-workbench/sdk
```

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

Every validation request runs through our comprehensive pipeline:

1. **XSD Schema Validation** - Validates XML structure against official DDEX schemas
2. **Business Rules Validation** - Checks ERN-specific rules and requirements
3. **Schematron Profile Validation** - Validates profile-specific requirements (AudioAlbum, Video, etc.)

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
  { content: xml3, options: { version: '3.8.2', profile: 'Video' }}
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

### Profile Compliance Reports

Get detailed compliance statistics for any profile:

```javascript
const compliance = await validator.getProfileCompliance(
  xmlContent,
  '4.3',
  'AudioAlbum'
);

console.log(`Profile: ${compliance.profile}`);
console.log(`Compliance Rate: ${compliance.complianceRate}%`);
console.log(`Passed Rules: ${compliance.passedRules}`);
console.log(`Failed Rules: ${compliance.failedRules}`);
```

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
- **ERN 4.3** (Latest - Recommended)
- **ERN 4.2**
- **ERN 3.8.2**

### Profiles

| Profile | ERN 3.8.2 | ERN 4.2 | ERN 4.3 | Description |
|---------|-----------|---------|---------|-------------|
| AudioAlbum | ✅ | ✅ | ✅ | Full album releases |
| AudioSingle | ✅ | ✅ | ✅ | Single track releases |
| Video | ✅ | ✅ | ✅ | Music video releases |
| Mixed | ✅ | ✅ | ✅ | Mixed media releases |
| Classical | ✅ | ✅ | ✅ | Classical music releases |
| Ringtone | ✅ | ✅ | ✅ | Ringtone releases |
| DJ | ✅ | ✅ | ✅ | DJ mix releases |
| ReleaseByRelease | ✅ | ❌ | ❌ | Release-by-release (3.8.2 only) |

## API Configuration

### Authentication

API keys are optional but recommended for production use:

- **Without API key**: 10 requests/minute
- **With API key**: 60 requests/minute

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
  maxRetries: 3,
  retryDelay: 1000,  // 1 second
  environment: 'production'
});
```

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
  generateSVRL: true,
  verbose: true
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
    console.log(`Rate limited. Retry after ${error.retryAfter} seconds`);
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
    profile,
    verbose: true  // Include passed rules
  });
  
  // Generate summary
  const summary = validator.generateSummary(result);
  
  console.log('\n📊 Validation Summary:');
  console.log(`├─ Valid: ${result.valid ? '✅' : '❌'}`);
  console.log(`├─ Compliance Rate: ${summary.complianceRate}%`);
  console.log(`├─ Schema Compliant: ${summary.schemaCompliant ? '✅' : '❌'}`);
  console.log(`├─ Profile Compliant: ${summary.profileCompliant ? '✅' : '❌'}`);
  console.log(`├─ Errors: ${result.errors.length}`);
  console.log(`├─ Warnings: ${result.warnings.length}`);
  console.log(`├─ Passed Rules: ${summary.passedRules}`);
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

The SDK works in modern browsers with some limitations:

```html
<script type="module">
import { DDEXClient } from 'https://unpkg.com/@ddex-workbench/sdk/dist/index.mjs';

const client = new DDEXClient();
const result = await client.validate(xmlContent, {
  version: '4.3',
  profile: 'AudioAlbum'
});
</script>
```

**Note**: File system operations (`validateFile`) are not available in browsers.

## API Rate Limits

- **Anonymous**: 10 requests per minute
- **Authenticated**: 60 requests per minute
- **Batch validation**: Counts as one request per file

## Support

- 📚 [Documentation](https://github.com/daddykev/ddex-workbench/tree/main/docs)
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