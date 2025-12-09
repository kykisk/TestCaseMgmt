import { useState } from 'react';
import Modal from './common/Modal';
import Input from './common/Input';
import Button from './common/Button';

/**
 * 프로젝트 생성 모달
 */
export default function ProjectModal({ isOpen, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert('프로젝트명을 입력해주세요.');
      return;
    }

    onSave(formData);

    // 폼 초기화
    setFormData({
      name: '',
      description: '',
    });
  };

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="새 프로젝트 생성">
      <form onSubmit={handleSubmit}>
        <Input
          label="프로젝트명"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="프로젝트명을 입력하세요"
          required
        />

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            프로젝트 설명
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="프로젝트 설명을 입력하세요 (선택사항)"
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <Button type="button" variant="secondary" onClick={handleClose}>
            취소
          </Button>
          <Button type="submit" variant="primary">
            생성
          </Button>
        </div>
      </form>
    </Modal>
  );
}
