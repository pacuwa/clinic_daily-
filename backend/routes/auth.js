const express = require('express');
const { validateLogin, handleValidationErrors } = require('../middleware/validation');
const { loginUser, getProfile } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.post('/login', validateLogin, handleValidationErrors, loginUser);
router.get('/profile', authenticate, getProfile);

module.exports = router;
