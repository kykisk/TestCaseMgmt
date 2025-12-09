/**
 * PostgreSQL 초기 설정 스크립트
 * 데이터베이스 생성 및 테이블 스키마 생성
 */

const { Client } = require('pg');

async function setupPostgreSQL() {
  console.log('='.repeat(80));
  console.log('PostgreSQL Setup Script');
  console.log('='.repeat(80));

  // 기본 postgres 데이터베이스에 연결 (비밀번호 없이 시도)
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    database: 'postgres',
    // 비밀번호 없이 시도
  });

  try {
    console.log('\n1. Connecting to PostgreSQL...');
    await client.connect();
    console.log('✅ Connected successfully!');

    // 개발 DB 생성
    console.log('\n2. Creating development database...');
    try {
      await client.query('CREATE DATABASE testcase_dev');
      console.log('✅ testcase_dev created');
    } catch (e) {
      if (e.code === '42P04') {
        console.log('⚠️  testcase_dev already exists');
      } else {
        throw e;
      }
    }

    // 운영 DB 생성
    console.log('\n3. Creating production database...');
    try {
      await client.query('CREATE DATABASE testcase_prod');
      console.log('✅ testcase_prod created');
    } catch (e) {
      if (e.code === '42P04') {
        console.log('⚠️  testcase_prod already exists');
      } else {
        throw e;
      }
    }

    await client.end();
    console.log('\n' + '='.repeat(80));
    console.log('✅ PostgreSQL setup completed successfully!');
    console.log('='.repeat(80));

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.log('\n💡 Possible solutions:');
    console.log('1. Set PostgreSQL password:');
    console.log('   psql -U postgres');
    console.log('   ALTER USER postgres WITH PASSWORD \'your_password\';');
    console.log('\n2. Modify pg_hba.conf to allow trust authentication');
    console.log('   Location: C:\\Program Files\\PostgreSQL\\17\\data\\pg_hba.conf');
    console.log('   Change: host all all 127.0.0.1/32 md5');
    console.log('   To: host all all 127.0.0.1/32 trust');
    console.log('   Then restart PostgreSQL service');
    process.exit(1);
  }
}

setupPostgreSQL();
