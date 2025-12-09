-- ============================================
-- 테스트 수행 시스템 DB 스키마
-- ============================================

-- 1. 테스트 수행 Suite (방)
CREATE TABLE IF NOT EXISTS test_execution_suites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  purpose VARCHAR(100), -- 'QA테스트', '중간테스트', '완료테스트', '운영테스트' 등
  description TEXT,
  status VARCHAR(50) DEFAULT 'Not Started', -- 'Not Started', 'In Progress', 'Pass', 'Fail', 'Block'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. 테스트 수행 Item (Suite 안의 요구사항 그룹)
CREATE TABLE IF NOT EXISTS test_execution_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  suite_id UUID NOT NULL REFERENCES test_execution_suites(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL, -- "로그인 + 회원가입 통합 테스트"
  requirement_ids TEXT[], -- 여러 요구사항 ID 배열
  status VARCHAR(50) DEFAULT 'Not Started', -- 'Not Started', 'In Progress', 'Pass', 'Fail', 'Block'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. 테스트 수행 Run (수행 히스토리 - 1차, 2차, 3차...)
CREATE TABLE IF NOT EXISTS test_execution_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES test_execution_items(id) ON DELETE CASCADE,
  run_number INTEGER NOT NULL, -- 1, 2, 3...
  status VARCHAR(50) DEFAULT 'In Progress', -- 'In Progress', 'Pass', 'Fail', 'Block'
  executed_by VARCHAR(100), -- 테스터 이름 (선택)
  notes TEXT, -- 전체 비고
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. 테스트 케이스 결과 (각 TC별 Pass/Fail/Block/Skip)
CREATE TABLE IF NOT EXISTS test_case_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID NOT NULL REFERENCES test_execution_runs(id) ON DELETE CASCADE,
  testcase_id VARCHAR(50) NOT NULL, -- TC-001, TC-002 등
  result VARCHAR(20) NOT NULL, -- 'Pass', 'Fail', 'Block', 'Skip'
  notes TEXT, -- 각 TC별 비고
  executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_test_execution_suites_project ON test_execution_suites(project_id);
CREATE INDEX IF NOT EXISTS idx_test_execution_items_suite ON test_execution_items(suite_id);
CREATE INDEX IF NOT EXISTS idx_test_execution_runs_item ON test_execution_runs(item_id);
CREATE INDEX IF NOT EXISTS idx_test_case_results_run ON test_case_results(run_id);
CREATE INDEX IF NOT EXISTS idx_test_case_results_testcase ON test_case_results(testcase_id);

-- 업데이트 트리거
CREATE OR REPLACE FUNCTION update_test_execution_suites_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_test_execution_suites_updated_at
BEFORE UPDATE ON test_execution_suites
FOR EACH ROW
EXECUTE FUNCTION update_test_execution_suites_updated_at();

CREATE OR REPLACE FUNCTION update_test_execution_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_test_execution_items_updated_at
BEFORE UPDATE ON test_execution_items
FOR EACH ROW
EXECUTE FUNCTION update_test_execution_items_updated_at();
