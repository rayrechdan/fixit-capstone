const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const authRouter = require('./routes/auth');
const servicesRouter = require('./routes/services');
const jobsRouter = require('./routes/jobs');
const prosRouter = require('./routes/pros');
const { notFound, errorHandler } = require('./middleware/errors');

// Builds the Express app (server.js starts it, the tests use it directly)
function createApp() {
  const app = express();

  // On Render the app runs behind a proxy: trust it so req.ip and secure cookies work
  app.set('trust proxy', 1);

  app.use(helmet()); // security headers
  app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
  app.use(express.json({ limit: '100kb' }));
  app.use(cookieParser());

  // Test route: used to check that the server is up
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/api/auth', authRouter);
  app.use('/api/services', servicesRouter);
  app.use('/api/jobs', jobsRouter);
  app.use('/api/pros', prosRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
