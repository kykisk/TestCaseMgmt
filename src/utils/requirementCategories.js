/**
 * 요구사항 카테고리 데이터
 * 구분과 기능요구사항의 Cascading 관계 정의
 */

export const REQUIREMENT_CATEGORIES = {
  '로드맵 체계관리': ['Hierarchy', '구성요소관리', '연계관리'],
  '로드맵 운영관리': ['현황관리', 'Diagram', '아이템 리스트', '변경점분석', '마감', '발행', 'Report'],
  '관리자 기능': ['기준정보 관리', '결재관리', '공지사항/게시판 관리'],
  '인터페이스': ['IAM', 'SSO', 'Knox결재', 'Knox메일'],
  '기타': ['정보검색', '즐겨찾기', '도움말/FAQ'],
};

/**
 * 구분 목록 (순서대로)
 */
export const DIVISIONS = [
  '로드맵 체계관리',
  '로드맵 운영관리',
  '관리자 기능',
  '인터페이스',
  '기타',
];

/**
 * 구분에 따른 기능요구사항 목록 반환
 * @param {string} division - 구분값
 * @returns {Array<string>} 기능요구사항 목록
 */
export const getFunctionalRequirements = (division) => {
  return REQUIREMENT_CATEGORIES[division] || [];
};

/**
 * 모든 기능요구사항 목록 반환 (중복 제거)
 * @returns {Array<string>} 전체 기능요구사항 목록
 */
export const getAllFunctionalRequirements = () => {
  const allRequirements = new Set();
  Object.values(REQUIREMENT_CATEGORIES).forEach(requirements => {
    requirements.forEach(req => allRequirements.add(req));
  });
  return Array.from(allRequirements).sort();
};
