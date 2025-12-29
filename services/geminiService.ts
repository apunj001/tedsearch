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
      1. **Front Cover**: Focus on the central visual imagery, the scene, the characters, and the mood. Describe the artwork in detail. Do not focus on the text or title placement.
      2. **Back Cover**: Focus on a complementary background scene or texture that matches the front cover's style.

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

    const rawText = promptResponse.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    console.log("Raw Gemini Response:", rawText);

    // Robust JSON extraction: Find the first '{' and the last '}'
    const jsonStart = rawText.indexOf('{');
    const jsonEnd = rawText.lastIndexOf('}');

    let prompts;
    if (jsonStart !== -1 && jsonEnd !== -1) {
      const jsonString = rawText.substring(jsonStart, jsonEnd + 1);
      try {
        prompts = JSON.parse(jsonString);
      } catch (e) {
        console.error("Failed to parse extracted JSON:", e);
      }
    }

    if (!prompts) {
      console.warn("Using fallback prompts due to parsing failure");
      prompts = {
        frontPrompt: `A highly detailed book cover art for "${query}". Cinematic lighting, 8k resolution, masterpiece.`,
        backPrompt: `A complementary back cover design for "${query}". Texture, atmospheric background, matching style.`,
        artStyle: "Digital Art",
        artistReference: "Midjourney Style"
      };
    }

    // Build image URLs with random seeds to ensure uniqueness
    const seed1 = Math.floor(Math.random() * 1000000);
    const seed2 = Math.floor(Math.random() * 1000000);

    const pollinationsFrontUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompts.frontPrompt + " book cover art, masterpiece, highly detailed, 8k, cinematic lighting")}?seed=${seed1}&width=1024&height=1536&nologo=true`;
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