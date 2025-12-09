/**
 * test_case_results 테이블에 step_results 컬럼 추가
 */

const pool = require('./pool');

async function migrate() {
  try {
    console.log('========================================');
    console.log('스텝별 결과 컬럼 추가 마이그레이션');
    console.log('========================================');

    // step_results 컬럼 추가 (JSONB 타입)
    await pool.query(`
      ALTER TABLE test_case_results
      ADD COLUMN IF NOT EXISTS step_results JSONB DEFAULT '[]'::jsonb;
    `);

    console.log('✅ step_results 컬럼 추가 완료');
    console.log('========================================');
    console.log('마이그레이션 성공!');
    console.log('========================================');

    process.exit(0);
  } catch (error) {
    console.error('❌ 마이그레이션 실패:', error);
    process.exit(1);
  }
}

migrate();
