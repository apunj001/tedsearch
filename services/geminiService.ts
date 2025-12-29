import { GoogleGenAI } from "@google/genai";
import { SearchResult } from "../types";

// Add type definition for Vite env
interface ImportMetaEnv {
  readonly VITE_GEMINI_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Initialize the Gemini API client
// Use the key from .env.local (VITE_GEMINI_API_KEY) or fallback to empty string to prevent crash
const apiKey = import.meta.env?.VITE_GEMINI_API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

const DAILY_LIMIT = 100;
const STORAGE_KEY = 'coverquest_daily_usage';

const checkAndIncrementLimit = (): boolean => {
  const today = new Date().toISOString().split('T')[0];
  const stored = localStorage.getItem(STORAGE_KEY);
  let usage = { date: today, count: 0 };

  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (parsed.date === today) {
        usage = parsed;
      }
    } catch (e) {
      // Reset if parsing fails
    }
  }

  if (usage.count >= DAILY_LIMIT) {
    return false;
  }

  usage.count++;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(usage));
  return true;
};

export const searchBookCovers = async (query: string): Promise<SearchResult> => {
  try {
    if (!apiKey) {
      throw new Error("API Key not found. Please check .env.local");
    }

    // Check daily limit
    if (!checkAndIncrementLimit()) {
      throw new Error(`Daily limit of ${DAILY_LIMIT} requests reached. Please try again tomorrow.`);
    }

    const modelId = 'gemini-2.0-flash-exp';

    // Generate Optimized Prompts for Front and Back Covers
    const promptGenPrompt = `
      Based on this description: "${query}"

      Create two highly detailed, artistic image generation prompts:
      1. **Front Cover**: Focus on the main title, central imagery, and mood.
      2. **Back Cover**: Focus on a complementary scene, blurb placeholder, and consistent style.

      Return a JSON object:
      {
        "frontPrompt": "string",
        "backPrompt": "string",
        "artStyle": "string description of the style",
        "artistReference": "string name of an artist style to emulate"
      }
    `;

    const promptResponse = await ai.models.generateContent({
      model: modelId,
      contents: promptGenPrompt,
      config: { responseMimeType: 'application/json' }
    });

    const prompts = JSON.parse(promptResponse.candidates?.[0]?.content?.parts?.[0]?.text || '{}');

    // Build image URLs with random seeds to ensure uniqueness
    const seed1 = Math.floor(Math.random() * 1000000);
    const seed2 = Math.floor(Math.random() * 1000000);

    const pollinationsFrontUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompts.frontPrompt + " book cover design, front view, title text, high quality, 8k")}?seed=${seed1}&width=1024&height=1536&nologo=true`;
    const pollinationsBackUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompts.backPrompt + " book back cover, back view, blurb text layout, matching style, high quality")}?seed=${seed2}&width=1024&height=1536&nologo=true`;

    // Use proxy to avoid CORS issues
    const proxyBaseUrl = 'https://us-central1-ted-search-478518.cloudfunctions.net/imageProxy';
    const frontUrl = `${proxyBaseUrl}?url=${encodeURIComponent(pollinationsFrontUrl)}`;
    const backUrl = `${proxyBaseUrl}?url=${encodeURIComponent(pollinationsBackUrl)}`;

    // Construct the Markdown Response
    const markdown = `
## Front Cover
![Front Cover](${frontUrl})

## Back Cover
![Back Cover](${backUrl})

## Art Description
**Style:** ${prompts.artStyle}
**Artist Style:** ${prompts.artistReference}

**Front Prompt:** ${prompts.frontPrompt}

**Back Prompt:** ${prompts.backPrompt}
    `;

    return {
      text: markdown,
      groundingMetadata: null,
    };

  } catch (error: any) {
    console.error("Gemini Generation Error:", error);
    throw error;
  }
};