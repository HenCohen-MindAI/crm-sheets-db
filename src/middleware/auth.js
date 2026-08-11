import jwt from 'jsonwebtoken';

export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  const apiKey = req.headers['x-api-key'];

  if (apiKey) {
    // API Key authentication
    req.user = {
      userId: 'api-user',
      tenantId: 'api-tenant', // Will be verified later
      isApiKey: true,
      apiKey
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

export function generateToken(userId, tenantId, role = 'user', permissions = []) {
  return jwt.sign(
    {
      userId,
      tenantId,
      role,
      permissions,
      isApiKey: false
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}
