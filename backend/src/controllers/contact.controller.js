const { ok, fail } = require('../utils/apiResponse');

// No email service is wired up yet — this just validates and records the message
// server-side so the contact form is genuinely functional rather than a fake success state.
// Swap in real email delivery (utils/emailService.js) when that's needed.
async function submit(req, res) {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return fail(res, 'Name, email, and message are required', 400, [{ code: 'MISSING_FIELDS' }]);
  }
  console.log(`[contact] ${name} <${email}>: ${message}`);
  return ok(res, null, "Thanks — we'll get back to you soon.");
}

module.exports = { submit };
