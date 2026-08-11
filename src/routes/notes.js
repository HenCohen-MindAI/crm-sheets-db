import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { requirePermission } from '../middleware/tenant.js';

const router = express.Router();

const notes = new Map();

router.get('/customer/:customerId', requirePermission('notes.view'), (req, res) => {
  const customerNotes = Array.from(notes.values())
    .filter(n => n.tenant_id === req.tenant.id && n.customer_id === req.params.customerId)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  res.json({
    data: customerNotes,
    count: customerNotes.length
  });
});

router.post('/', requirePermission('notes.create'), (req, res) => {
  const { content, customer_id } = req.body;

  if (!content || !customer_id) {
    return res.status(400).json({ error: 'תוכן והערה של לקוח חובה' });
  }

  const note = {
    id: uuidv4(),
    tenant_id: req.tenant.id,
    customer_id,
    content,
    user_id: req.tenant.userId,
    source: 'manual',
    created_at: new Date().toISOString()
  };

  notes.set(note.id, note);
  res.status(201).json(note);
});

router.delete('/:id', requirePermission('notes.delete'), (req, res) => {
  const note = notes.get(req.params.id);

  if (!note || note.tenant_id !== req.tenant.id) {
    return res.status(404).json({ error: 'הערה לא נמצאת' });
  }

  notes.delete(req.params.id);
  res.json({ message: 'הערה נמחקה' });
});

// Used when a business is deleted entirely (see routes/tenants.js)
export function deleteTenantNotes(tenantId) {
  Array.from(notes.entries())
    .filter(([, n]) => n.tenant_id === tenantId)
    .forEach(([id]) => notes.delete(id));
}

export default router;
