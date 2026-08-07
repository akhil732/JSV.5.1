import React from 'react';
import { Award, Star } from 'lucide-react';

const SIGN_NAMES = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", 
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];

const SIGN_LORDS: Record<string, string> = {
  "Aries": "Mars", "Taurus": "Venus", "Gemini": "Mercury", "Cancer": "Moon",
  "Leo": "Sun", "Virgo": "Mercury", "Libra": "Venus", "Scorpio": "Mars",
  "Sagittarius": "Jupiter", "Capricorn": "Saturn", "Aquarius": "Saturn", "Pisces": "Jupiter"
};

const EXALTATION_MAP: Record<string, string> = {
  "Sun": "Aries", "Moon": "Taurus", "Mars": "Capricorn",
  "Mercury": "Virgo", "Jupiter": "Cancer", "Venus": "Pisces",
  "Saturn": "Libra", "Rahu": "Taurus", "Ketu": "Scorpio"
};

const OWN_SIGN_MAP: Record<string, string[]> = {
  "Sun": ["Leo"], "Moon": ["Cancer"], "Mars": ["Aries", "Scorpio"],
  "Mercury": ["Gemini", "Virgo"], "Jupiter": ["Sagittarius", "Pisces"],
  "Venus": ["Libra", "Taurus"], "Saturn": ["Capricorn", "Aquarius"],
  "Rahu": ["Aquarius"], "Ketu": ["Scorpio"]
};

const DEBILITATION_MAP: Record<string, string> = {
  "Sun": "Libra", "Moon": "Scorpio", "Mars": "Cancer",
  "Mercury": "Pisces", "Jupiter": "Capricorn", "Venus": "Virgo",
  "Saturn": "Aries", "Rahu": "Scorpio", "Ketu": "Taurus"
};

const FRIENDLY_SIGNS: Record<string, string[]> = {
  "Sun": ["Aries", "Leo", "Sagittarius", "Pisces", "Cancer"],
  "Moon": ["Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra"],
  "Mars": ["Aries", "Cancer", "Leo", "Scorpio", "Sagittarius", "Pisces"],
  "Mercury": ["Taurus", "Gemini", "Leo", "Virgo", "Libra"],
  "Jupiter": ["Aries", "Cancer", "Leo", "Scorpio", "Sagittarius", "Pisces"],
  "Venus": ["Taurus", "Gemini", "Virgo", "Libra", "Aquarius", "Capricorn"],
  "Saturn": ["Taurus", "Gemini", "Virgo", "Libra", "Capricorn", "Aquarius"],
  "Rahu": ["Gemini", "Virgo", "Libra"],
  "Ketu": ["Aries", "Scorpio", "Sagittarius", "Pisces"]
};

// House Signs helper
function getHouseSigns(lagnaSign: string): string[] {
  const startIdx = SIGN_NAMES.indexOf(lagnaSign);
  const houseSigns: string[] = [];
  for (let h = 0; h < 12; h++) {
    houseSigns.push(SIGN_NAMES[(startIdx + h) % 12]);
  }
  return houseSigns;
}

// Derive House Rulers per planet
function deriveHouseRulers(lagnaSign: string): Record<string, number[]> {
  const houseSigns = getHouseSigns(lagnaSign);
  const rulers: Record<string, number[]> = {
    "Sun": [], "Moon": [], "Mars": [], "Mercury": [], "Jupiter": [], "Venus": [], "Saturn": [], "Rahu": [], "Ketu": []
  };
  houseSigns.forEach((sign, idx) => {
    const houseNum = idx + 1;
    const lord = SIGN_LORDS[sign];
    if (lord && rulers[lord]) {
      rulers[lord].push(houseNum);
    }
  });
  return rulers;
}

// Functional Role
function getFunctionalRole(planet: string, lagnaSign: string): string {
  if (planet === "Rahu" || planet === "Ketu") return "Neutral";
  const houseRulers = deriveHouseRulers(lagnaSign);
  const housesRuled = houseRulers[planet] || [];

  if (housesRuled.includes(1)) {
    return "Functional Benefic";
  }
  if (housesRuled.includes(5) || housesRuled.includes(9)) {
    return "Functional Benefic";
  }
  if (housesRuled.some(h => [4, 7, 10].includes(h))) {
    if (housesRuled.some(h => [6, 8, 12].includes(h))) {
      return "Functional Malefic";
    }
    return "Functional Benefic";
  }
  if (housesRuled.some(h => [6, 8, 12].includes(h))) {
    if (housesRuled.includes(6) && !housesRuled.some(h => [8, 12].includes(h))) {
      return "Functional Malefic (Upachaya Modulated)";
    }
    return "Functional Malefic";
  }
  return "Neutral";
}

