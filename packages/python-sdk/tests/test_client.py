# packages/python-sdk/tests/test_client.py
"""
Unit tests for DDEXClient
"""

import pytest
from unittest.mock import Mock, patch, MagicMock
import responses
import json
from pathlib import Path

from ddex_workbench import DDEXClient
from ddex_workbench.errors import (
    RateLimitError,
    AuthenticationError,
    NotFoundError,
    ValidationError,
    DDEXError
)
from ddex_workbench.types import ValidationResult, ValidationError as ValidationErrorDetail

from . import TEST_API_KEY, TEST_BASE_URL, VALID_ERN_43_XML, INVALID_XML


class TestDDEXClient:
    """Test DDEXClient class"""
    
    def test_client_initialization(self):
        """Test client initialization with various configurations"""
        # Default initialization
        client = DDEXClient()
        assert client.api_key is None
        assert client.base_url == "https://api.ddex-workbench.org/v1"
        assert client.timeout == 30
        
        # With API key
        client = DDEXClient(api_key=TEST_API_KEY)
        assert client.api_key == TEST_API_KEY
        assert "X-API-Key" in client.session.headers
        
        # With custom config
        client = DDEXClient(
            api_key=TEST_API_KEY,
            base_url=TEST_BASE_URL,
            timeout=60,
            max_retries=5
        )
        assert client.base_url == TEST_BASE_URL
        assert client.timeout == 60
        assert client.max_retries == 5
    
    @responses.activate
    def test_validate_success(self):
        """Test successful validation"""
        mock_response = {
            "valid": True,
            "errors": [],
            "warnings": [],
            "metadata": {
                "processingTime": 50,
                "schemaVersion": "ERN 4.3",
                "validatedAt": "2024-01-01T00:00:00Z",
                "errorCount": 0,
                "warningCount": 0,
                "validationSteps": []
            }
        }
        
        responses.add(
            responses.POST,
            f"{TEST_BASE_URL}/validate",
            json=mock_response,
            status=200
        )
        
        client = DDEXClient(base_url=TEST_BASE_URL)
        result = client.validate(VALID_ERN_43_XML, version="4.3")
        
        assert isinstance(result, ValidationResult)
        assert result.valid is True
        assert len(result.errors) == 0
        assert result.metadata.processing_time == 50
    
    @responses.activate
    def test_validate_with_errors(self):
        """Test validation with errors"""
        mock_response = {
            "valid": False,
            "errors": [
                {
                    "line": 5,
                    "column": 10,
                    "message": "Missing required element",
                    "severity": "error",
                    "rule": "ERN43-Required",
                    "context": None,
                    "suggestion": "Add the required element"
                }
            ],
            "warnings": [],
            "metadata": {
                "processingTime": 75,
                "schemaVersion": "ERN 4.3",
                "validatedAt": "2024-01-01T00:00:00Z",
                "errorCount": 1,
                "warningCount": 0,
                "validationSteps": []
            }
        }
        
        responses.add(
            responses.POST,
            f"{TEST_BASE_URL}/validate",
            json=mock_response,
            status=200
        )
        
        client = DDEXClient(base_url=TEST_BASE_URL)
        result = client.validate(INVALID_XML, version="4.3")
        
        assert result.valid is False
        assert len(result.errors) == 1
        assert result.errors[0].line == 5
        assert result.errors[0].message == "Missing required element"
    
    @responses.activate
    def test_rate_limit_error(self):
        """Test rate limit error handling"""
        responses.add(
            responses.POST,
            f"{TEST_BASE_URL}/validate",
            status=429,
            headers={"Retry-After": "60"}
        )
        
        client = DDEXClient(base_url=TEST_BASE_URL)
        
        with pytest.raises(RateLimitError) as exc_info:
            client.validate(VALID_ERN_43_XML, version="4.3")
        
        assert exc_info.value.retry_after == 60
        assert "Rate limit exceeded" in str(exc_info.value)
    
    @responses.activate
    def test_authentication_error(self):
        """Test authentication error"""
        responses.add(
            responses.POST,
            f"{TEST_BASE_URL}/validate",
            status=401,
            json={"error": {"message": "Invalid API key"}}
        )
        
        client = DDEXClient(base_url=TEST_BASE_URL, api_key="invalid_key")
        
        with pytest.raises(AuthenticationError) as exc_info:
            client.validate(VALID_ERN_43_XML, version="4.3")
        
        assert "Authentication required" in str(exc_info.value)
    
    @responses.activate
    def test_not_found_error(self):
        """Test 404 not found error"""
        responses.add(
            responses.GET,
            f"{TEST_BASE_URL}/nonexistent",
            status=404
        )
        
        client = DDEXClient(base_url=TEST_BASE_URL)
        
        with pytest.raises(NotFoundError):
            client._get("/nonexistent")
    
    @responses.activate
    def test_validate_url(self):
        """Test validate_url method"""
        url = "https://example.com/release.xml"
        
        # Mock fetching the XML
        responses.add(
            responses.GET,
            url,
            body=VALID_ERN_43_XML,
            status=200
        )
        
        # Mock validation
        responses.add(
            responses.POST,
            f"{TEST_BASE_URL}/validate",
            json={
                "valid": True,
                "errors": [],
                "warnings": [],
                "metadata": {
                    "processingTime": 50,
                    "schemaVersion": "ERN 4.3",
                    "validatedAt": "2024-01-01T00:00:00Z",
                    "errorCount": 0,
                    "warningCount": 0,
                    "validationSteps": []
                }
            },
            status=200
        )
        
        client = DDEXClient(base_url=TEST_BASE_URL)
        result = client.validate_url(url, version="4.3")
        
        assert result.valid is True
    
    @responses.activate
    def test_get_supported_formats(self):
        """Test get_supported_formats method"""
        mock_response = {
            "types": ["ERN"],
            "versions": [
                {
                    "version": "4.3",
                    "profiles": ["AudioAlbum", "AudioSingle"],
                    "status": "recommended"
                }
            ]
        }
        
        responses.add(
            responses.GET,
            f"{TEST_BASE_URL}/formats",
            json=mock_response,
            status=200
        )
        
        client = DDEXClient(base_url=TEST_BASE_URL)
        formats = client.get_supported_formats()
        
        assert "ERN" in formats.types
        assert len(formats.versions) == 1
        assert formats.versions[0].version == "4.3"
    
    @responses.activate
    def test_check_health(self):
        """Test check_health method"""
        mock_response = {
            "status": "healthy",
            "version": "1.0.0",
            "timestamp": "2024-01-01T00:00:00Z"
        }
        
        responses.add(
            responses.GET,
            f"{TEST_BASE_URL}/health",
            json=mock_response,
            status=200
        )
        
        client = DDEXClient(base_url=TEST_BASE_URL)
        health = client.check_health()
        
        assert health.status == "healthy"
        assert health.version == "1.0.0"
    
    def test_set_and_clear_api_key(self):
        """Test setting and clearing API key"""
        client = DDEXClient()
        
        # Initially no API key
        assert client.api_key is None
        assert "X-API-Key" not in client.session.headers
        
        # Set API key
        client.set_api_key("new_key")
        assert client.api_key == "new_key"
        assert client.session.headers["X-API-Key"] == "new_key"
        
        # Clear API key
        client.clear_api_key()
        assert client.api_key is None
        assert "X-API-Key" not in client.session.headers
    
    def test_context_manager(self):
        """Test client as context manager"""
        with DDEXClient() as client:
            assert client is not None
            assert hasattr(client, 'session')
        
        # Session should be closed after context
        assert client.session is not None  # Still exists but closed
    
    @responses.activate
    def test_list_api_keys(self):
        """Test list_api_keys method"""
        mock_response = [
            {
                "id": "key1",
                "name": "Test Key",
                "created": "2024-01-01T00:00:00Z",
                "rateLimit": 60,
                "requestCount": 100,
                "lastUsed": "2024-01-01T12:00:00Z"
            }
        ]
        
        responses.add(
            responses.GET,
            f"{TEST_BASE_URL}/keys",
            json=mock_response,
            status=200
        )
        
        client = DDEXClient(base_url=TEST_BASE_URL)
        keys = client.list_api_keys("auth_token")
        
        assert len(keys) == 1
        assert keys[0].name == "Test Key"
        assert keys[0].rate_limit == 60
    
    @responses.activate
    def test_create_api_key(self):
        """Test create_api_key method"""
        mock_response = {
            "id": "new_key_id",
            "name": "New Key",
            "key": "ddex_secret_key_123",
            "created": "2024-01-01T00:00:00Z",
            "rateLimit": 60,
            "requestCount": 0
        }
        
        responses.add(
            responses.POST,
            f"{TEST_BASE_URL}/keys",
            json=mock_response,
            status=200
        )
        
        client = DDEXClient(base_url=TEST_BASE_URL)
        key = client.create_api_key("New Key", "auth_token")
        
        assert key.name == "New Key"
        assert key.key == "ddex_secret_key_123"
    
    @responses.activate
    def test_revoke_api_key(self):
        """Test revoke_api_key method"""
        responses.add(
            responses.DELETE,
            f"{TEST_BASE_URL}/keys/key_id",
            status=204
        )
        
        client = DDEXClient(base_url=TEST_BASE_URL)
        
        # Should not raise exception
        client.revoke_api_key("key_id", "auth_token")