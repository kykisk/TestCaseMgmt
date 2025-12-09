import { useState } from 'react';
import { X, RefreshCw } from 'lucide-react';
import Modal from './common/Modal';
import Button from './common/Button';

/**
 * 재수행 모달 (전체 vs 실패한 것만)
 */
export default function RerunModal({ isOpen, onClose, onConfirm, item }) {
  const [rerunType, setRerunType] = useState('all');

  const handleConfirm = () => {
    onConfirm(rerunType);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-lg">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <RefreshCw className="text-orange-600" size={24} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">테스트 재수행</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Item Info */}
        {item && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-gray-600">
              테스트 항목: <span className="font-semibold text-primary">{item.name}</span>
            </p>
          </div>
        )}

        {/* 옵션 선택 */}
        <div className="mb-6">
          <p className="text-sm font-medium text-gray-700 mb-3">재수행 유형을 선택하세요:</p>
          <div className="space-y-3">
            <label className="flex items-start space-x-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition border-gray-300">
              <input
                type="radio"
                name="rerun-type"
                value="all"
                checked={rerunType === 'all'}
                onChange={(e) => setRerunType(e.target.value)}
                className="mt-1"
              />
              <div>
                <p className="font-semibold text-gray-900">전체 재수행</p>
                <p className="text-sm text-gray-600">모든 테스트케이스를 처음부터 다시 수행합니다.</p>
              </div>
            </label>

            <label className="flex items-start space-x-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition border-gray-300">
              <input
                type="radio"
                name="rerun-type"
                value="failed"
                checked={rerunType === 'failed'}
                onChange={(e) => setRerunType(e.target.value)}
                className="mt-1"
              />
              <div>
                <p className="font-semibold text-gray-900">실패한 것만 재수행</p>
                <p className="text-sm text-gray-600">
                  Fail 또는 Block 결과만 다시 수행합니다. Pass/Skip는 이전 결과 유지.
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Info */}
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            💡 재수행 시 새로운 수행 이력이 추가됩니다. 이전 결과는 히스토리로 보존됩니다.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button type="button" variant="secondary" onClick={onClose}>
            취소
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleConfirm}
            className="flex items-center space-x-2"
          >
            <RefreshCw size={18} />
            <span>재수행 시작</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
}
