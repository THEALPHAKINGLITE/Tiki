/**
 * NEZUKO V3 ULTIMATE - BACKEND SERVER
 * Developed by: Tanakah Dev
 * Description: Secure proxy and static server for Nezuko AI Toolkit
 */

const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Use the port provided by the hosting environment (Render/Railway) or default to 3000
const PORT = process.env.PORT || 3000;

// Base API Configuration
const OMEGA_API_BASE = process.env.API_BASE_URL || 'https://omegatech-api.dixonomega.tech/api/ai';

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files (HTML, CSS, JS) from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

/**
 * AI PROXY ROUTE
 * This endpoint handles requests from the frontend to bypass CORS
 * and keep API keys/logic secure on the server side.
 */
app.get('/api/proxy', async (req, res) => {
    const { type, prompt, text } = req.query;

    if (!type) {
        return res.status(400).json({ error: 'Missing service type' });
    }

    let targetUrl = '';

    // Route logic for the various AI modules
    switch (type) {
        case 'sora':
            targetUrl = `${OMEGA_API_BASE}/sora2-create?prompt=${encodeURIComponent(prompt)}`;
            break;
        case 'veo':
            targetUrl = `${OMEGA_API_BASE}/Veo3-v3?prompt=${encodeURIComponent(prompt)}`;
            break;
        case 'img':
        case 'flux':
            targetUrl = `${OMEGA_API_BASE}/flux?prompt=${encodeURIComponent(prompt)}`;
            break;
        case 'chat':
        case 'gemini':
            targetUrl = `${OMEGA_API_BASE}/gemini-2.0-flash?text=${encodeURIComponent(text)}`;
            break;
        default:
            return res.status(404).json({ error: 'AI Module not found' });
    }

    try {
        console.log(`[NEZUKO V3] Requesting ${type} for user...`);
        
        const response = await axios.get(targetUrl, {
            timeout: 60000 // 60 second timeout for video generation
        });

        // Forward the AI data back to the frontend
        res.json(response.data);

    } catch (error) {
        console.error(`[SERVER ERROR] ${error.message}`);
        res.status(500).json({ 
            error: 'AI Service currently unavailable',
            details: error.message 
        });
    }
});

// Root route to serve index.html specifically
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`
    ---------------------------------------------------
    🌸 NEZUKO V3 ULTIMATE - RAINBOW EDITION
    👤 Developed by: Tanakah Dev
    🌐 Server Live: http://localhost:${PORT}
    ---------------------------------------------------
    `);
});
