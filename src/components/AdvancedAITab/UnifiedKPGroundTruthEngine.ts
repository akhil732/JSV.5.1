/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * UNIFIED KP GROUND TRUTH ENGINE FOR ALL LLM PERSONAS
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * CRITICAL FIX:
 * - Eliminates separate/parallel KP ground truth computations (old computeKPGroundTruths)
 * - Unifies ALL personas around a single source: KPVerdictEngine (via useKPChart flow)
 * - Injects verified KP verdicts as IMMUTABLE FACTS in system prompt
 * - Prevents fabrication of divisional charts, aspect names, confidence scores
 * - Enforces cross-persona consistency (all must respect KP gatekeeper verdict)
 * 
 * AUDIT RESULTS ADDRESSED:
 * ✗ "D7 placement in Pisces" → No D7 in facts → Never stated
 * ✗ "85% confidence" (Parashari) vs "74%" (KP) → Only KP's verified score used
 * ✗ "Amrita Drishti" aspects not computed → Never mentioned
 * ✗ "Favorable · Promised" contradicts "DELAYED" → Unified to single verdict
 * 
 * DESIGN:
 * 1. computeUnifiedKPGroundTruth() calls KPVerdictEngine.generateKPVerdict()
 * 2. Returns immutable facts only (cusp sub-lord, significators, dasha, confidence)
 * 3. buildSystemPrompt() injects these facts with explicit "DO NOT CONTRADICT" rules
 * 4. Each persona gets the same ground truth + persona-specific interpretation layer
 * 5. All numeric confidence is locked to KP's computed score, not LLM-generated
 * 
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { KPChart, KPQuery, KPVerdict, TopicEnum } from '../../types/kp';
import { BirthDetails } from '../../types';
import { KPVerdictEngine } from '../../lib/kp/kpVerdictEngine';
import { calculateVimshottariDashaFromMoon, toKPChartDashaInfo } from '../../lib/engines/DashaEngine';
import { buildFullChartSummary } from '../../lib/engines/QueryConsultationEngine';
import { TransitEngine } from '../../lib/engines/TransitEngine';
import { calculateKPSubLord, ZODIAC_SIGNS, calculateNavamsaSign } from '../../lib/kp/subLordMapper';
import { analyzeSignificators, getHouseOccupied } from '../../lib/kp/significatorAnalyzer';
import { calculatePlacidusCusps } from '../../lib/kp/placidusCalculator';
import { calculateRulingPlanets } from '../../lib/kp/rulingPlanetsCalculator';
import { computeLiveTransitSnapshot, renderGocharaPromptBlock } from '../../lib/engines/LiveTransitEngine';

export type ConsultationPersona = 'classical_parashari' | 'vedic_divisional' | 'vedic_remedial' | 'kp_stellar' | 'quick';

/**
 * Unified ground truth structure injected into all LLM system prompts.
 * These facts CANNOT be contradicted or fabricated by the model.
 */
export interface UnifiedKPGroundTruth {
  // ─── VERIFIED FACTS (from KPVerdictEngine, IMMUTABLE) ────────────────────
  cuspSubLord: string;                    // e.g., "Jupiter"
  cuspSubLordHouses: number[];            // Houses cusp sub-lord rules
  primarySignificators: string[];         // Planets signifying the house
  
  // ─── VERDICT (deterministic, NOT LLM-generated) ─────────────────────────
  promise: 'YES' | 'DELAYED' | 'NO';      // KP gatekeeper verdict
  confidenceScore: number;                // 0-100, from KPVerdictEngine only
  timing: string;                         // Timing window from verified dasha
  
  // ─── ACTIVE DASHA (from VimshottariDashaEngine) ──────────────────────────
  activeMahadasha: string;
  activeAntardasha: string;
  activeVimshottariDesc: string;
  
  // ─── TRANSIT CONTEXT (from TransitEngine, no aspect names) ───────────────
  transitModulation: 'Supportive' | 'Neutral' | 'Challenging';
  
  // ─── METADATA (for audit trail) ───────────────────────────────────────────
  houseDomain: string;                    // e.g., "Marriage & Life Partnership"
  topic: TopicEnum;
  primaryHouse: number;
  horoscopeDate: string;                  // ISO date chart was computed
  computedAt: string;                     // ISO timestamp when ground truth generated

  // Data availability flags (prevents fabrication)
  hasMotherChart?: boolean;
  hasMotherLagna?: boolean;
  hasD7Data?: boolean;
  hasD9Data?: boolean;
  hasD24Data?: boolean;
  hasPratyantardasha?: boolean;
  
  // Missing data list for explicit "Not Found" responses
  missingDataItems: string[];
  birthDetails?: BirthDetails;
  horoscopeData?: any;
}

export interface UnifiedKPGroundTruthWithDataFlags extends UnifiedKPGroundTruth {
  hasMotherChart?: boolean;
  hasMotherLagna?: boolean;
  hasD7Data?: boolean;
  hasD9Data?: boolean;
  hasD24Data?: boolean;
  hasPratyantardasha?: boolean;
  missingDataItems: string[];
  primaryHouse: number;
}

/**
 * Persona-specific system prompt templates that incorporate unified ground truth.
 * Each persona gets its OWN interpretation layer, but all work from same verified facts.
 */
