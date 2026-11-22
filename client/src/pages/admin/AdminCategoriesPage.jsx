import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Layers, Plus, Check, Loader2 } from 'lucide-react';

export function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    image: '',
  });
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const res = await api.getCategories();
      if (res.data?.categories) setCategories(res.data.categories);
    } catch (err) {
      console.error('Failed to load categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setSubmitting(true);
    try {
      await api.createCategory({
        ...formData,
        slug: formData.slug.trim() || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      });
      setFeedback(`Category "${formData.name}" added successfully.`);
      setFormData({ name: '', slug: '', description: '', image: '' });
      setTimeout(() => setFeedback(''), 3000);
      await loadCategories();
    } catch (err) {
      alert(err.message || 'Failed to create category.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8">
      <div>
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white">
          Product Categories
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
          Organize products into intuitive collections and storefront departments.
        </p>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>{feedback}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Create Category Form */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
          <h2 className="font-display font-bold text-base text-white flex items-center gap-2">
            <Plus className="w-4 h-4 text-brand-400" />
            <span>Add New Category</span>
          </h2>

          <form onSubmit={handleCreate} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Category Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                placeholder="e.g. Smart Wearables"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Slug (Optional)</label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-brand-500 font-mono"
                placeholder="smart-wearables"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Image URL</label>
              <input
                type="url"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-brand-500 font-mono"
                placeholder="https://images.unsplash.com/..."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
              <textarea
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-brand-500"
                placeholder="Brief category summary..."
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-lg shadow-brand-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Create Category</span>
            </button>
          </form>
        </div>

        {/* Existing Categories List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="font-display font-bold text-base text-white">
            Current Categories ({categories.length})
          </h2>

          {loading ? (
            <div className="p-12 flex justify-center">
              <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {categories.map((c) => (
                <div
                  key={c.id}
                  className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-start gap-3.5 shadow-lg"
                >
                  <img
                    src={c.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=150&q=80'}
                    alt={c.name}
                    className="w-14 h-14 object-cover rounded-xl bg-slate-950 border border-slate-800 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-sm text-white truncate">{c.name}</h3>
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-brand-500/20 text-brand-300">
                        {c._count?.products || 0} products
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">/{c.slug}</p>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{c.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
