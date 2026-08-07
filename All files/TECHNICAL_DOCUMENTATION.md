# Technical Documentation: Jyothishya Sanathanam (Vedic & KP Astrology Engine)

## 1. Project Overview
- **Name:** Jyothishya Sanathanam
- **Description:** A comprehensive web-based Vedic and Krishnamurti Paddhati (KP) astrology application. The application generates birth charts, evaluates 6+ core life domains, calculates marriage compatibility (Ashta Kuta / Dashakuta & Manglik Dosha), and runs deterministic stellar calculations for predictions, blending ancient Vedic principles with modern agentic AI-assisted interpretations (streaming SSE, multi-turn chat, search grounding, and persona toggles).

## 2. System Architecture
### 2.1 High-Level Architecture
- **Frontend Layer:** React 19 SPA built with Vite and Tailwind CSS v4. Handles state management, UI rendering, client-side caching (via LocalStorage), real-time SSE streaming consumption, and user interactions.
- **Backend/API Gateway Layer:** Node.js Express server (`server.ts`) acting as an API gateway, rate limiter, circuit breaker, and AI proxy. Exposes endpoints for Gemini AI astrological consultation generation, query intent recognition, and streaming chat sessions.
- **Resilience & Observability Subsystem:**
  - **Request Tracing (`requestContext.ts`):** Injects unique correlation IDs (`X-Trace-ID`) into all incoming HTTP requests for structured logging.
  - **Token-Bucket Rate Limiter (`RateLimiter.ts`):** Prevents API quota exhaustion (120 requests/min capacity with automatic token refilling).
  - **Circuit Breaker (`CircuitBreaker.ts`):** Protects downstream Gemini API calls from cascading failures (`CLOSED`, `OPEN`, `HALF_OPEN` states).
  - **Smart Model Router (`ModelRoutingService.ts`):** Dynamically selects Gemini models (`gemini-3.6-flash`, `gemini-3.1-pro-preview`, `gemini-2.5-pro`) based on latency, priority, and fallback rules.
- **Core Calculation Engines:** 
  - **Remote Ephemeris Service:** External Jagannatha Hora API endpoint (`/horoscope`) for core ephemeris, panchanga, and divisional chart computations (D-1 to D-60).
  - **Local KP & Vedic Deterministic Engine:** Custom TypeScript modules (`src/lib/engines/` and `src/lib/kp/`) for Vimshottari dasha scaling, proportional sub-lord mappings, Placidus house cusps, 8-step KP verdict processing, 4-tier significator analysis, and Gochara transits.
  - **Marriage Compatibility Engine:** Specialized calculators (`src/lib/bhakootCalculator.ts`, `src/lib/yoniKutaCalculator.ts`, `src/lib/manglikDosha.ts`, `src/lib/marriageMatchAPI.ts`) for Ashta Kuta scoring, Bhakoot, Yoni Kuta, and Manglik Dosha evaluations.
- **Persistence & Cloud Sync Layer:** 
  - **Firebase Authentication:** Secure user authentication and session management (`src/lib/auth/`).
  - **Profile & Local Storage:** `ProfileStorageService` and `savedPersons.ts` for local profile management and chart caching.
  - **Google Drive Sync:** `DriveSyncService` and `GoogleDriveSync.tsx` for cross-device backup and restoration of astrological reports to Google Drive.

## 3. Technology Stack
- **Frontend Framework:** React 19 + TypeScript
- **Build Tool / Bundler:** Vite 6 & ESBuild
- **Styling & UI:** Tailwind CSS v4 (`@tailwindcss/vite`)
- **Animations:** Framer Motion (`motion` v12)
- **Backend Framework:** Express v4 (Node.js) with `tsx` dev runner
- **AI Integration:** `@google/genai` v2.4+ (Gemini 3.6 Flash, Gemini 3.1 Pro Preview, Gemini 2.5 Pro) with Google Search Grounding & Server-Sent Events (SSE) streaming
- **Authentication:** Firebase Auth v12
- **Icons & Markdown:** Lucide React, React Markdown
- **Testing:** Cypress v15 (E2E), Jest (Unit Tests)

