/**
 * 데이터베이스 스키마 생성 스크립트
 * testcase_dev와 testcase_prod에 테이블 생성
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function createSchema(database) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`Creating schema for: ${database}`);
  console.log('='.repeat(80));

  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    database: database,
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Read schema.sql file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    // Execute schema
    await client.query(schemaSql);
    console.log('✅ Schema created successfully');

    // Verify tables
    const result = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    console.log(`\n📊 Created tables (${result.rows.length}):`);
    result.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });

    await client.end();
  } catch (error) {
    console.error(`❌ Error for ${database}:`, error.message);
    await client.end();
    throw error;
  }
}

async function main() {
  console.log('='.repeat(80));
  console.log('Database Schema Creation Script');
  console.log('='.repeat(80));

  try {
    // Create schema for development database
    await createSchema('testcase_dev');

    // Create schema for production database
    await createSchema('testcase_prod');

    console.log('\n' + '='.repeat(80));
    console.log('✅ All schemas created successfully!');
    console.log('='.repeat(80));
  } catch (error) {
    console.error('\n❌ Failed to create schemas');
    process.exit(1);
  }
}

main();
