const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/auth');
const { getDb } = require('../config/db');

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

const authorizeAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'Admin') {
    return next();
  }

  return res.status(403).json({ message: 'Admin access required.' });
};

const authorizeStaff = (req, res, next) => {
  if (req.user && (req.user.role === 'Staff' || req.user.role === 'Admin')) {
    return next();
  }

  return res.status(403).json({ message: 'Staff access required.' });
};

const checkUserStatus = (req, res, next) => {
  const db = getDb();

  db.get('SELECT status FROM users WHERE id = ?', [req.user.id], (err, user) => {
    if (err || !user) {
      return res.status(401).json({ message: 'User not found or access denied.' });
    }

    if (user.status === 'Inactive') {
      return res.status(403).json({ message: 'Your account is inactive. Please contact admin.' });
    }

    next();
  });
};

module.exports = { authenticate, authorizeAdmin, authorizeStaff, checkUserStatus };
