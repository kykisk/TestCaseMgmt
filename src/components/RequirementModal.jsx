import { useState, useEffect } from 'react';
import Modal from './common/Modal';
import Input from './common/Input';
import Select from './common/Select';
import Button from './common/Button';
import { DIVISIONS, getFunctionalRequirements } from '../utils/requirementCategories';

/**
 * 요구사항 생성/수정 모달
 */
export default function RequirementModal({ isOpen, onClose, onSave, selectedProject, initialData }) {
  const [formData, setFormData] = useState({
    reqId: '',
    division: '',
    functionalRequirement: '',
    description: '',
    note: '',
  });

  const isEditMode = !!initialData;

  const [functionalOptions, setFunctionalOptions] = useState([]);

  // initialData로 폼 초기화 (편집 모드)
  useEffect(() => {
    if (initialData) {
      setFormData({
        reqId: initialData.id,
        division: initialData.division || initialData.category,
        functionalRequirement: initialData.functionalRequirement || initialData.sub_category,
        description: initialData.description || '',
        note: initialData.note || initialData.notes || '',
      });
      // 구분에 맞는 기능요구사항 옵션 설정
      if (initialData.division || initialData.category) {
        const options = getFunctionalRequirements(initialData.division || initialData.category);
        setFunctionalOptions(options);
      }
    } else {
      // 새 요구사항일 때 초기화
      setFormData({
        reqId: '',
        division: '',
        functionalRequirement: '',
        description: '',
        note: '',
      });
      setFunctionalOptions([]);
    }
  }, [initialData, isOpen]);

  // 구분 변경 시 기능요구사항 옵션 업데이트 (Cascading)
  useEffect(() => {
    if (formData.division) {
      const options = getFunctionalRequirements(formData.division);
      setFunctionalOptions(options);
      // 구분이 변경되면 기능요구사항 초기화 (편집 모드가 아닐 때만)
      if (!isEditMode) {
        setFormData(prev => ({ ...prev, functionalRequirement: '' }));
      }
    } else {
      setFunctionalOptions([]);
    }
  }, [formData.division]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.reqId.trim()) {
      alert('요구사항 ID를 입력해주세요.');
      return;
    }

    if (!formData.division) {
      alert('구분을 선택해주세요.');
      return;
    }

    if (!formData.functionalRequirement) {
      alert('기능 요구사항을 선택해주세요.');
      return;
    }

    if (!formData.description.trim()) {
      alert('설명을 입력해주세요.');
      return;
    }

    onSave(formData);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      reqId: '',
      division: '',
      functionalRequirement: '',
      description: '',
      note: '',
    });
    setFunctionalOptions([]);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const divisionOptions = DIVISIONS.map(div => ({
    value: div,
    label: div,
  }));

  const functionalReqOptions = functionalOptions.map(req => ({
    value: req,
    label: req,
  }));

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={isEditMode ? "요구사항 수정" : "새 요구사항 등록"}>
      <form onSubmit={handleSubmit}>
        <Input
          label="요구사항 ID"
          value={formData.reqId}
          onChange={(e) => setFormData({ ...formData, reqId: e.target.value })}
          placeholder="예: REQ-20250121-001"
          required
          disabled={isEditMode}
        />

        <Select
          label="구분"
          value={formData.division}
          onChange={(e) => setFormData({ ...formData, division: e.target.value })}
          options={divisionOptions}
          placeholder="구분을 선택하세요"
          required
        />

        <Select
          label="기능 요구사항"
          value={formData.functionalRequirement}
          onChange={(e) => setFormData({ ...formData, functionalRequirement: e.target.value })}
          options={functionalReqOptions}
          placeholder={formData.division ? '기능 요구사항을 선택하세요' : '먼저 구분을 선택하세요'}
          required
          disabled={!formData.division}
        />

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            설명 <span className="text-danger">*</span>
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="요구사항 상세 설명을 입력하세요"
            rows={4}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            비고
          </label>
          <textarea
            value={formData.note}
            onChange={(e) => setFormData({ ...formData, note: e.target.value })}
            placeholder="추가 비고 사항 (선택사항)"
            rows={2}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <Button type="button" variant="secondary" onClick={handleClose}>
            취소
          </Button>
          <Button type="submit" variant="primary">
            {isEditMode ? '수정' : '등록'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
