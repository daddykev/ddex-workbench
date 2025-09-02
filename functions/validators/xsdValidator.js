// functions/validators/xsdValidator.js
const libxmljs = require('libxmljs2');
const fs = require('fs').promises;
const path = require('path');

class XSDValidator {
  constructor() {
    this.schemaCache = new Map();
  }

  async loadSchema(version) {
    const cacheKey = `ern-${version}`;
    
    if (this.schemaCache.has(cacheKey)) {
      return this.schemaCache.get(cacheKey);
    }

    // Map versions to their actual AVS filenames
    const avsFilenames = {
      '3.8.2': 'avs_20161006.xsd',
      '4.2': 'avs20200518.xsd',
      '4.3': 'allowed-value-sets.xsd'
    };

    const schemaDir = path.join(__dirname, '..', 'schemas', 'ern', version);
    const schemaPath = path.join(schemaDir, 'release-notification.xsd');
    const avsFilename = avsFilenames[version];
    
    if (!avsFilename) {
      throw new Error(`Unknown ERN version: ${version}`);
    }

    // Read the main schema
    let mainSchema = await fs.readFile(schemaPath, 'utf8');
    
    // Fix the AVS import reference to match your actual filename
    // The schema might reference "avs.xsd" or "avs43.xsd" but we need the actual filename
    mainSchema = mainSchema.replace(
      /schemaLocation="[^"]*avs[^"]*\.xsd"/gi,
      `schemaLocation="${avsFilename}"`
    );

    // Parse schema with proper base URL so imports can be resolved
    const schemaDoc = libxmljs.parseXml(mainSchema, {
      baseUrl: `file://${schemaDir}/`,  // This allows libxmljs to find the AVS file
      nonet: true  // Set to true for security (prevents external network requests)
    });

    this.schemaCache.set(cacheKey, schemaDoc);
    return schemaDoc;
  }

  async validate(xmlContent, version) {
    const errors = [];
    
    try {
      // Parse the XML document
      const xmlDoc = libxmljs.parseXml(xmlContent);
      
      // Load the appropriate schema
      const schema = await this.loadSchema(version);
      
      // Perform validation
      const isValid = xmlDoc.validate(schema);
      
      if (!isValid) {
        // Extract detailed validation errors
        const validationErrors = xmlDoc.validationErrors;
        
        validationErrors.forEach(error => {
          errors.push({
            line: error.line || 0,
            column: error.column || 0,
            message: error.message,
            severity: error.level === 2 ? 'error' : 'warning',
            rule: 'XSD-Schema',
            domain: error.domain, // Schema, namespace, etc.
            code: error.code
          });
        });
      }
    } catch (error) {
      console.error('XSD validation error:', error);
      errors.push({
        line: 0,
        column: 0,
        message: `Schema validation error: ${error.message}`,
        severity: 'error',
        rule: 'XSD-Schema-Loading'
      });
    }

    return { errors, valid: errors.length === 0 };
  }

  // Optional: Add a method to verify schemas are loadable
  async verifySchemas() {
    const versions = ['3.8.2', '4.2', '4.3'];
    const results = {};
    
    for (const version of versions) {
      try {
        await this.loadSchema(version);
        results[version] = 'OK';
      } catch (error) {
        results[version] = `Failed: ${error.message}`;
      }
    }
    
    return results;
  }
}

module.exports = XSDValidator;