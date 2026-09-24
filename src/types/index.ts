export interface ShoppableItem {
  id: string;
  name: string;
  category: 'Seating' | 'Lighting' | 'Tables & Desks' | 'Textiles & Rugs' | 'Storage & Shelving' | 'Accents & Botanicals';
  priceRange: string;
  material: string;
  dimensions?: string;
  stylingTip: string;
  searchQuery: string;
  saved?: boolean;
}

export interface RoomStyle {
  id: string;
  name: string;
  tagline: string;
  description: string;
  palette: string[];
  materials: string[];
  imageUrl: string;
  promptDescription: string;
  keyFeatures: string[];
  shoppableItems: ShoppableItem[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  isRefinement?: boolean;
  refinementSummary?: string;
  detailedVisualPrompt?: string;
  shoppableItems?: ShoppableItem[];
}

export interface MakeoverState {
  originalImage: string;
  originalName: string;
  roomType: string;
  selectedStyle: RoomStyle;
  activeImage: string; // Current reimagined image (either preset or newly AI-generated)
  isGenerating: boolean;
  activeRefinements: string[];
}
