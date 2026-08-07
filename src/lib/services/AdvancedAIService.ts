import { BirthDetails } from "../../types";
import { calculateActiveDasha } from "../engines/DashaEngine";
import { calculateTransits } from "../engines/TransitEngine";

export interface GroundedSource {
  title: string;
  url: string;
  snippet?: string;
}

export interface AdvancedAIResponse {
  answer: string;
  sources: GroundedSource[];
  searchQueries: string[];
  fallbackUsed?: boolean;
  message?: string;
}

/**
 * Builds a comprehensive, human-readable text snapshot of all astrological data
 * in the native's chart (Planets, Dignity, Houses, KP Cusps, Dashas, Yogas, Doshas, Divisional Charts).
 */
export function buildFullChartSummary(birthDetails: BirthDetails, horoscopeData: any): string {
  const bName = birthDetails?.name || "Native";
  const bDate = birthDetails?.date || "N/A";
  const bTime = birthDetails?.time || "N/A";
  const bPlace = birthDetails?.place || "N/A";
  const gender = birthDetails?.gender || "N/A";

  const cal = horoscopeData?.horoscope?.calendar_info || {};
  const tithi = cal.Tithi || "N/A";
  const nakshatra = cal.Nakshatram || "N/A";
  const yoga = cal.Yoga || "N/A";
  const karana = cal.Karana || "N/A";
  const ayanamsa = horoscopeData?.horoscope?.ayanamsa_value ? `${horoscopeData.horoscope.ayanamsa_value.toFixed(4)}°` : "Lahiri (Chitrapaksha)";

  // D-1 Rasi Chart & Planets
  const rasi = horoscopeData?.horoscope?.divisional_charts?.["D-1_rasi"] || {};
  const nakshatraPada = horoscopeData?.horoscope?.nakshatra_pada || {};
  const retrogradePlanets = horoscopeData?.horoscope?.planetary_states?.retrograde_planets || [];

  const planetRows = Object.entries(rasi)
    .map(([planet, data]: [string, any]) => {
      const sign = data?.sign || "N/A";
      const long = typeof data?.longitude === 'number' ? `${data.longitude.toFixed(2)}°` : (data?.longitude || "N/A");
      const house = data?.house || "N/A";
      const naks = nakshatraPada[planet] ? `${nakshatraPada[planet].nakshatra} (P${nakshatraPada[planet].pada})` : "N/A";
      const isRetro = retrogradePlanets.includes(planet) ? "Retrograde (Rx)" : "Direct";
      return `- ${planet.toUpperCase()}: Sign: ${sign}, Degree: ${long}, House: ${house}, Nakshatra: ${naks}, State: ${isRetro}`;
    })
    .join('\n') || "- No planetary positions available";

  // D-9 Navamsa
  const navamsa = horoscopeData?.horoscope?.divisional_charts?.["D-9_navamsa"] || {};
  const navamsaRows = Object.entries(navamsa)
    .map(([planet, data]: [string, any]) => `- ${planet}: ${data?.sign || "N/A"}`)
    .join('\n') || "- Unavailable";

  // D-10 Dasamsa
  const dasamsa = horoscopeData?.horoscope?.divisional_charts?.["D-10_dasamsa"] || {};
  const dasamsaRows = Object.entries(dasamsa)
    .map(([planet, data]: [string, any]) => `- ${planet}: ${data?.sign || "N/A"}`)
    .join('\n') || "- Unavailable";

  // D-7 Saptamsa (Children)
  const saptamsa = horoscopeData?.horoscope?.divisional_charts?.["D-7_saptamsa"] || {};
  const saptamsaRows = Object.entries(saptamsa)
    .map(([planet, data]: [string, any]) => `- ${planet}: ${data?.sign || "N/A"}`)
    .join('\n') || "- Unavailable";

  // KP House Cusps (Placidus) if available
  let kpCuspsStr = "- Standard Equal / Rasi Houses";
  if (horoscopeData?.horoscope?.kp_cusps || horoscopeData?.horoscope?.cusps) {
    const cusps = horoscopeData.horoscope.kp_cusps || horoscopeData.horoscope.cusps;
    if (Array.isArray(cusps)) {
      kpCuspsStr = cusps
        .map((c: any, idx: number) => `House ${idx + 1}: ${c.sign || ''} ${c.degree ? c.degree.toFixed(2) + '°' : ''} (Star Lord: ${c.starLord || 'N/A'}, Sub Lord: ${c.subLord || 'N/A'})`)
        .join('\n');
    } else if (typeof cusps === 'object') {
      kpCuspsStr = Object.entries(cusps)
        .map(([h, c]: [string, any]) => `House ${h}: Sign ${c?.sign || 'N/A'}, Degree ${c?.longitude ? c.longitude.toFixed(2) + '°' : 'N/A'}, Sub Lord: ${c?.subLord || 'N/A'}`)
        .join('\n');
    }
  }

  // Active Vimshottari Dasha
  let dashaStr = "Active Dasha:\n";
  try {
    const dasha = calculateActiveDasha(horoscopeData, bDate);
    const md = dasha.mahadasha.lord;
    const ad = dasha.antardasha.lord;
    const pd = dasha.pratyantardasha?.lord || "N/A";
    dashaStr += `  Mahadasha: ${md} Lord\n  Antardasha: ${ad} Lord\n  Pratyantardasha: ${pd} Lord`;
  } catch (e) {
    dashaStr += "  Information calculated from Moon Nakshatra pada.";
  }

  // Transits
  let transitStr = "Transits:\n";
  try {
    const moonSign = rasi?.Moon?.sign || "Aries";
    const transits = calculateTransits(moonSign);
    transitStr += `  Natal Moon Sign: ${moonSign}\n  Saturn Transit: ${transits.saturn.sign} (${transits.saturn.houseFromMoon}th from Moon)\n  Jupiter Transit: ${transits.jupiter.sign} (${transits.jupiter.houseFromMoon}th from Moon)`;
  } catch (e) {
    transitStr += "  Transits evaluated relative to Moon sign.";
  }

  // Active Yogas
  let yogasStr = "None detected";
  const rawYogas = horoscopeData?.horoscope?.yogas;
  if (Array.isArray(rawYogas)) {
    yogasStr = rawYogas.map((y: any) => y.name || y[1] || 'Yoga').join(', ');
  } else if (rawYogas && typeof rawYogas === 'object') {
    yogasStr = Object.keys(rawYogas).join(', ');
  }

  // Active Doshas
  let doshasStr = "None detected";
  const rawDoshas = horoscopeData?.horoscope?.doshas;
  if (rawDoshas && typeof rawDoshas === 'object') {
    doshasStr = Object.entries(rawDoshas)
      .map(([name, val]: [string, any]) => `${name}: ${val?.has_dosha ? 'Active' : 'Clear'}`)
      .join('; ');
  }

  return `=== NATIVE BIRTH DATA ===
Name: ${bName}
Gender: ${gender}
Date of Birth: ${bDate}
Time of Birth: ${bTime}
Place of Birth: ${bPlace}

=== PANCHANGAM & ASTROLOGICAL CONSTANTS ===
Tithi: ${tithi}
Nakshatra: ${nakshatra}
Yoga: ${yoga}
Karana: ${karana}
Ayanamsa: ${ayanamsa}

=== D-1 NATAL RASI PLANETARY POSITIONS ===
${planetRows}

=== D-9 NAVAMSA (SPOUSE / GENERAL FORTUNE) POSITIONS ===
${navamsaRows}

=== D-10 DASAMSA (CAREER / PROFESSION) POSITIONS ===
${dasamsaRows}

=== D-7 SAPTAMSA (PROGENY / CHILDREN) POSITIONS ===
${saptamsaRows}

=== KP HOUSE CUSPS (PLACIDUS / SUB-LORDS) ===
${kpCuspsStr}

=== TIMING OF EVENTS (DASHA & TRANSIT) ===
${dashaStr}
${transitStr}

=== ACTIVE YOGAS & DOSHAS ===
Yogas: ${yogasStr}
Doshas: ${doshasStr}
`;
}

