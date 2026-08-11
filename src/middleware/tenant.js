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
    permissions: req.user.permissions || []
  };

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
