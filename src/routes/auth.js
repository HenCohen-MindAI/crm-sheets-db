import express from 'express';
import { generateToken } from '../middleware/auth.js';

const router = express.Router();

// Mock login - replace with real auth later
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  // Mock validation
  if (email === 'admin@test.com' && password === 'password') {
    const token = generateToken(
      'user-1',
      'tenant-1',
      'admin',
      [
        'customers.view',
        'customers.view_all',
        'customers.create',
        'customers.edit',
        'customers.delete',
        'pipelines.view',
        'pipelines.create',
        'stages.create',
        'tasks.view',
        'tasks.create',
        'notes.view',
        'notes.create',
        'webhooks.view',
        'api.view',
        'users.view',
        'settings.view',
        'settings.edit',
        'google.manage'
      ]
    );

    return res.json({
      token,
      user: {
        id: 'user-1',
        email,
        name: 'Admin User',
        role: 'admin',
        tenantId: 'tenant-1'
      }
    });
  }

  res.status(401).json({ error: 'Invalid credentials' });
});

router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

export default router;
