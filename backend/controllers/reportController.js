const { getDb } = require('../config/db');

const recordStockIn = (req, res) => {
  const { item_id, quantity_in, unit_cost, supplier, notes } = req.body;

  if (!item_id || !quantity_in) {
    return res.status(400).json({ message: 'Item and quantity are required.' });
  }

  const db = getDb();

  db.run(
    `INSERT INTO stock_in (item_id, quantity_in, unit_cost, supplier, notes, received_by, date_in) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`,
    [item_id, quantity_in, unit_cost || 0, supplier || '', notes || '', req.user.id]
  );

  db.run(
    `UPDATE items SET current_stock = current_stock + ? WHERE id = ?`,
    [quantity_in, item_id]
  );

  return res.status(201).json({ message: 'Stock in recorded successfully.' });
};

const recordStockOut = (req, res) => {
  const { item_id, quantity_out, sale_price, sold_to, notes } = req.body;

  if (!item_id || !quantity_out) {
    return res.status(400).json({ message: 'Item and quantity are required.' });
  }

  const db = getDb();

  db.run(
    `INSERT INTO stock_out (item_id, quantity_out, sale_price, sold_to, notes, recorded_by, date_out) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`,
    [item_id, quantity_out, sale_price || 0, sold_to || 'Customer', notes || '', req.user.id]
  );

  db.run(
    `UPDATE items SET current_stock = current_stock - ? WHERE id = ?`,
    [quantity_out, item_id]
  );

  return res.status(201).json({ message: 'Stock out recorded successfully.' });
};

module.exports = { recordStockIn, recordStockOut };
