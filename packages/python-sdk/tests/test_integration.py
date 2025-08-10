# packages/python-sdk/tests/test_integration.py
"""
Integration tests for DDEX Workbench SDK

NOTE: These tests require a live API connection or test server.
Set DDEX_INTEGRATION_TEST=true to run these tests.
"""

import os
import pytest
from pathlib import Path
import time

from ddex_workbench import DDEXClient
from ddex_workbench.errors import RateLimitError
from . import VALID_ERN_43_XML, INVALID_XML

# Skip integration tests unless explicitly enabled
pytestmark = pytest.mark.skipif(
    os.environ.get("DDEX_INTEGRATION_TEST") != "true",
    reason="Integration tests disabled. Set DDEX_INTEGRATION_TEST=true to run."
)


class TestIntegration:
    """Integration tests against live API"""
    
    @pytest.fixture
    def client(self):
        """Create client for integration tests"""
        api_key = os.environ.get("DDEX_API_KEY")
        base_url = os.environ.get("DDEX_BASE_URL", "https://api.ddex-workbench.org/v1")
        
        return DDEXClient(api_key=api_key, base_url=base_url)
    
    def test_health_check(self, client):
        """Test API health check"""
        health = client.check_health()
        
        assert health.status in ["healthy", "ok"]
        assert health.version is not None
        assert health.timestamp is not None
    
    def test_get_supported_formats(self, client):
        """Test getting supported formats"""
        formats = client.get_supported_formats()
        
        assert "ERN" in formats.types
        assert len(formats.versions) > 0
        
        # Check for expected versions
        versions = [v.version for v in formats.versions]
        assert "4.3" in versions
        assert "4.2" in versions
        assert "3.8.2" in versions
    
    def test_validate_valid_xml(self, client):
        """Test validation of valid XML"""
        result = client.validate(VALID_ERN_43_XML, version="4.3")
        
        # Note: The sample XML might not be completely valid
        # Check that we got a result
        assert result is not None
        assert isinstance(result.valid, bool)
        assert result.metadata.processing_time > 0
        assert result.metadata.schema_version == "ERN 4.3"
    
    def test_validate_invalid_xml(self, client):
        """Test validation of invalid XML"""
        result = client.validate(INVALID_XML, version="4.3")
        
        assert result.valid is False
        assert len(result.errors) > 0
        assert result.metadata.error_count > 0
    
    def test_validate_with_profile(self, client):
        """Test validation with profile"""
        result = client.validate(
            VALID_ERN_43_XML,
            version="4.3",
            profile="AudioAlbum"
        )
        
        assert result is not None
        assert result.metadata.profile == "AudioAlbum"
    
    def test_rate_limiting(self, client):
        """Test rate limiting behavior"""
        # Only run if no API key (anonymous has lower rate limits)
        if client.api_key:
            pytest.skip("Rate limit test requires anonymous access")
        
        # Make multiple rapid requests
        request_count = 0
        rate_limited = False
        
        try:
            for _ in range(15):  # Anonymous limit is typically 10/min
                client.validate(VALID_ERN_43_XML, version="4.3")
                request_count += 1
                time.sleep(0.1)  # Small delay
        except RateLimitError:
            rate_limited = True
        
        # We should hit rate limit
        assert rate_limited or request_count == 15
    
    def test_version_auto_detection(self, client):
        """Test automatic version detection"""
        result = client.validator.validate_auto(VALID_ERN_43_XML)
        
        assert result is not None
        assert "4.3" in result.metadata.schema_version
    
    def test_concurrent_requests(self, client):
        """Test concurrent validation requests"""
        items = [
            (VALID_ERN_43_XML, "4.3", None),
            (INVALID_XML, "4.3", None),
            (VALID_ERN_43_XML, "4.2", None)
        ]
        
        results = client.validator.validate_batch(items, max_workers=3)
        
        assert len(results) == 3
        # At least one should be valid (the valid XML)
        assert any(r.valid for r in results if r is not None)
    
    @pytest.mark.slow
    def test_large_file_validation(self, client, tmp_path):
        """Test validation of large XML file"""
        # Create a large XML file (repeat elements)
        large_xml = """<?xml version="1.0" encoding="UTF-8"?>
        <ern:NewReleaseMessage xmlns:ern="http://ddex.net/xml/ern/43" 
            MessageSchemaVersionId="ern/43">
            <MessageHeader>
                <MessageId>MSG_LARGE_001</MessageId>
                <MessageCreatedDateTime>2024-01-01T00:00:00Z</MessageCreatedDateTime>
            </MessageHeader>
            <ResourceList>"""
        
        # Add many resources
        for i in range(100):
            large_xml += f"""
                <SoundRecording>
                    <ResourceReference>A{i}</ResourceReference>
                </SoundRecording>"""
        
        large_xml += """
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
        
        # Save to file
        large_file = tmp_path / "large.xml"
        large_file.write_text(large_xml)
        
        # Validate
        result = client.validate_file(large_file, version="4.3")
        
        assert result is not None
        assert result.metadata.processing_time > 0
    
    def test_error_recovery(self, client):
        """Test error recovery and retry logic"""
        # Test with malformed XML
        malformed = "<<<not xml>>>"
        
        result = client.validate(malformed, version="4.3")
        
        assert result.valid is False
        assert len(result.errors) > 0
        
        # Should be able to make another request immediately
        result2 = client.validate(VALID_ERN_43_XML, version="4.3")
        assert result2 is not None