import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Film,
  Image as ImageIcon,
  Globe,
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Project } from '../types/portfolio';
import { PortfolioCard } from './PortfolioCard';

interface PortfolioSectionProps {
  projects: Project[];
  onSelectProject: (project: Project, initialVideoIndex?: number) => void;
}

type FormatTab = 'all' | 'videos' | 'images' | 'websites';

interface VideoCardEntry {
  key: string;
  project: Project;
  videoUrl: string;
  videoIndex: number;
  totalVideos: number;
}

function seededShuffle<T>(items: T[], seed: number): T[] {
  const arr = [...items];
  let s = seed;
  for (let i = arr.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) % 4294967296;
    const j = Math.floor((s / 4294967296) * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export const PortfolioSection: React.FC<PortfolioSectionProps> = ({
  projects,
  onSelectProject,
}) => {
  const [activeTab, setActiveTab] = useState<FormatTab>('all');
  const [shuffleSeed] = useState(() => Math.floor(Math.random() * 1000000) + 1);
  const videoSliderRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const { videoEntries, imageProjects, websiteProjects } = useMemo(() => {
    const rawVideos: VideoCardEntry[] = [];
    const images: Project[] = [];
    const websites: Project[] = [];

    projects.forEach((p) => {
      const urls = (
        p.videoUrls && p.videoUrls.length > 0
          ? p.videoUrls
          : p.videoUrl
          ? [p.videoUrl]
          : p.projectType === 'video' && p.mediaUrl
          ? [p.mediaUrl]
          : []
      ).filter(Boolean);

      if (p.projectType === 'website') {
        websites.push(p);
      } else if (p.projectType === 'video') {
        if (urls.length > 0) {
          urls.forEach((url, idx) => {
            rawVideos.push({
              key: `${p.id}-v-${idx}`,
              project: p,
              videoUrl: url,
              videoIndex: idx,
              totalVideos: urls.length,
            });
          });
        } else {
          rawVideos.push({
            key: `${p.id}-v-0`,
            project: p,
            videoUrl: '',
            videoIndex: 0,
            totalVideos: 0,
          });
        }
      } else {
        images.push(p);
        if (urls.length > 0) {
          urls.forEach((url, idx) => {
            rawVideos.push({
              key: `${p.id}-v-${idx}`,
              project: p,
              videoUrl: url,
              videoIndex: idx,
              totalVideos: urls.length,
            });
          });
        }
      }
    });

    return {
      videoEntries: seededShuffle(rawVideos, shuffleSeed),
      imageProjects: images,
      websiteProjects: websites,
    };
  }, [projects, shuffleSeed]);

  const updateSliderControls = useCallback(() => {
    const el = videoSliderRef.current;
    if (!el) {
      setCanScrollLeft(false);
      setCanScrollRight(false);
      return;
    }
    setCanScrollLeft(el.scrollLeft > 8);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  }, []);

  useEffect(() => {
    const timer = setTimeout(updateSliderControls, 120);
    window.addEventListener('resize', updateSliderControls);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateSliderControls);
    };
  }, [videoEntries.length, activeTab, updateSliderControls]);

  const slideVideos = (direction: -1 | 1) => {
    const el = videoSliderRef.current;
    if (!el) return;
    const step = Math.max(300, Math.round(el.clientWidth * 0.75));
    el.scrollBy({ left: step * direction, behavior: 'smooth' });
  };

  const tabs: {
    id: FormatTab;
    label: string;
    count: number;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    { id: 'all', label: 'All Work', count: projects.length, icon: LayoutGrid },
    { id: 'videos', label: 'Reels & Videos', count: videoEntries.length, icon: Film },
    { id: 'images', label: 'Images & Creatives', count: imageProjects.length, icon: ImageIcon },
    { id: 'websites', label: 'Websites', count: websiteProjects.length, icon: Globe },
  ];

  const showVideosSection =
    (activeTab === 'all' && videoEntries.length > 0) || activeTab === 'videos';
  const showImagesSection =
    (activeTab === 'all' && imageProjects.length > 0) || activeTab === 'images';
  const showWebsitesSection =
    (activeTab === 'all' && websiteProjects.length > 0) || activeTab === 'websites';

  return (
    <section
      id="work"
      className="py-24 sm:py-32 bg-[#080808] border-b border-white/[0.08] relative"
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        {/* Clean Editorial Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10 pb-8 border-b border-white/[0.08]">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-accent uppercase tracking-widest mb-3">
              <span>02</span>
              <span>/</span>
              <span>Selected Portfolio</span>
            </div>
            <h2 className="font-display text-4xl sm:text-6xl font-black text-white tracking-tight uppercase">
              SELECTED WORK.
            </h2>
            <p className="text-sm sm:text-base text-neutral-400 mt-2 max-w-xl font-light">
              Direct visuals organized by medium — hover reels to play with sound, slide right for more videos, or click any card for details.
            </p>
          </div>

          {/* Clean 4-Tab Format Switcher */}
          <div className="flex flex-wrap items-center gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2.5 text-xs uppercase tracking-wider font-semibold transition-all duration-200 flex items-center gap-2 rounded-lg ${
                    isActive
                      ? 'bg-accent text-black font-bold shadow-lg'
                      : 'bg-[#121212] text-neutral-400 hover:text-white border border-white/[0.08]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                      isActive ? 'bg-black/20 text-black' : 'bg-white/10 text-neutral-400'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Clean Separated Visual Sections */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="space-y-16"
          >
            {/* 1. REELS & VIDEOS (Randomized Horizontal Slider) */}
            {showVideosSection && (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] pb-3">
                  <div className="flex items-center gap-2.5">
                    <Film className="w-4 h-4 text-accent" />
                    <h3 className="font-display text-xl sm:text-2xl font-bold text-white tracking-tight">
                      Reels & Videos
                    </h3>
                    <span className="text-xs font-mono text-neutral-500">
                      ({videoEntries.length})
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-neutral-500 hidden sm:inline">
                      Hover to play with audio · Slide right for more
                    </span>
                    {videoEntries.length > 1 && (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => slideVideos(-1)}
                          disabled={!canScrollLeft}
                          className="p-2 rounded-lg bg-[#121212] border border-white/10 text-white hover:border-[#C8FF00] hover:text-[#C8FF00] disabled:opacity-30 disabled:pointer-events-none transition-colors"
                          aria-label="Slide videos left"
                          title="Previous Videos"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => slideVideos(1)}
                          disabled={!canScrollRight}
                          className="p-2 rounded-lg bg-[#121212] border border-white/10 text-white hover:border-[#C8FF00] hover:text-[#C8FF00] disabled:opacity-30 disabled:pointer-events-none transition-colors"
                          aria-label="Slide videos right"
                          title="Slide Right for More Videos"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {videoEntries.length === 0 ? (
                  <div className="py-14 px-6 text-center border border-dashed border-white/10 rounded-xl bg-[#0c0c0c]">
                    <p className="text-sm text-neutral-300">
                      No reels or video projects uploaded yet.
                    </p>
                    <p className="text-xs text-neutral-500 mt-1">
                      Upload 9:16 Reels or MP4 videos in your Admin Dashboard to showcase hover playback here.
                    </p>
                  </div>
                ) : (
                  <div className="relative">
                    <div
                      ref={videoSliderRef}
                      onScroll={updateSliderControls}
                      className="flex gap-5 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-4 items-start"
                    >
                      {videoEntries.map((entry) => {
                        const isVert = Boolean(
                          entry.project.isVerticalReel ||
                            entry.project.videoAspect === '9:16'
                        );
                        return (
                          <PortfolioCard
                            key={entry.key}
                            project={entry.project}
                            variant="video"
                            overrideVideoUrl={entry.videoUrl}
                            videoIndexLabel={
                              entry.totalVideos > 1
                                ? `#${entry.videoIndex + 1}`
                                : undefined
                            }
                            className={
                              isVert
                                ? 'w-[240px] sm:w-[270px] shrink-0 snap-start'
                                : 'w-[300px] sm:w-[360px] shrink-0 snap-start'
                            }
                            onClick={() =>
                              onSelectProject(entry.project, entry.videoIndex)
                            }
                          />
                        );
                      })}
                    </div>

                    {canScrollRight && (
                      <button
                        type="button"
                        onClick={() => slideVideos(1)}
                        className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/85 border border-white/20 text-[#C8FF00] hover:bg-[#C8FF00] hover:text-black items-center justify-center shadow-2xl transition-colors"
                        aria-label="Slide right for more videos"
                        title="More Videos →"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 2. IMAGES & SOCIAL CREATIVES */}
            {showImagesSection && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                  <div className="flex items-center gap-2.5">
                    <ImageIcon className="w-4 h-4 text-accent" />
                    <h3 className="font-display text-xl sm:text-2xl font-bold text-white tracking-tight">
                      Images & Brand Creatives
                    </h3>
                  </div>
                  <span className="text-xs font-mono text-neutral-500">
                    {imageProjects.length} {imageProjects.length === 1 ? 'Collection' : 'Collections'}
                  </span>
                </div>

                {imageProjects.length === 0 ? (
                  <div className="py-14 px-6 text-center border border-dashed border-white/10 rounded-xl bg-[#0c0c0c]">
                    <p className="text-sm text-neutral-400">No image showcases available yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {imageProjects.map((project) => (
                      <PortfolioCard
                        key={`${project.id}-image`}
                        project={project}
                        variant="image"
                        onClick={() => onSelectProject(project)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 3. WEBSITES (Browser Preview Cards) */}
            {showWebsitesSection && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                  <div className="flex items-center gap-2.5">
                    <Globe className="w-4 h-4 text-accent" />
                    <h3 className="font-display text-xl sm:text-2xl font-bold text-white tracking-tight">
                      Websites Designed & Managed
                    </h3>
                  </div>
                  <span className="text-xs font-mono text-neutral-500">
                    Click card for interactive desktop/mobile preview
                  </span>
                </div>

                {websiteProjects.length === 0 ? (
                  <div className="py-14 px-6 text-center border border-dashed border-white/10 rounded-xl bg-[#0c0c0c]">
                    <p className="text-sm text-neutral-400">No websites listed yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {websiteProjects.map((project) => (
                      <PortfolioCard
                        key={project.id}
                        project={project}
                        variant="website"
                        onClick={() => onSelectProject(project)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};
