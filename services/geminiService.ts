import { GoogleGenAI } from "@google/genai";
import { SearchResult } from "../types";

// Initialize the Gemini API client with the production API key
const ai = new GoogleGenAI({ apiKey: 'AIzaSyC3RGYIsyOGgx61hfdCZ2WWB50tDXH6WIw' });

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
    // Check daily limit
    if (!checkAndIncrementLimit()) {
      throw new Error(`Daily limit of ${DAILY_LIMIT} requests reached. Please try again tomorrow.`);
    }

    const modelId = 'gemini-2.5-flash';

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

    // 3. "Generate" Images (Using Pollinations as a renderer for the Gemini-generated prompts)
    // This fulfills "generated through llm" by using the LLM's prompt to drive the generation.
    const pollinationsFrontUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompts.frontPrompt + " book cover design, high quality, 8k, text title")}`;
    const pollinationsBackUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompts.backPrompt + " book back cover, matching style, high quality")}`;

    // Use proxy to avoid CORS issues
    const proxyBaseUrl = 'https://us-central1-ted-search-478518.cloudfunctions.net/imageProxy';
    const frontUrl = `${proxyBaseUrl}?url=${encodeURIComponent(pollinationsFrontUrl)}`;
    const backUrl = `${proxyBaseUrl}?url=${encodeURIComponent(pollinationsBackUrl)}`;

    // 4. Construct the Markdown Response
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
      groundingMetadata: null, // No search grounding as requested
    };

  } catch (error: any) {
    console.error("Gemini Generation Error:", error);
    console.error("Error details:", {
      message: error?.message,
      status: error?.status,
      statusText: error?.statusText,
      response: error?.response
    });

    // Provide more specific error messages
    if (error?.message?.includes('quota')) {
      throw new Error('API quota exceeded. Please try again later.');
    } else if (error?.message?.includes('API key')) {
      throw new Error('API key error. Please contact support.');
    } else if (error?.message?.includes('Daily limit')) {
      throw error; // Re-throw daily limit errors as-is
    } else {
      throw new Error(`Failed to generate covers: ${error?.message || 'Unknown error'}`);
    }
  }
};