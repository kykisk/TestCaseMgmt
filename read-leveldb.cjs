/**
 * LevelDB localStorage 읽기 도구
 * Chrome/Edge의 localStorage LevelDB를 직접 읽어서 내용 출력
 */

const fs = require('fs');
const path = require('path');

// LevelDB 경로들 (여러 브라우저 지원)
const leveldbPaths = [
  'C:\\Users\\Administrator\\AppData\\Local\\Microsoft\\Edge\\User Data\\Default\\Local Storage\\leveldb',
  'C:\\Users\\Administrator\\AppData\\Local\\Google\\Chrome\\User Data\\Default\\Local Storage\\leveldb',
];

console.log('='.repeat(80));
console.log('                    LevelDB localStorage Reader');
console.log('='.repeat(80));

// 존재하는 경로 찾기
let leveldbPath = null;
for (const p of leveldbPaths) {
  if (fs.existsSync(p)) {
    leveldbPath = p;
    break;
  }
}

if (!leveldbPath) {
  console.error('❌ LevelDB 경로를 찾을 수 없습니다.');
  console.log('\n확인한 경로:');
  leveldbPaths.forEach(p => console.log(`  - ${p}`));
  process.exit(1);
}

console.log(`\n✅ 경로 발견: ${leveldbPath}\n`);

// 파일 목록
const files = fs.readdirSync(leveldbPath);
console.log('📁 LevelDB 파일 목록:');
console.log('-'.repeat(80));

let totalSize = 0;
files.forEach(file => {
  const filePath = path.join(leveldbPath, file);
  const stats = fs.statSync(filePath);
  totalSize += stats.size;
  const sizeKB = (stats.size / 1024).toFixed(2);
  console.log(`  ${file.padEnd(30)} ${sizeKB.padStart(10)} KB`);
});

console.log('-'.repeat(80));
console.log(`  전체 크기: ${(totalSize / 1024).toFixed(2)} KB\n`);

// .ldb 파일에서 키 추출 시도 (바이너리이지만 일부 텍스트 포함)
console.log('🔍 localStorage 키 검색 (prod_, dev_):');
console.log('-'.repeat(80));

const ldbFiles = files.filter(f => f.endsWith('.ldb'));
let foundKeys = new Set();

ldbFiles.forEach(file => {
  const filePath = path.join(leveldbPath, file);
  try {
    const content = fs.readFileSync(filePath, 'utf8');

    // prod_ 키 찾기
    const prodMatches = content.match(/prod_[a-zA-Z0-9:_-]+/g);
    if (prodMatches) {
      prodMatches.forEach(k => foundKeys.add(k));
    }

    // dev_ 키 찾기
    const devMatches = content.match(/dev_[a-zA-Z0-9:_-]+/g);
    if (devMatches) {
      devMatches.forEach(k => foundKeys.add(k));
    }
  } catch (e) {
    // 바이너리 파일이라 일부만 읽힘
  }
});

if (foundKeys.size > 0) {
  console.log(`\n✅ 발견된 키 (${foundKeys.size}개):\n`);
  Array.from(foundKeys).sort().forEach(key => {
    console.log(`  - ${key}`);
  });
} else {
  console.log('\n⚠️  prod_ 또는 dev_ 키를 찾을 수 없습니다.');
  console.log('  → DB가 비어있거나 다른 origin에 저장되어 있을 수 있습니다.');
}

console.log('\n' + '='.repeat(80));
console.log('💡 완전한 데이터 읽기 방법:');
console.log('='.repeat(80));
console.log('\n1. level 패키지 설치:');
console.log('   npm install level');
console.log('\n2. 전용 뷰어 사용:');
console.log('   - leveldb-viewer (npm install -g leveldb-viewer)');
console.log('   - 또는 브라우저 DevTools (F12 → Application → Local Storage)');
console.log('\n3. 온라인 도구:');
console.log('   - SQLite Browser (Edge는 SQLite도 사용)');
console.log('   - https://github.com/Level/level');
console.log('\n' + '='.repeat(80));
