# packages/python-sdk/ddex_workbench/errors.py
"""Exception classes for DDEX Workbench SDK"""

from typing import Optional, Any, List
import requests


class DDEXError(Exception):
    """Base exception for all DDEX SDK errors"""
    
    def __init__(
        self,
        message: str,
        code: str = "DDEX_ERROR",
        status_code: Optional[int] = None,
        details: Optional[Any] = None
    ):
        super().__init__(message)
        self.message = message
        self.code = code
        self.status_code = status_code
        self.details = details
    
    def __str__(self):
        if self.status_code:
            return f"[{self.status_code}] {self.message}"
        return self.message
    
    def __repr__(self):
        return f"{self.__class__.__name__}(message='{self.message}', code='{self.code}', status_code={self.status_code})"


class RateLimitError(DDEXError):
    """Rate limit exceeded error"""
    
    def __init__(
        self,
        message: str = "Rate limit exceeded",
        retry_after: Optional[int] = None,
        limit: Optional[int] = None,
        remaining: Optional[int] = None,
        reset: Optional[str] = None
    ):
        super().__init__(message, "RATE_LIMIT_EXCEEDED", 429)
        self.retry_after = retry_after
        self.limit = limit
        self.remaining = remaining
        self.reset = reset
    
    def get_retry_message(self) -> str:
        """Get human-readable retry message"""
        if self.retry_after:
            return f"Please retry after {self.retry_after} seconds"
        return "Please retry later"


class ValidationError(DDEXError):
    """Validation failed error"""
    
    def __init__(
        self,
        message: str = "Validation failed",
        errors: Optional[List] = None,
        warnings: Optional[List] = None
    ):
        super().__init__(message, "VALIDATION_FAILED", 400)
        self.errors = errors or []
        self.warnings = warnings or []
    
    def get_summary(self) -> str:
        """Get summary of validation errors"""
        error_count = len(self.errors)
        warning_count = len(self.warnings)
        return f"{error_count} error{'s' if error_count != 1 else ''}, {warning_count} warning{'s' if warning_count != 1 else ''}"


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
        original_error: Optional[Exception] = None
    ):
        super().__init__(message, "NETWORK_ERROR")
        self.original_error = original_error


class TimeoutError(DDEXError):
    """Request timeout error"""
    
    def __init__(
        self,
        message: str = "Request timed out",
        timeout: Optional[float] = None
    ):
        super().__init__(message, "TIMEOUT")
        self.timeout = timeout


class ServerError(DDEXError):
    """Server error (5xx responses)"""
    
    def __init__(
        self,
        message: str = "Server error occurred",
        status_code: int = 500
    ):
        super().__init__(message, "SERVER_ERROR", status_code)


class InvalidRequestError(DDEXError):
    """Invalid request/parameters"""
    
    def __init__(
        self,
        message: str,
        field: Optional[str] = None
    ):
        super().__init__(message, "INVALID_REQUEST", 400)
        self.field = field


class FileError(DDEXError):
    """File-related errors"""
    
    def __init__(
        self,
        message: str,
        file_name: Optional[str] = None,
        file_size: Optional[int] = None,
        file_type: Optional[str] = None
    ):
        super().__init__(message, "FILE_ERROR", 400)
        self.file_name = file_name
        self.file_size = file_size
        self.file_type = file_type


class FileTooLargeError(FileError):
    """File too large error"""
    
    def __init__(
        self,
        file_size: int,
        max_size: int = 10485760,  # 10MB default
        file_name: Optional[str] = None
    ):
        message = f"File size ({self._format_bytes(file_size)}) exceeds maximum allowed size ({self._format_bytes(max_size)})"
        super().__init__(message, file_name, file_size)
        self.code = "FILE_TOO_LARGE"
        self.max_size = max_size
    
    @staticmethod
    def _format_bytes(bytes_size: int) -> str:
        """Format bytes to human readable string"""
        if bytes_size == 0:
            return "0 Bytes"
        
        k = 1024
        sizes = ["Bytes", "KB", "MB", "GB"]
        i = 0
        
        while bytes_size >= k and i < len(sizes) - 1:
            bytes_size /= k
            i += 1
        
        return f"{bytes_size:.2f} {sizes[i]}"


