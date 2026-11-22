import db from '../db/prisma.js';
import { sendSuccess, sendError } from '../utils/response.js';

export async function getDashboardStats(req, res, next) {
  try {
    const orders = await db.order.findMany();
    const products = await db.product.findMany();
    const categories = await db.category.findMany();
    const users = await db.user.findMany();

    const validOrders = orders.filter((o) => o.status !== 'CANCELLED');
    const totalRevenue = validOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    const lowStockProducts = products.filter((p) => p.stock < 10);

    const ordersByStatus = {
      PENDING: orders.filter((o) => o.status === 'PENDING').length,
      CONFIRMED: orders.filter((o) => o.status === 'CONFIRMED').length,
      PROCESSING: orders.filter((o) => o.status === 'PROCESSING').length,
      SHIPPED: orders.filter((o) => o.status === 'SHIPPED').length,
      DELIVERED: orders.filter((o) => o.status === 'DELIVERED').length,
      CANCELLED: orders.filter((o) => o.status === 'CANCELLED').length,
    };

    const recentOrders = orders.slice(0, 6);

    return sendSuccess(res, {
      stats: {
        totalRevenue: Number(totalRevenue.toFixed(2)),
        totalOrders: orders.length,
        totalProducts: products.length,
        totalCustomers: users.filter((u) => u.role === 'USER').length,
        lowStockCount: lowStockProducts.length,
      },
      ordersByStatus,
      recentOrders,
      lowStockProducts: lowStockProducts.slice(0, 5),
    });
  } catch (err) {
    next(err);
  }
}

export async function getAllOrders(req, res, next) {
  try {
    const { status, search } = req.query;
    let orders = await db.order.findMany();

    if (status && status !== 'all') {
      orders = orders.filter((o) => o.status === status);
    }

    if (search && search.trim() !== '') {
      const q = search.trim().toLowerCase();
      orders = orders.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.customerEmail.toLowerCase().includes(q)
      );
    }

    return sendSuccess(res, { orders, total: orders.length });
  } catch (err) {
    next(err);
  }
}

export async function updateOrderStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status, trackingNumber, carrier, notes } = req.body;

    const validStatuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return sendError(res, `Invalid order status. Allowed: ${validStatuses.join(', ')}`, 400);
    }

    const updated = await db.order.update({
      where: { id },
      data: {
        status,
        ...(trackingNumber && { trackingNumber }),
        ...(carrier && { carrier }),
        ...(notes !== undefined && { notes }),
      },
    });

    return sendSuccess(res, { order: updated }, `Order status updated to ${status}.`);
  } catch (err) {
    next(err);
  }
}

export async function createProduct(req, res, next) {
  try {
    const product = await db.product.create({
      data: req.body,
    });
    return sendSuccess(res, { product }, 'Product successfully created.', 201);
  } catch (err) {
    next(err);
  }
}

export async function updateProduct(req, res, next) {
  try {
    const { id } = req.params;
    const product = await db.product.update({
      where: { id },
      data: req.body,
    });
    return sendSuccess(res, { product }, 'Product updated successfully.');
  } catch (err) {
    next(err);
  }
}

export async function deleteProduct(req, res, next) {
  try {
    const { id } = req.params;
    await db.product.delete({ where: { id } });
    return sendSuccess(res, null, 'Product deleted successfully.');
  } catch (err) {
    next(err);
  }
}

export async function createCategory(req, res, next) {
  try {
    const category = await db.category.create({ data: req.body });
    return sendSuccess(res, { category }, 'Category created successfully.', 201);
  } catch (err) {
    next(err);
  }
}

export async function updateCategory(req, res, next) {
  try {
    const { id } = req.params;
    const category = await db.category.update({ where: { id }, data: req.body });
    return sendSuccess(res, { category }, 'Category updated successfully.');
  } catch (err) {
    next(err);
  }
}

export async function deleteCategory(req, res, next) {
  try {
    const { id } = req.params;
    await db.category.delete({ where: { id } });
    return sendSuccess(res, null, 'Category deleted successfully.');
  } catch (err) {
    next(err);
  }
}
