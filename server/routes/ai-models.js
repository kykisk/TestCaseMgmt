/**
 * AI Model Configuration API Routes
 */

const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const crypto = require('crypto');

// 암호화/복호화 키 (정확히 32자)
const ENCRYPTION_KEY = (process.env.ENCRYPTION_KEY || 'testcase-ai-key-32characters!').padEnd(32, '!').substring(0, 32);
const IV_LENGTH = 16;

// API Key 암호화
function encryptApiKey(apiKey) {
  if (!apiKey) return null;
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(apiKey, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

// API Key 복호화
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

// GET all AI model configs (프로젝트별 또는 전역)
router.get('/', async (req, res) => {
  try {
    const { project_id } = req.query;

    let query = 'SELECT * FROM ai_model_configs WHERE is_active = true';
    const params = [];

    if (project_id) {
      query += ' AND (project_id = $1 OR project_id IS NULL)';
      params.push(project_id);
    } else {
      query += ' AND project_id IS NULL';
    }

    query += ' ORDER BY is_default DESC, created_at DESC';

    const result = await pool.query(query, params);

    // API Key는 마스킹해서 반환
    const configs = result.rows.map(config => ({
      ...config,
      api_key_encrypted: config.api_key_encrypted ? '****' : null,
      has_api_key: !!config.api_key_encrypted,
    }));

    res.json(configs);
  } catch (error) {
    console.error('Error fetching AI model configs:', error);
    res.status(500).json({ error: 'Failed to fetch AI model configs' });
  }
});

// GET default AI model config
router.get('/default', async (req, res) => {
  try {
    const { project_id } = req.query;

    let query = `
      SELECT * FROM ai_model_configs
      WHERE is_active = true AND is_default = true
    `;
    const params = [];

    if (project_id) {
      query += ' AND (project_id = $1 OR project_id IS NULL)';
      params.push(project_id);
    } else {
      query += ' AND project_id IS NULL';
    }

    query += ' ORDER BY project_id DESC NULLS LAST LIMIT 1';

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No default AI model configured' });
    }

    const config = result.rows[0];

    // API Key 복호화 (실제 사용을 위해)
    if (config.api_key_encrypted) {
      config.api_key = decryptApiKey(config.api_key_encrypted);
      delete config.api_key_encrypted;
    }

    res.json(config);
  } catch (error) {
    console.error('Error fetching default AI model:', error);
    res.status(500).json({ error: 'Failed to fetch default AI model' });
  }
});

// POST create AI model config
router.post('/', async (req, res) => {
  try {
    const {
      project_id,
      name,
      model_type,
      provider,
      api_key,
      model_id,
      endpoint_url,
      parameters,
      is_default,
    } = req.body;

    if (!name || !model_type || !provider) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // API Key 암호화
    const encryptedApiKey = api_key ? encryptApiKey(api_key) : null;

    // 기본 모델로 설정하는 경우, 다른 모델들의 is_default를 false로
    if (is_default) {
      await pool.query(
        'UPDATE ai_model_configs SET is_default = false WHERE project_id IS NOT DISTINCT FROM $1',
        [project_id || null]
      );
    }

    const result = await pool.query(
      `INSERT INTO ai_model_configs
       (project_id, name, model_type, provider, api_key_encrypted, model_id, endpoint_url, parameters, is_default)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9)
       RETURNING *`,
      [
        project_id || null,
        name,
        model_type,
        provider,
        encryptedApiKey,
        model_id,
        endpoint_url,
        JSON.stringify(parameters || {}),
        is_default || false,
      ]
    );

    const config = result.rows[0];
    // API Key 마스킹
    config.api_key_encrypted = config.api_key_encrypted ? '****' : null;
    config.has_api_key = !!result.rows[0].api_key_encrypted;

    res.status(201).json(config);
  } catch (error) {
    console.error('Error creating AI model config:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      error: 'Failed to create AI model config',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// PUT update AI model config
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      model_type,
      provider,
      api_key,
      model_id,
      endpoint_url,
      parameters,
      is_default,
    } = req.body;

    // 기존 설정 가져오기
    const existingResult = await pool.query(
      'SELECT * FROM ai_model_configs WHERE id = $1',
      [id]
    );

    if (existingResult.rows.length === 0) {
      return res.status(404).json({ error: 'AI model config not found' });
    }

    const existing = existingResult.rows[0];

    // API Key 처리 (제공되면 암호화, 아니면 기존 유지)
    let encryptedApiKey = existing.api_key_encrypted;
    if (api_key) {
      encryptedApiKey = encryptApiKey(api_key);
    }

    // 기본 모델로 설정하는 경우
    if (is_default) {
      await pool.query(
        'UPDATE ai_model_configs SET is_default = false WHERE project_id IS NOT DISTINCT FROM $1 AND id != $2',
        [existing.project_id, id]
      );
    }

    const result = await pool.query(
      `UPDATE ai_model_configs
       SET name = $1, model_type = $2, provider = $3, api_key_encrypted = $4,
           model_id = $5, endpoint_url = $6, parameters = $7::jsonb, is_default = $8
       WHERE id = $9
       RETURNING *`,
      [
        name || existing.name,
        model_type || existing.model_type,
        provider || existing.provider,
        encryptedApiKey,
        model_id || existing.model_id,
        endpoint_url || existing.endpoint_url,
        JSON.stringify(parameters || existing.parameters),
        is_default !== undefined ? is_default : existing.is_default,
        id,
      ]
    );

    const config = result.rows[0];
    config.api_key_encrypted = config.api_key_encrypted ? '****' : null;
    config.has_api_key = !!result.rows[0].api_key_encrypted;

    res.json(config);
  } catch (error) {
    console.error('Error updating AI model config:', error);
    res.status(500).json({ error: 'Failed to update AI model config' });
  }
});

// DELETE AI model config
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM ai_model_configs WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'AI model config not found' });
    }

    res.json({ message: 'AI model config deleted successfully' });
  } catch (error) {
    console.error('Error deleting AI model config:', error);
    res.status(500).json({ error: 'Failed to delete AI model config' });
  }
});

module.exports = router;
