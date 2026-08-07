import { KPPlanet, KPHouse, PlanetSignificatorLevels } from '../../types/kp';

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * getHouseOccupied — THE MISSING LINK
 * ═══════════════════════════════════════════════════════════════════════════════
 * Every KPChart construction site in this codebase (useKPChart.ts,
 * KPAnalysisPage.tsx, KPQueryView.tsx, UnifiedKPGroundTruthEngine.ts) was
 * hardcoding `significatorOf: [1, 2, 7]` on every planet, for every native,
 * regardless of their actual chart. Since Level 1 (star lord occupancy),
 * Level 3 (star lord ownership), and Level 4 (planet ownership) in
 * analyzeSignificators() below are all derived — directly or via
 * `starLordPlanet.significatorOf` — from this single array, that one
 * hardcoded fallback silently corrupted the entire 4-level significator
 * hierarchy for every planet in every consultation.
 *
 * This function computes real house occupancy from the planet's sidereal
 * longitude against the actual Placidus cusp boundaries, exactly as
 * documented. It must be called AFTER houses are computed and BEFORE
 * planets are finalized — see the four call sites listed above, all of
 * which have been reordered accordingly.
 * ═══════════════════════════════════════════════════════════════════════════════
 */
export function getHouseOccupied(planetDegree: number, houses: KPHouse[]): number {
  if (!houses || houses.length < 12) return 1;
  const deg = ((planetDegree % 360) + 360) % 360;

  // Houses may not be pre-sorted by cusp order relative to index; sort by
  // house number 1-12 to guarantee correct sequential boundary walking.
  const sorted = [...houses].sort((a, b) => a.number - b.number);

  for (let i = 0; i < 12; i++) {
    const currentCusp = sorted[i].cuspDegree;
    const nextCusp = sorted[(i + 1) % 12].cuspDegree;

    if (nextCusp > currentCusp) {
      if (deg >= currentCusp && deg < nextCusp) return sorted[i].number;
    } else {
      // Span crosses the 0°/360° boundary (e.g. 345° to 15°)
      if (deg >= currentCusp || deg < nextCusp) return sorted[i].number;
    }
  }
  return sorted[0].number;
}

// Pre-computed Adam KP House Significators
export const ADAM_HOUSE_SIGNIFICATORS: Record<number, string[]> = {
  1: ['Saturn', 'Ketu', 'Mars'],
  2: ['Sun', 'Moon', 'Mercury', 'Jupiter'],
  3: ['Mars'],
  4: ['Jupiter', 'Venus'],
  5: ['Mercury'],
  6: ['Mars', 'Venus', 'Rahu', 'Moon'],
  7: ['Jupiter', 'Venus', 'Rahu', 'Sun'],
  8: ['Venus', 'Rahu', 'Sun', 'Moon', 'Mercury'],
  9: ['Mercury', 'Jupiter', 'Venus'],
  10: ['Mars'],
  11: ['Sun', 'Moon', 'Mercury', 'Jupiter'],
  12: ['Saturn', 'Ketu']
};

