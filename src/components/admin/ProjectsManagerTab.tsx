import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Edit3,
  Trash2,
  Eye,
  Star,
  Globe,
  CheckCircle2,
  FileEdit,
} from 'lucide-react';
import { Project, CategoryDoc } from '../../types/portfolio';
import { updateProject } from '../../lib/firestore-service';

interface ProjectsManagerTabProps {
  projects: Project[];
  categories: CategoryDoc[];
  onEditProject: (project: Project) => void;
  onDeleteRequest: (project: Project) => void;
  onPreviewProject: (project: Project) => void;
  onAddNew: () => void;
}

export const ProjectsManagerTab: React.FC<ProjectsManagerTabProps> = ({
  projects,
  categories,
  onEditProject,
  onDeleteRequest,
  onPreviewProject,
  onAddNew,
}) => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'image' | 'video' | 'website' | 'gallery'>('all');
  const [busyId, setBusyId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      const matchesSearch =
        !search.trim() ||
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.client.toLowerCase().includes(search.toLowerCase());
      const matchesCat = categoryFilter === 'All' || p.category === categoryFilter;
      const matchesStatus =
        statusFilter === 'all' || (p.status || 'published') === statusFilter;
      const matchesType = typeFilter === 'all' || p.projectType === typeFilter;
      return matchesSearch && matchesCat && matchesStatus && matchesType;
    });
  }, [projects, search, categoryFilter, statusFilter, typeFilter]);

  const toggleStatus = async (project: Project) => {
    setBusyId(project.id);
    try {
      const nextStatus = project.status === 'draft' ? 'published' : 'draft';
      await updateProject(project.id, { status: nextStatus });
    } finally {
      setBusyId(null);
    }
  };

  const toggleFeatured = async (project: Project) => {
    setBusyId(project.id);
    try {
      await updateProject(project.id, { featured: !project.featured });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
            All Projects
          </h1>
          <p className="text-sm text-neutral-400 mt-1 font-light">
            Manage published work, drafts, featured flags, and media viewers.
          </p>
        </div>

        <button
          onClick={onAddNew}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#C8FF00] text-black text-xs font-semibold uppercase tracking-wider hover:bg-white transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </button>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-[#111111] border border-white/10 rounded-xl p-4 flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by project title or client..."
            className="w-full bg-[#171717] border border-white/10 focus:border-[#C8FF00] pl-10 pr-4 py-2 rounded-lg text-xs text-white focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-[#171717] border border-white/10 px-3 py-2 rounded-lg text-xs text-white focus:outline-none"
          >
            <option value="All">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.categoryId} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="bg-[#171717] border border-white/10 px-3 py-2 rounded-lg text-xs text-white focus:outline-none"
          >
            <option value="all">All Types</option>
            <option value="image">Image</option>
            <option value="video">Video / Reel</option>
            <option value="website">Website</option>
            <option value="gallery">Gallery</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-[#171717] border border-white/10 px-3 py-2 rounded-lg text-xs text-white focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#111111] border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-[#0d0d0d] text-[11px] font-mono uppercase tracking-wider text-neutral-400">
                <th className="py-3.5 px-5">Project</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Featured</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06] text-sm">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-14 text-center text-xs text-neutral-500">
                    No projects match the current filters.
                  </td>
                </tr>
              ) : (
                filtered.map((project) => (
                  <tr key={project.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3.5">
                        <div className="w-14 h-10 rounded bg-[#181818] overflow-hidden border border-white/10 shrink-0">
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
                          <div className="font-semibold text-white truncate max-w-[220px]">
                            {project.title}
                          </div>
                          <div className="text-xs text-neutral-500 truncate max-w-[220px]">
                            {project.client} · {project.year || '—'}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4 text-xs text-neutral-300 whitespace-nowrap">
                      {project.category}
                    </td>

                    <td className="py-4 px-4 text-xs font-mono text-neutral-400 uppercase whitespace-nowrap">
                      {project.projectType}
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleFeatured(project)}
                        disabled={busyId === project.id}
                        className={`p-1.5 rounded transition-colors ${
                          project.featured
                            ? 'text-[#C8FF00] bg-[#C8FF00]/10'
                            : 'text-neutral-600 hover:text-neutral-300'
                        }`}
                        title="Toggle Featured"
                      >
                        <Star className={`w-4 h-4 ${project.featured ? 'fill-current' : ''}`} />
                      </button>
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleStatus(project)}
                        disabled={busyId === project.id}
                        className={`text-xs font-mono px-2.5 py-1 rounded border transition-colors ${
                          project.status === 'draft'
                            ? 'border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'
                            : 'border-[#C8FF00]/30 bg-[#C8FF00]/10 text-[#C8FF00] hover:bg-[#C8FF00]/20'
                        }`}
                      >
                        {project.status === 'draft' ? 'Draft' : 'Published'}
                      </button>
                    </td>

                    <td className="py-4 px-5 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => onPreviewProject(project)}
                          className="p-2 text-neutral-400 hover:text-white transition-colors"
                          title="Preview Project"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onEditProject(project)}
                          className="p-2 text-neutral-400 hover:text-[#C8FF00] transition-colors"
                          title="Edit Project"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteRequest(project)}
                          className="p-2 text-neutral-400 hover:text-red-400 transition-colors"
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
