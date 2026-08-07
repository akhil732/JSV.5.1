import type { PlanetInfo } from '../types/chart';

/**
 * House position mapping for East Indian chart
 * Grid coordinates: (row, col)
 */
export const EAST_INDIAN_GRID = {
  1: { row: 0, col: 1, name: 'Lagna (1st House)' },
  2: { row: 0, col: 0, name: '2nd House' },
  3: { row: 1, col: 0, name: '3rd House' },
  4: { row: 2, col: 0, name: '4th House' },
  5: { row: 2, col: 1, name: '5th House' },
  6: { row: 3, col: 0, name: '6th House' },
  7: { row: 3, col: 1, name: '7th House' },
  8: { row: 3, col: 2, name: '8th House' },
  9: { row: 3, col: 3, name: '9th House' },
  10: { row: 2, col: 2, name: '10th House' },
  11: { row: 1, col: 2, name: '11th House' },
  12: { row: 0, col: 2, name: '12th House' }
} as const;

/**
 * Group planets by house number
 */
export const groupPlanetsByHouse = (planets: PlanetInfo[]): Map<number, PlanetInfo[]> => {
  const grouped = new Map<number, PlanetInfo[]>();
  
  for (let i = 1; i <= 12; i++) {
    grouped.set(i, []);
  }
  
  if (Array.isArray(planets)) {
    planets.forEach(planet => {
      const house = planet.house || 1;
      const housePlanets = grouped.get(house) || [];
      housePlanets.push(planet);
      grouped.set(house, housePlanets);
    });
  }
  
  return grouped;
};

/**
 * Sort planets within house (benefics first, then luminaries, others, malefics)
 */
export const sortPlanetsInHouse = (planets: PlanetInfo[]): PlanetInfo[] => {
  const beneficOrder = ['Ju', 'Ve'];
  const luminaryOrder = ['Su', 'Mo'];
  const maleficOrder = ['Ma', 'Sa', 'Ra'];
  const otherOrder = ['Me', 'Ke'];

  return [...planets].sort((a, b) => {
    const getOrder = (abbr: string) => {
      if (beneficOrder.includes(abbr)) return 0;
      if (luminaryOrder.includes(abbr)) return 1;
      if (otherOrder.includes(abbr)) return 2;
      if (maleficOrder.includes(abbr)) return 3;
      return 4;
    };

    return getOrder(a.abbr) - getOrder(b.abbr);
  });
};

/**
 * Get signification of each house
 */
export const HOUSE_SIGNIFICATIONS = {
  1: 'Self, Appearance, Vitality',
  2: 'Wealth, Family, Food',
  3: 'Courage, Siblings, Communication',
  4: 'Property, Home, Mother, Comfort',
  5: 'Children, Creativity, Romance',
  6: 'Health, Enemies, Debts, Service',
  7: 'Marriage, Business Partner, Public',
  8: 'Death, Longevity, Hidden Matters',
  9: 'Luck, Religion, Guru, Travel',
  10: 'Career, Status, Authority, Father',
  11: 'Gains, Friendship, Community',
  12: 'Losses, Expenses, Isolation, Moksha'
} as const;

/**
 * Check if house is empty of planets
 */
export const isHouseEmpty = (housePlanets: PlanetInfo[]): boolean => {
  return !housePlanets || housePlanets.length === 0;
};

/**
 * Get house lord (determined by sign in that house)
 */
export const getHouseLord = (signName: string): string => {
  const lordMap: Record<string, string> = {
    'Aries': 'Ma',
    'Taurus': 'Ve',
    'Gemini': 'Me',
    'Cancer': 'Mo',
    'Leo': 'Su',
    'Virgo': 'Me',
    'Libra': 'Ve',
    'Scorpio': 'Ma',
    'Sagittarius': 'Ju',
    'Capricorn': 'Sa',
    'Aquarius': 'Sa',
    'Pisces': 'Ju'
  };
  
  return lordMap[signName] || 'Unknown';
};
