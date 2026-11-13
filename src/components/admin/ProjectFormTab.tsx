import React, { useState, useEffect, useRef } from 'react';
import {
  Save,
  Upload,
  Image as ImageIcon,
  Video,
  Globe,
  Images,
  ArrowUp,
  ArrowDown,
  Trash2,
  Eye,
  X,
  Loader2,
  FolderOpen,
  ArrowLeft,
  Film,
  Plus,
} from 'lucide-react';
import {
  Project,
  CategoryDoc,
  MediaAsset,
  MediaType,
  ProjectStatus,
} from '../../types/portfolio';
import { createProject, updateProject, slugify } from '../../lib/firestore-service';
import { uploadPortfolioMedia } from '../../lib/storage-service';
import { WebsitePreview } from '../project-viewer/WebsitePreview';

interface ProjectFormTabProps {
  editingProject: Project | null;
  categories: CategoryDoc[];
  mediaAssets: MediaAsset[];
  onSaved: () => void;
  onCancel: () => void;
}

export const ProjectFormTab: React.FC<ProjectFormTabProps> = ({
  editingProject,
  categories,
  mediaAssets,
  onSaved,
  onCancel,
}) => {
  const [title, setTitle] = useState('');
  const [clientName, setClientName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const [projectType, setProjectType] = useState<MediaType>('image');
  const [description, setDescription] = useState('');
  const [fullDescription, setFullDescription] = useState('');
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoUrls, setVideoUrls] = useState<string[]>([]);
  const [newVideoUrlInput, setNewVideoUrlInput] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [videoAspect, setVideoAspect] = useState<'16:9' | '9:16'>('16:9');
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [gridSpan, setGridSpan] = useState<'normal' | 'wide' | 'tall'>('normal');
  const [featured, setFeatured] = useState(false);
  const [status, setStatus] = useState<ProjectStatus>('published');
  const [sortOrder, setSortOrder] = useState<number>(0);
  const [tagsInput, setTagsInput] = useState('');
  const [deliverablesInput, setDeliverablesInput] = useState('');

  // Upload & Modal states
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [thumbProgress, setThumbProgress] = useState<number | null>(null);
  const [mediaProgress, setMediaProgress] = useState<number | null>(null);
  const [multiVideoProgress, setMultiVideoProgress] = useState<number | null>(null);
  const [galleryProgress, setGalleryProgress] = useState<number | null>(null);
  const [isDraggingGallery, setIsDraggingGallery] = useState(false);
  const [isDraggingVideos, setIsDraggingVideos] = useState(false);
  const [showWebsitePreview, setShowWebsitePreview] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<'thumbnail' | 'media' | 'gallery' | 'videos' | null>(null);

  const thumbInputRef = useRef<HTMLInputElement>(null);
  const mainMediaInputRef = useRef<HTMLInputElement>(null);
  const multiVideoInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // Load existing project fields safely when editingProject changes
  useEffect(() => {
    if (editingProject) {
      setTitle(editingProject.title || '');
      setClientName(editingProject.clientName || editingProject.client || '');
      setCategoryId(editingProject.categoryId || '');
      setCategoryName(editingProject.categoryName || editingProject.category || '');
      setProjectType(editingProject.projectType || 'image');
      setDescription(editingProject.description || '');
      setFullDescription(editingProject.fullDescription || '');
      setYear(editingProject.year || String(new Date().getFullYear()));
      setThumbnailUrl(editingProject.thumbnailUrl || editingProject.thumbnail || '');
      setMediaUrl(editingProject.mediaUrl || '');
      const existingVideos =
        editingProject.videoUrls && editingProject.videoUrls.length > 0
          ? editingProject.videoUrls
          : editingProject.videoUrl
          ? [editingProject.videoUrl]
          : editingProject.projectType === 'video' && editingProject.mediaUrl
          ? [editingProject.mediaUrl]
          : [];
      setVideoUrls(existingVideos);
      setVideoUrl(existingVideos[0] || '');
      setNewVideoUrlInput('');
      setWebsiteUrl(editingProject.websiteUrl || '');
      setInstagramUrl(editingProject.instagramUrl || '');
      setVideoAspect(editingProject.videoAspect || (editingProject.isVerticalReel ? '9:16' : '16:9'));
      setGalleryImages(editingProject.images || editingProject.galleryImages || []);
      setGridSpan(editingProject.gridSpan || 'normal');
      setFeatured(Boolean(editingProject.featured));
      setStatus(editingProject.status === 'draft' ? 'draft' : 'published');
      setSortOrder(typeof editingProject.sortOrder === 'number' ? editingProject.sortOrder : 0);
      setTagsInput((editingProject.tags || []).join(', '));
      setDeliverablesInput((editingProject.deliverables || []).join(', '));
    } else {
      setTitle('');
      setClientName('');
      const firstCat = categories[0];
      setCategoryId(firstCat?.categoryId || 'cat-branding');
      setCategoryName(firstCat?.name || 'Branding');
      setProjectType('image');
      setDescription('');
      setFullDescription('');
      setYear(String(new Date().getFullYear()));
      setThumbnailUrl('');
      setMediaUrl('');
      setVideoUrl('');
      setVideoUrls([]);
      setNewVideoUrlInput('');
      setWebsiteUrl('');
      setInstagramUrl('');
      setVideoAspect('16:9');
      setGalleryImages([]);
      setGridSpan('normal');
      setFeatured(false);
      setStatus('published');
      setSortOrder(0);
      setTagsInput('');
      setDeliverablesInput('');
    }
  }, [editingProject, categories]);

  const handleCategoryChange = (selectedId: string) => {
    setCategoryId(selectedId);
    const match = categories.find((c) => c.categoryId === selectedId);
    if (match) {
      setCategoryName(match.name);
    }
  };

  const handleThumbUpload = async (file?: File) => {
    if (!file) return;
    setErrorMsg(null);
    setThumbProgress(0);
    try {
      const res = await uploadPortfolioMedia(file, 'thumbnails', (p) => setThumbProgress(p));
      setThumbnailUrl(res.url);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Thumbnail upload failed.');
    } finally {
      setThumbProgress(null);
    }
  };

  const handleMainMediaUpload = async (file?: File) => {
    if (!file) return;
    setErrorMsg(null);
    setMediaProgress(0);
    try {
      const folder = projectType === 'video' ? 'videos' : 'images';
      const res = await uploadPortfolioMedia(file, folder, (p) => setMediaProgress(p));
      if (projectType === 'video') {
        setVideoUrls((prev) => {
          const next = [...prev, res.url];
          if (!videoUrl) setVideoUrl(next[0]);
          return next;
        });
        setMediaUrl((prev) => prev || res.url);
      } else {
        setMediaUrl(res.url);
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Media upload failed.');
    } finally {
      setMediaProgress(null);
    }
  };

  const handleMultiVideoUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setErrorMsg(null);
    setMultiVideoProgress(0);
    try {
      const uploadedUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const res = await uploadPortfolioMedia(files[i], 'videos', (p) => {
          const overall = Math.round(((i + p / 100) / files.length) * 100);
          setMultiVideoProgress(overall);
        });
        uploadedUrls.push(res.url);
      }
      setVideoUrls((prev) => {
        const next = [...prev, ...uploadedUrls];
        if (!videoUrl && next[0]) setVideoUrl(next[0]);
        if (projectType === 'video' && !mediaUrl && next[0]) setMediaUrl(next[0]);
        return next;
      });
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Video upload failed.');
    } finally {
      setMultiVideoProgress(null);
    }
  };

  const handleAddVideoUrl = () => {
    const trimmed = newVideoUrlInput.trim();
    if (!trimmed) return;
    setVideoUrls((prev) => {
      const next = [...prev, trimmed];
      if (!videoUrl) setVideoUrl(next[0]);
      if (projectType === 'video' && !mediaUrl) setMediaUrl(next[0]);
      return next;
    });
    setNewVideoUrlInput('');
  };

  const moveVideoItem = (index: number, direction: -1 | 1) => {
    setVideoUrls((prev) => {
      const next = [...prev];
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= next.length) return prev;
      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
      setVideoUrl(next[0] || '');
      if (projectType === 'video') setMediaUrl(next[0] || '');
      return next;
    });
  };

  const removeVideoItem = (index: number) => {
    setVideoUrls((prev) => {
      const next = prev.filter((_, i) => i !== index);
      setVideoUrl(next[0] || '');
      if (projectType === 'video') setMediaUrl(next[0] || '');
      return next;
    });
  };

  const handleGalleryUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setErrorMsg(null);
    setGalleryProgress(0);
    try {
      const uploadedUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const res = await uploadPortfolioMedia(files[i], 'gallery', (p) => {
          const overall = Math.round(((i + p / 100) / files.length) * 100);
          setGalleryProgress(overall);
        });
        uploadedUrls.push(res.url);
      }
      setGalleryImages((prev) => [...prev, ...uploadedUrls]);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Gallery upload failed.');
    } finally {
      setGalleryProgress(null);
    }
  };

  const moveGalleryItem = (index: number, direction: -1 | 1) => {
    setGalleryImages((prev) => {
      const next = [...prev];
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= next.length) return prev;
      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
      return next;
    });
  };

  const removeGalleryItem = (index: number) => {
    setGalleryImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!title.trim() || !clientName.trim()) {
      setErrorMsg('Project title and client name are required.');
      return;
    }

    // Thumbnail is strictly optional; fall back only if main image/gallery exists, else empty string
    const effectiveThumb =
      thumbnailUrl.trim() ||
      (projectType === 'image' ? mediaUrl.trim() : galleryImages[0] || '');

    setSaving(true);
    try {
      const tags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
      const deliverables = deliverablesInput
        .split(',')
        .map((d) => d.trim())
        .filter(Boolean);

      const resolvedCatName = categoryName.trim() || 'Branding';
      const resolvedCatId = categoryId || `cat-${slugify(resolvedCatName)}`;

      const cleanedVideos = Array.from(
        new Set(
          [
            ...videoUrls.map((v) => v.trim()),
            ...(projectType === 'video' && videoUrl.trim() ? [videoUrl.trim()] : []),
          ].filter(Boolean)
        )
      );

      const primaryVideo = cleanedVideos[0] || '';

      const payload: Partial<Project> = {
        title: title.trim(),
        slug: editingProject?.slug || slugify(title),
        clientName: clientName.trim(),
        categoryId: resolvedCatId,
        categoryName: resolvedCatName,
        projectType,
        description: description.trim(),
        fullDescription: fullDescription.trim() || description.trim(),
        thumbnailUrl: effectiveThumb,
        mediaUrl:
          projectType === 'video'
            ? primaryVideo || mediaUrl.trim()
            : projectType === 'image'
            ? (mediaUrl || effectiveThumb).trim()
            : effectiveThumb || primaryVideo,
        videoUrl: primaryVideo,
        videoUrls: cleanedVideos,
        websiteUrl: websiteUrl.trim(),
        instagramUrl: instagramUrl.trim(),
        images: projectType === 'gallery' || projectType === 'image' ? galleryImages : [],
        year: year.trim(),
        videoAspect:
          projectType === 'video' || cleanedVideos.length > 0 ? videoAspect : undefined,
        isVerticalReel:
          (projectType === 'video' || cleanedVideos.length > 0) && videoAspect === '9:16',
        gridSpan,
        featured,
        status,
        sortOrder: Number(sortOrder) || 0,
        tags,
        deliverables,
      };

      if (editingProject) {
        await updateProject(editingProject.id, payload);
      } else {
        await createProject(payload);
      }

      onSaved();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to save project.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="p-2 bg-[#141414] border border-white/10 rounded-lg text-neutral-400 hover:text-white transition-colors"
            title="Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {editingProject ? `Edit: ${editingProject.title}` : 'Add New Project'}
            </h1>
            <p className="text-xs text-neutral-400 mt-0.5">
              {editingProject
                ? 'Update project details, replace media, or change publication status.'
                : 'Publish a new case study directly to your live Firestore portfolio.'}
            </p>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-300">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Core Information */}
        <div className="bg-[#111111] border border-white/10 rounded-2xl p-6 space-y-5">
          <h2 className="font-display text-base font-bold text-white uppercase tracking-wider border-b border-white/10 pb-3">
            Project Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-mono uppercase text-neutral-400 mb-1.5">
                Project Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Aurélien Haute Joaillerie"
                className="w-full bg-[#171717] border border-white/10 focus:border-[#C8FF00] px-4 py-2.5 rounded-lg text-sm text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-neutral-400 mb-1.5">
                Client / Brand Name *
              </label>
              <input
                type="text"
                required
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="e.g. Maison Aurélien Paris"
                className="w-full bg-[#171717] border border-white/10 focus:border-[#C8FF00] px-4 py-2.5 rounded-lg text-sm text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-mono uppercase text-neutral-400 mb-1.5">
                Category *
              </label>
              {categories.length > 0 ? (
                <select
                  value={categoryId}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full bg-[#171717] border border-white/10 focus:border-[#C8FF00] px-4 py-2.5 rounded-lg text-sm text-white focus:outline-none cursor-pointer"
                >
                  {categories.map((c) => (
                    <option key={c.categoryId} value={c.categoryId}>
                      {c.name}
                    </option>
                  ))}
                  {categoryName && !categories.some((c) => c.categoryId === categoryId) && (
                    <option value={categoryId}>{categoryName}</option>
                  )}
                </select>
              ) : (
                <input
                  type="text"
                  required
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="e.g. Branding"
                  className="w-full bg-[#171717] border border-white/10 focus:border-[#C8FF00] px-4 py-2.5 rounded-lg text-sm text-white focus:outline-none"
                />
              )}
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-neutral-400 mb-1.5">
                Project Year
              </label>
              <input
                type="text"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="2026"
                className="w-full bg-[#171717] border border-white/10 focus:border-[#C8FF00] px-4 py-2.5 rounded-lg text-sm text-white font-mono focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-neutral-400 mb-1.5">
                Masonry Grid Span
              </label>
              <select
                value={gridSpan}
                onChange={(e) => setGridSpan(e.target.value as any)}
                className="w-full bg-[#171717] border border-white/10 focus:border-[#C8FF00] px-4 py-2.5 rounded-lg text-sm text-white focus:outline-none cursor-pointer"
              >
                <option value="normal">Standard (1x1)</option>
                <option value="wide">Featured Wide (2x1)</option>
                <option value="tall">Vertical Reel (9:13)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-neutral-400 mb-1.5">
              Short Summary (Card Preview) *
            </label>
            <textarea
              required
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief overview displayed on portfolio cards..."
              className="w-full bg-[#171717] border border-white/10 focus:border-[#C8FF00] px-4 py-2.5 rounded-lg text-sm text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-neutral-400 mb-1.5">
              Full Case Study Description (Modal View)
            </label>
            <textarea
              rows={3}
              value={fullDescription}
              onChange={(e) => setFullDescription(e.target.value)}
              placeholder="Detailed creative direction, execution notes, and strategic approach..."
              className="w-full bg-[#171717] border border-white/10 focus:border-[#C8FF00] px-4 py-2.5 rounded-lg text-sm text-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-mono uppercase text-neutral-400 mb-1.5">
                Project Tags (Comma Separated)
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="Branding, Typography, Art Direction"
                className="w-full bg-[#171717] border border-white/10 focus:border-[#C8FF00] px-4 py-2.5 rounded-lg text-sm text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-neutral-400 mb-1.5">
                Deliverables (Comma Separated)
              </label>
              <input
                type="text"
                value={deliverablesInput}
                onChange={(e) => setDeliverablesInput(e.target.value)}
                placeholder="Logo Suite, Packaging, Brand Book"
                className="w-full bg-[#171717] border border-white/10 focus:border-[#C8FF00] px-4 py-2.5 rounded-lg text-sm text-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-neutral-400 mb-1.5">
              Instagram Profile / Reel URL (Optional)
            </label>
            <input
              type="url"
              value={instagramUrl}
              onChange={(e) => setInstagramUrl(e.target.value)}
              placeholder="https://www.instagram.com/clienthandle/"
              className="w-full bg-[#171717] border border-white/10 focus:border-[#C8FF00] px-4 py-2.5 rounded-lg text-sm text-white font-mono focus:outline-none"
            />
          </div>
        </div>

        {/* Project Type Selector & Dynamic Media Panel */}
        <div className="bg-[#111111] border border-white/10 rounded-2xl p-6 space-y-6">
          <div className="border-b border-white/10 pb-3">
            <h2 className="font-display text-base font-bold text-white uppercase tracking-wider">
              Project Type & Media Upload
            </h2>
            <p className="text-xs text-neutral-400 mt-1">
              Select how this project opens in the interactive fullscreen portfolio viewer.
            </p>
          </div>

          {/* 4 Type Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { id: 'image', label: 'Image', icon: ImageIcon },
              { id: 'video', label: 'Video / Reel', icon: Video },
              { id: 'website', label: 'Website', icon: Globe },
              { id: 'gallery', label: 'Gallery', icon: Images },
            ].map((t) => {
              const Icon = t.icon;
              const active = projectType === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setProjectType(t.id as MediaType)}
                  className={`p-3.5 rounded-xl border text-left transition-all flex items-center gap-3 ${
                    active
                      ? 'bg-[#C8FF00]/10 border-[#C8FF00] text-[#C8FF00]'
                      : 'bg-[#171717] border-white/10 text-neutral-400 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="text-xs font-semibold uppercase tracking-wider">{t.label}</span>
                </button>
              );
            })}
          </div>

          {/* Project Thumbnail Upload (Optional) */}
          <div className="p-5 bg-[#151515] border border-white/10 rounded-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <label className="text-xs font-mono uppercase text-white font-semibold block">
                  Project Thumbnail <span className="text-neutral-500 font-normal">(Optional)</span>
                </label>
                <span className="text-[11px] text-neutral-400">
                  Leave blank to auto-use the uploaded video frame, gallery cover, or clean typographic card preview.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  ref={thumbInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleThumbUpload(e.target.files?.[0])}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => setPickerTarget('thumbnail')}
                  className="px-3 py-1.5 bg-[#1d1d1d] border border-white/10 hover:border-white/30 rounded text-xs text-neutral-300 flex items-center gap-1.5"
                >
                  <FolderOpen className="w-3.5 h-3.5" />
                  <span>Media Library</span>
                </button>
                <button
                  type="button"
                  onClick={() => thumbInputRef.current?.click()}
                  disabled={thumbProgress !== null}
                  className="px-3.5 py-1.5 bg-[#C8FF00] text-black text-xs font-semibold rounded hover:bg-white transition-colors flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{thumbProgress !== null ? `Uploading ${thumbProgress}%` : 'Upload Thumbnail'}</span>
                </button>
              </div>
            </div>

            {thumbProgress !== null && (
              <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#C8FF00] transition-all duration-200"
                  style={{ width: `${thumbProgress}%` }}
                />
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              {thumbnailUrl && (
                <div className="w-28 h-20 rounded-lg overflow-hidden border border-white/10 bg-black shrink-0">
                  <img
                    src={thumbnailUrl}
                    alt="Thumbnail preview"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1 w-full flex items-center gap-2">
                <input
                  type="text"
                  value={thumbnailUrl}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                  placeholder="Optional: https://... or upload cover thumbnail"
                  className="flex-1 w-full bg-[#1a1a1a] border border-white/10 focus:border-[#C8FF00] px-3.5 py-2.5 rounded-lg text-xs text-white font-mono focus:outline-none"
                />
                {thumbnailUrl && (
                  <button
                    type="button"
                    onClick={() => setThumbnailUrl('')}
                    className="px-3 py-2.5 bg-[#1d1d1d] border border-white/10 hover:border-red-400/50 text-xs text-neutral-400 hover:text-red-300 rounded-lg transition-colors"
                    title="Clear thumbnail"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* DYNAMIC TYPE-SPECIFIC SECTION */}
          {projectType === 'image' && (
            <div className="p-5 bg-[#151515] border border-white/10 rounded-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <label className="text-xs font-mono uppercase text-[#C8FF00] font-semibold block">
                    High-Resolution Main Project Image
                  </label>
                  <span className="text-[11px] text-neutral-400">
                    Opened in the interactive zoom viewer
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    ref={mainMediaInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleMainMediaUpload(e.target.files?.[0])}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => setPickerTarget('media')}
                    className="px-3 py-1.5 bg-[#1d1d1d] border border-white/10 hover:border-white/30 rounded text-xs text-neutral-300 flex items-center gap-1.5"
                  >
                    <FolderOpen className="w-3.5 h-3.5" />
                    <span>Media Library</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => mainMediaInputRef.current?.click()}
                    disabled={mediaProgress !== null}
                    className="px-3.5 py-1.5 bg-[#C8FF00] text-black text-xs font-semibold rounded hover:bg-white transition-colors flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{mediaProgress !== null ? `Uploading ${mediaProgress}%` : 'Upload Image'}</span>
                  </button>
                </div>
              </div>

              {mediaProgress !== null && (
                <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#C8FF00] transition-all duration-200"
                    style={{ width: `${mediaProgress}%` }}
                  />
                </div>
              )}

              <input
                type="text"
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
                placeholder="https://... high-resolution image URL"
                className="w-full bg-[#1a1a1a] border border-white/10 focus:border-[#C8FF00] px-3.5 py-2.5 rounded-lg text-xs text-white font-mono focus:outline-none"
              />
            </div>
          )}

          {(projectType === 'video' || projectType === 'gallery') && (
            <div className="p-5 bg-[#151515] border border-white/10 rounded-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <label className="text-xs font-mono uppercase text-[#C8FF00] font-semibold block">
                    {projectType === 'video'
                      ? 'Multi-Video / Reels Upload & Playlist'
                      : 'Reels & Videos for This Client (Optional)'}
                  </label>
                  <span className="text-[11px] text-neutral-400">
                    Drag & drop multiple MP4 videos, select from your Media Library, or add external Reel/YouTube URLs
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPickerTarget('videos')}
                    className="px-3 py-1.5 bg-[#1d1d1d] border border-white/10 hover:border-white/30 rounded text-xs text-neutral-300 flex items-center gap-1.5"
                  >
                    <FolderOpen className="w-3.5 h-3.5" />
                    <span>Video Library</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => multiVideoInputRef.current?.click()}
                    disabled={multiVideoProgress !== null}
                    className="px-3.5 py-1.5 bg-[#C8FF00] text-black text-xs font-semibold rounded hover:bg-white transition-colors flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>
                      {multiVideoProgress !== null
                        ? `Uploading ${multiVideoProgress}%`
                        : 'Upload Multiple Videos'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Multi-video drag & drop zone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDraggingVideos(true);
                }}
                onDragLeave={() => setIsDraggingVideos(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDraggingVideos(false);
                  handleMultiVideoUpload(e.dataTransfer.files);
                }}
                onClick={() => multiVideoInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                  isDraggingVideos
                    ? 'border-[#C8FF00] bg-[#C8FF00]/5'
                    : 'border-white/15 hover:border-white/30 bg-[#111111]'
                }`}
              >
                <input
                  ref={multiVideoInputRef}
                  type="file"
                  multiple
                  accept="video/mp4,video/*"
                  onChange={(e) => handleMultiVideoUpload(e.target.files)}
                  className="hidden"
                />
                <Film className="w-6 h-6 text-neutral-500 mx-auto mb-2" />
                <p className="text-xs text-neutral-300">
                  Drag and drop multiple MP4 / MOV videos here, or click to select files
                </p>
              </div>

              {multiVideoProgress !== null && (
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-mono text-[#C8FF00]">
                    <span>Uploading videos to Firebase Storage...</span>
                    <span>{multiVideoProgress}%</span>
                  </div>
                  <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#C8FF00] transition-all duration-200"
                      style={{ width: `${multiVideoProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Add external video URL + aspect ratio */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-mono uppercase text-neutral-400 mb-1">
                    Add Video / Reel URL (Optional MP4, YouTube, or Instagram Reel)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newVideoUrlInput}
                      onChange={(e) => setNewVideoUrlInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddVideoUrl();
                        }
                      }}
                      placeholder="https://...video.mp4 or https://www.instagram.com/reel/..."
                      className="flex-1 bg-[#1a1a1a] border border-white/10 focus:border-[#C8FF00] px-3.5 py-2.5 rounded-lg text-xs text-white font-mono focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddVideoUrl}
                      disabled={!newVideoUrlInput.trim()}
                      className="px-3.5 py-2.5 bg-[#1d1d1d] border border-white/15 hover:border-[#C8FF00] text-xs font-semibold text-white rounded-lg disabled:opacity-40 flex items-center gap-1.5 shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5 text-[#C8FF00]" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase text-neutral-400 mb-1">
                    Video Aspect Ratio
                  </label>
                  <select
                    value={videoAspect}
                    onChange={(e) => {
                      const val = e.target.value as '16:9' | '9:16';
                      setVideoAspect(val);
                      if (val === '9:16') setGridSpan('tall');
                    }}
                    className="w-full bg-[#1a1a1a] border border-white/10 focus:border-[#C8FF00] px-3.5 py-2.5 rounded-lg text-xs text-white focus:outline-none cursor-pointer"
                  >
                    <option value="16:9">16:9 Widescreen Cinema</option>
                    <option value="9:16">9:16 Vertical Reel</option>
                  </select>
                </div>
              </div>

              {/* Uploaded / Added Videos List with Previews & Ordering */}
              {videoUrls.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
                  {videoUrls.map((vUrl, idx) => {
                    const isEmbedUrl =
                      vUrl.includes('youtube.com') ||
                      vUrl.includes('youtu.be') ||
                      vUrl.includes('instagram.com');
                    return (
                      <div
                        key={`${vUrl}-${idx}`}
                        className="bg-[#111111] border border-white/10 rounded-lg overflow-hidden flex flex-col"
                      >
                        <div className="relative aspect-video bg-black flex items-center justify-center">
                          {isEmbedUrl ? (
                            <div className="p-4 text-center space-y-1.5">
                              <Video className="w-6 h-6 text-[#C8FF00] mx-auto" />
                              <div className="text-[11px] font-mono text-neutral-300 truncate max-w-[220px]">
                                {vUrl}
                              </div>
                            </div>
                          ) : (
                            <video
                              src={`${vUrl}#t=0.1`}
                              muted
                              controls
                              preload="metadata"
                              className="w-full h-full object-cover"
                            />
                          )}
                          <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-black/80 text-[10px] font-mono text-[#C8FF00] rounded pointer-events-none">
                            {idx === 0 ? '#1 Primary' : `#${idx + 1}`}
                          </span>
                        </div>
                        <div className="p-1.5 flex items-center justify-between bg-[#141414]">
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => moveVideoItem(idx, -1)}
                              disabled={idx === 0}
                              className="p-1 text-neutral-400 hover:text-white disabled:opacity-30"
                              title="Move Earlier"
                            >
                              <ArrowUp className="w-3.5 h-3.5 -rotate-90" />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveVideoItem(idx, 1)}
                              disabled={idx === videoUrls.length - 1}
                              className="p-1 text-neutral-400 hover:text-white disabled:opacity-30"
                              title="Move Later"
                            >
                              <ArrowDown className="w-3.5 h-3.5 -rotate-90" />
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeVideoItem(idx)}
                            className="p-1 text-neutral-400 hover:text-red-400"
                            title="Remove Video"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {projectType === 'website' && (
            <div className="p-5 bg-[#151515] border border-white/10 rounded-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <label className="text-xs font-mono uppercase text-[#C8FF00] font-semibold block">
                    Live Website Configuration
                  </label>
                  <span className="text-[11px] text-neutral-400">
                    The project thumbnail serves as the website screenshot fallback if X-Frame-Options blocks embedding.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowWebsitePreview(true)}
                  disabled={!websiteUrl.trim()}
                  className="px-4 py-2 bg-[#C8FF00] text-black text-xs font-semibold uppercase tracking-wider rounded hover:bg-white transition-colors flex items-center gap-1.5 disabled:opacity-40 shrink-0"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Preview Website</span>
                </button>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-neutral-400 mb-1">
                  Website URL *
                </label>
                <input
                  type="url"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://client-website.com"
                  className="w-full bg-[#1a1a1a] border border-white/10 focus:border-[#C8FF00] px-3.5 py-2.5 rounded-lg text-xs text-white font-mono focus:outline-none"
                />
              </div>
            </div>
          )}

          {(projectType === 'gallery' || projectType === 'image') && (
            <div className="p-5 bg-[#151515] border border-white/10 rounded-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <label className="text-xs font-mono uppercase text-[#C8FF00] font-semibold block">
                    {projectType === 'gallery' ? 'Gallery Multi-Image Upload & Ordering' : 'Additional Project Images (Optional)'}
                  </label>
                  <span className="text-[11px] text-neutral-400">
                    Drag & drop multiple images, reorder sequence, or pick from the Media Library
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPickerTarget('gallery')}
                    className="px-3 py-1.5 bg-[#1d1d1d] border border-white/10 hover:border-white/30 rounded text-xs text-neutral-300 flex items-center gap-1.5"
                  >
                    <FolderOpen className="w-3.5 h-3.5" />
                    <span>Add from Library</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => galleryInputRef.current?.click()}
                    disabled={galleryProgress !== null}
                    className="px-3.5 py-1.5 bg-[#C8FF00] text-black text-xs font-semibold rounded hover:bg-white transition-colors flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{galleryProgress !== null ? `Uploading ${galleryProgress}%` : 'Upload Images'}</span>
                  </button>
                </div>
              </div>

              {/* Drag and Drop Zone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDraggingGallery(true);
                }}
                onDragLeave={() => setIsDraggingGallery(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDraggingGallery(false);
                  handleGalleryUpload(e.dataTransfer.files);
                }}
                onClick={() => galleryInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                  isDraggingGallery
                    ? 'border-[#C8FF00] bg-[#C8FF00]/5'
                    : 'border-white/15 hover:border-white/30 bg-[#111111]'
                }`}
              >
                <input
                  ref={galleryInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleGalleryUpload(e.target.files)}
                  className="hidden"
                />
                <Images className="w-6 h-6 text-neutral-500 mx-auto mb-2" />
                <p className="text-xs text-neutral-300">
                  Drag and drop multiple images here, or click to select files
                </p>
              </div>

              {galleryProgress !== null && (
                <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#C8FF00] transition-all duration-200"
                    style={{ width: `${galleryProgress}%` }}
                  />
                </div>
              )}

              {/* Gallery Thumbnails & Reorder Controls */}
              {galleryImages.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-2">
                  {galleryImages.map((imgUrl, idx) => (
                    <div
                      key={`${imgUrl}-${idx}`}
                      className="bg-[#111111] border border-white/10 rounded-lg overflow-hidden flex flex-col"
                    >
                      <div className="relative aspect-[4/3] bg-black">
                        <img
                          src={imgUrl}
                          alt={`Gallery item ${idx + 1}`}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-black/80 text-[10px] font-mono text-[#C8FF00] rounded">
                          #{idx + 1}
                        </span>
                      </div>
                      <div className="p-1.5 flex items-center justify-between bg-[#141414]">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => moveGalleryItem(idx, -1)}
                            disabled={idx === 0}
                            className="p-1 text-neutral-400 hover:text-white disabled:opacity-30"
                            title="Move Earlier"
                          >
                            <ArrowUp className="w-3.5 h-3.5 -rotate-90" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveGalleryItem(idx, 1)}
                            disabled={idx === galleryImages.length - 1}
                            className="p-1 text-neutral-400 hover:text-white disabled:opacity-30"
                            title="Move Later"
                          >
                            <ArrowDown className="w-3.5 h-3.5 -rotate-90" />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeGalleryItem(idx)}
                          className="p-1 text-neutral-400 hover:text-red-400"
                          title="Remove from Gallery"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Publication & Visibility Settings */}
        <div className="bg-[#111111] border border-white/10 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex flex-wrap items-center gap-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="w-4 h-4 accent-[#C8FF00]"
              />
              <span className="text-sm text-white font-medium">Featured Project</span>
            </label>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase text-neutral-400">Status:</span>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                className="bg-[#171717] border border-white/10 px-3 py-1.5 rounded-lg text-xs font-mono text-white focus:outline-none cursor-pointer"
              >
                <option value="published">Published (Live)</option>
                <option value="draft">Draft (Hidden)</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase text-neutral-400">Order:</span>
              <input
                type="number"
                min={0}
                value={sortOrder}
                onChange={(e) => setSortOrder(parseInt(e.target.value, 10) || 0)}
                className="w-20 bg-[#171717] border border-white/10 px-2.5 py-1.5 rounded-lg text-xs font-mono text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-3 text-xs font-mono uppercase tracking-wider text-neutral-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-7 py-3 bg-[#C8FF00] text-black font-semibold text-xs uppercase tracking-widest hover:bg-white transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{editingProject ? 'Update Project' : 'Save Project'}</span>
            </button>
          </div>
        </div>
      </form>

      {/* Admin Website Preview Modal */}
      {showWebsitePreview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl"
          onClick={() => setShowWebsitePreview(false)}
        >
          <div
            className="w-full max-w-6xl bg-[#0c0c0c] border border-white/15 rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#121212]">
              <span className="font-display font-bold text-white">
                Website Preview — {title || 'Untitled Project'}
              </span>
              <button
                onClick={() => setShowWebsitePreview(false)}
                className="p-1.5 text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <WebsitePreview
                url={websiteUrl}
                title={title || 'Website Preview'}
                screenshotFallback={thumbnailUrl}
              />
            </div>
          </div>
        </div>
      )}

      {/* Media Library Picker Modal */}
      {pickerTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
          onClick={() => setPickerTarget(null)}
        >
          <div
            className="w-full max-w-4xl max-h-[85vh] bg-[#111111] border border-white/15 rounded-2xl flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="font-display text-lg font-bold text-white">
                Select from Media Library
              </h3>
              <button
                onClick={() => setPickerTarget(null)}
                className="p-1 text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {pickerTarget === 'videos' ? (
                mediaAssets.filter((m) => m.mediaType === 'video').length === 0 ? (
                  <div className="col-span-full py-12 text-center text-xs text-neutral-400">
                    No uploaded videos in Media Library yet.
                  </div>
                ) : (
                  mediaAssets
                    .filter((m) => m.mediaType === 'video')
                    .map((m) => (
                      <button
                        key={m.mediaId}
                        type="button"
                        onClick={() => {
                          setVideoUrls((prev) => {
                            const next = [...prev, m.url];
                            if (!videoUrl) setVideoUrl(next[0]);
                            if (projectType === 'video' && !mediaUrl) setMediaUrl(next[0]);
                            return next;
                          });
                          setPickerTarget(null);
                        }}
                        className="group bg-[#171717] border border-white/10 hover:border-[#C8FF00] rounded-lg overflow-hidden text-left transition-colors"
                      >
                        <div className="aspect-[4/3] bg-black overflow-hidden">
                          <video
                            src={`${m.url}#t=0.1`}
                            muted
                            preload="metadata"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-2 text-[11px] text-neutral-300 truncate">{m.name}</div>
                      </button>
                    ))
                )
              ) : mediaAssets.filter((m) => m.mediaType === 'image').length === 0 ? (
                <div className="col-span-full py-12 text-center text-xs text-neutral-400">
                  No uploaded images in Media Library yet.
                </div>
              ) : (
                mediaAssets
                  .filter((m) => m.mediaType === 'image')
                  .map((m) => (
                    <button
                      key={m.mediaId}
                      type="button"
                      onClick={() => {
                        if (pickerTarget === 'thumbnail') setThumbnailUrl(m.url);
                        if (pickerTarget === 'media') setMediaUrl(m.url);
                        if (pickerTarget === 'gallery') setGalleryImages((prev) => [...prev, m.url]);
                        setPickerTarget(null);
                      }}
                      className="group bg-[#171717] border border-white/10 hover:border-[#C8FF00] rounded-lg overflow-hidden text-left transition-colors"
                    >
                      <div className="aspect-[4/3] bg-black overflow-hidden">
                        <img
                          src={m.url}
                          alt={m.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <div className="p-2 text-[11px] text-neutral-300 truncate">{m.name}</div>
                    </button>
                  ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
