// functions/utils/svrlGenerator.js
/**
 * SVRL (Schematron Validation Report Language) Generator
 * Converts validation results to standard SVRL XML format
 * Compatible with DDEX's official validator output format
 */

class SVRLGenerator {
  constructor() {
    this.namespaces = {
      svrl: 'http://purl.oclc.org/dsdl/svrl',
      xsi: 'http://www.w3.org/2001/XMLSchema-instance',
      sch: 'http://purl.oclc.org/dsdl/schematron'
    };
  }

  /**
   * Generate SVRL report from validation results
   * @param {Object} validationResult - Result from schematronValidator
   * @param {Object} metadata - Additional metadata (version, profile, etc.)
   * @returns {string} SVRL XML document
   */
  generateSVRL(validationResult, metadata = {}) {
    const timestamp = new Date().toISOString();
    const { errors = [], warnings = [], valid } = validationResult;
    
    // Start building SVRL document
    let svrl = `<?xml version="1.0" encoding="UTF-8"?>`;
    svrl += `<svrl:schematron-output xmlns:svrl="${this.namespaces.svrl}"`;
    svrl += ` xmlns:xsi="${this.namespaces.xsi}"`;
    svrl += ` title="DDEX ERN Validation Report"`;
    svrl += ` phase="#ALL"`;
    svrl += ` schemaVersion="${metadata.version || 'unknown'}">\n`;
    
    // Add metadata
    svrl += this.generateMetadata(metadata, timestamp);
    
    // Add active patterns info
    svrl += this.generateActivePattern(metadata.profile);
    
    // Process all validation results
    const allResults = [
      ...errors.map(e => ({ ...e, type: 'failed-assert' })),
      ...warnings.map(w => ({ ...w, type: 'successful-report' }))
    ];
    
    // Sort by line number if available
    allResults.sort((a, b) => (a.line || 0) - (b.line || 0));
    
    // Generate SVRL assertions for each result
    for (const result of allResults) {
      svrl += this.generateAssertion(result);
    }
    
    // Add summary statistics
    svrl += this.generateSummary(errors.length, warnings.length, valid);
    
    svrl += `</svrl:schematron-output>`;
    
    return this.formatXML(svrl);
  }

  /**
   * Generate metadata section
   */
  generateMetadata(metadata, timestamp) {
    let meta = `  <!-- Validation Metadata -->\n`;
    meta += `  <svrl:text>DDEX ERN Validation Report</svrl:text>\n`;
    meta += `  <svrl:text>Generated: ${timestamp}</svrl:text>\n`;
    
    if (metadata.version) {
      meta += `  <svrl:text>ERN Version: ${metadata.version}</svrl:text>\n`;
    }
    
    if (metadata.profile) {
      meta += `  <svrl:text>Profile: ${metadata.profile}</svrl:text>\n`;
    }
    
    if (metadata.messageId) {
      meta += `  <svrl:text>Message ID: ${metadata.messageId}</svrl:text>\n`;
    }
    
    return meta;
  }

  /**
   * Generate active pattern element
   */
  generateActivePattern(profile) {
    const patternName = profile ? `${profile}-Profile` : 'ERN-Validation';
    return `  <svrl:active-pattern document="" id="${patternName}" name="${patternName}"/>\n`;
  }

  /**
   * Generate assertion (failed-assert or successful-report)
   */
  generateAssertion(result) {
    const { type, message, rule, context, line, column, severity } = result;
    
    let assertion = `  <svrl:${type}`;
    assertion += ` test="${this.escapeXML(rule || 'unknown')}"`;
    
    if (line) {
      assertion += ` location="line:${line}`;
      if (column) {
        assertion += `,column:${column}`;
      }
      assertion += `"`;
    }
    
    // Add role attribute for severity
    const role = this.mapSeverityToRole(severity);
    if (role) {
      assertion += ` role="${role}"`;
    }
    
    assertion += `>\n`;
    
    // Add diagnostic reference if context exists
    if (context) {
      assertion += `    <svrl:diagnostic-reference diagnostic="${this.generateDiagnosticId(rule)}">\n`;
      assertion += `      ${this.escapeXML(context)}\n`;
      assertion += `    </svrl:diagnostic-reference>\n`;
    }
    
    // Add the message text
    assertion += `    <svrl:text>${this.escapeXML(message)}</svrl:text>\n`;
    
    // Add suggestion if available
    if (result.suggestion) {
      assertion += `    <svrl:text>Suggestion: ${this.escapeXML(result.suggestion)}</svrl:text>\n`;
    }
    
    assertion += `  </svrl:${type}>\n`;
    
    return assertion;
  }

  /**
   * Generate summary statistics
   */
  generateSummary(errorCount, warningCount, valid) {
    let summary = `  <!-- Validation Summary -->\n`;
    summary += `  <svrl:text>====== VALIDATION SUMMARY ======</svrl:text>\n`;
    summary += `  <svrl:text>Status: ${valid ? 'VALID' : 'INVALID'}</svrl:text>\n`;
    summary += `  <svrl:text>Errors: ${errorCount}</svrl:text>\n`;
    summary += `  <svrl:text>Warnings: ${warningCount}</svrl:text>\n`;
    summary += `  <svrl:text>Total Issues: ${errorCount + warningCount}</svrl:text>\n`;
    
    return summary;
  }

  /**
   * Map severity levels to SVRL roles
   */
  mapSeverityToRole(severity) {
    const roleMap = {
      'error': 'error',
      'warning': 'warn',
      'info': 'info',
      'fatal': 'fatal'
    };
    return roleMap[severity] || 'error';
  }

  /**
   * Generate diagnostic ID from rule name
   */
  generateDiagnosticId(rule) {
    if (!rule) return 'diag-unknown';
    return `diag-${rule.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}`;
  }

  /**
   * Escape XML special characters
   */
  escapeXML(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  /**
   * Basic XML formatting for readability
   */
  formatXML(xml) {
    // Simple formatting - proper XML formatter could be added later
    return xml
      .replace(/></g, '>\n<')
      .replace(/(<\/svrl:schematron-output>)/, '\n$1');
  }

  /**
   * Generate SVRL with fired rules (for successful validations)
   */
  generateFiredRules(rules, metadata = {}) {
    const timestamp = new Date().toISOString();
    
    let svrl = `<?xml version="1.0" encoding="UTF-8"?>`;
    svrl += `<svrl:schematron-output xmlns:svrl="${this.namespaces.svrl}">\n`;
    svrl += this.generateMetadata(metadata, timestamp);
    
    // Add fired rules for successful tests
    for (const rule of rules) {
      svrl += `  <svrl:fired-rule context="${this.escapeXML(rule.context || 'document')}"`;
      svrl += ` id="${this.escapeXML(rule.name)}"`;
      svrl += ` role="${rule.severity || 'info'}">\n`;
      svrl += `    <svrl:text>${this.escapeXML(rule.description || rule.name)}</svrl:text>\n`;
      svrl += `  </svrl:fired-rule>\n`;
    }
    
    svrl += `</svrl:schematron-output>`;
    return this.formatXML(svrl);
  }
}

module.exports = SVRLGenerator;