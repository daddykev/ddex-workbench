<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

// State
const activeSection = ref('introduction')
const activeLanguage = ref('curl')
const activeEndpointLang = ref('curl')
const activeFileExampleLang = ref('javascript')
const activeHealthLang = ref('curl')
const activeSVRLLang = ref('curl')
const copiedStates = ref({}) // Track which code blocks have been copied

// Language options
const languages = [
  { id: 'curl', name: 'cURL' },
  { id: 'javascript', name: 'JavaScript' },
  { id: 'python', name: 'Python' },
  { id: 'php', name: 'PHP' }
]

// Minimal valid ERN 4.3 Audio Single, trimmed from the Sandbox's Audio Single template.
// Passes XSD and business-rule validation; used by the quickstart samples.
const QUICKSTART_XML_FORMATTED = `<ern:NewReleaseMessage xmlns:ern="http://ddex.net/xml/ern/43" AvsVersionId="9" LanguageAndScriptCode="en">
  <MessageHeader>
    <MessageId>MSG-0001</MessageId>
    <MessageSender><PartyId>PADPIDA0000000000S</PartyId></MessageSender>
    <MessageRecipient><PartyId>PADPIDA0000000000R</PartyId></MessageRecipient>
    <MessageCreatedDateTime>2026-01-01T00:00:00Z</MessageCreatedDateTime>
  </MessageHeader>
  <PartyList>
    <Party><PartyReference>P1</PartyReference><PartyName><FullName>Example Artist</FullName></PartyName></Party>
    <Party><PartyReference>P2</PartyReference><PartyName><FullName>Example Label</FullName></PartyName></Party>
  </PartyList>
  <ResourceList>
    <SoundRecording>
      <ResourceReference>A1</ResourceReference>
      <Type>MusicalWorkSoundRecording</Type>
      <SoundRecordingEdition><ResourceId><ISRC>USRC17607839</ISRC></ResourceId></SoundRecordingEdition>
      <DisplayTitleText>Example Track</DisplayTitleText>
      <DisplayTitle><TitleText>Example Track</TitleText></DisplayTitle>
      <DisplayArtistName>Example Artist</DisplayArtistName>
      <DisplayArtist><ArtistPartyReference>P1</ArtistPartyReference><DisplayArtistRole>MainArtist</DisplayArtistRole></DisplayArtist>
      <Duration>PT3M30S</Duration>
      <ParentalWarningType>NotExplicit</ParentalWarningType>
    </SoundRecording>
  </ResourceList>
  <ReleaseList>
    <Release>
      <ReleaseReference>R0</ReleaseReference>
      <ReleaseType>Single</ReleaseType>
      <ReleaseId><ICPN>00000000000000</ICPN></ReleaseId>
      <DisplayTitleText>Example Single</DisplayTitleText>
      <DisplayTitle><TitleText>Example Single</TitleText></DisplayTitle>
      <DisplayArtistName>Example Artist</DisplayArtistName>
      <DisplayArtist><ArtistPartyReference>P1</ArtistPartyReference><DisplayArtistRole>MainArtist</DisplayArtistRole></DisplayArtist>
      <ReleaseLabelReference>P2</ReleaseLabelReference>
      <Genre><GenreText>Pop</GenreText></Genre>
      <ParentalWarningType>NotExplicit</ParentalWarningType>
      <ResourceGroup><ResourceGroupContentItem><ReleaseResourceReference>A1</ReleaseResourceReference></ResourceGroupContentItem></ResourceGroup>
    </Release>
  </ReleaseList>
  <DealList>
    <ReleaseDeal>
      <DealReleaseReference>R0</DealReleaseReference>
      <Deal><DealTerms><TerritoryCode>Worldwide</TerritoryCode><ValidityPeriod><StartDate>2026-01-01</StartDate></ValidityPeriod><CommercialModelType>SubscriptionModel</CommercialModelType><UseType>OnDemandStream</UseType></DealTerms></Deal>
    </ReleaseDeal>
  </DealList>
</ern:NewReleaseMessage>`
// Must stay free of single quotes: the cURL quickstart wraps it in -d '...'
const QUICKSTART_XML = QUICKSTART_XML_FORMATTED.replace(/>\s+</g, '><')

