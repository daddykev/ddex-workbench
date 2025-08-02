const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors');
const express = require('express');

// Initialize Firebase Admin
admin.initializeApp();

// Create Express app
const app = express();

// Configure CORS
const corsOptions = {
  origin: [
    'https://ddex-workbench.org',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000'
  ],
  credentials: true,
  optionsSuccessStatus: 200
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Parse JSON bodies
app.use(express.json({ limit: '10mb' }));

// Request logging middleware (helpful for debugging)
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Import middleware
const apiKeyAuth = require('./middleware/apiKeyAuth');
const createRateLimiter = require('./middleware/rateLimiter');

// Import route handlers
const validateRoutes = require('./api/validate');
const snippetRoutes = require('./api/snippets');
const keyRoutes = require('./api/keys');

// Create rate limiter
const rateLimiter = createRateLimiter();

// Health check endpoint (no auth required)
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'DDEX Workbench API',
    version: '1.0.0'
  });
});

// API Routes with authentication and rate limiting

// Validation endpoints - support both authenticated and anonymous
app.use('/api/validate', apiKeyAuth, rateLimiter, validateRoutes);

// API key management routes (require Firebase Auth, no API key auth)
app.use('/api/keys', keyRoutes);

// Snippets endpoints - support both authenticated and anonymous
app.use('/api/snippets', apiKeyAuth, rateLimiter, snippetRoutes);

// Formats endpoint with optional auth
app.get('/api/formats', apiKeyAuth, rateLimiter, (req, res) => {
  const { ERN_CONFIGS } = require('./validators/ernValidator');
  
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

// Validation history endpoint (requires Firebase Auth)
app.get('/api/validations/history', apiKeyAuth, rateLimiter, async (req, res) => {
  // Check if user is authenticated via Firebase Auth token
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: { message: 'Authentication required' } });
  }

  try {
    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Fetch validation history
    const { limit = 20, startAfter } = req.query;
    let query = admin.firestore()
      .collection('validation_history')
      .where('userId', '==', decodedToken.uid)
      .orderBy('timestamp', 'desc')
      .limit(parseInt(limit));

    if (startAfter) {
      const startDoc = await admin.firestore()
        .collection('validation_history')
        .doc(startAfter)
        .get();
      if (startDoc.exists) {
        query = query.startAfter(startDoc);
      }
    }

    const snapshot = await query.get();
    const history = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp.toDate().toISOString()
    }));

    res.json({
      history,
      hasMore: snapshot.docs.length === parseInt(limit),
      lastId: snapshot.docs[snapshot.docs.length - 1]?.id
    });
  } catch (error) {
    console.error('Error fetching validation history:', error);
    res.status(500).json({ error: { message: 'Failed to fetch validation history' } });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: {
      code: 'ENDPOINT_NOT_FOUND',
      message: 'Endpoint not found',
      path: req.path
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // Check if it's a rate limit error
  if (err.status === 429) {
    return res.status(429).json({
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests, please try again later'
      }
    });
  }
  
  res.status(err.status || 500).json({
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message: err.message || 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
});

// Export the Express app as a Cloud Function
exports.app = functions.https.onRequest(app);