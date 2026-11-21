// functions/validators/xsdValidator.js
const fs = require('fs').promises;
const path = require('path');
const { validateXML, memoryPages } = require('xmllint-wasm');

// Versions affected by the ddexC_CurrentTerritoryCode defect (see
// reinterpretNationalityDefect), and the AVS simpleType holding the intended codes:
// 3.8.2's correct CurrentTerritoryCode extends avs:CurrentTerritoryCode; 3.8.3 moved
// the other Nationality elements to AllTerritoryCode (avs:AllTerritoryCode).
const NATIONALITY_DEFECT = {
  '3.8.2': { avsType: 'CurrentTerritoryCode' },
  '3.8.3': { avsType: 'AllTerritoryCode' }
};
// e.g. "Schemas validity error : Element 'Nationality': [facet 'enumeration'] The value 'US' is not an element of the set {'IdentifierType'}."
const NATIONALITY_DEFECT_RE = /Element '(?:[\w.-]+:)?Nationality': \[facet 'enumeration'\] The value '([^']*)' is not an element of the set \{'IdentifierType'\}/;
const NATIONALITY_DEFECT_FOLLOWUP_RE = /Element '(?:[\w.-]+:)?Nationality': '[^']*' is not a valid value of the atomic type '[^']*ddexC_CurrentTerritoryCode'/;

class XSDValidator {
  constructor() {
    this.schemaCache = new Map();
  }

  async loadSchemaFiles(version) {
    console.log(`Loading LOCAL XSD schema files for version: ${version}`);
    
    const avsFilenames = {
      '3.8.2': 'avs_20161006.xsd',
      '3.8.3': 'avs_20200108.xsd',
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
          let issues = result.errors.map(error => this.parseXmllintError(error));
          if (NATIONALITY_DEFECT[version]) {
            issues = await this.reinterpretNationalityDefect(result.errors, issues, version);
          }
          errors.push(...issues);
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
        severity: 'error',
        rule: 'XSD-Schema'
      });
    }

    // `errors` may hold warnings (e.g. the Nationality defect warning below), so
    // validity counts only error-severity issues, matching the orchestrator.
    const errorCount = errors.filter(e => (e.severity || 'error') === 'error' || e.severity === 'fatal').length;
    console.log(`XSD validation completed with ${errorCount} errors, ${errors.length - errorCount} warnings`);
    return { errors, valid: errorCount === 0 };
  }

  /**
   * Known DDEX schema defect, ERN 3.8.2 and 3.8.3 only.
   *
   * The published release-notification.xsd defines ern:ddexC_CurrentTerritoryCode
   * (3.8.2 line 11320, 3.8.3 line 11319) as an xs:string restricted to the single
   * enumeration value "IdentifierType", which is a generator error: that is the name
   * of the attribute on the correct CurrentTerritoryCode type (3.8.2 line 7157). So
   * xmllint rejects every Nationality typed with it:
   *   3.8.2: Artist, DetailedResourceContributor, IndirectResourceContributor
   *   3.8.3: IndirectResourceContributor (DDEX moved the others to AllTerritoryCode)
   *
   * The official XSDs are kept exactly as published. Instead, this specific error is
   * re-checked against the code list DDEX intended: a valid code becomes a warning
   * (strict recipients will still reject it), an invalid code becomes a clear error.
   * Every other XSD error is left untouched.
   */
  async reinterpretNationalityDefect(rawErrors, issues, version) {
    const codes = await this.getNationalityCodes(version);
    const defectLines = new Set();
    const out = [];

    rawErrors.forEach((raw, i) => {
      const issue = issues[i];
      const text = (raw && (raw.message || raw.rawMessage)) || issue.message || '';
      const match = text.match(NATIONALITY_DEFECT_RE);
      if (!match) {
        out.push(issue);
        return;
      }
      const value = match[1];
      const line = this.rawErrorLine(raw) || issue.line || 0;
      const column = issue.column || 0;
      defectLines.add(line);

      if (codes.has(value)) {
        out.push({
          line,
          column,
          message: `"${value}" is a valid territory code, but the published DDEX ERN ${version} schema rejects every Nationality value here because of a defect in DDEX's schema (ddexC_CurrentTerritoryCode allows only the literal "IdentifierType"). Recipients that validate strictly against the official XSD will reject this element. Check with your recipient, or omit Nationality if it isn't required.`,
          severity: 'warning',
          rule: 'DDEX-Schema-Defect-Nationality'
        });
      } else {
        out.push({
          line,
          column,
          message: `"${value}" is not a valid territory code for Nationality in ERN ${version}.`,
          severity: 'error',
          rule: 'ERN-Nationality-InvalidCode'
        });
      }
    });

    // Drop any follow-up error xmllint emits for the same element and line.
    // (xmllint-wasm 5.x emits only the enumeration error; this is defensive.)
    return out.filter((issue, i) => {
      if (issue.rule !== 'XSD-Schema') return true;
      const followUp = NATIONALITY_DEFECT_FOLLOWUP_RE.test(issue.message || '');
      return !(followUp && defectLines.has(this.rawErrorLine(rawErrors[i]) || issue.line || 0));
    });
  }

  // Line number from a raw xmllint-wasm error (5.x reports it as loc.lineNumber).
  rawErrorLine(raw) {
    if (!raw || typeof raw !== 'object') return 0;
    if (raw.loc && (raw.loc.lineNumber || raw.loc.line)) return raw.loc.lineNumber || raw.loc.line;
    const m = typeof raw.rawMessage === 'string' && raw.rawMessage.match(/document\.xml:(\d+):/);
    return m ? parseInt(m[1], 10) : 0;
  }

  // The xs:enumeration values of the AVS simpleType DDEX intended for Nationality,
  // cached per version.
  async getNationalityCodes(version) {
    if (!this.nationalityCodeCache) this.nationalityCodeCache = new Map();
    if (this.nationalityCodeCache.has(version)) return this.nationalityCodeCache.get(version);

    const { avsSchema } = await this.loadSchemaFiles(version);
    const typeName = NATIONALITY_DEFECT[version].avsType;
    const start = avsSchema.indexOf(`<xs:simpleType name="${typeName}">`);
    const end = start === -1 ? -1 : avsSchema.indexOf('</xs:simpleType>', start);
    if (start === -1 || end === -1) {
      throw new Error(`avs:${typeName} not found in the ERN ${version} AVS schema`);
    }
    const codes = new Set();
    const enumRe = /<xs:enumeration\s+value="([^"]*)"/g;
    const block = avsSchema.slice(start, end);
    let m;
    while ((m = enumRe.exec(block)) !== null) codes.add(m[1]);

    this.nationalityCodeCache.set(version, codes);
    return codes;
  }

  parseXmllintError(error) {
    // Handle v5 error format with loc object
    // xmllint-wasm 5.x reports { fileName, lineNumber } only (no column).
    if (error.loc) {
      return {
        line: error.loc.lineNumber || error.loc.line || 0,
        column: error.loc.columnNumber || error.loc.column || 0,
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
    const versions = ['3.8.2', '3.8.3', '4.2', '4.3'];
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