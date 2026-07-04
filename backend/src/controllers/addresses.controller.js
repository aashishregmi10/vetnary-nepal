const User = require('../models/user.model');
const { ok, created, fail, ApiError } = require('../utils/apiResponse');

async function list(req, res, next) {
  try {
    const user = await User.findById(req.userId).select('addresses');
    return ok(res, user?.addresses || [], 'OK');
  } catch (err) {
    return next(err);
  }
}

async function add(req, res, next) {
  try {
    const { label, fullName, phone, province, city, street, landmark, isDefault } = req.body;
    if (!fullName || !phone || !province) {
      return fail(res, 'Name, phone and province are required', 400, [{ code: 'MISSING_FIELDS' }]);
    }
    const user = await User.findById(req.userId).select('addresses');
    if (isDefault) user.addresses.forEach((a) => (a.isDefault = false));
    user.addresses.push({ label, fullName, phone, province, city, street, landmark, isDefault: !!isDefault });
    await user.save();
    return created(res, user.addresses, 'Address added');
  } catch (err) {
    return next(err);
  }
}

async function update(req, res, next) {
  try {
    const user = await User.findById(req.userId).select('addresses');
    const addr = user.addresses.id(req.params.addressId);
    if (!addr) return next(new ApiError('Address not found', 404, 'NOT_FOUND'));

    const fields = ['label', 'fullName', 'phone', 'province', 'city', 'street', 'landmark'];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) addr[f] = req.body[f];
    });
    if (req.body.isDefault === true) {
      user.addresses.forEach((a) => (a.isDefault = false));
      addr.isDefault = true;
    }
    await user.save();
    return ok(res, user.addresses, 'Address updated');
  } catch (err) {
    return next(err);
  }
}

async function remove(req, res, next) {
  try {
    const user = await User.findById(req.userId).select('addresses');
    const addr = user.addresses.id(req.params.addressId);
    if (!addr) return next(new ApiError('Address not found', 404, 'NOT_FOUND'));
    addr.deleteOne();
    await user.save();
    return ok(res, user.addresses, 'Address removed');
  } catch (err) {
    return next(err);
  }
}

module.exports = { list, add, update, remove };
