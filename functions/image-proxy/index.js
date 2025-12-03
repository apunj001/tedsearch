const fetch = require('node-fetch');

exports.imageProxy = async (req, res) => {
    // Enable CORS
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(204).send('');
        return;
    }

    if (req.method !== 'GET') {
        res.status(405).send('Method Not Allowed');
        return;
    }

    try {
        const imageUrl = req.query.url;

        if (!imageUrl) {
            res.status(400).json({ error: 'Missing url parameter' });
            return;
        }

        // Fetch image from Pollinations.ai
        const response = await fetch(imageUrl);

        if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.statusText}`);
        }

        const buffer = await response.buffer();
        const contentType = response.headers.get('content-type') || 'image/png';

        // Set appropriate headers
        res.set('Content-Type', contentType);
        res.set('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours

        // Send image
        res.send(buffer);
    } catch (error) {
        console.error('Error proxying image:', error);
        res.status(500).json({ error: error.message });
    }
};
