/**
 * Test Execution Runs API Routes
 * 테스트 수행 실행 및 결과 관리
 */

const express = require('express');
const router = express.Router();
const pool = require('../db/pool');

// GET runs for an item
router.get('/item/:itemId', async (req, res) => {
  try {
    const { itemId } = req.params;

    const result = await pool.query(
      `SELECT r.*,
        COUNT(tcr.id) as total_tests,
        SUM(CASE WHEN tcr.result = 'Pass' THEN 1 ELSE 0 END) as pass_count,
        SUM(CASE WHEN tcr.result = 'Fail' THEN 1 ELSE 0 END) as fail_count,
        SUM(CASE WHEN tcr.result = 'Block' THEN 1 ELSE 0 END) as block_count,
        SUM(CASE WHEN tcr.result = 'Skip' THEN 1 ELSE 0 END) as skip_count
       FROM test_execution_runs r
       LEFT JOIN test_case_results tcr ON r.id = tcr.run_id
       WHERE r.item_id = $1
       GROUP BY r.id
       ORDER BY r.run_number`,
      [itemId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching runs:', error);
    res.status(500).json({ error: 'Failed to fetch runs' });
  }
});

// GET single run with results
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const runResult = await pool.query(
      'SELECT * FROM test_execution_runs WHERE id = $1',
      [id]
    );

    if (runResult.rows.length === 0) {
      return res.status(404).json({ error: 'Run not found' });
    }

    const resultsResult = await pool.query(
      'SELECT * FROM test_case_results WHERE run_id = $1 ORDER BY executed_at',
      [id]
    );

    res.json({
      ...runResult.rows[0],
      results: resultsResult.rows,
    });
  } catch (error) {
    console.error('Error fetching run:', error);
    res.status(500).json({ error: 'Failed to fetch run' });
  }
});

// POST create new run (시작)
router.post('/', async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const { item_id, executed_by, rerun_type } = req.body; // rerun_type: 'all' | 'failed'

    if (!item_id) {
      return res.status(400).json({ error: 'item_id is required' });
    }

    // Get next run number
    const maxRunResult = await client.query(
      'SELECT COALESCE(MAX(run_number), 0) as max_run FROM test_execution_runs WHERE item_id = $1',
      [item_id]
    );
    const nextRunNumber = maxRunResult.rows[0].max_run + 1;

    // Create run
    const runResult = await client.query(
      `INSERT INTO test_execution_runs (item_id, run_number, executed_by, status)
       VALUES ($1, $2, $3, 'In Progress')
       RETURNING *`,
      [item_id, nextRunNumber, executed_by]
    );

    const newRun = runResult.rows[0];

    // 재수행인 경우, 이전 결과를 복사 (rerun_type에 따라)
    if (nextRunNumber > 1 && rerun_type) {
      // 이전 run 찾기
      const prevRunResult = await client.query(
        'SELECT * FROM test_execution_runs WHERE item_id = $1 AND run_number = $2',
        [item_id, nextRunNumber - 1]
      );

      if (prevRunResult.rows.length > 0) {
        const prevRunId = prevRunResult.rows[0].id;

        // 이전 결과 가져오기
        const prevResultsResult = await client.query(
          'SELECT * FROM test_case_results WHERE run_id = $1',
          [prevRunId]
        );

        // 재수행 타입에 따라 필터링
        let resultsToCopy = prevResultsResult.rows;
        if (rerun_type === 'failed') {
          // Fail 또는 Block만 복사 (Pass와 Skip은 제외)
          resultsToCopy = prevResultsResult.rows.filter(
            (r) => r.result === 'Pass' || r.result === 'Skip'
          );

          // Pass/Skip된 것들만 새 run에 복사
          for (const result of resultsToCopy) {
            await client.query(
              `INSERT INTO test_case_results (run_id, testcase_id, result, notes)
               VALUES ($1, $2, $3, $4)`,
              [newRun.id, result.testcase_id, result.result, result.notes]
            );
          }
        }
        // rerun_type === 'all'이면 아무것도 복사하지 않음 (모두 새로 테스트)
      }
    }

    await client.query('COMMIT');

    res.status(201).json(newRun);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating run:', error);
    res.status(500).json({ error: 'Failed to create run' });
  } finally {
    client.release();
  }
});

