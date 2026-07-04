const { Schema, model } = require('mongoose');

const counterSchema = new Schema({
  _id: { type: String, required: true }, // e.g. "orderNumber"
  seq: { type: Number, default: 0 },
});

counterSchema.statics.nextSequence = async function nextSequence(name) {
  const doc = await this.findByIdAndUpdate(name, { $inc: { seq: 1 } }, { new: true, upsert: true });
  return doc.seq;
};

module.exports = model('Counter', counterSchema);
