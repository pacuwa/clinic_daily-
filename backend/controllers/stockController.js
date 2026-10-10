const { getDb } = require('../config/db');

const recordStockIn = async (req, res) => {
  const { item_id, quantity_in, unit_cost, supplier, notes } = req.body;

  if (!item_id || !quantity_in) {
    return res.status(400).json({ message: 'Item ID and quantity are required.' });
  }

  if (quantity_in <= 0) {
    return res.status(400).json({ message: 'Quantity must be greater than 0.' });
  }

  try {
    const db = getDb();

    // Use pg-promise oneOrNone for single record lookups with PostgreSQL placeholders ($1)
    const item = await db.oneOrNone('SELECT * FROM items WHERE id = $1', [item_id]);

    if (!item) {
      return res.status(404).json({ message: 'Item not found.' });
    }

    // Use a transaction or sequential await queries for safety
    const insertResult = await db.one(
      `INSERT INTO stock_in (item_id, quantity_in, unit_cost, supplier, notes, received_by, date_in)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       RETURNING id`,
      [item_id, quantity_in, unit_cost || 0, supplier || '', notes || '', req.user.id]
    );

    await db.none(
      `UPDATE items SET current_stock = current_stock + $1 WHERE id = $2`,
      [quantity_in, item_id]
    );

    return res.status(201).json({
      message: 'Stock in recorded successfully',
      data: {
        id: insertResult.id,
        item_id,
        item_name: item.item_name,
        quantity_in,
        unit_cost: unit_cost || 0,
        supplier: supplier || '',
        notes: notes || '',
        date_in: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Database error in recordStockIn:', error);
    return res.status(500).json({ message: 'Unable to record stock in.' });
  }
};

const recordStockOut = async (req, res) => {
  const { item_id, quantity_out, sale_price, sold_to, notes } = req.body;

  if (!item_id || !quantity_out) {
    return res.status(400).json({ message: 'Item ID and quantity are required.' });
  }

  if (quantity_out <= 0) {
    return res.status(400).json({ message: 'Quantity must be greater than 0.' });
  }

  if (sale_price < 0) {
    return res.status(400).json({ message: 'Sale price cannot be negative.' });
  }

  try {
    const db = getDb();

    const item = await db.oneOrNone('SELECT current_stock FROM items WHERE id = $1', [item_id]);

    if (!item) {
      return res.status(404).json({ message: 'Item not found.' });
    }

    if (item.current_stock < quantity_out) {
      return res.status(400).json({
        message: `Insufficient stock. Available: ${item.current_stock}, Requested: ${quantity_out}`
      });
    }

    const insertResult = await db.one(
      `INSERT INTO stock_out (item_id, quantity_out, sale_price, sold_to, notes, recorded_by, date_out)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       RETURNING id`,
      [item_id, quantity_out, sale_price || 0, sold_to || 'Customer', notes || '', req.user.id]
    );

    await db.none(
      `UPDATE items SET current_stock = current_stock - $1 WHERE id = $2`,
      [quantity_out, item_id]
    );

    return res.status(201).json({
      message: 'Stock out recorded successfully',
      data: {
        id: insertResult.id,
        item_id,
        quantity_out,
        sale_price: sale_price || 0,
        total_amount: (sale_price || 0) * quantity_out,
        sold_to: sold_to || 'Customer',
        notes: notes || '',
        date_out: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Database error in recordStockOut:', error);
    return res.status(500).json({ message: 'Unable to record stock out.' });
  }
};

const getStockInHistory = async (req, res) => {
  try {
    const db = getDb();
    const limit = Number(req.query.limit) || 100;

    // Use db.any for returning multiple rows in pg-promise
    const rows = await db.any(
      `SELECT si.*, i.item_name, u.full_name as received_by_name
       FROM stock_in si
       JOIN items i ON si.item_id = i.id
       JOIN users u ON si.received_by = u.id
       ORDER BY si.date_in DESC LIMIT $1`,
      [limit]
    );

    return res.json({
      message: 'Stock in history fetched successfully',
      data: rows || []
    });
  } catch (error) {
    console.error('Database error in getStockInHistory:', error);
    return res.status(500).json({ message: 'Unable to fetch stock in history.' });
  }
};

const getStockOutHistory = async (req, res) => {
  try {
    const db = getDb();
    const limit = Number(req.query.limit) || 100;

    const rows = await db.any(
      `SELECT so.*, i.item_name, u.full_name as recorded_by_name
       FROM stock_out so
       JOIN items i ON so.item_id = i.id
       JOIN users u ON so.recorded_by = u.id
       ORDER BY so.date_out DESC LIMIT $1`,
      [limit]
    );

    return res.json({
      message: 'Stock out history fetched successfully',
      data: rows || []
    });
  } catch (error) {
    console.error('Database error in getStockOutHistory:', error);
    return res.status(500).json({ message: 'Unable to fetch stock out history.' });
  }
};

module.exports = { recordStockIn, recordStockOut, getStockInHistory, getStockOutHistory };
