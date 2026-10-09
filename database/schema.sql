const express = require('express');
const { getDailyReport } = require('../controllers/reportController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/daily', authenticate, getDailyReport);

module.exports = router;
