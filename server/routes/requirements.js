/**
 * Requirements API Routes
 */

const express = require('express');
const router = express.Router();
const pool = require('../db/pool');

// GET all requirements for a project
router.get('/project/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const result = await pool.query(
      'SELECT * FROM requirements WHERE project_id = $1 ORDER BY created_at DESC',
      [projectId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching requirements:', error);
    res.status(500).json({ error: 'Failed to fetch requirements' });
  }
});

// GET single requirement
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM requirements WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Requirement not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching requirement:', error);
    res.status(500).json({ error: 'Failed to fetch requirement' });
  }
});

// POST create requirement
router.post('/', async (req, res) => {
  try {
    const {
      id,
      project_id,
      title,
      description,
      category,
      sub_category,
      priority,
      status,
      notes
    } = req.body;

    if (!id || !project_id || !title) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await pool.query(
      `INSERT INTO requirements
       (id, project_id, title, description, category, sub_category, priority, status, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [id, project_id, title, description, category, sub_category, priority, status, notes]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating requirement:', error);
    res.status(500).json({ error: 'Failed to create requirement' });
  }
});

// PUT update requirement
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      category,
      sub_category,
      priority,
      status,
      notes
    } = req.body;

    const result = await pool.query(
      `UPDATE requirements
       SET title = $1, description = $2, category = $3, sub_category = $4,
           priority = $5, status = $6, notes = $7
       WHERE id = $8
       RETURNING *`,
      [title, description, category, sub_category, priority, status, notes, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Requirement not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating requirement:', error);
    res.status(500).json({ error: 'Failed to update requirement' });
  }
});

// DELETE requirement
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM requirements WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Requirement not found' });
    }

    res.json({ message: 'Requirement deleted successfully' });
  } catch (error) {
    console.error('Error deleting requirement:', error);
    res.status(500).json({ error: 'Failed to delete requirement' });
  }
});

module.exports = router;
