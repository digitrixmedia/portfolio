import React, { useState, useEffect, useRef } from 'react';
import {
  LayoutDashboard,
  FolderKanban,
  PlusCircle,
  Tags,
  Image as ImageIcon,
  UserCog,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Trash2,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { usePortfolio } from '../../contexts/PortfolioContext';
import {
  Project,
  CategoryDoc,
  MediaAsset,
} from '../../types/portfolio';
import {
  subscribeAllProjects,
  subscribeCategories,
  subscribeMediaAssets,
  deleteProjectDoc,
  syncClientRosterToFirestore,
  OLD_SAMPLE_PROJECT_IDS,
} from '../../lib/firestore-service';
import { deleteStorageFileByUrl } from '../../lib/storage-service';
import { OverviewTab } from './OverviewTab';
import { ProjectsManagerTab } from './ProjectsManagerTab';
import { ProjectFormTab } from './ProjectFormTab';
import { CategoriesManagerTab } from './CategoriesManagerTab';
import { MediaLibraryTab } from './MediaLibraryTab';
import { ProfileSettingsTab } from './ProfileSettingsTab';
import { WebsiteSettingsTab } from './WebsiteSettingsTab';
import { ProjectModal } from '../project-viewer/ProjectModal';

type AdminTab =
  | 'overview'
  | 'projects'
  | 'add-project'
  | 'categories'
  | 'media'
  | 'profile'
  | 'website';

interface AdminDashboardProps {
  onNavigate: (path: string, replace?: boolean) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const { user, isAdmin, authReady, logout } = useAuth();
  const { profileSettings, websiteSettings } = usePortfolio();

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Real-time Admin Firestore Data
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsLoaded, setProjectsLoaded] = useState(false);
  const [categories, setCategories] = useState<CategoryDoc[]>([]);
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([]);
  const [autoSyncing, setAutoSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const hasAttemptedAutoSync = useRef(false);

  // Edit / Preview / Delete states
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [previewProject, setPreviewProject] = useState<Project | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [cleanupStorage, setCleanupStorage] = useState(true);
  const [deleting, setDeleting] = useState(false);

  // Route Guard: Redirect unauthenticated or unauthorized users to /admin
  useEffect(() => {
    if (authReady && (!user || !isAdmin)) {
      onNavigate('/admin', true);
    }
  }, [authReady, user, isAdmin, onNavigate]);

  // Attach Firestore admin listeners ONLY when authenticated & verified as admin
  useEffect(() => {
    if (!authReady || !user || !isAdmin) return;

    const unsubProjects = subscribeAllProjects((items) => {
      setProjects(items);
      setProjectsLoaded(true);
    });
    const unsubCategories = subscribeCategories(setCategories);
    const unsubMedia = subscribeMediaAssets(setMediaAssets);

    return () => {
      unsubProjects();
      unsubCategories();
      unsubMedia();
    };
  }, [authReady, user, isAdmin]);

  // Automatically sync the 17 client websites & Instagram accounts if Firestore is empty or holds old starter samples
  useEffect(() => {
    if (!authReady || !user || !isAdmin || !projectsLoaded || hasAttemptedAutoSync.current) {
      return;
    }

    const hasOldSamples = projects.some((p) => OLD_SAMPLE_PROJECT_IDS.has(p.id));
    const alreadySyncedRoster = localStorage.getItem('digitrix_client_roster_v2_synced') === '1';

    if (projects.length === 0 || hasOldSamples || !alreadySyncedRoster) {
      hasAttemptedAutoSync.current = true;
      setAutoSyncing(true);
      setSyncError(null);
      syncClientRosterToFirestore({ replaceOldSamples: hasOldSamples })
        .then(() => {
          localStorage.setItem('digitrix_client_roster_v2_synced', '1');
        })
        .catch((err) => {
          setSyncError(err instanceof Error ? err.message : 'Unable to sync portfolio items.');
        })
        .finally(() => {
          setAutoSyncing(false);
        });
    }
  }, [authReady, user, isAdmin, projectsLoaded, projects]);

  if (!authReady || !user || !isAdmin) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center text-white">
        <div className="flex items-center gap-3 text-xs font-mono text-neutral-400">
          <Loader2 className="w-4 h-4 animate-spin text-[#C8FF00]" />
          <span>Authorizing administrator access...</span>
        </div>
      </div>
    );
  }

  const navItems: { id: AdminTab; label: string; icon: React.ComponentType<any> }[] = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'projects', label: 'All Projects', icon: FolderKanban },
    { id: 'add-project', label: editingProject ? 'Edit Project' : 'Add New Project', icon: PlusCircle },
    { id: 'categories', label: 'Categories', icon: Tags },
    { id: 'media', label: 'Media Library', icon: ImageIcon },
    { id: 'profile', label: 'Profile Settings', icon: UserCog },
    { id: 'website', label: 'Website Settings', icon: Settings },
  ];

  const handleSelectTab = (tab: AdminTab) => {
    if (tab !== 'add-project') {
      setEditingProject(null);
    }
    setActiveTab(tab);
    setSidebarOpen(false);
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setActiveTab('add-project');
    setSidebarOpen(false);
  };

  const handleStartNewProject = () => {
    setEditingProject(null);
    setActiveTab('add-project');
    setSidebarOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      if (cleanupStorage) {
        await deleteStorageFileByUrl(deleteTarget.thumbnailUrl || deleteTarget.thumbnail);
        if (deleteTarget.mediaUrl) await deleteStorageFileByUrl(deleteTarget.mediaUrl);
        if (deleteTarget.videoUrl) await deleteStorageFileByUrl(deleteTarget.videoUrl);
        if (deleteTarget.images) {
          for (const url of deleteTarget.images) {
            await deleteStorageFileByUrl(url);
          }
        }
      }
      await deleteProjectDoc(deleteTarget.id);
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    onNavigate('/admin', true);
  };

  return (
    <div className="min-h-screen bg-[#080808] text-white flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-68 shrink-0 flex-col justify-between bg-[#0c0c0c] border-r border-white/10 p-6 sticky top-0 h-screen">
        <div className="space-y-8">
          {/* Brand Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 bg-[#C8FF00] rotate-45" />
              <span className="font-display font-bold text-lg tracking-tight">
                DIGITRIX<span className="text-[#C8FF00] font-light ml-1">CMS</span>
              </span>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
                    active
                      ? 'bg-[#C8FF00] text-black font-bold shadow-md'
                      : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom User & Logout Actions */}
        <div className="space-y-3 pt-6 border-t border-white/10">
          <div className="px-2">
            <div className="text-xs font-medium text-white truncate">{user.email}</div>
            <div className="text-[10px] font-mono uppercase text-[#C8FF00]">
              Authorized Administrator
            </div>
          </div>

          <button
            onClick={() => onNavigate('/')}
            className="w-full flex items-center justify-between px-4 py-2.5 bg-[#141414] border border-white/10 hover:border-white/30 rounded-xl text-xs text-neutral-300 hover:text-white transition-colors"
          >
            <span>View Live Portfolio</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header + Drawer */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden sticky top-0 z-30 bg-[#0c0c0c]/95 backdrop-blur-md border-b border-white/10 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-[#C8FF00] rotate-45" />
            <span className="font-display font-bold text-base">DIGITRIX CMS</span>
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 text-neutral-300 hover:text-white"
            aria-label="Toggle admin menu"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </header>

        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-40 bg-black/80 backdrop-blur-md" onClick={() => setSidebarOpen(false)}>
            <div
              className="w-72 h-full bg-[#0c0c0c] border-r border-white/10 p-6 flex flex-col justify-between"
              onClick={(e) => e.stopPropagation()}
            >
              <nav className="space-y-1.5 pt-4">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelectTab(item.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider ${
                        active ? 'bg-[#C8FF00] text-black font-bold' : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>

              <div className="space-y-2 border-t border-white/10 pt-4">
                <button
                  onClick={() => onNavigate('/')}
                  className="w-full flex items-center justify-between px-4 py-2.5 bg-[#141414] rounded-xl text-xs text-neutral-300"
                >
                  <span>View Portfolio</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-semibold uppercase text-red-400"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Active Tab Workspace */}
        <main className="flex-1 p-5 sm:p-8 lg:p-10 max-w-7xl w-full mx-auto">
          {activeTab === 'overview' && (
            <OverviewTab
              projects={projects}
              categories={categories}
              autoSyncing={autoSyncing}
              syncError={syncError}
              onEditProject={handleEditProject}
              onDeleteRequest={setDeleteTarget}
              onAddNew={handleStartNewProject}
            />
          )}

          {activeTab === 'projects' && (
            <ProjectsManagerTab
              projects={projects}
              categories={categories}
              onEditProject={handleEditProject}
              onDeleteRequest={setDeleteTarget}
              onPreviewProject={setPreviewProject}
              onAddNew={handleStartNewProject}
            />
          )}

          {activeTab === 'add-project' && (
            <ProjectFormTab
              editingProject={editingProject}
              categories={categories}
              mediaAssets={mediaAssets}
              onSaved={() => {
                setEditingProject(null);
                setActiveTab('projects');
              }}
              onCancel={() => {
                setEditingProject(null);
                setActiveTab('projects');
              }}
            />
          )}

          {activeTab === 'categories' && (
            <CategoriesManagerTab categories={categories} projects={projects} />
          )}

          {activeTab === 'media' && (
            <MediaLibraryTab
              mediaAssets={mediaAssets}
              projects={projects}
              profileSettings={profileSettings}
            />
          )}

          {activeTab === 'profile' && (
            <ProfileSettingsTab profileSettings={profileSettings} />
          )}

          {activeTab === 'website' && (
            <WebsiteSettingsTab
              websiteSettings={websiteSettings}
              projects={projects}
              onGoToProfile={() => setActiveTab('profile')}
            />
          )}
        </main>
      </div>

      {/* Delete Project Confirmation Modal */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
          onClick={() => setDeleteTarget(null)}
        >
          <div
            className="max-w-md w-full bg-[#111111] border border-white/15 rounded-2xl p-6 space-y-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-500/15 flex items-center justify-center text-red-400 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-white">
                  Delete "{deleteTarget.title}"?
                </h3>
                <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                  This permanently removes the project from Firestore. Published visitors will no longer see it.
                </p>
              </div>
            </div>

            <label className="flex items-center gap-2.5 p-3 bg-[#171717] rounded-xl border border-white/5 cursor-pointer text-xs text-neutral-300">
              <input
                type="checkbox"
                checked={cleanupStorage}
                onChange={(e) => setCleanupStorage(e.target.checked)}
                className="accent-[#C8FF00]"
              />
              <span>Also clean up uploaded Firebase Storage files for this project</span>
            </label>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 text-xs font-mono text-neutral-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="px-5 py-2 bg-red-500 text-white text-xs font-semibold uppercase tracking-wider rounded hover:bg-red-600 flex items-center gap-2 disabled:opacity-50"
              >
                {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>{deleting ? 'Deleting...' : 'Delete Project'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Project Modal Preview inside Admin */}
      <ProjectModal
        project={previewProject}
        allProjects={projects}
        isOpen={Boolean(previewProject)}
        onClose={() => setPreviewProject(null)}
        onSelectProject={setPreviewProject}
      />
    </div>
  );
};
