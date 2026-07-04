const { Schema, model } = require('mongoose');

const orderItemSchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    name: String, // snapshot at purchase time
    brand: String,
    coverImage: String,
    price: Number, // snapshot — never re-read live product price for historical orders
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const ORDER_STATUS = ['placed', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'];

const orderSchema = new Schema(
  {
    orderNumber: { type: String, required: true, unique: true }, // PM-YYYYMMDD-XXXXX via Counter
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    items: [orderItemSchema],

    deliveryAddress: {
      fullName: String,
      phone: String,
      province: String,
      city: String,
      street: String,
      landmark: String,
    },
    deliveryFee: { type: Number, required: true, default: 0 },
    subtotal: { type: Number, required: true },
    total: { type: Number, required: true },

    paymentMethod: { type: String, enum: ['cod'], default: 'cod' },
    status: { type: String, enum: ORDER_STATUS, default: 'placed' },
    statusHistory: [{ status: String, note: String, at: { type: Date, default: Date.now } }],

    customerNote: String,
    adminNote: String,
  },
  { timestamps: true }
);

module.exports = model('Order', orderSchema);
module.exports.ORDER_STATUS = ORDER_STATUS;
