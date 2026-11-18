// functions/api/keys.js
const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const crypto = require('crypto');

// Middleware to ensure user is authenticated
const requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: { message: 'Unauthorized' } });
  }

  try {
    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    res.status(401).json({ error: { message: 'Invalid token' } });
  }
};

// Generate a secure API key
const generateApiKey = () => {
  // Format: "ddex_" + 32 random characters
  return 'ddex_' + crypto.randomBytes(32).toString('hex');
};

// Hash API key for storage
const hashApiKey = (key) => {
  return crypto.createHash('sha256').update(key).digest('hex');
};

// Get user's API keys
router.get('/', requireAuth, async (req, res) => {
  try {
    console.log('Fetching API keys for user:', req.user.uid);
    
    const keysSnapshot = await admin.firestore()
      .collection('api_keys')
      .where('userId', '==', req.user.uid)
      .where('active', '==', true)
      .get();

    console.log('Found keys:', keysSnapshot.size);

    const keys = keysSnapshot.docs.map(doc => {
      const data = doc.data();
      console.log('Processing key:', doc.id, data);
      
      // Don't send the hashed key value
      const { hashedKey, ...keyData } = data;
      
      return {
        id: doc.id,
        ...keyData,
        // Safely handle timestamps
        created: data.created ? (data.created.toDate ? data.created.toDate().toISOString() : data.created) : new Date().toISOString(),
        lastUsed: data.lastUsed ? (data.lastUsed.toDate ? data.lastUsed.toDate().toISOString() : data.lastUsed) : null
      };
    });

    console.log('Returning keys:', keys);
    res.json(keys);
  } catch (error) {
    console.error('Error fetching API keys:', error);
    res.status(500).json({ error: { message: 'Failed to fetch API keys' } });
  }
});

// Create new API key
router.post('/', requireAuth, async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ 
        error: { message: 'Key name is required' } 
      });
    }

    // Check if user has reached key limit (e.g., 5 keys)
    const existingKeysSnapshot = await admin.firestore()
      .collection('api_keys')
      .where('userId', '==', req.user.uid)
      .where('active', '==', true)
      .get();

    if (existingKeysSnapshot.size >= 5) {
      return res.status(400).json({ 
        error: { message: 'Maximum number of API keys reached (5)' } 
      });
    }

    // Generate new key
    const apiKey = generateApiKey();
    const hashedKey = hashApiKey(apiKey);

    // Store in Firestore
    const keyData = {
      userId: req.user.uid,
      name: name.trim(),
      hashedKey,
      created: admin.firestore.FieldValue.serverTimestamp(),
      lastUsed: null,
      requestCount: 0,
      rateLimit: 60, // Default rate limit
      active: true
    };

    const docRef = await admin.firestore()
      .collection('api_keys')
      .add(keyData);

    // Return the key only once (user must save it)
    res.json({
      id: docRef.id,
      name: keyData.name,
      key: apiKey, // Only returned on creation
      created: new Date().toISOString(),
      rateLimit: keyData.rateLimit
    });
  } catch (error) {
    console.error('Error creating API key:', error);
    res.status(500).json({ error: { message: 'Failed to create API key' } });
  }
});

// Revoke API key
router.delete('/:keyId', requireAuth, async (req, res) => {
  try {
    const { keyId } = req.params;
    
    // Verify ownership
    const keyDoc = await admin.firestore()
      .collection('api_keys')
      .doc(keyId)
      .get();

    if (!keyDoc.exists || keyDoc.data().userId !== req.user.uid) {
      return res.status(404).json({ 
        error: { message: 'API key not found' } 
      });
    }

    // Soft delete (set active to false)
    await keyDoc.ref.update({ active: false });

    res.status(204).send();
  } catch (error) {
    console.error('Error revoking API key:', error);
    res.status(500).json({ error: { message: 'Failed to revoke API key' } });
  }
});

module.exports = router;