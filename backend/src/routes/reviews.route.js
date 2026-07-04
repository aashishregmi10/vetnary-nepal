const express = require('express');
const controller = require('../controllers/reviews.controller');
const { authenticate } = require('../middlewares/auth');

// mergeParams so req.params.slug (from the parent /products/:slug/reviews mount) is visible here.
const router = express.Router({ mergeParams: true });

// Nested under /api/products/:slug/reviews — see products.route.js mount.
router.get('/', controller.listForProduct);
router.post('/', authenticate, controller.create);

module.exports = router;
