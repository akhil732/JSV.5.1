import { describe, test, expect } from 'vitest';
import { generateKPVerdict, KPVerdictEngine } from './kpVerdictEngine';
import { KPChart, KPPlanet, KPHouse } from '../../types/kp';

/**
 * Minimal but structurally-complete fixture builder. Every field the
 * verdict engine reads is populated so validateChartForVerdict() produces
 * zero warnings unless a test deliberately strips a field.
 */
function makePlanet(overrides: Partial<KPPlanet> & { name: string }): KPPlanet {
  return {
    sign: 'Aries',
    degree: 10,
    formattedDegree: "10° 00' 00\"",
    signLord: 'Mars',
    starLord: 'Ketu',
    subLord: 'Venus',
    subSubLord: 'Sun',
    isRetrograde: false,
    significatorOf: [],
    ...overrides
  };
}

function makeHouse(overrides: Partial<KPHouse> & { number: number }): KPHouse {
  return {
    sign: 'Aries',
    formattedDegree: "0° 00' 00\"",
    signLord: 'Mars',
    starLord: 'Ketu',
    subLord: 'Venus',
    subSubLord: 'Sun',
    cuspDegree: (overrides.number - 1) * 30,
    ...overrides
  };
}

const PLANET_NAMES = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];

function baseChart(): KPChart {
  const houses: KPHouse[] = Array.from({ length: 12 }, (_, i) => makeHouse({ number: i + 1 }));
  const planets: KPPlanet[] = PLANET_NAMES.map((name) => makePlanet({ name }));

  return {
    birthData: {
      name: 'Test Native', gender: 'Male', date: '1990-01-01', time: '12:00',
      place: 'Test City', latitude: 0, longitude: 0, timezone: 5.5
    },
    planets,
    houses,
    rulingPlanets: {
      lagnaSign: 'Aries', lagnaSignLord: 'Mars', lagnaStarLord: 'Ketu', lagnaSubLord: 'Venus', lagnaSubSubLord: 'Sun',
      moonSign: 'Cancer', moonSignLord: 'Moon', moonStarLord: 'Rahu', moonSubLord: 'Jupiter', moonSubSubLord: 'Mercury',
      dayLord: 'Sun', timestamp: '1990-01-01T12:00:00Z'
    },
    currentDasha: { mahadasha: 'Jupiter', antardasha: 'Venus', antardashaEnd: '2028-01-01' },
    houseSignificators: { 7: ['Jupiter', 'Venus'] },
    planetSignificators: {
      Jupiter: { level1: [7], level2: [11], level3: [4, 9], level4: [2, 11] },
      Venus: { level1: [2, 7], level2: [7], level3: [6], level4: [4, 9] }
    }
  };
}

describe('generateKPVerdict — chart validation', () => {
  test('throws when houses are missing/incomplete instead of silently defaulting', () => {
    const chart = baseChart();
    chart.houses = chart.houses.slice(0, 5);
    expect(() => generateKPVerdict({ question: 'q', topic: 'MARRIAGE', relevantHouse: 7 }, chart)).toThrow();
  });

  test('throws when planets are missing instead of silently defaulting', () => {
    const chart = baseChart();
    chart.planets = [];
    expect(() => generateKPVerdict({ question: 'q', topic: 'MARRIAGE', relevantHouse: 7 }, chart)).toThrow();
  });

  test('surfaces a dataQualityWarnings entry (not a silent PASS) when D-9 data is absent', () => {
    const chart = baseChart();
    delete chart.navamsaPlanets;
    const verdict = generateKPVerdict({ question: 'q', topic: 'MARRIAGE', relevantHouse: 7 }, chart);
    expect(verdict.dataQualityWarnings?.some((w) => w.includes('D-9'))).toBe(true);
    const step7 = verdict.steps.find((s) => s.stepNumber === 7)!;
    expect(step7.status).toBe('NEUTRAL');
    expect(step7.description).not.toMatch(/confirms natal promise stability/i); // old hardcoded text must be gone
  });

  test('does not fabricate significators when the significator table is empty for the house', () => {
    const chart = baseChart();
    chart.houseSignificators = {};
    chart.planetSignificators = {};
    const verdict = generateKPVerdict({ question: 'q', topic: 'MARRIAGE', relevantHouse: 7 }, chart);
    expect(verdict.reasoning.significators).not.toEqual(['Jupiter', 'Venus']); // old hardcoded fallback must be gone
    expect(verdict.dataQualityWarnings?.length).toBeGreaterThan(0);
  });
});

