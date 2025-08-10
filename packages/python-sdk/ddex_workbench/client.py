# packages/python-sdk/ddex_workbench/client.py
"""DDEX Workbench API Client"""

import time
from typing import Optional, Dict, Any, BinaryIO, Union, List
from pathlib import Path
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

from .errors import (
    DDEXError, 
    RateLimitError, 
    AuthenticationError,
    NotFoundError,
    ValidationError as ValidationErrorException,
    create_error_from_response
)
from .types import (
    ValidationResult, 
    ValidationOptions, 
    SupportedFormats, 
    HealthStatus,
    ApiKey
)
from .validator import DDEXValidator


class DDEXClient:
    """
    DDEX Workbench API Client
    
    Example:
        >>> from ddex_workbench import DDEXClient
        >>> client = DDEXClient(api_key="ddex_your-api-key")
        >>> result = client.validate(xml_content, version="4.3", profile="AudioAlbum")
        >>> print(f"Valid: {result.valid}")
    """
    
    DEFAULT_BASE_URL = "https://api.ddex-workbench.org/v1"
    DEFAULT_TIMEOUT = 30
    DEFAULT_MAX_RETRIES = 3
    DEFAULT_RETRY_DELAY = 1.0
    
    def __init__(
        self,
        api_key: Optional[str] = None,
        base_url: str = DEFAULT_BASE_URL,
        timeout: int = DEFAULT_TIMEOUT,
        max_retries: int = DEFAULT_MAX_RETRIES,
        retry_delay: float = DEFAULT_RETRY_DELAY,
        verify_ssl: bool = True
    ):
        """
        Initialize DDEX Client
        
        Args:
            api_key: Optional API key for higher rate limits
            base_url: API base URL
            timeout: Request timeout in seconds
            max_retries: Maximum number of retry attempts
            retry_delay: Initial delay between retries (exponential backoff)
            verify_ssl: Verify SSL certificates
        """
        self.api_key = api_key
        self.base_url = base_url.rstrip('/')
        self.timeout = timeout
        self.max_retries = max_retries
        self.retry_delay = retry_delay
        self.verify_ssl = verify_ssl
        
        # Create session with retry strategy
        self.session = self._create_session()
        
        # Create validator instance
        self.validator = DDEXValidator(self)
    
    def _create_session(self) -> requests.Session:
        """Create and configure requests session with retry strategy"""
        session = requests.Session()
        
        # Configure retries
        retry_strategy = Retry(
            total=self.max_retries,
            backoff_factor=self.retry_delay,
            status_forcelist=[500, 502, 503, 504],
            allowed_methods=["GET", "POST", "DELETE"]
        )
        adapter = HTTPAdapter(max_retries=retry_strategy)
        session.mount("http://", adapter)
        session.mount("https://", adapter)
        
        # Set default headers
        session.headers.update({
            "Content-Type": "application/json",
            "User-Agent": f"ddex-workbench-python-sdk/{self._get_version()}"
        })
        
        if self.api_key:
            session.headers["X-API-Key"] = self.api_key
        
        session.verify = self.verify_ssl
        
        return session
    
    def validate(
        self,
        content: str,
        version: str,
        profile: Optional[str] = None,
        mode: Optional[str] = None,
        strict: bool = False
    ) -> ValidationResult:
        """
        Validate DDEX XML content
        
        Args:
            content: XML content as string
            version: ERN version (e.g., "4.3", "4.2", "3.8.2")
            profile: Optional profile (e.g., "AudioAlbum", "AudioSingle")
            mode: Validation mode ("full", "quick", "xsd", "business")
            strict: Treat warnings as errors
            
        Returns:
            ValidationResult object with errors and metadata
            
        Example:
            >>> result = client.validate(xml_content, version="4.3")
            >>> if not result.valid:
            ...     for error in result.errors:
            ...         print(f"Line {error.line}: {error.message}")
        """
        payload = {
            "content": content,
            "type": "ERN",
            "version": version
        }
        
        if profile:
            payload["profile"] = profile
        if mode:
            payload["mode"] = mode
        if strict:
            payload["strict"] = strict
        
        response = self._post("/api/validate", json=payload)
        return ValidationResult.from_dict(response)
    
    def validate_file(
        self,
        file_path: Union[str, Path, BinaryIO],
        version: str,
        profile: Optional[str] = None,
        mode: Optional[str] = None
    ) -> ValidationResult:
        """
        Validate DDEX XML file
        
        Args:
            file_path: Path to XML file or file-like object
            version: ERN version
            profile: Optional profile
            mode: Optional validation mode
            
        Returns:
            ValidationResult object
            
        Example:
            >>> result = client.validate_file("release.xml", version="4.3")
            >>> print(f"Valid: {result.valid}")
        """
        if isinstance(file_path, str):
            file_path = Path(file_path)
        
        if isinstance(file_path, Path):
            if not file_path.exists():
                raise FileNotFoundError(f"File not found: {file_path}")
            
            with open(file_path, 'rb') as f:
                files = {'file': (file_path.name, f, 'text/xml')}
                data = {
                    'type': 'ERN',
                    'version': version
                }
                if profile:
                    data['profile'] = profile
                if mode:
                    data['mode'] = mode
                
                # Note: Don't use json parameter with files
                response = self._post("/api/validate/file", files=files, data=data)
        else:
            # File-like object
            files = {'file': ('document.xml', file_path, 'text/xml')}
            data = {
                'type': 'ERN',
                'version': version
            }
            if profile:
                data['profile'] = profile
            if mode:
                data['mode'] = mode
            
            response = self._post("/api/validate/file", files=files, data=data)
        
        return ValidationResult.from_dict(response)
    
    def validate_url(
        self,
        url: str,
        version: str,
        profile: Optional[str] = None
    ) -> ValidationResult:
        """
        Validate XML from URL
        
        Args:
            url: URL to XML file
            version: ERN version
            profile: Optional profile
            
        Returns:
            ValidationResult object
            
        Example:
            >>> result = client.validate_url("https://example.com/release.xml", version="4.3")
        """
        # Fetch XML content
        try:
            response = requests.get(url, timeout=self.timeout)
            response.raise_for_status()
        except requests.RequestException as e:
            raise DDEXError(f"Failed to fetch XML from URL: {str(e)}")
        
        return self.validate(response.text, version, profile)
    
    def get_supported_formats(self) -> SupportedFormats:
        """
        Get supported DDEX formats and versions
        
        Returns:
            SupportedFormats object with version information
        """
        response = self._get("/api/formats")
        return SupportedFormats.from_dict(response)
    
    def check_health(self) -> HealthStatus:
        """
        Check API health status
        
        Returns:
            HealthStatus object
        """
        response = self._get("/api/health")
        return HealthStatus.from_dict(response)
    
    def list_api_keys(self, auth_token: str) -> List[ApiKey]:
        """
        List API keys for authenticated user
        
        Args:
            auth_token: Firebase auth token
            
        Returns:
            List of ApiKey objects
        """
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = self._get("/api/keys", headers=headers)
        return [ApiKey.from_dict(key) for key in response]
    
    def create_api_key(self, name: str, auth_token: str) -> ApiKey:
        """
        Create new API key
        
        Args:
            name: Friendly name for the key
            auth_token: Firebase auth token
            
        Returns:
            ApiKey object (includes the key value only on creation)
        """
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = self._post("/api/keys", json={"name": name}, headers=headers)
        return ApiKey.from_dict(response)
    
    def revoke_api_key(self, key_id: str, auth_token: str) -> None:
        """
        Revoke API key
        
        Args:
            key_id: API key ID to revoke
            auth_token: Firebase auth token
        """
        headers = {"Authorization": f"Bearer {auth_token}"}
        self._delete(f"/api/keys/{key_id}", headers=headers)
    
    def set_api_key(self, api_key: str) -> None:
        """Update API key for this client instance"""
        self.api_key = api_key
        self.session.headers["X-API-Key"] = api_key
    
    def clear_api_key(self) -> None:
        """Remove API key from this client instance"""
        self.api_key = None
        self.session.headers.pop("X-API-Key", None)
    
    # Private methods
    def _get(self, path: str, headers: Optional[Dict] = None, **kwargs) -> Any:
        """Internal GET request"""
        return self._request("GET", path, headers=headers, **kwargs)
    
    def _post(self, path: str, headers: Optional[Dict] = None, **kwargs) -> Any:
        """Internal POST request"""
        return self._request("POST", path, headers=headers, **kwargs)
    
    def _delete(self, path: str, headers: Optional[Dict] = None, **kwargs) -> None:
        """Internal DELETE request"""
        self._request("DELETE", path, headers=headers, **kwargs)
    
    def _request(
        self,
        method: str,
        path: str,
        headers: Optional[Dict] = None,
        **kwargs
    ) -> Optional[Any]:
        """
        Make HTTP request with error handling
        
        Args:
            method: HTTP method
            path: API path
            headers: Optional additional headers
            **kwargs: Additional request parameters
            
        Returns:
            Response data or None
            
        Raises:
            DDEXError: On API errors
            RateLimitError: On rate limiting
        """
        url = f"{self.base_url}{path}"
        
        # Merge headers
        if headers:
            request_headers = dict(self.session.headers)
            request_headers.update(headers)
            kwargs["headers"] = request_headers
        
        # Set timeout
        kwargs.setdefault("timeout", self.timeout)
        
        try:
            response = self.session.request(method, url, **kwargs)
            
            # Handle rate limiting
            if response.status_code == 429:
                retry_after = response.headers.get("Retry-After", "60")
                raise RateLimitError(
                    f"Rate limit exceeded. Retry after {retry_after} seconds",
                    retry_after=int(retry_after) if retry_after.isdigit() else 60
                )
            
            # Handle authentication errors
            if response.status_code == 401:
                raise AuthenticationError("Authentication required or invalid API key")
            
            # Handle not found
            if response.status_code == 404:
                raise NotFoundError(f"Resource not found: {path}")
            
            # Raise for other HTTP errors
            response.raise_for_status()
            
            # Return JSON response if available
            if response.text and response.status_code != 204:
                return response.json()
            return None
            
        except requests.exceptions.RequestException as e:
            # Convert requests exceptions to our custom exceptions
            if not isinstance(e, (DDEXError, RateLimitError, AuthenticationError, NotFoundError)):
                raise create_error_from_response(e)
            raise
    
    def _get_version(self) -> str:
        """Get SDK version"""
        try:
            from . import __version__
            return __version__
        except ImportError:
            return "1.0.0"
    
    def __enter__(self):
        """Context manager support"""
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        """Clean up session on exit"""
        self.session.close()