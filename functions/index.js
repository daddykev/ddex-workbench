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

// Import route handlers - UPDATED PATHS
const validateRoutes = require('./api/validate');
const snippetRoutes = require('./api/snippets');

// API Routes
app.use('/api/validate', validateRoutes);
app.use('/api/snippets', snippetRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'DDEX Workbench API'
  });
});

// Export the Express app as a Cloud Function
exports.app = functions.https.onRequest(app)