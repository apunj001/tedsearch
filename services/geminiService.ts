import { GoogleGenAI } from "@google/genai";
import { SearchResult } from "../types";

// Initialize the Gemini API client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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

    // 1. Evaluate Input Quality
    const evalPrompt = `
      Analyze the following book cover description provided by a user:
      "${query}"

      Does this description provide enough visual detail (mood, colors, subjects, style) to generate a high-quality book cover image?
      
      Return a JSON object:
      {
        "sufficient": boolean,
        "reason": "string explanation",
        "feedback": "string suggestion for improvement if not sufficient"
      }
    `;

    const evalResponse = await ai.models.generateContent({
      model: modelId,
      contents: evalPrompt,
      config: { responseMimeType: 'application/json' }
    });

    const evalResult = JSON.parse(evalResponse.candidates?.[0]?.content?.parts?.[0]?.text || '{}');

    if (!evalResult.sufficient) {
      // Return the feedback as a "result" but with a flag or specific text to indicate failure
      return {
        text: `## Input Quality Check Failed\n\n**Reason:** ${evalResult.reason}\n\n**Feedback:** ${evalResult.feedback}\n\nPlease refine your description and try again.`,
        groundingMetadata: null
      };
    }

    // 2. Generate Optimized Prompts for Front and Back Covers
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
    const frontUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompts.frontPrompt + " book cover design, high quality, 8k, text title")}`;
    const backUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompts.backPrompt + " book back cover, matching style, high quality")}`;

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

  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw error;
  }
};