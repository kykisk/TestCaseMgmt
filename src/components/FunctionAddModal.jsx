import { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import Modal from './common/Modal';
import Input from './common/Input';
import Button from './common/Button';

/**
 * Function 추가/편집 모달
 */
export default function FunctionAddModal({ isOpen, onClose, onSave, selectedProject, requirements, editingFunction }) {
  const [formData, setFormData] = useState({
    requirement_id: '',
    function_name: '',
    description: '',
    parameters: [],
    return_type: '',
    return_description: '',
    exceptions: [],
    example_usage: '',
    notes: '',
  });

  useEffect(() => {
    if (editingFunction) {
      setFormData({
        requirement_id: editingFunction.requirement_id || '',
        function_name: editingFunction.function_name || '',
        description: editingFunction.description || '',
        parameters: editingFunction.parameters || [],
        return_type: editingFunction.return_type || '',
        return_description: editingFunction.return_description || '',
        exceptions: editingFunction.exceptions || [],
        example_usage: editingFunction.example_usage || '',
        notes: editingFunction.notes || '',
      });
    } else {
      setFormData({
        requirement_id: '',
        function_name: '',
        description: '',
        parameters: [],
        return_type: '',
        return_description: '',
        exceptions: [],
        example_usage: '',
        notes: '',
      });
    }
  }, [editingFunction, isOpen]);

  const handleAddParameter = () => {
    setFormData({
      ...formData,
      parameters: [...formData.parameters, { name: '', type: '', required: true, description: '' }],
    });
  };

  const handleRemoveParameter = (index) => {
    setFormData({
      ...formData,
      parameters: formData.parameters.filter((_, i) => i !== index),
    });
  };

  const handleParameterChange = (index, field, value) => {
    const newParams = [...formData.parameters];
    newParams[index] = { ...newParams[index], [field]: value };
    setFormData({ ...formData, parameters: newParams });
  };

  const handleAddException = () => {
    const exceptionName = prompt('예외 이름을 입력하세요 (예: InvalidEmailException):');
    if (exceptionName) {
      setFormData({
        ...formData,
        exceptions: [...formData.exceptions, exceptionName],
      });
    }
  };

  const handleRemoveException = (index) => {
    setFormData({
      ...formData,
      exceptions: formData.exceptions.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.requirement_id) {
      alert('요구사항을 선택해주세요.');
      return;
    }

    if (!formData.function_name.trim()) {
      alert('함수명을 입력해주세요.');
      return;
    }

    try {
      const payload = {
        ...formData,
        project_id: selectedProject.id,
      };

      const url = editingFunction
        ? `/api/function-list/${editingFunction.id}`
        : '/api/function-list';

      const method = editingFunction ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: '저장 실패' }));
        throw new Error(errorData.details || errorData.error);
      }

      alert(`Function이 ${editingFunction ? '수정' : '추가'}되었습니다!`);
      onSave();
      onClose();
    } catch (error) {
      console.error('저장 실패:', error);
      alert(`저장에 실패했습니다.\n\n에러: ${error.message}`);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-4xl">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {editingFunction ? 'Function 수정' : '새 Function 추가'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Project Info */}
          {selectedProject && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-gray-600">
                프로젝트: <span className="font-semibold text-primary">{selectedProject.name}</span>
              </p>
            </div>
          )}

          {/* Requirement Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              연결할 요구사항 <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.requirement_id}
              onChange={(e) => setFormData({ ...formData, requirement_id: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              required
            >
              <option value="">요구사항 선택</option>
              {requirements.map((req) => (
                <option key={req.id} value={req.id}>
                  {req.id} - {req.functionalRequirement || req.title}
                </option>
              ))}
            </select>
          </div>

          {/* Function Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              함수명 <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.function_name}
              onChange={(e) => setFormData({ ...formData, function_name: e.target.value })}
              placeholder="예: validateUserLogin, createOrder, calculateDiscount"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              설명
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="이 함수가 하는 일을 설명하세요"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none"
              rows="3"
            />
          </div>

          {/* Parameters */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">파라미터</label>
              <Button
                type="button"
                onClick={handleAddParameter}
                variant="secondary"
                className="flex items-center space-x-1 text-xs py-1 px-3"
              >
                <Plus size={14} />
                <span>파라미터 추가</span>
              </Button>
            </div>

            {formData.parameters.length === 0 ? (
              <p className="text-sm text-gray-500">파라미터가 없습니다.</p>
            ) : (
              <div className="space-y-3">
                {formData.parameters.map((param, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="grid grid-cols-12 gap-3">
                      <div className="col-span-3">
                        <input
                          type="text"
                          value={param.name}
                          onChange={(e) => handleParameterChange(idx, 'name', e.target.value)}
                          placeholder="이름"
                          className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="text"
                          value={param.type}
                          onChange={(e) => handleParameterChange(idx, 'type', e.target.value)}
                          placeholder="타입"
                          className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                        />
                      </div>
                      <div className="col-span-1 flex items-center">
                        <label className="flex items-center space-x-1 text-xs">
                          <input
                            type="checkbox"
                            checked={param.required}
                            onChange={(e) => handleParameterChange(idx, 'required', e.target.checked)}
                            className="rounded"
                          />
                          <span>필수</span>
                        </label>
                      </div>
                      <div className="col-span-5">
                        <input
                          type="text"
                          value={param.description}
                          onChange={(e) => handleParameterChange(idx, 'description', e.target.value)}
                          placeholder="설명"
                          className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                        />
                      </div>
                      <div className="col-span-1 flex items-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveParameter(idx)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Return Type */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                반환 타입
              </label>
              <Input
                value={formData.return_type}
                onChange={(e) => setFormData({ ...formData, return_type: e.target.value })}
                placeholder="예: boolean, Object, string"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                반환 설명
              </label>
              <Input
                value={formData.return_description}
                onChange={(e) => setFormData({ ...formData, return_description: e.target.value })}
                placeholder="반환값 설명"
              />
            </div>
          </div>

          {/* Exceptions */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">예외 (Exceptions)</label>
              <Button
                type="button"
                onClick={handleAddException}
                variant="secondary"
                className="flex items-center space-x-1 text-xs py-1 px-3"
              >
                <Plus size={14} />
                <span>예외 추가</span>
              </Button>
            </div>

            {formData.exceptions.length === 0 ? (
              <p className="text-sm text-gray-500">예외가 없습니다.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {formData.exceptions.map((exc, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-red-100 text-red-800 rounded-lg text-sm flex items-center space-x-2"
                  >
                    <span>{exc}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveException(idx)}
                      className="hover:text-red-900"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Example Usage */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              사용 예시
            </label>
            <textarea
              value={formData.example_usage}
              onChange={(e) => setFormData({ ...formData, example_usage: e.target.value })}
              placeholder="예: validateUserLogin('user@example.com', 'password123')"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none font-mono text-sm"
              rows="2"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              비고
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="추가 정보나 특이사항"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none"
              rows="2"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button type="button" variant="secondary" onClick={onClose}>
              취소
            </Button>
            <Button type="submit" variant="primary">
              {editingFunction ? '수정' : '추가'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
