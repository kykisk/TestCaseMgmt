import { useState, useEffect } from 'react';
import { X, Edit, Save, Plus, Trash2 } from 'lucide-react';
import Modal from './common/Modal';
import Button from './common/Button';
import Input from './common/Input';
import RequirementSelectModal from './RequirementSelectModal';

/**
 * 테스트케이스 상세 보기/편집 모달
 */
export default function TestCaseDetailModal({ isOpen, onClose, testCase, requirements, onSave }) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [editData, setEditData] = useState({});
  const [isReqSelectModalOpen, setIsReqSelectModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('info'); // 'info' | 'history'
  const [executionHistory, setExecutionHistory] = useState([]);

  useEffect(() => {
    if (testCase) {
      setEditData({
        title: testCase.title || '',
        description: testCase.description || '',
        priority: testCase.priority || 'Medium',
        category: testCase.category || 'Functional',
        status: testCase.status || 'Not Started',
        preconditions: testCase.preconditions || '',
        postconditions: testCase.postconditions || '',
        requirementIds: testCase.requirementIds || [],
        steps: testCase.steps || [],
      });
      setIsEditMode(false);
      setActiveTab('info');
      loadExecutionHistory();
    }
  }, [testCase]);

  const loadExecutionHistory = async () => {
    if (!testCase) return;

    try {
      const response = await fetch(`/api/testcases/${testCase.id}/execution-history`);
      const data = await response.json();
      setExecutionHistory(data || []);
    } catch (error) {
      console.error('수행 이력 로드 실패:', error);
      setExecutionHistory([]);
    }
  };

  // 스텝 추가
  const handleAddStep = () => {
    const newStep = {
      stepNumber: (editData.steps?.length || 0) + 1,
      action: '',
      expectedResult: '',
    };
    setEditData({
      ...editData,
      steps: [...(editData.steps || []), newStep],
    });
  };

  // 스텝 삭제
  const handleDeleteStep = (index) => {
    const newSteps = editData.steps.filter((_, idx) => idx !== index);
    // 스텝 번호 재정렬
    const reorderedSteps = newSteps.map((step, idx) => ({
      ...step,
      stepNumber: idx + 1,
    }));
    setEditData({
      ...editData,
      steps: reorderedSteps,
    });
  };

  // 스텝 수정
  const handleStepChange = (index, field, value) => {
    const newSteps = [...editData.steps];
    newSteps[index] = {
      ...newSteps[index],
      [field]: value,
    };
    setEditData({
      ...editData,
      steps: newSteps,
    });
  };

  if (!testCase) return null;

  const handleSave = async () => {
    if (!editData.title.trim()) {
      alert('제목을 입력해주세요.');
      return;
    }

    try {
      await onSave({
        id: testCase.id,
        ...editData,
      });
      alert('저장되었습니다.');
      setIsEditMode(false);
    } catch (error) {
      console.error('저장 실패:', error);
      alert('저장에 실패했습니다.');
    }
  };

  const handleCancel = () => {
    setEditData({
      title: testCase.title || '',
      description: testCase.description || '',
      priority: testCase.priority || 'Medium',
      category: testCase.category || 'Functional',
      status: testCase.status || 'Not Started',
      preconditions: testCase.preconditions || '',
      postconditions: testCase.postconditions || '',
      requirementIds: testCase.requirementIds || [],
      steps: testCase.steps || [],
    });
    setIsEditMode(false);
  };

  const getPriorityBadge = (priority) => {
    const styles = {
      'High': 'bg-red-100 text-red-800',
      'Medium': 'bg-yellow-100 text-yellow-800',
      'Low': 'bg-green-100 text-green-800',
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[priority] || styles['Medium']}`}>
        {priority}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    return (
      <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        {status}
      </span>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-4xl">
      <div className="p-6">
        {/* 요구사항 선택 모달 */}
        <RequirementSelectModal
          isOpen={isReqSelectModalOpen}
          onClose={() => setIsReqSelectModalOpen(false)}
          onSave={(selectedIds) => {
            setEditData({ ...editData, requirementIds: selectedIds });
            setIsReqSelectModalOpen(false);
          }}
          requirements={requirements}
          selectedIds={editData.requirementIds || []}
        />

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{testCase.id}</h2>
            {isEditMode ? (
              <Input
                value={editData.title}
                onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                placeholder="제목"
                className="text-xl"
              />
            ) : (
              <h3 className="text-xl text-gray-700">{testCase.title}</h3>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {isEditMode ? (
              <>
                <Button
                  onClick={handleSave}
                  variant="primary"
                  className="flex items-center space-x-2"
                >
                  <Save size={18} />
                  <span>저장</span>
                </Button>
                <Button
                  onClick={handleCancel}
                  variant="secondary"
                  className="flex items-center space-x-2"
                >
                  <X size={18} />
                  <span>취소</span>
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={() => setIsEditMode(true)}
                  variant="secondary"
                  className="flex items-center space-x-2"
                >
                  <Edit size={18} />
                  <span>편집</span>
                </Button>
                <Button
                  onClick={onClose}
                  variant="secondary"
                  className="flex items-center space-x-2"
                >
                  <X size={18} />
                  <span>닫기</span>
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-6 border-b">
          <button
            onClick={() => setActiveTab('info')}
            className={`px-6 py-3 font-medium transition ${
              activeTab === 'info'
                ? 'border-b-2 border-primary text-primary'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            상세 정보
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-6 py-3 font-medium transition flex items-center space-x-2 ${
              activeTab === 'history'
                ? 'border-b-2 border-primary text-primary'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <span>테스트 수행 이력</span>
            {executionHistory.length > 0 && (
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                {executionHistory.length}
              </span>
            )}
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'info' ? (
          <>
            {/* Badges / Edit Fields */}
        {isEditMode ? (
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">우선순위</label>
              <select
                value={editData.priority}
                onChange={(e) => setEditData({ ...editData, priority: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">카테고리</label>
              <select
                value={editData.category}
                onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="Functional">Functional</option>
                <option value="Integration">Integration</option>
                <option value="UI">UI</option>
                <option value="API">API</option>
                <option value="Performance">Performance</option>
                <option value="Security">Security</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">상태</label>
              <select
                value={editData.status}
                onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="Not Started">Not Started</option>
                <option value="In Progress">In Progress</option>
                <option value="Pass">Pass</option>
                <option value="Fail">Fail</option>
              </select>
            </div>
          </div>
        ) : (
          <div className="flex items-center space-x-3 mb-6">
            {getPriorityBadge(testCase.priority)}
            {getStatusBadge(testCase.status)}
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
              {testCase.category}
            </span>
          </div>
        )}

        {/* Description */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 mb-2">설명</h4>
          {isEditMode ? (
            <textarea
              value={editData.description}
              onChange={(e) => setEditData({ ...editData, description: e.target.value })}
              placeholder="설명을 입력하세요"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              rows="4"
            />
          ) : (
            testCase.description ? (
              <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{testCase.description}</p>
            ) : (
              <p className="text-gray-400">설명 없음</p>
            )
          )}
        </div>

        {/* Linked Requirements */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 mb-2">연결된 요구사항</h4>
          {isEditMode ? (
            <button
              onClick={() => setIsReqSelectModalOpen(true)}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              <Edit size={16} className="text-blue-600" />
              <span className="text-sm text-gray-700">
                {editData.requirementIds?.length > 0
                  ? `${editData.requirementIds.length}개 선택됨`
                  : '요구사항 선택'}
              </span>
            </button>
          ) : null}
          {(isEditMode ? editData.requirementIds : testCase.requirementIds)?.length > 0 && (
            <div className="space-y-2 mt-3">
              {(isEditMode ? editData.requirementIds : testCase.requirementIds).map((reqId) => {
                const req = requirements.find((r) => r.id === reqId);
                return (
                  <div key={reqId} className="flex items-center space-x-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <span className="font-semibold text-info">{reqId}</span>
                    {req && (
                      <>
                        <span className="text-gray-400">-</span>
                        <span className="text-gray-700">{req.functionalRequirement || req.title}</span>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Preconditions */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 mb-2">사전 조건</h4>
          {isEditMode ? (
            <textarea
              value={editData.preconditions}
              onChange={(e) => setEditData({ ...editData, preconditions: e.target.value })}
              placeholder="사전 조건을 입력하세요"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              rows="3"
            />
          ) : (
            testCase.preconditions ? (
              <p className="text-gray-700 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                {testCase.preconditions}
              </p>
            ) : (
              <p className="text-gray-400">사전 조건 없음</p>
            )
          )}
        </div>

        {/* Test Steps */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-gray-900">테스트 스텝</h4>
            {isEditMode && (
              <Button
                onClick={handleAddStep}
                variant="secondary"
                className="flex items-center space-x-1 text-xs py-1 px-3"
              >
                <Plus size={14} />
                <span>스텝 추가</span>
              </Button>
            )}
          </div>
          <div className="space-y-4">
            {isEditMode ? (
              editData.steps && editData.steps.length > 0 ? (
                editData.steps.map((step, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-lg p-4 bg-blue-50">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-semibold">
                        {step.stepNumber || idx + 1}
                      </div>
                      <div className="flex-1 space-y-3">
                        <div>
                          <label className="text-xs text-gray-600 uppercase font-medium block mb-1">액션</label>
                          <textarea
                            value={step.action || ''}
                            onChange={(e) => handleStepChange(idx, 'action', e.target.value)}
                            placeholder="수행할 액션을 입력하세요"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none"
                            rows="2"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-600 uppercase font-medium block mb-1">예상 결과</label>
                          <textarea
                            value={step.expectedResult || step.expected_result || ''}
                            onChange={(e) => handleStepChange(idx, 'expectedResult', e.target.value)}
                            placeholder="예상 결과를 입력하세요"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none"
                            rows="2"
                          />
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteStep(idx)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="스텝 삭제"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg">
                  <p className="text-gray-500 mb-3">테스트 스텝이 없습니다.</p>
                  <Button
                    onClick={handleAddStep}
                    variant="secondary"
                    className="inline-flex items-center space-x-2 text-sm"
                  >
                    <Plus size={16} />
                    <span>첫 스텝 추가</span>
                  </Button>
                </div>
              )
            ) : (
              testCase.steps && testCase.steps.length > 0 ? (
                testCase.steps.map((step, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-semibold">
                        {step.stepNumber || step.step_number || idx + 1}
                      </div>
                      <div className="flex-1">
                        <div className="mb-3">
                          <span className="text-xs text-gray-500 uppercase font-medium block mb-1">액션</span>
                          <p className="text-gray-900">{step.action}</p>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500 uppercase font-medium block mb-1">예상 결과</span>
                          <p className="text-gray-700 bg-green-50 p-2 rounded">
                            {step.expectedResult || step.expected_result}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">테스트 스텝이 없습니다.</p>
              )
            )}
          </div>
        </div>

        {/* Postconditions */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 mb-2">사후 조건</h4>
          {isEditMode ? (
            <textarea
              value={editData.postconditions}
              onChange={(e) => setEditData({ ...editData, postconditions: e.target.value })}
              placeholder="사후 조건을 입력하세요"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              rows="3"
            />
          ) : (
            testCase.postconditions ? (
              <p className="text-gray-700 bg-purple-50 p-4 rounded-lg border border-purple-200">
                {testCase.postconditions}
              </p>
            ) : (
              <p className="text-gray-400">사후 조건 없음</p>
            )
          )}
        </div>

        {/* Tags */}
        {testCase.tags && testCase.tags.length > 0 && (
          <div className="mb-6">
            <h4 className="font-semibold text-gray-900 mb-2">태그</h4>
            <div className="flex flex-wrap gap-2">
              {testCase.tags.map((tag, idx) => (
                <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}
          </>
        ) : (
          /* 히스토리 탭 */
          <div>
            {executionHistory.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-gray-500">아직 테스트 수행 이력이 없습니다.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {executionHistory.map((history, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">{history.suite_name}</h4>
                        <p className="text-sm text-gray-600 mb-1">{history.item_name}</p>
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <span>{history.run_number}차 수행</span>
                          <span>•</span>
                          <span>{new Date(history.started_at).toLocaleString('ko-KR')}</span>
                        </div>
                      </div>
                      <div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          history.result === 'Pass' ? 'bg-green-100 text-green-800' :
                          history.result === 'Fail' ? 'bg-red-100 text-red-800' :
                          history.result === 'Block' ? 'bg-orange-100 text-orange-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {history.result}
                        </span>
                      </div>
                    </div>

                    {/* 스텝별 결과 */}
                    {history.step_results && history.step_results.length > 0 && (
                      <div className="mb-2">
                        <p className="text-xs text-gray-500 mb-2">스텝별 결과:</p>
                        <div className="flex flex-wrap gap-2">
                          {history.step_results.map((sr, sidx) => (
                            <span
                              key={sidx}
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                sr.result === 'Pass' ? 'bg-green-100 text-green-700' :
                                sr.result === 'Fail' ? 'bg-red-100 text-red-700' :
                                sr.result === 'Block' ? 'bg-orange-100 text-orange-700' :
                                'bg-gray-100 text-gray-700'
                              }`}
                              title={sr.notes || ''}
                            >
                              Step {sr.stepNumber}: {sr.result}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 비고 */}
                    {history.notes && (
                      <div className="pt-3 border-t">
                        <p className="text-xs text-gray-500 mb-1">비고:</p>
                        <p className="text-sm text-gray-700">{history.notes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </Modal>
  );
}