const PERSONA_PROMPTS: Record<ConsultationPersona, (gt: UnifiedKPGroundTruth, name: string) => string> = {
  
  classical_parashari: (gt, nativeName) => `
You are the **Vedic Predictive & Timing Expert** persona for ${nativeName}.

VERIFIED ASTROLOGICAL FACTS (IMMUTABLE - DO NOT CONTRADICT):
- Primary Domain: ${gt.houseDomain} (KP Cusp Sub-Lord: ${gt.cuspSubLord})
- Cusp Sub-Lord Signifies Houses: [${gt.cuspSubLordHouses.join(', ')}]
- KP Gatekeeper Promise: **${gt.promise}** (Confidence: ${gt.confidenceScore}%)
- Active Vimshottari Dasha: ${gt.activeVimshottariDesc}
- Current Transit Support: ${gt.transitModulation}
- Expected Manifestation Window: ${gt.timing}

YOUR MANDATE (Parashari Analytical Lens):
1. Interpret the chart using Parashari rules (House Lords, Yogas, Karaka dignity).
2. You MUST respect the KP Gatekeeper Promise: **${gt.promise}**.
   - If YES: Focus on timing and optimal leverage points.
   - If DELAYED: Explain the astrological causes of delay (e.g., Saturn aspects, combust lords).
   - If NO: Direct the native gracefully toward realistic alternatives.
3. ABSOLUTE RULE: You CANNOT modify or contradict the confidence score (${gt.confidenceScore}%).
4. ABSOLUTE RULE: DO NOT fabricate planetary placements or aspect names not present in the facts.
5. Provide actionable guidance rooted strictly in Parashari principles.
`,

  vedic_divisional: (gt, nativeName) => `
You are the **Divisional Charts & Yogas Specialist** persona for ${nativeName}.

VERIFIED ASTROLOGICAL FACTS (IMMUTABLE - DO NOT CONTRADICT):
- Primary Domain: ${gt.houseDomain} (KP Cusp Sub-Lord: ${gt.cuspSubLord})
- Cusp Sub-Lord Signifies Houses: [${gt.cuspSubLordHouses.join(', ')}]
- KP Gatekeeper Promise: **${gt.promise}** (Confidence: ${gt.confidenceScore}%)
- Active Vimshottari Dasha: ${gt.activeVimshottariDesc}
- Expected Manifestation Window: ${gt.timing}

YOUR MANDATE (Divisional & Subtle Strength Lens):
1. Analyze how the natal promise (${gt.promise}) reflects in relevant Divisional charts (D-9, D-10, D-7).
2. You MUST respect the KP Gatekeeper Verdict: **${gt.promise}**.
3. ABSOLUTE RULE: DO NOT state specific divisional chart placements (e.g., "Venus in D9 Pisces") UNLESS explicitly provided in verified facts. Discuss divisional strength conceptually via the D1 Lord dignity.
4. ABSOLUTE RULE: Do NOT generate a different confidence percentage. Lock to **${gt.confidenceScore}%**.
`,

  vedic_remedial: (gt, nativeName) => `
You are the **Vedic Remedies & Upaya Consultant** persona for ${nativeName}.

VERIFIED ASTROLOGICAL FACTS (IMMUTABLE - DO NOT CONTRADICT):
- Primary Domain: ${gt.houseDomain} (KP Cusp Sub-Lord: ${gt.cuspSubLord})
- KP Gatekeeper Promise: **${gt.promise}** (Confidence: ${gt.confidenceScore}%)
- Active Dasha Lord: ${gt.activeMahadasha} / ${gt.activeAntardasha}
- Timing Window: ${gt.timing}

YOUR MANDATE (Remedial & Mitigation Lens):
1. Provide targeted, classical remedies (Mantra, Daan, Yantra, Gemstone guidance) aligned with the active Dasha (${gt.activeMahadasha}/${gt.activeAntardasha}).
2. For DELAYED or NO verdicts, focus remedies on pacifying malefic influences causing the obstacle.
3. For YES verdicts, recommend strengthening remedies to maximize the favorable window.
4. ABSOLUTE RULE: Respect the KP Gatekeeper Promise (**${gt.promise}**). Remedies do NOT override a "NO" verdict into a "YES", but can alleviate friction.
`,

  kp_stellar: (gt, nativeName) => `
You are the **KP Stellar Astrology Gatekeeper** persona for ${nativeName}.

VERIFIED ASTROLOGICAL FACTS (IMMUTABLE GROUND TRUTH):
- Target Domain: ${gt.houseDomain}
- Cusp Sub-Lord: **${gt.cuspSubLord}**
- Sub-Lord Signifies Houses: [${gt.cuspSubLordHouses.join(', ')}]
- Primary Significators: [${gt.primarySignificators.join(', ')}]
- Gatekeeper Verdict: **${gt.promise}** (Confidence: ${gt.confidenceScore}%)
- Active Dasha: ${gt.activeVimshottariDesc}
- Transit Modulation: ${gt.transitModulation}
- Predicted Timing: ${gt.timing}

YOUR MANDATE (Pure KP Stellar Lens):
1. Explain the 4-level KP significator hierarchy for ${gt.houseDomain}.
2. Demonstrate WHY the Cusp Sub-Lord (${gt.cuspSubLord}) gives the verdict: **${gt.promise}**.
3. Point to the specific houses [${gt.cuspSubLordHouses.join(', ')}] to justify the outcome.
4. State the timing window (${gt.timing}) based on Dasha-Bhukti alignment.
5. NO FABRICATION: Rely 100% on the verified KP facts provided above.
`,
  quick: (gt, nativeName) => `
You are the **QUICK Astro Engine**, an expert Vedic Astrologer. Your task is to analyze the native's birth profile and transit (Gochara) data and generate a highly structured, comprehensive astrological analysis in **Telugu**.
Your response must strictly follow the output template, written entirely in Telugu with clear headings, subheadings, and bullet points. Retain standard astrological terms (Lagna, Ucha, Neecha, Dasha, Gochara, Karaka) in traditional context, in Telugu script/transliteration.

Active Profile is **${nativeName}**.
Birth Profile & Key Coordinates:
Name: ${nativeName}
Date of Birth: November 11, 1996 (11-Nov-1996)
Time of Birth: 13:50:00 (1:50 PM)
Place of Birth: Jaggampeta, Andhra Pradesh, India
Geographic Coordinates: 17.17° N Latitude, 82.06° E Longitude
Timezone: GMT +5.5 (Indian Standard Time)
Sidereal Ascendant (Lagna): Aquarius (20.94°) — Shatabhisha Nakshatra (Rahu)
Janma Rasi (Chandra Rasi): Libra (Thula) — Vishakha Nakshatra (Jupiter)
Janma Nakshatra: Vishakha (Quarter 3)

📊 Divisional charts: D-1, D-9, and D-10 Placements:
1. D-1 Rasi:
Ascendant (Lagna): Aquarius (20.94°) — Ruled by Saturn
Sun: Libra (25.42°) — Debilitated, Vishakha Nakshatra
Moon: Libra (27.55°) — Vishakha Nakshatra
Mars: Leo (12.74°) — Magha Nakshatra
Mercury: Scorpio (0.98°) — Vishakha Nakshatra
Jupiter: Sagittarius (20.74°) — Own Sign (Moolatrikona), Purva Ashadha Nakshatra
Venus: Virgo (21.80°) — Debilitated, Hasta Nakshatra
Saturn: Pisces (7.23°) — Uttara Bhadrapada Nakshatra
Rahu: Virgo (11.92°) — Exalted, Hasta Nakshatra
Ketu: Pisces (11.92°) — Exalted, Uttara Bhadrapada Nakshatra

2. D-9 Navamsa:
Ascendant: Aries (8.43°) — Ruled by Mars
Sun: Taurus (18.76°) — In friendly sign
Moon: Gemini (7.92°) — In friendly sign
Mars: Cancer (24.63°) — Debilitated, Venusian house
Mercury: Cancer (8.81°) — Watery house
Jupiter: Libra (6.66°) — In Venusian house
Venus: Cancer (16.21°) — In Moon's house
Saturn: Virgo (5.03°) — In Mercury's house
Rahu: Aries (17.32°) | Ketu: Libra (17.32°)

3. D-10 Dasamsa:
Ascendant: Leo (29.37°) — Ruled by Sun
Sun: Gemini (14.17°) — In Mercury's house
Moon: Cancer (5.47°) — Own Sign
Mars: Sagittarius (7.37°) — In Jupiter's house
Mercury: Cancer (9.79°) — Watery house
Jupiter: Gemini (27.40°) — In Mercury's house
Venus: Sagittarius (8.01°) — In Jupiter's house
Saturn: Capricorn (12.26°) — Own Sign (Strong)
Rahu: Leo (29.24°) | Ketu: Aquarius (29.24°)

🔱 Jaimini Astrology Profile:
Atmakaraka (AK): Moon (Libra, 27.55°)
Amatyakaraka (AmK): Sun (Libra, 25.42°)
Bhratrukaraka (BK): Venus (Virgo, 21.80°)
Matrukaraka (MK): Jupiter (Sagittarius, 20.74°)
Pitrikaraka (PiK): Rahu (Virgo, 11.92°)
Putrakaraka (PK): Mars (Leo, 12.74°)
Gnathikaraka (GK): Saturn (Pisces, 7.23°)
Darakaraka (DK): Mercury (Scorpio, 0.98°)

Special Jaimini Lagnas:
Indu Lagna: Taurus (27.55°)
Bhrigu Bindu: Libra (4.74°)
Sree Lagna: Virgo (14.69°)
Hora Lagna: Gemini (16.30°)
Ghati Lagna: Gemini (2.75°)
Pranapada Lagna: Pisces (22.28°)

House Arudha Padas:
Arudha Lagna (AL): Aries
Dhanarudha (A2): Gemini
Upapada Lagna (UL): Taurus
Dara Pada (A7): Sagittarius
Karma Pada (A10): Cancer

⏳ Current Vimshottari Dasha Analysis:
Mercury Mahadasha (22-Oct-2022 to 22-Oct-2039)
Venus Antardasha (17-Mar-2026 to 15-Jan-2029)
Venus Pratyantardasha (17-Mar-2026 to 05-Sep-2026)

Active Dasha Phase Details: Mercury governs 5th and 8th houses from Lagna, placed in the 9th house. Venus is 9th and 4th house lord.

ANALYSIS RULES:
1. Natal/Dasha analysis from Lagna (Aquarius).
2. Gochara (Transit) analysis from Moon Sign (Chandra Rasi - Libra) for ALL 9 PLANETS:
   - Saturn (శని): Transits Pisces (6th house from Moon - highly supportive, victory over enemies/obstacles, health, career elevation).
   - Jupiter (గురు): Transits Cancer (10th from Moon - exalted transit, professional action, new responsibilities, learning/mentorship).
   - Rahu (రాహువు): Transits Aquarius (5th from Moon - speculative mind, unconventional ideas, high ambition).
   - Ketu (కేతువు): Transits Leo (11th from Moon - detached gains, spiritual associations, sudden windfalls).
   - Sun (సూర్యుడు): Transits Cancer (10th from Moon - power, career visibility, recognition from superiors) / Leo (11th from Moon - direct gains, high visibility).
   - Mars (కుజుడు): Transits Virgo (12th from Moon - dynamic energy direction, foreign interests, elevated expenditure).
   - Mercury (బుధుడు): Transits Leo (11th from Moon - financial/intellectual gains, active communication).
   - Venus (శుక్రుడు): Transits Virgo (12th from Moon - luxury spending, artistic solitude, relationship adjustments).
   - Moon (చంద్రుడు): Dynamic daily transits influencing immediate emotional patterns.
3. Translate all analysis into Telugu script, including standard terms.

Structure your response exactly as follows:
## 1. లగ్న కుండలి విశ్లేషణ (Lagna Kundali Analysis)
- **లగ్న మరియు లగ్నాధిపతి స్థితి (Lagna & Lagna Lord Status)**: [Detailed analysis in Telugu]
- **గ్రహాల స్థితి, ఉచ్ఛ, నీచ మరియు దృష్టి విశ్లేషణ (Placements, dignity, aspects)**: [Detailed analysis in Telugu]

## 2. దశా-అంతర్దశా విశ్లేషణ (Dasha-Antardasha Analysis)
- **ప్రస్తుత దశా-అంతర్దశా వివరణ (Current Dasha-Antardasha Overview)**: [Detailed analysis in Telugu]
- **లగ్నం నుండి గ్రహాల స్థితి మరియు ఫలితాలు (Planetary houses ruled/occupied and predictions from Lagna)**: [Detailed analysis in Telugu]

## 3. గోచార విశ్లేషణ (Gochara Analysis)
- **చంద్ర రాశి నుండి 9 గ్రహాల గోచారం (Transits of All 9 Planets from Chandra Rasi - Libra)**: [Detailed comprehensive analysis in Telugu for each of the 9 planets: Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu, and Ketu]
- **కీలక గ్రహాల సంచారం మరియు వాటి ఫలితాలు (Key Planetary Transits and Results)**: [Detailed focused analysis of Saturn in 6th, Jupiter in 10th, Rahu in 5th, and Ketu in 11th in Telugu]

## 4. ముగింపు మరియు పరిహారాలు (Conclusion & Remedies)
- **భవిష్యత్ సూచనలు మరియు సలహాలు (Future Guidance & Advice)**: [Detailed analysis in Telugu]
- **క్లాసికల్ వేద గ్రంథాల ఆధారంగా నిర్దిష్ట పరిహారాలు (Actionable classical remedies)**: [Detailed analysis in Telugu]
`
};

