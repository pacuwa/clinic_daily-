const { getDb } = require('../config/db');

const getDailyReport = async (req, res) => {
  try {
    const db = getDb();
    const today = new Date().toISOString().split('T')[0];

    const dailySalesRow = await db.oneOrNone(
      `SELECT
        DATE(date_out) AS report_date,
        COUNT(*) AS total_transactions,
        SUM(quantity_out) AS total_quantity_out,
        SUM(sale_price * quantity_out) AS total_sales
      FROM stock_out
      WHERE DATE(date_out) = $1
      GROUP BY DATE(date_out)`,
      [today]
    );

    const dailyStockInRow = await db.oneOrNone(
      `SELECT
        COUNT(*) AS total_transactions,
        SUM(quantity_in) AS total_quantity_in
      FROM stock_in
      WHERE DATE(date_in) = $1`,
      [today]
    );

    return res.json({
      message: 'Daily report generated successfully',
      data: {
        report_date: today,
        stock_in: {
          total_transactions: Number(dailyStockInRow?.total_transactions) || 0,
          total_quantity: Number(dailyStockInRow?.total_quantity_in) || 0
        },
        stock_out: {
          total_transactions: Number(dailySalesRow?.total_transactions) || 0,
          total_quantity: Number(dailySalesRow?.total_quantity_out) || 0,
          total_sales: Number(dailySalesRow?.total_sales) || 0
        }
      }
    });
  } catch (error) {
    console.error('Database error in getDailyReport:', error);
    return res.status(500).json({ message: 'Unable to generate daily report.' });
  }
};

const getWeeklyReport = async (req, res) => {
  try {
    const db = getDb();

    const rows = await db.any(
      `SELECT
        DATE(date_out) AS report_date,
        SUM(quantity_out) AS total_quantity_out,
        SUM(sale_price * quantity_out) AS total_sales
      FROM stock_out
      WHERE date_out >= NOW() - INTERVAL '7 days'
      GROUP BY DATE(date_out)
      ORDER BY report_date DESC`,
      []
    );

    const formattedRows = rows.map(row => ({
      ...row,
      total_quantity_out: Number(row.total_quantity_out) || 0,
      total_sales: Number(row.total_sales) || 0
    }));

    const totalQuantity = formattedRows.reduce((sum, row) => sum + row.total_quantity_out, 0);
    const totalSales = formattedRows.reduce((sum, row) => sum + row.total_sales, 0);

    return res.json({
      message: 'Weekly report generated successfully',
      data: {
        period: 'Last 7 days',
        daily_breakdown: formattedRows,
        summary: {
          total_quantity: totalQuantity,
          total_sales: totalSales
        }
      }
    });
  } catch (error) {
    console.error('Database error in getWeeklyReport:', error);
    return res.status(500).json({ message: 'Unable to generate weekly report.' });
  }
};

const getMonthlyReport = async (req, res) => {
  try {
    const db = getDb();

    const rows = await db.any(
      `SELECT
        DATE(date_out) AS report_date,
        SUM(quantity_out) AS total_quantity_out,
        SUM(sale_price * quantity_out) AS total_sales
      FROM stock_out
      WHERE date_out >= NOW() - INTERVAL '30 days'
      GROUP BY DATE(date_out)
      ORDER BY report_date DESC`,
      []
    );

    const formattedRows = rows.map(row => ({
      ...row,
      total_quantity_out: Number(row.total_quantity_out) || 0,
      total_sales: Number(row.total_sales) || 0
    }));

    const totalQuantity = formattedRows.reduce((sum, row) => sum + row.total_quantity_out, 0);
    const totalSales = formattedRows.reduce((sum, row) => sum + row.total_sales, 0);

    return res.json({
      message: 'Monthly report generated successfully',
      data: {
        period: 'Last 30 days',
        daily_breakdown: formattedRows,
        summary: {
          total_quantity: totalQuantity,
          total_sales: totalSales
        }
      }
    });
  } catch (error) {
    console.error('Database error in getMonthlyReport:', error);
    return res.status(500).json({ message: 'Unable to generate monthly report.' });
  }
};

const getStockLevelsReport = async (req, res) => {
  try {
    const db = getDb();

    const rows = await db.any(
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
      []
    );

    const formattedRows = rows.map(row => ({
      ...row,
      current_stock: Number(row.current_stock) || 0,
      reorder_level: Number(row.reorder_level) || 0,
      unit_cost: Number(row.unit_cost) || 0
    }));

    const lowStock = formattedRows.filter(r => r.status === 'LOW').length;
    const moderateStock = formattedRows.filter(r => r.status === 'MODERATE').length;
    const goodStock = formattedRows.filter(r => r.status === 'GOOD').length;

    return res.json({
      message: 'Stock levels report generated successfully',
      data: {
        summary: {
          low_stock: lowStock,
          moderate_stock: moderateStock,
          good_stock: goodStock,
          total_items: formattedRows.length
        },
        items: formattedRows
      }
    });
  } catch (error) {
    console.error('Database error in getStockLevelsReport:', error);
    return res.status(500).json({ message: 'Unable to generate stock levels report.' });
  }
};

