const express = require('express');
const { getDailyReport, getWeeklyReport, getMonthlyReport, getStockLevelsReport, getCategoryReport, getItemReport, getWeeklyDetailedReport } = require('../controllers/reportController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/daily', authenticate, getDailyReport);
router.get('/weekly', authenticate, getWeeklyReport);
router.get('/monthly', authenticate, getMonthlyReport);
router.get('/stock-levels', authenticate, getStockLevelsReport);
router.get('/category', authenticate, getCategoryReport);
router.get('/items', authenticate, getItemReport);
router.get('/weekly-detailed', authenticate, getWeeklyDetailedReport);

module.exports = router;
