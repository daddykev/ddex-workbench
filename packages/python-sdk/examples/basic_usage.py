# examples/basic_usage.py
from ddex_workbench import DDEXClient

# Initialize client
client = DDEXClient(api_key="ddex_your-api-key")  # Optional API key

# Validate XML string
xml_content = """<?xml version="1.0" encoding="UTF-8"?>
<ern:NewReleaseMessage xmlns:ern="http://ddex.net/xml/ern/43">
    <!-- Your ERN content -->
</ern:NewReleaseMessage>"""

result = client.validate(xml_content, version="4.3", profile="AudioAlbum")

if result.valid:
    print("✅ Validation passed!")
else:
    print(f"❌ Found {len(result.errors)} errors:")
    for error in result.errors[:5]:
        print(f"  Line {error.line}: {error.message}")

# Validate file
result = client.validate_file("path/to/release.xml", version="4.3")

# Batch validation
from pathlib import Path

xml_files = Path("releases").glob("*.xml")
for xml_file in xml_files:
    result = client.validate_file(xml_file, version="4.3")
    print(f"{xml_file.name}: {'✅ Valid' if result.valid else '❌ Invalid'}")