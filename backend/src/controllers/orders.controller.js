const Order = require('../models/order.model');
const Product = require('../models/product.model');
const { ok, created, fail, ApiError } = require('../utils/apiResponse');
const { deliveryFee } = require('../methods/pricing');
const { nextOrderNumber } = require('../methods/orderNumber');

// Build the order from server-trusted product data — never trust client-sent prices.
async function create(req, res, next) {
  try {
    const { items, deliveryAddress, customerNote } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return fail(res, 'Your cart is empty', 400, [{ code: 'EMPTY_CART' }]);
    }
    if (!deliveryAddress || !deliveryAddress.fullName || !deliveryAddress.phone || !deliveryAddress.province) {
      return fail(res, 'A delivery address with name, phone and province is required', 400, [{ code: 'MISSING_ADDRESS' }]);
    }

    const productIds = items.map((i) => i.productId);
    const products = await Product.find({ _id: { $in: productIds }, isActive: true });
    const byId = new Map(products.map((p) => [String(p._id), p]));

    const orderItems = [];
    for (const line of items) {
      const product = byId.get(String(line.productId));
      if (!product) return fail(res, 'One or more items are no longer available', 400, [{ code: 'ITEM_UNAVAILABLE' }]);
      const qty = Math.max(1, Number(line.quantity) || 1);
      if (product.stock < qty) {
        return fail(res, `Not enough stock for ${product.name}`, 409, [{ field: product.slug, code: 'OUT_OF_STOCK' }]);
      }
      orderItems.push({
        product: product._id,
        name: product.name,
        brand: product.brand,
        coverImage: product.coverImage?.secureUrl,
        price: product.price, // snapshot server price
        quantity: qty,
      });
    }

    const subtotal = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const fee = deliveryFee(subtotal);

    const order = await Order.create({
      orderNumber: await nextOrderNumber(),
      user: req.userId,
      items: orderItems,
      deliveryAddress: {
        fullName: deliveryAddress.fullName,
        phone: deliveryAddress.phone,
        province: deliveryAddress.province,
        city: deliveryAddress.city,
        street: deliveryAddress.street,
        landmark: deliveryAddress.landmark,
      },
      deliveryFee: fee,
      subtotal,
      total: subtotal + fee,
      paymentMethod: 'cod',
      status: 'placed',
      statusHistory: [{ status: 'placed', note: 'Order placed' }],
      customerNote,
    });

    // Decrement stock + bump soldCount. Stock status re-derives on save via pre-validate,
    // but $inc is atomic and cheaper here; a background job/webhook could reconcile status later.
    await Promise.all(
      orderItems.map((i) =>
        Product.updateOne({ _id: i.product }, { $inc: { stock: -i.quantity, soldCount: i.quantity } })
      )
    );

    return created(res, order, 'Order placed — pay cash on delivery');
  } catch (err) {
    return next(err);
  }
}

async function listMine(req, res, next) {
  try {
    const orders = await Order.find({ user: req.userId }).sort({ createdAt: -1 });
    return ok(res, orders, 'OK');
  } catch (err) {
    return next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const order = await Order.findOne({ orderNumber: req.params.orderNumber, user: req.userId });
    if (!order) return next(new ApiError('Order not found', 404, 'NOT_FOUND'));
    return ok(res, order, 'OK');
  } catch (err) {
    return next(err);
  }
}

async function cancelMine(req, res, next) {
  try {
    const order = await Order.findOne({ orderNumber: req.params.orderNumber, user: req.userId });
    if (!order) return next(new ApiError('Order not found', 404, 'NOT_FOUND'));
    if (!['placed', 'confirmed'].includes(order.status)) {
      return fail(res, 'This order can no longer be cancelled', 409, [{ code: 'NOT_CANCELLABLE' }]);
    }
    order.status = 'cancelled';
    order.statusHistory.push({ status: 'cancelled', note: 'Cancelled by customer' });
    await order.save();
    // Restore stock for the cancelled items.
    await Promise.all(
      order.items.map((i) => Product.updateOne({ _id: i.product }, { $inc: { stock: i.quantity, soldCount: -i.quantity } }))
    );
    return ok(res, order, 'Order cancelled');
  } catch (err) {
    return next(err);
  }
}

module.exports = { create, listMine, getOne, cancelMine };
