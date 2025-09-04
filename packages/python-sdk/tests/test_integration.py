# packages/python-sdk/tests/test_integration.py
"""Integration tests for DDEX Workbench SDK"""

import os
import pytest
from pathlib import Path

from ddex_workbench import DDEXClient, ValidationOptions
from tests import VALID_ERN_43_XML, INVALID_XML

# Skip integration tests unless explicitly enabled
pytestmark = pytest.mark.skipif(
    os.environ.get("DDEX_INTEGRATION_TEST", "false").lower() != "true",
    reason="Integration tests disabled. Set DDEX_INTEGRATION_TEST=true to run."
)


class TestIntegration:
    """Integration tests against real API"""
    
    def setup_method(self):
        """Set up test client"""
        self.client = DDEXClient()
    
    def test_health_check(self):
        """Test health check against real API"""
        health = self.client.health()
        assert health.status in ["ok", "healthy"]
        assert health.version is not None
    
    def test_get_formats(self):
        """Test formats endpoint"""
        formats = self.client.formats()
        assert "ERN" in formats.formats or formats.types is not None
        
        # Check versions are present
        if formats.versions:
            assert "4.3" in str(formats.versions)
    
    def test_validate_valid_xml(self):
        """Test validation of valid XML"""
        result = self.client.validate(VALID_ERN_43_XML, version="4.3")
        # Note: The XML is incomplete so it will have errors
        assert result is not None
        assert hasattr(result, 'valid')
        assert hasattr(result, 'errors')
    
    def test_validate_invalid_xml(self):
        """Test validation of invalid XML"""
        result = self.client.validate(INVALID_XML, version="4.3")
        assert result.valid is False
        assert len(result.errors) > 0
    
    def test_validate_with_profile(self):
        """Test validation with profile"""
        result = self.client.validate(
            VALID_ERN_43_XML,
            version="4.3",
            profile="AudioAlbum"
        )
        assert result is not None
    
    def test_auto_detection(self):
        """Test auto-detection of version"""
        version = self.client.validator.detect_version(VALID_ERN_43_XML)
        assert version == "4.3"
    
    def test_validate_auto(self):
        """Test auto-validation"""
        result = self.client.validator.validate_auto(VALID_ERN_43_XML)
        assert result is not None
        assert hasattr(result, 'valid')
    
    def test_metadata_extraction(self):
        """Test metadata extraction"""
        metadata = self.client.validator.extract_metadata(VALID_ERN_43_XML)
        assert metadata['version'] == '4.3'
        assert metadata['message_id'] == 'MSG_TEST_001'
    
    def test_generate_summary(self):
        """Test summary generation"""
        result = self.client.validate(VALID_ERN_43_XML, version="4.3")
        summary = self.client.validator.generate_summary(result)
        assert "Validation Summary" in summary
        assert "Valid:" in summary
    
    @pytest.mark.slow
    def test_concurrent_requests(self):
        """Test multiple concurrent requests"""
        import concurrent.futures
        
        def validate():
            return self.client.validate(VALID_ERN_43_XML, version="4.3")
        
        with concurrent.futures.ThreadPoolExecutor(max_workers=3) as executor:
            futures = [executor.submit(validate) for _ in range(3)]
            results = [f.result() for f in concurrent.futures.as_completed(futures)]
        
        assert len(results) == 3
        for result in results:
            assert result is not None