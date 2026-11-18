const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const auth = require('../middleware/auth');

// User Registration - Protected endpoint
// Allows public registration ONLY if no users exist in the database (initial system bootstrap).
// Once an administrator exists, only an authenticated administrator can register new users.
router.post('/register', async (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !username.trim() || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  const cleanUsername = username.trim();
  if (cleanUsername.length < 3) {
    return res.status(400).json({ error: 'Username must be at least 3 characters long' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long' });
  }

  try {
    // Check existing users count
    const [userRows] = await db.query('SELECT COUNT(*) AS count FROM users');
    const existingCount = userRows[0].count;

    if (existingCount > 0) {
      // System is already initialized; require authentication
      const authHeader = req.headers['authorization'];
      if (!authHeader) {
        return res.status(401).json({ error: 'Unauthorized: Registration is restricted to authenticated administrators' });
      }

      const token = authHeader.split(' ')[1];
      if (!token) {
        return res.status(401).json({ error: 'Unauthorized: Missing authentication token' });
      }

      try {
        jwt.verify(token, process.env.JWT_SECRET);
      } catch (tokenErr) {
        return res.status(403).json({ error: 'Forbidden: Invalid or expired administrator session' });
      }
    }

    // Check if username already exists
    const [existingUser] = await db.query('SELECT id FROM users WHERE username = ?', [cleanUsername]);
    if (existingUser.length > 0) {
      return res.status(409).json({ error: 'Username already exists' });
    }

    const hash = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      'INSERT INTO users (username, password) VALUES (?, ?)',
      [cleanUsername, hash]
    );

    res.status(201).json({
      message: 'User created successfully',
      userId: result.insertId,
      username: cleanUsername
    });
  } catch (err) {
    next(err);
  }
});

// User Login
router.post('/login', async (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username.trim()]);
    if (!rows.length) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const user = rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username
      }
    });
  } catch (err) {
    next(err);
  }
});

// Get Current User Profile (Token Verification)
router.get('/me', auth, async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT id, username, created_at FROM users WHERE id = ?', [req.user.id]);
    if (!rows.length) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
