// functions/middleware/apiKeyAuth.js
const admin = require('firebase-admin');
const { FieldValue } = require('firebase-admin/firestore');
const crypto = require('crypto');

// Must match the hashing in api/keys.js
const hashApiKey = (key) => {
  return crypto.createHash('sha256').update(key).digest('hex');
};

const API_KEY_PREFIX = 'ddex_';

const getBearerToken = (req) => {
  const auth = req.headers['authorization'];
  if (auth && auth.startsWith('Bearer ')) {
    return auth.slice('Bearer '.length).trim() || null;
  }
  return null;
};

/**
 * Read an API key from the request.
 * Primary: `X-API-Key: ddex_...`. Also accepts `Authorization: Bearer ddex_...`;
 * other Bearer values are Firebase ID tokens from the web app (see below).
 */
const getApiKeyFromRequest = (req) => {
  const headerKey = req.headers['x-api-key'];
  if (headerKey) return String(headerKey).trim();

  const bearer = getBearerToken(req);
  if (bearer && bearer.startsWith(API_KEY_PREFIX)) return bearer;

  return null;
};

/**
 * Identify the caller for rate limiting. Precedence: API key, then Firebase ID
 * token, then anonymous (client IP).
 * - Valid, active API key: req.apiKey = { id, userId }; usage stats are updated in
 *   the background. Invalid or revoked key: 401.
 * - Otherwise, a valid Firebase ID token in `Authorization: Bearer`: req.user = { uid }.
 *   Invalid or expired tokens are treated as anonymous (no 401), so a stale token
 *   in the web app doesn't break validation.
 * - Otherwise: anonymous.
 */
const apiKeyAuth = async (req, res, next) => {
  req.apiKey = null;
  req.user = null;

  const apiKey = getApiKeyFromRequest(req);

  if (!apiKey) {
    const idToken = getBearerToken(req);
    if (idToken) {
      try {
        const decoded = await admin.auth().verifyIdToken(idToken);
        req.user = { uid: decoded.uid };
      } catch (error) {
        // Expired or invalid token: continue as anonymous
      }
    }
    return next();
  }

  if (!apiKey.startsWith(API_KEY_PREFIX)) {
    return res.status(401).json({
      error: {
        code: 'INVALID_API_KEY',
        message: 'Invalid API key format'
      }
    });
  }

  try {
    const keysSnapshot = await admin.firestore()
      .collection('api_keys')
      .where('hashedKey', '==', hashApiKey(apiKey))
      .where('active', '==', true)
      .limit(1)
      .get();

    if (keysSnapshot.empty) {
      return res.status(401).json({
        error: {
          code: 'INVALID_API_KEY',
          message: 'Invalid or revoked API key'
        }
      });
    }

    const keyDoc = keysSnapshot.docs[0];
    req.apiKey = {
      id: keyDoc.id,
      userId: keyDoc.data().userId
    };

    // Update usage stats without delaying the response
    keyDoc.ref.update({
      lastUsed: FieldValue.serverTimestamp(),
      requestCount: FieldValue.increment(1)
    }).catch((error) => {
      console.error('Failed to update API key usage:', error);
    });

    next();
  } catch (error) {
    console.error('API key validation error:', error);
    res.status(500).json({
      error: { message: 'Failed to validate API key' }
    });
  }
};

module.exports = apiKeyAuth;
