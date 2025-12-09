# 요구사항 관리 기능

## 입력 속성
- 요구사항 ID
- 구분 (5가지)
  - 로드맵 체계관리
  - 로드맵 운영관리
  - 관리자 기능
  - 인터페이스
  - 기타
- 기능요구사항
- 설명
- 비고

## 주요 기능
- Cascading Select: 구분 선택 시 기능요구사항 자동 변경
- 엑셀 Import/Export
- 템플릿 자동 생성 (requirement_template.xlsx)
- 수동 등록/삭제
- 자동 검증

## 컴포넌트
- RequirementModal.jsx
- RequirementList.jsx
- utils/requirementCategories.js
- utils/requirementExcelImport.js
