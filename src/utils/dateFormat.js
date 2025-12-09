/**
 * 날짜 포맷팅 유틸리티
 */

/**
 * Date 객체를 YYYY-MM-DD 형식으로 변환
 * @param {Date|string|number} date - 날짜 객체 또는 타임스탬프
 * @returns {string} YYYY-MM-DD 형식의 문자열
 */
export const formatDate = (date) => {
  if (!date) return '';

  const d = new Date(date);
  if (isNaN(d.getTime())) return '';

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

/**
 * Date 객체를 YYYY-MM-DD HH:MM:SS 형식으로 변환
 * @param {Date|string|number} date - 날짜 객체 또는 타임스탬프
 * @returns {string} YYYY-MM-DD HH:MM:SS 형식의 문자열
 */
export const formatDateTime = (date) => {
  if (!date) return '';

  const d = new Date(date);
  if (isNaN(d.getTime())) return '';

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

/**
 * 상대 시간 계산 (예: "2시간 전")
 * @param {Date|string|number} date - 날짜 객체 또는 타임스탬프
 * @returns {string} 상대 시간 문자열
 */
export const formatRelativeTime = (date) => {
  if (!date) return '';

  const d = new Date(date);
  if (isNaN(d.getTime())) return '';

  const now = new Date();
  const diffMs = now - d;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return '방금 전';
  if (diffMins < 60) return `${diffMins}분 전`;
  if (diffHours < 24) return `${diffHours}시간 전`;
  if (diffDays < 7) return `${diffDays}일 전`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}주 전`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}개월 전`;
  return `${Math.floor(diffDays / 365)}년 전`;
};

/**
 * 현재 타임스탬프 반환
 * @returns {number} 현재 타임스탬프
 */
export const getCurrentTimestamp = () => {
  return Date.now();
};

/**
 * 타임스탬프를 Date 객체로 변환
 * @param {number} timestamp - 타임스탬프
 * @returns {Date} Date 객체
 */
export const timestampToDate = (timestamp) => {
  return new Date(timestamp);
};
