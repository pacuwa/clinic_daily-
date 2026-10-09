const { getDb } = require('../config/db');

const getDailyReport = (req, res) => {
  const db = getDb();
  const today = new Date().toISOString().split('T')[0];

  db.get(
    `SELECT
      DATE(date_out) AS report_date,
      COUNT(*) AS total_transactions,
      SUM(quantity_out) AS total_quantity_out,
      SUM(sale_price * quantity_out) AS total_sales
    FROM stock_out
    WHERE DATE(date_out) = ?
    GROUP BY DATE(date_out)`,
    [today],
    (err, dailySalesRow) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Unable to generate daily report.' });
      }

      db.get(
        `SELECT
          COUNT(*) AS total_transactions,
          SUM(quantity_in) AS total_quantity_in
        FROM stock_in
        WHERE DATE(date_in) = ?`,
        [today],
        (err, dailyStockInRow) => {
          if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Unable to generate daily report.' });
          }

          return res.json({
            message: 'Daily report generated successfully',
            data: {
              report_date: today,
              stock_in: {
                total_transactions: dailyStockInRow?.total_transactions || 0,
                total_quantity: dailyStockInRow?.total_quantity_in || 0
              },
              stock_out: {
                total_transactions: dailySalesRow?.total_transactions || 0,
                total_quantity: dailySalesRow?.total_quantity_out || 0,
                total_sales: dailySalesRow?.total_sales || 0
              }
            }
          });
        }
      );
    }
  );
};

const getWeeklyReport = (req, res) => {
  const db = getDb();

  db.all(
    `SELECT
      DATE(date_out) AS report_date,
      SUM(quantity_out) AS total_quantity_out,
      SUM(sale_price * quantity_out) AS total_sales
    FROM stock_out
    WHERE date_out >= datetime('now', '-7 days')
    GROUP BY DATE(date_out)
    ORDER BY report_date DESC`,
    [],
    (err, rows) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Unable to generate weekly report.' });
      }

      const totalQuantity = rows.reduce((sum, row) => sum + (row.total_quantity_out || 0), 0);
      const totalSales = rows.reduce((sum, row) => sum + (row.total_sales || 0), 0);

      return res.json({
        message: 'Weekly report generated successfully',
        data: {
          period: 'Last 7 days',
          daily_breakdown: rows || [],
          summary: {
            total_quantity: totalQuantity,
            total_sales: totalSales
          }
        }
      });
    }
  );
};

const getMonthlyReport = (req, res) => {
  const db = getDb();

  db.all(
    `SELECT
      DATE(date_out) AS report_date,
      SUM(quantity_out) AS total_quantity_out,
      SUM(sale_price * quantity_out) AS total_sales
    FROM stock_out
    WHERE date_out >= datetime('now', '-30 days')
    GROUP BY DATE(date_out)
    ORDER BY report_date DESC`,
    [],
    (err, rows) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Unable to generate monthly report.' });
      }

      const totalQuantity = rows.reduce((sum, row) => sum + (row.total_quantity_out || 0), 0);
      const totalSales = rows.reduce((sum, row) => sum + (row.total_sales || 0), 0);

      return res.json({
        message: 'Monthly report generated successfully',
        data: {
          period: 'Last 30 days',
          daily_breakdown: rows || [],
          summary: {
            total_quantity: totalQuantity,
            total_sales: totalSales
          }
        }
      });
    }
  );
};

const getStockLevelsReport = (req, res) => {
  const db = getDb();

  db.all(
    `SELECT
      id,
      item_name,
      category,
      unit,
      current_stock,
      reorder_level,
      CASE
        WHEN current_stock <= reorder_level THEN 'LOW'
        WHEN current_stock <= (reorder_level * 1.5) THEN 'MODERATE'
        ELSE 'GOOD'
      END AS status
    FROM items
    ORDER BY status ASC, item_name ASC`,
    [],
    (err, rows) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Unable to generate stock levels report.' });
      }

      const lowStock = rows.filter(r => r.status === 'LOW').length;
      const moderateStock = rows.filter(r => r.status === 'MODERATE').length;
      const goodStock = rows.filter(r => r.status === 'GOOD').length;

      return res.json({
        message: 'Stock levels report generated successfully',
        data: {
          summary: {
            low_stock: lowStock,
            moderate_stock: moderateStock,
            good_stock: goodStock,
            total_items: rows.length
          },
          items: rows || []
        }
      });
    }
  );
};

module.exports = { getDailyReport, getWeeklyReport, getMonthlyReport, getStockLevelsReport };
