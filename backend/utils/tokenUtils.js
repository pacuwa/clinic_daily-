const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/auth');

const createToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      full_name: user.full_name
    },
    jwtSecret,
    { expiresIn: '8h' }
  );
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, jwtSecret);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

module.exports = { createToken, verifyToken };
