// functions/api/validate.js
const express = require('express');
const router = express.Router();
const ValidationOrchestrator = require('../validators/validationOrchestrator');

// Create a validation orchestrator instance
const validationOrchestrator = new ValidationOrchestrator();

// Validation endpoint - NO AUTHENTICATION REQUIRED
router.post('/', async (req, res) => {
  try {
    const { 
      content, 
      type, 
      version, 
      profile,
      generateSVRL,
      options = {}
    } = req.body;

    // Extract from options if not at root level
    const finalGenerateSVRL = generateSVRL || options.generateSVRL;
    const verbose = options.verbose;
    const includeMetadata = options.includeMetadata;
    
    // Log request for debugging
    console.log('Validation request:', { 
      type, 
      version, 
      profile, 
      contentLength: content?.length,
      generateSVRL: finalGenerateSVRL,
      options: options
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

    // Use ValidationOrchestrator for unified validation
    let validationResult;
    
    if (finalGenerateSVRL && profile) {
      // Use orchestrator with SVRL generation
      validationResult = await validationOrchestrator.validateWithSVRL(
        content, 
        type, 
        version, 
        profile
      );
    } else {
      // Use orchestrator for standard validation
      validationResult = await validationOrchestrator.validate(
        content, 
        type, 
        version, 
        profile
      );
    }

    const processingTime = Date.now() - startTime;

    // Build response with properly synchronized metadata
    const response = {
      valid: validationResult.valid,
      errors: validationResult.errors || [],
      warnings: validationResult.warnings || [],
      svrl: validationResult.svrl || null,
      metadata: {
        processingTime,
        schemaVersion: `ERN ${version}`,
        profile: profile,
        validatedAt: new Date().toISOString(),
        errorCount: validationResult.errors ? validationResult.errors.length : 0,
        warningCount: validationResult.warnings ? validationResult.warnings.length : 0,
        validationSteps: validationResult.metadata?.validationSteps || []
      }
    };

    // If SVRL was generated, ensure error counts match
    if (validationResult.svrl) {
      // Count errors in SVRL to ensure consistency
      const svrlErrorCount = (validationResult.svrl.match(/<svrl:failed-assert/g) || []).length;
      console.log(`SVRL error count: ${svrlErrorCount}, Total errors: ${response.errors.length}`);
    }

    return res.json(response);

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