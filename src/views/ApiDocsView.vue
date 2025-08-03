<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

// State
const activeSection = ref('introduction')
const activeLanguage = ref('curl')
const activeEndpointLang = ref('curl')

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
    curl: `curl -X POST https://api.ddex-workbench.org/v1/api/validate \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d '{
    "content": "<?xml version=\\"1.0\\"?>...",
    "type": "ERN",
    "version": "4.3",
    "profile": "AudioAlbum"
  }'`,
    javascript: `const response = await fetch('https://api.ddex-workbench.org/v1/validate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  body: JSON.stringify({
    content: '<?xml version="1.0"?>...',
    type: 'ERN',
    version: '4.3',
    profile: 'AudioAlbum'
  })
});

const result = await response.json();`,
    python: `import requests

response = requests.post(
    'https://api.ddex-workbench.org/v1/validate',
    headers={
        'Authorization': 'Bearer YOUR_API_KEY'
    },
    json={
        'content': '<?xml version="1.0"?>...',
        'type': 'ERN',
        'version': '4.3',
        'profile': 'AudioAlbum'
    }
)

result = response.json()`,
    php: `$client = new \\GuzzleHttp\\Client();
$response = $client->post('https://api.ddex-workbench.org/v1/validate', [
    'headers' => [
        'Authorization' => 'Bearer YOUR_API_KEY'
    ],
    'json' => [
        'content' => '<?xml version="1.0"?>...',
        'type' => 'ERN',
        'version' => '4.3',
        'profile' => 'AudioAlbum'
    ]
]);

$result = json_decode($response->getBody(), true);`
  },
  errorFormat: {
    json: `{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "The provided XML does not conform to ERN 4.3 schema",
    "details": {
      "errors": [
        {
          "line": 45,
          "column": 12,
          "message": "Element 'ReleaseDate' is missing required child element 'Date'"
        }
      ]
    }
  }
}`
  },
  validateEndpoint: {
    curl: `curl -X POST https://api.ddex-workbench.org/v1/validate \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d @- << 'EOF'
{
  "content": "<?xml version=\\"1.0\\" encoding=\\"UTF-8\\"?>\\n<ern:NewReleaseMessage...>",
  "type": "ERN",
  "version": "4.3",
  "profile": "AudioAlbum"
}
EOF`,
    javascript: `// Using the official SDK
import { DDEXClient } from '@ddex-workbench/api-client';

const client = new DDEXClient({ apiKey: 'YOUR_API_KEY' });

const result = await client.validate({
  content: xmlContent,
  type: 'ERN',
  version: '4.3',
  profile: 'AudioAlbum'
});

if (result.valid) {
  console.log('✓ Valid DDEX file');
} else {
  console.error('✗ Validation errors:', result.errors);
}`,
    python: `# Using the official SDK
from ddex_connect import Client

client = Client(api_key="YOUR_API_KEY")

result = client.validate(
    content=xml_content,
    type="ERN",
    version="4.3",
    profile="AudioAlbum"
)

if result.valid:
    print("✓ Valid DDEX file")
else:
    for error in result.errors:
        print(f"✗ Line {error.line}: {error.message}")`,
    php: `// Using raw HTTP client
use GuzzleHttp\\Client;

$client = new Client();

try {
    $response = $client->post('https://api.ddex-workbench.org/v1/validate', [
        'headers' => [
            'Authorization' => 'Bearer YOUR_API_KEY',
            'Content-Type' => 'application/json'
        ],
        'json' => [
            'content' => $xmlContent,
            'type' => 'ERN',
            'version' => '4.3',
            'profile' => 'AudioAlbum'
        ]
    ]);
    
    $result = json_decode($response->getBody(), true);
    
    if ($result['valid']) {
        echo "✓ Valid DDEX file\\n";
    } else {
        foreach ($result['errors'] as $error) {
            echo "✗ Line {$error['line']}: {$error['message']}\\n";
        }
    }
} catch (\\Exception $e) {
    echo "Error: " . $e->getMessage();
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
      "rule": "ERN-4.3-ReleaseDate",
      "context": "    <ReleaseDate>\\n      <!-- Missing Date element -->\\n    </ReleaseDate>"
    },
    {
      "line": 78,
      "column": 8,
      "message": "Invalid ISRC format. Expected: XX-XXX-XX-XXXXX",
      "severity": "error",
      "rule": "ERN-4.3-ISRC-Format"
    }
  ],
  "metadata": {
    "processingTime": 234,
    "schemaVersion": "ern/43/2024-03-29",
    "validatedAt": "2025-01-15T10:30:00Z"
  }
}`
  },
  fileUpload: {
    curl: `curl -X POST https://api.ddex-workbench.org/v1/validate/file \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -F "file=@release.xml" \\
  -F "type=ERN" \\
  -F "version=4.3" \\
  -F "profile=AudioAlbum"`,
    javascript: `const formData = new FormData();
formData.append('file', xmlFile);
formData.append('type', 'ERN');
formData.append('version', '4.3');
formData.append('profile', 'AudioAlbum');

const response = await fetch('https://api.ddex-workbench.org/v1/validate/file', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  body: formData
});

const result = await response.json();`,
    python: `import requests

with open('release.xml', 'rb') as f:
    files = {'file': f}
    data = {
        'type': 'ERN',
        'version': '4.3',
        'profile': 'AudioAlbum'
    }
    
    response = requests.post(
        'https://api.ddex-workbench.org/v1/validate/file',
        headers={'Authorization': 'Bearer YOUR_API_KEY'},
        files=files,
        data=data
    )
    
result = response.json()`,
    php: `$client = new \\GuzzleHttp\\Client();

$response = $client->post('https://api.ddex-workbench.org/v1/validate/file', [
    'headers' => [
        'Authorization' => 'Bearer YOUR_API_KEY'
    ],
    'multipart' => [
        [
            'name' => 'file',
            'contents' => fopen('release.xml', 'r')
        ],
        [
            'name' => 'type',
            'contents' => 'ERN'
        ],
        [
            'name' => 'version',
            'contents' => '4.3'
        ],
        [
            'name' => 'profile',
            'contents' => 'AudioAlbum'
        ]
    ]
]);`
  }
}

