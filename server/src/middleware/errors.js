// Error with an HTTP status code and optional validation details
class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

// 404 for any route that did not match
function notFound(req, res) {
  res.status(404).json({ error: { message: `Route ${req.method} ${req.originalUrl} not found` } });
}

// Central error handler: every error ends up here, so the server never crashes
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: { message: 'Malformed JSON in request body' } });
  }

  const status = err.status >= 400 && err.status < 600 ? err.status : 500;

  if (status === 500) {
    console.error(err);
    return res.status(500).json({ error: { message: 'Internal server error' } });
  }

  const body = { error: { message: err.message } };
  if (err.details) body.error.details = err.details;
  res.status(status).json(body);
}

module.exports = { HttpError, notFound, errorHandler };
