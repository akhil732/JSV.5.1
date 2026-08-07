import { describe, it, expect, beforeEach } from 'vitest';
import { EnhancedGeminiConsultationService } from '../../lib/services/EnhancedGeminiConsultationService';
import { EnhancedQueryConsultationEngine } from '../../lib/engines/QueryConsultationEngine';
import type { BirthDetails } from '../../types';

describe('EnhancedGeminiConsultationService', () => {
  let service: EnhancedGeminiConsultationService;
  let mockBirthData: BirthDetails;

  beforeEach(() => {
    service = new EnhancedGeminiConsultationService();
    mockBirthData = {
      name: 'Test Native',
      date: '1996-11-01',
      time: '12:00:00',
      approximateTime: false,
      place: 'Kakinada',
      gender: 'Male',
      latitude: 16.98,
      longitude: 82.24,
      timezone: 5.5
    };
  });

  it('should validate data safety and reject raw ephemeris keys', () => {
    const safeData = {
      dashaPhase: { mahadasha: 'Rahu', antardasha: 'Saturn' },
      transits: { saturn: 'Supportive' }
    };
    expect(service.validateDataSafety(safeData)).toBe(true);

    const unsafeData = {
      rawEphemeris: { planet: 'Mars', longitude: 120.45 },
      latitude: 16.98
    };
    expect(service.validateDataSafety(unsafeData)).toBe(false);
  });

  it('should compute pre-computed consultation facts without exposing raw ephemeris coordinates', () => {
    const facts = service.computeConsultationFacts(mockBirthData);
    expect(facts.nativeInfo.name).toBe('Test Native');
    expect(facts.dashaPhase).toBeDefined();
    expect(facts.transits).toBeDefined();
    expect(facts.doshas).toBeDefined();
    expect(service.validateDataSafety(facts)).toBe(true);
  });

  it('should utilize QueryConsultationEngine for intent recognition and domain classification', () => {
    const engine = new EnhancedQueryConsultationEngine();
    const intentResult = engine.recognizeIntent('When is the best time for my marriage?');
    expect(intentResult.intent).toBe('MARRIAGE');
    expect(intentResult.confidence).toBeGreaterThan(0);

    const domainResult = engine.classifyDomain(intentResult);
    expect(domainResult.domain).toBe('MARRIAGE');
    expect(domainResult.analysisAngle).toContain('7th House');
  });

  it('should generate a consultation response for a query', async () => {
    const response = await service.generateConsultationResponse({
      birthData: mockBirthData,
      userQuery: "What's my current Dasha phase?",
      conversationHistory: [],
      userId: 'user123',
      language: 'en'
    });

    expect(response.role).toBe('assistant');
    expect(response.content).toBeTruthy();
    expect(response.metadata?.queryDomain).toBeDefined();
  });
});
