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
    NotFoundError
)
from .types import (
    ValidationResult,
    ValidationError as ValidationErrorDetail,
    ERNVersion,
    ERNProfile,
    SupportedFormats,
    HealthStatus,
    ApiKey
)

__version__ = "1.0.1"
__all__ = [
    "DDEXClient",
    "DDEXValidator",
    "DDEXError",
    "RateLimitError",
    "ValidationError",
    "AuthenticationError",
    "NotFoundError",
    "ValidationResult",
    "ValidationErrorDetail",
    "ERNVersion",
    "ERNProfile",
    "SupportedFormats",
    "HealthStatus",
    "ApiKey"
]