#!/usr/bin/env python3
# packages/python-sdk/examples/batch_processing.py
"""
Batch processing example for DDEX Workbench SDK

This example demonstrates:
- Processing multiple files
- Parallel validation
- Directory scanning
- Progress tracking
- Summary statistics
- Error aggregation
"""

import sys
import time
from pathlib import Path
from typing import List, Dict, Any
from concurrent.futures import ThreadPoolExecutor, as_completed

from ddex_workbench import DDEXClient
from ddex_workbench.utils import create_summary_statistics, format_validation_report


def create_sample_files(directory: Path) -> List[Path]:
    """Create sample XML files for testing"""
    directory.mkdir(exist_ok=True)
    
    files = []
    
    # Valid ERN 4.3
    file1 = directory / "release_001_valid.xml"
    file1.write_text("""<?xml version="1.0" encoding="UTF-8"?>
    <ern:NewReleaseMessage xmlns:ern="http://ddex.net/xml/ern/43" 
        MessageSchemaVersionId="ern/43">
        <MessageHeader>
            <MessageId>MSG_001</MessageId>
            <MessageCreatedDateTime>2024-01-01T00:00:00Z</MessageCreatedDateTime>
        </MessageHeader>
        <ResourceList>
            <SoundRecording>
                <ResourceReference>A1</ResourceReference>
            </SoundRecording>
        </ResourceList>
        <ReleaseList>
            <Release>
                <ReleaseReference>R0</ReleaseReference>
            </Release>
        </ReleaseList>
        <DealList>
            <ReleaseDeal>
                <DealReleaseReference>R0</DealReleaseReference>
            </ReleaseDeal>
        </DealList>
    </ern:NewReleaseMessage>""")
    files.append(file1)
    
    # Invalid ERN 4.3 (missing elements)
    file2 = directory / "release_002_invalid.xml"
    file2.write_text("""<?xml version="1.0" encoding="UTF-8"?>
    <ern:NewReleaseMessage xmlns:ern="http://ddex.net/xml/ern/43">
        <MessageHeader>
            <!-- Missing required elements -->
        </MessageHeader>
    </ern:NewReleaseMessage>""")
    files.append(file2)
    
    # ERN 4.2
    file3 = directory / "release_003_v42.xml"
    file3.write_text("""<?xml version="1.0" encoding="UTF-8"?>
    <ern:NewReleaseMessage xmlns:ern="http://ddex.net/xml/ern/42" 
        MessageSchemaVersionId="ern/42">
        <MessageHeader>
            <MessageId>MSG_003</MessageId>
            <MessageCreatedDateTime>2024-01-01T00:00:00Z</MessageCreatedDateTime>
        </MessageHeader>
    </ern:NewReleaseMessage>""")
    files.append(file3)
    
    # ERN 3.8.2
    file4 = directory / "release_004_v382.xml"
    file4.write_text("""<?xml version="1.0" encoding="UTF-8"?>
    <ern:NewReleaseMessage xmlns:ern="http://ddex.net/xml/ern/382" 
        MessageSchemaVersionId="ern/382">
        <MessageHeader>
            <MessageId>MSG_004</MessageId>
        </MessageHeader>
    </ern:NewReleaseMessage>""")
    files.append(file4)
    
    return files


def batch_validate_simple(files: List[Path]):
    """Simple sequential batch validation"""
    print("=" * 60)
    print("Example 1: Simple Batch Validation")
    print("=" * 60)
    
    client = DDEXClient()
    results = []
    
    for file_path in files:
        print(f"Validating: {file_path.name}...", end=" ")
        
        try:
            # Auto-detect version
            with open(file_path, 'r') as f:
                content = f.read()
            
            result = client.validator.validate_auto(content)
            results.append(result)
            
            status = "✅ Valid" if result.valid else f"❌ Invalid ({result.metadata.error_count} errors)"
            print(status)
            
        except Exception as e:
            print(f"❌ Error: {e}")
    
    # Summary
    print(f"\nProcessed {len(files)} files")
    valid_count = sum(1 for r in results if r.valid)
    print(f"Valid: {valid_count}/{len(files)}")
    
    return results


def batch_validate_parallel(files: List[Path]):
    """Parallel batch validation with progress tracking"""
    print("\n" + "=" * 60)
    print("Example 2: Parallel Batch Validation")
    print("=" * 60)
    
    client = DDEXClient()
    
    # Prepare items for batch processing
    items = []
    for file_path in files:
        with open(file_path, 'r') as f:
            content = f.read()
        
        # Auto-detect version or use specific version
        version = client.validator.detect_version(content) or "4.3"
        items.append((content, version, None))
    
    print(f"Processing {len(items)} files in parallel...")
    start_time = time.time()
    
    # Process in parallel
    results = client.validator.validate_batch(items, max_workers=3)
    
    elapsed = time.time() - start_time
    print(f"Completed in {elapsed:.2f} seconds")
    
    # Display results
    for i, (file_path, result) in enumerate(zip(files, results)):
        status = "✅" if result.valid else "❌"
        errors = result.metadata.error_count if result else 0
        print(f"  {status} {file_path.name}: {errors} errors")
    
    return results


