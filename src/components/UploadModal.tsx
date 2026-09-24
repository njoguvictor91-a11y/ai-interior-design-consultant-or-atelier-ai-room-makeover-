import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Sparkles, Check } from 'lucide-react';
import { SAMPLE_ORIGINAL_ROOMS } from '../data/roomStyles';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmUpload: (imageDataUrl: string, roomName: string, roomType: string) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onConfirmUpload,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [roomName, setRoomName] = useState('My Space');
  const [roomType, setRoomType] = useState('Living Room');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const roomTypes = ['Living Room', 'Bedroom', 'Studio Apartment', 'Dining Room', 'Home Office', 'Open Concept'];

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPreviewUrl(result);
      setRoomName(file.name.replace(/\.[^/.]+$/, ''));
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleSelectSample = (sample: typeof SAMPLE_ORIGINAL_ROOMS[0]) => {
    setPreviewUrl(sample.imageUrl);
    setRoomName(sample.name);
    setRoomType(sample.type);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!previewUrl) return;
    onConfirmUpload(previewUrl, roomName, roomType);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-stone-200 relative animate-in fade-in duration-200 flex flex-col max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div>
            <h3 className="text-xl font-serif font-bold text-stone-900">
              Upload Your Space
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Take a photo or upload an existing image of any room to begin your makeover.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 p-1 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Dropzone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center ${
              dragActive
                ? 'border-amber-700 bg-amber-50/50'
                : previewUrl
                ? 'border-stone-300 bg-stone-50/30'
                : 'border-stone-300 hover:border-stone-400 bg-stone-50/50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />

            {previewUrl ? (
              <div className="w-full flex flex-col items-center">
                <img
                  src={previewUrl}
                  alt="Upload preview"
                  referrerPolicy="no-referrer"
                  className="max-h-56 w-auto object-cover rounded-lg shadow-2xs border border-stone-200"
                />
                <span className="text-xs text-amber-900 font-semibold mt-3 hover:underline">
                  Click or drag to choose a different photo
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center py-4">
                <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-600 flex items-center justify-center mb-3">
                  <Upload className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-stone-800">
                  Drop your room photo here, or browse
                </p>
                <p className="text-xs text-stone-500 mt-1">
                  Supports JPG, PNG, WebP (Wide angle or eye-level perspectives work best)
                </p>
              </div>
            )}
          </div>

          {/* Quick Sample Selector */}
          <div>
            <span className="block text-[11px] font-mono uppercase tracking-wider text-stone-400 mb-1.5">
              Or pick a sample room space:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SAMPLE_ORIGINAL_ROOMS.map((sample) => (
                <div
                  key={sample.id}
                  onClick={() => handleSelectSample(sample)}
                  className={`p-2.5 rounded-lg border text-left cursor-pointer transition-colors flex items-center gap-3 ${
                    previewUrl === sample.imageUrl
                      ? 'border-amber-800 bg-amber-50/40 text-stone-900'
                      : 'border-stone-200 hover:border-stone-300 text-stone-700'
                  }`}
                >
                  <img
                    src={sample.imageUrl}
                    alt={sample.name}
                    referrerPolicy="no-referrer"
                    className="w-12 h-12 object-cover rounded-md shrink-0"
                  />
                  <div className="overflow-hidden">
                    <p className="text-xs font-semibold truncate">{sample.name}</p>
                    <p className="text-[11px] text-stone-500 truncate">{sample.type}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Room Configuration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-stone-100">
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Space Label
              </label>
              <input
                type="text"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder="e.g. My Living Room"
                className="w-full px-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-stone-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Room Architecture Type
              </label>
              <select
                value={roomType}
                onChange={(e) => setRoomType(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-stone-900"
              >
                {roomTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!previewUrl}
              className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 disabled:opacity-50 rounded-lg shadow-sm cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Load Space & Re-visualize</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