// Methods
const getCodeExample = (example, language) => {
  return codeExamples[example]?.[language] || '// Example not available'
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
            RESTful API for validating DDEX files programmatically
          </p>
          <div class="hero-badges mt-lg">
            <span class="badge">Version 1.0</span>
            <span class="badge">REST API</span>
            <span class="badge">OpenAPI 3.0</span>
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
                <li><a href="#authentication" @click="scrollToSection('authentication')" :class="{ active: activeSection === 'authentication' }">Authentication</a></li>
                <li><a href="#rate-limiting" @click="scrollToSection('rate-limiting')" :class="{ active: activeSection === 'rate-limiting' }">Rate Limiting</a></li>
                <li><a href="#errors" @click="scrollToSection('errors')" :class="{ active: activeSection === 'errors' }">Error Handling</a></li>
              </ul>

              <h3 class="nav-section-title">Endpoints</h3>
              <ul class="nav-list">
                <li><a href="#validate" @click="scrollToSection('validate')" :class="{ active: activeSection === 'validate' }">POST /validate</a></li>
                <li><a href="#validate-file" @click="scrollToSection('validate-file')" :class="{ active: activeSection === 'validate-file' }">POST /validate/file</a></li>
                <li><a href="#formats" @click="scrollToSection('formats')" :class="{ active: activeSection === 'formats' }">GET /formats</a></li>
                <li><a href="#health" @click="scrollToSection('health')" :class="{ active: activeSection === 'health' }">GET /health</a></li>
              </ul>

              <h3 class="nav-section-title">Resources</h3>
              <ul class="nav-list">
                <li><a href="#sdks" @click="scrollToSection('sdks')" :class="{ active: activeSection === 'sdks' }">Client SDKs</a></li>
                <li><a href="#examples" @click="scrollToSection('examples')" :class="{ active: activeSection === 'examples' }">Code Examples</a></li>
                <li><a href="#openapi" @click="scrollToSection('openapi')" :class="{ active: activeSection === 'openapi' }">OpenAPI Spec</a></li>
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
                files against the official DDEX schemas. This API supports ERN 4.3 validation with plans to expand to other versions 
                and message types.
              </p>
              
              <div class="info-box mt-lg">
                <h4>Base URL</h4>
                <code class="endpoint-url">https://api.ddex-workbench.org/v1</code>
              </div>

              <h3 class="mt-xl">Quick Start</h3>
              <p>Here's a simple example to validate an ERN 4.3 file:</p>
              
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
                <pre class="code-block"><code>{{ getCodeExample('quickstart', activeLanguage) }}</code></pre>
              </div>
            </section>

            <!-- Authentication -->
            <section id="authentication" class="doc-section">
              <h2>Authentication</h2>
              <p>
                The API supports both anonymous and authenticated access. Authenticated users get higher rate limits 
                and access to additional features.
              </p>

              <h3>API Key Authentication</h3>
              <p>Include your API key in the request headers:</p>
              
              <div class="code-example">
                <pre class="code-block"><code>Authorization: Bearer YOUR_API_KEY</code></pre>
              </div>

              <h3>Getting an API Key</h3>
              <ol class="numbered-list">
                <li>Sign up for a free account at <a href="/signup">ddex-workbench.org/signup</a></li>
                <li>Navigate to your <a href="/dashboard/api-keys">API Keys dashboard</a></li>
                <li>Click "Generate New Key" and copy your key</li>
                <li>Store your key securely - it won't be shown again</li>
              </ol>

              <div class="warning-box mt-lg">
                <strong>Security Note:</strong> Never expose your API key in client-side code or public repositories. 
                Always use environment variables or secure key management systems.
              </div>
            </section>

            <!-- Rate Limiting -->
            <section id="rate-limiting" class="doc-section">
              <h2>Rate Limiting</h2>
              <p>
                API requests are rate limited to ensure fair usage and system stability. Limits vary based on 
                authentication status:
              </p>

              <table class="data-table">
                <thead>
                  <tr>
                    <th>User Type</th>
                    <th>Requests per Minute</th>
                    <th>Max File Size</th>
                    <th>Concurrent Requests</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Anonymous</td>
                    <td>10</td>
                    <td>5 MB</td>
                    <td>1</td>
                  </tr>
                  <tr>
                    <td>Authenticated (Free)</td>
                    <td>60</td>
                    <td>10 MB</td>
                    <td>3</td>
                  </tr>
                  <tr>
                    <td>Authenticated (Pro)</td>
                    <td>300</td>
                    <td>50 MB</td>
                    <td>10</td>
                  </tr>
                </tbody>
              </table>

              <h3 class="mt-lg">Rate Limit Headers</h3>
              <p>The API returns rate limit information in response headers:</p>
              
              <div class="code-example">
                <pre class="code-block"><code>X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1642521600</code></pre>
              </div>
            </section>

            <!-- Error Handling -->
            <section id="errors" class="doc-section">
              <h2>Error Handling</h2>
              <p>
                The API uses standard HTTP status codes and returns detailed error messages in a consistent format.
              </p>

              <h3>Error Response Format</h3>
              <div class="code-example">
                <pre class="code-block"><code>{{ getCodeExample('errorFormat', 'json') }}</code></pre>
              </div>

              <h3>Common Error Codes</h3>
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Status Code</th>
                    <th>Error Code</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><code>400</code></td>
                    <td><code>INVALID_REQUEST</code></td>
                    <td>Request body or parameters are invalid</td>
                  </tr>
                  <tr>
                    <td><code>401</code></td>
                    <td><code>UNAUTHORIZED</code></td>
                    <td>Missing or invalid API key</td>
                  </tr>
                  <tr>
                    <td><code>413</code></td>
                    <td><code>FILE_TOO_LARGE</code></td>
                    <td>Uploaded file exceeds size limit</td>
                  </tr>
                  <tr>
                    <td><code>429</code></td>
                    <td><code>RATE_LIMIT_EXCEEDED</code></td>
                    <td>Too many requests</td>
                  </tr>
                  <tr>
                    <td><code>500</code></td>
                    <td><code>INTERNAL_ERROR</code></td>
                    <td>Unexpected server error</td>
                  </tr>
                </tbody>
              </table>
            </section>

            <!-- Endpoints -->
            <section id="validate" class="doc-section">
              <h2>POST /validate</h2>
              <p>Validate DDEX XML content provided as a string.</p>

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
                      <td>Message type (e.g., "ERN")</td>
                    </tr>
                    <tr>
                      <td><code>version</code></td>
                      <td>string</td>
                      <td>Yes</td>
                      <td>DDEX version (e.g., "4.3")</td>
                    </tr>
                    <tr>
                      <td><code>profile</code></td>
                      <td>string</td>
                      <td>No</td>
                      <td>Specific profile (e.g., "AudioAlbum")</td>
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
                  <pre class="code-block"><code>{{ getCodeExample('validateEndpoint', activeEndpointLang) }}</code></pre>
                </div>

                <h3 class="mt-lg">Response</h3>
                <div class="code-example">
                  <pre class="code-block"><code>{{ getCodeExample('validateResponse', 'json') }}</code></pre>
                </div>
              </div>
            </section>

            <section id="validate-file" class="doc-section">
              <h2>POST /validate/file</h2>
              <p>Validate a DDEX XML file upload.</p>

              <div class="endpoint-details">
                <h3>Request</h3>
                <p>Send a <code>multipart/form-data</code> request with the following fields:</p>
                
                <table class="params-table">
                  <thead>
                    <tr>
                      <th>Field</th>
                      <th>Type</th>
                      <th>Required</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><code>file</code></td>
                      <td>file</td>
                      <td>Yes</td>
                      <td>XML file to validate</td>
                    </tr>
                    <tr>
                      <td><code>type</code></td>
                      <td>string</td>
                      <td>Yes</td>
                      <td>Message type</td>
                    </tr>
                    <tr>
                      <td><code>version</code></td>
                      <td>string</td>
                      <td>Yes</td>
                      <td>DDEX version</td>
                    </tr>
                    <tr>
                      <td><code>profile</code></td>
                      <td>string</td>
                      <td>No</td>
                      <td>Specific profile</td>
                    </tr>
                  </tbody>
                </table>

                <h3 class="mt-lg">Example</h3>
                <div class="code-example">
                  <pre class="code-block"><code>{{ getCodeExample('fileUpload', activeLanguage) }}</code></pre>
                </div>
              </div>
            </section>

            <!-- Other endpoints sections... -->

            <!-- SDKs -->
            <section id="sdks" class="doc-section">
              <h2>Client SDKs</h2>
              <p>
                Official and community SDKs are available for popular programming languages:
              </p>

              <div class="sdk-grid">
                <div class="sdk-card card">
                  <div class="sdk-icon">
                    <font-awesome-icon :icon="['fab', 'js']" class="brand-icon js-icon" />
                  </div>
                  <h3>JavaScript/TypeScript</h3>
                  <p class="text-sm text-secondary">Official SDK for Node.js and browsers</p>
                  <div class="sdk-install">
                    <code>npm install @ddex-workbench/api-client</code>
                  </div>
                  <a href="https://github.com/ddex-workbench/js-sdk" class="btn btn-sm btn-primary">
                    <font-awesome-icon :icon="['fab', 'github']" class="icon-left" />
                    View on GitHub
                  </a>
                </div>

                <div class="sdk-card card">
                  <div class="sdk-icon">
                    <font-awesome-icon :icon="['fab', 'python']" class="brand-icon python-icon" />
                  </div>
                  <h3>Python</h3>
                  <p class="text-sm text-secondary">Official SDK for Python 3.7+</p>
                  <div class="sdk-install">
                    <code>pip install ddex-workbench</code>
                  </div>
                  <a href="https://github.com/ddex-workbench/python-sdk" class="btn btn-sm btn-primary">
                    <font-awesome-icon :icon="['fab', 'github']" class="icon-left" />
                    View on GitHub
                  </a>
                </div>

                <div class="sdk-card card">
                  <div class="sdk-icon">
                    <font-awesome-icon :icon="['fab', 'php']" class="brand-icon php-icon" />
                  </div>
                  <h3>PHP</h3>
                  <p class="text-sm text-secondary">Community SDK for PHP 7.4+</p>
                  <div class="sdk-install">
                    <code>composer require ddex/connect-php</code>
                  </div>
                  <a href="https://github.com/community/ddex-workbench-php" class="btn btn-sm btn-secondary">
                    <font-awesome-icon :icon="['fab', 'github']" class="icon-left" />
                    View on GitHub
                  </a>
                </div>
              </div>

            </section>
          </main>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
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
}

