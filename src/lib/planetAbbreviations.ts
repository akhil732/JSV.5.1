/**
 * Planet name to abbreviation mapping
 * Standard two-letter format used in Vedic astrology
 */
export const PLANET_MAP = {
  'Sun': 'Su',
  'Moon': 'Mo',
  'Mars': 'Ma',
  'Mercury': 'Me',
  'Jupiter': 'Ju',
  'Venus': 'Ve',
  'Saturn': 'Sa',
  'Rahu': 'Ra',
  'Ketu': 'Ke',
  'Ascendant': 'Asc',
  'Lagna': 'Lg',
  'L': 'L'
} as const;

export const PLANET_ABBREV_TELUGU = {
  Sun: { full: "సూర్య", abbr: "సూ" },
  Moon: { full: "చంద్ర", abbr: "చ" },
  Mars: { full: "అంగారక", abbr: "అం" },
  Mercury: { full: "బుధ", abbr: "బు" },
  Jupiter: { full: "గురు", abbr: "గు" },
  Venus: { full: "శుక్ర", abbr: "శు" },
  Saturn: { full: "శని", abbr: "శ" },
  Rahu: { full: "రాహువు", abbr: "రా" },
  Ketu: { full: "కేతువు", abbr: "కే" },
  Ascendant: { full: "లగ్న", abbr: "ల" },
  Lagna: { full: "లగ్న", abbr: "ల" }
};

export const PLANET_ABBREV_ENGLISH = {
  Sun: { full: "Sun", abbr: "Su" },
  Moon: { full: "Moon", abbr: "Mo" },
  Mars: { full: "Mars", abbr: "Ma" },
  Mercury: { full: "Mercury", abbr: "Me" },
  Jupiter: { full: "Jupiter", abbr: "Ju" },
  Venus: { full: "Venus", abbr: "Ve" },
  Saturn: { full: "Saturn", abbr: "Sa" },
  Rahu: { full: "Rahu", abbr: "Ra" },
  Ketu: { full: "Ketu", abbr: "Ke" },
  Ascendant: { full: "Ascendant", abbr: "Asc" },
  Lagna: { full: "Lagna", abbr: "Lg" }
};

/**
 * Get responsive planet display name based on language and available width
 */
export const getPlanetDisplay = (planetKey: string, lang: 'en' | 'te' | 'hi' = 'en', maxWidth: number = 80): { text: string; title: string } => {
  const cleanKey = planetKey.replace(/ℜ|\(Rx\)/g, '').trim();
  const abbrev = lang === 'te' ? PLANET_ABBREV_TELUGU : PLANET_ABBREV_ENGLISH;
  const planet = abbrev[cleanKey as keyof typeof abbrev];
  
  if (!planet) return { text: planetKey, title: planetKey };
  
  const fullWidthThreshold = lang === 'te' ? 65 : 40;
  if (maxWidth > fullWidthThreshold) {
    return { text: planet.full, title: planet.full };
  }
  return { text: planet.abbr, title: planet.full };
};

/**
 * Get planet abbreviation from full name
 */
export const getPlanetAbbr = (fullName: string): string => {
  if (!fullName) return '';
  const normalized = fullName.trim().toLowerCase();
  
  for (const [full, abbr] of Object.entries(PLANET_MAP)) {
    if (full.toLowerCase() === normalized) {
      return abbr;
    }
  }
  
  // Fallback: return first 2 characters if not found
  return fullName.substring(0, 2).toUpperCase();
};

/**
 * Format planet display with retrograde indicator
 */
export const formatPlanetDisplay = (abbr: string, isRetrograde: boolean): string => {
  if (abbr === 'Me' || abbr === 'Mercury') return 'Me';
  return isRetrograde ? `${abbr}ℜ` : abbr;
};

/**
 * Get planet color based on type (Malefic/Benefic/Luminary/Lagna)
 */
export const getPlanetColor = (abbr: string): string => {
  const benefics = ['Ju', 'Ve'];           // Jupiter, Venus - Green
  const malefics = ['Ma', 'Sa', 'Ra', 'Ke']; // Mars, Saturn, Rahu, Ketu - Orange
  const luminaries = ['Su', 'Mo'];         // Sun, Moon - Gold
  const neutral = ['Me'];                  // Mercury - Gray

  if (benefics.includes(abbr)) return '#4CAF50'; // Green
  if (malefics.includes(abbr)) return '#FF9800'; // Orange
  if (luminaries.includes(abbr)) return '#FFD700'; // Gold
  if (abbr === 'L' || abbr === 'Asc' || abbr === 'Lg') return '#F5A623'; // Gold/Amber for Lagna
  return '#9E9E9E'; // Gray for neutral
};

/**
 * Check if planet is retrograde
 */
export const isRetrograde = (speed: number): boolean => {
  return speed < 0;
};

