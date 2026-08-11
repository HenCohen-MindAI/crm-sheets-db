import express from 'express';
import { getTenant, updateTenantSpreadsheet, getTenantSpreadsheetId } from '../services/tenant-service.js';

const router = express.Router();

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

// Update spreadsheet ID
router.patch('/me/spreadsheet', (req, res) => {
  const { spreadsheet_id } = req.body;

  if (!spreadsheet_id) {
    return res.status(400).json({ error: 'Spreadsheet ID required' });
  }

  const updated = updateTenantSpreadsheet(req.user.tenantId, spreadsheet_id);

  res.json({
    message: 'Spreadsheet updated',
    tenant: updated
  });
});

export default router;
