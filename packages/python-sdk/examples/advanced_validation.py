# examples/advanced_validation.py
from ddex_workbench import DDEXClient, DDEXValidator
from ddex_workbench.types import ValidationOptions

client = DDEXClient(api_key="your-key")
validator = DDEXValidator(client)

# Auto-detect version
result = validator.validate_auto(xml_content)

# Batch validation with concurrency
from pathlib import Path
files = list(Path("releases").glob("*.xml"))
batch_result = validator.validate_batch(files, version="4.3", max_workers=8)
print(f"Validated {batch_result.total_files} files in {batch_result.processing_time:.2f}s")

# Generate SVRL report
result, svrl = client.validate_with_svrl(xml_content, version="4.3", profile="AudioAlbum")
if svrl:
    with open("validation-report.svrl", "w") as f:
        f.write(svrl)

# Profile compliance check
summary = validator.get_profile_compliance(xml_content, "4.3", "AudioAlbum")
print(f"Compliance: {summary.pass_rate:.1%}")
print(f"Schematron errors: {summary.schematron_errors}")
print(f"XSD errors: {summary.xsd_errors}")

# Advanced error filtering
schematron_errors = validator.get_schematron_errors(result)
xsd_errors = validator.get_xsd_errors(result)
formatted = validator.format_errors(result, group_by_rule=True)
print(formatted)