import React, { useEffect, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Sparkles,
  Tag,
  Share2,
  Check,
  BarChart3,
  Globe,
  Instagram,
  ExternalLink,
  Images,
  Film,
} from 'lucide-react';
import { Project } from '../../types/portfolio';
import { ImageZoomViewer } from './ImageZoomViewer';
import { VideoPlayer } from './VideoPlayer';
import { WebsitePreview } from './WebsitePreview';
import { ImageSlider } from './ImageSlider';

interface ProjectModalProps {
  project: Project | null;
  allProjects: Project[];
  isOpen: boolean;
  initialVideoIndex?: number;
  onClose: () => void;
  onSelectProject: (project: Project) => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({
  project,
  allProjects,
  isOpen,
  initialVideoIndex,
  onClose,
  onSelectProject,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [mediaMode, setMediaMode] = useState<'images' | 'videos'>('images');

  const projectVideos = React.useMemo(() => {
    if (!project) return [];
    const list =
      project.videoUrls && project.videoUrls.length > 0
        ? project.videoUrls
        : project.videoUrl
        ? [project.videoUrl]
        : project.projectType === 'video' && project.mediaUrl
        ? [project.mediaUrl]
        : [];
    return list.filter(Boolean);
  }, [project]);

  const projectImages = React.useMemo(() => {
    if (!project) return [];
    const list =
      project.galleryImages && project.galleryImages.length > 0
        ? project.galleryImages
        : project.projectType === 'image' && project.mediaUrl
        ? [project.mediaUrl]
        : project.thumbnail
        ? [project.thumbnail]
        : [];
    return list.filter(Boolean);
  }, [project]);

  useEffect(() => {
    if (!project) return;
    if (
      (initialVideoIndex !== undefined && projectVideos.length > 0) ||
      project.projectType === 'video' ||
      (projectImages.length === 0 && projectVideos.length > 0)
    ) {
      setMediaMode('videos');
    } else {
      setMediaMode('images');
    }
  }, [project?.id, project?.projectType, projectImages.length, projectVideos.length, initialVideoIndex]);

  const currentIndex = project ? allProjects.findIndex((p) => p.id === project.id) : -1;

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      onSelectProject(allProjects[currentIndex - 1]);
    } else {
      onSelectProject(allProjects[allProjects.length - 1]);
    }
  }, [currentIndex, allProjects, onSelectProject]);

  const handleNext = useCallback(() => {
    if (currentIndex < allProjects.length - 1) {
      onSelectProject(allProjects[currentIndex + 1]);
    } else {
      onSelectProject(allProjects[0]);
    }
  }, [currentIndex, allProjects, onSelectProject]);

  // Keyboard navigation & Esc listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();

      // Navigate projects with left/right arrows or Alt+Arrow
      if (e.key === 'ArrowLeft' || (e.altKey && e.key === 'ArrowLeft')) {
        handlePrev();
      }
      if (e.key === 'ArrowRight' || (e.altKey && e.key === 'ArrowRight')) {
        handleNext();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, handlePrev, handleNext]);

  // Touch swipe support on mobile devices
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;

    // Minimum swipe threshold
    if (Math.abs(diff) > 75) {
      if (diff > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    setTouchStart(null);
  };

  const copyShareLink = () => {
    if (!project) return;
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    });
  };

  if (!isOpen || !project) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/92 backdrop-blur-2xl"
        onClick={onClose}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Side Floating Project Nav Arrows (Desktop) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handlePrev();
          }}
          className="hidden lg:flex fixed left-6 top-1/2 -translate-y-1/2 z-50 w-12 h-12 rounded-full bg-[#141414]/90 border border-white/15 text-neutral-300 hover:text-black hover:bg-[#C8FF00] hover:border-[#C8FF00] items-center justify-center transition-all duration-200 shadow-2xl"
          title="Previous Project (←)"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            handleNext();
          }}
          className="hidden lg:flex fixed right-6 top-1/2 -translate-y-1/2 z-50 w-12 h-12 rounded-full bg-[#141414]/90 border border-white/15 text-neutral-300 hover:text-black hover:bg-[#C8FF00] hover:border-[#C8FF00] items-center justify-center transition-all duration-200 shadow-2xl"
          title="Next Project (→)"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Modal Content Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-6xl max-h-[94vh] flex flex-col bg-[#0c0c0c] border border-white/15 rounded-2xl shadow-2xl overflow-hidden text-white"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between px-5 sm:px-7 py-4 border-b border-white/10 bg-[#121212]/90 backdrop-blur-md shrink-0 select-none">
            {/* Title & Metadata */}
            <div className="flex items-center gap-2.5 truncate mr-4">
              <span className="text-[11px] font-mono uppercase text-black bg-[#C8FF00] font-bold px-2 py-0.5 rounded-sm">
                {project.category}
              </span>
              <span className="text-neutral-600 hidden sm:inline">/</span>
              <span className="font-display font-bold text-white text-base sm:text-lg truncate">
                {project.title}
              </span>
              {project.year && (
                <span className="text-neutral-400 text-xs font-mono hidden md:inline">
                  ({project.year})
                </span>
              )}
            </div>

            {/* Quick Navigation Controls & Close */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Project Index Counter */}
              <div className="flex items-center bg-[#181818] rounded-lg p-0.5 border border-white/10">
                <button
                  onClick={handlePrev}
                  className="p-1.5 text-neutral-400 hover:text-[#C8FF00] transition-colors"
                  title="Previous Project (←)"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <span className="text-[11px] font-mono px-2 text-neutral-300 font-semibold">
                  {String(currentIndex + 1).padStart(2, '0')} / {String(allProjects.length).padStart(2, '0')}
                </span>

                <button
                  onClick={handleNext}
                  className="p-1.5 text-neutral-400 hover:text-[#C8FF00] transition-colors"
                  title="Next Project (→)"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Share Link Button */}
              <button
                onClick={copyShareLink}
                className="p-2 text-neutral-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors hidden sm:flex items-center gap-1.5 text-xs font-mono"
                title="Share project"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-4 h-4 text-[#C8FF00]" />
                    <span className="text-[#C8FF00]">Copied!</span>
                  </>
                ) : (
                  <Share2 className="w-4 h-4" />
                )}
              </button>

              {/* Close Modal Button */}
              <button
                onClick={onClose}
                className="p-2 text-neutral-300 hover:text-black hover:bg-[#C8FF00] rounded-lg transition-all duration-200 flex items-center gap-1"
                aria-label="Close viewer (Esc)"
                title="Close Viewer (Esc)"
              >
                <X className="w-5 h-5" />
                <span className="text-[10px] font-mono uppercase hidden sm:inline font-bold">Esc</span>
              </button>
            </div>
          </div>

          {/* Scrollable Modal Content Stage */}
          <div className="flex-1 overflow-y-auto">
            {/* Media Presentation Stage */}
            <div className="p-3 sm:p-6 bg-[#060606] border-b border-white/10 flex flex-col items-center justify-center relative gap-4">
              {project.projectType !== 'website' &&
                projectImages.length > 0 &&
                projectVideos.length > 0 && (
                  <div className="flex items-center gap-2 bg-[#141414] border border-white/10 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setMediaMode('videos')}
                      className={`px-3.5 py-1.5 text-xs font-mono uppercase rounded-lg flex items-center gap-1.5 transition-colors ${
                        mediaMode === 'videos'
                          ? 'bg-[#C8FF00] text-black font-bold'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      <Film className="w-3.5 h-3.5" />
                      <span>Videos ({projectVideos.length})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setMediaMode('images')}
                      className={`px-3.5 py-1.5 text-xs font-mono uppercase rounded-lg flex items-center gap-1.5 transition-colors ${
                        mediaMode === 'images'
                          ? 'bg-[#C8FF00] text-black font-bold'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      <Images className="w-3.5 h-3.5" />
                      <span>Images ({projectImages.length})</span>
                    </button>
                  </div>
                )}

              {project.projectType === 'website' ? (
                <WebsitePreview
                  url={project.websiteUrl || 'https://example.com'}
                  title={project.title}
                  screenshotFallback={project.thumbnail}
                />
              ) : mediaMode === 'videos' && projectVideos.length > 0 ? (
                <VideoPlayer
                  src={projectVideos[0] || ''}
                  sources={projectVideos}
                  initialIndex={initialVideoIndex ?? 0}
                  poster={project.thumbnail}
                  title={project.title}
                  isVertical={project.videoAspect === '9:16' || project.isVerticalReel}
                />
              ) : project.projectType === 'image' ? (
                projectImages[0] ? (
                  <ImageZoomViewer src={projectImages[0]} alt={project.title} />
                ) : (
                  <div className="py-16 px-6 text-center text-xs font-mono text-neutral-400">
                    No image uploaded yet.
                  </div>
                )
              ) : project.projectType === 'video' ? (
                <VideoPlayer
                  src={projectVideos[0] || ''}
                  sources={projectVideos}
                  initialIndex={initialVideoIndex ?? 0}
                  poster={project.thumbnail}
                  title={project.title}
                  isVertical={project.videoAspect === '9:16' || project.isVerticalReel}
                />
              ) : projectImages.length > 0 ? (
                <ImageSlider images={projectImages} title={project.title} />
              ) : (
                <div className="py-16 px-6 text-center text-xs font-mono text-neutral-400">
                  No images or videos uploaded for this gallery yet.
                </div>
              )}
            </div>

            {/* Case Study Details */}
            <div className="p-6 sm:p-10 max-w-5xl mx-auto space-y-8">
              {/* Top Overview Split */}
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8 pb-8 border-b border-white/10">
                <div className="max-w-2xl">
                  <div className="text-xs font-mono text-[#C8FF00] uppercase tracking-wider mb-2">
                    Client: <span className="text-white font-semibold">{project.client}</span>
                  </div>
                  <h2 className="font-display text-2xl sm:text-4xl font-bold tracking-tight text-white mb-4">
                    {project.title}
                  </h2>
                  <p className="text-base text-neutral-300 font-light leading-relaxed">
                    {project.fullDescription || project.description}
                  </p>

                  {(project.instagramUrl || project.websiteUrl) && (
                    <div className="flex flex-wrap items-center gap-3 mt-6">
                      {project.instagramUrl && (
                        <a
                          href={project.instagramUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#C8FF00] text-black text-xs font-semibold uppercase tracking-wider hover:bg-white transition-colors"
                        >
                          <Instagram className="w-3.5 h-3.5" />
                          <span>View Instagram Profile</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {project.websiteUrl && (
                        <a
                          href={project.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#161616] border border-white/15 text-white text-xs font-semibold uppercase tracking-wider hover:border-[#C8FF00] hover:text-[#C8FF00] transition-colors"
                        >
                          <Globe className="w-3.5 h-3.5" />
                          <span>Visit Live Website</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  )}
                </div>

                {/* Metrics Callout Strip */}
                {project.metrics && project.metrics.length > 0 && (
                  <div className="flex sm:flex-row lg:flex-col gap-4 lg:w-56 shrink-0 bg-[#121212] p-5 rounded-xl border border-white/10 shadow-xl">
                    <div className="text-xs font-mono uppercase text-neutral-400 mb-1 flex items-center gap-1.5">
                      <BarChart3 className="w-3.5 h-3.5 text-[#C8FF00]" />
                      <span>Impact & Results</span>
                    </div>
                    {project.metrics.map((m, idx) => (
                      <div key={idx} className="flex-1 pt-2 border-t border-white/5">
                        <div className="font-display text-2xl font-bold text-[#C8FF00] font-mono-nums">
                          {m.value}
                        </div>
                        <div className="text-[11px] uppercase tracking-wider text-neutral-400 mt-0.5">
                          {m.label}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Deliverables & Disciplines Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
                {project.deliverables && project.deliverables.length > 0 && (
                  <div className="bg-[#111111] p-6 rounded-xl border border-white/5">
                    <h3 className="text-xs font-mono uppercase tracking-wider text-neutral-300 mb-4 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#C8FF00]" />
                      <span>Executed Deliverables</span>
                    </h3>
                    <ul className="space-y-2.5 text-neutral-300 text-xs sm:text-sm">
                      {project.deliverables.map((item, idx) => (
                        <li key={idx} className="flex items-center gap-2.5">
                          <span className="w-1.5 h-1.5 bg-[#C8FF00] rounded-none shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {project.tags && project.tags.length > 0 && (
                  <div className="bg-[#111111] p-6 rounded-xl border border-white/5">
                    <h3 className="text-xs font-mono uppercase tracking-wider text-neutral-300 mb-4 flex items-center gap-2">
                      <Tag className="w-4 h-4 text-[#C8FF00]" />
                      <span>Disciplines & Technologies</span>
                    </h3>
                    <div className="flex flex-wrap gap-2 text-xs">
                      {project.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-[#181818] border border-white/10 text-neutral-200 rounded-md font-mono"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
