/**
 * Manglik Dosha calculation utility for Vedic Astrology
 * Evaluates Mars placement from Ascendant, Moon, and Venus, and checks cancellation exception signs and Jupiter conjunction.
 */

export interface ManglikDoshaDetails {
  fromAscendant: boolean;
  fromMoon: boolean;
  fromVenus: boolean;
  affectedHouses: number[];
  affectedReferences: string[];
}

export interface ManglikDoshaResult {
  status: "PRESENT" | "NEUTRAL" | "CANCELLED";
  reason: string;
  details: ManglikDoshaDetails;
  severity: "NONE" | "MILD" | "MODERATE" | "STRONG";
}

const SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];

const EXCEPTION_SIGNS = [
  "Aries", "Scorpio"
];

const SIGN_MAPPING: Record<string, string> = {
  "Mesham": "Aries", "Rishabam": "Taurus", "Midhunam": "Gemini", "Kadagam": "Cancer",
  "Simmam": "Leo", "Kanni": "Virgo", "Thulaam": "Libra", "Viruchigam": "Scorpio",
  "Dhanusu": "Sagittarius", "Magaram": "Capricorn", "Kumbam": "Aquarius", "Meenam": "Pisces"
};

function normalizeSign(signName: string | undefined): string {
  if (!signName) return "";
  const cleaned = signName.trim();
  return SIGN_MAPPING[cleaned] || cleaned;
}

function getSignIndex(signName: string | undefined): number {
  const norm = normalizeSign(signName);
  return SIGNS.indexOf(norm);
}

function calculateHouse(targetIdx: number, refIdx: number): number {
  if (targetIdx === -1 || refIdx === -1) return -1;
  return ((targetIdx - refIdx + 12) % 12) + 1;
}

/**
 * Calculates Manglik Dosha status, severity, and reference breakdown for a given horoscope.
 * @param horoscopeInput Horoscope object or divisional charts data containing D-1_rasi
 */
export function calculateManglikDosha(horoscopeInput: any): ManglikDoshaResult {
  const d1 = horoscopeInput?.horoscope?.divisional_charts?.['D-1_rasi']
    || horoscopeInput?.divisional_charts?.['D-1_rasi']
    || horoscopeInput;

  const ascendantObj = d1?.Ascendant;
  const marsObj = d1?.Mars;
  const moonObj = d1?.Moon;
  const venusObj = d1?.Venus;
  const jupiterObj = d1?.Jupiter;

  const ascSign = typeof ascendantObj === 'string' ? ascendantObj : ascendantObj?.sign;
  const marsSign = typeof marsObj === 'string' ? marsObj : marsObj?.sign;
  const moonSign = typeof moonObj === 'string' ? moonObj : moonObj?.sign;
  const venusSign = typeof venusObj === 'string' ? venusObj : venusObj?.sign;
  const jupiterSign = typeof jupiterObj === 'string' ? jupiterObj : jupiterObj?.sign;

  const defaultResult: ManglikDoshaResult = {
    status: "NEUTRAL",
    reason: "No planetary data available for Manglik Dosha calculation.",
    details: {
      fromAscendant: false,
      fromMoon: false,
      fromVenus: false,
      affectedHouses: [],
      affectedReferences: []
    },
    severity: "NONE"
  };

  const ascIdx = getSignIndex(ascSign);
  const marsIdx = getSignIndex(marsSign);

  if (ascIdx === -1 || marsIdx === -1) {
    return defaultResult;
  }

  const normalizedAscSign = SIGNS[ascIdx];
  const normalizedMarsSign = SIGNS[marsIdx];
  const normalizedJupiterSign = getSignIndex(jupiterSign) !== -1 ? SIGNS[getSignIndex(jupiterSign)] : "";

  // STEP 1 - Check Exception Signs First
  if (EXCEPTION_SIGNS.includes(normalizedAscSign)) {
    return {
      status: "CANCELLED",
      reason: `Manglik Dosha is cancelled due to Ascendant in exception sign: ${normalizedAscSign}.`,
      details: {
        fromAscendant: false,
        fromMoon: false,
        fromVenus: false,
        affectedHouses: [],
        affectedReferences: []
      },
      severity: "NONE"
    };
  }

  // Check Jupiter conjunction exception (Mars in conjunct with Jupiter)
  if (normalizedJupiterSign && normalizedMarsSign === normalizedJupiterSign) {
    return {
      status: "CANCELLED",
      reason: "Manglik Dosha is cancelled because Mars is in conjunction with Jupiter in the same sign.",
      details: {
        fromAscendant: false,
        fromMoon: false,
        fromVenus: false,
        affectedHouses: [],
        affectedReferences: []
      },
      severity: "NONE"
    };
  }

  const moonIdx = getSignIndex(moonSign);
  const venusIdx = getSignIndex(venusSign);

  const houseFromAscendant = calculateHouse(marsIdx, ascIdx);
  const houseFromMoon = calculateHouse(marsIdx, moonIdx);
  const houseFromVenus = calculateHouse(marsIdx, venusIdx);

  const targetHouses = [2, 4, 7, 8, 12];

  const fromAscendant = targetHouses.includes(houseFromAscendant);
  const fromMoon = targetHouses.includes(houseFromMoon);
  const fromVenus = targetHouses.includes(houseFromVenus);

  const affectedHouses: number[] = [];
  const affectedReferences: string[] = [];

  if (fromAscendant) {
    affectedHouses.push(houseFromAscendant);
    affectedReferences.push("Ascendant");
  }
  if (fromMoon) {
    affectedHouses.push(houseFromMoon);
    affectedReferences.push("Moon");
  }
  if (fromVenus) {
    affectedHouses.push(houseFromVenus);
    affectedReferences.push("Venus");
  }

  const affectedCount = [fromAscendant, fromMoon, fromVenus].filter(Boolean).length;

  let status: "PRESENT" | "NEUTRAL" | "CANCELLED" = "NEUTRAL";
  let severity: "NONE" | "MILD" | "MODERATE" | "STRONG" = "NONE";
  let reason = "Mars is not placed in the 1st, 2nd, 4th, 7th, 8th, or 12th house from Ascendant, Moon, or Venus.";

  if (affectedCount > 0) {
    status = "PRESENT";
    reason = `Manglik Dosha is PRESENT. Affected reference points: ${affectedReferences.join(', ')} (Houses: ${affectedHouses.join(', ')}).`;
    if (affectedCount === 1) severity = "MILD";
    else if (affectedCount === 2) severity = "MODERATE";
    else if (affectedCount === 3) severity = "STRONG";
  }

  return {
    status,
    reason,
    details: {
      fromAscendant,
      fromMoon,
      fromVenus,
      affectedHouses,
      affectedReferences
    },
    severity
  };
}
