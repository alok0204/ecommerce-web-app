import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Truck,
  Sparkles,
  Tag,
  ArrowLeft
} from 'lucide-react';

export function CartPage() {
  const {
    items,
    itemCount,
    subtotal,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();
  const navigate = useNavigate();

  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoError, setPromoError] = useState('');

  const FREE_SHIPPING_THRESHOLD = 50;
  const progressToFreeShipping = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);
  const amountNeeded = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  const handleApplyPromo = (e) => {
    e.preventDefault();
    setPromoError('');
    const code = promoInput.trim().toUpperCase();
    if (code === 'NEXORA10') {
      setAppliedPromo({ code, discountPercent: 10 });
    } else if (code === 'WELCOME20') {
      setAppliedPromo({ code, discountPercent: 20 });
    } else {
      setPromoError('Invalid coupon. Try NEXORA10 or WELCOME20.');
    }
  };

  const discountAmount = appliedPromo
    ? Number(((subtotal * appliedPromo.discountPercent) / 100).toFixed(2))
    : 0;
  const finalSubtotal = subtotal - discountAmount;
  const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD || items.length === 0 ? 0 : 5.00;
  const estimatedTax = items.length === 0 ? 0 : Number((finalSubtotal * 0.08).toFixed(2));
  const estimatedTotal = Number((finalSubtotal + shippingCost + estimatedTax).toFixed(2));

  const handleCheckout = () => {
    navigate('/checkout', { state: { promoCode: appliedPromo?.code } });
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 mx-auto shadow-xl">
          <ShoppingBag className="w-10 h-10 text-brand-400" />
        </div>
        <div className="space-y-2">
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-white">
            Your shopping cart is currently empty
          </h2>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Discover our curated catalog of precision audio, productivity gadgets, and modern tech accessories.
          </p>
        </div>
        <Link
          to="/catalog"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm shadow-xl shadow-brand-600/30 transition-all"
        >
          <span>Explore Catalog</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
            Shopping Cart
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Review your selected products, apply demo vouchers, and proceed to checkout.
          </p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1.5"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear All Items</span>
        </button>
      </div>

      {/* Free Shipping Tracker */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="text-slate-300 flex items-center gap-2 font-medium">
            <Truck className="w-4 h-4 text-brand-400" />
            {amountNeeded === 0 ? (
              <span className="text-emerald-400 font-semibold">You unlocked FREE Standard Shipping!</span>
            ) : (
              <span>Add <strong className="text-white">${amountNeeded.toFixed(2)}</strong> more to unlock FREE shipping</span>
            )}
          </span>
          <span className="text-slate-400 font-mono">{Math.round(progressToFreeShipping)}%</span>
        </div>
        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-brand-500 to-emerald-400 transition-all duration-500"
            style={{ width: `${progressToFreeShipping}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Cart Items Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-2xl bg-slate-900/50 border border-slate-800 divide-y divide-slate-800 overflow-hidden">
            {items.map((item) => (
              <div key={item.productId} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <img
                    src={
                      item.product?.images?.[0] ||
                      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=200&q=80'
                    }
                    alt={item.product?.name}
                    className="w-20 h-20 object-cover rounded-xl bg-slate-950 border border-slate-800 shrink-0"
                  />
                  <div>
                    <span className="text-[10px] uppercase font-bold text-brand-400">
                      {item.product?.category?.name || 'Category'}
                    </span>
                    <Link to={`/products/${item.product?.slug || item.productId}`}>
                      <h3 className="font-semibold text-sm text-white hover:text-brand-300 transition-colors line-clamp-1">
                        {item.product?.name}
                      </h3>
                    </Link>
                    <p className="text-xs text-slate-400 font-mono mt-1">
                      ${Number(item.product?.price || 0).toFixed(2)} unit price
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 pt-2 sm:pt-0 border-t border-slate-800/60 sm:border-0">
                  {/* Quantity Stepper */}
                  <div className="flex items-center border border-slate-700 rounded-xl bg-slate-950 p-1">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="p-1 hover:text-white text-slate-400"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center text-xs font-semibold text-white font-mono">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="p-1 hover:text-white text-slate-400"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Line Total */}
                  <div className="text-right min-w-[80px]">
                    <span className="font-mono font-bold text-sm text-white">
                      ${((item.product?.price || 0) * item.quantity).toFixed(2)}
                    </span>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.productId)}
                    className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <Link
            to="/catalog"
            className="inline-flex items-center gap-2 text-xs font-semibold text-brand-300 hover:text-brand-200"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Continue Shopping</span>
          </Link>
        </div>

        {/* Order Summary Box */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6 shadow-xl">
          <h2 className="font-display font-bold text-lg text-white pb-3 border-b border-slate-800">
            Order Summary
          </h2>

          {/* Coupon form */}
          <form onSubmit={handleApplyPromo} className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300">Promo Code</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Tag className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="NEXORA10"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 uppercase focus:outline-none focus:border-brand-500 font-mono"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors"
              >
                Apply
              </button>
            </div>
            {promoError && <p className="text-[11px] text-rose-400">{promoError}</p>}
            {appliedPromo && (
              <p className="text-[11px] text-emerald-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Coupon {appliedPromo.code} active ({appliedPromo.discountPercent}% OFF)
              </p>
            )}
          </form>

          {/* Breakdown */}
          <div className="space-y-2.5 text-xs text-slate-300 border-t border-slate-800 pt-4">
            <div className="flex justify-between">
              <span>Items Subtotal ({itemCount})</span>
              <span className="font-mono text-white">${subtotal.toFixed(2)}</span>
            </div>
            {appliedPromo && (
              <div className="flex justify-between text-emerald-400">
                <span>Discount ({appliedPromo.discountPercent}%)</span>
                <span className="font-mono">-${discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Standard Shipping</span>
              <span className="font-mono text-white">
                {shippingCost === 0 ? <strong className="text-emerald-400 font-semibold">FREE</strong> : `$${shippingCost.toFixed(2)}`}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Estimated Tax (8%)</span>
              <span className="font-mono text-white">${estimatedTax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-white pt-3 border-t border-slate-800">
              <span>Total Amount</span>
              <span className="text-brand-300 font-mono">${estimatedTotal.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={handleCheckout}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-xl shadow-brand-600/30 flex items-center justify-center gap-2 transition-all"
          >
            <span>Proceed to Demo Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <p className="text-[11px] text-slate-500 text-center">
            Demo platform simulation • No real monetary charge
          </p>
        </div>
      </div>
    </div>
  );
}
