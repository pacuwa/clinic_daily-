const express = require('express');
const { getDailyReport, getWeeklyReport, getMonthlyReport, getStockLevelsReport } = require('../controllers/reportController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/daily', authenticate, getDailyReport);
router.get('/weekly', authenticate, getWeeklyReport);
router.get('/monthly', authenticate, getMonthlyReport);
router.get('/stock-levels', authenticate, getStockLevelsReport);

module.exports = router;
