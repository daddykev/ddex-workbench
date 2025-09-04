# packages/python-sdk/ddex_workbench/errors.py
"""
Error classes for DDEX Workbench SDK

Provides specialized exception classes for different error scenarios.
"""

from typing import Optional, List, Dict, Any


class DDEXError(Exception):
    """Base exception for all DDEX SDK errors"""
    
    def __init__(
        self,
        message: str,
        code: Optional[str] = None,
        status_code: Optional[int] = None,
        details: Optional[dict] = None
    ):
        super().__init__(message)
        self.message = message
        self.code = code or "DDEX_ERROR"
        self.status_code = status_code
        self.details = details or {}
    
    def __str__(self):
        if self.code:
            return f"[{self.code}] {self.message}"
        return self.message
    
    def __repr__(self):
        return f"{self.__class__.__name__}(message='{self.message}', code='{self.code}')"


class RateLimitError(DDEXError):
    """Rate limit exceeded error"""
    
    def __init__(
        self,
        message: str = "Rate limit exceeded",
        retry_after: Optional[int] = None,
        limit: Optional[int] = None,
        remaining: Optional[int] = None
    ):
        super().__init__(message, "RATE_LIMIT_EXCEEDED", 429)
        self.retry_after = retry_after
        self.limit = limit
        self.remaining = remaining
    
    def get_retry_message(self) -> str:
        """Get human-readable retry message"""
        if self.retry_after:
            return f"Please retry after {self.retry_after} seconds"
        return "Please retry later"


class ValidationError(DDEXError):
    """Validation failed error with error details"""
    
    def __init__(
        self,
        message: str = "Validation failed",
        errors: Optional[List[Any]] = None,  # Using Any to avoid circular import
        warnings: Optional[List[Any]] = None,
        validation_type: Optional[str] = None
    ):
        super().__init__(message, "VALIDATION_FAILED", 422)
        self.errors = errors or []
        self.warnings = warnings or []
        self.validation_type = validation_type
    
    def get_summary(self) -> str:
        """Get summary of validation errors"""
        error_count = len(self.errors)
        warning_count = len(self.warnings)
        return f"{error_count} error{'s' if error_count != 1 else ''}, {warning_count} warning{'s' if warning_count != 1 else ''}"
    
    def get_critical_count(self) -> int:
        """Get count of critical errors"""
        return sum(1 for e in self.errors if hasattr(e, 'severity') and e.severity == 'error')
    
    def get_first_error(self) -> Optional[Any]:
        """Get the first error if any"""
        return self.errors[0] if self.errors else None


class AuthenticationError(DDEXError):
    """Authentication required or failed"""
    
    def __init__(
        self,
        message: str = "Authentication required",
        auth_type: Optional[str] = None
    ):
        super().__init__(message, "AUTHENTICATION_REQUIRED", 401)
        self.auth_type = auth_type


class ApiKeyError(AuthenticationError):
    """API key invalid or expired"""
    
    def __init__(self, message: str = "Invalid or expired API key"):
        super().__init__(message, "API_KEY")
        self.code = "INVALID_API_KEY"


class NotFoundError(DDEXError):
    """Resource not found"""
    
    def __init__(
        self,
        message: str = "Resource not found",
        resource: Optional[str] = None
    ):
        super().__init__(message, "NOT_FOUND", 404)
        self.resource = resource


class NetworkError(DDEXError):
    """Network/connection error"""
    
    def __init__(
        self,
        message: str = "Network error occurred",
        original_error: Optional[Exception] = None,
        can_retry: bool = True
    ):
        super().__init__(message, "NETWORK_ERROR")
        self.original_error = original_error
        self.can_retry = can_retry
    
    def get_retry_message(self) -> str:
        """Get retry recommendation"""
        if self.can_retry:
            return "This is a temporary error. Please try again."
        return "This error requires investigation."


class TimeoutError(DDEXError):
    """Request timeout error"""
    
    def __init__(
        self,
        message: str = "Request timed out",
        timeout: Optional[float] = None
    ):
        super().__init__(message, "TIMEOUT", 408)
        self.timeout = timeout


class ServerError(DDEXError):
    """Server error (5xx responses)"""
    
    def __init__(
        self,
        message: str = "Server error occurred",
        status_code: int = 500
    ):
        super().__init__(message, "SERVER_ERROR", status_code)


class ParseError(DDEXError):
    """XML parsing error with location info"""
    
    def __init__(
        self,
        message: str,
        line: Optional[int] = None,
        column: Optional[int] = None,
        snippet: Optional[str] = None
    ):
        super().__init__(message, "PARSE_ERROR", 400)
        self.line = line
        self.column = column
        self.snippet = snippet
    
    def get_location(self) -> str:
        """Get error location as string"""
        if self.line and self.column:
            return f"Line {self.line}, Column {self.column}"
        elif self.line:
            return f"Line {self.line}"
        return "Unknown location"


class FileError(DDEXError):
    """File operation error"""
    
    def __init__(
        self,
        message: str,
        filepath: Optional[str] = None,
        operation: Optional[str] = None
    ):
        super().__init__(message, "FILE_ERROR")
        self.filepath = filepath
        self.operation = operation


class ConfigurationError(DDEXError):
    """Configuration error"""
    
    def __init__(
        self,
        message: str,
        config_key: Optional[str] = None,
        expected_value: Optional[str] = None
    ):
        super().__init__(message, "CONFIGURATION_ERROR")
        self.config_key = config_key
        self.expected_value = expected_value


class APIError(DDEXError):
    """API-specific error with status code"""
    
    def __init__(
        self,
        message: str,
        status_code: int,
        endpoint: Optional[str] = None,
        method: Optional[str] = None,
        response_body: Optional[str] = None
    ):
        super().__init__(message, "API_ERROR", status_code)
        self.endpoint = endpoint
        self.method = method
        self.response_body = response_body
    
    def get_summary(self) -> str:
        """Get error summary"""
        parts = [f"API Error {self.status_code}"]
        if self.method and self.endpoint:
            parts.append(f"{self.method} {self.endpoint}")
        parts.append(self.message)
        return " - ".join(parts)


class UnsupportedVersionError(DDEXError):
    """Unsupported DDEX version"""
    
    def __init__(
        self,
        version: str,
        supported_versions: Optional[List[str]] = None
    ):
        message = f"Unsupported DDEX version: {version}"
        if supported_versions:
            message += f". Supported versions: {', '.join(supported_versions)}"
        super().__init__(message, "UNSUPPORTED_VERSION", 400)
        self.version = version
        self.supported_versions = supported_versions or []


class ProfileError(DDEXError):
    """Invalid or unsupported profile"""
    
    def __init__(
        self,
        profile: str,
        version: Optional[str] = None,
        supported_profiles: Optional[List[str]] = None
    ):
        message = f"Invalid profile: {profile}"
        if version:
            message += f" for version {version}"
        if supported_profiles:
            message += f". Supported profiles: {', '.join(supported_profiles)}"
        super().__init__(message, "INVALID_PROFILE", 400)
        self.profile = profile
        self.version = version
        self.supported_profiles = supported_profiles or []