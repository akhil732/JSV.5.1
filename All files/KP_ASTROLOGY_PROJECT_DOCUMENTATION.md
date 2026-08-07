# Krishnamurti Paddhati (KP) Astrology Engine: Comprehensive Project & Technical Specification

**Document Version:** 1.0.0  
**Target Audience:** Project Managers, Product Managers, Software Development Managers, and Core Engineering Teams  
**System Module:** KP Stellar Astrology & Predictive Decision Engine  

---

## 1. Executive Summary & Project Scope

The Krishnamurti Paddhati (KP) Astrology Engine is an advanced computational astrological prediction system built into the application. Based strictly on the authoritative treatises of Prof. K.S. Krishnamurti, this module bridges ancient Vedic astrological principles with rigorous, deterministic mathematical modeling.

### Core Objectives
1. **Deterministic Stellar Calculations**: Implement precise Placidus house cusp calculations and proportional Vimshottari Sub-Lord mapping.
2. **The Gatekeeper Rule Enforcement**: Enforce textbook gatekeeper logic where the Sub-Lord of a house cusp dictates whether an event is Promised, Delayed, or Denied, overriding favorable transits if the structural gate is closed.
3. **8-Step Verification Chain**: Automate the standard KP 8-step investigative workflow from query classification to final transit confirmation.
4. **Multi-Domain Life Assessment**: Evaluate 6+ core life domains (Career, Finance, Marriage, Health, Education, Property) with multi-layer significator analysis.
5. **Real-Time Planetary Transits**: Integrate real-time Gochara (transit) positions with Vimshottari Dasha periods to provide precise event timing.

---

## 2. Product Scope & Functional Modules

### 2.1 Proportional Sub-Lord Mapping (Textbook Accuracy)
Unlike generic astrological software that divides nakshatras into uniform 9-part arcs, our engine implements **proportional Vimshottari duration scaling** (Pages 3366-3370):
$$\text{Sub Duration (Degrees)} = \left(\frac{\text{Planet's Dasha Years}}{120}\right) \times 13^{\circ}20'$$
- *Example*: Ketu sub in Ashwini spans $0.7778^\circ$ ($0^\circ 46' 40''$), whereas Venus sub spans $2.2222^\circ$ ($2^\circ 13' 20''$).
- *Differentiation*: Enables twin-birth differentiation (same sign/star, different sub-lords yielding distinct life outcomes such as cotton vs. petrol trade).

### 2.2 Cusp Sub-Lord Gatekeeper Logic
Based on Pages 6643–6828 of Prof. K.S. Krishnamurti's teachings:
- **YES (Gate Open)**: Sub-lord signifies favorable houses (e.g., 1, 2, 7, 11 for marriage/finance) without malefic obstruction.
- **DELAYED**: Sub-lord signifies positive outcomes but includes house 12 (loss, isolation, confinement) or obstructing houses (6, 8).
- **NO (Gate Closed)**: Sub-lord signifies *only* malefic/denial houses (6, 8, 12). **No amount of favorable dasha or transit can override a closed gate.**

### 2.3 The 8-Step Verdict Engine
Automates the exact manual KP consultation workflow:
1. **Step 1**: Identify Relevant House based on natural language query mapping.
2. **Step 2 & 3**: Read House Cusp Sub-Lord & Evaluate Gatekeeper Conditions.
3. **Step 4**: Identify House Significators (House Lord, Occupants, Constellation Lords).
4. **Step 5**: Check Significator Sub-Lords for quality assessment (Favorable vs. Challenging).
5. **Step 6**: Check Active Mahadasha & Bhukti for timing triggers.
6. **Step 7**: Cross-Validate with Vedic Divisional Charts (D-1/D-9).
7. **Step 8**: Confirm with Planetary Transits (Gochara).
8. **Final Synthesis**: Output Promise, Timing Window, Quality, and Confidence Score.

### 2.4 Multi-Domain Life Assessment
The system evaluates 6+ key life pillars:
1. **Career & Profession** (10th Cusp)
2. **Wealth & Finance** (2nd & 11th Cusps)
3. **Marriage & Partnership** (7th Cusp)
4. **Health & Vitality** (1st & 6th Cusps)
5. **Education & Wisdom** (4th & 5th Cusps)
6. **Property & Assets** (4th Cusp)

---

## 3. Technical Architecture & Implementation Structure

The application is structured in a modular TypeScript/React architecture separating calculation engines, UI views, and state management.

```
src/
├── lib/
│   ├── kp/
│   │   ├── proportionalSubCalculator.ts  # Proportional sub-lord degree spans & nakshatras
│   │   ├── subLordMapper.ts              # 3-layer Sign → Star → Sub mapping interface
│   │   ├── placidusCalculator.ts         # Placidus house cusp table generator
│   │   ├── gatekeeperRules.ts            # Cusp sub-lord gatekeeper validation rules
│   │   ├── kpVerdictEngine.ts            # 8-step automated KP verification chain
│   │   ├── significatorAnalyzer.ts       # 4-tier significator strength calculator
│   │   └── rulingPlanetsCalculator.ts    # Ruling planets calculation (Lagna, Moon, Day lord)
│   ├── engines/
│   │   ├── DashaEngine.ts                # Vimshottari Mahadasha/Bhukti/Pratyantar calculator
│   │   ├── TransitEngine.ts              # Real-time Gochara planetary positions
│   │   └── QueryConsultationEngine.ts    # Natural language query parsing & mapping
│   └── services/
│       └── KPConsultationService.ts      # Integration layer for AI & consultation reports
├── components/
│   └── KP/
│       ├── KPAnalysisPage.tsx            # Main KP Dashboard container
│       ├── CuspTable.tsx                 # House cusps with sub-lord gatekeeper status
│       ├── QueryVerdictPanel.tsx         # Interactive 8-step verdict explorer
│       ├── DomainPredictionsView.tsx     # 6-domain life assessment panel
│       ├── PlanetSignificatorsTable.tsx  # Detailed significator strength breakdown
│       └── RulingPlanetsWidget.tsx       # Real-time ruling planets widget
└── types/
    └── kp.ts                             # Global KP TypeScript interfaces & types
```

---

## 4. Software Engineering & Development Guidelines

### 4.1 Type Safety & Module Standards
- Strict TypeScript with no `any` abuse in core engines.
- Modular separation: Calculation math is entirely decoupled from React components to allow headless testing and reuse.
- Pure functions for degree normalization, arc calculations, and dasha subdivision.

### 4.2 Transit Integration & Timing
- **Transit Engine (`TransitEngine.ts`)**: Computes real-time planetary positions of slow-moving planets (Saturn, Jupiter, Rahu/Ketu) and fast-moving luminaries (Sun, Moon).
- **Cross-Verification**: Step 8 checks whether transit Saturn/Jupiter aspect the active significator cusps or natal Moon, validating the timing window computed in Step 6.

### 4.3 Performance & Scalability
- Memoized cusp calculations to ensure instant rendering across complex charts.
- Zero client-side blocking: Asynchronous calculation queues for multi-domain batch assessments.

---

## 5. Summary for Stakeholders

| Stakeholder Role | Key Value Deliverable |
|-------------------|---------------------------------------------------|
| **Project Manager** | Strict adherence to textbook milestones, transparent 8-step audit trails, and robust architectural modularity. |
| **Product Manager** | Authentic KP methodology (proportional subs, gatekeeper rules) providing high user trust and domain-specific life insights. |
| **Dev Manager** | Clean TypeScript structure, decoupling of math engines from UI, and seamless integration of transit and dasha engines. |
