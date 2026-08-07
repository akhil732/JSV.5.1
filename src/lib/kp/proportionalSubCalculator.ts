/**
 * Proportional Sub Lord Calculation
 * Textbook Reference: Prof. K.S. Krishnamurti's Predictive Stellar Astrology
 * Pages: 3366-3370, 6961
 */

export const VIMSHOTTARI_DASHA_YEARS: Record<string, number> = {
  'Ketu': 7,
  'Venus': 20,
  'Sun': 6,
  'Moon': 10,
  'Mars': 7,
  'Rahu': 18,
  'Jupiter': 16,
  'Saturn': 19,
  'Mercury': 17,
};

export const TOTAL_DASHA_YEARS = 120;

export const DASHA_SEQUENCE = [
  'Ketu', 'Venus', 'Sun', 'Moon', 'Mars',
  'Rahu', 'Jupiter', 'Saturn', 'Mercury'
];

export function calculateSubDurationDegrees(subLord: string): number {
  const dashaYears = VIMSHOTTARI_DASHA_YEARS[subLord];
  if (!dashaYears) throw new Error(`Unknown sub lord: ${subLord}`);
  const nakshatra_span = 13.333333333333334;
  return (dashaYears / TOTAL_DASHA_YEARS) * nakshatra_span;
}

export function degreesToDMS(degrees: number): { deg: number; min: number; sec: number } {
  const deg = Math.floor(degrees);
  const remaining = (degrees - deg) * 60;
  const min = Math.floor(remaining);
  const sec = Math.round((remaining - min) * 60);
  return { deg, min, sec };
}

export function formatDegrees(degrees: number): string {
  const { deg, min, sec } = degreesToDMS(degrees);
  return `${deg}°${min}'${sec}"`;
}

export interface SubLordBoundary {
  subLord: string;
  startDegrees: number;
  endDegrees: number;
  durationDegrees: number;
  durationFormatted: string;
  absoluteStart?: number;
  absoluteEnd?: number;
}

export function calculateSubLordBoundaries(
  nakshatraName: string,
  nakshatraStartDegree: number,
  starLord: string
): SubLordBoundary[] {
  const boundaries: SubLordBoundary[] = [];
  let currentDegree = 0;
  
  const starLordIndex = DASHA_SEQUENCE.indexOf(starLord);
  const sequence = starLordIndex !== -1 
    ? [...DASHA_SEQUENCE.slice(starLordIndex), ...DASHA_SEQUENCE.slice(0, starLordIndex)]
    : DASHA_SEQUENCE;

  sequence.forEach(subLord => {
    const duration = calculateSubDurationDegrees(subLord);
    const endDegree = currentDegree + duration;
    boundaries.push({
      subLord,
      startDegrees: currentDegree,
      endDegrees: endDegree,
      durationDegrees: duration,
      durationFormatted: formatDegrees(duration),
      absoluteStart: nakshatraStartDegree + currentDegree,
      absoluteEnd: nakshatraStartDegree + endDegree,
    });
    currentDegree = endDegree;
  });
  
  return boundaries;
}

export interface NakshatraDefinition {
  name: string;
  number: number;
  startDegree: number;
  endDegree: number;
  starLord: string;
}