// Check Neecha Bhanga
function checkNeechaBhanga(planet: string, lagnaSign: string, divisionalCharts: any): boolean {
  const d1 = divisionalCharts["D-1_rasi"];
  if (!d1) return false;

  const planetSign = d1[planet]?.sign;
  const debSign = DEBILITATION_MAP[planet];
  if (planetSign !== debSign) return false;

  const exaltSign = EXALTATION_MAP[planet];
  const exaltLord = SIGN_LORDS[exaltSign];
  const debLord = SIGN_LORDS[debSign];

  const ascIdx = SIGN_NAMES.indexOf(lagnaSign);
  
  if (exaltLord && d1[exaltLord]) {
    const exaltLordIdx = SIGN_NAMES.indexOf(d1[exaltLord].sign);
    const exaltLordHouse = ((exaltLordIdx - ascIdx + 12) % 12) + 1;
    if ([1, 4, 7, 10].includes(exaltLordHouse)) return true;
  }

  if (debLord && d1[debLord]) {
    const debLordIdx = SIGN_NAMES.indexOf(d1[debLord].sign);
    const debLordHouse = ((debLordIdx - ascIdx + 12) % 12) + 1;
    if ([1, 4, 7, 10].includes(debLordHouse)) return true;
  }

  const d9 = divisionalCharts["D-9_navamsa"];
  if (d9 && d9[planet]) {
    if (d9[planet].sign === EXALTATION_MAP[planet]) {
      return true;
    }
  }

  return false;
}

// Planetary Strength
function getPlanetaryStrength(planet: string, lagnaSign: string, divisionalCharts: any, planetaryStates: any): number {
  const d1 = divisionalCharts["D-1_rasi"];
  if (!d1 || !d1[planet]) return 2.0;

  let stars = 2.0;

  const sign = d1[planet].sign;
  const exaltationSign = EXALTATION_MAP[planet];
  const ownSigns = OWN_SIGN_MAP[planet] || [];
  const friendlySigns = FRIENDLY_SIGNS[planet] || [];
  const debilitationSign = DEBILITATION_MAP[planet];

  if (sign === exaltationSign) {
    stars = 4.5;
  } else if (ownSigns.includes(sign)) {
    stars = 4.0;
  } else if (friendlySigns.includes(sign)) {
    stars = 3.0;
  } else if (sign === debilitationSign) {
    stars = 1.0;
    if (checkNeechaBhanga(planet, lagnaSign, divisionalCharts)) {
      stars += 1.5;
    }
  } else {
    stars = 2.0;
  }

  const funcRole = getFunctionalRole(planet, lagnaSign);
  if (funcRole === "Functional Benefic") {
    stars += 0.5;
  } else if (funcRole.startsWith("Functional Malefic")) {
    stars -= 0.5;
  }

  const ascIdx = SIGN_NAMES.indexOf(lagnaSign);
  const planetIdx = SIGN_NAMES.indexOf(sign);
  const house = ((planetIdx - ascIdx + 12) % 12) + 1;

  if ([1, 4, 7, 10].includes(house)) {
    stars += 0.5;
  } else if ([5, 9].includes(house)) {
    stars += 0.5;
  } else if ([3, 6, 11].includes(house)) {
    stars += 0.25;
  } else if ([6, 8, 12].includes(house)) {
    stars -= 0.25;
  }

  const retrogradePlanets = planetaryStates?.retrograde_planets || [];
  const combustedPlanets = planetaryStates?.combusted_planets || [];

  if (retrogradePlanets.includes(planet)) {
    stars -= 0.5;
  }
  if (combustedPlanets.includes(planet)) {
    stars -= 1.0;
  }

  stars = Math.max(1.0, Math.min(5.0, stars));
  stars = Math.round(stars * 2) / 2;

  return stars;
}

