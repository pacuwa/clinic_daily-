const express = require('express');
const { validateStockOut, handleValidationErrors } = require('../middleware/validation');
const { recordStockOut, getStockOutHistory } = require('../controllers/stockController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.post('/', authenticate, validateStockOut, handleValidationErrors, recordStockOut);
router.get('/', authenticate, getStockOutHistory);

module.exports = router;
