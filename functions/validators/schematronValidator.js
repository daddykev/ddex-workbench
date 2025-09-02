// functions/validators/schematronValidator.js
const fs = require('fs').promises;
const path = require('path');
const { XMLParser } = require('fast-xml-parser');
const SVRLGenerator = require('../utils/svrlGenerator');

// Import version-specific rule modules
const ERN382Rules = require('./rules/schematron-382');
const ERN42Rules = require('./rules/schematron-42');
const ERN43Rules = require('./rules/schematron-43');

class SchematronValidator {
  constructor() {
    this.rulesCache = new Map();
    this.svrlGenerator = new SVRLGenerator();
    this.lastValidationMetadata = null;
    this.lastValidationResult = null;
    
    // Initialize rule engines
    this.ruleEngines = {
      '3.8.2': new ERN382Rules(),
      '4.2': new ERN42Rules(),
      '4.3': new ERN43Rules()
    };
  }

  async validate(xmlContent, version, profile, options = {}) {
    const errors = [];
    const passedRules = [];
    
    // Store metadata for potential SVRL generation
    this.lastValidationMetadata = {
      version,
      profile,
      timestamp: new Date().toISOString()
    };
    
    try {
      // Parse the XML - Remove namespaces for easier access
      const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: "@_",
        parseAttributeValue: false,
        trimValues: true,
        parseTagValue: true,
        ignoreNameSpace: true,
        removeNSPrefix: true,
        allowBooleanAttributes: true
      });
      
      const parsedDoc = parser.parse(xmlContent);
      
      // Find the root element
      let doc = null;
      let rootElement = null;
      
      if (parsedDoc['NewReleaseMessage']) {
        doc = parsedDoc['NewReleaseMessage'];
        rootElement = 'NewReleaseMessage';
      } else {
        const key = Object.keys(parsedDoc).find(k => k.includes('NewReleaseMessage'));
        if (key) {
          doc = parsedDoc[key];
          rootElement = key;
        }
      }
      
      if (!doc) {
        errors.push({
          line: 0,
          column: 0,
          message: 'Could not find NewReleaseMessage root element',
          severity: 'error',
          rule: 'Schematron-Parse'
        });
        return this.formatResult(errors, passedRules, options);
      }
      
      // Store message ID in metadata
      if (doc.MessageHeader?.MessageId) {
        this.lastValidationMetadata.messageId = this.getValue(doc.MessageHeader.MessageId);
      }
      
      // Check if profile matches message
      if (profile && doc['@_ReleaseProfileVersionId']) {
        const messageProfile = doc['@_ReleaseProfileVersionId'];
        
        const profileMap = {
          'AudioAlbum': ['Audio', 'AudioAlbum'],
          'AudioSingle': ['AudioSingle', 'SimpleAudioSingle'],
          'Video': ['Video', 'SimpleVideo'],
          'Classical': ['Classical', 'SimpleClassical'],
          'Ringtone': ['Ringtone', 'SimpleRingtone'],
          'Mixed': ['Mixed', 'MixedMedia'],
          'DJ': ['DJ', 'DJMix', 'DjMix']
        };
        
        const acceptableProfiles = profileMap[profile] || [profile];
        const profileMatches = acceptableProfiles.some(p => 
          messageProfile === p || messageProfile.includes(p)
        );
        
        if (!profileMatches) {
          errors.push({
            line: 0,
            column: 0,
            message: `Message profile "${messageProfile}" does not match requested profile "${profile}"`,
            severity: 'warning',
            rule: 'Schematron-ProfileMismatch',
            context: `Profile: ${profile}`
          });
        }
      }
      
      // Load rules for this version/profile
      const rules = await this.loadSchematronRules(version, profile);
      
      // Get the appropriate rule engine
      const ruleEngine = this.ruleEngines[version];
      
