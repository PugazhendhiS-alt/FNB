function errorHandler(err, req, res, next) {
  console.error('Error:', err);

  if (err.code === 'P2002') {
    return res.status(409).json({
      message: 'A record with this value already exists.',
      error: 'CONFLICT',
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({
      message: 'Record not found.',
      error: 'NOT_FOUND',
    });
  }

  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    error: err.name || 'INTERNAL_ERROR',
  });
}

module.exports = { errorHandler };