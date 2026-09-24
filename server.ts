import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '35mb' }));

// Server-side Google GenAI initialization with required User-Agent
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// System instruction for the Interior Design Consultant
const SYSTEM_INSTRUCTION = `You are "Atelier AI", an acclaimed Principal Interior Architect and Design Consultant with 15+ years experience styling high-end residential interiors (Architectural Digest, Elle Decor).
Your expertise spans spatial planning, architectural lighting, material tactile contrasts, custom joinery, vintage iconic furnishings, and color psychology.

When users interact with you:
1. Speak with warmth, refined taste, and actionable architectural precision. Avoid generic fluff.
2. In every turn, acknowledge the current room aesthetic, layout, and lighting conditions.
3. If the user asks to modify or refine the design (e.g., "make the rug navy blue", "add warm wall sconces", "replace coffee table with marble", "add more indoor plants"):
   - Explain how this change affects room balance, visual weight, and lighting.
   - Formulate a clear visual rendering prompt that can be used to re-render the room.
4. Always provide 3 to 5 curated, specific shoppable design pieces that achieve or complement the requested look. Each item must have:
   - name: specific, authentic furniture/decor name (e.g. "Kvadrat Hand-Tufted Wool Rug in Prussian Blue", "Noguchi Style Walnut Coffee Table", "Flos 265 Counterbalanced Wall Lamp")
   - category: one of ["Seating", "Lighting", "Tables & Desks", "Textiles & Rugs", "Storage & Shelving", "Accents & Botanicals"]
   - priceRange: estimated realistic price range (e.g. "$450 – $800")
   - material: specific authentic materials (e.g. "Solid American Walnut, brushed brass, oiled finish")
   - dimensions: realistic dimensions (e.g. "8' x 10'" or "48\"W x 22\"D x 16\"H")
   - stylingTip: a professional design rule for placement in this room
   - searchQuery: optimized shopping search string to find this exact style online`;

// 1. Context-aware Chat & Refinement Endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, currentStyle, currentRefinements, roomType } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Invalid messages array' });
    }

    const conversationHistory = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `Context of the current room makeover:
- Room Type: ${roomType || 'Living Room'}
- Current Reimagined Style: ${currentStyle?.name || 'Mid-Century Modern'} (${currentStyle?.description || ''})
- Previous Refinements: ${currentRefinements?.length ? currentRefinements.join('; ') : 'None yet (initial makeover)'}

Conversation so far:
${JSON.stringify(conversationHistory, null, 2)}

Provide a thoughtful, professional response from the interior designer. If the user is asking to change or refine colors, materials, layout, or decor, craft a specific visual refinement description. Also provide shoppable items suited to this room and request.`,
            },
          ],
        },
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            replyText: {
              type: Type.STRING,
              description: 'The designer conversation reply in refined, warm, professional editorial tone.',
            },
            isRefinementRequest: {
              type: Type.BOOLEAN,
              description: 'Whether the user prompt requests a visual change to the room (color, furniture, decor, lighting, layout).',
            },
            refinementSummary: {
              type: Type.STRING,
              description: 'Short 3-6 word summary of what changed (e.g. "Navy Wool Rug & Brass Sconces").',
            },
            detailedVisualPrompt: {
              type: Type.STRING,
              description: 'Descriptive prompt instructions to apply to the room image to generate this updated render.',
            },
            shoppableItems: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  category: { type: Type.STRING },
                  priceRange: { type: Type.STRING },
                  material: { type: Type.STRING },
                  dimensions: { type: Type.STRING },
                  stylingTip: { type: Type.STRING },
                  searchQuery: { type: Type.STRING },
                },
                required: ['name', 'category', 'priceRange', 'material', 'searchQuery', 'stylingTip'],
              },
            },
          },
          required: ['replyText', 'isRefinementRequest', 'shoppableItems'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Chat API Error:', error);
    return res.status(500).json({
      error: 'Failed to generate interior consultation response',
      details: error.message,
    });
  }
});

