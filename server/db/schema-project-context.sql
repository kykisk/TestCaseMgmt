-- ============================================
-- 프로젝트 컨텍스트 테이블
-- ============================================

CREATE TABLE IF NOT EXISTS project_context (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID UNIQUE NOT NULL REFERENCES projects(id) ON DELETE CASCADE,

  -- 프로젝트 개요
  overview TEXT,

  -- 기술 스택
  tech_stack TEXT,

  -- 용어집 (프로젝트 특화 용어)
  glossary TEXT,

  -- 비즈니스 규칙
  business_rules TEXT,

  -- 도메인 지식
  domain_knowledge TEXT,

  -- 샘플 테스트케이스 ID 목록
  sample_testcase_ids TEXT[], -- ['TC-001', 'TC-002']

  -- 추가 컨텍스트 (자유 형식)
  additional_context TEXT,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_project_context_project ON project_context(project_id);

-- 업데이트 트리거
CREATE OR REPLACE FUNCTION update_project_context_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_project_context_updated_at
BEFORE UPDATE ON project_context
FOR EACH ROW
EXECUTE FUNCTION update_project_context_updated_at();
