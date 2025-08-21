# packages/python-sdk/ddex_workbench/validator.py
"""High-level validation helpers for DDEX Workbench"""

import re
from typing import TYPE_CHECKING, Optional, List, Tuple
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

from .types import ValidationResult, ValidationError, ERNVersion

if TYPE_CHECKING:
    from .client import DDEXClient


class DDEXValidator:
    """
    High-level validation helper for DDEX documents
    
    Provides convenience methods and utilities for validation operations.
    """
    
    def __init__(self, client: 'DDEXClient'):
        """
        Initialize validator with client instance
        
        Args:
            client: DDEXClient instance to use for API calls
        """
        self.client = client
    
    def validate_ern43(
        self, 
        content: str, 
        profile: Optional[str] = None
    ) -> ValidationResult:
        """
        Validate ERN 4.3 content
        
        Args:
            content: XML content to validate
            profile: Optional profile (e.g., "AudioAlbum")
            
        Returns:
            ValidationResult object
        """
        return self.client.validate(content, version="4.3", profile=profile)
    
    def validate_ern42(
        self, 
        content: str, 
        profile: Optional[str] = None
    ) -> ValidationResult:
        """
        Validate ERN 4.2 content
        
        Args:
            content: XML content to validate
            profile: Optional profile
            
        Returns:
            ValidationResult object
        """
        return self.client.validate(content, version="4.2", profile=profile)
    
    def validate_ern382(
        self, 
        content: str, 
        profile: Optional[str] = None
    ) -> ValidationResult:
        """
        Validate ERN 3.8.2 content
        
        Args:
            content: XML content to validate
            profile: Optional profile
            
        Returns:
            ValidationResult object
        """
        return self.client.validate(content, version="3.8.2", profile=profile)
    
    def validate_auto(self, content: str) -> ValidationResult:
        """
        Auto-detect ERN version and validate
        
        Args:
            content: XML content to validate
            
        Returns:
            ValidationResult object
        """
        version = self.detect_version(content)
        
        if not version:
            # Return error result if version cannot be detected
            return ValidationResult(
                valid=False,
                errors=[
                    ValidationError(
                        line=0,
                        column=0,
                        message="Unable to detect ERN version from XML content",
                        severity="error",
                        rule="Version-Detection"
                    )
                ],
                warnings=[],
                metadata={
                    "processingTime": 0,
                    "schemaVersion": "unknown",
                    "validatedAt": "",
                    "errorCount": 1,
                    "warningCount": 0,
                    "validationSteps": []
                }
            )
        
        return self.client.validate(content, version=version)
    
    def detect_version(self, content: str) -> Optional[str]:
        """
        Detect ERN version from XML content
        
        Args:
            content: XML content to analyze
            
        Returns:
            Detected version string or None if not detected
        """
        # Check for ERN 4.3
        if 'xmlns:ern="http://ddex.net/xml/ern/43"' in content or \
           'MessageSchemaVersionId="ern/43"' in content:
            return "4.3"
        
        # Check for ERN 4.2
        if 'xmlns:ern="http://ddex.net/xml/ern/42"' in content or \
           'MessageSchemaVersionId="ern/42"' in content:
            return "4.2"
        
        # Check for ERN 3.8.2
        if 'xmlns:ern="http://ddex.net/xml/ern/382"' in content or \
           'MessageSchemaVersionId="ern/382"' in content:
            return "3.8.2"
        
        # Try regex patterns for more flexible matching
        patterns = [
            (r'xmlns:?\w*="http://ddex\.net/xml/ern/(\d+)"', lambda m: f"{m.group(1)[0]}.{m.group(1)[1]}"),
            (r'MessageSchemaVersionId="ern/(\d+)"', lambda m: f"{m.group(1)[0]}.{m.group(1)[1]}"),
            (r'xmlns:?\w*="http://ddex\.net/xml/ern/(\d{3})"', lambda m: f"{m.group(1)[0]}.{m.group(1)[1]}.{m.group(1)[2]}")
        ]
        
        for pattern, formatter in patterns:
            match = re.search(pattern, content)
            if match:
                try:
                    return formatter(match)
                except:
                    continue
        
        return None
    
    def validate_batch(
        self,
        items: List[Tuple[str, str, Optional[str]]],
        max_workers: int = 5
    ) -> List[ValidationResult]:
        """
        Validate multiple XML documents in parallel
        
        Args:
            items: List of tuples (content, version, profile)
            max_workers: Maximum number of parallel workers
            
        Returns:
            List of ValidationResult objects in same order as input
            
        Example:
            >>> items = [
            ...     (xml1, "4.3", "AudioAlbum"),
            ...     (xml2, "4.3", "AudioSingle"),
            ...     (xml3, "4.2", None)
            ... ]
            >>> results = validator.validate_batch(items)
        """
        results = [None] * len(items)
        
        with ThreadPoolExecutor(max_workers=max_workers) as executor:
            # Submit all tasks
            future_to_index = {}
            for i, (content, version, profile) in enumerate(items):
                future = executor.submit(
                    self.client.validate,
                    content,
                    version,
                    profile
                )
                future_to_index[future] = i
            
            # Collect results
            for future in as_completed(future_to_index):
                index = future_to_index[future]
                try:
                    results[index] = future.result()
                except Exception as e:
                    # Create error result for failed validations
                    results[index] = ValidationResult(
                        valid=False,
                        errors=[
                            ValidationError(
                                line=0,
                                column=0,
                                message=f"Validation failed: {str(e)}",
                                severity="error",
                                rule="Batch-Validation"
                            )
                        ],
                        warnings=[],
                        metadata={
                            "processingTime": 0,
                            "schemaVersion": items[index][1],
                            "validatedAt": "",
                            "errorCount": 1,
                            "warningCount": 0,
                            "validationSteps": []
                        }
                    )
        
        return results
    
    def validate_directory(
        self,
        directory: Path,
        version: str = None,
        pattern: str = "*.xml",
        recursive: bool = False
    ) -> dict:
        """
        Validate all XML files in a directory
        
        Args:
            directory: Path to directory containing XML files
            version: ERN version (if None, auto-detect for each file)
            pattern: File pattern to match (default: "*.xml")
            recursive: Search subdirectories
            
        Returns:
            Dictionary mapping file paths to ValidationResult objects
            
        Example:
            >>> results = validator.validate_directory(Path("releases"), version="4.3")
            >>> for path, result in results.items():
            ...     print(f"{path.name}: {'Valid' if result.valid else 'Invalid'}")
        """
        directory = Path(directory)
        if not directory.exists():
            raise FileNotFoundError(f"Directory not found: {directory}")
        
        if not directory.is_dir():
            raise ValueError(f"Not a directory: {directory}")
        
        # Find all matching files
        if recursive:
            files = directory.rglob(pattern)
        else:
            files = directory.glob(pattern)
        
        results = {}
        
        for file_path in files:
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                if version:
                    result = self.client.validate(content, version)
                else:
                    result = self.validate_auto(content)
                
                results[file_path] = result
                
            except Exception as e:
                # Store error result for files that can't be processed
                results[file_path] = ValidationResult(
                    valid=False,
                    errors=[
                        ValidationError(
                            line=0,
                            column=0,
                            message=f"Failed to process file: {str(e)}",
                            severity="error",
                            rule="File-Processing"
                        )
                    ],
                    warnings=[],
                    metadata={
                        "processingTime": 0,
                        "schemaVersion": version or "unknown",
                        "validatedAt": "",
                        "errorCount": 1,
                        "warningCount": 0,
                        "validationSteps": []
                    }
                )
        
        return results
    
    def is_valid(
        self,
        content: str,
        version: str,
        profile: Optional[str] = None
    ) -> bool:
        """
        Quick check if content is valid
        
        Args:
            content: XML content to validate
            version: ERN version
            profile: Optional profile
            
        Returns:
            True if valid, False otherwise
        """
        result = self.client.validate(content, version, profile)
        return result.valid
    
    def get_errors(
        self,
        content: str,
        version: str,
        profile: Optional[str] = None
    ) -> List[ValidationError]:
        """
        Get only errors (no warnings) from validation
        
        Args:
            content: XML content to validate
            version: ERN version
            profile: Optional profile
            
        Returns:
            List of ValidationError objects
        """
        result = self.client.validate(content, version, profile)
        return result.errors
    
    def get_critical_errors(
        self,
        content: str,
        version: str,
        profile: Optional[str] = None
    ) -> List[ValidationError]:
        """
        Get only critical errors (severity='error')
        
        Args:
            content: XML content to validate
            version: ERN version
            profile: Optional profile
            
        Returns:
            List of critical ValidationError objects
        """
        result = self.client.validate(content, version, profile)
        return [e for e in result.errors if e.severity == 'error']