# packages/python-sdk/ddex_workbench/types.py
"""Type definitions for DDEX Workbench SDK"""

from dataclasses import dataclass, field
from typing import List, Optional, Dict, Any, Union
from datetime import datetime
from enum import Enum


class ERNVersion(str, Enum):
    """Supported ERN versions"""
    V382 = "3.8.2"
    V42 = "4.2"
    V43 = "4.3"


class ERNProfile(str, Enum):
    """Supported ERN profiles"""
    AUDIO_ALBUM = "AudioAlbum"
    AUDIO_SINGLE = "AudioSingle"
    VIDEO = "Video"
    MIXED = "Mixed"
    CLASSICAL = "Classical"
    RINGTONE = "Ringtone"
    DJ = "DJ"
    RELEASE_BY_RELEASE = "ReleaseByRelease"


@dataclass
class ValidationError:
    """Validation error detail"""
    line: int
    column: int
    message: str
    severity: str = "error"
    rule: Optional[str] = None
    context: Optional[str] = None
    suggestion: Optional[str] = None
    xpath: Optional[str] = None


@dataclass
class ValidationWarning:
    """Validation warning (distinct from error)"""
    line: int
    column: int
    message: str
    rule: Optional[str] = None
    context: Optional[str] = None


@dataclass
class PassedRule:
    """Successfully passed validation rule"""
    rule: str
    test: str
    profile: Optional[str] = None
    description: Optional[str] = None


@dataclass
class ValidationSummary:
    """Validation compliance statistics"""
    total_rules: int
    passed_rules: int
    failed_rules: int
    pass_rate: float
    profile: Optional[str] = None
    schematron_errors: int = 0
    xsd_errors: int = 0
    business_rule_errors: int = 0


@dataclass
class SVRLStatistics:
    """SVRL report parsing results"""
    total_tests: int
    passed: int
    failed: int
    pass_rate: float
    errors_by_rule: Dict[str, int] = field(default_factory=dict)


@dataclass
class ValidationOptions:
    """Extended validation options"""
    generate_svrl: bool = False
    verbose: bool = False
    custom_rules: Optional[List[str]] = None
    include_passed_rules: bool = False
    max_errors: Optional[int] = None


@dataclass
class ValidationResult:
    """Validation result"""
    valid: bool
    errors: List[ValidationError]
    warnings: List[ValidationWarning]
    metadata: Dict[str, Any]
    svrl: Optional[str] = None
    passed_rules: Optional[List[PassedRule]] = None
    summary: Optional[ValidationSummary] = None


@dataclass
class BatchValidationResult:
    """Result of batch validation"""
    total_files: int
    valid_files: int
    invalid_files: int
    results: List[ValidationResult]
    processing_time: float


@dataclass
class HealthStatus:
    """API health status - flexible to handle different response formats"""
    status: str
    version: str
    timestamp: str
    service: Optional[str] = None  # Single service field
    services: Optional[Dict[str, bool]] = None  # Multiple services
    
    def __post_init__(self):
        """Handle both 'service' and 'services' fields"""
        if self.service and not self.services:
            # Convert single service to services dict
            self.services = {"api": self.service == "healthy"}


@dataclass
class SupportedFormats:
    """Supported formats and versions - flexible to handle API variations"""
    formats: List[str] = field(default_factory=list)
    versions: Dict[str, List[str]] = field(default_factory=dict)
    profiles: Dict[str, List[str]] = field(default_factory=dict)
    types: Optional[Dict[str, Any]] = None  # Additional types field from API
    
    def __post_init__(self):
        """Handle different API response formats"""
        # If types contains the actual format info, use it
        if self.types and not self.formats:
            if isinstance(self.types, list):
                self.formats = self.types
            elif isinstance(self.types, dict):
                # Extract formats from types dict
                self.formats = list(self.types.keys())
                # Try to extract versions
                for fmt, info in self.types.items():
                    if isinstance(info, dict) and 'versions' in info:
                        self.versions[fmt] = info['versions']


@dataclass
class ApiKey:
    """API key information"""
    id: str
    name: str
    created_at: str
    key: Optional[str] = None  # Only present when creating
    last_used: Optional[str] = None
    request_count: int = 0