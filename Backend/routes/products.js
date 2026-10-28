const router = require('express').Router();
const db = require('../db');
const auth = require('../middleware/auth');

// GET all products with filtering & search
router.get('/', auth, async (req, res, next) => {
  try {
    const { search, category_id, supplier_id, status } = req.query;

    let query = `
      SELECT p.*, c.name AS category, s.name AS supplier
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN suppliers s ON p.supplier_id = s.id
      WHERE 1=1
    `;
    const params = [];

    if (search && search.trim()) {
      query += ' AND (p.name LIKE ? OR c.name LIKE ? OR s.name LIKE ?)';
      const term = `%${search.trim()}%`;
      params.push(term, term, term);
    }

    if (category_id) {
      query += ' AND p.category_id = ?';
      params.push(category_id);
    }

    if (supplier_id) {
      query += ' AND p.supplier_id = ?';
      params.push(supplier_id);
    }

    if (status === 'low_stock') {
      query += ' AND p.quantity <= p.low_stock_limit AND p.quantity > 0';
    } else if (status === 'out_of_stock') {
      query += ' AND p.quantity = 0';
    } else if (status === 'in_stock') {
      query += ' AND p.quantity > p.low_stock_limit';
    }

    query += ' ORDER BY p.id DESC';

    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// GET single product
router.get('/:id', auth, async (req, res, next) => {
  try {
    const [rows] = await db.query(`
      SELECT p.*, c.name AS category, s.name AS supplier
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN suppliers s ON p.supplier_id = s.id
      WHERE p.id = ?
    `, [req.params.id]);

    if (!rows.length) return res.status(404).json({ error: 'Product not found' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// POST create product
router.post('/', auth, async (req, res, next) => {
  const { name, category_id, supplier_id, price, quantity, low_stock_limit } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Product name is required' });
  }
  if (price === undefined || isNaN(price) || Number(price) < 0) {
    return res.status(400).json({ error: 'Valid positive price is required' });
  }

  const parsedQty = parseInt(quantity, 10);
  const parsedLimit = parseInt(low_stock_limit, 10);

  try {
    const [result] = await db.query(
      `INSERT INTO products (name, category_id, supplier_id, price, quantity, low_stock_limit)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        name.trim(),
        category_id ? parseInt(category_id, 10) : null,
        supplier_id ? parseInt(supplier_id, 10) : null,
        parseFloat(price),
        !isNaN(parsedQty) && parsedQty >= 0 ? parsedQty : 0,
        !isNaN(parsedLimit) && parsedLimit >= 0 ? parsedLimit : 5
      ]
    );

    res.status(201).json({ id: result.insertId, message: 'Product created successfully' });
  } catch (err) {
    next(err);
  }
});

// PUT update product
router.put('/:id', auth, async (req, res, next) => {
  const { name, category_id, supplier_id, price, quantity, low_stock_limit } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Product name is required' });
  }
  if (price === undefined || isNaN(price) || Number(price) < 0) {
    return res.status(400).json({ error: 'Valid positive price is required' });
  }

  try {
    const [result] = await db.query(
      `UPDATE products 
       SET name = ?, category_id = ?, supplier_id = ?, price = ?, quantity = ?, low_stock_limit = ?
       WHERE id = ?`,
      [
        name.trim(),
        category_id ? parseInt(category_id, 10) : null,
        supplier_id ? parseInt(supplier_id, 10) : null,
        parseFloat(price),
        parseInt(quantity, 10) || 0,
        parseInt(low_stock_limit, 10) || 5,
        req.params.id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ message: 'Product updated successfully' });
  } catch (err) {
    next(err);
  }
});

// DELETE product
router.delete('/:id', auth, async (req, res, next) => {
  try {
    const [result] = await db.query('DELETE FROM products WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    next(err);
  }
});

// GET low stock alerts
router.get('/alerts/low', auth, async (req, res, next) => {
  try {
    const [rows] = await db.query(`
      SELECT p.*, c.name AS category, s.name AS supplier
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN suppliers s ON p.supplier_id = s.id
      WHERE p.quantity <= p.low_stock_limit
      ORDER BY p.quantity ASC
    `);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

module.exports = router;