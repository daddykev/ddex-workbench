# packages/python-sdk/ddex_workbench/utils.py
"""Utility functions for DDEX Workbench SDK"""

import hashlib
import re
import xml.etree.ElementTree as ET
from pathlib import Path
from typing import Optional, List, Dict, Any, Tuple
import json
import csv
from datetime import datetime


# ERN version for each namespace / MessageSchemaVersionId number
# (http://ddex.net/xml/ern/<num>, MessageSchemaVersionId="ern/<num>")
_ERN_VERSION_BY_NUMBER = {
    "43": "4.3",
    "42": "4.2",
    "383": "3.8.3",
    "382": "3.8.2",
}

# Quick substring checks, newest first. 3.8.3 is checked before 3.8.2, and every
# token is exact ("ern/382" or "ern/3.8.2", never a bare "3.8"), so a 3.8.3
# document can't be caught by a 3.8.2 check. The tokens cover the namespace
# (any prefix, or the default namespace), MessageSchemaVersionId and
# xsi:schemaLocation.
_ERN_VERSION_TOKENS = [
    ("4.3", ("ern/43", "ern/4.3")),
    ("4.2", ("ern/42", "ern/4.2")),
    ("3.8.3", ("ern/383", "ern/3.8.3")),
    ("3.8.2", ("ern/382", "ern/3.8.2")),
]


def _token_in(token: str, content: str) -> bool:
    """True if ``token`` occurs in ``content`` and isn't followed by more of the
    version (so "ern/43" doesn't match "ern/430" and "ern/4.3" doesn't match
    "ern/4.3.1")."""
    return re.search(re.escape(token) + r'(?![\d.]*\d)', content) is not None


def detect_ern_version(xml_content: str) -> Optional[str]:
    """
    Detect ERN version from XML content

    Supports ERN 4.3, 4.2, 3.8.3 and 3.8.2.

    Args:
        xml_content: XML content as string

    Returns:
        Detected version string or None
    """
    # Quick string checks first
    for version, tokens in _ERN_VERSION_TOKENS:
        if any(_token_in(token, xml_content) for token in tokens):
            return version

    # Try parsing XML for a more thorough check
    try:
        root = ET.fromstring(xml_content)
    except ET.ParseError:
        return None

    # Root element namespace ({http://ddex.net/xml/ern/43}NewReleaseMessage),
    # then attribute values such as xsi:schemaLocation
    candidates = []
    if root.tag.startswith("{"):
        candidates.append(root.tag[1:].split("}", 1)[0])
    candidates.extend(root.attrib.values())
    for value in candidates:
        match = re.search(r'ddex\.net/xml/ern/(\d+)', value)
        if match and match.group(1) in _ERN_VERSION_BY_NUMBER:
            return _ERN_VERSION_BY_NUMBER[match.group(1)]

    # MessageSchemaVersionId: "ern/43", "ern/4.3", "43" or "4.3"
    schema_version = root.get("MessageSchemaVersionId", "").strip()
    if schema_version.lower().startswith("ern/"):
        schema_version = schema_version[4:]
    number = schema_version.replace(".", "")
    if number in _ERN_VERSION_BY_NUMBER:
        return _ERN_VERSION_BY_NUMBER[number]

    return None


def _meta(result: Any, key: str, default: Any = None) -> Any:
    """Read a field from ``result.metadata``, the API's metadata dict (camelCase keys)."""
    metadata = getattr(result, "metadata", None) or {}
    value = metadata.get(key) if isinstance(metadata, dict) else None
    return default if value is None else value


def validate_xml_structure(xml_content: str) -> Tuple[bool, Optional[str]]:
    """
    Basic XML structure validation
    
    Args:
        xml_content: XML content as string
        
    Returns:
        Tuple of (is_valid, error_message)
    """
    try:
        ET.fromstring(xml_content)
        return True, None
    except ET.ParseError as e:
        return False, str(e)


