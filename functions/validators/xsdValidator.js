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

    // Load main schema and dependencies
    const schemaPath = path.join(__dirname, `../schemas/ern/${version}/release-notification.xsd`);
    const avsPath = path.join(__dirname, `../schemas/ern/${version}/avs${version.replace('.', '')}.xsd`);
    
    const [mainSchema, avsSchema] = await Promise.all([
      fs.readFile(schemaPath, 'utf8'),
      fs.readFile(avsPath, 'utf8')
    ]);

    // Parse schemas with imports resolved
    const schemaDoc = libxmljs.parseXml(mainSchema, {
      baseUrl: `file://${path.dirname(schemaPath)}/`,
      nonet: false // Allow loading imported schemas
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
}

module.exports = XSDValidator;