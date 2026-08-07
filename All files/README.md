# Jyothishya Sanathanam — Vedic & KP Astrology Engine

An advanced, full-stack Vedic and Krishnamurti Paddhati (KP) astrology application. It combines deterministic astronomical algorithms (ephemeris, Placidus house cusps, proportional Vimshottari sub-lords, 8-step KP verdict chain, Ashta Kuta marriage matching) with modern Large Language Models via Google's `@google/genai` SDK (`gemini-3.6-flash`).

---

## 🌟 Key Features

1. **Vedic Birth Chart Reports (V2)**
   - Lagna, Navamsa (D-9), and D-1 to D-60 Divisional Charts
   - Vimshottari Dasha, Bhukti, and Pratyantar Dasha tree breakdown
   - Executive summaries, domain highlights (Career, Finance, Marriage, Health, Education, Assets), and current phase cards
   - Planetary strengths (Shadbala / Ashtakavarga), Yogas, and Doshas (Manglik, Kaal Sarp, etc.)

2. **KP Stellar Astrology Engine**
   - Placidus house cusp table generator with Cusp Sub-Lords
   - Proportional Vimshottari duration scaling for textbook sub-lord accuracy
   - Automated 8-Step KP Verification Verdicts (Promise: YES / DELAYED / NO)
   - House Gatekeeper Rules enforcement & 4-tier Significator strength analysis
   - Real-time Ruling Planets widget and natural language Query Intent Recognizer

3. **Advanced Agentic AI Consultation**
   - Multi-turn interactive chat sessions with real-time SSE streaming (`/api/advanced-ai/stream`)
   - Google Search Grounding (`tools: [{ googleSearch: {} }]`) for real-time web research
   - Persona Toggles: KP Stellar Focus, Classical Jyotish, and Modern / Practical Advice
   - Ground Truth Inspector Drawer displaying active KP gatekeepers and planetary promises
   - Multilingual support (English, Hindi, Telugu)

4. **Ashta Kuta Marriage Matching**
   - 36-point Guna Milan breakdown (Varna, Vashya, Tara, Yoni, Graha Maitri, Gana, Bhakoot, Nadi)
   - Manglik Dosha analysis and cancellation rules for both partners
   - Synastry compatibility gauges and detailed rule cards

5. **Cloud Persistence & Google Drive Backup**
   - Firebase Authentication for user accounts
   - Google Drive sync integration for saving and backing up chart JSON reports

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v20+)
- Google Gemini API Key (`GEMINI_API_KEY`)

### Installation & Execution

```bash
# 1. Install dependencies
npm install

# 2. Configure environment variables in .env
cp .env.example .env
# Set GEMINI_API_KEY=your_gemini_api_key

# 3. Start development server (Express + Vite on port 3000)
npm run dev
```

Open `http://localhost:3000` in your browser.

---

## 🛠 Production Build & Deployment

```bash
# Type check and bundle client & server
npm run build

# Start production server
npm start
```

---

## 📚 Technical Documentation Files

For in-depth architectural details, API specifications, and calculation rules:
- **[TECHNICAL_DOCUMENTATION.md](./TECHNICAL_DOCUMENTATION.md)** — Master technical documentation, architecture overview, Express API endpoints (`/api/advanced-ai`, `/api/advanced-ai/stream`, `/api/consultation`, `/api/kp/verdict`, `/api/kp/recognize-intent`), technology stack, and data models.
- **[ADVANCED_AI_TAB_TECHNICAL_DOCUMENTATION.md](./ADVANCED_AI_TAB_TECHNICAL_DOCUMENTATION.md)** — Detailed specification for the Agentic AI consultation tab, SSE streaming pipeline, search grounding, rate limiting, and circuit breaker.
- **[KP_ASTROLOGY_PROJECT_DOCUMENTATION.md](./KP_ASTROLOGY_PROJECT_DOCUMENTATION.md)** — In-depth guide to Krishnamurti Paddhati principles, proportional sub-lord calculations, Placidus cusps, gatekeeper logic, and the 8-step verdict chain.
