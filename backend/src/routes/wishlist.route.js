const express = require('express');
const controller = require('../controllers/wishlist.controller');
const { authenticate } = require('../middlewares/auth');

const router = express.Router();

router.use(authenticate);

router.get('/', controller.list);
router.post('/', controller.add);
router.delete('/:productId', controller.remove);

module.exports = router;
