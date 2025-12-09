/**
 * PostgreSQL Connection Pool
 * 환경에 따라 dev/prod DB 자동 선택
 */

const { Pool } = require('pg');

// 환경 변수 확인 (기본값: development)
const ENV = process.env.NODE_ENV || 'development';
const DATABASE = ENV === 'production' ? 'testcase_prod' : 'testcase_dev';

console.log(`[DB] Environment: ${ENV}`);
console.log(`[DB] Database: ${DATABASE}`);

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: DATABASE,
  max: 20, // 최대 연결 수
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// 연결 테스트
pool.on('connect', () => {
  console.log(`[DB] Connected to ${DATABASE}`);
});

pool.on('error', (err) => {
  console.error('[DB] Unexpected error:', err);
  process.exit(-1);
});

module.exports = pool;
