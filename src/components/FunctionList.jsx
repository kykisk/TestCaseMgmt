import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Edit, Trash2, ChevronDown, ChevronRight, Layers } from 'lucide-react';
import Button from './common/Button';
import FunctionAddModal from './FunctionAddModal';

/**
 * Function List 관리 화면 (요구사항별 그룹핑)
 */
export default function FunctionList({ selectedProject, requirements }) {
  const [functions, setFunctions] = useState([]);
  const [isGroupingEnabled, setIsGroupingEnabled] = useState(true);
  const [collapsedGroups, setCollapsedGroups] = useState(new Set());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingFunction, setEditingFunction] = useState(null);

  useEffect(() => {
    if (selectedProject) {
      loadFunctions();
    }
  }, [selectedProject]);

  const loadFunctions = async () => {
    try {
      const response = await fetch(`/api/function-list/project/${selectedProject.id}`);
      const data = await response.json();
      setFunctions(data || []);
    } catch (error) {
      console.error('Function 로드 실패:', error);
      setFunctions([]);
    }
  };

  const handleDelete = async (func) => {
    const confirmed = window.confirm(
      `함수 "${func.function_name}"를 삭제하시겠습니까?`
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`/api/function-list/${func.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('삭제 실패');
      }

      alert('삭제되었습니다.');
      loadFunctions();
    } catch (error) {
      console.error('삭제 실패:', error);
      alert('삭제에 실패했습니다.');
    }
  };

  // 요구사항별 그룹화
  const groupedFunctions = useMemo(() => {
    if (!isGroupingEnabled) return null;

    const groups = {};

    functions.forEach((func) => {
      const reqId = func.requirement_id;

      if (!groups[reqId]) {
        const req = requirements.find((r) => r.id === reqId);
        groups[reqId] = {
          requirement: req || { id: reqId, title: reqId },
          functions: [],
        };
      }

      groups[reqId].functions.push(func);
    });

    return groups;
  }, [functions, requirements, isGroupingEnabled]);

  const toggleGroup = (groupId) => {
    const newCollapsed = new Set(collapsedGroups);
    if (newCollapsed.has(groupId)) {
      newCollapsed.delete(groupId);
    } else {
      newCollapsed.add(groupId);
    }
    setCollapsedGroups(newCollapsed);
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
        <h2 className="text-2xl font-bold">Function List</h2>
        <div className="flex items-center space-x-3">
          <Button
            onClick={() => setIsGroupingEnabled(!isGroupingEnabled)}
            variant="secondary"
            className={`flex items-center space-x-2 ${
              isGroupingEnabled ? 'bg-blue-50 text-blue-600 border-blue-200' : ''
            }`}
          >
            <Layers size={18} />
            <span>{isGroupingEnabled ? '그룹핑 해제' : '요구사항별 그룹핑'}</span>
          </Button>
          <Button
            onClick={() => setIsAddModalOpen(true)}
            variant="primary"
            className="flex items-center space-x-2"
          >
            <Plus size={18} />
            <span>새 Function 추가</span>
          </Button>
        </div>
      </div>

      {functions.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500 mb-6">Function List가 없습니다.</p>
          <Button
            onClick={() => setIsAddModalOpen(true)}
            variant="primary"
            className="inline-flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>첫 Function 추가</span>
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full bg-white border border-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">함수명</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-48">연결된 요구사항</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">파라미터</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-32">반환 타입</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-24">액션</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isGroupingEnabled && groupedFunctions ? (
                Object.entries(groupedFunctions).map(([reqId, group]) => {
                  const isCollapsed = collapsedGroups.has(reqId);

                  return (
                    <React.Fragment key={`group-${reqId}`}>
                      {/* 그룹 헤더 */}
                      <tr className="bg-blue-50 border-t-2 border-blue-200">
                        <td colSpan="5" className="px-6 py-3">
                          <button
                            onClick={() => toggleGroup(reqId)}
                            className="flex items-center space-x-2 w-full text-left"
                          >
                            {isCollapsed ? <ChevronRight size={20} /> : <ChevronDown size={20} />}
                            <span className="font-semibold text-blue-900">
                              <span className="text-blue-600">{reqId}</span>
                              {' - '}
                              <span>{group.requirement.functionalRequirement || group.requirement.title || ''}</span>
                              <span className="ml-2 text-sm text-gray-500">
                                ({group.functions.length}개 함수)
                              </span>
                            </span>
                          </button>
                        </td>
                      </tr>

                      {/* 그룹 Function들 */}
                      {!isCollapsed && group.functions.map((func) => (
                        <tr key={func.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            {func.function_name}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <span className="px-2 py-1 bg-info text-white rounded text-xs">
                              {func.requirement_id}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {func.parameters && func.parameters.length > 0 ? (
                              <span className="font-mono text-xs">
                                {func.parameters.map(p => `${p.name}: ${p.type}`).join(', ')}
                              </span>
                            ) : (
                              <span className="text-gray-400">없음</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm font-mono text-gray-700">
                            {func.return_type || '-'}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => {
                                  setEditingFunction(func);
                                  setIsAddModalOpen(true);
                                }}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                title="편집"
                              >
                                <Edit size={18} />
                              </button>
                              <button
                                onClick={() => handleDelete(func)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                title="삭제"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  );
                })
              ) : (
                functions.map((func) => (
                  <tr key={func.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {func.function_name}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className="px-2 py-1 bg-info text-white rounded text-xs">
                        {func.requirement_id}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {func.parameters && func.parameters.length > 0 ? (
                        <span className="font-mono text-xs">
                          {func.parameters.map(p => `${p.name}: ${p.type}`).join(', ')}
                        </span>
                      ) : (
                        <span className="text-gray-400">없음</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-gray-700">
                      {func.return_type || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setEditingFunction(func);
                            setIsAddModalOpen(true);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="편집"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(func)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          title="삭제"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Function 추가/편집 모달 */}
      {selectedProject && (
        <FunctionAddModal
          isOpen={isAddModalOpen}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingFunction(null);
          }}
          onSave={() => {
            setIsAddModalOpen(false);
            setEditingFunction(null);
            loadFunctions();
          }}
          selectedProject={selectedProject}
          requirements={requirements}
          editingFunction={editingFunction}
        />
      )}
    </div>
  );
}
