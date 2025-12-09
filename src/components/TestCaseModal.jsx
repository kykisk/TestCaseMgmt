import { useState } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import Modal from './common/Modal';
import Input from './common/Input';
import Select from './common/Select';
import Button from './common/Button';

/**
 * 테스트케이스 생성/수정 모달
 */
export default function TestCaseModal({ isOpen, onClose, onSave, selectedProject, requirements = [] }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'Medium',
    category: 'Functional',
    preconditions: '',
    steps: [{ action: '', expectedResult: '' }],
    postconditions: '',
    tags: '',
    requirementIds: [],
  });

  const priorityOptions = [
    { value: 'High', label: 'High (긴급/중요)' },
    { value: 'Medium', label: 'Medium (보통)' },
    { value: 'Low', label: 'Low (낮음)' },
  ];

  const categoryOptions = [
    { value: 'Functional', label: '기능 테스트' },
    { value: 'Integration', label: '통합 테스트' },
    { value: 'UI/UX', label: 'UI/UX 테스트' },
    { value: 'Performance', label: '성능 테스트' },
    { value: 'Security', label: '보안 테스트' },
    { value: 'Regression', label: '회귀 테스트' },
    { value: 'Other', label: '기타' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert('테스트케이스 제목을 입력해주세요.');
      return;
    }

    if (formData.steps.some(step => !step.action.trim() || !step.expectedResult.trim())) {
      alert('모든 테스트 스텝의 동작과 예상 결과를 입력해주세요.');
      return;
    }

    const tags = formData.tags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    onSave({
      ...formData,
      tags,
      projectId: selectedProject.id,
    });

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      priority: 'Medium',
      category: 'Functional',
      preconditions: '',
      steps: [{ action: '', expectedResult: '' }],
      postconditions: '',
      tags: '',
      requirementIds: [],
    });
  };

  // 요구사항 추가
  const addRequirement = (reqId) => {
    if (!formData.requirementIds.includes(reqId)) {
      setFormData({
        ...formData,
        requirementIds: [...formData.requirementIds, reqId],
      });
    }
  };

  // 요구사항 제거
  const removeRequirement = (reqId) => {
    setFormData({
      ...formData,
      requirementIds: formData.requirementIds.filter(id => id !== reqId),
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // 테스트 스텝 추가
  const addStep = () => {
    setFormData({
      ...formData,
      steps: [...formData.steps, { action: '', expectedResult: '' }],
    });
  };

  // 테스트 스텝 삭제
  const removeStep = (index) => {
    if (formData.steps.length === 1) {
      alert('최소 1개의 테스트 스텝이 필요합니다.');
      return;
    }
    const newSteps = formData.steps.filter((_, i) => i !== index);
    setFormData({ ...formData, steps: newSteps });
  };

  // 테스트 스텝 수정
  const updateStep = (index, field, value) => {
    const newSteps = [...formData.steps];
    newSteps[index][field] = value;
    setFormData({ ...formData, steps: newSteps });
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="새 테스트케이스 작성">
      <form onSubmit={handleSubmit} className="max-h-[70vh] overflow-y-auto">
        {/* 기본 정보 */}
        <div className="mb-6">
          <h4 className="font-semibold text-lg mb-3 text-gray-800">기본 정보</h4>

          <Input
            label="테스트케이스 제목"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="테스트케이스 제목을 입력하세요"
            required
          />

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              설명
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="테스트 상세 설명 (선택사항)"
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="우선순위"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              options={priorityOptions}
              required
            />

            <Select
              label="카테고리"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              options={categoryOptions}
              required
            />
          </div>
        </div>

        {/* 요구사항 연결 */}
        <div className="mb-6">
          <h4 className="font-semibold text-lg mb-3 text-gray-800">연결된 요구사항</h4>

          {requirements.length === 0 ? (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
              등록된 요구사항이 없습니다. 먼저 요구사항을 등록해주세요.
            </div>
          ) : (
            <>
              <Select
                label="요구사항 선택"
                value=""
                onChange={(e) => {
                  if (e.target.value) {
                    addRequirement(e.target.value);
                    e.target.value = ''; // 선택 초기화
                  }
                }}
                options={requirements
                  .filter(req => !formData.requirementIds.includes(req.id))
                  .map(req => ({
                    value: req.id,
                    label: `${req.id} - ${req.division} > ${req.functionalRequirement}`,
                  }))
                }
                placeholder="요구사항을 선택하세요 (복수 선택 가능)"
              />

              {/* 선택된 요구사항 배지 */}
              {formData.requirementIds.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {formData.requirementIds.map(reqId => {
                    const req = requirements.find(r => r.id === reqId);
                    return req ? (
                      <span
                        key={reqId}
                        className="inline-flex items-center px-3 py-1 bg-info text-white rounded-full text-sm"
                      >
                        <span className="mr-2">
                          {req.id} - {req.functionalRequirement}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeRequirement(reqId)}
                          className="hover:bg-indigo-700 rounded-full p-0.5"
                        >
                          <X size={14} />
                        </button>
                      </span>
                    ) : null;
                  })}
                </div>
              )}

              {formData.requirementIds.length === 0 && (
                <p className="text-sm text-gray-500 mt-2">
                  요구사항을 선택하면 추적성을 관리할 수 있습니다.
                </p>
              )}
            </>
          )}
        </div>

        {/* 사전조건 */}
        <div className="mb-6">
          <h4 className="font-semibold text-lg mb-3 text-gray-800">사전조건</h4>
          <textarea
            value={formData.preconditions}
            onChange={(e) => setFormData({ ...formData, preconditions: e.target.value })}
            placeholder="테스트 실행 전 필요한 조건 (선택사항)"
            rows={2}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        {/* 테스트 스텝 */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-lg text-gray-800">
              테스트 스텝 <span className="text-danger">*</span>
            </h4>
            <Button
              type="button"
              variant="primary"
              onClick={addStep}
              className="text-sm flex items-center space-x-1"
            >
              <Plus size={16} />
              <span>스텝 추가</span>
            </Button>
          </div>

          {formData.steps.map((step, index) => (
            <div key={index} className="mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-700">스텝 {index + 1}</span>
                {formData.steps.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeStep(index)}
                    className="text-danger hover:text-red-700"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    수행 동작 <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    value={step.action}
                    onChange={(e) => updateStep(index, 'action', e.target.value)}
                    placeholder="예: 로그인 버튼 클릭"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    예상 결과 <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    value={step.expectedResult}
                    onChange={(e) => updateStep(index, 'expectedResult', e.target.value)}
                    placeholder="예: 로그인 성공 메시지 표시"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 사후조건 */}
        <div className="mb-6">
          <h4 className="font-semibold text-lg mb-3 text-gray-800">사후조건</h4>
          <textarea
            value={formData.postconditions}
            onChange={(e) => setFormData({ ...formData, postconditions: e.target.value })}
            placeholder="테스트 완료 후 상태 (선택사항)"
            rows={2}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        {/* 태그 */}
        <div className="mb-6">
          <h4 className="font-semibold text-lg mb-3 text-gray-800">태그</h4>
          <Input
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            placeholder="태그를 쉼표로 구분하여 입력 (예: 로그인, 인증, 회원)"
          />
        </div>

        {/* 버튼 */}
        <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
          <Button type="button" variant="secondary" onClick={handleClose}>
            취소
          </Button>
          <Button type="submit" variant="primary">
            저장
          </Button>
        </div>
      </form>
    </Modal>
  );
}
