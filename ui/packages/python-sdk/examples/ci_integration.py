#!/usr/bin/env python3
# packages/python-sdk/examples/ci_integration.py
"""
CI/CD Integration example for DDEX Workbench SDK

This example demonstrates how to integrate DDEX validation
into continuous integration pipelines like GitHub Actions,
GitLab CI, Jenkins, etc.

Features:
- Exit codes for CI systems
- JUnit XML output for test reports
- Threshold-based validation
- Environment variable configuration
- Docker integration example
"""

import os
import sys
import json
import argparse
from pathlib import Path
from typing import List, Optional
from xml.etree.ElementTree import Element, SubElement, tostring
from datetime import datetime

from ddex_workbench import DDEXClient
from ddex_workbench.errors import DDEXError


class CIValidator:
    """CI/CD-friendly validator with reporting"""
    
    def __init__(self, api_key: Optional[str] = None):
        """Initialize CI validator"""
        # Get API key from environment or parameter
        self.api_key = api_key or os.environ.get("DDEX_API_KEY")
        self.base_url = os.environ.get("DDEX_API_URL", "https://api.ddex-workbench.org/v1")
        
        self.client = DDEXClient(
            api_key=self.api_key,
            base_url=self.base_url
        )
        
        self.results = []
        self.start_time = None
        self.end_time = None
    
    def validate_files(
        self,
        files: List[Path],
        version: str = None,
        profile: str = None,
        fail_on_warnings: bool = False,
        max_errors: int = None
    ) -> bool:
        """
        Validate multiple files for CI
        
        Returns:
            bool: True if all validations pass criteria, False otherwise
        """
        self.start_time = datetime.now()
        all_valid = True
        
        for file_path in files:
            print(f"Validating: {file_path}...", end=" ")
            
            try:
                with open(file_path, 'r') as f:
                    content = f.read()
                
                # Validate
                if version:
                    result = self.client.validate(content, version, profile)
                else:
                    result = self.client.validator.validate_auto(content)
                
                self.results.append({
                    "file": str(file_path),
                    "result": result,
                    "error": None
                })
                
                # Check validation criteria
                is_valid = result.valid
                
                if fail_on_warnings and len(result.warnings) > 0:
                    is_valid = False
                    print(f"❌ Failed (warnings treated as errors)")
                elif max_errors and result.metadata.error_count > max_errors:
                    is_valid = False
                    print(f"❌ Failed (exceeds error threshold: {result.metadata.error_count} > {max_errors})")
                elif not result.valid:
                    print(f"❌ Failed ({result.metadata.error_count} errors)")
                else:
                    print("✅ Passed")
                
                if not is_valid:
                    all_valid = False
                    
            except Exception as e:
                print(f"❌ Error: {e}")
                self.results.append({
                    "file": str(file_path),
                    "result": None,
                    "error": str(e)
                })
                all_valid = False
        
        self.end_time = datetime.now()
        return all_valid
    
    def generate_junit_xml(self, output_file: Path):
        """Generate JUnit XML report for CI systems"""
        testsuite = Element('testsuite')
        testsuite.set('name', 'DDEX Validation')
        testsuite.set('tests', str(len(self.results)))
        testsuite.set('timestamp', self.start_time.isoformat())
        
        # Calculate totals
        failures = sum(1 for r in self.results 
                      if r['result'] and not r['result'].valid)
        errors = sum(1 for r in self.results if r['error'])
        
        testsuite.set('failures', str(failures))
        testsuite.set('errors', str(errors))
        testsuite.set('time', str((self.end_time - self.start_time).total_seconds()))
        
        for result_data in self.results:
            testcase = SubElement(testsuite, 'testcase')
            testcase.set('classname', 'DDEXValidation')
            testcase.set('name', Path(result_data['file']).name)
            
            if result_data['error']:
                error = SubElement(testcase, 'error')
                error.set('message', result_data['error'])
                error.text = result_data['error']
            elif result_data['result'] and not result_data['result'].valid:
                failure = SubElement(testcase, 'failure')
                failure.set('message', f"{result_data['result'].metadata.error_count} validation errors")
                
                # Add error details
                error_text = []
                for err in result_data['result'].errors[:10]:
                    error_text.append(f"Line {err.line}: {err.message}")
                failure.text = '\n'.join(error_text)
        
        # Write XML
        xml_str = tostring(testsuite, encoding='unicode')
        output_file.write_text(f'<?xml version="1.0" encoding="UTF-8"?>\n{xml_str}')
        print(f"📄 JUnit report saved to: {output_file}")
    
    def generate_json_report(self, output_file: Path):
        """Generate JSON report for further processing"""
        report = {
            "summary": {
                "total_files": len(self.results),
                "passed": sum(1 for r in self.results 
                            if r['result'] and r['result'].valid),
                "failed": sum(1 for r in self.results 
                            if r['result'] and not r['result'].valid),
                "errors": sum(1 for r in self.results if r['error']),
                "start_time": self.start_time.isoformat(),
                "end_time": self.end_time.isoformat(),
                "duration": (self.end_time - self.start_time).total_seconds()
            },
            "files": []
        }
        
        for result_data in self.results:
            file_report = {
                "file": result_data['file'],
                "status": "error" if result_data['error'] else 
                         ("passed" if result_data['result'].valid else "failed")
            }
            
            if result_data['result']:
                file_report["errors"] = result_data['result'].metadata.error_count
                file_report["warnings"] = result_data['result'].metadata.warning_count
                file_report["processing_time"] = result_data['result'].metadata.processing_time
            
            if result_data['error']:
                file_report["error_message"] = result_data['error']
            
            report["files"].append(file_report)
        
        output_file.write_text(json.dumps(report, indent=2))
        print(f"📄 JSON report saved to: {output_file}")


