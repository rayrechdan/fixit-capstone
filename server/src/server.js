require('dotenv').config();
const { createApp } = require('./app');

const PORT = process.env.PORT || 4000;

const app = createApp();

app.listen(PORT, () => {
  console.log(`Fixit API running on http://localhost:${PORT}`);
});
