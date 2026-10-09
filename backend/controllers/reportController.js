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
      unit_cost,
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

const getCategoryReport = (req, res) => {
  const db = getDb();
  const today = new Date().toISOString().split('T')[0];

  db.all(
    `SELECT
      i.category,
      COUNT(DISTINCT so.id) AS total_transactions,
      SUM(so.quantity_out) AS total_quantity,
      SUM(so.sale_price * so.quantity_out) AS total_sales
    FROM stock_out so
    JOIN items i ON so.item_id = i.id
    WHERE DATE(so.date_out) = ?
    GROUP BY i.category
    ORDER BY total_sales DESC`,
    [today],
    (err, rows) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Unable to generate category report.' });
      }

      const totalSales = rows.reduce((sum, row) => sum + (row.total_sales || 0), 0);
      const totalQuantity = rows.reduce((sum, row) => sum + (row.total_quantity || 0), 0);

      return res.json({
        message: 'Category report generated successfully',
        data: {
          report_date: today,
          categories: rows || [],
          summary: {
            total_quantity: totalQuantity,
            total_sales: totalSales,
            total_categories: rows.length
          }
        }
      });
    }
  );
};

const getItemReport = (req, res) => {
  const db = getDb();
  const today = new Date().toISOString().split('T')[0];

  db.all(
    `SELECT
      i.id,
      i.item_name,
      i.category,
      COUNT(DISTINCT so.id) AS total_transactions,
      SUM(so.quantity_out) AS total_quantity,
      i.unit_cost,
      SUM(so.sale_price) AS total_sale_price,
      SUM(so.sale_price * so.quantity_out) AS total_sales
    FROM stock_out so
    JOIN items i ON so.item_id = i.id
    WHERE DATE(so.date_out) = ?
    GROUP BY i.id, i.item_name, i.category, i.unit_cost
    ORDER BY total_sales DESC`,
    [today],
    (err, rows) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Unable to generate item report.' });
      }

      const totalSales = rows.reduce((sum, row) => sum + (row.total_sales || 0), 0);
      const totalQuantity = rows.reduce((sum, row) => sum + (row.total_quantity || 0), 0);
      const totalProfit = rows.reduce((sum, row) => {
        const cost = (row.unit_cost || 0) * (row.total_quantity || 0);
        const sales = row.total_sales || 0;
        return sum + (sales - cost);
      }, 0);

      return res.json({
        message: 'Item report generated successfully',
        data: {
          report_date: today,
          items: rows || [],
          summary: {
            total_quantity: totalQuantity,
            total_sales: totalSales,
            total_profit: totalProfit,
            total_items_sold: rows.length
          }
        }
      });
    }
  );
};

const getWeeklyDetailedReport = (req, res) => {
  const db = getDb();

  db.all(
    `SELECT
      DATE(date_out) AS report_date,
      i.category,
      SUM(so.quantity_out) AS total_quantity,
      SUM(so.sale_price * so.quantity_out) AS total_sales
    FROM stock_out so
    JOIN items i ON so.item_id = i.id
    WHERE date_out >= datetime('now', '-7 days')
    GROUP BY DATE(date_out), i.category
    ORDER BY report_date DESC, total_sales DESC`,
    [],
    (err, rows) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Unable to generate weekly detailed report.' });
      }

      const totalSales = rows.reduce((sum, row) => sum + (row.total_sales || 0), 0);
      const totalQuantity = rows.reduce((sum, row) => sum + (row.total_quantity || 0), 0);

      return res.json({
        message: 'Weekly detailed report generated successfully',
        data: {
          period: 'Last 7 days',
          breakdown: rows || [],
          summary: {
            total_quantity: totalQuantity,
            total_sales: totalSales
          }
        }
      });
    }
  );
};

module.exports = {
  getDailyReport,
  getWeeklyReport,
  getMonthlyReport,
  getStockLevelsReport,
  getCategoryReport,
  getItemReport,
  getWeeklyDetailedReport
};
