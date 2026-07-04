const Counter = require('../models/counter.model');

// PM-YYYYMMDD-XXXXX — daily-ish sequence from an atomic counter.
async function nextOrderNumber() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const seq = await Counter.nextSequence('orderNumber');
  return `PM-${y}${m}${d}-${String(seq).padStart(5, '0')}`;
}

module.exports = { nextOrderNumber };
