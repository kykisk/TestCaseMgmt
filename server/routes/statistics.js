/**
 * Statistics API Routes
 */

const express = require('express');
const router = express.Router();
const pool = require('../db/pool');

// GET statistics for a project
router.get('/project/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;

    // Get project info
    const projectResult = await pool.query(
      'SELECT * FROM projects WHERE id = $1',
      [projectId]
    );

    if (projectResult.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Count requirements
    const reqCount = await pool.query(
      'SELECT COUNT(*) as total FROM requirements WHERE project_id = $1',
      [projectId]
    );

    // Count testcases
    const tcCount = await pool.query(
      'SELECT COUNT(*) as total FROM testcases WHERE project_id = $1',
      [projectId]
    );

    // Testcase status breakdown
    const statusBreakdown = await pool.query(
      `SELECT status, COUNT(*) as count
       FROM testcases
       WHERE project_id = $1
       GROUP BY status`,
      [projectId]
    );

    // Requirement coverage
    const coverage = await pool.query(
      `SELECT
         COUNT(DISTINCT r.id) as total_requirements,
         COUNT(DISTINCT tr.requirement_id) as covered_requirements
       FROM requirements r
       LEFT JOIN testcase_requirements tr ON r.id = tr.requirement_id
       WHERE r.project_id = $1`,
      [projectId]
    );

    const coveragePercent =
      coverage.rows[0].total_requirements > 0
        ? (
            (coverage.rows[0].covered_requirements /
              coverage.rows[0].total_requirements) *
            100
          ).toFixed(2)
        : 0;

    res.json({
      project: projectResult.rows[0],
      requirements_count: parseInt(reqCount.rows[0].total),
      testcases_count: parseInt(tcCount.rows[0].total),
      status_breakdown: statusBreakdown.rows,
      coverage: {
        total: parseInt(coverage.rows[0].total_requirements),
        covered: parseInt(coverage.rows[0].covered_requirements),
        percentage: parseFloat(coveragePercent),
      },
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// GET overall statistics (all projects)
router.get('/overall', async (req, res) => {
  try {
    const projectCount = await pool.query('SELECT COUNT(*) as total FROM projects');
    const reqCount = await pool.query('SELECT COUNT(*) as total FROM requirements');
    const tcCount = await pool.query('SELECT COUNT(*) as total FROM testcases');

    const statusBreakdown = await pool.query(
      'SELECT status, COUNT(*) as count FROM testcases GROUP BY status'
    );

    res.json({
      projects_count: parseInt(projectCount.rows[0].total),
      requirements_count: parseInt(reqCount.rows[0].total),
      testcases_count: parseInt(tcCount.rows[0].total),
      status_breakdown: statusBreakdown.rows,
    });
  } catch (error) {
    console.error('Error fetching overall statistics:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

module.exports = router;
