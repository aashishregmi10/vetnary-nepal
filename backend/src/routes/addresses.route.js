const express = require('express');
const controller = require('../controllers/addresses.controller');
const { authenticate } = require('../middlewares/auth');

const router = express.Router();

router.use(authenticate);

router.get('/', controller.list);
router.post('/', controller.add);
router.put('/:addressId', controller.update);
router.delete('/:addressId', controller.remove);

module.exports = router;
