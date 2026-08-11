import express from 'express';
import { requirePermission } from '../middleware/tenant.js';
import { createUser, listUsersByTenant, updateUser, deactivateUser, toPublicUser } from '../services/user-service.js';
import { ROLE_PERMISSIONS, ROLE_LABELS } from '../services/permissions.js';
import { logActivity } from './activity.js';

const router = express.Router();

// List roles available for assignment
router.get('/roles', requirePermission('users.view'), (req, res) => {
  res.json({
    data: Object.keys(ROLE_PERMISSIONS).map(role => ({ role, label: ROLE_LABELS[role] || role }))
  });
});

// List employees for tenant
router.get('/', requirePermission('users.view'), (req, res) => {
  const tenantUsers = listUsersByTenant(req.tenant.id).map(toPublicUser);
  res.json({ data: tenantUsers, count: tenantUsers.length });
});

// Create employee
router.post('/', requirePermission('users.manage'), (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'שם, אימייל, סיסמה ותפקיד חובה' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'סיסמה חייבת להכיל לפחות 6 תווים' });
  }

  try {
    const user = createUser(req.tenant.id, { name, email, password, role });
    logActivity(req.tenant.id, 'user.created', {
      description: `עובד חדש נוצר: ${name} (${role})`,
      user_id: req.tenant.userId,
      source: 'manual'
    });
    res.status(201).json(toPublicUser(user));
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update employee (role/name)
router.patch('/:id', requirePermission('users.manage'), (req, res) => {
  try {
    const { name, role, password } = req.body;
    const user = updateUser(req.params.id, req.tenant.id, { name, role, password });

    if (!user) {
      return res.status(404).json({ error: 'עובד לא נמצא' });
    }

    res.json(toPublicUser(user));
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Deactivate employee
router.delete('/:id', requirePermission('users.manage'), (req, res) => {
  if (req.params.id === req.tenant.userId) {
    return res.status(400).json({ error: 'לא ניתן למחוק את המשתמש המחובר' });
  }

  const user = deactivateUser(req.params.id, req.tenant.id);

  if (!user) {
    return res.status(404).json({ error: 'עובד לא נמצא' });
  }

  res.json({ message: 'עובד הוסר' });
});

export default router;
