/**
 * 엑셀 템플릿 파일 생성 스크립트
 * 실행: node scripts/generateTemplates.js
 */

import * as XLSX from 'xlsx';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 요구사항 템플릿 생성
function generateRequirementTemplate() {
  const data = [
    {
      '요구사항 ID': 'REQ-20250121-001',
      '구분': '로드맵 체계관리',
      '기능 요구사항': 'Hierarchy',
      '설명': '로드맵 계층 구조 관리 기능 - 3단계 계층까지 지원',
      '비고': '상위/하위 항목 자동 연결',
    },
    {
      '요구사항 ID': 'REQ-20250121-002',
      '구분': '로드맵 체계관리',
      '기능 요구사항': '구성요소관리',
      '설명': '로드맵 구성 요소 등록 및 수정',
      '비고': '',
    },
    {
      '요구사항 ID': 'REQ-20250121-003',
      '구분': '로드맵 운영관리',
      '기능 요구사항': '현황관리',
      '설명': '로드맵 현황 조회 및 관리 기능',
      '비고': '실시간 업데이트 지원',
    },
    {
      '요구사항 ID': 'REQ-20250121-004',
      '구분': '로드맵 운영관리',
      '기능 요구사항': 'Diagram',
      '설명': '로드맵 다이어그램 시각화',
      '비고': 'SVG 또는 Canvas 기반',
    },
    {
      '요구사항 ID': 'REQ-20250121-005',
      '구분': '관리자 기능',
      '기능 요구사항': '기준정보 관리',
      '설명': '시스템 기준 정보 설정 및 관리',
      '비고': '코드 관리 포함',
    },
    {
      '요구사항 ID': 'REQ-20250121-006',
      '구분': '인터페이스',
      '기능 요구사항': 'SSO',
      '설명': 'Single Sign-On 연동 기능',
      '비고': 'SAML 2.0 프로토콜 사용',
    },
    {
      '요구사항 ID': 'REQ-20250121-007',
      '구분': '기타',
      '기능 요구사항': '정보검색',
      '설명': '통합 검색 기능 제공',
      '비고': '전체 텍스트 검색 지원',
    },
  ];

  const ws = XLSX.utils.json_to_sheet(data);

  // 열 너비 설정
  ws['!cols'] = [
    { wch: 20 }, // 요구사항 ID
    { wch: 20 }, // 구분
    { wch: 25 }, // 기능 요구사항
    { wch: 50 }, // 설명
    { wch: 30 }, // 비고
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, '요구사항');

  const outputPath = join(__dirname, '..', 'public', 'requirement_template.xlsx');
  XLSX.writeFile(wb, outputPath);
  console.log('✅ 요구사항 템플릿 생성 완료:', outputPath);
}

// 테스트케이스 템플릿 생성
function generateTestCaseTemplate() {
  const data = [
    {
      'TC ID': 'TC-20250121-001',
      '제목': '로그인 기능 테스트',
      '설명': '사용자 로그인 기능 정상 작동 검증',
      '요구사항 ID': 'REQ-20250121-001',
      '우선순위': 'High',
      '카테고리': '기능 테스트',
      '사전조건': '사용자 계정이 등록되어 있어야 함',
      '스텝1-동작': '로그인 페이지 접속',
      '스텝1-예상결과': '로그인 페이지가 정상 표시됨',
      '스텝2-동작': '아이디 입력',
      '스텝2-예상결과': '아이디가 정상 입력됨',
      '스텝3-동작': '비밀번호 입력',
      '스텝3-예상결과': '비밀번호가 정상 입력됨',
      '스텝4-동작': '로그인 버튼 클릭',
      '스텝4-예상결과': '메인 페이지로 이동됨',
      '사후조건': '로그인 상태 유지',
      '태그': '로그인, 인증, 회원',
    },
    {
      'TC ID': 'TC-20250121-002',
      '제목': 'Hierarchy 생성 테스트',
      '설명': '로드맵 계층 구조 생성 기능 검증',
      '요구사항 ID': 'REQ-20250121-001, REQ-20250121-002',
      '우선순위': 'High',
      '카테고리': '기능 테스트',
      '사전조건': '관리자 권한으로 로그인',
      '스텝1-동작': '새 Hierarchy 생성 버튼 클릭',
      '스텝1-예상결과': '생성 모달 표시됨',
      '스텝2-동작': 'Hierarchy 정보 입력',
      '스텝2-예상결과': '정보가 정상 입력됨',
      '스텝3-동작': '저장 버튼 클릭',
      '스텝3-예상결과': 'Hierarchy가 생성되고 목록에 표시됨',
      '사후조건': '',
      '태그': 'Hierarchy, 계층관리',
    },
    {
      'TC ID': 'TC-20250121-003',
      '제목': 'SSO 인증 테스트',
      '설명': 'Single Sign-On 인증 연동 검증',
      '요구사항 ID': 'REQ-20250121-006',
      '우선순위': 'Medium',
      '카테고리': '통합 테스트',
      '사전조건': 'SSO 서버 정상 작동',
      '스텝1-동작': 'SSO 로그인 버튼 클릭',
      '스텝1-예상결과': 'SSO 로그인 페이지로 리다이렉트',
      '스텝2-동작': 'SSO 인증 완료',
      '스텝2-예상결과': '시스템에 자동 로그인됨',
      '스텝3-동작': '',
      '스텝3-예상결과': '',
      '사후조건': 'SSO 세션 유지',
      '태그': 'SSO, 인증, 인터페이스',
    },
  ];

  const ws = XLSX.utils.json_to_sheet(data);

  // 열 너비 설정
  ws['!cols'] = [
    { wch: 18 }, // TC ID
    { wch: 25 }, // 제목
    { wch: 35 }, // 설명
    { wch: 20 }, // 요구사항 ID
    { wch: 12 }, // 우선순위
    { wch: 15 }, // 카테고리
    { wch: 25 }, // 사전조건
    { wch: 25 }, // 스텝1-동작
    { wch: 30 }, // 스텝1-예상결과
    { wch: 25 }, // 스텝2-동작
    { wch: 30 }, // 스텝2-예상결과
    { wch: 25 }, // 스텝3-동작
    { wch: 30 }, // 스텝3-예상결과
    { wch: 25 }, // 사후조건
    { wch: 20 }, // 태그
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, '테스트케이스');

  const outputPath = join(__dirname, '..', 'public', 'testcase_template.xlsx');
  XLSX.writeFile(wb, outputPath);
  console.log('✅ 테스트케이스 템플릿 생성 완료:', outputPath);
}

// 실행
console.log('📋 엑셀 템플릿 생성 중...\n');
generateRequirementTemplate();
generateTestCaseTemplate();
console.log('\n✨ 모든 템플릿 생성 완료!');
console.log('📂 위치: TestCase/public/ 폴더');
