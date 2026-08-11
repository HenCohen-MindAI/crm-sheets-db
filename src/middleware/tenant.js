export function tenantMiddleware(req, res, next) {
  // The tenant is derived from the authenticated user
  // Frontend cannot specify tenant_id
  req.tenant = {
    id: req.user.tenantId,
  };

  // Add a helper to check permissions
  req.hasPermission = (permissionCode) => {
    if (!req.user.permissions) return false;
    return req.user.permissions.includes(permissionCode);
  };

  next();
}

export function requirePermission(permissionCode) {
  return (req, res, next) => {
    if (!req.hasPermission(permissionCode)) {
      return res.status(403).json({
        error: `Missing permission: ${permissionCode}`,
        userPermissions: req.user.permissions || [],
      });
    }
    next();
  };
}
