import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { requirePermission } from '../middleware/tenant.js';

const router = express.Router();

// Mock database
const pipelines = new Map();
const stages = new Map();

// Get all pipelines for tenant
router.get('/', requirePermission('pipelines.view'), (req, res) => {
  const tenantPipelines = Array.from(pipelines.values())
    .filter(p => p.tenant_id === req.tenant.id);

  res.json({
    data: tenantPipelines,
    count: tenantPipelines.length
  });
});

// Create pipeline
router.post('/', requirePermission('pipelines.create'), (req, res) => {
  const { name, description } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'שם pipeline חובה' });
  }

  const pipeline = {
    id: uuidv4(),
    tenant_id: req.tenant.id,
    name,
    description: description || '',
    position: Array.from(pipelines.values()).filter(p => p.tenant_id === req.tenant.id).length + 1,
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  pipelines.set(pipeline.id, pipeline);
  res.status(201).json(pipeline);
});

// Get pipeline with stages
router.get('/:id/stages', requirePermission('pipelines.view'), (req, res) => {
  const pipeline = pipelines.get(req.params.id);

  if (!pipeline || pipeline.tenant_id !== req.tenant.id) {
    return res.status(404).json({ error: 'Pipeline לא נמצא' });
  }

  const pipelineStages = Array.from(stages.values())
    .filter(s => s.pipeline_id === req.params.id)
    .sort((a, b) => a.position - b.position);

  res.json({
    pipeline,
    stages: pipelineStages
  });
});

// Create stage
router.post('/:id/stages', requirePermission('stages.create'), (req, res) => {
  const pipeline = pipelines.get(req.params.id);

  if (!pipeline || pipeline.tenant_id !== req.tenant.id) {
    return res.status(404).json({ error: 'Pipeline לא נמצא' });
  }

  const { name, color } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'שם שלב חובה' });
  }

  const stage = {
    id: uuidv4(),
    tenant_id: req.tenant.id,
    pipeline_id: req.params.id,
    name,
    color: color || '#3B82F6',
    position: Array.from(stages.values()).filter(s => s.pipeline_id === req.params.id).length + 1,
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  stages.set(stage.id, stage);
  res.status(201).json(stage);
});

// Update stage
router.patch('/stages/:id', requirePermission('stages.edit'), (req, res) => {
  const stage = stages.get(req.params.id);

  if (!stage || stage.tenant_id !== req.tenant.id) {
    return res.status(404).json({ error: 'שלב לא נמצא' });
  }

  Object.assign(stage, {
    ...req.body,
    updated_at: new Date().toISOString()
  });

  res.json(stage);
});

// Delete stage
router.delete('/stages/:id', requirePermission('stages.delete'), (req, res) => {
  const stage = stages.get(req.params.id);

  if (!stage || stage.tenant_id !== req.tenant.id) {
    return res.status(404).json({ error: 'שלב לא נמצא' });
  }

  stages.delete(req.params.id);
  res.json({ message: 'שלב נמחק' });
});

// Delete pipeline
router.delete('/:id', requirePermission('pipelines.delete'), (req, res) => {
  const pipeline = pipelines.get(req.params.id);

  if (!pipeline || pipeline.tenant_id !== req.tenant.id) {
    return res.status(404).json({ error: 'Pipeline לא נמצא' });
  }

  // Delete associated stages
  Array.from(stages.entries())
    .filter(([, s]) => s.pipeline_id === req.params.id)
    .forEach(([id]) => stages.delete(id));

  pipelines.delete(req.params.id);
  res.json({ message: 'Pipeline נמחק' });
});

export default router;
