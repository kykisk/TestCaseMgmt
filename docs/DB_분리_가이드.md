# 📊 개발/운영 DB 분리 가이드

## ✅ DB 분리 완료!

localStorage를 사용하며 **개발 DB**와 **운영 DB**가 자동으로 분리됩니다.

---

## 🗄️ DB 구조

### 개발 DB (Development)
```
prefix: dev_
키 예시:
  - dev_projects:list
  - dev_testcases:project-id
  - dev_requirements:project-id
```

### 운영 DB (Production)
```
prefix: prod_
키 예시:
  - prod_projects:list
  - prod_testcases:project-id
  - prod_requirements:project-id
```

---

## 🔄 환경별 자동 분리

### 개발 서버 (npm run dev)
```bash
start-dev.bat 실행
→ 포트 5173
→ dev_ prefix 사용
→ 개발 DB에 저장
→ 화면에 (DEV) 배지 표시
```

### 프로덕션 서버 (npm run serve:external)
```bash
start-server.bat 실행
→ 포트 8090
→ prod_ prefix 사용
→ 운영 DB에 저장
→ (DEV) 배지 없음
```

---

## 🎯 작동 방식

### 자동 감지
```javascript
// Vite 환경 변수 사용
import.meta.env.DEV === true  → 개발 모드 → dev_
import.meta.env.DEV === false → 운영 모드 → prod_
```

### Storage 함수
```javascript
// 개발 환경
setItem('projects:list', data)
→ localStorage에 'dev_projects:list' 로 저장

// 운영 환경
setItem('projects:list', data)
→ localStorage에 'prod_projects:list' 로 저장
```

---

## 📋 실제 사용 예시

### 시나리오: 새 기능 개발

#### 1단계: 개발 서버에서 테스트
```bash
start-dev.bat 실행
→ http://localhost:5173
→ 테스트 데이터 생성 (dev_DB에 저장)
→ 기능 개발 및 테스트
```

#### 2단계: 운영 서버 확인
```bash
npm run build
start-server.bat 실행
→ http://172.31.47.228:8090
→ 운영 DB는 비어있음 (개발 DB와 분리!)
→ 실제 운영 데이터로 테스트
```

---

## 🔍 DB 확인 방법

### 브라우저 DevTools에서:
```javascript
// F12 → Console 탭

// 모든 키 확인
Object.keys(localStorage)

// 개발 DB만 보기
Object.keys(localStorage).filter(k => k.startsWith('dev_'))

// 운영 DB만 보기
Object.keys(localStorage).filter(k => k.startsWith('prod_'))

// 환경 정보 확인
console.log(import.meta.env.DEV ? 'DEV' : 'PROD')
```

---

## 💾 데이터 이동 방법

### 개발 → 운영으로 데이터 복사

#### 방법 1: 엑셀 Export/Import
```
1. 개발 서버에서 "엑셀 내보내기"
2. 엑셀 파일 저장
3. 운영 서버에서 "엑셀 가져오기"
```

#### 방법 2: localStorage 직접 복사
```javascript
// F12 Console에서
// 1. 개발 DB 내보내기
const devData = {};
Object.keys(localStorage)
  .filter(k => k.startsWith('dev_'))
  .forEach(k => {
    devData[k.replace('dev_', 'prod_')] = localStorage.getItem(k);
  });

// 2. 운영 DB에 저장
Object.entries(devData).forEach(([k, v]) => {
  localStorage.setItem(k, v);
});
```

---

## 🎨 화면 구분

### 개발 서버
```
┌─────────────────────────────────┐
│ 📋 테스트케이스 관리 시스템 [DEV] │  ← 노란색 배지
└─────────────────────────────────┘
```

### 운영 서버
```
┌─────────────────────────────────┐
│ 📋 테스트케이스 관리 시스템      │  ← 배지 없음
└─────────────────────────────────┘
```

---

## 🔒 데이터 격리

### 장점:
- ✅ 개발 중 운영 DB 훼손 방지
- ✅ 테스트 데이터와 실제 데이터 분리
- ✅ 안전한 기능 테스트
- ✅ 실수로 운영 데이터 삭제 방지

### 주의사항:
- ⚠️ 개발/운영에서 각각 데이터를 따로 생성해야 함
- ⚠️ 개발 데이터는 운영에 자동 반영 안 됨
- ⚠️ 데이터 이동은 엑셀 또는 수동 복사 필요

---

## 📊 DB 상태 모니터링

### localStorage 크기 확인:
```javascript
// F12 Console
const devSize = Object.keys(localStorage)
  .filter(k => k.startsWith('dev_'))
  .reduce((sum, k) => sum + localStorage.getItem(k).length, 0);

const prodSize = Object.keys(localStorage)
  .filter(k => k.startsWith('prod_'))
  .reduce((sum, k) => sum + localStorage.getItem(k).length, 0);

console.log('개발 DB:', (devSize / 1024).toFixed(2), 'KB');
console.log('운영 DB:', (prodSize / 1024).toFixed(2), 'KB');
```

---

## 🎯 권장 워크플로우

### 개발 단계:
```
1. start-dev.bat 실행 (개발 DB)
2. 테스트 데이터 생성
3. 기능 개발/테스트
4. 문제 없으면 다음 단계
```

### 스테이징 단계:
```
1. npm run build
2. start-server.bat 실행 (운영 DB)
3. 깨끗한 상태에서 테스트
4. 문제 없으면 외부 공개
```

### 운영 단계:
```
1. AWS Security Group 설정
2. 외부 접속 허용
3. 실제 데이터 입력
4. 서비스 운영
```

---

## 🎉 완료!

**DB 분리:**
- ✅ 개발 DB (dev_ prefix)
- ✅ 운영 DB (prod_ prefix)
- ✅ 자동 환경 감지
- ✅ 완전히 격리됨

**화면 구분:**
- ✅ 개발: 제목 옆에 [DEV] 노란색 배지
- ✅ 운영: 배지 없음

이제 안전하게 개발할 수 있습니다! 🛡️
