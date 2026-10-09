const { getDb } = require('../config/db');

const getDailyReport = (req, res) => {
  const db = getDb();

  const query = `
    SELECT
      DATE(date_out) AS report_date,
      SUM(quantity_out) AS total_quantity_out,
      SUM(sale_price) AS total_sales
    FROM stock_out
    WHERE DATE(date_out) = DATE('now')
    GROUP BY DATE(date_out)
  `;

  db.get(query, [], (err, row) => {
    if (err) {
      return res.status(500).json({ message: 'Unable to generate report.' });
    }

    return res.json({
      report_date: row ? row.report_date : new Date().toISOString().split('T')[0],
      total_quantity_out: row ? row.total_quantity_out : 0,
      total_sales: row ? row.total_sales : 0
    });
  });
};

module.exports = { getDailyReport };
