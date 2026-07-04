const User = require('../models/user.model');
const { ok } = require('../utils/apiResponse');

async function list(req, res, next) {
  try {
    const user = await User.findById(req.userId).populate('wishlist');
    return ok(res, user?.wishlist || [], 'OK');
  } catch (err) {
    return next(err);
  }
}

async function add(req, res, next) {
  try {
    await User.updateOne({ _id: req.userId }, { $addToSet: { wishlist: req.body.productId } });
    const user = await User.findById(req.userId).populate('wishlist');
    return ok(res, user.wishlist, 'Added to wishlist');
  } catch (err) {
    return next(err);
  }
}

async function remove(req, res, next) {
  try {
    await User.updateOne({ _id: req.userId }, { $pull: { wishlist: req.params.productId } });
    const user = await User.findById(req.userId).populate('wishlist');
    return ok(res, user.wishlist, 'Removed from wishlist');
  } catch (err) {
    return next(err);
  }
}

module.exports = { list, add, remove };
