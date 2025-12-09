/**
 * 테스트 수행 시스템 테이블 마이그레이션
 */

const pool = require('./pool');
const fs = require('fs');
const path = require('path');

async function migrate() {
  try {
    console.log('========================================');
    console.log('테스트 수행 시스템 마이그레이션 시작');
    console.log('========================================');

    // SQL 파일 읽기
    const sqlPath = path.join(__dirname, 'schema-test-execution.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // 실행
    await pool.query(sql);

    console.log('✅ 테이블 생성 완료:');
    console.log('  - test_execution_suites (테스트 수행 방)');
    console.log('  - test_execution_items (수행 항목)');
    console.log('  - test_execution_runs (수행 히스토리)');
    console.log('  - test_case_results (TC별 결과)');
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
