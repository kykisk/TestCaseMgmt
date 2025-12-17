import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Modal from './common/Modal';
import Button from './common/Button';

/**
 * 요구사항 상세 보기 모달 (3개 탭)
 */
export default function RequirementDetailModal({ isOpen, onClose, requirement, testCases, functions }) {
  const [activeTab, setActiveTab] = useState('info');

  useEffect(() => {
    if (requirement) {
      setActiveTab('info');
    }
  }, [requirement]);

  if (!requirement) return null;

  // 이 요구사항에 연결된 TC
  const linkedTestCases = testCases.filter(tc =>
    tc.requirementIds?.includes(requirement.id)
  );

  // 이 요구사항에 연결된 Function
  const linkedFunctions = functions.filter(f =>
    f.requirement_id === requirement.id
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-4xl">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{requirement.id}</h2>
            <h3 className="text-xl text-gray-700">{requirement.functionalRequirement || requirement.title}</h3>
          </div>
          <Button onClick={onClose} variant="secondary" className="flex items-center space-x-2">
            <X size={18} />
            <span>닫기</span>
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-6 border-b">
          <button
            onClick={() => setActiveTab('info')}
            className={`px-6 py-3 font-medium transition ${
              activeTab === 'info'
                ? 'border-b-2 border-primary text-primary'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            상세 정보
          </button>
          <button
            onClick={() => setActiveTab('functions')}
            className={`px-6 py-3 font-medium transition flex items-center space-x-2 ${
              activeTab === 'functions'
                ? 'border-b-2 border-primary text-primary'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <span>연결된 Function</span>
            {linkedFunctions.length > 0 && (
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                {linkedFunctions.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('testcases')}
            className={`px-6 py-3 font-medium transition flex items-center space-x-2 ${
              activeTab === 'testcases'
                ? 'border-b-2 border-primary text-primary'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <span>연결된 TestCase</span>
            {linkedTestCases.length > 0 && (
              <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                {linkedTestCases.length}
              </span>
            )}
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'info' && (
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-gray-500 uppercase mb-2">구분</h4>
              <p className="text-gray-900">{requirement.division || requirement.category || '-'}</p>
            </div>
            {requirement.description && (
              <div>
                <h4 className="text-sm font-semibold text-gray-500 uppercase mb-2">설명</h4>
                <p className="text-gray-900 bg-gray-50 p-4 rounded-lg">{requirement.description}</p>
              </div>
            )}
            {requirement.note && (
              <div>
                <h4 className="text-sm font-semibold text-gray-500 uppercase mb-2">비고</h4>
                <p className="text-gray-900">{requirement.note}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'functions' && (
          <div>
            {linkedFunctions.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-gray-500">연결된 Function이 없습니다.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {linkedFunctions.map((func) => (
                  <div key={func.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                    <h4 className="font-semibold text-gray-900 mb-2">{func.function_name}</h4>
                    {func.description && (
                      <p className="text-sm text-gray-600 mb-3">{func.description}</p>
                    )}

                    {/* Parameters */}
                    {func.parameters && func.parameters.length > 0 && (
                      <div className="mb-2">
                        <p className="text-xs text-gray-500 mb-1">파라미터:</p>
                        <div className="bg-blue-50 p-3 rounded font-mono text-xs">
                          {func.parameters.map((p, idx) => (
                            <div key={idx}>
                              <span className="text-blue-600">{p.name}</span>
                              <span className="text-gray-600">: {p.type}</span>
                              {p.required && <span className="text-red-600"> *</span>}
                              {p.description && <span className="text-gray-500"> // {p.description}</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Return */}
                    {func.return_type && (
                      <div className="mb-2">
                        <p className="text-xs text-gray-500 mb-1">반환:</p>
                        <p className="font-mono text-sm">
                          <span className="text-purple-600">{func.return_type}</span>
                          {func.return_description && (
                            <span className="text-gray-600"> - {func.return_description}</span>
                          )}
                        </p>
                      </div>
                    )}

                    {/* Example */}
                    {func.example_usage && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">사용 예시:</p>
                        <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
                          {func.example_usage}
                        </pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'testcases' && (
          <div>
            {linkedTestCases.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-gray-500">연결된 테스트케이스가 없습니다.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {linkedTestCases.map((tc) => (
                  <div key={tc.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-gray-900 mb-1">{tc.id}</p>
                        <p className="text-sm text-gray-700">{tc.title}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          tc.priority === 'High' ? 'bg-red-100 text-red-800' :
                          tc.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {tc.priority}
                        </span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs font-medium">
                          {tc.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
