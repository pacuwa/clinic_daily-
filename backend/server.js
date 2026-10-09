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

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(helmet());
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

// Catch-all for single-page application
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.get('/pages/*', (req, res) => {
  const page = req.params[0];
  res.sendFile(path.join(__dirname, `../frontend/pages/${page}.html`));
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Endpoint not found.' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

initializeDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`\n🏥 Clinic Daily Server Running`);
      console.log(`📍 http://localhost:${PORT}`);
      console.log(`🔐 Default Admin: admin@clinic.com / admin123`);
      console.log(`👥 Default Staff: staff@clinic.com / staff123`);
      console.log(`\n⚠️  Change default passwords after first login!\n`);
    });
  })
  .catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });

module.exports = app;
