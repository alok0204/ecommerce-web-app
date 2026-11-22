import { Router } from 'express';
import { getCart, addToCart, updateCartItem, removeCartItem, clearCart } from '../controllers/cartController.js';
import { verifyAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.use(verifyAuth);

router.get('/', getCart);
router.post('/add', addToCart);
router.put('/item/:id', updateCartItem);
router.delete('/item/:id', removeCartItem);
router.delete('/clear', clearCart);

export default router;
