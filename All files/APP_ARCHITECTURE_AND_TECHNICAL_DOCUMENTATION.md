# Jyothishya Sanathanam: Application Architecture & Technical Documentation

This document serves as the comprehensive technical guide and architectural blueprint for the **Jyothishya Sanathanam** web application. It is designed to provide engineering teams, product managers, and stakeholders with a complete understanding of the system's structure, technical stack, and information architecture.

---

## 1. Technical Architecture Overview

Jyothishya Sanathanam is a modern, responsive Single Page Application (SPA) built using React. It is designed with an "offline-first" mentality using local state storage, combined with progressive cloud integrations for persistence and advanced AI analysis.

### 1.1 Tech Stack
*   **Frontend Framework:** React 18+ (with Vite)
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS (Utility-first styling, responsive design)
*   **Routing:** Custom lightweight state-based routing (managed in `App.tsx` via `activePage` state)
*   **State Management:** React Context (`AuthContext`, `ThemeContext`), local state hooks (`useState`, `useReducer`), and Custom Hooks (`useAstrologyCache`, `useConsultation`, `useKPChart`).
*   **Data Persistence:** Local browser storage (`ProfileStorageService`, `authStorage`) and Google Drive Sync (`driveSyncService.ts`, `GoogleDriveSync.tsx`).
*   **AI Integration:** Gemini API (Google AI Studio) via `@google/genai` (using `EnhancedGeminiConsultationService.ts` and `AdvancedAIService.ts` for AI Consultations).
*   **Authentication:** Firebase Auth (`authService.ts`, `firebaseAuth.ts`) for Google Sign-In and session management.
*   **Testing:** Cypress (End-to-End, e.g., `marriageMatch.cy.ts`) and Jest/Vitest (Unit tests for astrology algorithms like `bhakootCalculator.test.ts`, `manglikDosha.test.ts`).

### 1.2 Core Engines & Libraries (Domain Logic)
*   **Astrology Engine:** Custom integrations (e.g., `jhoraAPI.ts`) and complex algorithms implemented in TypeScript.
*   **KP (Krishnamurti Paddhati) Analysis Engine:** Found in `/src/lib/kp/`. Includes Placidus house calculations (`placidusCalculator.ts`), Significators analysis (`significatorAnalyzer.ts`), Ruling Planets (`rulingPlanetsCalculator.ts`), and a specialized Query Intent Recognizer (`queryIntentRecognizer.ts`).
*   **Compatibility (Marriage Match) Engine:** Dedicated calculators for Yoni Kuta (`yoniKutaCalculator.ts`), Bhakoot (`bhakootCalculator.ts`), and Manglik Dosha (`manglikDosha.ts`).
*   **Dasha Engine:** Vimshottari Dasha calculations (`DashaEngine.ts`).

---

## 2. Sitemap

The application uses a flat, app-like navigation structure primarily accessed via a global header and a mobile-friendly bottom navigation bar.

*   **/** (Home)
*   **/birth-chart** (Birth Chart Report)
*   **/marriage-match** (Kundli Matching)
*   **/kp-analysis** (Advanced KP Astrology)
*   **/ai-consultation** (AI Astrologer / Guru)
*   **/profile** (User Profile & Saved Charts)

*(Note: Routes are currently handled virtually via the `activePage` state rather than standard URL routing, optimizing for a seamless SPA experience without page reloads).*

---

## 3. Information Architecture & Page Content

This section details the layout, purpose, and specific content modules present on each page of the application.

### 3.1 Global Shell (Present on all pages)
*   **Global Header (`/components/GlobalShell/Header.tsx`):**
    *   App Logo (Jyothishya Sanathanam)
    *   Active Profile Selector (Dropdown to switch between saved birth charts).
    *   "Create New Profile" quick action.
    *   Language toggle (English, Hindi, Telugu).
    *   Desktop Navigation Links (Home, Birth Chart, Marriage Match, KP Analysis, AI Consultation).
*   **Bottom Navigation Bar (`/components/GlobalShell/BottomNav.tsx`):**
    *   Mobile-optimized sticky tab bar with icons for the primary pages.
*   **Profile Create/Edit Modal (`BirthForm.tsx`):**
    *   Accessible globally to input new birth details (Name, Gender, Date, Time, Place, Lat/Lng).

