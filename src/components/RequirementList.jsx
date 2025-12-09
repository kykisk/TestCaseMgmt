import { useState } from 'react';
import { Plus, Upload, Trash2, Edit, Save, X } from 'lucide-react';
import Button from './common/Button';
import { DIVISIONS, getFunctionalRequirements } from '../utils/requirementCategories';

/**
 * 요구사항 목록 컴포넌트 (인라인 편집 + 전체 편집 모드)
 */
export default function RequirementList({
  requirements,
  onAdd,
  onImport,
  onEdit,
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

  // 인라인 편집 시작
  const handleStartEdit = (req) => {
    setEditingRowId(req.id);
    setEditingData({
      division: req.division || req.category,
      functionalRequirement: req.functionalRequirement || req.sub_category,
      description: req.description || '',
      note: req.note || req.notes || '',
    });
  };

  // 인라인 편집 취소
  const handleCancelEdit = () => {
    setEditingRowId(null);
    setEditingData({});
  };

  // 인라인 편집 저장
  const handleSaveEdit = async (req) => {
    if (!editingData.division || !editingData.functionalRequirement) {
      alert('구분과 기능 요구사항은 필수입니다.');
      return;
    }

    const formData = {
      reqId: req.id,
      division: editingData.division,
      functionalRequirement: editingData.functionalRequirement,
      description: editingData.description,
      note: editingData.note,
    };

    await onUpdate(formData);
    setEditingRowId(null);
    setEditingData({});
  };

  // 전체 편집 모드 시작
  const handleStartBulkEdit = () => {
    setIsBulkEditMode(true);
    // 모든 요구사항을 편집 데이터로 초기화
    const initialBulkData = {};
    requirements.forEach((req) => {
      initialBulkData[req.id] = {
        division: req.division || req.category,
        functionalRequirement: req.functionalRequirement || req.sub_category,
        description: req.description || '',
        note: req.note || req.notes || '',
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
  const handleToggleCheckbox = (reqId) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(reqId)) {
      newSelected.delete(reqId);
    } else {
      newSelected.add(reqId);
    }
    setSelectedRows(newSelected);
  };

  // 체크된 항목 삭제 표시
  const handleMarkForDeletion = () => {
    setDeletedRows(new Set(selectedRows));
  };

  // 전체 편집 저장
  const handleSaveBulkEdit = async () => {
    const deleteCount = deletedRows.size;
    const updateCount = requirements.length - deleteCount;

    const confirmed = window.confirm(
      `${deleteCount}개 항목 삭제, ${updateCount}개 항목 수정하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`
    );

    if (!confirmed) return;

    try {
      // 삭제된 항목 삭제 (직접 API 호출 - confirm 없이)
      for (const reqId of deletedRows) {
        const response = await fetch(`/api/requirements/${reqId}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
        });
        if (!response.ok) {
          const error = await response.json().catch(() => ({ error: '삭제 실패' }));
          throw new Error(error.error || '삭제 실패');
        }
      }

      // 수정된 항목 저장 (삭제되지 않은 것만, alert 없이)
      for (const req of requirements) {
        if (!deletedRows.has(req.id) && bulkEditData[req.id]) {
          const data = bulkEditData[req.id];
          const requirementData = {
            title: data.functionalRequirement,
            description: data.description,
            category: data.division,
            sub_category: data.functionalRequirement,
            priority: 'Medium',
            status: 'Draft',
            notes: data.note,
          };

          const response = await fetch(`/api/requirements/${req.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requirementData),
          });

          if (!response.ok) {
            const error = await response.json().catch(() => ({ error: '수정 실패' }));
            throw new Error(error.error || '수정 실패');
          }
        }
      }

      alert(`${deleteCount}개 삭제, ${updateCount}개 수정 완료!`);

      // 페이지 새로고침하여 최신 데이터 로드
      window.location.reload();
    } catch (error) {
      console.error('전체 저장 실패:', error);
      alert('저장에 실패했습니다: ' + error.message);
    }
  };

  // 전체 편집 데이터 업데이트
  const handleUpdateBulkEditData = (reqId, field, value) => {
    setBulkEditData({
      ...bulkEditData,
      [reqId]: {
        ...bulkEditData[reqId],
        [field]: value,
      },
    });
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
        <h2 className="text-2xl font-bold">요구사항 관리</h2>
        <div className="flex items-center space-x-3">
          {!isBulkEditMode ? (
            <>
              <Button
                onClick={onImport}
                variant="secondary"
                className="flex items-center space-x-2"
              >
                <Upload size={18} />
                <span>엑셀 가져오기</span>
              </Button>
              <Button
                onClick={handleStartBulkEdit}
                variant="secondary"
                className="flex items-center space-x-2"
              >
                <Edit size={18} />
                <span>편집</span>
              </Button>
              <Button
                onClick={onAdd}
                variant="primary"
                className="flex items-center space-x-2"
              >
                <Plus size={18} />
                <span>새 요구사항</span>
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={handleMarkForDeletion}
                variant="danger"
                className="flex items-center space-x-2"
                disabled={selectedRows.size === 0}
              >
                <Trash2 size={18} />
                <span>삭제 ({selectedRows.size})</span>
              </Button>
              <Button
                onClick={handleSaveBulkEdit}
                variant="primary"
                className="flex items-center space-x-2"
              >
                <Save size={18} />
                <span>저장</span>
              </Button>
              <Button
                onClick={handleCancelBulkEdit}
                variant="secondary"
                className="flex items-center space-x-2"
              >
                <X size={18} />
                <span>취소</span>
              </Button>
            </>
          )}
        </div>
      </div>

      {requirements.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-gray-300 mb-4">📋</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            요구사항이 없습니다
          </h3>
          <p className="text-gray-500 mb-6">
            새 요구사항을 등록하거나 엑셀에서 가져오세요.
          </p>
          <div className="flex items-center justify-center space-x-3">
            <Button
              onClick={onImport}
              variant="secondary"
              className="inline-flex items-center space-x-2"
            >
              <Upload size={20} />
              <span>엑셀에서 가져오기</span>
            </Button>
            <Button
              onClick={onAdd}
              variant="primary"
              className="inline-flex items-center space-x-2"
            >
              <Plus size={20} />
              <span>수동으로 등록</span>
            </Button>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto" style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
          <table className="w-full bg-white border border-gray-200">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                {isBulkEditMode && (
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedRows(new Set(requirements.map((r) => r.id)));
                        } else {
                          setSelectedRows(new Set());
                        }
                      }}
                      checked={selectedRows.size === requirements.length && requirements.length > 0}
                      className="w-4 h-4"
                    />
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-44">
                  요구사항 ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-56">
                  구분
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-64">
                  기능 요구사항
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  설명
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">
                  비고
                </th>
                {!isBulkEditMode && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                    액션
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {requirements.map((req) => {
                const isEditing = editingRowId === req.id;
                const isDeleted = deletedRows.has(req.id);
                const isChecked = selectedRows.has(req.id);

                // 전체 편집 모드가 아니고 인라인 편집 중일 때의 옵션
                const functionalOptions =
                  isEditing && editingData.division
                    ? getFunctionalRequirements(editingData.division)
                    : [];

                // 전체 편집 모드일 때의 옵션
                const bulkFunctionalOptions =
                  isBulkEditMode && bulkEditData[req.id]?.division
                    ? getFunctionalRequirements(bulkEditData[req.id].division)
                    : [];

                const rowClass = isDeleted
                  ? 'opacity-50 line-through bg-red-50'
                  : isBulkEditMode
                  ? 'bg-yellow-50'
                  : isEditing
                  ? 'bg-blue-50'
                  : 'hover:bg-gray-50';

                return (
                  <tr key={req.id} className={rowClass}>
                    {/* 체크박스 (전체 편집 모드에서만) */}
                    {isBulkEditMode && (
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleCheckbox(req.id)}
                          className="w-4 h-4"
                          disabled={isDeleted}
                        />
                      </td>
                    )}

                    {/* 요구사항 ID */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary">
                      {req.id}
                    </td>

                    {/* 구분 */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {isBulkEditMode ? (
                        <select
                          value={bulkEditData[req.id]?.division || ''}
                          onChange={(e) => {
                            handleUpdateBulkEditData(req.id, 'division', e.target.value);
                            handleUpdateBulkEditData(req.id, 'functionalRequirement', '');
                          }}
                          className="w-full px-2 py-1 border border-yellow-400 rounded text-sm"
                          disabled={isDeleted}
                        >
                          <option value="">선택</option>
                          {DIVISIONS.map((div) => (
                            <option key={div} value={div}>
                              {div}
                            </option>
                          ))}
                        </select>
                      ) : isEditing ? (
                        <select
                          value={editingData.division}
                          onChange={(e) =>
                            setEditingData({ ...editingData, division: e.target.value, functionalRequirement: '' })
                          }
                          className="w-full px-2 py-1 border border-blue-300 rounded text-sm"
                        >
                          <option value="">선택</option>
                          {DIVISIONS.map((div) => (
                            <option key={div} value={div}>
                              {div}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          {req.division}
                        </span>
                      )}
                    </td>

                    {/* 기능 요구사항 */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {isBulkEditMode ? (
                        <select
                          value={bulkEditData[req.id]?.functionalRequirement || ''}
                          onChange={(e) =>
                            handleUpdateBulkEditData(req.id, 'functionalRequirement', e.target.value)
                          }
                          className="w-full px-2 py-1 border border-yellow-400 rounded text-sm"
                          disabled={!bulkEditData[req.id]?.division || isDeleted}
                        >
                          <option value="">선택</option>
                          {bulkFunctionalOptions.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      ) : isEditing ? (
                        <select
                          value={editingData.functionalRequirement}
                          onChange={(e) =>
                            setEditingData({ ...editingData, functionalRequirement: e.target.value })
                          }
                          className="w-full px-2 py-1 border border-blue-300 rounded text-sm"
                          disabled={!editingData.division}
                        >
                          <option value="">선택</option>
                          {functionalOptions.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {req.functionalRequirement}
                        </span>
                      )}
                    </td>

                    {/* 설명 */}
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {isBulkEditMode ? (
                        <input
                          type="text"
                          value={bulkEditData[req.id]?.description || ''}
                          onChange={(e) => handleUpdateBulkEditData(req.id, 'description', e.target.value)}
                          className="w-full px-2 py-1 border border-yellow-400 rounded text-sm"
                          disabled={isDeleted}
                        />
                      ) : isEditing ? (
                        <input
                          type="text"
                          value={editingData.description}
                          onChange={(e) => setEditingData({ ...editingData, description: e.target.value })}
                          className="w-full px-2 py-1 border border-blue-300 rounded text-sm"
                        />
                      ) : (
                        <div className="truncate max-w-sm" title={req.description}>
                          {req.description}
                        </div>
                      )}
                    </td>

                    {/* 비고 */}
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {isBulkEditMode ? (
                        <input
                          type="text"
                          value={bulkEditData[req.id]?.note || ''}
                          onChange={(e) => handleUpdateBulkEditData(req.id, 'note', e.target.value)}
                          className="w-full px-2 py-1 border border-yellow-400 rounded text-sm"
                          disabled={isDeleted}
                        />
                      ) : isEditing ? (
                        <input
                          type="text"
                          value={editingData.note}
                          onChange={(e) => setEditingData({ ...editingData, note: e.target.value })}
                          className="w-full px-2 py-1 border border-blue-300 rounded text-sm"
                        />
                      ) : (
                        <div className="truncate max-w-xs" title={req.note || '-'}>
                          {req.note || '-'}
                        </div>
                      )}
                    </td>

                    {/* 액션 (인라인 편집 모드에서만) */}
                    {!isBulkEditMode && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center space-x-2">
                          {isEditing ? (
                            <>
                              <button
                                onClick={() => handleSaveEdit(req)}
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
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => handleStartEdit(req)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                title="인라인 수정"
                              >
                                <Edit size={18} />
                              </button>
                              <button
                                onClick={() => onDelete(req)}
                                className="p-2 text-danger hover:bg-red-50 rounded-lg transition"
                                title="삭제"
                              >
                                <Trash2 size={18} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
