/**
 * Storage API 클라이언트
 * PostgreSQL 백엔드 API를 호출하는 스토리지 유틸리티
 */

// API Base URL
const API_BASE_URL = '/api';

/**
 * Fetch wrapper with error handling
 */
async function fetchAPI(url, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API Error [${url}]:`, error);
    throw error;
  }
}

/**
 * 환경별 prefix 반환 (기존 호환성 유지)
 */
const getEnvPrefix = () => {
  const isDev = import.meta.env.DEV;
  return isDev ? 'dev_' : 'prod_';
};

/**
 * 환경 정보 반환
 */
export const getEnvironmentInfo = () => {
  const isDev = import.meta.env.DEV;
  return {
    mode: isDev ? 'development' : 'production',
    prefix: getEnvPrefix(),
    isDev,
  };
};

/**
 * Storage Keys 정의 (기존 인터페이스 유지)
 */
export const STORAGE_KEYS = {
  PROJECTS_LIST: 'projects:list',
  PROJECT: (id) => `project:${id}`,
  REQUIREMENTS: (projectId) => `requirements:${projectId}`,
  REQUIREMENT: (id) => `requirement:${id}`,
  TESTCASES: (projectId) => `testcases:${projectId}`,
  TESTCASE: (id) => `testcase:${id}`,
  EXECUTIONS: (testcaseId) => `executions:${testcaseId}`,
  STATS: (projectId) => `stats:${projectId}`,
  RTM: (projectId) => `rtm:${projectId}`,
};

// ============================================
// Projects API
// ============================================

export const getProjects = async () => {
  return await fetchAPI('/projects');
};

export const getProject = async (id) => {
  return await fetchAPI(`/projects/${id}`);
};

export const createProject = async (data) => {
  return await fetchAPI('/projects', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const updateProject = async (id, data) => {
  return await fetchAPI(`/projects/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const deleteProject = async (id) => {
  return await fetchAPI(`/projects/${id}`, {
    method: 'DELETE',
  });
};

// ============================================
// Requirements API
// ============================================

export const getRequirements = async (projectId) => {
  return await fetchAPI(`/requirements/project/${projectId}`);
};

export const getRequirement = async (id) => {
  return await fetchAPI(`/requirements/${id}`);
};

export const createRequirement = async (data) => {
  return await fetchAPI('/requirements', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const updateRequirement = async (id, data) => {
  return await fetchAPI(`/requirements/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const deleteRequirement = async (id) => {
  return await fetchAPI(`/requirements/${id}`, {
    method: 'DELETE',
  });
};

// ============================================
// Test Cases API
// ============================================

export const getTestCases = async (projectId) => {
  return await fetchAPI(`/testcases/project/${projectId}`);
};

export const getTestCase = async (id) => {
  return await fetchAPI(`/testcases/${id}`);
};

export const createTestCase = async (data) => {
  return await fetchAPI('/testcases', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const updateTestCase = async (id, data) => {
  return await fetchAPI(`/testcases/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const deleteTestCase = async (id) => {
  return await fetchAPI(`/testcases/${id}`, {
    method: 'DELETE',
  });
};

// ============================================
// Statistics API
// ============================================

export const getProjectStatistics = async (projectId) => {
  return await fetchAPI(`/statistics/project/${projectId}`);
};

export const getOverallStatistics = async () => {
  return await fetchAPI('/statistics/overall');
};

// ============================================
// Legacy localStorage-style interface (기존 호환성)
// ============================================

/**
 * setItem - 기존 인터페이스 호환
 * key에 따라 적절한 API 호출로 변환
 */
export const setItem = async (key, value) => {
  try {
    // projects:list
    if (key === STORAGE_KEYS.PROJECTS_LIST) {
      // 프로젝트 목록은 개별 API로 생성/수정
      console.warn('setItem for projects:list - use createProject/updateProject instead');
      return true;
    }

    // project:id
    if (key.startsWith('project:')) {
      const id = key.split(':')[1];
      if (value.id) {
        // 업데이트
        await updateProject(id, value);
      } else {
        // 생성
        await createProject(value);
      }
      return true;
    }

    // requirements:projectId
    if (key.startsWith('requirements:')) {
      console.warn('setItem for requirements - use createRequirement/updateRequirement instead');
      return true;
    }

    // testcases:projectId
    if (key.startsWith('testcases:')) {
      console.warn('setItem for testcases - use createTestCase/updateTestCase instead');
      return true;
    }

    console.warn(`Unknown key pattern: ${key}`);
    return false;
  } catch (error) {
    console.error('Storage setItem error:', error);
    return false;
  }
};

/**
 * getItem - 기존 인터페이스 호환
 */
export const getItem = async (key) => {
  try {
    // projects:list
    if (key === STORAGE_KEYS.PROJECTS_LIST) {
      return await getProjects();
    }

    // project:id
    if (key.startsWith('project:')) {
      const id = key.split(':')[1];
      return await getProject(id);
    }

    // requirements:projectId
    if (key.startsWith('requirements:')) {
      const projectId = key.split(':')[1];
      return await getRequirements(projectId);
    }

    // requirement:id
    if (key.startsWith('requirement:') && !key.includes('requirements:')) {
      const id = key.split(':')[1];
      return await getRequirement(id);
    }

    // testcases:projectId
    if (key.startsWith('testcases:')) {
      const projectId = key.split(':')[1];
      return await getTestCases(projectId);
    }

    // testcase:id
    if (key.startsWith('testcase:') && !key.includes('testcases:')) {
      const id = key.split(':')[1];
      return await getTestCase(id);
    }

    // stats:projectId
    if (key.startsWith('stats:')) {
      const projectId = key.split(':')[1];
      return await getProjectStatistics(projectId);
    }

    console.warn(`Unknown key pattern: ${key}`);
    return null;
  } catch (error) {
    console.error('Storage getItem error:', error);
    return null;
  }
};

/**
 * removeItem - 기존 인터페이스 호환
 */
export const removeItem = async (key) => {
  try {
    // project:id
    if (key.startsWith('project:')) {
      const id = key.split(':')[1];
      await deleteProject(id);
      return true;
    }

    // requirement:id
    if (key.startsWith('requirement:')) {
      const id = key.split(':')[1];
      await deleteRequirement(id);
      return true;
    }

    // testcase:id
    if (key.startsWith('testcase:')) {
      const id = key.split(':')[1];
      await deleteTestCase(id);
      return true;
    }

    console.warn(`Unknown key pattern: ${key}`);
    return false;
  } catch (error) {
    console.error('Storage removeItem error:', error);
    return false;
  }
};

/**
 * listKeys - 기존 인터페이스 호환
 */
export const listKeys = async (prefix = '') => {
  try {
    // 프로젝트 관련
    if (prefix === 'projects:' || prefix === 'project:') {
      const projects = await getProjects();
      return projects.map((p) => `project:${p.id}`);
    }

    // 요구사항 관련
    if (prefix === 'requirements:' || prefix === 'requirement:') {
      // 전체 프로젝트의 요구사항을 가져올 수 없으므로 빈 배열 반환
      console.warn('listKeys for requirements requires projectId');
      return [];
    }

    // 테스트케이스 관련
    if (prefix === 'testcases:' || prefix === 'testcase:') {
      console.warn('listKeys for testcases requires projectId');
      return [];
    }

    return [];
  } catch (error) {
    console.error('Storage listKeys error:', error);
    return [];
  }
};

/**
 * clear - 전체 삭제 (사용 안 함)
 */
export const clear = async () => {
  console.warn('clear() is not supported in API mode');
  return false;
};

/**
 * exportAll - 전체 데이터 내보내기
 */
export const exportAll = async () => {
  try {
    const projects = await getProjects();
    const data = {
      projects: projects,
      requirements: {},
      testcases: {},
    };

    // 각 프로젝트의 요구사항과 테스트케이스
    for (const project of projects) {
      data.requirements[project.id] = await getRequirements(project.id);
      data.testcases[project.id] = await getTestCases(project.id);
    }

    return data;
  } catch (error) {
    console.error('Storage exportAll error:', error);
    return {};
  }
};

/**
 * importAll - 전체 데이터 가져오기 (제한적 지원)
 */
export const importAll = async (data) => {
  console.warn('importAll() has limited support in API mode');
  console.log('Use Excel import or API endpoints for bulk data import');
  return false;
};
