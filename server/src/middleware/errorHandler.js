import { sendError } from '../utils/response.js';

export function errorHandler(err, req, res, next) {
  console.error('Unhandled Error:', err);
  const statusCode = err.statusCode || 500;
  const message = err.message || 'An unexpected internal server error occurred.';
  return sendError(res, message, statusCode, process.env.NODE_ENV === 'development' ? err.stack : null);
}
