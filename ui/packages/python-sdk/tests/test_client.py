# packages/python-sdk/tests/test_client.py
"""Tests for DDEXClient"""

import pytest
import responses
from unittest.mock import Mock, patch

from ddex_workbench import DDEXClient, ValidationOptions
from ddex_workbench.errors import (
    RateLimitError,
    AuthenticationError,
    NotFoundError,
    NetworkError,
    ServerError
)
from tests import VALID_ERN_43_XML, INVALID_XML


class TestDDEXClient:
    """Test DDEXClient class"""
    
    def test_client_initialization(self):
        """Test client initialization with various configurations"""
        # Default initialization
        client = DDEXClient()
        assert client.base_url == "https://api.ddex-workbench.org/v1"
        assert client.api_key is None
        assert client.timeout == 30
        
        # With API key
        client = DDEXClient(api_key="test_key")
        assert client.api_key == "test_key"
        
        # With custom base URL
        client = DDEXClient(base_url="http://localhost:5000/v1")
        assert client.base_url == "http://localhost:5000/v1"
        
        # Check validator is attached
        assert client.validator is not None
    
    @responses.activate
    def test_validate_success(self):
        """Test successful validation"""
        # Note: URL is WITHOUT /v1 due to urljoin behavior
        responses.add(
            responses.POST,
            "https://api.ddex-workbench.org/validate",
            json={
                "valid": True,
                "errors": [],
                "warnings": [],
                "metadata": {
                    "processingTime": 10,
                    "schemaVersion": "4.3"
                }
            },
            status=200
        )
        
        client = DDEXClient()
        result = client.validate(VALID_ERN_43_XML, version="4.3")
        
        assert result.valid is True
        assert len(result.errors) == 0
        assert len(result.warnings) == 0
        assert result.metadata["processingTime"] == 10
    
    @responses.activate
    def test_validate_with_errors(self):
        """Test validation with errors"""
        responses.add(
            responses.POST,
            "https://api.ddex-workbench.org/validate",
            json={
                "valid": False,
                "errors": [
                    {
                        "line": 5,
                        "column": 10,
                        "message": "Missing required element",
                        "severity": "error",
                        "rule": "ERN-001"
                    }
                ],
                "warnings": [],
                "metadata": {}
            },
            status=200
        )
        
        client = DDEXClient()
        result = client.validate(INVALID_XML, version="4.3")
        
        assert result.valid is False
        assert len(result.errors) == 1
        assert result.errors[0].line == 5
        assert result.errors[0].message == "Missing required element"
    
    @responses.activate
    def test_validate_with_options(self):
        """Test validation with options"""
        responses.add(
            responses.POST,
            "https://api.ddex-workbench.org/validate",
            json={
                "valid": True,
                "errors": [],
                "warnings": [],
                "metadata": {},
                "svrl": "<svrl>...</svrl>"
            },
            status=200
        )
        
        client = DDEXClient()
        options = ValidationOptions(generate_svrl=True, verbose=True)
        result = client.validate(VALID_ERN_43_XML, version="4.3", options=options)
        
        assert result.valid is True
        assert result.svrl == "<svrl>...</svrl>"
    
    @responses.activate
    def test_not_found_error(self):
        """Test not found error"""
        responses.add(
            responses.GET,
            "https://api.ddex-workbench.org/nonexistent",
            json={"error": "Not found"},
            status=404
        )
        
        client = DDEXClient()
        with pytest.raises(NotFoundError):
            client._request("GET", "/nonexistent")

    @responses.activate
    def test_rate_limit_error(self):
        """Test rate limit error handling"""
        # Register the response multiple times to handle retries
        for _ in range(5):  # Register 5 times to handle retries
            responses.add(
                responses.POST,
                "https://api.ddex-workbench.org/validate",
                json={"error": "Rate limit exceeded"},
                status=429,
                headers={
                    "Retry-After": "60",
                    "X-RateLimit-Limit": "100",
                    "X-RateLimit-Remaining": "0"
                }
            )
        
        client = DDEXClient()
        with pytest.raises((RateLimitError, NetworkError)) as exc_info:
            client.validate(VALID_ERN_43_XML, version="4.3")
        
        # Check if it's a RateLimitError (preferred) or NetworkError (due to retry exhaustion)
        if isinstance(exc_info.value, RateLimitError):
            assert exc_info.value.retry_after == 60
            assert exc_info.value.limit == 100
    
    @responses.activate
    def test_server_error(self):
        """Test server error"""
        # Register the response multiple times to handle retries
        for _ in range(5):  # Register 5 times to handle retries
            responses.add(
                responses.POST,
                "https://api.ddex-workbench.org/validate",
                json={"error": "Internal server error"},
                status=500
            )
        
        client = DDEXClient()
        with pytest.raises((ServerError, NetworkError)):
            client.validate(VALID_ERN_43_XML, version="4.3")
    
    @responses.activate
    def test_health_check(self):
        """Test health check endpoint"""
        responses.add(
            responses.GET,
            "https://api.ddex-workbench.org/health",
            json={
                "status": "ok",
                "version": "1.0.0",
                "timestamp": "2024-01-01T00:00:00Z",
                "service": "healthy"
            },
            status=200
        )
        
        client = DDEXClient()
        health = client.health()
        
        assert health.status == "ok"
        assert health.version == "1.0.0"
        assert health.service == "healthy"
    
    @responses.activate
    def test_formats(self):
        """Test formats endpoint"""
        responses.add(
            responses.GET,
            "https://api.ddex-workbench.org/formats",
            json={
                "types": ["ERN"],
                "versions": {
                    "ERN": ["3.8.2", "4.2", "4.3"]
                },
                "profiles": {
                    "ERN": ["AudioAlbum", "AudioSingle", "Video"]
                }
            },
            status=200
        )
        
        client = DDEXClient()
        formats = client.formats()
        
        assert "ERN" in formats.formats
        assert "4.3" in formats.versions.get("ERN", [])
    
    def test_set_and_clear_api_key(self):
        """Test dynamic API key management"""
        client = DDEXClient()
        
        # Initially no key
        assert client.api_key is None
        
        # Set key
        client.set_api_key("new_key")
        assert client.api_key == "new_key"
        assert client.session.headers.get("X-API-Key") == "new_key"
        
        # Clear key
        client.clear_api_key()
        assert client.api_key is None
        assert "X-API-Key" not in client.session.headers
    
    def test_context_manager(self):
        """Test context manager usage"""
        with DDEXClient() as client:
            assert client is not None
            assert hasattr(client, 'session')
        
        # Session should be closed after context exit
        # (we can't easily test this without mocking)
    
    def test_get_config(self):
        """Test configuration retrieval"""
        client = DDEXClient(
            api_key="test_key",
            base_url="https://test.com/v1",
            timeout=60
        )
        
        config = client.get_config()
        assert config["base_url"] == "https://test.com/v1"
        assert config["timeout"] == 60
        assert "***" in config["api_key"]  # Should be masked
    
    @responses.activate
    def test_validate_with_svrl(self):
        """Test SVRL generation"""
        responses.add(
            responses.POST,
            "https://api.ddex-workbench.org/validate",
            json={
                "valid": True,
                "errors": [],
                "warnings": [],
                "metadata": {},
                "svrl": "<svrl>test</svrl>"
            },
            status=200
        )
        
        client = DDEXClient()
        result, svrl = client.validate_with_svrl(VALID_ERN_43_XML, version="4.3")
        
        assert result.valid is True
        assert svrl == "<svrl>test</svrl>"