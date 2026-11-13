import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  RotateCcw,
  Repeat,
  Settings,
  Smartphone,
  Tv,
  ExternalLink,
  Instagram,
  ChevronLeft,
  ChevronRight,
  Film,
} from 'lucide-react';

interface VideoPlayerProps {
  src: string;
  sources?: string[];
  initialIndex?: number;
  poster?: string;
  title: string;
  isVertical?: boolean;
}

function getExternalEmbedInfo(url: string): {
  type: 'youtube' | 'instagram' | 'native';
  embedUrl?: string;
  isShort?: boolean;
} {
  if (!url) return { type: 'native' };
  const trimmed = url.trim();

  // YouTube (standard watch, youtu.be, shorts)
  const ytWatch = trimmed.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{6,})/);
  if (ytWatch?.[1]) {
    return {
      type: 'youtube',
      embedUrl: `https://www.youtube.com/embed/${ytWatch[1]}?rel=0`,
      isShort: false,
    };
  }
  const ytShort = trimmed.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{6,})/);
  if (ytShort?.[1]) {
    return {
      type: 'youtube',
      embedUrl: `https://www.youtube.com/embed/${ytShort[1]}?rel=0`,
      isShort: true,
    };
  }

  // Instagram individual Reel or Post
  const igMatch = trimmed.match(/instagram\.com\/(reel|reels|p)\/([a-zA-Z0-9_-]+)/);
  if (igMatch?.[2]) {
    const kind = igMatch[1] === 'p' ? 'p' : 'reel';
    return {
      type: 'instagram',
      embedUrl: `https://www.instagram.com/${kind}/${igMatch[2]}/embed`,
      isShort: kind === 'reel',
    };
  }

  return { type: 'native' };
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  sources,
  initialIndex = 0,
  poster,
  title,
  isVertical = false,
}) => {
  const videoList = React.useMemo(() => {
    const combined = sources && sources.length > 0 ? sources : src ? [src] : [];
    return combined.filter(Boolean);
  }, [sources, src]);

  const clampedInitial = Math.max(0, Math.min(initialIndex, Math.max(0, videoList.length - 1)));
  const [activeIndex, setActiveIndex] = useState(clampedInitial);
  const activeSrc = videoList[activeIndex] || videoList[0] || '';
  const embedInfo = getExternalEmbedInfo(activeSrc);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [volume, setVolume] = useState(0.8);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isLooping, setIsLooping] = useState(true);
  const [forceVerticalFit, setForceVerticalFit] = useState(
    isVertical || Boolean(embedInfo.isShort)
  );
  const controlsTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setActiveIndex(Math.max(0, Math.min(initialIndex, Math.max(0, videoList.length - 1))));
  }, [title, sources, src, initialIndex, videoList.length]);

  useEffect(() => {
    setForceVerticalFit(isVertical || Boolean(embedInfo.isShort));
    setCurrentTime(0);
    setDuration(0);
  }, [activeSrc, isVertical, embedInfo.isShort]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || embedInfo.type !== 'native') return;

    video.loop = isLooping;

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    const handleEnded = () => {
      if (!isLooping) setIsPlaying(false);
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
    };
  }, [isLooping, embedInfo.type]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const nextMuted = !isMuted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
      setIsMuted(val === 0);
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      containerRef.current.requestFullscreen().catch(() => {});
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeout.current) clearTimeout(controlsTimeout.current);
    controlsTimeout.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  };

  if (videoList.length === 0) {
    return (
      <div className="w-full py-16 px-6 text-center bg-[#0b0b0b] border border-white/10 rounded-xl space-y-2">
        <Film className="w-8 h-8 text-neutral-600 mx-auto" />
        <p className="text-sm text-neutral-300">No video uploaded for this project yet.</p>
      </div>
    );
  }

  const playlistBar = videoList.length > 1 && (
    <div className="w-full max-w-2xl mx-auto mb-3 flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-[#121212] border border-white/10 rounded-xl">
      <div className="flex items-center gap-2 text-xs font-mono text-neutral-300">
        <Film className="w-3.5 h-3.5 text-[#C8FF00]" />
        <span>
          Video {String(activeIndex + 1).padStart(2, '0')} / {String(videoList.length).padStart(2, '0')}
        </span>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto max-w-full">
        <button
          type="button"
          onClick={() =>
            setActiveIndex((prev) => (prev === 0 ? videoList.length - 1 : prev - 1))
          }
          className="p-1.5 bg-[#1a1a1a] border border-white/10 hover:border-[#C8FF00] text-neutral-300 hover:text-[#C8FF00] rounded transition-colors"
          title="Previous Video"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        {videoList.map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setActiveIndex(idx)}
            className={`px-2.5 py-1 text-[11px] font-mono rounded transition-colors ${
              activeIndex === idx
                ? 'bg-[#C8FF00] text-black font-bold'
                : 'bg-[#1a1a1a] text-neutral-400 hover:text-white border border-white/10'
            }`}
          >
            #{idx + 1}
          </button>
        ))}

        <button
          type="button"
          onClick={() =>
            setActiveIndex((prev) => (prev === videoList.length - 1 ? 0 : prev + 1))
          }
          className="p-1.5 bg-[#1a1a1a] border border-white/10 hover:border-[#C8FF00] text-neutral-300 hover:text-[#C8FF00] rounded transition-colors"
          title="Next Video"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );

  if (embedInfo.type === 'youtube' || embedInfo.type === 'instagram') {
    return (
      <div className="w-full flex flex-col items-center gap-3">
        {playlistBar}
        <div
          className={`relative mx-auto flex items-center justify-center bg-black overflow-hidden transition-all duration-300 ${
            forceVerticalFit
              ? 'w-[320px] sm:w-[360px] h-[560px] sm:h-[630px] rounded-2xl border border-white/20 shadow-2xl'
              : 'w-full aspect-video max-h-[70vh] rounded-xl border border-white/10'
          }`}
        >
          <iframe
            src={embedInfo.embedUrl}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full border-0 bg-black"
          />
        </div>
        <div className="flex items-center gap-3 text-xs font-mono text-neutral-400">
          <span>
            {embedInfo.type === 'instagram' ? 'Instagram Embed' : 'YouTube Embed'}
          </span>
          <span>·</span>
          <a
            href={activeSrc}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[#C8FF00] hover:text-white transition-colors"
          >
            {embedInfo.type === 'instagram' && <Instagram className="w-3.5 h-3.5" />}
            <span>Open Original</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center">
      {playlistBar}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onTouchStart={() => setShowControls(true)}
        className={`relative mx-auto flex items-center justify-center bg-black overflow-hidden group select-none transition-all duration-300 ${
          forceVerticalFit
            ? 'w-[310px] sm:w-[350px] h-[550px] sm:h-[620px] rounded-2xl border border-white/20 shadow-2xl my-2'
            : 'w-full h-full min-h-[380px] max-h-[72vh] rounded-xl border border-white/10'
        }`}
      >
        <video
          key={activeSrc}
          ref={videoRef}
          src={activeSrc}
          poster={poster || undefined}
          playsInline
          autoPlay
          muted={isMuted}
          onClick={togglePlay}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          className={`w-full h-full cursor-pointer ${
            forceVerticalFit ? 'object-cover' : 'object-contain'
          }`}
        />

      {/* Center Big Play/Pause Button when user toggles */}
      {!isPlaying && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 m-auto w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center rounded-full bg-black/75 border border-white/20 text-[#C8FF00] hover:scale-110 hover:bg-[#C8FF00] hover:text-black transition-all duration-300 shadow-2xl z-20"
          aria-label="Play video"
        >
          <Play className="w-8 h-8 fill-current translate-x-0.5" />
        </button>
      )}

      {/* Vertical Reel Aspect Badge & Toggle */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
        <span className="text-[11px] font-mono font-bold tracking-wider text-black bg-[#C8FF00] px-2.5 py-1 uppercase rounded-sm shadow-md">
          {forceVerticalFit ? '9:16 Vertical Reel' : 'Widescreen 16:9'}
        </span>

        <button
          onClick={() => setForceVerticalFit(!forceVerticalFit)}
          className="px-2.5 py-1 bg-black/70 backdrop-blur-md border border-white/15 text-white text-[11px] font-mono hover:text-[#C8FF00] rounded transition-colors flex items-center gap-1.5"
          title="Toggle Reel Frame Mode"
        >
          {forceVerticalFit ? <Tv className="w-3 h-3" /> : <Smartphone className="w-3 h-3" />}
          <span className="hidden sm:inline">Switch Aspect</span>
        </button>
      </div>

      {/* Custom HTML5 Video Controls Bar */}
      <div
        className={`absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent p-4 transition-opacity duration-300 z-30 ${
          showControls || !isPlaying ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Timeline Scrubber */}
        <div className="relative mb-3 flex items-center">
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#C8FF00] focus:outline-none"
          />
        </div>

        {/* Buttons and metadata */}
        <div className="flex items-center justify-between text-white text-xs gap-2">
          {/* Left Controls: Play/Pause, Mute/Volume, Time */}
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlay}
              className="p-1.5 hover:text-[#C8FF00] transition-colors"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
            </button>

            <div className="flex items-center gap-1.5">
              <button
                onClick={toggleMute}
                className="p-1.5 hover:text-[#C8FF00] transition-colors"
                aria-label={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4 text-neutral-400" />
                ) : (
                  <Volume2 className="w-4 h-4 text-[#C8FF00]" />
                )}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-12 sm:w-16 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#C8FF00]"
              />
            </div>

            <span className="font-mono text-[11px] text-neutral-300 tabular-nums hidden sm:inline">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          {/* Right Controls: Loop, Speed Selector, Fullscreen */}
          <div className="flex items-center gap-2">
            {/* Speed Selector */}
            <select
              value={playbackSpeed}
              onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
              className="bg-black/60 border border-white/15 text-neutral-200 text-[11px] font-mono px-2 py-0.5 rounded cursor-pointer focus:outline-none hover:border-[#C8FF00]"
            >
              <option value={0.5}>0.5x</option>
              <option value={1}>1.0x</option>
              <option value={1.25}>1.25x</option>
              <option value={1.5}>1.5x</option>
              <option value={2}>2.0x</option>
            </select>

            <button
              onClick={() => setIsLooping(!isLooping)}
              className={`p-1.5 transition-colors ${
                isLooping ? 'text-[#C8FF00]' : 'text-neutral-400 hover:text-white'
              }`}
              title={isLooping ? 'Loop Enabled' : 'Loop Disabled'}
            >
              <Repeat className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={toggleFullscreen}
              className="p-1.5 text-neutral-400 hover:text-white transition-colors"
              title="Fullscreen Video"
            >
              <Maximize className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};
