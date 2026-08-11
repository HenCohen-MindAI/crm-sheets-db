import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { requirePermission } from '../middleware/tenant.js';

const router = express.Router();

const activities = new Map();

// Log activity (internal)
export function logActivity(tenantId, event, data) {
  const activity = {
    id: uuidv4(),
    tenant_id: tenantId,
    event,
    description: data.description || '',
    customer_id: data.customer_id || null,
    previous_value: data.previous_value || null,
    new_value: data.new_value || null,
    source: data.source || 'manual',
    user_id: data.user_id || null,
    created_at: new Date().toISOString()
  };

  activities.set(activity.id, activity);
  return activity;
}

// Get all activities
router.get('/', requirePermission('activity.view'), (req, res) => {
  const tenantActivities = Array.from(activities.values())
    .filter(a => a.tenant_id === req.tenant.id)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 100);

  res.json({
    data: tenantActivities,
    count: tenantActivities.length
  });
});

// Get activities for customer
router.get('/customer/:customerId', requirePermission('activity.view'), (req, res) => {
  const customerActivities = Array.from(activities.values())
    .filter(a => a.tenant_id === req.tenant.id && a.customer_id === req.params.customerId)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  res.json({
    data: customerActivities,
    count: customerActivities.length
  });
});

// Used when a business is deleted entirely (see routes/tenants.js)
export function deleteTenantActivities(tenantId) {
  Array.from(activities.entries())
    .filter(([, a]) => a.tenant_id === tenantId)
    .forEach(([id]) => activities.delete(id));
}

export default router;
