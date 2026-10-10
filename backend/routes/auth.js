const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { db } = require('../config/db'); // Adjust path to your db.js if needed

// Secret key for JWT (uses environment variable or a fallback for dev)
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_here';

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    // Find user by email
    const user = await db.oneOrNone('SELECT * FROM users WHERE email = $1', [email]);

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Check if user account is active
    if (user.status !== 'Active') {
      return res.status(403).json({ message: 'This account has been deactivated.' });
    }

    // Compare password with stored bcrypt hash
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Generate JWT token (expires in 24 hours)
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Send back token and user info (excluding password hash)
    const { password_hash, ...userWithoutPassword } = user;

    res.json({
      message: 'Login successful',
      token,
      user: userWithoutPassword,
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error during login.' });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  // Since JWT is stateless, logout is typically handled on the frontend 
  // by clearing localStorage, but we provide this endpoint for completeness.
  res.json({ message: 'Logged out successfully.' });
});

module.exports = router;
