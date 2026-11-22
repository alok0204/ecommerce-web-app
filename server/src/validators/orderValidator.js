import { sendError } from '../utils/response.js';

export function validateOrder(req, res, next) {
  const { customerName, customerEmail, customerPhone, shippingAddress, city, state, postalCode, items } = req.body;
  const errors = [];

  if (!customerName || customerName.trim().length < 2) {
    errors.push('Recipient full name is required.');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!customerEmail || !emailRegex.test(customerEmail)) {
    errors.push('Valid email address is required.');
  }

  if (!customerPhone || customerPhone.trim().length < 7) {
    errors.push('Valid phone number is required.');
  }

  if (!shippingAddress || shippingAddress.trim().length < 5) {
    errors.push('Street address is required.');
  }

  if (!city || city.trim().length < 2) {
    errors.push('City is required.');
  }

  if (!postalCode || postalCode.trim().length < 3) {
    errors.push('Postal/ZIP code is required.');
  }

  if (!items || !Array.isArray(items) || items.length === 0) {
    errors.push('Order must contain at least one valid item.');
  }

  if (errors.length > 0) {
    return sendError(res, 'Validation failed', 400, errors);
  }

  next();
}
