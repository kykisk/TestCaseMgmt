import React, { useState, useMemo } from 'react';
import { Plus, Upload, Trash2, Edit, Save, X, Sparkles, ChevronDown, ChevronRight, Layers, Link } from 'lucide-react';
import Button from './common/Button';
import RequirementSelectModal from './RequirementSelectModal';
import TestCaseDetailModal from './TestCaseDetailModal';

/**
 * 테스트케이스 목록 컴포넌트 (인라인 편집 + 전체 편집 모드 + 요구사항별 그룹핑)
 */
export default function TestCaseList({
  testCases,
  requirements,
  onAdd,
  onImport,
  onAIGenerate,
  onUpdate,
  onDelete,
  selectedProject,
}) {
  // 인라인 편집 state
  const [editingRowId, setEditingRowId] = useState(null);
  const [editingData, setEditingData] = useState({});

  // 전체 편집 모드 state
  const [isBulkEditMode, setIsBulkEditMode] = useState(false);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [bulkEditData, setBulkEditData] = useState({});
  const [deletedRows, setDeletedRows] = useState(new Set());

  // 그룹핑 state
  const [isGroupingEnabled, setIsGroupingEnabled] = useState(true); // 기본값: 그룹핑 활성화
  const [collapsedGroups, setCollapsedGroups] = useState(new Set());

  // 요구사항 선택 모달 state
  const [isReqSelectModalOpen, setIsReqSelectModalOpen] = useState(false);

  // 상세 보기 모달 state
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailTestCase, setDetailTestCase] = useState(null);

  const priorityOptions = ['High', 'Medium', 'Low'];
  const categoryOptions = ['Functional', 'Integration', 'UI/UX', 'Performance', 'Security', 'Regression', 'Other'];

  // 요구사항별 그룹화
  const groupedTestCases = useMemo(() => {
    if (!isGroupingEnabled) return null;

    const groups = {};

    testCases.forEach((tc) => {
      if (tc.requirementIds && tc.requirementIds.length > 0) {
        tc.requirementIds.forEach((reqId) => {
          if (!groups[reqId]) {
            const req = requirements.find((r) => r.id === reqId);
            groups[reqId] = {
              requirement: req || { id: reqId, title: reqId },
              testCases: [],
            };
          }
          // 중복 방지
          if (!groups[reqId].testCases.find(t => t.id === tc.id)) {
            groups[reqId].testCases.push(tc);
          }
        });
      } else {
        if (!groups['_unlinked']) {
          groups['_unlinked'] = {
            requirement: { id: '_unlinked', title: '요구사항 미연결' },
            testCases: [],
          };
        }
        groups['_unlinked'].testCases.push(tc);
      }
    });

    return groups;
  }, [testCases, requirements, isGroupingEnabled]);

  // 그룹 접기/펼치기
  const toggleGroup = (groupId) => {
    const newCollapsed = new Set(collapsedGroups);
    if (newCollapsed.has(groupId)) {
      newCollapsed.delete(groupId);
    } else {
      newCollapsed.add(groupId);
    }
    setCollapsedGroups(newCollapsed);
  };

  // 인라인 편집 시작
  const handleStartEdit = (tc) => {
    setEditingRowId(tc.id);
    setEditingData({
      title: tc.title || '',
      description: tc.description || '',
      priority: tc.priority || 'Medium',
      category: tc.category || 'Functional',
      status: tc.status || 'Not Started',
      requirementIds: tc.requirementIds || [],
    });
  };

  // 인라인 편집 취소
  const handleCancelEdit = () => {
    setEditingRowId(null);
    setEditingData({});
  };

  // 인라인 편집 저장
  const handleSaveEdit = async (tc) => {
    if (!editingData.title) {
      alert('제목은 필수입니다.');
      return;
    }

    const formData = {
      id: tc.id,
      title: editingData.title,
      description: editingData.description,
      priority: editingData.priority,
      category: editingData.category,
      status: editingData.status,
      requirementIds: editingData.requirementIds,
    };

    await onUpdate(formData);
    setEditingRowId(null);
    setEditingData({});
  };

  // 전체 편집 모드 시작
  const handleStartBulkEdit = () => {
    setIsBulkEditMode(true);
    const initialBulkData = {};
    testCases.forEach((tc) => {
      initialBulkData[tc.id] = {
        title: tc.title || '',
        description: tc.description || '',
        priority: tc.priority || 'Medium',
        category: tc.category || 'Functional',
        status: tc.status || 'Not Started',
        requirementIds: tc.requirementIds || [],
      };
    });
    setBulkEditData(initialBulkData);
  };

  // 전체 편집 모드 취소
  const handleCancelBulkEdit = () => {
    setIsBulkEditMode(false);
    setSelectedRows(new Set());
    setBulkEditData({});
    setDeletedRows(new Set());
  };

  // 체크박스 토글
  const handleToggleCheckbox = (tcId) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(tcId)) {
      newSelected.delete(tcId);
    } else {
      newSelected.add(tcId);
    }
    setSelectedRows(newSelected);
  };

  // 체크된 항목 삭제 표시
  const handleMarkSelectedForDelete = () => {
    if (selectedRows.size === 0) {
      alert('삭제할 항목을 선택해주세요.');
      return;
    }
    const newDeleted = new Set(deletedRows);
    selectedRows.forEach((id) => newDeleted.add(id));
    setDeletedRows(newDeleted);
    setSelectedRows(new Set());
  };

  // 삭제 표시 취소
  const handleUnmarkDelete = (tcId) => {
    const newDeleted = new Set(deletedRows);
    newDeleted.delete(tcId);
    setDeletedRows(newDeleted);
  };

  // 전체 편집 저장
  const handleSaveBulkEdit = async () => {
    const deleteCount = deletedRows.size;
    let updateCount = 0;

    // 변경된 항목 카운트
    for (const tcId in bulkEditData) {
      if (!deletedRows.has(tcId)) {
        const tc = testCases.find((t) => t.id === tcId);
        const data = bulkEditData[tcId];
        if (tc && (
          tc.title !== data.title ||
          tc.description !== data.description ||
          tc.priority !== data.priority ||
          tc.category !== data.category ||
          tc.status !== data.status ||
          JSON.stringify(tc.requirementIds) !== JSON.stringify(data.requirementIds)
        )) {
          updateCount++;
        }
      }
    }

    // 한 번만 확인
    const confirmed = window.confirm(
      `${deleteCount}개 항목 삭제, ${updateCount}개 항목 수정하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`
    );

    if (!confirmed) return;

    try {
      // 삭제된 항목 삭제 (API 직접 호출 - confirm 없이)
      for (const tcId of deletedRows) {
        const response = await fetch(`/api/testcases/${tcId}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
        });
        if (!response.ok) {
          const error = await response.json().catch(() => ({ error: '삭제 실패' }));
          throw new Error(error.error || '삭제 실패');
        }
      }

      // 업데이트된 항목 처리 (API 직접 호출 - alert 없이)
      for (const tcId in bulkEditData) {
        if (!deletedRows.has(tcId)) {
          const tc = testCases.find((t) => t.id === tcId);
          const data = bulkEditData[tcId];

          if (tc && (
            tc.title !== data.title ||
            tc.description !== data.description ||
            tc.priority !== data.priority ||
            tc.category !== data.category ||
            tc.status !== data.status ||
            JSON.stringify(tc.requirementIds) !== JSON.stringify(data.requirementIds)
          )) {
            const testCaseData = {
              title: data.title,
              description: data.description,
              priority: data.priority,
              category: data.category,
              status: data.status,
              requirement_ids: data.requirementIds || [],
            };

            const response = await fetch(`/api/testcases/${tcId}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(testCaseData),
            });

            if (!response.ok) {
              const error = await response.json().catch(() => ({ error: '수정 실패' }));
              throw new Error(error.error || '수정 실패');
            }
          }
        }
      }

      alert('변경사항이 저장되었습니다.');
      handleCancelBulkEdit();

      // 목록 새로고침을 위해 페이지 리로드
      window.location.reload();
    } catch (error) {
      console.error('Bulk edit failed:', error);
      alert('일부 항목 저장에 실패했습니다: ' + error.message);
    }
  };

  // 테스트케이스 Row 렌더링 (재사용)
  const renderTestCaseRow = (tc, isEditing, isDeleted, isSelected) => {
    // 전체 편집 모드
    if (isBulkEditMode) {
      const data = bulkEditData[tc.id] || {};

      return (
        <tr
          key={tc.id}
          className={`${isDeleted ? 'bg-red-50 opacity-50 line-through' : 'hover:bg-gray-50'} ${
            isSelected ? 'bg-blue-50' : ''
          }`}
        >
          <td className="px-4 py-4">
            {!isDeleted && (
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => handleToggleCheckbox(tc.id)}
                className="rounded"
              />
            )}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
            {tc.id}
          </td>
          <td className="px-6 py-4">
            {isDeleted ? (
              <span className="text-sm text-gray-500">{data.title}</span>
            ) : (
              <input
                type="text"
                value={data.title || ''}
                onChange={(e) => {
                  setBulkEditData({
                    ...bulkEditData,
                    [tc.id]: { ...data, title: e.target.value },
                  });
                }}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              />
            )}
          </td>
          <td className="px-6 py-4 text-sm">
            {tc.requirementIds && tc.requirementIds.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {tc.requirementIds.map((reqId) => (
                  <span
                    key={reqId}
                    className="inline-block px-2 py-0.5 bg-info text-white rounded text-xs"
                    title={requirements.find((r) => r.id === reqId)?.functionalRequirement || reqId}
                  >
                    {reqId}
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-gray-400 text-xs">-</span>
            )}
          </td>
          <td className="px-6 py-4">
            {isDeleted ? (
              <span className="text-sm text-gray-500">{data.priority}</span>
            ) : (
              <select
                value={data.priority || 'Medium'}
                onChange={(e) => {
                  setBulkEditData({
                    ...bulkEditData,
                    [tc.id]: { ...data, priority: e.target.value },
                  });
                }}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              >
                {priorityOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            )}
          </td>
          <td className="px-6 py-4">
            {isDeleted ? (
              <span className="text-sm text-gray-500">{data.category}</span>
            ) : (
              <select
                value={data.category || 'Functional'}
                onChange={(e) => {
                  setBulkEditData({
                    ...bulkEditData,
                    [tc.id]: { ...data, category: e.target.value },
                  });
                }}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              >
                {categoryOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            )}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm">
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              {tc.status}
            </span>
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm">
            {isDeleted && (
              <button
                onClick={() => handleUnmarkDelete(tc.id)}
                className="text-blue-600 hover:text-blue-800"
              >
                복원
              </button>
            )}
          </td>
        </tr>
      );
    }

    // 인라인 편집 모드
    if (isEditing) {
      return (
        <tr key={tc.id} className="bg-blue-50">
          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
            {tc.id}
          </td>
          <td className="px-6 py-4">
            <input
              type="text"
              value={editingData.title || ''}
              onChange={(e) => setEditingData({ ...editingData, title: e.target.value })}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              placeholder="제목"
            />
          </td>
          <td className="px-6 py-4 text-sm">
            <button
              onClick={() => setIsReqSelectModalOpen(true)}
              className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition w-full"
            >
              <Link size={16} className="text-blue-600" />
              <span className="text-sm text-gray-700">
                {editingData.requirementIds?.length > 0
                  ? `${editingData.requirementIds.length}개 선택됨`
                  : '요구사항 선택'}
              </span>
            </button>
            {editingData.requirementIds?.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {editingData.requirementIds.map((reqId) => (
                  <span
                    key={reqId}
                    className="inline-block px-2 py-0.5 bg-info text-white rounded text-xs"
                  >
                    {reqId}
                  </span>
                ))}
              </div>
            )}
          </td>
          <td className="px-6 py-4">
            <select
              value={editingData.priority || 'Medium'}
              onChange={(e) => setEditingData({ ...editingData, priority: e.target.value })}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
            >
              {priorityOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </td>
          <td className="px-6 py-4">
            <select
              value={editingData.category || 'Functional'}
              onChange={(e) => setEditingData({ ...editingData, category: e.target.value })}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
            >
              {categoryOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </td>
          <td className="px-6 py-4">
            <select
              value={editingData.status || 'Not Started'}
              onChange={(e) => setEditingData({ ...editingData, status: e.target.value })}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
            >
              <option value="Not Started">Not Started</option>
              <option value="In Progress">In Progress</option>
              <option value="Pass">Pass</option>
              <option value="Fail">Fail</option>
            </select>
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleSaveEdit(tc)}
                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                title="저장"
              >
                <Save size={18} />
              </button>
              <button
                onClick={handleCancelEdit}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                title="취소"
              >
                <X size={18} />
              </button>
            </div>
          </td>
        </tr>
      );
    }

    // 일반 모드
    return (
      <tr key={tc.id} className="hover:bg-gray-50">
        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
          {tc.id}
        </td>
        <td
          className="px-6 py-4 text-sm text-gray-900 cursor-pointer hover:text-primary hover:underline"
          onClick={() => {
            setDetailTestCase(tc);
            setIsDetailModalOpen(true);
          }}
        >
          <div className="truncate max-w-md" title={tc.title}>
            {tc.title}
          </div>
        </td>
        <td className="px-6 py-4 text-sm">
          {tc.requirementIds && tc.requirementIds.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {tc.requirementIds.map((reqId) => (
                <span
                  key={reqId}
                  className="inline-block px-2 py-0.5 bg-info text-white rounded text-xs"
                  title={requirements.find((r) => r.id === reqId)?.functionalRequirement || reqId}
                >
                  {reqId}
                </span>
              ))}
            </div>
          ) : (
            <span className="text-gray-400 text-xs">-</span>
          )}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              tc.priority === 'High'
                ? 'bg-red-100 text-red-800'
                : tc.priority === 'Medium'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-green-100 text-green-800'
            }`}
          >
            {tc.priority}
          </span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tc.category}</td>
        <td className="px-6 py-4 whitespace-nowrap text-sm">
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {tc.status}
          </span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleStartEdit(tc)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
              title="편집"
            >
              <Edit size={18} />
            </button>
            <button
              onClick={() => onDelete(tc)}
              className="p-2 text-danger hover:bg-red-50 rounded-lg transition"
              title="삭제"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </td>
      </tr>
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
      {/* 요구사항 선택 모달 */}
      <RequirementSelectModal
        isOpen={isReqSelectModalOpen}
        onClose={() => setIsReqSelectModalOpen(false)}
        onSave={(selectedIds) => {
          setEditingData({ ...editingData, requirementIds: selectedIds });
          setIsReqSelectModalOpen(false);
        }}
        requirements={requirements}
        selectedIds={editingData.requirementIds || []}
      />

      {/* 테스트케이스 상세 보기 모달 */}
      <TestCaseDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setDetailTestCase(null);
        }}
        onSave={async (formData) => {
          await onUpdate(formData);
          setIsDetailModalOpen(false);
          setDetailTestCase(null);
        }}
        testCase={detailTestCase}
        requirements={requirements}
      />

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">테스트케이스</h2>
        <div className="flex items-center space-x-3">
          {isBulkEditMode ? (
            <>
              <Button
                onClick={handleMarkSelectedForDelete}
                variant="secondary"
                className="flex items-center space-x-2 bg-red-50 text-red-600 hover:bg-red-100 border-red-200"
              >
                <Trash2 size={18} />
                <span>선택 삭제</span>
              </Button>
              <Button onClick={handleCancelBulkEdit} variant="secondary">
                취소
              </Button>
              <Button onClick={handleSaveBulkEdit} variant="primary">
                저장
              </Button>
            </>
          ) : (
            <>
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
              <Button onClick={onImport} variant="secondary" className="flex items-center space-x-2">
                <Upload size={18} />
                <span>엑셀 가져오기</span>
              </Button>
              <Button
                onClick={onAIGenerate}
                variant="secondary"
                className="flex items-center space-x-2 bg-purple-50 text-purple-600 hover:bg-purple-100 border-purple-200"
              >
                <Sparkles size={18} />
                <span>AI로 생성</span>
              </Button>
              <Button
                onClick={handleStartBulkEdit}
                variant="secondary"
                className="flex items-center space-x-2"
              >
                <Edit size={18} />
                <span>전체 편집</span>
              </Button>
              <Button onClick={onAdd} variant="primary" className="flex items-center space-x-2">
                <Plus size={18} />
                <span>새 테스트케이스</span>
              </Button>
            </>
          )}
        </div>
      </div>

      {testCases.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500 mb-6">테스트케이스가 없습니다.</p>
          <Button onClick={onAdd} variant="primary" className="inline-flex items-center space-x-2">
            <Plus size={20} />
            <span>새 테스트케이스 작성</span>
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full bg-white border border-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {isBulkEditMode && (
                  <th className="px-4 py-3 w-12">
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedRows(new Set(testCases.map((tc) => tc.id)));
                        } else {
                          setSelectedRows(new Set());
                        }
                      }}
                      checked={selectedRows.size === testCases.length && testCases.length > 0}
                      className="rounded"
                    />
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-44">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  제목
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">
                  연결된 요구사항
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                  우선순위
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-36">
                  카테고리
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                  상태
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                  액션
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {/* 그룹핑 모드 */}
              {isGroupingEnabled && groupedTestCases ? (
                Object.entries(groupedTestCases).map(([groupId, group]) => {
                  const isCollapsed = collapsedGroups.has(groupId);
                  const groupTestCases = group.testCases;

                  return (
                    <React.Fragment key={`group-${groupId}`}>
                      {/* 그룹 헤더 */}
                      <tr className="bg-blue-50 border-t-2 border-blue-200">
                        <td colSpan={isBulkEditMode ? "8" : "7"} className="px-6 py-3">
                          <button
                            onClick={() => toggleGroup(groupId)}
                            className="flex items-center space-x-2 w-full text-left hover:text-blue-700 transition"
                          >
                            {isCollapsed ? <ChevronRight size={20} /> : <ChevronDown size={20} />}
                            <span className="font-semibold text-blue-900">
                              {groupId === '_unlinked' ? (
                                <span className="text-gray-600">요구사항 미연결</span>
                              ) : (
                                <>
                                  <span className="text-blue-600">{group.requirement.id}</span>
                                  {' - '}
                                  <span>{group.requirement.functionalRequirement || group.requirement.title || ''}</span>
                                </>
                              )}
                              <span className="ml-2 text-sm text-gray-500">
                                ({groupTestCases.length}개 테스트케이스)
                              </span>
                            </span>
                          </button>
                        </td>
                      </tr>

                      {/* 그룹 테스트케이스들 */}
                      {!isCollapsed && groupTestCases.map((tc) => {
                        const isEditing = editingRowId === tc.id;
                        const isDeleted = deletedRows.has(tc.id);
                        const isSelected = selectedRows.has(tc.id);

                        return renderTestCaseRow(tc, isEditing, isDeleted, isSelected);
                      })}
                    </React.Fragment>
                  );
                })
              ) : (
                /* 일반 모드 */
                testCases.map((tc) => {
                  const isEditing = editingRowId === tc.id;
                  const isDeleted = deletedRows.has(tc.id);
                  const isSelected = selectedRows.has(tc.id);

                  return renderTestCaseRow(tc, isEditing, isDeleted, isSelected);
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
