-- ============================================
-- Function List 테이블
-- ============================================

CREATE TABLE IF NOT EXISTS function_list (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requirement_id VARCHAR(50) NOT NULL REFERENCES requirements(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,

  -- 함수 정보
  function_name VARCHAR(200) NOT NULL,
  description TEXT,

  -- 함수 시그니처
  parameters JSONB DEFAULT '[]'::jsonb, -- [{name, type, required, description}]
  return_type VARCHAR(100),
  return_description TEXT,

  -- 예외 처리
  exceptions TEXT[], -- ['InvalidEmailException', 'AccountLockedException']

  -- 사용 예시
  example_usage TEXT,

  -- 추가 정보
  notes TEXT,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_function_list_requirement ON function_list(requirement_id);
CREATE INDEX IF NOT EXISTS idx_function_list_project ON function_list(project_id);

-- 업데이트 트리거
CREATE OR REPLACE FUNCTION update_function_list_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_function_list_updated_at
BEFORE UPDATE ON function_list
FOR EACH ROW
EXECUTE FUNCTION update_function_list_updated_at();
