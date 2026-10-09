const express = require('express');
const { validateStockOut, handleValidationErrors } = require('../middleware/validation');
const { recordStockOut, getStockOutHistory } = require('../controllers/stockController');
const { authenticate, authorizeStaff, checkUserStatus } = require('../middleware/auth');

const router = express.Router();

router.post('/', authenticate, checkUserStatus, authorizeStaff, validateStockOut, handleValidationErrors, recordStockOut);
router.get('/', authenticate, checkUserStatus, getStockOutHistory);

module.exports = router;
