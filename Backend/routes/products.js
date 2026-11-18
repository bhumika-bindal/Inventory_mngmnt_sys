const router = require('express').Router();
const db = require('../db');
const auth = require('../middleware/auth');

// GET all products with filtering & search (excludes soft-deleted products)
router.get('/', auth, async (req, res, next) => {
  try {
    const { search, category_id, supplier_id, status } = req.query;

    let query = `
      SELECT p.*, c.name AS category, s.name AS supplier
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN suppliers s ON p.supplier_id = s.id
      WHERE p.is_deleted = 0
    `;
    const params = [];

    if (search && search.trim()) {
      query += ' AND (p.name LIKE ? OR c.name LIKE ? OR s.name LIKE ?)';
      const term = `%${search.trim()}%`;
      params.push(term, term, term);
    }

    if (category_id) {
      query += ' AND p.category_id = ?';
      params.push(parseInt(category_id, 10));
    }

    if (supplier_id) {
      query += ' AND p.supplier_id = ?';
      params.push(parseInt(supplier_id, 10));
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

// GET single product by ID
router.get('/:id', auth, async (req, res, next) => {
  try {
    const [rows] = await db.query(`
      SELECT p.*, c.name AS category, s.name AS supplier
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN suppliers s ON p.supplier_id = s.id
      WHERE p.id = ? AND p.is_deleted = 0
    `, [req.params.id]);

    if (!rows.length) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// POST create product (synchronizes initial quantity with stock_movements)
router.post('/', auth, async (req, res, next) => {
  const { name, category_id, supplier_id, price, quantity, low_stock_limit } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Product name is required' });
  }

  const cleanName = name.trim();
  const parsedPrice = parseFloat(price);
  if (isNaN(parsedPrice) || parsedPrice < 0) {
    return res.status(400).json({ error: 'Price must be a valid positive number' });
  }

  const parsedQty = parseInt(quantity, 10);
  const initialQty = !isNaN(parsedQty) && parsedQty >= 0 ? parsedQty : 0;

  const parsedLimit = parseInt(low_stock_limit, 10);
  const safetyLimit = !isNaN(parsedLimit) && parsedLimit >= 0 ? parsedLimit : 5;

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [result] = await conn.query(
      `INSERT INTO products (name, category_id, supplier_id, price, quantity, low_stock_limit, is_deleted)
       VALUES (?, ?, ?, ?, ?, ?, 0)`,
      [
        cleanName,
        category_id ? parseInt(category_id, 10) : null,
        supplier_id ? parseInt(supplier_id, 10) : null,
        parsedPrice,
        initialQty,
        safetyLimit
      ]
    );

    const newProductId = result.insertId;

    // Record initial stock transaction if initial quantity > 0
    if (initialQty > 0) {
      await conn.query(
        `INSERT INTO stock_movements (product_id, product_name, type, quantity, note, date)
         VALUES (?, ?, 'IN', ?, 'Initial inventory stock batch', NOW())`,
        [newProductId, cleanName, initialQty]
      );
    }

    await conn.commit();

    res.status(201).json({
      id: newProductId,
      name: cleanName,
      quantity: initialQty,
      message: 'Product created and initial stock logged successfully'
    });
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
});

// PUT update product (synchronizes quantity adjustments with stock_movements)
router.put('/:id', auth, async (req, res, next) => {
  const { name, category_id, supplier_id, price, quantity, low_stock_limit } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Product name is required' });
  }

  const cleanName = name.trim();
  const parsedPrice = parseFloat(price);
  if (isNaN(parsedPrice) || parsedPrice < 0) {
    return res.status(400).json({ error: 'Price must be a valid positive number' });
  }

  const parsedLimit = parseInt(low_stock_limit, 10);
  const safetyLimit = !isNaN(parsedLimit) && parsedLimit >= 0 ? parsedLimit : 5;

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [existing] = await conn.query(
      'SELECT id, name, quantity FROM products WHERE id = ? AND is_deleted = 0 FOR UPDATE',
      [req.params.id]
    );

    if (!existing.length) {
      await conn.rollback();
      return res.status(404).json({ error: 'Product not found' });
    }

    const currentQty = existing[0].quantity;
    let newQty = currentQty;

    // Check if quantity adjustment was submitted
    if (quantity !== undefined && !isNaN(parseInt(quantity, 10))) {
      const targetQty = parseInt(quantity, 10);
      if (targetQty < 0) {
        await conn.rollback();
        return res.status(400).json({ error: 'Quantity cannot be negative' });
      }

      if (targetQty !== currentQty) {
        const diff = targetQty - currentQty;
        const moveType = diff > 0 ? 'IN' : 'OUT';
        const moveQty = Math.abs(diff);

        // Record adjustment movement in audit ledger
        await conn.query(
          `INSERT INTO stock_movements (product_id, product_name, type, quantity, note, date)
           VALUES (?, ?, ?, ?, 'Inventory adjustment during product update', NOW())`,
          [req.params.id, cleanName, moveType, moveQty]
        );

        newQty = targetQty;
      }
    }

    await conn.query(
      `UPDATE products 
       SET name = ?, category_id = ?, supplier_id = ?, price = ?, quantity = ?, low_stock_limit = ?
       WHERE id = ?`,
      [
        cleanName,
        category_id ? parseInt(category_id, 10) : null,
        supplier_id ? parseInt(supplier_id, 10) : null,
        parsedPrice,
        newQty,
        safetyLimit,
        req.params.id
      ]
    );

    await conn.commit();
    res.json({ message: 'Product updated successfully', quantity: newQty });
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
});

// DELETE product (Soft delete: preserves historical stock movements and audit trail)
router.delete('/:id', auth, async (req, res, next) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [existing] = await conn.query(
      'SELECT id, name FROM products WHERE id = ? AND is_deleted = 0',
      [req.params.id]
    );

    if (!existing.length) {
      await conn.rollback();
      return res.status(404).json({ error: 'Product not found' });
    }

    const productName = existing[0].name;

    // Ensure all historical stock_movements retain the product_name
    await conn.query(
      'UPDATE stock_movements SET product_name = ? WHERE product_id = ?',
      [productName, req.params.id]
    );

    // Soft delete product so catalog is cleaned while historical logs remain intact
    await conn.query(
      'UPDATE products SET is_deleted = 1 WHERE id = ?',
      [req.params.id]
    );

    await conn.commit();
    res.json({
      message: `Product "${productName}" decommissioned successfully. Historical audit trail preserved.`
    });
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
});

// GET low stock alerts (excludes soft-deleted products)
router.get('/alerts/low', auth, async (req, res, next) => {
  try {
    const [rows] = await db.query(`
      SELECT p.*, c.name AS category, s.name AS supplier
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN suppliers s ON p.supplier_id = s.id
      WHERE p.is_deleted = 0 AND p.quantity <= p.low_stock_limit
      ORDER BY p.quantity ASC
    `);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