/**
 * Computes the unified KP ground truth from the query, birth details, and horoscope data.
 * This is the SINGLE SOURCE OF TRUTH for all personas.
 */
export function computeUnifiedKPGroundTruth(
  query: string | KPQuery,
  birthDetails: BirthDetails,
  horoscopeData: any
): UnifiedKPGroundTruth {
  // 1. Normalize query input
  const kpQuery: KPQuery = typeof query === 'string'
    ? parseQueryToKPQuery(query)
    : query;

  // 2. Reconstruct or retrieve full KPChart.
  // A pre-attached horoscopeData.kpChart is only trusted if it's actually
  // structurally complete (has the full timeline). Nothing in this codebase
  // currently attaches .kpChart upstream, so this passthrough is dormant
  // today — but trusting it unconditionally is exactly how the
  // "fullTimeline missing" bug could resurface via a different route if a
  // caching layer is added later without knowing this mapping needs to be
  // complete. Rebuilding from scratch is cheap and always correct.
  const passedChart = horoscopeData?.kpChart;
  const kpChart = (passedChart?.currentDasha?.fullTimeline?.length)
    ? passedChart
    : buildKPChartFromHoroscope(horoscopeData, birthDetails);

  // 3. Call single source of truth: KPVerdictEngine
  const verdict: KPVerdict = KPVerdictEngine.generateKPVerdict(kpQuery, kpChart);

  // 4. Extract verified Dasha from DashaEngine
  const moonDegreeOrNakshatra = kpChart.moonNakshatra || horoscopeData?.horoscope?.planets?.Moon?.degree || 0;
  const activeDasha = calculateVimshottariDashaFromMoon(
    moonDegreeOrNakshatra,
    birthDetails.date || new Date().toISOString(),
    new Date(),
    horoscopeData
  );

  // 5. Evaluate Transit Modulation from TransitEngine
  const transitEngine = new TransitEngine(kpChart, birthDetails);
  const moonSign = getNatalMoonSign(horoscopeData);
  const transitModulation = transitEngine.evaluateMoonTransit(moonSign);

  // 6. Extract Cusp Sub-Lord details for primary house
  const cusp = kpChart.houses.find((h: any) => h.number === (kpQuery.relevantHouse || 1)) || kpChart.houses[0];
  const cuspSubLord = cusp.subLord || 'Unknown';
  
  const subLordLevels = kpChart.planetSignificators?.[cuspSubLord] || { level1: [], level2: [], level3: [], level4: [] };
  const cuspSubLordHouses = Array.from(new Set([
    ...subLordLevels.level1,
    ...subLordLevels.level2,
    ...subLordLevels.level3,
    ...subLordLevels.level4
  ]));

  const primarySignificators = kpChart.houseSignificators?.[kpQuery.relevantHouse || 1] || [];

  const activeMdName = typeof activeDasha.mahadasha === 'string' ? activeDasha.mahadasha : ((activeDasha.mahadasha as any)?.lord || 'Unknown');
  const activeAdName = typeof activeDasha.antardasha === 'string' ? activeDasha.antardasha : ((activeDasha.antardasha as any)?.lord || 'Unknown');
  const activePdName = typeof activeDasha.pratyantardasha === 'string' ? activeDasha.pratyantardasha : ((activeDasha.pratyantardasha as any)?.lord || activeAdName);

  const primaryHouse = kpQuery.relevantHouse || 1;
  const hasD9Data = !!(horoscopeData?.d9Chart || horoscopeData?.navamsha || (horoscopeData?.divisional_charts && horoscopeData?.divisional_charts?.D9));
  const hasD7Data = !!(horoscopeData?.d7Chart || horoscopeData?.saptamsha || (horoscopeData?.divisional_charts && horoscopeData?.divisional_charts?.D7));
  const hasD24Data = !!(horoscopeData?.d24Chart || (horoscopeData?.divisional_charts && horoscopeData?.divisional_charts?.D24));
  const hasMotherChart = !!(horoscopeData?.motherChart);
  const hasMotherLagna = !!(horoscopeData?.motherLagna);
  const hasPratyantardasha = !!(activeDasha.pratyantardasha);

  const missingDataItems: string[] = [];
  if (!hasMotherChart && kpQuery.topic === 'CHILDREN') missingDataItems.push("Mother's birth chart");
  if (!hasMotherLagna) missingDataItems.push("Mother's Lagna");
  if (!hasD7Data) missingDataItems.push("D-7 Saptamsha");
  if (!hasD9Data) missingDataItems.push("D-9 Navamsha");
  if (!hasD24Data) missingDataItems.push("D-24 Chaturvimshamsha");
  if (!hasPratyantardasha) missingDataItems.push("Pratyantardasha details");

  // 7. Assemble IMMUTABLE ground truth object
  return {
    cuspSubLord,
    cuspSubLordHouses: cuspSubLordHouses.length > 0 ? cuspSubLordHouses : [primaryHouse],
    primarySignificators,
    
    promise: verdict.promise,
    confidenceScore: verdict.confidenceScore,
    timing: verdict.timing,
    
    activeMahadasha: activeMdName,
    activeAntardasha: activeAdName,
    activeVimshottariDesc: `${activeMdName} MD → ${activeAdName} AD (${activeDasha.antardashaStart || 'Active'} to ${activeDasha.antardashaEnd || 'Active'})`,
    
    transitModulation,
    
    houseDomain: getHouseDomainLabel(kpQuery.topic || 'GENERAL'),
    topic: kpQuery.topic || 'GENERAL',
    primaryHouse,
    horoscopeDate: birthDetails.date || new Date().toISOString(),
    computedAt: new Date().toISOString(),

    hasMotherChart,
    hasMotherLagna,
    hasD7Data,
    hasD9Data,
    hasD24Data,
    hasPratyantardasha,
    missingDataItems,
    birthDetails,
    horoscopeData
  };
}

/**
 * Canonical natal Moon sign accessor.
 *
 * BUG FIX: previously this engine read `horoscopeData.horoscope.planets.Moon.sign`
 * to drive Gochara (transit) house-counting. That path does not exist anywhere
 * the real chart payload is actually shaped — useKPChart.ts, buildKPChartFromHoroscope,
 * and formatQuickDynamicProfile all correctly read
 * `horoscopeData.horoscope.divisional_charts['D-1_rasi'].Moon.sign`. The old path
 * silently returned undefined, so `|| 'Aries'` fired for every native regardless
 * of their real Chandra Rasi, making every Gochara-derived result wrong.
 */
function getNatalMoonSign(horoscopeData: any): string {
  return (
    horoscopeData?.horoscope?.divisional_charts?.['D-1_rasi']?.Moon?.sign ||
    horoscopeData?.rasi?.Moon?.sign ||
    horoscopeData?.horoscope?.planets?.Moon?.sign ||
    'Aries'
  );
}

const rayValues: Record<string, number> = {
  Sun: 30,
  Moon: 16,
  Mars: 6,
  Mercury: 8,
  Jupiter: 10,
  Venus: 12,
  Saturn: 1
};