describe('generateKPVerdict — retrograde handling actually affects scoring', () => {
  test('a retrograde active Bhukti lord lowers dashaScore vs a direct one', () => {
    const chartDirect = baseChart();
    const chartRetro = baseChart();
    chartRetro.planets = chartRetro.planets.map((p) => (p.name === 'Venus' ? { ...p, isRetrograde: true } : p));

    const vDirect = generateKPVerdict({ question: 'q', topic: 'MARRIAGE', relevantHouse: 7 }, chartDirect);
    const vRetro = generateKPVerdict({ question: 'q', topic: 'MARRIAGE', relevantHouse: 7 }, chartRetro);

    expect(vRetro.confidenceBreakdown!.dashaScore).toBeLessThan(vDirect.confidenceBreakdown!.dashaScore);
    expect(vRetro.obstacles?.some((o) => o.toLowerCase().includes('retrograde'))).toBe(true);
  });
});

describe('generateKPVerdict — D9 cross-validation, when data is present, is a real check', () => {
  test('agreeing D-9 dispositor raises the vedic score vs a conflicting one', () => {
    const chartAgree = baseChart();
    // Cusp sub lord is Venus (house 7). Venus in D-9 sitting in a sign
    // whose lord is Jupiter (a level1 significator of house 7) => agreement.
    chartAgree.navamsaPlanets = [makePlanet({ name: 'Venus', sign: 'Sagittarius' })]; // Sagittarius lord = Jupiter

    const chartConflict = baseChart();
    // Sign lord Saturn is not among house 7's significators => disagreement.
    chartConflict.navamsaPlanets = [makePlanet({ name: 'Venus', sign: 'Capricorn' })]; // Capricorn lord = Saturn

    const vAgree = generateKPVerdict({ question: 'q', topic: 'MARRIAGE', relevantHouse: 7 }, chartAgree);
    const vConflict = generateKPVerdict({ question: 'q', topic: 'MARRIAGE', relevantHouse: 7 }, chartConflict);

    expect(vAgree.confidenceBreakdown!.vedicScore).toBeGreaterThan(vConflict.confidenceBreakdown!.vedicScore);
    expect(vAgree.steps.find((s) => s.stepNumber === 7)!.status).toBe('PASSED');
    expect(vConflict.steps.find((s) => s.stepNumber === 7)!.status).toBe('WARNING');
  });
});

describe('generateKPVerdict — significator ranking is strength-ordered, not arbitrary', () => {
  test('level1 significators are listed before level4-only significators', () => {
    const chart = baseChart();
    // Mars is only a level4 (owner) significator of house 7 in this fixture;
    // Jupiter is level1. Level1 must rank first regardless of object key order.
    chart.planetSignificators = {
      Mars: { level1: [], level2: [], level3: [], level4: [7] },
      Jupiter: { level1: [7], level2: [], level3: [], level4: [] }
    };
    const verdict = generateKPVerdict({ question: 'q', topic: 'MARRIAGE', relevantHouse: 7 }, chart);
    const jupiterIdx = verdict.reasoning.significators.indexOf('Jupiter');
    const marsIdx = verdict.reasoning.significators.indexOf('Mars');
    expect(jupiterIdx).toBeGreaterThanOrEqual(0);
    expect(marsIdx).toBeGreaterThan(jupiterIdx);
  });
});

describe('KPVerdictEngine.generateVerdictWithIntent — CHILDREN domain regression', () => {
  test('a CHILDREN-domain intent must resolve to topic CHILDREN, not silently fall back to GENERAL', async () => {
    // Regression test for a real production bug: the domain->topic mapping
    // in generateVerdictWithIntent listed CAREER/FINANCE/MARRIAGE/HEALTH/
    // EDUCATION but omitted CHILDREN, even though CHILDREN has its own
    // HOUSE_RULES entry. A live "children" query correctly detected House 5
    // / Putra Bhav but the verdict explanation read "...for general"
    // instead of "...for children" because topic silently stayed GENERAL.
    const chart = baseChart();
    const result = await KPVerdictEngine.generateVerdictWithIntent('When will I have children?', chart);
    expect(result.intent.domain).toBe('CHILDREN');
    // The base verdict's explanation/steps must reflect CHILDREN topic, not GENERAL.
    const step1 = result.analysisSteps.find((s: any) => s.stepNumber === 1);
    expect(step1.description).toMatch(/CHILDREN/i);
    expect(step1.description).not.toMatch(/GENERAL/i);
  });
});