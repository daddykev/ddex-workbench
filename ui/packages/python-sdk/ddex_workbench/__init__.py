# packages/python-sdk/ddex_workbench/__init__.py
"""
DDEX Workbench SDK for Python

Official Python SDK for DDEX validation and processing tools.
"""

from .client import DDEXClient
from .validator import DDEXValidator
from .errors import (
    DDEXError,
    RateLimitError,
    ValidationError,
    AuthenticationError,
    NotFoundError,
    NetworkError,
    TimeoutError,
    ServerError,
    ParseError,
    FileError,
    ConfigurationError,
    APIError,
    UnsupportedVersionError,
    ProfileError
)
from .types import (
    ValidationResult,
    ValidationError as ValidationErrorDetail,
    ValidationWarning,
    ValidationOptions,
    ValidationSummary,
    PassedRule,
    BatchValidationResult,
    SVRLStatistics,
    ERNVersion,
    ERNProfile,
    SupportedFormats,
    HealthStatus,
    ApiKey
)

__version__ = "1.0.2"
__all__ = [
    # Client and Validator
    "DDEXClient",
    "DDEXValidator",
    
    # Error classes
    "DDEXError",
    "RateLimitError",
    "ValidationError",
    "AuthenticationError",
    "NotFoundError",
    "NetworkError",
    "TimeoutError",
    "ServerError",
    "ParseError",
    "FileError",
    "ConfigurationError",
    "APIError",
    "UnsupportedVersionError",
    "ProfileError",
    
    # Types
    "ValidationResult",
    "ValidationErrorDetail",
    "ValidationWarning",
    "ValidationOptions",
    "ValidationSummary",
    "PassedRule",
    "BatchValidationResult",
    "SVRLStatistics",
    "ERNVersion",
    "ERNProfile",
    "SupportedFormats",
    "HealthStatus",
    "ApiKey"
]