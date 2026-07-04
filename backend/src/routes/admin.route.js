const express = require('express');
const c = require('../controllers/admin.controller');
const { authenticate, requireAdmin } = require('../middlewares/auth');

const router = express.Router();

router.use(authenticate, requireAdmin); // every admin route is gated

router.get('/stats', c.stats);

router.get('/products', c.listProducts);
router.post('/products', c.createProduct);
router.get('/products/:id', c.getProduct);
router.put('/products/:id', c.updateProduct);
router.delete('/products/:id', c.deleteProduct);

router.get('/categories', c.listCategories);
router.post('/categories', c.createCategory);
router.put('/categories/:id', c.updateCategory);
router.delete('/categories/:id', c.deleteCategory);

router.get('/orders', c.listOrders);
router.put('/orders/:id/status', c.updateOrderStatus);

router.get('/users', c.listUsers);
router.put('/users/:id/ban', c.setUserBan);

router.get('/reviews', c.listReviews);
router.put('/reviews/:id/approve', c.approveReview);
router.delete('/reviews/:id', c.deleteReview);

module.exports = router;