// 2. Room Image Reimagining / Refinement Endpoint
app.post('/api/generate-design', async (req, res) => {
  try {
    const { baseImage, styleName, stylePrompt, refinementPrompt, roomType } = req.body;

    // Supported models in order of user preference
    const primaryModel = 'gemini-3.1-flash-image-preview';
    const fallbackModel = 'gemini-3.1-flash-lite-image';

    const promptText = `High-end architectural interior photography of a complete room transformation into ${styleName || 'Mid-Century Modern'} style for a ${roomType || 'Living Room'}.
Architectural Details: ${stylePrompt || 'Refined materials, balanced natural light, iconic furniture'}.
${refinementPrompt ? `Specific Design Refinements: ${refinementPrompt}` : ''}
Key requirements: Maintain exact room architectural footprint, walls, ceiling height, and window placement of the space. Photorealistic 8k, Architectural Digest editorial feature, pristine interior lighting, tactile textures, no artificial blur.`;

    const parts: any[] = [];

    // If an uploaded or existing room image was supplied (data:image/...;base64,... or pure base64)
    if (baseImage && typeof baseImage === 'string') {
      let mimeType = 'image/jpeg';
      let data = baseImage;
      if (baseImage.startsWith('data:')) {
        const matches = baseImage.match(/^data:([^;]+);base64,(.+)$/);
        if (matches) {
          mimeType = matches[1];
          data = matches[2];
        }
      }
      parts.push({
        inlineData: {
          mimeType,
          data,
        },
      });
      parts.push({
        text: `Transform this interior space: ${promptText}. Keep the spatial geometry identical while replacing all furniture, finishes, wall treatments, and lighting to match this style.`,
      });
    } else {
      parts.push({
        text: promptText,
      });
    }

    let response;
    try {
      response = await ai.models.generateContent({
        model: primaryModel,
        contents: { parts },
        config: {
          imageConfig: {
            aspectRatio: '16:9',
          },
        },
      });
    } catch (primaryErr: any) {
      console.warn(`Primary model ${primaryModel} failed (${primaryErr.message}), trying ${fallbackModel}...`);
      response = await ai.models.generateContent({
        model: fallbackModel,
        contents: { parts },
        config: {
          imageConfig: {
            aspectRatio: '16:9',
          },
        },
      });
    }

    let generatedImageUrl = '';
    let notes = '';

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          generatedImageUrl = `data:${part.inlineData.mimeType || 'image/jpeg'};base64,${part.inlineData.data}`;
        } else if (part.text) {
          notes += part.text;
        }
      }
    }

    if (!generatedImageUrl) {
      throw new Error('No image was returned by the generation model.');
    }

    return res.json({
      imageUrl: generatedImageUrl,
      notes,
      styleName,
      timestamp: Date.now(),
    });
  } catch (error: any) {
    console.error('Generate Design Error:', error);
    return res.status(500).json({
      error: 'Failed to generate reimagined room',
      details: error.message,
    });
  }
});

// 3. Shoppable Breakdown for Room
app.post('/api/extract-shoppable-items', async (req, res) => {
  try {
    const { styleName, description } = req.body;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Provide 5 authentic, high-end shoppable furniture and decor pieces found in a ${styleName} interior space (${description || ''}).
Return specific designer items that can be purchased online.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              category: { type: Type.STRING },
              priceRange: { type: Type.STRING },
              material: { type: Type.STRING },
              dimensions: { type: Type.STRING },
              stylingTip: { type: Type.STRING },
              searchQuery: { type: Type.STRING },
            },
            required: ['name', 'category', 'priceRange', 'material', 'searchQuery', 'stylingTip'],
          },
        },
      },
    });

    const items = JSON.parse(response.text || '[]');
    return res.json({ items });
  } catch (error: any) {
    console.error('Extract shoppable items error:', error);
    return res.status(500).json({ error: error.message });
  }
});

// Mount Vite or serve static
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Interior Design Consultant server running on port ${PORT}`);
  });
}

startServer();
