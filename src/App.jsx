import { useState, useEffect } from 'react';
import { Home, FileText, ListChecks, BarChart3, Plus, Trash2, Upload, Sparkles, Play } from 'lucide-react';
import ProjectModal from './components/ProjectModal';
import TestCaseModal from './components/TestCaseModal';
import ExcelImportModal from './components/ExcelImportModal';
import RequirementModal from './components/RequirementModal';
import RequirementImportModal from './components/RequirementImportModal';
import RequirementList from './components/RequirementList';
import TestCaseList from './components/TestCaseList';
import TestExecutionList from './components/TestExecutionList';
import TestExecutionDetail from './components/TestExecutionDetail';
import TestExecutionRun from './components/TestExecutionRun';
import AIGenerateModal from './components/AIGenerateModal';
import Button from './components/common/Button';
import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  getRequirements,
  createRequirement,
  updateRequirement,
  deleteRequirement,
  getTestCases,
  createTestCase,
  updateTestCase,
  deleteTestCase,
  STORAGE_KEYS,
  getEnvironmentInfo,
} from './utils/storage';
import { generateUUID, generateTestCaseId, getNextSequence } from './utils/idGenerator';
import { getCurrentTimestamp } from './utils/dateFormat';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedSuite, setSelectedSuite] = useState(null); // 테스트 수행 Suite
  const [selectedItem, setSelectedItem] = useState(null); // 테스트 수행 Item
  const [rerunType, setRerunType] = useState('all'); // 재수행 유형
  const [existingRunId, setExistingRunId] = useState(null); // 이어하기용 runId
  const [projects, setProjects] = useState([]);
  const [testCases, setTestCases] = useState([]);
  const [requirements, setRequirements] = useState([]);
  const envInfo = getEnvironmentInfo();
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isTestCaseModalOpen, setIsTestCaseModalOpen] = useState(false);
  const [isExcelImportModalOpen, setIsExcelImportModalOpen] = useState(false);
  const [isRequirementModalOpen, setIsRequirementModalOpen] = useState(false);
  const [isRequirementImportModalOpen, setIsRequirementImportModalOpen] = useState(false);
  const [isAIGenerateModalOpen, setIsAIGenerateModalOpen] = useState(false);
  const [editingRequirement, setEditingRequirement] = useState(null);

  // 환경 정보 출력
  useEffect(() => {
    console.log('==========================================');
    console.log('테스트케이스 관리 시스템');
    console.log(`모드: ${envInfo.mode.toUpperCase()}`);
    console.log(`DB Prefix: ${envInfo.prefix}`);
    console.log(`포트: ${envInfo.isDev ? '5173 (개발)' : '8090 (운영)'}`);
    console.log('==========================================');
  }, []);

  // 프로젝트 목록 로드
  useEffect(() => {
    loadProjects();
  }, []);

  // 선택된 프로젝트가 변경되면 테스트케이스와 요구사항 로드
  useEffect(() => {
    if (selectedProject) {
      loadTestCases(selectedProject.id);
      loadRequirements(selectedProject.id);
    }
  }, [selectedProject]);

  const loadProjects = async () => {
    try {
      console.log('[DEBUG] 프로젝트 로드 시작...');
      const data = await getProjects();
      console.log('[DEBUG] 프로젝트 데이터:', data);
      console.log('[DEBUG] 프로젝트 개수:', data?.length);
      setProjects(data || []);
      // 첫 번째 프로젝트 자동 선택
      if (data && data.length > 0 && !selectedProject) {
        console.log('[DEBUG] 첫 번째 프로젝트 자동 선택:', data[0]);
        setSelectedProject(data[0]);
      }
    } catch (error) {
      console.error('프로젝트 로드 실패:', error);
      setProjects([]);
    }
  };

  // 프로젝트 생성
  const handleCreateProject = async (formData) => {
    try {
      const newProject = await createProject({
        name: formData.name,
        description: formData.description,
      });

      const updatedProjects = [...projects, newProject];
      setProjects(updatedProjects);
      setSelectedProject(newProject);
      setIsProjectModalOpen(false);

      alert(`프로젝트 "${newProject.name}"가 생성되었습니다!`);
    } catch (error) {
      console.error('프로젝트 생성 실패:', error);
      alert('프로젝트 생성에 실패했습니다.');
    }
  };

  // 프로젝트 선택
  const handleSelectProject = (project) => {
    setSelectedProject(project);
  };

  // 테스트케이스 로드
  const loadTestCases = async (projectId) => {
    try {
      const data = await getTestCases(projectId);
      // 데이터 변환: requirement_ids → requirementIds
      const transformedData = (data || []).map(tc => ({
        ...tc,
        requirementIds: tc.requirement_ids || tc.requirementIds || [],
      }));
      console.log('[DEBUG] 테스트케이스 로드:', transformedData.length, '개');
      setTestCases(transformedData);
    } catch (error) {
      console.error('테스트케이스 로드 실패:', error);
      setTestCases([]);
    }
  };

  // 요구사항 로드
  const loadRequirements = async (projectId) => {
    try {
      const data = await getRequirements(projectId);
      // DB 형식을 UI 형식으로 변환
      const uiData = (data || []).map((req) => ({
        ...req,
        division: req.category || req.division,
        functionalRequirement: req.sub_category || req.functionalRequirement,
        note: req.notes || req.note,
      }));
      setRequirements(uiData);
    } catch (error) {
      console.error('요구사항 로드 실패:', error);
      setRequirements([]);
    }
  };

  // 테스트케이스 생성
  const handleCreateTestCase = async (formData) => {
    try {
      const sequence = getNextSequence(testCases, 'TC');
      const testCaseData = {
        id: generateTestCaseId(sequence),
        project_id: selectedProject.id,
        requirement_ids: formData.requirementIds || [],
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        category: formData.category,
        preconditions: formData.preconditions,
        steps: formData.steps.map((step, index) => ({
          stepNumber: index + 1,
          action: step.action,
          expectedResult: step.expectedResult,
        })),
        postconditions: formData.postconditions,
        tags: formData.tags,
      };

      const newTestCase = await createTestCase(testCaseData);
      const updatedTestCases = [...testCases, newTestCase];
      setTestCases(updatedTestCases);
      setIsTestCaseModalOpen(false);

      alert(`테스트케이스 "${newTestCase.id}"가 생성되었습니다!`);
      setCurrentView('testcases');
    } catch (error) {
      console.error('테스트케이스 생성 실패:', error);
      alert('테스트케이스 생성에 실패했습니다.');
    }
  };

  // 테스트케이스 수정
  const handleUpdateTestCase = async (formData) => {
    try {
      const testCaseData = {
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        category: formData.category,
        status: formData.status,
        preconditions: formData.preconditions,
        postconditions: formData.postconditions,
        steps: formData.steps || [],
        requirement_ids: formData.requirementIds || formData.requirement_ids || [],
      };

      await updateTestCase(formData.id, testCaseData);

      // 목록 새로고침
      await loadTestCases(selectedProject.id);
    } catch (error) {
      console.error('테스트케이스 수정 실패:', error);
      alert('테스트케이스 수정에 실패했습니다.');
    }
  };

  // 테스트케이스 삭제
  const handleDeleteTestCase = async (testCase, skipConfirm = false) => {
    if (!skipConfirm) {
      const confirmed = window.confirm(
        `테스트케이스 "${testCase.id} - ${testCase.title}"를 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`
      );

      if (!confirmed) return;
    }

    try {
      await deleteTestCase(testCase.id);
      const updatedTestCases = testCases.filter(tc => tc.id !== testCase.id);
      setTestCases(updatedTestCases);

      if (!skipConfirm) {
        alert(`테스트케이스 "${testCase.id}"가 삭제되었습니다.`);
      }
    } catch (error) {
      console.error('테스트케이스 삭제 실패:', error);
      alert('테스트케이스 삭제에 실패했습니다.');
    }
  };

  // 엑셀에서 테스트케이스 가져오기
  const handleImportFromExcel = async (importedTestCases) => {
    try {
      // 각 테스트케이스를 개별적으로 API로 생성
      for (let index = 0; index < importedTestCases.length; index++) {
        const tc = importedTestCases[index];
        const sequence = getNextSequence([...testCases], 'TC') + index;

        const testCaseData = {
          id: tc.id || generateTestCaseId(sequence),
          project_id: selectedProject.id,
          requirement_ids: tc.requirementIds || [],
          title: tc.title,
          description: tc.description,
          priority: tc.priority,
          category: tc.category,
          preconditions: tc.preconditions,
          steps: tc.steps || [],
          postconditions: tc.postconditions,
          tags: tc.tags || [],
        };

        await createTestCase(testCaseData);
      }

      // 목록 새로고침
      await loadTestCases(selectedProject.id);
      alert(`${importedTestCases.length}개의 테스트케이스를 가져왔습니다!`);
      setIsExcelImportModalOpen(false);
      setCurrentView('testcases');
    } catch (error) {
      console.error('테스트케이스 가져오기 실패:', error);
      alert('테스트케이스 가져오기에 실패했습니다: ' + error.message);
    }
  };

  // 요구사항 생성
  const handleCreateRequirement = async (formData) => {
    try {
      const requirementData = {
        id: formData.reqId,
        project_id: selectedProject.id,
        title: formData.functionalRequirement,
        description: formData.description,
        category: formData.division,
        sub_category: formData.functionalRequirement,
        priority: 'Medium',
        status: 'Draft',
        notes: formData.note,
      };

      const newRequirement = await createRequirement(requirementData);
      // DB 형식을 UI 형식으로 변환
      const uiRequirement = {
        ...newRequirement,
        division: newRequirement.category,
        functionalRequirement: newRequirement.sub_category,
        note: newRequirement.notes,
      };

      const updatedRequirements = [...requirements, uiRequirement];
      setRequirements(updatedRequirements);
      setIsRequirementModalOpen(false);

      alert(`요구사항 "${newRequirement.id}"가 등록되었습니다!`);
    } catch (error) {
      console.error('요구사항 생성 실패:', error);
      alert('요구사항 생성에 실패했습니다.');
    }
  };

  // 요구사항 삭제
  const handleDeleteRequirement = async (requirement) => {
    const confirmed = window.confirm(
      `요구사항 "${requirement.id}"를 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`
    );

    if (!confirmed) return;

    try {
      await deleteRequirement(requirement.id);
      const updatedRequirements = requirements.filter(req => req.id !== requirement.id);
      setRequirements(updatedRequirements);
      alert(`요구사항 "${requirement.id}"가 삭제되었습니다.`);
    } catch (error) {
      console.error('요구사항 삭제 실패:', error);
      alert('요구사항 삭제에 실패했습니다.');
    }
  };

  // 요구사항 수정 열기
  const handleEditRequirement = (requirement) => {
    setEditingRequirement(requirement);
    setIsRequirementModalOpen(true);
  };

  // 요구사항 수정 저장 (인라인 편집 + 모달 편집 지원)
  const handleUpdateRequirement = async (formData) => {
    try {
      const reqId = formData.reqId || (editingRequirement ? editingRequirement.id : null);

      if (!reqId) {
        throw new Error('요구사항 ID를 찾을 수 없습니다.');
      }

      const requirementData = {
        title: formData.functionalRequirement,
        description: formData.description,
        category: formData.division,
        sub_category: formData.functionalRequirement,
        priority: 'Medium',
        status: 'Draft',
        notes: formData.note,
      };

      await updateRequirement(reqId, requirementData);

      // 목록 새로고침
      await loadRequirements(selectedProject.id);

      // 모달 모드였다면 닫기
      if (editingRequirement) {
        setEditingRequirement(null);
        setIsRequirementModalOpen(false);
      }

      alert(`요구사항 "${reqId}"가 수정되었습니다!`);
    } catch (error) {
      console.error('요구사항 수정 실패:', error);
      alert('요구사항 수정에 실패했습니다: ' + error.message);
    }
  };

  // 엑셀에서 요구사항 가져오기
  const handleImportRequirementsFromExcel = async (importedRequirements) => {
    try {
      // 각 요구사항을 개별적으로 API로 생성
      for (const req of importedRequirements) {
        const requirementData = {
          id: req.id || req.reqId,
          project_id: selectedProject.id,
          title: req.functionalRequirement,
          description: req.description,
          category: req.division,
          sub_category: req.functionalRequirement,
          priority: 'Medium',
          status: 'Draft',
          notes: req.note,
        };
        await createRequirement(requirementData);
      }

      // 목록 새로고침
      await loadRequirements(selectedProject.id);
      alert(`${importedRequirements.length}개의 요구사항을 가져왔습니다!`);
      setIsRequirementImportModalOpen(false);
    } catch (error) {
      console.error('요구사항 가져오기 실패:', error);
      alert('요구사항 가져오기에 실패했습니다: ' + error.message);
    }
  };

  // AI로 테스트케이스 생성
  const handleAIGenerateTestCases = async (generatedTestCases, requirementIds = []) => {
    try {
      // 각 테스트케이스를 개별적으로 API로 생성
      for (let index = 0; index < generatedTestCases.length; index++) {
        const tc = generatedTestCases[index];
        const sequence = getNextSequence([...testCases], 'TC') + index;

        const testCaseData = {
          id: generateTestCaseId(sequence),
          project_id: selectedProject.id,
          requirement_ids: requirementIds.length > 0 ? requirementIds : (tc.requirement_ids || []),
          title: tc.title,
          description: tc.description,
          priority: tc.priority || 'Medium',
          category: tc.category || 'Functional',
          preconditions: tc.preconditions || '',
          steps: tc.steps || [],
          postconditions: tc.postconditions || '',
          tags: tc.tags || [],
        };

        await createTestCase(testCaseData);
      }

      // 목록 새로고침
      await loadTestCases(selectedProject.id);
      alert(`${generatedTestCases.length}개의 테스트케이스가 생성되었습니다!`);
      setIsAIGenerateModalOpen(false);
      setCurrentView('testcases');
    } catch (error) {
      console.error('AI 테스트케이스 생성 실패:', error);
      alert('AI 테스트케이스 생성에 실패했습니다: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-primary text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <ListChecks size={32} />
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-bold">테스트케이스 관리 시스템</h1>
                {envInfo.isDev && (
                  <span className="px-3 py-1 bg-yellow-400 text-gray-900 text-sm font-bold rounded-lg">
                    DEV
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* 프로젝트 선택 드롭다운 */}
              <select
                value={selectedProject?.id || ''}
                onChange={(e) => {
                  const project = projects.find(p => p.id === e.target.value);
                  handleSelectProject(project);
                }}
                className="px-4 py-2 bg-white text-gray-800 rounded-lg hover:bg-gray-100 transition"
              >
                <option value="">프로젝트 선택</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>

              {/* 새 프로젝트 버튼 */}
              <button
                onClick={() => setIsProjectModalOpen(true)}
                className="px-4 py-2 bg-white text-primary rounded-lg hover:bg-gray-100 transition flex items-center space-x-2"
              >
                <Plus size={18} />
                <span>새 프로젝트</span>
              </button>

              <button
                onClick={() => {
                  if (selectedProject) {
                    setIsTestCaseModalOpen(true);
                  } else {
                    alert('먼저 프로젝트를 선택해주세요.');
                  }
                }}
                disabled={!selectedProject}
                className="px-4 py-2 bg-white text-primary rounded-lg hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                새 테스트케이스
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 프로젝트 생성 모달 */}
      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onSave={handleCreateProject}
      />

      {/* 테스트케이스 생성 모달 */}
      {selectedProject && (
        <TestCaseModal
          isOpen={isTestCaseModalOpen}
          onClose={() => setIsTestCaseModalOpen(false)}
          onSave={handleCreateTestCase}
          selectedProject={selectedProject}
          requirements={requirements}
        />
      )}

      {/* 엑셀 가져오기 모달 */}
      {selectedProject && (
        <ExcelImportModal
          isOpen={isExcelImportModalOpen}
          onClose={() => setIsExcelImportModalOpen(false)}
          onImport={handleImportFromExcel}
          selectedProject={selectedProject}
        />
      )}

      {/* 요구사항 생성/수정 모달 */}
      {selectedProject && (
        <RequirementModal
          isOpen={isRequirementModalOpen}
          onClose={() => {
            setIsRequirementModalOpen(false);
            setEditingRequirement(null);
          }}
          onSave={editingRequirement ? handleUpdateRequirement : handleCreateRequirement}
          selectedProject={selectedProject}
          initialData={editingRequirement}
        />
      )}

      {/* 요구사항 엑셀 가져오기 모달 */}
      {selectedProject && (
        <RequirementImportModal
          isOpen={isRequirementImportModalOpen}
          onClose={() => setIsRequirementImportModalOpen(false)}
          onImport={handleImportRequirementsFromExcel}
          selectedProject={selectedProject}
        />
      )}

      {/* AI 테스트케이스 생성 모달 */}
      {selectedProject && (
        <AIGenerateModal
          isOpen={isAIGenerateModalOpen}
          onClose={() => setIsAIGenerateModalOpen(false)}
          onGenerate={handleAIGenerateTestCases}
          selectedProject={selectedProject}
          requirements={requirements}
        />
      )}

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar */}
          <aside className="w-64 min-w-64 flex-shrink-0 bg-white rounded-lg shadow-md p-4">
            <nav className="space-y-2">
              <button
                onClick={() => setCurrentView('dashboard')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                  currentView === 'dashboard'
                    ? 'bg-primary text-white'
                    : 'hover:bg-gray-100'
                }`}
              >
                <Home size={20} />
                <span>대시보드</span>
              </button>
              <button
                onClick={() => setCurrentView('requirements')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                  currentView === 'requirements'
                    ? 'bg-primary text-white'
                    : 'hover:bg-gray-100'
                }`}
              >
                <FileText size={20} />
                <span>요구사항</span>
              </button>
              <button
                onClick={() => setCurrentView('testcases')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                  currentView === 'testcases'
                    ? 'bg-primary text-white'
                    : 'hover:bg-gray-100'
                }`}
              >
                <ListChecks size={20} />
                <span>테스트케이스</span>
              </button>
              <button
                onClick={() => {
                  setCurrentView('test-execution');
                  setSelectedSuite(null);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                  currentView === 'test-execution'
                    ? 'bg-primary text-white'
                    : 'hover:bg-gray-100'
                }`}
              >
                <Play size={20} />
                <span>테스트 수행</span>
              </button>
              <button
                onClick={() => setCurrentView('stats')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                  currentView === 'stats'
                    ? 'bg-primary text-white'
                    : 'hover:bg-gray-100'
                }`}
              >
                <BarChart3 size={20} />
                <span>통계 및 리포트</span>
              </button>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0 bg-white rounded-lg shadow-md p-6 overflow-x-auto">
            {currentView === 'dashboard' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">대시보드</h2>

                {projects.length === 0 ? (
                  <div className="text-center py-16">
                    <ListChecks size={64} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">
                      프로젝트가 없습니다
                    </h3>
                    <p className="text-gray-500 mb-6">
                      먼저 프로젝트를 생성해주세요.
                    </p>
                    <button
                      onClick={() => setIsProjectModalOpen(true)}
                      className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-blue-600 transition inline-flex items-center space-x-2"
                    >
                      <Plus size={20} />
                      <span>새 프로젝트 생성</span>
                    </button>
                  </div>
                ) : (
                  <>
                    {selectedProject && (
                      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h3 className="font-semibold text-lg text-primary">
                          현재 프로젝트: {selectedProject.name}
                        </h3>
                        {selectedProject.description && (
                          <p className="text-gray-600 mt-1">
                            {selectedProject.description}
                          </p>
                        )}
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                        <h3 className="text-sm text-gray-600 mb-2">전체 프로젝트</h3>
                        <p className="text-3xl font-bold text-primary">{projects.length}</p>
                      </div>
                      <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
                        <h3 className="text-sm text-gray-600 mb-2">전체 요구사항</h3>
                        <p className="text-3xl font-bold text-purple-600">{requirements.length}</p>
                      </div>
                      <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                        <h3 className="text-sm text-gray-600 mb-2">전체 테스트케이스</h3>
                        <p className="text-3xl font-bold text-success">{testCases.length}</p>
                      </div>
                      <div className="bg-orange-50 p-6 rounded-lg border border-orange-200">
                        <h3 className="text-sm text-gray-600 mb-2">Pass Rate</h3>
                        <p className="text-3xl font-bold text-warning">0%</p>
                      </div>
                    </div>

                    <div className="mt-8">
                      <p className="text-gray-500 text-center py-12">
                        요구사항과 테스트케이스를 추가해보세요.
                      </p>
                    </div>
                  </>
                )}
              </div>
            )}

            {currentView === 'requirements' && (
              <RequirementList
                requirements={requirements}
                onAdd={() => {
                  setEditingRequirement(null);
                  setIsRequirementModalOpen(true);
                }}
                onImport={() => setIsRequirementImportModalOpen(true)}
                onEdit={handleEditRequirement}
                onUpdate={handleUpdateRequirement}
                onDelete={handleDeleteRequirement}
                selectedProject={selectedProject}
              />
            )}

            {currentView === 'testcases' && (
              <TestCaseList
                testCases={testCases}
                requirements={requirements}
                onAdd={() => {
                  if (selectedProject) {
                    setIsTestCaseModalOpen(true);
                  } else {
                    alert('먼저 프로젝트를 선택해주세요.');
                  }
                }}
                onImport={() => {
                  if (selectedProject) {
                    setIsExcelImportModalOpen(true);
                  } else {
                    alert('먼저 프로젝트를 선택해주세요.');
                  }
                }}
                onAIGenerate={() => {
                  if (selectedProject) {
                    setIsAIGenerateModalOpen(true);
                  } else {
                    alert('먼저 프로젝트를 선택해주세요.');
                  }
                }}
                onUpdate={handleUpdateTestCase}
                onDelete={handleDeleteTestCase}
                selectedProject={selectedProject}
              />
            )}

            {currentView === 'stats' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">통계 및 리포트</h2>
                <p className="text-gray-500">통계 및 리포트 기능이 곧 추가됩니다.</p>
              </div>
            )}

            {currentView === 'test-execution' && (
              <TestExecutionList
                selectedProject={selectedProject}
                onSelectSuite={(suite) => {
                  setSelectedSuite(suite);
                  setCurrentView('test-execution-detail');
                }}
              />
            )}

            {currentView === 'test-execution-detail' && selectedSuite && (
              <TestExecutionDetail
                suite={selectedSuite}
                requirements={requirements}
                testCases={testCases}
                onBack={() => {
                  setCurrentView('test-execution');
                  setSelectedSuite(null);
                }}
                onStartTest={(item, rerunTypeParam = 'all', runId = null) => {
                  setSelectedItem(item);
                  setRerunType(rerunTypeParam);
                  setExistingRunId(runId);
                  setCurrentView('test-execution-run');
                }}
              />
            )}

            {currentView === 'test-execution-run' && selectedItem && (
              <TestExecutionRun
                item={selectedItem}
                testCases={testCases.filter((tc) =>
                  tc.requirementIds?.some((reqId) => selectedItem.requirement_ids?.includes(reqId))
                )}
                rerunType={rerunType}
                existingRunId={existingRunId}
                onBack={() => {
                  setCurrentView('test-execution-detail');
                  setSelectedItem(null);
                  setExistingRunId(null);
                }}
                onComplete={() => {
                  setCurrentView('test-execution-detail');
                  setSelectedItem(null);
                  setExistingRunId(null);
                }}
              />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default App;
