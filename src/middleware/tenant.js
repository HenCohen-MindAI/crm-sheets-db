import { getTenant } from '../services/tenant-service.js';

export function tenantMiddleware(req, res, next) {
  // Tenant ID comes from the authenticated user token
  // Frontend CANNOT specify tenant_id
  if (!req.user?.tenantId) {
    return res.status(401).json({ error: 'Invalid user context' });
  }

  req.tenant = {
    id: req.user.tenantId,
    userId: req.user.userId,
    role: req.user.role || 'user',
    permissions: req.user.permissions || [],
    isPlatformOwner: !!req.user.isPlatformOwner
  };

  // A business can be disabled by the platform owner. Block every request
  // from that tenant's own users (not just login) - a live JWT would
  // otherwise keep working until it expires. The platform owner is exempt
  // so they can still open a disabled business to inspect it.
  const tenant = getTenant(req.tenant.id);
  if (tenant && tenant.status !== 'active' && !req.tenant.isPlatformOwner) {
    return res.status(403).json({ error: 'העסק הושבת. פנה למנהל המערכת.' });
  }

  // Helper to check permissions
  req.hasPermission = (permissionCode) => {
    if (req.user.role === 'admin') return true; // Admin has all permissions
    return req.user.permissions?.includes(permissionCode) || false;
  };

  // Add tenant ID to all queries
  req.filterByTenant = (obj) => ({
    ...obj,
    tenant_id: req.tenant.id
  });

  next();
}

export function requirePermission(permissionCode) {
  return (req, res, next) => {
    if (!req.hasPermission(permissionCode)) {
      return res.status(403).json({
        error: `Insufficient permissions: ${permissionCode}`
      });
    }
    next();
  };
}

// Cross-tenant business management (list/create/disable/delete/impersonate
// businesses) is restricted to the platform owner only - never to a regular
// tenant admin, no matter their role or permissions.
export function requirePlatformOwner(req, res, next) {
  if (!req.tenant?.isPlatformOwner) {
    return res.status(403).json({ error: 'פעולה זו זמינה רק לבעל המערכת' });
  }
  next();
}
