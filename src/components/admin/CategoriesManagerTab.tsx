import React, { useState } from 'react';
import { Plus, Edit3, Trash2, Save, X, Tags, ArrowUpDown, Loader2 } from 'lucide-react';
import { CategoryDoc, Project } from '../../types/portfolio';
import {
  createCategory,
  updateCategory,
  deleteCategory,
  slugify,
} from '../../lib/firestore-service';

interface CategoriesManagerTabProps {
  categories: CategoryDoc[];
  projects: Project[];
}

export const CategoriesManagerTab: React.FC<CategoriesManagerTabProps> = ({
  categories,
  projects,
}) => {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [sortOrder, setSortOrder] = useState<number>(categories.length + 1);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<CategoryDoc | null>(null);

  const resetForm = () => {
    setName('');
    setSlug('');
    setSortOrder(categories.length + 1);
    setEditingId(null);
    setErrorMsg(null);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingId) {
      setSlug(slugify(val));
    }
  };

  const startEdit = (cat: CategoryDoc) => {
    setEditingId(cat.categoryId);
    setName(cat.name);
    setSlug(cat.slug);
    setSortOrder(cat.sortOrder);
    setErrorMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setErrorMsg(null);

    try {
      if (editingId) {
        await updateCategory(editingId, {
          name,
          slug: slug || slugify(name),
          sortOrder: Number(sortOrder) || 0,
        });
      } else {
        await createCategory({
          name,
          slug: slug || slugify(name),
          sortOrder: Number(sortOrder) || 0,
        });
      }
      resetForm();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to save category.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (cat: CategoryDoc) => {
    setSaving(true);
    try {
      await deleteCategory(cat.categoryId);
      setConfirmDelete(null);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to delete category.');
    } finally {
      setSaving(false);
    }
  };

  const getProjectCount = (cat: CategoryDoc) => {
    return projects.filter(
      (p) => p.categoryId === cat.categoryId || p.category === cat.name
    ).length;
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Categories Management
        </h1>
        <p className="text-sm text-neutral-400 mt-1 font-light">
          Categories created here automatically update the public portfolio filter tabs.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Create / Edit Form */}
        <div className="lg:col-span-5 bg-[#111111] border border-white/10 rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h2 className="font-display text-lg font-bold text-white">
              {editingId ? 'Edit Category' : 'Add Category'}
            </h2>
            {editingId && (
              <button
                onClick={resetForm}
                className="text-xs font-mono text-neutral-400 hover:text-white flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" />
                <span>Cancel</span>
              </button>
            )}
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-xs text-red-300">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-neutral-400 mb-1.5">
                Category Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Brand Identity"
                className="w-full bg-[#171717] border border-white/10 focus:border-[#C8FF00] px-3.5 py-2.5 rounded-lg text-sm text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-neutral-400 mb-1.5">
                Category Slug *
              </label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(slugify(e.target.value))}
                placeholder="e.g. brand-identity"
                className="w-full bg-[#171717] border border-white/10 focus:border-[#C8FF00] px-3.5 py-2.5 rounded-lg text-sm text-white font-mono focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-neutral-400 mb-1.5">
                Sort Order
              </label>
              <input
                type="number"
                min={0}
                value={sortOrder}
                onChange={(e) => setSortOrder(parseInt(e.target.value, 10) || 0)}
                className="w-full bg-[#171717] border border-white/10 focus:border-[#C8FF00] px-3.5 py-2.5 rounded-lg text-sm text-white font-mono focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 bg-[#C8FF00] text-black font-semibold text-xs uppercase tracking-wider hover:bg-white transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : editingId ? (
                <Save className="w-4 h-4" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              <span>{editingId ? 'Save Category Changes' : 'Create Category'}</span>
            </button>
          </form>
        </div>

        {/* Categories List */}
        <div className="lg:col-span-7 bg-[#111111] border border-white/10 rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-white/10 flex items-center justify-between">
            <span className="font-display font-bold text-white">Active Categories</span>
            <span className="text-xs font-mono text-neutral-400">
              {categories.length} Total
            </span>
          </div>

          <div className="divide-y divide-white/[0.06]">
            {categories.length === 0 ? (
              <div className="p-10 text-center text-xs text-neutral-500">
                No categories created yet. Add one on the left or seed starter data from Overview.
              </div>
            ) : (
              categories.map((cat) => (
                <div
                  key={cat.categoryId}
                  className="p-4 sm:px-6 flex items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <span className="w-8 h-8 rounded bg-[#181818] border border-white/10 flex items-center justify-center font-mono text-xs text-[#C8FF00] tabular-nums shrink-0">
                      {cat.sortOrder}
                    </span>
                    <div className="min-w-0">
                      <div className="font-semibold text-white truncate">{cat.name}</div>
                      <div className="text-xs font-mono text-neutral-500 truncate">
                        /{cat.slug} · {getProjectCount(cat)} project(s)
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => startEdit(cat)}
                      className="p-2 text-neutral-400 hover:text-[#C8FF00] transition-colors"
                      title="Edit Category"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setConfirmDelete(cat)}
                      className="p-2 text-neutral-400 hover:text-red-400 transition-colors"
                      title="Delete Category"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation */}
      {confirmDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          onClick={() => setConfirmDelete(null)}
        >
          <div
            className="max-w-md w-full bg-[#111111] border border-white/15 rounded-2xl p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-display text-lg font-bold text-white">
              Delete "{confirmDelete.name}"?
            </h3>
            <p className="text-sm text-neutral-400">
              {getProjectCount(confirmDelete) > 0
                ? `Warning: ${getProjectCount(confirmDelete)} project(s) currently reference this category. Deleting it will remove the filter tab, though existing projects retain their category name.`
                : 'This category will be permanently removed from Firestore.'}
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 text-xs font-mono text-neutral-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                className="px-4 py-2 bg-red-500 text-white text-xs font-semibold uppercase tracking-wider rounded hover:bg-red-600"
              >
                Delete Category
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
