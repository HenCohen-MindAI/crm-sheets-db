import express from 'express';
import { generateToken } from '../middleware/auth.js';
import { findUserByEmail, verifyPassword } from '../services/user-service.js';
import { ROLE_PERMISSIONS } from '../services/permissions.js';
import { getTenant } from '../services/tenant-service.js';

const router = express.Router();

router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  const user = findUserByEmail(email);

  if (!user || !verifyPassword(user, password)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const tenant = getTenant(user.tenant_id);
  if (tenant && tenant.status !== 'active') {
    return res.status(403).json({ error: 'העסק הושבת. פנה למנהל המערכת.' });
  }

  const permissions = ROLE_PERMISSIONS[user.role] || [];
  const token = generateToken(user.id, user.tenant_id, user.role, permissions, {
    isPlatformOwner: !!user.is_platform_owner
  });

  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      tenantId: user.tenant_id,
      isPlatformOwner: !!user.is_platform_owner
    }
  });
});

router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

export default router;
