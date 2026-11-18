// functions/index.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors');
const express = require('express');

// Initialize Firebase Admin
admin.initializeApp();

// Create Express app
const app = express();

// Trust only Google's proxies and Cloudflare when reading X-Forwarded-For, so
// req.ip is the client's address and can't be set by the client.
// See middleware/clientIp.js for the hop chain.
const { trustProxy, logClientIp } = require('./middleware/clientIp');
app.set('trust proxy', trustProxy);

// Configure CORS
const corsOptions = {
  origin: [
    'https://ddex-workbench.org',
    'https://ddex-workbench.web.app',
    'https://ddex-workbench.firebaseapp.com',
    'https://stardust-distro.org',  // Add Stardust DSP domain
    'https://stardust-dsp.org',  // Add Stardust DSP domain
    'https://*.cloudfunctions.net',  // Add if calling from Cloud Functions
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000'
  ],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key']
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Parse JSON bodies
app.use(express.json({ limit: '10mb' }));

// Enforce the 10 MB limit even when the Functions Framework has already parsed
// the body (2nd-gen functions parse it before Express, so express.json's limit
// doesn't run there). rawBody is set by the Functions Framework.
const MAX_BODY_BYTES = 10 * 1024 * 1024;
app.use((req, res, next) => {
  const size = req.rawBody ? req.rawBody.length : Number(req.headers['content-length'] || 0);
  if (size > MAX_BODY_BYTES) {
    return res.status(413).json({
      error: { message: 'Request body exceeds the 10 MB limit' }
    });
  }
  next();
});

// Request logging middleware (helpful for debugging)
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Temporary client-IP debug log; enable with DEBUG_CLIENT_IP=true
app.use(logClientIp);

// Import route handlers
const validateRoutes = require('./api/validate');
const keyRoutes = require('./api/keys');
const deezerRoutes = require('./api/deezer');

// Identify the caller (API key, then Firebase ID token, then IP), then rate limit:
// 10/min anonymous, 60/min with an API key or when signed in.
// Applied to validation and formats only: /keys uses Firebase ID tokens,
// /health is unauthenticated, and /deezer is left as is.
const apiKeyAuth = require('./middleware/apiKeyAuth');
const rateLimiter = require('./middleware/rateLimiter')();
const validationGuards = [apiKeyAuth, rateLimiter];

// Mount routes WITHOUT /api prefix (the Cloudflare Worker strips /v1, so
// api.ddex-workbench.org/v1/validate arrives here as /validate)
app.use('/validate', validationGuards, validateRoutes);
app.use('/keys', keyRoutes);
app.use('/deezer', deezerRoutes);

// Also keep /api routes for backward compatibility with direct access
app.use('/api/validate', validationGuards, validateRoutes);
app.use('/api/keys', keyRoutes);
app.use('/api/deezer', deezerRoutes);

// Health check endpoint (both paths)
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'DDEX Workbench API',
    version: '1.0.2'
  });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'DDEX Workbench API',
    version: '1.0.2'
  });
});

// Supported formats endpoint (both paths)
app.get('/formats', validationGuards, (req, res) => {
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

app.get('/api/formats', validationGuards, (req, res) => {
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

// Malformed JSON body (from express.json): return JSON instead of the default HTML page.
// Note: under the Functions Framework (deployed and in the emulator) the body is
// parsed before this app runs, so a malformed body is rejected there with an HTML
// 400 and never reaches this handler. It applies only when express.json parses.
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed' || (err instanceof SyntaxError && 'body' in err)) {
    return res.status(400).json({
      error: { code: 'INVALID_JSON', message: 'Request body is not valid JSON.' }
    });
  }
  next(err);
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