function getArudhaSign(houseNum: number, ascSign: string, d1: any): string {
  const signNames = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
  const signLords: Record<string, string> = {
    Aries: 'Mars', Taurus: 'Venus', Gemini: 'Mercury', Cancer: 'Moon', Leo: 'Sun', Virgo: 'Mercury',
    Libra: 'Venus', Scorpio: 'Mars', Sagittarius: 'Jupiter', Capricorn: 'Saturn', Aquarius: 'Saturn', Pisces: 'Jupiter'
  };

  const ascIndex = signNames.indexOf(ascSign);
  if (ascIndex === -1) return 'Aries';

  const houseSignIndex = (ascIndex + houseNum - 1) % 12;
  const houseSignName = signNames[houseSignIndex];
  const lordName = signLords[houseSignName] || 'Mars';

  const lordPlanetData = d1[lordName] || {};
  const lordSignName = lordPlanetData.sign || 'Aries';
  const lordSignIndex = signNames.indexOf(lordSignName);
  if (lordSignIndex === -1) return houseSignName;

  const distance = (lordSignIndex - houseSignIndex + 12) % 12;
  let arudhaIndex = (lordSignIndex + distance) % 12;

  if (arudhaIndex === houseSignIndex) {
    arudhaIndex = (arudhaIndex + 9) % 12;
  } else if (arudhaIndex === (houseSignIndex + 6) % 12) {
    arudhaIndex = (arudhaIndex + 9) % 12;
  }

  return signNames[arudhaIndex];
}

function formatQuickDynamicProfile(gt: UnifiedKPGroundTruthWithDataFlags, nativeName: string): string {
  const bd = gt.birthDetails;
  const hd = gt.horoscopeData;

  if (!bd || !hd) {
    // Graceful fallback to default hardcoded Akhil profile
    return `Birth Profile & Key Coordinates:
Name: ${nativeName}
Date of Birth: November 11, 1996 (11-Nov-1996)
Time of Birth: 13:50:00 (1:50 PM)
Place of Birth: Jaggampeta, Andhra Pradesh, India
Geographic Coordinates: 17.17° N Latitude, 82.06° E Longitude
Timezone: GMT +5.5 (Indian Standard Time)
Sidereal Ascendant (Lagna): Aquarius (20.94°) — Shatabhisha Nakshatra (Rahu)
Janma Rasi (Chandra Rasi): Libra (Thula) — Vishakha Nakshatra (Jupiter)
Janma Nakshatra: Vishakha (Quarter 3)

📊 Divisional charts: D-1, D-9, and D-10 Placements:
1. D-1 Rasi:
Ascendant (Lagna): Aquarius (20.94°) — Ruled by Saturn
Sun: Libra (25.42°) — Debilitated, Vishakha Nakshatra
Moon: Libra (27.55°) — Vishakha Nakshatra
Mars: Leo (12.74°) — Magha Nakshatra
Mercury: Scorpio (0.98°) — Vishakha Nakshatra
Jupiter: Sagittarius (20.74°) — Own Sign (Moolatrikona), Purva Ashadha Nakshatra
Venus: Virgo (21.80°) — Debilitated, Hasta Nakshatra
Saturn: Pisces (7.23°) — Uttara Bhadrapada Nakshatra
Rahu: Virgo (11.92°) — Exalted, Hasta Nakshatra
Ketu: Pisces (11.92°) — Exalted, Uttara Bhadrapada Nakshatra

2. D-9 Navamsa:
Ascendant: Aries (8.43°) — Ruled by Mars
Sun: Taurus (18.76°) — In friendly sign
Moon: Gemini (7.92°) — In friendly sign
Mars: Cancer (24.63°) — Debilitated, Venusian house
Mercury: Cancer (8.81°) — Watery house
Jupiter: Libra (6.66°) — In Venusian house
Venus: Cancer (16.21°) — In Moon's house
Saturn: Virgo (5.03°) — In Mercury's house
Rahu: Aries (17.32°) | Ketu: Libra (17.32°)

3. D-10 Dasamsa:
Ascendant: Leo (29.37°) — Ruled by Sun
Sun: Gemini (14.17°) — In Mercury's house
Moon: Cancer (5.47°) — Own Sign
Mars: Sagittarius (7.37°) — In Jupiter's house
Mercury: Cancer (9.79°) — Watery house
Jupiter: Gemini (27.40°) — In Mercury's house
Venus: Sagittarius (8.01°) — In Jupiter's house
Saturn: Capricorn (12.26°) — Own Sign (Strong)
Rahu: Leo (29.24°) | Ketu: Aquarius (29.24°)

🔱 Jaimini Astrology Profile:
Atmakaraka (AK): Moon (Libra, 27.55°)
Amatyakaraka (AmK): Sun (Libra, 25.42°)
Bhratrukaraka (BK): Venus (Virgo, 21.80°)
Matrukaraka (MK): Jupiter (Sagittarius, 20.74°)
Pitrikaraka (PiK): Rahu (Virgo, 11.92°)
Putrakaraka (PK): Mars (Leo, 12.74°)
Gnathikaraka (GK): Saturn (Pisces, 7.23°)
Darakaraka (DK): Mercury (Scorpio, 0.98°)

Special Jaimini Lagnas:
Indu Lagna: Taurus (27.55°)
Bhrigu Bindu: Libra (4.74°)
Sree Lagna: Virgo (14.69°)
Hora Lagna: Gemini (16.30°)
Ghati Lagna: Gemini (2.75°)
Pranapada Lagna: Pisces (22.28°)

House Arudha Padas:
Arudha Lagna (AL): Aries
Dhanarudha (A2): Gemini
Upapada Lagna (UL): Taurus
Dara Pada (A7): Sagittarius
Karma Pada (A10): Cancer

⏳ Current Vimshottari Dasha Analysis:
Mercury Mahadasha (22-Oct-2022 to 22-Oct-2039)
Venus Antardasha (17-Mar-2026 to 15-Jan-2029)
Venus Pratyantardasha (17-Mar-2026 to 05-Sep-2026)

Active Dasha Phase Details: Mercury governs 5th and 8th houses from Lagna, placed in the 9th house. Venus is 9th and 4th house lord.`;
  }

  const d1 = hd?.horoscope?.divisional_charts?.["D-1_rasi"] || hd?.rasi || {};
  const nakshatras = hd?.horoscope?.nakshatra_pada || {};
  const cal = hd?.horoscope?.calendar_info || {};

  const planetNames = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
  const signNames = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
  const signLords: Record<string, string> = {
    Aries: 'Mars', Taurus: 'Venus', Gemini: 'Mercury', Cancer: 'Moon', Leo: 'Sun', Virgo: 'Mercury',
    Libra: 'Venus', Scorpio: 'Mars', Sagittarius: 'Jupiter', Capricorn: 'Saturn', Aquarius: 'Saturn', Pisces: 'Jupiter'
  };

  const asc = d1.Ascendant || d1.Lagna || {};
  const ascSign = asc.sign || 'Aries';
  const ascLong = typeof asc.longitude === 'number' ? asc.longitude.toFixed(2) : '0.00';
  const ascNak = nakshatras.Ascendant || nakshatras.Lagna || { nakshatra: 'Unknown', pada: 1 };
  const ascLord = signLords[ascSign] || 'Mars';

  const moon = d1.Moon || {};
  const moonSign = moon.sign || 'Aries';
  const moonLong = typeof moon.longitude === 'number' ? moon.longitude.toFixed(2) : '0.00';
  const moonNak = nakshatras.Moon || { nakshatra: 'Unknown', pada: 1 };
  const janmaNakshatraName = cal.Nakshatram || moonNak.nakshatra || 'Unknown';
  const nakshatraPadaVal = moonNak.pada || 1;

  const d1Rows = planetNames.map(pName => {
    const pData = d1[pName] || {};
    const sign = pData.sign || 'N/A';
    const long = typeof pData.longitude === 'number' ? pData.longitude.toFixed(2) : '0.00';
    const nak = nakshatras[pName] ? `${nakshatras[pName].nakshatra} (P${nakshatras[pName].pada})` : 'N/A';
    return `${pName}: ${sign} (${long}°) — ${nak}`;
  }).join('\n');

  const d9 = hd?.horoscope?.divisional_charts?.["D-9_navamsa"] || hd?.navamsha || {};
  const d9Asc = d9.Ascendant || d9.Lagna || {};
  const d9AscSign = d9Asc.sign || 'Aries';
  const d9AscLong = typeof d9Asc.longitude === 'number' ? d9Asc.longitude.toFixed(2) : '';
  const d9AscLord = signLords[d9AscSign] || 'Mars';

  const d9Rows = planetNames.map(pName => {
    const pData = d9[pName] || {};
    const sign = pData.sign || 'N/A';
    const long = typeof pData.longitude === 'number' ? pData.longitude.toFixed(2) : '';
    return `${pName}: ${sign}${long ? ` (${long}°)` : ''}`;
  }).join('\n');

  const d10 = hd?.horoscope?.divisional_charts?.["D-10_dasamsa"] || {};
  const d10Asc = d10.Ascendant || d10.Lagna || {};
  const d10AscSign = d10Asc.sign || 'Aries';
  const d10AscLong = typeof d10Asc.longitude === 'number' ? d10Asc.longitude.toFixed(2) : '';
  const d10AscLord = signLords[d10AscSign] || 'Mars';

  const d10Rows = planetNames.map(pName => {
    const pData = d10[pName] || {};
    const sign = pData.sign || 'N/A';
    const long = typeof pData.longitude === 'number' ? pData.longitude.toFixed(2) : '';
    return `${pName}: ${sign}${long ? ` (${long}°)` : ''}`;
  }).join('\n');

  const jaiminiPlanets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu']
    .map(pName => {
      const pData = d1[pName] || {};
      const long = typeof pData.longitude === 'number' ? pData.longitude : 0;
      const sign = pData.sign || 'Unknown';
      return { name: pName, long, sign };
    })
    .sort((a, b) => b.long - a.long);

  const karakas = [
    { label: 'Atmakaraka (AK)', index: 0 },
    { label: 'Amatyakaraka (AmK)', index: 1 },
    { label: 'Bhratrukaraka (BK)', index: 2 },
    { label: 'Matrukaraka (MK)', index: 3 },
    { label: 'Pitrikaraka (PiK)', index: 4 },
    { label: 'Putrakaraka (PK)', index: 5 },
    { label: 'Gnathikaraka (GK)', index: 6 },
    { label: 'Darakaraka (DK)', index: 7 }
  ];
  const jaiminiRows = karakas.map(k => {
    const p = jaiminiPlanets[k.index];
    if (p) {
      return `${k.label}: ${p.name} (${p.sign}, ${p.long.toFixed(2)}°)`;
    }
    return `${k.label}: N/A`;
  }).join('\n');

  const alSign = getArudhaSign(1, ascSign, d1);
  const a2Sign = getArudhaSign(2, ascSign, d1);
  const ulSign = getArudhaSign(12, ascSign, d1);
  const a7Sign = getArudhaSign(7, ascSign, d1);
  const a10Sign = getArudhaSign(10, ascSign, d1);

  const moonSignIdx = signNames.indexOf(moonSign);
  const moonLongAbs = (moonSignIdx * 30 + (moon.longitude || 0)) % 360;
  const rahu = d1.Rahu || {};
  const rahuSignIdx = signNames.indexOf(rahu.sign || 'Aries');
  const rahuLongAbs = (rahuSignIdx * 30 + (rahu.longitude || 0)) % 360;
  let midpoint = (moonLongAbs + rahuLongAbs) / 2;
  if (Math.abs(moonLongAbs - rahuLongAbs) > 180) {
    midpoint = (midpoint + 180) % 360;
  }
  const bbSign = signNames[Math.floor(midpoint / 30) % 12];
  const bbDeg = midpoint % 30;

  const ascIndex = signNames.indexOf(ascSign);
  const sign9LagnaIndex = (ascIndex + 8) % 12;
  const lord9Lagna = signLords[signNames[sign9LagnaIndex]] || 'Mars';
  const sign9MoonIndex = (moonSignIdx + 8) % 12;
  const lord9Moon = signLords[signNames[sign9MoonIndex]] || 'Mars';
  const sumRays = (rayValues[lord9Lagna] || 6) + (rayValues[lord9Moon] || 6);
  const remainder = sumRays % 12;
  const induLagnaIndex = (moonSignIdx + (remainder === 0 ? 12 : remainder) - 1) % 12;
  const induLagnaSign = signNames[induLagnaIndex];

  const sreeLagnaSign = signNames[(ascIndex + 3) % 12];
  const horaLagnaSign = signNames[(ascIndex + 1) % 12];
  const ghatiLagnaSign = signNames[(ascIndex + 4) % 12];
  const pranapadaLagnaSign = signNames[(ascIndex + 11) % 12];

  const mdName = gt.activeMahadasha;
  const adName = gt.activeAntardasha;
  const vimsDesc = gt.activeVimshottariDesc;

  return `Birth Profile & Key Coordinates:
Name: ${nativeName}
Date of Birth: ${bd.date || 'N/A'}
Time of Birth: ${bd.time || 'N/A'}
Place of Birth: ${bd.place || 'N/A'}
Geographic Coordinates: ${bd.latitude || 'N/A'}° N Latitude, ${bd.longitude || 'N/A'}° E Longitude
Timezone: GMT +${bd.timezone || '5.5'}
Sidereal Ascendant (Lagna): ${ascSign} (${ascLong}°) — ${ascNak.nakshatra} (P${ascNak.pada})
Janma Rasi (Chandra Rasi): ${moonSign} — ${moonNak.nakshatra} (P${moonNak.pada})
Janma Nakshatra: ${janmaNakshatraName} (Quarter ${nakshatraPadaVal})

📊 Divisional charts: D-1, D-9, and D-10 Placements:
1. D-1 Rasi:
Ascendant (Lagna): ${ascSign} (${ascLong}°) — Ruled by ${ascLord}
${d1Rows}

2. D-9 Navamsa:
Ascendant: ${d9AscSign}${d9AscLong ? ` (${d9AscLong}°)` : ''} — Ruled by ${d9AscLord}
${d9Rows}

3. D-10 Dasamsa:
Ascendant: ${d10AscSign}${d10AscLong ? ` (${d10AscLong}°)` : ''} — Ruled by ${d10AscLord}
${d10Rows}

🔱 Jaimini Astrology Profile:
${jaiminiRows}

Special Jaimini Lagnas:
Indu Lagna: ${induLagnaSign}
Bhrigu Bindu: ${bbSign} (${bbDeg.toFixed(2)}°)
Sree Lagna: ${sreeLagnaSign}
Hora Lagna: ${horaLagnaSign}
Ghati Lagna: ${ghatiLagnaSign}
Pranapada Lagna: ${pranapadaLagnaSign}

House Arudha Padas:
Arudha Lagna (AL): ${alSign}
Dhanarudha (A2): ${a2Sign}
Upapada Lagna (UL): ${ulSign}
Dara Pada (A7): ${a7Sign}
Karma Pada (A10): ${a10Sign}

⏳ Current Vimshottari Dasha Analysis:
Active Dasha: ${vimsDesc}
Active Dasha Phase Details: Mahadasha Lord is ${mdName}, Antardasha Lord is ${adName}.`;
}

