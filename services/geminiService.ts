import { GoogleGenAI } from "@google/genai";
import { SearchResult } from "../types";

// Initialize the Gemini API client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const searchBookCovers = async (query: string): Promise<SearchResult> => {
  try {
    // We use gemini-2.5-flash for fast, grounded search results
    const modelId = 'gemini-2.5-flash';

    const prompt = `
      Subject: "${query}"
      
      Task: Search for and display the **Front Cover Image** and **Back Cover Image** of this book. 
      
      Guidance:
      - I want to see the **Artwork** of the cover (the image of the book front).
      - Find a direct image URL (ending in .jpg, .png, .webp, etc) for the Front Cover.
      - Find a direct image URL for the Back Cover.
      - If you cannot find a Back Cover, just return the Front Cover.
      - Provide a brief description of the art style and the artist if mentioned.

      Output Format (Strict Markdown):
      
      ## Front Cover
      ![Front Cover](INSERT_DIRECT_IMAGE_URL_HERE)
      
      ## Back Cover
      ![Back Cover](INSERT_DIRECT_IMAGE_URL_HERE)
      
      ## Art Description
      **Artist:** [Artist Name or Unknown]
      [Description of the visual artwork, colors, and objects on the cover]
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
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