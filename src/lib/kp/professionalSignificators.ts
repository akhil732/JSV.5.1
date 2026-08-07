/**
 * Professional Significators - KP Triple-Planet Rule
 * Source: Prof. K.S. Krishnamurti, Pages 16596-16650
 * 
 * Rule: Sub-Lord of 10th Cusp + Constellation Lord + Sign Lord = Profession Type
 * This mapping eliminates ambiguity in twin births by pinpointing exact profession
 */

import { ProfessionalSignificator } from './queryIntent';

/**
 * Aries (Mars ruled) - Professional combinations
 * Primary: Military, Police, Fire-brigade, Defense, Manufacturing
 */
export const ARIES_SIGNIFICATORS: ProfessionalSignificator[] = [
  // Sun dominant combinations
  {
    signLord: 'Mars',
    constellationLord: 'Sun',
    subLord: 'Sun',
    professions: ['Government Service', 'Defense Department', 'Medical Officer', 'Surgical Department'],
    characteristics: 'Leadership in government institutions',
    confidence: 95
  },
  {
    signLord: 'Mars',
    constellationLord: 'Sun',
    subLord: 'Moon',
    professions: ['Navy', 'Boiler Feed', 'Steam Engines', 'Surgical Nurse', 'Naval Engineer'],
    characteristics: 'Work related to water and steam',
    confidence: 90
  },
  {
    signLord: 'Mars',
    constellationLord: 'Sun',
    subLord: 'Mars',
    professions: ['Military Officer', 'Warrior', 'Combat Officer', 'War Department'],
    characteristics: 'Front-line military service',
    confidence: 95
  },
  {
    signLord: 'Mars',
    constellationLord: 'Sun',
    subLord: 'Mercury',
    professions: ['Postal Service', 'Communication Officer', 'Telegram/Telephone Department'],
    characteristics: 'Government communications',
    confidence: 85
  },
  {
    signLord: 'Mars',
    constellationLord: 'Sun',
    subLord: 'Jupiter',
    professions: ['Education Department', 'Military School', 'Law Department', 'Judge', 'Religious Endowment Board', 'Finance Department', 'Nationalised Banks'],
    characteristics: 'Government educational and judicial institutions',
    confidence: 90
  },
  {
    signLord: 'Mars',
    constellationLord: 'Sun',
    subLord: 'Venus',
    professions: ['Transport', 'Air Force', 'Music Teacher', 'Medicine', 'Chemical Department', 'Veterinary', 'Aircraft Industry'],
    characteristics: 'Transportation and medicine sectors',
    confidence: 85
  },
  {
    signLord: 'Mars',
    constellationLord: 'Sun',
    subLord: 'Saturn',
    professions: ['Mines', 'Metals', 'Coal Mining', 'Jail Superintendent', 'Sextons', 'Grave Diggers', 'Night Duty Officer'],
    characteristics: 'Mines, metals, and nocturnal work',
    confidence: 80
  },

  // Moon dominant combinations
  {
    signLord: 'Mars',
    constellationLord: 'Moon',
    subLord: 'Mars',
    professions: ['Navy', 'Sailors', 'Petroleum Products', 'Marine Officer', 'Dock Worker'],
    characteristics: 'Naval and maritime work',
    confidence: 90
  },
  {
    signLord: 'Mars',
    constellationLord: 'Moon',
    subLord: 'Mercury',
    professions: ['Interpreter', 'Secretary', 'Marine Engineer', 'Messenger', 'Communication Officer'],
    characteristics: 'Marine communications and interpretation',
    confidence: 85
  },
  {
    signLord: 'Mars',
    constellationLord: 'Moon',
    subLord: 'Jupiter',
    professions: ['Physician', 'Overseas Bank', 'Foreign Exchange Officer', 'Medical Professional'],
    characteristics: 'Medicine and international finance',
    confidence: 85
  },
  {
    signLord: 'Mars',
    constellationLord: 'Moon',
    subLord: 'Venus',
    professions: ['Painter', 'Milk Dairy Farm', 'Toilet Makers', 'Silk Merchant', 'Tailor (womens)', 'Nurse', 'Butler', 'Cook'],
    characteristics: 'Artistic and culinary professions',
    confidence: 80
  },
  {
    signLord: 'Mars',
    constellationLord: 'Moon',
    subLord: 'Saturn',
    professions: ['Excavation of Wells', 'Geologist', 'Petrol Dealer', 'Oil Pump Sets', 'Mining Engineer'],
    characteristics: 'Excavation and oil industry',
    confidence: 80
  },

  // Mercury dominant combinations
  {
    signLord: 'Mars',
    constellationLord: 'Mercury',
    subLord: 'Jupiter',
    professions: ['Councilor', 'Clergyman', 'Advertising Agent', 'Press', 'Bank Accountant', 'Auditor'],
    characteristics: 'Administrative and financial roles',
    confidence: 85
  },
  {
    signLord: 'Mars',
    constellationLord: 'Mercury',
    subLord: 'Venus',
    professions: ['Music', 'Radio', 'Sanitary Engineering', 'Sound Engineer', 'Audio Technician'],
    characteristics: 'Music and audio-related work',
    confidence: 80
  },
  {
    signLord: 'Mars',
    constellationLord: 'Mercury',
    subLord: 'Saturn',
    professions: ['Electrician', 'Telegraph Officer', 'Line Superintendent', 'Electrical Engineer'],
    characteristics: 'Electrical and communication infrastructure',
    confidence: 80
  },

  // Jupiter dominant combinations
  {
    signLord: 'Mars',
    constellationLord: 'Jupiter',
    subLord: 'Mars',
    professions: ['Police Officer', 'Law and Order', 'Traffic Police'],
    characteristics: 'Law enforcement',
    confidence: 90
  },
  {
    signLord: 'Mars',
    constellationLord: 'Jupiter',
    subLord: 'Mercury',
    professions: ['Press', 'Publicity', 'Journalism', 'Reporter', 'Editor'],
    characteristics: 'Media and journalism',
    confidence: 85
  },
  {
    signLord: 'Mars',
    constellationLord: 'Jupiter',
    subLord: 'Venus',
    professions: ['Animal Husbandry', 'Veterinarian', 'Farm Management'],
    characteristics: 'Animal care and farming',
    confidence: 80
  },
  {
    signLord: 'Mars',
    constellationLord: 'Jupiter',
    subLord: 'Saturn',
    professions: ['Slaughter House', 'Lethal Chamber', 'Cremation Ground'],
    characteristics: 'Controversial occupations',
    confidence: 70
  },

  // Venus dominant combinations
  {
    signLord: 'Mars',
    constellationLord: 'Venus',
    subLord: 'Mars',
    professions: ['Butcher', 'Leather Tanner', 'Meat Industry'],
    characteristics: 'Meat and leather industry',
    confidence: 80
  },
  {
    signLord: 'Mars',
    constellationLord: 'Venus',
    subLord: 'Mercury',
    professions: ['Salesman', 'Salesperson', 'Business Agent', 'Representative'],
    characteristics: 'Sales and commercial work',
    confidence: 85
  },

  // Saturn dominant combinations
  {
    signLord: 'Mars',
    constellationLord: 'Saturn',
    subLord: 'Mars',
    professions: ['Iron and Steel Industry', 'Heavy Machinery', 'Blast Furnace Operator'],
    characteristics: 'Heavy industry and metals',
    confidence: 85
  },
  {
    signLord: 'Mars',
    constellationLord: 'Saturn',
    subLord: 'Mercury',
    professions: ['Engine Driver', 'Railway Worker', 'Machine Operator', 'Welder'],
    characteristics: 'Railway and mechanical work',
    confidence: 85
  }
];

