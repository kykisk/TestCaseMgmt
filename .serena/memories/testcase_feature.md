# 테스트케이스 작성 기능

## 입력 속성
- TC ID (자동 생성: TC-YYYYMMDD-XXX)
- 제목
- 설명
- 프로젝트 선택
- 요구사항 연결 (복수 선택)
- 우선순위: High/Medium/Low
- 카테고리: 기능/통합/UI/성능/보안/회귀/기타
- 사전조건
- 테스트 스텝 (동적 추가/삭제)
- 사후조건
- 태그

## 주요 기능
- 동적 테스트 스텝 추가/삭제
- 요구사항과 테스트케이스 연결
- 엑셀 Import/Export
- 목록에 연결된 요구사항 표시
- TC ID 자동 생성

## 컴포넌트
- TestCaseModal.jsx
- TestCaseList.jsx
- utils/excelImport.js
- utils/idGenerator.js
