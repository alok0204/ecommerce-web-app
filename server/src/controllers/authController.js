import db from '../db/prisma.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { signToken } from '../utils/jwt.js';
import { sendSuccess, sendError } from '../utils/response.js';

export async function register(req, res, next) {
  try {
    const { name, email, password, phone, address, city, state, postalCode } = req.body;

    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      return sendError(res, 'An account with this email address already exists.', 409);
    }

    const passwordHash = await hashPassword(password);
    const user = await db.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: 'USER', // Always regular USER via public registration
        phone: phone || null,
        address: address || null,
        city: city || null,
        state: state || null,
        postalCode: postalCode || null,
      },
    });

    const token = signToken({ userId: user.id, role: user.role });
    const { passwordHash: _, ...safeUser } = user;

    return sendSuccess(res, { user: safeUser, token }, 'Registration successful! Welcome to NEXORA.', 201);
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await db.user.findUnique({ where: { email } });
    if (!user) {
      return sendError(res, 'Invalid email or password credentials.', 401);
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      return sendError(res, 'Invalid email or password credentials.', 401);
    }

    const token = signToken({ userId: user.id, role: user.role });
    const { passwordHash: _, ...safeUser } = user;

    return sendSuccess(res, { user: safeUser, token }, 'Login successful! Welcome back.');
  } catch (err) {
    next(err);
  }
}

export async function getMe(req, res, next) {
  try {
    const user = await db.user.findUnique({ where: { id: req.user.id } });
    if (!user) {
      return sendError(res, 'User not found.', 404);
    }
    const { passwordHash: _, ...safeUser } = user;
    return sendSuccess(res, { user: safeUser });
  } catch (err) {
    next(err);
  }
}

export async function updateProfile(req, res, next) {
  try {
    const { name, phone, address, city, state, postalCode, country } = req.body;
    const updated = await db.user.update({
      where: { id: req.user.id },
      data: {
        ...(name && { name }),
        ...(phone !== undefined && { phone }),
        ...(address !== undefined && { address }),
        ...(city !== undefined && { city }),
        ...(state !== undefined && { state }),
        ...(postalCode !== undefined && { postalCode }),
        ...(country !== undefined && { country }),
      },
    });

    const { passwordHash: _, ...safeUser } = updated;
    return sendSuccess(res, { user: safeUser }, 'Profile updated successfully.');
  } catch (err) {
    next(err);
  }
}

// Secure admin bootstrap/check
export async function getAdminStatus(req, res, next) {
  try {
    const adminCount = await db.user.count({ where: { role: 'ADMIN' } });
    return sendSuccess(res, { hasAdmin: adminCount > 0 });
  } catch (err) {
    next(err);
  }
}
