/**
 * 전체 스키마 마이그레이션
 * 모든 테이블 생성
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function migrateAll() {
  const databases = ['testcase_dev', 'testcase_prod'];

  for (const dbName of databases) {
    console.log('');
    console.log('========================================');
    console.log(`${dbName} 마이그레이션 시작`);
    console.log('========================================');

    const client = new Client({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD,
      database: dbName,
    });

    try {
      await client.connect();
      console.log(`✅ ${dbName} 연결 성공`);

      // 1. 기본 스키마 실행
      console.log('📝 기본 테이블 생성 중...');
      const schema1 = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
      await client.query(schema1);
      console.log('✅ 기본 테이블 생성 완료');

      // 2. 테스트 수행 스키마 실행
      console.log('📝 테스트 수행 테이블 생성 중...');
      const schema2 = fs.readFileSync(path.join(__dirname, 'schema-test-execution.sql'), 'utf8');
      await client.query(schema2);
      console.log('✅ 테스트 수행 테이블 생성 완료');

      // 3. step_results 컬럼 추가
      console.log('📝 추가 컬럼 생성 중...');
      await client.query(`
        ALTER TABLE test_case_results
        ADD COLUMN IF NOT EXISTS step_results JSONB DEFAULT '[]'::jsonb;
      `);
      console.log('✅ 추가 컬럼 생성 완료');

      console.log('');
      console.log(`✅ ${dbName} 마이그레이션 완료!`);

      await client.end();
    } catch (error) {
      console.error(`❌ ${dbName} 마이그레이션 실패:`, error.message);
      await client.end();
      process.exit(1);
    }
  }

  console.log('');
  console.log('========================================');
  console.log('✅ 모든 데이터베이스 마이그레이션 완료!');
  console.log('========================================');
  console.log('');
  console.log('생성된 테이블:');
  console.log('  - projects');
  console.log('  - requirements');
  console.log('  - testcases');
  console.log('  - test_steps');
  console.log('  - testcase_requirements');
  console.log('  - test_execution_suites');
  console.log('  - test_execution_items');
  console.log('  - test_execution_runs');
  console.log('  - test_case_results');
  console.log('');

  process.exit(0);
}

migrateAll();
