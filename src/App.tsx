import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { CompareSlider } from './components/CompareSlider';
import { StyleCarousel } from './components/StyleCarousel';
import { ChatConsultant } from './components/ChatConsultant';
import { ShoppableSection } from './components/ShoppableSection';
import { UploadModal } from './components/UploadModal';
import { PRESET_STYLES, SAMPLE_ORIGINAL_ROOMS } from './data/roomStyles';
import { RoomStyle, ChatMessage, ShoppableItem } from './types';
import { Sparkles, Sliders, CheckCircle, ArrowDown, Info, ShieldCheck } from 'lucide-react';

export default function App() {
  // Room state
  const [originalImage, setOriginalImage] = useState<string>(
    SAMPLE_ORIGINAL_ROOMS[0].imageUrl
  );
  const [originalName, setOriginalName] = useState<string>(
    SAMPLE_ORIGINAL_ROOMS[0].name
  );
  const [roomType, setRoomType] = useState<string>('Living Room');

  // Styles list & active selection
  const [styles, setStyles] = useState<RoomStyle[]>(PRESET_STYLES);
  const [selectedStyle, setSelectedStyle] = useState<RoomStyle>(PRESET_STYLES[0]);
  const [activeImage, setActiveImage] = useState<string>(PRESET_STYLES[0].imageUrl);
  const [activeRefinements, setActiveRefinements] = useState<string[]>([]);

  // Generation status
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingProgressText, setGeneratingProgressText] = useState('');

  // Wishlist / saved items
  const [savedItemIds, setSavedItemIds] = useState<string[]>(['mcm-1', 'mcm-2']);

  // Modals
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Multi-turn chat conversation state
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      role: 'model',
      content: `Welcome to Atelier AI. I've analyzed your ${roomType.toLowerCase()} and prepared an initial Mid-Century Modern transformation.

You can drag the Compare slider above to see how we replaced the dated beige finishes with warm walnut woodwork, an iconic caramel leather lounge chair, and sculptural brass illumination.

How do you envision this space? You can ask me to adjust any detail (e.g. "make the rug cobalt blue", "add warm wall sconces", "replace coffee table with marble") or inquire about furniture placement!`,
      timestamp: 'Just now',
      shoppableItems: PRESET_STYLES[0].shoppableItems.slice(0, 3),
    },
  ]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Handle switching style from carousel
  const handleSelectStyle = useCallback(
    async (style: RoomStyle) => {
      setSelectedStyle(style);
      setActiveRefinements([]);

      // If we are on the default sample room, use the preset high-res rendered photo
      if (originalImage === SAMPLE_ORIGINAL_ROOMS[0].imageUrl) {
        setActiveImage(style.imageUrl);
      } else {
        // If the user uploaded a custom room photo, generate an AI makeover for this style
        setIsGenerating(true);
        setGeneratingProgressText(`Translating your space into ${style.name}...`);
        try {
          const res = await fetch('/api/generate-design', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              baseImage: originalImage,
              styleName: style.name,
              stylePrompt: style.promptDescription,
              roomType,
            }),
          });
          const data = await res.json();
          if (data.imageUrl) {
            setActiveImage(data.imageUrl);
          } else {
            setActiveImage(style.imageUrl);
          }
        } catch (err) {
          console.error('Error generating style for uploaded space:', err);
          setActiveImage(style.imageUrl);
        } finally {
          setIsGenerating(false);
        }
      }

      // Add a concise designer note in the chat thread
      setMessages((prev) => [
        ...prev,
        {
          id: `style-switch-${Date.now()}`,
          role: 'model',
          content: `We've shifted the room aesthetic to ${style.name}. ${style.description} Notice the emphasis on ${style.materials.join(', ')}. All shoppable items have been updated below.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          shoppableItems: style.shoppableItems.slice(0, 3),
        },
      ]);
    },
    [originalImage, roomType]
  );

  // Handle user chat message
  const handleSendMessage = async (text: string) => {
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setIsChatLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          currentStyle: selectedStyle,
          currentRefinements: activeRefinements,
          roomType,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch consultant advice');
      }

      const data = await response.json();

      const modelMsg: ChatMessage = {
        id: `model-${Date.now()}`,
        role: 'model',
        content: data.replyText || 'I have analyzed your spatial request and updated the recommendations.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isRefinement: data.isRefinementRequest,
        refinementSummary: data.refinementSummary,
        detailedVisualPrompt: data.detailedVisualPrompt,
        shoppableItems: data.shoppableItems || [],
      };

      setMessages((prev) => [...prev, modelMsg]);

      // If this was an explicit refinement request, optionally auto-trigger image re-render
      if (data.isRefinementRequest && data.detailedVisualPrompt) {
        // We prompt the user with the action button in the chat, or auto-apply if desired
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'model',
          content: 'I encountered a brief connection delay. As your consultant, I recommend pairing warm ambient lighting with tactile wool textures to ground this layout.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          shoppableItems: selectedStyle.shoppableItems.slice(0, 2),
        },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Handle applying a visual refinement to the visualizer
  const handleApplyRefinement = async (summary: string, promptDetails: string) => {
    setIsGenerating(true);
    setGeneratingProgressText(`Applying refinement: "${summary}" to visualizer...`);
    setActiveRefinements((prev) => [...prev, summary]);

    try {
      const res = await fetch('/api/generate-design', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          baseImage: activeImage || originalImage,
          styleName: selectedStyle.name,
          stylePrompt: selectedStyle.promptDescription,
          refinementPrompt: promptDetails || summary,
          roomType,
        }),
      });

      const data = await res.json();
      if (data.imageUrl) {
        setActiveImage(data.imageUrl);
      }

      // Add feedback message in chat
      setMessages((prev) => [
        ...prev,
        {
          id: `refine-done-${Date.now()}`,
          role: 'model',
          content: `The visualizer has been re-rendered to reflect: "${summary}". Compare against your original space to evaluate the spatial impact!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err) {
      console.error('Error applying refinement:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle generating custom style prompt from user
  const handleGenerateCustomStyle = async (prompt: string, name: string) => {
    setIsGenerating(true);
    setGeneratingProgressText(`Crafting bespoke "${name}" makeover...`);

    try {
      const res = await fetch('/api/generate-design', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          baseImage: originalImage,
          styleName: name,
          stylePrompt: prompt,
          roomType,
        }),
      });

      const data = await res.json();
      const generatedImg = data.imageUrl || activeImage;

      // Extract matching shoppable items for this new style
      let newShoppableItems: ShoppableItem[] = [];
      try {
        const itemsRes = await fetch('/api/extract-shoppable-items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ styleName: name, description: prompt }),
        });
        const itemsData = await itemsRes.json();
        if (itemsData.items && Array.isArray(itemsData.items)) {
          newShoppableItems = itemsData.items.map((it: any, idx: number) => ({
            ...it,
            id: `custom-item-${Date.now()}-${idx}`,
          }));
        }
      } catch (err) {
        console.error('Could not extract items:', err);
      }

      const newStyle: RoomStyle = {
        id: `custom-${Date.now()}`,
        name,
        tagline: 'Custom AI Architectural Vision',
        description: prompt,
        palette: ['#2C302E', '#907A65', '#D2BBA0', '#E5DCC5'],
        materials: ['Custom Joinery', 'Artisanal Stone', 'Curated Textiles'],
        imageUrl: generatedImg,
        promptDescription: prompt,
        keyFeatures: ['Bespoke spatial design', 'Harmonized material palette', 'Custom lighting layout'],
        shoppableItems: newShoppableItems.length > 0 ? newShoppableItems : selectedStyle.shoppableItems,
      };

      setStyles((prev) => [newStyle, ...prev]);
      setSelectedStyle(newStyle);
      setActiveImage(generatedImg);
      setActiveRefinements([]);

      setMessages((prev) => [
        ...prev,
        {
          id: `custom-style-msg-${Date.now()}`,
          role: 'model',
          content: `Your bespoke design for "${name}" has been generated. I balanced the lighting and textures according to your prompt: "${prompt}". Check the compare slider and shoppable items!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          shoppableItems: newStyle.shoppableItems.slice(0, 3),
        },
      ]);
    } catch (err) {
      console.error('Custom style generation failed:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle uploaded space photo
  const handleConfirmUpload = async (imageDataUrl: string, name: string, type: string) => {
    setOriginalImage(imageDataUrl);
    setOriginalName(name);
    setRoomType(type);
    setIsGenerating(true);
    setGeneratingProgressText(`Transforming your uploaded ${type.toLowerCase()} into ${selectedStyle.name}...`);

    try {
      const res = await fetch('/api/generate-design', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          baseImage: imageDataUrl,
          styleName: selectedStyle.name,
          stylePrompt: selectedStyle.promptDescription,
          roomType: type,
        }),
      });

      const data = await res.json();
      if (data.imageUrl) {
        setActiveImage(data.imageUrl);
      }
      setActiveRefinements([]);

      setMessages((prev) => [
        ...prev,
        {
          id: `upload-msg-${Date.now()}`,
          role: 'model',
          content: `I've imported your space "${name}" (${type}) and styled it in ${selectedStyle.name}! Drag the comparison slider above to see the before & after transformation.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err) {
      console.error('Upload makeover error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Toggle wishlist item
  const handleToggleSaveItem = (item: ShoppableItem) => {
    setSavedItemIds((prev) =>
      prev.includes(item.id) ? prev.filter((id) => id !== item.id) : [...prev, item.id]
    );
  };

  // Export Makeover Report
  const handleExport = () => {
    const reportWindow = window.open('', '_blank');
    if (!reportWindow) return;

    const savedItems = selectedStyle.shoppableItems.filter((i) =>
      savedItemIds.includes(i.id)
    );

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${originalName} Makeover — Atelier AI</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #1c1917; max-width: 900px; margin: 0 auto; background: #faf9f5; }
            h1 { font-family: Georgia, serif; font-size: 32px; margin-bottom: 8px; }
            .meta { color: #78716c; font-size: 14px; margin-bottom: 24px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
            img { width: 100%; height: 260px; object-fit: cover; border-radius: 8px; border: 1px solid #e7e5e4; }
            .label { font-weight: bold; font-size: 13px; text-transform: uppercase; margin-bottom: 6px; }
            .card { background: white; border: 1px solid #e7e5e4; border-radius: 8px; padding: 16px; margin-bottom: 12px; }
            .price { font-family: monospace; font-weight: bold; color: #78350f; }
          </style>
        </head>
        <body>
          <h1>Atelier AI — Interior Design Makeover Spec</h1>
          <div class="meta">Space: ${originalName} (${roomType}) · Style: ${selectedStyle.name} · Exported ${new Date().toLocaleDateString()}</div>
          
          <div class="grid">
            <div>
              <div class="label">Original Space</div>
              <img src="${originalImage}" />
            </div>
            <div>
              <div class="label">Reimagined: ${selectedStyle.name}</div>
              <img src="${activeImage}" />
            </div>
          </div>

          <h2>Curated Shoppable Sourcing List (${selectedStyle.shoppableItems.length} items)</h2>
          ${selectedStyle.shoppableItems
            .map(
              (item) => `
            <div class="card">
              <div style="display:flex; justify-content:space-between;">
                <strong>${item.name}</strong>
                <span class="price">${item.priceRange}</span>
              </div>
              <div style="font-size: 13px; color:#57534e; margin-top:4px;">${item.material} ${item.dimensions ? `· ${item.dimensions}` : ''}</div>
              <p style="font-size: 13px; margin-top:8px; line-height: 1.5;">${item.stylingTip}</p>
            </div>
          `
            )
            .join('')}
        </body>
      </html>
    `;
    reportWindow.document.write(html);
    reportWindow.document.close();
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-stone-900 flex flex-col">
      {/* Top Bar Contract (3 zones) */}
      <Header
        onUploadClick={() => setIsUploadModalOpen(true)}
        onExportClick={handleExport}
        activeStyleName={selectedStyle.name}
      />

      <main className="flex-1 pb-16">
        {/* Hero Section Introduction */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-stone-200/80">
            <div className="max-w-3xl">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-stone-500 mb-2">
                <span>Interactive Room Makeover</span>
                <span aria-hidden="true">·</span>
                <span>Spatial Intelligence</span>
                <span aria-hidden="true">·</span>
                <span>Curated Sourcing</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-serif font-bold text-stone-900 tracking-tight leading-tight">
                Reimagine Your Living Space With Architectural AI.
              </h1>
              <p className="text-base sm:text-lg text-stone-600 mt-3 leading-relaxed">
                Upload a candid photo of your room, glide through signature design aesthetics with our real-time Before & After comparison slider, and refine tactile materials with your dedicated interior consultant.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(true)}
                className="px-4 py-2.5 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg shadow-sm transition-all cursor-pointer"
              >
                Upload Space Photo
              </button>
              <a
                href="#consultant"
                className="px-4 py-2.5 text-xs font-semibold text-stone-800 bg-white hover:bg-stone-50 border border-stone-300 rounded-lg shadow-2xs transition-all"
              >
                Ask Design Consultant ↓
              </a>
            </div>
          </div>
        </section>

        {/* 1. Interactive Before/After Compare Slider */}
        <CompareSlider
          originalImage={originalImage}
          reimaginedImage={activeImage}
          styleName={selectedStyle.name}
          roomType={roomType}
          isGenerating={isGenerating}
          generatingProgressText={generatingProgressText}
          activeRefinements={activeRefinements}
        />

        {/* 2. Reimagined Style Carousel */}
        <StyleCarousel
          styles={styles}
          activeStyleId={selectedStyle.id}
          onSelectStyle={handleSelectStyle}
          onGenerateCustomStyle={handleGenerateCustomStyle}
          isGenerating={isGenerating}
        />

        {/* 3. Context-Aware Chat Interface */}
        <ChatConsultant
          messages={messages}
          currentStyle={selectedStyle}
          roomType={roomType}
          onSendMessage={handleSendMessage}
          onApplyRefinement={handleApplyRefinement}
          isChatLoading={isChatLoading}
          isGeneratingImage={isGenerating}
        />

        {/* 4. Shoppable Catalog Section */}
        <ShoppableSection
          items={selectedStyle.shoppableItems}
          currentStyle={selectedStyle}
          savedItemIds={savedItemIds}
          onToggleSaveItem={handleToggleSaveItem}
        />
      </main>

      {/* Upload Modal */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onConfirmUpload={handleConfirmUpload}
      />

      {/* Footer */}
      <footer className="border-t border-stone-200/80 bg-white/70 py-8 px-4 text-center text-xs text-stone-500 font-sans">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-sm text-stone-900">Atelier AI</span>
            <span>· Architectural Interior Design Consultant</span>
          </div>
          <p className="text-stone-400">
            Powered by Gemini · Drag & Compare Visualizer · Shoppable Links
          </p>
        </div>
      </footer>
    </div>
  );
}
