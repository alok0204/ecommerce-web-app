import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import api from '../services/api';
import { OrderStatusBadge } from '../components/common/Badge';
import {
  CheckCircle2,
  PackageCheck,
  Truck,
  Printer,
  ArrowRight,
  MapPin,
  Calendar,
  Hash,
  Loader2
} from 'lucide-react';

export function OrderConfirmationPage() {
  const { orderNumber } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(!location.state?.order);

  useEffect(() => {
    if (!order && orderNumber) {
      api.getOrder(orderNumber)
        .then((res) => {
          if (res.data?.order) setOrder(res.data.order);
        })
        .catch((err) => console.error('Failed to load order confirmation:', err))
        .finally(() => setLoading(false));
    }
  }, [orderNumber, order]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
        <p className="text-sm text-slate-400">Loading order receipt...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-white">Order Receipt Unavailable</h2>
        <p className="text-sm text-slate-400">Could not retrieve order reference {orderNumber}.</p>
        <Link to="/" className="inline-block px-5 py-2.5 rounded-xl bg-brand-600 text-white text-xs font-semibold">
          Return Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 print:p-0 print:space-y-4">
      {/* Top Success Banner */}
      <div className="text-center space-y-3 print:hidden">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto ring-8 ring-emerald-500/10">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
          Order Successfully Placed
        </span>
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-white">
          Thank you, {order.customerName}!
        </h1>
        <p className="text-sm text-slate-300 max-w-lg mx-auto">
          Your demo order has been logged in our PostgreSQL store. We’ve dispatched fulfillment instructions to our simulated warehouse.
        </p>
      </div>

      {/* Main Order Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-2xl print:bg-white print:text-black print:border-none print:shadow-none">
        {/* Header Metadata */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800 print:border-gray-200">
          <div>
            <span className="text-xs text-slate-400 print:text-gray-500">Order Number</span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="font-mono font-bold text-xl text-white print:text-black">
                {order.orderNumber}
              </span>
              <OrderStatusBadge status={order.status} />
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-400 print:text-gray-600">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-slate-500" />
              <span>{new Date(order.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-brand-400" />
              <span className="font-mono">{order.trackingNumber || 'TRK-NEX-0000'}</span>
            </div>
          </div>
        </div>

        {/* Shipping & Payment Meta Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs pb-6 border-b border-slate-800 print:border-gray-200">
          <div className="space-y-1">
            <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">
              Delivery Destination
            </span>
            <p className="font-medium text-white print:text-black">{order.customerName}</p>
            <p className="text-slate-300 print:text-gray-700">{order.shippingAddress}</p>
            <p className="text-slate-400 print:text-gray-600">
              {order.city}, {order.state} - {order.postalCode}, {order.country}
            </p>
            <p className="text-slate-400 print:text-gray-600 mt-1">Phone: {order.customerPhone}</p>
          </div>

          <div className="space-y-1 sm:text-right">
            <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">
              Fulfillment & Payment
            </span>
            <p className="font-medium text-white print:text-black">
              Carrier: {order.carrier || 'Nexora Express Logistics'}
            </p>
            <p className="text-slate-300 print:text-gray-700">
              Method: {order.shippingMethod === 'express' ? 'Priority Express (1-2 Days)' : 'Standard (3-5 Days)'}
            </p>
            <p className="text-emerald-400 font-semibold mt-1">
              Payment Status: Verified Demo Simulation ({order.paymentMethod})
            </p>
          </div>
        </div>

        {/* Items Table */}
        <div className="space-y-3">
          <h3 className="font-display font-bold text-sm text-white print:text-black">
            Order Items
          </h3>
          <div className="rounded-2xl border border-slate-800 overflow-hidden divide-y divide-slate-800 print:border-gray-200 print:divide-gray-200">
            {order.items?.map((item) => (
              <div key={item.id || item.productId} className="p-4 flex items-center justify-between text-xs">
                <div>
                  <p className="font-semibold text-white print:text-black">{item.productName}</p>
                  <p className="text-[11px] text-slate-400 print:text-gray-500 font-mono">
                    ${Number(item.productPrice).toFixed(2)} × {item.quantity} unit(s)
                  </p>
                </div>
                <span className="font-mono font-bold text-white print:text-black text-sm">
                  ${Number(item.subtotal).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Totals Summary */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-2 text-xs text-slate-400 print:bg-gray-50 print:border-gray-200">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="font-mono text-white print:text-black">${Number(order.subtotal).toFixed(2)}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-emerald-400 font-medium">
              <span>Applied Discount</span>
              <span className="font-mono">-${Number(order.discount).toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Shipping</span>
            <span className="font-mono text-white print:text-black">
              {order.shippingFee === 0 ? 'FREE' : `$${Number(order.shippingFee).toFixed(2)}`}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Tax (8%)</span>
            <span className="font-mono text-white print:text-black">${Number(order.tax).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-base font-bold text-white print:text-black pt-2 border-t border-slate-800 print:border-gray-300">
            <span>Total Paid</span>
            <span className="text-brand-300 print:text-black font-mono">${Number(order.total).toFixed(2)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800 print:hidden">
          <button
            onClick={() => window.print()}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center justify-center gap-2 transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print Receipt</span>
          </button>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Link
              to={`/track?query=${order.orderNumber}`}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-brand-600/30 transition-all"
            >
              <span>Track Delivery Live</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
