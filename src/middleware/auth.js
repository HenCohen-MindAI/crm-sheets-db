import jwt from 'jsonwebtoken';
import { verifyApiKey } from '../routes/api-keys.js';
import { API_KEY_PERMISSIONS } from '../services/permissions.js';

export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  const apiKey = req.headers['x-api-key'];

  if (apiKey) {
    const record = verifyApiKey(apiKey);
    if (!record) {
      return res.status(401).json({ error: 'Invalid API key' });
    }

    req.user = {
      userId: `api-key:${record.id}`,
      tenantId: record.tenant_id,
      role: 'api',
      permissions: API_KEY_PERMISSIONS,
      isApiKey: true
    };
    return next();
  }

  if (!authHeader) {
    return res.status(401).json({ error: 'Missing authorization header' });
  }

  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export function generateToken(userId, tenantId, role = 'user', permissions = [], extra = {}) {
  return jwt.sign(
    {
      userId,
      tenantId,
      role,
      permissions,
      isApiKey: false,
      isPlatformOwner: !!extra.isPlatformOwner,
      impersonatedBy: extra.impersonatedBy || null
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}
