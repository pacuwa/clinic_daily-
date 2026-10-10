const { getDb } = require('../config/db');

const getInventory = async (req, res) => {
  try {
    const db = getDb();
    const rows = await db.any(
      'SELECT id, item_name, category, unit, opening_stock, current_stock, reorder_level, unit_cost, supplier, created_at FROM items ORDER BY item_name ASC'
    );

    return res.json({
      message: 'Inventory fetched successfully',
      data: rows || []
    });
  } catch (err) {
    console.error('Database error:', err);
    return res.status(500).json({ message: 'Unable to fetch inventory.' });
  }
};

const getItemById = async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDb();
    
    const row = await db.oneOrNone('SELECT * FROM items WHERE id = $1', [id]);

    if (!row) {
      return res.status(404).json({ message: 'Item not found.' });
    }

    return res.json({
      message: 'Item fetched successfully',
      data: row
    });
  } catch (err) {
    console.error('Database error:', err);
    return res.status(500).json({ message: 'Unable to fetch item.' });
  }
};

const addItem = async (req, res) => {
  try {
    const { item_name, category, unit, opening_stock, reorder_level, unit_cost, supplier } = req.body;

    if (!item_name || !category || !unit) {
      return res.status(400).json({ message: 'Item name, category, and unit are required.' });
    }

    const db = getDb();
    const stock = opening_stock || 0;

    const newItem = await db.one(
      `INSERT INTO items (item_name, category, unit, opening_stock, current_stock, reorder_level, unit_cost, supplier, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
       RETURNING id, item_name, category, unit, opening_stock, current_stock, reorder_level, unit_cost, supplier, created_at`,
      [item_name, category, unit, stock, stock, reorder_level || 0, unit_cost || 0, supplier || '']
    );

    return res.status(201).json({
      message: 'Item added successfully',
      data: newItem
    });
  } catch (err) {
    console.error('Database error:', err);
    return res.status(500).json({ message: 'Unable to add item.' });
  }
};

const updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { item_name, category, unit, reorder_level, unit_cost, supplier } = req.body;

    const db = getDb();

    const updatedItem = await db.oneOrNone(
      `UPDATE items SET item_name = $1, category = $2, unit = $3, reorder_level = $4, unit_cost = $5, supplier = $6 
       WHERE id = $7 RETURNING id`,
      [item_name, category, unit, reorder_level, unit_cost, supplier, id]
    );

    if (!updatedItem) {
      return res.status(404).json({ message: 'Item not found.' });
    }

    return res.json({ message: 'Item updated successfully' });
  } catch (err) {
    console.error('Database error:', err);
    return res.status(500).json({ message: 'Unable to update item.' });
  }
};

module.exports = { getInventory, getItemById, addItem, updateItem };
