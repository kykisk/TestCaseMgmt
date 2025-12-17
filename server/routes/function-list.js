/**
 * Function List API Routes
 */

const express = require('express');
const router = express.Router();
const pool = require('../db/pool');

// GET all functions for a project
router.get('/project/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;

    const result = await pool.query(
      `SELECT f.*, r.title as requirement_title, r.category as requirement_category
       FROM function_list f
       LEFT JOIN requirements r ON f.requirement_id = r.id
       WHERE f.project_id = $1
       ORDER BY f.requirement_id, f.created_at`,
      [projectId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching functions:', error);
    res.status(500).json({ error: 'Failed to fetch functions' });
  }
});

// GET functions for a requirement
router.get('/requirement/:requirementId', async (req, res) => {
  try {
    const { requirementId } = req.params;

    const result = await pool.query(
      'SELECT * FROM function_list WHERE requirement_id = $1 ORDER BY created_at',
      [requirementId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching functions:', error);
    res.status(500).json({ error: 'Failed to fetch functions' });
  }
});

// GET single function
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT * FROM function_list WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Function not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching function:', error);
    res.status(500).json({ error: 'Failed to fetch function' });
  }
});

// POST create function
router.post('/', async (req, res) => {
  try {
    const {
      requirement_id,
      project_id,
      function_name,
      description,
      parameters,
      return_type,
      return_description,
      exceptions,
      example_usage,
      notes,
    } = req.body;

    if (!requirement_id || !project_id || !function_name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await pool.query(
      `INSERT INTO function_list
       (requirement_id, project_id, function_name, description, parameters, return_type,
        return_description, exceptions, example_usage, notes)
       VALUES ($1, $2, $3, $4, $5::jsonb, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        requirement_id,
        project_id,
        function_name,
        description,
        JSON.stringify(parameters || []),
        return_type,
        return_description,
        exceptions || [],
        example_usage,
        notes,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating function:', error);
    res.status(500).json({ error: 'Failed to create function', details: error.message });
  }
});

// PUT update function
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      function_name,
      description,
      parameters,
      return_type,
      return_description,
      exceptions,
      example_usage,
      notes,
    } = req.body;

    const result = await pool.query(
      `UPDATE function_list
       SET function_name = $1, description = $2, parameters = $3::jsonb,
           return_type = $4, return_description = $5, exceptions = $6,
           example_usage = $7, notes = $8
       WHERE id = $9
       RETURNING *`,
      [
        function_name,
        description,
        JSON.stringify(parameters || []),
        return_type,
        return_description,
        exceptions || [],
        example_usage,
        notes,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Function not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating function:', error);
    res.status(500).json({ error: 'Failed to update function', details: error.message });
  }
});

// DELETE function
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM function_list WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Function not found' });
    }

    res.json({ message: 'Function deleted successfully' });
  } catch (error) {
    console.error('Error deleting function:', error);
    res.status(500).json({ error: 'Failed to delete function' });
  }
});

module.exports = router;
