# packages/python-sdk/tests/test_client.py
"""Tests for DDEXClient"""

import json
import warnings

import pytest
import responses
from unittest.mock import Mock, patch

from ddex_workbench import DDEXClient, ERNProfile, ValidationOptions
from ddex_workbench.errors import (
    RateLimitError,
    AuthenticationError,
    NotFoundError,
    NetworkError,
    ServerError,
    APIError
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
            "https://api.ddex-workbench.org/v1/validate",
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
            "https://api.ddex-workbench.org/v1/validate",
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
            "https://api.ddex-workbench.org/v1/validate",
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
        options = ValidationOptions(
            generate_svrl=True,
            verbose=True,
            include_passed_rules=True,
            custom_rules=["x"],
            max_errors=5
        )
        result = client.validate(VALID_ERN_43_XML, version="4.3", options=options)
        
        assert result.valid is True
        assert result.svrl == "<svrl>...</svrl>"
        # Deprecated options aren't sent
        body = json.loads(responses.calls[0].request.body)
        assert body == {
            "content": VALID_ERN_43_XML,
            "type": "ERN",
            "version": "4.3",
            "generateSVRL": True
        }
    
    @responses.activate
    def test_not_found_error(self):
        """Test not found error"""
        responses.add(
            responses.GET,
            "https://api.ddex-workbench.org/v1/nonexistent",
            json={"error": "Not found"},
            status=404
        )
        
        client = DDEXClient()
        with pytest.raises(NotFoundError):
            client._request("GET", "/nonexistent")

    @responses.activate
    def test_rate_limit_error(self):
        """A 429 raises RateLimitError at once, with retry_after from the body"""
        responses.add(
            responses.POST,
            "https://api.ddex-workbench.org/v1/validate",
            json={
                "error": {
                    "code": "RATE_LIMIT_EXCEEDED",
                    "message": "Rate limit exceeded (10 requests per minute).",
                    "retryAfter": 42
                }
            },
            status=429,
            headers={
                "Retry-After": "60",
                "RateLimit-Policy": "10;w=60",
                "RateLimit-Limit": "10",
                "RateLimit-Remaining": "0",
                "RateLimit-Reset": "60"
            }
        )
        
        client = DDEXClient(retry_delay=0)
        with pytest.raises(RateLimitError) as exc_info:
            client.validate(VALID_ERN_43_XML, version="4.3")
        
        err = exc_info.value
        # Not retried: exactly one request was made
        assert len(responses.calls) == 1
        assert err.message == "Rate limit exceeded (10 requests per minute)."
        # Body's error.retryAfter wins over the Retry-After header
        assert err.retry_after == 42
        assert err.limit == 10
        assert err.remaining == 0
        assert err.reset == 60
        assert err.policy == "10;w=60"
    
    @responses.activate
    def test_rate_limit_falls_back_to_retry_after_header(self):
        """Without error.retryAfter in the body, use the Retry-After header"""
        responses.add(
            responses.POST,
            "https://api.ddex-workbench.org/v1/validate",
            json={"error": {"message": "slow down"}},
            status=429,
            headers={"Retry-After": "17"}
        )
        
        client = DDEXClient(retry_delay=0)
        with pytest.raises(RateLimitError) as exc_info:
            client.validate(VALID_ERN_43_XML, version="4.3")
        
        assert len(responses.calls) == 1
        assert exc_info.value.retry_after == 17
        assert exc_info.value.limit is None
    
    @responses.activate
    def test_rate_limit_ignores_legacy_x_ratelimit_headers(self):
        """X-RateLimit-* headers aren't read; the API sends RateLimit-*"""
        responses.add(
            responses.POST,
            "https://api.ddex-workbench.org/v1/validate",
            json={"error": {"message": "slow down"}},
            status=429,
            headers={"X-RateLimit-Limit": "100", "X-RateLimit-Remaining": "5"}
        )
        
        client = DDEXClient(retry_delay=0)
        with pytest.raises(RateLimitError) as exc_info:
            client.validate(VALID_ERN_43_XML, version="4.3")
        
        assert exc_info.value.retry_after == 60
        assert exc_info.value.limit is None
        assert exc_info.value.remaining is None
    
    def test_session_retry_strategy_excludes_429(self):
        """urllib3 retries 5xx only, with jitter, and never 429"""
        client = DDEXClient(retry_delay=0.5)
        retry = client.session.get_adapter("https://api.ddex-workbench.org").max_retries
        assert 429 not in retry.status_forcelist
        assert set(retry.status_forcelist) == {500, 502, 503, 504}
        assert retry.backoff_factor == 0.5
        assert retry.backoff_jitter == 0.5
        assert "POST" in retry.allowed_methods
    
    @responses.activate
    def test_client_error_message_from_error_object(self):
        """Other 4xx errors use error.message when error is an object"""
        responses.add(
            responses.POST,
            "https://api.ddex-workbench.org/v1/validate",
            json={"error": {"message": "XML content is required"}},
            status=400
        )
        
        client = DDEXClient()
        with pytest.raises(APIError) as exc_info:
            client.validate("", version="4.3")
        
        assert exc_info.value.message == "XML content is required"
    
    @responses.activate
    def test_server_error(self):
        """Test server error"""
        # Register the response multiple times to handle retries
        for _ in range(5):  # Register 5 times to handle retries
            responses.add(
                responses.POST,
                "https://api.ddex-workbench.org/v1/validate",
                json={"error": "Internal server error"},
                status=500
            )
        
        client = DDEXClient(retry_delay=0)
        with pytest.raises((ServerError, NetworkError)):
            client.validate(VALID_ERN_43_XML, version="4.3")
    
    @pytest.mark.parametrize("base_url", [
        "https://api.ddex-workbench.org/v1",
        "https://api.ddex-workbench.org/v1/",
        "http://127.0.0.1:5001/ddex-workbench/us-central1/app",
        "http://127.0.0.1:5001/ddex-workbench/us-central1/app/",
    ])
    @pytest.mark.parametrize("endpoint", ["validate", "/validate"])
    def test_build_url_keeps_base_path(self, base_url, endpoint):
        """urljoin must not drop the last segment of the base URL (/v1, /app)"""
        client = DDEXClient(base_url=base_url)
        assert client._build_url(endpoint) == base_url.rstrip("/") + "/validate"
    
    @responses.activate
    def test_validate_against_emulator_base_url(self):
        """Requests go to {base_url}/validate for an emulator-style base URL"""
        base_url = "http://127.0.0.1:5001/ddex-workbench/us-central1/app"
        responses.add(
            responses.POST,
            base_url + "/validate",
            json={"valid": True, "errors": [], "warnings": [], "metadata": {}},
            status=200
        )
        
        client = DDEXClient(base_url=base_url)
        result = client.validate(VALID_ERN_43_XML, version="4.3")
        
        assert result.valid is True
        assert responses.calls[0].request.url == base_url + "/validate"
    
    @responses.activate
    def test_health_check(self):
        """Test health check endpoint"""
        responses.add(
            responses.GET,
            "https://api.ddex-workbench.org/v1/health",
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
            "https://api.ddex-workbench.org/v1/formats",
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
            "https://api.ddex-workbench.org/v1/validate",
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

@pytest.fixture(autouse=True)
def _reset_deprecation_warnings():
    """Each test sees one-time deprecation warnings afresh"""
    from ddex_workbench import _deprecation
    _deprecation._reset_for_tests()
    yield
    _deprecation._reset_for_tests()


KEY_DEPRECATION = r"isn't supported from the SDK.*ddex-workbench\.org/api-keys.*removed in 2\.0"


class TestApiKeys:
    """Deprecated key methods still call /keys and parse the server's shapes"""

    BASE = "https://api.ddex-workbench.org/v1"

    @responses.activate
    def test_list_api_keys(self):
        responses.add(
            responses.GET,
            f"{self.BASE}/keys",
            json=[{
                "id": "k1",
                "name": "CI",
                "userId": "u1",
                "created": "2026-11-01T00:00:00.000Z",
                "lastUsed": None,
                "requestCount": 12,
                "rateLimit": 60,
                "active": True
            }],
            status=200
        )

        with pytest.warns(DeprecationWarning, match=KEY_DEPRECATION):
            keys = DDEXClient().list_api_keys()

        assert responses.calls[0].request.url == f"{self.BASE}/keys"
        assert len(keys) == 1
        assert keys[0].id == "k1"
        assert keys[0].created_at == "2026-11-01T00:00:00.000Z"
        assert keys[0].request_count == 12
        assert keys[0].rate_limit == 60

    @responses.activate
    def test_create_api_key(self):
        responses.add(
            responses.POST,
            f"{self.BASE}/keys",
            json={
                "id": "k2",
                "name": "New key",
                "key": "ddex_abc",
                "created": "2026-11-18T00:00:00.000Z",
                "rateLimit": 60
            },
            status=200
        )

        with pytest.warns(DeprecationWarning, match=KEY_DEPRECATION):
            key = DDEXClient().create_api_key("New key")

        assert json.loads(responses.calls[0].request.body) == {"name": "New key"}
        assert key.key == "ddex_abc"
        assert key.created_at == "2026-11-18T00:00:00.000Z"

    @responses.activate
    def test_delete_api_key_handles_204(self):
        responses.add(responses.DELETE, f"{self.BASE}/keys/k1", status=204)

        with pytest.warns(DeprecationWarning, match=KEY_DEPRECATION):
            assert DDEXClient().delete_api_key("k1") is True
        assert responses.calls[0].request.url == f"{self.BASE}/keys/k1"


    @responses.activate
    def test_key_method_warns_only_once(self):
        responses.add(responses.GET, f"{self.BASE}/keys", json=[], status=200)
        client = DDEXClient()

        with warnings.catch_warnings(record=True) as caught:
            warnings.simplefilter("always")
            client.list_api_keys()
            client.list_api_keys()

        assert [str(w.message) for w in caught if w.category is DeprecationWarning] == [
            "list_api_keys() is deprecated: API key management requires a signed-in session and "
            "isn't supported from the SDK. Manage keys at https://ddex-workbench.org/api-keys. "
            "These methods will be removed in 2.0."
        ]


class TestDeprecatedProfiles:
    """Classical, Ringtone and DJ still work but emit a DeprecationWarning"""

    URL = "https://api.ddex-workbench.org/v1/validate"
    OK = {"valid": True, "errors": [], "warnings": [], "metadata": {}}

    @responses.activate
    @pytest.mark.parametrize("profile", [
        ERNProfile.CLASSICAL, ERNProfile.RINGTONE, ERNProfile.DJ, "Classical", "Ringtone", "DJ"
    ])
    def test_deprecated_profile_warns(self, profile):
        responses.add(responses.POST, self.URL, json=self.OK, status=200)

        with pytest.warns(DeprecationWarning, match="doesn't support it.*removed in 2.0"):
            DDEXClient().validate(VALID_ERN_43_XML, version="4.3", profile=profile)

        # Still sent as the plain string value
        assert json.loads(responses.calls[0].request.body)["profile"] == getattr(profile, "value", profile)

    @responses.activate
    @pytest.mark.parametrize("profile", [ERNProfile.AUDIO_ALBUM, "AudioSingle", "ReleaseByRelease"])
    def test_supported_profile_does_not_warn(self, profile):
        responses.add(responses.POST, self.URL, json=self.OK, status=200)

        with warnings.catch_warnings():
            warnings.simplefilter("error", DeprecationWarning)
            DDEXClient().validate(VALID_ERN_43_XML, version="4.3", profile=profile)

    def test_members_still_exist(self):
        assert ERNProfile.CLASSICAL.value == "Classical"
        assert ERNProfile.RINGTONE.value == "Ringtone"
        assert ERNProfile.DJ.value == "DJ"


class TestProfileComplianceDeprecation:
    """get_profile_compliance() warns once and still returns a summary"""

    @responses.activate
    def test_warns_once(self):
        responses.add(
            responses.POST,
            "https://api.ddex-workbench.org/v1/validate",
            json={"valid": True, "errors": [], "warnings": [], "metadata": {}},
            status=200
        )
        client = DDEXClient()

        with warnings.catch_warnings(record=True) as caught:
            warnings.simplefilter("always")
            summary = client.validator.get_profile_compliance(VALID_ERN_43_XML, "4.3", "AudioAlbum")
            client.validator.get_profile_compliance(VALID_ERN_43_XML, "4.3", "AudioAlbum")

        messages = [str(w.message) for w in caught if w.category is DeprecationWarning]
        assert len(messages) == 1
        assert messages[0].startswith("get_profile_compliance() is deprecated")
        assert "removed in 2.0" in messages[0]
        assert summary.schematron_errors == 0
