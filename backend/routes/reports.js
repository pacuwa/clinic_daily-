const express = require('express');
const { recordStockOut } = require('../controllers/stockController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.post('/', authenticate, recordStockOut);

module.exports = router;
