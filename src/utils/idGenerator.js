/**
 * ID 생성 유틸리티
 * 명세서 부록 B: ID 생성 규칙
 */

/**
 * 현재 날짜를 YYYYMMDD 형식으로 반환
 */
const getDateString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
};

/**
 * 시퀀스 번호를 3자리 형식으로 변환
 */
const formatSequence = (num) => String(num).padStart(3, '0');

/**
 * 요구사항 ID 생성: REQ-YYYYMMDD-XXX
 * @param {number} sequence - 시퀀스 번호
 * @returns {string} 요구사항 ID
 */
export const generateRequirementId = (sequence = 1) => {
  return `REQ-${getDateString()}-${formatSequence(sequence)}`;
};

/**
 * 테스트케이스 ID 생성: TC-YYYYMMDD-XXX
 * @param {number} sequence - 시퀀스 번호
 * @returns {string} 테스트케이스 ID
 */
export const generateTestCaseId = (sequence = 1) => {
  return `TC-${getDateString()}-${formatSequence(sequence)}`;
};

/**
 * 실행 이력 ID 생성: EXEC-YYYYMMDD-XXX
 * @param {number} sequence - 시퀀스 번호
 * @returns {string} 실행 이력 ID
 */
export const generateExecutionId = (sequence = 1) => {
  return `EXEC-${getDateString()}-${formatSequence(sequence)}`;
};

/**
 * UUID v4 생성 (프로젝트 ID용)
 * @returns {string} UUID
 */
export const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

/**
 * 다음 시퀀스 번호 계산
 * @param {Array} items - 기존 아이템 배열
 * @param {string} prefix - ID 접두사 (REQ, TC, EXEC)
 * @returns {number} 다음 시퀀스 번호
 */
export const getNextSequence = (items, prefix) => {
  const today = getDateString();
  const todayPrefix = `${prefix}-${today}-`;

  const todayItems = items.filter(item => item.id?.startsWith(todayPrefix));

  if (todayItems.length === 0) {
    return 1;
  }

  const sequences = todayItems.map(item => {
    const parts = item.id.split('-');
    return parseInt(parts[parts.length - 1], 10);
  });

  return Math.max(...sequences) + 1;
};
