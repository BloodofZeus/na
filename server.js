const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001; // Use different port from frontend

// Middleware
app.use(cors());
app.use(express.json());

// Import API route handlers
const healthHandler = require('./api/health');
const loginHandler = require('./api/login');
const menuHandler = require('./api/menu');
const ordersHandler = require('./api/orders');
const staffHandler = require('./api/staff');
const initDbHandler = require('./api/init-db');
// Remove the problematic stock handler import for now

// API Routes - Convert Vercel serverless functions to Express routes
app.get('/api/health', (req, res) => healthHandler(req, res));
app.post('/api/login', (req, res) => loginHandler(req, res));

// Menu routes
app.get('/api/menu', (req, res) => menuHandler(req, res));
app.post('/api/menu', (req, res) => menuHandler(req, res));
app.put('/api/menu', (req, res) => menuHandler(req, res));

// Stock route - handle within menu handler
app.put('/api/menu/:id/stock', (req, res) => {
  // Set the URL for the handler to parse and add stock to body
  req.url = `/api/menu/${req.params.id}/stock`;
  req.body = { id: req.params.id, ...req.body };
  menuHandler(req, res);
});

// Orders routes
app.get('/api/orders', (req, res) => ordersHandler(req, res));
app.post('/api/orders', (req, res) => ordersHandler(req, res));

// Staff routes
app.get('/api/staff', (req, res) => staffHandler(req, res));
app.post('/api/staff', (req, res) => staffHandler(req, res));

// Database initialization route
app.post('/api/init-db', (req, res) => initDbHandler(req, res));

// CORS is already handled by the cors() middleware above

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
  
  // Handle client-side routing
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    }
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message 
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 API Server running on http://0.0.0.0:${PORT}`);
  console.log(`📊 Health check available at http://0.0.0.0:${PORT}/api/health`);
});

module.exports = app;