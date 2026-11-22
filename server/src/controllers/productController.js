import db from '../db/prisma.js';
import { sendSuccess, sendError } from '../utils/response.js';

export async function getProducts(req, res, next) {
  try {
    const {
      category,
      search,
      minPrice,
      maxPrice,
      isFeatured,
      inStock,
      sort = 'featured',
      page = 1,
      limit = 12,
    } = req.query;

    const where = { isActive: true };

    if (category && category !== 'all') {
      where.category = { slug: category };
    }

    if (search && search.trim() !== '') {
      where.search = search.trim();
    }

    if (isFeatured === 'true') {
      where.isFeatured = true;
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = Number(minPrice);
      if (maxPrice) where.price.lte = Number(maxPrice);
    }

    let orderBy = {};
    switch (sort) {
      case 'price_asc':
        orderBy = { price: 'asc' };
        break;
      case 'price_desc':
        orderBy = { price: 'desc' };
        break;
      case 'rating':
        orderBy = { rating: 'desc' };
        break;
      case 'newest':
        orderBy = { createdAt: 'desc' };
        break;
      case 'featured':
      default:
        orderBy = { rating: 'desc' };
        break;
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));
    const skip = (pageNum - 1) * limitNum;

    let products = await db.product.findMany({
      where,
      orderBy,
    });

    if (inStock === 'true') {
      products = products.filter((p) => p.stock > 0);
    }

    const total = products.length;
    const paginatedProducts = products.slice(skip, skip + limitNum);

    return sendSuccess(res, {
      products: paginatedProducts,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getFeaturedProducts(req, res, next) {
  try {
    const featured = await db.product.findMany({
      where: { isActive: true, isFeatured: true },
      take: 6,
    });
    return sendSuccess(res, { products: featured });
  } catch (err) {
    next(err);
  }
}

export async function getProductBySlugOrId(req, res, next) {
  try {
    const { identifier } = req.params;
    let product = await db.product.findUnique({ where: { slug: identifier } });
    if (!product) {
      product = await db.product.findUnique({ where: { id: identifier } });
    }

    if (!product || (!product.isActive && req.user?.role !== 'ADMIN')) {
      return sendError(res, 'Product not found or currently unavailable.', 404);
    }

    // Related products in same category
    const related = await db.product.findMany({
      where: {
        categoryId: product.categoryId,
        isActive: true,
      },
      take: 4,
    });

    const filteredRelated = related.filter((p) => p.id !== product.id).slice(0, 4);

    return sendSuccess(res, { product, relatedProducts: filteredRelated });
  } catch (err) {
    next(err);
  }
}
