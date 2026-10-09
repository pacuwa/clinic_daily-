const express = require('express');
const { validateUser, handleValidationErrors } = require('../middleware/validation');

const userRoutes = require('./users');
const accountRoutes = require('./account');

const router = express.Router();

router.use('/users', userRoutes);
router.use('/account', accountRoutes);

module.exports = router;
