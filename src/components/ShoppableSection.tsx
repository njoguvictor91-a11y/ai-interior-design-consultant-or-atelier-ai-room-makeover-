import React, { useState } from 'react';
import { ShoppingBag, ExternalLink, Bookmark, Check, Sparkles, Filter, Store } from 'lucide-react';
import { ShoppableItem, RoomStyle } from '../types';

interface ShoppableSectionProps {
  items: ShoppableItem[];
  currentStyle: RoomStyle;
  savedItemIds: string[];
  onToggleSaveItem: (item: ShoppableItem) => void;
}

export const ShoppableSection: React.FC<ShoppableSectionProps> = ({
  items,
  currentStyle,
  savedItemIds,
  onToggleSaveItem,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchFilter, setSearchFilter] = useState('');

  const categories = [
    'All',
    'Seating',
    'Lighting',
    'Tables & Desks',
    'Textiles & Rugs',
    'Storage & Shelving',
    'Accents & Botanicals',
  ];

  const filteredItems = items.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesQuery =
      searchFilter === '' ||
      item.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      item.material.toLowerCase().includes(searchFilter.toLowerCase()) ||
      item.stylingTip.toLowerCase().includes(searchFilter.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  // Calculate estimated total investment for saved items
  const savedItems = items.filter((i) => savedItemIds.includes(i.id));

  return (
    <section id="shoppable" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-stone-500 mb-1">
            <span>Sourcing & Procurement</span>
            <span aria-hidden="true">·</span>
            <span>{currentStyle.name} Edition</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight">
            Curated Shoppable Pieces
          </h3>
          <p className="text-sm text-stone-600 mt-1 max-w-2xl">
            Authentic designer furniture and architectural finishes identified in your makeover with verified retailer search queries.
          </p>
        </div>

        {/* Wishlist summary badge */}
        <div className="flex items-center gap-3 p-3 bg-stone-100/90 rounded-xl border border-stone-200">
          <Bookmark className="w-4 h-4 text-amber-900" />
          <div className="text-xs">
            <span className="font-semibold text-stone-900">{savedItems.length} items</span> saved to project list
          </div>
        </div>
      </div>

      {/* Category Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-6 border-b border-stone-200">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-stone-900 text-white shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        <div className="w-full sm:w-64">
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Search material or piece..."
            className="w-full px-3 py-1.5 text-xs bg-white border border-stone-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-stone-900"
          />
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => {
          const isSaved = savedItemIds.includes(item.id);
          const googleShopUrl = `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(item.searchQuery)}`;
          const westElmUrl = `https://www.westelm.com/search/results.html?words=${encodeURIComponent(item.name)}`;
          const wayfairUrl = `https://www.wayfair.com/keyword.php?keyword=${encodeURIComponent(item.searchQuery)}`;
          const ikeaUrl = `https://www.ikea.com/us/en/search/?q=${encodeURIComponent(item.searchQuery)}`;

          return (
            <div
              key={item.id}
              className="bg-white rounded-xl border border-stone-200/90 shadow-2xs hover:shadow-md hover:border-stone-300 transition-all duration-200 flex flex-col justify-between p-5 group"
            >
              <div>
                {/* Category & Price line with unboxed metadata */}
                <div className="flex items-center justify-between gap-2 text-xs mb-2">
                  <span className="font-mono text-[11px] uppercase tracking-wider text-stone-500">
                    {item.category}
                  </span>
                  <span className="font-mono font-semibold text-stone-900 tabular-nums">
                    {item.priceRange}
                  </span>
                </div>

                {/* Product Name */}
                <h4 className="text-base font-serif font-bold text-stone-900 group-hover:text-amber-950 transition-colors leading-snug">
                  {item.name}
                </h4>

                {/* Materials & Dimensions with subtle separators */}
                <div className="flex items-center gap-1.5 text-xs text-stone-500 mt-2">
                  <span>{item.material}</span>
                  {item.dimensions && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono text-[11px]">{item.dimensions}</span>
                    </>
                  )}
                </div>

                {/* Professional Styling Tip Callout */}
                <div className="mt-3.5 p-3 rounded-lg bg-[#FAF9F5] border border-stone-200/70 text-xs text-stone-600 leading-relaxed">
                  <span className="font-semibold text-stone-800 block mb-0.5">
                    Designer Placement Tip:
                  </span>
                  {item.stylingTip}
                </div>
              </div>

              {/* Retailer Direct Links & Save Action */}
              <div className="mt-5 pt-4 border-t border-stone-100 flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  {/* Google Shopping Primary Link */}
                  <a
                    href={googleShopUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg shadow-2xs transition-colors"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Shop Online Query</span>
                    <ExternalLink className="w-3 h-3 opacity-70" />
                  </a>

                  {/* Save to Project Wishlist */}
                  <button
                    type="button"
                    onClick={() => onToggleSaveItem(item)}
                    className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                      isSaved
                        ? 'bg-amber-100 border-amber-300 text-amber-950'
                        : 'bg-stone-50 border-stone-200 text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                    }`}
                    title={isSaved ? 'Remove from Project' : 'Save to Project Wishlist'}
                  >
                    {isSaved ? <Check className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                  </button>
                </div>

                {/* Alternative Retailers Quick Links */}
                <div className="flex items-center justify-center gap-3 pt-1 text-[11px] text-stone-400">
                  <span>Direct search:</span>
                  <a
                    href={westElmUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-stone-800 underline underline-offset-2"
                  >
                    West Elm
                  </a>
                  <span>·</span>
                  <a
                    href={wayfairUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-stone-800 underline underline-offset-2"
                  >
                    Wayfair
                  </a>
                  <span>·</span>
                  <a
                    href={ikeaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-stone-800 underline underline-offset-2"
                  >
                    IKEA
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-stone-200">
          <ShoppingBag className="w-8 h-8 text-stone-300 mx-auto mb-2" />
          <p className="text-sm text-stone-600">No items match your selected filter.</p>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('All');
              setSearchFilter('');
            }}
            className="mt-2 text-xs font-semibold text-amber-900 hover:underline"
          >
            Clear filters
          </button>
        </div>
      )}
    </section>
  );
};
