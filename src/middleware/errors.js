export function errorHandler(err, req, res, next) {
  console.error('Error:', err.message);

  // Google Sheets API errors
  if (err.message?.includes('404')) {
    return res.status(404).json({ error: 'Resource not found' });
  }

  if (err.message?.includes('403')) {
    return res.status(403).json({ error: 'Access denied' });
  }

  if (err.message?.includes('quota')) {
    return res.status(429).json({ error: 'Rate limit exceeded' });
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message });
  }

  // Default error
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message
  });
}
