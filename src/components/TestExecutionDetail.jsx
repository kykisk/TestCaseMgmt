import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Play, RefreshCw, Download, History } from 'lucide-react';
import * as XLSX from 'xlsx';
import Button from './common/Button';
import TestExecutionItemModal from './TestExecutionItemModal';
import RerunModal from './RerunModal';
import ResumeTestModal from './ResumeTestModal';
import TestRunHistoryModal from './TestRunHistoryModal';

/**
 * 테스트 수행 Suite 상세 화면 (Items 관리)
 */
export default function TestExecutionDetail({
  suite,
  requirements,
  testCases,
  onBack,
  onStartTest,
}) {
  const [items, setItems] = useState([]);
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [isRerunModalOpen, setIsRerunModalOpen] = useState(false);
  const [rerunItem, setRerunItem] = useState(null);
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);
  const [resumeItem, setResumeItem] = useState(null);
  const [inProgressRun, setInProgressRun] = useState(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [historyItem, setHistoryItem] = useState(null);

  useEffect(() => {
    if (suite) {
      loadItems();
    }
  }, [suite]);

  const loadItems = async () => {
    try {
      const response = await fetch(`/api/test-execution-items/suite/${suite.id}`);
      const data = await response.json();
      setItems(data || []);
    } catch (error) {
      console.error('Items 로드 실패:', error);
      setItems([]);
    }
  };

  const handleDeleteItem = async (item) => {
    const confirmed = window.confirm(
      `"${item.name}" 항목을 삭제하시겠습니까?\n\n모든 수행 결과가 삭제됩니다.`
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`/api/test-execution-items/${item.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('삭제 실패');
      }

      alert('삭제되었습니다.');
      loadItems();
    } catch (error) {
      console.error('Item 삭제 실패:', error);
      alert('삭제에 실패했습니다.');
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      'Not Started': 'bg-gray-100 text-gray-800',
      'In Progress': 'bg-yellow-100 text-yellow-800',
      'Pass': 'bg-green-100 text-green-800',
      'Fail': 'bg-red-100 text-red-800',
      'Block': 'bg-orange-100 text-orange-800',
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || styles['Not Started']}`}>
        {status}
      </span>
    );
  };

  // Item의 테스트케이스 가져오기
  const getItemTestCases = (item) => {
    const reqIds = item.requirement_ids || [];
    return testCases.filter((tc) =>
      tc.requirementIds?.some((reqId) => reqIds.includes(reqId))
    );
  };

  // 테스트 시작 전 진행 중인 Run 확인
  const handleStartTest = async (item) => {
    try {
      // Item의 모든 Runs 가져오기
      const response = await fetch(`/api/test-execution-runs/item/${item.id}`);
      const runs = await response.json();

      // 진행 중인 Run 찾기 (status='In Progress')
      const inProgressRun = runs.find(r => r.status === 'In Progress');

      if (inProgressRun) {
        // 진행 중인 Run이 있으면 선택 모달 표시
        setResumeItem(item);
        setInProgressRun(inProgressRun);
        setIsResumeModalOpen(true);
      } else {
        // 없으면 바로 시작
        onStartTest(item, 'all');
      }
    } catch (error) {
      console.error('Run 확인 실패:', error);
      // 에러 시 그냥 시작
      onStartTest(item, 'all');
    }
  };

  // 이어서 진행
  const handleResume = () => {
    setIsResumeModalOpen(false);
    onStartTest(resumeItem, 'all', inProgressRun.id); // 기존 runId 전달
  };

  // 폐기하고 새로 시작
  const handleDiscard = async () => {
    try {
      // 진행 중인 Run 삭제
      const response = await fetch(`/api/test-execution-runs/${inProgressRun.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Run 삭제 실패');
      }

      setIsResumeModalOpen(false);
      onStartTest(resumeItem, 'all'); // 새로 시작
    } catch (error) {
      console.error('Run 삭제 실패:', error);
      alert('폐기에 실패했습니다.');
    }
  };

  // Excel Export
  const handleExcelExport = async () => {
    try {
      // 모든 Items와 Runs, Results 가져오기
      const itemsWithDetails = await Promise.all(
        items.map(async (item) => {
          const response = await fetch(`/api/test-execution-items/${item.id}`);
          const detailData = await response.json();
          return detailData;
        })
      );

      // Excel 데이터 준비
      const excelData = [];

      // 헤더 정보
      excelData.push(['테스트 결과서']);
      excelData.push([]);
      excelData.push(['테스트 수행명', suite.name]);
      excelData.push(['목적', suite.purpose || '']);
      excelData.push(['설명', suite.description || '']);
      excelData.push(['생성일', new Date(suite.created_at).toLocaleString('ko-KR')]);
      excelData.push([]);

      // 각 Item별 결과
      itemsWithDetails.forEach((item, idx) => {
        excelData.push([`[항목 ${idx + 1}] ${item.name}`]);
        excelData.push(['요구사항 ID', ...(item.requirement_ids || [])]);
        excelData.push([]);

        const itemTCs = getItemTestCases(item);

        // 테이블 헤더
        const headers = ['TC ID', '제목'];
        const maxRuns = Math.max(...(item.runs || []).map(r => r.run_number), 0);
        for (let i = 1; i <= maxRuns; i++) {
          headers.push(`${i}차 수행`, `${i}차 비고`);
        }
        excelData.push(headers);

        // 각 TC별 결과
        itemTCs.forEach((tc) => {
          const row = [tc.id, tc.title];

          for (let runNum = 1; runNum <= maxRuns; runNum++) {
            const run = item.runs?.find(r => r.run_number === runNum);
            const result = run?.results?.find(res => res.testcase_id === tc.id);

            row.push(result?.result || '-');
            row.push(result?.notes || '');
          }

          excelData.push(row);
        });

        excelData.push([]);
      });

      // 통계
      excelData.push(['통계']);
      excelData.push(['총 항목 수', items.length]);
      excelData.push(['총 테스트케이스 수', testCases.length]);

      // Excel 생성
      const ws = XLSX.utils.aoa_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, '테스트 결과');

      // 다운로드
      const fileName = `테스트결과서_${suite.name}_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);

      alert('엑셀 파일이 다운로드되었습니다!');
    } catch (error) {
      console.error('Excel export 실패:', error);
      alert('엑셀 다운로드에 실패했습니다.');
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft size={20} />
          <span>테스트 수행 목록으로</span>
        </button>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{suite.name}</h2>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                {suite.purpose && (
                  <span className="px-3 py-1 bg-white rounded-lg font-medium">{suite.purpose}</span>
                )}
                {getStatusBadge(suite.status)}
                <span>생성: {new Date(suite.created_at).toLocaleString('ko-KR')}</span>
              </div>
              {suite.description && (
                <p className="text-gray-600 mt-2">{suite.description}</p>
              )}
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={handleExcelExport}
                variant="secondary"
                className="flex items-center space-x-2"
              >
                <Download size={18} />
                <span>엑셀 다운로드</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Items */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">테스트 수행 항목</h3>
          <Button
            onClick={() => setIsAddItemModalOpen(true)}
            variant="primary"
            className="flex items-center space-x-2"
          >
            <Plus size={18} />
            <span>요구사항 추가</span>
          </Button>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-lg">
            <p className="text-gray-500 mb-4">테스트 수행 항목이 없습니다.</p>
            <p className="text-sm text-gray-400 mb-6">요구사항을 추가하여 테스트를 시작하세요.</p>
            <Button
              onClick={() => setIsAddItemModalOpen(true)}
              variant="primary"
              className="inline-flex items-center space-x-2"
            >
              <Plus size={20} />
              <span>요구사항 추가</span>
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full bg-white border border-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    항목 이름
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">
                    연결된 요구사항
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                    TC 개수
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                    수행 횟수
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                    최신 상태
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">
                    액션
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {items.map((item) => {
                  const itemTCs = getItemTestCases(item);

                  return (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                        {item.name}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex flex-wrap gap-1">
                          {(item.requirement_ids || []).map((reqId) => (
                            <span
                              key={reqId}
                              className="inline-block px-2 py-0.5 bg-info text-white rounded text-xs"
                            >
                              {reqId}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {itemTCs.length}개
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.run_count || 0}회
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {getStatusBadge(item.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center space-x-2">
                          <Button
                            onClick={() => handleStartTest(item)}
                            variant="primary"
                            className="flex items-center space-x-1 text-xs py-1 px-3"
                          >
                            <Play size={14} />
                            <span>테스트 시작</span>
                          </Button>
                          {item.run_count > 0 && (
                            <>
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setRerunItem(item);
                                  setIsRerunModalOpen(true);
                                }}
                                variant="secondary"
                                className="flex items-center space-x-1 text-xs py-1 px-3"
                              >
                                <RefreshCw size={14} />
                                <span>재수행</span>
                              </Button>
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setHistoryItem(item);
                                  setIsHistoryModalOpen(true);
                                }}
                                variant="secondary"
                                className="flex items-center space-x-1 text-xs py-1 px-3 bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200"
                              >
                                <History size={14} />
                                <span>히스토리</span>
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Item 추가 모달 */}
      {suite && (
        <TestExecutionItemModal
          isOpen={isAddItemModalOpen}
          onClose={() => setIsAddItemModalOpen(false)}
          onSave={(newItem) => {
            setIsAddItemModalOpen(false);
            loadItems();
          }}
          suite={suite}
          requirements={requirements}
          testCases={testCases}
        />
      )}

      {/* 재수행 모달 */}
      {rerunItem && (
        <RerunModal
          isOpen={isRerunModalOpen}
          onClose={() => {
            setIsRerunModalOpen(false);
            setRerunItem(null);
          }}
          onConfirm={(rerunType) => {
            // 재수행 시작
            onStartTest(rerunItem, rerunType);
          }}
          item={rerunItem}
        />
      )}

      {/* 이어하기 모달 */}
      {resumeItem && inProgressRun && (
        <ResumeTestModal
          isOpen={isResumeModalOpen}
          onClose={() => {
            setIsResumeModalOpen(false);
            setResumeItem(null);
            setInProgressRun(null);
          }}
          onResume={handleResume}
          onDiscard={handleDiscard}
          item={resumeItem}
          inProgressRun={inProgressRun}
        />
      )}

      {/* 히스토리 모달 */}
      {historyItem && (
        <TestRunHistoryModal
          isOpen={isHistoryModalOpen}
          onClose={() => {
            setIsHistoryModalOpen(false);
            setHistoryItem(null);
          }}
          item={historyItem}
          testCases={testCases}
        />
      )}
    </div>
  );
}
