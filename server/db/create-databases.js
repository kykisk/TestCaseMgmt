/**
 * PostgreSQL 데이터베이스 생성 스크립트
 * testcase_dev, testcase_prod 생성
 */

const { Client } = require('pg');
require('dotenv').config();

async function createDatabases() {
  // postgres 데이터베이스에 연결 (기본 DB)
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    database: 'postgres', // 기본 DB에 연결
  });

  try {
    console.log('========================================');
    console.log('PostgreSQL 데이터베이스 생성');
    console.log('========================================');
    console.log('');

    await client.connect();
    console.log('✅ PostgreSQL 연결 성공!');
    console.log('');

    // testcase_dev 생성
    try {
      await client.query('CREATE DATABASE testcase_dev');
      console.log('✅ testcase_dev 데이터베이스 생성 완료');
    } catch (error) {
      if (error.code === '42P04') {
        console.log('⚠️  testcase_dev 데이터베이스가 이미 존재합니다');
      } else {
        throw error;
      }
    }

    // testcase_prod 생성
    try {
      await client.query('CREATE DATABASE testcase_prod');
      console.log('✅ testcase_prod 데이터베이스 생성 완료');
    } catch (error) {
      if (error.code === '42P04') {
        console.log('⚠️  testcase_prod 데이터베이스가 이미 존재합니다');
      } else {
        throw error;
      }
    }

    console.log('');
    console.log('========================================');
    console.log('데이터베이스 생성 완료!');
    console.log('========================================');

    await client.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
    console.error('');
    console.error('확인 사항:');
    console.error('1. PostgreSQL 서비스가 실행 중인지 확인하세요');
    console.error('2. .env 파일의 DB_PASSWORD가 올바른지 확인하세요');
    console.error('');
    process.exit(1);
  }
}

createDatabases();
