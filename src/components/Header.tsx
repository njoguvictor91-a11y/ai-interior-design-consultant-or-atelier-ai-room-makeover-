import React from 'react';
import { Camera, Sparkles, Download, Layers } from 'lucide-react';

interface HeaderProps {
  onUploadClick: () => void;
  onExportClick: () => void;
  activeStyleName: string;
}

export const Header: React.FC<HeaderProps> = ({
  onUploadClick,
  onExportClick,
  activeStyleName,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#FAF9F5]/90 backdrop-blur-md border-b border-stone-200/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Zone 1: Single text wordmark */}
        <div className="flex items-center gap-3">
          <a
            href="/"
            className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-stone-900 hover:text-amber-950 transition-colors"
          >
            Atelier AI
          </a>
          <span className="hidden sm:inline-block text-xs font-mono uppercase tracking-widest text-stone-400 pl-2 border-l border-stone-300">
            Interior Architecture
          </span>
        </div>

        {/* Zone 2: Clean text navigation links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-stone-600">
          <a href="#visualizer" className="hover:text-stone-900 transition-colors">
            Before & After Compare
          </a>
          <a href="#styles" className="hover:text-stone-900 transition-colors">
            Aesthetic Carousel
          </a>
          <a href="#consultant" className="hover:text-stone-900 transition-colors">
            Design Consultant
          </a>
          <a href="#shoppable" className="hover:text-stone-900 transition-colors">
            Shoppable Pieces
          </a>
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={onUploadClick}
            type="button"
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold tracking-wide text-stone-800 bg-white border border-stone-300 rounded-lg shadow-2xs hover:bg-stone-50 hover:border-stone-400 active:scale-98 transition-all whitespace-nowrap cursor-pointer"
          >
            <Camera className="w-4 h-4 text-stone-600" />
            <span>Upload Your Space</span>
          </button>

          <button
            onClick={onExportClick}
            type="button"
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold tracking-wide text-white bg-stone-900 rounded-lg shadow-sm hover:bg-stone-800 active:scale-98 transition-all whitespace-nowrap cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export Makeover</span>
            <span className="sm:hidden">Export</span>
          </button>
        </div>
      </div>
    </header>
  );
};
