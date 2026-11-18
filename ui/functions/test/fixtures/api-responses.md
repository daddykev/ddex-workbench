# API response fixtures

Real responses captured from the Functions emulator on 2026-11-18 (Batch 3 smoke test and follow-up).
They are the source of truth for the API docs. Long strings are trimmed; timings vary per run.

Base path in production: `https://api.ddex-workbench.org/v1` (the Cloudflare Worker strips `/v1`).
Request bodies are capped at 10 MB. Rate limits: 60 requests/min with a valid `X-API-Key`
(keyed by key), 60 requests/min for a signed-in web user (valid Firebase ID token in
`Authorization: Bearer`, keyed by user), otherwise 10 requests/min per client IP. Precedence:
API key, then ID token, then IP. Invalid or expired ID tokens count as anonymous. Limits apply to
`/validate` and `/formats`; `/health` is not limited.

Each validation stage returns at most 100 issues, and each message/context is cut at 300
characters (with "…"). When issues are dropped, `metadata.truncatedErrors` gives the count;
`validationSteps[].errorCount` / `warningCount` always report the full totals.

## Sample request message

The valid ERN 4.3 message used below (passes XSD and business rules):

```xml
<?xml version="1.0" encoding="UTF-8"?>
<ern:NewReleaseMessage xmlns:ern="http://ddex.net/xml/ern/43" AvsVersionId="9" LanguageAndScriptCode="en" ReleaseProfileVersionId="Audio">
  <MessageHeader>
    <MessageThreadId>THREAD-0001</MessageThreadId>
    <MessageId>MSG-0001</MessageId>
    <MessageSender>
      <PartyId>PADPIDA0000000001A</PartyId>
      <PartyName><FullName>Example Label</FullName></PartyName>
    </MessageSender>
    <MessageRecipient>
      <PartyId>PADPIDA0000000002B</PartyId>
      <PartyName><FullName>Example DSP</FullName></PartyName>
    </MessageRecipient>
    <MessageCreatedDateTime>2026-11-18T00:00:00Z</MessageCreatedDateTime>
    <MessageControlType>TestMessage</MessageControlType>
  </MessageHeader>
  <PartyList>
    <Party>
      <PartyReference>PArtist</PartyReference>
      <PartyName><FullName>Example Artist</FullName></PartyName>
    </Party>
    <Party>
      <PartyReference>PLabel</PartyReference>
      <PartyName><FullName>Example Label</FullName></PartyName>
    </Party>
  </PartyList>
  <ResourceList>
    <SoundRecording>
      <ResourceReference>A1</ResourceReference>
      <Type>MusicalWorkSoundRecording</Type>
      <SoundRecordingEdition>
        <ResourceId><ISRC>USEXM2600001</ISRC></ResourceId>
        <PLine><Year>2026</Year><PLineText>2026 Example Label</PLineText></PLine>
      </SoundRecordingEdition>
      <DisplayTitleText>Example Track</DisplayTitleText>
      <DisplayTitle><TitleText>Example Track</TitleText></DisplayTitle>
      <DisplayArtistName>Example Artist</DisplayArtistName>
      <DisplayArtist SequenceNumber="1">
        <ArtistPartyReference>PArtist</ArtistPartyReference>
        <DisplayArtistRole>MainArtist</DisplayArtistRole>
      </DisplayArtist>
      <Duration>PT3M30S</Duration>
      <ParentalWarningType>NotExplicit</ParentalWarningType>
    </SoundRecording>
  </ResourceList>
  <ReleaseList>
    <Release>
      <ReleaseReference>R0</ReleaseReference>
      <ReleaseType>Album</ReleaseType>
      <ReleaseId><ICPN>00000000000000</ICPN></ReleaseId>
      <DisplayTitleText>Example Album</DisplayTitleText>
      <DisplayTitle><TitleText>Example Album</TitleText></DisplayTitle>
      <DisplayArtistName>Example Artist</DisplayArtistName>
      <DisplayArtist SequenceNumber="1">
        <ArtistPartyReference>PArtist</ArtistPartyReference>
        <DisplayArtistRole>MainArtist</DisplayArtistRole>
      </DisplayArtist>
      <ReleaseLabelReference>PLabel</ReleaseLabelReference>
      <Duration>PT3M30S</Duration>
      <Genre><GenreText>Electronic</GenreText></Genre>
      <ParentalWarningType>NotExplicit</ParentalWarningType>
      <ResourceGroup>
        <ResourceGroupContentItem>
          <SequenceNumber>1</SequenceNumber>
          <ReleaseResourceReference>A1</ReleaseResourceReference>
        </ResourceGroupContentItem>
      </ResourceGroup>
    </Release>
  </ReleaseList>
  <DealList>
    <ReleaseDeal>
      <DealReleaseReference>R0</DealReleaseReference>
      <Deal>
        <DealTerms>
          <TerritoryCode>Worldwide</TerritoryCode>
          <ValidityPeriod><StartDate>2026-11-18</StartDate></ValidityPeriod>
          <CommercialModelType>SubscriptionModel</CommercialModelType>
          <UseType>OnDemandStream</UseType>
        </DealTerms>
      </Deal>
    </ReleaseDeal>
  </DealList>
</ern:NewReleaseMessage>
```

