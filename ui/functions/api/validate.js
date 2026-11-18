// functions/api/validate.js
const express = require('express');
const router = express.Router();
const ValidationOrchestrator = require('../validators/validationOrchestrator');

// Create a validation orchestrator instance
const validationOrchestrator = new ValidationOrchestrator();

// Validation endpoint. API keys are optional (see middleware/apiKeyAuth.js);
// rate limits are applied in index.js
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

    // generateSVRL may be sent at the top level or inside options
    const finalGenerateSVRL = !!(generateSVRL || options.generateSVRL);
    
    // Log request metadata only (never the message content)
    console.log('Validation request:', { 
      type, 
      version, 
      profile, 
      contentLength: content?.length,
      generateSVRL: finalGenerateSVRL
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

    // XSD -> business rules -> Schematron (when a profile is given) -> optional SVRL
    const validationResult = await validationOrchestrator.validate(
      content,
      type,
      version,
      profile,
      { generateSVRL: finalGenerateSVRL }
    );

    const processingTime = Date.now() - startTime;

    // Build response with properly synchronized metadata
    const response = {
      valid: validationResult.valid,
      errors: validationResult.errors || [],
      warnings: validationResult.warnings || [],
      metadata: {
        processingTime,
        schemaVersion: `ERN ${version}`,
        profile: profile,
        validatedAt: new Date().toISOString(),
        errorCount: validationResult.errors ? validationResult.errors.length : 0,
        warningCount: validationResult.warnings ? validationResult.warnings.length : 0,
        validationSteps: validationResult.metadata?.validationSteps || [],
        ...(validationResult.metadata?.truncatedErrors && {
          truncatedErrors: validationResult.metadata.truncatedErrors
        })
      }
    };

    // Only include the SVRL report when one was requested and generated
    if (validationResult.svrl) {
      response.svrl = validationResult.svrl;
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