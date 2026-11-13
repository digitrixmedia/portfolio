import React, { useState, useMemo } from 'react';
import {
  FolderKanban,
  CheckCircle2,
  FileEdit,
  Star,
  Tags,
  Search,
  Edit3,
  Trash2,
  Plus,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { Project, CategoryDoc } from '../../types/portfolio';

interface OverviewTabProps {
  projects: Project[];
  categories: CategoryDoc[];
  autoSyncing?: boolean;
  syncError?: string | null;
  onEditProject: (project: Project) => void;
  onDeleteRequest: (project: Project) => void;
  onAddNew: () => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  projects,
  categories,
  autoSyncing = false,
  syncError = null,
  onEditProject,
  onDeleteRequest,
  onAddNew,
}) => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const stats = useMemo(() => {
    const published = projects.filter((p) => p.status !== 'draft').length;
    const drafts = projects.filter((p) => p.status === 'draft').length;
    const featured = projects.filter((p) => p.featured).length;
    return [
      { label: 'Total Projects', value: projects.length, icon: FolderKanban },
      { label: 'Published', value: published, icon: CheckCircle2 },
      { label: 'Drafts', value: drafts, icon: FileEdit },
      { label: 'Featured', value: featured, icon: Star },
      { label: 'Categories', value: categories.length, icon: Tags },
    ];
  }, [projects, categories]);

  const recentProjects = useMemo(() => {
    return projects
      .filter((p) => {
        const matchesSearch =
          !search.trim() ||
          p.title.toLowerCase().includes(search.toLowerCase()) ||
          p.client.toLowerCase().includes(search.toLowerCase());
        const matchesCat = categoryFilter === 'All' || p.category === categoryFilter;
        return matchesSearch && matchesCat;
      })
      .slice(0, 10);
  }, [projects, search, categoryFilter]);

  const formatDate = (val?: string | number | Date | null) => {
    if (!val) return '—';
    const d = new Date(val);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Dashboard Overview
            </h1>
            {autoSyncing && (
              <span className="inline-flex items-center gap-1.5 text-xs font-mono text-[#C8FF00]">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Syncing client portfolio...</span>
              </span>
            )}
          </div>
          <p className="text-sm text-neutral-400 mt-1 font-light">
            Real-time portfolio metrics and recent entries from Cloud Firestore.
          </p>
        </div>

        <button
          onClick={onAddNew}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#C8FF00] text-black text-xs font-semibold uppercase tracking-wider hover:bg-white transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Project</span>
        </button>
      </div>

      {syncError && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-300 flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{syncError}</span>
        </div>
      )}

      {/* Real Firestore KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          const isLastOdd = idx === stats.length - 1;
          return (
            <div
              key={stat.label}
              className={`bg-[#111111] border border-white/10 rounded-xl p-5 flex flex-col justify-between gap-3 ${
                isLastOdd ? 'col-span-2 sm:col-span-1' : ''
              }`}
            >
              <div className="flex items-center justify-between text-neutral-400">
                <span className="text-xs font-mono uppercase tracking-wider">{stat.label}</span>
                <Icon className="w-4 h-4 text-[#C8FF00]" />
              </div>
              <div className="font-display text-3xl font-black text-white font-mono-nums">
                {stat.value}
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Projects Table */}
      <div className="bg-[#111111] border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-lg font-bold text-white">Recent Projects</h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Latest portfolio records stored in Firestore
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search title or client..."
                className="w-full sm:w-56 bg-[#171717] border border-white/10 focus:border-[#C8FF00] pl-9 pr-3 py-2 rounded-lg text-xs text-white focus:outline-none"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-[#171717] border border-white/10 focus:border-[#C8FF00] px-3 py-2 rounded-lg text-xs text-white focus:outline-none cursor-pointer"
            >
              <option value="All">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.categoryId} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-[#0d0d0d] text-[11px] font-mono uppercase tracking-wider text-neutral-400">
                <th className="py-3.5 px-5">Project</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Created</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06] text-sm">
              {recentProjects.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-neutral-500">
                    No matching projects found in Firestore.
                  </td>
                </tr>
              ) : (
                recentProjects.map((project) => (
                  <tr key={project.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-9 rounded bg-[#181818] overflow-hidden border border-white/10 shrink-0">
                          {project.thumbnail ? (
                            <img
                              src={project.thumbnail}
                              alt={project.title}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                            />
                          ) : null}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-white truncate max-w-[200px]">
                            {project.title}
                          </div>
                          <div className="text-xs text-neutral-500 truncate max-w-[200px]">
                            {project.client}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-neutral-300 whitespace-nowrap">
                      {project.category}
                    </td>
                    <td className="py-3.5 px-4 text-xs font-mono text-neutral-400 uppercase whitespace-nowrap">
                      {project.projectType}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`text-xs font-mono ${
                          project.status === 'draft' ? 'text-amber-400' : 'text-[#C8FF00]'
                        }`}
                      >
                        {project.status === 'draft' ? 'Draft' : 'Published'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs font-mono text-neutral-400 whitespace-nowrap tabular-nums">
                      {formatDate(project.createdAt)}
                    </td>
                    <td className="py-3.5 px-5 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => onEditProject(project)}
                          className="p-1.5 text-neutral-400 hover:text-[#C8FF00] transition-colors"
                          title="Edit Project"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteRequest(project)}
                          className="p-1.5 text-neutral-400 hover:text-red-400 transition-colors"
                          title="Delete Project"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
