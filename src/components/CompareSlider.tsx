import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Eye, Columns, Maximize2, Minimize2, Sparkles, RefreshCw, ZoomIn, Info } from 'lucide-react';

interface CompareSliderProps {
  originalImage: string;
  reimaginedImage: string;
  styleName: string;
  roomType: string;
  isGenerating?: boolean;
  generatingProgressText?: string;
  activeRefinements?: string[];
}

export const CompareSlider: React.FC<CompareSliderProps> = ({
  originalImage,
  reimaginedImage,
  styleName,
  roomType,
  isGenerating = false,
  generatingProgressText = 'Architectural AI is styling your space...',
  activeRefinements = [],
}) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [isSideBySide, setIsSideBySide] = useState(false);
  const [isHoldingBefore, setIsHoldingBefore] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle position calculation from mouse or touch event
  const updateSliderPosition = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const position = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(position);
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    updateSliderPosition(e.clientX);
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDragging) {
      updateSliderPosition(e.clientX);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    try {
      (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    } catch {
      // Ignore if not supported
    }
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      setSliderPosition((prev) => Math.max(0, prev - 5));
    } else if (e.key === 'ArrowRight') {
      setSliderPosition((prev) => Math.min(100, prev + 5));
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const effectivePosition = isHoldingBefore ? 100 : sliderPosition;

  return (
    <section id="visualizer" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Visualizer header & control toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-stone-500 mb-1">
            <span>Visualizer</span>
            <span aria-hidden="true">·</span>
            <span>{roomType} Makeover</span>
            <span aria-hidden="true">·</span>
            <span className="text-amber-800 font-semibold">{styleName}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight">
            Before & After Comparison
          </h2>
        </div>

        {/* Toolbar controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto bg-stone-100/80 p-1 rounded-xl border border-stone-200">
          <button
            type="button"
            onClick={() => setIsSideBySide(!isSideBySide)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
              isSideBySide ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-600 hover:text-stone-900'
            }`}
            title="Toggle between slider compare and side-by-side view"
          >
            <Columns className="w-3.5 h-3.5" />
            <span>{isSideBySide ? 'Split Slider' : 'Side-by-Side'}</span>
          </button>

          <button
            type="button"
            onMouseDown={() => setIsHoldingBefore(true)}
            onMouseUp={() => setIsHoldingBefore(false)}
            onTouchStart={() => setIsHoldingBefore(true)}
            onTouchEnd={() => setIsHoldingBefore(false)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
              isHoldingBefore ? 'bg-amber-900 text-white' : 'text-stone-600 hover:text-stone-900'
            }`}
            title="Press and hold to quickly reveal the original space"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Hold for Before</span>
          </button>

          <button
            type="button"
            onClick={() => setSliderPosition(50)}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-stone-600 hover:text-stone-900 rounded-lg hover:bg-white/60 transition-all cursor-pointer"
            title="Reset slider to center (50%)"
          >
            <RefreshCw className="w-3 h-3" />
            <span className="hidden sm:inline">50%</span>
          </button>

          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-1.5 text-stone-600 hover:text-stone-900 rounded-lg hover:bg-white/60 transition-all cursor-pointer"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Visualizer Container */}
      <div
        ref={containerRef}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        className={`relative w-full aspect-16/9 bg-stone-900 rounded-2xl overflow-hidden shadow-xl border border-stone-200/80 select-none group focus:outline-hidden focus:ring-2 focus:ring-amber-800/40 ${
          isFullscreen ? 'fixed inset-0 z-50 rounded-none aspect-auto h-screen' : ''
        }`}
      >
        {isSideBySide ? (
          /* Side by Side Dual View */
          <div className="grid grid-cols-2 w-full h-full divide-x divide-white/20">
            <div className="relative w-full h-full overflow-hidden bg-stone-950">
              <img
                src={originalImage}
                alt="Original Space"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4 px-3 py-1.5 bg-black/60 backdrop-blur-md text-white text-xs font-medium tracking-wide rounded-md border border-white/10">
                Original Space
              </div>
            </div>
            <div className="relative w-full h-full overflow-hidden bg-stone-950">
              <img
                src={reimaginedImage}
                alt={`Reimagined in ${styleName}`}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 right-4 px-3 py-1.5 bg-amber-950/80 backdrop-blur-md text-amber-200 text-xs font-medium tracking-wide rounded-md border border-amber-500/20">
                AI Reimagined · {styleName}
              </div>
            </div>
          </div>
        ) : (
          /* Interactive Compare Slider View */
          <div
            className="relative w-full h-full cursor-ew-resize overflow-hidden"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          >
            {/* Background Layer: REIMAGINED IMAGE (Full width) */}
            <img
              src={reimaginedImage}
              alt={`Reimagined in ${styleName}`}
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            />

            {/* Foreground Layer: ORIGINAL IMAGE (Clipped by slider position) */}
            <div
              className="absolute inset-0 overflow-hidden pointer-events-none transition-[clip-path] duration-75 ease-out"
              style={{
                clipPath: `inset(0 ${100 - effectivePosition}% 0 0)`,
              }}
            >
              <img
                src={originalImage}
                alt="Original Space"
                referrerPolicy="no-referrer"
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>

            {/* Hairline Divider & Interactive Grab Handle */}
            <div
              className="absolute top-0 bottom-0 pointer-events-none transition-[left] duration-75 ease-out flex items-center justify-center"
              style={{ left: `${effectivePosition}%` }}
            >
              {/* Hairline vertical dividing line */}
              <div className="w-[1.5px] h-full bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)]" />

              {/* Tactile circular grab handle */}
              <div className="absolute w-10 h-10 -ml-5 bg-white text-stone-900 rounded-full shadow-2xl border-2 border-stone-200 flex items-center justify-center transform active:scale-95 transition-transform group-hover:shadow-[0_0_20px_rgba(255,255,255,0.8)]">
                <div className="flex items-center gap-0.5">
                  <svg className="w-3.5 h-3.5 text-stone-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                  <svg className="w-3.5 h-3.5 text-stone-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Dynamic Corner Badges */}
            <div className="absolute top-4 left-4 pointer-events-none flex items-center gap-2">
              <span className="px-3 py-1.5 bg-black/60 backdrop-blur-md text-white text-xs font-medium tracking-wide rounded-md border border-white/10 shadow-sm">
                Before: Original
              </span>
            </div>

            <div className="absolute top-4 right-4 pointer-events-none flex items-center gap-2">
              <span className="px-3 py-1.5 bg-amber-950/80 backdrop-blur-md text-amber-200 text-xs font-medium tracking-wide rounded-md border border-amber-500/20 shadow-sm flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>AI Reimagined · {styleName}</span>
              </span>
            </div>

            {/* Active Refinement indicator if present */}
            {activeRefinements.length > 0 && (
              <div className="absolute bottom-4 left-4 pointer-events-none max-w-md hidden sm:flex items-center gap-2 px-3 py-1.5 bg-black/70 backdrop-blur-md rounded-lg border border-white/15 text-xs text-stone-200">
                <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="truncate">Refined: {activeRefinements.slice(-1)[0]}</span>
              </div>
            )}

            {/* Drag guide helper at the bottom center */}
            <div className="absolute bottom-4 right-4 pointer-events-none hidden md:flex items-center gap-2 px-3 py-1 bg-black/40 backdrop-blur-xs text-[11px] font-mono text-stone-300 rounded-md border border-white/10">
              <span>Drag slider or use ← → arrow keys</span>
            </div>
          </div>
        )}

        {/* AI Generation / Transformation Loading Overlay */}
        {isGenerating && (
          <div className="absolute inset-0 bg-stone-950/70 backdrop-blur-md z-30 flex flex-col items-center justify-center text-white p-6 transition-all duration-300">
            <div className="relative mb-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center animate-pulse">
                <Sparkles className="w-8 h-8 text-amber-300 animate-spin" style={{ animationDuration: '4s' }} />
              </div>
            </div>
            <h4 className="text-xl font-serif font-bold text-white mb-2">
              Reimagining Your Space
            </h4>
            <p className="text-sm text-stone-300 text-center max-w-md mb-4 font-sans">
              {generatingProgressText}
            </p>
            <div className="w-48 h-1 bg-white/20 rounded-full overflow-hidden">
              <div className="w-full h-full bg-gradient-to-r from-amber-400 to-amber-200 animate-[shimmer_1.5s_infinite] origin-left" />
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
