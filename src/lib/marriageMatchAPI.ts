import { MarriageMatchRequest, MarriageMatchResult } from '../types/marriageMatch';
import { calculateManglikDosha } from './manglikDosha';
import { calculateYoniKuta } from './yoniKutaCalculator';
import { calculateBhakoot } from './bhakootCalculator';

const API_URL = 'https://jagannatha-hora-359167915530.europe-west1.run.app/marriage-match';
const TIMEOUT_MS = 10000;

export async function checkMarriageMatch(request: MarriageMatchRequest): Promise<MarriageMatchResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const matchPayload = {
      boy_birth_details: request.boy,
      girl_birth_details: request.girl
    };

    const [matchRes, boyRes, girlRes] = await Promise.all([
      fetch(`/api/jhora-proxy/marriage-match`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(matchPayload),
        signal: controller.signal,
      }),
      fetch(`/api/jhora-proxy/horoscope`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request.boy),
        signal: controller.signal,
      }),
      fetch(`/api/jhora-proxy/horoscope`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request.girl),
        signal: controller.signal,
      })
    ]);

    clearTimeout(timeoutId);

    if (!matchRes.ok || !boyRes.ok || !girlRes.ok) {
      throw new Error(`API Error: ${matchRes.status} / ${boyRes.status} / ${girlRes.status}`);
    }

    const data = await matchRes.json();
    const boyHoroscope = await boyRes.json();
    const girlHoroscope = await girlRes.json();

    if (!data.north_indian || !data.north_indian.eight_koota_porutham) {
      throw new Error('Invalid API response format');
    }

    // Generate specific rules: Rasi, Lagna, Yoni
    const SIGNS = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
    
    function getHouseRelationship(idx1: number, idx2: number) {
      if (idx1 === idx2) return 'same sign';
      if (idx1 === -1 || idx2 === -1) return 'Unknown';
      const dist1 = ((idx2 - idx1 + 12) % 12) + 1;
      const dist2 = ((idx1 - idx2 + 12) % 12) + 1;
      const min = Math.min(dist1, dist2);
      const max = Math.max(dist1, dist2);
      
      const getOrdinal = (n: number) => {
        if (n === 1) return '1st';
        if (n === 2) return '2nd';
        if (n === 3) return '3rd';
        return `${n}th`;
      };
      return `${getOrdinal(min)}/${getOrdinal(max)} houses from each other`;
    }

    function isHouseFavourable(idx1: number, idx2: number) {
      if (idx1 === -1 || idx2 === -1) return false;
      const dist1 = ((idx2 - idx1 + 12) % 12) + 1;
      const dist2 = ((idx1 - idx2 + 12) % 12) + 1;
      const min = Math.min(dist1, dist2);
      const max = Math.max(dist1, dist2);
      if ((min === 2 && max === 12) || (min === 6 && max === 8)) return false;
      return true;
    }

    function getHouse(planetSign: string, ascSign: string) {
        const pIdx = SIGNS.indexOf(planetSign);
        const aIdx = SIGNS.indexOf(ascSign);
        if (pIdx === -1 || aIdx === -1) return -1;
        return ((pIdx - aIdx + 12) % 12) + 1;
    }

    function isManglik(horoscope: any) {
        const res = calculateManglikDosha(horoscope);
        return {
            present: res.status === "PRESENT",
            status: res.status,
            severity: res.severity,
            details: res.reason
        };
    }

    const SIGNS_MAP: Record<string, string> = {
      "Mesham": "Aries",
      "Rishabam": "Taurus",
      "Midhunam": "Gemini",
      "Kadagam": "Cancer",
      "Simmam": "Leo",
      "Kanni": "Virgo",
      "Thulaam": "Libra",
      "Viruchigam": "Scorpio",
      "Dhanusu": "Sagittarius",
      "Magaram": "Capricorn",
      "Kumbam": "Aquarius",
      "Meenam": "Pisces"
    };

    function translateRasi(name: string): string {
      return SIGNS_MAP[name] || name;
    }

    const boyRasiNum = data.boy?.raasi_number || -1;
    const girlRasiNum = data.girl?.raasi_number || -1;
    const boyRasiEn = boyRasiNum !== -1 ? SIGNS[boyRasiNum - 1] : 'Unknown';
    const girlRasiEn = girlRasiNum !== -1 ? SIGNS[girlRasiNum - 1] : 'Unknown';
    
    const boyLagnaEn = boyHoroscope.horoscope?.divisional_charts?.['D-1_rasi']?.Ascendant?.sign || boyHoroscope.divisional_charts?.['D-1_rasi']?.Ascendant?.sign || "Unknown";
    const girlLagnaEn = girlHoroscope.horoscope?.divisional_charts?.['D-1_rasi']?.Ascendant?.sign || girlHoroscope.divisional_charts?.['D-1_rasi']?.Ascendant?.sign || "Unknown";
    const boyLagnaNum = SIGNS.indexOf(boyLagnaEn) + 1 || -1;
    const girlLagnaNum = SIGNS.indexOf(girlLagnaEn) + 1 || -1;

    const bhakootRes = calculateBhakoot(
      boyRasiEn,
      girlRasiEn,
      boyHoroscope.horoscope || boyHoroscope,
      girlHoroscope.horoscope || girlHoroscope
    );

    const rasiRule = {
      name: 'Rasi relationship (Bhakoot - 2-12, 6-8, 5-9)',
      boyValue: bhakootRes.score,
      girlValue: 0,
      max: 7,
      details: bhakootRes.details,
      isUnfavourable: bhakootRes.isUnfavourable,
      compatibility: bhakootRes.compatibility,
      cancellationReason: bhakootRes.cancellationReason
    };

    const lagnaRule = {
      name: 'Ascendant relationship',
      boyValue: isHouseFavourable(boyLagnaNum, girlLagnaNum) ? 1 : 0,
      girlValue: 0,
      max: 1,
      details: `${boyLagnaEn} ↔ ${girlLagnaEn}  ·  ${getHouseRelationship(boyLagnaNum, girlLagnaNum)}`
    };

    const eightKoota = data.north_indian.eight_koota_porutham;
    const yKuta = eightKoota['yoni_porutham'] || {};
    const boyYoni = yKuta.boy_yoni || 'Unknown';
    const girlYoni = yKuta.girl_yoni || 'Unknown';

    const yKutaCalc = calculateYoniKuta(boyYoni, girlYoni);
    let yoniDetails = `${data.boy?.nakshatra_name || ''} (${boyYoni}) ↔ ${data.girl?.nakshatra_name || ''} (${girlYoni})  ·  ${yKutaCalc.compatibility}`;

    const yoniRule = {
      name: 'Yoni Kuta (Sexual Compatibility)',
      boyValue: yKutaCalc.score,
      girlValue: 0,
      max: 4,
      details: yoniDetails,
      isUnfavourable: yKutaCalc.isUnfavourable,
      compatibility: yKutaCalc.compatibility
    };

    const gKuta = eightKoota['gana_porutham'] || {};
    const boyGana = gKuta.boy_gana || 'Unknown';
    const girlGana = gKuta.girl_gana || 'Unknown';
    const ganaScore = typeof gKuta.score === 'number' ? gKuta.score : 0;
    const ganaMax = typeof gKuta.max_score === 'number' ? gKuta.max_score : 6;
    const isGanaUnfavourable = ganaScore === 0;

    const ganaRule = {
      name: 'Gana Kuta (Temperament Compatibility)',
      boyValue: ganaScore,
      girlValue: 0,
      max: ganaMax,
      details: `Boy Gana: ${boyGana} ↔ Girl Gana: ${girlGana}  ·  ${gKuta.quality || 'Standard'}`,
      isUnfavourable: isGanaUnfavourable,
      compatibility: gKuta.quality || 'Standard'
    };

    const boyManglingRes = calculateManglikDosha(boyHoroscope.horoscope || boyHoroscope);
    const girlManglingRes = calculateManglikDosha(girlHoroscope.horoscope || girlHoroscope);
    const boyHasDosha = boyManglingRes.status === "PRESENT";
    const girlHasDosha = girlManglingRes.status === "PRESENT";
    const manglikCompatible = (boyHasDosha && girlHasDosha) || (!boyHasDosha && !girlHasDosha);

    const manglikRule = {
      name: 'Manglik Dosha Compatibility',
      boyValue: manglikCompatible ? 1 : 0,
      girlValue: 0,
      max: 1,
      details: `Boy: ${boyManglingRes.status} ↔ Girl: ${girlManglingRes.status}  ·  ${manglikCompatible ? 'Compatible (Cancels or Matches)' : 'Dosha Mismatch (One has Dosha)'}`
    };

    const kutas = [rasiRule, lagnaRule, yoniRule, ganaRule, manglikRule];

    const totalScore = typeof data.north_indian.overall_compatibility.total_score === 'number' ? data.north_indian.overall_compatibility.total_score : 18;

    const result: MarriageMatchResult = {
      boyHoroscope: boyHoroscope.horoscope || boyHoroscope,
      girlHoroscope: girlHoroscope.horoscope || girlHoroscope,
      boyInfo: {
        nakshatra: data.boy?.nakshatra_name || "Unknown",
        rasi: translateRasi(data.boy?.raasi_name || "Unknown"),
        lagna: translateRasi(boyHoroscope.horoscope?.divisional_charts?.['D-1_rasi']?.Ascendant?.sign || boyHoroscope.divisional_charts?.['D-1_rasi']?.Ascendant?.sign || "Unknown"),
      },
      girlInfo: {
        nakshatra: data.girl?.nakshatra_name || "Unknown",
        rasi: translateRasi(data.girl?.raasi_name || "Unknown"),
        lagna: translateRasi(girlHoroscope.horoscope?.divisional_charts?.['D-1_rasi']?.Ascendant?.sign || girlHoroscope.divisional_charts?.['D-1_rasi']?.Ascendant?.sign || "Unknown"),
      },
      totalScore: totalScore,
      maxScore: typeof data.north_indian.overall_compatibility.max_possible_score === 'number' ? data.north_indian.overall_compatibility.max_possible_score : 36,
      kutas,
      manglik: {
        boy: isManglik(boyHoroscope.horoscope || boyHoroscope),
        girl: isManglik(girlHoroscope.horoscope || girlHoroscope),
      },
    };

    return result;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('API request timeout (10s)');
    }
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network request failed');
    }
    if (error.message && error.message.startsWith('API Error:') || error.message === 'Invalid API response format') {
      throw error;
    }
    throw new Error(error.message || 'Network request failed');
  }
}