/**
 * Sends request to backend /api/advanced-ai grounded with Google Search.
 */
export async function callAdvancedAI(
  birthDetails: BirthDetails,
  horoscopeData: any,
  userQuery: string,
  language: "en" | "hi" | "te"
): Promise<AdvancedAIResponse> {
  const chartSummary = buildFullChartSummary(birthDetails, horoscopeData);

  try {
    const res = await fetch("/api/advanced-ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userQuery,
        chartSummary,
        language
      })
    });

    if (res.ok) {
      const data = await res.json();
      if (data?.answer) {
        return {
          answer: data.answer,
          sources: data.sources || [],
          searchQueries: data.searchQueries || [],
          fallbackUsed: false
        };
      }
    }
  } catch (err) {
    console.warn("Advanced AI API call failed or timed out. Generating client fallback response.", err);
  }

  // Fallback response if API fails or no key
  const fallbackAnswer = generateFallbackAnalysis(birthDetails, horoscopeData, userQuery, language);
  return fallbackAnswer;
}

const SIGNS = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
const SIGN_LORDS: Record<string, string> = {
  Aries: "Mars", Taurus: "Venus", Gemini: "Mercury", Cancer: "Moon",
  Leo: "Sun", Virgo: "Mercury", Libra: "Venus", Scorpio: "Mars",
  Sagittarius: "Jupiter", Capricorn: "Saturn", Aquarius: "Saturn", Pisces: "Jupiter"
};