/**
 * Generic Profession Classification by Planet Combinations
 * When exact sign/constellation is not available
 */
export const GENERIC_PROFESSIONAL_COMBINATIONS: Record<string, string[]> = {
  'SUN_SUN': ['Government Service', 'Defense', 'Medicine', 'Surgeon', 'Judge'],
  'SUN_MOON': ['Navy', 'Naval Engineering', 'Boiler Work'],
  'SUN_MARS': ['Military', 'Police', 'Warrior'],
  'SUN_MERCURY': ['Communication', 'Postal Service', 'Telephone', 'Telegram'],
  'SUN_JUPITER': ['Education', 'Law', 'Judge', 'Religious Head', 'Finance'],
  'SUN_VENUS': ['Transport', 'Air Force', 'Music', 'Medicine', 'Chemical', 'Veterinary'],
  'SUN_SATURN': ['Mines', 'Metals', 'Coal', 'Prison', 'Grave Digger'],
  
  'MOON_MARS': ['Navy', 'Sailors', 'Petroleum', 'Marine Officer'],
  'MOON_MERCURY': ['Interpreter', 'Secretary', 'Marine Engineer'],
  'MOON_JUPITER': ['Physician', 'Overseas Bank', 'Foreign Exchange'],
  'MOON_VENUS': ['Painter', 'Milk Dairy', 'Tailor', 'Nurse', 'Cook'],
  'MOON_SATURN': ['Excavation', 'Geologist', 'Petrol Dealer', 'Mining Engineer'],
  
  'MARS_MERCURY': ['Communication', 'Military Communication'],
  'MARS_JUPITER': ['Police', 'Law and Order', 'Justice'],
  'MARS_VENUS': ['Butcher', 'Leather', 'Meat Industry'],
  
  'MERCURY_JUPITER': ['Counselor', 'Clergyman', 'Advertising', 'Bank Accountant'],
  'MERCURY_VENUS': ['Music', 'Radio', 'Sanitary Engineering'],
  'MERCURY_SATURN': ['Electrician', 'Telegraph', 'Electrical Engineering'],
  
  'VENUS_MARS': ['Butcher', 'Leather Tanner'],
  'VENUS_MERCURY': ['Salesman', 'Sales Representative', 'Business Agent'],
  'VENUS_SATURN': ['Mining of Precious Stones', 'Jeweler'],
  
  'SATURN_MERCURY': ['Engine Driver', 'Railway Worker', 'Machine Operator'],
  'SATURN_MARS': ['Iron and Steel', 'Heavy Machinery'],
  'SATURN_VENUS': ['Mining', 'Jeweler']
};

