import { KPPlanet, KPHouse, PlanetSignificatorLevels } from '../../types/kp';

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
 * Determines which house (1 to 12) a planet occupies based on Placidus / Equal house cusps.
 */
export function getHouseOccupied(planetDegree: number, houses: KPHouse[]): number {
  if (!houses || houses.length < 12) return 1;

  const deg = ((planetDegree % 360) + 360) % 360;

  for (let i = 0; i < 12; i++) {
    const currentCusp = houses[i].cuspDegree;
    const nextCusp = houses[(i + 1) % 12].cuspDegree;

    if (nextCusp > currentCusp) {
      if (deg >= currentCusp && deg < nextCusp) {
        return houses[i].number;
      }
    } else {
      // Span crosses 0° boundary (e.g. 345° to 15°)
      if (deg >= currentCusp || deg < nextCusp) {
        return houses[i].number;
      }
    }
  }

  return 1;
}

/**
 * Calculates KP house and planet significators dynamically
 */
export function analyzeSignificators(
  planets: KPPlanet[],
  houses: KPHouse[],
  _isAdamProfile = false
): {
  houseSignificators: Record<number, string[]>;
  planetSignificators: Record<string, PlanetSignificatorLevels>;
} {
  // If no planets provided, fallback to pre-computed static sets
  if (!planets || planets.length === 0) {
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

  // Map each planet's 4 levels
  planets.forEach((planet) => {
    // Find star lord planet object
    const starLordPlanet = planets.find((p) => p.name === planet.starLord);

    // Level 1: Houses occupied by star lord of planet
    const level1: number[] = starLordPlanet ? [...(starLordPlanet.significatorOf || [])] : [];

    // Level 2: Houses occupied by the planet itself
    const level2: number[] = [...(planet.significatorOf || [])];

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
      level1: Array.from(new Set(level1)).sort((a, b) => a - b),
      level2: Array.from(new Set(level2)).sort((a, b) => a - b),
      level3: Array.from(new Set(level3)).sort((a, b) => a - b),
      level4: Array.from(new Set(level4)).sort((a, b) => a - b)
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
