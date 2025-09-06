// functions/validators/xsdValidator.js
const fs = require('fs').promises;
const path = require('path');
const { validateXML, memoryPages } = require('xmllint-wasm');

class XSDValidator {
  constructor() {
    this.schemaCache = new Map();
  }

  async loadSchemaFiles(version) {
    console.log(`Loading LOCAL XSD schema files for version: ${version}`);
    
    const avsFilenames = {
      '3.8.2': 'avs_20161006.xsd',
      '4.2': 'avs20200518.xsd',
      '4.3': 'allowed-value-sets.xsd'
    };

    const schemaDir = path.join(__dirname, '..', 'schemas', 'ern', version);
    const mainSchemaPath = path.join(schemaDir, 'release-notification.xsd');
    const avsFilename = avsFilenames[version];
    
    if (!avsFilename) {
      throw new Error(`Unknown ERN version: ${version}`);
    }

    const avsPath = path.join(schemaDir, avsFilename);
    
    try {
      const [mainSchema, avsSchema] = await Promise.all([
        fs.readFile(mainSchemaPath, 'utf8'),
        fs.readFile(avsPath, 'utf8')
      ]);

      console.log(`Main schema loaded: ${mainSchema.length} characters`);
      console.log(`AVS schema loaded: ${avsSchema.length} characters`);

      // Replace ALL external HTTP references with local file references
      let fixedMainSchema = mainSchema
        .replace(
          /schemaLocation="http:\/\/ddex\.net\/xml\/allowed-value-sets\/[^"]*"/gi,
          `schemaLocation="${avsFilename}"`
        )
        .replace(
          /schemaLocation="https?:\/\/[^"]*"/gi,
          (match) => {
            const filename = match.split('/').pop().replace('"', '');
            console.log(`Replacing external reference: ${match} -> ${filename}`);
            return `schemaLocation="${filename}"`;
          }
        );

      return {
        mainSchema: fixedMainSchema,
        avsSchema,
        avsFilename
      };
    } catch (error) {
      console.error(`Failed to load schema files for ${version}:`, error);
      throw error;
    }
  }

  async validate(xmlContent, version) {
    console.log(`XSD validation starting for version: ${version} (LOCAL SCHEMAS ONLY)`);
    const errors = [];
    
    try {
      const { mainSchema, avsSchema, avsFilename } = await this.loadSchemaFiles(version);
      
      const xmlString = typeof xmlContent === 'string' 
        ? xmlContent 
        : xmlContent.toString('utf8');
      
      console.log('Calling validateXML with LOCAL schemas only...');
      
      const result = await validateXML({
        xml: [{ 
          fileName: 'document.xml', 
          contents: xmlString 
        }],
        schema: [{ 
          fileName: 'release-notification.xsd', 
          contents: mainSchema
        }],
        preload: [
          {
            fileName: avsFilename,
            contents: avsSchema
          }
        ],
        initialMemoryPages: 1024,  // 64 MiB
        maxMemoryPages: 2 * memoryPages.GiB  // 2 GiB max
      });
      
      console.log('XSD validation completed, valid:', result.valid);
      
      if (result && !result.valid) {
        // Parse errors from the result
        if (result.errors && Array.isArray(result.errors)) {
          result.errors.forEach(error => {
            errors.push(this.parseXmllintError(error));
          });
        }
      } else if (result && result.valid) {
        console.log('XSD validation PASSED with LOCAL schemas!');
      }

    } catch (error) {
      console.error('XSD validation error:', error);
      errors.push({
        line: 0,
        column: 0,
        message: `XSD validation error: ${error.message}`,
        severity: 'warning',
        rule: 'XSD-Schema'
      });
    }

    console.log(`XSD validation completed with ${errors.length} errors`);
    return { errors, valid: errors.length === 0 };
  }

  parseXmllintError(error) {
    // Handle v5 error format with loc object
    if (error.loc) {
      return {
        line: error.loc.line || 0,
        column: error.loc.column || 0,
        message: error.message || error.rawMessage,
        severity: 'error',
        rule: 'XSD-Schema'
      };
    }
    
    // Handle rawMessage format (v5 specific)
    if (error.rawMessage) {
      const match = error.rawMessage.match(/document\.xml:(\d+):/);
      return {
        line: match ? parseInt(match[1]) : 0,
        column: 0,
        message: error.message || error.rawMessage.replace(/^document\.xml:\d+:\s*/, ''),
        severity: 'error',
        rule: 'XSD-Schema'
      };
    }
    
    // Handle string errors
    if (typeof error === 'string') {
      return this.parseXmllintErrorLine(error);
    }
    
    // Handle other object formats
    return {
      line: error.line || 0,
      column: error.column || 0,
      message: error.message || error.toString(),
      severity: 'error',
      rule: 'XSD-Schema'
    };
  }

  parseXmllintErrorLine(line) {
    let match = line.match(/document\.xml:(\d+):\s*(.+)/);
    if (match) {
      return {
        line: parseInt(match[1]) || 0,
        column: 0,
        message: match[2].trim(),
        severity: 'error',
        rule: 'XSD-Schema'
      };
    }
    
    return {
      line: 0,
      column: 0,
      message: line.trim(),
      severity: 'error',
      rule: 'XSD-Schema'
    };
  }

  async verifySchemas() {
    const versions = ['3.8.2', '4.2', '4.3'];
    const results = {};
    
    results.xmllint = {
      status: 'Available',
      version: '5.x',
      mode: 'LOCAL SCHEMAS ONLY',
      note: 'Using locally stored schemas, no external dependencies'
    };
    
    for (const version of versions) {
      try {
        const { mainSchema, avsSchema, avsFilename } = await this.loadSchemaFiles(version);
        const schemaDir = path.join(__dirname, '..', 'schemas', 'ern', version);
        const files = await fs.readdir(schemaDir);
        
        results[version] = {
          status: 'OK',
          mainSchemaSize: mainSchema.length,
          avsSchemaSize: avsSchema.length,
          avsFilename: avsFilename,
          mode: 'LOCAL',
          filesPresent: files
        };
      } catch (error) {
        results[version] = {
          status: 'Failed',
          error: error.message
        };
      }
    }
    
    return results;
  }
}

module.exports = XSDValidator;