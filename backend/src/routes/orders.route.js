const express = require('express');
const controller = require('../controllers/orders.controller');
const { authenticate } = require('../middlewares/auth');

const router = express.Router();

router.use(authenticate); // all order routes require a logged-in user (no guest checkout)

router.post('/', controller.create);
router.get('/', controller.listMine);
router.get('/:orderNumber', controller.getOne);
router.post('/:orderNumber/cancel', controller.cancelMine);

module.exports = router;
