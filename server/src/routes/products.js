import { Router } from 'express';
import { query } from '../db.js';

const router = Router();

async function generateProductId() {
  const { rows } = await query(
    "SELECT id FROM product WHERE id LIKE 'P%' ORDER BY id DESC LIMIT 1"
  );
  if (rows.length === 0) return 'P00001';
  const lastNumber = parseInt(rows[0].id.slice(1), 10);
  return 'P' + String(lastNumber + 1).padStart(5, '0');
}

function validateProduct({ name, price, category_id }) {
  const errors = [];

  if (!name || String(name).trim() === '') {
    errors.push('name is required');
  }
  if (price === undefined || price === null || price === '' || isNaN(Number(price))) {
    errors.push('price must be a number');
  } else if (Number(price) < 0) {
    errors.push('price must be >= 0');
  }
  if (category_id === undefined || category_id === null || category_id === '') {
    errors.push('category_id is required');
  } else if (!Number.isInteger(Number(category_id))) {
    errors.push('category_id must be an integer');
  }
  return errors;
}

router.get('/', async (req, res) => {
  try {
    const { rows } = await query(`
      SELECT p.id, p.name, p.price, p.category_id, c.name AS category_name
      FROM product p
      JOIN category c ON c.id = p.category_id
      ORDER BY p.id
    `);
    res.json(rows);
  } catch (err) {
    console.error('GET /api/products failed:', err.message);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT p.id, p.name, p.price, p.category_id, c.name AS category_name
       FROM product p
       JOIN category c ON c.id = p.category_id
       WHERE p.id = $1`,
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('GET /api/products/:id failed:', err.message);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

router.post('/', async (req, res) => {
  const errors = validateProduct(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ error: errors.join(', ') });
  }

  const { name, price, category_id } = req.body;

  try {
    const id = await generateProductId();
    const { rows } = await query(
      `INSERT INTO product (id, name, price, category_id)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, price, category_id`,
      [id, name.trim(), Number(price), Number(category_id)]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('POST /api/products failed:', err.message);
    if (err.code === '23503') {
      return res.status(400).json({ error: 'category_id does not exist' });
    }
    res.status(500).json({ error: 'Failed to create product' });
  }
});

router.put('/:id', async (req, res) => {
  const errors = validateProduct(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ error: errors.join(', ') });
  }

  const { name, price, category_id } = req.body;

  try {
    const { rows } = await query(
      `UPDATE product
       SET name = $1, price = $2, category_id = $3
       WHERE id = $4
       RETURNING id, name, price, category_id`,
      [name.trim(), Number(price), Number(category_id), req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('PUT /api/products/:id failed:', err.message);
    if (err.code === '23503') {
      return res.status(400).json({ error: 'category_id does not exist' });
    }
    res.status(500).json({ error: 'Failed to update product' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { rows } = await query(
      'DELETE FROM product WHERE id = $1 RETURNING id',
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ message: 'Product deleted', id: rows[0].id });
  } catch (err) {
    console.error('DELETE /api/products/:id failed:', err.message);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

export default router;