def extract_message_id(xml_content: str) -> Optional[str]:
    """
    Extract MessageId from ERN XML
    
    Args:
        xml_content: XML content as string
        
    Returns:
        MessageId or None if not found
    """
    try:
        root = ET.fromstring(xml_content)
        
        # Try different namespace possibilities
        namespaces = {
            'ern': 'http://ddex.net/xml/ern/43',
            'ern42': 'http://ddex.net/xml/ern/42',
            'ern383': 'http://ddex.net/xml/ern/383',
            'ern382': 'http://ddex.net/xml/ern/382'
        }
        
        for prefix, ns in namespaces.items():
            # Try with namespace
            message_id = root.find(f'.//{{{ns}}}MessageId')
            if message_id is not None:
                return message_id.text
        
        # Try without namespace
        message_id = root.find('.//MessageId')
        if message_id is not None:
            return message_id.text
            
    except ET.ParseError:
        pass
    
    return None


def calculate_file_hash(file_path: Path, algorithm: str = "sha256") -> str:
    """
    Calculate hash of a file
    
    Args:
        file_path: Path to file
        algorithm: Hash algorithm (sha256, md5, sha1)
        
    Returns:
        Hex digest of file hash
    """
    hash_func = getattr(hashlib, algorithm)()
    
    with open(file_path, 'rb') as f:
        for chunk in iter(lambda: f.read(4096), b""):
            hash_func.update(chunk)
    
    return hash_func.hexdigest()


def format_validation_report(
    result: 'ValidationResult',
    format_type: str = "text",
    include_warnings: bool = True
) -> str:
    """
    Format validation result as a report
    
    Args:
        result: ValidationResult object
        format_type: Output format (text, json, csv)
        include_warnings: Include warnings in report
        
    Returns:
        Formatted report string
    """
    if format_type == "json":
        return json.dumps({
            "valid": result.valid,
            "errors": [
                {
                    "line": e.line,
                    "column": e.column,
                    "message": e.message,
                    "severity": e.severity,
                    "rule": e.rule,
                    "context": e.context,
                    "suggestion": e.suggestion
                }
                for e in result.errors
            ],
            "warnings": [
                {
                    "line": w.line,
                    "column": w.column,
                    "message": w.message,
                    "severity": getattr(w, "severity", "warning"),
                    "rule": w.rule,
                    "context": w.context,
                    "suggestion": getattr(w, "suggestion", None)
                }
                for w in result.warnings
            ] if include_warnings else [],
            "metadata": {
                "processingTime": _meta(result, "processingTime"),
                "schemaVersion": _meta(result, "schemaVersion"),
                "validatedAt": _meta(result, "validatedAt"),
                "errorCount": _meta(result, "errorCount", len(result.errors)),
                "warningCount": _meta(result, "warningCount", len(result.warnings))
            }
        }, indent=2)
    
    elif format_type == "csv":
        import io
        output = io.StringIO()
        writer = csv.DictWriter(
            output,
            fieldnames=["type", "line", "column", "severity", "rule", "message", "suggestion"]
        )
        writer.writeheader()
        
        for error in result.errors:
            writer.writerow({
                "type": "error",
                "line": error.line,
                "column": error.column,
                "severity": error.severity,
                "rule": error.rule,
                "message": error.message,
                "suggestion": error.suggestion or ""
            })
        
        if include_warnings:
            for warning in result.warnings:
                writer.writerow({
                    "type": "warning",
                    "line": warning.line,
                    "column": warning.column,
                    "severity": getattr(warning, "severity", "warning"),
                    "rule": warning.rule,
                    "message": warning.message,
                    "suggestion": getattr(warning, "suggestion", None) or ""
                })
        
        return output.getvalue()
    
    else:  # text format
        lines = []
        lines.append("=" * 60)
        lines.append("DDEX VALIDATION REPORT")
        lines.append("=" * 60)
        lines.append(f"Status: {'VALID ✅' if result.valid else 'INVALID ❌'}")
        lines.append(f"Schema Version: {_meta(result, 'schemaVersion')}")
        lines.append(f"Validated At: {_meta(result, 'validatedAt')}")
        lines.append(f"Processing Time: {_meta(result, 'processingTime')}ms")
        lines.append(f"Errors: {_meta(result, 'errorCount', len(result.errors))}")
        lines.append(f"Warnings: {_meta(result, 'warningCount', len(result.warnings))}")
        lines.append("")
        
        if result.errors:
            lines.append("ERRORS:")
            lines.append("-" * 40)
            for i, error in enumerate(result.errors, 1):
                lines.append(f"{i}. Line {error.line}, Column {error.column}")
                lines.append(f"   Rule: {error.rule}")
                lines.append(f"   Message: {error.message}")
                if error.suggestion:
                    lines.append(f"   Suggestion: {error.suggestion}")
                lines.append("")
        
        if include_warnings and result.warnings:
            lines.append("WARNINGS:")
            lines.append("-" * 40)
            for i, warning in enumerate(result.warnings, 1):
                lines.append(f"{i}. Line {warning.line}, Column {warning.column}")
                lines.append(f"   Rule: {warning.rule}")
                lines.append(f"   Message: {warning.message}")
                if getattr(warning, "suggestion", None):
                    lines.append(f"   Suggestion: {warning.suggestion}")
                lines.append("")
        
        lines.append("=" * 60)
        
        return "\n".join(lines)


