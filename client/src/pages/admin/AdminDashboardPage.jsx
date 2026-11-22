import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { OrderStatusBadge } from '../../components/common/Badge';
import {
  DollarSign,
  ShoppingBag,
  Package,
  Users,
  AlertTriangle,
  ArrowRight,
  Clock,
  TrendingUp,
  Loader2
} from 'lucide-react';

export function AdminDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await api.getAdminStats();
        if (res.data) setData(res.data);
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
      </div>
    );
  }

  const stats = data?.stats || {
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
    lowStockCount: 0,
  };

  const ordersByStatus = data?.ordersByStatus || {};
  const recentOrders = data?.recentOrders || [];
  const lowStockProducts = data?.lowStockProducts || [];

  return (
    <div className="p-6 md:p-8 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white">
            Executive Overview
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
            Real-time sales performance, fulfillment pipeline, and inventory status.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/admin/products"
            className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-lg shadow-brand-600/30 transition-all"
          >
            Manage Inventory
          </Link>
          <Link
            to="/admin/orders"
            className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-semibold"
          >
            All Orders
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Revenue
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="font-mono font-bold text-2xl text-white mt-3">
            ${stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1 font-medium">
            <TrendingUp className="w-3 h-3" />
            <span>Simulated demo sales</span>
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Orders
            </span>
            <div className="p-2 rounded-xl bg-brand-500/10 text-brand-400">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <p className="font-mono font-bold text-2xl text-white mt-3">{stats.totalOrders}</p>
          <p className="text-[11px] text-slate-400 mt-1">Orders processed</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Catalog Items
            </span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <p className="font-mono font-bold text-2xl text-white mt-3">{stats.totalProducts}</p>
          <p className="text-[11px] text-slate-400 mt-1">Active products listed</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Low Stock Alerts
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="font-mono font-bold text-2xl text-amber-300 mt-3">{stats.lowStockCount}</p>
          <p className="text-[11px] text-slate-400 mt-1">Items below 10 units</p>
        </div>
      </div>

      {/* Orders Status Pipeline */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
        <h2 className="font-display font-bold text-base text-white">
          Fulfillment Pipeline Status
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {Object.entries(ordersByStatus).map(([status, count]) => (
            <div key={status} className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {status}
                </span>
                <OrderStatusBadge status={status} />
              </div>
              <p className="font-mono font-bold text-xl text-white">{count}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Two Column Grid: Recent Orders & Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders (2 cols) */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="font-display font-bold text-base text-white">
              Recent Customer Orders
            </h2>
            <Link to="/admin/orders" className="text-xs font-semibold text-brand-300 hover:underline">
              View All Orders
            </Link>
          </div>

          <div className="divide-y divide-slate-800/80">
            {recentOrders.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No orders logged yet.</p>
            ) : (
              recentOrders.map((ord) => (
                <div key={ord.id} className="py-3.5 flex items-center justify-between gap-4 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-white">{ord.orderNumber}</span>
                      <OrderStatusBadge status={ord.status} />
                    </div>
                    <p className="text-slate-400 mt-0.5">
                      {ord.customerName} • {ord.customerEmail}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-white block">
                      ${Number(ord.total).toFixed(2)}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {new Date(ord.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Low Stock Warning Box (1 col) */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="font-display font-bold text-base text-amber-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Low Stock Alerts</span>
            </h2>
            <Link to="/admin/products" className="text-xs font-semibold text-slate-400 hover:text-white">
              Restock
            </Link>
          </div>

          <div className="divide-y divide-slate-800/80">
            {lowStockProducts.length === 0 ? (
              <p className="text-xs text-emerald-400/90 py-6 text-center">
                All inventory levels are currently healthy!
              </p>
            ) : (
              lowStockProducts.map((p) => (
                <div key={p.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div className="min-w-0">
                    <p className="font-semibold text-white truncate">{p.name}</p>
                    <p className="text-slate-400 text-[11px]">${Number(p.price).toFixed(2)}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 font-mono font-bold text-xs shrink-0">
                    {p.stock} left
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
