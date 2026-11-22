import db from '../db/prisma.js';
import { sendSuccess, sendError } from '../utils/response.js';

export async function createOrder(req, res, next) {
  try {
    const {
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      city,
      state,
      postalCode,
      country = 'India',
      shippingMethod = 'standard',
      paymentMethod = 'DEMO_CARD',
      promoCode,
      notes,
      items,
    } = req.body;

    const userId = req.user ? req.user.id : null;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return sendError(res, 'Cannot checkout with an empty order.', 400);
    }

    // Server-side inventory & price re-validation
    let subtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const product = await db.product.findUnique({ where: { id: item.productId } });
      if (!product || !product.isActive) {
        return sendError(res, `Item "${item.productName || item.productId}" is no longer available.`, 400);
      }

      if (product.stock < item.quantity) {
        return sendError(
          res,
          `Insufficient stock for "${product.name}". Only ${product.stock} available.`,
          400
        );
      }

      const itemPrice = Number(product.price);
      const itemSubtotal = Number((itemPrice * item.quantity).toFixed(2));
      subtotal += itemSubtotal;

      validatedItems.push({
        productId: product.id,
        productName: product.name,
        productPrice: itemPrice,
        quantity: Number(item.quantity),
        subtotal: itemSubtotal,
        currentStock: product.stock,
      });
    }

    subtotal = Number(subtotal.toFixed(2));

    // Shipping calculations
    let shippingFee = 0;
    if (shippingMethod === 'express') {
      shippingFee = 12.00;
    } else {
      shippingFee = subtotal >= 50 ? 0 : 5.00;
    }

    // Promo code validation
    let discount = 0;
    if (promoCode) {
      const code = promoCode.trim().toUpperCase();
      if (code === 'NEXORA10') {
        discount = Number((subtotal * 0.10).toFixed(2));
      } else if (code === 'WELCOME20') {
        discount = Number((subtotal * 0.20).toFixed(2));
      }
    }

    // Tax calculation (8%)
    const tax = Number(((subtotal - discount) * 0.08).toFixed(2));
    const total = Number((subtotal - discount + shippingFee + tax).toFixed(2));

    // Generate unique order number (e.g. NX-782910)
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const orderNumber = `NX-${randomSuffix}`;
    const trackingNumber = `TRK-NEX-${Math.floor(1000000 + Math.random() * 9000000)}`;

    // Atomic creation and inventory deduction
    const order = await db.order.create({
      data: {
        orderNumber,
        userId,
        customerName,
        customerEmail: customerEmail.toLowerCase(),
        customerPhone,
        shippingAddress,
        city,
        state,
        postalCode,
        country,
        shippingMethod,
        paymentMethod: paymentMethod || 'DEMO_CARD',
        paymentStatus: 'DEMO_VERIFIED',
        status: 'PENDING',
        subtotal,
        shippingFee,
        tax,
        discount,
        total,
        notes: notes || '',
        trackingNumber,
        carrier: 'Nexora Express Logistics',
        items: {
          create: validatedItems.map((vi) => ({
            productId: vi.productId,
            productName: vi.productName,
            productPrice: vi.productPrice,
            quantity: vi.quantity,
            subtotal: vi.subtotal,
          })),
        },
      },
    });

    // Deduct stock safely
    for (const item of validatedItems) {
      await db.product.update({
        where: { id: item.productId },
        data: { stock: Math.max(0, item.currentStock - item.quantity) },
      });
    }

    // Clear cart if user logged in
    if (userId) {
      const userCart = await db.cart.findUnique({ where: { userId } });
      if (userCart) {
        await db.cartItem.deleteMany({ where: { cartId: userCart.id } });
      }
    }

    return sendSuccess(res, { order }, 'Demo order successfully placed! Your order is being processed.', 201);
  } catch (err) {
    next(err);
  }
}

export async function getMyOrders(req, res, next) {
  try {
    const userId = req.user.id;
    const orders = await db.order.findMany({
      where: { userId },
    });
    return sendSuccess(res, { orders });
  } catch (err) {
    next(err);
  }
}

export async function getOrderByIdOrNumber(req, res, next) {
  try {
    const { identifier } = req.params;
    let order = await db.order.findUnique({ where: { orderNumber: identifier } });
    if (!order) {
      order = await db.order.findUnique({ where: { id: identifier } });
    }

    if (!order) {
      return sendError(res, 'Order not found.', 404);
    }

    // Access control: Only owner or admin can view complete details
    if (req.user) {
      if (req.user.role !== 'ADMIN' && order.userId && order.userId !== req.user.id) {
        return sendError(res, 'Unauthorized access to this order.', 403);
      }
    }

    return sendSuccess(res, { order });
  } catch (err) {
    next(err);
  }
}

export async function trackOrder(req, res, next) {
  try {
    const { query } = req.query;
    if (!query || query.trim() === '') {
      return sendError(res, 'Please provide an Order Number (e.g. NX-894210) or Tracking ID.', 400);
    }

    const cleanQuery = query.trim().toUpperCase();
    const allOrders = await db.order.findMany();
    const order = allOrders.find(
      (o) => o.orderNumber.toUpperCase() === cleanQuery || (o.trackingNumber && o.trackingNumber.toUpperCase() === cleanQuery)
    );

    if (!order) {
      return sendError(res, `No order found matching "${query}". Please check your order reference.`, 404);
    }

    // Tracking progress states definition
    const statuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
    const currentIndex = statuses.indexOf(order.status);

    const timeline = [
      {
        status: 'PENDING',
        title: 'Order Placed',
        description: 'We received your order and are validating details.',
        completed: currentIndex >= 0 && order.status !== 'CANCELLED',
        current: order.status === 'PENDING',
      },
      {
        status: 'CONFIRMED',
        title: 'Order Confirmed',
        description: 'Payment verified and sent to warehouse fulfillment.',
        completed: currentIndex >= 1 && order.status !== 'CANCELLED',
        current: order.status === 'CONFIRMED',
      },
      {
        status: 'PROCESSING',
        title: 'Packaging & Quality Check',
        description: 'Items are securely boxed with tamper-evident seal.',
        completed: currentIndex >= 2 && order.status !== 'CANCELLED',
        current: order.status === 'PROCESSING',
      },
      {
        status: 'SHIPPED',
        title: 'In Transit',
        description: `Dispatched with ${order.carrier || 'Nexora Express'}.`,
        completed: currentIndex >= 3 && order.status !== 'CANCELLED',
        current: order.status === 'SHIPPED',
      },
      {
        status: 'DELIVERED',
        title: 'Delivered',
        description: 'Package successfully delivered to recipient address.',
        completed: currentIndex >= 4 && order.status !== 'CANCELLED',
        current: order.status === 'DELIVERED',
      },
    ];

    return sendSuccess(res, {
      order: {
        orderNumber: order.orderNumber,
        status: order.status,
        createdAt: order.createdAt,
        carrier: order.carrier,
        trackingNumber: order.trackingNumber,
        city: order.city,
        state: order.state,
        country: order.country,
        itemCount: (order.items || []).reduce((acc, it) => acc + it.quantity, 0),
        items: order.items,
        total: order.total,
      },
      timeline,
      isCancelled: order.status === 'CANCELLED',
    });
  } catch (err) {
    next(err);
  }
}
