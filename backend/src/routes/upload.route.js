const express = require('express');
const multer = require('multer');
const controller = require('../controllers/upload.controller');
const { authenticate, requireAdmin } = require('../middlewares/auth');

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) return cb(new Error('Only image files are allowed'));
    cb(null, true);
  },
});

const router = express.Router();

router.post('/', authenticate, requireAdmin, upload.single('image'), controller.upload);

module.exports = router;
