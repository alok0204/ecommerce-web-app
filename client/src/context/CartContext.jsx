import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import api from '../services/api';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem('nexora_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Persist local cart
  useEffect(() => {
    localStorage.setItem('nexora_cart', JSON.stringify(items));
  }, [items]);

  // Sync with backend if user logs in
  useEffect(() => {
    if (isAuthenticated) {
      api.getCart()
        .then((res) => {
          if (res.data?.cart?.items && res.data.cart.items.length > 0) {
            // merge backend items
            const backendItems = res.data.cart.items.map((it) => ({
              productId: it.productId,
              product: it.product,
              quantity: it.quantity,
              dbItemId: it.id,
            }));
            setItems(backendItems);
          }
        })
        .catch((err) => console.log('Cart fetch info:', err.message));
    }
  }, [isAuthenticated]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const addToCart = (product, quantity = 1) => {
    const qty = Math.max(1, parseInt(quantity, 10));
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === product.id);
      if (existing) {
        const newQty = existing.quantity + qty;
        if (product.stock && newQty > product.stock) {
          showToast(`Cannot add more. Max stock available: ${product.stock}`);
          return prev;
        }
        showToast(`Updated "${product.name}" quantity (${newQty})`);
        return prev.map((i) =>
          i.productId === product.id ? { ...i, quantity: newQty } : i
        );
      } else {
        showToast(`Added "${product.name}" to cart`);
        return [...prev, { productId: product.id, product, quantity: qty }];
      }
    });

    if (isAuthenticated) {
      api.addToCart(product.id, qty).catch(() => {});
    }
  };

  const updateQuantity = (productId, quantity) => {
    const qty = parseInt(quantity, 10);
    if (qty <= 0) {
      removeFromCart(productId);
      return;
    }

    setItems((prev) => {
      return prev.map((item) => {
        if (item.productId === productId) {
          if (item.product?.stock && qty > item.product.stock) {
            showToast(`Max available stock is ${item.product.stock}`);
            return { ...item, quantity: item.product.stock };
          }
          return { ...item, quantity: qty };
        }
        return item;
      });
    });

    if (isAuthenticated) {
      const item = items.find((i) => i.productId === productId);
      if (item && item.dbItemId) {
        api.updateCartItem(item.dbItemId, qty).catch(() => {});
      }
    }
  };

  const removeFromCart = (productId) => {
    const item = items.find((i) => i.productId === productId);
    if (item) {
      showToast(`Removed "${item.product?.name || 'item'}" from cart`);
    }
    setItems((prev) => prev.filter((i) => i.productId !== productId));

    if (isAuthenticated && item?.dbItemId) {
      api.removeCartItem(item.dbItemId).catch(() => {});
    }
  };

  const clearCart = () => {
    setItems([]);
    if (isAuthenticated) {
      api.clearCart().catch(() => {});
    }
  };

  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = Number(
    items
      .reduce((acc, item) => {
        const price = item.product?.price || 0;
        return acc + price * item.quantity;
      }, 0)
      .toFixed(2)
  );

  const value = {
    items,
    itemCount,
    subtotal,
    isCartOpen,
    setIsCartOpen,
    openCart: () => setIsCartOpen(true),
    closeCart: () => setIsCartOpen(false),
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    toastMessage,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
}
