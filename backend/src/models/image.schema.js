const { Schema } = require('mongoose');

const imageSchema = new Schema(
  {
    publicId: String,
    secureUrl: String,
    name: String,
  },
  { _id: false }
);

module.exports = imageSchema;
