// Input validation for every request body.
// Each validate function returns { errors, value }:
//   errors = list of { field, message } (empty when the input is valid)
//   value  = the cleaned data we actually save

const TRADES = ['plumbing', 'electrical', 'ac', 'carpentry', 'painting'];
const ROLES = ['customer', 'pro'];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Checks a text field: required or not, and a maximum length
function checkText(body, field, { required, max }, errors) {
  const value = body[field];
  if (value === undefined || value === null || value === '') {
    if (required) errors.push({ field, message: `${field} is required` });
    return null;
  }
  if (typeof value !== 'string') {
    errors.push({ field, message: `${field} must be text` });
    return null;
  }
  const trimmed = value.trim();
  if (required && trimmed.length === 0) {
    errors.push({ field, message: `${field} cannot be empty` });
    return null;
  }
  if (trimmed.length > max) {
    errors.push({ field, message: `${field} must be at most ${max} characters` });
    return null;
  }
  return trimmed || null;
}

function validateSignup(body = {}) {
  const errors = [];
  const name = checkText(body, 'name', { required: true, max: 80 }, errors);
  const email = checkText(body, 'email', { required: true, max: 120 }, errors);
  const phone = checkText(body, 'phone', { required: false, max: 30 }, errors);
  const { password, role, trade } = body;

  if (email && !EMAIL_RE.test(email)) {
    errors.push({ field: 'email', message: 'email is not valid' });
  }
  if (typeof password !== 'string' || password.length < 8) {
    errors.push({ field: 'password', message: 'password must be at least 8 characters' });
  }
  if (!ROLES.includes(role)) {
    errors.push({ field: 'role', message: 'role must be customer or pro' });
  }
  if (role === 'pro' && !TRADES.includes(trade)) {
    errors.push({ field: 'trade', message: `trade must be one of: ${TRADES.join(', ')}` });
  }

  const value = {
    name,
    email: email ? email.toLowerCase() : null,
    phone,
    password,
    role,
    trade: role === 'pro' ? trade : null,
  };
  return { errors, value };
}

function validateLogin(body = {}) {
  const errors = [];
  const email = checkText(body, 'email', { required: true, max: 120 }, errors);
  if (typeof body.password !== 'string' || body.password.length === 0) {
    errors.push({ field: 'password', message: 'password is required' });
  }
  return { errors, value: { email: email ? email.toLowerCase() : null, password: body.password } };
}

function validateJob(body = {}) {
  const errors = [];
  const address = checkText(body, 'address', { required: true, max: 200 }, errors);
  const description = checkText(body, 'description', { required: true, max: 1000 }, errors);
  const serviceId = parseId(body.serviceId);
  const lat = Number(body.lat);
  const lng = Number(body.lng);
  const scheduledAt = new Date(body.scheduledAt);

  if (serviceId === null) {
    errors.push({ field: 'serviceId', message: 'serviceId must be a positive whole number' });
  }
  if (body.lat === undefined || Number.isNaN(lat) || lat < -90 || lat > 90) {
    errors.push({ field: 'lat', message: 'pick the location on the map' });
  }
  if (body.lng === undefined || Number.isNaN(lng) || lng < -180 || lng > 180) {
    errors.push({ field: 'lng', message: 'pick the location on the map' });
  }
  if (!body.scheduledAt || Number.isNaN(scheduledAt.getTime())) {
    errors.push({ field: 'scheduledAt', message: 'scheduledAt must be a valid date' });
  } else if (scheduledAt < new Date()) {
    errors.push({ field: 'scheduledAt', message: 'scheduledAt must be in the future' });
  }

  return { errors, value: { serviceId, address, description, lat, lng, scheduledAt } };
}

function validateReview(body = {}) {
  const errors = [];
  const comment = checkText(body, 'comment', { required: false, max: 500 }, errors);
  const rating = body.rating;
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    errors.push({ field: 'rating', message: 'rating must be a whole number from 1 to 5' });
  }
  return { errors, value: { rating, comment } };
}

// Turns "12" into 12, anything else into null
function parseId(raw) {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

module.exports = {
  TRADES,
  validateSignup,
  validateLogin,
  validateJob,
  validateReview,
  parseId,
};
