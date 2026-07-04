const { Schema, model } = require('mongoose');

const reviewSchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: String,
    body: { type: String, required: true },
    isVerifiedPurchase: { type: Boolean, default: false }, // set true if an approved Order contains this product+user
    isApproved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = model('Review', reviewSchema);