def batch_process_files(
    files: List[Path],
    processor_func: callable,
    max_workers: int = 5,
    progress_callback: Optional[callable] = None
) -> Dict[Path, Any]:
    """
    Process multiple files in parallel
    
    Args:
        files: List of file paths
        processor_func: Function to process each file
        max_workers: Maximum parallel workers
        progress_callback: Optional callback for progress updates
        
    Returns:
        Dictionary mapping file paths to results
    """
    from concurrent.futures import ThreadPoolExecutor, as_completed
    
    results = {}
    total = len(files)
    completed = 0
    
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        future_to_file = {
            executor.submit(processor_func, file): file
            for file in files
        }
        
        for future in as_completed(future_to_file):
            file = future_to_file[future]
            
            try:
                result = future.result()
                results[file] = result
            except Exception as e:
                results[file] = {"error": str(e)}
            
            completed += 1
            if progress_callback:
                progress_callback(completed, total, file)
    
    return results


def create_summary_statistics(results: List['ValidationResult']) -> Dict[str, Any]:
    """
    Create summary statistics from multiple validation results
    
    Args:
        results: List of ValidationResult objects
        
    Returns:
        Dictionary with summary statistics
    """
    total = len(results)
    valid_count = sum(1 for r in results if r.valid)
    total_errors = sum(_meta(r, "errorCount", len(r.errors)) for r in results)
    total_warnings = sum(_meta(r, "warningCount", len(r.warnings)) for r in results)
    total_processing_time = sum(_meta(r, "processingTime", 0) or 0 for r in results)
    
    # Count errors by rule
    error_by_rule = {}
    for result in results:
        for error in result.errors:
            if error.rule not in error_by_rule:
                error_by_rule[error.rule] = 0
            error_by_rule[error.rule] += 1
    
    # Count by version
    version_counts = {}
    for result in results:
        version = _meta(result, "schemaVersion")
        if version not in version_counts:
            version_counts[version] = {"total": 0, "valid": 0}
        version_counts[version]["total"] += 1
        if result.valid:
            version_counts[version]["valid"] += 1
    
    return {
        "total_files": total,
        "valid_files": valid_count,
        "invalid_files": total - valid_count,
        "validity_rate": (valid_count / total * 100) if total > 0 else 0,
        "total_errors": total_errors,
        "total_warnings": total_warnings,
        "average_errors_per_file": total_errors / total if total > 0 else 0,
        "average_warnings_per_file": total_warnings / total if total > 0 else 0,
        "total_processing_time_ms": total_processing_time,
        "average_processing_time_ms": total_processing_time / total if total > 0 else 0,
        "errors_by_rule": dict(sorted(error_by_rule.items(), key=lambda x: x[1], reverse=True)),
        "version_statistics": version_counts,
        "timestamp": datetime.now().isoformat()
    }


def filter_errors(
    errors: List['ValidationError'],
    severity: Optional[str] = None,
    rule_pattern: Optional[str] = None,
    line_range: Optional[Tuple[int, int]] = None
) -> List['ValidationError']:
    """
    Filter validation errors by criteria
    
    Args:
        errors: List of ValidationError objects
        severity: Filter by severity level
        rule_pattern: Regex pattern for rule filtering
        line_range: Tuple of (start_line, end_line)
        
    Returns:
        Filtered list of errors
    """
    filtered = errors
    
    if severity:
        filtered = [e for e in filtered if e.severity == severity]
    
    if rule_pattern:
        pattern = re.compile(rule_pattern)
        filtered = [e for e in filtered if pattern.match(e.rule)]
    
    if line_range:
        start, end = line_range
        filtered = [e for e in filtered if start <= e.line <= end]
    
    return filtered