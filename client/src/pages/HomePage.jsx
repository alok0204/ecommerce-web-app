import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { ProductCard } from '../components/common/ProductCard';
import {
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Headphones,
  Sparkles,
  Zap,
  TrendingUp,
  Layers,
  ChevronRight
} from 'lucide-react';

export function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [prodRes, catRes] = await Promise.all([
          api.getFeaturedProducts(),
          api.getCategories(),
        ]);
        if (prodRes.data?.products) setFeaturedProducts(prodRes.data.products);
        if (catRes.data?.categories) setCategories(catRes.data.categories);
      } catch (err) {
        console.error('Home page data load error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28">
        {/* Glow ambient background elements */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] bg-brand-600/20 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[350px] h-[350px] bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-300 text-xs font-semibold backdrop-blur-md animate-fade-in">
            <Sparkles className="w-4 h-4 text-brand-400" />
            <span>Discover The Future of Modern Living • Version 1.0</span>
          </div>

          {/* Heading */}
          <h1 className="font-display font-extrabold text-4xl sm:text-5xl md:text-6xl lg:text-7xl tracking-tight text-white max-w-4xl mx-auto leading-[1.1]">
            Discover More. <br />
            <span className="text-gradient">Shop Smarter with NEXORA.</span>
          </h1>

          {/* Subheading */}
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            Curated premium electronics, studio acoustic gear, minimalist EDC accessories, and intelligent workspace essentials engineered for modern tastemakers.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/catalog"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-brand-600 via-indigo-600 to-violet-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-xl shadow-brand-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
            >
              <span>Explore All Products</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/catalog?category=audio-wearables"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-slate-900/90 border border-slate-700/80 hover:border-brand-500/50 hover:bg-slate-800 text-slate-200 font-semibold text-sm transition-all"
            >
              Shop Audio & Wearables
            </Link>
          </div>

          {/* Stats Bar */}
          <div className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md">
              <p className="font-mono font-bold text-2xl text-white">100%</p>
              <p className="text-xs text-slate-400 mt-0.5">Simulated Demo Checkout</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md">
              <p className="font-mono font-bold text-2xl text-brand-300">14+</p>
              <p className="text-xs text-slate-400 mt-0.5">Handpicked Tech Items</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md">
              <p className="font-mono font-bold text-2xl text-emerald-400">$0</p>
              <p className="text-xs text-slate-400 mt-0.5">Free Shipping Over $50</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md">
              <p className="font-mono font-bold text-2xl text-indigo-400">Postgres</p>
              <p className="text-xs text-slate-400 mt-0.5">Prisma Persistent Store</p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-brand-500/10 text-brand-400 shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-white">Free Standard Shipping</h4>
              <p className="text-xs text-slate-400 mt-1">Automatic complimentary shipping on all orders over $50.</p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-white">Demo Transaction Safety</h4>
              <p className="text-xs text-slate-400 mt-1">Secure simulated checkout without real card charging.</p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-white">30-Day Evaluation</h4>
              <p className="text-xs text-slate-400 mt-1">Hassle-free demo return policy with simulated restocking.</p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 shrink-0">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-white">Real-Time Tracking</h4>
              <p className="text-xs text-slate-400 mt-1">5-stage courier timeline tracking for all customer packages.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Category Showcase Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-brand-400 uppercase tracking-wider">
              <Layers className="w-4 h-4" />
              <span>Explore By Department</span>
            </div>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-white mt-1">
              Curated Collections
            </h2>
          </div>
          <Link
            to="/catalog"
            className="text-xs font-semibold text-brand-300 hover:text-brand-200 flex items-center gap-1"
          >
            <span>View All</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/catalog?category=${cat.slug}`}
              className="group relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 hover:border-brand-500/50 transition-all duration-300 hover:-translate-y-1 p-3.5 flex flex-col justify-between aspect-[4/5]"
            >
              <img
                src={cat.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80'}
                alt={cat.name}
                className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-105 group-hover:opacity-50 transition-all duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />

              <div className="relative z-10 flex justify-end">
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-900/80 border border-slate-700/60 text-slate-300">
                  {cat._count?.products || 3} items
                </span>
              </div>

              <div className="relative z-10 space-y-1">
                <h3 className="font-display font-bold text-sm text-white group-hover:text-brand-300 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-[11px] text-slate-400 line-clamp-1">{cat.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-brand-400 uppercase tracking-wider">
              <Zap className="w-4 h-4" />
              <span>Staff Picks & Best Sellers</span>
            </div>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-white mt-1">
              Featured Products
            </h2>
          </div>
          <Link
            to="/catalog"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-brand-500/50 text-xs font-semibold text-slate-200 transition-all"
          >
            <span>Browse Full Catalog</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-80 rounded-2xl bg-slate-900/60 border border-slate-800 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Promotional Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-900/80 via-purple-900/60 to-slate-900 border border-brand-500/30 p-8 sm:p-12">
          <div className="relative z-10 max-w-xl space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              Limited-Time Offer
            </span>
            <h3 className="font-display font-extrabold text-2xl sm:text-4xl text-white leading-tight">
              Get 10% Off Your Next Demo Order
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Experience the complete order pipeline from catalog browsing to automated stock verification and live courier step tracking. Apply coupon code at checkout!
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <div className="px-4 py-2 rounded-xl bg-slate-950/80 border border-brand-500/50 text-brand-300 font-mono font-bold text-sm tracking-wider">
                NEXORA10
              </div>
              <Link
                to="/catalog"
                className="px-6 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-semibold text-xs transition-colors shadow-lg"
              >
                Claim Offer & Shop
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
