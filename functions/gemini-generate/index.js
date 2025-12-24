const { GoogleGenAI } = require('@google/genai');

// Initialize Gemini with API key from environment
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

exports.geminiGenerate = async (req, res) => {
    // Enable CORS
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(204).send('');
        return;
    }

    if (req.method !== 'POST') {
        res.status(405).send('Method Not Allowed');
        return;
    }

    try {
        const { query } = req.body;

        if (!query) {
            res.status(400).json({ error: 'Query is required' });
            return;
        }

        const modelId = 'gemini-2.0-flash-exp';

        // Generate prompts
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

        // Build image URLs
        const pollinationsFrontUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompts.frontPrompt + " book cover design, high quality, 8k, text title")}`;
        const pollinationsBackUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompts.backPrompt + " book back cover, matching style, high quality")}`;

        const proxyBaseUrl = 'https://us-central1-ted-search-478518.cloudfunctions.net/imageProxy';
        const frontUrl = `${proxyBaseUrl}?url=${encodeURIComponent(pollinationsFrontUrl)}`;
        const backUrl = `${proxyBaseUrl}?url=${encodeURIComponent(pollinationsBackUrl)}`;

        // Return response
        res.json({
            frontUrl,
            backUrl,
            frontPrompt: prompts.frontPrompt,
            backPrompt: prompts.backPrompt,
            artStyle: prompts.artStyle,
            artistReference: prompts.artistReference
        });

    } catch (error) {
        console.error('Gemini Generation Error:', error);
        res.status(500).json({
            error: 'Failed to generate covers',
            message: error.message
        });
    }
};