## 4. Key Directories & File Structure
```
├── server.ts                             # Express backend gateway, rate limiter, circuit breaker, and Gemini AI proxy
├── package.json                          # Manifest, dependencies, and esbuild bundling scripts
├── index.html                            # Application HTML entry point
├── metadata.json                         # Platform capabilities metadata
├── src/
│   ├── main.tsx                          # React entry point
│   ├── App.tsx                           # Main application layout, navigation tabs, and global state
│   ├── types.ts                          # Shared core TypeScript types and interfaces
│   ├── types/                            # Domain-specific types (chart.ts, kp.ts, marriageMatch.ts)
│   ├── components/
│   │   ├── BirthForm.tsx                 # Primary birth details input form
│   │   ├── Header.tsx                    # Top navigation, user profile avatar, and Drive sync status
│   │   ├── BirthChartReport/             # Birth Chart Report V2 (Executive summary, phase card, deep dive accordions)
│   │   ├── KP/                           # KP Astrology components (CuspTable, QueryVerdictPanel, DomainPredictionsView, RulingPlanetsWidget, VimshottariDashaTab)
│   │   ├── AdvancedAITab.tsx             # Advanced Agentic AI consultation tab container
│   │   ├── AdvancedAI/                   # AI Chat Panel, LeftSidebar, GroundTruthInspectorDrawer, Mobile drawers
│   │   ├── DivisionalChart.tsx           # D-1 to D-60 chart views
│   │   ├── VimshottariDashaView.tsx      # Dasha/Bhukti tree view
│   │   ├── PlanetaryStrengthView.tsx     # Shadbala / Ashtakavarga planetary strength cards
│   │   ├── DoshasView.tsx                # Dosha breakdown (Manglik, Kaal Sarp, Kuta)
│   │   ├── YogasView.tsx                 # Planetary Yoga recognizer view
│   │   ├── PanchangamView.tsx            # Daily Panchangam and Tithi details
│   │   ├── MarriageMatch.tsx             # Ashta Kuta marriage matching page
│   │   ├── GoogleDriveSync.tsx           # Google Drive cloud sync manager
│   │   └── SaveToDriveButton.tsx         # Quick report export button
│   ├── pages/
│   │   ├── MarriageMatch.tsx             # Dedicated page route for Marriage Match feature
│   │   └── AdvancedAIPage.tsx            # Standalone route wrapper for Advanced AI tab
│   ├── lib/
│   │   ├── kp/                           # KP Stellar engine (proportionalSubCalculator, gatekeeperRules, kpVerdictEngine, significatorAnalyzer, queryIntent)
│   │   ├── engines/                      # DashaEngine, TransitEngine, QueryConsultationEngine
│   │   ├── services/                     # AdvancedAIService, EnhancedGeminiConsultationService, ModelRoutingService
│   │   ├── resilience/                   # RateLimiter, CircuitBreaker
│   │   ├── observability/                # requestContext (Trace ID correlation)
│   │   ├── auth/                         # firebaseAuth, sessionManager, authService
│   │   ├── bhakootCalculator.ts          # Bhakoot Kuta compatibility math
│   │   ├── yoniKutaCalculator.ts         # Yoni Kuta compatibility math
│   │   ├── manglikDosha.ts               # Manglik Dosha detector
│   │   ├── marriageMatchAPI.ts           # Ashta Kuta scoring API wrapper
│   │   ├── driveSyncService.ts           # Google Drive sync service
│   │   └── savedPersons.ts               # Local profile storage manager
│   └── hooks/
│       ├── useAdvancedAIChat.ts          # Multi-turn streaming chat hook
│       ├── useConsultation.ts            # SWR-style chart report consultation hook
│       ├── useQueryConsultation.ts       # KP Query consultation hook
│       └── useTextStreamBuffer.ts        # Smooth SSE typewriter text buffer
```

## 5. API Integrations

### 5.1 Internal Backend APIs (`server.ts`)

- **`POST /api/advanced-ai`**: Executes Search-Grounded Gemini AI astrological consultations.
  - **Features:** Integrates Google Search Grounding (`tools: [{ googleSearch: {} }]`), automatic model fallback chain (`gemini-3.6-flash` → `gemini-3.1-pro-preview` → `gemini-2.5-pro`), grounding citations, and formatting guardrails.
  - **Payload:** `{ prompt, systemInstructionOverride, language, userQuery, chartSummary }`

