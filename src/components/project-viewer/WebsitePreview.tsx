import React, { useState, useEffect } from 'react';
import {
  Monitor,
  Tablet,
  Smartphone,
  ExternalLink,
  RotateCw,
  ShieldCheck,
  ImageIcon,
} from 'lucide-react';

interface WebsitePreviewProps {
  url: string;
  title: string;
  screenshotFallback: string;
}

type DeviceMode = 'desktop' | 'tablet' | 'mobile';

export const WebsitePreview: React.FC<WebsitePreviewProps> = ({
  url,
  title,
  screenshotFallback,
}) => {
  const [device, setDevice] = useState<DeviceMode>('desktop');
  const [iframeKey, setIframeKey] = useState(0);
  const [useFallback, setUseFallback] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showFrameHint, setShowFrameHint] = useState(false);

  useEffect(() => {
    setUseFallback(false);
    setIsLoading(true);
    setShowFrameHint(false);
    setIframeKey((prev) => prev + 1);
  }, [url]);

  useEffect(() => {
    if (useFallback) return;
    const timer = setTimeout(() => {
      setIsLoading(false);
      setShowFrameHint(true);
    }, 3500);
    return () => clearTimeout(timer);
  }, [iframeKey, useFallback]);

  const deviceWidthClasses: Record<DeviceMode, string> = {
    desktop: 'w-full max-w-full h-[540px] sm:h-[620px]',
    tablet: 'w-[768px] max-w-full h-[580px] sm:h-[620px] rounded-2xl border-4 border-[#222]',
    mobile: 'w-[375px] max-w-full h-[580px] sm:h-[620px] rounded-[36px] border-[6px] border-[#222]',
  };

  const reloadIframe = () => {
    setIsLoading(true);
    setShowFrameHint(false);
    setIframeKey((prev) => prev + 1);
  };

  return (
    <div className="flex flex-col items-center w-full bg-[#0a0a0a] rounded-xl border border-white/10 overflow-hidden shadow-2xl">
      {/* Browser Address & Control Bar */}
      <div className="w-full bg-[#141414] border-b border-white/10 px-4 py-3 flex items-center justify-between gap-4 select-none">
        {/* Window controls & Refresh */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#ff5f56] inline-block" />
            <span className="w-3 h-3 rounded-full bg-[#ffbd2e] inline-block" />
            <span className="w-3 h-3 rounded-full bg-[#27c93f] inline-block" />
          </div>

          <div className="hidden sm:flex items-center gap-1 text-neutral-400">
            <button
              onClick={reloadIframe}
              className="p-1.5 hover:text-[#C8FF00] transition-colors rounded hover:bg-white/5"
              title="Refresh Page"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Center: Address Bar */}
        <div className="flex-1 max-w-xl mx-auto bg-[#0a0a0a] border border-white/10 rounded-lg px-3.5 py-1.5 flex items-center justify-between text-xs text-neutral-400">
          <div className="flex items-center gap-2 truncate">
            <ShieldCheck className="w-3.5 h-3.5 text-[#27c93f] shrink-0" />
            <span className="truncate font-mono text-[11px] text-neutral-200">
              {url}
            </span>
          </div>
          <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider ml-2 shrink-0">
            HTTPS
          </span>
        </div>

        {/* Right: Responsive Mode Selector & Live Launch */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Viewport Modes */}
          <div className="flex items-center bg-[#0a0a0a] border border-white/10 rounded-lg p-0.5">
            <button
              onClick={() => setDevice('desktop')}
              className={`p-1.5 rounded transition-colors ${
                device === 'desktop' ? 'bg-[#C8FF00] text-black font-bold' : 'text-neutral-400 hover:text-white'
              }`}
              title="Desktop Viewport (100%)"
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setDevice('tablet')}
              className={`p-1.5 rounded transition-colors ${
                device === 'tablet' ? 'bg-[#C8FF00] text-black font-bold' : 'text-neutral-400 hover:text-white'
              }`}
              title="Tablet Viewport (768px)"
            >
              <Tablet className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setDevice('mobile')}
              className={`p-1.5 rounded transition-colors ${
                device === 'mobile' ? 'bg-[#C8FF00] text-black font-bold' : 'text-neutral-400 hover:text-white'
              }`}
              title="Mobile Viewport (375px)"
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Switch between Live Iframe & Screenshot */}
          <button
            onClick={() => setUseFallback(!useFallback)}
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-mono border border-white/10 rounded-lg hover:border-[#C8FF00] text-neutral-300 hover:text-[#C8FF00] transition-colors"
            title="Toggle Live Iframe / Screenshot Mode"
          >
            {useFallback ? (
              <>
                <Monitor className="w-3 h-3" />
                <span>Live Frame</span>
              </>
            ) : (
              <>
                <ImageIcon className="w-3 h-3" />
                <span>Screenshot</span>
              </>
            )}
          </button>

          {/* Launch Live Site */}
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#C8FF00] text-black text-xs font-semibold uppercase tracking-wider rounded-lg hover:bg-white transition-colors shadow-md"
          >
            <span>Live Site</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Frame Viewport Area */}
      <div className="w-full flex-1 flex justify-center bg-[#070707] p-3 sm:p-6 overflow-auto">
        <div
          className={`transition-all duration-300 bg-white shadow-2xl relative overflow-hidden ${deviceWidthClasses[device]}`}
        >
          {useFallback ? (
            /* Screenshot Fallback Screen */
            <div className="w-full h-full flex flex-col bg-[#111111] text-white overflow-y-auto">
              <div className="p-6 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#141414]">
                <div>
                  <h4 className="font-display text-lg font-bold text-white">{title}</h4>
                  <p className="text-xs text-neutral-400 mt-1 font-light">
                    Production preview mode. Click to open the live site in a new browser tab.
                  </p>
                </div>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#C8FF00] text-black font-semibold text-xs uppercase tracking-wider hover:bg-white transition-colors shrink-0"
                >
                  <span>Open Live Website</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
              <div className="p-4 flex-1 flex items-center justify-center bg-[#0a0a0a]">
                {screenshotFallback ? (
                  <img
                    src={screenshotFallback}
                    alt={`${title} website preview`}
                    referrerPolicy="no-referrer"
                    className="max-h-[500px] w-full object-contain rounded border border-white/10 shadow-xl"
                  />
                ) : (
                  <div className="text-center py-16 px-6 space-y-3 border border-white/10 rounded-xl bg-[#111111] max-w-md w-full">
                    <Monitor className="w-8 h-8 text-[#C8FF00] mx-auto" />
                    <div className="font-display text-lg font-bold text-white">{title}</div>
                    <div className="text-xs font-mono text-neutral-400 break-all">{url}</div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Live Responsive Iframe */
            <div className="relative w-full h-full bg-[#111111]">
              <iframe
                key={iframeKey}
                src={url}
                title={title}
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                onLoad={() => setIsLoading(false)}
                className="w-full h-full border-0 bg-white"
              />
              {/* Helpful Switch & External Link Bar */}
              <div
                className={`absolute bottom-3 right-3 bg-black/90 backdrop-blur-md border border-white/15 text-neutral-300 text-[11px] px-3.5 py-2 rounded-lg flex flex-wrap items-center gap-2.5 pointer-events-auto shadow-xl transition-opacity ${
                  showFrameHint || !isLoading ? 'opacity-100' : 'opacity-70'
                }`}
              >
                <span className="text-neutral-400">Site not rendering in frame?</span>
                <button
                  onClick={() => setUseFallback(true)}
                  className="text-[#C8FF00] font-semibold underline hover:text-white"
                >
                  View Preview Card
                </button>
                <span className="text-neutral-600">|</span>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white font-semibold underline hover:text-[#C8FF00]"
                >
                  Open Live Site ↗
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
