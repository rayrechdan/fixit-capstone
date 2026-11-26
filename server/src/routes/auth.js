const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../db');
const { validateSignup, validateLogin } = require('../validation');
const { HttpError } = require('../middleware/errors');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

// httpOnly: JavaScript in the browser cannot read the cookie (protects against XSS)
// secure: only sent over HTTPS in production
// sameSite: not sent with requests coming from other sites (protects against CSRF)
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: SEVEN_DAYS,
};

// Never send the password hash to the client
function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email, role: user.role, trade: user.trade, phone: user.phone };
}

function sendToken(res, user) {
  const token = jwt.sign(
    { id: user.id, role: user.role, trade: user.trade },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
  res.cookie('token', token, cookieOptions);
}

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  const { errors, value } = validateSignup(req.body);
  if (errors.length) throw new HttpError(400, 'Validation failed', errors);

  const existing = await prisma.user.findUnique({ where: { email: value.email } });
  if (existing) throw new HttpError(409, 'An account with this email already exists');

  // bcrypt adds a random salt and hashes the password 2^10 times
  const passwordHash = await bcrypt.hash(value.password, 10);

  const user = await prisma.user.create({
    data: {
      name: value.name,
      email: value.email,
      phone: value.phone,
      role: value.role,
      trade: value.trade,
      passwordHash,
    },
  });

  sendToken(res, user);
  res.status(201).json({ user: publicUser(user) });
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { errors, value } = validateLogin(req.body);
  if (errors.length) throw new HttpError(400, 'Validation failed', errors);

  const user = await prisma.user.findUnique({ where: { email: value.email } });
  const passwordOk = user && (await bcrypt.compare(value.password, user.passwordHash));

  // Same message for "no such email" and "wrong password",
  // so an attacker cannot find out which emails are registered
  if (!passwordOk) throw new HttpError(401, 'Invalid email or password');

  sendToken(res, user);
  res.json({ user: publicUser(user) });
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.clearCookie('token', { ...cookieOptions, maxAge: undefined });
  res.json({ message: 'Logged out' });
});

// GET /api/auth/me  - who is logged in? (used when the page reloads)
router.get('/me', requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user) throw new HttpError(401, 'You must be logged in');
  res.json({ user: publicUser(user) });
});

module.exports = router;
