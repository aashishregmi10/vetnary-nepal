const streamifier = require('streamifier');
const cloudinary = require('../config/cloudinary');
const { ok, fail } = require('../utils/apiResponse');

function uploadBuffer(buffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder: 'pawmart/products' }, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
    streamifier.createReadStream(buffer).pipe(stream);
  });
}

async function upload(req, res, next) {
  try {
    if (!req.file) return fail(res, 'No image file provided', 400, [{ code: 'NO_FILE' }]);
    const result = await uploadBuffer(req.file.buffer);
    return ok(
      res,
      { publicId: result.public_id, secureUrl: result.secure_url, name: req.file.originalname },
      'Image uploaded'
    );
  } catch (err) {
    return next(err);
  }
}

module.exports = { upload };
