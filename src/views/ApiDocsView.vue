<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

// State
const activeSection = ref('introduction')
const activeLanguage = ref('curl')
const activeEndpointLang = ref('curl')
const activeFileExampleLang = ref('javascript')
const activeHealthLang = ref('curl')
const copiedStates = ref({}) // Track which code blocks have been copied

// Language options
const languages = [
  { id: 'curl', name: 'cURL' },
  { id: 'javascript', name: 'JavaScript' },
  { id: 'python', name: 'Python' },
  { id: 'php', name: 'PHP' }
]

// Code examples
const codeExamples = {
  quickstart: {
    curl: `curl -X POST https://api.ddex-workbench.org/v1/validate \\
-H "Content-Type: application/json" \\
-d '{"content":"<NewReleaseMessage><MessageHeader><MessageId>TEST123</MessageId></MessageHeader><ResourceList><SoundRecording><ResourceReference>A1</ResourceReference></SoundRecording></ResourceList><ReleaseList><Release><ReleaseReference>R0</ReleaseReference></Release></ReleaseList><DealList><ReleaseDeal><DealReleaseReference>R0</DealReleaseReference></ReleaseDeal></DealList></NewReleaseMessage>","type":"ERN","version":"4.3"}'`,
    javascript: `const response = await fetch('https://api.ddex-workbench.org/v1/validate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    content: '<NewReleaseMessage><MessageHeader><MessageId>TEST123</MessageId></MessageHeader><ResourceList><SoundRecording><ResourceReference>A1</ResourceReference></SoundRecording></ResourceList><ReleaseList><Release><ReleaseReference>R0</ReleaseReference></Release></ReleaseList><DealList><ReleaseDeal><DealReleaseReference>R0</DealReleaseReference></ReleaseDeal></DealList></NewReleaseMessage>',
    type: 'ERN',
    version: '4.3'
  })
});

const result = await response.json();
console.log(result.valid ? '✓ Valid' : '✗ Invalid');`,
    python: `import requests

response = requests.post(
    'https://api.ddex-workbench.org/v1/validate',
    json={
        'content': '<NewReleaseMessage><MessageHeader><MessageId>TEST123</MessageId></MessageHeader><ResourceList><SoundRecording><ResourceReference>A1</ResourceReference></SoundRecording></ResourceList><ReleaseList><Release><ReleaseReference>R0</ReleaseReference></Release></ReleaseList><DealList><ReleaseDeal><DealReleaseReference>R0</DealReleaseReference></ReleaseDeal></DealList></NewReleaseMessage>',
        'type': 'ERN',
        'version': '4.3'
    }
)

result = response.json()
print('✓ Valid' if result['valid'] else '✗ Invalid')`,
    php: `$client = new \\GuzzleHttp\\Client();
$response = $client->post('https://api.ddex-workbench.org/v1/validate', [
    'json' => [
        'content' => '<NewReleaseMessage><MessageHeader><MessageId>TEST123</MessageId></MessageHeader><ResourceList><SoundRecording><ResourceReference>A1</ResourceReference></SoundRecording></ResourceList><ReleaseList><Release><ReleaseReference>R0</ReleaseReference></Release></ReleaseList><DealList><ReleaseDeal><DealReleaseReference>R0</DealReleaseReference></ReleaseDeal></DealList></NewReleaseMessage>',
        'type' => 'ERN',
        'version' => '4.3'
    ]
]);

$result = json_decode($response->getBody(), true);
echo $result['valid'] ? '✓ Valid' : '✗ Invalid';`
  },
  healthCheck: {
    curl: `curl https://api.ddex-workbench.org/v1/health`,
    javascript: `fetch('https://api.ddex-workbench.org/v1/health')
  .then(response => response.json())
  .then(data => console.log('API Status:', data.status))
  .catch(error => console.error('API is down:', error));`,
    python: `import requests

response = requests.get('https://api.ddex-workbench.org/v1/health')
data = response.json()
print(f"API Status: {data['status']}")`,
    php: `$response = file_get_contents('https://api.ddex-workbench.org/v1/health');
$data = json_decode($response, true);
echo "API Status: " . $data['status'];`
  },
  errorFormat: {
    json: `{
  "error": {
    "message": "XML content is required"
  }
}`
  },
  validateEndpoint: {
    curl: `curl -X POST https://api.ddex-workbench.org/v1/validate \\
-H "Content-Type: application/json" \\
-d '{"content":"<NewReleaseMessage><MessageHeader><MessageId>MSG123</MessageId><MessageCreatedDateTime>2025-01-01T00:00:00</MessageCreatedDateTime></MessageHeader><ResourceList><SoundRecording><ResourceReference>A1</ResourceReference><Type>MusicalWorkSoundRecording</Type></SoundRecording></ResourceList><ReleaseList><Release><ReleaseReference>R0</ReleaseReference><ReleaseId><ICPN>123456789012</ICPN></ReleaseId></Release></ReleaseList><DealList><ReleaseDeal><DealReleaseReference>R0</DealReleaseReference></ReleaseDeal></DealList></NewReleaseMessage>","type":"ERN","version":"4.3","profile":"AudioAlbum"}'`,
    javascript: `// Basic validation request
const validateERN = async (xmlContent, version = '4.3', profile = 'AudioAlbum') => {
  const response = await fetch(
    'https://api.ddex-workbench.org/v1/validate',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        content: xmlContent,
        type: 'ERN',
        version: version,
        profile: profile
      })
    }
  );

  const result = await response.json();
  
  if (result.valid) {
    console.log('✓ Valid DDEX file');
    console.log(\`Processed in \${result.metadata.processingTime}ms\`);
  } else {
    console.error(\`✗ Found \${result.errors.length} errors\`);
    result.errors.forEach(error => {
      console.error(\`  Line \${error.line}: \${error.message}\`);
    });
  }
  
  return result;
};`,
    python: `import requests
import json

def validate_ern(xml_content, version='4.3', profile='AudioAlbum'):
    """
    Validate DDEX ERN XML content
    
    Args:
        xml_content: The XML content as a string
        version: ERN version ('4.3', '4.2', or '3.8.2')
        profile: Validation profile (e.g., 'AudioAlbum', 'AudioSingle', 'Video', 'Mixed')
    
    Returns:
        dict: Validation result with 'valid', 'errors', and 'metadata'
    """
    
    response = requests.post(
        'https://api.ddex-workbench.org/v1/validate',
        json={
            'content': xml_content,
            'type': 'ERN',
            'version': version,
            'profile': profile
        }
    )
    
    result = response.json()
    
    if result['valid']:
        print(f"✓ Valid DDEX file")
        print(f"Processed in {result['metadata']['processingTime']}ms")
    else:
        print(f"✗ Found {len(result['errors'])} errors")
        for error in result['errors']:
            print(f"  Line {error['line']}: {error['message']}")
    
    return result`,
    php: `<?php
use GuzzleHttp\\Client;

function validateERN($xmlContent, $version = '4.3', $profile = 'AudioAlbum') {
    $client = new Client();
    
    try {
        $response = $client->post(
            'https://api.ddex-workbench.org/v1/validate',
            [
                'json' => [
                    'content' => $xmlContent,
                    'type' => 'ERN',
                    'version' => $version,
                    'profile' => $profile
                ]
            ]
        );
        
        $result = json_decode($response->getBody(), true);
        
        if ($result['valid']) {
            echo "✓ Valid DDEX file\\n";
            echo "Processed in {$result['metadata']['processingTime']}ms\\n";
        } else {
            $errorCount = count($result['errors']);
            echo "✗ Found {$errorCount} errors\\n";
            foreach ($result['errors'] as $error) {
                echo "  Line {$error['line']}: {$error['message']}\\n";
            }
        }
        
        return $result;
        
    } catch (Exception $e) {
        echo "Error: " . $e->getMessage() . "\\n";
        return null;
    }
}`
  },
  validateResponse: {
    json: `{
  "valid": false,
  "errors": [
    {
      "line": 45,
      "column": 12,
      "message": "Element 'ReleaseDate' is missing required child element 'Date'",
      "severity": "error",
      "rule": "ERN-4.3-ReleaseDate"
    },
    {
      "line": 78,
      "column": 8,
      "message": "Invalid ISRC format. Expected: XX-XXX-XX-XXXXX",
      "severity": "error",
      "rule": "ERN-4.3-ISRC-Format"
    }
  ],
  "warnings": [
    {
      "line": 23,
      "column": 4,
      "message": "Consider migrating to ERN 4.3 for improved territorial handling",
      "severity": "warning",
      "rule": "ERN382-Migration-Suggestion"
    }
  ],
  "metadata": {
    "processingTime": 234,
    "schemaVersion": "ERN 4.3",
    "profile": "AudioAlbum",
    "validatedAt": "2025-01-15T10:30:00Z",
    "errorCount": 2,
    "warningCount": 1,
    "validationSteps": [
      {
        "type": "XSD",
        "duration": 120,
        "errorCount": 2
      },
      {
        "type": "BusinessRules",
        "duration": 80,
        "errorCount": 0
      },
      {
        "type": "Schematron",
        "duration": 34,
        "errorCount": 0
      }
    ]
  }
}`
  },
  formatsResponse: {
    json: `{
  "types": ["ERN"],
  "versions": [
    {
      "version": "4.3",
      "profiles": ["AudioAlbum", "AudioSingle", "Video", "Mixed"],
      "status": "recommended"
    },
    {
      "version": "4.2",
      "profiles": ["AudioAlbum", "AudioSingle", "Video", "Mixed"],
      "status": "supported"
    },
    {
      "version": "3.8.2",
      "profiles": ["AudioAlbum", "AudioSingle", "Video", "Mixed", "ReleaseByRelease"],
      "status": "supported"
    }
  ]
}`
  },
  healthResponse: {
    json: `{
  "status": "ok",
  "timestamp": "2025-01-15T10:30:00Z",
  "service": "DDEX Workbench API",
  "version": "1.0.0"
}`
  },
  fileExamples: {
    javascript: `// Node.js example - validate file from disk
const fs = require('fs').promises;
const fetch = require('node-fetch');

async function validateFile(filePath, version = '4.3', profile = 'AudioAlbum') {
  try {
    // Read the XML file
    const xmlContent = await fs.readFile(filePath, 'utf8');
    
    // Send validation request
    const response = await fetch(
      'https://api.ddex-workbench.org/v1/validate',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: xmlContent,
          type: 'ERN',
          version: version,
          profile: profile
        })
      }
    );
    
    const result = await response.json();
    
    // Process results
    if (result.valid) {
      console.log('✅ Validation passed!');
    } else {
      console.log('❌ Validation failed:');
      result.errors.forEach(err => {
        console.log(\`  Line \${err.line}: \${err.message}\`);
      });
    }
    
    return result;
    
  } catch (error) {
    console.error('Validation error:', error);
    throw error;
  }
}

// Usage
validateFile('./releases/new_album.xml', '4.3', 'AudioAlbum')
  .then(result => console.log('Done!'));`,
    python: `# Python example - validate file from disk
import requests
import json

def validate_file(file_path, version='4.3', profile='AudioAlbum'):
    """Validate a DDEX XML file"""
    
    # Read the XML file
    with open(file_path, 'r', encoding='utf-8') as file:
        xml_content = file.read()
    
    # Prepare the request
    url = 'https://api.ddex-workbench.org/v1/validate'
    payload = {
        'content': xml_content,
        'type': 'ERN',
        'version': version,
        'profile': profile
    }
    
    # Send validation request
    response = requests.post(url, json=payload)
    result = response.json()
    
    # Process results
    if result['valid']:
        print('✅ Validation passed!')
        print(f"Processed in {result['metadata']['processingTime']}ms")
    else:
        print('❌ Validation failed:')
        for error in result['errors']:
            print(f"  Line {error['line']}: {error['message']}")
        
        if result.get('warnings'):
            print('\\n⚠️  Warnings:')
            for warning in result['warnings']:
                print(f"  Line {warning['line']}: {warning['message']}")
    
    return result

# Usage
if __name__ == '__main__':
    result = validate_file('./releases/new_album.xml', '4.3', 'AudioAlbum')
    print(f"\\nTotal issues: {len(result['errors']) + len(result.get('warnings', []))}")`,
    php: `// PHP example - validate file from disk
<?php
require 'vendor/autoload.php';
use GuzzleHttp\\Client;

function validateFile($filePath, $version = '4.3', $profile = 'AudioAlbum') {
    // Read the XML file
    $xmlContent = file_get_contents($filePath);
    if ($xmlContent === false) {
        throw new Exception("Could not read file: $filePath");
    }
    
    // Create HTTP client
    $client = new Client();
    
    try {
        // Send validation request
        $response = $client->post(
            'https://api.ddex-workbench.org/v1/validate',
            [
                'json' => [
                    'content' => $xmlContent,
                    'type' => 'ERN',
                    'version' => $version,
                    'profile' => $profile
                ]
            ]
        );
        
        $result = json_decode($response->getBody(), true);
        
        // Process results
        if ($result['valid']) {
            echo "✅ Validation passed!\\n";
            echo "Processed in {$result['metadata']['processingTime']}ms\\n";
        } else {
            echo "❌ Validation failed:\\n";
            foreach ($result['errors'] as $error) {
                echo "  Line {$error['line']}: {$error['message']}\\n";
            }
            
            if (!empty($result['warnings'])) {
                echo "\\n⚠️  Warnings:\\n";
                foreach ($result['warnings'] as $warning) {
                    echo "  Line {$warning['line']}: {$warning['message']}\\n";
                }
            }
        }
        
        return $result;
        
    } catch (Exception $e) {
        echo "Error: " . $e->getMessage() . "\\n";
        return null;
    }
}

// Usage
$result = validateFile('./releases/new_album.xml', '4.3', 'AudioAlbum');
if ($result) {
    $totalIssues = count($result['errors']) + count($result['warnings'] ?? []);
    echo "\\nTotal issues: $totalIssues\\n";
}`
  }
}

