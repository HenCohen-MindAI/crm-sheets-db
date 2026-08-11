import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { requirePermission } from '../middleware/tenant.js';

const router = express.Router();

const tasks = new Map();

router.get('/', requirePermission('tasks.view'), (req, res) => {
  const tenantTasks = Array.from(tasks.values())
    .filter(t => t.tenant_id === req.tenant.id);

  res.json({
    data: tenantTasks,
    count: tenantTasks.length
  });
});

router.post('/', requirePermission('tasks.create'), (req, res) => {
  const { title, description, customer_id, priority, due_date } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'כותרת משימה חובה' });
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
    user_id: req.tenant.userId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  tasks.set(task.id, task);
  res.status(201).json(task);
});

router.patch('/:id', requirePermission('tasks.edit'), (req, res) => {
  const task = tasks.get(req.params.id);

  if (!task || task.tenant_id !== req.tenant.id) {
    return res.status(404).json({ error: 'משימה לא נמצאת' });
  }

  Object.assign(task, {
    ...req.body,
    updated_at: new Date().toISOString()
  });

  res.json(task);
});

router.delete('/:id', requirePermission('tasks.delete'), (req, res) => {
  const task = tasks.get(req.params.id);

  if (!task || task.tenant_id !== req.tenant.id) {
    return res.status(404).json({ error: 'משימה לא נמצאת' });
  }

  tasks.delete(req.params.id);
  res.json({ message: 'משימה נמחקה' });
});

export default router;
