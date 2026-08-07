# Technical Documentation: Advanced Agentic AI Consultation Tab

**Jyothishya Sanathanam — Vedic & KP Astrology Engine**  
**Module:** Advanced AI Consultation (Multi-Turn Chat, KP Gatekeeper Ground Truths, SSE Streaming, Persona Toggles)

---

## 1. System Architecture Overview

The Advanced AI Consultation module transforms standard static astrological report generation into an **interactive, agentic, multi-turn AI consultation experience**. It combines deterministic astrological calculations (8-step KP verification, house gatekeepers, Dasha timings) with state-of-the-art Large Language Model capabilities powered by Google's `@google/genai` SDK (`gemini-3.6-flash`).

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Frontend: AdvancedAITab.tsx                     │
│  - Multi-Turn Chat UI     - Persona Toggles      - Real-Time Streaming │
│  - KP Ground Truths Card  - Fact Inspector       - Interactive Tooltips│
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP / SSE Stream
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   Backend Proxy: Express Server (server.ts)            │
│  - Request Tracing (X-Trace-ID)   - Token-Bucket Rate Limiter (120 RPM)│
│  - Circuit Breaker Pattern        - Smart Model Routing (Cost/Latency) │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ SDK / API Calls
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                 Google Gemini API & `@google/genai` SDK                │
│  - Gemini 3.6 Flash / Pro         - System Instruction Grounding       │
│  - Chat Sessions (`ai.chats.create`) - Streaming Server-Sent Events     │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Core Architectural Pillars

### 2.1 Hybrid Context Framing (KP Verdict + Deep Synthesis)
To eliminate LLM hallucination and contradictory astrological claims:
1. **Deterministic Computation**: Before prompting Gemini, the engine computes the 8-Step KP Verification Chain and House Gatekeeper statuses via `EnhancedGeminiConsultationService`.
2. **Immutable Ground Truths**: The primary query domain, target house, Cusp Sub Lord, KP Cusp Promise (`YES`, `DELAYED`, `NO`), Gatekeeper Status (`OPEN`, `CLOSED`), and active Dasha period are injected directly into the system prompt as immutable astrological laws.
3. **Guardrail Enforcement**: If a house gatekeeper is closed or promised status is negative, the model is strictly forbidden from predicting immediate event completion, enforcing structured patience and remedial guidance.

### 2.2 Multi-Turn Interactive Consultation & Streaming SSE
- **Streaming Server-Sent Events (`/api/advanced-ai/stream`)**: Responses stream token-by-token using `TextDecoder` and `ReadableStream`, providing a fluid typewriter experience.
- **Session Continuity**: Maintains conversational context across turns, allowing users to ask contextual follow-up questions (e.g., *"What specific remedies mitigate this active Rahu Bhukti?"*).

### 2.3 Granular Persona Toggles
Users can toggle between three specialized analytical lenses:
1. **KP Stellar Focus**: Strict house sub-lord analysis, 4-level significators, and binary timing windows.
2. **Classical Jyotish**: Parashari principles, D-1, D-9 (Navamsa), D-10 (Dasamsa) divisional charts, Yogas, and traditional remedies (Mantras, Gemstones).
3. **Modern / Practical**: Psychological insight, personal development habits, and actionable real-world advice stripped of heavy jargon.

### 2.4 Enterprise Resilience & Observability
- **Request Tracing (`requestContext.ts`)**: Generates unique `traceId` correlation UUIDs for every request.
- **Circuit Breaker (`CircuitBreaker.ts`)**: Protects external and LLM API calls against cascading failures with `CLOSED`, `OPEN`, and `HALF_OPEN` states.
- **Token-Bucket Rate Limiter (`RateLimiter.ts`)**: Prevents API quota exhaustion (120 requests/minute capacity with automatic refill).
- **Model Routing (`ModelRoutingService.ts`)**: Dynamically selects optimal models based on priority, latency, and hourly cost budgets.

---

## 3. Key Source Code Files & Responsibilities

| File Path | Primary Responsibility |
| :--- | :--- |
| `/src/components/AdvancedAITab.tsx` | Main interactive UI for chat, persona selection, and live streaming. |
| `/src/lib/services/EnhancedGeminiConsultationService.ts` | Core business logic, KP ground truth computation, prompt builder, and streaming client. |
| `/src/hooks/useQueryConsultation.ts` | React hook managing consultation submissions and SSE streaming callbacks. |
| `/src/hooks/useConsultation.ts` | SWR-style caching and background revalidation hook for chart reports. |
| `/src/components/AstrologyTooltip.tsx` | Context-aware popover tooltips explaining complex Sanskrit/KP terms (Bhukti, Gochara, Sub-Lord). |
| `/server.ts` | Express backend handling `/api/advanced-ai` and `/api/advanced-ai/stream` with rate limiting and tracing. |

---

## 4. API Endpoints Specification

### 4.1 `/api/advanced-ai` (Standard Consultation)
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "prompt": "Full prompt with KP ground truths and context",
    "systemInstructionOverride": "Immutable system prompt rules",
    "userQuery": "When will I get promoted?",
    "conversationHistory": [...],
    "persona": "kp_stellar",
    "language": "en"
  }
  ```
- **Response**: JSON object containing the generated answer.

### 4.2 `/api/advanced-ai/stream` (Streaming Consultation)
- **Method**: `POST`
- **Request Body**: Same as `/api/advanced-ai`.
- **Response**: `text/event-stream` SSE chunks emitting JSON objects (`{ "text": "..." }` and `{ "done": true }`).

---

## 5. UI/UX Design System & Anti-Slop Guidelines
- **Color Palette**: Deep space obsidian background (`#0A0E17`, `#10141F`), warm Vedic gold accents (`#F59E0B`), and teal status badges (`#0D9488`).
- **Typography**: Paired sans-serif for UI with serif display headers.
- **Interactive Affordances**:
  - Deterministic facts collapsible drawer for data transparency.
  - 10-House Gatekeeper status grid for structural confidence.
  - One-click Markdown report export (`.md`) and session clearing.
  - Context-aware tooltips for astrological glossary terms.

---

## 6. Future Roadmap & Enhancements
1. **Cloud Persistence (Firestore)**: Save multi-turn consultation history across user sessions.
2. **Audio Narration**: Integrate Google TTS for spoken astrological consultations.
3. **Advanced KP Sub-Lord Graphs**: D3.js visualization connecting cusp sub-lords to active significator houses.
