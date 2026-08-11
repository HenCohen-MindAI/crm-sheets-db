import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { requirePermission } from '../middleware/tenant.js';

const router = express.Router();

const webhooks = new Map();
const webhookLogs = new Map();

// Get all webhooks
router.get('/', requirePermission('webhooks.view'), (req, res) => {
  const tenantWebhooks = Array.from(webhooks.values())
    .filter(w => w.tenant_id === req.tenant.id);

  res.json({
    data: tenantWebhooks,
    count: tenantWebhooks.length
  });
});

// Create webhook
router.post('/', requirePermission('webhooks.create'), (req, res) => {
  const { event, url, method } = req.body;

  if (!event || !url) {
    return res.status(400).json({ error: 'Event ו-URL חובה' });
  }

  const webhook = {
    id: uuidv4(),
    tenant_id: req.tenant.id,
    event,
    url,
    method: method || 'POST',
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  webhooks.set(webhook.id, webhook);
  res.status(201).json(webhook);
});

// Delete webhook
router.delete('/:id', requirePermission('webhooks.delete'), (req, res) => {
  const webhook = webhooks.get(req.params.id);

  if (!webhook || webhook.tenant_id !== req.tenant.id) {
    return res.status(404).json({ error: 'Webhook לא נמצא' });
  }

  webhooks.delete(req.params.id);
  res.json({ message: 'Webhook נמחק' });
});

// Recent delivery attempts for a webhook (debugging aid)
router.get('/:id/logs', requirePermission('webhooks.view'), (req, res) => {
  const webhook = webhooks.get(req.params.id);

  if (!webhook || webhook.tenant_id !== req.tenant.id) {
    return res.status(404).json({ error: 'Webhook לא נמצא' });
  }

  const logs = Array.from(webhookLogs.values())
    .filter(l => l.webhook_id === req.params.id)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 20);

  res.json({ data: logs, count: logs.length });
});

// Trigger webhook (internal)
export async function triggerWebhook(tenantId, event, payload) {
  const tenantWebhooks = Array.from(webhooks.values())
    .filter(w => w.tenant_id === tenantId && w.event === event && w.active);

  for (const webhook of tenantWebhooks) {
    try {
      const response = await fetch(webhook.url, {
        method: webhook.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_id: uuidv4(),
          event,
          tenant_id: tenantId,
          ...payload,
          timestamp: new Date().toISOString()
        })
      });

      webhookLogs.set(uuidv4(), {
        webhook_id: webhook.id,
        event,
        url: webhook.url,
        status: response.status,
        success: response.ok,
        error: null,
        created_at: new Date().toISOString()
      });
    } catch (error) {
      webhookLogs.set(uuidv4(), {
        webhook_id: webhook.id,
        event,
        url: webhook.url,
        status: null,
        success: false,
        error: error.message,
        created_at: new Date().toISOString()
      });
      console.error(`Webhook failed for ${webhook.url}:`, error.message);
    }
  }
}

export default router;
