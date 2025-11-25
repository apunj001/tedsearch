import { GoogleGenAI } from "@google/genai";
import { SearchResult } from "../types";

// Initialize the Gemini API client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const searchBookCovers = async (query: string): Promise<SearchResult> => {
  try {
    // We use gemini-2.5-flash for fast, grounded search results
    const modelId = 'gemini-2.5-flash';

    const prompt = `
      I want to find visual information about the book cover for: "${query}".
      
      Please perform a Google Search to find various editions and cover art for this book.
      
      Return a response that:
      1. Describes the most iconic or popular cover art for this book vividly.
      2. Mentions any distinct differences between US, UK, or special edition covers.
      3. Lists the publishers associated with these covers.
      
      Do NOT strictly focus only on text summary; focus on visual description of the covers found in the search results.
    `;

    // Call Gemini with Google Search grounding enabled
    const config = {
      tools: [{ googleSearch: {} }],
    };

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config,
    });

    const candidate = response.candidates?.[0];
    const text = candidate?.content?.parts?.[0]?.text || "No description available.";
    const groundingMetadata = candidate?.groundingMetadata || null;

    return {
      text,
      groundingMetadata,
    };

  } catch (error) {
    console.error("Gemini Search Error:", error);
    throw error;
  }
};