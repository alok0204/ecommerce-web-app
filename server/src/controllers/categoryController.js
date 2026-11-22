import db from '../db/prisma.js';
import { sendSuccess, sendError } from '../utils/response.js';

export async function getCategories(req, res, next) {
  try {
    const categories = await db.category.findMany();
    return sendSuccess(res, { categories });
  } catch (err) {
    next(err);
  }
}

export async function getCategoryBySlug(req, res, next) {
  try {
    const { slug } = req.params;
    const category = await db.category.findUnique({ where: { slug } });
    if (!category) {
      return sendError(res, 'Category not found', 404);
    }
    return sendSuccess(res, { category });
  } catch (err) {
    next(err);
  }
}
