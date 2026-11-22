import { Router } from 'express';
import { getProducts, getFeaturedProducts, getProductBySlugOrId } from '../controllers/productController.js';
import { optionalAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/:identifier', optionalAuth, getProductBySlugOrId);

export default router;
