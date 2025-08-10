#!/usr/bin/env python3
# packages/python-sdk/examples/basic_validation.py
"""
Basic validation example for DDEX Workbench SDK

This example demonstrates:
- Simple XML validation
- File validation
- URL validation
- Error handling
- Report generation
"""

import sys
from pathlib import Path
from ddex_workbench import DDEXClient
from ddex_workbench.errors import DDEXError, RateLimitError
from ddex_workbench.utils import format_validation_report


def validate_xml_string():
    """Example: Validate XML content as string"""
    print("=" * 60)
    print("Example 1: Validate XML String")
    print("=" * 60)
    
    # Initialize client (API key optional for higher rate limits)
    client = DDEXClient()
    
    # Sample ERN XML (minimal example)
    xml_content = """<?xml version="1.0" encoding="UTF-8"?>
    <ern:NewReleaseMessage xmlns:ern="http://ddex.net/xml/ern/43" 
        MessageSchemaVersionId="ern/43"
        LanguageAndScriptCode="en">
        <MessageHeader>
            <MessageId>MSG_EXAMPLE_001</MessageId>
            <MessageCreatedDateTime>2024-01-01T00:00:00Z</MessageCreatedDateTime>
            <MessageControlType>TestMessage</MessageControlType>
        </MessageHeader>
        <!-- Missing required elements for demonstration -->
    </ern:NewReleaseMessage>"""
    
    try:
        # Validate the XML
        result = client.validate(xml_content, version="4.3", profile="AudioAlbum")
        
        # Check if valid
        if result.valid:
            print("✅ XML is valid!")
        else:
            print(f"❌ XML is invalid with {len(result.errors)} errors:")
            
            # Show first 5 errors
            for i, error in enumerate(result.errors[:5], 1):
                print(f"\n  Error {i}:")
                print(f"    Line {error.line}, Column {error.column}")
                print(f"    Rule: {error.rule}")
                print(f"    Message: {error.message}")
                if error.suggestion:
                    print(f"    Suggestion: {error.suggestion}")
        
        # Show metadata
        print(f"\n📊 Validation Metadata:")
        print(f"  Processing time: {result.metadata.processing_time}ms")
        print(f"  Schema version: {result.metadata.schema_version}")
        print(f"  Error count: {result.metadata.error_count}")
        print(f"  Warning count: {result.metadata.warning_count}")
        
    except RateLimitError as e:
        print(f"⚠️ Rate limited: {e.get_retry_message()}")
    except DDEXError as e:
        print(f"❌ Error: {e}")


def validate_file():
    """Example: Validate XML file"""
    print("\n" + "=" * 60)
    print("Example 2: Validate XML File")
    print("=" * 60)
    
    client = DDEXClient()
    
    # Create a sample file for demonstration
    sample_file = Path("sample_release.xml")
    sample_file.write_text("""<?xml version="1.0" encoding="UTF-8"?>
    <ern:NewReleaseMessage xmlns:ern="http://ddex.net/xml/ern/43" 
        MessageSchemaVersionId="ern/43">
        <MessageHeader>
            <MessageId>MSG_FILE_001</MessageId>
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
    
    try:
        # Validate the file
        result = client.validate_file(sample_file, version="4.3")
        
        print(f"File: {sample_file}")
        print(f"Status: {'✅ Valid' if result.valid else '❌ Invalid'}")
        print(f"Errors: {result.metadata.error_count}")
        print(f"Warnings: {result.metadata.warning_count}")
        
        # Generate and save report
        if not result.valid:
            report = format_validation_report(result, format_type="text")
            report_file = Path("validation_report.txt")
            report_file.write_text(report)
            print(f"\n📄 Report saved to: {report_file}")
        
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        # Clean up
        if sample_file.exists():
            sample_file.unlink()


def validate_from_url():
    """Example: Validate XML from URL"""
    print("\n" + "=" * 60)
    print("Example 3: Validate from URL")
    print("=" * 60)
    
    client = DDEXClient()
    
    # Example URL (replace with actual URL)
    url = "https://example.com/sample_release.xml"
    
    try:
        print(f"Validating: {url}")
        result = client.validate_url(url, version="4.3")
        
        print(f"Status: {'✅ Valid' if result.valid else '❌ Invalid'}")
        
    except Exception as e:
        print(f"⚠️ Could not validate from URL: {e}")
        print("(This is expected if the URL doesn't exist)")


def auto_detect_version():
    """Example: Auto-detect ERN version"""
    print("\n" + "=" * 60)
    print("Example 4: Auto-detect Version")
    print("=" * 60)
    
    client = DDEXClient()
    
    # XML with version information
    xml_content = """<?xml version="1.0" encoding="UTF-8"?>
    <ern:NewReleaseMessage xmlns:ern="http://ddex.net/xml/ern/382" 
        MessageSchemaVersionId="ern/382">
        <MessageHeader>
            <MessageId>MSG_382_001</MessageId>
        </MessageHeader>
    </ern:NewReleaseMessage>"""
    
    try:
        # Auto-detect and validate
        result = client.validator.validate_auto(xml_content)
        
        print(f"Detected version: {result.metadata.schema_version}")
        print(f"Valid: {result.valid}")
        
    except Exception as e:
        print(f"❌ Error: {e}")


def generate_reports():
    """Example: Generate validation reports in different formats"""
    print("\n" + "=" * 60)
    print("Example 5: Generate Reports")
    print("=" * 60)
    
    client = DDEXClient()
    
    # Validate something
    xml_content = """<?xml version="1.0" encoding="UTF-8"?>
    <ern:NewReleaseMessage xmlns:ern="http://ddex.net/xml/ern/43">
    </ern:NewReleaseMessage>"""
    
    result = client.validate(xml_content, version="4.3")
    
    # Generate different report formats
    from ddex_workbench.utils import format_validation_report
    
    # Text report
    text_report = format_validation_report(result, format_type="text")
    Path("report.txt").write_text(text_report)
    print("📄 Generated: report.txt")
    
    # JSON report
    json_report = format_validation_report(result, format_type="json")
    Path("report.json").write_text(json_report)
    print("📄 Generated: report.json")
    
    # CSV report
    csv_report = format_validation_report(result, format_type="csv")
    Path("report.csv").write_text(csv_report)
    print("📄 Generated: report.csv")
    
    print("\nReports generated successfully!")


def main():
    """Run all examples"""
    print("\n🎵 DDEX Workbench SDK - Basic Validation Examples\n")
    
    # Run examples
    validate_xml_string()
    validate_file()
    validate_from_url()
    auto_detect_version()
    generate_reports()
    
    print("\n✅ All examples completed!")
    print("\nFor more examples, see the documentation at:")
    print("https://ddex-workbench.org/docs")


if __name__ == "__main__":
    main()