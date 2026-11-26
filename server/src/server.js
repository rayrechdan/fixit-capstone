require('dotenv').config();
const { createApp } = require('./app');

// Stop right away if a required setting is missing, instead of failing later
if (!process.env.JWT_SECRET || !process.env.DATABASE_URL) {
  console.error('Missing JWT_SECRET or DATABASE_URL. Copy .env.example to .env and fill it in.');
  process.exit(1);
}

const PORT = process.env.PORT || 4000;

const app = createApp();

app.listen(PORT, () => {
  console.log(`Fixit API running on http://localhost:${PORT}`);
});
