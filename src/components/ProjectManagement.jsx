import { useState, useEffect } from 'react';
import { Edit, Trash2, Plus, FolderOpen } from 'lucide-react';
import Button from './common/Button';
import ProjectContextEditor from './ProjectContextEditor';

/**
 * 프로젝트 관리 화면
 */
export default function ProjectManagement({ projects, selectedProject, onSelectProject, onCreateProject, onDeleteProject, testCases }) {
  const [activeTab, setActiveTab] = useState('info');
  const [editingProject, setEditingProject] = useState(null);

  useEffect(() => {
    if (selectedProject) {
      setActiveTab('info');
    }
  }, [selectedProject]);

  const handleDelete = async (project) => {
    const confirmed = window.confirm(
      `프로젝트 "${project.name}"를 삭제하시겠습니까?\n\n모든 데이터(요구사항, 테스트케이스, 테스트 수행)가 삭제됩니다.`
    );

    if (!confirmed) return;

    onDeleteProject(project);
  };

  if (!selectedProject) {
    return (
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">프로젝트 관리</h2>
          <p className="text-gray-600">프로젝트를 선택하여 관리하거나 새 프로젝트를 생성하세요.</p>
        </div>

        <div className="flex justify-end mb-4">
          <Button
            onClick={onCreateProject}
            variant="primary"
            className="flex items-center space-x-2"
          >
            <Plus size={18} />
            <span>새 프로젝트 생성</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <div
              key={project.id}
              className="border-2 border-gray-200 rounded-lg p-6 hover:border-primary hover:shadow-lg transition cursor-pointer"
              onClick={() => onSelectProject(project)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{project.name}</h3>
                  {project.description && (
                    <p className="text-sm text-gray-600">{project.description}</p>
                  )}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(project);
                  }}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  title="삭제"
                >
                  <Trash2 size={18} />
                </button>
              </div>
              <p className="text-xs text-gray-500">
                생성: {new Date(project.created_at).toLocaleDateString('ko-KR')}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => onSelectProject(null)}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <FolderOpen size={20} />
          <span>프로젝트 목록으로</span>
        </button>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedProject.name}</h2>
          {selectedProject.description && (
            <p className="text-gray-600">{selectedProject.description}</p>
          )}
          <p className="text-sm text-gray-500 mt-2">
            생성: {new Date(selectedProject.created_at).toLocaleString('ko-KR')}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 border-b-2">
        <button
          onClick={() => setActiveTab('info')}
          className={`px-6 py-3 font-medium transition ${
            activeTab === 'info'
              ? 'border-b-4 border-primary text-primary -mb-0.5'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          기본 정보
        </button>
        <button
          onClick={() => setActiveTab('context')}
          className={`px-6 py-3 font-medium transition ${
            activeTab === 'context'
              ? 'border-b-4 border-primary text-primary -mb-0.5'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          프로젝트 컨텍스트
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          className={`px-6 py-3 font-medium transition ${
            activeTab === 'stats'
              ? 'border-b-4 border-primary text-primary -mb-0.5'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          통계
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'info' && (
        <div>
          <h3 className="text-xl font-semibold mb-4">프로젝트 기본 정보</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">프로젝트 ID</label>
              <p className="text-gray-900 bg-gray-50 p-3 rounded-lg font-mono text-sm">{selectedProject.id}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">프로젝트명</label>
              <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedProject.name}</p>
            </div>
            {selectedProject.description && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">설명</label>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedProject.description}</p>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">생성일</label>
              <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                {new Date(selectedProject.created_at).toLocaleString('ko-KR')}
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'context' && (
        <ProjectContextEditor selectedProject={selectedProject} testCases={testCases} />
      )}

      {activeTab === 'stats' && (
        <div>
          <h3 className="text-xl font-semibold mb-4">프로젝트 통계</h3>
          <p className="text-gray-500">프로젝트별 통계 기능이 곧 추가됩니다.</p>
        </div>
      )}
    </div>
  );
}
