const { body, validationResult } = require('express-validator');

const validateLogin = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

const validateItem = [
  body('item_name').notEmpty().withMessage('Item name is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('unit').notEmpty().withMessage('Unit is required'),
  body('opening_stock').isInt({ min: 0 }).withMessage('Opening stock must be a positive number'),
  body('reorder_level').isInt({ min: 0 }).withMessage('Reorder level must be a positive number')
];

const validateStockIn = [
  body('item_id').isInt({ min: 1 }).withMessage('Valid item ID is required'),
  body('quantity_in').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('unit_cost').isFloat({ min: 0 }).withMessage('Unit cost must be a positive number')
];

const validateStockOut = [
  body('item_id').isInt({ min: 1 }).withMessage('Valid item ID is required'),
  body('quantity_out').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('sale_price').isFloat({ min: 0 }).withMessage('Sale price must be a positive number')
];

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }
  next();
};

module.exports = {
  validateLogin,
  validateItem,
  validateStockIn,
  validateStockOut,
  handleValidationErrors
};
