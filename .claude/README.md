# Claude MCP 서버 설정

이 프로젝트에 적용된 MCP (Model Context Protocol) 서버입니다.

## 활성화된 MCP 서버:

### 1. **filesystem** ✅
- **기능**: 프로젝트 파일 시스템 접근
- **경로**: `C:/Workspace/MyWork/TestCase`
- **용도**: 파일 읽기/쓰기/검색

### 2. **postgres** ✅
- **기능**: PostgreSQL 데이터베이스 직접 접근
- **데이터베이스**: `testcase_dev`
- **연결**: `postgresql://postgres:****@localhost:5432/testcase_dev`
- **용도**:
  - 데이터베이스 스키마 조회
  - SQL 쿼리 실행
  - 테이블 데이터 직접 확인

### 3. **brave-search** ✅
- **기능**: Brave 검색 엔진을 통한 웹 검색
- **용도**: 기술 문서, 에러 해결 방법 검색

## 비활성화된 MCP 서버:

### 4. **puppeteer** ⏸️
- **기능**: 브라우저 자동화 (Chromium 기반)
- **상태**: disabled (필요시 활성화 가능)

### 5. **playwright** ⏸️
- **기능**: 크로스 브라우저 자동화 테스팅
- **상태**: disabled (필요시 활성화 가능)

---

## 사용 방법:

MCP 서버는 자동으로 백그라운드에서 실행됩니다.
Claude가 필요할 때 자동으로 사용합니다.

---

## 설정 변경:

`.claude/mcp_servers.json` 파일을 편집하여:
- `"disabled": true` → 비활성화
- `"disabled": false` → 활성화
