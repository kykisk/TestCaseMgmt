/**
 * Test Execution Suites API Routes
 * 테스트 수행 "방" 관리
 */

const express = require('express');
const router = express.Router();
const pool = require('../db/pool');

// GET all suites for a project
router.get('/project/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;

    const result = await pool.query(
      `SELECT s.*,
        COUNT(DISTINCT i.id) as item_count,
        COUNT(DISTINCT r.id) as run_count
       FROM test_execution_suites s
       LEFT JOIN test_execution_items i ON s.id = i.suite_id
       LEFT JOIN test_execution_runs r ON i.id = r.item_id
       WHERE s.project_id = $1
       GROUP BY s.id
       ORDER BY s.created_at DESC`,
      [projectId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching suites:', error);
    res.status(500).json({ error: 'Failed to fetch suites' });
  }
});

// GET single suite with items
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Get suite
    const suiteResult = await pool.query(
      'SELECT * FROM test_execution_suites WHERE id = $1',
      [id]
    );

    if (suiteResult.rows.length === 0) {
      return res.status(404).json({ error: 'Suite not found' });
    }

    // Get items with run counts
    const itemsResult = await pool.query(
      `SELECT i.*,
        COUNT(DISTINCT r.id) as run_count,
        (SELECT r2.status FROM test_execution_runs r2
         WHERE r2.item_id = i.id
         ORDER BY r2.run_number DESC LIMIT 1) as latest_run_status
       FROM test_execution_items i
       LEFT JOIN test_execution_runs r ON i.id = r.item_id
       WHERE i.suite_id = $1
       GROUP BY i.id
       ORDER BY i.created_at`,
      [id]
    );

    res.json({
      ...suiteResult.rows[0],
      items: itemsResult.rows,
    });
  } catch (error) {
    console.error('Error fetching suite:', error);
    res.status(500).json({ error: 'Failed to fetch suite' });
  }
});

// POST create suite
router.post('/', async (req, res) => {
  try {
    const { project_id, name, purpose, description } = req.body;

    if (!project_id || !name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await pool.query(
      `INSERT INTO test_execution_suites (project_id, name, purpose, description)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [project_id, name, purpose, description]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating suite:', error);
    res.status(500).json({ error: 'Failed to create suite' });
  }
});

// PUT update suite
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, purpose, description, status } = req.body;

    const result = await pool.query(
      `UPDATE test_execution_suites
       SET name = $1, purpose = $2, description = $3, status = $4
       WHERE id = $5
       RETURNING *`,
      [name, purpose, description, status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Suite not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating suite:', error);
    res.status(500).json({ error: 'Failed to update suite' });
  }
});

// DELETE suite
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM test_execution_suites WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Suite not found' });
    }

    res.json({ message: 'Suite deleted successfully' });
  } catch (error) {
    console.error('Error deleting suite:', error);
    res.status(500).json({ error: 'Failed to delete suite' });
  }
});

module.exports = router;
