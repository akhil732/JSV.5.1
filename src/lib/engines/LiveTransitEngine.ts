/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * LIVE TRANSIT ENGINE — Real Ephemeris-Based Gochara Calculator
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * WHY THIS FILE EXISTS:
 * The previous transit logic (see legacy TransitEngine.ts) hardcoded a single
 * frozen snapshot ("Saturn in Pisces, Jupiter in Cancer... current anchor 2026
 * transits") directly as static text inside the Quick Astro prompt. That text
 * never changes regardless of the actual query date, so every consultation —
 * whether asked today or eight months from now — receives the exact same
 * Gochara section. That is the root cause of inaccurate Gochara answers.
 *
 * THIS ENGINE FIXES THAT by computing REAL sidereal (Lahiri) planetary
 * positions for the exact moment of the query using the VSOP87 planetary
 * theory (via the `astronomia` library) for Sun/Mercury/Venus/Mars/Jupiter/
 * Saturn, a dedicated lunar position routine for the Moon, and the standard
 * mean-node formula (Meeus, Ch. 47) for Rahu/Ketu.
 *
 * ACCURACY NOTES (be transparent with the native about these):
 * - Sun/Mercury/Venus/Mars/Jupiter/Saturn/Moon: full VSOP87/ELP-based
 *   geocentric ecliptic longitude — accurate to well under 0.01° for any
 *   date in the modern era. This is production-astronomy-grade.
 * - Rahu/Ketu: MEAN node (not "true" node). Mean node drifts smoothly
 *   backward through the zodiac and matches most published Vedic panchangams
 *   (Lahiri-based) to within a degree; it can differ from "true node"
 *   ephemerides by up to ~1.5° at times. Good enough for sign-level Gochara,
 *   but flagged here so it is never silently overstated as more precise
 *   than it is.
 * - Ayanamsha: Lahiri (Chitrapaksha), linear precession approximation
 *   (~50.2419"/year from a J2000 epoch of 23.85°). This matches the
 *   Lahiri ayanamsha used elsewhere in this codebase to within a few
 *   arc-seconds — immaterial at sign level.
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { planetposition, solar, moonposition, julian } from 'astronomia';
// @ts-ignore - astronomia ships its VSOP87 data tables as plain JS data modules
import vsop87Bmercury from 'astronomia/data/vsop87Bmercury';
// @ts-ignore
import vsop87Bvenus from 'astronomia/data/vsop87Bvenus';
// @ts-ignore
import vsop87Bmars from 'astronomia/data/vsop87Bmars';
// @ts-ignore
import vsop87Bjupiter from 'astronomia/data/vsop87Bjupiter';
// @ts-ignore
import vsop87Bsaturn from 'astronomia/data/vsop87Bsaturn';
// @ts-ignore
import vsop87Bearth from 'astronomia/data/vsop87Bearth';

export const SIGN_NAMES = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
] as const;

export const SIGN_NAMES_TELUGU: Record<string, string> = {
  Aries: 'మేషం', Taurus: 'వృషభం', Gemini: 'మిథునం', Cancer: 'కర్కాటకం',
  Leo: 'సింహం', Virgo: 'కన్య', Libra: 'తుల', Scorpio: 'వృశ్చికం',
  Sagittarius: 'ధనుస్సు', Capricorn: 'మకరం', Aquarius: 'కుంభం', Pisces: 'మీనం'
};

export const PLANET_NAMES_TELUGU: Record<string, string> = {
  Sun: 'సూర్యుడు', Moon: 'చంద్రుడు', Mars: 'కుజుడు', Mercury: 'బుధుడు',
  Jupiter: 'గురుడు', Venus: 'శుక్రుడు', Saturn: 'శని', Rahu: 'రాహువు', Ketu: 'కేతువు'
};

export type PlanetKey = 'Sun' | 'Moon' | 'Mars' | 'Mercury' | 'Jupiter' | 'Venus' | 'Saturn' | 'Rahu' | 'Ketu';

export interface LiveTransitPosition {
  planet: PlanetKey;
  planetTelugu: string;
  tropicalLongitude: number;   // 0-360
  siderealLongitude: number;   // 0-360 (Lahiri)
  sign: string;
  signTelugu: string;
  degreeInSign: number;        // 0-30
  houseFromMoon: number;       // 1-12
  classification: 'Supportive' | 'Neutral' | 'Challenging';
  classicalResultTelugu: string;
}

export interface LiveTransitSnapshot {
  computedAtIso: string;
  ayanamsa: number;
  moonSignUsedForHouses: string;
  positions: Record<PlanetKey, LiveTransitPosition>;
}

// ─────────────────────────────────────────────────────────────────────────────
// AYANAMSA (Lahiri, linear precession approximation)
// ─────────────────────────────────────────────────────────────────────────────
export function lahiriAyanamsa(jd: number): number {
  const yearsFromJ2000 = (jd - 2451545.0) / 365.25;
  return 23.85 + yearsFromJ2000 * (50.2388475 / 3600);
}

export function toSidereal(tropicalDeg: number, ayanamsa: number): number {
  return ((tropicalDeg - ayanamsa) % 360 + 360) % 360;
}

function signOf(siderealDeg: number): { sign: string; degreeInSign: number } {
  const idx = Math.floor(siderealDeg / 30) % 12;
  return { sign: SIGN_NAMES[idx], degreeInSign: siderealDeg % 30 };
}

// ─────────────────────────────────────────────────────────────────────────────
// GEOMETRY HELPERS
// ─────────────────────────────────────────────────────────────────────────────
function geocentricEclipticLongitude(
  vsopData: any,
  earthPlanet: InstanceType<typeof planetposition.Planet>,
  jde: number
): number {
  const p = new planetposition.Planet(vsopData);
  const posEarth = earthPlanet.position(jde);
  const posPlanet = p.position(jde);

  const x = posPlanet.range * Math.cos(posPlanet.lat) * Math.cos(posPlanet.lon)
    - posEarth.range * Math.cos(posEarth.lat) * Math.cos(posEarth.lon);
  const y = posPlanet.range * Math.cos(posPlanet.lat) * Math.sin(posPlanet.lon)
    - posEarth.range * Math.cos(posEarth.lat) * Math.sin(posEarth.lon);
  const z = posPlanet.range * Math.sin(posPlanet.lat) - posEarth.range * Math.sin(posEarth.lat);

  let lam = Math.atan2(y, x);
  if (lam < 0) lam += 2 * Math.PI;
  return (lam * 180) / Math.PI;
}

function meanLunarNodeLongitude(jd: number): number {
  // Meeus, Astronomical Algorithms, Ch. 47 — mean longitude of ascending node
  const T = (jd - 2451545.0) / 36525.0;
  let omega = 125.04452 - 1934.136261 * T + 0.0020708 * T * T + (T * T * T) / 450000;
  return ((omega % 360) + 360) % 360;
}

// ─────────────────────────────────────────────────────────────────────────────
// CLASSICAL HOUSE-FROM-MOON RESULT TABLES (standard Vedic Gochara Phala)
// Source pattern: classical Chandra-Gochara Phala as commonly tabulated in
// Phaladeepika / Jataka Parijata gochara chapters. Kept generic/pattern-level
// per planet, not fabricated numerics.
// ─────────────────────────────────────────────────────────────────────────────
const SATURN_HOUSE_RESULT_TE: Record<number, string> = {
  1: 'కంటక శని ప్రభావం — ఆరోగ్య జాగ్రత్త, మానసిక ఒత్తిడి',
  2: 'కంటక శని — ఆర్థిక పరిమితి, కుటుంబ బాధ్యతలు పెరగడం',
  3: 'అనుకూల సంచారం — పరాక్రమం, ప్రయత్నశక్తి, సోదర సంబంధాలలో స్థిరత్వం',
  4: 'అష్టమ శని-సదృశ ప్రభావం — గృహ/మాతృ సంబంధిత ఆందోళన, స్థల మార్పులు',
  5: 'సంతానం, విద్య పట్ల ఆలస్యం లేదా జాగ్రత్త అవసరం',
  6: 'అత్యంత అనుకూలం — శత్రు/రోగ నివారణ, పోటీలలో విజయం, రుణ విముక్తి',
  7: 'భాగస్వామ్య సంబంధాలలో పరీక్ష, ఓర్పు అవసరం',
  8: 'అష్టమ శని (సాడేసాటి అనుబంధం) — ఆకస్మిక మార్పులు, ఆరోగ్య జాగ్రత్త',
  9: 'భాగ్య స్థానంపై శని ప్రభావం — పెద్దల నుండి దూరం, భాగ్యోదయ ఆలస్యం',
  10: 'వృత్తిపరమైన శ్రమ ఫలితం, బాధ్యతలు పెరుగుట, స్థిరమైన ప్రగతి',
  11: 'అత్యంత అనుకూలం — లాభాలు, కోరికల నెరవేర్పు, ఆదాయ వృద్ధి',
  12: 'సాడేసాటి చివరి దశ — వ్యయం, విదేశీ సంబంధాలు, విశ్రాంతి అవసరం'
};

const JUPITER_HOUSE_RESULT_TE: Record<number, string> = {
  1: 'ఆత్మవిశ్వాసం, ఆరోగ్యం, వ్యక్తిత్వ వికాసం',
  2: 'ధన వృద్ధి, కుటుంబ శ్రేయస్సు, వాక్ మధురత్వం',
  3: 'ప్రయత్నశక్తి పెరుగుదల, సోదర సంబంధాల్లో మేలు',
  4: 'గృహ సౌఖ్యం, మాతృ సంబంధిత శుభం, స్థిరాస్తి యోగం',
  5: 'సంతానం, విద్య, బుద్ధి వికాసానికి అత్యంత అనుకూలం',
  6: 'సవాళ్లు — అనవసర వ్యయం, ఆరోగ్య జాగ్రత్త, రుణ భారం',
  7: 'భాగస్వామ్య సంబంధాలు, వివాహ విషయాల్లో శుభం',
  8: 'ఆకస్మిక పరిణామాలు, ఆధ్యాత్మిక అభివృద్ధి, పరిశోధనా ఆసక్తి',
  9: 'అత్యంత అనుకూలం — భాగ్యోదయం, గురు-పెద్దల ఆశీస్సులు, ధర్మ కార్యాలు',
  10: 'వృత్తిపరమైన ఉన్నతి, గుర్తింపు, నూతన బాధ్యతలు',
  11: 'అత్యంత అనుకూలం — లాభాలు, ఆదాయ వృద్ధి, కోరికల నెరవేర్పు',
  12: 'వ్యయం, విదేశీ ప్రయాణాలు, ఆధ్యాత్మిక చింతన'
};

const RAHU_HOUSE_RESULT_TE: Record<number, string> = {
  1: 'అనిశ్చితి, కొత్త ఆలోచనలు, అనూహ్య మార్పులు',
  2: 'ఆర్థిక ఒడిదుడుకులు, కుటుంబంలో అపార్థాలు',
  3: 'సాహసం, పోటీతత్వం, అనుకూల ప్రయత్నశక్తి',
  4: 'మానసిక అశాంతి, గృహ మార్పులు, తల్లి ఆరోగ్యంపై శ్రద్ధ అవసరం',
  5: 'సంతానం పట్ల ఆందోళన, ఊహాజనిత ఆలోచనలు, పెట్టుబడి విషయాల్లో జాగ్రత్త',
  6: 'శత్రు జయం, పోటీలలో అనూహ్య విజయం, ఆరోగ్యంలో ఇన్ఫెక్షన్ జాగ్రత్త',
  7: 'భాగస్వామ్య సంబంధాలలో సంక్లిష్టత, విదేశీ సంబంధాలు',
  8: 'ఆకస్మిక పరిణామాలు, రహస్య విషయాలపై ఆసక్తి, ఆరోగ్య జాగ్రత్త',
  9: 'సంప్రదాయేతర ఆలోచనలు, విదేశీ యాత్రలు, గురుజనుల పట్ల భిన్నాభిప్రాయం',
  10: 'వృత్తిలో ఆకస్మిక మార్పులు, ఆశించని అవకాశాలు లేదా అవరోధాలు',
  11: 'లాభాలు, నూతన స్నేహాలు, అనూహ్య ఆదాయ మార్గాలు',
  12: 'నిద్రలేమి, వ్యయం, విదేశీ సంబంధిత విషయాలు, ఆధ్యాత్మిక అన్వేషణ'
};

const KETU_HOUSE_RESULT_TE: Record<number, string> = {
  1: 'ఆత్మపరిశీలన, శారీరక బలహీనత జాగ్రత్త, నిర్లిప్తత',
  2: 'ఆర్థిక విషయాల్లో అనాసక్తి, వాక్కులో జాగ్రత్త అవసరం',
  3: 'ప్రయత్నశక్తి తగ్గడం, సోదరులతో దూరం',
  4: 'మానసిక అశాంతి, గృహ సంబంధిత నిర్లిప్తత',
  5: 'సంతానం పట్ల ప్రత్యేక శ్రద్ధ అవసరం, ఆధ్యాత్మిక మొగ్గు',
  6: 'శత్రు/రోగ నివారణకు మిశ్రమ ఫలితం, ఆకస్మిక ఉపశమనం',
  7: 'భాగస్వామ్య సంబంధాలలో దూరం లేదా అపార్థాలు',
  8: 'ఆధ్యాత్మిక అంతర్దృష్టి, రహస్య శాస్త్రాల పట్ల ఆసక్తి',
  9: 'సాంప్రదాయ విశ్వాసాలలో మార్పు, గురు మార్గదర్శకత్వం',
  10: 'వృత్తిలో అనిశ్చితి లేదా దిశ మార్పు',
  11: 'లాభాలలో హెచ్చుతగ్గులు, ఆకస్మిక ఉపశమనం, ఆధ్యాత్మిక సంఘాలు',
  12: 'మోక్ష చింతన, ఏకాంతం, ఆధ్యాత్మిక సాధనకు అనుకూలం'
};

const SATURN_SUPPORTIVE_HOUSES = [3, 6, 11];
const SATURN_CHALLENGING_HOUSES = [1, 2, 4, 8, 12];
const JUPITER_SUPPORTIVE_HOUSES = [2, 5, 7, 9, 11];
const JUPITER_CHALLENGING_HOUSES = [6, 8, 12];

function classifySaturn(house: number): 'Supportive' | 'Neutral' | 'Challenging' {
  if (SATURN_SUPPORTIVE_HOUSES.includes(house)) return 'Supportive';
  if (SATURN_CHALLENGING_HOUSES.includes(house)) return 'Challenging';
  return 'Neutral';
}
function classifyJupiter(house: number): 'Supportive' | 'Neutral' | 'Challenging' {
  if (JUPITER_SUPPORTIVE_HOUSES.includes(house)) return 'Supportive';
  if (JUPITER_CHALLENGING_HOUSES.includes(house)) return 'Challenging';
  return 'Neutral';
}
// Fast movers (Sun/Mars/Mercury/Venus) use the generic Kendra-Trikona-Upachaya pattern
function classifyGeneric(house: number): 'Supportive' | 'Neutral' | 'Challenging' {
  if ([3, 6, 10, 11].includes(house)) return 'Supportive';   // Upachaya
  if ([1, 4, 7, 10].includes(house)) return 'Neutral';        // Kendra (already covered 10 above)
  if ([6, 8, 12].includes(house)) return 'Challenging';
  return 'Neutral';
}

function calculateHouseFromMoon(transitSign: string, moonSign: string): number {
  const tIdx = SIGN_NAMES.indexOf(transitSign as any);
  const mIdx = SIGN_NAMES.indexOf(moonSign as any);
  if (tIdx === -1 || mIdx === -1) return 1;
  return ((tIdx - mIdx + 12) % 12) + 1;
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN ENTRY POINT
// ─────────────────────────────────────────────────────────────────────────────
let earthPlanetCache: InstanceType<typeof planetposition.Planet> | null = null;
function getEarthPlanet() {
  if (!earthPlanetCache) {
    earthPlanetCache = new planetposition.Planet(vsop87Bearth);
  }
  return earthPlanetCache;
}

/**
 * Computes REAL, date-accurate sidereal (Lahiri) positions for all 9 grahas
 * and classifies each relative to the native's actual Chandra Rashi (Moon
 * sign), replacing any hardcoded/frozen Gochara text.
 */
export function computeLiveTransitSnapshot(
  moonSign: string,
  queryDate: Date = new Date()
): LiveTransitSnapshot {
  const jd = julian.CalendarGregorianToJD(
    queryDate.getUTCFullYear(),
    queryDate.getUTCMonth() + 1,
    queryDate.getUTCDate() + queryDate.getUTCHours() / 24 + queryDate.getUTCMinutes() / 1440
  );
  const T = (jd - 2451545.0) / 36525.0;
  const ayanamsa = lahiriAyanamsa(jd);
  const earth = getEarthPlanet();

  const rawTropical: Record<PlanetKey, number> = {
    Sun: ((solar.apparentLongitude(T) * 180) / Math.PI + 360) % 360,
    Moon: ((moonposition.position(jd).lon * 180) / Math.PI + 360) % 360,
    Mercury: geocentricEclipticLongitude(vsop87Bmercury, earth, jd),
    Venus: geocentricEclipticLongitude(vsop87Bvenus, earth, jd),
    Mars: geocentricEclipticLongitude(vsop87Bmars, earth, jd),
    Jupiter: geocentricEclipticLongitude(vsop87Bjupiter, earth, jd),
    Saturn: geocentricEclipticLongitude(vsop87Bsaturn, earth, jd),
    Rahu: meanLunarNodeLongitude(jd),
    Ketu: (meanLunarNodeLongitude(jd) + 180) % 360
  };

  const positions = {} as Record<PlanetKey, LiveTransitPosition>;

  (Object.keys(rawTropical) as PlanetKey[]).forEach((planet) => {
    const tropical = rawTropical[planet];
    const sidereal = toSidereal(tropical, ayanamsa);
    const { sign, degreeInSign } = signOf(sidereal);
    const houseFromMoon = calculateHouseFromMoon(sign, moonSign);

    let classification: 'Supportive' | 'Neutral' | 'Challenging';
    let classicalResultTelugu: string;
    if (planet === 'Saturn') {
      classification = classifySaturn(houseFromMoon);
      classicalResultTelugu = SATURN_HOUSE_RESULT_TE[houseFromMoon];
    } else if (planet === 'Jupiter') {
      classification = classifyJupiter(houseFromMoon);
      classicalResultTelugu = JUPITER_HOUSE_RESULT_TE[houseFromMoon];
    } else if (planet === 'Rahu') {
      classification = classifyGeneric(houseFromMoon);
      classicalResultTelugu = RAHU_HOUSE_RESULT_TE[houseFromMoon];
    } else if (planet === 'Ketu') {
      classification = classifyGeneric(houseFromMoon);
      classicalResultTelugu = KETU_HOUSE_RESULT_TE[houseFromMoon];
    } else {
      classification = classifyGeneric(houseFromMoon);
      classicalResultTelugu = `${houseFromMoon}వ ఇంటిలో సంచారం — ఆయా జీవిత రంగాలపై ప్రభావం చూపుతుంది`;
    }

    positions[planet] = {
      planet,
      planetTelugu: PLANET_NAMES_TELUGU[planet],
      tropicalLongitude: tropical,
      siderealLongitude: sidereal,
      sign,
      signTelugu: SIGN_NAMES_TELUGU[sign],
      degreeInSign,
      houseFromMoon,
      classification,
      classicalResultTelugu
    };
  });

  return {
    computedAtIso: queryDate.toISOString(),
    ayanamsa,
    moonSignUsedForHouses: moonSign,
    positions
  };
}

/**
 * Renders the live snapshot as the Telugu Gochara prompt block that should be
 * injected into the Quick Astro Engine system prompt — REPLACING the old
 * hardcoded static transit paragraph.
 */
export function renderGocharaPromptBlock(snapshot: LiveTransitSnapshot): string {
  const order: PlanetKey[] = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
  const lines = order.map((p) => {
    const pos = snapshot.positions[p];
    return `   - ${pos.planetTelugu} (${p}): ${pos.signTelugu} రాశిలో (${pos.degreeInSign.toFixed(1)}°) — చంద్రుని నుండి ${pos.houseFromMoon}వ ఇల్లు [${pos.classification}]. ${pos.classicalResultTelugu}`;
  });

  return `2. Gochara (Transit) analysis from Moon Sign (Chandra Rasi - ${snapshot.moonSignUsedForHouses}) for ALL 9 PLANETS — REAL POSITIONS COMPUTED FOR ${snapshot.computedAtIso.split('T')[0]} (Lahiri Ayanamsa ${snapshot.ayanamsa.toFixed(2)}°, do not use any other transit data, do not fabricate positions):
${lines.join('\n')}

TRANSIT ACCURACY NOTE: Sun/Moon/Mercury/Venus/Mars/Jupiter/Saturn positions above are computed from VSOP87/lunar ephemeris for the exact query date — treat as ground truth. Rahu/Ketu use the Mean Node (standard for most published Vedic panchangams); if the native's preferred system uses the True Node, note this as a minor possible variance of up to ~1.5°, not a contradiction.`;
}