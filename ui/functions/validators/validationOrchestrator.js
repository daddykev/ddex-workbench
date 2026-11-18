// functions/validators/validationOrchestrator.js
const { ERNValidator } = require('./ernValidator');
const XSDValidator = require('./xsdValidator');
const SchematronValidator = require('./schematronValidator');

class ValidationOrchestrator {
  constructor() {
    this.ernValidatorCache = new Map(); // Cache validators by version
    this.xsdValidator = new XSDValidator();
    this.schematronValidator = new SchematronValidator();
  }

  // ADD THIS MISSING METHOD
  getERNValidator(version) {
    if (!this.ernValidatorCache.has(version)) {
      this.ernValidatorCache.set(version, new ERNValidator(version));
    }
    return this.ernValidatorCache.get(version);
  }

  async validateWithSVRL(xmlContent, type, version, profile) {
    // Run normal validation first
    const results = await this.validate(xmlContent, type, version, profile);
    
    // If profile is specified, generate SVRL
    if (profile && this.schematronValidator) {
      try {
        // Use the SchematronValidator to generate SVRL
        const svrlResult = await this.schematronValidator.validate(
          xmlContent,
          version,
          profile,
          { generateSVRL: true }
        );
        
        // Add SVRL to results if it was generated
        if (svrlResult && svrlResult.svrl) {
          results.svrl = svrlResult.svrl;
        }
        
        // Merge Schematron errors if not already included
        if (svrlResult && svrlResult.errors && svrlResult.errors.length > 0) {
          // Check if Schematron errors are already in results
          const hasSchematronErrors = results.errors.some(e => e.rule && e.rule.includes('Schematron'));
          if (!hasSchematronErrors) {
            results.errors.push(...svrlResult.errors);
            results.valid = results.errors.length === 0;
          }
        }
        
      } catch (error) {
        console.warn('Could not generate SVRL:', error.message);
        if (results) {
          results.svrlError = error.message;
        }
      }
    }
    
    return results;
  }

  async validate(xmlContent, type, version, profile) {
    console.log('ValidationOrchestrator.validate() starting');
    
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

    console.log('Initial results object created:', {
      errorsIsArray: Array.isArray(results.errors),
      warningsIsArray: Array.isArray(results.warnings),
      validationStepsIsArray: Array.isArray(results.metadata.validationSteps)
    });

    try {
      // Step 1: XSD Schema Validation
      console.log('Starting XSD validation...');
      const xsdStartTime = Date.now();
      let xsdErrors = [];
      
      try {
        const xsdResult = await this.xsdValidator.validate(xmlContent, version);
        console.log('XSD Result:', { hasErrors: !!xsdResult?.errors, errorsLength: xsdResult?.errors?.length });
        
        xsdErrors = (xsdResult && Array.isArray(xsdResult.errors)) ? xsdResult.errors : [];
        console.log('XSD Errors processed:', { count: xsdErrors.length });
        
      } catch (xsdError) {
        console.log('XSD validation threw error:', xsdError.message);
        xsdErrors = [{
          line: 0,
          column: 0,
          message: `XSD validation error: ${xsdError.message}`,
          severity: 'error',
          rule: 'XSD-System-Error'
        }];
      }
      
      console.log('About to push XSD validation step...');
      console.log('validationSteps is array?', Array.isArray(results.metadata.validationSteps));
      
      results.metadata.validationSteps.push({
        type: 'XSD',
        duration: Date.now() - xsdStartTime,
        errorCount: xsdErrors.length
      });
      
      console.log('XSD validation step pushed successfully');

      if (xsdErrors.length > 0) {
        console.log('About to push XSD errors...');
        console.log('results.errors is array?', Array.isArray(results.errors));
        
        results.errors.push(...xsdErrors);
        results.valid = false;
        
        console.log('XSD errors pushed successfully');
      }

      // Continue with ERN validation...
      console.log('Starting ERN validation...');
      const ernStartTime = Date.now();
      let ernErrors = [];
      
      try {
        console.log('Getting ERN validator...');
        const ernValidator = this.getERNValidator(version);
        console.log('ERN validator obtained, calling validate...');
        
        const ernResult = await ernValidator.validate(xmlContent, profile);
        console.log('ERN Result:', { hasErrors: !!ernResult?.errors, errorsLength: ernResult?.errors?.length });
        
        ernErrors = (ernResult && Array.isArray(ernResult.errors)) ? ernResult.errors : [];
        console.log('ERN Errors processed:', { count: ernErrors.length });
        
      } catch (ernError) {
        console.log('ERN validation threw error:', ernError.message);
        ernErrors = [{
          line: 0,
          column: 0,
          message: `ERN validation error: ${ernError.message}`,
          severity: 'error',
          rule: 'ERN-System-Error'
        }];
      }
      
      console.log('About to push ERN validation step...');
      results.metadata.validationSteps.push({
        type: 'BusinessRules',
        duration: Date.now() - ernStartTime,
        errorCount: ernErrors.length
      });
      console.log('ERN validation step pushed successfully');

      if (ernErrors.length > 0) {
        console.log('About to push ERN errors...');
        console.log('results.errors is array?', Array.isArray(results.errors));
        
        results.errors.push(...ernErrors);
        results.valid = false;
        
        console.log('ERN errors pushed successfully');
      }

      // Add final metadata
      results.metadata.processingTime = Date.now() - results.metadata.startTime;
      results.metadata.schemaVersion = `ERN ${version}`;
      results.metadata.validatedAt = new Date().toISOString();
      results.metadata.errorCount = results.errors.length;
      results.metadata.warningCount = results.warnings.length;

      console.log('Validation completed successfully');
      return results;

    } catch (error) {
      console.error('Validation orchestrator caught error:', error);
      console.error('Error stack:', error.stack);
      
      // Even in error case, ensure we return a valid structure
      return {
        valid: false,
        errors: [{
          line: 0,
          column: 0,
          message: `Validation system error: ${error.message}`,
          severity: 'error',
          rule: 'System-Error'
        }],
        warnings: [],
        metadata: {
          processingTime: Date.now() - results.metadata.startTime,
          schemaVersion: `ERN ${version}`,
          validatedAt: new Date().toISOString(),
          errorCount: 1,
          warningCount: 0,
          validationSteps: []
        }
      };
    }
  }

  hasFatalXSDErrors(errors) {
    if (!errors || !Array.isArray(errors)) return false;
    // Check if there are errors that prevent further validation
    return errors.some(error => 
      error.message && (
        error.message.includes('Cannot parse') ||
        error.message.includes('Premature end of data') ||
        error.message.includes('XML validation error')
      )
    );
  }
}

module.exports = ValidationOrchestrator;