def github_actions_example():
    """Example: GitHub Actions integration"""
    print("=" * 60)
    print("GitHub Actions Integration Example")
    print("=" * 60)
    
    # In GitHub Actions, you would typically:
    # 1. Get files from the repository
    # 2. Validate them
    # 3. Set output variables
    # 4. Fail the build if validation fails
    
    print("""
# Example GitHub Actions workflow:
# .github/workflows/ddex-validation.yml

name: DDEX Validation
on: [push, pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Set up Python
        uses: actions/setup-python@v2
        with:
          python-version: '3.9'
      
      - name: Install DDEX SDK
        run: pip install ddex-workbench
      
      - name: Validate DDEX files
        env:
          DDEX_API_KEY: ${{ secrets.DDEX_API_KEY }}
        run: |
          python ci_integration.py \\
            --files releases/*.xml \\
            --version 4.3 \\
            --junit-output test-results.xml
      
      - name: Upload test results
        uses: actions/upload-artifact@v2
        if: always()
        with:
          name: test-results
          path: test-results.xml
    """)


def docker_example():
    """Example: Docker integration"""
    print("\n" + "=" * 60)
    print("Docker Integration Example")
    print("=" * 60)
    
    print("""
# Dockerfile example:

FROM python:3.9-slim

WORKDIR /app

# Install SDK
RUN pip install ddex-workbench

# Copy validation script
COPY ci_validator.py .

# Copy XML files
COPY releases/ releases/

# Run validation
CMD ["python", "ci_validator.py", "--files", "releases/*.xml"]

# Build and run:
# docker build -t ddex-validator .
# docker run -e DDEX_API_KEY=$DDEX_API_KEY ddex-validator
    """)


def jenkins_example():
    """Example: Jenkins integration"""
    print("\n" + "=" * 60)
    print("Jenkins Integration Example")
    print("=" * 60)
    
    print("""
// Jenkinsfile example:

pipeline {
    agent any
    
    environment {
        DDEX_API_KEY = credentials('ddex-api-key')
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Validate DDEX') {
            steps {
                sh '''
                    pip install ddex-workbench
                    python ci_integration.py \\
                        --files releases/*.xml \\
                        --version 4.3 \\
                        --junit-output results.xml
                '''
            }
        }
        
        stage('Publish Results') {
            steps {
                junit 'results.xml'
            }
        }
    }
    
    post {
        always {
            archiveArtifacts artifacts: '*.xml', fingerprint: true
        }
    }
}
    """)


