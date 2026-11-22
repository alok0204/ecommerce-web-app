import { sendError } from '../utils/response.js';

export function validateProduct(req, res, next) {
  const { name, price, categoryId, stock } = req.body;
  const errors = [];

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    errors.push('Product name is required (min 2 characters).');
  }

  if (price === undefined || isNaN(Number(price)) || Number(price) <= 0) {
    errors.push('Valid positive product price is required.');
  }

  if (!categoryId || typeof categoryId !== 'string') {
    errors.push('Valid category ID is required.');
  }

  if (stock !== undefined && (isNaN(Number(stock)) || Number(stock) < 0)) {
    errors.push('Stock quantity cannot be negative.');
  }

  if (errors.length > 0) {
    return sendError(res, 'Validation failed', 400, errors);
  }

  next();
}