.badge {
  display: inline-block;
  padding: var(--space-xs) var(--space-md);
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
}

/* Documentation Layout */
.docs-layout {
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: var(--space-2xl);
  align-items: start;
}

/* Sidebar */
.docs-sidebar {
  position: sticky;
  top: calc(64px + var(--space-lg));
  max-height: calc(100vh - 100px);
  overflow-y: auto;
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

.doc-section p {
  color: var(--color-text);
  line-height: var(--leading-relaxed);
  margin-bottom: var(--space-md);
}

/* Info Boxes */
.info-box,
.warning-box {
  padding: var(--space-lg);
  border-radius: var(--radius-md);
  margin-bottom: var(--space-lg);
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

.endpoint-url {
  display: inline-block;
  padding: var(--space-xs) var(--space-sm);
  background-color: var(--color-bg);
  border-radius: var(--radius-sm);
  font-family: var(--font-mono);
  font-size: var(--text-sm);
}

/* Code Examples */
.code-example {
  margin-bottom: var(--space-lg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.code-tabs {
  display: flex;
  background-color: var(--color-bg-secondary);
  border-bottom: 1px solid var(--color-border);
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

.code-block {
  padding: var(--space-lg);
  background-color: var(--color-bg-tertiary);
  overflow-x: auto;
}

.code-block code {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  line-height: 1.5;
  color: var(--color-text);
}

/* Tables */
.data-table,
.params-table {
  width: 100%;
  margin-bottom: var(--space-lg);
  border-collapse: collapse;
}

.data-table th,
.params-table th {
  background-color: var(--color-bg-secondary);
  padding: var(--space-sm) var(--space-md);
  text-align: left;
  font-weight: var(--font-semibold);
  font-size: var(--text-sm);
  border-bottom: 2px solid var(--color-border);
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

/* SDK Grid */
.sdk-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--space-lg);
  margin-top: var(--space-lg);
}

.sdk-card {
  padding: var(--space-lg);
  text-align: center;
}

.sdk-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto var(--space-md);
  display: flex;
  align-items: center;
  justify-content: center;
}

.brand-icon {
  font-size: 48px;
}

.js-icon {
  color: #F7DF1E;
  background-color: #323330;
  padding: 8px;
  border-radius: var(--radius-sm);
}

.python-icon {
  color: #3776AB;
}

.php-icon {
  color: #777BB4;
}

.sdk-card h3 {
  font-size: var(--text-lg);
  margin-bottom: var(--space-xs);
}

.sdk-install {
  margin: var(--space-md) 0;
  padding: var(--space-sm);
  background-color: var(--color-bg-tertiary);
  border-radius: var(--radius-sm);
  font-family: var(--font-mono);
  font-size: var(--text-sm);
}

/* Icons */
.icon-left {
  margin-right: var(--space-xs);
}

/* Utilities */
.mt-lg {
  margin-top: var(--space-lg);
}

.mt-xl {
  margin-top: var(--space-xl);
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
  }
  
  .docs-nav {
    padding-right: 0;
  }
}

@media (max-width: 768px) {
  .hero-title {
    font-size: var(--text-2xl);
  }
  
  .code-tabs {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
  
  .sdk-grid {
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
}
</style>