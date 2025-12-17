import { useState, useEffect } from 'react';
import { X, Key } from 'lucide-react';
import Modal from './common/Modal';
import Input from './common/Input';
import Button from './common/Button';

/**
 * AI 모델 설정 추가/편집 모달
 */
export default function AIModelConfigModal({ isOpen, onClose, onSave, selectedProject, editingConfig }) {
  const [formData, setFormData] = useState({
    name: '',
    model_type: 'claude',
    provider: 'aws-bedrock',
    api_key: '',
    model_id: '',
    endpoint_url: '',
    max_tokens: 16384,
    temperature: 0.7,
    is_default: false,
  });

  useEffect(() => {
    if (editingConfig) {
      setFormData({
        name: editingConfig.name || '',
        model_type: editingConfig.model_type || 'claude',
        provider: editingConfig.provider || 'aws-bedrock',
        api_key: '', // 보안상 빈 값
        model_id: editingConfig.model_id || '',
        endpoint_url: editingConfig.endpoint_url || '',
        max_tokens: editingConfig.parameters?.max_tokens || 16384,
        temperature: editingConfig.parameters?.temperature || 0.7,
        is_default: editingConfig.is_default || false,
      });
    } else {
      // 기본값
      setFormData({
        name: '',
        model_type: 'gpt-oss-120b',
        provider: 'litellm',
        api_key: '',
        model_id: 'gpt-oss-120b',
        endpoint_url: 'https://dev01-plm.samsungds.net:3111/v1',
        max_tokens: 16384,
        temperature: 0.7,
        is_default: false,
      });
    }
  }, [editingConfig, isOpen]);

  const modelTypeOptions = [
    { value: 'claude', label: 'Claude (Anthropic)', providers: ['aws-bedrock', 'anthropic'] },
    { value: 'openai', label: 'GPT (OpenAI)', providers: ['openai'] },
    { value: 'gpt-oss-120b', label: 'GPT-OSS-120B (Samsung)', providers: ['litellm'] },
    { value: 'gemini', label: 'Gemini (Google)', providers: ['google'] },
    { value: 'custom', label: 'Custom API', providers: ['custom'] },
  ];

  const providerOptions = {
    'claude': [
      { value: 'aws-bedrock', label: 'AWS Bedrock' },
      { value: 'anthropic', label: 'Anthropic API' },
    ],
    'openai': [
      { value: 'openai', label: 'OpenAI API' },
    ],
    'gpt-oss-120b': [
      { value: 'litellm', label: 'LiteLLM (Samsung)' },
    ],
    'gemini': [
      { value: 'google', label: 'Google AI' },
    ],
    'custom': [
      { value: 'custom', label: 'Custom Endpoint' },
    ],
  };

  const modelIdExamples = {
    'aws-bedrock-claude': 'us.anthropic.claude-sonnet-4-5-20250929-v1:0',
    'anthropic-claude': 'claude-3-5-sonnet-20241022',
    'openai': 'gpt-4-turbo-preview',
    'litellm-gpt-oss-120b': 'gpt-oss-120b',
    'google': 'gemini-pro',
    'custom': 'your-model-id',
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert('설정 이름을 입력해주세요.');
      return;
    }

    try {
      const payload = {
        project_id: selectedProject?.id,
        name: formData.name,
        model_type: formData.model_type,
        provider: formData.provider,
        api_key: formData.api_key || undefined,
        model_id: formData.model_id,
        endpoint_url: formData.endpoint_url,
        parameters: {
          max_tokens: parseInt(formData.max_tokens),
          temperature: parseFloat(formData.temperature),
        },
        is_default: formData.is_default,
      };

      const url = editingConfig
        ? `/api/ai-models/${editingConfig.id}`
        : '/api/ai-models';

      const method = editingConfig ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: '알 수 없는 오류' }));
        console.error('백엔드 에러:', errorData);
        throw new Error(errorData.details || errorData.error || '저장 실패');
      }

      const newConfig = await response.json();
      alert(`AI 모델 설정이 ${editingConfig ? '수정' : '추가'}되었습니다!`);
      onSave(newConfig);
      onClose();
    } catch (error) {
      console.error('저장 실패:', error);
      alert(`저장에 실패했습니다.\n\n에러: ${error.message}`);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-3xl">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {editingConfig ? 'AI 모델 설정 수정' : '새 AI 모델 추가'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              설정 이름 <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="예: 내 Claude 설정, GPT-4 Turbo"
              required
            />
          </div>

          {/* Model Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              AI 모델 타입 <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.model_type}
              onChange={(e) => {
                const newType = e.target.value;
                const defaultProvider = modelTypeOptions.find(o => o.value === newType)?.providers[0];
                setFormData({
                  ...formData,
                  model_type: newType,
                  provider: defaultProvider || 'custom',
                });
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              required
            >
              {modelTypeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Provider */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Provider <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.provider}
              onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              required
            >
              {(providerOptions[formData.model_type] || []).map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* API Key */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              API Key {formData.provider === 'aws-bedrock' ? '(AWS 자격증명은 .env 사용)' : ''}
            </label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="password"
                value={formData.api_key}
                onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
                placeholder={
                  formData.provider === 'aws-bedrock'
                    ? '.env 파일의 AWS_ACCESS_KEY_ID 사용'
                    : 'sk-...'
                }
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {editingConfig && '비워두면 기존 API Key 유지'}
            </p>
          </div>

          {/* Model ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Model ID
            </label>
            <Input
              value={formData.model_id}
              onChange={(e) => setFormData({ ...formData, model_id: e.target.value })}
              placeholder={modelIdExamples[`${formData.provider}-${formData.model_type}`] || modelIdExamples[formData.provider] || ''}
            />
          </div>

          {/* Parameters */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Tokens
              </label>
              <Input
                type="number"
                value={formData.max_tokens}
                onChange={(e) => setFormData({ ...formData, max_tokens: e.target.value })}
                min="1024"
                max="32768"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Temperature
              </label>
              <Input
                type="number"
                step="0.1"
                value={formData.temperature}
                onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
                min="0"
                max="1"
              />
            </div>
          </div>

          {/* Endpoint URL (Custom & LiteLLM) */}
          {(formData.provider === 'custom' || formData.provider === 'litellm') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Endpoint URL {formData.provider === 'litellm' && '(선택)'}
              </label>
              <Input
                value={formData.endpoint_url}
                onChange={(e) => setFormData({ ...formData, endpoint_url: e.target.value })}
                placeholder={
                  formData.provider === 'litellm'
                    ? 'https://dev01-plm.samsungds.net:3111/v1'
                    : 'https://api.example.com/v1/chat/completions'
                }
              />
              {formData.provider === 'litellm' && (
                <p className="text-xs text-gray-500 mt-1">
                  비워두면 기본 엔드포인트 사용
                </p>
              )}
            </div>
          )}

          {/* Default */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="is_default"
              checked={formData.is_default}
              onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
              className="rounded"
            />
            <label htmlFor="is_default" className="text-sm text-gray-700">
              이 모델을 기본으로 사용
            </label>
          </div>

          {/* Info */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              💡 기본 모델은 AI 테스트케이스 생성 시 자동으로 사용됩니다.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button type="button" variant="secondary" onClick={onClose}>
              취소
            </Button>
            <Button type="submit" variant="primary">
              {editingConfig ? '수정' : '추가'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
