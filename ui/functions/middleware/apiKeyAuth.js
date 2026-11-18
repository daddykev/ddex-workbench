// functions/middleware/apiKeyAuth.js
const admin = require('firebase-admin');
const crypto = require('crypto');

const hashApiKey = (key) => {
  return crypto.createHash('sha256').update(key).digest('hex');
};

// Middleware to validate API keys
const apiKeyAuth = async (req, res, next) => {
  // Check for API key in header
  const apiKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');
  
  if (!apiKey) {
    // Allow anonymous access but with lower rate limits
    req.apiKeyData = null;
    return next();
  }

  // Validate format
  if (!apiKey.startsWith('ddex_')) {
    return res.status(401).json({ 
      error: { 
        code: 'INVALID_API_KEY',
        message: 'Invalid API key format' 
      } 
    });
  }

  try {
    // Hash the key and look it up
    const hashedKey = hashApiKey(apiKey);
    const keysSnapshot = await admin.firestore()
      .collection('api_keys')
      .where('hashedKey', '==', hashedKey)
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
    const keyData = keyDoc.data();

    // Update last used timestamp and request count
    await keyDoc.ref.update({
      lastUsed: admin.firestore.FieldValue.serverTimestamp(),
      requestCount: admin.firestore.FieldValue.increment(1)
    });

    // Attach key data to request for rate limiting
    req.apiKeyData = {
      id: keyDoc.id,
      userId: keyData.userId,
      rateLimit: keyData.rateLimit
    };

    next();
  } catch (error) {
    console.error('API key validation error:', error);
    res.status(500).json({ 
      error: { message: 'Failed to validate API key' } 
    });
  }
};

module.exports = apiKeyAuth;