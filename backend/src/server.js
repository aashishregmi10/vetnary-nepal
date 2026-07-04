require('dotenv').config();
const { validateEnv } = require('./config/env');

validateEnv();

const app = require('./app');
const { connectDB } = require('./config/db');

const PORT = process.env.PORT || 5000;

async function start() {
  await connectDB();
  const server = app.listen(PORT, () => {
    console.log(`[server] PawMart API listening on port ${PORT}`);
  });

  const shutdown = (signal) => {
    console.log(`[server] received ${signal}, shutting down`);
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(1), 10000).unref();
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

start().catch((err) => {
  console.error('[server] failed to start', err);
  process.exit(1);
});