const getCategoryReport = async (req, res) => {
  try {
    const db = getDb();
    const today = new Date().toISOString().split('T')[0];

    const rows = await db.any(
      `SELECT
        i.category,
        COUNT(DISTINCT so.id) AS total_transactions,
        SUM(so.quantity_out) AS total_quantity,
        SUM(so.sale_price * so.quantity_out) AS total_sales
      FROM stock_out so
      JOIN items i ON so.item_id = i.id
      WHERE DATE(so.date_out) = $1
      GROUP BY i.category
      ORDER BY total_sales DESC`,
      [today]
    );

    const formattedRows = rows.map(row => ({
      ...row,
      total_transactions: Number(row.total_transactions) || 0,
      total_quantity: Number(row.total_quantity) || 0,
      total_sales: Number(row.total_sales) || 0
    }));

    const totalSales = formattedRows.reduce((sum, row) => sum + row.total_sales, 0);
    const totalQuantity = formattedRows.reduce((sum, row) => sum + row.total_quantity, 0);

    return res.json({
      message: 'Category report generated successfully',
      data: {
        report_date: today,
        categories: formattedRows,
        summary: {
          total_quantity: totalQuantity,
          total_sales: totalSales,
          total_categories: formattedRows.length
        }
      }
    });
  } catch (error) {
    console.error('Database error in getCategoryReport:', error);
    return res.status(500).json({ message: 'Unable to generate category report.' });
  }
};

const getItemReport = async (req, res) => {
  try {
    const db = getDb();
    const today = new Date().toISOString().split('T')[0];

    const rows = await db.any(
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
      WHERE DATE(so.date_out) = $1
      GROUP BY i.id, i.item_name, i.category, i.unit_cost
      ORDER BY total_sales DESC`,
      [today]
    );

    const formattedRows = rows.map(row => ({
      ...row,
      total_transactions: Number(row.total_transactions) || 0,
      total_quantity: Number(row.total_quantity) || 0,
      unit_cost: Number(row.unit_cost) || 0,
      total_sale_price: Number(row.total_sale_price) || 0,
      total_sales: Number(row.total_sales) || 0
    }));

    const totalSales = formattedRows.reduce((sum, row) => sum + row.total_sales, 0);
    const totalQuantity = formattedRows.reduce((sum, row) => sum + row.total_quantity, 0);
    const totalProfit = formattedRows.reduce((sum, row) => {
      const cost = row.unit_cost * row.total_quantity;
      return sum + (row.total_sales - cost);
    }, 0);

    return res.json({
      message: 'Item report generated successfully',
      data: {
        report_date: today,
        items: formattedRows,
        summary: {
          total_quantity: totalQuantity,
          total_sales: totalSales,
          total_profit: totalProfit,
          total_items_sold: formattedRows.length
        }
      }
    });
  } catch (error) {
    console.error('Database error in getItemReport:', error);
    return res.status(500).json({ message: 'Unable to generate item report.' });
  }
};

const getWeeklyDetailedReport = async (req, res) => {
  try {
    const db = getDb();

    const rows = await db.any(
      `SELECT
        DATE(date_out) AS report_date,
        i.category,
        SUM(so.quantity_out) AS total_quantity,
        SUM(so.sale_price * so.quantity_out) AS total_sales
      FROM stock_out so
      JOIN items i ON so.item_id = i.id
      WHERE date_out >= NOW() - INTERVAL '7 days'
      GROUP BY DATE(date_out), i.category
      ORDER BY report_date DESC, total_sales DESC`,
      []
    );

    const formattedRows = rows.map(row => ({
      ...row,
      total_quantity: Number(row.total_quantity) || 0,
      total_sales: Number(row.total_sales) || 0
    }));

    const totalSales = formattedRows.reduce((sum, row) => sum + row.total_sales, 0);
    const totalQuantity = formattedRows.reduce((sum, row) => sum + row.total_quantity, 0);

    return res.json({
      message: 'Weekly detailed report generated successfully',
      data: {
        period: 'Last 7 days',
        breakdown: formattedRows,
        summary: {
          total_quantity: totalQuantity,
          total_sales: totalSales
        }
      }
    });
  } catch (error) {
    console.error('Database error in getWeeklyDetailedReport:', error);
    return res.status(500).json({ message: 'Unable to generate weekly detailed report.' });
  }
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
