require('dotenv').config()
const express = require('express');
const axios = require('axios');
const uuid = require('uuid');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

// Directory to save MP3 files
const AUDIO_DIR = '/var/www/html/audio/';

// Ensure the directory exists
fs.mkdirSync(AUDIO_DIR, { recursive: true });

// ElevenLabs API settings
const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1/text-to-speech/TMvmhlKUioQA4U7LOoko';
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY; // Replace with your actual API key

app.post('/api/convert', async (req, res) => {
    const text = req.body.text;
    if (!text) {
        return res.status(400).json({ error: 'Text is required' });
    }

    // Prepare payload for ElevenLabs API
    const payload = {
        text: text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75
        }
    };

    const headers = {
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY
    };

    try {
        // Call ElevenLabs API
        const response = await axios.post(ELEVENLABS_API_URL, payload, { headers, responseType: 'arraybuffer' });

        // Generate a unique filename
        const filename = `${uuid.v4()}.mp3`;
        const filePath = path.join(AUDIO_DIR, filename);

        // Save MP3 file
        fs.writeFileSync(filePath, response.data);

        // Construct the URL to access the MP3 file
        const fileUrl = `http://${process.env.DOMAIN}/audio/${filename}`; // Replace 'yourdomain.com' with your actual domain or IP

        return res.status(200).json({ url: fileUrl });
    } catch (error) {
        console.error('Error calling ElevenLabs API:', error.response ? error.response.data : error.message);
        return res.status(500).json({ error: 'Failed to generate speech' });
    }
});

app.listen(3333, () => {
    console.log('Server is running on port 3333');
});
