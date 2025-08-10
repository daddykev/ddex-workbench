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
    AuthenticationError
)
from .types import (
    ValidationResult,
    ValidationError as ValidationErrorDetail,
    ERNVersion,
    ERNProfile
)

__version__ = "1.0.0"
__all__ = [
    "DDEXClient",
    "DDEXValidator",
    "DDEXError",
    "RateLimitError",
    "ValidationError",
    "AuthenticationError",
    "ValidationResult",
    "ValidationErrorDetail",
    "ERNVersion",
    "ERNProfile"
]