export const NAKSHATRAS: NakshatraDefinition[] = [
  { name: 'Ashwini', number: 1, startDegree: 0, endDegree: 13.3333, starLord: 'Ketu' },
  { name: 'Bharani', number: 2, startDegree: 13.3333, endDegree: 26.6667, starLord: 'Venus' },
  { name: 'Krittika', number: 3, startDegree: 26.6667, endDegree: 40, starLord: 'Sun' },
  { name: 'Rohini', number: 4, startDegree: 40, endDegree: 53.3333, starLord: 'Moon' },
  { name: 'Mrigashira', number: 5, startDegree: 53.3333, endDegree: 66.6667, starLord: 'Mars' },
  { name: 'Ardra', number: 6, startDegree: 66.6667, endDegree: 80, starLord: 'Rahu' },
  { name: 'Punarvasu', number: 7, startDegree: 80, endDegree: 93.3333, starLord: 'Jupiter' },
  { name: 'Pushya', number: 8, startDegree: 93.3333, endDegree: 106.6667, starLord: 'Saturn' },
  { name: 'Ashlesha', number: 9, startDegree: 106.6667, endDegree: 120, starLord: 'Mercury' },
  { name: 'Magha', number: 10, startDegree: 120, endDegree: 133.3333, starLord: 'Ketu' },
  { name: 'Purva Phalguni', number: 11, startDegree: 133.3333, endDegree: 146.6667, starLord: 'Venus' },
  { name: 'Uttara Phalguni', number: 12, startDegree: 146.6667, endDegree: 160, starLord: 'Sun' },
  { name: 'Hasta', number: 13, startDegree: 160, endDegree: 173.3333, starLord: 'Moon' },
  { name: 'Chitra', number: 14, startDegree: 173.3333, endDegree: 186.6667, starLord: 'Mars' },
  { name: 'Swati', number: 15, startDegree: 186.6667, endDegree: 200, starLord: 'Rahu' },
  { name: 'Vishakha', number: 16, startDegree: 200, endDegree: 213.3333, starLord: 'Jupiter' },
  { name: 'Anuradha', number: 17, startDegree: 213.3333, endDegree: 226.6667, starLord: 'Saturn' },
  { name: 'Jyeshta', number: 18, startDegree: 226.6667, endDegree: 240, starLord: 'Mercury' },
  { name: 'Mula', number: 19, startDegree: 240, endDegree: 253.3333, starLord: 'Ketu' },
  { name: 'Purva Ashadha', number: 20, startDegree: 253.3333, endDegree: 266.6667, starLord: 'Venus' },
  { name: 'Uttara Ashadha', number: 21, startDegree: 266.6667, endDegree: 280, starLord: 'Sun' },
  { name: 'Shravana', number: 22, startDegree: 280, endDegree: 293.3333, starLord: 'Moon' },
  { name: 'Dhanishta', number: 23, startDegree: 293.3333, endDegree: 306.6667, starLord: 'Mars' },
  { name: 'Shatabhisha', number: 24, startDegree: 306.6667, endDegree: 320, starLord: 'Rahu' },
  { name: 'Purva Bhadrapada', number: 25, startDegree: 320, endDegree: 333.3333, starLord: 'Jupiter' },
  { name: 'Uttara Bhadrapada', number: 26, startDegree: 333.3333, endDegree: 346.6667, starLord: 'Saturn' },
  { name: 'Revati', number: 27, startDegree: 346.6667, endDegree: 360, starLord: 'Mercury' },
];

export function getNakshatraForDegree(degree: number): NakshatraDefinition {
  const normalized = ((degree % 360) + 360) % 360;
  const nak = NAKSHATRAS.find(n => normalized >= n.startDegree && normalized < n.endDegree);
  if (!nak) return NAKSHATRAS[0];
  return nak;
}

export function getSubLordForDegree(absoluteDegree: number): string {
  const normalized = ((absoluteDegree % 360) + 360) % 360;
  const nakshatra = getNakshatraForDegree(normalized);
  const degreeInNak = normalized - nakshatra.startDegree;
  const boundaries = calculateSubLordBoundaries(nakshatra.name, nakshatra.startDegree, nakshatra.starLord);
  const subBoundary = boundaries.find(b => degreeInNak >= b.startDegrees && degreeInNak < b.endDegrees);
  return subBoundary ? subBoundary.subLord : DASHA_SEQUENCE[0];
}

export function analyzeDegreeThroughLayers(degree: number) {
  const normalized = ((degree % 360) + 360) % 360;
  const signIndex = Math.floor(normalized / 30);
  const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
                 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
  const signLords = ['Mars', 'Venus', 'Mercury', 'Moon', 'Sun', 'Mercury',
                     'Venus', 'Mars', 'Jupiter', 'Saturn', 'Saturn', 'Jupiter'];
  
  const sign = signs[signIndex];
  const signLord = signLords[signIndex];
  const nakshatra = getNakshatraForDegree(degree);
  const subLord = getSubLordForDegree(degree);
  const subDuration = formatDegrees(calculateSubDurationDegrees(subLord));
  
  return {
    sign,
    signLord,
    nakshatra: nakshatra.name,
    starLord: nakshatra.starLord,
    subLord,
    subDuration
  };
}

