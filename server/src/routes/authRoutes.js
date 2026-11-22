import { Router } from 'express';
import { register, login, getMe, updateProfile, getAdminStatus } from '../controllers/authController.js';
import { validateRegister, validateLogin } from '../validators/authValidator.js';
import { verifyAuth } from '../middleware/authMiddleware.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.post('/register', authLimiter, validateRegister, register);
router.post('/login', authLimiter, validateLogin, login);
router.get('/me', verifyAuth, getMe);
router.put('/profile', verifyAuth, updateProfile);
router.get('/admin-status', getAdminStatus);

export default router;
