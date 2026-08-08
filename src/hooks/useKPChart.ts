import { useMemo } from 'react';
import { KPChart, KPPlanet } from '../types/kp';
import { calculatePlacidusCusps } from '../lib/kp/placidusCalculator';
import { analyzeSignificators, getHouseOccupied } from '../lib/kp/significatorAnalyzer';
import { calculateRulingPlanets } from '../lib/kp/rulingPlanetsCalculator';
import { calculateVimshottariDashaFromMoon, toKPChartDashaInfo } from '../lib/engines/DashaEngine';
import { calculateKPSubLord, formatDegrees, calculateNavamsaSign } from '../lib/kp/subLordMapper';

const SIGN_LORD_BY_NAME: Record<string, string> = {
  Aries: 'Mars', Taurus: 'Venus', Gemini: 'Mercury', Cancer: 'Moon',
  Leo: 'Sun', Virgo: 'Mercury', Libra: 'Venus', Scorpio: 'Mars',
  Sagittarius: 'Jupiter', Capricorn: 'Saturn', Aquarius: 'Saturn', Pisces: 'Jupiter'
};

export const useKPChart = (person: any, chartData: any): KPChart | null => {
  return useMemo(() => {
    if (!person || !chartData) return null;

    try {
      // 1. Reconstruct Planet Data
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

      // Defense-in-depth: If no planet longitudes are found, refuse to build a fabricated chart
      if (Object.keys(planetLongitudes).length === 0) {
        console.error('[useKPChart] No planet longitude data found in chartData — refusing to build a fabricated chart.');
        return null;
      }

      const moonDegree = planetLongitudes.Moon ?? 0;

      // Houses MUST be computed before planets so real house-occupancy
      // (significatorOf) can be calculated below — previously this ran
      // after planets were built, forcing a hardcoded [1,2,7] fallback.
      const ascDegree = planetLongitudes.Lagna ?? 0;
      const houses = calculatePlacidusCusps(ascDegree, person.latitude, person.date, person.time);

      // Real retrograde status from JHora's actual planetary_states, not
      // left undefined (which was the previous behavior — isRetrograde was
      // never set here at all, so every retrograde-aware check downstream
      // in kpVerdictEngine.ts silently saw every planet as direct). Rahu/
      // Ketu are mean lunar nodes and are always retrograde by definition.
      const realRetrogradeSet = new Set<string>(
        (chartData?.horoscope?.planetary_states?.retrograde_planets || []) as string[]
      );

      const planetNames = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
      const planets: KPPlanet[] = planetNames.map((pName) => {
        const deg = planetLongitudes[pName] ?? 180;
        const subLordChain = calculateKPSubLord(deg);
        return {
          name: pName,
          sign: subLordChain.sign,
          degree: deg,
          formattedDegree: formatDegrees(deg),
          signLord: subLordChain.signLord,
          starLord: subLordChain.starLord,
          subLord: subLordChain.subLord,
          subSubLord: subLordChain.subSubLord,
          isRetrograde: pName === 'Rahu' || pName === 'Ketu' || realRetrogradeSet.has(pName),
          significatorOf: [getHouseOccupied(deg, houses)]
        };
      });

      // D-9 (Navamsa) extraction, mirroring the D-1 pattern above. Only
      // sign/dispositor is meaningful for the Vedic cross-check in
      // kpVerdictEngine.ts — a D-9 position doesn't have its own KP
      // sub-lord chain in the textbook sense, so we don't fabricate one.
      const d9 = chartData?.horoscope?.divisional_charts?.['D-9_navamsa']
        || chartData?.horoscope?.divisional_charts?.['D9']
        || chartData?.divisional_charts?.['D-9_navamsa']
        || chartData?.divisional_charts?.['D9'];
      let navamsaPlanets: KPPlanet[] | undefined;
      if (d9) {
        navamsaPlanets = planetNames
          .map((pName) => {
            const item = d9[pName] || d9[pName.toLowerCase()] || d9[pName.toUpperCase()];
            if (!item || !item.sign) return null;
            const signLord = SIGN_LORD_BY_NAME[item.sign] || '';
            const np: KPPlanet = {
              name: pName,
              sign: item.sign,
              degree: typeof item.longitude === 'number' ? item.longitude : 0,
              formattedDegree: typeof item.longitude === 'number' ? formatDegrees(item.longitude) : '',
              signLord,
              starLord: signLord,
              subLord: signLord,
              subSubLord: signLord,
              significatorOf: []
            };
            return np;
          })
          .filter((p): p is KPPlanet => p !== null);
      }

      // Mathematical D-9 fallback from D-1 longitudes if D-9 chart was omitted in API/cache
      if (!navamsaPlanets || navamsaPlanets.length === 0) {
        navamsaPlanets = planetNames.map((pName) => {
          const deg = planetLongitudes[pName] ?? 0;
          const navSign = calculateNavamsaSign(deg);
          const signLord = SIGN_LORD_BY_NAME[navSign] || '';
          return {
            name: pName,
            sign: navSign,
            degree: deg % 30,
            formattedDegree: formatDegrees(deg % 30),
            signLord,
            starLord: signLord,
            subLord: signLord,
            subSubLord: signLord,
            significatorOf: []
          };
        });
      }

      // 3. Significators
      const { houseSignificators, planetSignificators } = analyzeSignificators(planets, houses, false);

      // 4. Ruling Planets
      const rulingPlanets = calculateRulingPlanets(undefined, undefined, person.latitude, person.longitude);

      // 5. Dasha
      const calculatedDasha = calculateVimshottariDashaFromMoon(moonDegree, `${person.date} ${person.time}`);

      return {
        birthData: person,
        planets,
        houses,
        rulingPlanets,
        navamsaPlanets,
        currentDasha: toKPChartDashaInfo(calculatedDasha),
        houseSignificators,
        planetSignificators
      };
    } catch (e) {
      console.error('Failed to construct KP Chart:', e);
      return null;
    }
  }, [person, chartData]);
};