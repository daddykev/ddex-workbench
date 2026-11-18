# packages/python-sdk/tests/__init__.py
"""
Test suite for DDEX Workbench Python SDK
"""

import os
import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

# Test constants
TEST_API_KEY = os.environ.get("DDEX_TEST_API_KEY", "ddex_test_key_12345")
TEST_BASE_URL = os.environ.get("DDEX_TEST_BASE_URL", "https://api.ddex-workbench.org/v1")

# Sample XML for testing
VALID_ERN_43_XML = """<?xml version="1.0" encoding="UTF-8"?>
<ern:NewReleaseMessage xmlns:ern="http://ddex.net/xml/ern/43" 
    MessageSchemaVersionId="ern/43"
    LanguageAndScriptCode="en">
    <MessageHeader>
        <MessageId>MSG_TEST_001</MessageId>
        <MessageCreatedDateTime>2024-01-01T00:00:00Z</MessageCreatedDateTime>
    </MessageHeader>
    <ResourceList>
        <SoundRecording>
            <ResourceReference>A1</ResourceReference>
        </SoundRecording>
    </ResourceList>
    <ReleaseList>
        <Release>
            <ReleaseReference>R0</ReleaseReference>
        </Release>
    </ReleaseList>
    <DealList>
        <ReleaseDeal>
            <DealReleaseReference>R0</DealReleaseReference>
        </ReleaseDeal>
    </DealList>
</ern:NewReleaseMessage>"""

INVALID_XML = """<?xml version="1.0" encoding="UTF-8"?>
<ern:NewReleaseMessage xmlns:ern="http://ddex.net/xml/ern/43">
    <MessageHeader>
        <!-- Missing required elements -->
    </MessageHeader>
</ern:NewReleaseMessage>"""

MALFORMED_XML = """<?xml version="1.0" encoding="UTF-8"?>
<unclosed_tag>
    <another_tag>
"""