// Methods
const getCodeExample = (example, language) => {
  return codeExamples[example]?.[language] || '// Example not available'
}

// Copy to clipboard function
const copyToClipboard = async (code, identifier) => {
  try {
    await navigator.clipboard.writeText(code)
    // Set copied state for this specific code block
    copiedStates.value[identifier] = true
    
    // Reset after 2 seconds
    setTimeout(() => {
      copiedStates.value[identifier] = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy:', err)
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = code
    textArea.style.position = 'fixed'
    textArea.style.opacity = '0'
    document.body.appendChild(textArea)
    textArea.select()
    try {
      document.execCommand('copy')
      copiedStates.value[identifier] = true
      setTimeout(() => {
        copiedStates.value[identifier] = false
      }, 2000)
    } catch (err) {
      console.error('Fallback copy failed:', err)
    }
    document.body.removeChild(textArea)
  }
}

const scrollToSection = (sectionId) => {
  const element = document.getElementById(sectionId)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    activeSection.value = sectionId
  }
}

const handleScroll = () => {
  const sections = document.querySelectorAll('.doc-section')
  const scrollPosition = window.scrollY + 100

  sections.forEach(section => {
    const sectionTop = section.offsetTop
    const sectionHeight = section.offsetHeight
    
    if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
      activeSection.value = section.id
    }
  })
}