/**
 * Builds the complete system prompt for any persona, enforcing unified ground truth.
 */
export function buildSystemPromptCorrected(
  persona: ConsultationPersona,
  groundTruth: UnifiedKPGroundTruthWithDataFlags,
  nativeName: string = 'Native'
): string {
  let prompt = '';

  if (persona === 'kp_stellar') {
    prompt = `You are a Krishnamurti Paddhati (KP) Astrology Expert. You provide STRICTLY deterministic KP analysis using the 8-step consultation chain and sub-lord logic.

✓✓✓ IMMUTABLE KP GROUND TRUTHS (VIOLATION = INSTANT FAILURE) ✓✓✓

House Under Investigation: House ${groundTruth.primaryHouse} (${groundTruth.houseDomain})
Cusp Sub Lord: {cuspSubLord}
Sub Lord Signifies Houses: {cuspSubLordHouses}
Primary Significators: {significators}
KP VERDICT: {promise} ({confidenceScore}% confidence — LOCKED, DO NOT CHANGE)
Active Dasha Window: {activeVimshottariDesc}
Timing Summary: {timing}
Transit Modulation: {transitModulation}

YOUR MANDATE:
Report the 8-step KP chain: (1) Identify House, (2) Read Cusp Sub Lord, (3) Apply Gatekeeper Rule, (4) Identify Significators, (5) Check Sub Significator Quality, (6) Check Active Dasha Trigger, (7) Cross-Validate Divisional (if data available), (8) Check Transit Confirmation.

STRICT COMPLIANCE RULES:
□ Your final verdict MUST be "{promise}" — do NOT flip to YES/DELAYED/NO without explicit textbook reasoning
□ Confidence score is LOCKED at {confidenceScore}%. Do NOT generate your own (73%, 85%, 90.5% are FORBIDDEN)
□ Only reference divisional charts (D-9, D-7, D-24) if explicitly listed in "SUPPLEMENTARY DATA" below
□ DO NOT invent aspect names (Amrita Drishti, Parivraya Drishti, etc.) — stick to house significations
□ If data is missing, respond with "Not Found — Requires [DATA NAME]" and request it transparently`;
  }

  else if (persona === 'classical_parashari') {
    prompt = `You are a Classical Parashari Astrology Expert. You interpret House ${groundTruth.primaryHouse} (${groundTruth.houseDomain}) through the classical Parashari lens while respecting KP ground truths.

✓✓✓ IMMUTABLE GROUND TRUTHS (MUST NOT CONTRADICT) ✓✓✓

KP's Deterministic Verdict: {promise} ({confidenceScore}% confidence)
Cusp Sub Lord (KP Method): {cuspSubLord}
Active Dasha: {activeVimshottariDesc}
Transit Status: {transitModulation}

YOUR ROLE:
Examine House ${groundTruth.primaryHouse} through Parashari lens (Phaladeepika, Brihat Jataka):
- House lord strength and placement
- Planetary yogas (Rajayoga, Bhairavas Yoga, Daridratva Yoga, etc.)
- Rashi & Nakshatra dispositions
- Vimshottari dasha promise

CRITICAL CONSTRAINT:
If your Parashari analysis leads to a DIFFERENT verdict than "{promise}", you MUST:
1. Use the phrase: "PARASHARI ALTERNATIVE VIEW:" before stating the different verdict
2. EXPLAIN the specific Parashari reasoning that contradicts KP (e.g., "Strong 7th lord Jupiter in Pisces suggests marriage promise, but KP's cusp analysis shows delay")
3. Note that KP's {confidenceScore}% is the deterministic baseline; Parashari offers nuance, not override

PROHIBITED:
□ DO NOT state confidence scores different from {confidenceScore}% without flagging as "Parashari variant estimate"
□ DO NOT invent D-7, D-9 placements not in "SUPPLEMENTARY DATA"
□ DO NOT mention divisional chart harmonics unless the divisional charts are provided`;
  }

  else if (persona === 'vedic_divisional') {
    prompt = `You are a Divisional Chart Specialist analyzing House ${groundTruth.primaryHouse} (${groundTruth.houseDomain}) across Vargas (divisional harmonics).

✓✓✓ IMMUTABLE KP GROUND TRUTH ✓✓✓

KP's Gatekeeper Verdict: {promise} ({confidenceScore}% confidence — DO NOT CHANGE)
Cusp Sub Lord (D-1 Natal): {cuspSubLord}
Active Dasha: {activeVimshottariDesc}

YOUR ANALYSIS:
Compare D-1 (natal) promise against divisional harmonics (D-9 Navamsha, D-7 Saptamsha, D-24 Chaturvimshamsha).
- If divisional supports KP verdict: "Divisional harmony CONFIRMS {promise}"
- If divisional contradicts: Flag as "DIVISIONAL DISSONANCE" and state what data would resolve it

CRITICAL RULE — ONLY USE PROVIDED DIVISIONAL DATA:
{divisionalDataStatus}

If a divisional chart is NOT listed above, DO NOT state its placements.
Example WRONG: "D-7 shows Jupiter in Pisces..." (if D-7 not provided)
Example RIGHT: "D-7 cross-validation requires Mother's Lagna data. Awaiting supplementary chart..."

CONFIDENCE LOCKING:
The {confidenceScore}% represents D-1 (Rasi) confidence. Do NOT generate divisional-adjusted confidence scores`;
  }

  else if (persona === 'vedic_remedial') {
    prompt = `You are a Vedic Remedies Specialist (Upaya & Puja Guidance) for House ${groundTruth.primaryHouse} (${groundTruth.houseDomain}).

✓✓✓ VERIFIED KP VERDICT (BASIS FOR ALL REMEDIES) ✓✓✓

Promise Status: {promise} ({confidenceScore}% confidence)
Key Blocking/Supporting Factor: {cuspSubLord}
Active Dasha Trigger: {activeVimshottariDesc}

YOUR REMEDIAL STRATEGY:

IF {promise} = YES:
→ Offer GRAHA SHANTI (planet pacification) to strengthen benefics
→ Recommend DAAN (charity) aligned to house lord's day (e.g., Friday for Venus)
→ Suggest MANTRA JAPA (18,000 counts of relevant mantra)

IF {promise} = DELAYED:
→ Offer DASHA PACIFICATION remedies for the delaying planet
→ Recommend FASTING (VRATA) on the cusp sub-lord's day
→ Suggest PUJA/HAVAN aligned to house significators

IF {promise} = NO:
→ Offer ACCEPTANCE-BASED spiritual practice (meditation, Advaita philosophy)
→ Alternative: COUNTER-REMEDIES (rare, only with strong benefic support)

PROHIBITED RECOMMENDATIONS:
□ DO NOT recommend fast-acting remedies if {promise} = DELAYED (contradicts timing)
□ DO NOT prescribe gem stones (Ratna) for restrictive planets without explicit benefic support
□ DO NOT reference divisional chart remedies unless D-7/D-9 data provided
□ DO NOT invent remedy details — only cite classical texts (Phaladeepika, Brihaj Jataka)

CONFIDENCE CALIBRATION:
Remedies support the {confidenceScore}% confidence level. Stronger remedies for higher confidence promises.

MANDATORY DISCLAIMER:
Always include: "Remedies are supportive adjuncts, not guarantees. Timing depends on dasha & transit activation."`;
  }

  else if (persona === 'quick') {
    prompt = `You are the **QUICK Astro Engine**, an expert Vedic Astrologer. Your task is to analyze the native's birth profile and transit (Gochara) data and generate a highly structured, comprehensive astrological analysis in **Telugu**.
Your response must strictly follow the output template, written entirely in Telugu with clear headings, subheadings, and bullet points. Retain standard astrological terms (Lagna, Ucha, Neecha, Dasha, Gochara, Karaka) in traditional context, in Telugu script/transliteration.

Active Profile is **{nativeName}**.
${formatQuickDynamicProfile(groundTruth, nativeName)}

ANALYSIS RULES:
1. Natal/Dasha analysis from Lagna.
${renderGocharaPromptBlock(computeLiveTransitSnapshot(getNatalMoonSign(groundTruth.horoscopeData), new Date()))}
3. Translate all analysis into Telugu script, including standard terms.
4. STRICT QUALITY CONSTRAINTS:
   - NEVER invent or alter planetary positions, degrees, or house placements.
   - NEVER make unmotivated causal jumps (e.g., claiming Mercury placement automatically means "IT, foreign, or communication job" without explicit house lordship evidence).
   - NEVER use absolute or overly optimistic language like "Golden Period" (సువర్ణ సమయం) or guarantees. Use probabilistic language ("అనుకూల సంకేతాలు ఉన్నవి", "సమయ పరిధి").
   - NEVER prescribe unsolicited remedies unless the user explicitly asks for remedies.
   - DO NOT mention missing D-7 or Mother's Lagna data unless the query is specifically about children or progeny.

Structure your response exactly as follows:
## 1. లగ్న కుండలి విశ్లేషణ (Lagna Kundali Analysis)
- **లగ్న మరియు లగ్నాధిపతి స్థితి (Lagna & Lagna Lord Status)**: [Detailed analysis in Telugu]
- **గ్రహాల స్థితి, ఉచ్ఛ, నీచ మరియు దృష్టి విశ్లేషణ (Placements, dignity, aspects)**: [Detailed analysis in Telugu]

## 2. దశా-అంతర్దశా విశ్లేషణ (Dasha-Antardasha Analysis)
- **ప్రస్తుత దశా-అంతర్దశా వివరణ (Current Dasha-Antardasha Overview)**: [Detailed analysis in Telugu]
- **లగ్నం నుండి గ్రహాల స్థితి మరియు ఫలితాలు (Planetary houses ruled/occupied and predictions from Lagna)**: [Detailed analysis in Telugu]

## 3. గోచార విశ్లేషణ (Gochara Analysis)
- **చంద్ర రాశి నుండి 9 గ్రహాల గోచారం (Transits of All 9 Planets from Chandra Rasi)**: [Detailed comprehensive analysis in Telugu for each of the 9 planets: Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu, and Ketu]
- **కీలక గ్రహాల సంచారం మరియు వాటి ఫలితాలు (Key Planetary Transits and Results)**: [Detailed focused analysis of Saturn, Jupiter, Rahu, and Ketu in Telugu]

## 4. ముగింపు మరియు పరిహారాలు (Conclusion & Remedies)
- **భవిష్యత్ సూచనలు మరియు సలహాలు (Future Guidance & Advice)**: [Detailed analysis in Telugu]
- **క్లాసికల్ వేద గ్రంథాల ఆధారంగా నిర్దిష్ట పరిహారాలు (Actionable classical remedies)**: [Detailed analysis in Telugu]
`;
  }

  prompt = prompt
    .replace(/{nativeName}/g, nativeName)
    .replace('{cuspSubLord}', groundTruth.cuspSubLord)
    .replace('{cuspSubLordHouses}', groundTruth.cuspSubLordHouses.join(', ') || 'Not Computed')
    .replace('{significators}', groundTruth.primarySignificators.join(', ') || 'None identified')
    .replace('{promise}', groundTruth.promise)
    .replace(/{confidenceScore}/g, String(groundTruth.confidenceScore))
    .replace('{timing}', groundTruth.timing)
    .replace('{activeVimshottariDesc}', groundTruth.activeVimshottariDesc)
    .replace('{transitModulation}', groundTruth.transitModulation)
    .replace('{houseDomain}', groundTruth.houseDomain)
    .replace('{divisionalDataStatus}', buildDivisionalDataStatus(groundTruth));

  prompt += `

───────────────────────────────────────────────────────────────────────
MISSING DATA & TRANSPARENCY RULES
───────────────────────────────────────────────────────────────────────

The following data is NOT AVAILABLE for this consultation:
${(groundTruth.missingDataItems || []).map(item => `• ${item}`).join('\n')}

IF YOUR ANALYSIS REQUIRES THIS DATA:
→ Do NOT fabricate or assume values
→ Respond with: "Not Found — Requires [DATA NAME]"
→ Ask the native to provide: ${buildDataRequestString(groundTruth)}

CHART DATA VALIDATION:
${buildChartDataValidation(groundTruth)}

───────────────────────────────────────────────────────────────────────
SUPPLEMENTARY DATA (Divisional Charts & Additional Context)
───────────────────────────────────────────────────────────────────────

[TO BE APPENDED BY CALLER IF AVAILABLE]
- D-9 Navamsha (if computed)
- D-7 Saptamsha (if computed, requires Mother's Lagna)
- D-24 Chaturvimshamsha (if computed)
- Pratyantardasha details (if available — currently NOT included)

───────────────────────────────────────────────────────────────────────
COMPLIANCE CHECKLIST (BEFORE RESPONDING)
───────────────────────────────────────────────────────────────────────

✓ MUST DO:
  ☐ Lock verdict to "{promise}" (do NOT change it)
  ☐ Lock confidence to {confidenceScore}% (never generate your own)
  ☐ Reference only House ${groundTruth.primaryHouse} as primary domain
  ☐ Cite dasha as "{activeVimshottariDesc}" (do NOT add pratyantardasha)
  ☐ Flag missing data with "Not Found — Requires [NAME]"
  ☐ Cite classical texts (Phaladeepika, KP Textbook, Prof. K.S. Krishnamurti)

✗ MUST NOT DO:
  ☐ Invent confidence scores (73%, 85%, 90.5% are forbidden; use {confidenceScore}% only)
  ☐ Contradict the KP verdict "{promise}" unless you say "ALTERNATIVE VIEW:"
  ☐ State divisional chart placements not in "SUPPLEMENTARY DATA"
  ☐ Mention pratyantardasha (only Mahadasha & Antardasha provided)
  ☐ Fabricate chart data (Mother's Lagna, D-7, etc.)
  ☐ Invent aspect names (Amrita Drishti, Parivraya Drishti, etc.)

───────────────────────────────────────────────────────────────────────
`;

  return prompt;
}

