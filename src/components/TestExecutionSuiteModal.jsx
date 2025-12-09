import { useState } from 'react';
import { X } from 'lucide-react';
import Modal from './common/Modal';
import Input from './common/Input';
import Button from './common/Button';

/**
 * 테스트 수행 Suite 생성 모달
 */
export default function TestExecutionSuiteModal({ isOpen, onClose, onSave, selectedProject }) {
  const [formData, setFormData] = useState({
    name: '',
    purpose: '',
    description: '',
  });

  const purposeOptions = [
    { value: 'QA테스트', label: 'QA테스트' },
    { value: '중간테스트', label: '중간테스트' },
    { value: '완료테스트', label: '완료테스트' },
    { value: '운영테스트', label: '운영테스트' },
    { value: '회귀테스트', label: '회귀테스트' },
    { value: '통합테스트', label: '통합테스트' },
    { value: '기타', label: '기타' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert('테스트 수행 이름을 입력해주세요.');
      return;
    }

    try {
      const response = await fetch('/api/test-execution-suites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: selectedProject.id,
          name: formData.name,
          purpose: formData.purpose,
          description: formData.description,
        }),
      });

      if (!response.ok) {
        throw new Error('생성 실패');
      }

      const newSuite = await response.json();
      onSave(newSuite);

      // 폼 초기화
      setFormData({ name: '', purpose: '', description: '' });
      alert(`테스트 수행 "${newSuite.name}"가 생성되었습니다!`);
    } catch (error) {
      console.error('Suite 생성 실패:', error);
      alert('테스트 수행 생성에 실패했습니다.');
    }
  };

  const handleClose = () => {
    setFormData({ name: '', purpose: '', description: '' });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} maxWidth="max-w-2xl">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">새 테스트 수행 생성</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Project Info */}
          {selectedProject && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-gray-600">
                프로젝트: <span className="font-semibold text-primary">{selectedProject.name}</span>
              </p>
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              테스트 수행 이름 <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="예: QA 1차 테스트 (2025-11-28)"
              required
            />
          </div>

          {/* Purpose */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              테스트 목적
            </label>
            <select
              value={formData.purpose}
              onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">선택하세요</option>
              {purposeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              설명
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="테스트 수행에 대한 추가 설명 (선택사항)"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              rows="4"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button type="button" variant="secondary" onClick={handleClose}>
              취소
            </Button>
            <Button type="submit" variant="primary">
              생성
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
