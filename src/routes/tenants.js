import express from 'express';
import {
  getTenant, updateTenantSpreadsheet, createTenant, listTenants,
  updateTenantStatus, deleteTenant
} from '../services/tenant-service.js';
import { createUser, toPublicUser, findTenantAdmin, deleteTenantUsers } from '../services/user-service.js';
import { requirePlatformOwner } from '../middleware/tenant.js';
import { generateToken } from '../middleware/auth.js';
import { ensureSheetsStructure, LEADS_TASKS_SCHEMA } from '../services/google-sheets.js';
import { ROLE_PERMISSIONS } from '../services/permissions.js';
import { deleteTenantCustomers } from './customers.js';
import { deleteTenantPipelines } from './pipelines.js';
import { deleteTenantTasks } from './tasks.js';
import { deleteTenantNotes } from './notes.js';
import { deleteTenantActivities } from './activity.js';
import { deleteTenantWebhooks } from './webhooks.js';
import { deleteTenantApiKeys } from './api-keys.js';

const router = express.Router();

// All routes below manage OTHER businesses - restricted to the platform
// owner only, never to a regular tenant admin (see requirePlatformOwner).

// List every business on the system
router.get('/', requirePlatformOwner, (req, res) => {
  res.json({ data: listTenants() });
});

// Create a new business (tenant) with its own first admin user
router.post('/', requirePlatformOwner, async (req, res) => {
  const { business_name, admin_name, admin_email, admin_password } = req.body;

  if (!business_name || !admin_name || !admin_email || !admin_password) {
    return res.status(400).json({ error: 'שם עסק, שם מנהל, אימייל וסיסמה חובה' });
  }
  if (admin_password.length < 6) {
    return res.status(400).json({ error: 'סיסמה חייבת להכיל לפחות 6 תווים' });
  }

  const tenant = createTenant(business_name);

  let adminUser;
  try {
    adminUser = createUser(tenant.id, {
      name: admin_name,
      email: admin_email,
      password: admin_password,
      role: 'admin'
    });
  } catch (error) {
    deleteTenant(tenant.id);
    return res.status(400).json({ error: error.message });
  }

  res.status(201).json({
    tenant,
    admin: toPublicUser(adminUser)
  });
});

// Enable/disable a business - blocks every request from its own users
// immediately (see tenantMiddleware), not just new logins.
router.patch('/:id/status', requirePlatformOwner, (req, res) => {
  const { status } = req.body;

  if (!['active', 'disabled'].includes(status)) {
    return res.status(400).json({ error: 'סטטוס לא תקין (active/disabled)' });
  }
  if (req.params.id === req.tenant.id) {
    return res.status(400).json({ error: 'לא ניתן להשבית את העסק הראשי שלך' });
  }

  const tenant = updateTenantStatus(req.params.id, status);
  if (!tenant) {
    return res.status(404).json({ error: 'עסק לא נמצא' });
  }

  res.json({ message: status === 'active' ? 'העסק הופעל' : 'העסק הושבת', tenant });
});

// Permanently delete a business and all of its data
router.delete('/:id', requirePlatformOwner, (req, res) => {
  if (req.params.id === req.tenant.id) {
    return res.status(400).json({ error: 'לא ניתן למחוק את העסק הראשי שלך' });
  }

  const tenant = getTenant(req.params.id);
  if (!tenant) {
    return res.status(404).json({ error: 'עסק לא נמצא' });
  }

  deleteTenantCustomers(req.params.id);
  deleteTenantPipelines(req.params.id);
  deleteTenantTasks(req.params.id);
  deleteTenantNotes(req.params.id);
  deleteTenantActivities(req.params.id);
  deleteTenantWebhooks(req.params.id);
  deleteTenantApiKeys(req.params.id);
  deleteTenantUsers(req.params.id);
  deleteTenant(req.params.id);

  res.json({ message: 'העסק ונתוניו נמחקו' });
});

// Issue a session for a business's admin so the platform owner can view/
// manage its data without knowing that admin's password. Works even for
// disabled businesses (the platform owner is exempt from the status check).
router.post('/:id/impersonate', requirePlatformOwner, (req, res) => {
  const tenant = getTenant(req.params.id);
  if (!tenant) {
    return res.status(404).json({ error: 'עסק לא נמצא' });
  }

  const adminUser = findTenantAdmin(req.params.id);
  if (!adminUser) {
    return res.status(404).json({ error: 'לא נמצא משתמש מנהל עבור עסק זה' });
  }

  const permissions = ROLE_PERMISSIONS[adminUser.role] || [];
  const token = generateToken(adminUser.id, adminUser.tenant_id, adminUser.role, permissions, {
    isPlatformOwner: true,
    impersonatedBy: req.tenant.userId
  });

  res.json({
    token,
    tenant,
    user: {
      id: adminUser.id,
      email: adminUser.email,
      name: adminUser.name,
      role: adminUser.role,
      tenantId: adminUser.tenant_id,
      isPlatformOwner: true,
      impersonating: true
    }
  });
});

// Get current tenant info
router.get('/me', (req, res) => {
  if (!req.user?.tenantId) {
    return res.status(401).json({ error: 'No tenant context' });
  }

  const tenant = getTenant(req.user.tenantId);

  res.json({
    id: tenant?.id || req.user.tenantId,
    name: tenant?.name || 'Unknown',
    spreadsheet_id: tenant?.spreadsheet_id || '',
    status: tenant?.status || 'active'
  });
});

// Update spreadsheet ID - also auto-creates the Leads/Tasks tabs & headers
router.patch('/me/spreadsheet', async (req, res) => {
  const { spreadsheet_id } = req.body;

  if (!spreadsheet_id) {
    return res.status(400).json({ error: 'Spreadsheet ID required' });
  }

  const updated = updateTenantSpreadsheet(req.user.tenantId, spreadsheet_id);

  let sheetsReady = false;
  let sheetsError = null;
  try {
    await ensureSheetsStructure(spreadsheet_id, LEADS_TASKS_SCHEMA);
    sheetsReady = true;
  } catch (error) {
    sheetsError = error.message;
  }

  res.json({
    message: sheetsReady
      ? 'Spreadsheet updated - Leads/Tasks tabs ready'
      : 'Spreadsheet ID saved, but tabs could not be created automatically',
    sheets_ready: sheetsReady,
    sheets_error: sheetsError,
    tenant: updated
  });
});

export default router;
