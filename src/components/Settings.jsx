import { useState } from 'react';
import { Settings as SettingsIcon, Bot, BookOpen } from 'lucide-react';
import AIModelSettings from './AIModelSettings';
import ProjectContextEditor from './ProjectContextEditor';

/**
 * 설정 메인 화면 (탭 방식)
 */
export default function Settings({ selectedProject, testCases }) {
  const [activeTab, setActiveTab] = useState('ai-models');

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold flex items-center space-x-3 mb-2">
          <SettingsIcon size={32} />
          <span>설정</span>
        </h2>
        <p className="text-gray-600">시스템 및 프로젝트 설정을 관리합니다.</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 border-b-2">
        <button
          onClick={() => setActiveTab('ai-models')}
          className={`px-6 py-3 font-medium transition flex items-center space-x-2 ${
            activeTab === 'ai-models'
              ? 'border-b-4 border-primary text-primary -mb-0.5'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Bot size={20} />
          <span>AI 모델 설정</span>
        </button>
        <button
          onClick={() => setActiveTab('project-context')}
          className={`px-6 py-3 font-medium transition flex items-center space-x-2 ${
            activeTab === 'project-context'
              ? 'border-b-4 border-primary text-primary -mb-0.5'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <BookOpen size={20} />
          <span>프로젝트 컨텍스트</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'ai-models' ? (
        <AIModelSettings selectedProject={selectedProject} />
      ) : (
        <ProjectContextEditor selectedProject={selectedProject} testCases={testCases} />
      )}
    </div>
  );
}
