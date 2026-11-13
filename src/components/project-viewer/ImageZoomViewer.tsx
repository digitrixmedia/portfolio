import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Maximize2, Minimize2, Move } from 'lucide-react';

interface ImageZoomViewerProps {
  src: string;
  alt: string;
}

export const ImageZoomViewer: React.FC<ImageZoomViewerProps> = ({ src, alt }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleZoomIn = useCallback(() => setScale((prev) => Math.min(prev + 0.4, 4)), []);
  const handleZoomOut = useCallback(() => {
    setScale((prev) => {
      const next = Math.max(prev - 0.4, 1);
      if (next === 1) setPosition({ x: 0, y: 0 });
      return next;
    });
  }, []);

  const handleReset = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      handleZoomIn();
    } else {
      handleZoomOut();
    }
  };

  // Dragging support (Mouse & Touch)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale <= 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || scale <= 1) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  // Touch drag support for mobile devices
  const handleTouchStart = (e: React.TouchEvent) => {
    if (scale <= 1 || e.touches.length !== 1) return;
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({ x: touch.clientX - position.x, y: touch.clientY - position.y });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || scale <= 1 || e.touches.length !== 1) return;
    const touch = e.touches[0];
    setPosition({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y,
    });
  };

  const toggleDoubleClickZoom = () => {
    if (scale > 1) {
      handleReset();
    } else {
      setScale(2.2);
    }
  };

  const toggleContainerFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      className={`relative w-full flex flex-col items-center justify-center bg-[#050505] overflow-hidden select-none rounded-xl border border-white/10 ${
        isFullscreen ? 'h-screen w-screen p-0' : 'h-[450px] sm:h-[580px] max-h-[75vh]'
      }`}
    >
      {/* Interactive Zoom Toolbar */}
      <div className="absolute top-4 right-4 z-30 flex items-center gap-1.5 px-3 py-1.5 bg-black/85 backdrop-blur-xl border border-white/15 rounded-full shadow-2xl">
        <button
          onClick={handleZoomOut}
          disabled={scale <= 1}
          className="p-1.5 text-neutral-400 hover:text-[#C8FF00] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Zoom Out (Scroll Down)"
        >
          <ZoomOut className="w-4 h-4" />
        </button>

        <span className="text-xs font-mono font-semibold text-neutral-200 px-2 min-w-[48px] text-center">
          {Math.round(scale * 100)}%
        </span>

        <button
          onClick={handleZoomIn}
          disabled={scale >= 4}
          className="p-1.5 text-neutral-400 hover:text-[#C8FF00] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Zoom In (Scroll Up)"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        <div className="w-[1px] h-3.5 bg-neutral-700 mx-1" />

        <button
          onClick={handleReset}
          className="p-1.5 text-neutral-400 hover:text-white transition-colors"
          title="Reset View"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={toggleContainerFullscreen}
          className="p-1.5 text-neutral-400 hover:text-[#C8FF00] transition-colors"
          title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Image'}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Dynamic Hint Badge */}
      <div className="absolute bottom-4 left-4 z-20 hidden sm:flex items-center gap-2 px-3 py-1 bg-black/70 backdrop-blur-md border border-white/10 rounded-full text-[11px] font-mono text-neutral-400 pointer-events-none">
        <Move className="w-3 h-3 text-[#C8FF00]" />
        <span>Double-click or scroll wheel to zoom · Drag to pan</span>
      </div>

      {/* Image Stage */}
      <div
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleMouseUp}
        onDoubleClick={toggleDoubleClickZoom}
        className={`w-full h-full flex items-center justify-center p-4 ${
          scale > 1 ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-zoom-in'
        }`}
      >
        <img
          src={src}
          alt={alt}
          referrerPolicy="no-referrer"
          draggable={false}
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transition: isDragging ? 'none' : 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
          className="max-h-[90%] max-w-[90%] object-contain pointer-events-none drop-shadow-2xl rounded"
        />
      </div>
    </div>
  );
};