### 3.2 Home Page (`/pages/HomePage.tsx`)
**Purpose:** The central dashboard and landing area for the user. Provides an overview of the active profile and quick access to major features.
**Content Modules:**
*   **Welcome Banner:** Personalized greeting based on the active profile.
*   **Active Profile Summary Card (`PersonSummaryCard.tsx`):** Displays brief birth details of the currently selected user.
*   **Today's Panchangam Widget (`TodayPanchangamWidget.tsx`):** Daily astrological parameters (Tithi, Nakshatra, Yoga, Karana, Vara) based on current date and location.
*   **Quick Feature Grid / Topic Cards:** Visual cards directing users to:
    *   Full Birth Chart Analysis
    *   Marriage Compatibility
    *   Advanced KP Analysis
    *   AI Consultation (Ask questions)
*   **Saved Profiles List:** Quick access list to switch between family members or friends.

### 3.3 Birth Chart Page (`/pages/BirthChartPage.tsx`)
**Purpose:** Comprehensive traditional Vedic astrology report based on Parashari principles.
**Content Modules (v2 Layout - `BirthChartReportV2.tsx`):**
*   **Executive Summary (`ExecutiveSummary.tsx`):** High-level overview of the chart's strength, dominant elements, and primary planetary influences.
*   **Lagna Chart / Rasi Chart (`LagnaChartCard.tsx`):** Visual South Indian / North Indian style birth chart rendering.
*   **Planetary Positions Table (`PlanetTable.tsx`):** Detailed grid showing Planets, their current Signs, Degrees, Nakshatras, and Dignities (Exalted, Debilitated, Moolatrikona).
*   **Divisional Charts (`DivisionalChart.tsx`):** Navamsha (D9), Dashamsha (D10), etc., for granular life-domain analysis.
*   **Domain Highlights (`DomainHighlights.tsx`):** Specific breakdowns for Career, Wealth, Marriage, and Health.
*   **Current Phase (`CurrentPhaseCard.tsx`):** Vimshottari Dasha overview (`VimshottariDashaView.tsx`), highlighting the current Mahadasha and Antardasha influences.
*   **Deep Dive Accordions (`DeepDiveAccordion.tsx`):**
    *   **Yogas View (`YogasView.tsx`):** List of auspicious and inauspicious planetary combinations present in the chart.
    *   **Doshas View (`DoshasView.tsx`):** Identification of afflictions (e.g., Kalasarpa Dosha, Manglik).
    *   **Planetary Strength (`PlanetaryStrengthView.tsx`):** Shadbala or general planetary strength visualization.

### 3.4 Marriage Match Page (`/pages/MarriageMatchPage.tsx`)
**Purpose:** Ashtakoota Milan (Kundli Matching) for marriage compatibility between two saved profiles.
**Content Modules:**
*   **Profile Selection:** Two dropdowns to select "Partner A" and "Partner B" from saved profiles.
*   **Compatibility Gauge (`CompatibilityGauge.tsx`):** Visual meter showing the overall Guna score out of 36.
*   **Kuta Breakdown Card (`KutaBreakdownCard.tsx`):** Detailed table or list showing the points scored for all 8 Kutas (Varna, Vashya, Tara, Yoni, Graha Maitri, Gana, Bhakoot, Nadi).
*   **Manglik Dosha Analysis:** Assessment of Kuja Dosha for both partners and whether they cancel out.
*   **Combined Strength View (`CombinedStrengthView.tsx`):** Analysis of the combined chart strengths and relationship longevity predictors.
*   **Strategic Report (`StrategicReport.tsx`):** AI-generated or rule-based summary of the relationship's strengths and potential challenges.