The invalid variant removes `<MessageId>` and sets `<ReleaseType>NotARealType</ReleaseType>`.

## GET /health

```json
{
  "status": "ok",
  "timestamp": "2026-11-18T10:41:49.310Z",
  "service": "DDEX Workbench API",
  "version": "1.0.2"
}
```

## GET /formats

```json
{
  "types": [
    "ERN"
  ],
  "versions": [
    {
      "version": "4.3",
      "profiles": [
        "AudioAlbum",
        "AudioSingle",
        "Video",
        "Mixed"
      ],
      "status": "recommended"
    },
    {
      "version": "4.2",
      "profiles": [
        "AudioAlbum",
        "AudioSingle",
        "Video",
        "Mixed"
      ],
      "status": "supported"
    },
    {
      "version": "3.8.2",
      "profiles": [
        "AudioAlbum",
        "AudioSingle",
        "Video",
        "Mixed",
        "ReleaseByRelease"
      ],
      "status": "supported"
    }
  ]
}
```

## POST /validate with a profile (no SVRL)

Request: `{ "content": "<sample>", "type": "ERN", "version": "4.3", "profile": "AudioAlbum" }`

```json
{
  "valid": true,
  "errors": [],
  "warnings": [],
  "metadata": {
    "processingTime": 122,
    "schemaVersion": "ERN 4.3",
    "profile": "AudioAlbum",
    "validatedAt": "2026-11-18T10:41:49.743Z",
    "errorCount": 0,
    "warningCount": 0,
    "validationSteps": [
      {
        "type": "XSD",
        "duration": 121,
        "errorCount": 0,
        "warningCount": 0
      },
      {
        "type": "BusinessRules",
        "duration": 1,
        "errorCount": 0,
        "warningCount": 0
      },
      {
        "type": "Schematron",
        "duration": 0,
        "errorCount": 0,
        "warningCount": 0
      }
    ]
  }
}
```

Without `profile`, `validationSteps` contains only `XSD` and `BusinessRules`. The `svrl` field
is present only when an SVRL report was requested and generated.

## POST /validate with a profile and SVRL

Request: `{ "content": "<sample>", "type": "ERN", "version": "4.3", "profile": "AudioSingle", "generateSVRL": true }`
(the sample declares `ReleaseProfileVersionId="Audio"`, which produces a profile-mismatch warning)

```json
{
  "valid": true,
  "errors": [],
  "warnings": [
    {
      "line": 0,
      "column": 0,
      "message": "Message profile \"Audio\" does not match requested profile \"AudioSingle\"",
      "severity": "warning",
      "rule": "Schematron-ProfileMismatch",
      "context": "Profile: AudioSingle"
    }
  ],
  "metadata": {
    "processingTime": 123,
    "schemaVersion": "ERN 4.3",
    "profile": "AudioSingle",
    "validatedAt": "2026-11-18T10:41:49.466Z",
    "errorCount": 0,
    "warningCount": 1,
    "validationSteps": [
      {
        "type": "XSD",
        "duration": 119,
        "errorCount": 0,
        "warningCount": 0
      },
      {
        "type": "BusinessRules",
        "duration": 1,
        "errorCount": 0,
        "warningCount": 0
      },
      {
        "type": "Schematron",
        "duration": 3,
        "errorCount": 0,
        "warningCount": 1
      }
    ]
  },
  "svrl": "<see SVRL below>"
}
```

