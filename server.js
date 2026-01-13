/**
 * NEZUKO V3 ULTIMATE - VERCEL COMPATIBLE
 * Developed by: Tanakah Dev
 */

const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');

const app = express();

// Base API Configuration
const OMEGA_API_BASE = process.env.API_BASE_URL || 'https://omegatech-api.dixonomega.tech/api/ai';

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

/**
 * AI PROXY ROUTE
 */
app.get('/api/proxy', async (req, res) => {
    const { type, prompt, text } = req.query;

    if (!type) {
        return res.status(400).json({ error: 'Missing service type' });
    }

    let targetUrl = '';

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
        const response = await axios.get(targetUrl, { timeout: 60000 });
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'AI Service unavailable', details: error.message });
    }
});

// Root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// EXPORT FOR VERCEL
module.exports = app;
