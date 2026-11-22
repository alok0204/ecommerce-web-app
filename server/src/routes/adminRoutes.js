import { Router } from 'express';
import {
  getDashboardStats,
  getAllOrders,
  updateOrderStatus,
  createProduct,
  updateProduct,
  deleteProduct,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/adminController.js';
import { verifyAuth, requireAdmin } from '../middleware/authMiddleware.js';
import { validateProduct } from '../validators/productValidator.js';

const router = Router();

// Protect all admin routes with authentication and ADMIN role check
router.use(verifyAuth, requireAdmin);

router.get('/stats', getDashboardStats);
router.get('/orders', getAllOrders);
router.put('/orders/:id/status', updateOrderStatus);

router.post('/products', validateProduct, createProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);

router.post('/categories', createCategory);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);

export default router;
