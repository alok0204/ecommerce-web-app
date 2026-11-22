import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { Star, ShoppingBag, Check } from 'lucide-react';
import { Badge } from './Badge';

export function ProductCard({ product }) {
  const { addToCart, items } = useCart();
  const isInCart = items.some((i) => i.productId === product.id);

  const discountPercent = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  return (
    <div className="group relative rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-brand-500/40 p-3.5 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:shadow-brand-950/30 hover:-translate-y-1">
      <div>
        {/* Image Container */}
        <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-slate-950/80">
          <Link to={`/products/${product.slug || product.id}`}>
            <img
              src={
                product.images?.[0] ||
                'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80'
              }
              alt={product.name}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          </Link>

          {/* Badges Overlay */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
            {product.badge && (
              <Badge variant="purple" className="shadow-lg backdrop-blur-md">
                {product.badge}
              </Badge>
            )}
            {discountPercent && (
              <span className="inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/90 text-white backdrop-blur-md shadow-md">
                -{discountPercent}%
              </span>
            )}
          </div>

          {/* Low Stock Warning */}
          {product.stock > 0 && product.stock <= 5 && (
            <div className="absolute bottom-2 left-2 right-2 px-2 py-1 rounded-lg bg-amber-950/80 border border-amber-500/40 text-amber-300 text-[11px] font-medium backdrop-blur-md text-center">
              Only {product.stock} left in stock!
            </div>
          )}

          {product.stock === 0 && (
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center">
              <span className="px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 font-semibold text-xs uppercase tracking-wider">
                Sold Out
              </span>
            </div>
          )}
        </div>

        {/* Content Info */}
        <div className="mt-3.5 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium text-brand-300/90 text-[11px] uppercase tracking-wider">
              {product.category?.name || 'General'}
            </span>
            <div className="flex items-center gap-1 text-amber-400">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span className="text-xs font-semibold text-slate-200">{product.rating || 4.8}</span>
              <span className="text-slate-500 text-[11px]">({product.reviewCount || 24})</span>
            </div>
          </div>

          <Link to={`/products/${product.slug || product.id}`}>
            <h3 className="font-semibold text-sm text-white group-hover:text-brand-300 transition-colors line-clamp-1 leading-snug">
              {product.name}
            </h3>
          </Link>

          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>
      </div>

      {/* Pricing & Add to Cart */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
        <div className="flex items-baseline gap-1.5">
          <span className="font-mono font-bold text-base text-white">
            ${Number(product.price).toFixed(2)}
          </span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="font-mono text-xs text-slate-500 line-through">
              ${Number(product.originalPrice).toFixed(2)}
            </span>
          )}
        </div>

        <button
          onClick={() => addToCart(product, 1)}
          disabled={product.stock === 0}
          className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
            product.stock === 0
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
              : isInCart
              ? 'bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-600/30'
              : 'bg-brand-600 hover:bg-brand-500 text-white shadow-md shadow-brand-600/30'
          }`}
          title={isInCart ? 'In Cart (Click to add another)' : 'Add to Cart'}
        >
          {isInCart ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span className="text-[11px] hidden sm:inline">Added</span>
            </>
          ) : (
            <>
              <ShoppingBag className="w-4 h-4" />
              <span className="text-[11px] hidden sm:inline">Add</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
