// functions/api/validate.js
const express = require('express');
const router = express.Router();
const ValidationOrchestrator = require('../validators/validationOrchestrator');
const { rulesStatus } = require('../validators/schematronValidator');

// Create a validation orchestrator instance
const validationOrchestrator = new ValidationOrchestrator();

// application/xml or text/xml, with or without parameters such as charset
const XML_CONTENT_TYPE = /^\s*(application|text)\/xml\s*(;|$)/i;

// Query values can be repeated (?version=4.3&version=4.2); use the first
const queryValue = (value) => (Array.isArray(value) ? value[0] : value);

const queryFlag = (value) => {
  const v = queryValue(value);
  return v === 'true' || v === '1';
};

// Validation endpoint. API keys are optional (see middleware/apiKeyAuth.js);
// rate limits are applied in index.js.
// Accepts either a JSON body ({ content, type, version, ... }) or the raw XML
// message with Content-Type application/xml or text/xml and the options in the
// query string. JSON fields take precedence over query parameters.
router.post('/', async (req, res) => {
  if (!rulesStatus.installed) {
    return res.status(503).json({
      error: {
        code: 'VALIDATION_RULES_UNAVAILABLE',
        message: 'Validation is unavailable: the validation rules are not installed on this server.'
      }
    });
  }

  try {
    const query = req.query || {};
    let content, type, version, profile, finalGenerateSVRL;

    if (XML_CONTENT_TYPE.test(req.headers['content-type'] || '')) {
      // The Functions Framework doesn't parse XML bodies; it keeps the bytes in rawBody
      content = Buffer.isBuffer(req.rawBody)
        ? req.rawBody.toString('utf8').replace(/^﻿/, '')
        : '';

      if (!content.trim()) {
        return res.status(400).json({
          error: { message: 'Request body is empty.' }
        });
      }

      type = queryValue(query.type) || 'ERN';
      version = queryValue(query.version);
      profile = queryValue(query.profile);
      finalGenerateSVRL = queryFlag(query.generateSVRL);
    } else {
      const body = (req.body && typeof req.body === 'object') ? req.body : {};
      const options = body.options || {};

      content = body.content;
      type = body.type !== undefined ? body.type : queryValue(query.type);
      version = body.version !== undefined ? body.version : queryValue(query.version);
      profile = body.profile !== undefined ? body.profile : queryValue(query.profile);

      // generateSVRL may be sent at the top level or inside options
      finalGenerateSVRL = (body.generateSVRL !== undefined || options.generateSVRL !== undefined)
        ? !!(body.generateSVRL || options.generateSVRL)
        : queryFlag(query.generateSVRL);
    }
    
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
        error: { message: 'Version is required (JSON field `version` or query parameter `?version=`).' }
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