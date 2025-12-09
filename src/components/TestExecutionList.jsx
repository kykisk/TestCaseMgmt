import { useState, useEffect } from 'react';
import { Plus, Play, Trash2 } from 'lucide-react';
import Button from './common/Button';
import TestExecutionSuiteModal from './TestExecutionSuiteModal';

/**
 * 테스트 수행 Suite 목록
 */
export default function TestExecutionList({ selectedProject, onSelectSuite }) {
  const [suites, setSuites] = useState([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    if (selectedProject) {
      loadSuites();
    }
  }, [selectedProject]);

  const loadSuites = async () => {
    try {
      const response = await fetch(`/api/test-execution-suites/project/${selectedProject.id}`);
      const data = await response.json();
      setSuites(data || []);
    } catch (error) {
      console.error('Suite 로드 실패:', error);
      setSuites([]);
    }
  };

  const handleDelete = async (suite) => {
    const confirmed = window.confirm(
      `"${suite.name}" 테스트 수행을 삭제하시겠습니까?\n\n모든 수행 데이터가 삭제됩니다.`
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`/api/test-execution-suites/${suite.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('삭제 실패');
      }

      alert('삭제되었습니다.');
      loadSuites();
    } catch (error) {
      console.error('Suite 삭제 실패:', error);
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

  if (!selectedProject) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">프로젝트를 선택해주세요.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">테스트 수행</h2>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          variant="primary"
          className="flex items-center space-x-2"
        >
          <Plus size={18} />
          <span>새 테스트 수행 생성</span>
        </Button>
      </div>

      {suites.length === 0 ? (
        <div className="text-center py-16">
          <Play size={64} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            테스트 수행이 없습니다
          </h3>
          <p className="text-gray-500 mb-6">
            새 테스트 수행을 생성하여 테스트를 시작하세요.
          </p>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            variant="primary"
            className="inline-flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>새 테스트 수행 생성</span>
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full bg-white border border-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  이름
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                  목적
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                  상태
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                  수행 항목
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">
                  생성일
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                  액션
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {suites.map((suite) => (
                <tr
                  key={suite.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => onSelectSuite(suite)}
                >
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="font-medium">{suite.name}</div>
                    {suite.description && (
                      <div className="text-gray-500 text-xs mt-1">{suite.description}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {suite.purpose || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {getStatusBadge(suite.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {suite.item_count || 0}개
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(suite.created_at).toLocaleString('ko-KR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(suite);
                      }}
                      className="p-2 text-danger hover:bg-red-50 rounded-lg transition"
                      title="삭제"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Suite 생성 모달 */}
      {selectedProject && (
        <TestExecutionSuiteModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSave={(newSuite) => {
            setIsCreateModalOpen(false);
            loadSuites();
          }}
          selectedProject={selectedProject}
        />
      )}
    </div>
  );
}
