import React from 'react';
import { motion } from 'motion/react';
import { ArrowDown, ArrowUpRight, Play, Sparkles } from 'lucide-react';
import { usePortfolio } from '../contexts/PortfolioContext';

interface HeroSectionProps {
  onExploreWork: () => void;
  onContactClick: () => void;
  onOpenShowreel?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onExploreWork,
  onContactClick,
  onOpenShowreel,
}) => {
  const { websiteSettings, profileSettings } = usePortfolio();

  const headingWords = (websiteSettings.heroHeading || 'I MAKE BRANDS IMPOSSIBLE TO IGNORE.').trim();

  return (
    <section id="home" className="relative min-h-screen flex flex-col justify-between pt-28 pb-12 overflow-hidden bg-[#080808] bg-noise">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 -right-32 w-96 h-96 bg-[#C8FF00]/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-10 -left-32 w-96 h-96 bg-[#1a1a1a] rounded-full blur-[140px] pointer-events-none" />
      
      {/* Subtle architectural grid lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Main Hero Container */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 w-full flex-1 flex flex-col justify-center my-auto z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Expressive Statement & CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 flex flex-col items-start"
          >
            {/* Top Indicator */}
            <div className="flex items-center gap-3 text-xs text-neutral-400 mb-8 uppercase tracking-widest font-mono">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent"></span>
              </span>
              <span>Digitrix Media · {profileSettings.name}</span>
              <span className="text-neutral-600">/</span>
              <span className="text-neutral-300">{websiteSettings.availabilityText}</span>
            </div>

            {/* Main Headline */}
            {headingWords === 'I MAKE BRANDS IMPOSSIBLE TO IGNORE.' ? (
              <h1 className="font-display text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight leading-[0.92] text-white uppercase text-balance mb-8">
                I MAKE BRANDS<br />
                <span className="text-white hover:text-accent transition-colors duration-300">
                  IMPOSSIBLE
                </span><br />
                <span className="text-gradient-lime">TO IGNORE.</span>
              </h1>
            ) : (
              <h1 className="font-display text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight leading-[0.95] text-white uppercase text-balance mb-8">
                {headingWords}
              </h1>
            )}

            {/* Supporting Copy */}
            <p className="text-base sm:text-xl text-neutral-400 font-light max-w-xl leading-relaxed mb-10">
              {websiteSettings.heroSubheading}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
              <button
                onClick={onExploreWork}
                className="w-full sm:w-auto px-8 py-4 bg-accent text-black font-semibold text-xs uppercase tracking-widest hover:bg-white transition-all duration-300 flex items-center justify-center gap-2.5 group active:scale-[0.98] shadow-lg"
              >
                <span>Explore My Work</span>
                <ArrowDown className="w-4 h-4 transition-transform duration-200 group-hover:translate-y-1" />
              </button>

              <button
                onClick={onContactClick}
                className="w-full sm:w-auto px-8 py-4 bg-[#121212] text-white border border-white/15 font-semibold text-xs uppercase tracking-widest hover:border-accent hover:text-accent transition-all duration-300 flex items-center justify-center gap-2 group active:scale-[0.98]"
              >
                <span>Let's Collaborate</span>
                <ArrowUpRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </button>
            </div>
          </motion.div>

          {/* Right Column: Visual Composition Stage */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 relative w-full flex items-center justify-center"
          >
            <div className="relative w-full max-w-md lg:max-w-none aspect-[4/5] rounded-2xl overflow-hidden border border-white/15 shadow-2xl bg-[#111111] group">
              <img
                src="/src/assets/images/hero_abstract_monolith_1794334284408.jpg"
                alt="Digitrix Media Abstract Digital Monolith"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none" />

              <div className="absolute top-5 right-5 p-3 bg-black/70 backdrop-blur-md border border-white/10 rounded-xl flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-accent" />
                <span className="text-[11px] font-mono font-medium text-white uppercase tracking-wider">
                  2026 Edition
                </span>
              </div>

              <div className="absolute bottom-6 left-6 right-6 flex flex-col gap-3">
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-widest text-accent block mb-1">
                    Featured Direction Reel
                  </span>
                  <h3 className="font-display text-xl font-bold text-white tracking-tight">
                    Metropolis Nocturne & Anamorphic Visuals
                  </h3>
                </div>

                {onOpenShowreel && (
                  <button
                    onClick={onOpenShowreel}
                    className="w-full py-3 px-4 bg-white/10 hover:bg-accent hover:text-black text-white border border-white/20 hover:border-accent transition-all duration-300 rounded-lg flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-wider backdrop-blur-md"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Watch Showreel</span>
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Marquee Ticker Divider */}
      <div className="w-full border-y border-white/[0.08] bg-[#0c0c0c] py-3 mt-12 overflow-hidden select-none">
        <div className="flex items-center gap-8 text-xs font-mono tracking-widest uppercase text-neutral-400 whitespace-nowrap animate-marquee">
          <span>Digital Marketing</span>
          <span className="text-accent">·</span>
          <span>Graphic Design</span>
          <span className="text-accent">·</span>
          <span>Video Production</span>
          <span className="text-accent">·</span>
          <span>Cinematography</span>
          <span className="text-accent">·</span>
          <span>Reel Creation</span>
          <span className="text-accent">·</span>
          <span>Website Design</span>
          <span className="text-accent">·</span>
          <span>Creative Direction</span>
          <span className="text-accent">·</span>
          <span>AI Specialist</span>
          <span className="text-accent">·</span>
          <span>Digital Marketing</span>
          <span className="text-accent">·</span>
          <span>Graphic Design</span>
          <span className="text-accent">·</span>
          <span>Cinematography</span>
        </div>
      </div>
    </section>
  );
};
