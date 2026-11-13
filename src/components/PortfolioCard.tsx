import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Play,
  Globe,
  Images,
  ArrowUpRight,
  Instagram,
  Volume2,
  VolumeX,
  ExternalLink,
} from 'lucide-react';
import { Project } from '../types/portfolio';

interface PortfolioCardProps {
  project: Project;
  onClick: () => void;
  variant?: 'video' | 'image' | 'website';
  overrideVideoUrl?: string;
  videoIndexLabel?: string;
  className?: string;
}

function getInstagramHandle(url?: string): string | null {
  if (!url) return null;
  const match = url.match(/instagram\.com\/([^/?#]+)/i);
  return match?.[1] ? `@${match[1]}` : null;
}

function getCleanHostname(url?: string): string {
  if (!url) return 'website';
  try {
    return new URL(url).hostname.replace(/^www\./i, '');
  } catch {
    return url.replace(/^https?:\/\/(www\.)?/i, '').split('/')[0] || 'website';
  }
}

function isNativeVideoUrl(url?: string): boolean {
  if (!url) return false;
  const lower = url.toLowerCase();
  if (
    lower.includes('youtube.com') ||
    lower.includes('youtu.be') ||
    lower.includes('instagram.com/')
  ) {
    return false;
  }
  return true;
}

export const PortfolioCard: React.FC<PortfolioCardProps> = ({
  project,
  onClick,
  variant,
  overrideVideoUrl,
  videoIndexLabel,
  className = '',
}) => {
  const resolvedVariant =
    variant ||
    (project.projectType === 'website'
      ? 'website'
      : project.projectType === 'video'
      ? 'video'
      : 'image');

  const igHandle = getInstagramHandle(project.instagramUrl);
  const videoList = React.useMemo(() => {
    if (overrideVideoUrl !== undefined) {
      return overrideVideoUrl ? [overrideVideoUrl] : [];
    }
    const combined =
      project.videoUrls && project.videoUrls.length > 0
        ? project.videoUrls
        : project.videoUrl
        ? [project.videoUrl]
        : project.mediaUrl
        ? [project.mediaUrl]
        : [];
    return combined.filter(Boolean);
  }, [overrideVideoUrl, project.videoUrls, project.videoUrl, project.mediaUrl]);

  const videoSrc = videoList[0] || '';
  const hasNativeVideo = resolvedVariant === 'video' && Boolean(videoSrc) && isNativeVideoUrl(videoSrc);
  const isVerticalReel = Boolean(project.isVerticalReel || project.videoAspect === '9:16');

  const videoRef = useRef<HTMLVideoElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [galleryPreviewIndex, setGalleryPreviewIndex] = useState(0);

  const galleryList =
    project.galleryImages && project.galleryImages.length > 0
      ? project.galleryImages.filter(Boolean)
      : [project.thumbnail].filter(Boolean);

  // Subtle hover cycling for multi-image galleries
  useEffect(() => {
    if (resolvedVariant !== 'image' || !isHovered || galleryList.length <= 1) {
      setGalleryPreviewIndex(0);
      return;
    }
    const interval = setInterval(() => {
      setGalleryPreviewIndex((prev) => (prev + 1) % galleryList.length);
    }, 1600);
    return () => clearInterval(interval);
  }, [resolvedVariant, isHovered, galleryList.length]);

  const handleVideoMouseEnter = async () => {
    setIsHovered(true);
    const video = videoRef.current;
    if (!video || !hasNativeVideo) return;

    try {
      video.muted = false;
      await video.play();
      setIsMuted(false);
      setIsPlaying(true);
    } catch {
      // Browser blocked unmuted autoplay before page interaction: fallback cleanly to muted playback
      try {
        video.muted = true;
        await video.play();
        setIsMuted(true);
        setIsPlaying(true);
      } catch {
        setIsPlaying(false);
      }
    }
  };

  const handleVideoMouseLeave = () => {
    setIsHovered(false);
    const video = videoRef.current;
    if (!video) return;
    video.pause();
    video.muted = true;
    setIsMuted(true);
    setIsPlaying(false);
  };

  const handleToggleSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;

    if (!isPlaying) {
      video.muted = false;
      video
        .play()
        .then(() => {
          setIsMuted(false);
          setIsPlaying(true);
        })
        .catch(() => {
          video.muted = true;
          video.play().catch(() => {});
          setIsMuted(true);
        });
      return;
    }

    const nextMuted = !isMuted;
    video.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  // =========================================================================
  // 1. WEBSITE CARD (Browser Frame Screenshot / Visual Preview)
  // =========================================================================
  if (resolvedVariant === 'website') {
    const domain = getCleanHostname(project.websiteUrl);
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        onClick={onClick}
        className="group cursor-pointer bg-[#0e0e0e] border border-white/[0.09] hover:border-[#C8FF00]/60 rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-1 flex flex-col"
      >
        {/* Minimal Browser Bar */}
        <div className="px-3.5 py-2.5 bg-[#151515] border-b border-white/[0.08] flex items-center justify-between gap-2 select-none">
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-white/15 group-hover:bg-[#ff5f56] transition-colors" />
            <span className="w-2.5 h-2.5 rounded-full bg-white/15 group-hover:bg-[#ffbd2e] transition-colors" />
            <span className="w-2.5 h-2.5 rounded-full bg-white/15 group-hover:bg-[#27c93f] transition-colors" />
          </div>

          <div className="flex-1 mx-2 px-2.5 py-1 bg-[#0b0b0b] border border-white/[0.06] rounded text-[11px] font-mono text-neutral-400 truncate flex items-center gap-1.5">
            <Globe className="w-3 h-3 text-[#C8FF00] shrink-0" />
            <span className="truncate">{domain}</span>
          </div>

          {project.websiteUrl && (
            <a
              href={project.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="p-1 text-neutral-400 hover:text-[#C8FF00] transition-colors shrink-0"
              title={`Open ${domain}`}
              aria-label={`Open ${project.title} website`}
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

        {/* Website Visual Stage */}
        <div className="relative aspect-[16/10] bg-[#121212] overflow-hidden">
          {project.thumbnail ? (
            <img
              src={project.thumbnail}
              alt={`${project.title} website preview`}
              referrerPolicy="no-referrer"
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-[#141414] via-[#0e0e0e] to-[#080808]">
              <Globe className="w-8 h-8 text-[#C8FF00]/70 mb-2" />
              <div className="font-display text-lg font-bold text-white">{project.title}</div>
              <div className="text-[11px] font-mono text-neutral-400 mt-1">{domain}</div>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent opacity-60 group-hover:opacity-85 transition-opacity" />

          <div className="absolute bottom-3 left-3.5 right-3.5 flex items-center justify-between gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#C8FF00] bg-black/80 px-2.5 py-1 rounded">
              Interactive Preview & Info
            </span>
            <span className="w-7 h-7 rounded-full bg-[#C8FF00] text-black flex items-center justify-center">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>

        {/* Clean Title Footer */}
        <div className="px-4 py-3.5 bg-[#0b0b0b] border-t border-white/[0.06] flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-display text-base font-bold text-white truncate group-hover:text-[#C8FF00] transition-colors">
              {project.title}
            </h3>
            <p className="text-xs text-neutral-500 truncate mt-0.5">{domain}</p>
          </div>
          {igHandle && (
            <span className="text-[11px] font-mono text-neutral-400 shrink-0">{igHandle}</span>
          )}
        </div>
      </motion.div>
    );
  }

  // =========================================================================
  // 2. VIDEO / REEL CARD (Direct Hover Play + Audio, Click Opens Full Info)
  // =========================================================================
  if (resolvedVariant === 'video') {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        onClick={onClick}
        onMouseEnter={handleVideoMouseEnter}
        onMouseLeave={handleVideoMouseLeave}
        className={`group cursor-pointer bg-[#0e0e0e] border border-white/[0.09] hover:border-[#C8FF00]/60 rounded-xl overflow-hidden transition-all duration-300 flex flex-col ${className}`}
      >
        <div
          className={`relative w-full overflow-hidden bg-black ${
            isVerticalReel ? 'aspect-[9/15]' : 'aspect-video'
          }`}
        >
          {hasNativeVideo ? (
            <video
              ref={videoRef}
              src={videoSrc.includes('#') ? videoSrc : `${videoSrc}#t=0.1`}
              poster={project.thumbnail || undefined}
              playsInline
              loop
              muted={isMuted}
              preload="metadata"
              className="w-full h-full object-cover"
            />
          ) : project.thumbnail ? (
            <img
              src={project.thumbnail}
              alt={project.title}
              referrerPolicy="no-referrer"
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#161616] via-[#0c0c0c] to-[#060606] flex flex-col items-center justify-center p-6 text-center">
              {igHandle && <Instagram className="w-7 h-7 text-[#C8FF00]/70 mb-2" />}
              <span className="text-xs font-mono text-neutral-400 uppercase tracking-wider">
                {project.client}
              </span>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/30 pointer-events-none" />

          {/* Top Controls: Format label & Sound Toggle */}
          <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between gap-2">
            <span className="px-2.5 py-1 bg-black/75 backdrop-blur-md border border-white/10 rounded text-[10px] font-mono uppercase tracking-wider text-[#C8FF00] flex items-center gap-1.5">
              <Play className="w-2.5 h-2.5 fill-current" />
              <span>
                {videoIndexLabel
                  ? `${isVerticalReel ? 'Reel' : 'Video'} ${videoIndexLabel}`
                  : videoList.length > 1
                  ? `${videoList.length} ${isVerticalReel ? 'Reels' : 'Videos'}`
                  : isVerticalReel
                  ? '9:16 Reel'
                  : 'Video'}
              </span>
            </span>

            {hasNativeVideo && (
              <button
                type="button"
                onClick={handleToggleSound}
                className={`p-2 rounded-full backdrop-blur-md border transition-colors ${
                  !isMuted && isPlaying
                    ? 'bg-[#C8FF00] text-black border-[#C8FF00]'
                    : 'bg-black/75 text-white border-white/15 hover:border-[#C8FF00]'
                }`}
                title={isMuted ? 'Unmute audio' : 'Mute audio'}
                aria-label={isMuted ? 'Unmute audio' : 'Mute audio'}
              >
                {!isMuted && isPlaying ? (
                  <Volume2 className="w-3.5 h-3.5" />
                ) : (
                  <VolumeX className="w-3.5 h-3.5" />
                )}
              </button>
            )}
          </div>

          {/* Center Play Cue when idle */}
          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-12 h-12 rounded-full bg-black/65 border border-white/20 text-[#C8FF00] flex items-center justify-center group-hover:scale-110 transition-transform">
                <Play className="w-5 h-5 fill-current translate-x-0.5" />
              </div>
            </div>
          )}

          {/* Bottom Clean Overlay */}
          <div className="absolute bottom-3 left-3.5 right-3.5 z-10 flex items-end justify-between gap-2">
            <div className="min-w-0">
              <div className="text-[11px] font-mono text-neutral-300 truncate">
                {project.client}
              </div>
              <h3 className="font-display text-base sm:text-lg font-bold text-white truncate group-hover:text-[#C8FF00] transition-colors">
                {project.title}
              </h3>
            </div>
            <span className="w-7 h-7 rounded-full bg-white/10 group-hover:bg-[#C8FF00] text-white group-hover:text-black flex items-center justify-center shrink-0 transition-colors">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </motion.div>
    );
  }

  // =========================================================================
  // 3. IMAGE / CREATIVE CARD (Direct Visual First)
  // =========================================================================
  const activeImage = galleryList[galleryPreviewIndex] || project.thumbnail;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group cursor-pointer bg-[#0e0e0e] border border-white/[0.09] hover:border-[#C8FF00]/60 rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-1 flex flex-col"
    >
      {/* Direct Image Stage */}
      <div className="relative aspect-[4/3] bg-[#141414] overflow-hidden">
        {activeImage ? (
          <img
            src={activeImage}
            alt={project.title}
            referrerPolicy="no-referrer"
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#161616] via-[#101010] to-[#080808] flex flex-col items-center justify-center p-6 text-center">
            {igHandle ? (
              <Instagram className="w-8 h-8 text-[#C8FF00]/70 mb-2" />
            ) : (
              <Images className="w-8 h-8 text-[#C8FF00]/70 mb-2" />
            )}
            <div className="text-xs font-mono text-neutral-400">
              {igHandle || project.category}
            </div>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent pointer-events-none" />

        {/* Subtle Top Corner Indicator */}
        <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between">
          {igHandle ? (
            <span className="px-2.5 py-1 bg-black/75 backdrop-blur-md border border-white/10 rounded text-[11px] font-mono text-white flex items-center gap-1.5">
              <Instagram className="w-3 h-3 text-[#C8FF00]" />
              <span>{igHandle}</span>
            </span>
          ) : galleryList.length > 1 ? (
            <span className="px-2.5 py-1 bg-black/75 backdrop-blur-md border border-white/10 rounded text-[11px] font-mono text-white flex items-center gap-1.5">
              <Images className="w-3 h-3 text-[#C8FF00]" />
              <span>{galleryList.length} Visuals</span>
            </span>
          ) : (
            <span />
          )}

          <span className="w-8 h-8 rounded-full bg-black/70 border border-white/15 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:bg-[#C8FF00] group-hover:text-black transition-all">
            <ArrowUpRight className="w-3.5 h-3.5" />
          </span>
        </div>

        {/* Clean Minimal Bottom Caption */}
        <div className="absolute bottom-3 left-3.5 right-3.5 z-10">
          <div className="text-[11px] font-mono text-[#C8FF00] uppercase tracking-wider truncate">
            {project.client}
          </div>
          <h3 className="font-display text-lg font-bold text-white truncate group-hover:text-[#C8FF00] transition-colors mt-0.5">
            {project.title}
          </h3>
        </div>
      </div>
    </motion.div>
  );
};
