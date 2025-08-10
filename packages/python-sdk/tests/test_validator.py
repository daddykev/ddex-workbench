# packages/python-sdk/tests/test_validator.py
"""
Unit tests for DDEXValidator
"""

import pytest
from unittest.mock import Mock, patch, MagicMock
from pathlib import Path
from concurrent.futures import Future

from ddex_workbench import DDEXClient, DDEXValidator
from ddex_workbench.types import ValidationResult, ValidationError as ValidationErrorDetail
from . import VALID_ERN_43_XML, INVALID_XML


class TestDDEXValidator:
    """Test DDEXValidator class"""
    
    def setup_method(self):
        """Set up test fixtures"""
        self.mock_client = Mock(spec=DDEXClient)
        self.validator = DDEXValidator(self.mock_client)
    
    def test_validator_initialization(self):
        """Test validator initialization"""
        client = DDEXClient()
        validator = DDEXValidator(client)
        assert validator.client == client
    
    def test_validate_ern43(self):
        """Test validate_ern43 shortcut"""
        mock_result = ValidationResult(
            valid=True,
            errors=[],
            warnings=[],
            metadata=Mock()
        )
        self.mock_client.validate.return_value = mock_result
        
        result = self.validator.validate_ern43(VALID_ERN_43_XML)
        
        self.mock_client.validate.assert_called_once_with(
            VALID_ERN_43_XML,
            version="4.3",
            profile=None
        )
        assert result == mock_result
    
    def test_validate_ern42(self):
        """Test validate_ern42 shortcut"""
        mock_result = ValidationResult(
            valid=True,
            errors=[],
            warnings=[],
            metadata=Mock()
        )
        self.mock_client.validate.return_value = mock_result
        
        result = self.validator.validate_ern42(VALID_ERN_43_XML, profile="AudioAlbum")
        
        self.mock_client.validate.assert_called_once_with(
            VALID_ERN_43_XML,
            version="4.2",
            profile="AudioAlbum"
        )
        assert result == mock_result
    
    def test_validate_ern382(self):
        """Test validate_ern382 shortcut"""
        mock_result = ValidationResult(
            valid=True,
            errors=[],
            warnings=[],
            metadata=Mock()
        )
        self.mock_client.validate.return_value = mock_result
        
        result = self.validator.validate_ern382(VALID_ERN_43_XML)
        
        self.mock_client.validate.assert_called_once_with(
            VALID_ERN_43_XML,
            version="3.8.2",
            profile=None
        )
        assert result == mock_result
    
    def test_detect_version(self):
        """Test version detection"""
        # Test ERN 4.3
        xml_43 = """<?xml version="1.0"?>
        <ern:NewReleaseMessage xmlns:ern="http://ddex.net/xml/ern/43">
        </ern:NewReleaseMessage>"""
        assert self.validator.detect_version(xml_43) == "4.3"
        
        # Test ERN 4.2
        xml_42 = """<?xml version="1.0"?>
        <ern:NewReleaseMessage xmlns:ern="http://ddex.net/xml/ern/42">
        </ern:NewReleaseMessage>"""
        assert self.validator.detect_version(xml_42) == "4.2"
        
        # Test ERN 3.8.2
        xml_382 = """<?xml version="1.0"?>
        <ern:NewReleaseMessage xmlns:ern="http://ddex.net/xml/ern/382">
        </ern:NewReleaseMessage>"""
        assert self.validator.detect_version(xml_382) == "3.8.2"
        
        # Test unknown version
        xml_unknown = """<?xml version="1.0"?>
        <ern:NewReleaseMessage xmlns:ern="http://ddex.net/xml/ern/unknown">
        </ern:NewReleaseMessage>"""
        assert self.validator.detect_version(xml_unknown) is None
    
    def test_validate_auto_success(self):
        """Test auto-validation with successful version detection"""
        xml_content = """<?xml version="1.0"?>
        <ern:NewReleaseMessage xmlns:ern="http://ddex.net/xml/ern/43">
        </ern:NewReleaseMessage>"""
        
        mock_result = ValidationResult(
            valid=True,
            errors=[],
            warnings=[],
            metadata=Mock()
        )
        self.mock_client.validate.return_value = mock_result
        
        result = self.validator.validate_auto(xml_content)
        
        self.mock_client.validate.assert_called_once_with(
            xml_content,
            version="4.3"
        )
        assert result == mock_result
    
    def test_validate_auto_no_version_detected(self):
        """Test auto-validation when version cannot be detected"""
        xml_content = """<?xml version="1.0"?>
        <UnknownRoot>
        </UnknownRoot>"""
        
        result = self.validator.validate_auto(xml_content)
        
        assert result.valid is False
        assert len(result.errors) == 1
        assert "Unable to detect ERN version" in result.errors[0].message
    
    def test_is_valid(self):
        """Test is_valid quick check"""
        mock_result = ValidationResult(
            valid=True,
            errors=[],
            warnings=[],
            metadata=Mock()
        )
        self.mock_client.validate.return_value = mock_result
        
        is_valid = self.validator.is_valid(VALID_ERN_43_XML, version="4.3")
        
        assert is_valid is True
        self.mock_client.validate.assert_called_once()
    
    def test_get_errors(self):
        """Test get_errors method"""
        mock_errors = [
            ValidationErrorDetail(
                line=1, column=1, message="Error 1",
                severity="error", rule="Rule1"
            ),
            ValidationErrorDetail(
                line=2, column=1, message="Error 2",
                severity="error", rule="Rule2"
            )
        ]
        mock_result = ValidationResult(
            valid=False,
            errors=mock_errors,
            warnings=[],
            metadata=Mock()
        )
        self.mock_client.validate.return_value = mock_result
        
        errors = self.validator.get_errors(INVALID_XML, version="4.3")
        
        assert len(errors) == 2
        assert errors[0].message == "Error 1"
    
    def test_get_critical_errors(self):
        """Test get_critical_errors filtering"""
        mock_errors = [
            ValidationErrorDetail(
                line=1, column=1, message="Critical",
                severity="error", rule="Rule1"
            ),
            ValidationErrorDetail(
                line=2, column=1, message="Warning",
                severity="warning", rule="Rule2"
            ),
            ValidationErrorDetail(
                line=3, column=1, message="Info",
                severity="info", rule="Rule3"
            )
        ]
        mock_result = ValidationResult(
            valid=False,
            errors=mock_errors,
            warnings=[],
            metadata=Mock()
        )
        self.mock_client.validate.return_value = mock_result
        
        critical = self.validator.get_critical_errors(INVALID_XML, version="4.3")
        
        assert len(critical) == 1
        assert critical[0].severity == "error"
    
    def test_validate_batch(self):
        """Test batch validation"""
        items = [
            ("xml1", "4.3", "AudioAlbum"),
            ("xml2", "4.2", None),
            ("xml3", "3.8.2", "AudioSingle")
        ]
        
        # Mock validation results
        mock_results = [
            ValidationResult(valid=True, errors=[], warnings=[], metadata=Mock()),
            ValidationResult(valid=False, errors=[Mock()], warnings=[], metadata=Mock()),
            ValidationResult(valid=True, errors=[], warnings=[], metadata=Mock())
        ]
        
        self.mock_client.validate.side_effect = mock_results
        
        results = self.validator.validate_batch(items, max_workers=2)
        
        assert len(results) == 3
        assert results[0].valid is True
        assert results[1].valid is False
        assert results[2].valid is True
    
    def test_validate_batch_with_error(self):
        """Test batch validation with errors"""
        items = [
            ("xml1", "4.3", None),
            ("xml2", "4.3", None)
        ]
        
        # First succeeds, second fails
        self.mock_client.validate.side_effect = [
            ValidationResult(valid=True, errors=[], warnings=[], metadata=Mock()),
            Exception("Validation failed")
        ]
        
        results = self.validator.validate_batch(items, max_workers=1)
        
        assert len(results) == 2
        assert results[0].valid is True
        assert results[1].valid is False
        assert "Validation failed" in results[1].errors[0].message
    
    def test_validate_directory(self, tmp_path):
        """Test directory validation"""
        # Create test XML files
        xml_file1 = tmp_path / "test1.xml"
        xml_file1.write_text(VALID_ERN_43_XML)
        
        xml_file2 = tmp_path / "test2.xml"
        xml_file2.write_text(INVALID_XML)
        
        # Mock validation results
        mock_results = [
            ValidationResult(valid=True, errors=[], warnings=[], metadata=Mock()),
            ValidationResult(valid=False, errors=[Mock()], warnings=[], metadata=Mock())
        ]
        self.mock_client.validate.side_effect = mock_results
        
        results = self.validator.validate_directory(tmp_path, version="4.3")
        
        assert len(results) == 2
        assert results[xml_file1].valid is True
        assert results[xml_file2].valid is False
    
    def test_validate_directory_recursive(self, tmp_path):
        """Test recursive directory validation"""
        # Create nested structure
        subdir = tmp_path / "subdir"
        subdir.mkdir()
        
        xml_file1 = tmp_path / "test1.xml"
        xml_file1.write_text(VALID_ERN_43_XML)
        
        xml_file2 = subdir / "test2.xml"
        xml_file2.write_text(VALID_ERN_43_XML)
        
        # Mock validation
        self.mock_client.validate.return_value = ValidationResult(
            valid=True, errors=[], warnings=[], metadata=Mock()
        )
        
        results = self.validator.validate_directory(
            tmp_path,
            version="4.3",
            recursive=True
        )
        
        assert len(results) == 2
        assert xml_file1 in results
        assert xml_file2 in results
    
    def test_validate_directory_not_found(self):
        """Test validate_directory with non-existent directory"""
        with pytest.raises(FileNotFoundError):
            self.validator.validate_directory(Path("nonexistent"), version="4.3")
    
    def test_validate_directory_not_a_directory(self, tmp_path):
        """Test validate_directory with file instead of directory"""
        file_path = tmp_path / "file.txt"
        file_path.write_text("not a directory")
        
        with pytest.raises(ValueError) as exc_info:
            self.validator.validate_directory(file_path, version="4.3")
        
        assert "Not a directory" in str(exc_info.value)