/**
 * Business suitability based on significator combination
 * For queries like "Which business is suitable for me?"
 */
export const BUSINESS_SUITABILITY: Record<string, {
  businessTypes: string[];
  characteristics: string;
  successFactors: string[];
}> = {
  'SUN': {
    businessTypes: ['Government contracts', 'Luxury goods', 'Gold/Precious metals', 'Medicine', 'Healing services'],
    characteristics: 'Authority, leadership, prestige-oriented',
    successFactors: ['Government connections', 'Quality products', 'Premium positioning']
  },
  'MOON': {
    businessTypes: ['Dairy', 'Pearls', 'Milk products', 'Food and beverages', 'Textiles', 'Shipping'],
    characteristics: 'Consumer-focused, emotional connection',
    successFactors: ['Customer relationships', 'Cyclical market understanding', 'Liquidity management']
  },
  'MARS': {
    businessTypes: ['Machinery', 'Metallurgy', 'Engineering', 'Sports equipment', 'Sharp instruments'],
    characteristics: 'Aggressive, competitive, result-oriented',
    successFactors: ['Innovation', 'Competitive pricing', 'Market dominance']
  },
  'MERCURY': {
    businessTypes: ['Publishing', 'Communication', 'Trade', 'Commission business', 'Information services', 'Accounting'],
    characteristics: 'Communication-focused, detail-oriented',
    successFactors: ['Clear messaging', 'Speed of operation', 'Information accuracy']
  },
  'JUPITER': {
    businessTypes: ['Banking', 'Finance', 'Education', 'Religion', 'Consulting', 'Legal services', 'Import-Export'],
    characteristics: 'Growth-oriented, ethical, expansion-focused',
    successFactors: ['Long-term vision', 'Ethical practices', 'Network building']
  },
  'VENUS': {
    businessTypes: ['Jewelry', 'Cosmetics', 'Fashion', 'Art', 'Entertainment', 'Luxury items', 'Perfumes'],
    characteristics: 'Beauty-focused, aesthetic, pleasure-oriented',
    successFactors: ['Aesthetic appeal', 'Luxury positioning', 'Customer delight']
  },
  'SATURN': {
    businessTypes: ['Agriculture', 'Mining', 'Construction', 'Labor-intensive work', 'Real estate', 'Manufacturing'],
    characteristics: 'Hardwork-focused, systematic, discipline-oriented',
    successFactors: ['Patience', 'Long-term commitment', 'Systematic processes']
  }
};

