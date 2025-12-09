/**
 * 요구사항 커버리지 계산 유틸리티
 */

/**
 * 요구사항별 연결된 테스트케이스 수 계산
 * @param {Array} requirements - 요구사항 목록
 * @param {Array} testCases - 테스트케이스 목록
 * @returns {Object} 요구사항 ID를 키로 하는 TC 수 맵
 */
export const calculateRequirementTestCaseCount = (requirements, testCases) => {
  const countMap = {};

  requirements.forEach(req => {
    countMap[req.id] = 0;
  });

  testCases.forEach(tc => {
    if (tc.requirementIds && Array.isArray(tc.requirementIds)) {
      tc.requirementIds.forEach(reqId => {
        if (countMap[reqId] !== undefined) {
          countMap[reqId]++;
        }
      });
    }
  });

  return countMap;
};

/**
 * 전체 요구사항 커버리지 비율 계산
 * @param {Array} requirements - 요구사항 목록
 * @param {Object} countMap - 요구사항별 TC 수 맵
 * @returns {number} 커버리지 비율 (0-100)
 */
export const calculateOverallCoverage = (requirements, countMap) => {
  if (!requirements || requirements.length === 0) return 0;

  const coveredCount = Object.values(countMap).filter(count => count > 0).length;
  return Math.round((coveredCount / requirements.length) * 100);
};

/**
 * 요구사항 커버리지 상태 계산
 * @param {number} testCaseCount - 연결된 테스트케이스 수
 * @returns {string} 커버리지 상태 ('Full', 'None')
 */
export const getCoverageStatus = (testCaseCount) => {
  if (testCaseCount === 0) return 'None';
  return 'Full';
};

/**
 * 테스트 실행 통계 계산
 * @param {Array} testCases - 테스트케이스 목록
 * @returns {Object} 실행 통계
 */
export const calculateExecutionStats = (testCases) => {
  const stats = {
    total: testCases.length,
    notExecuted: 0,
    pass: 0,
    fail: 0,
    blocked: 0,
    inProgress: 0,
  };

  testCases.forEach(tc => {
    const status = tc.status || 'Not Executed';
    switch (status) {
      case 'Pass':
        stats.pass++;
        break;
      case 'Fail':
        stats.fail++;
        break;
      case 'Blocked':
        stats.blocked++;
        break;
      case 'In Progress':
        stats.inProgress++;
        break;
      default:
        stats.notExecuted++;
    }
  });

  return stats;
};

/**
 * Pass Rate 계산
 * @param {Object} stats - 실행 통계
 * @returns {number} Pass Rate (0-100)
 */
export const calculatePassRate = (stats) => {
  const executed = stats.pass + stats.fail + stats.blocked;
  if (executed === 0) return 0;
  return Math.round((stats.pass / executed) * 100);
};

/**
 * 요구사항 추적성 매트릭스 (RTM) 데이터 생성
 * @param {Array} requirements - 요구사항 목록
 * @param {Array} testCases - 테스트케이스 목록
 * @returns {Array} RTM 데이터
 */
export const generateRTM = (requirements, testCases) => {
  const countMap = calculateRequirementTestCaseCount(requirements, testCases);

  return requirements.map(req => {
    // 해당 요구사항과 연결된 테스트케이스들
    const linkedTCs = testCases.filter(tc =>
      tc.requirementIds && tc.requirementIds.includes(req.id)
    );

    // 실행 완료된 TC 수
    const executedCount = linkedTCs.filter(tc =>
      tc.status && tc.status !== 'Not Executed'
    ).length;

    // Pass된 TC 수
    const passCount = linkedTCs.filter(tc => tc.status === 'Pass').length;

    // Fail된 TC 수
    const failCount = linkedTCs.filter(tc => tc.status === 'Fail').length;

    return {
      requirementId: req.id,
      requirementTitle: req.title,
      linkedTestCases: linkedTCs.map(tc => tc.id),
      testCaseCount: countMap[req.id],
      executedCount,
      passCount,
      failCount,
      coverageStatus: getCoverageStatus(countMap[req.id]),
    };
  });
};
