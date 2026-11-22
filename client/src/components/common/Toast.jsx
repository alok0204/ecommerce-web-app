import React from 'react';
import { useCart } from '../../context/CartContext';
import { CheckCircle2 } from 'lucide-react';

export function Toast() {
  const { toastMessage } = useCart();

  if (!toastMessage) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-slide-up flex items-center gap-2.5 px-4 py-3 bg-slate-900/95 border border-brand-500/40 text-slate-100 rounded-xl shadow-2xl shadow-brand-950/50 backdrop-blur-md">
      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
      <span className="text-sm font-medium">{toastMessage}</span>
    </div>
  );
}
