import { SearchResult } from "../types";

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

    // Call the Cloud Function
    const response = await fetch('https://us-central1-ted-search-478518.cloudfunctions.net/geminiGenerate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Server error: ${response.status}`);
    }

    const data = await response.json();

    // Construct the Markdown Response
    const markdown = `
## Front Cover
![Front Cover](${data.frontUrl})

## Back Cover
![Back Cover](${data.backUrl})

## Art Description
**Style:** ${data.artStyle}
**Artist Style:** ${data.artistReference}

**Front Prompt:** ${data.frontPrompt}

**Back Prompt:** ${data.backPrompt}
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