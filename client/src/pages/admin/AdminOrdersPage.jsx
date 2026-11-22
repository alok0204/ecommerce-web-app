import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { OrderStatusBadge } from '../../components/common/Badge';
import {
  ShoppingBag,
  Search,
  Filter,
  CheckCircle2,
  Truck,
  Eye,
  Calendar,
  X,
  Loader2
} from 'lucide-react';

export function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [feedback, setFeedback] = useState('');

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminOrders();
      if (res.data?.orders) setOrders(res.data.orders);
    } catch (err) {
      console.error('Failed to load admin orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const res = await api.updateOrderStatus(orderId, { status: newStatus });
      setFeedback(`Order status updated to ${newStatus}.`);
      setTimeout(() => setFeedback(''), 3000);

      // Update in local state immediately
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      alert(err.message || 'Failed to update order status.');
    }
  };

  const statuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

  const filtered = orders.filter((o) => {
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    const matchSearch =
      !search ||
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      o.customerEmail.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white">
            Customer Orders & Fulfillment
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
            Review live demo orders, update fulfillment statuses, and inspect shipping destinations.
          </p>
        </div>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search order #, customer, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <span className="text-xs text-slate-400 hidden sm:inline">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500 w-full sm:w-auto"
          >
            <option value="all">All Statuses ({orders.length})</option>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s} ({orders.filter((o) => o.status === s).length})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
            <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            No orders match the selected filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="p-4">Order #</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Destination</th>
                  <th className="p-4">Total</th>
                  <th className="p-4">Update Status</th>
                  <th className="p-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filtered.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4">
                      <span className="font-mono font-bold text-white block">
                        {ord.orderNumber}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {(ord.items || []).length} line items
                      </span>
                    </td>

                    <td className="p-4">
                      <p className="font-semibold text-white">{ord.customerName}</p>
                      <p className="text-[11px] text-slate-400">{ord.customerEmail}</p>
                    </td>

                    <td className="p-4 text-slate-400">
                      {new Date(ord.createdAt).toLocaleDateString()}
                    </td>

                    <td className="p-4 text-slate-300">
                      {ord.city}, {ord.state}
                    </td>

                    <td className="p-4 font-mono font-semibold text-white">
                      ${Number(ord.total).toFixed(2)}
                    </td>

                    <td className="p-4">
                      <select
                        value={ord.status}
                        onChange={(e) => handleStatusChange(ord.id, e.target.value)}
                        className={`bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs font-semibold focus:outline-none focus:border-brand-500 ${
                          ord.status === 'DELIVERED'
                            ? 'text-emerald-400'
                            : ord.status === 'CANCELLED'
                            ? 'text-rose-400'
                            : ord.status === 'SHIPPED'
                            ? 'text-brand-300'
                            : 'text-amber-300'
                        }`}
                      >
                        {statuses.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="p-4 text-right">
                      <button
                        onClick={() => setSelectedOrder(ord)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium inline-flex items-center gap-1.5 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5 text-brand-400" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Inspect Order Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 space-y-6 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <span className="text-xs text-slate-400">Order Inspection</span>
                <div className="flex items-center gap-3 mt-1">
                  <h3 className="font-mono font-bold text-xl text-white">
                    {selectedOrder.orderNumber}
                  </h3>
                  <OrderStatusBadge status={selectedOrder.status} />
                </div>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Customer Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 text-xs">
              <div className="space-y-1">
                <p className="font-semibold text-slate-400 uppercase text-[10px]">Customer Details</p>
                <p className="text-white font-medium">{selectedOrder.customerName}</p>
                <p className="text-slate-300">{selectedOrder.customerEmail}</p>
                <p className="text-slate-400">Phone: {selectedOrder.customerPhone}</p>
              </div>

              <div className="space-y-1">
                <p className="font-semibold text-slate-400 uppercase text-[10px]">Delivery Address</p>
                <p className="text-slate-200">{selectedOrder.shippingAddress}</p>
                <p className="text-slate-400">
                  {selectedOrder.city}, {selectedOrder.state} - {selectedOrder.postalCode}
                </p>
                <p className="text-brand-300 font-mono mt-1">
                  Tracking: {selectedOrder.trackingNumber || 'N/A'}
                </p>
              </div>
            </div>

            {/* Line Items */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
                Order Items ({selectedOrder.items?.length || 0})
              </h4>
              <div className="rounded-xl border border-slate-800 overflow-hidden divide-y divide-slate-800 text-xs">
                {selectedOrder.items?.map((it) => (
                  <div key={it.id} className="p-3 flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-white">{it.productName}</p>
                      <p className="text-[11px] text-slate-400 font-mono">
                        ${Number(it.productPrice).toFixed(2)} × {it.quantity}
                      </p>
                    </div>
                    <span className="font-mono font-bold text-white">
                      ${Number(it.subtotal).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Summary */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs text-slate-400">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-mono text-white">${Number(selectedOrder.subtotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="font-mono text-white">${Number(selectedOrder.shippingFee).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span className="font-mono text-white">${Number(selectedOrder.tax).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-slate-800">
                <span>Total</span>
                <span className="text-brand-300 font-mono">${Number(selectedOrder.total).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
