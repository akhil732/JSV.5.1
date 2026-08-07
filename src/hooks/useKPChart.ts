import { useMemo } from 'react';
import { KPChart } from '../types/kp';
import { calculatePlacidusCusps } from '../lib/kp/placidusCalculator';
import { analyzeSignificators, getHouseOccupied } from '../lib/kp/significatorAnalyzer';
import { calculateRulingPlanets } from '../lib/kp/rulingPlanetsCalculator';
import { calculateVimshottariDashaFromMoon } from '../lib/engines/DashaEngine';
import { calculateKPSubLord, formatDegrees } from '../lib/kp/subLordMapper';

export const useKPChart = (person: any, chartData: any): KPChart | null => {
  return useMemo(() => {
    if (!person || !chartData) return null;

    try {
      // 1. Reconstruct Planet Longitudes
      const planetLongitudes: Record<string, number> = {};
      const d1 = chartData?.horoscope?.divisional_charts?.['D-1_rasi'] || chartData?.rasi || {};
      const signMap: Record<string, number> = {
        Aries: 0, Taurus: 1, Gemini: 2, Cancer: 3, Leo: 4, Virgo: 5,
        Libra: 6, Scorpio: 7, Sagittarius: 8, Capricorn: 9, Aquarius: 10, Pisces: 11
      };
      Object.keys(d1).forEach((key) => {
        const item = d1[key];
        if (item && item.sign && typeof item.longitude === 'number') {
          const sIdx = signMap[item.sign] ?? 0;
          const absDeg = ((sIdx * 30 + item.longitude) % 360 + 360) % 360;
          const stdKey = key === 'Ascendant' ? 'Lagna' : key;
          planetLongitudes[stdKey] = absDeg;
        }
      });
      const moonDegree = planetLongitudes.Moon ?? 0;

      // 2. Houses (Calculate Placidus House Cusps FIRST)
      const ascDegree = planetLongitudes.Lagna ?? 0;
      const houses = calculatePlacidusCusps(ascDegree, person.latitude, person.date, person.time);

      // 3. Planets (Determine house occupied from house cusps)
      const planetNames = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
      const planets = planetNames.map((pName) => {
        const deg = planetLongitudes[pName] ?? 180;
        const subLordChain = calculateKPSubLord(deg);
        const occupiedHouse = getHouseOccupied(deg, houses);
        return {
          name: pName,
          sign: subLordChain.sign,
          degree: deg,
          formattedDegree: formatDegrees(deg),
          signLord: subLordChain.signLord,
          starLord: subLordChain.starLord,
          subLord: subLordChain.subLord,
          subSubLord: subLordChain.subSubLord,
          significatorOf: [occupiedHouse]
        };
      });

      // 4. Dynamic 4-Level Significators
      const { houseSignificators, planetSignificators } = analyzeSignificators(planets, houses);

      // 4. Ruling Planets
      const rulingPlanets = calculateRulingPlanets(undefined, undefined, person.latitude, person.longitude);

      // 5. Dasha
      const calculatedDasha = calculateVimshottariDashaFromMoon(moonDegree, `${person.date} ${person.time}`);

      return {
        birthData: person,
        planets,
        houses,
        rulingPlanets,
        currentDasha: {
          mahadasha: calculatedDasha.mahadasha,
          antardasha: calculatedDasha.antardasha,
          pratyantardasha: calculatedDasha.pratyantardasha,
          mahadashaEnd: calculatedDasha.mahadashaEnd,
          antardashaEnd: calculatedDasha.antardashaEnd
        },
        houseSignificators,
        planetSignificators
      };
    } catch (e) {
      console.error('Failed to construct KP Chart:', e);
      return null;
    }
  }, [person, chartData]);
};
