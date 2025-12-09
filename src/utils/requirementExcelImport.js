import * as XLSX from 'xlsx';
import { DIVISIONS, getFunctionalRequirements } from './requirementCategories';

/**
 * 요구사항 엑셀 가져오기 유틸리티
 */

/**
 * 엑셀 파일을 읽어서 JSON 데이터로 변환
 * @param {File} file - 엑셀 파일
 * @returns {Promise<Array>} 파싱된 요구사항 배열
 */
export const parseRequirementExcelFile = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        resolve(jsonData);
      } catch (error) {
        reject(new Error('엑셀 파일 읽기 실패: ' + error.message));
      }
    };

    reader.onerror = () => {
      reject(new Error('파일 읽기 오류'));
    };

    reader.readAsArrayBuffer(file);
  });
};

/**
 * 요구사항 데이터 검증
 * @param {Array} data - 파싱된 데이터
 * @returns {Object} { valid: Array, errors: Array }
 */
export const validateRequirements = (data) => {
  const valid = [];
  const errors = [];

  data.forEach((row, index) => {
    const rowNumber = index + 2;
    const rowErrors = [];

    // 필수 필드 검증
    if (!row['요구사항 ID'] || row['요구사항 ID'].toString().trim() === '') {
      rowErrors.push('요구사항 ID가 비어있습니다');
    }

    if (!row['구분'] || row['구분'].toString().trim() === '') {
      rowErrors.push('구분이 비어있습니다');
    } else if (!DIVISIONS.includes(row['구분'])) {
      rowErrors.push(`구분은 다음 중 하나여야 합니다: ${DIVISIONS.join(', ')}`);
    }

    if (!row['기능 요구사항'] || row['기능 요구사항'].toString().trim() === '') {
      rowErrors.push('기능 요구사항이 비어있습니다');
    } else if (row['구분']) {
      const validFunctionalReqs = getFunctionalRequirements(row['구분']);
      if (!validFunctionalReqs.includes(row['기능 요구사항'])) {
        rowErrors.push(`"${row['구분']}"의 기능 요구사항은 다음 중 하나여야 합니다: ${validFunctionalReqs.join(', ')}`);
      }
    }

    if (!row['설명'] || row['설명'].toString().trim() === '') {
      rowErrors.push('설명이 비어있습니다');
    }

    if (rowErrors.length > 0) {
      errors.push({
        row: rowNumber,
        data: row,
        errors: rowErrors,
      });
    } else {
      valid.push(row);
    }
  });

  return { valid, errors };
};

/**
 * 엑셀 데이터를 요구사항 형식으로 변환
 * @param {Array} data - 검증된 엑셀 데이터
 * @param {string} projectId - 프로젝트 ID
 * @returns {Array} 요구사항 객체 배열
 */
export const convertExcelToRequirements = (data, projectId) => {
  return data.map((row) => {
    return {
      id: row['요구사항 ID'].toString().trim(),
      projectId: projectId,
      division: row['구분'].toString().trim(),
      functionalRequirement: row['기능 요구사항'].toString().trim(),
      description: row['설명'].toString().trim(),
      note: row['비고'] ? row['비고'].toString().trim() : '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  });
};

/**
 * 요구사항 엑셀 템플릿 데이터 생성
 * @returns {Array} 템플릿 데이터
 */
export const generateRequirementExcelTemplate = () => {
  return [
    {
      '요구사항 ID': 'REQ-20250121-001',
      '구분': '로드맵 체계관리',
      '기능 요구사항': 'Hierarchy',
      '설명': '로드맵 계층 구조 관리 기능',
      '비고': '3단계 계층까지 지원',
    },
    {
      '요구사항 ID': 'REQ-20250121-002',
      '구분': '로드맵 운영관리',
      '기능 요구사항': '현황관리',
      '설명': '로드맵 현황 조회 및 관리',
      '비고': '실시간 업데이트 지원',
    },
    {
      '요구사항 ID': 'REQ-20250121-003',
      '구분': '관리자 기능',
      '기능 요구사항': '기준정보 관리',
      '설명': '시스템 기준 정보 설정 및 관리',
      '비고': '',
    },
    {
      '요구사항 ID': 'REQ-20250121-004',
      '구분': '인터페이스',
      '기능 요구사항': 'SSO',
      '설명': 'Single Sign-On 연동',
      '비고': 'SAML 2.0 프로토콜 사용',
    },
    {
      '요구사항 ID': 'REQ-20250121-005',
      '구분': '기타',
      '기능 요구사항': '정보검색',
      '설명': '통합 검색 기능',
      '비고': '전체 텍스트 검색 지원',
    },
  ];
};

/**
 * 요구사항 엑셀 템플릿 다운로드
 */
export const downloadRequirementExcelTemplate = () => {
  const templateData = generateRequirementExcelTemplate();
  const ws = XLSX.utils.json_to_sheet(templateData);

  // 열 너비 설정
  ws['!cols'] = [
    { wch: 20 }, // 요구사항 ID
    { wch: 20 }, // 구분
    { wch: 25 }, // 기능 요구사항
    { wch: 40 }, // 설명
    { wch: 30 }, // 비고
  ];

  // 헤더 스타일
  const range = XLSX.utils.decode_range(ws['!ref']);
  for (let C = range.s.c; C <= range.e.c; ++C) {
    const address = XLSX.utils.encode_col(C) + '1';
    if (!ws[address]) continue;
    ws[address].s = {
      font: { bold: true },
      fill: { fgColor: { rgb: 'E0E0E0' } },
    };
  }

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, '요구사항');

  XLSX.writeFile(wb, 'requirement_template.xlsx');
};