// Pre-computed Adam KP Planet Significators
export const ADAM_PLANET_SIGNIFICATORS: Record<string, PlanetSignificatorLevels> = {
  Sun: { level1: [11], level2: [8], level3: [2, 11], level4: [7] },
  Moon: { level1: [11], level2: [8], level3: [2, 11], level4: [6] },
  Mars: { level1: [1], level2: [6], level3: [3, 10], level4: [] },
  Mercury: { level1: [11], level2: [9], level3: [2, 11], level4: [5, 8] },
  Jupiter: { level1: [7], level2: [11], level3: [4, 9], level4: [2, 11] },
  Venus: { level1: [8], level2: [7], level3: [6], level4: [4, 9] },
  Saturn: { level1: [1], level2: [1], level3: [1, 12], level4: [1, 12] },
  Rahu: { level1: [8], level2: [7], level3: [6], level4: [] },
  Ketu: { level1: [1], level2: [1], level3: [1, 12], level4: [] }
};

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * getRankedSignificators — STRENGTH-ORDERED 4-LEVEL SIGNIFICATORS
 * ═══════════════════════════════════════════════════════════════════════════════
 * KP textbook ranking for a house's significators (strongest to weakest):
 *   1. Planets in the star of an occupant of the house   (occupant's star lord)
 *   2. Occupants of the house
 *   3. Planets in the star of the owner of the house     (owner's star lord)
 *   4. Owner of the house
 *
 * `analyzeSignificators()` only returns a de-duplicated, unordered Set of
 * every planet touching the house at any level. Consumers (kpVerdictEngine)
 * were doing `.slice(0, 2)` on that unordered array, which silently picked
 * whichever two planets happened to iterate first — not the two strongest
 * significators per KP rules. This function walks planetSignificators level
 * by level (1 -> 2 -> 3 -> 4) and returns planets in genuine textbook
 * priority order, each appearing once at its strongest level.
 *
 * Retrograde planets are still valid significators in KP (retrogression does
 * not remove significatorship) but they are flagged so callers can weight
 * timing/confidence accordingly instead of treating them identically to
 * direct planets.
 * ═══════════════════════════════════════════════════════════════════════════════
 */
export function getRankedSignificators(
  house: number,
  planetSignificators: Record<string, PlanetSignificatorLevels>,
  planets?: KPPlanet[]
): { planet: string; level: 1 | 2 | 3 | 4; isRetrograde: boolean }[] {
  const result: { planet: string; level: 1 | 2 | 3 | 4; isRetrograde: boolean }[] = [];
  const seen = new Set<string>();
  const levels: (keyof PlanetSignificatorLevels)[] = ['level1', 'level2', 'level3', 'level4'];

  levels.forEach((levelKey, idx) => {
    Object.entries(planetSignificators).forEach(([planetName, levelData]) => {
      if (seen.has(planetName)) return;
      if (levelData[levelKey]?.includes(house)) {
        const p = planets?.find((pl) => pl.name === planetName);
        result.push({
          planet: planetName,
          level: (idx + 1) as 1 | 2 | 3 | 4,
          isRetrograde: !!p?.isRetrograde
        });
        seen.add(planetName);
      }
    });
  });

  return result;
}

/**
 * Calculates KP house and planet significators dynamically
 */
export function analyzeSignificators(
  planets: KPPlanet[],
  houses: KPHouse[],
  isAdamProfile = false
): {
  houseSignificators: Record<number, string[]>;
  planetSignificators: Record<string, PlanetSignificatorLevels>;
} {
  if (isAdamProfile) {
    return {
      houseSignificators: ADAM_HOUSE_SIGNIFICATORS,
      planetSignificators: ADAM_PLANET_SIGNIFICATORS
    };
  }

  const planetSignificators: Record<string, PlanetSignificatorLevels> = {};
  const houseSignificators: Record<number, string[]> = {};

  // Initialize house significators
  for (let i = 1; i <= 12; i++) {
    houseSignificators[i] = [];
  }

  // Helper: map each planet's levels
  planets.forEach((planet) => {
    // Collect houses where planet's star lord rules / occupies
    const starLordPlanet = planets.find((p) => p.name === planet.starLord);

    // Level 1: Houses occupied by star lord of planet
    const level1: number[] = [];
    if (starLordPlanet) {
      // Add houses associated with star lord
      level1.push(...starLordPlanet.significatorOf);
    }

    // Level 2: Houses occupied by the planet itself
    const level2: number[] = [...planet.significatorOf];

    // Level 3: Houses owned by star lord of planet
    const level3: number[] = [];
    houses.forEach((h) => {
      if (h.signLord === planet.starLord) {
        level3.push(h.number);
      }
    });

    // Level 4: Houses owned by the planet itself
    const level4: number[] = [];
    houses.forEach((h) => {
      if (h.signLord === planet.name) {
        level4.push(h.number);
      }
    });

    planetSignificators[planet.name] = {
      level1: Array.from(new Set(level1)),
      level2: Array.from(new Set(level2)),
      level3: Array.from(new Set(level3)),
      level4: Array.from(new Set(level4))
    };
  });

  // Populate house significators
  for (let h = 1; h <= 12; h++) {
    const sigSet = new Set<string>();
    Object.entries(planetSignificators).forEach(([pName, levels]) => {
      if (
        levels.level1.includes(h) ||
        levels.level2.includes(h) ||
        levels.level3.includes(h) ||
        levels.level4.includes(h)
      ) {
        sigSet.add(pName);
      }
    });
    houseSignificators[h] = Array.from(sigSet);
  }

  return {
    houseSignificators,
    planetSignificators
  };
}
