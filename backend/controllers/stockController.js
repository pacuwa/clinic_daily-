const { getDb } = require('../config/db');

const getInventory = (req, res) => {
  const db = getDb();

  db.all('SELECT * FROM items ORDER BY item_name ASC', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ message: 'Unable to fetch inventory.' });
    }

    return res.json(rows);
  });
};

const addItem = (req, res) => {
  const { item_name, category, unit, opening_stock, reorder_level, unit_cost, supplier } = req.body;

  if (!item_name || !category || !unit) {
    return res.status(400).json({ message: 'Required item fields are missing.' });
  }

  const db = getDb();

  db.run(
    `INSERT INTO items (item_name, category, unit, opening_stock, current_stock, reorder_level, unit_cost, supplier) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [item_name, category, unit, opening_stock || 0, opening_stock || 0, reorder_level || 0, unit_cost || 0, supplier || '']
  );

  return res.status(201).json({ message: 'Item added successfully.' });
};

module.exports = { getInventory, addItem };