// Lifecycle
onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <div class="api-docs-view">
    <!-- Hero Section -->
    <section class="hero-section bg-info">
      <div class="container">
        <div class="hero-content text-center">
          <h1 class="hero-title">DDEX Validation API</h1>
          <p class="hero-subtitle">
            RESTful API for validating DDEX Electronic Release Notification (ERN) files. No authentication required.
          </p>
          <div class="hero-badges mt-lg">
            <span class="badge">Version 1.0.2</span>
            <span class="badge">REST API</span>
            <span class="badge">Free & Open</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Documentation Content -->
    <section class="section">
      <div class="container">
        <div class="docs-layout">
          <!-- Sidebar Navigation -->
          <aside class="docs-sidebar">
            <nav class="docs-nav">
              <h3 class="nav-section-title">Getting Started</h3>
              <ul class="nav-list">
                <li><a href="#introduction" @click="scrollToSection('introduction')" :class="{ active: activeSection === 'introduction' }">Introduction</a></li>
                <li><a href="#sdk" @click="scrollToSection('sdk')" :class="{ active: activeSection === 'sdk' }">SDK & Libraries</a></li>
                <li><a href="#authentication" @click="scrollToSection('authentication')" :class="{ active: activeSection === 'authentication' }">Authentication</a></li>
                <li><a href="#rate-limiting" @click="scrollToSection('rate-limiting')" :class="{ active: activeSection === 'rate-limiting' }">Rate Limiting</a></li>
                <li><a href="#errors" @click="scrollToSection('errors')" :class="{ active: activeSection === 'errors' }">Error Handling</a></li>
              </ul>

              <h3 class="nav-section-title">Endpoints</h3>
              <ul class="nav-list">
                <li><a href="#validate" @click="scrollToSection('validate')" :class="{ active: activeSection === 'validate' }">POST /validate</a></li>
                <li><a href="#formats" @click="scrollToSection('formats')" :class="{ active: activeSection === 'formats' }">GET /formats</a></li>
                <li><a href="#health" @click="scrollToSection('health')" :class="{ active: activeSection === 'health' }">GET /health</a></li>
              </ul>

              <h3 class="nav-section-title">Resources</h3>
              <ul class="nav-list">
                <li><a href="#supported-versions" @click="scrollToSection('supported-versions')" :class="{ active: activeSection === 'supported-versions' }">Supported Versions</a></li>
                <li><a href="#examples" @click="scrollToSection('examples')" :class="{ active: activeSection === 'examples' }">Code Examples</a></li>
                <li><a href="#response-format" @click="scrollToSection('response-format')" :class="{ active: activeSection === 'response-format' }">Response Format</a></li>
              </ul>
            </nav>
          </aside>

          <!-- Main Documentation -->
          <main class="docs-content">
            <!-- Introduction -->
            <section id="introduction" class="doc-section">
              <h2>Introduction</h2>
              <p>
                The DDEX Validation API provides a simple, RESTful interface for validating DDEX Electronic Release Notification (ERN) 
                files against official DDEX schemas and business rules. The API supports ERN versions 4.3, 4.2, and 3.8.2 with comprehensive 
                validation including XSD schema validation, business rules, and profile-specific checks.
              </p>
              
              <div class="info-box mt-lg">
                <h4>Base URL</h4>
                <code class="endpoint-url">https://api.ddex-workbench.org/v1</code>
              </div>

              <div class="success-box mt-lg">
                <h4>🎉 No Authentication Required</h4>
                <p>The validation API is completely free and open. No API keys or authentication needed for basic validation!</p>
              </div>

              <!-- Health Check section -->
              <div class="warning-box mt-lg">
                <h4>🩺 Test API Status</h4>
                <p>Before integrating, check if the API is online:</p>
                <code class="endpoint-url">https://api.ddex-workbench.org/v1/health</code>
                <div class="code-example mt-sm">
                  <div class="code-block-wrapper">
                    <button 
                      @click="copyToClipboard('curl https://api.ddex-workbench.org/v1/health', 'health-quick')"
                      class="copy-button"
                      :class="{ copied: copiedStates['health-quick'] }"
                    >
                      <font-awesome-icon :icon="copiedStates['health-quick'] ? 'check' : 'copy'" />
                      {{ copiedStates['health-quick'] ? 'Copied!' : 'Copy' }}
                    </button>
                    <pre class="code-block"><code>curl https://api.ddex-workbench.org/v1/health</code></pre>
                  </div>
                </div>
              </div>

              <h3 class="mt-xl">Quick Start</h3>
              <p>Here's a simple example to validate an ERN file. This command works in terminal, ReqBin, or any API testing tool:</p>
              
              <div class="code-example">
                <div class="code-tabs">
                  <button 
                    v-for="lang in languages" 
                    :key="lang.id"
                    @click="activeLanguage = lang.id"
                    class="code-tab"
                    :class="{ active: activeLanguage === lang.id }"
                  >
                    {{ lang.name }}
                  </button>
                </div>
                <div class="code-block-wrapper">
                  <button 
                    @click="copyToClipboard(getCodeExample('quickstart', activeLanguage), `quickstart-${activeLanguage}`)"
                    class="copy-button"
                    :class="{ copied: copiedStates[`quickstart-${activeLanguage}`] }"
                  >
                    <font-awesome-icon :icon="copiedStates[`quickstart-${activeLanguage}`] ? 'check' : 'copy'" />
                    {{ copiedStates[`quickstart-${activeLanguage}`] ? 'Copied!' : 'Copy' }}
                  </button>
                  <pre class="code-block"><code>{{ getCodeExample('quickstart', activeLanguage) }}</code></pre>
                </div>
              </div>

              <div class="info-box mt-lg">
                <h4>💡 Testing with ReqBin</h4>
                <p>To test this API using <a href="https://reqbin.com" target="_blank">Reqbin.com</a>:</p>
                <ol class="numbered-list">
                  <li>Copy the cURL command above</li>
                  <li>Go to ReqBin and click "Curl" from the top nav</li>
                  <li>Paste the command into the text area</li>
                  <li>Click "Run" to execute the request</li>
                </ol>
              </div>
            </section>

            <section id="sdk" class="doc-section">
              <h2>SDK & Client Libraries</h2>
              <p>
                For easier integration, we provide official SDKs that handle authentication, 
                retry logic, and provide type-safe access to all API endpoints.
              </p>

              <div class="sdk-card card">
                <div class="card-body">
                  <div class="sdk-header">
                    <h3>
                      <font-awesome-icon :icon="['fab', 'npm']" class="sdk-icon" />
                      Official JavaScript/TypeScript SDK
                    </h3>
                    <span class="badge badge-success">Recommended</span>
                  </div>
                  
                  <p class="sdk-description">
                    Full-featured client library with TypeScript support, automatic retries, 
                    and simplified error handling.
                  </p>

                  <h4>Installation</h4>
                  <div class="code-example">
                    <div class="code-block-wrapper">
                      <button 
                        @click="copyToClipboard('npm install @ddex-workbench/sdk', 'sdk-npm-install')"
                        class="copy-button"
                        :class="{ copied: copiedStates['sdk-npm-install'] }"
                      >
                        <font-awesome-icon :icon="copiedStates['sdk-npm-install'] ? 'check' : 'copy'" />
                        {{ copiedStates['sdk-npm-install'] ? 'Copied!' : 'Copy' }}
                      </button>
                      <pre class="code-block"><code>npm install @ddex-workbench/sdk</code></pre>
                    </div>
                  </div>

                  <h4>Quick Example</h4>
                  <div class="code-example">
                    <div class="code-block-wrapper">
                      <button 
                        @click="copyToClipboard(`import { DDEXClient } from '@ddex-workbench/sdk';

