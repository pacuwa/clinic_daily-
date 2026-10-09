const express = require('express');
const { authenticate } = require('../middleware/auth');
const { getDb } = require('../config/db');
const bcrypt = require('bcryptjs');

const router = express.Router();

// Change password
router.post('/change-password', authenticate, async (req, res) => {
  const { current_password, new_password, confirm_password } = req.body;

  if (!current_password || !new_password || !confirm_password) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  if (new_password.length < 6) {
    return res.status(400).json({ message: 'New password must be at least 6 characters.' });
  }

  if (new_password !== confirm_password) {
    return res.status(400).json({ message: 'Passwords do not match.' });
  }

  const db = getDb();

  db.get('SELECT password_hash FROM users WHERE id = ?', [req.user.id], async (err, user) => {
    if (err) {
      return res.status(500).json({ message: 'Database error.' });
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    try {
      const validPassword = await bcrypt.compare(current_password, user.password_hash);

      if (!validPassword) {
        return res.status(401).json({ message: 'Current password is incorrect.' });
      }

      const salt = await bcrypt.genSalt(10);
      const new_password_hash = await bcrypt.hash(new_password, salt);

      db.run(
        `UPDATE users SET password_hash = ?, updated_at = datetime('now') WHERE id = ?`,
        [new_password_hash, req.user.id],
        (err) => {
          if (err) {
            return res.status(500).json({ message: 'Unable to update password.' });
          }

          return res.json({ message: 'Password changed successfully' });
        }
      );
    } catch (error) {
      return res.status(500).json({ message: 'Error changing password.' });
    }
  });
});

module.exports = router;
