const jwt = require('jsonwebtoken');
const { HttpError } = require('./errors');

// Only logged-in users get past this middleware.
// The JWT is stored in an httpOnly cookie called "token".
function requireAuth(req, res, next) {
  const token = req.cookies.token;
  if (!token) {
    return next(new HttpError(401, 'You must be logged in'));
  }
  try {
    // jwt.verify checks the signature and the expiry date
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.id, role: payload.role, trade: payload.trade };
    next();
  } catch {
    next(new HttpError(401, 'Your session has expired, please log in again'));
  }
}

// Only users with one of the given roles get past this middleware.
// Always used after requireAuth, e.g. requireRole('pro')
function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new HttpError(403, 'You are not allowed to do this'));
    }
    next();
  };
}

module.exports = { requireAuth, requireRole };
