import { useState } from 'react';
import { Sparkles, X, Loader2, FileText } from 'lucide-react';
import Modal from './common/Modal';
import Input from './common/Input';
import Button from './common/Button';

/**
 * AI 테스트케이스 자동 생성 모달
 */
export default function AIGenerateModal({ isOpen, onClose, onGenerate, selectedProject, requirements = [] }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirementIds: [],
    category: 'Functional', // 기본값
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const categoryOptions = [
    { value: 'Functional', label: '기능 테스트 (Functional)', description: '기능의 정상/비정상 동작을 검증' },
    { value: 'Integration', label: '통합 테스트 (Integration)', description: '여러 모듈 간의 연동을 검증' },
    { value: 'UI', label: 'UI 테스트', description: 'UI 요소와 사용자 경험을 검증' },
    { value: 'API', label: 'API 테스트', description: 'API 엔드포인트와 응답을 검증' },
    { value: 'Performance', label: '성능 테스트 (Performance)', description: '속도, 응답시간, 부하를 검증' },
    { value: 'Security', label: '보안 테스트 (Security)', description: '보안 취약점과 권한을 검증' },
  ];

  // 구조화된 템플릿
  const TEMPLATE = `## 기능 개요
[이 기능이 무엇을 하는지 간단히 설명]

## 입력 데이터
- [입력 필드 1]: [설명]
- [입력 필드 2]: [설명]

## 출력/결과
- 성공 시: [예상 결과]
- 실패 시: [예상 결과]

## 비즈니스 규칙 및 제약사항
- [규칙 1]
- [규칙 2]
- [규칙 3]

## 예외 상황
- [예외 케이스 1]
- [예외 케이스 2]

## 경계값/특수 케이스
- [경계값 1]
- [특수 상황 1]`;

  // 템플릿 적용
  const handleApplyTemplate = () => {
    setFormData(prev => ({
      ...prev,
      description: TEMPLATE,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert('기능 제목을 입력해주세요.');
      return;
    }

    if (!formData.description.trim()) {
      alert('기능 설명을 입력해주세요.');
      return;
    }

    setIsGenerating(true);

    try {
      // Call backend API to generate testcases
      const response = await fetch('/api/testcases/generate-from-ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          projectId: selectedProject.id,
          requirementIds: formData.requirementIds,
          category: formData.category,
        }),
      });

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const error = await response.json();
          errorMessage = error.details || error.error || errorMessage;
        } catch (e) {
          console.error('Failed to parse error response:', e);
        }
        throw new Error(errorMessage);
      }

      let result;
      try {
        result = await response.json();
      } catch (e) {
        console.error('Failed to parse JSON response:', e);
        throw new Error('서버 응답을 파싱할 수 없습니다. 백엔드 로그를 확인하세요.');
      }

      // Call parent callback with generated testcases (요구사항 ID 포함)
      onGenerate(result.testcases, formData.requirementIds);

      // Reset form
      setFormData({ title: '', description: '', requirementIds: [], category: 'Functional' });
      alert(result.message);
    } catch (error) {
      console.error('AI generation error:', error);
      alert(`테스트케이스 생성 실패: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-3xl">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Sparkles className="text-purple-600" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">AI 테스트케이스 자동 생성</h2>
              <p className="text-sm text-gray-500">기능 설명만으로 여러 개의 테스트케이스를 자동 생성합니다</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
            disabled={isGenerating}
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Project Info */}
          {selectedProject && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-gray-600">
                프로젝트: <span className="font-semibold text-primary">{selectedProject.name}</span>
              </p>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              기능 제목 <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="예: 사용자 로그인 기능"
              disabled={isGenerating}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              테스트하고자 하는 기능의 제목을 입력하세요
            </p>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              테스트 카테고리 <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
              disabled={isGenerating}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              {categoryOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              {categoryOptions.find(o => o.value === formData.category)?.description}
            </p>
          </div>

          {/* Description */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                기능 설명 <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={handleApplyTemplate}
                disabled={isGenerating}
                className="text-sm text-purple-600 hover:text-purple-800 font-medium flex items-center space-x-1 px-3 py-1 rounded-lg hover:bg-purple-50 transition disabled:opacity-50"
              >
                <FileText size={16} />
                <span>구조화된 템플릿 사용</span>
              </button>
            </div>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="예: 사용자가 이메일과 비밀번호를 입력하여 로그인합니다. 로그인 성공 시 메인 페이지로 이동하고, 실패 시 에러 메시지를 표시합니다. 비밀번호는 최소 8자 이상이어야 하며, 5회 이상 실패 시 계정이 잠깁니다.

또는 '구조화된 템플릿 사용' 버튼을 클릭하여 더 상세한 입력 가이드를 사용하세요."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none font-mono text-sm"
              rows="12"
              disabled={isGenerating}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              💡 자유 형식으로 작성하거나, 구조화된 템플릿을 사용하여 더 정확한 테스트케이스를 생성할 수 있습니다
            </p>
          </div>

          {/* Requirements Selection */}
          {requirements.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                연결할 요구사항 (선택)
              </label>
              <div className="border border-gray-300 rounded-lg p-4 max-h-48 overflow-y-auto">
                {requirements.map((req) => (
                  <label key={req.id} className="flex items-center space-x-2 py-2 hover:bg-gray-50 px-2 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.requirementIds.includes(req.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          handleChange('requirementIds', [...formData.requirementIds, req.id]);
                        } else {
                          handleChange('requirementIds', formData.requirementIds.filter(id => id !== req.id));
                        }
                      }}
                      disabled={isGenerating}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700">
                      <span className="font-medium text-info">{req.id}</span> - {req.functionalRequirement || req.title}
                    </span>
                  </label>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                생성된 모든 테스트케이스에 선택한 요구사항이 자동으로 연결됩니다
              </p>
            </div>
          )}

          {/* Info Box */}
          <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <p className="text-sm text-purple-800 font-medium mb-2">💡 AI가 자동으로 생성하는 것들:</p>
            <ul className="text-sm text-purple-700 space-y-1 list-disc list-inside">
              <li>정상 동작 케이스 (Happy Path)</li>
              <li>예외 처리 케이스 (Error Cases)</li>
              <li>경계값 테스트 (Boundary Tests)</li>
              <li>부정적인 케이스 (Negative Cases)</li>
              <li>각 케이스별 상세한 테스트 스텝</li>
            </ul>
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isGenerating}
            >
              취소
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isGenerating}
              className="flex items-center space-x-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  <span>생성 중...</span>
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  <span>테스트케이스 생성</span>
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Loading Overlay */}
        {isGenerating && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
            <div className="text-center">
              <Loader2 className="animate-spin text-primary mx-auto mb-3" size={48} />
              <p className="text-lg font-semibold text-gray-700">AI가 테스트케이스를 생성하는 중...</p>
              <p className="text-sm text-gray-500 mt-1">10-30초 정도 소요됩니다</p>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
