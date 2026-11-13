import React, { useState } from 'react';
import { PROCESS_STEPS } from '../data/process';
import { CheckCircle2, ArrowRight } from 'lucide-react';

export const ProcessSection: React.FC = () => {
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  return (
    <section id="process" className="py-24 sm:py-32 bg-[#080808] border-b border-white/[0.08]">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#C8FF00] uppercase tracking-widest mb-3">
              <span>04</span>
              <span>/</span>
              <span>Creative Methodology</span>
            </div>
            <h2 className="font-display text-4xl sm:text-6xl font-black text-white tracking-tight uppercase">
              THE PROCESS.
            </h2>
            <p className="text-sm sm:text-base text-neutral-400 mt-2 max-w-xl font-light">
              A deliberate 4-step framework turning raw ambition into indelible creative work.
            </p>
          </div>

          <div className="text-xs font-mono text-neutral-400">
            Sprint Duration: 2 to 6 Weeks
          </div>
        </div>

        {/* Desktop Horizontal Interactive Timeline */}
        <div className="hidden lg:block mb-12">
          {/* Timeline Bar */}
          <div className="relative mb-8">
            <div className="h-[2px] bg-neutral-800 w-full absolute top-1/2 -translate-y-1/2 z-0" />
            <div
              className="h-[2px] bg-[#C8FF00] absolute top-1/2 -translate-y-1/2 transition-all duration-500 z-0"
              style={{ width: `${(activeStepIndex / (PROCESS_STEPS.length - 1)) * 100}%` }}
            />

            <div className="relative z-10 flex justify-between">
              {PROCESS_STEPS.map((step, idx) => {
                const isActive = activeStepIndex === idx;
                const isPassed = activeStepIndex >= idx;

                return (
                  <button
                    key={step.number}
                    onClick={() => setActiveStepIndex(idx)}
                    className="group flex flex-col items-center focus:outline-none"
                  >
                    <div
                      className={`w-12 h-12 flex items-center justify-center font-mono text-sm font-bold transition-all duration-300 rounded-none border ${
                        isActive
                          ? 'bg-[#C8FF00] text-black border-[#C8FF00] scale-110 shadow-lg'
                          : isPassed
                          ? 'bg-[#141414] text-[#C8FF00] border-[#C8FF00]'
                          : 'bg-[#111111] text-neutral-500 border-neutral-800 hover:border-neutral-600'
                      }`}
                    >
                      {step.number}
                    </div>
                    <span
                      className={`mt-3 text-xs font-semibold uppercase tracking-wider transition-colors ${
                        isActive ? 'text-[#C8FF00]' : 'text-neutral-400 group-hover:text-white'
                      }`}
                    >
                      {step.title}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Step Showcase Card */}
          <div className="bg-[#111111] border border-white/10 rounded-2xl p-8 sm:p-10 transition-all duration-300">
            <div className="grid grid-cols-12 gap-8 items-start">
              <div className="col-span-5">
                <span className="font-mono text-sm text-[#C8FF00] uppercase tracking-widest block mb-2">
                  Phase {PROCESS_STEPS[activeStepIndex].number}
                </span>
                <h3 className="font-display text-3xl font-black text-white uppercase tracking-tight mb-4">
                  {PROCESS_STEPS[activeStepIndex].title}
                </h3>
                <p className="text-base text-neutral-300 font-light leading-relaxed">
                  {PROCESS_STEPS[activeStepIndex].description}
                </p>
              </div>

              <div className="col-span-7 border-l border-white/10 pl-8 space-y-4">
                <span className="text-xs font-mono uppercase tracking-wider text-neutral-400 block mb-2">
                  Key Milestones & Focus:
                </span>
                {PROCESS_STEPS[activeStepIndex].details.map((detail, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-sm text-neutral-300">
                    <CheckCircle2 className="w-4 h-4 text-[#C8FF00] shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{detail}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Vertical Timeline */}
        <div className="lg:hidden space-y-6">
          {PROCESS_STEPS.map((step, idx) => (
            <div
              key={step.number}
              className="bg-[#111111] border border-white/10 rounded-xl p-6"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="font-mono text-xs px-2 py-0.5 bg-[#C8FF00] text-black font-bold">
                  {step.number}
                </span>
                <h3 className="font-display text-xl font-bold text-white uppercase">
                  {step.title}
                </h3>
              </div>
              <p className="text-sm text-neutral-300 font-light mb-4 leading-relaxed">
                {step.description}
              </p>
              <div className="space-y-2 border-t border-white/5 pt-3">
                {step.details.map((detail, dIdx) => (
                  <div key={dIdx} className="flex items-start gap-2 text-xs text-neutral-400">
                    <span className="w-1.5 h-1.5 bg-[#C8FF00] mt-1 shrink-0" />
                    <span>{detail}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
