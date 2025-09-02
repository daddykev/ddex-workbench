// functions/validators/validationOrchestrator.js
const { ERNValidator } = require('./ernValidator');
const XSDValidator = require('./xsdValidator');
const SchematronValidator = require('./schematronValidator');

class ValidationOrchestrator {
  constructor() {
    this.ernValidator = null;
    this.xsdValidator = new XSDValidator();
    this.schematronValidator = new SchematronValidator();
  }

  async validateWithSVRL(xmlContent, type, version, profile) {
    // Run normal validation
    const results = await this.validate(xmlContent, type, version, profile);
    
    // Add SVRL if Schematron was used
    if (profile && this.schematronValidator) {
      try {
        // Re-run Schematron validation with SVRL generation option
        const schematronResult = await this.schematronValidator.validate(
          xmlContent,
          version,
          profile,
          { generateSVRL: true }  // ✅ This triggers SVRL generation
        );
        
        // Add SVRL to results if it was generated
        if (schematronResult.svrl) {
          results.svrl = schematronResult.svrl;
        }
      } catch (error) {
        console.warn('Could not generate SVRL:', error.message);
        results.svrlError = error.message;
      }
    }
    
    return results;
  }

  async validate(xmlContent, type, version, profile) {
    const results = {
      valid: true,
      errors: [],
      warnings: [],
      metadata: {
        startTime: Date.now(),
        version,
        profile,
        validationSteps: []
      }
    };

    try {
      // Step 1: XSD Schema Validation
      const xsdStartTime = Date.now();
      const xsdResult = await this.xsdValidator.validate(xmlContent, version);
      
      // Safely handle the result
      const xsdErrors = xsdResult && Array.isArray(xsdResult.errors) ? xsdResult.errors : [];
      
      results.validationSteps.push({
        type: 'XSD',
        duration: Date.now() - xsdStartTime,
        errorCount: xsdErrors.length
      });

      if (xsdResult && !xsdResult.valid) {
        results.valid = false;
        if (xsdErrors.length > 0) {
          results.errors.push(...xsdErrors);
        }
        
        // If XSD validation fails badly, might not continue
        if (this.hasFatalXSDErrors(xsdErrors)) {
          results.metadata.processingTime = Date.now() - results.metadata.startTime;
          return results;
        }
      }

      // Step 2: Business Rules Validation (ERN validator)
      const ernStartTime = Date.now();
      const ernValidator = this.getERNValidator(version);
      const ernResult = await ernValidator.validate(xmlContent, profile);
      
      // Safely handle the result
      const ernErrors = ernResult && Array.isArray(ernResult.errors) ? ernResult.errors : [];
      
      results.validationSteps.push({
        type: 'BusinessRules',
        duration: Date.now() - ernStartTime,
        errorCount: ernErrors.length
      });

      if (ernResult && !ernResult.valid) {
        results.valid = false;
        if (ernErrors.length > 0) {
          results.errors.push(...ernErrors);
        }
      }

      // Step 3: Schematron Validation (if available and profile specified)
      if (profile && this.schematronValidator) {
        const schematronStartTime = Date.now();
        try {
          const schematronResult = await this.schematronValidator.validate(
            xmlContent,
            version,
            profile
          );
          
          // Safely handle the result
          const schematronErrors = schematronResult && Array.isArray(schematronResult.errors) ? schematronResult.errors : [];
          const schematronWarnings = schematronResult && Array.isArray(schematronResult.warnings) ? schematronResult.warnings : [];
          
          results.validationSteps.push({
            type: 'Schematron',
            duration: Date.now() - schematronStartTime,
            errorCount: schematronErrors.length
          });

          if (schematronResult && !schematronResult.valid) {
            results.valid = false;
            if (schematronErrors.length > 0) {
              results.errors.push(...schematronErrors);
            }
          }
          
          // Add warnings from Schematron
          if (schematronWarnings.length > 0) {
            results.warnings.push(...schematronWarnings);
          }
        } catch (error) {
          console.warn('Schematron validation skipped:', error.message);
          // Continue without Schematron validation
        }
      }

      // Sort errors by line number (only if we have errors)
      if (results.errors.length > 0) {
        results.errors.sort((a, b) => {
          const aLine = a.line || 0;
          const bLine = b.line || 0;
          if (aLine !== bLine) return aLine - bLine;
          return (a.column || 0) - (b.column || 0);
        });
      }

      // Separate warnings from errors
      const allIssues = [...results.errors];
      results.warnings = allIssues.filter(e => e.severity === 'warning' || e.severity === 'info');
      results.errors = allIssues.filter(e => e.severity === 'error' || e.severity === 'fatal' || !e.severity);

      // Add enhanced metadata
      results.metadata.processingTime = Date.now() - results.metadata.startTime;
      results.metadata.schemaVersion = `ERN ${version}`;
      results.metadata.validatedAt = new Date().toISOString();
      results.metadata.errorCount = results.errors.length;
      results.metadata.warningCount = results.warnings.length;

    } catch (error) {
      console.error('Validation orchestrator error:', error);
      results.valid = false;
      results.errors = [{
        line: 0,
        column: 0,
        message: `Validation system error: ${error.message}`,
        severity: 'error',
        rule: 'System-Error'
      }];
      results.metadata.processingTime = Date.now() - results.metadata.startTime;
    }

    return results;
  }

  hasFatalXSDErrors(errors) {
    if (!errors || !Array.isArray(errors)) return false;
    // Check if there are errors that prevent further validation
    return errors.some(error => 
      error.message && (
        error.message.includes('Cannot parse') ||
        error.message.includes('Premature end of data')
      )
    );
  }
}

module.exports = ValidationOrchestrator;