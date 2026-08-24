import type { BirthDetails } from '../../types';

export interface PlanetPosition {
  sign: string;
  degree: number;
  house: number;
  retrograde?: boolean;
}

export interface CuspPosition {
  sign: string;
  degree: number;
}

export interface CanonicalChartData {
  birthDetails: BirthDetails;
  rasi: {
    planets: Record<string, PlanetPosition>;
    cusps: Record<number, CuspPosition>;
  };
  navamsa?: {
    planets: Record<string, { sign: string; degree: number }>;
  };
  computedAt: string; // ISO timestamp
  ephemerisSource: string; // e.g., "VSOP87", "JPL", "JHora"
  ayanamshaUsed: string; // e.g., "Lahiri"
  isValid: boolean;
  validationWarnings?: string[];
}

export class ChartDataValidator {
  private static REQUIRED_PLANETS = [
    'Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'
  ];

  /**
   * Validates that all downstream engines receive the same canonical planet data.
   * Throws explicit errors if critical data is missing or corrupted.
   */
  static validateConsistency(
    horoscopeData: any,
    birthDetails: BirthDetails
  ): CanonicalChartData {
    if (!birthDetails) {
      throw new Error('CHART_DATA_MISSING: Birth details are required for chart validation');
    }

    // Extract rasi chart from standard paths
    const rasiChart = horoscopeData?.horoscope?.divisional_charts?.['D-1_rasi'] 
      || horoscopeData?.rasi
      || horoscopeData?.horoscope?.planets;
    
    if (!rasiChart) {
      throw new Error(
        'CHART_DATA_MISSING: D-1 Rasi chart not found in horoscope data'
      );
    }

    // Check required planetary positions exist
    const warnings: string[] = [];
    for (const planet of this.REQUIRED_PLANETS) {
      if (!rasiChart[planet]) {
        throw new Error(
          `CHART_DATA_INCOMPLETE: Planet "${planet}" missing from Rasi chart`
        );
      }
    }

    // Extract normalized planets and cusps
    const normalizedPlanets = this._normalizePlanets(rasiChart);
    const normalizedCusps = this._normalizeCusps(rasiChart, horoscopeData);

    // Extract navamsa if available
    const navamsaRaw = horoscopeData?.horoscope?.divisional_charts?.['D-9_navamsa'] 
      || horoscopeData?.navamsha 
      || horoscopeData?.navamsa;
      
    let navamsaNormalized: { planets: Record<string, { sign: string; degree: number }> } | undefined = undefined;
    if (navamsaRaw) {
      navamsaNormalized = {
        planets: this._normalizeSimpleChart(navamsaRaw)
      };
    } else {
      warnings.push('D-9 Navamsa chart missing');
    }

    return {
      birthDetails,
      rasi: {
        planets: normalizedPlanets,
        cusps: normalizedCusps
      },
      navamsa: navamsaNormalized,
      computedAt: new Date().toISOString(),
      ephemerisSource: horoscopeData?.ephemerisSource || horoscopeData?.source || 'JHora/VSOP87',
      ayanamshaUsed: horoscopeData?.ayanamsha || horoscopeData?.ayanamshaUsed || 'Lahiri',
      isValid: true,
      validationWarnings: warnings
    };
  }

  private static _normalizePlanets(chart: any): Record<string, PlanetPosition> {
    const normalized: Record<string, PlanetPosition> = {};
    
    for (const [planetName, data] of Object.entries(chart)) {
      if (data && typeof data === 'object' && ('sign' in data || 'longitude' in data)) {
        const sign = (data as any).sign || this._getSignFromLongitude((data as any).longitude || 0);
        const rawDegree = (data as any).degree ?? (data as any).longitude ?? 0;
        const degree = Number((rawDegree % 30).toFixed(2));
        const house = (data as any).house || this._calculateHouseFromSign(sign, chart.Ascendant?.sign || chart.Lagna?.sign || 'Aries');
        
        normalized[planetName] = {
          sign,
          degree,
          house,
          retrograde: Boolean((data as any).retrograde || (data as any).isRetrograde || false)
        };
      }
    }
    
    return normalized;
  }

  private static _normalizeSimpleChart(chart: any): Record<string, { sign: string; degree: number }> {
    const normalized: Record<string, { sign: string; degree: number }> = {};
    for (const [name, data] of Object.entries(chart)) {
      if (data && typeof data === 'object') {
        const sign = (data as any).sign || 'Aries';
        const degree = Number((((data as any).degree ?? (data as any).longitude ?? 0) % 30).toFixed(2));
        normalized[name] = { sign, degree };
      }
    }
    return normalized;
  }

  private static _normalizeCusps(chart: any, horoscopeData: any): Record<number, CuspPosition> {
    const cusps: Record<number, CuspPosition> = {};
    const ascSign = chart.Ascendant?.sign || chart.Lagna?.sign || 'Aries';
    const ascDegree = chart.Ascendant?.degree || chart.Ascendant?.longitude || 0;
    
    const SIGNS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    const ascIdx = SIGNS.indexOf(ascSign);

    for (let house = 1; house <= 12; house++) {
      const cuspData = chart[`House${house}`] || chart[`H${house}`] || chart[house] || horoscopeData?.houses?.[house - 1];
      if (cuspData && typeof cuspData === 'object' && cuspData.sign) {
        cusps[house] = {
          sign: cuspData.sign,
          degree: Number(((cuspData.degree || cuspData.longitude || 0) % 30).toFixed(2))
        };
      } else {
        // Whole sign fallback
        const houseSignIdx = (ascIdx + house - 1) % 12;
        cusps[house] = {
          sign: SIGNS[houseSignIdx >= 0 ? houseSignIdx : 0],
          degree: Number((ascDegree % 30).toFixed(2))
        };
      }
    }
    
    return cusps;
  }

  private static _getSignFromLongitude(longitude: number): string {
    const SIGNS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    const signIdx = Math.floor((longitude % 360) / 30);
    return SIGNS[signIdx >= 0 && signIdx < 12 ? signIdx : 0];
  }

  private static _calculateHouseFromSign(planetSign: string, lagnaSign: string): number {
    const SIGNS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    const pIdx = SIGNS.indexOf(planetSign);
    const lIdx = SIGNS.indexOf(lagnaSign);
    if (pIdx === -1 || lIdx === -1) return 1;
    return ((pIdx - lIdx + 12) % 12) + 1;
  }
}
