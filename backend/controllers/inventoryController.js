const bcrypt = require('bcryptjs');
const { getDb } = require('../config/db');
const { createToken } = require('./authController');

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  const db = getDb();

  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err) {
      return res.status(500).json({ message: 'Database error.' });
    }

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const token = createToken(user);

    return res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        full_name: user.full_name
      }
    });
  });
};

module.exports = { loginUser };
