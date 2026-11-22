import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { ProductCard } from '../components/common/ProductCard';
import { Badge } from '../components/common/Badge';
import {
  Star,
  ShoppingBag,
  Check,
  Truck,
  ShieldCheck,
  RotateCcw,
  Plus,
  Minus,
  ChevronRight,
  ArrowLeft,
  Loader2,
  Sparkles
} from 'lucide-react';

export function ProductDetailPage() {
  const { identifier } = useParams();
  const { addToCart, items } = useCart();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    async function fetchProduct() {
      setLoading(true);
      setError('');
      try {
        const res = await api.getProduct(identifier);
        if (res.data?.product) {
          setProduct(res.data.product);
          setSelectedImage(res.data.product.images?.[0] || '');
          setRelatedProducts(res.data.relatedProducts || []);
          setQuantity(1);
        } else {
          setError('Product not found.');
        }
      } catch (err) {
        setError(err.message || 'Failed to load product details.');
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
    window.scrollTo(0, 0);
  }, [identifier]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
        <p className="text-sm text-slate-400">Loading product specs...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Product Not Available</h2>
        <p className="text-sm text-slate-400">{error || 'Unable to locate this item in the catalog.'}</p>
        <Link
          to="/catalog"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Catalog</span>
        </Link>
      </div>
    );
  }

  const discountPercent = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2500);
  };

  const imagesList = product.images && product.images.length > 0
    ? product.images
    : ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-400">
        <Link to="/" className="hover:text-white transition-colors">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
        <Link to="/catalog" className="hover:text-white transition-colors">Catalog</Link>
        {product.category && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <Link
              to={`/catalog?category=${product.category.slug}`}
              className="hover:text-white transition-colors"
            >
              {product.category.name}
            </Link>
          </>
        )}
        <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
        <span className="text-slate-200 truncate max-w-[200px]">{product.name}</span>
      </nav>

      {/* Product Main Display */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Gallery Section */}
        <div className="space-y-4">
          <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl">
            <img
              src={selectedImage || imagesList[0]}
              alt={product.name}
              className="w-full h-full object-cover object-center"
            />
            {product.badge && (
              <div className="absolute top-4 left-4">
                <Badge variant="purple" className="shadow-lg backdrop-blur-md text-xs py-1 px-3">
                  {product.badge}
                </Badge>
              </div>
            )}
          </div>

          {imagesList.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {imagesList.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                    selectedImage === img
                      ? 'border-brand-500 scale-105'
                      : 'border-slate-800 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`thumbnail-${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info & Purchase Actions */}
        <div className="space-y-6">
          <div className="space-y-2">
            <span className="text-xs uppercase font-bold tracking-widest text-brand-400">
              {product.category?.name || 'Engineered Goods'}
            </span>
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl md:text-4xl text-white tracking-tight">
              {product.name}
            </h1>

            {/* Ratings */}
            <div className="flex items-center gap-3 pt-1">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(product.rating || 5) ? 'fill-amber-400 text-amber-400' : 'text-slate-600'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs font-semibold text-white">{product.rating || 4.9}</span>
              <span className="text-xs text-slate-500">
                • {product.reviewCount || 48} verified ratings
              </span>
            </div>
          </div>

          {/* Pricing */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <div className="flex items-baseline gap-3">
              <span className="font-mono font-bold text-3xl text-white">
                ${Number(product.price).toFixed(2)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="font-mono text-base text-slate-500 line-through">
                  ${Number(product.originalPrice).toFixed(2)}
                </span>
              )}
            </div>

            {discountPercent && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 border border-rose-500/30 text-rose-300">
                Save {discountPercent}%
              </span>
            )}
          </div>

          {/* Stock Indicator */}
          <div>
            {product.stock > 10 ? (
              <p className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                In Stock ({product.stock} units ready to dispatch)
              </p>
            ) : product.stock > 0 ? (
              <p className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                Only {product.stock} units left in warehouse!
              </p>
            ) : (
              <p className="text-xs font-semibold text-rose-400">
                Currently Out of Stock
              </p>
            )}
          </div>

          {/* Description */}
          <p className="text-slate-300 text-sm leading-relaxed">
            {product.description}
          </p>

          {/* Quantity and Add To Cart */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-4">
              <span className="text-xs font-semibold text-slate-400">Quantity</span>
              <div className="flex items-center border border-slate-700 rounded-xl bg-slate-950 p-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-1.5 hover:text-white text-slate-400"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-10 text-center text-sm font-semibold text-white font-mono">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock || 99, quantity + 1))}
                  className="p-1.5 hover:text-white text-slate-400"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className={`flex-1 py-3.5 px-6 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 shadow-xl transition-all ${
                  isAdded
                    ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                    : 'bg-brand-600 hover:bg-brand-500 text-white shadow-brand-600/30 hover:scale-[1.01]'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isAdded ? (
                  <>
                    <Check className="w-5 h-5" />
                    <span>Added to Cart!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5" />
                    <span>Add {quantity} to Cart • ${(Number(product.price) * quantity).toFixed(2)}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Value props */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-800 text-center">
            <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/80">
              <Truck className="w-4 h-4 text-brand-400 mx-auto mb-1" />
              <p className="text-[11px] font-medium text-slate-300">Free Express</p>
              <p className="text-[10px] text-slate-500">Over $50 orders</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/80">
              <ShieldCheck className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
              <p className="text-[11px] font-medium text-slate-300">Simulated Safe</p>
              <p className="text-[10px] text-slate-500">Demo checkout</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/80">
              <RotateCcw className="w-4 h-4 text-indigo-400 mx-auto mb-1" />
              <p className="text-[11px] font-medium text-slate-300">30-Day Policy</p>
              <p className="text-[10px] text-slate-500">Demo returns</p>
            </div>
          </div>

          {/* Specifications Table */}
          {product.specifications && Object.keys(product.specifications).length > 0 && (
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <h3 className="font-display font-bold text-sm text-white">Technical Specifications</h3>
              <div className="rounded-xl border border-slate-800 overflow-hidden divide-y divide-slate-800">
                {Object.entries(product.specifications).map(([key, val]) => (
                  <div key={key} className="flex justify-between p-3 text-xs">
                    <span className="text-slate-400 font-medium">{key}</span>
                    <span className="text-slate-200 font-mono">{String(val)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="space-y-6 pt-12 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs uppercase font-bold text-brand-400">Pair & Complement</span>
              <h2 className="font-display font-bold text-xl sm:text-2xl text-white mt-0.5">
                Related Products
              </h2>
            </div>
            <Link to="/catalog" className="text-xs font-semibold text-brand-300 hover:text-white">
              View All
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
