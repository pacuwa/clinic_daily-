const express = require('express');
const { validateStockIn, handleValidationErrors } = require('../middleware/validation');
const { recordStockIn, getStockInHistory } = require('../controllers/stockController');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

const router = express.Router();

router.post('/', authenticate, authorizeAdmin, validateStockIn, handleValidationErrors, recordStockIn);
router.get('/', authenticate, getStockInHistory);

module.exports = router;