// Code examples. Request and response shapes follow functions/api/validate.js;
// example responses come from functions/test/fixtures/api-responses.md.
const codeExamples = {
  quickstart: {
    // Raw XML body with options in the query string: one line, no backslash escapes,
    // so it also pastes cleanly into curl parsers such as ReqBin's
    curl: `curl -X POST "https://api.ddex-workbench.org/v1/validate?version=4.3" -H "Content-Type: application/xml" -d '${QUICKSTART_XML}'`,
    javascript: `const response = await fetch('https://api.ddex-workbench.org/v1/validate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    content: '${QUICKSTART_XML}',
    type: 'ERN',
    version: '4.3'
  })
});

const result = await response.json();
console.log(result.valid ? 'Valid' : \`Invalid: \${result.errors.length} error(s)\`);`,
    python: `import requests

response = requests.post(
    'https://api.ddex-workbench.org/v1/validate',
    json={
        'content': '${QUICKSTART_XML}',
        'type': 'ERN',
        'version': '4.3'
    },
    timeout=60
)

result = response.json()
print('Valid' if result['valid'] else f"Invalid: {len(result['errors'])} error(s)")`,
    php: `<?php
require 'vendor/autoload.php';

$client = new \\GuzzleHttp\\Client();
$response = $client->post('https://api.ddex-workbench.org/v1/validate', [
    'json' => [
        'content' => '${QUICKSTART_XML}',
        'type' => 'ERN',
        'version' => '4.3'
    ]
]);

$result = json_decode($response->getBody(), true);
echo $result['valid'] ? "Valid\\n" : 'Invalid: ' . count($result['errors']) . " error(s)\\n";`
  },
  healthCheck: {
    curl: `curl https://api.ddex-workbench.org/v1/health`,
    javascript: `const response = await fetch('https://api.ddex-workbench.org/v1/health');
const data = await response.json();
console.log('API status:', data.status);`,
    python: `import requests

response = requests.get('https://api.ddex-workbench.org/v1/health', timeout=10)
print(f"API status: {response.json()['status']}")`,
    php: `<?php
$data = json_decode(file_get_contents('https://api.ddex-workbench.org/v1/health'), true);
echo "API status: " . $data['status'] . "\\n";`
  },
  errorFormat: {
    json: `{
  "error": {
    "message": "Version is required (JSON field \`version\` or query parameter \`?version=\`)."
  }
}`
  },
  rawXml: {
    curl: `curl -X POST -H "Content-Type: application/xml" --data-binary @release.xml "https://api.ddex-workbench.org/v1/validate?version=4.3&profile=AudioAlbum"`
  },
  validateEndpoint: {
    curl: `# Send release.xml as the raw body, with the options in the query string
curl -X POST -H "Content-Type: application/xml" --data-binary @release.xml \\
  "https://api.ddex-workbench.org/v1/validate?version=4.3&profile=AudioAlbum"

# Or build a JSON body from the file with jq, then send it
jq -n --rawfile xml release.xml \\
  '{content: $xml, type: "ERN", version: "4.3", profile: "AudioAlbum"}' |
curl -X POST https://api.ddex-workbench.org/v1/validate \\
  -H "Content-Type: application/json" \\
  --data-binary @-`,
    javascript: `// Node.js 18+ (built-in fetch), ES modules
import { readFile } from 'node:fs/promises';

const xml = await readFile('release.xml', 'utf8');

const response = await fetch('https://api.ddex-workbench.org/v1/validate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    content: xml,
    type: 'ERN',
    version: '4.3',
    profile: 'AudioAlbum'
  })
});

if (!response.ok) {
  const { error } = await response.json();
  throw new Error(\`HTTP \${response.status}: \${error.message}\`);
}

const result = await response.json();
console.log(result.valid ? 'Valid' : \`Invalid: \${result.errors.length} error(s)\`);

for (const issue of [...result.errors, ...result.warnings]) {
  console.log(\`[\${issue.severity}] \${issue.rule}: \${issue.message}\`);
}`,
    python: `from pathlib import Path
import requests

xml = Path('release.xml').read_text(encoding='utf-8')

response = requests.post(
    'https://api.ddex-workbench.org/v1/validate',
    json={
        'content': xml,
        'type': 'ERN',
        'version': '4.3',
        'profile': 'AudioAlbum'
    },
    timeout=60
)
response.raise_for_status()
result = response.json()

print('Valid' if result['valid'] else f"Invalid: {len(result['errors'])} error(s)")
for issue in result['errors'] + result['warnings']:
    print(f"[{issue['severity']}] {issue['rule']}: {issue['message']}")`,
    php: `<?php
require 'vendor/autoload.php';

use GuzzleHttp\\Client;
use GuzzleHttp\\Exception\\ClientException;

$client = new Client(['base_uri' => 'https://api.ddex-workbench.org/v1/']);

try {
    $response = $client->post('validate', [
        'json' => [
            'content' => file_get_contents('release.xml'),
            'type' => 'ERN',
            'version' => '4.3',
            'profile' => 'AudioAlbum'
        ]
    ]);
} catch (ClientException $e) {
    $body = json_decode($e->getResponse()->getBody(), true);
    exit('HTTP ' . $e->getResponse()->getStatusCode() . ': ' . $body['error']['message'] . PHP_EOL);
}

$result = json_decode($response->getBody(), true);
echo $result['valid'] ? "Valid\\n" : 'Invalid: ' . count($result['errors']) . " error(s)\\n";

foreach (array_merge($result['errors'], $result['warnings']) as $issue) {
    echo "[{$issue['severity']}] {$issue['rule']}: {$issue['message']}\\n";
}`
  },
  svrlValidation: {
    curl: `# SVRL needs a profile; the report is returned in the "svrl" field
jq -n --rawfile xml release.xml \\
  '{content: $xml, type: "ERN", version: "4.3", profile: "AudioAlbum", generateSVRL: true}' |
curl -s -X POST https://api.ddex-workbench.org/v1/validate \\
  -H "Content-Type: application/json" \\
  --data-binary @- |
jq -r '.svrl // empty' > validation-report.svrl`,
    javascript: `// Node.js 18+, ES modules
import { readFile, writeFile } from 'node:fs/promises';

const xml = await readFile('release.xml', 'utf8');

const response = await fetch('https://api.ddex-workbench.org/v1/validate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    content: xml,
    type: 'ERN',
    version: '4.3',
    profile: 'AudioAlbum', // required for SVRL
    generateSVRL: true
  })
});

const result = await response.json();

// "svrl" is only present when a report was generated
if (result.svrl) {
  await writeFile('validation-report.svrl', result.svrl);
  console.log('SVRL report saved');
}`,
    python: `from pathlib import Path
import requests

xml = Path('release.xml').read_text(encoding='utf-8')

response = requests.post(
    'https://api.ddex-workbench.org/v1/validate',
    json={
        'content': xml,
        'type': 'ERN',
        'version': '4.3',
        'profile': 'AudioAlbum',  # required for SVRL
        'generateSVRL': True
    },
    timeout=60
)
response.raise_for_status()
result = response.json()

# "svrl" is only present when a report was generated
if result.get('svrl'):
    Path('validation-report.svrl').write_text(result['svrl'], encoding='utf-8')
    print('SVRL report saved')`,
    php: `<?php
require 'vendor/autoload.php';

$client = new \\GuzzleHttp\\Client();
$response = $client->post('https://api.ddex-workbench.org/v1/validate', [
    'json' => [
        'content' => file_get_contents('release.xml'),
        'type' => 'ERN',
        'version' => '4.3',
        'profile' => 'AudioAlbum', // required for SVRL
        'generateSVRL' => true
    ]
]);

$result = json_decode($response->getBody(), true);

// "svrl" is only present when a report was generated
if (!empty($result['svrl'])) {
    file_put_contents('validation-report.svrl', $result['svrl']);
    echo "SVRL report saved\\n";
}`
  },
  validateResponse: {
    json: `{
  "valid": false,
  "errors": [
    {
      "line": 0,
      "column": 0,
      "message": "Schemas validity error : Element 'MessageSender': This element is not expected. Expected is ( MessageId ).",
      "severity": "error",
      "rule": "XSD-Schema"
    },
    {
      "line": 0,
      "column": 0,
      "message": "Schemas validity error : Element 'ReleaseType': [facet 'enumeration'] The value 'NotARealType' is not an element of the set {'Album', 'AlertToneRelease', …",
      "severity": "error",
      "rule": "XSD-Schema"
    },
    {
      "line": 0,
      "column": 0,
      "message": "MessageId is required in MessageHeader",
      "severity": "error",
      "rule": "Schematron-ERN43-MessageHeader-MessageId-Required",
      "context": "Profile: AudioAlbum"
    }
  ],
  "warnings": [
    {
      "line": 0,
      "column": 0,
      "message": "AudioAlbum profile expects ReleaseType 'Album' or 'EP', found 'NotARealType'",
      "severity": "warning",
      "rule": "AudioAlbum-ReleaseType"
    }
  ],
  "metadata": {
    "processingTime": 120,
    "schemaVersion": "ERN 4.3",
    "profile": "AudioAlbum",
    "validatedAt": "2026-01-01T00:00:00.000Z",
    "errorCount": 3,
    "warningCount": 1,
    "validationSteps": [
      { "type": "XSD", "duration": 118, "errorCount": 2, "warningCount": 0 },
      { "type": "BusinessRules", "duration": 1, "errorCount": 0, "warningCount": 1 },
      { "type": "Schematron", "duration": 1, "errorCount": 1, "warningCount": 0 }
    ]
  }
}`
  },
  svrlResponse: {
    json: `{
  "valid": true,
  "errors": [],
  "warnings": [
    {
      "line": 0,
      "column": 0,
      "message": "Message profile \\"Audio\\" does not match requested profile \\"AudioSingle\\"",
      "severity": "warning",
      "rule": "Schematron-ProfileMismatch",
      "context": "Profile: AudioSingle"
    }
  ],
  "metadata": {
    "processingTime": 123,
    "schemaVersion": "ERN 4.3",
    "profile": "AudioSingle",
    "validatedAt": "2026-01-01T00:00:00.000Z",
    "errorCount": 0,
    "warningCount": 1,
    "validationSteps": [
      { "type": "XSD", "duration": 119, "errorCount": 0, "warningCount": 0 },
      { "type": "BusinessRules", "duration": 1, "errorCount": 0, "warningCount": 0 },
      { "type": "Schematron", "duration": 3, "errorCount": 0, "warningCount": 1 }
    ]
  },
  "svrl": "<?xml version=\\"1.0\\" encoding=\\"UTF-8\\"?>\\n<svrl:schematron-output …>…</svrl:schematron-output>"
}`
  },
  svrlReport: {
    xml: `<?xml version="1.0" encoding="UTF-8"?>
<svrl:schematron-output xmlns:svrl="http://purl.oclc.org/dsdl/svrl" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" title="DDEX ERN Validation Report" phase="#ALL" schemaVersion="4.3">
  <!-- Validation Metadata -->
  <svrl:text>DDEX ERN Validation Report</svrl:text>
  <svrl:text>Generated: 2026-01-01T00:00:00.000Z</svrl:text>
  <svrl:text>ERN Version: 4.3</svrl:text>
  <svrl:text>Profile: AudioSingle</svrl:text>
  <svrl:text>Message ID: MSG-0001</svrl:text>
  <svrl:active-pattern document="" id="AudioSingle-Profile" name="AudioSingle-Profile"/>
  <svrl:failed-assert test="Schematron-ProfileMismatch" role="warning">
    <svrl:diagnostic-reference diagnostic="diag-schematron-profilemismatch">
      Profile: AudioSingle
    </svrl:diagnostic-reference>
    <svrl:text>Message profile &quot;Audio&quot; does not match requested profile &quot;AudioSingle&quot;</svrl:text>
  </svrl:failed-assert>
  <!-- Validation Summary -->
  <svrl:text>====== VALIDATION SUMMARY ======</svrl:text>
  <svrl:text>Status: VALID</svrl:text>
  <svrl:text>Errors: 0</svrl:text>
  <svrl:text>Warnings: 1</svrl:text>
  <svrl:text>Total Issues: 1</svrl:text>
</svrl:schematron-output>`
  },
  malformedResponse: {
    json: `{
  "valid": false,
  "errors": [
    {
      "line": 0,
      "column": 0,
      "message": "parser error : Premature end of data in tag a line 1",
      "severity": "error",
      "rule": "XSD-Schema"
    },
    {
      "line": 0,
      "column": 0,
      "message": "<a>",
      "severity": "error",
      "rule": "XSD-Schema"
    }
  ],
  "warnings": [],
  "metadata": {
    "processingTime": 123,
    "schemaVersion": "ERN 4.3",
    "validatedAt": "2026-01-01T00:00:00.000Z",
    "errorCount": 2,
    "warningCount": 0,
    "validationSteps": [
      { "type": "XSD", "duration": 123, "errorCount": 2, "warningCount": 0 }
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
  "timestamp": "2026-01-01T00:00:00.000Z",
  "service": "DDEX Workbench API",
  "version": "1.0.2"
}`
  },
  rateLimitResponse: {
    http: `HTTP/1.1 429 Too Many Requests
RateLimit-Policy: 10;w=60
RateLimit-Limit: 10
RateLimit-Remaining: 0
RateLimit-Reset: 60
Retry-After: 60
Content-Type: application/json; charset=utf-8

{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded (10 requests per minute). Sign in or use an API key for up to 60 requests per minute.",
    "retryAfter": 60
  }
}`
  },
  fileExamples: {
    javascript: `// Node.js 18+, ES modules: wait and retry when rate limited
import { readFile } from 'node:fs/promises';

const API_URL = 'https://api.ddex-workbench.org/v1/validate';

async function validate(xml, { version = '4.3', profile, apiKey } = {}, attempts = 3) {
  const headers = { 'Content-Type': 'application/json' };
  if (apiKey) headers['X-API-Key'] = apiKey;

  for (let attempt = 1; attempt <= attempts; attempt++) {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify({ content: xml, type: 'ERN', version, profile })
    });

    if (response.status !== 429) {
      const body = await response.json();
      if (!response.ok) throw new Error(\`HTTP \${response.status}: \${body.error.message}\`);
      return body;
    }

    // Rate limited: wait for the window to reset, then try again
    const { error } = await response.json();
    const seconds = error.retryAfter || Number(response.headers.get('Retry-After')) || 60;
    console.log(\`Rate limited, retrying in \${seconds}s\`);
    await new Promise(resolve => setTimeout(resolve, seconds * 1000));
  }

  throw new Error('Still rate limited after retrying');
}

const xml = await readFile('release.xml', 'utf8');
const result = await validate(xml, { profile: 'AudioAlbum', apiKey: process.env.DDEX_API_KEY });
console.log(result.valid, result.metadata.validationSteps);`,
    python: `import os
import time
from pathlib import Path

import requests

API_URL = 'https://api.ddex-workbench.org/v1/validate'


def validate(xml, version='4.3', profile=None, api_key=None, attempts=3):
    """Validate an ERN message, waiting and retrying when rate limited."""
    headers = {'X-API-Key': api_key} if api_key else {}
    payload = {'content': xml, 'type': 'ERN', 'version': version}
    if profile:
        payload['profile'] = profile

    for _ in range(attempts):
        response = requests.post(API_URL, json=payload, headers=headers, timeout=60)

        if response.status_code != 429:
            response.raise_for_status()
            return response.json()

        # Rate limited: wait for the window to reset, then try again
        error = response.json()['error']
        seconds = error.get('retryAfter') or int(response.headers.get('Retry-After', 60))
        print(f'Rate limited, retrying in {seconds}s')
        time.sleep(seconds)

    raise RuntimeError('Still rate limited after retrying')


xml = Path('release.xml').read_text(encoding='utf-8')
result = validate(xml, profile='AudioAlbum', api_key=os.environ.get('DDEX_API_KEY'))
print(result['valid'], result['metadata']['validationSteps'])`,
    php: `<?php
require 'vendor/autoload.php';

use GuzzleHttp\\Client;

function validateErn(string $xml, string $version = '4.3', ?string $profile = null, ?string $apiKey = null, int $attempts = 3): array
{
    $client = new Client(['http_errors' => false]);
    $headers = $apiKey ? ['X-API-Key' => $apiKey] : [];
    $payload = ['content' => $xml, 'type' => 'ERN', 'version' => $version];
    if ($profile) {
        $payload['profile'] = $profile;
    }

    for ($attempt = 1; $attempt <= $attempts; $attempt++) {
        $response = $client->post('https://api.ddex-workbench.org/v1/validate', [
            'headers' => $headers,
            'json' => $payload
        ]);
        $body = json_decode($response->getBody(), true);

        if ($response->getStatusCode() !== 429) {
            if ($response->getStatusCode() >= 400) {
                throw new RuntimeException('HTTP ' . $response->getStatusCode() . ': ' . $body['error']['message']);
            }
            return $body;
        }

        // Rate limited: wait for the window to reset, then try again
        $seconds = $body['error']['retryAfter'] ?? (int) ($response->getHeaderLine('Retry-After') ?: 60);
        echo "Rate limited, retrying in {$seconds}s\\n";
        sleep($seconds);
    }

    throw new RuntimeException('Still rate limited after retrying');
}

$result = validateErn(file_get_contents('release.xml'), '4.3', 'AudioAlbum', getenv('DDEX_API_KEY') ?: null);
echo $result['valid'] ? "Valid\\n" : "Invalid\\n";`
  },
  sdkJS: `import { readFile, writeFile } from 'node:fs/promises';
import { DDEXClient } from '@ddex-workbench/sdk';

const client = new DDEXClient({
  apiKey: process.env.DDEX_API_KEY // optional: 60 requests/min instead of 10
});

const xml = await readFile('release.xml', 'utf8');

// Detects the ERN version from the XML namespace (locally), then validates
const auto = await client.validator.validateAuto(xml, 'AudioAlbum');
console.log(auto.valid, auto.errors.length, auto.warnings.length);

// Same request with an SVRL report
const result = await client.validateWithSVRL(xml, { version: '4.3', profile: 'AudioAlbum' });
if (result.svrl) {
  await writeFile('report.svrl', result.svrl);
}

// Several messages, 3 requests at a time (the default)
const batch = await client.validateBatch(
  [{ content: xml, options: { version: '4.3', profile: 'AudioAlbum' }, filename: 'release.xml' }],
  { concurrency: 3 }
);
console.log(\`\${batch.validFiles}/\${batch.totalFiles} valid\`);`,
  sdkPython: `from pathlib import Path
from ddex_workbench import DDEXClient

client = DDEXClient(api_key='ddex_your-api-key')  # optional: 60 requests/min instead of 10

xml = Path('release.xml').read_text(encoding='utf-8')

# Detects the ERN version (and a declared profile) locally, then validates
auto = client.validator.validate_auto(xml)
print(auto.valid, len(auto.errors), len(auto.warnings))

# validate_with_svrl returns a (result, svrl) tuple
result, svrl = client.validate_with_svrl(xml, version='4.3', profile='AudioAlbum')
if svrl:
    Path('report.svrl').write_text(svrl, encoding='utf-8')

# Several files, 4 at a time (the default max_workers)
files = sorted(Path('releases').glob('*.xml'))
batch = client.validator.validate_batch(files, version='4.3', profile='AudioAlbum', max_workers=4)
print(f'{batch.valid_files}/{batch.total_files} valid')`
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
    <section class="hero-section bg-info">
      <div class="container">
        <div class="hero-content text-center">
          <h1 class="hero-title">DDEX Validation API</h1>
          <p class="hero-subtitle">
            REST API for validating DDEX Electronic Release Notification (ERN) messages: XSD schema, business rules,
            version-specific rules and optional SVRL reports.
          </p>
          <div class="hero-badges mt-lg">
            <span class="badge">REST API</span>
            <span class="badge">ERN 3.8.2 · 4.2 · 4.3</span>
            <span class="badge">Free to use</span>
          </div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="docs-layout">
          <aside class="docs-sidebar">
            <nav class="docs-nav">
              <h3 class="nav-section-title">Getting Started</h3>
              <ul class="nav-list">
                <li><a href="#introduction" @click.prevent="scrollToSection('introduction')" :class="{ active: activeSection === 'introduction' }">Introduction</a></li>
                <li><a href="#features" @click.prevent="scrollToSection('features')" :class="{ active: activeSection === 'features' }">Features</a></li>
                <li><a href="#sdk" @click.prevent="scrollToSection('sdk')" :class="{ active: activeSection === 'sdk' }">SDK & Libraries</a></li>
                <li><a href="#authentication" @click.prevent="scrollToSection('authentication')" :class="{ active: activeSection === 'authentication' }">Authentication</a></li>
                <li><a href="#rate-limiting" @click.prevent="scrollToSection('rate-limiting')" :class="{ active: activeSection === 'rate-limiting' }">Rate Limiting</a></li>
                <li><a href="#errors" @click.prevent="scrollToSection('errors')" :class="{ active: activeSection === 'errors' }">Error Handling</a></li>
              </ul>

              <h3 class="nav-section-title">Endpoints</h3>
              <ul class="nav-list">
                <li><a href="#validate" @click.prevent="scrollToSection('validate')" :class="{ active: activeSection === 'validate' }">POST /validate</a></li>
                <li><a href="#formats" @click.prevent="scrollToSection('formats')" :class="{ active: activeSection === 'formats' }">GET /formats</a></li>
                <li><a href="#health" @click.prevent="scrollToSection('health')" :class="{ active: activeSection === 'health' }">GET /health</a></li>
              </ul>

              <h3 class="nav-section-title">Resources</h3>
              <ul class="nav-list">
                <li><a href="#svrl-generation" @click.prevent="scrollToSection('svrl-generation')" :class="{ active: activeSection === 'svrl-generation' }">SVRL Reports</a></li>
                <li><a href="#supported-versions" @click.prevent="scrollToSection('supported-versions')" :class="{ active: activeSection === 'supported-versions' }">Supported Versions</a></li>
                <li><a href="#response-format" @click.prevent="scrollToSection('response-format')" :class="{ active: activeSection === 'response-format' }">Response Format</a></li>
                <li><a href="#examples" @click.prevent="scrollToSection('examples')" :class="{ active: activeSection === 'examples' }">Code Examples</a></li>
              </ul>
            </nav>
          </aside>

          <main class="docs-content">
            <section id="introduction" class="doc-section">
              <h2>Introduction</h2>
              <p>
                The DDEX Validation API validates DDEX Electronic Release Notification (ERN) messages for versions 4.3, 4.2 and 3.8.2.
                Each request runs XSD schema validation and business-rule checks, plus version-specific rules when you pass a profile.
              </p>

              <div class="info-box mt-lg">
                <h4>Base URL</h4>
                <code class="endpoint-url">https://api.ddex-workbench.org/v1</code>
              </div>

              <div class="success-box mt-lg">
                <h4><font-awesome-icon :icon="['fas', 'rocket']" /> No API key needed to start</h4>
                <p>
                  You can call the API without an API key, at up to 10 requests per minute. An API key raises that to 60 requests
                  per minute (see <a href="#rate-limiting" @click.prevent="scrollToSection('rate-limiting')">Rate Limiting</a>).
                </p>
              </div>

              <div class="warning-box mt-lg">
                <h4><font-awesome-icon :icon="['fas', 'check-circle']" /> Check API Status</h4>
                <p>Before integrating, check that the API is online:</p>
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
              <p>
                This single command validates a minimal ERN 4.3 Audio Single and returns <code>"valid": true</code>.
                Paste it into a terminal, ReqBin, or any tool that accepts cURL.
              </p>

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

              <details class="quickstart-message mt-md">
                <summary>View the ERN 4.3 message used in this request</summary>
                <div class="code-example mt-sm">
                  <div class="code-block-wrapper">
                    <button 
                      @click="copyToClipboard(QUICKSTART_XML_FORMATTED, 'quickstart-xml')"
                      class="copy-button"
                      :class="{ copied: copiedStates['quickstart-xml'] }"
                    >
                      <font-awesome-icon :icon="copiedStates['quickstart-xml'] ? 'check' : 'copy'" />
                      {{ copiedStates['quickstart-xml'] ? 'Copied!' : 'Copy' }}
                    </button>
                    <pre class="code-block"><code>{{ QUICKSTART_XML_FORMATTED }}</code></pre>
                  </div>
                </div>
              </details>

              <div class="info-box mt-lg">
                <h4><font-awesome-icon :icon="['fas', 'lightbulb']" /> Testing with ReqBin</h4>
                <p>To test this API using <a href="https://reqbin.com/curl" target="_blank" rel="noopener">ReqBin</a>:</p>
                <ol class="numbered-list">
                  <li>Copy the cURL command above</li>
                  <li>Paste the command into ReqBin</li>
                  <li>Click <strong>Run</strong></li>
                </ol>
              </div>
            </section>

            <section id="features" class="doc-section">
              <h2>Features</h2>

              <div class="feature-card card">
                <div class="card-body">
                  <h4><font-awesome-icon :icon="['fas', 'check-circle']" /> Three validation stages</h4>
                  <ul class="feature-list">
                    <li><strong>XSD schema:</strong> the message is checked against the official DDEX XSD schemas with xmllint-wasm. If the XML can't be parsed, validation stops here.</li>
                    <li><strong>Business rules:</strong> required sections (MessageHeader, ResourceList, ReleaseList, DealList) and profile expectations, such as AudioAlbum expecting a ReleaseType of Album or EP.</li>
                    <li><strong>Version-specific rules:</strong> when you pass a <code>profile</code>, 648 version-specific rules (ERN 3.8.2: 236, 4.2: 191, 4.3: 221) run as a third stage.</li>
                  </ul>
                </div>
              </div>

              <div class="feature-card card">
                <div class="card-body">
                  <h4><font-awesome-icon :icon="['fas', 'clipboard']" /> SVRL reports</h4>
                  <p>
                    Set <code>generateSVRL: true</code> (with a profile) to get a Schematron Validation Report Language (SVRL) document
                    in the <code>svrl</code> field of the response. See <a href="#svrl-generation" @click.prevent="scrollToSection('svrl-generation')">SVRL Reports</a>.
                  </p>
                </div>
              </div>

              <div class="feature-card card">
                <div class="card-body">
                  <h4><font-awesome-icon :icon="['fas', 'search']" /> Structured results</h4>
                  <p>
                    Errors and warnings are returned separately, each with a severity and rule identifier, and
                    <code>valid</code> reflects errors only. <code>metadata.validationSteps</code> lists each stage that ran,
                    with its duration and issue counts.
                  </p>
                </div>
              </div>

              <div class="feature-card card">
                <div class="card-body">
                  <h4><font-awesome-icon :icon="['fas', 'code']" /> SDKs</h4>
                  <p>
                    Official JavaScript/TypeScript and Python SDKs wrap the API and add local version detection, batch validation
                    and automatic retries. See <a href="#sdk" @click.prevent="scrollToSection('sdk')">SDK & Libraries</a>.
                  </p>
                </div>
              </div>
            </section>

            <section id="sdk" class="doc-section">
              <h2>SDK & Client Libraries</h2>
              <p>
                The official SDKs send the same requests documented below and return typed results.
              </p>

              <div class="sdk-card card">
                <div class="card-body">
                  <div class="sdk-header">
                    <h3>
                      <font-awesome-icon :icon="['fab', 'npm']" class="sdk-icon" />
                      Official JavaScript/TypeScript SDK
                    </h3>
                  </div>

                  <p class="sdk-description">
                    A Node.js-first client with TypeScript type definitions. It retries network errors and 5xx responses (up to 3 times by default).
                    <code>validateFile()</code> reads from disk and works in Node.js only. Browser use is subject to the API's CORS policy.
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

                  <h4>Example</h4>
                  <div class="code-example">
                    <div class="code-block-wrapper">
                      <button
                        @click="copyToClipboard(codeExamples.sdkJS, 'sdk-js-example')"
                        class="copy-button"
                        :class="{ copied: copiedStates['sdk-js-example'] }"
                      >
                        <font-awesome-icon :icon="copiedStates['sdk-js-example'] ? 'check' : 'copy'" />
                        {{ copiedStates['sdk-js-example'] ? 'Copied!' : 'Copy' }}
                      </button>
                      <pre class="code-block"><code>{{ codeExamples.sdkJS }}</code></pre>
                    </div>
                  </div>

                  <h4>Main methods</h4>
                  <ul class="feature-list">
                    <li><code>validate(content, options)</code> and <code>validateWithSVRL(content, options)</code></li>
                    <li><code>validateFile(path, options)</code> (Node.js only) and <code>validateURL(url, options)</code></li>
                    <li><code>validateBatch(items, { concurrency })</code> (concurrency defaults to 3)</li>
                    <li><code>validator.detectVersion(content)</code>, <code>validator.detectProfile(content)</code> and <code>validator.validateAuto(content, profile)</code>: version detection runs locally from the XML namespace</li>
                    <li><code>getSupportedFormats()</code> and <code>checkHealth()</code></li>
                  </ul>

                  <div class="sdk-links">
                    <a href="https://www.npmjs.com/package/@ddex-workbench/sdk" target="_blank" class="sdk-link">
                      <font-awesome-icon :icon="['fab', 'npm']" /> npm Package
                    </a>
                    <a href="https://github.com/daddykev/ddex-workbench/tree/main/ui/packages/sdk" target="_blank" class="sdk-link">
                      <font-awesome-icon :icon="['fab', 'github']" /> GitHub
                    </a>
                    <a href="https://github.com/daddykev/ddex-workbench/tree/main/ui/packages/sdk#readme" target="_blank" class="sdk-link">
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
                  </div>

                  <p class="sdk-description">
                    A synchronous Python client (built on <code>requests</code>) with type hints, typed result objects and automatic retries.
                  </p>

                  <h4>Installation</h4>
                  <div class="code-example">
                    <div class="code-block-wrapper">
                      <button
                        @click="copyToClipboard('pip install --upgrade ddex-workbench', 'sdk-pip-install')"
                        class="copy-button"
                        :class="{ copied: copiedStates['sdk-pip-install'] }"
                      >
                        <font-awesome-icon :icon="copiedStates['sdk-pip-install'] ? 'check' : 'copy'" />
                        {{ copiedStates['sdk-pip-install'] ? 'Copied!' : 'Copy' }}
                      </button>
                      <pre class="code-block"><code>pip install --upgrade ddex-workbench</code></pre>
                    </div>
                  </div>

                  <h4>Example</h4>
                  <div class="code-example">
                    <div class="code-block-wrapper">
                      <button
                        @click="copyToClipboard(codeExamples.sdkPython, 'sdk-python-example')"
                        class="copy-button"
                        :class="{ copied: copiedStates['sdk-python-example'] }"
                      >
                        <font-awesome-icon :icon="copiedStates['sdk-python-example'] ? 'check' : 'copy'" />
                        {{ copiedStates['sdk-python-example'] ? 'Copied!' : 'Copy' }}
                      </button>
                      <pre class="code-block"><code>{{ codeExamples.sdkPython }}</code></pre>
                    </div>
                  </div>

                  <h4>Main methods</h4>
                  <ul class="feature-list">
                    <li><code>validate(content, version, profile=None, options=None)</code></li>
                    <li><code>validate_with_svrl(content, version, profile=None)</code>, which returns a <code>(result, svrl)</code> tuple</li>
                    <li><code>validator.validate_file(path, version, profile=None)</code> and <code>validator.validate_url(url, version, profile=None)</code></li>
                    <li><code>validator.validate_batch(files, version, profile=None, max_workers=4)</code></li>
                    <li><code>validator.detect_version(content)</code>, <code>validator.detect_profile(content)</code> and <code>validator.validate_auto(content)</code></li>
                    <li><code>health()</code> and <code>formats()</code></li>
                  </ul>

                  <div class="sdk-links">
                    <a href="https://pypi.org/project/ddex-workbench/" target="_blank" class="sdk-link">
                      <font-awesome-icon :icon="['fab', 'python']" /> PyPI Package
                    </a>
                    <a href="https://github.com/daddykev/ddex-workbench/tree/main/ui/packages/python-sdk" target="_blank" class="sdk-link">
                      <font-awesome-icon :icon="['fab', 'github']" /> GitHub
                    </a>
                  </div>
                </div>
              </div>

              <h3 class="mt-xl">Direct API Access</h3>
              <p>
                To call the API directly or from another language, the sections below document every endpoint, with examples in
                cURL, JavaScript, Python and PHP.
              </p>
            </section>

            <section id="authentication" class="doc-section">
              <h2>Authentication</h2>
              <p>
                Authentication is optional. Requests without credentials are accepted and rate limited per client IP address.
                Authenticating raises the rate limit to 60 requests per minute.
              </p>

              <h3>API keys</h3>
              <p>Send your key in the <code>X-API-Key</code> header:</p>
              <div class="code-example">
                <div class="code-block-wrapper">
                  <pre class="code-block"><code>X-API-Key: ddex_your-api-key</code></pre>
                </div>
              </div>
              <p>
                <code>Authorization: Bearer ddex_your-api-key</code> is also accepted. An invalid or revoked key is rejected with
                <code>401</code> rather than treated as anonymous.
              </p>

              <ul class="feature-list">
                <li>60 requests per minute, counted per key</li>
                <li>Request count and last-used time for each key on your API Keys page</li>
              </ul>

              <div class="info-box mt-lg">
                <p>To get an API key:</p>
                <ol class="numbered-list">
                  <li>Create a free account at <a href="/signup">ddex-workbench.org/signup</a></li>
                  <li>Open the <a href="/api-keys">API Keys page</a> (up to 5 active keys per account)</li>
                  <li>Create a key and copy it. It's shown only once.</li>
                  <li>Send it as <code>X-API-Key: ddex_your-api-key</code></li>
                </ol>
              </div>

              <h3 class="mt-lg">Signed-in web app users</h3>
              <p>
                When you're signed in at ddex-workbench.org, the validator and Sandbox send your Firebase ID token, which also gives
                60 requests per minute (counted per account). An expired or invalid token is treated as anonymous. If a request
                carries both an API key and an ID token, the API key is used.
              </p>
            </section>

            <section id="rate-limiting" class="doc-section">
              <h2>Rate Limiting</h2>
              <p>
                <code>POST /validate</code> and <code>GET /formats</code> are rate limited over a 60-second window.
                <code>GET /health</code> is not rate limited.
              </p>

              <table class="data-table">
                <thead>
                  <tr>
                    <th>Access</th>
                    <th>Requests per Minute</th>
                    <th>Counted Per</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Anonymous</td>
                    <td>10</td>
                    <td>Client IP address</td>
                  </tr>
                  <tr>
                    <td>API key (<code>X-API-Key</code>)</td>
                    <td>60</td>
                    <td>API key</td>
                  </tr>
                  <tr>
                    <td>Signed in to the web app</td>
                    <td>60</td>
                    <td>Account</td>
                  </tr>
                </tbody>
              </table>

              <p class="mt-lg">
                Request bodies can be up to 10 MB for everyone; larger requests get <code>413</code>.
              </p>

              <h3 class="mt-lg">Response headers</h3>
              <p>Rate-limited endpoints return these headers on every response:</p>
              <ul class="feature-list">
                <li><code>RateLimit-Policy</code>: the limit and window, e.g. <code>10;w=60</code></li>
                <li><code>RateLimit-Limit</code>: requests allowed per window</li>
                <li><code>RateLimit-Remaining</code>: requests left in the current window</li>
                <li><code>RateLimit-Reset</code>: seconds until the window resets</li>
                <li><code>Retry-After</code>: seconds to wait (on <code>429</code> responses only)</li>
              </ul>

              <h3 class="mt-lg">When you're rate limited</h3>
              <div class="code-example">
                <div class="code-block-wrapper">
                  <button
                    @click="copyToClipboard(getCodeExample('rateLimitResponse', 'http'), 'rate-limit-response')"
                    class="copy-button"
                    :class="{ copied: copiedStates['rate-limit-response'] }"
                  >
                    <font-awesome-icon :icon="copiedStates['rate-limit-response'] ? 'check' : 'copy'" />
                    {{ copiedStates['rate-limit-response'] ? 'Copied!' : 'Copy' }}
                  </button>
                  <pre class="code-block"><code>{{ getCodeExample('rateLimitResponse', 'http') }}</code></pre>
                </div>
              </div>

              <div class="info-box mt-lg">
                <p>
                  <strong>Note:</strong> <code>error.retryAfter</code> in the body gives the same wait time as <code>Retry-After</code>.
                  Use it from browser code, where cross-origin requests may not be able to read the response headers.
                </p>
              </div>
            </section>

            <section id="errors" class="doc-section">
              <h2>Error Handling</h2>
              <p>
                A message that fails validation still returns <code>200</code>, with <code>"valid": false</code> and the issues found.
                Other errors use standard HTTP status codes with this JSON body:
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
              <p>Some errors also include <code>code</code> (e.g. <code>INVALID_API_KEY</code>, <code>RATE_LIMIT_EXCEEDED</code>) or <code>details</code>.</p>

              <h3>HTTP Status Codes</h3>
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
                    <td>Validation completed. Check <code>valid</code>, <code>errors</code> and <code>warnings</code> for the result.</td>
                  </tr>
                  <tr>
                    <td><code>400</code></td>
                    <td>Missing or invalid fields: <code>"XML content is required"</code>, <code>"Only ERN validation is currently supported"</code>, <code>"Version is required (JSON field `version` or query parameter `?version=`)."</code> or, for raw XML, <code>"Request body is empty."</code></td>
                  </tr>
                  <tr>
                    <td><code>400</code></td>
                    <td>Request body is not valid JSON. The hosting runtime rejects it before it reaches the API, so this response is a plain HTML <code>Bad Request</code> page, not the JSON error format above. Sending the message as raw XML (<code>Content-Type: application/xml</code>) sidesteps this, because the body isn't parsed as JSON.</td>
                  </tr>
                  <tr>
                    <td><code>401</code></td>
                    <td>Invalid or revoked API key (<code>code: "INVALID_API_KEY"</code>)</td>
                  </tr>
                  <tr>
                    <td><code>404</code></td>
                    <td>Unknown endpoint (<code>"Endpoint not found"</code>, with the requested <code>path</code>)</td>
                  </tr>
                  <tr>
                    <td><code>413</code></td>
                    <td>Request body over 10 MB</td>
                  </tr>
                  <tr>
                    <td><code>429</code></td>
                    <td>Rate limited (<code>code: "RATE_LIMIT_EXCEEDED"</code>, with <code>retryAfter</code> in seconds)</td>
                  </tr>
                  <tr>
                    <td><code>500</code></td>
                    <td>Unexpected server error (<code>"Internal server error during validation"</code>, with <code>details</code>)</td>
                  </tr>
                </tbody>
              </table>
            </section>

            <section id="validate" class="doc-section">
              <h2>POST /validate</h2>
              <p>Validate an ERN message. The pipeline is XSD schema → business rules → version-specific rules (when a profile is given) → SVRL report (when requested).</p>

              <div class="endpoint-details">
                <h3>Request Formats</h3>
                <p>Send the message in either of two ways:</p>
                <ul class="feature-list">
                  <li><strong>JSON body</strong> (<code>Content-Type: application/json</code>): the message and options as JSON fields. This is what the SDKs send.</li>
                  <li><strong>Raw XML</strong> (<code>Content-Type: application/xml</code> or <code>text/xml</code>): the message itself as the body, with the options as query parameters. Nothing needs escaping, so it suits single cURL commands.</li>
                </ul>
                <p>If a request has both a JSON body and query parameters, the JSON fields take precedence.</p>

                <h4 class="mt-lg">JSON body</h4>
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
                      <td>The ERN XML message</td>
                    </tr>
                    <tr>
                      <td><code>type</code></td>
                      <td>string</td>
                      <td>Yes</td>
                      <td>Message type. Only <code>"ERN"</code> is supported.</td>
                    </tr>
                    <tr>
                      <td><code>version</code></td>
                      <td>string</td>
                      <td>Yes</td>
                      <td><code>"4.3"</code>, <code>"4.2"</code> or <code>"3.8.2"</code>. The API doesn't detect the version; the SDKs can detect it locally.</td>
                    </tr>
                    <tr>
                      <td><code>profile</code></td>
                      <td>string</td>
                      <td>No</td>
                      <td><code>"AudioAlbum"</code>, <code>"AudioSingle"</code>, <code>"Video"</code>, <code>"Mixed"</code>, or <code>"ReleaseByRelease"</code> (3.8.2 only). Adds the version-specific rules stage.</td>
                    </tr>
                    <tr>
                      <td><code>generateSVRL</code></td>
                      <td>boolean</td>
                      <td>No</td>
                      <td>Return an SVRL report in <code>svrl</code>. Requires <code>profile</code>; ignored without one. Also accepted as <code>options.generateSVRL</code>.</td>
                    </tr>
                  </tbody>
                </table>

                <h4 class="mt-lg">Raw XML</h4>
                <p>The body is the ERN message as UTF-8. Options go in the query string:</p>
                <table class="params-table">
                  <thead>
                    <tr>
                      <th>Query parameter</th>
                      <th>Required</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><code>type</code></td>
                      <td>No</td>
                      <td>Defaults to <code>ERN</code>, the only supported type.</td>
                    </tr>
                    <tr>
                      <td><code>version</code></td>
                      <td>Yes</td>
                      <td><code>4.3</code>, <code>4.2</code> or <code>3.8.2</code></td>
                    </tr>
                    <tr>
                      <td><code>profile</code></td>
                      <td>No</td>
                      <td>Same values as the JSON field. Adds the version-specific rules stage.</td>
                    </tr>
                    <tr>
                      <td><code>generateSVRL</code></td>
                      <td>No</td>
                      <td><code>true</code> or <code>1</code> to return an SVRL report. Requires <code>profile</code>.</td>
                    </tr>
                  </tbody>
                </table>
                <div class="code-example mt-sm">
                  <div class="code-block-wrapper">
                    <button
                      @click="copyToClipboard(getCodeExample('rawXml', 'curl'), 'raw-xml')"
                      class="copy-button"
                      :class="{ copied: copiedStates['raw-xml'] }"
                    >
                      <font-awesome-icon :icon="copiedStates['raw-xml'] ? 'check' : 'copy'" />
                      {{ copiedStates['raw-xml'] ? 'Copied!' : 'Copy' }}
                    </button>
                    <pre class="code-block"><code>{{ getCodeExample('rawXml', 'curl') }}</code></pre>
                  </div>
                </div>
                <p>The response is the same as for a JSON request. An empty body returns <code>400</code> with <code>"Request body is empty."</code></p>

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

                <h3 class="mt-lg">Example Response</h3>
                <p>An invalid ERN 4.3 message validated with <code>"profile": "AudioAlbum"</code> (long messages shortened here):</p>
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

                <h3 class="mt-lg">Malformed XML</h3>
                <p>If the XML can't be parsed, only the XSD stage runs:</p>
                <div class="code-example">
                  <div class="code-block-wrapper">
                    <button
                      @click="copyToClipboard(getCodeExample('malformedResponse', 'json'), 'malformed-response')"
                      class="copy-button"
                      :class="{ copied: copiedStates['malformed-response'] }"
                    >
                      <font-awesome-icon :icon="copiedStates['malformed-response'] ? 'check' : 'copy'" />
                      {{ copiedStates['malformed-response'] ? 'Copied!' : 'Copy' }}
                    </button>
                    <pre class="code-block"><code>{{ getCodeExample('malformedResponse', 'json') }}</code></pre>
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
                      <td><code>true</code> when there are no errors. Warnings don't affect it.</td>
                    </tr>
                    <tr>
                      <td><code>errors</code></td>
                      <td>array</td>
                      <td>Error-severity issues from all stages that ran</td>
                    </tr>
                    <tr>
                      <td><code>warnings</code></td>
                      <td>array</td>
                      <td>Warning-severity issues (severity <code>"warning"</code> or <code>"info"</code>)</td>
                    </tr>
                    <tr>
                      <td><code>metadata.processingTime</code></td>
                      <td>number</td>
                      <td>Server-side processing time in milliseconds</td>
                    </tr>
                    <tr>
                      <td><code>metadata.schemaVersion</code></td>
                      <td>string</td>
                      <td>The version validated against, e.g. <code>"ERN 4.3"</code></td>
                    </tr>
                    <tr>
                      <td><code>metadata.profile</code></td>
                      <td>string</td>
                      <td>The requested profile (omitted when none was given)</td>
                    </tr>
                    <tr>
                      <td><code>metadata.validatedAt</code></td>
                      <td>string</td>
                      <td>ISO 8601 timestamp</td>
                    </tr>
                    <tr>
                      <td><code>metadata.errorCount</code> / <code>warningCount</code></td>
                      <td>number</td>
                      <td>Number of issues returned in <code>errors</code> / <code>warnings</code></td>
                    </tr>
                    <tr>
                      <td><code>metadata.validationSteps</code></td>
                      <td>array</td>
                      <td>One entry per stage that ran (<code>XSD</code>, <code>BusinessRules</code>, and <code>Schematron</code> when a profile was given), each with <code>duration</code>, <code>errorCount</code> and <code>warningCount</code>. Counts are full totals, even when the returned lists were capped.</td>
                    </tr>
                    <tr>
                      <td><code>metadata.truncatedErrors</code></td>
                      <td>number</td>
                      <td>How many issues were left out because of the result limits (present only when some were)</td>
                    </tr>
                    <tr>
                      <td><code>svrl</code></td>
                      <td>string</td>
                      <td>The SVRL report. Present only when one was requested and generated.</td>
                    </tr>
                  </tbody>
                </table>

                <h3 class="mt-lg">Result limits</h3>
                <ul class="feature-list">
                  <li>Each issue's <code>message</code> and <code>context</code> are capped at 300 characters, ending in "…" when cut</li>
                  <li>At most 100 issues are returned per stage</li>
                  <li><code>metadata.truncatedErrors</code> reports how many were left out; <code>validationSteps</code> keeps the full totals</li>
                </ul>
              </div>
            </section>

            <section id="svrl-generation" class="doc-section">
              <h2>SVRL Reports</h2>
              <p>
                SVRL (Schematron Validation Report Language) is an XML format for validation reports. The API builds the report from
                the version-specific rules stage, so it needs a <code>profile</code>.
              </p>

              <h3>Requesting a report</h3>
              <p>
                Include <code>"generateSVRL": true</code> and a <code>profile</code> in the request body
                (or, for a raw XML request, <code>?generateSVRL=true&amp;profile=…</code> in the query string):
              </p>

              <div class="code-example">
                <div class="code-tabs">
                  <button
                    v-for="lang in languages"
                    :key="lang.id"
                    @click="activeSVRLLang = lang.id"
                    class="code-tab"
                    :class="{ active: activeSVRLLang === lang.id }"
                  >
                    {{ lang.name }}
                  </button>
                </div>
                <div class="code-block-wrapper">
                  <button
                    @click="copyToClipboard(getCodeExample('svrlValidation', activeSVRLLang), `svrl-${activeSVRLLang}`)"
                    class="copy-button"
                    :class="{ copied: copiedStates[`svrl-${activeSVRLLang}`] }"
                  >
                    <font-awesome-icon :icon="copiedStates[`svrl-${activeSVRLLang}`] ? 'check' : 'copy'" />
                    {{ copiedStates[`svrl-${activeSVRLLang}`] ? 'Copied!' : 'Copy' }}
                  </button>
                  <pre class="code-block"><code>{{ getCodeExample('svrlValidation', activeSVRLLang) }}</code></pre>
                </div>
              </div>

              <h3>Example response</h3>
              <p>A valid message whose declared profile (<code>Audio</code>) differs from the requested one, which produces one warning:</p>
              <div class="code-example">
                <div class="code-block-wrapper">
                  <button
                    @click="copyToClipboard(getCodeExample('svrlResponse', 'json'), 'svrl-response')"
                    class="copy-button"
                    :class="{ copied: copiedStates['svrl-response'] }"
                  >
                    <font-awesome-icon :icon="copiedStates['svrl-response'] ? 'check' : 'copy'" />
                    {{ copiedStates['svrl-response'] ? 'Copied!' : 'Copy' }}
                  </button>
                  <pre class="code-block"><code>{{ getCodeExample('svrlResponse', 'json') }}</code></pre>
                </div>
              </div>

              <h3>Report structure</h3>
              <ul class="feature-list">
                <li><strong>Metadata:</strong> <code>svrl:text</code> lines with the generation time, ERN version, profile and message ID</li>
                <li><strong>Failed assertions:</strong> one <code>svrl:failed-assert</code> per issue from the version-specific rules stage, with the rule in <code>test</code> and the severity in <code>role</code> (<code>"error"</code>, or <code>"warning"</code> for warnings)</li>
                <li><strong>Summary:</strong> status and error/warning counts</li>
              </ul>
              <p>Rules that pass aren't listed; the report contains failures only.</p>

              <div class="code-example">
                <div class="code-block-wrapper">
                  <button
                    @click="copyToClipboard(getCodeExample('svrlReport', 'xml'), 'svrl-report')"
                    class="copy-button"
                    :class="{ copied: copiedStates['svrl-report'] }"
                  >
                    <font-awesome-icon :icon="copiedStates['svrl-report'] ? 'check' : 'copy'" />
                    {{ copiedStates['svrl-report'] ? 'Copied!' : 'Copy' }}
                  </button>
                  <pre class="code-block"><code>{{ getCodeExample('svrlReport', 'xml') }}</code></pre>
                </div>
              </div>
            </section>

            <section id="formats" class="doc-section">
              <h2>GET /formats</h2>
              <p>Lists the supported message types, ERN versions and profiles. <code>GET /validate/formats</code> returns the same response.</p>

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

            <section id="health" class="doc-section">
              <h2>GET /health</h2>
              <p>Reports whether the API is up. It isn't rate limited, so you can call it before sending validation requests.</p>

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

            <section id="supported-versions" class="doc-section">
              <h2>Supported DDEX Versions</h2>
              <p>
                The API supports these ERN versions and profiles (as returned by <code>GET /formats</code>):
              </p>

              <div class="version-cards">
                <div class="version-card card">
                  <div class="version-header">
                    <h3>ERN 4.3</h3>
                    <span class="badge badge-success">Recommended</span>
                  </div>
                  <div class="version-stats">
                    <span class="stat-item">221 version-specific rules</span>
                  </div>
                  <h4 class="text-sm font-semibold mb-xs mt-md">Supported Profiles:</h4>
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
                  <div class="version-stats">
                    <span class="stat-item">191 version-specific rules</span>
                  </div>
                  <h4 class="text-sm font-semibold mb-xs mt-md">Supported Profiles:</h4>
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
                    <span class="badge">Supported</span>
                  </div>
                  <div class="version-stats">
                    <span class="stat-item">236 version-specific rules</span>
                  </div>
                  <h4 class="text-sm font-semibold mb-xs mt-md">Supported Profiles:</h4>
                  <ul class="profile-list">
                    <li>AudioAlbum</li>
                    <li>AudioSingle</li>
                    <li>Video</li>
                    <li>Mixed</li>
                    <li>ReleaseByRelease</li>
                  </ul>
                </div>
              </div>

              <div class="info-box mt-lg">
                <h4><font-awesome-icon :icon="['fas', 'chart-bar']" /> Version-specific rules</h4>
                <p>
                  648 version-specific rules (ERN 3.8.2: 236, 4.2: 191, 4.3: 221) generated from the official DDEX XSD schemas
                  via our DDEX Rosetta tooling. They run in addition to XSD schema and business-rule validation when a profile is selected.
                </p>
              </div>
            </section>

            <section id="response-format" class="doc-section">
              <h2>Response Format Details</h2>

              <h3>Issue Object</h3>
              <p>Entries in <code>errors</code> and <code>warnings</code> have these fields:</p>
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
                    <td>Line number, or <code>0</code> when not available</td>
                  </tr>
                  <tr>
                    <td><code>column</code></td>
                    <td>number</td>
                    <td>Column number, or <code>0</code> when not available</td>
                  </tr>
                  <tr>
                    <td><code>message</code></td>
                    <td>string</td>
                    <td>Human-readable description (up to 300 characters)</td>
                  </tr>
                  <tr>
                    <td><code>severity</code></td>
                    <td>string</td>
                    <td><code>"error"</code> in <code>errors</code>; <code>"warning"</code> or <code>"info"</code> in <code>warnings</code></td>
                  </tr>
                  <tr>
                    <td><code>rule</code></td>
                    <td>string</td>
                    <td>
                      Rule identifier. XSD issues use <code>"XSD-Schema"</code>, business rules use names like <code>"ERN43-MessageHeader"</code>
                      or <code>"AudioAlbum-ReleaseType"</code>, and version-specific rules start with <code>"Schematron-"</code>
                    </td>
                  </tr>
                  <tr>
                    <td><code>context</code></td>
                    <td>string</td>
                    <td>Optional. Version-specific rule issues include the profile (e.g. <code>"Profile: AudioAlbum"</code>)</td>
                  </tr>
                  <tr>
                    <td><code>suggestion</code></td>
                    <td>string</td>
                    <td>Optional suggestion for fixing the issue, when a rule provides one</td>
                  </tr>
                </tbody>
              </table>

              <h3 class="mt-lg">Validation Stages</h3>
              <ol class="validation-steps-list">
                <li>
                  <strong>XSD schema validation</strong><br>
                  Checks the message against the official DDEX XSD schemas using xmllint-wasm. If the XML can't be parsed, the later stages are skipped.
                </li>
                <li>
                  <strong>Business rules</strong><br>
                  Checks required sections and profile expectations for the requested version.
                </li>
                <li>
                  <strong>Version-specific rules (when a profile is given)</strong><br>
                  Runs the version's generated rules (236, 191 or 221) and builds the SVRL report if one was requested.
                </li>
              </ol>
            </section>

            <section id="examples" class="doc-section">
              <h2>Code Examples</h2>

              <h3>Retry after a rate limit</h3>
              <p>Wait for <code>retryAfter</code> seconds when you get a <code>429</code>, then try again:</p>
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
                <h4>More examples</h4>
                <p>The Python SDK includes runnable examples, and the JavaScript SDK README covers each method:</p>
                <a href="https://github.com/daddykev/ddex-workbench/tree/main/ui/packages/python-sdk/examples" target="_blank" class="btn btn-secondary">
                  <font-awesome-icon :icon="['fab', 'github']" /> Python SDK examples
                </a>
                <a href="https://github.com/daddykev/ddex-workbench/tree/main/ui/packages/sdk#readme" target="_blank" class="btn btn-secondary">
                  <font-awesome-icon :icon="['fab', 'github']" /> JavaScript SDK README
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
/* Collapsible quickstart message */
.quickstart-message summary {
  cursor: pointer;
  color: var(--color-primary);
  font-size: var(--text-sm);
}

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
  padding-left: 0;
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
  margin-top: var(--space-xl);
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

/* Version statistics grid */
.version-stats {
  display: flex;
  gap: var(--space-lg);
  margin: var(--space-xl) 0;
  justify-content: center;
  flex-wrap: wrap;
}

/* Feature cards */
.feature-card {
  margin-bottom: var(--space-md);
}

.feature-card h4 {
  color: var(--color-primary);
  margin-bottom: var(--space-sm);
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
  padding: 2px 4px;
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

.version-stats {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-sm);
}

.stat-item {
  white-space: nowrap;
}

.profile-list {
  list-style: none;
  padding-left: 0;
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
  top: 0;
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
.sdk-header h3 .sdk-icon {
  color: #cb3837; /* npm red */
}

.sdk-card:nth-of-type(2) .sdk-icon {
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
.mt-sm { margin-top: var(--space-sm); }
.mt-md { margin-top: var(--space-md); }
.mt-lg { margin-top: var(--space-lg); }
.mt-xl { margin-top: var(--space-xl); }
.mb-xs { margin-bottom: var(--space-xs); }

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
  
  .version-stats {
    flex-direction: row;
    gap: var(--space-md);
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