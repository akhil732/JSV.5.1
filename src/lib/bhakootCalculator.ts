export interface BhakootResult {
  score: number; // 0 or 7
  maxScore: number; // 7
  isUnfavourable: boolean;
  isCancelled: boolean;
  relationshipType: '1-1' | '2-12' | '3-11' | '4-10' | '5-9' | '6-8' | '7-7' | 'Unknown';
  doshaName: 'Shadashtaka' | 'Navapanchama' | 'Dwirdwadasha' | 'None';
  cancellationReason?: string;
  details: string;
  compatibility: string;
}

export const SIGNS_ENGLISH = [
  "Aries", "Taurus", "Gemini", "Cancer",
  "Leo", "Virgo", "Libra", "Scorpio",
  "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];

export const SIGN_LORDS: Record<number, string> = {
  1: "Mars",      // Aries / Mesha
  2: "Venus",     // Taurus / Vrishabha
  3: "Mercury",   // Gemini / Mithuna
  4: "Moon",      // Cancer / Karka
  5: "Sun",       // Leo / Simha
  6: "Mercury",   // Virgo / Kanya
  7: "Venus",     // Libra / Tula
  8: "Mars",      // Scorpio / Vrischika
  9: "Jupiter",   // Sagittarius / Dhanu
  10: "Saturn",   // Capricorn / Makara
  11: "Saturn",   // Aquarius / Kumbha
  12: "Jupiter",  // Pisces / Meena
};

export function normalizeSignIndex(signNameOrIndex: string | number): number {
  if (typeof signNameOrIndex === 'number') {
    if (signNameOrIndex >= 1 && signNameOrIndex <= 12) return signNameOrIndex;
    if (signNameOrIndex >= 0 && signNameOrIndex <= 11) return signNameOrIndex + 1;
  }
  
  const str = String(signNameOrIndex || '').trim().toLowerCase();
  
  const map: Record<string, number> = {
    "aries": 1, "mesha": 1, "mesham": 1,
    "taurus": 2, "vrishabha": 2, "vrishabham": 2, "rishabam": 2,
    "gemini": 3, "mithuna": 3, "mithunam": 3, "midhunam": 3,
    "cancer": 4, "karka": 4, "karkatakama": 4, "kadagam": 4,
    "leo": 5, "simha": 5, "simham": 5, "simmam": 5,
    "virgo": 6, "kanya": 6, "kanni": 6,
    "libra": 7, "tula": 7, "tulam": 7, "thulaam": 7,
    "scorpio": 8, "vrischika": 8, "vrischikam": 8, "viruchigam": 8,
    "sagittarius": 9, "dhanu": 9, "dhanus": 9, "dhanusu": 9,
    "capricorn": 10, "makara": 10, "makaram": 10, "magaram": 10,
    "aquarius": 11, "kumbha": 11, "kumbham": 11, "kumbam": 11,
    "pisces": 12, "meena": 12, "meenam": 12
  };
  
  return map[str] || -1;
}

export function areFriendlyOrSameLords(lord1: string, lord2: string): boolean {
  if (lord1 === lord2) return true;
  
  const friendlyPairs = new Set([
    "Sun-Moon", "Moon-Sun",
    "Sun-Mars", "Mars-Sun",
    "Sun-Jupiter", "Jupiter-Sun",
    "Sun-Mercury", "Mercury-Sun",
    "Moon-Mars", "Mars-Moon",
    "Moon-Jupiter", "Jupiter-Moon",
    "Moon-Mercury", "Mercury-Moon",
    "Mars-Jupiter", "Jupiter-Mars",
    "Mercury-Venus", "Venus-Mercury",
    "Mercury-Saturn", "Saturn-Mercury",
    "Venus-Saturn", "Saturn-Venus",
  ]);

  return friendlyPairs.has(`${lord1}-${lord2}`);
}

export function checkParivartanaYoga(horoscope: any, lord1: string, lord2: string): boolean {
  if (!horoscope) return false;
  const d1 = horoscope?.divisional_charts?.['D-1_rasi'] || horoscope?.horoscope?.divisional_charts?.['D-1_rasi'];
  if (!d1) return false;

  const planet1Sign = d1?.[lord1]?.sign;
  const planet2Sign = d1?.[lord2]?.sign;
  if (!planet1Sign || !planet2Sign) return false;

  const p1SignIdx = normalizeSignIndex(planet1Sign);
  const p2SignIdx = normalizeSignIndex(planet2Sign);
  if (p1SignIdx === -1 || p2SignIdx === -1) return false;

  const p1SignLord = SIGN_LORDS[p1SignIdx];
  const p2SignLord = SIGN_LORDS[p2SignIdx];

  return (p1SignLord === lord2 && p2SignLord === lord1);
}

export function checkJupiterProtection(horoscope: any, moonSignIdx: number): boolean {
  if (!horoscope) return false;
  const d1 = horoscope?.divisional_charts?.['D-1_rasi'] || horoscope?.horoscope?.divisional_charts?.['D-1_rasi'];
  if (!d1) return false;

  const ascSign = d1?.Ascendant?.sign;
  const jupiterSign = d1?.Jupiter?.sign;
  if (!ascSign || !jupiterSign) return false;

  const ascIdx = normalizeSignIndex(ascSign);
  const jupIdx = normalizeSignIndex(jupiterSign);
  if (ascIdx === -1 || jupIdx === -1) return false;

  const jupHouseFromAsc = ((jupIdx - ascIdx + 12) % 12) + 1;
  const isKendraOrTrikona = [1, 4, 5, 7, 9, 10].includes(jupHouseFromAsc);

  const distJupToMoon = ((moonSignIdx - jupIdx + 12) % 12) + 1;
  const aspectsMoon = [1, 5, 7, 9].includes(distJupToMoon);

  return isKendraOrTrikona || aspectsMoon;
}

export function calculateBhakoot(
  boyRasiInput: string | number,
  girlRasiInput: string | number,
  boyHoroscope?: any,
  girlHoroscope?: any
): BhakootResult {
  const boyIdx = normalizeSignIndex(boyRasiInput);
  const girlIdx = normalizeSignIndex(girlRasiInput);

  if (boyIdx === -1 || girlIdx === -1) {
    return {
      score: 0,
      maxScore: 7,
      isUnfavourable: false,
      isCancelled: false,
      relationshipType: 'Unknown',
      doshaName: 'None',
      details: 'Unknown Moon sign combination',
      compatibility: 'Unknown'
    };
  }

  const boySign = SIGNS_ENGLISH[boyIdx - 1];
  const girlSign = SIGNS_ENGLISH[girlIdx - 1];
  const boyLord = SIGN_LORDS[boyIdx];
  const girlLord = SIGN_LORDS[girlIdx];

  const dist1 = ((girlIdx - boyIdx + 12) % 12) + 1;
  const dist2 = ((boyIdx - girlIdx + 12) % 12) + 1;
  const minDist = Math.min(dist1, dist2);
  const maxDist = Math.max(dist1, dist2);

  const getOrdinal = (n: number) => {
    if (n === 1) return '1st';
    if (n === 2) return '2nd';
    if (n === 3) return '3rd';
    return `${n}th`;
  };

  const houseDetails = `${boySign} (${boyLord}) ↔ ${girlSign} (${girlLord})  ·  ${getOrdinal(minDist)}/${getOrdinal(maxDist)} houses`;

  let isIncompatiblePair = false;
  let doshaName: 'Shadashtaka' | 'Navapanchama' | 'Dwirdwadasha' | 'None' = 'None';
  let relType: '1-1' | '2-12' | '3-11' | '4-10' | '5-9' | '6-8' | '7-7' = '1-1';

  if (minDist === 6 && maxDist === 8) {
    isIncompatiblePair = true;
    doshaName = 'Shadashtaka';
    relType = '6-8';
  } else if (minDist === 5 && maxDist === 9) {
    isIncompatiblePair = true;
    doshaName = 'Navapanchama';
    relType = '5-9';
  } else if (minDist === 2 && maxDist === 12) {
    isIncompatiblePair = true;
    doshaName = 'Dwirdwadasha';
    relType = '2-12';
  } else if (minDist === 1 && maxDist === 1) {
    relType = '1-1';
  } else if (minDist === 3 && maxDist === 11) {
    relType = '3-11';
  } else if (minDist === 4 && maxDist === 10) {
    relType = '4-10';
  } else if (minDist === 7 && maxDist === 7) {
    relType = '7-7';
  }

  // If pair does not appear in 6-8, 5-9, or 2-12 incompatibility tables:
  if (!isIncompatiblePair) {
    return {
      score: 7,
      maxScore: 7,
      isUnfavourable: false,
      isCancelled: false,
      relationshipType: relType,
      doshaName: 'None',
      details: houseDetails,
      compatibility: `Favourable (${relType} Relationship)`
    };
  }

  // Incompatible Pair detected — check standard Bhakoot cancellation (Parihara) rules:
  let cancellationReason: string | undefined;

  // Rule 1: Same Rashi Lord
  if (boyLord === girlLord) {
    cancellationReason = `Same Rashi Lord (${boyLord})`;
  }
  // Rule 2: Friendly Rashi Lords
  else if (areFriendlyOrSameLords(boyLord, girlLord)) {
    cancellationReason = `Friendly Rashi Lords (${boyLord} & ${girlLord})`;
  }
  // Rule 3: Parivartana Yoga (exchange of signs by lords)
  else if (
    checkParivartanaYoga(boyHoroscope, boyLord, girlLord) ||
    checkParivartanaYoga(girlHoroscope, boyLord, girlLord)
  ) {
    cancellationReason = `Parivartana Yoga (Exchange of Rasi Lords ${boyLord} & ${girlLord})`;
  }
  // Rule 4: Classical Jupiter protection where applicable
  else if (
    checkJupiterProtection(boyHoroscope, girlIdx) ||
    checkJupiterProtection(girlHoroscope, boyIdx)
  ) {
    cancellationReason = `Classical Jupiter Protection (Guru Drishti / Placement)`;
  }

  if (cancellationReason) {
    return {
      score: 7,
      maxScore: 7,
      isUnfavourable: false,
      isCancelled: true,
      relationshipType: relType,
      doshaName,
      cancellationReason,
      details: `${houseDetails}  ·  Bhakoot Dosha Cancelled (${cancellationReason})`,
      compatibility: `Favourable (Dosha Cancelled by ${cancellationReason})`
    };
  }

  // If no cancellation rule applies: 0 Bhakoot points / Unfavourable
  const doshaLabels: Record<string, string> = {
    'Shadashtaka': '6-8 Shadashtaka Dosha',
    'Navapanchama': '5-9 Navapanchama Dosha',
    'Dwirdwadasha': '2-12 Dwirdwadasha Dosha'
  };

  return {
    score: 0,
    maxScore: 7,
    isUnfavourable: true,
    isCancelled: false,
    relationshipType: relType,
    doshaName,
    details: `${houseDetails}  ·  Incompatible Pair (${doshaLabels[doshaName]})`,
    compatibility: `Unfavourable (${doshaLabels[doshaName]})`
  };
}
