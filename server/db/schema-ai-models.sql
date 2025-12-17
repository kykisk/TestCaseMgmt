-- ============================================
-- AI 모델 설정 테이블
-- ============================================

CREATE TABLE IF NOT EXISTS ai_model_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL, -- 설정 이름 (예: "내 Claude 설정")
  model_type VARCHAR(50) NOT NULL, -- 'claude', 'openai', 'gemini', 'custom'
  provider VARCHAR(50) NOT NULL, -- 'aws-bedrock', 'anthropic', 'openai', 'google', 'custom'
  api_key_encrypted TEXT, -- 암호화된 API Key (선택적)
  model_id VARCHAR(100), -- 모델 ID (예: 'gpt-4', 'claude-3-5-sonnet')
  endpoint_url TEXT, -- 커스텀 엔드포인트 (선택적)
  parameters JSONB DEFAULT '{}'::jsonb, -- max_tokens, temperature 등
  is_default BOOLEAN DEFAULT false, -- 기본 모델 여부
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_ai_model_configs_project ON ai_model_configs(project_id);
CREATE INDEX IF NOT EXISTS idx_ai_model_configs_default ON ai_model_configs(is_default, is_active);

-- 업데이트 트리거
CREATE OR REPLACE FUNCTION update_ai_model_configs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_ai_model_configs_updated_at
BEFORE UPDATE ON ai_model_configs
FOR EACH ROW
EXECUTE FUNCTION update_ai_model_configs_updated_at();

-- 기본 AWS Bedrock Claude 설정 추가
INSERT INTO ai_model_configs (
  name,
  model_type,
  provider,
  model_id,
  parameters,
  is_default,
  is_active
) VALUES (
  'AWS Bedrock Claude Sonnet 4.5 (기본)',
  'claude',
  'aws-bedrock',
  'us.anthropic.claude-sonnet-4-5-20250929-v1:0',
  '{"max_tokens": 16384, "temperature": 0.7}'::jsonb,
  true,
  true
) ON CONFLICT DO NOTHING;
