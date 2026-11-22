import { verifyToken } from '../utils/jwt.js';
import { sendError } from '../utils/response.js';
import db from '../db/prisma.js';

export async function verifyAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 'Authentication required. No token provided.', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId) {
      return sendError(res, 'Invalid or expired authentication session.', 401);
    }

    const user = await db.user.findUnique({ where: { id: decoded.userId } });
    if (!user) {
      return sendError(res, 'User associated with session no longer exists.', 401);
    }

    // Exclude passwordHash before attaching
    const { passwordHash, ...safeUser } = user;
    req.user = safeUser;
    next();
  } catch (err) {
    console.error('verifyAuth middleware error:', err);
    return sendError(res, 'Internal server authentication error.', 500);
  }
}

export function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'ADMIN') {
    return sendError(res, 'Forbidden. Administrator privileges required.', 403);
  }
  next();
}

export async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = verifyToken(token);
      if (decoded && decoded.userId) {
        const user = await db.user.findUnique({ where: { id: decoded.userId } });
        if (user) {
          const { passwordHash, ...safeUser } = user;
          req.user = safeUser;
        }
      }
    }
  } catch (err) {
    // Continue as guest
  }
  next();
}
