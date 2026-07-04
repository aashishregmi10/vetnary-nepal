const express = require('express');
const rateLimit = require('express-rate-limit');
const controller = require('../controllers/contact.controller');

const router = express.Router();

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV !== 'production',
});

router.post('/', contactLimiter, controller.submit);

module.exports = router;
