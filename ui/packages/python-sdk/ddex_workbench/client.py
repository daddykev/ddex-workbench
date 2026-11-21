# packages/python-sdk/ddex_workbench/client.py
"""
DDEX Workbench API Client

Main client for interacting with the DDEX Workbench API.
"""

import json
import platform
import time
import warnings as _warnings  # validate() has a local named "warnings"
from typing import Any, Dict, List, Optional, Tuple
from urllib.parse import urljoin

import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

from ._deprecation import KEY_MANAGEMENT_DEPRECATION, warn_deprecated_once
from .errors import (
    APIError,
    AuthenticationError,
    DDEXError,
    NetworkError,
    NotFoundError,
    RateLimitError,
    ServerError,
    TimeoutError,
    ValidationError,
)
from .types import (
    DEPRECATED_PROFILES,
    ApiKey,
    HealthStatus,
    PassedRule,
    SupportedFormats,
    ValidationError as ValidationErrorDetail,
    ValidationOptions,
    ValidationResult,
    ValidationSummary,
    ValidationWarning,
)


class DDEXClient:
    """
    Client for DDEX Workbench API
    
    Provides methods to validate DDEX documents and interact with the API.
    """
    
    DEFAULT_BASE_URL = "https://api.ddex-workbench.org/v1"
    DEFAULT_TIMEOUT = 30
    DEFAULT_MAX_RETRIES = 3
    DEFAULT_RETRY_DELAY = 1.0
    
    def __init__(
        self,
        api_key: Optional[str] = None,
        base_url: Optional[str] = None,
        timeout: int = DEFAULT_TIMEOUT,
        max_retries: int = DEFAULT_MAX_RETRIES,
        retry_delay: float = DEFAULT_RETRY_DELAY,
        verify_ssl: bool = True
    ):
        """
        Initialize DDEX client
        
        Args:
            api_key: Optional API key for authentication
            base_url: Base URL for API (defaults to production)
            timeout: Request timeout in seconds
            max_retries: Maximum number of retries for failed requests
            retry_delay: Initial delay between retries (exponential backoff)
            verify_ssl: Whether to verify SSL certificates
        """
        self.api_key = api_key
        self.base_url = (base_url or self.DEFAULT_BASE_URL).rstrip('/')
        self.timeout = timeout
        self.max_retries = max_retries
        self.retry_delay = retry_delay
        self.verify_ssl = verify_ssl
        
        # Setup session with retry strategy
        self.session = requests.Session()
        self._setup_session()
        
        # Create validator helper - import here to avoid circular import
        from .validator import DDEXValidator
        self.validator = DDEXValidator(self)
    
    def _setup_session(self):
        """Setup session with retry strategy and headers"""
        # Retry connection errors and 5xx responses with exponential backoff
        # (retry_delay * 2^n) plus random jitter. 429 is deliberately not in
        # status_forcelist: rate-limited requests fail fast with RateLimitError.
        # raise_on_status=False returns the last 5xx response once retries are
        # exhausted, so _request raises ServerError instead of a generic error.
        retry_strategy = Retry(
            total=self.max_retries,
            backoff_factor=self.retry_delay,
            backoff_jitter=self.retry_delay,
            status_forcelist=[500, 502, 503, 504],
            allowed_methods=["GET", "POST", "PUT", "DELETE"],
            respect_retry_after_header=False,
            raise_on_status=False,
        )
        
        adapter = HTTPAdapter(max_retries=retry_strategy)
        self.session.mount("http://", adapter)
        self.session.mount("https://", adapter)
        
        # Set default headers
        self.session.headers.update({
            "Content-Type": "application/json",
            "Accept": "application/json",
            "User-Agent": self._get_user_agent()
        })
        
        # Add API key if provided
        if self.api_key:
            self.session.headers["X-API-Key"] = self.api_key
    
    def _get_user_agent(self) -> str:
        """Generate User-Agent string"""
        from . import __version__
        python_version = platform.python_version()
        system = platform.system()
        return f"ddex-workbench-python/{__version__} (Python/{python_version}; {system})"
    
    def set_api_key(self, api_key: Optional[str]) -> None:
        """
        Dynamically set or update API key
        
        Args:
            api_key: New API key or None to clear
        """
        self.api_key = api_key
        if api_key:
            self.session.headers["X-API-Key"] = api_key
        else:
            self.session.headers.pop("X-API-Key", None)
    
    def clear_api_key(self) -> None:
        """Clear API key from client"""
        self.set_api_key(None)
    
    def get_config(self) -> Dict[str, Any]:
        """
        Get current client configuration
        
        Returns:
            Dictionary with current configuration
        """
        return {
            "base_url": self.base_url,
            "api_key": "***" + self.api_key[-4:] if self.api_key else None,
            "timeout": self.timeout,
            "max_retries": self.max_retries,
            "retry_delay": self.retry_delay,
            "verify_ssl": self.verify_ssl,
            "user_agent": self._get_user_agent()
        }
    
    def _build_url(self, endpoint: str) -> str:
        """
        Build the full URL for an endpoint.

        urljoin replaces the last path segment of a base URL that doesn't end
        with "/", so ".../v1" + "validate" would become ".../validate". Always
        join against the base URL with a trailing slash.
        """
        return urljoin(self.base_url.rstrip('/') + '/', endpoint.lstrip('/'))

    @staticmethod
    def _int_or_none(value: Any) -> Optional[int]:
        """Convert a header or JSON value to int, or None if it isn't numeric"""
        try:
            return int(float(value))
        except (TypeError, ValueError):
            return None

    @staticmethod
    def _error_body(response: requests.Response) -> Dict[str, Any]:
        """Return the "error" object from an API error response, or {}"""
        try:
            data = response.json()
        except ValueError:
            return {}
        if isinstance(data, dict):
            error = data.get('error')
            if isinstance(error, dict):
                return error
            if isinstance(error, str):
                return {'message': error}
        return {}

    def _request(
        self,
        method: str,
        endpoint: str,
        **kwargs
    ) -> Any:
        """
        Make HTTP request to API
        
        Args:
            method: HTTP method
            endpoint: API endpoint
            **kwargs: Additional request arguments
            
        Returns:
            Response JSON data
            
        Raises:
            Various DDEXError subclasses based on response
        """
        url = self._build_url(endpoint)
        
        # Set timeout if not provided
        if 'timeout' not in kwargs:
            kwargs['timeout'] = self.timeout
        
        # Set SSL verification
        kwargs['verify'] = self.verify_ssl
        
        try:
            response = self.session.request(method, url, **kwargs)
            
            # Handle rate limiting. Never retried automatically: retry_after
            # comes from the body's error.retryAfter, then the Retry-After
            # header, then 60 seconds.
            if response.status_code == 429:
                error = self._error_body(response)
                headers = response.headers
                retry_after = self._int_or_none(error.get('retryAfter'))
                if retry_after is None:
                    retry_after = self._int_or_none(headers.get('Retry-After'))
                if retry_after is None:
                    retry_after = 60

                raise RateLimitError(
                    message=error.get('message') or "Rate limit exceeded",
                    retry_after=retry_after,
                    limit=self._int_or_none(headers.get('RateLimit-Limit')),
                    remaining=self._int_or_none(headers.get('RateLimit-Remaining')),
                    reset=self._int_or_none(headers.get('RateLimit-Reset')),
                    policy=headers.get('RateLimit-Policy'),
                )
            
            # Handle authentication errors
            if response.status_code == 401:
                raise AuthenticationError(
                    self._error_body(response).get('message') or "Invalid or missing API key"
                )
            
            # Handle not found
            if response.status_code == 404:
                raise NotFoundError(f"Resource not found: {endpoint}")
            
            # Handle server errors
            if response.status_code >= 500:
                raise ServerError(
                    f"Server error: {response.status_code}",
                    status_code=response.status_code
                )
            
            # Handle other client errors
            if response.status_code >= 400:
                error = self._error_body(response)
                message = error.get('message') or f"API error: {response.status_code}"
                code = error.get('code')
                
                raise APIError(
                    message,
                    status_code=response.status_code,
                    endpoint=endpoint,
                    method=method,
                    response_body=response.text,
                    code=code if isinstance(code, str) and code else None
                )
            
            # Parse successful response (204 No Content, e.g. DELETE /keys/:id, has no body)
            if response.status_code == 204 or not response.content:
                return {}
            try:
                return response.json()
            except json.JSONDecodeError as e:
                raise DDEXError(f"Invalid JSON response: {e}")
            
        except requests.exceptions.Timeout:
            raise TimeoutError(f"Request timed out after {kwargs.get('timeout', self.timeout)} seconds")
        except requests.exceptions.ConnectionError as e:
            raise NetworkError(f"Connection error: {e}", original_error=e)
        except requests.exceptions.RequestException as e:
            if isinstance(e, requests.exceptions.HTTPError):
                raise APIError(str(e), status_code=e.response.status_code if e.response else 0)
            raise NetworkError(f"Request failed: {e}", original_error=e)
    
    def validate(
        self,
        content: str,
        version: str,
        profile: Optional[str] = None,
        options: Optional[ValidationOptions] = None
    ) -> ValidationResult:
        """
        Validate DDEX content
        
        Args:
            content: XML content to validate
            version: ERN version (e.g., "4.3", "4.2", "3.8.3", "3.8.2")
            profile: Optional profile (e.g., "AudioAlbum")
            options: Optional validation options
            
        Returns:
            ValidationResult with errors, warnings, and metadata
            
        Raises:
            ValidationError: If validation request fails
            RateLimitError: If rate limit exceeded
            AuthenticationError: If authentication fails
        """
        payload = {
            "content": content,
            "type": "ERN",
            "version": version
        }
        
        if profile:
            profile_value = getattr(profile, "value", profile)
            if profile_value in DEPRECATED_PROFILES:
                _warnings.warn(
                    f"The {profile_value!r} profile is deprecated: the DDEX Workbench API doesn't "
                    "support it, and it will be removed in 2.0. Supported profiles are AudioAlbum, "
                    "AudioSingle, Video and Mixed (plus ReleaseByRelease for ERN 3.8.2 and 3.8.3).",
                    DeprecationWarning,
                    stacklevel=2,
                )
            payload["profile"] = profile_value
        
        # Add options if provided. verbose, include_passed_rules, custom_rules
        # and max_errors are deprecated: the API doesn't support them, so they
        # aren't sent.
        if options:
            if options.generate_svrl:
                payload["generateSVRL"] = True
        
        response = self._request("POST", "/validate", json=payload)
        
        # Parse errors
        errors = [
            self._parse_error(e) for e in response.get("errors", [])
        ]
        
        # Parse warnings (may be separate from errors)
        warnings = [
            self._parse_warning(w) for w in response.get("warnings", [])
        ]
        
        # Parse passed rules if present
        passed_rules = None
        if "passedRules" in response:
            passed_rules = [
                PassedRule(**rule) for rule in response["passedRules"]
            ]
        
        # Parse summary if present
        summary = None
        if "summary" in response:
            summary = ValidationSummary(**response["summary"])
        
        return ValidationResult(
            valid=response["valid"],
            errors=errors,
            warnings=warnings,
            metadata=response.get("metadata", {}),
            svrl=response.get("svrl"),
            passed_rules=passed_rules,
            summary=summary
        )
    
    def validate_with_svrl(
        self,
        content: str,
        version: str,
        profile: Optional[str] = None
    ) -> Tuple[ValidationResult, Optional[str]]:
        """
        Validate and automatically generate SVRL
        
        Args:
            content: XML content to validate
            version: ERN version
            profile: Optional profile
            
        Returns:
            Tuple of (ValidationResult, SVRL XML string)
        """
        options = ValidationOptions(generate_svrl=True)
        result = self.validate(content, version, profile, options)
        return result, result.svrl
    
    def _parse_error(self, error_data: Dict[str, Any]) -> ValidationErrorDetail:
        """Parse error from API response"""
        return ValidationErrorDetail(
            line=error_data.get("line", 0),
            column=error_data.get("column", 0),
            message=error_data.get("message", "Unknown error"),
            severity=error_data.get("severity", "error"),
            rule=error_data.get("rule"),
            context=error_data.get("context"),
            suggestion=error_data.get("suggestion"),
            xpath=error_data.get("xpath")
        )
    
    def _parse_warning(self, warning_data: Dict[str, Any]) -> ValidationWarning:
        """Parse warning from API response"""
        return ValidationWarning(
            line=warning_data.get("line", 0),
            column=warning_data.get("column", 0),
            message=warning_data.get("message", "Unknown warning"),
            rule=warning_data.get("rule"),
            context=warning_data.get("context")
        )
    
    def health(self) -> HealthStatus:
        """
        Check API health status
        
        Returns:
            HealthStatus object
        """
        response = self._request("GET", "/health")
        
        # Handle flexible response format
        return HealthStatus(
            status=response.get('status', 'unknown'),
            version=response.get('version', ''),
            timestamp=response.get('timestamp', ''),
            service=response.get('service'),  # Single service field
            services=response.get('services')  # Multiple services dict
        )
    
    def formats(self) -> SupportedFormats:
        """
        Get supported formats and versions
        
        Returns:
            SupportedFormats object
        """
        response = self._request("GET", "/formats")
        
        # Create result with flexible handling
        result = SupportedFormats()
        
        # Handle different possible response structures
        if 'formats' in response:
            result.formats = response['formats']
        if 'types' in response:
            result.types = response['types']
        if 'versions' in response:
            result.versions = response['versions']
        if 'profiles' in response:
            result.profiles = response['profiles']
        
        # If we got a types field but no formats, process it
        if not result.formats and result.types:
            if isinstance(result.types, list):
                result.formats = result.types
            elif isinstance(result.types, dict):
                result.formats = list(result.types.keys())
                for fmt, info in result.types.items():
                    if isinstance(info, dict):
                        if 'versions' in info:
                            result.versions[fmt] = info['versions']
                        if 'profiles' in info:
                            result.profiles[fmt] = info['profiles']
        
        return result
    
    def create_api_key(self, name: str) -> ApiKey:
        """
        Create new API key (requires authentication)
        
        .. deprecated:: 1.1.0
            API key management requires a signed-in session and isn't
            supported from the SDK. Manage keys at
            https://ddex-workbench.org/api-keys. Will be removed in 2.0.
            It still works if you set ``client.session.headers["Authorization"]
            = f"Bearer {firebase_id_token}"`` yourself.
        
        Args:
            name: Name/description for the API key
            
        Returns:
            ApiKey object with new key
            
        Raises:
            AuthenticationError: If not authenticated
        """
        warn_deprecated_once("create_api_key()", KEY_MANAGEMENT_DEPRECATION)
        response = self._request("POST", "/keys", json={"name": name})
        return ApiKey.from_api(response)
    
    def list_api_keys(self) -> List[ApiKey]:
        """
        List all API keys (requires authentication)
        
        .. deprecated:: 1.1.0
            API key management requires a signed-in session and isn't
            supported from the SDK. Manage keys at
            https://ddex-workbench.org/api-keys. Will be removed in 2.0.
            It still works if you set ``client.session.headers["Authorization"]
            = f"Bearer {firebase_id_token}"`` yourself.
        
        Returns:
            List of ApiKey objects
            
        Raises:
            AuthenticationError: If not authenticated
        """
        warn_deprecated_once("list_api_keys()", KEY_MANAGEMENT_DEPRECATION)
        response = self._request("GET", "/keys")
        # The API returns a bare list; accept {"keys": [...]} too
        keys = response.get("keys", []) if isinstance(response, dict) else response
        return [ApiKey.from_api(key) for key in keys]
    
    def delete_api_key(self, key_id: str) -> bool:
        """
        Delete (revoke) an API key (requires authentication)
        
        .. deprecated:: 1.1.0
            API key management requires a signed-in session and isn't
            supported from the SDK. Manage keys at
            https://ddex-workbench.org/api-keys. Will be removed in 2.0.
            It still works if you set ``client.session.headers["Authorization"]
            = f"Bearer {firebase_id_token}"`` yourself.
        
        Args:
            key_id: ID of the key to delete
            
        Returns:
            True if deleted successfully
            
        Raises:
            AuthenticationError: If not authenticated
            NotFoundError: If key not found
        """
        warn_deprecated_once("delete_api_key()", KEY_MANAGEMENT_DEPRECATION)
        self._request("DELETE", f"/keys/{key_id}")
        return True
    
    def __enter__(self):
        """Context manager entry"""
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit - close session"""
        self.close()
    
    def close(self):
        """Close the session"""
        if hasattr(self, 'session'):
            self.session.close()