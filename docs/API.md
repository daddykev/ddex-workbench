# DDEX Workbench API Documentation

Base URL: `https://api.ddex-workbench.org/v1`

## Authentication

The API supports both anonymous and authenticated access. Authenticated users receive higher rate limits and additional features.

### API Key Authentication

Include your API key in the Authorization header:

```
Authorization: Bearer YOUR_API_KEY
```

To obtain an API key:
1. Sign up at [ddex-workbench.org](https://ddex-workbench.org)
2. Navigate to your API Keys dashboard
3. Click "Generate New Key"

## Rate Limiting

| User Type | Requests/Minute | Max File Size | Concurrent Requests |
|-----------|----------------|---------------|-------------------|
| Anonymous | 10 | 5 MB | 1 |
| Authenticated (Free) | 60 | 10 MB | 3 |
| Authenticated (Pro) | 300 | 50 MB | 10 |

Rate limit information is included in response headers:
- `X-RateLimit-Limit`: Total requests allowed
- `X-RateLimit-Remaining`: Requests remaining
- `X-RateLimit-Reset`: Unix timestamp when limit resets

## Endpoints

### Validation

#### POST /validate
Validate DDEX XML content provided as a string.

**Request:**
```json
{
  "content": "<?xml version=\"1.0\"?>...",
  "type": "ERN",
  "version": "4.3",
  "profile": "AudioAlbum"
}
```

**Parameters:**
- `content` (string, required): XML content to validate
- `type` (string, required): Message type (currently only "ERN")
- `version` (string, required): DDEX version (currently only "4.3")
- `profile` (string, optional): Specific profile ("AudioAlbum", "AudioSingle", "Video", "Mixed")

**Response (200 OK):**
```json
{
  "valid": false,
  "errors": [
    {
      "line": 45,
      "column": 12,
      "message": "Element 'ReleaseDate' is missing required child element 'Date'",
      "severity": "error",
      "rule": "ERN-4.3-ReleaseDate",
      "context": "<ReleaseDate>...</ReleaseDate>"
    }
  ],
  "metadata": {
    "processingTime": 234,
    "schemaVersion": "ern/43/2024-03-29",
    "validatedAt": "2025-01-15T10:30:00Z"
  }
}
```

#### POST /validate/file
Validate an uploaded DDEX XML file.

**Request:**
- Content-Type: `multipart/form-data`
- Fields:
  - `file` (file, required): XML file to validate
  - `type` (string, required): Message type
  - `version` (string, required): DDEX version
  - `profile` (string, optional): Specific profile

**Response:** Same as `/validate` endpoint

### Information

#### GET /formats
Get supported DDEX formats and versions.

**Response (200 OK):**
```json
{
  "formats": [
    {
      "type": "ERN",
      "versions": [
        {
          "version": "4.3",
          "profiles": ["AudioAlbum", "AudioSingle", "Video", "Mixed"],
          "status": "active"
        }
      ]
    }
  ]
}
```

#### GET /health
Check API health status.

**Response (200 OK):**
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "2025-01-15T10:30:00Z"
}
```

### Validation History (Authenticated)

#### GET /validations/history
Get validation history for authenticated user.

**Query Parameters:**
- `limit` (integer, optional): Number of records (default: 20, max: 100)
- `startAfter` (string, optional): Cursor for pagination

**Response (200 OK):**
```json
{
  "validations": [
    {
      "id": "val_123abc",
      "timestamp": "2025-01-15T10:30:00Z",
      "fileName": "release_001.xml",
      "valid": true,
      "errorCount": 0,
      "version": "4.3",
      "profile": "AudioAlbum"
    }
  ],
  "nextCursor": "val_456def"
}
```

### Community Snippets

#### GET /snippets
Browse community snippets.

**Query Parameters:**
- `category` (string, optional): Filter by category
- `tags` (array, optional): Filter by tags
- `search` (string, optional): Search query
- `sort` (string, optional): Sort order ("votes", "recent", default: "votes")
- `limit` (integer, optional): Results per page (default: 20)
- `startAfter` (string, optional): Cursor for pagination

**Response (200 OK):**
```json
{
  "snippets": [
    {
      "id": "snip_123",
      "title": "Basic ERN 4.3 Audio Album",
      "description": "Minimal example of ERN 4.3 structure",
      "category": "basic",
      "tags": ["ERN 4.3", "Audio Album"],
      "author": {
        "displayName": "John Doe"
      },
      "votes": 42,
      "created": "2025-01-10T10:00:00Z"
    }
  ],
  "nextCursor": "snip_456"
}
```

## Error Responses

All errors follow this format:

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "The provided XML does not conform to ERN 4.3 schema",
    "details": {
      "field": "content",
      "reason": "Invalid XML structure"
    }
  }
}
```

### Error Codes

| Status | Code | Description |
|--------|------|-------------|
| 400 | INVALID_REQUEST | Request body or parameters invalid |
| 401 | UNAUTHORIZED | Missing or invalid API key |
| 413 | FILE_TOO_LARGE | Upload exceeds size limit |
| 429 | RATE_LIMIT_EXCEEDED | Too many requests |
| 500 | INTERNAL_ERROR | Server error |

## SDK Libraries

Official SDKs:
- JavaScript/TypeScript: `npm install @ddex-workbench/api-client`
- Python: `pip install ddex-workbench`

## Examples

### cURL
```bash
curl -X POST https://api.ddex-workbench.org/v1/validate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "content": "<?xml version=\"1.0\"?>...",
    "type": "ERN",
    "version": "4.3"
  }'
```

### JavaScript
```javascript
import { DDEXClient } from '@ddex-workbench/api-client';

const client = new DDEXClient({ apiKey: 'YOUR_API_KEY' });

const result = await client.validate({
  content: xmlContent,
  type: 'ERN',
  version: '4.3'
});
```

### Python
```python
from ddex_workbench import Client

client = Client(api_key="YOUR_API_KEY")

result = client.validate(
    content=xml_content,
    type="ERN",
    version="4.3"
)
```

## Webhooks (Coming Soon)

Webhooks for validation events will be available in a future release.

## Support

- GitHub Issues: [github.com/ddex-workbench/ddex-workbench](https://github.com/ddex-workbench/ddex-workbench)
- Email: support@ddex-workbench.org
- Discord: [discord.gg/ddex-workbench](https://discord.gg/ddex-workbench)