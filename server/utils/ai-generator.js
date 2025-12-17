/**
 * AI 테스트케이스 생성 유틸리티
 * 다양한 AI 모델 지원
 */

const pool = require('../db/pool');
const crypto = require('crypto');

// API Key 복호화 (ai-models.js와 동일)
const ENCRYPTION_KEY = (process.env.ENCRYPTION_KEY || 'testcase-ai-key-32characters!').padEnd(32, '!').substring(0, 32);

function decryptApiKey(encryptedData) {
  if (!encryptedData) return null;
  const parts = encryptedData.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const encrypted = parts[1];
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// 특정 AI 모델 가져오기
async function getAIModelById(modelId) {
  const result = await pool.query(
    'SELECT * FROM ai_model_configs WHERE id = $1 AND is_active = true',
    [modelId]
  );

  if (result.rows.length === 0) {
    throw new Error('AI model not found');
  }

  const config = result.rows[0];

  // API Key 복호화
  if (config.api_key_encrypted) {
    config.api_key = decryptApiKey(config.api_key_encrypted);
  }

  return config;
}

// 기본 AI 모델 가져오기
async function getDefaultAIModel(projectId) {
  let query = `
    SELECT * FROM ai_model_configs
    WHERE is_active = true AND is_default = true
  `;
  const params = [];

  if (projectId) {
    query += ' AND (project_id = $1 OR project_id IS NULL)';
    params.push(projectId);
  } else {
    query += ' AND project_id IS NULL';
  }

  query += ' ORDER BY project_id DESC NULLS LAST LIMIT 1';

  const result = await pool.query(query, params);

  if (result.rows.length === 0) {
    throw new Error('No default AI model configured');
  }

  const config = result.rows[0];

  // API Key 복호화
  if (config.api_key_encrypted) {
    config.api_key = decryptApiKey(config.api_key_encrypted);
  }

  return config;
}

// AWS Bedrock Claude 호출
async function callAWSBedrock(prompt, config) {
  const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');

  // AWS 자격증명 (환경변수 또는 API Key)
  const awsAccessKeyId = process.env.AWS_ACCESS_KEY_ID || config.api_key?.split(':')[0];
  const awsSecretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || config.api_key?.split(':')[1];

  if (!awsAccessKeyId || !awsSecretAccessKey) {
    throw new Error('AWS credentials not configured');
  }

  const client = new BedrockRuntimeClient({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
      accessKeyId: awsAccessKeyId,
      secretAccessKey: awsSecretAccessKey,
    },
  });

  const payload = {
    anthropic_version: 'bedrock-2023-05-31',
    max_tokens: config.parameters?.max_tokens || 16384,
    temperature: config.parameters?.temperature || 0.7,
    messages: [{ role: 'user', content: prompt }],
  };

  const command = new InvokeModelCommand({
    modelId: config.model_id,
    contentType: 'application/json',
    accept: 'application/json',
    body: JSON.stringify(payload),
  });

  const response = await client.send(command);
  const responseBody = JSON.parse(new TextDecoder().decode(response.body));
  return responseBody.content[0].text;
}

// Anthropic API 직접 호출
async function callAnthropicAPI(prompt, config) {
  const Anthropic = require('@anthropic-ai/sdk');

  if (!config.api_key) {
    throw new Error('Anthropic API key not configured');
  }

  const anthropic = new Anthropic({ apiKey: config.api_key });

  const message = await anthropic.messages.create({
    model: config.model_id || 'claude-3-5-sonnet-20241022',
    max_tokens: config.parameters?.max_tokens || 16384,
    temperature: config.parameters?.temperature || 0.7,
    messages: [{ role: 'user', content: prompt }],
  });

  return message.content[0].text;
}

// OpenAI API 호출
async function callOpenAI(prompt, config) {
  if (!config.api_key) {
    throw new Error('OpenAI API key not configured');
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.api_key}`,
    },
    body: JSON.stringify({
      model: config.model_id || 'gpt-4-turbo-preview',
      max_tokens: config.parameters?.max_tokens || 16384,
      temperature: config.parameters?.temperature || 0.7,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

// Google Gemini API 호출
async function callGemini(prompt, config) {
  if (!config.api_key) {
    throw new Error('Google API key not configured');
  }

  const url = `https://generativelanguage.googleapis.com/v1/models/${config.model_id || 'gemini-pro'}:generateContent?key=${config.api_key}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        maxOutputTokens: config.parameters?.max_tokens || 16384,
        temperature: config.parameters?.temperature || 0.7,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
}

// LiteLLM 호출 (OpenAI 호환 형식)
async function callLiteLLM(prompt, config) {
  if (!config.api_key) {
    throw new Error('LiteLLM API key not configured');
  }

  const endpoint = config.endpoint_url || 'https://dev01-plm.samsungds.net:3111/v1';
  const url = `${endpoint}/chat/completions`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.api_key}`,
    },
    body: JSON.stringify({
      model: config.model_id || 'gpt-oss-120b',
      max_tokens: config.parameters?.max_tokens || 16384,
      temperature: config.parameters?.temperature || 0.7,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`LiteLLM API error: ${response.statusText} - ${errorText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

// Custom API 호출
async function callCustomAPI(prompt, config) {
  if (!config.endpoint_url) {
    throw new Error('Custom endpoint URL not configured');
  }

  const response = await fetch(config.endpoint_url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(config.api_key ? { 'Authorization': `Bearer ${config.api_key}` } : {}),
    },
    body: JSON.stringify({
      prompt: prompt,
      max_tokens: config.parameters?.max_tokens || 16384,
      temperature: config.parameters?.temperature || 0.7,
    }),
  });

  if (!response.ok) {
    throw new Error(`Custom API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.response || data.text || data.content;
}

// AI 호출 통합 함수
async function generateTestCases(prompt, projectId, aiModelId = null) {
  // 특정 모델 ID가 있으면 해당 모델, 없으면 기본 모델
  const config = aiModelId
    ? await getAIModelById(aiModelId)
    : await getDefaultAIModel(projectId);

  console.log(`[AI] Using model: ${config.name} (${config.provider})`);

  let aiResponse;

  // Provider에 따라 적절한 함수 호출
  switch (config.provider) {
    case 'aws-bedrock':
      aiResponse = await callAWSBedrock(prompt, config);
      break;

    case 'anthropic':
      aiResponse = await callAnthropicAPI(prompt, config);
      break;

    case 'openai':
      aiResponse = await callOpenAI(prompt, config);
      break;

    case 'litellm':
      aiResponse = await callLiteLLM(prompt, config);
      break;

    case 'google':
      aiResponse = await callGemini(prompt, config);
      break;

    case 'custom':
      aiResponse = await callCustomAPI(prompt, config);
      break;

    default:
      throw new Error(`Unsupported provider: ${config.provider}`);
  }

  return aiResponse;
}

module.exports = {
  generateTestCases,
  getDefaultAIModel,
  getAIModelById,
};
