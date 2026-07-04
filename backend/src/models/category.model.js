const { Schema, model } = require('mongoose');
const imageSchema = require('./image.schema');

const categorySchema = new Schema(
  {
    slug: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    parent: { type: Schema.Types.ObjectId, ref: 'Category', default: null },
    description: String, // feeds the silo page's BLUF paragraph
    image: imageSchema,
    metaTitle: String,
    metaDescription: String,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = model('Category', categorySchema);
