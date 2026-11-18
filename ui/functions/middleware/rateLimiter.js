// functions/middleware/rateLimiter.js
const { rateLimit, ipKeyGenerator } = require('express-rate-limit');
const { getClientIp } = require('./clientIp');

const WINDOW_MS = 60 * 1000;   // 1 minute
const ANONYMOUS_LIMIT = 10;    // requests per minute per client IP
const IDENTIFIED_LIMIT = 60;   // requests per minute per API key or signed-in user

// Note: counters are kept in memory, so each Cloud Functions instance counts
// separately. Under scale-out the effective limits are approximate.

// Seconds until the current window resets (for the JSON error body)
const secondsUntilReset = (req) => {
  const resetTime = req.rateLimit?.resetTime;
  if (!resetTime) return Math.ceil(WINDOW_MS / 1000);
  return Math.max(0, Math.ceil((resetTime.getTime() - Date.now()) / 1000));
};

const limiter = ({ limit, keyGenerator, message }) => rateLimit({
  windowMs: WINDOW_MS,
  limit,
  keyGenerator,
  standardHeaders: true, // RateLimit-Policy / RateLimit-Limit / RateLimit-Remaining / RateLimit-Reset
  legacyHeaders: false,  // no X-RateLimit-* headers
  handler: (req, res) => {
    res.status(429).json({
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message,
        retryAfter: secondsUntilReset(req)
      }
    });
  }
});

/**
 * Create the rate-limiting middleware. Must run after apiKeyAuth, which sets
 * req.apiKey (valid API key) or req.user (valid Firebase ID token).
 */
const createRateLimiter = () => {
  const apiKeyLimiter = limiter({
    limit: IDENTIFIED_LIMIT,
    keyGenerator: (req) => `key:${req.apiKey.id}`,
    message: `API key rate limit exceeded (${IDENTIFIED_LIMIT} requests per minute)`
  });

  const userLimiter = limiter({
    limit: IDENTIFIED_LIMIT,
    keyGenerator: (req) => `user:${req.user.uid}`,
    message: `Rate limit exceeded (${IDENTIFIED_LIMIT} requests per minute for signed-in users)`
  });

  // Keyed by client IP (see clientIp.js); ipKeyGenerator groups IPv6 addresses by /56
  const anonymousLimiter = limiter({
    limit: ANONYMOUS_LIMIT,
    keyGenerator: (req) => `ip:${ipKeyGenerator(getClientIp(req))}`,
    message: `Rate limit exceeded (${ANONYMOUS_LIMIT} requests per minute). Sign in or use an API key for up to ${IDENTIFIED_LIMIT} requests per minute.`
  });

  return (req, res, next) => {
    if (req.apiKey) return apiKeyLimiter(req, res, next);
    if (req.user) return userLimiter(req, res, next);
    return anonymousLimiter(req, res, next);
  };
};

module.exports = createRateLimiter;
