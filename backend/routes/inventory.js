const express = require('express');
const { validateItem, handleValidationErrors } = require('../middleware/validation');
const { getInventory, getItemById, addItem, updateItem } = require('../controllers/inventoryController');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, getInventory);
router.get('/:id', authenticate, getItemById);
router.post('/', authenticate, authorizeAdmin, validateItem, handleValidationErrors, addItem);
router.put('/:id', authenticate, authorizeAdmin, updateItem);

module.exports = router;