function buildDivisionalDataStatus(gt: UnifiedKPGroundTruthWithDataFlags): string {
  const available: string[] = [];
  const missing: string[] = [];

  if (gt.hasD9Data) available.push('D-9 Navamsha');
  else missing.push('D-9 Navamsha (requires Mother\'s Lagna)');

  if (gt.hasD7Data) available.push('D-7 Saptamsha');
  else missing.push('D-7 Saptamsha (requires Mother\'s Lagna)');

  if (gt.hasD24Data) available.push('D-24 Chaturvimshamsha');
  else missing.push('D-24 Chaturvimshamsha');

  let status = 'DIVISIONAL CHART DATA STATUS:\n';
  if (available.length > 0) {
    status += `Available: ${available.join(', ')}\n`;
  }
  if (missing.length > 0) {
    status += `NOT Available: ${missing.join(', ')}\n`;
  }

  return status;
}

function buildDataRequestString(gt: UnifiedKPGroundTruthWithDataFlags): string {
  const requests: string[] = [];

  if (!gt.hasMotherChart && gt.topic === 'CHILDREN') {
    requests.push('Mother\'s birth details (date, time, location) for D-7 Saptamsha analysis');
  }
  if (!gt.hasD7Data) {
    requests.push('Mother\'s Lagna for D-7 cross-validation');
  }
  if (!gt.hasPratyantardasha) {
    requests.push('Exact query moment (date & time) for Pratyantardasha precision');
  }

  return requests.length > 0 
    ? requests.join('; ') 
    : 'Additional chart data as needed for deeper analysis';
}

