import { useState } from 'react';
import { X, Search } from 'lucide-react';
import Modal from './common/Modal';
import Input from './common/Input';
import Button from './common/Button';

/**
 * 테스트 수행 Item 추가 모달 (여러 요구사항 선택)
 */
export default function TestExecutionItemModal({ isOpen, onClose, onSave, suite, requirements, testCases }) {
  const [formData, setFormData] = useState({
    name: '',
    requirementIds: [],
  });
  const [searchTerm, setSearchTerm] = useState('');

  // 검색 필터링
  const filteredRequirements = requirements.filter((req) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      req.id.toLowerCase().includes(searchLower) ||
      (req.functionalRequirement || req.title || '').toLowerCase().includes(searchLower)
    );
  });

  const handleToggle = (reqId) => {
    if (formData.requirementIds.includes(reqId)) {
      setFormData({
        ...formData,
        requirementIds: formData.requirementIds.filter(id => id !== reqId),
      });
    } else {
      setFormData({
        ...formData,
        requirementIds: [...formData.requirementIds, reqId],
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert('항목 이름을 입력해주세요.');
      return;
    }

    if (formData.requirementIds.length === 0) {
      alert('최소 1개 이상의 요구사항을 선택해주세요.');
      return;
    }

    try {
      const response = await fetch('/api/test-execution-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          suite_id: suite.id,
          name: formData.name,
          requirement_ids: formData.requirementIds,
        }),
      });

      if (!response.ok) {
        throw new Error('생성 실패');
      }

      const newItem = await response.json();
      onSave(newItem);

      // 폼 초기화
      setFormData({ name: '', requirementIds: [] });
      setSearchTerm('');
      alert('테스트 수행 항목이 추가되었습니다!');
    } catch (error) {
      console.error('Item 생성 실패:', error);
      alert('항목 추가에 실패했습니다.');
    }
  };

  const handleClose = () => {
    setFormData({ name: '', requirementIds: [] });
    setSearchTerm('');
    onClose();
  };

  // 선택된 요구사항의 TC 개수 계산
  const getSelectedTCCount = () => {
    return testCases.filter((tc) =>
      tc.requirementIds?.some((reqId) => formData.requirementIds.includes(reqId))
    ).length;
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} maxWidth="max-w-3xl">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">테스트 수행 항목 추가</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Suite Info */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-gray-600">
              테스트 수행: <span className="font-semibold text-primary">{suite.name}</span>
            </p>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              항목 이름 <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="예: 로그인 + 회원가입 통합 테스트"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              여러 요구사항을 묶은 테스트 항목 이름을 입력하세요
            </p>
          </div>

          {/* 검색 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              요구사항 선택 <span className="text-red-500">*</span>
            </label>
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="요구사항 ID 또는 제목으로 검색..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          {/* 선택 통계 */}
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">
              선택된 요구사항: <span className="font-semibold">{formData.requirementIds.length}</span>개
              {' '}→ 테스트케이스: <span className="font-semibold">{getSelectedTCCount()}</span>개
            </p>
          </div>

          {/* 요구사항 목록 */}
          <div className="border border-gray-300 rounded-lg max-h-80 overflow-y-auto">
            {filteredRequirements.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                검색 결과가 없습니다.
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredRequirements.map((req) => {
                  const isSelected = formData.requirementIds.includes(req.id);
                  const reqTCs = testCases.filter((tc) => tc.requirementIds?.includes(req.id));

                  return (
                    <label
                      key={req.id}
                      className={`flex items-start space-x-3 p-4 cursor-pointer hover:bg-gray-50 transition ${
                        isSelected ? 'bg-blue-50' : ''
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggle(req.id)}
                        className="mt-1 rounded"
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-semibold text-info">{req.id}</span>
                          <span className="text-xs text-gray-500">({reqTCs.length}개 TC)</span>
                        </div>
                        <p className="text-sm text-gray-900">
                          {req.functionalRequirement || req.title}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex justify-between items-center pt-4 border-t">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, requirementIds: [] })}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              모두 해제
            </button>
            <div className="flex space-x-3">
              <Button type="button" variant="secondary" onClick={handleClose}>
                취소
              </Button>
              <Button type="submit" variant="primary">
                추가 ({formData.requirementIds.length}개 요구사항)
              </Button>
            </div>
          </div>
        </form>
      </div>
    </Modal>
  );
}