// POST save test case result
router.post('/:runId/results', async (req, res) => {
  try {
    const { runId } = req.params;
    const { testcase_id, result, notes, step_results } = req.body;

    if (!testcase_id || !result) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // 결과 저장 또는 업데이트
    const existingResult = await pool.query(
      'SELECT * FROM test_case_results WHERE run_id = $1 AND testcase_id = $2',
      [runId, testcase_id]
    );

    let resultRow;
    if (existingResult.rows.length > 0) {
      // 업데이트
      const updateResult = await pool.query(
        `UPDATE test_case_results
         SET result = $1, notes = $2, step_results = $3, executed_at = CURRENT_TIMESTAMP
         WHERE run_id = $4 AND testcase_id = $5
         RETURNING *`,
        [result, notes, JSON.stringify(step_results || []), runId, testcase_id]
      );
      resultRow = updateResult.rows[0];
    } else {
      // 생성
      const insertResult = await pool.query(
        `INSERT INTO test_case_results (run_id, testcase_id, result, notes, step_results)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [runId, testcase_id, result, notes, JSON.stringify(step_results || [])]
      );
      resultRow = insertResult.rows[0];
    }

    res.json(resultRow);
  } catch (error) {
    console.error('Error saving result:', error);
    res.status(500).json({ error: 'Failed to save result' });
  }
});

// PUT complete run (최종 판정)
router.put('/:id/complete', async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const { id } = req.params;
    const { notes } = req.body;

    // 모든 결과 가져오기
    const resultsResult = await client.query(
      'SELECT result FROM test_case_results WHERE run_id = $1',
      [id]
    );

    // 최종 상태 계산
    const results = resultsResult.rows.map((r) => r.result);
    let finalStatus = 'Pass';

    if (results.includes('Fail')) {
      finalStatus = 'Fail';
    } else if (results.includes('Block')) {
      finalStatus = 'Block';
    }

    // Run 업데이트
    const runResult = await client.query(
      `UPDATE test_execution_runs
       SET status = $1, notes = $2, completed_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING *`,
      [finalStatus, notes, id]
    );

    if (runResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Run not found' });
    }

    const run = runResult.rows[0];

    // Item 상태 업데이트 (최신 run의 상태로)
    await client.query(
      'UPDATE test_execution_items SET status = $1 WHERE id = $2',
      [finalStatus, run.item_id]
    );

    // Suite 상태 업데이트 (모든 items 확인)
    const itemsResult = await client.query(
      'SELECT status FROM test_execution_items WHERE suite_id = (SELECT suite_id FROM test_execution_items WHERE id = $1)',
      [run.item_id]
    );

    const itemStatuses = itemsResult.rows.map((r) => r.status);
    let suiteStatus = 'Pass';

    if (itemStatuses.includes('Fail')) {
      suiteStatus = 'Fail';
    } else if (itemStatuses.includes('Block')) {
      suiteStatus = 'Block';
    } else if (itemStatuses.includes('In Progress')) {
      suiteStatus = 'In Progress';
    }

    await client.query(
      'UPDATE test_execution_suites SET status = $1 WHERE id = (SELECT suite_id FROM test_execution_items WHERE id = $2)',
      [suiteStatus, run.item_id]
    );

    await client.query('COMMIT');

    res.json(run);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error completing run:', error);
    res.status(500).json({ error: 'Failed to complete run' });
  } finally {
    client.release();
  }
});

// DELETE run
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM test_execution_runs WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Run not found' });
    }

    res.json({ message: 'Run deleted successfully' });
  } catch (error) {
    console.error('Error deleting run:', error);
    res.status(500).json({ error: 'Failed to delete run' });
  }
});

module.exports = router;