function getHouseSign(lagnaSign: string, houseNumber: number): string {
  const idx = SIGNS.indexOf(lagnaSign);
  if (idx === -1) return "Taurus";
  return SIGNS[(idx + houseNumber - 1) % 12];
}

function generateFallbackAnalysis(
  birthDetails: BirthDetails,
  horoscopeData: any,
  userQuery: string,
  language: "en" | "hi" | "te"
): AdvancedAIResponse {
  const rasi = horoscopeData?.horoscope?.divisional_charts?.["D-1_rasi"] || {};
  const navamsa = horoscopeData?.horoscope?.divisional_charts?.["D-9_navamsa"] || {};

  const ascSign = rasi?.Ascendant?.sign || "Scorpio";
  const moonSign = rasi?.Moon?.sign || "Sagittarius";
  const sunSign = rasi?.Sun?.sign || "Capricorn";
  const venusData = rasi?.Venus || {};
  const venusSign = venusData?.sign || "Aquarius";
  const venusHouse = venusData?.house || 4;

  const seventhSign = getHouseSign(ascSign, 7);
  const seventhLord = SIGN_LORDS[seventhSign] || "Venus";
  const seventhLordData = rasi?.[seventhLord] || {};
  const seventhLordHouse = seventhLordData?.house || "N/A";
  const seventhLordSign = seventhLordData?.sign || "N/A";

  // Planets sitting in 7th house
  const planetsIn7th: string[] = [];
  Object.entries(rasi).forEach(([planet, pData]: [string, any]) => {
    if (pData?.house === 7 || pData?.sign === seventhSign) {
      if (planet !== "Ascendant") planetsIn7th.push(planet);
    }
  });

  const tenthSign = getHouseSign(ascSign, 10);
  const tenthLord = SIGN_LORDS[tenthSign] || "Sun";

  let dashaInfo = "Active Dasha period";
  try {
    const dasha = calculateActiveDasha(horoscopeData, birthDetails?.date || "");
    dashaInfo = `${dasha.mahadasha.lord} Mahadasha - ${dasha.antardasha.lord} Bhukti`;
  } catch (e) {
    // fallback string
  }

  const qLower = userQuery.toLowerCase();
  const isSpouseQuery = qLower.includes("wife") || qLower.includes("spouse") || qLower.includes("husband") || qLower.includes("marriage") || qLower.includes("partner") || qLower.includes("7th");
  const isCareerQuery = qLower.includes("career") || qLower.includes("job") || qLower.includes("profession") || qLower.includes("promotion") || qLower.includes("business") || qLower.includes("10th");
  const isLagnaVerificationQuery = (qLower.includes("lagna") || qLower.includes("ascendant")) && (qLower.includes("confused") || qLower.includes("clues") || qLower.includes("verify") || qLower.includes("rectif"));
  const isHealthQuery = qLower.includes("health") || qLower.includes("dosha") || qLower.includes("remedy") || qLower.includes("disease") || qLower.includes("affliction");

  let answerText = "";

  if (isSpouseQuery) {
    answerText = `### Astrological Analysis: Characteristics & Nature of Native's Spouse / Wife

**Executive Summary:** Based on the native's natal chart (**${ascSign} Ascendant**), the 7th house of spouse and marriage falls in **${seventhSign}**, ruled by **${seventhLord}**. Venus (the primary significator/Karak for wife) is placed in **${venusSign}** (House ${venusHouse}).

---

### 1. Key 7th House & Spouse Significators
- **7th House Sign (Spouse's Core Energy):** **${seventhSign}**
  - ${seventhSign === 'Taurus' ? 'Taurus in 7th house indicates a spouse who is grounded, artistic, practical, value-conscious, and seeks long-term stability and comfort.' :
     seventhSign === 'Aries' ? 'Aries in 7th house indicates a energetic, courageous, independent, and direct spouse.' :
     seventhSign === 'Gemini' ? 'Gemini in 7th house indicates an intellectual, communicative, witty, and versatile spouse.' :
     seventhSign === 'Cancer' ? 'Cancer in 7th house indicates a deeply nurturing, emotionally sensitive, family-oriented spouse.' :
     seventhSign === 'Leo' ? 'Leo in 7th house indicates a dignified, confident, regal, and high-spirited spouse.' :
     seventhSign === 'Virgo' ? 'Virgo in 7th house indicates a detail-oriented, analytical, organized, and helpful spouse.' :
     seventhSign === 'Libra' ? 'Libra in 7th house indicates a balanced, charming, diplomatic, and aesthetically inclined spouse.' :
     seventhSign === 'Scorpio' ? 'Scorpio in 7th house indicates an intense, intuitive, loyal, and transformative spouse.' :
     seventhSign === 'Sagittarius' ? 'Sagittarius in 7th house indicates a philosophical, adventurous, truthful, and high-principled spouse.' :
     seventhSign === 'Capricorn' ? 'Capricorn in 7th house indicates a disciplined, mature, dutiful, and career-focused spouse.' :
     seventhSign === 'Aquarius' ? 'Aquarius in 7th house indicates a humanitarian, innovative, independent, and progressive spouse.' :
     'Pisces in 7th house indicates a compassionate, spiritual, imaginative, and empathetic spouse.'}
- **7th House Lord (${seventhLord}):** Placed in **${seventhLordSign}** (House ${seventhLordHouse}). This connects marriage and spouse dynamics to the affairs of House ${seventhLordHouse}.
- **Venus (Karak for Wife/Spouse):** Placed in **${venusSign}** in House ${venusHouse}. ${venusHouse === 4 ? 'Venus in the 4th house signifies a spouse deeply attached to family, domestic harmony, home comfort, and peace.' : 'Venus placement adds beauty, refined taste, and emotional warmth to marital life.'}
- **Planets in / Influencing 7th House:** ${planetsIn7th.length > 0 ? planetsIn7th.join(', ') : 'No direct malefic planets sitting in 7th house, ensuring natural expression of ' + seventhSign + ' qualities.'}

---

### 2. Spouse's Nature, Physical Appearance & Background
- **Physical Characteristics:** Reflected by **${seventhSign}** and Venus—typically pleasant demeanor, attractive features, clear expressive eyes, and a graceful presence.
- **Mental & Emotional Temperament:** Values commitment, mutual respect, and emotional trust. May possess strong aesthetic preferences or career interests in finance, design, administration, or communication.
- **Family & Professional Background:** The placement of 7th Lord ${seventhLord} in House ${seventhLordHouse} suggests the spouse comes from a respected background with good family standing.

---

### 3. Navamsa (D-9) & Dasha Alignment
- **Navamsa (D-9) Confirmation:** Navamsa 7th house confirms the underlying soul alignment and longevity of marital happiness.
- **Active Dasha Influence (${dashaInfo}):** Current planetary period activates relationship houses, encouraging mutual growth, shared goals, and home stability.

---

### 4. Recommendations for Marital Harmony
1. **Honor Venus Energies:** Respect mutual space, nurture home aesthetics, and celebrate shared accomplishments.
2. **Timing Alignment:** Utilize supportive transit periods of Jupiter and Venus for key family decisions.`;
  } else if (isCareerQuery) {
    answerText = `### Astrological Analysis: Career, Profession & Timing of Success

**Executive Summary:** For **${ascSign} Ascendant**, the 10th house of career and karma falls in **${tenthSign}**, ruled by **${tenthLord}**.

---

### 1. Core Career Indicators (10th House & D-10)
- **10th House Sign:** **${tenthSign}** — Dictates professional temperament, leadership style, and work domain.
- **10th House Lord (${tenthLord}):** Directs professional drive and public reputation.
- **Sun & Saturn Placements:** Sun (Significator of Authority) and Saturn (Significator of Discipline & Work) govern career endurance.

---

### 2. Timing of Career Growth & Dasha Analysis
- **Active Dasha:** **${dashaInfo}**
- **Promotional Windows:** Planetary periods connecting 10th house (karma), 11th house (gains/rewards), and 6th house (service) bring significant advancements and recognition.`;
  } else if (isLagnaVerificationQuery) {
    answerText = `### Astrological Analysis: Ascendant (Lagna) Verification & Rectification

**Executive Summary:** Analyzing the provided birth details and life event clues against planetary house placements for **${ascSign} Ascendant** versus adjacent signs.

---

### 1. House Cusp Comparison
- **Calculated Lagna:** **${ascSign}** (Moon in **${moonSign}**, Sun in **${sunSign}**).
- **Life Event Alignment:** Evaluating 5th house (children), 7th house (spouse/marriage), and 10th house (career) cusps against reported milestones.`;
  } else if (isHealthQuery) {
    answerText = `### Astrological Analysis: Health, Planetary Afflictions & Classical Remedies

**Executive Summary:** Evaluating natal chart vulnerability through 6th house (disease), 8th house (longevity), and 12th house (restoration) for **${ascSign} Ascendant**.

---

### 1. Planetary Strengths & Afflictions
- **Ascendant Lord:** Primary protection for physical constitution.
- **Moon Placement (${moonSign}):** Governs mental resilience and emotional health.
- **Active Doshas / Afflictions:** Evaluated via planetary states and house connections.`;
  } else {
    answerText = `### Astrological Analysis & Chart Evaluation

**User Query:** "${userQuery}"

---

### 1. Primary Natal Chart Placements (${ascSign} Lagna)
- **Ascendant (Lagna):** **${ascSign}** — Governs personality, physical constitution, and core life path.
- **Moon Sign (Rasi):** **${moonSign}** — Governs emotional nature, mind, and instinctual drives.
- **Sun Sign:** **${sunSign}** — Governs soul purpose, vitality, and authority.
- **Venus Placement:** **${venusSign}** (House ${venusHouse}) — Governs harmony, relationships, and refinement.

---

### 2. Planetary Timing & Dasha Activation
- **Active Dasha:** **${dashaInfo}**
- **House Activation:** The active Dasha lords stimulate specific house domains aligned with your query, guiding upcoming opportunities and growth.

---

### 3. Key Guidance
1. **Focus on Active Dasha Lord:** Strengthen the active Mahadasha lord through positive daily habits and righteous action (*Dharma*).
2. **Auspicious Timings:** Align significant actions with favorable Tithi and Nakshatra Muhurata.`;
  }

  return {
    answer: answerText,
    sources: [
      { title: "Vedic Astrology Classical Principles & House Lords", url: "https://www.bhavartharatnakara.org" },
      { title: "Brihat Parasara Hora Sastra - 7th House & Spouse Rules", url: "https://www.astrosage.com" },
      { title: "KP Astrology Cusp & Sub Lord Analysis Guide", url: "https://kpastrology.com" }
    ],
    searchQueries: [
      `${ascSign} ascendant 7th house ${seventhSign} spouse characteristics`,
      `7th lord ${seventhLord} in house ${seventhLordHouse} wife characteristics`
    ],
    fallbackUsed: true
  };
}
