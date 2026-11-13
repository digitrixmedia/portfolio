import React, { useState, useMemo, useRef } from 'react';
import {
  Search,
  Upload,
  Copy,
  Check,
  Trash2,
  Image as ImageIcon,
  Film,
  AlertTriangle,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { MediaAsset, Project, ProfileSettings } from '../../types/portfolio';
import { uploadPortfolioMedia, deleteStorageFileByPath } from '../../lib/storage-service';
import { deleteMediaAssetRecord } from '../../lib/firestore-service';

interface MediaLibraryTabProps {
  mediaAssets: MediaAsset[];
  projects: Project[];
  profileSettings: ProfileSettings;
}

export const MediaLibraryTab: React.FC<MediaLibraryTabProps> = ({
  mediaAssets,
  projects,
  profileSettings,
}) => {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'image' | 'video'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    asset: MediaAsset;
    references: string[];
    hasPublishedRef: boolean;
  } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    return mediaAssets.filter((m) => {
      const matchesSearch =
        !search.trim() || m.name.toLowerCase().includes(search.toLowerCase());
      const matchesType = typeFilter === 'all' || m.mediaType === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [mediaAssets, search, typeFilter]);

  const findReferences = (url: string) => {
    const refs: string[] = [];
    let hasPublishedRef = false;

    projects.forEach((p) => {
      const usedInProject =
        p.thumbnail === url ||
        p.thumbnailUrl === url ||
        p.mediaUrl === url ||
        p.videoUrl === url ||
        p.galleryImages?.includes(url) ||
        p.images?.includes(url);

      if (usedInProject) {
        refs.push(`${p.title} (${p.status === 'draft' ? 'Draft' : 'Published'})`);
        if (p.status !== 'draft') hasPublishedRef = true;
      }
    });

    if (profileSettings.profileImage === url) {
      refs.push('Profile Image (Settings)');
      hasPublishedRef = true;
    }

    return { refs, hasPublishedRef };
  };

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setUploadError(null);
    setUploadProgress(0);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const folder = file.type.startsWith('video/') ? 'videos' : 'images';
        await uploadPortfolioMedia(file, folder, (pct) => {
          setUploadProgress(pct);
        });
      }
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleCopy = (asset: MediaAsset) => {
    navigator.clipboard.writeText(asset.url).then(() => {
      setCopiedId(asset.mediaId);
      setTimeout(() => setCopiedId(null), 1800);
    });
  };

  const requestDelete = (asset: MediaAsset) => {
    const { refs, hasPublishedRef } = findReferences(asset.url);
    setDeleteTarget({ asset, references: refs, hasPublishedRef });
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteStorageFileByPath(deleteTarget.asset.storagePath);
      await deleteMediaAssetRecord(deleteTarget.asset.mediaId);
      setDeleteTarget(null);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Failed to delete asset.');
    } finally {
      setDeleting(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (!bytes) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const formatDate = (val?: string | number | Date | null) => {
    if (!val) return '—';
    const d = new Date(val);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Media Library
          </h1>
          <p className="text-sm text-neutral-400 mt-1 font-light">
            Manage images and videos hosted in Firebase Storage. Referenced assets are protected from accidental deletion.
          </p>
        </div>

        <div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={(e) => handleUpload(e.target.files)}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#C8FF00] text-black text-xs font-semibold uppercase tracking-wider hover:bg-white transition-colors disabled:opacity-50"
          >
            {uploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            <span>{uploading ? `Uploading ${uploadProgress}%` : 'Upload Media'}</span>
          </button>
        </div>
      </div>

      {uploadError && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-300">
          {uploadError}
        </div>
      )}

      {/* Search & Type Filter */}
      <div className="bg-[#111111] border border-white/10 rounded-xl p-4 flex flex-col sm:flex-row gap-3 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by file name..."
            className="w-full bg-[#171717] border border-white/10 focus:border-[#C8FF00] pl-10 pr-4 py-2 rounded-lg text-xs text-white focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          {(['all', 'image', 'video'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono uppercase transition-colors ${
                typeFilter === t
                  ? 'bg-[#C8FF00] text-black font-bold'
                  : 'bg-[#171717] text-neutral-400 hover:text-white border border-white/5'
              }`}
            >
              {t === 'all' ? 'All' : t === 'image' ? 'Images' : 'Videos'}
            </button>
          ))}
        </div>
      </div>

      {/* Assets Grid */}
      {filtered.length === 0 ? (
        <div className="bg-[#111111] border border-dashed border-white/10 rounded-2xl p-16 text-center space-y-3">
          <ImageIcon className="w-8 h-8 text-neutral-600 mx-auto" />
          <p className="text-sm text-neutral-400">
            No uploaded media assets found. Upload images or MP4 videos above or directly inside any project form.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((asset) => {
            const { refs } = findReferences(asset.url);
            return (
              <div
                key={asset.mediaId}
                className="bg-[#111111] border border-white/10 rounded-xl overflow-hidden flex flex-col justify-between group"
              >
                {/* Preview */}
                <div className="relative aspect-[4/3] bg-[#070707] overflow-hidden">
                  {asset.mediaType === 'video' ? (
                    <video
                      src={asset.url}
                      muted
                      playsInline
                      preload="metadata"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img
                      src={asset.url}
                      alt={asset.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  )}

                  <div className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-black/80 backdrop-blur-md border border-white/10 rounded text-[10px] font-mono uppercase text-[#C8FF00] flex items-center gap-1">
                    {asset.mediaType === 'video' ? (
                      <Film className="w-3 h-3" />
                    ) : (
                      <ImageIcon className="w-3 h-3" />
                    )}
                    <span>{asset.mediaType}</span>
                  </div>

                  {refs.length > 0 && (
                    <div
                      className="absolute top-2.5 right-2.5 px-2 py-0.5 bg-black/80 border border-[#C8FF00]/40 rounded text-[10px] font-mono text-white"
                      title={refs.join(', ')}
                    >
                      In Use ({refs.length})
                    </div>
                  )}
                </div>

                {/* Metadata & Actions */}
                <div className="p-4 space-y-3">
                  <div>
                    <div className="text-xs font-medium text-white truncate" title={asset.name}>
                      {asset.name}
                    </div>
                    <div className="text-[11px] font-mono text-neutral-500 mt-0.5 flex items-center justify-between tabular-nums">
                      <span>{formatSize(asset.size)}</span>
                      <span>{formatDate(asset.createdAt)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/5">
                    <button
                      onClick={() => handleCopy(asset)}
                      className="inline-flex items-center gap-1.5 text-xs font-mono text-neutral-300 hover:text-[#C8FF00] transition-colors"
                    >
                      {copiedId === asset.mediaId ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-[#C8FF00]" />
                          <span className="text-[#C8FF00]">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy URL</span>
                        </>
                      )}
                    </button>

                    <div className="flex items-center gap-1">
                      <a
                        href={asset.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-neutral-400 hover:text-white transition-colors"
                        title="Open in new tab"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      <button
                        onClick={() => requestDelete(asset)}
                        className="p-1.5 text-neutral-400 hover:text-red-400 transition-colors"
                        title="Delete Asset"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Warning Modal */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
          onClick={() => setDeleteTarget(null)}
        >
          <div
            className="max-w-md w-full bg-[#111111] border border-white/15 rounded-2xl p-6 space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                  deleteTarget.references.length > 0
                    ? 'bg-amber-500/15 text-amber-400'
                    : 'bg-red-500/15 text-red-400'
                }`}
              >
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-white">
                  {deleteTarget.references.length > 0
                    ? 'Media Still Referenced'
                    : 'Delete Media Asset?'}
                </h3>
                <p className="text-xs text-neutral-400 truncate max-w-[260px]">
                  {deleteTarget.asset.name}
                </p>
              </div>
            </div>

            {deleteTarget.references.length > 0 ? (
              <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-2 text-xs text-amber-200">
                <p className="font-semibold">
                  Warning: This asset is currently referenced by:
                </p>
                <ul className="list-disc pl-4 space-y-1 text-amber-100/90">
                  {deleteTarget.references.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
                <p className="text-[11px] text-amber-300/80 pt-1">
                  {deleteTarget.hasPublishedRef
                    ? 'Remove this asset from published projects before deleting it so the public portfolio does not show broken media.'
                    : 'Deleting this file from Firebase Storage will break references in those draft projects.'}
                </p>
              </div>
            ) : (
              <p className="text-sm text-neutral-400">
                This file is not referenced by any project. Deleting it removes the file permanently from Firebase Storage and the Media Library.
              </p>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 text-xs font-mono text-neutral-300 hover:text-white"
              >
                Cancel
              </button>
              {!deleteTarget.hasPublishedRef && (
                <button
                  onClick={confirmDelete}
                  disabled={deleting}
                  className="px-4 py-2 bg-red-500 text-white text-xs font-semibold uppercase tracking-wider rounded hover:bg-red-600 disabled:opacity-50"
                >
                  {deleting ? 'Deleting...' : 'Confirm Delete'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
