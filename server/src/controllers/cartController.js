import db from '../db/prisma.js';
import { sendSuccess, sendError } from '../utils/response.js';

export async function getCart(req, res, next) {
  try {
    const userId = req.user.id;
    let cart = await db.cart.findUnique({ where: { userId } });
    if (!cart) {
      cart = await db.cart.create({ data: { userId } });
    }

    const items = cart.items || [];
    const subtotal = items.reduce((sum, item) => {
      const price = item.product ? item.product.price : 0;
      return sum + price * item.quantity;
    }, 0);

    return sendSuccess(res, {
      cart: {
        id: cart.id,
        items,
        itemCount: items.reduce((cnt, item) => cnt + item.quantity, 0),
        subtotal: Number(subtotal.toFixed(2)),
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function addToCart(req, res, next) {
  try {
    const userId = req.user.id;
    const { productId, quantity = 1 } = req.body;

    const product = await db.product.findUnique({ where: { id: productId } });
    if (!product || !product.isActive) {
      return sendError(res, 'Product not found or currently unavailable.', 404);
    }

    if (product.stock < quantity) {
      return sendError(res, `Only ${product.stock} units available in stock.`, 400);
    }

    let cart = await db.cart.findUnique({ where: { userId } });
    if (!cart) {
      cart = await db.cart.create({ data: { userId } });
    }

    const existingItem = await db.cartItem.findFirst({
      where: { cartId: cart.id, productId },
    });

    if (existingItem) {
      const newQty = existingItem.quantity + Number(quantity);
      if (product.stock < newQty) {
        return sendError(res, `Cannot add more. Max ${product.stock} units in stock.`, 400);
      }
      await db.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQty },
      });
    } else {
      await db.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity: Number(quantity),
        },
      });
    }

    return getCart(req, res, next);
  } catch (err) {
    next(err);
  }
}

export async function updateCartItem(req, res, next) {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    const qty = parseInt(quantity, 10);

    if (isNaN(qty) || qty <= 0) {
      await db.cartItem.delete({ where: { id } });
      return getCart(req, res, next);
    }

    await db.cartItem.update({
      where: { id },
      data: { quantity: qty },
    });

    return getCart(req, res, next);
  } catch (err) {
    next(err);
  }
}

export async function removeCartItem(req, res, next) {
  try {
    const { id } = req.params;
    await db.cartItem.delete({ where: { id } });
    return getCart(req, res, next);
  } catch (err) {
    next(err);
  }
}

export async function clearCart(req, res, next) {
  try {
    const userId = req.user.id;
    const cart = await db.cart.findUnique({ where: { userId } });
    if (cart) {
      await db.cartItem.deleteMany({ where: { cartId: cart.id } });
    }
    return sendSuccess(res, { items: [], itemCount: 0, subtotal: 0 }, 'Cart cleared successfully.');
  } catch (err) {
    next(err);
  }
}
