import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, '../../data/nexora-db.json');

let realPrisma = null;
let isPostgresConnected = false;

// Attempt real Prisma connection if DATABASE_URL is configured
if (process.env.DATABASE_URL && process.env.DATABASE_URL.trim() !== '') {
  try {
    realPrisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
    });

    realPrisma.$connect()
      .then(() => {
        isPostgresConnected = true;
        console.log('✓ Successfully connected to PostgreSQL via Prisma ORM.');
      })
      .catch((err) => {
        console.warn('! PostgreSQL connection unreachable or pending. Using persistent file-backed database store:', err.message);
        isPostgresConnected = false;
      });
  } catch (err) {
    console.warn('! PrismaClient initialization warning:', err.message);
  }
} else {
  console.info('ℹ DATABASE_URL not set; using persistent local database storage.');
}

// Ensure data directory and persistent file exist
function getStore() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      const initialData = {
        users: [],
        categories: [],
        products: [],
        carts: [],
        cartItems: [],
        orders: [],
        orderItems: []
      };
      const dir = path.dirname(DATA_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
      return initialData;
    }
    const content = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(content || '{}');
  } catch (err) {
    console.error('Error reading persistent data store:', err);
    return { users: [], categories: [], products: [], carts: [], cartItems: [], orders: [], orderItems: [] };
  }
}

function saveStore(data) {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving to persistent data store:', err);
  }
}

