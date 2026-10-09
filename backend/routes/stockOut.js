const express = require('express');
const { recordStockIn } = require('../controllers/stockController');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

const router = express.Router();

router.post('/', authenticate, authorizeAdmin, recordStockIn);

module.exports = router;
