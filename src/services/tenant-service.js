import { v4 as uuidv4 } from 'uuid';

// Mock tenant database
const tenants = new Map();

// Initialize with demo tenant
tenants.set('tenant-1', {
  id: 'tenant-1',
  name: 'Demo Company',
  spreadsheet_id: process.env.DEMO_SPREADSHEET_ID || '',
  google_connection_id: process.env.DEMO_GOOGLE_CONNECTION_ID || '',
  status: 'active',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
});

export function getTenant(tenantId) {
  return tenants.get(tenantId);
}

export function getTenantSpreadsheetId(tenantId) {
  const tenant = getTenant(tenantId);
  return tenant?.spreadsheet_id || '';
}

export function updateTenantSpreadsheet(tenantId, spreadsheetId) {
  const tenant = getTenant(tenantId);
  if (tenant) {
    tenant.spreadsheet_id = spreadsheetId;
    tenant.updated_at = new Date().toISOString();
  }
  return tenant;
}

export function listTenants() {
  return Array.from(tenants.values());
}

export function createTenant(name) {
  const tenant = {
    id: uuidv4(),
    name,
    spreadsheet_id: '',
    google_connection_id: '',
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  tenants.set(tenant.id, tenant);
  return tenant;
}
