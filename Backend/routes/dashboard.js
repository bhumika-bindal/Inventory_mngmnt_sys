const router = require('express').Router();
const db = require('../db');
const auth = require('../middleware/auth');

// GET dashboard KPI summary
router.get('/summary', auth, async (req, res, next) => {
  try {
    const [prodRows] = await db.query(`
      SELECT 
        COUNT(*) AS total_products,
        COALESCE(SUM(quantity), 0) AS total_stock_units,
        COALESCE(SUM(price * quantity), 0) AS total_valuation,
        SUM(CASE WHEN quantity <= low_stock_limit THEN 1 ELSE 0 END) AS low_stock_count
      FROM products
    `);

    const [supRows] = await db.query('SELECT COUNT(*) AS total_suppliers FROM suppliers');
    const [catRows] = await db.query('SELECT COUNT(*) AS total_categories FROM categories');
    const [movRows] = await db.query('SELECT COUNT(*) AS total_movements FROM stock_movements');

    res.json({
      totalProducts: Number(prodRows[0].total_products || 0),
      totalStockUnits: Number(prodRows[0].total_stock_units || 0),
      totalValuation: Number(prodRows[0].total_valuation || 0).toFixed(2),
      lowStockCount: Number(prodRows[0].low_stock_count || 0),
      totalSuppliers: Number(supRows[0].total_suppliers || 0),
      totalCategories: Number(catRows[0].total_categories || 0),
      totalMovements: Number(movRows[0].total_movements || 0)
    });
  } catch (err) {
    next(err);
  }
});

// GET dashboard charts data
router.get('/charts', auth, async (req, res, next) => {
  try {
    // 1. Category distribution
    const [catDist] = await db.query(`
      SELECT 
        c.name AS category_name,
        COUNT(p.id) AS product_count,
        COALESCE(SUM(p.quantity), 0) AS total_quantity
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id
      GROUP BY c.id
      HAVING product_count > 0
      ORDER BY product_count DESC
    `);

    // 2. Recent 7 days or last 10 movements aggregate by type
    const [movements] = await db.query(`
      SELECT 
        DATE(date) AS move_date,
        type,
        SUM(quantity) AS total_qty
      FROM stock_movements
      GROUP BY DATE(date), type
      ORDER BY move_date ASC
      LIMIT 14
    `);

    // 3. Low stock alert items with category & supplier
    const [lowStockItems] = await db.query(`
      SELECT 
        p.id, p.name, p.price, p.quantity, p.low_stock_limit,
        c.name AS category, s.name AS supplier
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN suppliers s ON p.supplier_id = s.id
      WHERE p.quantity <= p.low_stock_limit
      ORDER BY p.quantity ASC
      LIMIT 10
    `);

    res.json({
      categoryDistribution: catDist,
      movementTrends: movements,
      lowStockItems
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
