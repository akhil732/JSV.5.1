import { ReasoningEngine } from '../../lib/engines/ReasoningEngine';
import type { UnifiedKPGroundTruth } from '../../components/AdvancedAITab/UnifiedKPGroundTruthEngine';

describe('ReasoningEngine', () => {
  const mockGroundTruth: UnifiedKPGroundTruth = {
    cuspSubLord: 'Mercury',
    cuspSubLordHouses: [2, 11],
    primarySignificators: ['Mercury', 'Jupiter'],
    promise: 'YES',
    confidenceScore: 85,
    timing: 'March 2026 to January 2029',
    activeMahadasha: 'Mercury',
    activeAntardasha: 'Venus',
    activeVimshottariDesc: 'Mercury MD → Venus AD',
    transitModulation: 'Supportive',
    houseDomain: 'Finance & Wealth',
    topic: 'FINANCE' as any,
    primaryHouse: 2,
    horoscopeDate: '1996-11-01',
    computedAt: '2026-08-10T00:00:00.000Z',
    missingDataItems: []
  };

  it('generates evidence-backed claims without unmotivated leaps', () => {
    const claims = ReasoningEngine.generateAstrologicalClaims(mockGroundTruth, 'ఆర్థిక పరిస్థితి ఎలా ఉంది?');
    expect(claims.length).toBeGreaterThan(0);
    
    const gatekeeperClaim = claims.find(c => c.type === 'VERIFIED_PLACEMENT');
    expect(gatekeeperClaim).toBeDefined();
    expect(gatekeeperClaim?.confidence).toBe('VERIFIED');
    expect(gatekeeperClaim?.evidence.factors.length).toBeGreaterThan(0);
    expect(gatekeeperClaim?.evidence.reasoning).toContain('KP');
  });

  it('assigns MODERATE confidence and disclaimer for transit claims', () => {
    const claims = ReasoningEngine.generateAstrologicalClaims(mockGroundTruth, 'ఆర్థిక పీరియడ్ గురించి చెప్పండి');
    const transitClaim = claims.find(c => c.type === 'TRANSIT_SUPPORT');
    expect(transitClaim).toBeDefined();
    expect(transitClaim?.confidence).toBe('MODERATE');
    expect(transitClaim?.qualifier).toBeDefined();
  });

  it('detects 6-8 (Shashtashtaka) axis between Dasha Lord and Antardasha Lord', () => {
    const canonicalChartMock = {
      birthDetails: {
        name: 'Test Native',
        gender: 'Male' as const,
        date: '1996-11-01',
        time: '12:00',
        approximateTime: false,
        place: 'Hyderabad',
        latitude: 17.385,
        longitude: 78.486,
        timezone: 5.5
      },
      rasi: {
        planets: {
          Mercury: { sign: 'Gemini', degree: 10, house: 1 },
          Ketu: { sign: 'Capricorn', degree: 10, house: 8 }
        },
        cusps: {}
      },
      computedAt: '2026-08-10T00:00:00.000Z',
      ephemerisSource: 'VSOP87',
      ayanamshaUsed: 'Lahiri',
      isValid: true
    };

    const relationships = ReasoningEngine.evaluateDashaRelationship('Mercury', 'Ketu', canonicalChartMock);
    expect(relationships.length).toBeGreaterThan(0);
    const shashtashtakaRel = relationships.find(r => r.axisType === 'SHASHTASHTAKA');
    expect(shashtashtakaRel).toBeDefined();
    expect(shashtashtakaRel?.hasStressAxis).toBe(true);
    expect(shashtashtakaRel?.claimTextTelugu).toContain('6-8');
  });

  it('detects 2-12 (Dwadasashtaka) axis between Dasha Lord and Antardasha Lord', () => {
    const canonicalChartMock = {
      birthDetails: {
        name: 'Test Native',
        gender: 'Male' as const,
        date: '1996-11-01',
        time: '12:00',
        approximateTime: false,
        place: 'Hyderabad',
        latitude: 17.385,
        longitude: 78.486,
        timezone: 5.5
      },
      rasi: {
        planets: {
          Mercury: { sign: 'Gemini', degree: 10, house: 1 },
          Venus: { sign: 'Taurus', degree: 10, house: 12 }
        },
        cusps: {}
      },
      computedAt: '2026-08-10T00:00:00.000Z',
      ephemerisSource: 'VSOP87',
      ayanamshaUsed: 'Lahiri',
      isValid: true
    };

    const relationships = ReasoningEngine.evaluateDashaRelationship('Mercury', 'Venus', canonicalChartMock);
    expect(relationships.length).toBeGreaterThan(0);
    const dwadasashtakaRel = relationships.find(r => r.axisType === 'DWADASASHTAKA');
    expect(dwadasashtakaRel).toBeDefined();
    expect(dwadasashtakaRel?.hasStressAxis).toBe(true);
    expect(dwadasashtakaRel?.claimTextTelugu).toContain('2-12');
  });
});