      // Apply each rule with proper context binding
      rules.forEach(rule => {
        try {
          // Bind helper methods from rule engine to the test function
          const boundTest = rule.test.bind({
            getValue: ruleEngine.getValue.bind(ruleEngine),
            getReleases: ruleEngine.getReleases.bind(ruleEngine),
            getResources: ruleEngine.getResources.bind(ruleEngine),
            getDeals: ruleEngine.getDeals.bind(ruleEngine)
          });
          
          const passed = boundTest(doc);
          
          if (!passed) {
            errors.push({
              line: 0,
              column: 0,
              message: rule.message,
              severity: rule.severity || 'error',
              rule: `Schematron-${rule.name || 'Rule'}`,
              context: `Profile: ${profile}`,
              suggestion: rule.suggestion
            });
          } else {
            passedRules.push({
              name: rule.name,
              description: rule.message,
              severity: rule.severity || 'info',
              context: `Profile: ${profile}`
            });
          }
        } catch (error) {
          console.warn(`Rule ${rule.name} evaluation failed:`, error.message);
        }
      });
      
    } catch (error) {
      console.error('Schematron validation error:', error);
      errors.push({
        line: 0,
        column: 0,
        message: `Schematron validation error: ${error.message}`,
        severity: 'error',
        rule: 'Schematron-Error'
      });
    }

    // Store passed rules for potential SVRL generation
    this.lastValidationMetadata.passedRules = passedRules;
    
    return this.formatResult(errors, passedRules, options);
  }

  async loadSchematronRules(version, profile) {
    const cacheKey = `${version}-${profile}`;
    
    if (this.rulesCache.has(cacheKey)) {
      return this.rulesCache.get(cacheKey);
    }

    // Get the appropriate rule engine for this version
    const ruleEngine = this.ruleEngines[version];
    
    if (!ruleEngine) {
      console.warn(`No rule engine found for version ${version}, using basic validation`);
      return [];
    }

    // Get base rules and profile-specific rules
    const baseRules = ruleEngine.getAllRules();
    const profileRules = ruleEngine.getProfileRules(profile);
    
    // Combine rules
    const allRules = [...baseRules, ...profileRules];
    
    this.rulesCache.set(cacheKey, allRules);
    return allRules;
  }

  // Keep the rest of the methods unchanged
  formatResult(errors, passedRules, options = {}) {
    const errorList = errors.filter(e => e.severity === 'error');
    const warningList = errors.filter(e => e.severity === 'warning' || e.severity === 'info');
    
    const result = {
      errors: errorList,
      warnings: warningList,
      valid: errorList.length === 0
    };
    
    this.lastValidationResult = result;
    
    if (options.generateSVRL || options.format === 'svrl') {
      try {
        result.svrl = this.svrlGenerator.generateSVRL(result, this.lastValidationMetadata);
      } catch (error) {
        console.error('SVRL generation failed:', error);
        result.svrlError = error.message;
      }
    }
    
    if (options.verbose) {
      result.passedRules = passedRules;
    }
    
    return result;
  }

  generateSVRL(validationResult = null) {
    if (!this.svrlGenerator) {
      throw new Error('SVRL Generator not initialized');
    }
    
    const result = validationResult || this.lastValidationResult;
    const metadata = this.lastValidationMetadata || {};
    
    return this.svrlGenerator.generateSVRL(result, metadata);
  }

  getLastSVRLReport() {
    if (!this.lastValidationMetadata || !this.lastValidationResult) {
      throw new Error('No validation has been performed yet');
    }
    
    return this.generateSVRL();
  }

  // Simple helper method for getValue that doesn't need rule engine context
  getValue(node) {
    if (!node) return null;
    if (Array.isArray(node)) {
      const nonUserDefined = node.find(n => n !== 'UserDefined' && n['#text'] !== 'UserDefined');
      return nonUserDefined ? (nonUserDefined['#text'] || nonUserDefined) : (node[0]['#text'] || node[0]);
    }
    return node['#text'] || node;
  }
}

module.exports = SchematronValidator;