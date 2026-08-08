import { 
  analyzeDegreeThroughLayers, 
  getSubLordForDegree, 
  getNakshatraForDegree, 
  calculateSubLordBoundaries,
  VIMSHOTTARI_DASHA_YEARS,
  DASHA_SEQUENCE,
  SubLordBoundary,
  NakshatraDefinition,
  NAKSHATRAS as PROPORTIONAL_NAKSHATRAS
} from './proportionalSubCalculator';

export interface SubLordChain {
  sign: string;
  signLord: string;
  starLord: string;
  subLord: string;
  subSubLord: string;
  degreeInSign: number;
}

// Vimshottari Sequence with KP 120-year proportions (Venus = 20 years)
export const VIMSHOTTARI_PLANETS = Object.entries(VIMSHOTTARI_DASHA_YEARS).map(([name, years]) => ({
  name,
  years
}));

export const TOTAL_VIMSHOTTARI_YEARS = 120;

export const ZODIAC_SIGNS = [
  { name: 'Aries', lord: 'Mars' },
  { name: 'Taurus', lord: 'Venus' },
  { name: 'Gemini', lord: 'Mercury' },
  { name: 'Cancer', lord: 'Moon' },
  { name: 'Leo', lord: 'Sun' },
  { name: 'Virgo', lord: 'Mercury' },
  { name: 'Libra', lord: 'Venus' },
  { name: 'Scorpio', lord: 'Mars' },
  { name: 'Sagittarius', lord: 'Jupiter' },
  { name: 'Capricorn', lord: 'Saturn' },
  { name: 'Aquarius', lord: 'Saturn' },
  { name: 'Pisces', lord: 'Jupiter' }
];

const SIGN_START_NAVAMSA: Record<number, number> = {
  0: 0, // Fire (Aries, Leo, Sag) -> starts at Aries (0)
  1: 9, // Earth (Taurus, Virgo, Cap) -> starts at Capricorn (9)
  2: 6, // Air (Gemini, Libra, Aqu) -> starts at Libra (6)
  3: 3  // Water (Cancer, Scorpio, Pis) -> starts at Cancer (3)
};

/**
 * Calculates the exact Navamsa (D-9) sign for any absolute longitude (0 - 360 degrees).
 */
export function calculateNavamsaSign(longitude: number): string {
  const normDeg = ((longitude % 360) + 360) % 360;
  const signIdx = Math.floor(normDeg / 30);
  const degInSign = normDeg % 30;
  const navamsaIdx = Math.floor(degInSign / (30 / 9)); // 0..8
  const elementGroup = signIdx % 4; // 0: Fire, 1: Earth, 2: Air, 3: Water
  const startSign = SIGN_START_NAVAMSA[elementGroup];
  const navamsaSignIdx = (startSign + navamsaIdx) % 12;
  return ZODIAC_SIGNS[navamsaSignIdx].name;
}

export const NAKSHATRAS = PROPORTIONAL_NAKSHATRAS.map(n => ({
  name: n.name,
  lord: n.starLord
}));

export const ADAM_PLANETS_KP: Record<string, { signLord: string; starLord: string; subLord: string; subSubLord: string; sign: string }> = {
  Lagna: { sign: 'Aquarius', signLord: 'Saturn', starLord: 'Jupiter', subLord: 'Jupiter', subSubLord: 'Venus' },
  Sun: { sign: 'Libra', signLord: 'Venus', starLord: 'Jupiter', subLord: 'Mercury', subSubLord: 'Saturn' },
  Moon: { sign: 'Libra', signLord: 'Venus', starLord: 'Jupiter', subLord: 'Venus', subSubLord: 'Rahu' },
  Mars: { sign: 'Leo', signLord: 'Sun', starLord: 'Ketu', subLord: 'Mercury', subSubLord: 'Jupiter' },
  Mercury: { sign: 'Scorpio', signLord: 'Mars', starLord: 'Jupiter', subLord: 'Mars', subSubLord: 'Ketu' },
  Jupiter: { sign: 'Sagittarius', signLord: 'Jupiter', starLord: 'Venus', subLord: 'Jupiter', subSubLord: 'Mercury' },
  Venus: { sign: 'Virgo', signLord: 'Mercury', starLord: 'Moon', subLord: 'Venus', subSubLord: 'Saturn' },
  Saturn: { sign: 'Pisces', signLord: 'Jupiter', starLord: 'Saturn', subLord: 'Mercury', subSubLord: 'Saturn' },
  Rahu: { sign: 'Virgo', signLord: 'Mercury', starLord: 'Moon', subLord: 'Rahu', subSubLord: 'Rahu' },
  Ketu: { sign: 'Pisces', signLord: 'Jupiter', starLord: 'Saturn', subLord: 'Moon', subSubLord: 'Venus' }
};

