import { useState } from 'react';
import { X, Search } from 'lucide-react';
import Modal from './common/Modal';
import Button from './common/Button';

/**
 * 요구사항 선택 모달
 */
export default function RequirementSelectModal({ isOpen, onClose, onSave, requirements, selectedIds = [] }) {
  const [tempSelectedIds, setTempSelectedIds] = useState(selectedIds);
  const [searchTerm, setSearchTerm] = useState('');

  // 검색 필터링
  const filteredRequirements = requirements.filter((req) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      req.id.toLowerCase().includes(searchLower) ||
      (req.functionalRequirement || req.title || '').toLowerCase().includes(searchLower) ||
      (req.category || req.division || '').toLowerCase().includes(searchLower)
    );
  });

  const handleToggle = (reqId) => {
    if (tempSelectedIds.includes(reqId)) {
      setTempSelectedIds(tempSelectedIds.filter(id => id !== reqId));
    } else {
      setTempSelectedIds([...tempSelectedIds, reqId]);
    }
  };

  const handleSave = () => {
    onSave(tempSelectedIds);
    onClose();
  };

  const handleClose = () => {
    setTempSelectedIds(selectedIds); // 초기값으로 되돌림
    setSearchTerm('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} maxWidth="max-w-3xl">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">요구사항 선택</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* 검색 */}
        <div className="mb-4">
          <div className="relative">
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
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            선택됨: <span className="font-semibold">{tempSelectedIds.length}</span>개 / 전체: {requirements.length}개
          </p>
        </div>

        {/* 요구사항 목록 */}
        <div className="border border-gray-300 rounded-lg max-h-96 overflow-y-auto mb-6">
          {filteredRequirements.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              검색 결과가 없습니다.
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredRequirements.map((req) => {
                const isSelected = tempSelectedIds.includes(req.id);

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
                        {req.category && (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                            {req.category || req.division}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-900 font-medium">
                        {req.functionalRequirement || req.title}
                      </p>
                      {req.description && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                          {req.description}
                        </p>
                      )}
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
            onClick={() => setTempSelectedIds([])}
            className="text-sm text-gray-600 hover:text-gray-800"
          >
            모두 해제
          </button>
          <div className="flex space-x-3">
            <Button type="button" variant="secondary" onClick={handleClose}>
              취소
            </Button>
            <Button type="button" variant="primary" onClick={handleSave}>
              확인 ({tempSelectedIds.length}개 선택)
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
