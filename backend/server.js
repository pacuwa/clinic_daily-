const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const path = require('path');

const authRoutes = require('./routes/auth');
const inventoryRoutes = require('./routes/inventory');
const stockInRoutes = require('./routes/stockIn');
const stockOutRoutes = require('./routes/stockOut');
const reportRoutes = require('./routes/reports');
const settingsRoutes = require('./routes/settings');
const { initializeDatabase } = require('./config/db');

// Load local .env only in development
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware Setup
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(
  helmet({
    contentSecurityPolicy: false, // Prevents blocking local frontend scripts/inline styles
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/stock-in', stockInRoutes);
app.use('/api/stock-out', stockOutRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/settings', settingsRoutes);

// Serve static files from frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Page Routing & SPA Catch-All
app.get('/pages/*', (req, res) => {
  const page = req.params[0];
  const pagePath = path.join(__dirname, `../frontend/pages/${page}.html`);
  res.sendFile(pagePath, (err) => {
    if (err) {
      res.status(404).json({ message: 'Page not found.' });
    }
  });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Centralized Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

// Start Server after Database Initialization
initializeDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`\n🏥 Clinic Daily Server Running on port ${PORT}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  })
  .catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });

module.exports = app;
