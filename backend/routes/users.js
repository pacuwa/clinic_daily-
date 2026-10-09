const express = require('express');
const { getDb } = require('../config/db');
const bcrypt = require('bcryptjs');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all users (Admin only)
router.get('/', authenticate, authorizeAdmin, (req, res) => {
  const db = getDb();

  db.all(
    'SELECT id, email, role, full_name, status, created_at FROM users ORDER BY created_at DESC',
    [],
    (err, rows) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Unable to fetch users.' });
      }
      return res.json({
        message: 'Users fetched successfully',
        data: rows || []
      });
    }
  );
});

// Create new user (Admin only)
router.post('/', authenticate, authorizeAdmin, async (req, res) => {
  const { email, password, role, full_name } = req.body;

  if (!email || !password || !role || !full_name) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  if (!['Admin', 'Staff'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role.' });
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const db = getDb();

    db.run(
      `INSERT INTO users (email, password_hash, role, full_name, status, created_at) VALUES (?, ?, ?, ?, ?, datetime('now'))`,
      [email, password_hash, role, full_name, 'Active'],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE')) {
            return res.status(400).json({ message: 'Email already exists.' });
          }
          console.error('Database error:', err);
          return res.status(500).json({ message: 'Unable to create user.' });
        }

        return res.status(201).json({
          message: 'User created successfully',
          data: {
            id: this.lastID,
            email,
            role,
            full_name,
            status: 'Active'
          }
        });
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ message: 'Unable to create user.' });
  }
});

// Update user status (Admin only)
router.put('/:id/status', authenticate, authorizeAdmin, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['Active', 'Inactive'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status.' });
  }

  const db = getDb();

  db.run(
    `UPDATE users SET status = ?, updated_at = datetime('now') WHERE id = ?`,
    [status, id],
    function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Unable to update user.' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ message: 'User not found.' });
      }

      return res.json({ message: 'User status updated successfully' });
    }
  );
});

module.exports = router;
