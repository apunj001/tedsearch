const { Logging } = require('@google-cloud/logging');

const logging = new Logging();
const log = logging.log('coverquest-generations');

exports.logGeneration = async (req, res) => {
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
        const data = req.body;

        // Create log entry
        const metadata = {
            resource: { type: 'global' },
            severity: 'INFO',
        };

        const entry = log.entry(metadata, {
            timestamp: new Date().toISOString(),
            query: data.query,
            frontPrompt: data.frontPrompt,
            backPrompt: data.backPrompt,
            artDetails: data.artDetails,
            sources: data.sources,
            userAgent: req.get('user-agent'),
            ip: req.ip,
        });

        await log.write(entry);

        res.status(200).json({ success: true, message: 'Logged successfully' });
    } catch (error) {
        console.error('Error logging:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};
