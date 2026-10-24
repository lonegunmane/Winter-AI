# ❄️ Winter – Personal AI Assistant (PWA)

Winter is an ultra-lightweight, high-performance Progressive Web App (PWA) designed to run smoothly on low-spec hardware (old laptops with 8GB RAM, older phones like Huawei P20 and iPhone X).

---

## ✨ Key Features

1. **Lightweight & High-Performance**:
   - Zero unnecessary bloat (< 50 MB total footprint).
   - Fast first-load paint and smooth 60fps scrolling on older mobile GPUs.
   - Low memory consumption with automatic local storage pruning.

2. **Progressive Web App (PWA)**:
   - Full offline support with Service Worker precaching.
   - 1-Click Install for **Windows 11** (Chrome/Edge) and **Android** (Huawei P20 Chrome/Browser).
   - Guided **iOS** (iPhone X) Add to Home Screen instructions.
   - Native standalone windowing (no browser URL bar).

3. **Powered by Google Gemini Flash**:
   - Uses ultra-low-latency Flash models: **Gemini 3.8 Flash** & **Gemini 3.1 Flash Lite**.
   - Real-time streaming responses via Server-Sent Events (SSE).
   - Configurable temperature (0.0 to 1.5) and customizable system persona.

4. **Winter Personality**:
   - Calm, clear, intelligent, and subtly warm.
   - Concise and structured by default; thoroughly detailed when requested.

5. **Local Privacy & Storage**:
   - All messages saved securely in `localStorage`.
   - Export chat history as **Markdown (.md)** or **JSON (.json)**.
   - 1-click Delete/Clear history.

6. **Accessibility & Ergonomics**:
   - Native browser Text-to-Speech (read messages aloud with 0 extra bundle size).
   - 1-click code block copying with language syntax badges.
   - Dark / Light / System theme toggle.
   - Font size scaling: Compact, Normal, Relaxed.

---

## 🔑 How to Add Your Gemini API Key

1. **Via the App Settings (Recommended)**:
   - Tap the ⚙️ **Settings** icon in the top header.
   - In the **AI & API Key** tab, paste your Gemini API key.
   - (Optional) Tap **Test Key** to verify your connection immediately.
   - Tap **Save & Apply**.
   - Your key is saved locally in your browser's private storage.

2. **Via Environment Variable** (for server deployments):
   - Set `GEMINI_API_KEY="your-api-key"` in `.env`.
   - Winter will automatically detect and use it for all sessions.

> Get a free Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey).

---

## 📱 How to Install on Devices

### Windows 11 (Chrome / Edge)
1. Open Winter in Chrome or Edge.
2. Click the **Install App** button in the header (or click the install icon in the browser address bar).
3. Winter will open in its own clean standalone app window.

### Android (Huawei P20)
1. Open Winter in Chrome or browser.
2. Tap the **Install App** button or the 3 dots menu `⋮` -> **Add to Home screen** / **Install App**.
3. Winter will appear on your app drawer and home screen.

### iOS (iPhone X)
1. Open Winter in Safari.
2. Tap the **Share** button in Safari's bottom toolbar.
3. Scroll down and tap **Add to Home Screen**.

---

## 🚀 Deployment Options

### Local Development
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000).

### Build for Production
```bash
npm run build
npm run start
```

### Deploy to Vercel / Netlify
- Build Command: `npm run build`
- Output Directory: `dist`
