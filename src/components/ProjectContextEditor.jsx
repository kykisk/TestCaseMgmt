import { useState, useEffect } from 'react';
import { Save, BookOpen, Check, X } from 'lucide-react';
import Button from './common/Button';

/**
 * 프로젝트 컨텍스트 편집기
 */
export default function ProjectContextEditor({ selectedProject, testCases }) {
  const [context, setContext] = useState({
    overview: '',
    tech_stack: '',
    glossary: '',
    business_rules: '',
    domain_knowledge: '',
    sample_testcase_ids: [],
    additional_context: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isSelectingSamples, setIsSelectingSamples] = useState(false);

  useEffect(() => {
    if (selectedProject) {
      loadContext();
    }
  }, [selectedProject]);

  const loadContext = async () => {
    try {
      const response = await fetch(`/api/project-context/${selectedProject.id}`);
      const data = await response.json();
      setContext(data);
    } catch (error) {
      console.error('컨텍스트 로드 실패:', error);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/project-context/${selectedProject.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(context),
      });

      if (!response.ok) {
        throw new Error('저장 실패');
      }

      alert('프로젝트 컨텍스트가 저장되었습니다!');
    } catch (error) {
      console.error('저장 실패:', error);
      alert('저장에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleSampleTC = (tcId) => {
    if (context.sample_testcase_ids.includes(tcId)) {
      setContext({
        ...context,
        sample_testcase_ids: context.sample_testcase_ids.filter(id => id !== tcId),
      });
    } else {
      setContext({
        ...context,
        sample_testcase_ids: [...context.sample_testcase_ids, tcId],
      });
    }
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
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">프로젝트 컨텍스트</h2>
        <p className="text-gray-600">
          AI가 프로젝트에 맞는 테스트케이스를 생성할 수 있도록 프로젝트 정보를 입력하세요.
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-800">
          💡 여기에 입력한 정보는 AI 테스트케이스 생성 시 자동으로 제공됩니다.
        </p>
      </div>

      <div className="space-y-6">
        {/* Overview */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            프로젝트 개요
          </label>
          <textarea
            value={context.overview}
            onChange={(e) => setContext({ ...context, overview: e.target.value })}
            placeholder="예: 이 프로젝트는 온라인 쇼핑몰로, 사용자가 상품을 검색하고 주문할 수 있습니다. 주요 사용자는 일반 고객과 판매자입니다."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none"
            rows="4"
          />
          <p className="text-xs text-gray-500 mt-1">
            프로젝트의 목적, 주요 기능, 사용자 등을 설명하세요
          </p>
        </div>

        {/* Tech Stack */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            기술 스택
          </label>
          <textarea
            value={context.tech_stack}
            onChange={(e) => setContext({ ...context, tech_stack: e.target.value })}
            placeholder="예: React, Node.js, PostgreSQL, REST API, JWT 인증"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none"
            rows="3"
          />
          <p className="text-xs text-gray-500 mt-1">
            사용하는 프레임워크, 라이브러리, 데이터베이스 등
          </p>
        </div>

        {/* Glossary */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            용어집 (프로젝트 특화 용어)
          </label>
          <textarea
            value={context.glossary}
            onChange={(e) => setContext({ ...context, glossary: e.target.value })}
            placeholder="예:
- SKU: Stock Keeping Unit (재고 관리 단위)
- PO: Purchase Order (구매 주문서)
- ROI: Return on Investment (투자 수익률)"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none font-mono text-sm"
            rows="5"
          />
          <p className="text-xs text-gray-500 mt-1">
            프로젝트에서 사용하는 특수 용어나 약어를 정의하세요
          </p>
        </div>

        {/* Business Rules */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            비즈니스 규칙
          </label>
          <textarea
            value={context.business_rules}
            onChange={(e) => setContext({ ...context, business_rules: e.target.value })}
            placeholder="예:
- 주문 금액이 5만원 이상일 경우 무료 배송
- 회원 등급에 따라 할인율이 다름 (일반 0%, VIP 5%, VVIP 10%)
- 재고가 0인 상품은 주문 불가"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none"
            rows="5"
          />
          <p className="text-xs text-gray-500 mt-1">
            검증해야 할 비즈니스 규칙이나 제약사항
          </p>
        </div>

        {/* Domain Knowledge */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            도메인 지식
          </label>
          <textarea
            value={context.domain_knowledge}
            onChange={(e) => setContext({ ...context, domain_knowledge: e.target.value })}
            placeholder="예: 전자상거래 도메인에서는 결제 프로세스, 재고 관리, 배송 추적이 중요합니다. PG사 연동 시 결제 실패에 대한 롤백 처리가 필수입니다."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none"
            rows="4"
          />
          <p className="text-xs text-gray-500 mt-1">
            도메인 특성, 중요 프로세스, 알아야 할 배경 지식
          </p>
        </div>

        {/* Sample Testcases */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-semibold text-gray-900">
              샘플 테스트케이스 (레퍼런스)
            </label>
            <Button
              onClick={() => setIsSelectingSamples(!isSelectingSamples)}
              variant="secondary"
              className="text-xs py-1 px-3"
            >
              {isSelectingSamples ? '선택 완료' : '샘플 선택'}
            </Button>
          </div>

          {isSelectingSamples ? (
            <div className="border border-gray-300 rounded-lg p-4 max-h-64 overflow-y-auto">
              {testCases.length === 0 ? (
                <p className="text-gray-500 text-sm">테스트케이스가 없습니다.</p>
              ) : (
                <div className="space-y-2">
                  {testCases.map((tc) => (
                    <label
                      key={tc.id}
                      className={`flex items-start space-x-3 p-3 rounded-lg cursor-pointer transition ${
                        context.sample_testcase_ids.includes(tc.id)
                          ? 'bg-blue-50 border-2 border-blue-300'
                          : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={context.sample_testcase_ids.includes(tc.id)}
                        onChange={() => handleToggleSampleTC(tc.id)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-sm text-gray-900">{tc.id}</p>
                        <p className="text-sm text-gray-700">{tc.title}</p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div>
              {context.sample_testcase_ids.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {context.sample_testcase_ids.map((tcId) => {
                    const tc = testCases.find(t => t.id === tcId);
                    return (
                      <span
                        key={tcId}
                        className="px-3 py-1 bg-green-100 text-green-800 rounded-lg text-sm font-medium flex items-center space-x-2"
                      >
                        <Check size={14} />
                        <span>{tcId}</span>
                      </span>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">선택된 샘플 테스트케이스가 없습니다.</p>
              )}
            </div>
          )}
          <p className="text-xs text-gray-500 mt-2">
            잘 작성된 테스트케이스를 선택하면 AI가 그 스타일을 참고합니다
          </p>
        </div>

        {/* Additional Context */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            추가 컨텍스트 (자유 형식)
          </label>
          <textarea
            value={context.additional_context}
            onChange={(e) => setContext({ ...context, additional_context: e.target.value })}
            placeholder="기타 AI에게 알려주고 싶은 정보를 자유롭게 작성하세요..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none"
            rows="4"
          />
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-6 border-t mt-6">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          variant="primary"
          className="flex items-center space-x-2"
        >
          {isSaving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>저장 중...</span>
            </>
          ) : (
            <>
              <Save size={18} />
              <span>저장</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
