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

describe('generateKPVerdict — Pratyantardasha (PD) timing replaces hardcoded placeholder dates', () => {
  test('with no fullTimeline supplied, timing falls back honestly and flags reduced precision (no fabricated "2027" dates)', () => {
    const chart = baseChart(); // currentDasha has no fullTimeline
    const verdict = generateKPVerdict({ question: 'q', topic: 'MARRIAGE', relevantHouse: 7 }, chart);
    expect(verdict.dataQualityWarnings?.some((w) => w.includes('120-year Vimshottari timeline'))).toBe(true);
    // Previously this string was hardcoded regardless of chart data —
    // confirm the old fake placeholder text is gone.
    expect(verdict.timing).not.toMatch(/2027 - 2028/);
    expect(verdict.alternativeScenarios?.[0].timing).not.toMatch(/2026 - 2027/);
    expect(verdict.alternativeScenarios?.[1].timing).not.toMatch(/2027 - 2028/);
  });

  test('with a full 120-year timeline, "Favorable Window" surfaces the real PD lord and exact dates, not a Bhukti-only guess', () => {
    const chart = baseChart();
    // AD Venus (currently active per baseChart's currentDasha) contains
    // three PDs: Mars (not a significator) runs first, then Jupiter (IS a
    // level1 significator of House 7 per the fixture), then Saturn.
    // findNextFavorablePD should skip Mars and pick Jupiter's PD — the
    // earliest upcoming PD whose lord is an actual significator, not just
    // the earliest PD chronologically.
    chart.currentDasha.fullTimeline = [
      {
        lord: 'Jupiter',
        startDate: new Date('2015-01-01'),
        endDate: new Date('2031-01-01'),
        antardashas: [
          {
            lord: 'Venus',
            startDate: new Date('2020-01-01'),
            endDate: new Date('2040-01-01'),
            pratyantardashas: [
              { lord: 'Mars', startDate: new Date('2024-01-01'), endDate: new Date('2024-06-01') },
              { lord: 'Jupiter', startDate: new Date('2024-06-01'), endDate: new Date('2025-01-01') },
              { lord: 'Saturn', startDate: new Date('2025-01-01'), endDate: new Date('2025-06-01') }
            ]
          }
        ]
      }
    ];

    const verdict = generateKPVerdict({ question: 'q', topic: 'MARRIAGE', relevantHouse: 7 }, chart);
    expect(verdict.dataQualityWarnings?.some((w) => w.includes('120-year Vimshottari timeline'))).toBe(false);
    // The chosen PD (Jupiter's, a real significator) should be named and
    // dated in the timing text — not the old hardcoded placeholder.
    const combinedTimingText = JSON.stringify([verdict.timing, verdict.alternativeScenarios]);
    expect(combinedTimingText).not.toMatch(/2026 - 2027|2027 - 2028/);
    expect(combinedTimingText).toMatch(/Jupiter/);
    expect(combinedTimingText).toMatch(/Pratyantardasha|PD/);
  });
});

describe('generateKPVerdict — Ruling Planets synthesis and plain-English summary', () => {
  test('RP convergence is HIGH when top-tier RP layers overlap with real significators (not fabricated)', () => {
    const chart = baseChart();
    // Fixture's rulingPlanets.lagnaSubLord = 'Venus' (a level1 significator
    // of House 7) and moonSubLord = 'Jupiter' (also level1) — a genuine
    // overlap the engine should detect, not assume.
    const verdict = generateKPVerdict({ question: 'q', topic: 'MARRIAGE', relevantHouse: 7 }, chart);
    expect(verdict.rulingPlanetConfirmation).toBeDefined();
    expect(verdict.rulingPlanetConfirmation?.convergenceLevel).toBe('HIGH');
    expect(verdict.rulingPlanetConfirmation?.topTierMatch).toBe(true);
    expect(verdict.rulingPlanetConfirmation?.overlappingPlanets).toContain('Venus');
  });

  test('RP convergence is LOW and says so honestly when no RP layer overlaps with significators or dasha lords', () => {
    const chart = baseChart();
    // None of these planets are House 7 significators (Jupiter/Venus) or
    // the active Jupiter Mahadasha / Venus Antardasha lords.
    chart.rulingPlanets = {
      lagnaSign: 'Aries', lagnaSignLord: 'Mars', lagnaStarLord: 'Ketu', lagnaSubLord: 'Mars', lagnaSubSubLord: 'Mars',
      moonSign: 'Cancer', moonSignLord: 'Moon', moonStarLord: 'Rahu', moonSubLord: 'Rahu', moonSubSubLord: 'Rahu',
      dayLord: 'Saturn', timestamp: '1990-01-01T12:00:00Z'
    };
    const verdict = generateKPVerdict({ question: 'q', topic: 'MARRIAGE', relevantHouse: 7 }, chart);
    expect(verdict.rulingPlanetConfirmation?.convergenceLevel).toBe('LOW');
    expect(verdict.rulingPlanetConfirmation?.overlappingPlanets).toHaveLength(0);
    expect(verdict.rulingPlanetConfirmation?.synthesis).toMatch(/no overlap/i);
  });

  test('plainSummary is a jargon-free synthesis, distinct from the technical explanation text', () => {
    const chart = baseChart();
    const verdict = generateKPVerdict({ question: 'q', topic: 'MARRIAGE', relevantHouse: 7 }, chart);
    expect(verdict.plainSummary).toBeTruthy();
    // Should not contain raw KP jargon like house numbers or "cusp sub lord"
    expect(verdict.plainSummary).not.toMatch(/cusp sub lord/i);
    expect(verdict.plainSummary).not.toMatch(/House \d+/);
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

describe('KPVerdictEngine.generateVerdictWithIntent — PROPERTY/LEGAL/TRAVEL/SPIRITUAL/RELATIONSHIPS domain regression', () => {
  // Regression test for a real production bug found while testing a live
  // "Will I buy a house or flat soon?" query: the KEYWORD CLASSIFIER
  // (houseDomainMapper.ts) already correctly identified PROPERTY at 90-95%
  // confidence ("house"/"flat"/"buy" are properly weighted keywords), but
  // TopicEnum/HOUSE_RULES in kpVerdictEngine.ts only implemented 6 of the
  // 11 domains LifeDomain supports — PROPERTY, LEGAL, TRAVEL, SPIRITUAL,
  // and RELATIONSHIPS were silently discarded to GENERAL at the mapping
  // step, even though they were correctly classified upstream.
  const cases: [string, string][] = [
    ['Will I buy a house or flat soon?', 'PROPERTY'],
    ['Will I win this court case?', 'LEGAL'],
    ['Will I travel abroad this year?', 'TRAVEL'],
    ['Should I visit a temple for blessings?', 'SPIRITUAL'],
    ['Will I find good friendships this year?', 'RELATIONSHIPS'],
  ];

  test.each(cases)('%s → topic %s (not GENERAL)', async (query, expectedTopic) => {
    const chart = baseChart();
    const result = await KPVerdictEngine.generateVerdictWithIntent(query, chart);
    expect(result.intent.domain).toBe(expectedTopic);
    const step1 = result.analysisSteps.find((s: any) => s.stepNumber === 1);
    expect(step1.description).toMatch(new RegExp(expectedTopic, 'i'));
    expect(step1.description).not.toMatch(/\(GENERAL\)/i);
  });
});