def validate_directory_recursive():
    """Validate all XML files in directory recursively"""
    print("\n" + "=" * 60)
    print("Example 3: Directory Validation")
    print("=" * 60)
    
    client = DDEXClient()
    
    # Create nested directory structure
    base_dir = Path("batch_test")
    base_dir.mkdir(exist_ok=True)
    
    # Create files in main directory
    main_files = create_sample_files(base_dir)
    
    # Create subdirectory with more files
    sub_dir = base_dir / "subfolder"
    sub_files = create_sample_files(sub_dir)
    
    print(f"Validating directory: {base_dir}")
    print("Scanning for XML files...")
    
    # Validate entire directory
    results = client.validator.validate_directory(
        base_dir,
        version=None,  # Auto-detect
        pattern="*.xml",
        recursive=True
    )
    
    print(f"\nFound and validated {len(results)} files:")
    
    for file_path, result in results.items():
        relative_path = file_path.relative_to(base_dir)
        status = "✅" if result.valid else "❌"
        print(f"  {status} {relative_path}")
    
    # Clean up
    import shutil
    shutil.rmtree(base_dir)
    
    return results


def process_with_progress_callback():
    """Process files with progress callback"""
    print("\n" + "=" * 60)
    print("Example 4: Processing with Progress Tracking")
    print("=" * 60)
    
    client = DDEXClient()
    
    # Create sample files
    directory = Path("batch_progress")
    files = create_sample_files(directory)
    
    # Add more files for better progress demonstration
    for i in range(5, 11):
        file_path = directory / f"release_{i:03d}.xml"
        file_path.write_text(f"""<?xml version="1.0"?>
        <ern:NewReleaseMessage xmlns:ern="http://ddex.net/xml/ern/43">
            <MessageHeader><MessageId>MSG_{i:03d}</MessageId></MessageHeader>
        </ern:NewReleaseMessage>""")
        files.append(file_path)
    
    def progress_callback(completed: int, total: int, current_file: Path):
        """Progress callback function"""
        percentage = (completed / total) * 100
        bar_length = 40
        filled = int(bar_length * completed / total)
        bar = '█' * filled + '░' * (bar_length - filled)
        
        print(f"\r[{bar}] {percentage:.1f}% ({completed}/{total}) - {current_file.name}", 
              end='', flush=True)
    
    # Process with progress tracking
    from ddex_workbench.utils import batch_process_files
    
    def validate_file(file_path: Path):
        """Validation function for batch processing"""
        with open(file_path, 'r') as f:
            content = f.read()
        return client.validator.validate_auto(content)
    
    print("Processing files with progress tracking:")
    results = batch_process_files(
        files,
        validate_file,
        max_workers=3,
        progress_callback=progress_callback
    )
    
    print("\n\nCompleted!")
    
    # Clean up
    import shutil
    shutil.rmtree(directory)
    
    return results


def generate_summary_report():
    """Generate summary statistics and report"""
    print("\n" + "=" * 60)
    print("Example 5: Summary Statistics")
    print("=" * 60)
    
    client = DDEXClient()
    
    # Create and validate files
    directory = Path("batch_summary")
    files = create_sample_files(directory)
    
    # Validate all files
    results = []
    for file_path in files:
        with open(file_path, 'r') as f:
            content = f.read()
        result = client.validator.validate_auto(content)
        results.append(result)
    
    # Generate summary statistics
    stats = create_summary_statistics(results)
    
    print("📊 Validation Summary Statistics:")
    print(f"  Total files: {stats['total_files']}")
    print(f"  Valid files: {stats['valid_files']}")
    print(f"  Invalid files: {stats['invalid_files']}")
    print(f"  Validity rate: {stats['validity_rate']:.1f}%")
    print(f"  Total errors: {stats['total_errors']}")
    print(f"  Total warnings: {stats['total_warnings']}")
    print(f"  Avg errors per file: {stats['average_errors_per_file']:.2f}")
    print(f"  Avg processing time: {stats['average_processing_time_ms']:.2f}ms")
    
    if stats['errors_by_rule']:
        print("\n  Top error rules:")
        for rule, count in list(stats['errors_by_rule'].items())[:5]:
            print(f"    - {rule}: {count} occurrences")
    
    # Save summary to JSON
    import json
    summary_file = Path("validation_summary.json")
    summary_file.write_text(json.dumps(stats, indent=2, default=str))
    print(f"\n📄 Summary saved to: {summary_file}")
    
    # Clean up
    import shutil
    shutil.rmtree(directory)
    
    return stats


def main():
    """Run all batch processing examples"""
    print("\n🎵 DDEX Workbench SDK - Batch Processing Examples\n")
    
    # Create test directory
    test_dir = Path("batch_examples")
    test_dir.mkdir(exist_ok=True)
    
    # Create sample files
    files = create_sample_files(test_dir)
    
    try:
        # Run examples
        batch_validate_simple(files)
        batch_validate_parallel(files)
        validate_directory_recursive()
        process_with_progress_callback()
        generate_summary_report()
        
        print("\n✅ All batch processing examples completed!")
        
    finally:
        # Clean up
        import shutil
        if test_dir.exists():
            shutil.rmtree(test_dir)
        
        # Clean up report files
        for file in ["validation_summary.json", "report.txt", "report.json", "report.csv"]:
            path = Path(file)
            if path.exists():
                path.unlink()


if __name__ == "__main__":
    main()