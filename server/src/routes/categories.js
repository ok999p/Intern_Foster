import { Router } from 'express';
import { query } from '../db.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { rows } = await query('SELECT id, name FROM category ORDER BY id');
    res.json(rows);
  } catch (err) {
    console.error('GET /api/categories failed:', err.message);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

export default router;
