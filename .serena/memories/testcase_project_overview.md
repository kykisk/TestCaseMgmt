# TestCase Management System - 프로젝트 개요

## 프로젝트 정보

**프로젝트명**: TestCase Management System  
**유형**: 소프트웨어 테스트케이스 관리 시스템  
**위치**: C:\Workspace\MyWork\TestCase

## 기술 스택

- **프레임워크**: React 18 + Vite
- **스타일링**: Tailwind CSS
- **데이터 저장**: localStorage (dev/prod 분리)
- **엑셀 처리**: xlsx 라이브러리
- **상태 관리**: React Hooks

## 서버 구성

### 개발 서버
- 포트: 5173
- DB Prefix: `dev_`
- 용도: 코드 수정/테스트

### 운영 서버
- 포트: 8090
- DB Prefix: `prod_`
- 용도: 외부 공개/배포

## 주요 기능

### 1. 요구사항 관리 (Requirements)
- **구현 상태**: ✅ 완료
- **입력 속성**: 
  - 요구사항 ID
  - 구분 (5가지: 로드맵 체계관리, 로드맵 운영관리, 관리자 기능, 인터페이스, 기타)
  - 기능요구사항
  - 설명
  - 비고
- **주요 기능**:
  - Cascading Select (구분 선택 시 기능요구사항 자동 변경)
  - 엑셀 Import/Export
  - 템플릿 자동 생성 (requirement_template.xlsx)
  - 수동 등록/삭제

### 2. 테스트케이스 관리 (TestCases)
- **구현 상태**: ✅ 완료
- **주요 기능**:
  - 동적 테스트 스텝 추가/삭제
  - 요구사항 연결 (복수 선택 가능)
  - TC ID 자동 생성 (TC-YYYYMMDD-XXX)
  - 우선순위: High/Medium/Low
  - 카테고리: 기능/통합/UI/성능/보안/회귀/기타
  - 엑셀 Import/Export
  - 연결된 요구사항 표시

### 3. 대시보드 & 통계
- **구현 상태**: ✅ 완료
- 프로젝트 통계
- 요구사항 현황
- 테스트케이스 현황

## 배포 환경

### AWS EC2
- 프라이빗 IP: 172.31.47.228
- 운영 포트: 8090
- Security Group: TCP 8090 인바운드 허용 필요
- Windows 방화벽: 포트 8090 허용 필요
- 서빙: serve 패키지 사용

### 시작/중지 스크립트
- 개발 서버: `start-dev.bat` / `stop-dev.bat`
- 운영 서버: `start-server.bat` / `stop-server.bat`

## 프로젝트 구조

```
TestCase/
├── docs/              # 11개 가이드 문서
├── scripts/           # 템플릿 생성 및 설정 스크립트
│   └── setup/        # 방화벽 설정 스크립트
├── public/           # 엑셀 템플릿 파일
├── dist/             # 프로덕션 빌드 결과
├── src/              # 소스 코드
│   ├── components/  # React 컴포넌트
│   └── utils/       # 유틸리티
└── *.bat            # 실행 스크립트
```

## 데이터 모델 관계

```
TestCase Management System
├── Requirements (요구사항 관리)
├── TestCases (테스트케이스 관리)
│   └── → links to Requirements
├── Deployment (배포 설정)
└── Documentation (문서 구조)
```

## 향후 개발 예정

- 테스트 실행 및 결과 기록
- 요구사항 추적성 매트릭스 (RTM)
- 차트 시각화
- 데이터 백업/복원