const client = new DDEXClient({
  apiKey: 'ddex_your-api-key' // Optional
});

const result = await client.validate(xmlContent, {
  version: '4.3',
  profile: 'AudioAlbum'
});

console.log(result.valid ? 'Valid ✅' : 'Invalid ❌');`, 'sdk-js-example')"
                        class="copy-button"
                        :class="{ copied: copiedStates['sdk-js-example'] }"
                      >
                        <font-awesome-icon :icon="copiedStates['sdk-js-example'] ? 'check' : 'copy'" />
                        {{ copiedStates['sdk-js-example'] ? 'Copied!' : 'Copy' }}
                      </button>
                      <pre class="code-block"><code>import { DDEXClient } from '@ddex-workbench/sdk';

const client = new DDEXClient({
  apiKey: 'ddex_your-api-key' // Optional
});

const result = await client.validate(xmlContent, {
  version: '4.3',
  profile: 'AudioAlbum'
});

console.log(result.valid ? 'Valid ✅' : 'Invalid ❌');</code></pre>
                    </div>
                  </div>

                  <h4>Key Features</h4>
                  <ul class="feature-list">
                    <li>TypeScript support with full type definitions</li>
                    <li>Automatic retry logic with exponential backoff</li>
                    <li>Works in Node.js and browsers</li>
                    <li>Batch validation support</li>
                    <li>Automatic ERN version detection</li>
                    <li>Structured error handling</li>
                    <li>File upload helpers</li>
                  </ul>

                  <div class="sdk-links">
                    <a href="https://www.npmjs.com/package/@ddex-workbench/sdk" target="_blank" class="sdk-link">
                      <font-awesome-icon :icon="['fab', 'npm']" /> npm Package
                    </a>
                    <a href="https://github.com/daddykev/ddex-workbench/tree/main/packages/sdk" target="_blank" class="sdk-link">
                      <font-awesome-icon :icon="['fab', 'github']" /> GitHub
                    </a>
                    <a href="https://github.com/daddykev/ddex-workbench/tree/main/packages/sdk#readme" target="_blank" class="sdk-link">
                      <font-awesome-icon :icon="['fas', 'book']" /> Documentation
                    </a>
                  </div>
                </div>
              </div>

              <div class="sdk-card card">
                <div class="card-body">
                  <div class="sdk-header">
                    <h3>
                      <font-awesome-icon :icon="['fab', 'python']" class="sdk-icon" />
                      Official Python SDK
                    </h3>
                    <span class="badge badge-success">Available</span>
                  </div>
                  
                  <p class="sdk-description">
                    Python client library with type hints, async support, and comprehensive error handling.
                  </p>

                  <h4>Installation</h4>
                  <div class="code-example">
                    <div class="code-block-wrapper">
                      <button 
                        @click="copyToClipboard('pip install ddex-workbench', 'sdk-pip-install')"
                        class="copy-button"
                        :class="{ copied: copiedStates['sdk-pip-install'] }"
                      >
                        <font-awesome-icon :icon="copiedStates['sdk-pip-install'] ? 'check' : 'copy'" />
                        {{ copiedStates['sdk-pip-install'] ? 'Copied!' : 'Copy' }}
                      </button>
                      <pre class="code-block"><code>pip install ddex-workbench</code></pre>
                    </div>
                  </div>

                  <h4>Quick Example</h4>
                  <div class="code-example">
                    <div class="code-block-wrapper">
                      <button 
                        @click="copyToClipboard('from ddex_workbench import DDEXClient\n\nclient = DDEXClient(api_key=\'ddex_your-api-key\')  # Optional\n\nresult = client.validate(\n    content=xml_content,\n    version=\'4.3\',\n    profile=\'AudioAlbum\'\n)\n\nprint(\'Valid ✅\' if result.valid else \'Invalid ❌\')', 'sdk-python-example')"
                        class="copy-button"
                        :class="{ copied: copiedStates['sdk-python-example'] }"
                      >
                        <font-awesome-icon :icon="copiedStates['sdk-python-example'] ? 'check' : 'copy'" />
                        {{ copiedStates['sdk-python-example'] ? 'Copied!' : 'Copy' }}
                      </button>
                      <pre class="code-block"><code>from ddex_workbench import DDEXClient

client = DDEXClient(api_key="ddex_your-api-key")  # Optional

result = client.validate(
    content=xml_content,
    version="4.3",
    profile="AudioAlbum"
)

print("Valid ✅" if result.valid else "Invalid ❌")</code></pre>
                    </div>
                  </div>

                  <div class="sdk-links">
                    <a href="https://pypi.org/project/ddex-workbench/" target="_blank" class="sdk-link">
                      <font-awesome-icon :icon="['fab', 'python']" /> PyPI Package
                    </a>
                    <a href="https://github.com/daddykev/ddex-workbench/tree/main/packages/python-sdk" target="_blank" class="sdk-link">
                      <font-awesome-icon :icon="['fab', 'github']" /> GitHub
                    </a>
                  </div>
                </div>
              </div>

              <div class="info-box mt-lg">
                <h4>Why use the SDK?</h4>
                <p>While you can call the API directly, the SDK provides:</p>
                <ul>
                  <li><strong>Type Safety:</strong> Full TypeScript/Python type support with IntelliSense</li>
                  <li><strong>Error Handling:</strong> Structured errors with retry strategies</li>
                  <li><strong>Convenience Methods:</strong> Shortcuts like <code>validateERN43()</code></li>
                  <li><strong>Platform Support:</strong> Works seamlessly in Node.js, browsers, and Python environments</li>
                  <li><strong>Maintained:</strong> Regular updates with new API features</li>
                </ul>
              </div>

              <h3 class="mt-xl">Direct API Access</h3>
              <p>
                If you prefer to call the API directly or need to use a different language, 
                continue reading for the REST API documentation with examples in cURL, JavaScript, Python, and PHP.
              </p>
            </section>

            <!-- Authentication -->
            <section id="authentication" class="doc-section">
              <h2>Authentication</h2>
              <p>
                The DDEX Validation API is <strong>publicly accessible</strong> and does not require authentication for basic validation operations. 
                This makes it easy to integrate into your workflow without managing API keys.
              </p>

              <h3>Optional Authentication</h3>
              <p>
                While not required, authenticated users can access additional features:
              </p>
              
              <ul class="feature-list">
                <li>Higher rate limits (60 requests/minute vs 10 for anonymous)</li>
                <li>Validation history tracking</li>
                <li>Batch validation capabilities (coming soon)</li>
                <li>Priority processing during high load</li>
              </ul>

              <div class="info-box mt-lg">
                <p>To get an API key for enhanced features:</p>
                <ol class="numbered-list">
                  <li>Sign up for a free account at <a href="/signup">ddex-workbench.org/signup</a></li>
                  <li>Navigate to your <a href="/settings">Settings page</a></li>
                  <li>Generate an API key in the API Keys section</li>
                  <li>Include it as: <code>X-API-Key: ddex_YOUR_KEY_HERE</code></li>
                </ol>
              </div>
            </section>

            <!-- Rate Limiting -->
            <section id="rate-limiting" class="doc-section">
              <h2>Rate Limiting</h2>
              <p>
                API requests are rate limited to ensure fair usage and system stability:
              </p>

              <table class="data-table">
                <thead>
                  <tr>
                    <th>User Type</th>
                    <th>Requests per Minute</th>
                    <th>Burst Limit</th>
                    <th>Max File Size</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Anonymous (No Auth)</td>
                    <td>10</td>
                    <td>20</td>
                    <td>10 MB</td>
                  </tr>
                  <tr>
                    <td>Authenticated (Free)</td>
                    <td>60</td>
                    <td>100</td>
                    <td>25 MB</td>
                  </tr>
                </tbody>
              </table>

              <div class="info-box mt-lg">
                <p><strong>Note:</strong> Rate limits are applied per IP address for anonymous users and per API key for authenticated users.</p>
              </div>
            </section>

            <!-- Error Handling -->
            <section id="errors" class="doc-section">
              <h2>Error Handling</h2>
              <p>
                The API uses standard HTTP status codes and returns errors in a consistent JSON format:
              </p>

              <h3>Error Response Format</h3>
              <div class="code-example">
                <div class="code-block-wrapper">
                  <button 
                    @click="copyToClipboard(getCodeExample('errorFormat', 'json'), 'error-format')"
                    class="copy-button"
                    :class="{ copied: copiedStates['error-format'] }"
                  >
                    <font-awesome-icon :icon="copiedStates['error-format'] ? 'check' : 'copy'" />
                    {{ copiedStates['error-format'] ? 'Copied!' : 'Copy' }}
                  </button>
                  <pre class="code-block"><code>{{ getCodeExample('errorFormat', 'json') }}</code></pre>
                </div>
              </div>

              <h3>Common HTTP Status Codes</h3>
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Status Code</th>
                    <th>Meaning</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><code>200</code></td>
                    <td>Success - Validation completed (check response for validation results)</td>
                  </tr>
                  <tr>
                    <td><code>400</code></td>
                    <td>Bad Request - Invalid parameters or malformed request</td>
                  </tr>
                  <tr>
                    <td><code>413</code></td>
                    <td>Payload Too Large - XML content exceeds size limit</td>
                  </tr>
                  <tr>
                    <td><code>429</code></td>
                    <td>Too Many Requests - Rate limit exceeded</td>
                  </tr>
                  <tr>
                    <td><code>500</code></td>
                    <td>Internal Server Error - Unexpected error occurred</td>
                  </tr>
                </tbody>
              </table>
            </section>

            <!-- Validate Endpoint -->
            <section id="validate" class="doc-section">
              <h2>POST /validate</h2>
              <p>Validate DDEX ERN XML content against schemas and business rules.</p>

              <div class="endpoint-details">
                <h3>Request Body</h3>
                <table class="params-table">
                  <thead>
                    <tr>
                      <th>Parameter</th>
                      <th>Type</th>
                      <th>Required</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><code>content</code></td>
                      <td>string</td>
                      <td>Yes</td>
                      <td>XML content to validate</td>
                    </tr>
                    <tr>
                      <td><code>type</code></td>
                      <td>string</td>
                      <td>Yes</td>
                      <td>Message type (currently only "ERN" supported)</td>
                    </tr>
                    <tr>
                      <td><code>version</code></td>
                      <td>string</td>
                      <td>Yes</td>
                      <td>DDEX version: "4.3", "4.2", or "3.8.2"</td>
                    </tr>
                    <tr>
                      <td><code>profile</code></td>
                      <td>string</td>
                      <td>No</td>
                      <td>Validation profile: "AudioAlbum", "AudioSingle", "Video", "Mixed", or "ReleaseByRelease" (3.8.2 only)</td>
                    </tr>
                  </tbody>
                </table>

                <h3 class="mt-lg">Example Request</h3>
                <div class="code-example">
                  <div class="code-tabs">
                    <button 
                      v-for="lang in languages" 
                      :key="lang.id"
                      @click="activeEndpointLang = lang.id"
                      class="code-tab"
                      :class="{ active: activeEndpointLang === lang.id }"
                    >
                      {{ lang.name }}
                    </button>
                  </div>
                  <div class="code-block-wrapper">
                    <button 
                      @click="copyToClipboard(getCodeExample('validateEndpoint', activeEndpointLang), `validate-${activeEndpointLang}`)"
                      class="copy-button"
                      :class="{ copied: copiedStates[`validate-${activeEndpointLang}`] }"
                    >
                      <font-awesome-icon :icon="copiedStates[`validate-${activeEndpointLang}`] ? 'check' : 'copy'" />
                      {{ copiedStates[`validate-${activeEndpointLang}`] ? 'Copied!' : 'Copy' }}
                    </button>
                    <pre class="code-block"><code>{{ getCodeExample('validateEndpoint', activeEndpointLang) }}</code></pre>
                  </div>
                </div>

                <h3 class="mt-lg">Response</h3>
                <div class="code-example">
                  <div class="code-block-wrapper">
                    <button 
                      @click="copyToClipboard(getCodeExample('validateResponse', 'json'), 'validate-response')"
                      class="copy-button"
                      :class="{ copied: copiedStates['validate-response'] }"
                    >
                      <font-awesome-icon :icon="copiedStates['validate-response'] ? 'check' : 'copy'" />
                      {{ copiedStates['validate-response'] ? 'Copied!' : 'Copy' }}
                    </button>
                    <pre class="code-block"><code>{{ getCodeExample('validateResponse', 'json') }}</code></pre>
                  </div>
                </div>

                <h3 class="mt-lg">Response Fields</h3>
                <table class="params-table">
                  <thead>
                    <tr>
                      <th>Field</th>
                      <th>Type</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><code>valid</code></td>
                      <td>boolean</td>
                      <td>Whether the XML is valid according to all validation rules</td>
                    </tr>
                    <tr>
                      <td><code>errors</code></td>
                      <td>array</td>
                      <td>List of validation errors (severity: "error")</td>
                    </tr>
                    <tr>
                      <td><code>warnings</code></td>
                      <td>array</td>
                      <td>List of validation warnings (severity: "warning")</td>
                    </tr>
                    <tr>
                      <td><code>metadata</code></td>
                      <td>object</td>
                      <td>Additional information about the validation process</td>
                    </tr>
                    <tr>
                      <td><code>metadata.validationSteps</code></td>
                      <td>array</td>
                      <td>Breakdown of validation stages (XSD, BusinessRules, Schematron) with timing</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <!-- Formats Endpoint -->
            <section id="formats" class="doc-section">
              <h2>GET /formats</h2>
              <p>Get the list of supported DDEX versions and profiles.</p>

              <div class="endpoint-details">
                <h3>Example Response</h3>
                <div class="code-example">
                  <div class="code-block-wrapper">
                    <button 
                      @click="copyToClipboard(getCodeExample('formatsResponse', 'json'), 'formats-response')"
                      class="copy-button"
                      :class="{ copied: copiedStates['formats-response'] }"
                    >
                      <font-awesome-icon :icon="copiedStates['formats-response'] ? 'check' : 'copy'" />
                      {{ copiedStates['formats-response'] ? 'Copied!' : 'Copy' }}
                    </button>
                    <pre class="code-block"><code>{{ getCodeExample('formatsResponse', 'json') }}</code></pre>
                  </div>
                </div>
              </div>
            </section>

            <!-- Health Endpoint -->
            <section id="health" class="doc-section">
              <h2>GET /health</h2>
              <p>Check the API service health status. Use this endpoint to verify the API is operational before sending validation requests.</p>

              <div class="endpoint-details">
                <h3>Quick Test</h3>
                <div class="code-example">
                  <div class="code-tabs">
                    <button 
                      v-for="lang in languages" 
                      :key="lang.id"
                      @click="activeHealthLang = lang.id"
                      class="code-tab"
                      :class="{ active: activeHealthLang === lang.id }"
                    >
                      {{ lang.name }}
                    </button>
                  </div>
                  <div class="code-block-wrapper">
                    <button 
                      @click="copyToClipboard(getCodeExample('healthCheck', activeHealthLang), `health-${activeHealthLang}`)"
                      class="copy-button"
                      :class="{ copied: copiedStates[`health-${activeHealthLang}`] }"
                    >
                      <font-awesome-icon :icon="copiedStates[`health-${activeHealthLang}`] ? 'check' : 'copy'" />
                      {{ copiedStates[`health-${activeHealthLang}`] ? 'Copied!' : 'Copy' }}
                    </button>
                    <pre class="code-block"><code>{{ getCodeExample('healthCheck', activeHealthLang) }}</code></pre>
                  </div>
                </div>

                <h3 class="mt-lg">Example Response</h3>
                <div class="code-example">
                  <div class="code-block-wrapper">
                    <button 
                      @click="copyToClipboard(getCodeExample('healthResponse', 'json'), 'health-response')"
                      class="copy-button"
                      :class="{ copied: copiedStates['health-response'] }"
                    >
                      <font-awesome-icon :icon="copiedStates['health-response'] ? 'check' : 'copy'" />
                      {{ copiedStates['health-response'] ? 'Copied!' : 'Copy' }}
                    </button>
                    <pre class="code-block"><code>{{ getCodeExample('healthResponse', 'json') }}</code></pre>
                  </div>
                </div>
              </div>
            </section>

            <!-- Supported Versions -->
            <section id="supported-versions" class="doc-section">
              <h2>Supported DDEX Versions</h2>
              <p>
                The API currently supports the following ERN versions and profiles:
              </p>

              <div class="version-cards">
                <div class="version-card card">
                  <div class="version-header">
                    <h3>ERN 4.3</h3>
                    <span class="badge badge-success">Recommended</span>
                  </div>
                  <p class="text-sm text-secondary mb-md">
                    Latest version with enhanced features for modern music distribution
                  </p>
                  <h4 class="text-sm font-semibold mb-xs">Supported Profiles:</h4>
                  <ul class="profile-list">
                    <li>AudioAlbum</li>
                    <li>AudioSingle</li>
                    <li>Video</li>
                    <li>Mixed</li>
                  </ul>
                </div>

                <div class="version-card card">
                  <div class="version-header">
                    <h3>ERN 4.2</h3>
                    <span class="badge">Supported</span>
                  </div>
                  <p class="text-sm text-secondary mb-md">
                    Previous major version, still widely used
                  </p>
                  <h4 class="text-sm font-semibold mb-xs">Supported Profiles:</h4>
                  <ul class="profile-list">
                    <li>AudioAlbum</li>
                    <li>AudioSingle</li>
                    <li>Video</li>
                    <li>Mixed</li>
                  </ul>
                </div>

                <div class="version-card card">
                  <div class="version-header">
                    <h3>ERN 3.8.2</h3>
                    <span class="badge">Legacy</span>
                  </div>
                  <p class="text-sm text-secondary mb-md">
                    Legacy version, consider upgrading to 4.3
                  </p>
                  <h4 class="text-sm font-semibold mb-xs">Supported Profiles:</h4>
                  <ul class="profile-list">
                    <li>AudioAlbum</li>
                    <li>AudioSingle</li>
                    <li>Video</li>
                    <li>Mixed</li>
                    <li>ReleaseByRelease</li>
                  </ul>
                </div>
              </div>

              <div class="warning-box mt-lg">
                <strong>Migration Notice:</strong> DDEX is mandating ERN 4.3 adoption by March 2026. 
                The API will provide migration suggestions when validating older versions.
              </div>
            </section>

            <!-- Response Format Details -->
            <section id="response-format" class="doc-section">
              <h2>Response Format Details</h2>
              <p>
                Understanding the validation response structure helps you process results effectively:
              </p>

              <h3>Error Object Structure</h3>
              <table class="params-table">
                <thead>
                  <tr>
                    <th>Field</th>
                    <th>Type</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><code>line</code></td>
                    <td>number</td>
                    <td>Line number where the error occurred</td>
                  </tr>
                  <tr>
                    <td><code>column</code></td>
                    <td>number</td>
                    <td>Column number where the error occurred</td>
                  </tr>
                  <tr>
                    <td><code>message</code></td>
                    <td>string</td>
                    <td>Human-readable error description</td>
                  </tr>
                  <tr>
                    <td><code>severity</code></td>
                    <td>string</td>
                    <td>"error" or "warning"</td>
                  </tr>
                  <tr>
                    <td><code>rule</code></td>
                    <td>string</td>
                    <td>Validation rule identifier (e.g., "ERN43-MessageHeader")</td>
                  </tr>
                  <tr>
                    <td><code>context</code></td>
                    <td>string</td>
                    <td>Optional XML snippet showing the error location</td>
                  </tr>
                </tbody>
              </table>

              <h3 class="mt-lg">Validation Steps</h3>
              <p>Each validation request goes through multiple stages:</p>
              
              <ol class="validation-steps-list">
                <li>
                  <strong>XSD Schema Validation</strong><br>
                  Checks XML structure against official DDEX schemas
                </li>
                <li>
                  <strong>Business Rules Validation</strong><br>
                  Applies version-specific business logic and requirements
                </li>
                <li>
                  <strong>Profile Validation (if specified)</strong><br>
                  Validates against profile-specific requirements (e.g., AudioAlbum must have multiple tracks)
                </li>
              </ol>
            </section>

            <!-- Code Examples -->
            <section id="examples" class="doc-section">
              <h2>Complete Code Examples</h2>
              <p>
                Here are complete, working examples for common use cases:
              </p>

              <h3>Validate a File from Disk</h3>
              <div class="code-example">
                <div class="code-tabs">
                  <button 
                    v-for="lang in languages.filter(l => l.id !== 'curl')" 
                    :key="lang.id"
                    @click="activeFileExampleLang = lang.id"
                    class="code-tab"
                    :class="{ active: activeFileExampleLang === lang.id }"
                  >
                    {{ lang.name }}
                  </button>
                </div>
                <div class="code-block-wrapper">
                  <button 
                    @click="copyToClipboard(getCodeExample('fileExamples', activeFileExampleLang), `file-${activeFileExampleLang}`)"
                    class="copy-button"
                    :class="{ copied: copiedStates[`file-${activeFileExampleLang}`] }"
                  >
                    <font-awesome-icon :icon="copiedStates[`file-${activeFileExampleLang}`] ? 'check' : 'copy'" />
                    {{ copiedStates[`file-${activeFileExampleLang}`] ? 'Copied!' : 'Copy' }}
                  </button>
                  <pre class="code-block"><code>{{ getCodeExample('fileExamples', activeFileExampleLang) }}</code></pre>
                </div>
              </div>

              <div class="info-box mt-lg">
                <h4>Need More Examples?</h4>
                <p>Check out our GitHub repository for more code examples in various languages and frameworks:</p>
                <a href="https://github.com/daddykev/ddex-workbench/tree/main/examples" target="_blank" class="btn btn-secondary">
                  <font-awesome-icon :icon="['fab', 'github']" /> View Examples on GitHub
                </a>
              </div>
            </section>
          </main>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* Layout Container Fixes */
.api-docs-view {
  width: 100%;
  overflow-x: hidden;
}

.container {
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 0 var(--space-lg);
}

/* Hero Section */
.hero-section {
  padding: var(--space-2xl) 0;
  color: white;
  background: linear-gradient(135deg, var(--color-info) 0%, #2563eb 100%);
}

.hero-title {
  font-size: var(--text-3xl);
  margin-bottom: var(--space-sm);
  color: white;
}

.hero-subtitle {
  font-size: var(--text-lg);
  opacity: 0.9;
  max-width: 600px;
  margin: 0 auto;
}

.hero-badges {
  display: flex;
  justify-content: center;
  gap: var(--space-sm);
  flex-wrap: wrap;
}

.badge {
  display: inline-block;
  padding: var(--space-xs) var(--space-md);
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
}

.badge-success {
  background-color: var(--color-success);
  color: white;
}

/* Documentation Layout */
.docs-layout {
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: var(--space-2xl);
  align-items: start;
  max-width: 100%;
}

/* Main Content Area Fix */
.docs-content {
  max-width: 100%;
  min-width: 0; /* Prevents grid blowout */
  overflow-x: hidden;
}

/* Sidebar */
.docs-sidebar {
  position: sticky;
  top: calc(64px + var(--space-lg));
  max-height: calc(100vh - 100px);
  overflow-y: auto;
  min-width: 0;
}

.docs-nav {
  padding-right: var(--space-lg);
}

.nav-section-title {
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  text-transform: uppercase;
  color: var(--color-text-secondary);
  margin-bottom: var(--space-sm);
  margin-top: var(--space-lg);
}

.nav-section-title:first-child {
  margin-top: 0;
}

.nav-list {
  list-style: none;
  margin-bottom: var(--space-lg);
}

.nav-list li {
  margin-bottom: var(--space-xs);
}

.nav-list a {
  display: block;
  padding: var(--space-xs) var(--space-sm);
  color: var(--color-text-secondary);
  text-decoration: none;
  border-radius: var(--radius-sm);
  font-size: var(--text-sm);
  transition: all var(--transition-base);
}

.nav-list a:hover {
  color: var(--color-text);
  background-color: var(--color-bg-secondary);
}

.nav-list a.active {
  color: var(--color-primary);
  background-color: var(--color-primary-light);
  font-weight: var(--font-medium);
}

/* Documentation Content */
.doc-section {
  margin-bottom: var(--space-3xl);
  scroll-margin-top: 80px;
  max-width: 100%;
  overflow-x: hidden;
}

.doc-section h2 {
  font-size: var(--text-2xl);
  margin-bottom: var(--space-lg);
  color: var(--color-heading);
}

.doc-section h3 {
  font-size: var(--text-lg);
  margin-bottom: var(--space-md);
  color: var(--color-heading);
}

.doc-section h4 {
  font-size: var(--text-base);
  margin-bottom: var(--space-sm);
  color: var(--color-heading);
  font-weight: var(--font-semibold);
}

.doc-section p {
  color: var(--color-text);
  line-height: var(--leading-relaxed);
  margin-bottom: var(--space-md);
  max-width: 100%;
}

/* Info Boxes */
.info-box,
.warning-box,
.success-box {
  padding: var(--space-lg);
  border-radius: var(--radius-md);
  margin-bottom: var(--space-lg);
  max-width: 100%;
  overflow-x: auto;
}

.info-box {
  background-color: var(--color-primary-light);
  border: 1px solid var(--color-primary);
}

.warning-box {
  background-color: #fef3c7;
  border: 1px solid #f59e0b;
  color: #92400e;
}

[data-theme="dark"] .warning-box {
  background-color: rgba(245, 158, 11, 0.1);
  border-color: #f59e0b;
  color: var(--color-text);
}

.success-box {
  background-color: var(--color-secondary-light);
  border: 1px solid var(--color-success);
  color: var(--color-text);
}

.endpoint-url {
  display: inline-block;
  padding: var(--space-xs) var(--space-sm);
  background-color: var(--color-bg);
  border-radius: var(--radius-sm);
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  word-break: break-all;
  max-width: 100%;
}

/* Code Examples - Fixed */
.code-example {
  margin-bottom: var(--space-lg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
  max-width: 100%;
}

.code-tabs {
  display: flex;
  background-color: var(--color-bg-secondary);
  border-bottom: 1px solid var(--color-border);
  overflow-x: auto;
}

.code-tab {
  padding: var(--space-sm) var(--space-lg);
  background: none;
  border: none;
  color: var(--color-text-secondary);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  cursor: pointer;
  transition: all var(--transition-base);
  white-space: nowrap;
}

.code-tab:hover {
  color: var(--color-text);
  background-color: var(--color-surface);
}

.code-tab.active {
  color: var(--color-primary);
  background-color: var(--color-surface);
  border-bottom: 2px solid var(--color-primary);
  margin-bottom: -1px;
}

/* Code Block Wrapper for positioning copy button */
.code-block-wrapper {
  position: relative;
  max-width: 100%;
}

/* Copy Button Styles */
.copy-button {
  position: absolute;
  top: var(--space-sm);
  right: var(--space-sm);
  padding: var(--space-xs) var(--space-md);
  background-color: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  transition: all var(--transition-base);
  z-index: 10;
}

.copy-button:hover {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
}

.copy-button.copied {
  background-color: var(--color-success);
  border-color: var(--color-success);
  color: white;
}

.code-block {
  padding: var(--space-lg);
  background-color: var(--color-bg-tertiary);
  overflow-x: auto;
  max-width: 100%;
}

/* Adjust code block padding to accommodate copy button */
.code-block-wrapper .code-block {
  padding-top: calc(var(--space-lg) + var(--space-xl));
}

.code-block code {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  line-height: 1.5;
  color: var(--color-text);
  white-space: pre;
  display: block;
}

/* Ensure pre elements don't break layout */
pre {
  max-width: 100%;
  overflow-x: auto;
  margin: 0;
}

/* Tables - Fixed */
.data-table,
.params-table {
  width: 100%;
  margin-bottom: var(--space-lg);
  border-collapse: collapse;
  table-layout: auto;
  display: block;
  overflow-x: auto;
}

.data-table th,
.params-table th {
  background-color: var(--color-bg-secondary);
  padding: var(--space-sm) var(--space-md);
  text-align: left;
  font-weight: var(--font-semibold);
  font-size: var(--text-sm);
  border-bottom: 2px solid var(--color-border);
  white-space: nowrap;
}

.data-table td,
.params-table td {
  padding: var(--space-sm) var(--space-md);
  border-bottom: 1px solid var(--color-border);
}

.data-table code,
.params-table code {
  padding: var(--space-xs);
  background-color: var(--color-bg-secondary);
  border-radius: var(--radius-sm);
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  white-space: nowrap;
}

/* Lists */
.numbered-list {
  margin-left: var(--space-lg);
  margin-bottom: var(--space-lg);
}

.numbered-list li {
  margin-bottom: var(--space-sm);
  line-height: var(--leading-relaxed);
}

.feature-list {
  list-style: none;
  padding-left: 0;
}

.feature-list li {
  padding-left: var(--space-lg);
  position: relative;
  margin-bottom: var(--space-sm);
}

.feature-list li:before {
  content: "✓";
  position: absolute;
  left: 0;
  color: var(--color-success);
  font-weight: bold;
}

/* Version Cards */
.version-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--space-lg);
  margin-top: var(--space-lg);
}

.version-card {
  padding: var(--space-lg);
}

.version-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-md);
}

.version-card h3 {
  margin: 0;
}

.profile-list {
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
}

.profile-list li {
  background-color: var(--color-bg-secondary);
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-sm);
  font-size: var(--text-sm);
}

.validation-steps-list {
  list-style: none;
  counter-reset: steps;
  padding-left: 0;
}

.validation-steps-list li {
  counter-increment: steps;
  margin-bottom: var(--space-md);
  padding-left: var(--space-xl);
  position: relative;
}

.validation-steps-list li:before {
  content: counter(steps);
  position: absolute;
  left: 0;
  width: 28px;
  height: 28px;
  background-color: var(--color-primary);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: var(--text-sm);
}

/* SDK Section Styles */
.sdk-card {
  margin-top: var(--space-lg);
  margin-bottom: var(--space-xl);
  max-width: 100%;
}

.sdk-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-md);
  flex-wrap: wrap;
  gap: var(--space-sm);
}

.sdk-header h3 {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin: 0;
}

.sdk-icon {
  font-size: var(--text-xl);
}

/* Icon colors for different SDKs */
.sdk-header h3 .sdk-icon:first-child {
  color: #cb3837; /* npm red */
}

.sdk-card:nth-child(2) .sdk-icon {
  color: #3776ab; /* Python blue */
}

.sdk-description {
  color: var(--color-text-secondary);
  margin-bottom: var(--space-lg);
}

.sdk-links {
  display: flex;
  gap: var(--space-md);
  margin-top: var(--space-lg);
  flex-wrap: wrap;
}

.sdk-link {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-sm) var(--space-md);
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  text-decoration: none;
  color: var(--color-text);
  transition: all var(--transition-base);
}

.sdk-link:hover {
  background-color: var(--color-primary-light);
  border-color: var(--color-primary);
  color: var(--color-primary);
}

/* Endpoint Details */
.endpoint-details {
  max-width: 100%;
  overflow-x: hidden;
}

/* Utilities */
.mt-sm {
  margin-top: var(--space-sm);
}

.mt-lg {
  margin-top: var(--space-lg);
}

.mt-xl {
  margin-top: var(--space-xl);
}

.mb-xs {
  margin-bottom: var(--space-xs);
}

.mb-md {
  margin-bottom: var(--space-md);
}

/* Dark theme adjustments for copy button */
[data-theme="dark"] .copy-button {
  background-color: var(--color-surface);
  border-color: var(--color-border);
  color: var(--color-text-secondary);
}

[data-theme="dark"] .copy-button:hover {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
}

/* Responsive */
@media (max-width: 992px) {
  .docs-layout {
    grid-template-columns: 1fr;
  }
  
  .docs-sidebar {
    position: static;
    margin-bottom: var(--space-2xl);
    padding: var(--space-lg);
    background-color: var(--color-bg-secondary);
    border-radius: var(--radius-lg);
    max-height: none;
  }
  
  .docs-nav {
    padding-right: 0;
  }
}

@media (max-width: 768px) {
  .hero-title {
    font-size: var(--text-2xl);
  }
  
  .hero-subtitle {
    font-size: var(--text-base);
  }
  
  .code-tabs {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
  
  .version-cards {
    grid-template-columns: 1fr;
  }
  
  .data-table,
  .params-table {
    font-size: var(--text-sm);
  }
  
  .data-table th,
  .params-table th,
  .data-table td,
  .params-table td {
    padding: var(--space-xs) var(--space-sm);
  }

  .sdk-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-sm);
  }
  
  .sdk-links {
    flex-direction: column;
  }
  
  .container {
    padding: 0 var(--space-md);
  }
}

/* Ensure code doesn't overlap with button on small screens */
@media (max-width: 640px) {
  .copy-button {
    top: var(--space-xs);
    right: var(--space-xs);
    padding: var(--space-xs) var(--space-sm);
    font-size: var(--text-xs);
  }
}
</style>