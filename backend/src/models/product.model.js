const { Schema, model } = require('mongoose');
const imageSchema = require('./image.schema');

const SPECIES = ['dog', 'cat', 'bird', 'fish', 'small-pet', 'reptile'];
const STOCK_STATUS = ['in-stock', 'low-stock', 'out-of-stock', 'discontinued'];

const productSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true },
    name: { type: String, required: true, trim: true },
    brand: { type: String, required: true },
    species: { type: String, enum: SPECIES, required: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    tags: [String],

    price: { type: Number, required: true, min: 0 },
    comparePrice: { type: Number, min: 0 },
    costPrice: { type: Number, min: 0, select: false }, // admin-only margin, never serialized to storefront

    stock: { type: Number, required: true, default: 0, min: 0 },
    stockStatus: { type: String, enum: STOCK_STATUS, default: 'in-stock' },
    lowStockThreshold: { type: Number, default: 5 },

    coverImage: imageSchema,
    images: [imageSchema],

    shortDescription: { type: String, maxlength: 160 },
    description: String,
    specifications: {
      weight: String,
      suitableFor: String, // e.g. "Puppies, all breeds" — rendered in <dl>
      ingredients: String,
      material: String,
      countryOfOrigin: String,
      expiryDate: Date,
    },

    metaTitle: String,
    metaDescription: String,

    avgRating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    soldCount: { type: Number, default: 0 },
    viewCount: { type: Number, default: 0 },

    isFeatured: { type: Boolean, default: false },
    isNewArrival: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

productSchema.pre('validate', function deriveStockStatus() {
  if (this.stock <= 0) this.stockStatus = 'out-of-stock';
  else if (this.stock <= this.lowStockThreshold) this.stockStatus = 'low-stock';
  else this.stockStatus = 'in-stock';
});

module.exports = model('Product', productSchema);
module.exports.SPECIES = SPECIES;
module.exports.STOCK_STATUS = STOCK_STATUS;
