const router = require('express').Router();
const db = require('../db');
const auth = require('../middleware/auth');

// GET all categories with product counts
router.get('/', auth, async (req, res, next) => {
  try {
    const [rows] = await db.query(`
      SELECT c.*, COUNT(p.id) AS product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id
      GROUP BY c.id
      ORDER BY c.name ASC
    `);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// GET single category
router.get('/:id', auth, async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT * FROM categories WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Category not found' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// POST create category
router.post('/', auth, async (req, res, next) => {
  const { name } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Category name is required' });
  }

  try {
    const [result] = await db.query('INSERT INTO categories (name) VALUES (?)', [name.trim()]);
    res.status(201).json({ id: result.insertId, name: name.trim(), message: 'Category created' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Category name already exists' });
    }
    next(err);
  }
});

// PUT update category
router.put('/:id', auth, async (req, res, next) => {
  const { name } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Category name is required' });
  }

  try {
    const [result] = await db.query('UPDATE categories SET name = ? WHERE id = ?', [name.trim(), req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json({ message: 'Category updated successfully' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Category name already exists' });
    }
    next(err);
  }
});

// DELETE category
router.delete('/:id', auth, async (req, res, next) => {
  try {
    const [result] = await db.query('DELETE FROM categories WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json({ message: 'Category deleted successfully' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
