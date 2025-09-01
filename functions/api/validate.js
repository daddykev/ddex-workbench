// functions/api/validate.js
const express = require('express');
const router = express.Router();
const { ERNValidator } = require('../validators/ernValidator');
const SchematronValidator = require('../validators/schematronValidator');

// Create a schematron validator instance for SVRL generation
const schematronValidator = new SchematronValidator();

// Validation endpoint - NO AUTHENTICATION REQUIRED
router.post('/', async (req, res) => {
  try {
    const { 
      content, 
      type, 
      version, 
      profile,
      generateSVRL  // Add this
    } = req.body;
    
    // Log request for debugging
    console.log('Validation request:', { 
      type, 
      version, 
      profile, 
      contentLength: content?.length,
      generateSVRL 
    });
    
    if (!content) {
      return res.status(400).json({
        error: { message: 'XML content is required' }
      });
    }

    if (type !== 'ERN') {
      return res.status(400).json({
        error: { message: 'Only ERN validation is currently supported' }
      });
    }

    if (!version) {
      return res.status(400).json({
        error: { message: 'Version is required' }
      });
    }

    // Start timing
    const startTime = Date.now();

    // Create validator for the specified version
    let validator;
    try {
      validator = new ERNValidator(version);
    } catch (error) {
      return res.status(400).json({
        error: { message: error.message }
      });
    }

    // Perform validation
    const validationResult = await validator.validate(content, profile);
    const processingTime = Date.now() - startTime;

    // Generate SVRL if requested and profile is specified
    let svrl = null;
    if (generateSVRL && profile) {
      try {
        const svrlResult = await schematronValidator.validate(
          content,
          version,
          profile,
          { generateSVRL: true }
        );
        
        // Get SVRL from result or from the generator
        svrl = svrlResult.svrl || schematronValidator.getLastSVRLReport();
      } catch (error) {
        console.warn('SVRL generation failed:', error.message);
        // Continue without SVRL
      }
    }

    return res.json({
      valid: validationResult.valid,
      errors: validationResult.errors,
      warnings: validationResult.warnings || [],
      svrl: svrl,  // Include SVRL if generated
      metadata: {
        processingTime,
        schemaVersion: `ERN ${version}`,
        profile: profile,
        validatedAt: new Date().toISOString(),
        errorCount: validationResult.errors ? validationResult.errors.length : 0,
        warningCount: validationResult.warnings ? validationResult.warnings.length : 0
      }
    });

  } catch (error) {
    console.error('Validation error:', error);
    res.status(500).json({
      error: {
        message: 'Internal server error during validation',
        details: error.message
      }
    });
  }
});

// Get supported versions and profiles - PUBLIC ENDPOINT
router.get('/formats', (req, res) => {
  const { ERN_CONFIGS } = require('../validators/ernValidator');
  
  const formats = {
    types: ['ERN'],
    versions: Object.keys(ERN_CONFIGS).map(version => ({
      version,
      profiles: ERN_CONFIGS[version].profiles,
      status: version === '4.3' ? 'recommended' : 'supported'
    }))
  };

  res.json(formats);
});

module.exports = router;