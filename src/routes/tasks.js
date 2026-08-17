import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { requirePermission } from '../middleware/tenant.js';
import { triggerWebhook } from './webhooks.js';
import { logActivity } from './activity.js';
import { listUsersByTenant } from '../services/user-service.js';

const router = express.Router();

const tasks = new Map();

// Returns the tenant-scoped user for assignment, or throws if the id
// doesn't belong to this tenant (or doesn't exist).
function resolveAssignee(tenantId, assignedTo) {
  if (!assignedTo) return null;
  const user = listUsersByTenant(tenantId).find(u => u.id === assignedTo);
  if (!user) {
    throw new Error('העובד המבוקש לא נמצא בעסק זה');
  }
  return user.id;
}

router.get('/', requirePermission('tasks.view'), (req, res) => {
  const tenantTasks = Array.from(tasks.values())
    .filter(t => t.tenant_id === req.tenant.id);

  res.json({
    data: tenantTasks,
    count: tenantTasks.length
  });
});

router.post('/', requirePermission('tasks.create'), (req, res) => {
  const { title, description, customer_id, priority, due_date, assigned_to } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'כותרת משימה חובה' });
  }

  let assigneeId;
  try {
    assigneeId = resolveAssignee(req.tenant.id, assigned_to);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }

  const task = {
    id: uuidv4(),
    tenant_id: req.tenant.id,
    title,
    description: description || '',
    customer_id: customer_id || null,
    priority: priority || 'medium',
    status: 'open',
    due_date: due_date || null,
    completed_at: null,
    user_id: req.tenant.userId,
    assigned_to: assigneeId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  tasks.set(task.id, task);

  logActivity(req.tenant.id, 'task.created', {
    description: `משימה חדשה נוצרה: ${task.title}`,
    user_id: req.tenant.userId,
    source: req.tenant.role === 'api' ? 'api' : 'manual'
  });
  triggerWebhook(req.tenant.id, 'task.created', { task });

  res.status(201).json(task);
});

router.patch('/:id', requirePermission('tasks.edit'), (req, res) => {
  const task = tasks.get(req.params.id);

  if (!task || task.tenant_id !== req.tenant.id) {
    return res.status(404).json({ error: 'משימה לא נמצאת' });
  }

  const statusChangedToCompleted = req.body.status === 'completed' && task.status !== 'completed';

  let assigneeUpdate = {};
  if ('assigned_to' in req.body) {
    try {
      assigneeUpdate = { assigned_to: resolveAssignee(req.tenant.id, req.body.assigned_to) };
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  Object.assign(task, {
    ...req.body,
    ...assigneeUpdate,
    completed_at: statusChangedToCompleted ? new Date().toISOString() : task.completed_at,
    updated_at: new Date().toISOString()
  });

  if (statusChangedToCompleted) {
    logActivity(req.tenant.id, 'task.completed', {
      description: `המשימה "${task.title}" הושלמה`,
      user_id: req.tenant.userId,
      source: req.tenant.role === 'api' ? 'api' : 'manual'
    });
    triggerWebhook(req.tenant.id, 'task.completed', { task });
  } else {
    logActivity(req.tenant.id, 'task.updated', {
      description: `המשימה "${task.title}" עודכנה`,
      user_id: req.tenant.userId,
      source: req.tenant.role === 'api' ? 'api' : 'manual'
    });
  }

  res.json(task);
});

router.delete('/:id', requirePermission('tasks.delete'), (req, res) => {
  const task = tasks.get(req.params.id);

  if (!task || task.tenant_id !== req.tenant.id) {
    return res.status(404).json({ error: 'משימה לא נמצאת' });
  }

  tasks.delete(req.params.id);

  logActivity(req.tenant.id, 'task.deleted', {
    description: `המשימה "${task.title}" נמחקה`,
    user_id: req.tenant.userId,
    source: 'manual'
  });

  res.json({ message: 'משימה נמחקה' });
});

// Used when a business is deleted entirely (see routes/tenants.js)
export function deleteTenantTasks(tenantId) {
  Array.from(tasks.entries())
    .filter(([, t]) => t.tenant_id === tenantId)
    .forEach(([id]) => tasks.delete(id));
}

export default router;
