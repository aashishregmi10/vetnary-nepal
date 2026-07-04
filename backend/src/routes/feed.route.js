const express = require('express');
const Product = require('../models/product.model');
const Category = require('../models/category.model');
const { ok } = require('../utils/apiResponse');

const router = express.Router();

// Lightweight feed for the frontend sitemap builder: all active slugs + lastmod.
router.get('/sitemap', async (_req, res, next) => {
  try {
    const [products, categories] = await Promise.all([
      Product.find({ isActive: true }).select('slug updatedAt').sort({ updatedAt: -1 }).lean(),
      Category.find({ isActive: true }).select('slug updatedAt').lean(),
    ]);
    return ok(res, { products, categories }, 'OK');
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
