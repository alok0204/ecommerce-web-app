import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import api from '../services/api';
import confetti from 'canvas-confetti';
import {
  ShieldAlert,
  CreditCard,
  Truck,
  CheckCircle2,
  Lock,
  ArrowRight,
  Loader2,
  Tag,
  Building,
  User,
  Phone,
  Mail,
  MapPin,
  Sparkles
} from 'lucide-react';

export function CheckoutPage() {
  const { user } = useAuth();
  const { items, subtotal, clearCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const initialPromo = location.state?.promoCode || '';
  const [promoCode, setPromoCode] = useState(initialPromo);

  // Form states
  const [formData, setFormData] = useState({
    customerName: user?.name || '',
    customerEmail: user?.email || '',
    customerPhone: user?.phone || '+91 98765 43210',
    shippingAddress: user?.address || 'GL Bajaj Campus, Knowledge Park III',
    city: user?.city || 'Greater Noida',
    state: user?.state || 'Uttar Pradesh',
    postalCode: user?.postalCode || '201306',
    country: 'India',
    shippingMethod: 'standard', // 'standard' or 'express'
    paymentMethod: 'DEMO_CARD', // 'DEMO_CARD', 'DEMO_UPI', 'DEMO_COD'
    notes: 'Please verify order and leave at reception.',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Synchronize if user loaded later
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        customerName: prev.customerName || user.name || '',
        customerEmail: prev.customerEmail || user.email || '',
        customerPhone: prev.customerPhone || user.phone || '',
        shippingAddress: prev.shippingAddress || user.address || '',
        city: prev.city || user.city || '',
        state: prev.state || user.state || '',
        postalCode: prev.postalCode || user.postalCode || '',
      }));
    }
  }, [user]);

  // Calculations
  const FREE_SHIPPING_THRESHOLD = 50;
  const shippingFee = formData.shippingMethod === 'express' ? 12.00 : (subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 5.00);

  let discount = 0;
  if (promoCode.trim().toUpperCase() === 'NEXORA10') {
    discount = Number((subtotal * 0.10).toFixed(2));
  } else if (promoCode.trim().toUpperCase() === 'WELCOME20') {
    discount = Number((subtotal * 0.20).toFixed(2));
  }

  const taxableAmount = Math.max(0, subtotal - discount);
  const tax = Number((taxableAmount * 0.08).toFixed(2));
  const grandTotal = Number((taxableAmount + shippingFee + tax).toFixed(2));

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setError('');

    if (items.length === 0) {
      setError('Your shopping cart is empty. Please add items before checking out.');
      return;
    }

    if (!formData.customerName.trim() || !formData.customerEmail.trim() || !formData.shippingAddress.trim()) {
      setError('Please provide all mandatory recipient details.');
      return;
    }

    setLoading(true);

    try {
      const orderPayload = {
        ...formData,
        promoCode: promoCode.trim() || undefined,
        items: items.map((it) => ({
          productId: it.productId,
          productName: it.product?.name || 'Product',
          quantity: it.quantity,
          productPrice: it.product?.price || 0,
        })),
      };

      const res = await api.createOrder(orderPayload);
      const createdOrder = res.data?.order;

      // Celebrate with confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });

      // Clear the local cart
      clearCart();

      // Navigate to order confirmation
      navigate(`/order-confirmation/${createdOrder.orderNumber}`, {
        state: { order: createdOrder },
      });
    } catch (err) {
      console.error('Order creation failed:', err);
      setError(err.message || 'Unable to place order. Please review stock or details.');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-white">Your cart is empty</h2>
        <p className="text-sm text-slate-400">Add products to your cart before proceeding to checkout.</p>
        <Link to="/catalog" className="inline-flex px-5 py-2.5 rounded-xl bg-brand-600 text-white font-semibold text-xs">
          Return to Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Clear Demo Notice */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 flex items-start gap-3.5">
        <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs">
          <p className="font-semibold text-amber-300">
            DEMO CHECKOUT SIMULATION — No Real Payment Charged
          </p>
          <p className="text-amber-200/80">
            This checkout simulates the entire e-commerce purchase pipeline with real database order creation, server-calculated pricing, and live inventory subtraction. Never enter real credit card numbers.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between pb-6 border-b border-slate-800">
        <div>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
            Checkout
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Complete your shipping address and select simulated demo payment.
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
          <Lock className="w-4 h-4" />
          <span>256-Bit SSL Demo Encryption</span>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Shipping Form & Payment Selection */}
        <div className="lg:col-span-2 space-y-8">
          {/* 1. Customer & Shipping Address */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h2 className="font-display font-bold text-base text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-brand-600 text-white flex items-center justify-center text-xs font-bold">1</span>
              <span>Shipping Information</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500"
                    placeholder="Alok Kumar Vishwas"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={formData.customerEmail}
                    onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500"
                    placeholder="alokvishwas786@gmail.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number *</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    value={formData.customerPhone}
                    onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Country</label>
                <input
                  type="text"
                  disabled
                  value={formData.country}
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-400 cursor-not-allowed"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">Street Address *</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={formData.shippingAddress}
                    onChange={(e) => setFormData({ ...formData, shippingAddress: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500"
                    placeholder="Flat 402, Knowledge Park III Campus Road"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">City *</label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-brand-500"
                  placeholder="Greater Noida"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">State / Province *</label>
                <input
                  type="text"
                  required
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-brand-500"
                  placeholder="Uttar Pradesh"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Postal / ZIP Code *</label>
                <input
                  type="text"
                  required
                  value={formData.postalCode}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-brand-500 font-mono"
                  placeholder="201306"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Delivery Notes</label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-brand-500"
                  placeholder="Leave at front door"
                />
              </div>
            </div>
          </div>

          {/* 2. Shipping Speed */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h2 className="font-display font-bold text-base text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-brand-600 text-white flex items-center justify-center text-xs font-bold">2</span>
              <span>Shipping Speed</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label
                className={`p-4 rounded-xl border flex items-start justify-between cursor-pointer transition-all ${
                  formData.shippingMethod === 'standard'
                    ? 'bg-brand-950/30 border-brand-500/80 ring-1 ring-brand-500/50'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="shippingMethod"
                    value="standard"
                    checked={formData.shippingMethod === 'standard'}
                    onChange={() => setFormData({ ...formData, shippingMethod: 'standard' })}
                    className="mt-1 text-brand-600"
                  />
                  <div>
                    <p className="font-semibold text-sm text-white">Standard Delivery</p>
                    <p className="text-xs text-slate-400 mt-0.5">3-5 Business Days • Nexora Logistics</p>
                  </div>
                </div>
                <span className="font-mono font-bold text-xs text-emerald-400">
                  {subtotal >= 50 ? 'FREE' : '$5.00'}
                </span>
              </label>

              <label
                className={`p-4 rounded-xl border flex items-start justify-between cursor-pointer transition-all ${
                  formData.shippingMethod === 'express'
                    ? 'bg-brand-950/30 border-brand-500/80 ring-1 ring-brand-500/50'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="shippingMethod"
                    value="express"
                    checked={formData.shippingMethod === 'express'}
                    onChange={() => setFormData({ ...formData, shippingMethod: 'express' })}
                    className="mt-1 text-brand-600"
                  />
                  <div>
                    <p className="font-semibold text-sm text-white">Priority Express</p>
                    <p className="text-xs text-slate-400 mt-0.5">1-2 Business Days • Air Courier</p>
                  </div>
                </div>
                <span className="font-mono font-bold text-xs text-white">$12.00</span>
              </label>
            </div>
          </div>

          {/* 3. Demo Payment Selection */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h2 className="font-display font-bold text-base text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-brand-600 text-white flex items-center justify-center text-xs font-bold">3</span>
              <span>Demo Payment Simulation</span>
            </h2>

            <div className="space-y-3">
              <label
                className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  formData.paymentMethod === 'DEMO_CARD'
                    ? 'bg-brand-950/30 border-brand-500/80 ring-1 ring-brand-500/50'
                    : 'bg-slate-950/60 border-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="DEMO_CARD"
                    checked={formData.paymentMethod === 'DEMO_CARD'}
                    onChange={() => setFormData({ ...formData, paymentMethod: 'DEMO_CARD' })}
                    className="text-brand-600"
                  />
                  <CreditCard className="w-5 h-5 text-brand-400" />
                  <div>
                    <p className="text-sm font-semibold text-white">Simulated Visa / Mastercard (Instant Demo)</p>
                    <p className="text-xs text-slate-400">Pre-authorized test token • 4242 •••• •••• 4242</p>
                  </div>
                </div>
                <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                  Instant
                </span>
              </label>

              <label
                className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  formData.paymentMethod === 'DEMO_UPI'
                    ? 'bg-brand-950/30 border-brand-500/80 ring-1 ring-brand-500/50'
                    : 'bg-slate-950/60 border-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="DEMO_UPI"
                    checked={formData.paymentMethod === 'DEMO_UPI'}
                    onChange={() => setFormData({ ...formData, paymentMethod: 'DEMO_UPI' })}
                    className="text-brand-600"
                  />
                  <Building className="w-5 h-5 text-indigo-400" />
                  <div>
                    <p className="text-sm font-semibold text-white">Simulated UPI / NetBanking</p>
                    <p className="text-xs text-slate-400">nexora@okhdfcbank demo handle</p>
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Order Items Summary & Confirmation Action */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6 shadow-xl sticky top-24">
          <h3 className="font-display font-bold text-base text-white pb-3 border-b border-slate-800">
            Order Review ({items.length} items)
          </h3>

          {/* Mini Items List */}
          <div className="max-h-60 overflow-y-auto space-y-3 pr-1 divide-y divide-slate-800/60">
            {items.map((it) => (
              <div key={it.productId} className="pt-2 first:pt-0 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={it.product?.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=100&q=80'}
                    alt={it.product?.name}
                    className="w-10 h-10 object-cover rounded-lg bg-slate-950 border border-slate-800 shrink-0"
                  />
                  <div className="truncate">
                    <p className="font-medium text-white truncate">{it.product?.name}</p>
                    <p className="text-[11px] text-slate-400">Qty: {it.quantity}</p>
                  </div>
                </div>
                <span className="font-mono font-semibold text-white shrink-0">
                  ${((it.product?.price || 0) * it.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          {/* Breakdown */}
          <div className="space-y-2 text-xs text-slate-400 border-t border-slate-800 pt-4">
            <div className="flex justify-between">
              <span>Items Subtotal</span>
              <span className="font-mono text-white">${subtotal.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-emerald-400">
                <span>Promo Discount ({promoCode.toUpperCase()})</span>
                <span className="font-mono">-${discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Shipping Fee</span>
              <span className="font-mono text-white">
                {shippingFee === 0 ? <strong className="text-emerald-400 font-semibold">FREE</strong> : `$${shippingFee.toFixed(2)}`}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Sales Tax (8%)</span>
              <span className="font-mono text-white">${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-white pt-3 border-t border-slate-800">
              <span>Grand Total</span>
              <span className="text-brand-300 font-mono">${grandTotal.toFixed(2)}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-brand-600 via-indigo-600 to-violet-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-xl shadow-brand-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing Order in PostgreSQL...</span>
              </>
            ) : (
              <>
                <span>Place Demo Order (${grandTotal.toFixed(2)})</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
