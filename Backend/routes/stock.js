const router = require('express').Router();
const db = require('../db');
const auth = require('../middleware/auth');

// POST Stock In/Out Transaction
router.post('/', auth, async (req, res, next) => {
  const { product_id, type, quantity, note } = req.body;

  if (!product_id || !type || !quantity) {
    return res.status(400).json({ error: 'Product ID, movement type (IN/OUT), and quantity are required.' });
  }

  const parsedQty = parseInt(quantity, 10);
  if (isNaN(parsedQty) || parsedQty <= 0) {
    return res.status(400).json({ error: 'Quantity must be a positive whole number.' });
  }

  if (!['IN', 'OUT'].includes(type)) {
    return res.status(400).json({ error: 'Movement type must be IN or OUT.' });
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // Lock the specific product row for update to prevent concurrency race conditions
    const [rows] = await conn.query('SELECT quantity, name FROM products WHERE id = ? FOR UPDATE', [product_id]);
    if (!rows.length) {
      throw new Error('Product not found.');
    }

    const currentQty = rows[0].quantity;
    const productName = rows[0].name;

    if (type === 'OUT' && currentQty < parsedQty) {
      const err = new Error(`Insufficient stock for "${productName}". Available: ${currentQty}, Requested: ${parsedQty}.`);
      err.statusCode = 400;
      throw err;
    }

    const newQty = type === 'IN' ? currentQty + parsedQty : currentQty - parsedQty;

    // Update product quantity
    await conn.query('UPDATE products SET quantity = ? WHERE id = ?', [newQty, product_id]);

    // Insert audit movement log
    const [movResult] = await conn.query(
      'INSERT INTO stock_movements (product_id, type, quantity, note, date) VALUES (?, ?, ?, ?, NOW())',
      [product_id, type, parsedQty, note ? note.trim() : null]
    );

    await conn.commit();

    res.json({
      message: `Stock ${type === 'IN' ? 'added' : 'issued'} successfully.`,
      movementId: movResult.insertId,
      productId: product_id,
      productName,
      previousQty: currentQty,
      newQty
    });
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
});

// GET movement history with filters
router.get('/', auth, async (req, res, next) => {
  try {
    const { product_id, type, date_from, date_to } = req.query;

    let query = `
      SELECT m.*, p.name AS product_name, c.name AS category, p.price
      FROM stock_movements m
      JOIN products p ON m.product_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (product_id) {
      query += ' AND m.product_id = ?';
      params.push(product_id);
    }

    if (type && ['IN', 'OUT'].includes(type)) {
      query += ' AND m.type = ?';
      params.push(type);
    }

    if (date_from) {
      query += ' AND DATE(m.date) >= ?';
      params.push(date_from);
    }

    if (date_to) {
      query += ' AND DATE(m.date) <= ?';
      params.push(date_to);
    }

    query += ' ORDER BY m.date DESC LIMIT 500';

    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

module.exports = router;