# packages/python-sdk/ddex_workbench/validator.py
"""High-level validation helpers for DDEX Workbench"""

# Standard library imports
import hashlib
import re
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from typing import Dict, List, Optional, Tuple, Any
from urllib.parse import urlparse

# XML parsing from standard library
import xml.etree.ElementTree as ET

# Third-party imports
import requests

# Local imports - be careful with circular imports
from .errors import ValidationError, FileError, ParseError
from .types import (
    BatchValidationResult,
    ValidationError as ValidationErrorDetail,
    ValidationOptions,
    ValidationResult,
    ValidationSummary,
)


class DDEXValidator:
    """
    High-level validation helper for DDEX documents
    
    Provides convenience methods and utilities for validation operations.
    """
    
    def __init__(self, client: Any):  # Using Any to avoid circular import
        """
        Initialize validator with client instance
        
        Args:
            client: DDEXClient instance to use for API calls
        """
        self.client = client
    
    def validate_ern43(
        self, 
        content: str, 
        profile: Optional[str] = None,
        options: Optional[ValidationOptions] = None
    ) -> ValidationResult:
        """
        Validate ERN 4.3 content
        
        Args:
            content: XML content to validate
            profile: Optional profile (e.g., "AudioAlbum")
            options: Optional validation options
            
        Returns:
            ValidationResult object
        """
        return self.client.validate(content, version="4.3", profile=profile, options=options)
    
    def validate_ern42(
        self, 
        content: str, 
        profile: Optional[str] = None,
        options: Optional[ValidationOptions] = None
    ) -> ValidationResult:
        """
        Validate ERN 4.2 content
        
        Args:
            content: XML content to validate
            profile: Optional profile
            options: Optional validation options
            
        Returns:
            ValidationResult object
        """
        return self.client.validate(content, version="4.2", profile=profile, options=options)
    
    def validate_ern382(
        self, 
        content: str, 
        profile: Optional[str] = None,
        options: Optional[ValidationOptions] = None
    ) -> ValidationResult:
        """
        Validate ERN 3.8.2 content
        
        Args:
            content: XML content to validate
            profile: Optional profile
            options: Optional validation options
            
        Returns:
            ValidationResult object
        """
        return self.client.validate(content, version="3.8.2", profile=profile, options=options)
    
    def validate_auto(
        self,
        content: str,
        profile: Optional[str] = None,
        options: Optional[ValidationOptions] = None
    ) -> ValidationResult:
        """
        Auto-detect version and validate
        
        Args:
            content: XML content to validate
            profile: Optional profile (auto-detected if not provided)
            options: Optional validation options
            
        Returns:
            ValidationResult object
            
        Raises:
            ValidationError: If version cannot be detected
        """
        version = self.detect_version(content)
        if not version:
            raise ValidationError("Could not detect ERN version from XML content")
        
        if not profile:
            profile = self.detect_profile(content)
        
        return self.client.validate(content, version=version, profile=profile, options=options)
    
    def validate_batch(
        self,
        files: List[Path],
        version: str,
        profile: Optional[str] = None,
        max_workers: int = 4,
        options: Optional[ValidationOptions] = None
    ) -> BatchValidationResult:
        """
        Batch process multiple XML files with concurrency control
        
        Args:
            files: List of file paths to validate
            version: ERN version
            profile: Optional profile
            max_workers: Maximum concurrent validations
            options: Optional validation options
            
        Returns:
            BatchValidationResult with all results
        """
        results = []
        start_time = time.time()
        
        with ThreadPoolExecutor(max_workers=max_workers) as executor:
            futures = {
                executor.submit(
                    self.validate_file, 
                    file, 
                    version, 
                    profile,
                    False,
                    options
                ): file
                for file in files
            }
            
            for future in as_completed(futures):
                filepath = futures[future]
                try:
                    result = future.result()
                    result.metadata['file'] = str(filepath)
                    results.append(result)
                except Exception as e:
                    # Create error result for failed file
                    error_result = ValidationResult(
                        valid=False,
                        errors=[ValidationErrorDetail(
                            line=0,
                            column=0,
                            message=f"Failed to validate {filepath.name}: {str(e)}",
                            severity="error",
                            rule="FILE_ERROR"
                        )],
                        warnings=[],
                        metadata={"file": str(filepath), "error": str(e)}
                    )
                    results.append(error_result)
        
        valid_count = sum(1 for r in results if r.valid)
        return BatchValidationResult(
            total_files=len(files),
            valid_files=valid_count,
            invalid_files=len(files) - valid_count,
            results=results,
            processing_time=time.time() - start_time
        )
    
    def validate_file(
        self,
        filepath: Path,
        version: str,
        profile: Optional[str] = None,
        generate_hash: bool = False,
        options: Optional[ValidationOptions] = None
    ) -> ValidationResult:
        """
        Validate file with optional hash generation
        
        Args:
            filepath: Path to XML file
            version: ERN version
            profile: Optional profile
            generate_hash: Whether to generate MD5 hash
            options: Optional validation options
            
        Returns:
            ValidationResult object
            
        Raises:
            FileError: If file cannot be read
        """
        filepath = Path(filepath)
        if not filepath.exists():
            raise FileError(f"File not found: {filepath}", filepath=str(filepath))
        
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
        except Exception as e:
            raise FileError(f"Failed to read file: {e}", filepath=str(filepath))
        
        result = self.client.validate(content, version, profile, options)
        
        result.metadata['file_path'] = str(filepath)
        result.metadata['file_name'] = filepath.name
        result.metadata['file_size'] = filepath.stat().st_size
        
        if generate_hash:
            hash_md5 = hashlib.md5(content.encode()).hexdigest()
            hash_sha256 = hashlib.sha256(content.encode()).hexdigest()
            result.metadata['file_hash_md5'] = hash_md5
            result.metadata['file_hash_sha256'] = hash_sha256
        
        return result
    
    def validate_url(
        self,
        url: str,
        version: str,
        profile: Optional[str] = None,
        options: Optional[ValidationOptions] = None,
        timeout: int = 30
    ) -> ValidationResult:
        """
        Validate XML directly from URL
        
        Args:
            url: URL to fetch XML from
            version: ERN version
            profile: Optional profile
            options: Optional validation options
            timeout: Request timeout in seconds
            
        Returns:
            ValidationResult object
            
        Raises:
            ValidationError: If URL cannot be fetched
        """
        try:
            response = requests.get(url, timeout=timeout)
            response.raise_for_status()
            content = response.text
        except requests.RequestException as e:
            raise ValidationError(f"Failed to fetch URL: {e}")
        
        result = self.client.validate(content, version, profile, options)
        result.metadata['source_url'] = url
        result.metadata['content_length'] = len(content)
        
        return result
    
    def get_profile_compliance(
        self,
        content: str,
        version: str,
        profile: str
    ) -> ValidationSummary:
        """
        Get detailed compliance report with pass/fail rates
        
        Args:
            content: XML content to validate
            version: ERN version
            profile: Profile to check compliance for
            
        Returns:
            ValidationSummary with compliance statistics
        """
        options = ValidationOptions(
            generate_svrl=True,
            verbose=True,
            include_passed_rules=True
        )
        
        result = self.client.validate(
            content, version, profile,
            options=options
        )
        
        return result.summary or self._calculate_summary(result)
    
    def generate_summary(self, result: ValidationResult) -> str:
        """
        Generate comprehensive validation summary with statistics
        
        Args:
            result: ValidationResult to summarize
            
        Returns:
            Formatted summary string
        """
        lines = []
        lines.append("=" * 60)
        lines.append("DDEX Validation Summary")
        lines.append("=" * 60)
        lines.append(f"Valid: {'✅ Yes' if result.valid else '❌ No'}")
        lines.append(f"Errors: {len(result.errors)}")
        lines.append(f"Warnings: {len(result.warnings)}")
        
        if result.metadata:
            if 'processingTime' in result.metadata:
                lines.append(f"Processing Time: {result.metadata['processingTime']}ms")
            if 'schemaVersion' in result.metadata:
                lines.append(f"Schema Version: {result.metadata['schemaVersion']}")
            if 'profile' in result.metadata:
                lines.append(f"Profile: {result.metadata['profile']}")
        
        if result.summary:
            lines.append("")
            lines.append("Compliance Statistics:")
            lines.append(f"  Pass Rate: {result.summary.pass_rate:.1%}")
            lines.append(f"  Rules Tested: {result.summary.total_rules}")
            lines.append(f"  Rules Passed: {result.summary.passed_rules}")
            lines.append(f"  Rules Failed: {result.summary.failed_rules}")
            
            if result.summary.schematron_errors:
                lines.append(f"  Schematron Errors: {result.summary.schematron_errors}")
            if result.summary.xsd_errors:
                lines.append(f"  XSD Errors: {result.summary.xsd_errors}")
            if result.summary.business_rule_errors:
                lines.append(f"  Business Rule Errors: {result.summary.business_rule_errors}")
        
        if result.errors:
            lines.append("")
            lines.append("Top Errors:")
            for i, error in enumerate(result.errors[:5], 1):
                lines.append(f"  {i}. Line {error.line}: {error.message}")
        
        lines.append("=" * 60)
        return "\n".join(lines)
    
    def get_schematron_errors(self, result: ValidationResult) -> List[ValidationErrorDetail]:
        """
        Filter schematron-specific errors
        
        Args:
            result: ValidationResult to filter
            
        Returns:
            List of schematron errors
        """
        return [
            e for e in result.errors 
            if e.rule and ('schematron' in e.rule.lower() or 'SCH' in e.rule)
        ]
    
    def get_xsd_errors(self, result: ValidationResult) -> List[ValidationErrorDetail]:
        """
        Filter XSD schema errors
        
        Args:
            result: ValidationResult to filter
            
        Returns:
            List of XSD errors
        """
        return [
            e for e in result.errors 
            if e.rule and ('xsd' in e.rule.lower() or 'XSD' in e.rule or 'schema' in e.rule.lower())
        ]
    
    def get_business_rule_errors(self, result: ValidationResult) -> List[ValidationErrorDetail]:
        """
        Filter business rule errors
        
        Args:
            result: ValidationResult to filter
            
        Returns:
            List of business rule errors
        """
        return [
            e for e in result.errors 
            if e.rule and ('business' in e.rule.lower() or 'BR' in e.rule)
        ]
    
    def get_critical_errors(
        self,
        content: str,
        version: str,
        profile: Optional[str] = None
    ) -> List[ValidationErrorDetail]:
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
    
    def format_errors(
        self,
        result: ValidationResult,
        group_by_rule: bool = False,
        include_context: bool = True,
        max_per_group: int = 5,
        max_total: int = 20
    ) -> str:
        """
        Format errors with grouping and context options
        
        Args:
            result: ValidationResult containing errors
            group_by_rule: Whether to group errors by rule
            include_context: Whether to include error context
            max_per_group: Maximum errors to show per group
            max_total: Maximum total errors to show
            
        Returns:
            Formatted error string
        """
        if not result.errors:
            return "No errors found"
        
        if group_by_rule:
            errors_by_rule: Dict[str, List[ValidationErrorDetail]] = {}
            for error in result.errors:
                rule = error.rule or "Unknown"
                if rule not in errors_by_rule:
                    errors_by_rule[rule] = []
                errors_by_rule[rule].append(error)
            
            lines = []
            lines.append(f"Found {len(result.errors)} errors in {len(errors_by_rule)} categories:")
            
            for rule, errors in sorted(errors_by_rule.items(), key=lambda x: len(x[1]), reverse=True):
                lines.append(f"\n{rule} ({len(errors)} error{'s' if len(errors) != 1 else ''}):")
                for error in errors[:max_per_group]:
                    lines.append(f"  Line {error.line}, Col {error.column}: {error.message}")
                    if include_context and error.context:
                        lines.append(f"    Context: {error.context}")
                    if include_context and error.suggestion:
                        lines.append(f"    Suggestion: {error.suggestion}")
                
                if len(errors) > max_per_group:
                    lines.append(f"  ... and {len(errors) - max_per_group} more")
            
            return "\n".join(lines)
        else:
            lines = []
            lines.append(f"Found {len(result.errors)} error{'s' if len(result.errors) != 1 else ''}:")
            
            for i, error in enumerate(result.errors[:max_total], 1):
                lines.append(f"\n{i}. Line {error.line}, Col {error.column}: {error.message}")
                if error.rule:
                    lines.append(f"   Rule: {error.rule}")
                if include_context and error.context:
                    lines.append(f"   Context: {error.context}")
                if include_context and error.suggestion:
                    lines.append(f"   Suggestion: {error.suggestion}")
            
            if len(result.errors) > max_total:
                lines.append(f"\n... and {len(result.errors) - max_total} more errors")
            
            return "\n".join(lines)
    
    def detect_version(self, content: str) -> Optional[str]:
        """
        Auto-detect ERN version from XML content
        
        Args:
            content: XML content
            
        Returns:
            Detected version string or None
        """
        # Quick string checks first
        if 'ern/43' in content or 'ern/4.3' in content:
            return '4.3'
        elif 'ern/42' in content or 'ern/4.2' in content:
            return '4.2'
        elif 'ern/382' in content or 'ern/3.8' in content:
            return '3.8.2'
        
        # Try parsing for more accurate detection
        try:
            root = ET.fromstring(content)
            
            # Check namespace
            namespace = root.tag.split('}')[0].strip('{') if '}' in root.tag else ''
            if '43' in namespace or '4.3' in namespace:
                return '4.3'
            elif '42' in namespace or '4.2' in namespace:
                return '4.2'
            elif '382' in namespace or '3.8' in namespace:
                return '3.8.2'
            
            # Check schema version attribute
            schema_version = root.get('MessageSchemaVersionId', '')
            if '4.3' in schema_version or '43' in schema_version:
                return '4.3'
            elif '4.2' in schema_version or '42' in schema_version:
                return '4.2'
            elif '3.8' in schema_version or '382' in schema_version:
                return '3.8.2'
            
        except ET.ParseError:
            pass
        except Exception:
            pass
        
        return None
    
    def detect_profile(self, content: str) -> Optional[str]:
        """
        Auto-detect profile from XML content
        
        Args:
            content: XML content
            
        Returns:
            Detected profile string or None
        """
        try:
            root = ET.fromstring(content)
            
            # Look for ReleaseProfileVersionId attribute
            profile = root.get('ReleaseProfileVersionId', '')
            
            # Map common profile indicators
            profile_lower = profile.lower()
            if 'audioalbum' in profile_lower:
                return 'AudioAlbum'
            elif 'audiosingle' in profile_lower:
                return 'AudioSingle'
            elif 'video' in profile_lower and 'musicvideo' not in profile_lower:
                return 'Video'
            elif 'musicvideo' in profile_lower:
                return 'Video'
            elif 'classical' in profile_lower:
                return 'Classical'
            elif 'ringtone' in profile_lower:
                return 'Ringtone'
            elif 'dj' in profile_lower:
                return 'DJ'
            elif 'mixed' in profile_lower:
                return 'Mixed'
            elif 'releasebyrelease' in profile_lower:
                return 'ReleaseByRelease'
            
            # Try to detect from content structure
            ns_map = {'ern': root.tag.split('}')[0].strip('{') if '}' in root.tag else ''}
            
            # Check for video resources
            video_resources = root.findall('.//ern:Video', ns_map) if ns_map else []
            sound_resources = root.findall('.//ern:SoundRecording', ns_map) if ns_map else []
            
            if video_resources and not sound_resources:
                return 'Video'
            elif sound_resources and not video_resources:
                # Check release count for single vs album
                releases = root.findall('.//ern:Release', ns_map) if ns_map else []
                if len(releases) == 1:
                    # Could be single or album, check track count
                    return 'AudioSingle'  # Default to single
                return 'AudioAlbum'
            
        except ET.ParseError:
            pass
        except Exception:
            pass
        
        return None
    
    def extract_metadata(self, content: str) -> Dict[str, Any]:
        """
        Extract message ID, creation date, and release count
        
        Args:
            content: XML content
            
        Returns:
            Dictionary with extracted metadata
        """
        metadata: Dict[str, Any] = {}
        
        try:
            root = ET.fromstring(content)
            
            # Get namespace
            ns = root.tag.split('}')[0].strip('{') if '}' in root.tag else ''
            ns_map = {'ern': ns} if ns else {}
            
            # Extract version
            metadata['version'] = self.detect_version(content)
            metadata['profile'] = self.detect_profile(content)
            
            # Find MessageHeader
            header = root.find('.//ern:MessageHeader', ns_map) if ns_map else root.find('.//MessageHeader')
            if header is not None:
                # Message ID
                msg_id_elem = header.find('ern:MessageId', ns_map) if ns_map else header.find('MessageId')
                if msg_id_elem is not None and msg_id_elem.text:
                    metadata['message_id'] = msg_id_elem.text
                
                # Creation date
                created_elem = header.find('ern:MessageCreatedDateTime', ns_map) if ns_map else header.find('MessageCreatedDateTime')
                if created_elem is not None and created_elem.text:
                    metadata['created_date'] = created_elem.text
                
                # Sender
                sender = header.find('ern:MessageSender', ns_map) if ns_map else header.find('MessageSender')
                if sender is not None:
                    party_name = sender.find('.//ern:PartyName', ns_map) if ns_map else sender.find('.//PartyName')
                    if party_name is not None:
                        full_name = party_name.find('ern:FullName', ns_map) if ns_map else party_name.find('FullName')
                        if full_name is not None and full_name.text:
                            metadata['sender'] = full_name.text
            
            # Count releases
            releases = root.findall('.//ern:Release', ns_map) if ns_map else root.findall('.//Release')
            metadata['release_count'] = len(releases)
            
            # Count resources
            sound_recordings = root.findall('.//ern:SoundRecording', ns_map) if ns_map else root.findall('.//SoundRecording')
            videos = root.findall('.//ern:Video', ns_map) if ns_map else root.findall('.//Video')
            metadata['sound_recording_count'] = len(sound_recordings)
            metadata['video_count'] = len(videos)
            metadata['total_resources'] = len(sound_recordings) + len(videos)
            
            # Count deals
            deals = root.findall('.//ern:ReleaseDeal', ns_map) if ns_map else root.findall('.//ReleaseDeal')
            metadata['deal_count'] = len(deals)
            
        except ET.ParseError as e:
            metadata['parse_error'] = str(e)
        except Exception as e:
            metadata['extraction_error'] = str(e)
        
        return metadata
    
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
    ) -> List[ValidationErrorDetail]:
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
    
    def _calculate_summary(self, result: ValidationResult) -> ValidationSummary:
        """
        Calculate summary statistics from validation result
        
        Args:
            result: ValidationResult to summarize
            
        Returns:
            ValidationSummary object
        """
        total_rules = 0
        passed_rules = 0
        
        if result.passed_rules:
            passed_rules = len(result.passed_rules)
            total_rules = passed_rules + len(result.errors)
        else:
            # Estimate from errors
            total_rules = len(result.errors) * 2  # Rough estimate
            passed_rules = total_rules - len(result.errors)
        
        schematron_errors = len(self.get_schematron_errors(result))
        xsd_errors = len(self.get_xsd_errors(result))
        business_errors = len(self.get_business_rule_errors(result))
        
        return ValidationSummary(
            total_rules=total_rules,
            passed_rules=passed_rules,
            failed_rules=len(result.errors),
            pass_rate=passed_rules / total_rules if total_rules > 0 else 0.0,
            profile=result.metadata.get('profile'),
            schematron_errors=schematron_errors,
            xsd_errors=xsd_errors,
            business_rule_errors=business_errors
        )