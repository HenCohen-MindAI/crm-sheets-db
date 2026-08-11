import express from 'express';
import { generateToken } from '../middleware/auth.js';

const router = express.Router();

// Mock login for testing
// In production, this would integrate with Google OAuth or your auth system
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  // Mock user - replace with real auth
  if (email === 'admin@test.com' && password === 'password') {
    const token = generateToken(
      'user-1',
      'tenant-1',
      [
        'customers.view',
        'customers.view_all',
        'customers.create',
        'customers.edit',
        'customers.delete',
        'users.view',
        'users.create',
        'users.edit',
        'users.delete',
        'settings.view',
        'settings.edit',
        'google.manage',
      ]
    );

    return res.json({
      token,
      user: {
        id: 'user-1',
        email,
        role: 'admin',
      },
    });
  }

  res.status(401).json({ error: 'Invalid credentials' });
});

// Mock tenant setup (for testing)
router.post('/setup-tenant', (req, res) => {
  const { name, spreadsheetId } = req.body;

  if (!name || !spreadsheetId) {
    return res.status(400).json({ error: 'Missing name or spreadsheetId' });
  }

  // Mock response - replace with real tenant creation
  const token = generateToken(
    'user-1',
    'tenant-1',
    ['settings.edit', 'google.manage']
  );

  res.json({
    tenant: {
      id: 'tenant-1',
      name,
      spreadsheetId,
    },
    token,
  });
});

export default router;