/**
 * Find professional significators by planet combination
 */
export function findProfessionalSignificator(
  sign: string,
  constellation: string,
  subLord: string
): ProfessionalSignificator | null {
  const normSign = sign.toLowerCase();
  const normStar = constellation.toLowerCase();
  const normSub = subLord.toLowerCase();

  if (normSign === 'aries' || normSign === 'mars' || normSign === '1') {
    return ARIES_SIGNIFICATORS.find(
      s => s.constellationLord.toLowerCase() === normStar && s.subLord.toLowerCase() === normSub
    ) || null;
  }
  
  return null;
}

/**
 * Get generic professions for planet combination
 */
export function getGenericProfessions(planet1: string, planet2: string): string[] {
  const key = `${planet1.toUpperCase()}_${planet2.toUpperCase()}`;
  return GENERIC_PROFESSIONAL_COMBINATIONS[key] || [];
}

/**
 * Get business suitability for planet
 * BACKWARD COMPATIBLE: Returns string[] representing businessTypes, but we also let it have properties
 */
export function getBusinessSuitability(planet: string): string[] & {
  businessTypes: string[];
  characteristics: string;
  successFactors: string[];
} {
  const data = BUSINESS_SUITABILITY[planet.toUpperCase()] || {
    businessTypes: ['General retail and trade of services', 'Consultancy business matching planet significance'],
    characteristics: 'General commerce',
    successFactors: ['Customer satisfaction']
  };
  const arr = [...data.businessTypes] as any;
  arr.businessTypes = data.businessTypes;
  arr.characteristics = data.characteristics;
  arr.successFactors = data.successFactors;
  return arr;
}

/**
 * Parse 10th cusp details and get profession
 */
export function getProfessionFromCusp(
  cuspDegree: number,
  sign: string,
  constellation: string,
  subLord: string
): string[] {
  const specificSignificator = findProfessionalSignificator(sign, constellation, subLord);
  if (specificSignificator) {
    return specificSignificator.professions;
  }

  const generic = getGenericProfessions(constellation, subLord);
  if (generic.length > 0) {
    return generic;
  }

  if (sign.toLowerCase() === 'aries' || sign.toLowerCase() === 'mars') {
    return ['Military', 'Police', 'Defense', 'Government Service', 'Engineering'];
  }

  return ['General Commercial Sector', 'Private Service'];
}

/**
 * BACKWARD COMPATIBLE: Keep lookupTriplePlanetProfession
 */
export function lookupTriplePlanetProfession(sign: string, star: string, sub: string): ProfessionalSignificator {
  const spec = findProfessionalSignificator(sign, star, sub);
  if (spec) {
    return {
      ...spec,
      profession: spec.professions.join(' / '),
      details: spec.characteristics || ''
    };
  }

  const generic = getGenericProfessions(star, sub);
  if (generic.length > 0) {
    return {
      signLord: sign,
      constellationLord: star,
      subLord: sub,
      professions: generic,
      profession: generic.join(' / '),
      details: 'KP Generic planetary combination'
    };
  }

  return {
    signLord: sign,
    constellationLord: star,
    subLord: sub,
    professions: ['General Enterprise'],
    profession: 'General Enterprise',
    details: 'Blended textbook analysis: Sign Lord provides base platform, Star Lord gives path, Sub-Lord determines results.'
  };
}
