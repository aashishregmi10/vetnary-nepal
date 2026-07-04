const Product = require('../models/product.model');
const Category = require('../models/category.model');
const { ok, fail } = require('../utils/apiResponse');

const PAGE_SIZE = 24;

async function list(req, res, next) {
  try {
    const { species, category, q, sort = 'newest', page = 1, minPrice, maxPrice } = req.query;
    const filter = { isActive: true };

    if (species) filter.species = species;
    if (category) {
      const cat = await Category.findOne({ slug: category });
      if (cat) filter.category = cat._id;
      else filter.category = null; // no such category — return an empty result set, not every product
    }
    if (q) {
      // No text index exists yet (indexes deferred per project decision), so this does a
      // plain regex scan across a few fields — fine at low catalog volume, revisit once
      // real query patterns/traffic justify adding a text index.
      const re = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [{ name: re }, { brand: re }, { description: re }];
    }
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const sortMap = {
      newest: { createdAt: -1 },
      'price-low': { price: 1 },
      'price-high': { price: -1 },
      popular: { soldCount: -1 },
    };
    const sortBy = sortMap[sort] || sortMap.newest;

    const pageNum = Math.max(1, Number(page) || 1);
    const skip = (pageNum - 1) * PAGE_SIZE;

    const [items, total] = await Promise.all([
      Product.find(filter).sort(sortBy).skip(skip).limit(PAGE_SIZE),
      Product.countDocuments(filter),
    ]);

    return ok(res, { items, total, page: pageNum, pageSize: PAGE_SIZE, totalPages: Math.ceil(total / PAGE_SIZE) }, 'OK');
  } catch (err) {
    return next(err);
  }
}

async function getBySlug(req, res, next) {
  try {
    const product = await Product.findOne({ slug: req.params.slug, isActive: true }).populate('category', 'name slug');
    if (!product) return fail(res, 'Product not found', 404, [{ code: 'NOT_FOUND' }]);
    Product.updateOne({ _id: product._id }, { $inc: { viewCount: 1 } }).catch(() => {});
    return ok(res, product, 'OK');
  } catch (err) {
    return next(err);
  }
}

module.exports = { list, getBySlug };
