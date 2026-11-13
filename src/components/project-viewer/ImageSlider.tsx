import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Play, Pause, Maximize2 } from 'lucide-react';
import { ImageZoomViewer } from './ImageZoomViewer';

interface ImageSliderProps {
  images: string[];
  title: string;
}

export const ImageSlider: React.FC<ImageSliderProps> = ({ images, title }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showZoomModal, setShowZoomModal] = useState(false);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }, [images.length]);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }, [images.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prevSlide();
      if (e.key === 'ArrowRight') nextSlide();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [prevSlide, nextSlide]);

  // Auto-slide playback
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isPlaying) {
      interval = setInterval(() => {
        nextSlide();
      }, 3500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, nextSlide]);

  if (!images || images.length === 0) return null;

  return (
    <div className="relative w-full flex flex-col items-center bg-[#070707] rounded-xl overflow-hidden border border-white/10 select-none">
      {/* Main Slide Stage */}
      <div className="relative w-full h-[400px] sm:h-[540px] flex items-center justify-center p-4">
        <img
          key={currentIndex}
          src={images[currentIndex]}
          alt={`${title} - image ${currentIndex + 1}`}
          referrerPolicy="no-referrer"
          className="max-h-full max-w-full object-contain rounded-md shadow-2xl transition-all duration-300 animate-in fade-in cursor-pointer"
          onClick={() => setShowZoomModal(true)}
          title="Click to open interactive zoom"
        />

        {/* Counter & Controls Top Bar */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
          {images.length > 1 && (
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`p-2 rounded-full backdrop-blur-md border border-white/15 text-white transition-colors ${
                isPlaying ? 'bg-[#C8FF00] text-black font-bold' : 'bg-black/70 hover:text-[#C8FF00]'
              }`}
              title={isPlaying ? 'Pause Slideshow' : 'Play Slideshow'}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            </button>
          )}

          <button
            onClick={() => setShowZoomModal(true)}
            className="p-2 rounded-full bg-black/70 backdrop-blur-md border border-white/15 text-neutral-300 hover:text-white transition-colors"
            title="Interactive Zoom View"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>

          <div className="px-3 py-1 bg-black/80 backdrop-blur-md border border-white/15 rounded-full font-mono text-xs text-neutral-300">
            <span className="text-[#C8FF00] font-bold">{String(currentIndex + 1).padStart(2, '0')}</span>
            <span className="mx-1 text-neutral-600">/</span>
            <span>{String(images.length).padStart(2, '0')}</span>
          </div>
        </div>

        {/* Prev / Next Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/75 border border-white/15 text-white hover:text-black hover:bg-[#C8FF00] hover:border-[#C8FF00] flex items-center justify-center transition-all duration-200 shadow-2xl"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/75 border border-white/15 text-white hover:text-black hover:bg-[#C8FF00] hover:border-[#C8FF00] flex items-center justify-center transition-all duration-200 shadow-2xl"
              aria-label="Next image"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* Interactive Thumbnail Strip */}
      {images.length > 1 && (
        <div className="w-full bg-[#111111] border-t border-white/10 p-3 flex items-center justify-center gap-2 overflow-x-auto">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`relative w-16 h-12 rounded overflow-hidden transition-all duration-200 shrink-0 ${
                currentIndex === idx
                  ? 'ring-2 ring-[#C8FF00] scale-105 opacity-100'
                  : 'opacity-40 hover:opacity-80'
              }`}
            >
              <img
                src={img}
                alt={`Thumbnail ${idx + 1}`}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Expanded Zoom Overlay when clicked */}
      {showZoomModal && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col p-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <span className="text-xs font-mono text-[#C8FF00]">
              {title} · Slide {currentIndex + 1} of {images.length}
            </span>
            <button
              onClick={() => setShowZoomModal(false)}
              className="px-3 py-1 bg-[#C8FF00] text-black text-xs font-semibold uppercase tracking-wider rounded"
            >
              Close Zoom
            </button>
          </div>
          <div className="flex-1 mt-2">
            <ImageZoomViewer
              src={images[currentIndex]}
              alt={`${title} zoomed slide`}
            />
          </div>
        </div>
      )}
    </div>
  );
};