SVRL (`svrl` field):

```xml
<?xml version="1.0" encoding="UTF-8"?>
<svrl:schematron-output xmlns:svrl="http://purl.oclc.org/dsdl/svrl" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" title="DDEX ERN Validation Report" phase="#ALL" schemaVersion="4.3">
  <!-- Validation Metadata -->
  <svrl:text>DDEX ERN Validation Report</svrl:text>
  <svrl:text>Generated: 2026-11-18T10:41:49.466Z</svrl:text>
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

</svrl:schematron-output>
```

## POST /validate with an invalid message

Request: invalid variant, `"profile": "AudioAlbum"`

```json
{
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
      "message": "Schemas validity error : Element 'ReleaseType': [facet 'enumeration'] The value 'NotARealType' is not an element of the set {'Album', 'AlertToneRelease', 'AsPerContract', 'AudioBookRelease', 'AudioDramaRelease', 'BackCoverImageRelease', 'Bo …(trimmed)",
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
    "validatedAt": "2026-11-18T10:41:49.603Z",
    "errorCount": 3,
    "warningCount": 1,
    "validationSteps": [
      {
        "type": "XSD",
        "duration": 118,
        "errorCount": 2,
        "warningCount": 0
      },
      {
        "type": "BusinessRules",
        "duration": 1,
        "errorCount": 0,
        "warningCount": 1
      },
      {
        "type": "Schematron",
        "duration": 1,
        "errorCount": 1,
        "warningCount": 0
      }
    ]
  }
}
```

## POST /validate with malformed XML

Request: `{ "content": "<a>", "type": "ERN", "version": "4.3" }`. Later stages are skipped when the XML doesn't parse.

```json
{
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
    "validatedAt": "2026-11-18T10:41:49.882Z",
    "errorCount": 2,
    "warningCount": 0,
    "validationSteps": [
      {
        "type": "XSD",
        "duration": 123,
        "errorCount": 2,
        "warningCount": 0
      }
    ]
  }
}
```

## Error responses

400 (missing content):

```json
{
  "error": {
    "message": "XML content is required"
  }
}
```

401 (unknown or revoked key; a key without the `ddex_` prefix returns `"Invalid API key format"`):

```json
{ "error": { "code": "INVALID_API_KEY", "message": "Invalid or revoked API key" } }
```

413 (body over 10 MB):

```json
{ "error": { "message": "Request body exceeds the 10 MB limit" } }
```

429 (anonymous). Headers sent on every limited route: `RateLimit-Policy`, `RateLimit-Limit`,
`RateLimit-Remaining`, `RateLimit-Reset`; on a 429 also `Retry-After` (seconds).

```
HTTP/1.1 429 Too Many Requests
ratelimit-policy: 10;w=60
ratelimit-limit: 10
ratelimit-remaining: 0
ratelimit-reset: 60
retry-after: 60
```

```json
{ "error": { "code": "RATE_LIMIT_EXCEEDED", "message": "Rate limit exceeded (10 requests per minute). Sign in or use an API key for up to 60 requests per minute.", "retryAfter": 60 } }
```

429 (signed-in user): same headers with `ratelimit-policy: 60;w=60`.

```json
{ "error": { "code": "RATE_LIMIT_EXCEEDED", "message": "Rate limit exceeded (60 requests per minute for signed-in users)", "retryAfter": 49 } }
```

429 (with an API key): same headers with `ratelimit-policy: 60;w=60` and `ratelimit-limit: 60`.

```json
{ "error": { "code": "RATE_LIMIT_EXCEEDED", "message": "API key rate limit exceeded (60 requests per minute)", "retryAfter": 60 } }
```

## POST /validate with more than 100 issues in one stage

150 invalid `ParentalWarningType` values (each about 400 characters long): `errors` has 100 entries,
each message ends with "…" at 300 characters, `metadata.errorCount` is 100,
`metadata.truncatedErrors` is 50, and the XSD step reports `"errorCount": 150`.