const TRANSLATIONS = {
  en: {
    title: "Planetary Strength Profile",
    subtitle: "Vedic rating & structural configuration metrics",
    planet: "Planet",
    dignity: "Dignity",
    functionalRole: "Functional Role",
    housePlacement: "House Placement",
    strength: "Strength",
    notes: "Notes",
    lagna: "LAGNA (ASCENDANT)",
    normal: "Normal",
    retrograde: "Retrograde",
    combust: "Combusted",
    exalted: "Exalted",
    ownSign: "Own Sign",
    friendlySign: "Friendly Sign",
    neutralSign: "Neutral Sign",
    debilitated: "Debilitated",
    neechaBhanga: "Nīcha Bhaṅga Triggered",
    neechaNoBhanga: "Nīcha Bhaṅga not triggered",
    benefic: "Functional Benefic",
    malefic: "Functional Malefic",
    upachaya: "Functional Malefic (Upachaya Modulated)",
    neutral: "Neutral",
    houseSuffix: "House",
    lagnaNotes: "Natal Horizon Base",
    retroNotes: "Natural Malefic; Retrograde",
    exaltedNotes: "Exalted dignity strength overlay",
    friendlyNotes: "Friendly sign configuration"
  },
  hi: {
    title: "ग्रह बल और स्थिति",
    subtitle: "वैदिक रेटिंग और संरचनात्मक विन्यास मीट्रिक",
    planet: "ग्रह",
    dignity: "मर्यादा/अवस्था",
    functionalRole: "कार्यात्मक भूमिका",
    housePlacement: "भाव स्थिति",
    strength: "बल",
    notes: "विशेष टिप्पणी",
    lagna: "लग्न (LAGNA)",
    normal: "सामान्य",
    retrograde: "वक्री (Retrograde)",
    combust: "अस्त (Combust)",
    exalted: "उच्च (Exalted)",
    ownSign: "स्वराशि (Own Sign)",
    friendlySign: "मित्र राशि (Friendly)",
    neutralSign: "सम राशि (Neutral)",
    debilitated: "नीच (Debilitated)",
    neechaBhanga: "नीच भंग सक्रिय (Nīcha Bhaṅga)",
    neechaNoBhanga: "नीच भंग सक्रिय नहीं",
    benefic: "कार्यात्मक शुभ (Benefic)",
    malefic: "कार्यात्मक अशुभ (Malefic)",
    upachaya: "कार्यात्मक अशुभ (उपचय नियंत्रित)",
    neutral: "तटस्थ (Neutral)",
    houseSuffix: "भाव",
    lagnaNotes: "जन्म कुंडली क्षितिज आधार",
    retroNotes: "प्राकृतिक क्रूर ग्रह; वक्री",
    exaltedNotes: "उच्च गरिमा बल विन्यास",
    friendlyNotes: "मित्र राशि विन्यास"
  },
  te: {
    title: "గ్రహాల బలం & స్థితి వివరణ",
    subtitle: "వైదిక రేటింగ్ మరియు నిర్మాణ కాన్ఫిగరేషన్ కొలతలు",
    planet: "గ్రహం",
    dignity: "గౌరవం/స్థితి",
    functionalRole: "కార్యాత్మక పాత్ర",
    housePlacement: "స్థానము (భావము)",
    strength: "బలం",
    notes: "గమనికలు",
    lagna: "లగ్నము (ASCENDANT)",
    normal: "సాధారణం",
    retrograde: "వక్రం (Retrograde)",
    combust: "అస్తంగతం (Combust)",
    exalted: "ఉచ్ఛ (Exalted)",
    ownSign: "స్వక్షేత్రం (Own Sign)",
    friendlySign: "మిత్ర క్షేత్రం (Friendly)",
    neutralSign: "సమ క్షేత్రం (Neutral)",
    debilitated: "నీచ (Debilitated)",
    neechaBhanga: "నీచ భంగం ఉంది (Nīcha Bhaṅga)",
    neechaNoBhanga: "నీచ భంగం జరగలేదు",
    benefic: "శుభ గ్రహం (Benefic)",
    malefic: "పాప గ్రహం (Malefic)",
    upachaya: "పాప గ్రహం (ఉపచయ నియంత్రిత)",
    neutral: "తటస్థం (Neutral)",
    houseSuffix: "భావం",
    lagnaNotes: "జన్మ రాశి చక్ర లగ్న కేంద్రం",
    retroNotes: "సహజ పాపి; వక్రీభవనం",
    exaltedNotes: "ఉచ్ఛ స్థితి బలం లభించినది",
    friendlyNotes: "మిత్ర క్షేత్ర బలం"
  }
};

const PLANET_TRANSLATIONS: Record<string, Record<'en' | 'hi' | 'te', string>> = {
  "Sun": { en: "Sun", hi: "सूर्य (Sun)", te: "సూర్యుడు (Sun)" },
  "Moon": { en: "Moon", hi: "चन्द्र (Moon)", te: "చంద్రుడు (Moon)" },
  "Mars": { en: "Mars", hi: "मंगल (Mars)", te: "కుజుడు (Mars)" },
  "Mercury": { en: "Mercury", hi: "बुध (Mercury)", te: "బుధుడు (Mercury)" },
  "Jupiter": { en: "Jupiter", hi: "गुरु (Jupiter)", te: "గురుడు (Jupiter)" },
  "Venus": { en: "Venus", hi: "शुक्र (Venus)", te: "శుక్రుడు (Venus)" },
  "Saturn": { en: "Saturn", hi: "शनि (Saturn)", te: "శని (Saturn)" },
  "Rahu": { en: "Rahu", hi: "राहु (Rahu)", te: "రాహువు (Rahu)" },
  "Ketu": { en: "Ketu", hi: "केतु (Ketu)", te: "కేతువు (Ketu)" }
};

