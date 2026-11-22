import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../services/api';
import { OrderStatusBadge } from '../components/common/Badge';
import {
  Package,
  Search,
  CheckCircle2,
  Clock,
  Truck,
  MapPin,
  AlertCircle,
  Loader2,
  ShieldAlert,
  ChevronRight,
  ArrowRight
} from 'lucide-react';

export function OrderTrackingPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('query') || '';
  const [query, setQuery] = useState(initialQuery);
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const executeTrack = async (searchStr) => {
    if (!searchStr || !searchStr.trim()) return;
    setLoading(true);
    setError('');
    setTrackingData(null);

    try {
      const res = await api.trackOrder(searchStr.trim());
      if (res.data) {
        setTrackingData(res.data);
      }
    } catch (err) {
      setError(err.message || 'No active shipment found matching this reference code.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      executeTrack(initialQuery);
    }
  }, [initialQuery]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchParams({ query: query.trim() });
      executeTrack(query.trim());
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Title */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-semibold">
          <Truck className="w-3.5 h-3.5 text-brand-400" />
          <span>Real-Time Logistics Tracking</span>
        </div>
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
          Track Your Order
        </h1>
        <p className="text-sm text-slate-400 max-w-lg mx-auto">
          Enter your Order Number (e.g. <strong className="text-brand-300 font-mono">NX-894210</strong>) to follow your shipment from warehouse dispatch to your doorstep.
        </p>
      </div>

      {/* Search Input Box */}
      <div className="p-4 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl">
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Package className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              required
              placeholder="e.g. NX-894210 or TRK-NEX-..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 uppercase focus:outline-none focus:border-brand-500 font-mono"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-7 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm shadow-xl shadow-brand-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Checking...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Track Package</span>
              </>
            )}
          </button>
        </form>

        {/* Demo Quick Pick Hints */}
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-400">
          <span>Try sample orders:</span>
          <button
            onClick={() => {
              setQuery('NX-894210');
              setSearchParams({ query: 'NX-894210' });
              executeTrack('NX-894210');
            }}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-brand-300 font-mono text-[11px]"
          >
            NX-894210 (Shipped)
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Tracking Results */}
      {trackingData && (
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-8 shadow-2xl animate-fade-in">
          {/* Header Summary */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div>
              <span className="text-xs text-slate-400">Order Reference</span>
              <div className="flex items-center gap-3 mt-1">
                <span className="font-mono font-bold text-2xl text-white">
                  {trackingData.order.orderNumber}
                </span>
                <OrderStatusBadge status={trackingData.order.status} />
              </div>
            </div>

            <div className="space-y-1 sm:text-right text-xs">
              <p className="text-slate-400">
                Carrier: <strong className="text-white">{trackingData.order.carrier}</strong>
              </p>
              <p className="text-slate-400 font-mono">
                Tracking: <strong className="text-brand-300">{trackingData.order.trackingNumber}</strong>
              </p>
              <p className="text-slate-500">
                Destination: {trackingData.order.city}, {trackingData.order.state}
              </p>
            </div>
          </div>

          {/* Stepper Timeline */}
          <div className="py-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-6">
              Shipment Progress
            </h3>

            <div className="relative space-y-6 sm:space-y-0 sm:grid sm:grid-cols-5 gap-4">
              {trackingData.timeline.map((step, index) => (
                <div key={step.status} className="relative flex sm:flex-col items-start sm:items-center text-left sm:text-center gap-3 sm:gap-2">
                  {/* Step Icon */}
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-all ${
                      step.completed
                        ? 'bg-emerald-500/20 text-emerald-400 ring-4 ring-emerald-500/20'
                        : step.current
                        ? 'bg-brand-500 text-white ring-4 ring-brand-500/30 animate-pulse'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {step.completed ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>

                  <div>
                    <h4
                      className={`text-xs font-semibold ${
                        step.completed || step.current ? 'text-white' : 'text-slate-500'
                      }`}
                    >
                      {step.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Package Contents */}
          <div className="space-y-3 pt-6 border-t border-slate-800">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Package Contents ({trackingData.order.itemCount} items)
            </h3>
            <div className="rounded-2xl border border-slate-800 overflow-hidden divide-y divide-slate-800">
              {trackingData.order.items?.map((item) => (
                <div key={item.id} className="p-3.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-white">{item.productName}</span>
                    <span className="text-slate-400 ml-2">× {item.quantity}</span>
                  </div>
                  <span className="font-mono text-white font-semibold">
                    ${Number(item.subtotal).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
