/**
 * Test Execution Items API Routes
 * 테스트 수행 항목 관리
 */

const express = require('express');
const router = express.Router();
const pool = require('../db/pool');

// GET items for a suite
router.get('/suite/:suiteId', async (req, res) => {
  try {
    const { suiteId } = req.params;

    const result = await pool.query(
      `SELECT i.*,
        COUNT(DISTINCT r.id) as run_count
       FROM test_execution_items i
       LEFT JOIN test_execution_runs r ON i.id = r.item_id
       WHERE i.suite_id = $1
       GROUP BY i.id
       ORDER BY i.created_at`,
      [suiteId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

// GET single item with runs and results
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Get item
    const itemResult = await pool.query(
      'SELECT * FROM test_execution_items WHERE id = $1',
      [id]
    );

    if (itemResult.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const item = itemResult.rows[0];

    // Get all runs for this item
    const runsResult = await pool.query(
      `SELECT * FROM test_execution_runs
       WHERE item_id = $1
       ORDER BY run_number`,
      [id]
    );

    // Get results for each run
    const runs = await Promise.all(
      runsResult.rows.map(async (run) => {
        const resultsResult = await pool.query(
          `SELECT * FROM test_case_results
           WHERE run_id = $1
           ORDER BY executed_at`,
          [run.id]
        );

        return {
          ...run,
          results: resultsResult.rows,
        };
      })
    );

    res.json({
      ...item,
      runs: runs,
    });
  } catch (error) {
    console.error('Error fetching item:', error);
    res.status(500).json({ error: 'Failed to fetch item' });
  }
});

// POST create item
router.post('/', async (req, res) => {
  try {
    const { suite_id, name, requirement_ids } = req.body;

    if (!suite_id || !name || !requirement_ids) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await pool.query(
      `INSERT INTO test_execution_items (suite_id, name, requirement_ids)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [suite_id, name, requirement_ids]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating item:', error);
    res.status(500).json({ error: 'Failed to create item' });
  }
});

// PUT update item
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, requirement_ids, status } = req.body;

    const result = await pool.query(
      `UPDATE test_execution_items
       SET name = $1, requirement_ids = $2, status = $3
       WHERE id = $4
       RETURNING *`,
      [name, requirement_ids, status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating item:', error);
    res.status(500).json({ error: 'Failed to update item' });
  }
});

// DELETE item
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM test_execution_items WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

module.exports = router;
