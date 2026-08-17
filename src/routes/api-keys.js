import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { requirePermission } from '../middleware/tenant.js';

const router = express.Router();

const apiKeys = new Map();

// Get all API keys (masked)
router.get('/', requirePermission('api.view'), (req, res) => {
  const tenantKeys = Array.from(apiKeys.values())
    .filter(k => k.tenant_id === req.tenant.id && !k.revoked_at)
    .map(k => ({
      id: k.id,
      name: k.name,
      key_preview: k.key.substring(0, 8) + '...',
      created_at: k.created_at,
      last_used_at: k.last_used_at
    }));

  res.json({
    data: tenantKeys,
    count: tenantKeys.length
  });
});

// Create API key
router.post('/', requirePermission('api.manage'), (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'שם API key חובה' });
  }

  const key = `crm_${uuidv4().replace(/-/g, '')}`;

  const apiKey = {
    id: uuidv4(),
    tenant_id: req.tenant.id,
    name,
    key,
    created_at: new Date().toISOString(),
    last_used_at: null,
    revoked_at: null
  };

  apiKeys.set(apiKey.id, apiKey);

  // Return full key only once
  res.status(201).json({
    id: apiKey.id,
    name: apiKey.name,
    key: apiKey.key,
    created_at: apiKey.created_at
  });
});

// Reveal the full key again (it's kept in plaintext server-side, so unlike
// a password there is no reason to force revoke+recreate just to see it).
// Gated behind api.manage (not api.view) since it's more sensitive than the
// masked list.
router.get('/:id/reveal', requirePermission('api.manage'), (req, res) => {
  const apiKey = apiKeys.get(req.params.id);

  if (!apiKey || apiKey.tenant_id !== req.tenant.id || apiKey.revoked_at) {
    return res.status(404).json({ error: 'API key לא נמצא' });
  }

  res.json({
    id: apiKey.id,
    name: apiKey.name,
    key: apiKey.key,
    created_at: apiKey.created_at
  });
});

// Revoke API key
router.delete('/:id', requirePermission('api.manage'), (req, res) => {
  const apiKey = apiKeys.get(req.params.id);

  if (!apiKey || apiKey.tenant_id !== req.tenant.id) {
    return res.status(404).json({ error: 'API key לא נמצא' });
  }

  apiKey.revoked_at = new Date().toISOString();
  res.json({ message: 'API key בוטל' });
});

// Verify API key (internal)
export function verifyApiKey(key) {
  const apiKey = Array.from(apiKeys.values()).find(k => k.key === key && !k.revoked_at);
  if (apiKey) {
    apiKey.last_used_at = new Date().toISOString();
  }
  return apiKey;
}

// Used when a business is deleted entirely (see routes/tenants.js)
export function deleteTenantApiKeys(tenantId) {
  Array.from(apiKeys.entries())
    .filter(([, k]) => k.tenant_id === tenantId)
    .forEach(([id]) => apiKeys.delete(id));
}

export default router;