- **`POST /api/advanced-ai/stream`**: Real-time Server-Sent Events (SSE) streaming consultation endpoint (`text/event-stream`).
  - **Features:** Emits token-by-token typewriter streams, supports multi-turn chat sessions (`ai.chats.create`), persona toggles (`kp_stellar`, `classical_jyotish`, `modern`), and fallback mechanisms.
  - **Payload:** `{ prompt, userQuery, conversationHistory, persona, language, systemInstructionOverride }`

- **`POST /api/consultation`**: Generates structured JSON astrological readings via Gemini 3.6 Flash / 2.5 Pro with automatic graceful fallback to local deterministic rules.
  - **Payload:** `{ prompt, language }`

- **`POST /api/kp/verdict`**: Enhances raw deterministic 8-step KP rule outputs with generative astrological explanations.
  - **Payload:** `{ query, chart, baseVerdict }`

- **`POST /api/kp/recognize-intent`**: Natural Language Intent Recognition endpoint. Classifies raw user queries (e.g., *"When will I buy a house?"*) into KP astrological domains (PROPERTY) and primary/secondary house numbers (4, 2, 9, 11) with confidence scores.
  - **Payload:** `{ query }`

### 5.2 External APIs
- **Jagannatha Hora Ephemeris Service (`https://jagannatha-hora-359167915530.europe-west1.run.app`)**: Remote engine called for heavy ephemeris calculations, planetary longitudes, D-charts, and panchanga attributes.
- **Google GenAI API (`@google/genai`)**: Server-side SDK used to invoke Gemini 3.6 Flash and search grounding securely.
- **Google Drive API**: OAuth-based integration for backing up birth charts and reports to the user's personal Google Drive folder.

## 6. Setup & Deployment Instructions

### 6.1 Prerequisites
- Node.js (v20+)
- Firebase Project Configuration
- Google Gemini API Key (`GEMINI_API_KEY`)
- Google Cloud OAuth Client ID (for Google Drive sync)

### 6.2 Environment Configuration
Create a `.env` file at the root with the required environment variables (see `.env.example`):
```env
GEMINI_API_KEY=your_gemini_api_key_here
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
VITE_GOOGLE_CLIENT_ID=your_oauth_client_id
```

### 6.3 Development Workflow
```bash
# Install dependencies
npm install

# Start Express server with Vite dev middleware on port 3000
npm run dev
```

### 6.4 Production Build & Deployment
```bash
# Type check and build client assets into /dist, bundle server into /dist/server.cjs
npm run build

# Start production Node.js server
npm start
```
The server binds to port `3000` and host `0.0.0.0` for deployment in Cloud Run or Docker containers.

## 7. Key Data Models

### 7.1 BirthDetails
```typescript
export interface BirthDetails {
  name: string;
  gender: string;
  date: string;       // YYYY-MM-DD
  time: string;       // HH:MM:SS
  place: string;
  latitude: number;
  longitude: number;
  timezone: number;
}
```

### 7.2 KPVerdict
```typescript
export interface KPVerdict {
  promise: 'YES' | 'DELAYED' | 'NO';
  timing: string;
  quality: 'EXCELLENT' | 'GOOD' | 'MIXED' | 'CHALLENGING';
  confidence: number;
  reasoning: {
    relevantHouse: number;
    cuspSubLord: string;
    gatekeeperStatus: 'OPEN' | 'CLOSED';
    activeDashaSignifies: boolean;
    transitAgrees: boolean;
  };
  explanation?: string;
}
```

### 7.3 AshtaKutaResult
```typescript
export interface AshtaKutaResult {
  totalScore: number;
  maxScore: number;
  percentage: number;
  kutas: {
    varna: { score: number; max: number; description: string };
    vashya: { score: number; max: number; description: string };
    tara: { score: number; max: number; description: string };
    yoni: { score: number; max: number; description: string };
    grahaMaitri: { score: number; max: number; description: string };
    gana: { score: number; max: number; description: string };
    bhakoot: { score: number; max: number; description: string };
    nadi: { score: number; max: number; description: string };
  };
  manglikDosha: {
    boy: { isManglik: boolean; severity: string };
    girl: { isManglik: boolean; severity: string };
    cancelled: boolean;
  };
}
```
