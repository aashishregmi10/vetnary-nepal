const express = require('express');
const controller = require('../controllers/products.controller');
const reviewsRoute = require('./reviews.route');

const router = express.Router();

router.get('/', controller.list);
router.use('/:slug/reviews', reviewsRoute);
router.get('/:slug', controller.getBySlug);

module.exports = router;
