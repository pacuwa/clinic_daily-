const { body, validationResult } = require('express-validator');

const validateLogin = [
  body('email')
    .isEmail().withMessage('Valid email is required')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

const validateItem = [
  body('item_name')
    .notEmpty().withMessage('Item name is required')
    .isLength({ min: 2 }).withMessage('Item name must be at least 2 characters'),
  body('category')
    .notEmpty().withMessage('Category is required')
    .isIn(['Medicines', 'Supplies', 'Equipment', 'Other']).withMessage('Invalid category'),
  body('unit')
    .notEmpty().withMessage('Unit is required')
    .isIn(['Tablet', 'Bottle', 'Box', 'Unit', 'Tube', 'Vial', 'Strip']).withMessage('Invalid unit'),
  body('opening_stock')
    .isInt({ min: 0 }).withMessage('Opening stock must be a positive number'),
  body('reorder_level')
    .isInt({ min: 0 }).withMessage('Reorder level must be a positive number'),
  body('unit_cost')
    .isFloat({ min: 0 }).withMessage('Unit cost must be a positive number')
];

const validateStockIn = [
  body('item_id')
    .isInt({ min: 1 }).withMessage('Valid item ID is required'),
  body('quantity_in')
    .isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('unit_cost')
    .isFloat({ min: 0 }).withMessage('Unit cost must be a positive number'),
  body('supplier')
    .optional()
    .isLength({ min: 2 }).withMessage('Supplier name must be at least 2 characters')
];

const validateStockOut = [
  body('item_id')
    .isInt({ min: 1 }).withMessage('Valid item ID is required'),
  body('quantity_out')
    .isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('sale_price')
    .isFloat({ min: 0 }).withMessage('Sale price must be a positive number'),
  body('sold_to')
    .optional()
    .isLength({ min: 2 }).withMessage('Sold to must be at least 2 characters')
];

const validateUser = [
  body('email')
    .isEmail().withMessage('Valid email is required')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('full_name')
    .notEmpty().withMessage('Full name is required')
    .isLength({ min: 2 }).withMessage('Full name must be at least 2 characters'),
  body('role')
    .isIn(['Admin', 'Staff']).withMessage('Role must be either Admin or Staff')
];

const validatePasswordChange = [
  body('current_password')
    .notEmpty().withMessage('Current password is required'),
  body('new_password')
    .isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
  body('confirm_password')
    .notEmpty().withMessage('Please confirm your password')
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
  validateUser,
  validatePasswordChange,
  handleValidationErrors
};
