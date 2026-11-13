import React, { useState } from 'react';
import { ArrowUpRight, Sparkles, X, Wrench } from 'lucide-react';
import { usePortfolio } from '../contexts/PortfolioContext';

export const AboutSection: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const { profileSettings } = usePortfolio();

  const capabilities = [
    'Creative & Visual Direction',
    'Cinematography & 4K Camera Operation',
    'High-Retention 9:16 Reel Architecture',
    'Brand Identity & Bespoke Typography',
    'Interactive Website Design (Figma to Code)',
    'Digital & Performance Marketing Systems',
    'Post-Production & DaVinci Color Grading',
    'Generative AI Creative Workflows'
  ];

  const stats = [
    { label: 'Focus Disciplines', value: '06+', sub: 'Design, Film, Web, AI' },
    { label: 'Media Formats', value: '04', sub: 'Image, Reel, Web, Gallery' },
    { label: 'Production Workflow', value: '04-Step', sub: 'Discover to Deliver' },
    { label: 'Availability', value: 'Open', sub: 'Select Commissions' }
  ];

  const tools = [
    { name: 'DaVinci Resolve Studio', role: 'Color Grading & Finishing' },
    { name: 'Adobe Premiere Pro', role: 'Editorial & Pacing' },
    { name: 'Adobe After Effects', role: 'Motion Design & VFX' },
    { name: 'Figma', role: 'UI/UX & Design Systems' },
    { name: 'Cinema 4D / Blender', role: '3D Assets & Spatial Art' },
    { name: 'React & Tailwind CSS', role: 'Web Production & Interactions' },
    { name: 'Generative AI Suite', role: 'Concept Prototyping' },
    { name: 'Adobe Photoshop / Illustrator', role: 'Graphic & Brand Identity' }
  ];

  return (
    <section id="about" className="py-24 sm:py-32 bg-[#0c0c0c] border-b border-white/[0.08] relative">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        
        {/* Section Header */}
        <div className="mb-16">
          <div className="flex items-center gap-2 text-xs font-mono text-accent uppercase tracking-widest mb-3">
            <span>01</span>
            <span>/</span>
            <span>About {profileSettings.name}</span>
          </div>
          <h2 className="font-display text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight uppercase">
            CREATIVITY MEETS STRATEGY.
          </h2>
        </div>

        {/* Content Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Left Column: Portrait & Quick Credentials */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="relative aspect-square sm:aspect-[4/5] rounded-2xl overflow-hidden border border-white/10 bg-[#141414] shadow-2xl group">
              <img
                src={profileSettings.profileImage || '/src/assets/images/shubh_director_portrait_1794330940557.jpg'}
                alt={`${profileSettings.name} - Creative Director at Digitrix Media`}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover grayscale contrast-110 group-hover:grayscale-0 transition-all duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent pointer-events-none" />
              
              <div className="absolute bottom-6 left-6 right-6">
                <span className="font-display text-xl font-bold text-white block">
                  {profileSettings.name}
                </span>
                <span className="text-xs text-accent font-mono tracking-wider uppercase mt-0.5 block">
                  {profileSettings.professionalTitle}
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Narrative, Capabilities & Stats */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            <div className="space-y-6">
              <p className="text-lg sm:text-2xl text-neutral-200 font-light leading-relaxed whitespace-pre-line">
                {profileSettings.bio}
              </p>

              {/* Capabilities List */}
              <div className="pt-6">
                <h4 className="text-xs font-mono uppercase tracking-widest text-neutral-300 mb-4 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-accent" />
                  <span>Core Creative Capabilities</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-neutral-300">
                  {capabilities.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2.5">
                      <span className="w-1.5 h-1.5 bg-accent shrink-0" />
                      <span className="truncate">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Overview Indicators */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-10 mt-10 border-t border-white/10">
              {stats.map((s, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="font-display text-2xl sm:text-3xl font-bold text-white font-mono-nums">
                    {s.value}
                  </div>
                  <div className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                    {s.label}
                  </div>
                  <div className="text-[11px] text-neutral-500">
                    {s.sub}
                  </div>
                </div>
              ))}
            </div>

            {/* Interaction Button */}
            <div className="pt-8">
              <button
                onClick={() => setModalOpen(true)}
                className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-accent hover:text-white transition-colors group"
              >
                <span>More About Me & Production Toolkit</span>
                <ArrowUpRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded 'More About Me' Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-xl animate-in fade-in duration-200"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="relative w-full max-w-3xl max-h-[85vh] bg-[#111111] border border-white/10 rounded-2xl p-6 sm:p-8 overflow-y-auto text-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-accent" />
                <h3 className="font-display text-xl font-bold text-white">
                  About {profileSettings.name} · Creative Vision
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-6 space-y-8 text-neutral-300 text-sm leading-relaxed">
              <div>
                <h4 className="font-display text-base font-bold text-white uppercase tracking-wider mb-2">
                  Creative Philosophy
                </h4>
                <p>
                  Every piece of content must have an undeniable reason to exist. In an attention-scarce digital landscape, generic aesthetics get ignored. By combining bold visual direction, rhythmic editing, memorable brand hooks, and strategic marketing insight, brands stand out effortlessly.
                </p>
              </div>

              <div>
                <h4 className="font-display text-base font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-accent" />
                  <span>Production & Software Toolkit</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {tools.map((t, idx) => (
                    <div key={idx} className="p-3 bg-[#171717] rounded-lg border border-white/5">
                      <div className="font-semibold text-white">{t.name}</div>
                      <div className="text-xs text-neutral-400 mt-0.5">{t.role}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-white/10 flex justify-end">
              <button
                onClick={() => setModalOpen(false)}
                className="px-5 py-2 bg-accent text-black font-semibold text-xs uppercase tracking-wider hover:bg-white transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
