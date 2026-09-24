import React, { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, Check, Wand2, Plus } from 'lucide-react';
import { RoomStyle } from '../types';

interface StyleCarouselProps {
  styles: RoomStyle[];
  activeStyleId: string;
  onSelectStyle: (style: RoomStyle) => void;
  onGenerateCustomStyle: (customPrompt: string, customName: string) => void;
  isGenerating: boolean;
}

export const StyleCarousel: React.FC<StyleCarouselProps> = ({
  styles,
  activeStyleId,
  onSelectStyle,
  onGenerateCustomStyle,
  isGenerating,
}) => {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customStyleName, setCustomStyleName] = useState('');
  const [customStylePrompt, setCustomStylePrompt] = useState('');

  const scroll = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = direction === 'left' ? -380 : 380;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customStyleName.trim()) return;
    onGenerateCustomStyle(
      customStylePrompt.trim() || `Modern luxury interior in ${customStyleName} aesthetic`,
      customStyleName.trim()
    );
    setShowCustomModal(false);
    setCustomStyleName('');
    setCustomStylePrompt('');
  };

  const promptIdeas = [
    { name: 'Parisian Haussmann', prompt: 'Herringbone parquet floors, ornate crown molding, French gilded mirrors, marble fireplace' },
    { name: 'Warm Mediterranean Villa', prompt: 'Terracotta tiles, limewash walls, rustic olive wood beams, arched alcoves, linen drapery' },
    { name: 'Moody Dark Academia', prompt: 'Floor-to-ceiling dark mahogany library shelves, brass banker lamps, velvet seating, vintage oil paintings' },
    { name: 'Art Deco Luxe', prompt: 'Geometric brass inlays, rich emerald velvet, scalloped headboards, fluted black marble, sunburst lighting' },
  ];

  return (
    <section id="styles" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-stone-500 mb-1">
            <span>Style Palette</span>
            <span aria-hidden="true">·</span>
            <span>Architectural Aesthetics</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight">
            Reimagined Style Carousel
          </h3>
          <p className="text-sm text-stone-600 mt-1 max-w-2xl">
            Choose a signature aesthetic to re-envision your room, or prompt Gemini to generate a tailored custom vision.
          </p>
        </div>

        {/* Carousel navigation & custom trigger */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowCustomModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 rounded-lg transition-colors cursor-pointer shadow-2xs whitespace-nowrap"
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>Custom Aesthetic</span>
          </button>

          <div className="flex items-center gap-1 border border-stone-200 p-0.5 rounded-lg bg-stone-50">
            <button
              type="button"
              onClick={() => scroll('left')}
              className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-white rounded-md transition-colors cursor-pointer"
              title="Previous styles"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => scroll('right')}
              className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-white rounded-md transition-colors cursor-pointer"
              title="Next styles"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Carousel Track */}
      <div
        ref={carouselRef}
        className="flex gap-6 overflow-x-auto pb-4 pt-1 no-scrollbar scroll-smooth snap-x snap-mandatory"
      >
        {styles.map((style) => {
          const isActive = style.id === activeStyleId;
          return (
            <div
              key={style.id}
              onClick={() => !isGenerating && onSelectStyle(style)}
              className={`snap-start shrink-0 w-[300px] sm:w-[340px] rounded-xl overflow-hidden bg-white border transition-all cursor-pointer group flex flex-col ${
                isActive
                  ? 'border-amber-800 shadow-md ring-2 ring-amber-800/20'
                  : 'border-stone-200 hover:border-stone-300 hover:shadow-sm'
              }`}
            >
              {/* Image Preview */}
              <div className="relative aspect-16/10 w-full overflow-hidden bg-stone-100">
                <img
                  src={style.imageUrl}
                  alt={style.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500 ease-out"
                />
                {isActive && (
                  <div className="absolute top-3 right-3 px-2.5 py-1 bg-amber-950/90 backdrop-blur-md text-amber-200 text-[11px] font-medium tracking-wide rounded-md border border-amber-500/30 flex items-center gap-1 shadow-sm">
                    <Check className="w-3 h-3 text-amber-300" />
                    <span>Active Makeover</span>
                  </div>
                )}
                {/* Palette indicator dots */}
                <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-black/50 backdrop-blur-xs p-1 rounded-md">
                  {style.palette.map((color, idx) => (
                    <span
                      key={idx}
                      className="w-3 h-3 rounded-full border border-white/30"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="text-lg font-serif font-bold text-stone-900 group-hover:text-amber-950 transition-colors">
                    {style.name}
                  </h4>
                  <p className="text-xs text-stone-500 font-medium mt-0.5 line-clamp-1">
                    {style.tagline}
                  </p>
                  <p className="text-xs text-stone-600 mt-2 line-clamp-2 leading-relaxed">
                    {style.description}
                  </p>
                </div>

                {/* Tactile Material tags (rendered with clean unboxed typographic separators) */}
                <div className="mt-3 pt-3 border-t border-stone-100">
                  <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-stone-500">
                    <span className="font-medium text-stone-700">Materials:</span>
                    {style.materials.slice(0, 3).map((mat, i) => (
                      <React.Fragment key={i}>
                        {i > 0 && <span aria-hidden="true">·</span>}
                        <span>{mat}</span>
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Custom AI Style Prompt Card */}
        <div
          onClick={() => setShowCustomModal(true)}
          className="snap-start shrink-0 w-[280px] sm:w-[320px] rounded-xl border-2 border-dashed border-stone-300 hover:border-amber-700/60 bg-stone-50/50 hover:bg-amber-50/20 transition-all cursor-pointer flex flex-col items-center justify-center p-8 text-center group"
        >
          <div className="w-12 h-12 rounded-full bg-white shadow-2xs border border-stone-200 group-hover:border-amber-300 flex items-center justify-center mb-4 transition-colors">
            <Plus className="w-5 h-5 text-stone-600 group-hover:text-amber-900" />
          </div>
          <h4 className="text-base font-serif font-bold text-stone-900 group-hover:text-amber-950">
            Generate Custom Aesthetic
          </h4>
          <p className="text-xs text-stone-500 mt-1 max-w-[200px] leading-relaxed">
            Prompt Gemini to craft a bespoke style tailored to your taste.
          </p>
          <span className="mt-4 text-xs font-semibold text-amber-900 underline underline-offset-4 decoration-amber-400 group-hover:decoration-amber-900">
            Prompt New Style →
          </span>
        </div>
      </div>

      {/* Custom Aesthetic Generator Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 relative animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-800" />
                <h4 className="text-lg font-serif font-bold text-stone-900">
                  Custom AI Style Generation
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setShowCustomModal(false)}
                className="text-stone-400 hover:text-stone-700 text-lg leading-none cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCustomSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Aesthetic Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Modern Tuscan Farmhouse, Retro 70s Lounge..."
                  value={customStyleName}
                  onChange={(e) => setCustomStyleName(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-800/30 focus:border-amber-800"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Design & Material Prompt Details (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Terracotta clay tiles, limewash plaster walls, raw oak exposed ceiling beams, warm parchment lighting..."
                  value={customStylePrompt}
                  onChange={(e) => setCustomStylePrompt(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-800/30 focus:border-amber-800 resize-none"
                />
              </div>

              {/* Inspiration Chips */}
              <div>
                <span className="block text-[11px] font-mono uppercase tracking-wider text-stone-400 mb-1.5">
                  Try An Architectural Preset:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {promptIdeas.map((idea, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setCustomStyleName(idea.name);
                        setCustomStylePrompt(idea.prompt);
                      }}
                      className="px-2.5 py-1 text-xs text-stone-700 bg-stone-100 hover:bg-amber-100 hover:text-amber-900 rounded-md transition-colors cursor-pointer"
                    >
                      {idea.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCustomModal(false)}
                  className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isGenerating || !customStyleName.trim()}
                  className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Generate Makeover</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
