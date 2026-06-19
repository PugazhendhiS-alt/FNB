function errorHandler(err, req, res, next) {
  console.error('Error:', err);

  if (err.code === 'P2002') {
    return res.status(409).json({ message: 'A record with this value already exists.' });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({ message: 'Record not found.' });
  }

  if (err.code && err.code.startsWith('P')) {
    return res.status(500).json({ message: 'A database error occurred.' });
  }

  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
  });
}

module.exports = { errorHandler };