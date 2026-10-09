const express = require('express');
const { getInventory, addItem } = require('../controllers/inventoryController');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, getInventory);
router.post('/', authenticate, authorizeAdmin, addItem);

module.exports = router;
