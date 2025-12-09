/**
 * localStorage DB Tool - LevelDB 완전 읽기
 *
 * 사용법:
 *   node db-tool.cjs           # 전체 조회
 *   node db-tool.cjs prod_     # prod_ 키만 조회
 *   node db-tool.cjs dev_      # dev_ 키만 조회
 */

const { Level } = require('level');
const path = require('path');

// LevelDB 경로
const leveldbPath = 'C:\\Users\\Administrator\\AppData\\Local\\Microsoft\\Edge\\User Data\\Default\\Local Storage\\leveldb';

// 명령줄 인자
const filterPrefix = process.argv[2] || '';

async function readLevelDB() {
  console.log('='.repeat(100));
  console.log('                              localStorage DB Tool');
  console.log('='.repeat(100));
  console.log(`경로: ${leveldbPath}`);
  console.log(`필터: ${filterPrefix || '(전체)'}\n`);

  const db = new Level(leveldbPath, {
    valueEncoding: 'utf8',
    createIfMissing: false
  });

  try {
    await db.open();
    console.log('✅ LevelDB 연결 성공\n');

    console.log('📊 저장된 모든 키-값:');
    console.log('-'.repeat(100));

    let count = 0;
    let prodCount = 0;
    let devCount = 0;

    // 모든 키-값 읽기
    for await (const [key, value] of db.iterator()) {
      // 필터 적용
      if (filterPrefix && !key.startsWith(filterPrefix)) {
        continue;
      }

      count++;

      // 통계
      if (key.startsWith('prod_')) prodCount++;
      if (key.startsWith('dev_')) devCount++;

      // 출력
      console.log(`\n🔑 키: ${key}`);
      console.log('─'.repeat(100));

      try {
        // origin 정보 파싱
        const parts = key.split('\u0000'); // null 문자로 분리
        if (parts.length > 1) {
          console.log(`   Origin: ${parts[0]}`);
          console.log(`   Key: ${parts[1]}`);
        }

        // 값 파싱
        const cleanValue = value.replace(/^\u0001/, ''); // 첫 바이트 제거

        try {
          const parsed = JSON.parse(cleanValue);
          console.log(`   값: ${JSON.stringify(parsed, null, 2)}`);
        } catch {
          // JSON이 아니면 그대로 출력
          if (cleanValue.length > 200) {
            console.log(`   값 (텍스트, ${cleanValue.length}자): ${cleanValue.substring(0, 200)}...`);
          } else {
            console.log(`   값: ${cleanValue}`);
          }
        }
      } catch (e) {
        console.log(`   원본 값: ${value.substring(0, 100)}${value.length > 100 ? '...' : ''}`);
      }
    }

    console.log('\n' + '='.repeat(100));
    console.log('📈 통계:');
    console.log('-'.repeat(100));
    console.log(`  전체 키: ${count}개`);
    console.log(`  prod_ 키: ${prodCount}개`);
    console.log(`  dev_ 키: ${devCount}개`);
    console.log('='.repeat(100));

    if (count === 0) {
      console.log('\n⚠️  데이터가 비어있습니다!');
      console.log('\n원인:');
      console.log('  1. 아직 프로젝트/테스트케이스를 생성하지 않음');
      console.log('  2. 브라우저가 다른 origin으로 저장 (예: file://, 127.0.0.1)');
      console.log('  3. 다른 브라우저 사용 중 (Chrome vs Edge)');
      console.log('\n해결:');
      console.log('  - http://localhost:8090 에서 데이터를 생성해보세요');
      console.log('  - 브라우저 DevTools (F12)로 직접 확인: Application → Local Storage');
    }

  } catch (error) {
    console.error('\n❌ 오류 발생:', error.message);
  } finally {
    await db.close();
    console.log('\n✅ DB 연결 종료');
  }
}

// 실행
readLevelDB().catch(console.error);
