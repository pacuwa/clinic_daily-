const { getDb } = require('../config/db');

const recordStockIn = (req, res) => {
  const { item_id, quantity_in, unit_cost, supplier, notes } = req.body;

  if (!item_id || !quantity_in) {
    return res.status(400).json({ message: 'Item ID and quantity are required.' });
  }

  const db = getDb();

  db.get('SELECT * FROM items WHERE id = ?', [item_id], (err, item) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ message: 'Database error.' });
    }

    if (!item) {
      return res.status(404).json({ message: 'Item not found.' });
    }

    db.run(
      `INSERT INTO stock_in (item_id, quantity_in, unit_cost, supplier, notes, received_by, date_in)
       VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`,
      [item_id, quantity_in, unit_cost || 0, supplier || '', notes || '', req.user.id],
      function(err) {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ message: 'Unable to record stock in.' });
        }

        db.run(
          `UPDATE items SET current_stock = current_stock + ? WHERE id = ?`,
          [quantity_in, item_id],
          (updateErr) => {
            if (updateErr) {
              console.error('Database error:', updateErr);
              return res.status(500).json({ message: 'Unable to update stock.' });
            }

            return res.status(201).json({
              message: 'Stock in recorded successfully',
              data: {
                id: this.lastID,
                item_id,
                quantity_in,
                unit_cost: unit_cost || 0,
                supplier: supplier || '',
                notes: notes || ''
              }
            });
          }
        );
      }
    );
  });
};

const recordStockOut = (req, res) => {
  const { item_id, quantity_out, sale_price, sold_to, notes } = req.body;

  if (!item_id || !quantity_out) {
    return res.status(400).json({ message: 'Item ID and quantity are required.' });
  }

  const db = getDb();

  db.get('SELECT current_stock FROM items WHERE id = ?', [item_id], (err, item) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ message: 'Database error.' });
    }

    if (!item) {
      return res.status(404).json({ message: 'Item not found.' });
    }

    if (item.current_stock < quantity_out) {
      return res.status(400).json({
        message: `Insufficient stock. Available: ${item.current_stock}, Requested: ${quantity_out}`
      });
    }

    db.run(
      `INSERT INTO stock_out (item_id, quantity_out, sale_price, sold_to, notes, recorded_by, date_out)
       VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`,
      [item_id, quantity_out, sale_price || 0, sold_to || 'Customer', notes || '', req.user.id],
      function(err) {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ message: 'Unable to record stock out.' });
        }

        db.run(
          `UPDATE items SET current_stock = current_stock - ? WHERE id = ?`,
          [quantity_out, item_id],
          (updateErr) => {
            if (updateErr) {
              console.error('Database error:', updateErr);
              return res.status(500).json({ message: 'Unable to update stock.' });
            }

            return res.status(201).json({
              message: 'Stock out recorded successfully',
              data: {
                id: this.lastID,
                item_id,
                quantity_out,
                sale_price: sale_price || 0,
                sold_to: sold_to || 'Customer',
                notes: notes || ''
              }
            });
          }
        );
      }
    );
  });
};

const getStockInHistory = (req, res) => {
  const db = getDb();

  db.all(
    `SELECT si.*, i.item_name, u.full_name as received_by_name
     FROM stock_in si
     JOIN items i ON si.item_id = i.id
     JOIN users u ON si.received_by = u.id
     ORDER BY si.date_in DESC LIMIT 100`,
    [],
    (err, rows) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Unable to fetch stock in history.' });
      }

      return res.json({
        message: 'Stock in history fetched successfully',
        data: rows || []
      });
    }
  );
};

const getStockOutHistory = (req, res) => {
  const db = getDb();

  db.all(
    `SELECT so.*, i.item_name, u.full_name as recorded_by_name
     FROM stock_out so
     JOIN items i ON so.item_id = i.id
     JOIN users u ON so.recorded_by = u.id
     ORDER BY so.date_out DESC LIMIT 100`,
    [],
    (err, rows) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Unable to fetch stock out history.' });
      }

      return res.json({
        message: 'Stock out history fetched successfully',
        data: rows || []
      });
    }
  );
};

module.exports = { recordStockIn, recordStockOut, getStockInHistory, getStockOutHistory };
