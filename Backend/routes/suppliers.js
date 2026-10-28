const router = require('express').Router();
const db = require('../db');
const auth = require('../middleware/auth');

// GET all suppliers with count of products supplied
router.get('/', auth, async (req, res, next) => {
  try {
    const [rows] = await db.query(`
      SELECT s.*, COUNT(p.id) AS product_count
      FROM suppliers s
      LEFT JOIN products p ON s.id = p.supplier_id
      GROUP BY s.id
      ORDER BY s.name ASC
    `);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// GET single supplier
router.get('/:id', auth, async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT * FROM suppliers WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Supplier not found' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// POST create supplier
router.post('/', auth, async (req, res, next) => {
  const { name, phone, email, address } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Supplier name is required' });
  }

  try {
    const [result] = await db.query(
      'INSERT INTO suppliers (name, phone, email, address) VALUES (?, ?, ?, ?)',
      [name.trim(), phone || null, email || null, address || null]
    );
    res.status(201).json({ id: result.insertId, message: 'Supplier created successfully' });
  } catch (err) {
    next(err);
  }
});

// PUT update supplier
router.put('/:id', auth, async (req, res, next) => {
  const { name, phone, email, address } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Supplier name is required' });
  }

  try {
    const [result] = await db.query(
      'UPDATE suppliers SET name = ?, phone = ?, email = ?, address = ? WHERE id = ?',
      [name.trim(), phone || null, email || null, address || null, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Supplier not found' });
    }
    res.json({ message: 'Supplier updated successfully' });
  } catch (err) {
    next(err);
  }
});

// DELETE supplier
router.delete('/:id', auth, async (req, res, next) => {
  try {
    const [result] = await db.query('DELETE FROM suppliers WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Supplier not found' });
    }
    res.json({ message: 'Supplier deleted successfully' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
