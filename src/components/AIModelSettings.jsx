import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Check, Key, Settings as SettingsIcon } from 'lucide-react';
import Button from './common/Button';
import AIModelConfigModal from './AIModelConfigModal';

/**
 * AI 모델 설정 화면
 */
export default function AIModelSettings({ selectedProject }) {
  const [configs, setConfigs] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState(null);

  useEffect(() => {
    loadConfigs();
  }, [selectedProject]);

  const loadConfigs = async () => {
    try {
      const url = selectedProject
        ? `/api/ai-models?project_id=${selectedProject.id}`
        : '/api/ai-models';

      const response = await fetch(url);
      const data = await response.json();
      setConfigs(data || []);
    } catch (error) {
      console.error('AI 모델 설정 로드 실패:', error);
      setConfigs([]);
    }
  };

  const handleDelete = async (config) => {
    const confirmed = window.confirm(
      `"${config.name}" 설정을 삭제하시겠습니까?`
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`/api/ai-models/${config.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('삭제 실패');
      }

      alert('삭제되었습니다.');
      loadConfigs();
    } catch (error) {
      console.error('삭제 실패:', error);
      alert('삭제에 실패했습니다.');
    }
  };

  const handleSetDefault = async (config) => {
    try {
      const response = await fetch(`/api/ai-models/${config.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_default: true }),
      });

      if (!response.ok) {
        throw new Error('기본 설정 변경 실패');
      }

      alert(`"${config.name}"을(를) 기본 모델로 설정했습니다.`);
      loadConfigs();
    } catch (error) {
      console.error('기본 설정 변경 실패:', error);
      alert('기본 설정 변경에 실패했습니다.');
    }
  };

  const getProviderBadge = (provider) => {
    const styles = {
      'aws-bedrock': 'bg-orange-100 text-orange-800',
      'anthropic': 'bg-purple-100 text-purple-800',
      'openai': 'bg-green-100 text-green-800',
      'google': 'bg-blue-100 text-blue-800',
      'custom': 'bg-gray-100 text-gray-800',
    };

    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${styles[provider] || styles['custom']}`}>
        {provider}
      </span>
    );
  };

  const getModelTypeBadge = (type) => {
    const labels = {
      'claude': 'Claude',
      'openai': 'GPT',
      'gemini': 'Gemini',
      'custom': 'Custom',
    };

    return labels[type] || type;
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">AI 모델 설정</h2>
        <p className="text-gray-600">테스트케이스 자동 생성에 사용할 AI 모델을 설정합니다.</p>
      </div>

      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-gray-600">
          {selectedProject ? (
            <span>프로젝트: <span className="font-semibold text-primary">{selectedProject.name}</span></span>
          ) : (
            <span>전역 설정</span>
          )}
        </div>
        <Button
          onClick={() => {
            setEditingConfig(null);
            setIsAddModalOpen(true);
          }}
          variant="primary"
          className="flex items-center space-x-2"
        >
          <Plus size={18} />
          <span>새 AI 모델 추가</span>
        </Button>
      </div>

      {configs.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <SettingsIcon size={64} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            설정된 AI 모델이 없습니다
          </h3>
          <p className="text-gray-500 mb-6">
            AI 테스트케이스 생성을 위해 AI 모델을 추가하세요.
          </p>
          <Button
            onClick={() => setIsAddModalOpen(true)}
            variant="primary"
            className="inline-flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>첫 AI 모델 추가</span>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {configs.map((config) => (
            <div
              key={config.id}
              className={`border-2 rounded-lg p-6 ${
                config.is_default
                  ? 'border-primary bg-blue-50'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{config.name}</h3>
                    {config.is_default && (
                      <span className="px-3 py-1 bg-primary text-white rounded-full text-xs font-semibold flex items-center space-x-1">
                        <Check size={14} />
                        <span>기본 모델</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-3 mb-3">
                    <span className="text-sm text-gray-600">
                      <span className="font-medium">모델:</span> {getModelTypeBadge(config.model_type)}
                    </span>
                    <span>•</span>
                    {getProviderBadge(config.provider)}
                  </div>

                  {config.model_id && (
                    <p className="text-sm text-gray-600 mb-2">
                      <span className="font-medium">Model ID:</span> {config.model_id}
                    </p>
                  )}

                  <div className="flex items-center space-x-2 text-sm">
                    {config.has_api_key ? (
                      <span className="text-green-600 flex items-center space-x-1">
                        <Key size={14} />
                        <span>API Key 설정됨</span>
                      </span>
                    ) : (
                      <span className="text-gray-400">API Key 없음</span>
                    )}
                    {config.parameters && Object.keys(config.parameters).length > 0 && (
                      <>
                        <span>•</span>
                        <span className="text-gray-500">
                          max_tokens: {config.parameters.max_tokens || '-'}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {!config.is_default && (
                    <Button
                      onClick={() => handleSetDefault(config)}
                      variant="secondary"
                      className="text-xs py-1 px-3"
                    >
                      기본으로 설정
                    </Button>
                  )}
                  <button
                    onClick={() => {
                      setEditingConfig(config);
                      setIsAddModalOpen(true);
                    }}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                    title="편집"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(config)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    title="삭제"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* AI 모델 추가/편집 모달 */}
      <AIModelConfigModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingConfig(null);
        }}
        onSave={(newConfig) => {
          setIsAddModalOpen(false);
          setEditingConfig(null);
          loadConfigs();
        }}
        selectedProject={selectedProject}
        editingConfig={editingConfig}
      />
    </div>
  );
}