### 3.5 KP Analysis Page (`/pages/KPAnalysisPage.tsx`)
**Purpose:** Advanced, precise predictions using Krishnamurti Paddhati (KP) system. Designed for answering specific life queries.
**Content Modules:**
*   **KP Cusp Table (`CuspTable.tsx`):** Displays the 12 Cusps, their sub-lords, star-lords, and sign-lords.
*   **Planet Significators Table (`PlanetSignificatorsTable.tsx`):** Shows which houses (A, B, C, D levels) each planet signifies.
*   **Ruling Planets Widget (`RulingPlanetsWidget.tsx`):** Real-time calculation of Ruling Planets (Day Lord, Moon Sign Lord, Moon Star Lord, Ascendant Sign Lord, Ascendant Star Lord) based on *current* time and place, crucial for KP horary (Prashna).
*   **Domain Predictions View (`DomainPredictionsView.tsx`):** Automated analysis of specific houses (e.g., 2/6/10/11 for Career/Money) based on sub-lords.
*   **Query Consultation Tab / Verdict Panel (`QueryConsultationTab.tsx`, `QueryVerdictPanel.tsx`):** An interface where users can type a specific question. The engine parses the intent (`queryIntent.ts`), analyzes the relevant house significators, and provides a crisp "Yes/No/When" verdict.

### 3.6 AI Consultation Page (`/pages/AIConsultationPage.tsx` / `AdvancedAIPage.tsx`)
**Purpose:** A conversational interface with an AI Astrologer (powered by Gemini) that has full context of the user's birth chart.
**Content Modules (Advanced AI Tab Architecture):**
*   **Chat Interface (`ChatPanel.tsx`, `InputArea.tsx`, `MessageBubble.tsx`):** Standard chat UI.
*   **Context Chips (`ContextChips.tsx`):** Visual indicators showing what astrological data the AI is currently considering (e.g., "Jupiter in 7th House", "Rahu Mahadasha").
*   **Context Drawer / Left Sidebar (`ContextDrawer.tsx`, `LeftSidebar.tsx`):** Displays the raw JSON/structured data being fed to the LLM for transparency.
*   **Ground Truth Inspector (`GroundTruthInspectorDrawer.tsx`, `StickyGroundTruthBadge.tsx`):** A debugging/transparency tool ensuring the AI's claims map back to actual astrological data (preventing hallucinations).
*   **History Panel (`HistoryPanel.tsx`):** Previous consultation threads.

### 3.7 Profile Page (`/pages/ProfilePage.tsx`)
**Purpose:** User account management, chart repository, and application settings.
**Content Modules:**
*   **User Avatar (`UserAvatar.tsx`) & Authentication:** Google Sign-in / Sign-out buttons (`GoogleSignInButton.tsx`).
*   **Saved Charts Manager:** List of all created profiles. Options to Edit, Delete, or set as Active.
*   **Data Sync Options:** Integration with Google Drive (`SaveToDriveButton.tsx`, `GoogleDriveSync.tsx`) to backup and restore saved profiles across devices.
*   **App Settings:**
    *   Dark Mode Toggle (`DarkModeToggle.tsx`).
    *   Language Preferences.
*   **System Status:** Error boundaries (`ErrorBoundary.tsx`) and cache status.

---

## 4. Error Handling and Resilience

The application is built with enterprise-grade resilience patterns, specifically around its external API calls and AI integrations.

*   **Circuit Breaker (`/src/lib/resilience/CircuitBreaker.ts`):** Prevents cascading failures when backend services (like the Jagannatha Hora engine or Gemini API) are down, returning fallback data or graceful error messages.
*   **Rate Limiter (`/src/lib/resilience/RateLimiter.ts`):** Ensures API quotas are respected, particularly useful for free-tier AI API integrations.
*   **Retryable Async Data (`/src/hooks/useRetryableAsyncData.ts`):** Automatically retries failed network requests with exponential backoff.
*   **Request Context (`/src/lib/observability/requestContext.ts`):** Traces requests through the system for debugging purposes.

## 5. Security & Data Privacy

*   **Local First:** By default, all birth profiles are stored in the browser's `localStorage` (`ProfileStorageService`). This ensures maximum privacy for sensitive birth data unless the user explicitly opts into cloud sync.
*   **Opt-in Cloud Backup:** Users can authenticate via Firebase and use Google Drive Sync to securely backup their encrypted chart data to their own personal Google Drive, keeping data ownership entirely with the user.
*   **API Security:** The `/server.ts` acts as a proxy for external API calls, ensuring that sensitive API keys (like `GEMINI_API_KEY`) are never exposed to the client browser.

---
*Generated by AI Studio architecture assistant.*
