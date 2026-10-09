const { getDb } = require('../config/db');

const getInventory = (req, res) => {
  const db = getDb();

  db.all(
    'SELECT id, item_name, category, unit, opening_stock, current_stock, reorder_level, unit_cost, supplier, created_at FROM items ORDER BY item_name ASC',
    [],
    (err, rows) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Unable to fetch inventory.' });
      }

      return res.json({
        message: 'Inventory fetched successfully',
        data: rows || []
      });
    }
  );
};

const getItemById = (req, res) => {
  const { id } = req.params;
  const db = getDb();

  db.get(
    'SELECT * FROM items WHERE id = ?',
    [id],
    (err, row) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Unable to fetch item.' });
      }

      if (!row) {
        return res.status(404).json({ message: 'Item not found.' });
      }

      return res.json({
        message: 'Item fetched successfully',
        data: row
      });
    }
  );
};

const addItem = (req, res) => {
  const { item_name, category, unit, opening_stock, reorder_level, unit_cost, supplier } = req.body;

  if (!item_name || !category || !unit) {
    return res.status(400).json({ message: 'Item name, category, and unit are required.' });
  }

  const db = getDb();
  const stock = opening_stock || 0;

  db.run(
    `INSERT INTO items (item_name, category, unit, opening_stock, current_stock, reorder_level, unit_cost, supplier, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
    [item_name, category, unit, stock, stock, reorder_level || 0, unit_cost || 0, supplier || ''],
    function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Unable to add item.' });
      }

      return res.status(201).json({
        message: 'Item added successfully',
        data: {
          id: this.lastID,
          item_name,
          category,
          unit,
          opening_stock: stock,
          current_stock: stock,
          reorder_level: reorder_level || 0,
          unit_cost: unit_cost || 0,
          supplier: supplier || ''
        }
      });
    }
  );
};

const updateItem = (req, res) => {
  const { id } = req.params;
  const { item_name, category, unit, reorder_level, unit_cost, supplier } = req.body;

  const db = getDb();

  db.run(
    `UPDATE items SET item_name = ?, category = ?, unit = ?, reorder_level = ?, unit_cost = ?, supplier = ? WHERE id = ?`,
    [item_name, category, unit, reorder_level, unit_cost, supplier, id],
    function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Unable to update item.' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ message: 'Item not found.' });
      }

      return res.json({ message: 'Item updated successfully' });
    }
  );
};

module.exports = { getInventory, getItemById, addItem, updateItem };
