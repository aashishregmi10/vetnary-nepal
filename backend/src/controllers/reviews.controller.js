const Review = require('../models/review.model');
const Product = require('../models/product.model');
const Order = require('../models/order.model');
const { ok, created, fail } = require('../utils/apiResponse');

async function recomputeProductRating(productId) {
  const agg = await Review.aggregate([
    { $match: { product: productId, isApproved: true } },
    { $group: { _id: '$product', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  const { avg = 0, count = 0 } = agg[0] || {};
  await Product.updateOne({ _id: productId }, { avgRating: Math.round(avg * 10) / 10, reviewCount: count });
}

// Public: approved reviews for a product, newest first.
async function listForProduct(req, res, next) {
  try {
    const product = await Product.findOne({ slug: req.params.slug }).select('_id');
    if (!product) return ok(res, [], 'OK');
    const reviews = await Review.find({ product: product._id, isApproved: true })
      .sort({ createdAt: -1 })
      .populate('user', 'fullName');
    return ok(res, reviews, 'OK');
  } catch (err) {
    return next(err);
  }
}

// Authenticated: create a review. Auto-approved (small catalog, no moderation queue needed
// to see your own review reflected — admin can still unpublish via /admin/reviews).
async function create(req, res, next) {
  try {
    const { rating, title, body } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return fail(res, 'Rating must be between 1 and 5', 400, [{ code: 'INVALID_RATING' }]);
    }
    if (!body) return fail(res, 'Review text is required', 400, [{ code: 'MISSING_BODY' }]);

    const product = await Product.findOne({ slug: req.params.slug }).select('_id');
    if (!product) return fail(res, 'Product not found', 404, [{ code: 'NOT_FOUND' }]);

    const existing = await Review.findOne({ product: product._id, user: req.userId });
    if (existing) return fail(res, "You've already reviewed this product", 409, [{ code: 'ALREADY_REVIEWED' }]);

    const purchased = await Order.exists({
      user: req.userId,
      'items.product': product._id,
      status: { $nin: ['cancelled', 'returned'] },
    });

    const review = await Review.create({
      product: product._id,
      user: req.userId,
      rating,
      title,
      body,
      isVerifiedPurchase: !!purchased,
      isApproved: true,
    });
    await recomputeProductRating(product._id);

    const populated = await review.populate('user', 'fullName');
    return created(res, populated, 'Review posted');
  } catch (err) {
    return next(err);
  }
}

module.exports = { listForProduct, create };
