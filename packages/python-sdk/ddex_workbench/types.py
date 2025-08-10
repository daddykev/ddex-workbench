# packages/python-sdk/ddex_workbench/types.py
"""Type definitions for DDEX Workbench SDK"""

from dataclasses import dataclass, field
from typing import List, Optional, Dict, Any, Literal
from datetime import datetime
from enum import Enum


# Enums
class ERNVersion(str, Enum):
    """Supported ERN versions"""
    V43 = "4.3"
    V42 = "4.2"
    V382 = "3.8.2"


class ERNProfile(str, Enum):
    """ERN validation profiles"""
    AUDIO_ALBUM = "AudioAlbum"
    AUDIO_SINGLE = "AudioSingle"
    VIDEO = "Video"
    MIXED = "Mixed"
    CLASSICAL = "Classical"
    RINGTONE = "Ringtone"
    DJ = "DJ"
    RELEASE_BY_RELEASE = "ReleaseByRelease"


class DDEXType(str, Enum):
    """DDEX document types"""
    ERN = "ERN"
    DSR = "DSR"


class ValidationMode(str, Enum):
    """Validation modes"""
    FULL = "full"
    QUICK = "quick"
    XSD = "xsd"
    BUSINESS = "business"


class Severity(str, Enum):
    """Error severity levels"""
    ERROR = "error"
    WARNING = "warning"
    INFO = "info"


# Data classes
@dataclass
class ValidationError:
    """Validation error detail"""
    line: int
    column: int
    message: str
    severity: str
    rule: str
    context: Optional[str] = None
    suggestion: Optional[str] = None
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'ValidationError':
        """Create ValidationError from dictionary"""
        return cls(
            line=data.get("line", 0),
            column=data.get("column", 0),
            message=data.get("message", ""),
            severity=data.get("severity", "error"),
            rule=data.get("rule", ""),
            context=data.get("context"),
            suggestion=data.get("suggestion")
        )


@dataclass
class ValidationStep:
    """Validation step information"""
    type: str
    duration: int
    error_count: int
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'ValidationStep':
        """Create ValidationStep from dictionary"""
        return cls(
            type=data.get("type", ""),
            duration=data.get("duration", 0),
            error_count=data.get("errorCount", 0)
        )


@dataclass
class ValidationMetadata:
    """Validation metadata"""
    processing_time: int
    schema_version: str
    validated_at: str
    error_count: int
    warning_count: int
    validation_steps: List[ValidationStep]
    profile: Optional[str] = None
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'ValidationMetadata':
        """Create ValidationMetadata from dictionary"""
        steps = [ValidationStep.from_dict(s) for s in data.get("validationSteps", [])]
        return cls(
            processing_time=data.get("processingTime", 0),
            schema_version=data.get("schemaVersion", ""),
            validated_at=data.get("validatedAt", ""),
            error_count=data.get("errorCount", 0),
            warning_count=data.get("warningCount", 0),
            validation_steps=steps,
            profile=data.get("profile")
        )


@dataclass
class ValidationResult:
    """Validation result"""
    valid: bool
    errors: List[ValidationError]
    warnings: List[ValidationError]
    metadata: ValidationMetadata
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'ValidationResult':
        """Create ValidationResult from dictionary"""
        errors = [ValidationError.from_dict(e) for e in data.get("errors", [])]
        warnings = [ValidationError.from_dict(w) for w in data.get("warnings", [])]
        
        # Handle metadata - it might be a dict or already a ValidationMetadata object
        metadata_data = data.get("metadata", {})
        if isinstance(metadata_data, ValidationMetadata):
            metadata = metadata_data
        else:
            metadata = ValidationMetadata.from_dict(metadata_data)
        
        return cls(
            valid=data.get("valid", False),
            errors=errors,
            warnings=warnings,
            metadata=metadata
        )
    
    def get_errors_by_severity(self) -> Dict[str, List[ValidationError]]:
        """Group errors by severity"""
        grouped = {}
        for error in self.errors:
            if error.severity not in grouped:
                grouped[error.severity] = []
            grouped[error.severity].append(error)
        return grouped
    
    def get_errors_by_line(self) -> Dict[int, List[ValidationError]]:
        """Group errors by line number"""
        grouped = {}
        for error in self.errors:
            if error.line not in grouped:
                grouped[error.line] = []
            grouped[error.line].append(error)
        return grouped


@dataclass
class VersionInfo:
    """Version information"""
    version: str
    profiles: List[str]
    status: str
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'VersionInfo':
        """Create VersionInfo from dictionary"""
        return cls(
            version=data.get("version", ""),
            profiles=data.get("profiles", []),
            status=data.get("status", "")
        )


@dataclass
class SupportedFormats:
    """Supported DDEX formats"""
    types: List[str]
    versions: List[VersionInfo]
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'SupportedFormats':
        """Create SupportedFormats from dictionary"""
        versions = [VersionInfo.from_dict(v) for v in data.get("versions", [])]
        return cls(
            types=data.get("types", []),
            versions=versions
        )


@dataclass
class HealthStatus:
    """API health status"""
    status: str
    version: str
    timestamp: str
    details: Optional[Dict[str, Any]] = None
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'HealthStatus':
        """Create HealthStatus from dictionary"""
        return cls(
            status=data.get("status", "unknown"),
            version=data.get("version", ""),
            timestamp=data.get("timestamp", ""),
            details=data.get("details")
        )


@dataclass
class ApiKey:
    """API key information"""
    id: str
    name: str
    created: str
    rate_limit: int
    request_count: int
    key: Optional[str] = None  # Only present on creation
    last_used: Optional[str] = None
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'ApiKey':
        """Create ApiKey from dictionary"""
        return cls(
            id=data.get("id", ""),
            name=data.get("name", ""),
            created=data.get("created", ""),
            rate_limit=data.get("rateLimit", 60),
            request_count=data.get("requestCount", 0),
            key=data.get("key"),
            last_used=data.get("lastUsed")
        )


@dataclass
class ValidationOptions:
    """Validation options"""
    version: str
    type: str = "ERN"
    profile: Optional[str] = None
    mode: Optional[str] = None
    strict: bool = False
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for API request"""
        data = {
            "version": self.version,
            "type": self.type
        }
        if self.profile:
            data["profile"] = self.profile
        if self.mode:
            data["mode"] = self.mode
        if self.strict:
            data["strict"] = self.strict
        return data