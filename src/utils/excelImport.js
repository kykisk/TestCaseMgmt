import * as XLSX from 'xlsx';

/**
 * 엑셀 파일에서 테스트케이스 가져오기
 * 명세서 섹션 2.7.4: 가져오기 기능
 */

/**
 * 엑셀 파일을 읽어서 JSON 데이터로 변환
 * @param {File} file - 엑셀 파일
 * @returns {Promise<Array>} 파싱된 테스트케이스 배열
 */
export const parseExcelFile = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        // 첫 번째 시트 읽기
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // JSON으로 변환
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
 * 테스트케이스 데이터 검증
 * @param {Array} data - 파싱된 데이터
 * @returns {Object} { valid: Array, errors: Array }
 */
export const validateTestCases = (data) => {
  const valid = [];
  const errors = [];

  data.forEach((row, index) => {
    const rowNumber = index + 2; // 엑셀 행 번호 (헤더 제외)
    const rowErrors = [];

    // 필수 필드 검증
    if (!row['제목'] || row['제목'].toString().trim() === '') {
      rowErrors.push('제목이 비어있습니다');
    }

    if (!row['우선순위']) {
      rowErrors.push('우선순위가 비어있습니다');
    } else if (!['High', 'Medium', 'Low'].includes(row['우선순위'])) {
      rowErrors.push('우선순위는 High, Medium, Low 중 하나여야 합니다');
    }

    if (!row['카테고리']) {
      rowErrors.push('카테고리가 비어있습니다');
    }

    // 테스트 스텝 검증 (최소 1개)
    const hasStep = row['스텝1-동작'] && row['스텝1-예상결과'];
    if (!hasStep) {
      rowErrors.push('최소 1개의 테스트 스텝이 필요합니다');
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
 * 엑셀 데이터를 테스트케이스 형식으로 변환
 * @param {Array} data - 검증된 엑셀 데이터
 * @param {string} projectId - 프로젝트 ID
 * @returns {Array} 테스트케이스 객체 배열
 */
export const convertExcelToTestCases = (data, projectId) => {
  return data.map((row) => {
    // 테스트 스텝 추출
    const steps = [];
    let stepNum = 1;

    while (row[`스텝${stepNum}-동작`] || row[`스텝${stepNum}-예상결과`]) {
      if (row[`스텝${stepNum}-동작`] && row[`스텝${stepNum}-예상결과`]) {
        steps.push({
          stepNumber: stepNum,
          action: row[`스텝${stepNum}-동작`].toString().trim(),
          expectedResult: row[`스텝${stepNum}-예상결과`].toString().trim(),
        });
      }
      stepNum++;
    }

    // 태그 파싱
    const tags = row['태그']
      ? row['태그']
          .toString()
          .split(',')
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0)
      : [];

    // 요구사항 ID 파싱 (쉼표로 구분)
    const requirementIds = row['요구사항 ID']
      ? row['요구사항 ID']
          .toString()
          .split(',')
          .map((id) => id.trim())
          .filter((id) => id.length > 0)
      : [];

    return {
      id: row['TC ID'] || '', // 빈 값이면 나중에 자동 생성
      projectId: projectId,
      requirementIds: requirementIds,
      title: row['제목'].toString().trim(),
      description: row['설명'] ? row['설명'].toString().trim() : '',
      priority: row['우선순위'],
      category: row['카테고리'] || 'Functional',
      preconditions: row['사전조건'] ? row['사전조건'].toString().trim() : '',
      steps: steps,
      postconditions: row['사후조건'] ? row['사후조건'].toString().trim() : '',
      status: 'Not Executed',
      tags: tags,
      attachments: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  });
};

/**
 * 중복 체크
 * @param {Array} newTestCases - 새로운 테스트케이스
 * @param {Array} existingTestCases - 기존 테스트케이스
 * @returns {Object} { duplicates: Array, unique: Array }
 */
export const checkDuplicates = (newTestCases, existingTestCases) => {
  const existingIds = new Set(existingTestCases.map(tc => tc.id));
  const duplicates = [];
  const unique = [];

  newTestCases.forEach(tc => {
    if (tc.id && existingIds.has(tc.id)) {
      duplicates.push(tc);
    } else {
      unique.push(tc);
    }
  });

  return { duplicates, unique };
};

/**
 * 엑셀 템플릿 다운로드용 데이터 생성
 * @returns {Array} 템플릿 데이터
 */
export const generateExcelTemplate = () => {
  return [
    {
      'TC ID': 'TC-20250121-001',
      '제목': '로그인 테스트',
      '설명': '사용자 로그인 기능 검증',
      '요구사항 ID': 'REQ-001, REQ-002',
      '우선순위': 'High',
      '카테고리': '기능 테스트',
      '사전조건': '회원가입 완료',
      '스텝1-동작': '아이디 입력',
      '스텝1-예상결과': '아이디 입력 가능',
      '스텝2-동작': '비밀번호 입력',
      '스텝2-예상결과': '비밀번호 입력 가능',
      '스텝3-동작': '로그인 버튼 클릭',
      '스텝3-예상결과': '로그인 성공',
      '사후조건': '메인 페이지 이동',
      '태그': '로그인, 인증',
    },
  ];
};

/**
 * 엑셀 템플릿 파일 다운로드
 */
export const downloadExcelTemplate = () => {
  const templateData = generateExcelTemplate();
  const ws = XLSX.utils.json_to_sheet(templateData);

  // 열 너비 설정
  const colWidths = [
    { wch: 15 }, // TC ID
    { wch: 20 }, // 제목
    { wch: 30 }, // 설명
    { wch: 15 }, // 요구사항 ID
    { wch: 10 }, // 우선순위
    { wch: 12 }, // 카테고리
    { wch: 20 }, // 사전조건
    { wch: 20 }, // 스텝1-동작
    { wch: 20 }, // 스텝1-예상결과
    { wch: 20 }, // 스텝2-동작
    { wch: 20 }, // 스텝2-예상결과
    { wch: 20 }, // 스텝3-동작
    { wch: 20 }, // 스텝3-예상결과
    { wch: 20 }, // 사후조건
    { wch: 15 }, // 태그
  ];
  ws['!cols'] = colWidths;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, '테스트케이스 템플릿');

  XLSX.writeFile(wb, 'testcase_template.xlsx');
};
