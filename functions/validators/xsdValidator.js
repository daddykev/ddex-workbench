// functions/validators/xsdValidator.js
const libxmljs = require('libxmljs2');
const fs = require('fs').promises;
const path = require('path');

class XSDValidator {
  constructor() {
    this.schemaCache = new Map();
  }

  async loadSchema(version) {
    console.log(`Loading XSD schema for version: ${version}`);
    const cacheKey = `ern-${version}`;
    
    if (this.schemaCache.has(cacheKey)) {
      console.log(`Schema ${version} found in cache`);
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
    
    console.log(`Schema directory: ${schemaDir}`);
    console.log(`Schema path: ${schemaPath}`);
    console.log(`AVS filename: ${avsFilename}`);
    
    if (!avsFilename) {
      throw new Error(`Unknown ERN version: ${version}`);
    }

    try {
      // Check if files exist using sync methods
      const fsSync = require('fs');
      if (!fsSync.existsSync(schemaPath)) {
        throw new Error(`Schema file not found: ${schemaPath}`);
      }
      if (!fsSync.existsSync(path.join(schemaDir, avsFilename))) {
        throw new Error(`AVS file not found: ${path.join(schemaDir, avsFilename)}`);
      }
      console.log('Both schema files exist');

      // Read the main schema
      let mainSchema = await fs.readFile(schemaPath, 'utf8');
      console.log(`Main schema loaded, length: ${mainSchema.length}`);
      
      // Fix the AVS import reference to match actual filename
      mainSchema = mainSchema.replace(
        /schemaLocation="[^"]*avs[^"]*\.xsd"/gi,
        `schemaLocation="${avsFilename}"`
      );
      
      console.log(`Attempting to parse schema with baseUrl: file://${schemaDir}/`);
      
      // Parse schema with proper base URL for imports
      const schemaDoc = libxmljs.parseXml(mainSchema, {
        baseUrl: `file://${schemaDir}/`,
        nonet: true
      });

      console.log('Schema parsed successfully');
      this.schemaCache.set(cacheKey, schemaDoc);
      return schemaDoc;
      
    } catch (error) {
      console.error(`Schema loading failed for ${version}:`, error.message);
      console.error('Full error:', error);
      throw error;
    }
  }

  async validate(xmlContent, version) {
    console.log(`XSD validation starting for version: ${version}`);
    const errors = [];
    
    try {
      // Parse the XML document
      console.log('Parsing XML document...');
      const xmlDoc = libxmljs.parseXml(xmlContent);
      console.log('XML document parsed successfully');
      
      // Load the appropriate schema
      console.log('Loading schema...');
      const schema = await this.loadSchema(version);
      console.log('Schema loaded successfully, attempting validation...');
      
      // Perform validation
      console.log('Calling xmlDoc.validate()...');
      let isValid;
      try {
        isValid = xmlDoc.validate(schema);
        console.log(`Validation completed. Result: ${isValid}`);
      } catch (validateError) {
        console.error('Validation threw an error:', validateError.message);
        // Schema is invalid for validation - this is a setup issue
        throw new Error(`Schema validation setup error: ${validateError.message}`);
      }
      
      if (!isValid) {
        // Extract detailed validation errors
        const validationErrors = xmlDoc.validationErrors;
        console.log(`Found ${validationErrors.length} validation errors`);
        
        validationErrors.forEach((error, index) => {
          console.log(`Error ${index + 1}:`, {
            line: error.line,
            column: error.column,
            message: error.message,
            level: error.level
          });
          
          errors.push({
            line: error.line || 0,
            column: error.column || 0,
            message: error.message,
            severity: error.level === 2 ? 'error' : 'warning',
            rule: 'XSD-Schema',
            domain: error.domain,
            code: error.code
          });
        });
      } else {
        console.log('XSD validation passed!');
      }
    } catch (error) {
      console.error('XSD validation error:', error.message);
      console.error('Error stack:', error.stack);
      errors.push({
        line: 0,
        column: 0,
        message: `XML parsing or schema error: ${error.message}`,
        severity: 'error',
        rule: 'XSD-Schema-Loading'
      });
    }

    console.log(`XSD validation completed with ${errors.length} errors`);
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