const SIGN_TRANSLATIONS: Record<string, Record<'en' | 'hi' | 'te', string>> = {
  "Aries": { en: "Aries", hi: "मेष", te: "మేషం" },
  "Taurus": { en: "Taurus", hi: "वृषभ", te: "వృషభం" },
  "Gemini": { en: "Gemini", hi: "मिथुन", te: "మిథునం" },
  "Cancer": { en: "Cancer", hi: "कर्क", te: "కర్కాటకం" },
  "Leo": { en: "Leo", hi: "सिंह", te: "సింహం" },
  "Virgo": { en: "Virgo", hi: "कन्या", te: "కన్య" },
  "Libra": { en: "Libra", hi: "तुला", te: "తుల" },
  "Scorpio": { en: "Scorpio", hi: "वृश्चिक", te: "వృశ్చికం" },
  "Sagittarius": { en: "Sagittarius", hi: "धनु", te: "ధనస్సు" },
  "Capricorn": { en: "Capricorn", hi: "मकर", te: "మకరం" },
  "Aquarius": { en: "Aquarius", hi: "कुंभ", te: "కుంభం" },
  "Pisces": { en: "Pisces", hi: "मीन", te: "మీనం" }
};

interface PlanetaryStrengthViewProps {
  horoscopeData: any;
  language?: 'en' | 'hi' | 'te';
}

