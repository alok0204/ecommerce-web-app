import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { ProductCard } from '../components/common/ProductCard';
import {
  Search,
  Filter,
  SlidersHorizontal,
  X,
  RotateCcw,
  PackageX,
  Loader2
} from 'lucide-react';

export function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter states initialized from URL params
  const categoryParam = searchParams.get('category') || 'all';
  const searchParam = searchParams.get('search') || '';
  const sortParam = searchParams.get('sort') || 'featured';
  const inStockParam = searchParams.get('inStock') === 'true';

  const [search, setSearch] = useState(searchParam);
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [selectedSort, setSelectedSort] = useState(sortParam);
  const [onlyInStock, setOnlyInStock] = useState(inStockParam);
  const [maxPrice, setMaxPrice] = useState(600);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await api.getCategories();
        if (res.data?.categories) setCategories(res.data.categories);
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    }
    fetchCategories();
  }, []);

  useEffect(() => {
    setSelectedCategory(searchParams.get('category') || 'all');
    setSearch(searchParams.get('search') || '');
    setSelectedSort(searchParams.get('sort') || 'featured');
    setOnlyInStock(searchParams.get('inStock') === 'true');
  }, [searchParams]);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const params = {
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
          search: search.trim() || undefined,
          sort: selectedSort,
          inStock: onlyInStock ? 'true' : undefined,
          maxPrice: maxPrice < 600 ? maxPrice : undefined,
          limit: 30,
        };
        const res = await api.getProducts(params);
        if (res.data?.products) {
          setProducts(res.data.products);
        }
      } catch (err) {
        console.error('Failed to load products:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [selectedCategory, search, selectedSort, onlyInStock, maxPrice]);

  const updateFilters = (newParams) => {
    const current = Object.fromEntries(searchParams.entries());
    const next = { ...current, ...newParams };
    Object.keys(next).forEach((key) => {
      if (!next[key] || next[key] === 'all' || next[key] === 'false') {
        delete next[key];
      }
    });
    setSearchParams(next);
  };

  const handleResetFilters = () => {
    setSearch('');
    setSelectedCategory('all');
    setSelectedSort('featured');
    setOnlyInStock(false);
    setMaxPrice(600);
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
            Product Catalog
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Browse our complete collection of engineered audio, modern gadgets, and smart lifestyle gear.
          </p>
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search catalog..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              updateFilters({ search: e.target.value });
            }}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
          />
          {search && (
            <button
              onClick={() => {
                setSearch('');
                updateFilters({ search: '' });
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <aside className="space-y-6">
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="font-semibold text-sm text-white flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-brand-400" />
                Filters
              </span>
              {(selectedCategory !== 'all' || search || onlyInStock || maxPrice < 600) && (
                <button
                  onClick={handleResetFilters}
                  className="text-xs text-brand-300 hover:text-brand-200 flex items-center gap-1 font-medium"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset
                </button>
              )}
            </div>

            {/* Categories list */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5">
                Categories
              </h3>
              <div className="space-y-1">
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    updateFilters({ category: 'all' });
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors flex items-center justify-between ${
                    selectedCategory === 'all'
                      ? 'bg-brand-600 text-white font-semibold'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span>All Categories</span>
                </button>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setSelectedCategory(c.slug);
                      updateFilters({ category: c.slug });
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors flex items-center justify-between ${
                      selectedCategory === c.slug
                        ? 'bg-brand-600 text-white font-semibold'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span>{c.name}</span>
                    {c._count?.products !== undefined && (
                      <span className="text-[10px] opacity-70 font-mono">({c._count.products})</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Max Price Slider */}
            <div>
              <div className="flex justify-between items-center text-xs font-semibold text-slate-400 mb-2">
                <span className="uppercase tracking-wider">Max Price</span>
                <span className="text-white font-mono">${maxPrice}</span>
              </div>
              <input
                type="range"
                min="30"
                max="600"
                step="10"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-brand-500 bg-slate-800 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                <span>$30</span>
                <span>$600+</span>
              </div>
            </div>

            {/* Availability */}
            <div className="pt-2 border-t border-slate-800">
              <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-300 font-medium">
                <input
                  type="checkbox"
                  checked={onlyInStock}
                  onChange={(e) => {
                    setOnlyInStock(e.target.checked);
                    updateFilters({ inStock: e.target.checked ? 'true' : 'false' });
                  }}
                  className="w-4 h-4 rounded text-brand-600 bg-slate-950 border-slate-800 focus:ring-brand-500"
                />
                <span>In Stock Items Only</span>
              </label>
            </div>
          </div>
        </aside>

        {/* Main Products Grid */}
        <section className="lg:col-span-3 space-y-6">
          {/* Top Bar Sort and Count */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/40 border border-slate-800 text-xs">
            <span className="text-slate-400">
              Showing <strong className="text-white">{products.length}</strong> products
            </span>

            <div className="flex items-center gap-2">
              <span className="text-slate-400 hidden sm:inline">Sort by:</span>
              <select
                value={selectedSort}
                onChange={(e) => {
                  setSelectedSort(e.target.value);
                  updateFilters({ sort: e.target.value });
                }}
                className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-brand-500"
              >
                <option value="featured">Featured / Recommended</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">Newest Arrivals</option>
              </select>
            </div>
          </div>

          {/* Grid or Empty */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-80 rounded-2xl bg-slate-900/60 border border-slate-800 animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 p-6 rounded-3xl bg-slate-900/40 border border-slate-800 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-400 mx-auto">
                <PackageX className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-base">No matching products found</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Try adjusting your keywords, expanding your price range, or clearing active filters.
                </p>
              </div>
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-medium text-xs transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
