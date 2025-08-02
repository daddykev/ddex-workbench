// functions/middleware/rateLimiter.js
const rateLimit = require('express-rate-limit');

// Create separate rate limiters for authenticated and anonymous users
const createRateLimiter = () => {
  // For authenticated users with API keys
  const authenticatedLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 60, // 60 requests per minute
    keyGenerator: (req) => req.apiKeyData.id, // Use API key ID
    skip: (req) => !req.apiKeyData, // Skip if no API key
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, next) => {
      res.status(429).json({
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'API key rate limit exceeded (60 req/min)',
          retryAfter: Math.round(req.rateLimit.resetTime / 1000)
        }
      });
    }
  });

  // For anonymous users
  const anonymousLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // 10 requests per minute
    skip: (req) => req.apiKeyData || req.path === '/api/health', // Skip if has API key or is health check
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, next) => {
      res.status(429).json({
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Rate limit exceeded. Sign in or use an API key for higher limits (10 req/min)',
          retryAfter: Math.round(req.rateLimit.resetTime / 1000)
        }
      });
    }
  });

  // Return a middleware that applies both limiters
  return (req, res, next) => {
    // Apply the appropriate rate limiter
    if (req.apiKeyData) {
      authenticatedLimiter(req, res, next);
    } else {
      anonymousLimiter(req, res, next);
    }
  };
};

module.exports = createRateLimiter;