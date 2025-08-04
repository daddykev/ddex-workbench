// functions/index.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors');
const express = require('express');

// Initialize Firebase Admin
admin.initializeApp();

// Create Express app
const app = express();

// Trust proxy for Cloud Functions environment
app.set('trust proxy', true);

// Configure CORS
const corsOptions = {
  origin: [
    'https://ddex-workbench.org',
    'https://ddex-workbench.web.app',
    'https://ddex-workbench.firebaseapp.com',
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

// Import route handlers
const validateRoutes = require('./api/validate');
const snippetRoutes = require('./api/snippets');
const keysRoutes = require('./api/keys'); // ADD THIS LINE

// API Routes
app.use('/api/validate', validateRoutes);
app.use('/api/snippets', snippetRoutes);
app.use('/api/keys', keysRoutes); // ADD THIS LINE

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'DDEX Workbench API',
    version: '1.0.0'
  });
});

// Supported formats endpoint (public)
app.get('/api/formats', (req, res) => {
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

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: {
      message: 'Endpoint not found',
      path: req.path
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
});

// Export the Express app as a Cloud Function
exports.app = functions.https.onRequest(app);