class UnsupportedFileTypeError(FileError):
    """Unsupported file type error"""
    
    def __init__(
        self,
        file_type: str,
        supported_types: Optional[List[str]] = None,
        file_name: Optional[str] = None
    ):
        supported_types = supported_types or [".xml"]
        message = f"File type '{file_type}' is not supported. Supported types: {', '.join(supported_types)}"
        super().__init__(message, file_name, file_type=file_type)
        self.code = "UNSUPPORTED_FILE_TYPE"
        self.supported_types = supported_types


class ConfigurationError(DDEXError):
    """Configuration error"""
    
    def __init__(
        self,
        message: str,
        config_key: Optional[str] = None
    ):
        super().__init__(message, "CONFIGURATION_ERROR")
        self.config_key = config_key


# Utility functions

def is_ddex_error(error: Any) -> bool:
    """Check if error is a DDEX SDK error"""
    return isinstance(error, DDEXError)


def is_retryable_error(error: Any) -> bool:
    """Check if error is retryable"""
    if isinstance(error, (NetworkError, TimeoutError)):
        return True
    
    if isinstance(error, ServerError) and error.status_code:
        # Retry on 502, 503, 504
        return error.status_code in [502, 503, 504]
    
    if isinstance(error, RateLimitError):
        # Rate limit errors are retryable after delay
        return True
    
    return False


def get_retry_delay(error: Any, attempt_number: int = 1) -> float:
    """Get retry delay for error in seconds"""
    if isinstance(error, RateLimitError) and error.retry_after:
        return float(error.retry_after)
    
    # Exponential backoff: 1s, 2s, 4s, 8s...
    base_delay = 1.0
    max_delay = 30.0  # 30 seconds max
    delay = min(base_delay * (2 ** (attempt_number - 1)), max_delay)
    
    # Add jitter to prevent thundering herd (0-1 second random)
    import random
    jitter = random.random()
    
    return delay + jitter


def create_error_from_response(error: Any) -> DDEXError:
    """Create appropriate DDEXError from requests exception"""
    if isinstance(error, requests.exceptions.Timeout):
        return TimeoutError("Request timed out", timeout=error.request.timeout if hasattr(error, 'request') else None)
    
    if isinstance(error, requests.exceptions.ConnectionError):
        return NetworkError("Connection error occurred", original_error=error)
    
    if isinstance(error, requests.exceptions.HTTPError):
        response = error.response
        status = response.status_code if response else None
        
        try:
            data = response.json() if response else {}
            message = data.get("error", {}).get("message", str(error))
        except:
            message = str(error)
        
        if status == 429:
            retry_after = response.headers.get("Retry-After") if response else None
            return RateLimitError(
                message,
                retry_after=int(retry_after) if retry_after and retry_after.isdigit() else None
            )
        
        if status == 401:
            return AuthenticationError(message)
        
        if status == 404:
            return NotFoundError(message)
        
        if status == 400:
            return InvalidRequestError(message)
        
        if status and 500 <= status < 600:
            return ServerError(message, status)
        
        return DDEXError(message, status_code=status)
    
    # Generic error
    return DDEXError(str(error))


def aggregate_errors(errors: List[Exception]) -> DDEXError:
    """Aggregate multiple errors into one"""
    if not errors:
        return DDEXError("No errors provided", "NO_ERRORS")
    
    if len(errors) == 1:
        return errors[0] if isinstance(errors[0], DDEXError) else DDEXError(str(errors[0]), "WRAPPED_ERROR")
    
    messages = [str(e) for e in errors]
    details = [
        {
            "type": type(e).__name__,
            "message": str(e),
            "code": e.code if isinstance(e, DDEXError) else None
        }
        for e in errors
    ]
    
    return DDEXError(
        f"Multiple errors occurred: {'; '.join(messages[:3])}{'...' if len(messages) > 3 else ''}",
        "MULTIPLE_ERRORS",
        details=details
    )