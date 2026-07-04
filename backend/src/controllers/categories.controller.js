const Category = require('../models/category.model');
const { ok, fail } = require('../utils/apiResponse');

async function list(req, res, next) {
  try {
    const { parent } = req.query;
    const filter = { isActive: true };
    if (parent === 'root') filter.parent = null;
    else if (parent) filter.parent = parent;

    const categories = await Category.find(filter).sort({ name: 1 });
    return ok(res, categories, 'OK');
  } catch (err) {
    return next(err);
  }
}

async function getBySlug(req, res, next) {
  try {
    const category = await Category.findOne({ slug: req.params.slug, isActive: true });
    if (!category) return fail(res, 'Category not found', 404, [{ code: 'NOT_FOUND' }]);
    return ok(res, category, 'OK');
  } catch (err) {
    return next(err);
  }
}

module.exports = { list, getBySlug };