// Persistent Store DB Wrapper with Prisma-compatible API
const storeDb = {
  user: {
    findUnique: async ({ where }) => {
      const store = getStore();
      return store.users.find((u) => {
        if (where.id) return u.id === where.id;
        if (where.email) return u.email.toLowerCase() === where.email.toLowerCase();
        return false;
      }) || null;
    },
    findFirst: async ({ where }) => {
      const store = getStore();
      return store.users.find((u) => {
        if (where.id && u.id !== where.id) return false;
        if (where.email && u.email.toLowerCase() !== where.email.toLowerCase()) return false;
        if (where.role && u.role !== where.role) return false;
        return true;
      }) || null;
    },
    findMany: async (args = {}) => {
      const store = getStore();
      let list = [...(store.users || [])];
      if (args.where?.role) {
        list = list.filter((u) => u.role === args.where.role);
      }
      return list;
    },
    create: async ({ data }) => {
      const store = getStore();
      const newUser = {
        id: data.id || uuidv4(),
        name: data.name,
        email: data.email.toLowerCase(),
        passwordHash: data.passwordHash,
        role: data.role || 'USER',
        avatar: data.avatar || null,
        phone: data.phone || null,
        address: data.address || null,
        city: data.city || null,
        state: data.state || null,
        postalCode: data.postalCode || null,
        country: data.country || 'India',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      store.users.push(newUser);
      saveStore(store);
      return newUser;
    },
    update: async ({ where, data }) => {
      const store = getStore();
      const idx = store.users.findIndex((u) => u.id === where.id);
      if (idx === -1) throw new Error('User not found');
      store.users[idx] = {
        ...store.users[idx],
        ...data,
        updatedAt: new Date().toISOString(),
      };
      saveStore(store);
      return store.users[idx];
    },
    count: async () => {
      const store = getStore();
      return store.users.length;
    }
  },

  category: {
    findMany: async () => {
      const store = getStore();
      return (store.categories || []).map((cat) => {
        const count = (store.products || []).filter((p) => p.categoryId === cat.id && p.isActive !== false).length;
        return { ...cat, _count: { products: count } };
      });
    },
    findUnique: async ({ where }) => {
      const store = getStore();
      return store.categories.find((c) => {
        if (where.id) return c.id === where.id;
        if (where.slug) return c.slug === where.slug;
        return false;
      }) || null;
    },
    create: async ({ data }) => {
      const store = getStore();
      const newCat = {
        id: data.id || uuidv4(),
        name: data.name,
        slug: data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description: data.description || '',
        image: data.image || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      store.categories.push(newCat);
      saveStore(store);
      return newCat;
    },
    update: async ({ where, data }) => {
      const store = getStore();
      const idx = store.categories.findIndex((c) => c.id === where.id);
      if (idx === -1) throw new Error('Category not found');
      store.categories[idx] = {
        ...store.categories[idx],
        ...data,
        updatedAt: new Date().toISOString(),
      };
      saveStore(store);
      return store.categories[idx];
    },
    delete: async ({ where }) => {
      const store = getStore();
      const idx = store.categories.findIndex((c) => c.id === where.id);
      if (idx === -1) throw new Error('Category not found');
      const removed = store.categories.splice(idx, 1)[0];
      saveStore(store);
      return removed;
    }
  },

  product: {
    findMany: async (args = {}) => {
      const store = getStore();
      let list = [...(store.products || [])];

      // Filters
      if (args.where) {
        const w = args.where;
        if (w.isActive !== undefined) {
          list = list.filter((p) => p.isActive === w.isActive);
        }
        if (w.isFeatured !== undefined) {
          list = list.filter((p) => p.isFeatured === w.isFeatured);
        }
        if (w.categoryId) {
          list = list.filter((p) => p.categoryId === w.categoryId);
        }
        if (w.category?.slug) {
          const cat = store.categories.find((c) => c.slug === w.category.slug);
          if (cat) {
            list = list.filter((p) => p.categoryId === cat.id);
          } else {
            return [];
          }
        }
        if (w.price) {
          if (w.price.gte !== undefined) list = list.filter((p) => p.price >= w.price.gte);
          if (w.price.lte !== undefined) list = list.filter((p) => p.price <= w.price.lte);
        }
        if (w.search) {
          const s = w.search.toLowerCase();
          list = list.filter((p) =>
            p.name.toLowerCase().includes(s) ||
            p.description.toLowerCase().includes(s) ||
            (p.badge && p.badge.toLowerCase().includes(s))
          );
        }
      }

      // Populate category
      list = list.map((p) => ({
        ...p,
        category: store.categories.find((c) => c.id === p.categoryId) || null,
      }));

      // Sort
      if (args.orderBy) {
        if (args.orderBy.price) {
          const dir = args.orderBy.price === 'desc' ? -1 : 1;
          list.sort((a, b) => (a.price - b.price) * dir);
        } else if (args.orderBy.rating) {
          const dir = args.orderBy.rating === 'desc' ? -1 : 1;
          list.sort((a, b) => (a.rating - b.rating) * dir);
        } else if (args.orderBy.createdAt) {
          const dir = args.orderBy.createdAt === 'desc' ? -1 : 1;
          list.sort((a, b) => (new Date(a.createdAt) - new Date(b.createdAt)) * dir);
        }
      }

      // Pagination
      if (args.skip || args.take) {
        const skip = args.skip || 0;
        const take = args.take || list.length;
        list = list.slice(skip, skip + take);
      }

      return list;
    },
    count: async (args = {}) => {
      const store = getStore();
      let list = [...(store.products || [])];
      if (args.where?.categoryId) {
        list = list.filter((p) => p.categoryId === args.where.categoryId);
      }
      if (args.where?.isActive !== undefined) {
        list = list.filter((p) => p.isActive === args.where.isActive);
      }
      return list.length;
    },
    findUnique: async ({ where }) => {
      const store = getStore();
      const p = store.products.find((prod) => {
        if (where.id) return prod.id === where.id;
        if (where.slug) return prod.slug === where.slug;
        return false;
      });
      if (!p) return null;
      return {
        ...p,
        category: store.categories.find((c) => c.id === p.categoryId) || null,
      };
    },
    create: async ({ data }) => {
      const store = getStore();
      const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now().toString().slice(-4);
      const newProd = {
        id: data.id || uuidv4(),
        name: data.name,
        slug,
        description: data.description || '',
        price: Number(data.price),
        originalPrice: data.originalPrice ? Number(data.originalPrice) : null,
        stock: Number(data.stock || 0),
        categoryId: data.categoryId,
        images: Array.isArray(data.images) ? data.images : (data.images ? [data.images] : []),
        badge: data.badge || null,
        rating: data.rating ? Number(data.rating) : 4.8,
        reviewCount: data.reviewCount ? Number(data.reviewCount) : Math.floor(Math.random() * 40) + 10,
        isFeatured: Boolean(data.isFeatured),
        isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
        specifications: data.specifications || {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      store.products.push(newProd);
      saveStore(store);
      return {
        ...newProd,
        category: store.categories.find((c) => c.id === newProd.categoryId) || null,
      };
    },
    update: async ({ where, data }) => {
      const store = getStore();
      const idx = store.products.findIndex((p) => p.id === where.id);
      if (idx === -1) throw new Error('Product not found');
      const updated = {
        ...store.products[idx],
        ...data,
        price: data.price !== undefined ? Number(data.price) : store.products[idx].price,
        originalPrice: data.originalPrice !== undefined ? (data.originalPrice ? Number(data.originalPrice) : null) : store.products[idx].originalPrice,
        stock: data.stock !== undefined ? Number(data.stock) : store.products[idx].stock,
        updatedAt: new Date().toISOString(),
      };
      store.products[idx] = updated;
      saveStore(store);
      return {
        ...updated,
        category: store.categories.find((c) => c.id === updated.categoryId) || null,
      };
    },
    delete: async ({ where }) => {
      const store = getStore();
      const idx = store.products.findIndex((p) => p.id === where.id);
      if (idx === -1) throw new Error('Product not found');
      const removed = store.products.splice(idx, 1)[0];
      saveStore(store);
      return removed;
    }
  },

  cart: {
    findUnique: async ({ where }) => {
      const store = getStore();
      const cart = store.carts.find((c) => {
        if (where.userId) return c.userId === where.userId;
        if (where.id) return c.id === where.id;
        return false;
      });
      if (!cart) return null;
      const items = (store.cartItems || [])
        .filter((ci) => ci.cartId === cart.id)
        .map((ci) => {
          const product = store.products.find((p) => p.id === ci.productId);
          return {
            ...ci,
            product: product ? {
              ...product,
              category: store.categories.find((c) => c.id === product.categoryId) || null,
            } : null,
          };
        });
      return { ...cart, items };
    },
    create: async ({ data }) => {
      const store = getStore();
      const newCart = {
        id: data.id || uuidv4(),
        userId: data.userId || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      store.carts.push(newCart);
      saveStore(store);
      return { ...newCart, items: [] };
    }
  },

  cartItem: {
    findFirst: async ({ where }) => {
      const store = getStore();
      return store.cartItems.find((ci) => ci.cartId === where.cartId && ci.productId === where.productId) || null;
    },
    findMany: async ({ where }) => {
      const store = getStore();
      return (store.cartItems || []).filter((ci) => ci.cartId === where.cartId);
    },
    create: async ({ data }) => {
      const store = getStore();
      const newItem = {
        id: data.id || uuidv4(),
        cartId: data.cartId,
        productId: data.productId,
        quantity: data.quantity || 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      store.cartItems.push(newItem);
      saveStore(store);
      return newItem;
    },
    update: async ({ where, data }) => {
      const store = getStore();
      const idx = store.cartItems.findIndex((ci) => ci.id === where.id);
      if (idx === -1) throw new Error('CartItem not found');
      store.cartItems[idx] = {
        ...store.cartItems[idx],
        ...data,
        updatedAt: new Date().toISOString(),
      };
      saveStore(store);
      return store.cartItems[idx];
    },
    delete: async ({ where }) => {
      const store = getStore();
      const idx = store.cartItems.findIndex((ci) => ci.id === where.id);
      if (idx === -1) return null;
      const removed = store.cartItems.splice(idx, 1)[0];
      saveStore(store);
      return removed;
    },
    deleteMany: async ({ where }) => {
      const store = getStore();
      const beforeCount = store.cartItems.length;
      store.cartItems = store.cartItems.filter((ci) => {
        if (where.cartId && ci.cartId === where.cartId) return false;
        return true;
      });
      saveStore(store);
      return { count: beforeCount - store.cartItems.length };
    }
  },

  order: {
    findMany: async (args = {}) => {
      const store = getStore();
      let list = [...(store.orders || [])];
      if (args.where?.userId) {
        list = list.filter((o) => o.userId === args.where.userId);
      }
      if (args.where?.status) {
        list = list.filter((o) => o.status === args.where.status);
      }
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      // Attach items
      return list.map((ord) => ({
        ...ord,
        items: (store.orderItems || []).filter((oi) => oi.orderId === ord.id),
      }));
    },
    findUnique: async ({ where }) => {
      const store = getStore();
      const ord = store.orders.find((o) => {
        if (where.id) return o.id === where.id;
        if (where.orderNumber) return o.orderNumber.toUpperCase() === where.orderNumber.toUpperCase();
        return false;
      });
      if (!ord) return null;
      return {
        ...ord,
        items: (store.orderItems || []).filter((oi) => oi.orderId === ord.id),
      };
    },
    count: async (args = {}) => {
      const store = getStore();
      let list = store.orders || [];
      if (args.where?.status) {
        list = list.filter((o) => o.status === args.where.status);
      }
      return list.length;
    },
    create: async ({ data }) => {
      const store = getStore();
      const newOrder = {
        id: data.id || uuidv4(),
        orderNumber: data.orderNumber,
        userId: data.userId || null,
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        shippingAddress: data.shippingAddress,
        city: data.city,
        state: data.state,
        postalCode: data.postalCode,
        country: data.country || 'India',
        shippingMethod: data.shippingMethod || 'standard',
        paymentMethod: data.paymentMethod || 'DEMO_CARD',
        paymentStatus: data.paymentStatus || 'DEMO_VERIFIED',
        status: data.status || 'PENDING',
        subtotal: Number(data.subtotal),
        shippingFee: Number(data.shippingFee || 0),
        tax: Number(data.tax || 0),
        discount: Number(data.discount || 0),
        total: Number(data.total),
        notes: data.notes || '',
        trackingNumber: data.trackingNumber || `TRK-${Date.now().toString().slice(-6)}`,
        carrier: data.carrier || 'Nexora Express',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      store.orders.push(newOrder);

      // Create order items if provided in data.items.create
      const createdItems = [];
      if (data.items?.create && Array.isArray(data.items.create)) {
        for (const item of data.items.create) {
          const oi = {
            id: uuidv4(),
            orderId: newOrder.id,
            productId: item.productId,
            productName: item.productName,
            productPrice: Number(item.productPrice),
            quantity: Number(item.quantity),
            subtotal: Number(item.subtotal),
            createdAt: new Date().toISOString(),
          };
          store.orderItems.push(oi);
          createdItems.push(oi);
        }
      }

      saveStore(store);
      return { ...newOrder, items: createdItems };
    },
    update: async ({ where, data }) => {
      const store = getStore();
      const idx = store.orders.findIndex((o) => o.id === where.id);
      if (idx === -1) throw new Error('Order not found');
      store.orders[idx] = {
        ...store.orders[idx],
        ...data,
        updatedAt: new Date().toISOString(),
      };
      saveStore(store);
      return {
        ...store.orders[idx],
        items: (store.orderItems || []).filter((oi) => oi.orderId === store.orders[idx].id),
      };
    }
  },

  orderItem: {
    findMany: async ({ where }) => {
      const store = getStore();
      return (store.orderItems || []).filter((oi) => oi.orderId === where.orderId);
    }
  },

  $transaction: async (fn) => {
    if (typeof fn === 'function') {
      return fn(storeDb);
    }
    return Promise.all(fn);
  }
};

// Export wrapper that uses PostgreSQL if connected, otherwise the robust persistent file store
const db = new Proxy({}, {
  get: (target, prop) => {
    if (isPostgresConnected && realPrisma && realPrisma[prop]) {
      return realPrisma[prop];
    }
    return storeDb[prop];
  }
});

export default db;
export { isPostgresConnected };