def main():
    """Main CI integration example"""
    parser = argparse.ArgumentParser(description='DDEX CI/CD Validator')
    parser.add_argument('--files', nargs='+', help='Files to validate', default=[])
    parser.add_argument('--directory', help='Directory to scan for XML files')
    parser.add_argument('--version', help='ERN version (e.g., 4.3)')
    parser.add_argument('--profile', help='Validation profile')
    parser.add_argument('--fail-on-warnings', action='store_true', 
                       help='Treat warnings as errors')
    parser.add_argument('--max-errors', type=int, 
                       help='Maximum allowed errors per file')
    parser.add_argument('--junit-output', help='JUnit XML output file')
    parser.add_argument('--json-output', help='JSON report output file')
    parser.add_argument('--show-examples', action='store_true',
                       help='Show CI integration examples')
    
    args = parser.parse_args()
    
    if args.show_examples:
        print("\n🎵 DDEX Workbench SDK - CI/CD Integration Examples\n")
        github_actions_example()
        docker_example()
        jenkins_example()
        return 0
    
    # Collect files to validate
    files_to_validate = []
    
    if args.files:
        files_to_validate.extend([Path(f) for f in args.files])
    
    if args.directory:
        directory = Path(args.directory)
        files_to_validate.extend(directory.glob("**/*.xml"))
    
    if not files_to_validate:
        # Create sample files for demonstration
        print("No files specified. Creating sample files for demonstration...")
        test_dir = Path("ci_test")
        test_dir.mkdir(exist_ok=True)
        
        # Create a valid file
        valid_file = test_dir / "valid.xml"
        valid_file.write_text("""<?xml version="1.0" encoding="UTF-8"?>
        <ern:NewReleaseMessage xmlns:ern="http://ddex.net/xml/ern/43" 
            MessageSchemaVersionId="ern/43">
            <MessageHeader>
                <MessageId>MSG_CI_001</MessageId>
                <MessageCreatedDateTime>2024-01-01T00:00:00Z</MessageCreatedDateTime>
            </MessageHeader>
            <ResourceList><SoundRecording><ResourceReference>A1</ResourceReference></SoundRecording></ResourceList>
            <ReleaseList><Release><ReleaseReference>R0</ReleaseReference></Release></ReleaseList>
            <DealList><ReleaseDeal><DealReleaseReference>R0</DealReleaseReference></ReleaseDeal></DealList>
        </ern:NewReleaseMessage>""")
        
        # Create an invalid file
        invalid_file = test_dir / "invalid.xml"
        invalid_file.write_text("""<?xml version="1.0" encoding="UTF-8"?>
        <ern:NewReleaseMessage xmlns:ern="http://ddex.net/xml/ern/43">
            <MessageHeader></MessageHeader>
        </ern:NewReleaseMessage>""")
        
        files_to_validate = [valid_file, invalid_file]
    
    # Run validation
    print(f"\n🔍 Validating {len(files_to_validate)} files...\n")
    
    validator = CIValidator()
    all_valid = validator.validate_files(
        files_to_validate,
        version=args.version,
        profile=args.profile,
        fail_on_warnings=args.fail_on_warnings,
        max_errors=args.max_errors
    )
    
    # Generate reports
    if args.junit_output:
        validator.generate_junit_xml(Path(args.junit_output))
    
    if args.json_output:
        validator.generate_json_report(Path(args.json_output))
    
    # Summary
    print("\n" + "=" * 60)
    print("Validation Summary")
    print("=" * 60)
    
    passed = sum(1 for r in validator.results 
                if r['result'] and r['result'].valid)
    failed = len(validator.results) - passed
    
    print(f"Total files: {len(validator.results)}")
    print(f"Passed: {passed}")
    print(f"Failed: {failed}")
    
    # Clean up demo files
    if Path("ci_test").exists():
        import shutil
        shutil.rmtree("ci_test")
    
    # Exit with appropriate code for CI
    if all_valid:
        print("\n✅ All validations passed!")
        return 0
    else:
        print("\n❌ Validation failed!")
        return 1


if __name__ == "__main__":
    sys.exit(main())