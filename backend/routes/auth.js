const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { db } = require('../config/db');

// Secret key for JWT (uses environment variable or a fallback for dev)
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_here';

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password, full_name, role } = req.body;

    if (!email || !password || !full_name) {
      return res.status(400).json({ message: 'Email, password, and full name are required.' });
    }

    // Check if user already exists
    const existingUser = await db.oneOrNone('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser) {
      return res.status(400).json({ message: 'A user with this email is already registered.' });
    }

    // Hash the password securely
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Default role to 'Staff' unless 'Admin' is explicitly requested
    const userRole = role === 'Admin' ? 'Admin' : 'Staff';

    // Insert new user into database and return user details (excluding password)
    const newUser = await db.one(
      `INSERT INTO users (email, password_hash, role, full_name, status) 
       VALUES ($1, $2, $3, $4, 'Active') 
       RETURNING id, email, role, full_name, status, created_at`,
      [email, password_hash, userRole, full_name]
    );

    // Generate JWT token (expires in 24 hours)
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: newUser,
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error during registration.' });
  }
});

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
  res.json({ message: 'Logged out successfully.' });
});

module.exports = router;
