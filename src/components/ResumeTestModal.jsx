import { X, Play, Trash2 } from 'lucide-react';
import Modal from './common/Modal';
import Button from './common/Button';

/**
 * 진행 중인 테스트 이어하기/폐기 선택 모달
 */
export default function ResumeTestModal({ isOpen, onClose, onResume, onDiscard, item, inProgressRun }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-lg">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">진행 중인 테스트 발견</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Info */}
        {item && inProgressRun && (
          <div className="mb-6">
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
              <p className="text-sm text-yellow-800">
                "{item.name}" 항목에 완료되지 않은 테스트 수행이 있습니다.
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700 mb-2">
                <span className="font-semibold">수행 차수:</span> {inProgressRun.run_number}차
              </p>
              <p className="text-sm text-gray-700 mb-2">
                <span className="font-semibold">시작 시간:</span>{' '}
                {new Date(inProgressRun.started_at).toLocaleString('ko-KR')}
              </p>
              <p className="text-sm text-gray-700">
                <span className="font-semibold">완료된 TC:</span> {inProgressRun.completed_count || 0}개
              </p>
            </div>
          </div>
        )}

        {/* 선택 */}
        <div className="space-y-3 mb-6">
          <button
            onClick={onResume}
            className="w-full flex items-start space-x-3 p-4 border-2 border-blue-300 rounded-lg hover:bg-blue-50 transition"
          >
            <div className="p-2 bg-blue-100 rounded-lg">
              <Play size={20} className="text-blue-600" />
            </div>
            <div className="text-left flex-1">
              <p className="font-semibold text-gray-900">이어서 진행</p>
              <p className="text-sm text-gray-600">
                중단한 지점부터 테스트를 계속 진행합니다.
              </p>
            </div>
          </button>

          <button
            onClick={onDiscard}
            className="w-full flex items-start space-x-3 p-4 border-2 border-red-300 rounded-lg hover:bg-red-50 transition"
          >
            <div className="p-2 bg-red-100 rounded-lg">
              <Trash2 size={20} className="text-red-600" />
            </div>
            <div className="text-left flex-1">
              <p className="font-semibold text-gray-900">폐기하고 새로 시작</p>
              <p className="text-sm text-gray-600">
                진행 중인 테스트를 폐기하고 처음부터 새로 시작합니다.
              </p>
            </div>
          </button>
        </div>

        {/* Cancel */}
        <div className="flex justify-end pt-4 border-t">
          <Button onClick={onClose} variant="secondary">
            취소
          </Button>
        </div>
      </div>
    </Modal>
  );
}
