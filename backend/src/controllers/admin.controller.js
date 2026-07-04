const Product = require('../models/product.model');
const Category = require('../models/category.model');
const Order = require('../models/order.model');
const User = require('../models/user.model');
const Review = require('../models/review.model');
const { ok, created, fail, ApiError } = require('../utils/apiResponse');
const { slugify } = require('../utils/slugify');

/* ---------- dashboard ---------- */
async function stats(_req, res, next) {
  try {
    const [products, orders, users, pendingReviews] = await Promise.all([
      Product.countDocuments(),
      Order.countDocuments(),
      User.countDocuments(),
      Review.countDocuments({ isApproved: false }),
    ]);
    const revenueAgg = await Order.aggregate([
      { $match: { status: { $nin: ['cancelled', 'returned'] } } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]);
    return ok(res, { products, orders, users, pendingReviews, revenue: revenueAgg[0]?.total || 0 }, 'OK');
  } catch (err) {
    return next(err);
  }
}

/* ---------- products ---------- */
async function listProducts(_req, res, next) {
  try {
    const products = await Product.find().sort({ createdAt: -1 }).populate('category', 'name slug');
    return ok(res, products, 'OK');
  } catch (err) {
    return next(err);
  }
}

async function getProduct(req, res, next) {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name slug');
    if (!product) return next(new ApiError('Product not found', 404, 'NOT_FOUND'));
    return ok(res, product, 'OK');
  } catch (err) {
    return next(err);
  }
}

function buildProductPayload(body) {
  const payload = { ...body };
  if (body.name && !body.slug) payload.slug = slugify(body.name);
  if (body.slug) payload.slug = slugify(body.slug);
  if (typeof body.coverImageUrl === 'string') {
    payload.coverImage = { secureUrl: body.coverImageUrl, name: body.name };
    delete payload.coverImageUrl;
  }
  return payload;
}

async function createProduct(req, res, next) {
  try {
    const product = await Product.create(buildProductPayload(req.body));
    return created(res, product, 'Product created');
  } catch (err) {
    return next(err);
  }
}

async function updateProduct(req, res, next) {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return next(new ApiError('Product not found', 404, 'NOT_FOUND'));
    Object.assign(product, buildProductPayload(req.body));
    await product.save(); // re-derives stockStatus via pre-validate
    return ok(res, product, 'Product updated');
  } catch (err) {
    return next(err);
  }
}

async function deleteProduct(req, res, next) {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return next(new ApiError('Product not found', 404, 'NOT_FOUND'));
    return ok(res, null, 'Product deleted');
  } catch (err) {
    return next(err);
  }
}

/* ---------- categories ---------- */
async function listCategories(_req, res, next) {
  try {
    const categories = await Category.find().sort({ name: 1 }).populate('parent', 'name slug');
    return ok(res, categories, 'OK');
  } catch (err) {
    return next(err);
  }
}

async function createCategory(req, res, next) {
  try {
    const payload = { ...req.body, slug: slugify(req.body.slug || req.body.name) };
    if (!payload.parent) payload.parent = null;
    const category = await Category.create(payload);
    return created(res, category, 'Category created');
  } catch (err) {
    return next(err);
  }
}

async function updateCategory(req, res, next) {
  try {
    const payload = { ...req.body };
    if (payload.slug || payload.name) payload.slug = slugify(payload.slug || payload.name);
    if (payload.parent === '') payload.parent = null;
    const category = await Category.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });
    if (!category) return next(new ApiError('Category not found', 404, 'NOT_FOUND'));
    return ok(res, category, 'Category updated');
  } catch (err) {
    return next(err);
  }
}

async function deleteCategory(req, res, next) {
  try {
    const inUse = await Product.countDocuments({ category: req.params.id });
    if (inUse > 0) return fail(res, `Cannot delete — ${inUse} product(s) use this category`, 409, [{ code: 'IN_USE' }]);
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return next(new ApiError('Category not found', 404, 'NOT_FOUND'));
    return ok(res, null, 'Category deleted');
  } catch (err) {
    return next(err);
  }
}

/* ---------- orders ---------- */
async function listOrders(_req, res, next) {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }).populate('user', 'fullName email');
    return ok(res, orders, 'OK');
  } catch (err) {
    return next(err);
  }
}

async function updateOrderStatus(req, res, next) {
  try {
    const { status, note } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return next(new ApiError('Order not found', 404, 'NOT_FOUND'));
    order.status = status;
    order.statusHistory.push({ status, note: note || `Marked ${status} by admin` });
    if (note) order.adminNote = note;
    await order.save();
    return ok(res, order, 'Order updated');
  } catch (err) {
    return next(err);
  }
}

/* ---------- users ---------- */
async function listUsers(_req, res, next) {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    return ok(res, users, 'OK');
  } catch (err) {
    return next(err);
  }
}

async function setUserBan(req, res, next) {
  try {
    const { isBanned, banReason } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return next(new ApiError('User not found', 404, 'NOT_FOUND'));
    user.isBanned = !!isBanned;
    user.banReason = isBanned ? banReason || 'Suspended by admin' : undefined;
    user.bannedAt = isBanned ? new Date() : undefined;
    await user.save();
    return ok(res, user, isBanned ? 'User suspended' : 'User reinstated');
  } catch (err) {
    return next(err);
  }
}

/* ---------- reviews ---------- */
async function listReviews(_req, res, next) {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 }).populate('product', 'name slug').populate('user', 'fullName');
    return ok(res, reviews, 'OK');
  } catch (err) {
    return next(err);
  }
}

async function recomputeProductRating(productId) {
  const agg = await Review.aggregate([
    { $match: { product: productId, isApproved: true } },
    { $group: { _id: '$product', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  const { avg = 0, count = 0 } = agg[0] || {};
  await Product.updateOne({ _id: productId }, { avgRating: Math.round(avg * 10) / 10, reviewCount: count });
}

async function approveReview(req, res, next) {
  try {
    const review = await Review.findByIdAndUpdate(req.params.id, { isApproved: true }, { new: true });
    if (!review) return next(new ApiError('Review not found', 404, 'NOT_FOUND'));
    await recomputeProductRating(review.product);
    return ok(res, review, 'Review approved');
  } catch (err) {
    return next(err);
  }
}

async function deleteReview(req, res, next) {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) return next(new ApiError('Review not found', 404, 'NOT_FOUND'));
    await recomputeProductRating(review.product);
    return ok(res, null, 'Review deleted');
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  stats,
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  listOrders,
  updateOrderStatus,
  listUsers,
  setUserBan,
  listReviews,
  approveReview,
  deleteReview,
};
