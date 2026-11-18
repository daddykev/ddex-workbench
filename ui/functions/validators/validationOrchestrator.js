// functions/validators/validationOrchestrator.js
const { ERNValidator } = require('./ernValidator');
const XSDValidator = require('./xsdValidator');
const SchematronValidator = require('./schematronValidator');

// Response size limits. XSD errors can quote the input (e.g. a whole line of a
// malformed message), so long text is cut and each stage returns at most
// MAX_ISSUES_PER_STEP issues.
const MAX_TEXT_LENGTH = 300;
const MAX_ISSUES_PER_STEP = 100;

const truncateText = (value) => {
  if (typeof value !== 'string' || value.length <= MAX_TEXT_LENGTH) return value;
  return value.slice(0, MAX_TEXT_LENGTH) + '…';
};

const trimIssue = (issue) => ({
  ...issue,
  message: truncateText(issue.message),
  ...(issue.context !== undefined && { context: truncateText(issue.context) })
});

class ValidationOrchestrator {
  constructor() {
    this.ernValidatorCache = new Map(); // Cache validators by version
    this.xsdValidator = new XSDValidator();
    this.schematronValidator = new SchematronValidator();
  }

  getERNValidator(version) {
    if (!this.ernValidatorCache.has(version)) {
      this.ernValidatorCache.set(version, new ERNValidator(version));
    }
    return this.ernValidatorCache.get(version);
  }

  /**
   * Run the validation pipeline:
   *   1. XSD schema (stops here if the XML isn't well-formed)
   *   2. Business rules
   *   3. Schematron rules, only when a profile is given
   *   4. SVRL report, only when options.generateSVRL is true (reuses step 3's results)
   *
   * Items with severity 'warning' or 'info' go to `warnings`; `valid` is true when
   * there are no errors.
   */
  async validate(xmlContent, type, version, profile, options = {}) {
    const startTime = Date.now();
    const results = {
      valid: true,
      errors: [],
      warnings: [],
      svrl: null,
      metadata: {
        version,
        profile,
        validationSteps: []
      }
    };
    let truncatedErrors = 0;

    // Record a step's issues, routing them to errors or warnings by severity.
    // errorCount/warningCount report the full totals; the returned lists are capped.
    const addStep = (type, stepStart, issues) => {
      const allErrors = issues.filter(i => (i.severity || 'error') === 'error' || i.severity === 'fatal');
      const allWarnings = issues.filter(i => i.severity === 'warning' || i.severity === 'info');
      const stepErrors = allErrors.slice(0, MAX_ISSUES_PER_STEP).map(trimIssue);
      const stepWarnings = allWarnings
        .slice(0, Math.max(0, MAX_ISSUES_PER_STEP - stepErrors.length))
        .map(trimIssue);
      truncatedErrors += (allErrors.length - stepErrors.length) + (allWarnings.length - stepWarnings.length);
      results.errors.push(...stepErrors);
      results.warnings.push(...stepWarnings);
      results.metadata.validationSteps.push({
        type,
        duration: Date.now() - stepStart,
        errorCount: allErrors.length,
        warningCount: allWarnings.length
      });
    };

    try {
      // Step 1: XSD schema validation
      const xsdStart = Date.now();
      let xsdIssues = [];
      try {
        const xsdResult = await this.xsdValidator.validate(xmlContent, version);
        xsdIssues = (xsdResult && Array.isArray(xsdResult.errors)) ? xsdResult.errors : [];
      } catch (xsdError) {
        xsdIssues = [{
          line: 0,
          column: 0,
          message: `XSD validation error: ${xsdError.message}`,
          severity: 'error',
          rule: 'XSD-System-Error'
        }];
      }
      addStep('XSD', xsdStart, xsdIssues);

      // Later stages can't run on XML that doesn't parse
      if (!this.hasFatalXSDErrors(xsdIssues)) {
        // Step 2: Business rules
        const ernStart = Date.now();
        let ernIssues = [];
        try {
          const ernResult = await this.getERNValidator(version).validate(xmlContent, profile);
          ernIssues = (ernResult && Array.isArray(ernResult.errors)) ? ernResult.errors : [];
        } catch (ernError) {
          ernIssues = [{
            line: 0,
            column: 0,
            message: `ERN validation error: ${ernError.message}`,
            severity: 'error',
            rule: 'ERN-System-Error'
          }];
        }
        addStep('BusinessRules', ernStart, ernIssues);

        // Step 3: Schematron rules (when a profile is given), with optional SVRL
        if (profile) {
          const schStart = Date.now();
          let schIssues = [];
          try {
            const schResult = await this.schematronValidator.validate(
              xmlContent,
              version,
              profile,
              { generateSVRL: !!options.generateSVRL }
            );
            schIssues = [...(schResult.errors || []), ...(schResult.warnings || [])];
            if (schResult.svrl) {
              results.svrl = schResult.svrl;
            }
          } catch (schError) {
            schIssues = [{
              line: 0,
              column: 0,
              message: `Schematron validation error: ${schError.message}`,
              severity: 'error',
              rule: 'Schematron-System-Error'
            }];
          }
          addStep('Schematron', schStart, schIssues);
        }
      }

      results.valid = results.errors.length === 0;
      results.metadata.processingTime = Date.now() - startTime;
      results.metadata.schemaVersion = `ERN ${version}`;
      results.metadata.validatedAt = new Date().toISOString();
      results.metadata.errorCount = results.errors.length;
      results.metadata.warningCount = results.warnings.length;
      if (truncatedErrors > 0) {
        results.metadata.truncatedErrors = truncatedErrors;
      }
      return results;

    } catch (error) {
      console.error('Validation orchestrator caught error:', error);

      // Even in the error case, return a valid structure
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
        svrl: null,
        metadata: {
          processingTime: Date.now() - startTime,
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
    // (xmllint reports malformed XML as "parser error : ...")
    return errors.some(error => 
      error.message && (
        error.message.includes('parser error') ||
        error.message.includes('Cannot parse') ||
        error.message.includes('Premature end of data') ||
        error.message.includes('XML validation error')
      )
    );
  }
}

module.exports = ValidationOrchestrator;