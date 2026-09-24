import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, RefreshCw, ShoppingBag, ArrowRight, CornerDownLeft, User, Bot, CheckCircle2 } from 'lucide-react';
import { ChatMessage, RoomStyle, ShoppableItem } from '../types';

interface ChatConsultantProps {
  messages: ChatMessage[];
  currentStyle: RoomStyle;
  roomType: string;
  onSendMessage: (text: string) => Promise<void>;
  onApplyRefinement: (refinementSummary: string, promptDetails: string) => void;
  onSelectShoppableItem?: (item: ShoppableItem) => void;
  isChatLoading: boolean;
  isGeneratingImage: boolean;
}

export const ChatConsultant: React.FC<ChatConsultantProps> = ({
  messages,
  currentStyle,
  roomType,
  onSendMessage,
  onApplyRefinement,
  onSelectShoppableItem,
  isChatLoading,
  isGeneratingImage,
}) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isChatLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isChatLoading) return;
    const text = inputText.trim();
    setInputText('');
    await onSendMessage(text);
  };

  const quickPromptChips = [
    { label: 'Make the area rug navy blue', prompt: 'Keep this layout but make the rug navy blue and add subtle indigo accents' },
    { label: 'Swap coffee table for raw marble', prompt: 'Replace the wooden coffee table with a low honed Calacatta marble slab' },
    { label: 'Add warm brass wall sconces', prompt: 'Add warm brushed brass architectural wall sconces on the main wall' },
    { label: 'Introduce tall fiddle-leaf fig tree', prompt: 'Add a tall potted fiddle leaf fig tree in the corner near the window' },
    { label: 'Recommend best paint colors', prompt: 'What specific paint wall colors and sheen would complement this furniture palette?' },
  ];

  return (
    <section id="consultant" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden flex flex-col h-[700px]">
        {/* Chat Header */}
        <div className="px-6 py-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-amber-950 text-amber-200 flex items-center justify-center font-serif font-bold text-sm shadow-2xs">
              A
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-base font-serif font-bold text-stone-900">
                  Atelier AI Interior Consultant
                </h4>
                <span className="w-2 h-2 rounded-full bg-emerald-500" title="Online & ready" />
              </div>
              <p className="text-xs text-stone-500">
                Context: <span className="text-stone-800 font-medium">{roomType}</span> · Current Aesthetic: <span className="text-amber-900 font-medium">{currentStyle.name}</span>
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-stone-400">
            <span>Powered by Gemini</span>
          </div>
        </div>

        {/* Message Thread (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 custom-scrollbar bg-[#FAF9F5]/40">
          {messages.map((message) => {
            const isUser = message.role === 'user';
            return (
              <div
                key={message.id}
                className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : ''}`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-medium ${
                    isUser
                      ? 'bg-stone-800 text-white'
                      : 'bg-amber-900 text-amber-100 font-serif font-bold'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : 'A'}
                </div>

                {/* Message Body */}
                <div
                  className={`flex flex-col space-y-2 ${isUser ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                      isUser
                        ? 'bg-stone-900 text-white rounded-tr-xs'
                        : 'bg-white border border-stone-200 text-stone-800 rounded-tl-xs shadow-2xs'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>

                  {/* Refinement Action Prompt Card if model detected a visual design tweak */}
                  {!isUser && message.isRefinement && message.detailedVisualPrompt && (
                    <div className="w-full bg-amber-50/70 border border-amber-200/80 rounded-xl p-3.5 mt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                      <div>
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-900">
                          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                          <span>Visual Refinement Detected</span>
                        </div>
                        <p className="text-xs text-stone-700 mt-0.5 font-medium">
                          {message.refinementSummary || 'Design adjustment proposed'}
                        </p>
                      </div>

                      <button
                        type="button"
                        disabled={isGeneratingImage}
                        onClick={() =>
                          onApplyRefinement(
                            message.refinementSummary || 'Refined Design',
                            message.detailedVisualPrompt || ''
                          )
                        }
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-amber-900 hover:bg-amber-950 rounded-lg shadow-2xs transition-all active:scale-98 disabled:opacity-50 cursor-pointer whitespace-nowrap"
                      >
                        <RefreshCw className={`w-3 h-3 ${isGeneratingImage ? 'animate-spin' : ''}`} />
                        <span>Re-render in Visualizer</span>
                      </button>
                    </div>
                  )}

                  {/* Shoppable Items preview attached to this recommendation */}
                  {!isUser && message.shoppableItems && message.shoppableItems.length > 0 && (
                    <div className="w-full bg-white border border-stone-200/90 rounded-xl p-3.5 mt-2">
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-stone-100">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-800">
                          <ShoppingBag className="w-3.5 h-3.5 text-stone-600" />
                          <span>Recommended Shoppable Pieces ({message.shoppableItems.length})</span>
                        </div>
                        <a
                          href="#shoppable"
                          className="text-[11px] font-medium text-amber-900 hover:underline flex items-center gap-1"
                        >
                          <span>View Full Catalog</span>
                          <ArrowRight className="w-3 h-3" />
                        </a>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {message.shoppableItems.slice(0, 4).map((item, idx) => (
                          <div
                            key={idx}
                            className="p-2.5 rounded-lg bg-stone-50 border border-stone-150 hover:border-amber-300 transition-colors flex flex-col justify-between"
                          >
                            <div>
                              <div className="flex items-center justify-between gap-1">
                                <span className="text-[11px] font-mono text-stone-400 uppercase">
                                  {item.category}
                                </span>
                                <span className="text-xs font-mono font-semibold text-amber-950">
                                  {item.priceRange}
                                </span>
                              </div>
                              <h5 className="text-xs font-semibold text-stone-900 mt-1 line-clamp-1">
                                {item.name}
                              </h5>
                              <p className="text-[11px] text-stone-500 mt-0.5 line-clamp-1">
                                {item.material}
                              </p>
                            </div>
                            <div className="mt-2 pt-2 border-t border-stone-200/60 flex items-center justify-between">
                              <span className="text-[10px] text-stone-400 italic truncate max-w-[150px]">
                                {item.stylingTip}
                              </span>
                              <a
                                href={`https://www.google.com/search?tbm=shop&q=${encodeURIComponent(item.searchQuery)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[11px] font-semibold text-amber-900 hover:text-amber-950 underline underline-offset-2 shrink-0 ml-2"
                              >
                                Shop Item →
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <span className="text-[10px] text-stone-400 font-mono px-1">
                    {message.timestamp}
                  </span>
                </div>
              </div>
            );
          })}

          {isChatLoading && (
            <div className="flex gap-3 max-w-3xl">
              <div className="w-8 h-8 rounded-full bg-amber-900 text-amber-100 flex items-center justify-center shrink-0 font-serif font-bold text-xs">
                A
              </div>
              <div className="px-4 py-3 bg-white border border-stone-200 rounded-2xl rounded-tl-xs shadow-2xs flex items-center gap-2 text-xs text-stone-500">
                <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-spin" />
                <span>Atelier AI is reviewing spatial balance and shoppable selections...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2 bg-stone-50/70 border-t border-stone-200 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[11px] font-mono uppercase text-stone-400 shrink-0">
            Quick Prompts:
          </span>
          {quickPromptChips.map((chip, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onSendMessage(chip.prompt)}
              disabled={isChatLoading}
              className="shrink-0 px-2.5 py-1 text-xs text-stone-700 bg-white hover:bg-stone-100 border border-stone-200 hover:border-stone-300 rounded-md transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSubmit} className="p-3 bg-white border-t border-stone-200 flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isChatLoading}
            placeholder={`Ask Atelier AI to refine the ${currentStyle.name} design (e.g., "Make the rug navy blue", "Add brass floor lamps")...`}
            className="flex-1 px-4 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-800/30 focus:border-amber-800 text-stone-900 placeholder:text-stone-400"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isChatLoading}
            className="px-4 py-2.5 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 disabled:opacity-40 rounded-xl shadow-2xs flex items-center gap-1.5 transition-all active:scale-98 cursor-pointer shrink-0"
          >
            <span>Send</span>
            <CornerDownLeft className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </section>
  );
};
