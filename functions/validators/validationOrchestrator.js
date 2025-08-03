// functions/validators/validationOrchestrator.js
const { ERNValidator } = require('./ernValidator');
const XSDValidator = require('./xsdValidator');
const SchematronValidator = require('./schematronValidator');

class ValidationOrchestrator {
  constructor() {
    this.ernValidator = new ERNValidator();
    this.xsdValidator = new XSDValidator();
    this.schematronValidator = new SchematronValidator();
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
      const xsdResult = await this.xsdValidator.validate(xmlContent, version);
      results.validationSteps.push({
        type: 'XSD',
        duration: Date.now() - results.metadata.startTime,
        errorCount: xsdResult.errors.length
      });

      if (!xsdResult.valid) {
        results.valid = false;
        results.errors.push(...xsdResult.errors);
        
        // If XSD validation fails badly, might not continue
        if (this.hasFatalXSDErrors(xsdResult.errors)) {
          results.metadata.processingTime = Date.now() - results.metadata.startTime;
          return results;
        }
      }

      // Step 2: Business Rules Validation (current ernValidator)
      const ernResult = await this.ernValidator.validate(xmlContent, profile);
      results.validationSteps.push({
        type: 'BusinessRules',
        duration: Date.now() - results.validationSteps[0].duration,
        errorCount: ernResult.errors.length
      });

      if (!ernResult.valid) {
        results.valid = false;
        results.errors.push(...ernResult.errors);
      }

      // Step 3: Schematron Validation (if available and profile specified)
      if (profile && this.schematronValidator) {
        try {
          const schematronResult = await this.schematronValidator.validate(
            xmlContent,
            version,
            profile
          );
          results.validationSteps.push({
            type: 'Schematron',
            duration: Date.now() - results.validationSteps[1].duration,
            errorCount: schematronResult.errors.length
          });

          if (!schematronResult.valid) {
            results.valid = false;
            results.errors.push(...schematronResult.errors);
          }
        } catch (error) {
          console.warn('Schematron validation skipped:', error.message);
          // Continue without Schematron validation
        }
      }

      // Sort errors by line number
      results.errors.sort((a, b) => {
        if (a.line !== b.line) return a.line - b.line;
        return a.column - b.column;
      });

      // Separate warnings from errors
      results.warnings = results.errors.filter(e => e.severity === 'warning');
      results.errors = results.errors.filter(e => e.severity !== 'warning');

      // Add enhanced metadata
      results.metadata.processingTime = Date.now() - results.metadata.startTime;
      results.metadata.schemaVersion = `ERN ${version}`;
      results.metadata.validatedAt = new Date().toISOString();
      results.metadata.errorCount = results.errors.length;
      results.metadata.warningCount = results.warnings.length;

    } catch (error) {
      results.valid = false;
      results.errors.push({
        line: 0,
        column: 0,
        message: `Validation system error: ${error.message}`,
        severity: 'error',
        rule: 'System-Error'
      });
      results.metadata.processingTime = Date.now() - results.metadata.startTime;
    }

    return results;
  }

  hasFatalXSDErrors(errors) {
    // Check if there are errors that prevent further validation
    return errors.some(error => 
      error.message.includes('Cannot parse') ||
      error.message.includes('Premature end of data')
    );
  }
}

module.exports = ValidationOrchestrator;