export const PlanetaryStrengthView: React.FC<PlanetaryStrengthViewProps> = ({
  horoscopeData,
  language = 'en'
}) => {
  const l = TRANSLATIONS[language];

  const divisionalCharts = horoscopeData?.horoscope?.divisional_charts || {};
  const planetaryStates = horoscopeData?.horoscope?.planetary_states || {};
  const lagnaSign = divisionalCharts["D-1_rasi"]?.Ascendant?.sign || "Aries";

  const renderStrengthBar = (score: number) => {
    const percentage = Math.max(0, Math.min(100, (score / 5) * 100));
    const barColor = score >= 4.0 
      ? 'bg-ds-success-green' 
      : score >= 2.5 
      ? 'bg-ds-primary' 
      : 'bg-ds-error-crimson';
    
    return (
      <div className="flex items-center gap-2 w-full min-w-[120px]">
        <div className="flex-1 bg-ds-surface-variant h-2 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all ${barColor}`} 
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="font-mono text-xs font-bold text-ds-secondary whitespace-nowrap">
          {score.toFixed(1)}/5
        </span>
      </div>
    );
  };

  const getDignityText = (planet: string, sign: string) => {
    const isExalt = sign === EXALTATION_MAP[planet];
    const isOwn = (OWN_SIGN_MAP[planet] || []).includes(sign);
    const isDeb = sign === DEBILITATION_MAP[planet];
    const isFriendly = (FRIENDLY_SIGNS[planet] || []).includes(sign);

    const transSign = SIGN_TRANSLATIONS[sign]?.[language] || sign;

    if (isExalt) return `${transSign} (${l.exalted})`;
    if (isOwn) return `${transSign} (${l.ownSign})`;
    if (isDeb) return `${transSign} (${l.debilitated})`;
    if (isFriendly) return `${transSign} (${l.friendlySign})`;
    return `${transSign} (${l.neutralSign})`;
  };

  const getFuncRoleText = (planet: string) => {
    const role = getFunctionalRole(planet, lagnaSign);
    if (role === "Functional Benefic") return l.benefic;
    if (role === "Functional Malefic") return l.malefic;
    if (role === "Functional Malefic (Upachaya Modulated)") return l.upachaya;
    return l.neutral;
  };

  const getStatusText = (planet: string) => {
    const isRetro = (planetaryStates?.retrograde_planets || []).includes(planet);
    const isCombust = (planetaryStates?.combusted_planets || []).includes(planet);

    const statuses: string[] = [];
    if (isRetro) statuses.push(l.retrograde);
    if (isCombust) statuses.push(l.combust);
    if (statuses.length === 0) return l.normal;
    return statuses.join(", ");
  };

  const getPlanetNotes = (planet: string, sign: string) => {
    const isRetro = (planetaryStates?.retrograde_planets || []).includes(planet);
    const isDeb = sign === DEBILITATION_MAP[planet];
    const isExalt = sign === EXALTATION_MAP[planet];
    const isFriendly = (FRIENDLY_SIGNS[planet] || []).includes(sign);

    if (isDeb) {
      const hasBhanga = checkNeechaBhanga(planet, lagnaSign, divisionalCharts);
      return hasBhanga ? l.neechaBhanga : l.neechaNoBhanga;
    }
    if (isRetro) return l.retroNotes;
    if (isExalt) return l.exaltedNotes;
    if (isFriendly) return l.friendlyNotes;
    return "—";
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="border-l-4 border-ds-primary pl-4 py-3 bg-ds-surface-container rounded-r-2xl flex items-center justify-between shadow-xs">
        <div>
          <h3 className="text-lg font-serif font-bold text-ds-secondary tracking-wider uppercase flex items-center gap-2">
            <Star className="w-5 h-5 text-ds-primary" />
            {l.title}
          </h3>
          <p className="text-[10px] text-ds-on-surface-variant font-medium uppercase tracking-widest mt-0.5">
            {l.subtitle}
          </p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-ds-secondary/15 bg-ds-surface shadow-xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-ds-surface-container text-ds-secondary font-serif border-b border-ds-secondary/15 uppercase tracking-wider">
              <th className="p-4 font-bold">{l.planet}</th>
              <th className="p-4 font-bold">{l.dignity}</th>
              <th className="p-4 font-bold">{l.functionalRole}</th>
              <th className="p-4 font-bold">{l.housePlacement}</th>
              <th className="p-4 font-bold">{l.strength}</th>
              <th className="p-4 font-bold">{l.notes}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ds-secondary/15">
            {/* Lagna Row */}
            <tr className="hover:bg-ds-surface-container transition-colors border-l-4 border-ds-success-green">
              <td className="p-4 font-bold font-serif text-ds-secondary">
                {l.lagna}
              </td>
              <td className="p-4 font-mono font-bold text-ds-secondary">
                {SIGN_TRANSLATIONS[lagnaSign]?.[language] || lagnaSign}
              </td>
              <td className="p-4 font-mono text-ds-on-surface-variant font-bold">N/A</td>
              <td className="p-4 font-mono font-bold text-ds-secondary">1 {l.houseSuffix}</td>
              <td className="p-4 text-ds-success-green font-bold">{renderStrengthBar(4.0)}</td>
              <td className="p-4 text-ds-on-surface-variant text-[11px] font-medium">{l.lagnaNotes}</td>
            </tr>

            {/* Planet Rows */}
            {["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"].map((planet) => {
              const d1 = divisionalCharts["D-1_rasi"] || {};
              const pData = d1[planet] || { sign: "Aries" };
              const score = getPlanetaryStrength(planet, lagnaSign, divisionalCharts, planetaryStates);
              const signName = pData.sign;

              const ascIdx = SIGN_NAMES.indexOf(lagnaSign);
              const planetIdx = SIGN_NAMES.indexOf(signName);
              const house = ((planetIdx - ascIdx + 12) % 12) + 1;

              const strengthClass = score >= 4.0 
                ? "text-ds-success-green font-bold" 
                : score >= 2.5 
                ? "text-ds-primary font-bold" 
                : "text-ds-error-crimson font-bold";

              const borderClass = score >= 4.0 
                ? 'border-l-4 border-ds-success-green' 
                : score < 2.5 
                ? 'border-l-4 border-ds-error-crimson' 
                : 'border-l-4 border-ds-primary/20';

              return (
                <tr key={planet} className={`hover:bg-ds-surface-container transition-colors ${borderClass}`}>
                  <td className="p-4 font-bold font-serif text-ds-secondary">
                    {PLANET_TRANSLATIONS[planet]?.[language] || planet}
                  </td>
                  <td className="p-4 font-mono font-bold text-ds-secondary">
                    {getDignityText(planet, signName)}
                  </td>
                  <td className="p-4 font-mono text-xs font-bold text-ds-on-surface-variant">
                    {getFuncRoleText(planet)}
                  </td>
                  <td className="p-4 font-mono font-bold text-ds-secondary">
                    {house} {l.houseSuffix}
                  </td>
                  <td className={`p-4 ${strengthClass}`}>
                    {renderStrengthBar(score)}
                  </td>
                  <td className="p-4 text-[11px] text-ds-on-surface-variant font-medium">
                    {getPlanetNotes(planet, signName)}
                    {getStatusText(planet) !== l.normal && (
                      <span className="block text-[10px] text-ds-primary font-mono font-bold mt-0.5">
                        ({getStatusText(planet)})
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
