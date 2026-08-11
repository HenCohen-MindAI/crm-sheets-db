import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { requirePermission } from '../middleware/tenant.js';
import { getCustomerRepository } from '../services/data-service.js';
import { getTenantSpreadsheetId } from '../services/tenant-service.js';
import { triggerWebhook } from './webhooks.js';
import { logActivity } from './activity.js';

const router = express.Router();

// Mock customer database (fallback)
const customers = new Map();

router.get('/', requirePermission('customers.view'), (req, res) => {
  const tenantCustomers = Array.from(customers.values())
    .filter(c => c.tenant_id === req.tenant.id);

  res.json({
    data: tenantCustomers,
    count: tenantCustomers.length
  });
});

router.post('/', requirePermission('customers.create'), (req, res) => {
  const { first_name, email, phone, company } = req.body;

  if (!first_name || !email) {
    return res.status(400).json({ error: 'First name and email required' });
  }

  const customer = {
    id: uuidv4(),
    tenant_id: req.tenant.id,
    first_name,
    last_name: req.body.last_name || '',
    email,
    phone: phone || '',
    company: company || '',
    pipeline_id: req.body.pipeline_id || null,
    stage_id: req.body.stage_id || null,
    owner_id: req.tenant.userId,
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  customers.set(customer.id, customer);

  res.status(201).json(customer);
});

router.get('/:id', requirePermission('customers.view'), (req, res) => {
  const customer = customers.get(req.params.id);

  if (!customer || customer.tenant_id !== req.tenant.id) {
    return res.status(404).json({ error: 'Customer not found' });
  }

  res.json(customer);
});

router.patch('/:id', requirePermission('customers.edit'), (req, res) => {
  const customer = customers.get(req.params.id);

  if (!customer || customer.tenant_id !== req.tenant.id) {
    return res.status(404).json({ error: 'Customer not found' });
  }

  Object.assign(customer, {
    ...req.body,
    updated_at: new Date().toISOString()
  });

  res.json(customer);
});

router.delete('/:id', requirePermission('customers.delete'), (req, res) => {
  const customer = customers.get(req.params.id);

  if (!customer || customer.tenant_id !== req.tenant.id) {
    return res.status(404).json({ error: 'Customer not found' });
  }

  customers.delete(req.params.id);
  res.json({ message: 'Customer deleted' });
});

export default router;
