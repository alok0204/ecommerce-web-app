import { Router } from 'express';
import { createOrder, getMyOrders, getOrderByIdOrNumber, trackOrder } from '../controllers/orderController.js';
import { verifyAuth, optionalAuth } from '../middleware/authMiddleware.js';
import { validateOrder } from '../validators/orderValidator.js';

const router = Router();

router.post('/checkout', optionalAuth, validateOrder, createOrder);
router.get('/my-orders', verifyAuth, getMyOrders);
router.get('/track', trackOrder);
router.get('/:identifier', optionalAuth, getOrderByIdOrNumber);

export default router;