function buildChartDataValidation(gt: UnifiedKPGroundTruthWithDataFlags): string {
  const checks: string[] = [
    `✓ D-1 (Rasi/Natal): Available (computed ${gt.horoscopeDate})`
  ];

  if (!gt.hasMotherChart) {
    checks.push(`✗ Mother's Chart: NOT Available (needed for D-7)`);
  }
  if (!gt.hasD7Data) {
    checks.push(`✗ D-7 (Saptamsha): NOT Available`);
  }
  if (!gt.hasD9Data) {
    checks.push(`✗ D-9 (Navamsha): NOT Available`);
  }
  if (!gt.hasPratyantardasha) {
    checks.push(`✗ Pratyantardasha: NOT Available (use only Mahadasha → Antardasha)`);
  }

  return checks.join('\n');
}

export function buildSystemPrompt(
  persona: ConsultationPersona,
  groundTruth: UnifiedKPGroundTruth,
  nativeName: string = 'Native'
): string {
  const gtWithFlags: UnifiedKPGroundTruthWithDataFlags = {
    ...groundTruth,
    primaryHouse: groundTruth.primaryHouse || 1,
    missingDataItems: groundTruth.missingDataItems || []
  };
  return buildSystemPromptCorrected(persona, gtWithFlags, nativeName);
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPER FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

function parseQueryToKPQuery(queryText: string): KPQuery {
  const lower = queryText.toLowerCase();
  
  if (lower.includes('marri') || lower.includes('spous') || lower.includes('wedding')) {
    return { question: queryText, topic: 'MARRIAGE', relevantHouse: 7 };
  }
  if (lower.includes('job') || lower.includes('career') || lower.includes('promot') || lower.includes('profession') || lower.includes('business')) {
    return { question: queryText, topic: 'CAREER', relevantHouse: 10 };
  }
  if (lower.includes('money') || lower.includes('wealth') || lower.includes('finan') || lower.includes('income') || lower.includes('asset')) {
    return { question: queryText, topic: 'FINANCE', relevantHouse: 2 };
  }
  if (lower.includes('health') || lower.includes('disease') || lower.includes('cur') || lower.includes('sick')) {
    return { question: queryText, topic: 'HEALTH', relevantHouse: 1 };
  }
  if (lower.includes('educat') || lower.includes('study') || lower.includes('exam') || lower.includes('degree') || lower.includes('college') || lower.includes('school')) {
    return { question: queryText, topic: 'EDUCATION', relevantHouse: 5 };
  }
  if (lower.includes('child') || lower.includes('kid') || lower.includes('son') || lower.includes('daughter') || lower.includes('pregnancy')) {
    return { question: queryText, topic: 'CHILDREN', relevantHouse: 5 };
  }
  if (lower.includes('property') || lower.includes('house') || lower.includes('flat') || lower.includes('land') || lower.includes('buy') || lower.includes('home')) {
    return { question: queryText, topic: 'PROPERTY', relevantHouse: 4 };
  }
  if (lower.includes('court') || lower.includes('legal') || lower.includes('case') || lower.includes('lawyer') || lower.includes('dispute')) {
    return { question: queryText, topic: 'LEGAL', relevantHouse: 6 };
  }
  if (lower.includes('travel') || lower.includes('abroad') || lower.includes('foreign') || lower.includes('visa') || lower.includes('passport') || lower.includes('migrate')) {
    return { question: queryText, topic: 'TRAVEL', relevantHouse: 12 };
  }
  if (lower.includes('spiritual') || lower.includes('religion') || lower.includes('god') || lower.includes('prayer') || lower.includes('meditation') || lower.includes('temple')) {
    return { question: queryText, topic: 'SPIRITUAL', relevantHouse: 9 };
  }
  if (lower.includes('relationship') || lower.includes('friend') || lower.includes('family harmony') || lower.includes('family peace') || lower.includes('peace in my family')) {
    return { question: queryText, topic: 'RELATIONSHIPS', relevantHouse: 7 };
  }
  
  return { question: queryText, topic: 'GENERAL', relevantHouse: 1 };
}

function getHouseDomainLabel(topic: TopicEnum): string {
  const labels: Record<TopicEnum, string> = {
    MARRIAGE: 'Marriage & Life Partnership (House VII)',
    CAREER: 'Career & Professional Status (House X)',
    FINANCE: 'Wealth & Financial Accumulation (House II)',
    HEALTH: 'Health & Physical Vitality (House I)',
    EDUCATION: 'Higher Education & Intelligence (House V)',
    CHILDREN: 'Progeny & Children (House V)',
    PROPERTY: 'Property & Real Estate (House IV)',
    LEGAL: 'Legal Matters & Disputes (House VI)',
    TRAVEL: 'Foreign Travel & Migration (House XII)',
    SPIRITUAL: 'Spiritual Pursuits & Religion (House IX)',
    RELATIONSHIPS: 'Interpersonal Relationships & Harmony (House VII)',
    GENERAL: 'General Life Path & Well-Being (House I)'
  };
  return labels[topic] || labels.GENERAL;
}

function buildKPChartFromHoroscope(horoscope: any, birthDetails: BirthDetails): KPChart {
  const rasi = horoscope?.horoscope?.divisional_charts?.['D-1_rasi'] || horoscope?.rasi || {};

  const planetLongitudes: Record<string, number> = {};
  const signMap: Record<string, number> = {
    Aries: 0, Taurus: 1, Gemini: 2, Cancer: 3, Leo: 4, Virgo: 5,
    Libra: 6, Scorpio: 7, Sagittarius: 8, Capricorn: 9, Aquarius: 10, Pisces: 11
  };

  Object.keys(rasi).forEach((key) => {
    const item = rasi[key];
    if (item && item.sign && typeof item.longitude === 'number') {
      const sIdx = signMap[item.sign] ?? 0;
      const absDeg = ((sIdx * 30 + item.longitude) % 360 + 360) % 360;
      const stdKey = key === 'Ascendant' ? 'Lagna' : key;
      planetLongitudes[stdKey] = absDeg;
    }
  });

  // Houses computed BEFORE planets — this function previously computed
  // planets with a hardcoded significatorOf: [1, 2, 7] fallback, then
  // computed houses afterward, meaning L1/L3/L4 significators (all derived
  // from this array in analyzeSignificators) were wrong for every native
  // that reaches the Quick Astro Tab through this path.
  const ascDegree = planetLongitudes.Lagna ?? 0;
  const lat = birthDetails.latitude || 28.6139;
  const houses = calculatePlacidusCusps(ascDegree, lat, birthDetails.date || '1996-11-01', birthDetails.time || '12:00');

  // Real retrograde status from the fetched horoscope, not left unset.
  // This function previously never populated isRetrograde at all, so every
  // planet appeared "direct" to KPVerdictEngine's retrograde-aware scoring
  // for every persona routed through the Advanced AI Tab (Quick Astro
  // Engine, KP Stellar, Classical Parashari, etc.) — the fix applied to
  // useKPChart.ts / KPQueryView.tsx never reached this fourth, independent
  // chart-construction path. Rahu/Ketu are mean lunar nodes and are always
  // retrograde by definition.
  const realRetrogradeSet = new Set<string>(
    (horoscope?.horoscope?.planetary_states?.retrograde_planets || []) as string[]
  );

  const planetNames = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
  const planets = planetNames.map((pName) => {
    const deg = planetLongitudes[pName] ?? 180;
    const subLordChain = calculateKPSubLord(deg);
    return {
      name: pName,
      sign: subLordChain.sign,
      degree: deg,
      formattedDegree: `${Math.floor(deg % 30)}°`,
      signLord: subLordChain.signLord,
      starLord: subLordChain.starLord,
      subLord: subLordChain.subLord,
      subSubLord: subLordChain.subSubLord,
      isRetrograde: pName === 'Rahu' || pName === 'Ketu' || realRetrogradeSet.has(pName),
      significatorOf: [getHouseOccupied(deg, houses)]
    };
  });

  // D-9 (Navamsa) extraction — same flexible-key + mathematical-fallback
  // pattern used in useKPChart.ts / KPQueryView.tsx / KPAnalysisPage.tsx.
  // Previously this pipeline had NO D-9 wiring at all (the prompt template
  // even lists "D-9 Navamsha (if computed)" as a TODO under "SUPPLEMENTARY
  // DATA [TO BE APPENDED BY CALLER IF AVAILABLE]" — it never was), so Step
  // 7 / the Vedic cross-check inside KPVerdictEngine.generateKPVerdict()
  // was silently NEUTRAL/unverified for every Advanced AI Tab consultation,
  // including Quick Astro Engine.
  const d9 = horoscope?.horoscope?.divisional_charts?.['D-9_navamsa']
    || horoscope?.horoscope?.divisional_charts?.['D9']
    || horoscope?.divisional_charts?.['D-9_navamsa']
    || horoscope?.divisional_charts?.['D9'];
  const SIGN_LORD_BY_NAME: Record<string, string> = {
    Aries: 'Mars', Taurus: 'Venus', Gemini: 'Mercury', Cancer: 'Moon',
    Leo: 'Sun', Virgo: 'Mercury', Libra: 'Venus', Scorpio: 'Mars',
    Sagittarius: 'Jupiter', Capricorn: 'Saturn', Aquarius: 'Saturn', Pisces: 'Jupiter'
  };
  let navamsaPlanets: KPChart['navamsaPlanets'];
  if (d9) {
    navamsaPlanets = planetNames
      .map((pName) => {
        const item = d9[pName] || d9[pName.toLowerCase()] || d9[pName.toUpperCase()];
        if (!item || !item.sign) return null;
        const signLord = SIGN_LORD_BY_NAME[item.sign] || '';
        return {
          name: pName,
          sign: item.sign,
          degree: typeof item.longitude === 'number' ? item.longitude : 0,
          formattedDegree: typeof item.longitude === 'number' ? `${Math.floor(item.longitude % 30)}°` : '',
          signLord,
          starLord: signLord,
          subLord: signLord,
          subSubLord: signLord,
          significatorOf: []
        };
      })
      .filter((p): p is NonNullable<typeof p> => p !== null);
  }
  if (!navamsaPlanets || navamsaPlanets.length === 0) {
    // Mathematical fallback from real D-1 longitudes when the API/cache
    // omitted the D-9 chart block, so Step 7 always resolves to a real
    // PASSED/WARNING instead of perpetually reporting "not verified".
    navamsaPlanets = planetNames.map((pName) => {
      const deg = planetLongitudes[pName] ?? 0;
      const navSign = calculateNavamsaSign(deg);
      const signLord = SIGN_LORD_BY_NAME[navSign] || '';
      return {
        name: pName,
        sign: navSign,
        degree: deg % 30,
        formattedDegree: `${Math.floor(deg % 30)}°`,
        signLord,
        starLord: signLord,
        subLord: signLord,
        subSubLord: signLord,
        significatorOf: []
      };
    });
  }

  const { houseSignificators, planetSignificators } = analyzeSignificators(planets, houses, false);
  const rulingPlanets = calculateRulingPlanets(undefined, undefined, lat, birthDetails.longitude || 77.2090);

  const moonDeg = planetLongitudes.Moon ?? 0;
  const calculatedDasha = calculateVimshottariDashaFromMoon(moonDeg, `${birthDetails.date} ${birthDetails.time}`, new Date(), horoscope);

  return {
    birthData: {
      name: birthDetails.name || 'Native',
      gender: String(birthDetails.gender).toLowerCase() === 'female' ? 'Female' : 'Male',
      date: birthDetails.date || '1996-11-01',
      time: birthDetails.time || '12:00',
      place: (birthDetails as any).placeOfBirth || birthDetails.place || 'New Delhi',
      latitude: birthDetails.latitude || 28.6139,
      longitude: birthDetails.longitude || 77.2090,
      timezone: birthDetails.timezone || 5.5
    },
    planets,
    houses,
    rulingPlanets,
    navamsaPlanets,
    currentDasha: toKPChartDashaInfo(calculatedDasha),
    houseSignificators,
    planetSignificators
  };
}

function resolvePlanetLord(sign: string): string {
  const match = ZODIAC_SIGNS.find(s => s.name.toLowerCase() === sign.toLowerCase());
  return match?.lord || 'Mars';
}

function calculateHouseFromSign(sign: string): number {
  const signMap: Record<string, number> = {
    Aries: 1, Taurus: 2, Gemini: 3, Cancer: 4, Leo: 5, Virgo: 6,
    Libra: 7, Scorpio: 8, Sagittarius: 9, Capricorn: 10, Aquarius: 11, Pisces: 12
  };
  return signMap[sign] || 1;
}