import express from 'express';
import { getTenant, updateTenantSpreadsheet, getTenantSpreadsheetId, createTenant, listTenants } from '../services/tenant-service.js';
import { createUser, toPublicUser } from '../services/user-service.js';
import { requirePermission } from '../middleware/tenant.js';
import { ensureSheetsStructure, LEADS_TASKS_SCHEMA } from '../services/google-sheets.js';

const router = express.Router();

// List businesses (only ones the current admin created is out of scope for this mock;
// exposed for the "manage businesses" admin screen)
router.get('/', requirePermission('tenants.view'), (req, res) => {
  res.json({ data: listTenants() });
});

// Create a new business (tenant) with its own first admin user
router.post('/', requirePermission('tenants.create'), async (req, res) => {
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
    return res.status(400).json({ error: error.message });
  }

  res.status(201).json({
    tenant,
    admin: toPublicUser(adminUser)
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