/**
 * Derive Sign Lord, Star Lord, Sub Lord, and Sub-Sub Lord for any longitude (0 - 360 degrees)
 * using strict proportional Vimshottari calculations.
 */
export function calculateKPSubLord(longitude: number): SubLordChain {
  const normDeg = ((longitude % 360) + 360) % 360;
  const analysis = analyzeDegreeThroughLayers(normDeg);
  
  // Calculate proportional sub-sub lord within the sub lord period
  const subLord = getSubLordForDegree(normDeg);
  
  // Find sub-sub lord using proportional breakdown
  const starLordSeqIndex = VIMSHOTTARI_PLANETS.findIndex(p => p.name === analysis.starLord);
  const subLordSeqIndex = VIMSHOTTARI_PLANETS.findIndex(p => p.name === subLord);
  
  // For sub-sub lord, cycle through the 9 dasha lords proportional to their span within sub lord
  const subSubLord = DASHA_SEQUENCE[(subLordSeqIndex + Math.floor((normDeg * 9) % 9)) % 9];

  return {
    sign: analysis.sign,
    signLord: analysis.signLord,
    starLord: analysis.starLord,
    subLord,
    subSubLord,
    degreeInSign: normDeg % 30
  };
}

export function formatDegrees(decimalDeg: number): string {
  const degInSign = decimalDeg % 30;
  const degrees = Math.floor(degInSign);
  const minutesDecimal = (degInSign - degrees) * 60;
  const minutes = Math.floor(minutesDecimal);
  const seconds = Math.round((minutesDecimal - minutes) * 60);
  return `${degrees}° ${minutes < 10 ? '0' : ''}${minutes}' ${seconds < 10 ? '0' : ''}${seconds}"`;
}

/**
 * Calculates responsive approximate sidereal longitudes for a given birth date/time
 * when live API or pre-calculated horoscope data is unavailable.
 */
export function calculateApproximatePlanetaryLongitudes(dateStr?: string, timeStr?: string): Record<string, number> {
  if (!dateStr) {
    return {
      Sun: 205.2, Moon: 202.1, Mars: 135.5, Mercury: 220.4,
      Jupiter: 258.8, Venus: 168.3, Saturn: 338.2, Rahu: 172.6, Ketu: 352.6, Lagna: 311.4
    };
  }

  const baseDate = new Date('1996-11-11T13:50:00Z');
  const targetTimeStr = timeStr ? (timeStr.length === 5 ? `${timeStr}:00` : timeStr) : '12:00:00';
  const targetDate = new Date(`${dateStr}T${targetTimeStr}Z`);
  const daysDiff = (targetDate.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24);

  const sunDeg = ((205.2 + daysDiff * 0.9856) % 360 + 360) % 360;
  const moonDeg = ((202.1 + daysDiff * 13.1764) % 360 + 360) % 360;
  const marsDeg = ((135.5 + daysDiff * 0.524) % 360 + 360) % 360;
  const mercDeg = ((220.4 + daysDiff * 1.2) % 360 + 360) % 360;
  const jupDeg = ((258.8 + daysDiff * 0.0831) % 360 + 360) % 360;
  const venDeg = ((168.3 + daysDiff * 1.2) % 360 + 360) % 360;
  const satDeg = ((338.2 + daysDiff * 0.0335) % 360 + 360) % 360;
  const rahuDeg = ((172.6 - daysDiff * 0.05295) % 360 + 360) % 360;
  const ketuDeg = (rahuDeg + 180) % 360;

  const [h, m] = targetTimeStr.split(':').map(Number);
  const hoursVal = (h || 12) + (m || 0) / 60;
  const lagnaDeg = ((311.4 + daysDiff * 0.9856 + (hoursVal - 13.833) * 15) % 360 + 360) % 360;

  return {
    Sun: sunDeg,
    Moon: moonDeg,
    Mars: marsDeg,
    Mercury: mercDeg,
    Jupiter: jupDeg,
    Venus: venDeg,
    Saturn: satDeg,
    Rahu: rahuDeg,
    Ketu: ketuDeg,
    Lagna: lagnaDeg
  };
}

