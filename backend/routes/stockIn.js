const express = require('express');
const { validateStockIn, handleValidationErrors } = require('../middleware/validation');
const { recordStockIn, getStockInHistory } = require('../controllers/stockController');
const { authenticate, authorizeAdmin, checkUserStatus } = require('../middleware/auth');

const router = express.Router();

router.post('/', authenticate, checkUserStatus, authorizeAdmin, validateStockIn, handleValidationErrors, recordStockIn);
router.get('/', authenticate, checkUserStatus, getStockInHistory);

module.exports = router;
