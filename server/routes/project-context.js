/**
 * Project Context API Routes
 */

const express = require('express');
const router = express.Router();
const pool = require('../db/pool');

// GET project context
router.get('/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;

    const result = await pool.query(
      'SELECT * FROM project_context WHERE project_id = $1',
      [projectId]
    );

    if (result.rows.length === 0) {
      // 컨텍스트가 없으면 빈 객체 반환
      return res.json({
        project_id: projectId,
        overview: '',
        tech_stack: '',
        glossary: '',
        business_rules: '',
        domain_knowledge: '',
        sample_testcase_ids: [],
        additional_context: '',
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching project context:', error);
    res.status(500).json({ error: 'Failed to fetch project context' });
  }
});

// POST/PUT save project context (upsert)
router.post('/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const {
      overview,
      tech_stack,
      glossary,
      business_rules,
      domain_knowledge,
      sample_testcase_ids,
      additional_context,
    } = req.body;

    // Upsert (있으면 업데이트, 없으면 생성)
    const result = await pool.query(
      `INSERT INTO project_context
       (project_id, overview, tech_stack, glossary, business_rules, domain_knowledge, sample_testcase_ids, additional_context)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (project_id)
       DO UPDATE SET
         overview = $2,
         tech_stack = $3,
         glossary = $4,
         business_rules = $5,
         domain_knowledge = $6,
         sample_testcase_ids = $7,
         additional_context = $8
       RETURNING *`,
      [
        projectId,
        overview || '',
        tech_stack || '',
        glossary || '',
        business_rules || '',
        domain_knowledge || '',
        sample_testcase_ids || [],
        additional_context || '',
      ]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error saving project context:', error);
    res.status(500).json({ error: 'Failed to save project context', details: error.message });
  }
});

// DELETE project context
router.delete('/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;

    const result = await pool.query(
      'DELETE FROM project_context WHERE project_id = $1 RETURNING *',
      [projectId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project context not found' });
    }

    res.json({ message: 'Project context deleted successfully' });
  } catch (error) {
    console.error('Error deleting project context:', error);
    res.status(500).json({ error: 'Failed to delete project context' });
  }
});

module.exports = router;
