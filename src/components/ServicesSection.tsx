import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SERVICES } from '../data/services';
import { ArrowUpRight, Plus, Minus, CheckCircle2, Sparkles } from 'lucide-react';

interface ServicesSectionProps {
  onSelectServiceCTA?: () => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({ onSelectServiceCTA }) => {
  const [expandedId, setExpandedId] = useState<string | null>('creative-direction');
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <section id="services" className="py-24 sm:py-32 bg-[#0c0c0c] border-b border-white/[0.08] relative">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#C8FF00] uppercase tracking-widest mb-3">
              <span>03</span>
              <span>/</span>
              <span>Capabilities & Disciplines</span>
            </div>
            <h2 className="font-display text-4xl sm:text-6xl font-black text-white tracking-tight uppercase">
              SERVICES & CRAFT.
            </h2>
            <p className="text-sm sm:text-base text-neutral-400 mt-2 max-w-xl font-light">
              Specialized creative solutions engineered for brands seeking unforgettable visual identity.
            </p>
          </div>

          <div className="text-xs font-mono text-neutral-400">
            Available for Retainers & Project Sprints
          </div>
        </div>

        {/* Editorial Accordion Index */}
        <div className="border-t border-white/[0.12] divide-y divide-white/[0.08]">
          {SERVICES.map((service) => {
            const isExpanded = expandedId === service.id;
            const isHovered = hoveredId === service.id;

            return (
              <motion.div
                key={service.id}
                onMouseEnter={() => setHoveredId(service.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => toggleExpand(service.id)}
                className={`group cursor-pointer transition-colors duration-300 py-6 sm:py-8 ${
                  isExpanded ? 'bg-white/[0.02]' : 'hover:bg-white/[0.01]'
                }`}
              >
                <div className="flex items-start sm:items-center justify-between gap-4">
                  {/* Service Number & Title */}
                  <div className="flex items-start sm:items-center gap-4 sm:gap-8 flex-1">
                    <span className={`font-mono text-xs sm:text-sm transition-colors tabular-nums mt-1 sm:mt-0 ${
                      isExpanded || isHovered ? 'text-[#C8FF00] font-bold' : 'text-neutral-500'
                    }`}>
                      {service.number}
                    </span>
                    <h3 className={`font-display text-xl sm:text-3xl font-bold tracking-tight transition-all duration-300 ${
                      isExpanded ? 'text-[#C8FF00]' : isHovered ? 'text-white translate-x-2' : 'text-neutral-300'
                    }`}>
                      {service.title}
                    </h3>
                  </div>

                  {/* Toggle Controls */}
                  <div className="shrink-0 p-2 text-neutral-400 group-hover:text-white transition-colors">
                    {isExpanded ? (
                      <Minus className="w-5 h-5 text-[#C8FF00]" />
                    ) : (
                      <Plus className="w-5 h-5" />
                    )}
                  </div>
                </div>

                {/* Collapsible Detail Panel */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="mt-6 pl-8 sm:pl-16 grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4 border-t border-white/5">
                        <div className="lg:col-span-7">
                          <p className="text-sm sm:text-base text-neutral-300 font-light leading-relaxed">
                            {service.description}
                          </p>
                        </div>

                        <div className="lg:col-span-5">
                          <span className="text-xs font-mono uppercase tracking-wider text-neutral-400 block mb-2.5 flex items-center gap-1.5">
                            <Sparkles className="w-3 h-3 text-[#C8FF00]" />
                            <span>Deliverables & Outputs:</span>
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {service.deliverables.map((deliv, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1 bg-[#171717] border border-white/10 text-xs text-neutral-300 rounded-md"
                              >
                                {deliv}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* CTA Bar */}
        <div className="mt-16 pt-8 border-t border-white/[0.08] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <p className="text-sm text-neutral-400 font-light">
            Need a tailored commission or multi-discipline scope?
          </p>
          {onSelectServiceCTA && (
            <button
              onClick={onSelectServiceCTA}
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-black bg-[#C8FF00] px-6 py-3 hover:bg-white transition-colors active:scale-[0.98]"
            >
              <span>Discuss Project Scope</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </section>
  );
};
