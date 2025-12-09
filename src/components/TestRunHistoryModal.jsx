import { useState, useEffect } from 'react';
import { X, Clock } from 'lucide-react';
import Modal from './common/Modal';
import Button from './common/Button';

/**
 * 테스트 수행 히스토리 모달
 */
export default function TestRunHistoryModal({ isOpen, onClose, item, testCases }) {
  const [runs, setRuns] = useState([]);
  const [selectedRun, setSelectedRun] = useState(null);
  const [runDetails, setRunDetails] = useState(null);

  useEffect(() => {
    if (isOpen && item) {
      loadRuns();
    }
  }, [isOpen, item]);

  const loadRuns = async () => {
    try {
      const response = await fetch(`/api/test-execution-runs/item/${item.id}`);
      const data = await response.json();

      // 중복 제거 (run_number로 유니크하게)
      const uniqueRuns = [];
      const seenRunNumbers = new Set();

      (data || []).forEach((run) => {
        if (!seenRunNumbers.has(run.run_number)) {
          seenRunNumbers.add(run.run_number);
          uniqueRuns.push(run);
        }
      });

      console.log('[DEBUG] Total runs:', data?.length, 'Unique runs:', uniqueRuns.length);
      setRuns(uniqueRuns);
    } catch (error) {
      console.error('Run 히스토리 로드 실패:', error);
      setRuns([]);
    }
  };

  const loadRunDetails = async (runId) => {
    try {
      const response = await fetch(`/api/test-execution-runs/${runId}`);
      const data = await response.json();
      setRunDetails(data);
      setSelectedRun(runId);
    } catch (error) {
      console.error('Run 상세 로드 실패:', error);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      'In Progress': 'bg-yellow-100 text-yellow-800',
      'Pass': 'bg-green-100 text-green-800',
      'Fail': 'bg-red-100 text-red-800',
      'Block': 'bg-orange-100 text-orange-800',
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || styles['In Progress']}`}>
        {status}
      </span>
    );
  };

  const getResultBadge = (result) => {
    const styles = {
      'Pass': 'bg-green-100 text-green-800',
      'Fail': 'bg-red-100 text-red-800',
      'Block': 'bg-orange-100 text-orange-800',
      'Skip': 'bg-gray-100 text-gray-800',
    };

    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${styles[result] || styles['Pass']}`}>
        {result}
      </span>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-6xl">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">테스트 수행 히스토리</h2>
            <p className="text-gray-600">{item?.name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex gap-6">
          {/* 왼쪽: Run 목록 */}
          <div className="w-2/5">
            <h3 className="font-semibold text-gray-900 mb-3">수행 이력</h3>
            {runs.length === 0 ? (
              <p className="text-gray-500 text-sm">수행 이력이 없습니다.</p>
            ) : (
              <div className="space-y-2">
                {runs.map((run) => (
                  <button
                    key={run.id}
                    onClick={() => loadRunDetails(run.id)}
                    className={`w-full text-left p-4 border-2 rounded-lg transition ${
                      selectedRun === run.id
                        ? 'border-primary bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-900">
                        {run.run_number}차 수행
                      </span>
                      {getStatusBadge(run.status)}
                    </div>
                    <div className="text-xs text-gray-500 space-y-1">
                      <p>시작: {new Date(run.started_at).toLocaleString('ko-KR')}</p>
                      {run.completed_at && (
                        <p>완료: {new Date(run.completed_at).toLocaleString('ko-KR')}</p>
                      )}
                      <p>
                        Pass: {run.pass_count || 0} / Fail: {run.fail_count || 0} /
                        Block: {run.block_count || 0} / Skip: {run.skip_count || 0}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 오른쪽: Run 상세 */}
          <div className="w-3/5">
            {runDetails ? (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">
                  {runDetails.run_number}차 수행 상세 결과
                </h3>

                {/* 통계 */}
                <div className="grid grid-cols-4 gap-3 mb-4">
                  <div className="p-3 bg-green-50 rounded-lg border border-green-200 text-center">
                    <p className="text-xs text-green-600 mb-1">Pass</p>
                    <p className="text-2xl font-bold text-green-700">
                      {runDetails.results?.filter(r => r.result === 'Pass').length || 0}
                    </p>
                  </div>
                  <div className="p-3 bg-red-50 rounded-lg border border-red-200 text-center">
                    <p className="text-xs text-red-600 mb-1">Fail</p>
                    <p className="text-2xl font-bold text-red-700">
                      {runDetails.results?.filter(r => r.result === 'Fail').length || 0}
                    </p>
                  </div>
                  <div className="p-3 bg-orange-50 rounded-lg border border-orange-200 text-center">
                    <p className="text-xs text-orange-600 mb-1">Block</p>
                    <p className="text-2xl font-bold text-orange-700">
                      {runDetails.results?.filter(r => r.result === 'Block').length || 0}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-center">
                    <p className="text-xs text-gray-600 mb-1">Skip</p>
                    <p className="text-2xl font-bold text-gray-700">
                      {runDetails.results?.filter(r => r.result === 'Skip').length || 0}
                    </p>
                  </div>
                </div>

                {/* TC별 결과 */}
                <div className="max-h-96 overflow-y-auto">
                  <table className="w-full border border-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">TC ID</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">제목</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">결과</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">스텝 결과</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {runDetails.results?.map((result) => {
                        const tc = testCases.find(t => t.id === result.testcase_id);
                        const stepResults = result.step_results || [];

                        return (
                          <tr key={result.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                              {result.testcase_id}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700">
                              {tc?.title || '-'}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {getResultBadge(result.result)}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {stepResults.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {stepResults.map((sr, idx) => (
                                    <span
                                      key={idx}
                                      className={`px-1.5 py-0.5 rounded text-xs ${
                                        sr.result === 'Pass' ? 'bg-green-100 text-green-700' :
                                        sr.result === 'Fail' ? 'bg-red-100 text-red-700' :
                                        sr.result === 'Block' ? 'bg-orange-100 text-orange-700' :
                                        'bg-gray-100 text-gray-700'
                                      }`}
                                      title={sr.notes || ''}
                                    >
                                      {sr.stepNumber}:{sr.result}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-gray-400 text-xs">-</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <Clock size={48} className="mx-auto mb-3 text-gray-300" />
                  <p>수행 이력을 선택하세요</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-6 border-t mt-6">
          <Button onClick={onClose} variant="primary">
            닫기
          </Button>
        </div>
      </div>
    </Modal>
  );
}
