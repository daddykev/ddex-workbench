const express = require('express');
const router = express.Router();
const { ERNValidator } = require('../validators/ernValidator');

// Validation endpoint
router.post('/', async (req, res) => {
  try {
    const { content, type, version, profile } = req.body;
    
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

    return res.json({
      valid: validationResult.valid,
      errors: validationResult.errors,
      metadata: {
        processingTime,
        schemaVersion: `ERN ${version}`,
        profile: profile,
        validatedAt: new Date().toISOString()
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

// Get supported versions and profiles
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