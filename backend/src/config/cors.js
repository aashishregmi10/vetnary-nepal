const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

module.exports = {
  origin: FRONTEND_URL,
  credentials: true,
};
