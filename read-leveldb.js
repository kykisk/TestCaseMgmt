/**
 * LevelDB localStorage 읽기 도구
 * Chrome/Edge의 localStorage LevelDB를 직접 읽어서 내용 출력
 */

const fs = require('fs');
const path = require('path');

// LevelDB 경로
const leveldbPath = 'C:\\Users\\Administrator\\AppData\\Local\\Microsoft\\Edge\\User Data\\Default\\Local Storage\\leveldb';

console.log('='.repeat(60));
console.log('LevelDB localStorage Reader');
console.log('='.repeat(60));
console.log(`경로: ${leveldbPath}\n`);

// 경로 확인
if (!fs.existsSync(leveldbPath)) {
  console.error('❌ LevelDB 경로가 존재하지 않습니다.');
  process.exit(1);
}

// .log 파일 읽기 (텍스트 형식으로 일부 내용 포함)
const files = fs.readdirSync(leveldbPath);
console.log('📁 LevelDB 파일 목록:');
files.forEach(file => {
  const filePath = path.join(leveldbPath, file);
  const stats = fs.statSync(filePath);
  console.log(`  - ${file} (${stats.size} bytes)`);
});

console.log('\n' + '='.repeat(60));
console.log('💡 LevelDB를 읽으려면 level 패키지가 필요합니다.');
console.log('='.repeat(60));
console.log('\n설치 방법:');
console.log('  npm install level');
console.log('\n사용 방법:');
console.log('  node read-leveldb-full.js');
