import { describe, it, expect } from 'vitest';
import { calculateManglikDosha } from '../../lib/manglikDosha';

describe('calculateManglikDosha utility', () => {
  it('TEST 1: Dosha Present (Single Reference - Mild)', () => {
    // Ascendant=Gemini, Mars@7fromAsc (Sagittarius), Mars@10fromMoon (Aquarius), Mars@9fromVenus (Pisces)
    const input = {
      divisional_charts: {
        'D-1_rasi': {
          Ascendant: { sign: 'Gemini' },
          Mars: { sign: 'Sagittarius' },
          Moon: { sign: 'Aquarius' },
          Venus: { sign: 'Pisces' }
        }
      }
    };
    const result = calculateManglikDosha(input);
    expect(result.status).toBe('PRESENT');
    expect(result.details.fromAscendant).toBe(true);
    expect(result.details.fromMoon).toBe(false);
    expect(result.details.fromVenus).toBe(false);
    expect(result.severity).toBe('MILD');
  });

  it('TEST 2: Dosha Cancelled (Exception Sign)', () => {
    // Ascendant=Aries (exception sign), Mars@7fromAsc, Mars@2fromMoon, Mars@8fromVenus
    const input = {
      divisional_charts: {
        'D-1_rasi': {
          Ascendant: { sign: 'Aries' },
          Mars: { sign: 'Libra' },
          Moon: { sign: 'Pisces' },
          Venus: { sign: 'Virgo' }
        }
      }
    };
    const result = calculateManglikDosha(input);
    expect(result.status).toBe('CANCELLED');
    expect(result.reason.toLowerCase()).toContain('aries');
    expect(result.severity).toBe('NONE');
  });

  it('TEST 3: Neutral (No Dosha)', () => {
    // Ascendant=Taurus, Mars@3fromAsc, Mars@3fromMoon, Mars@3fromVenus
    const input = {
      divisional_charts: {
        'D-1_rasi': {
          Ascendant: { sign: 'Taurus' },
          Mars: { sign: 'Cancer' },
          Moon: { sign: 'Taurus' },
          Venus: { sign: 'Taurus' }
        }
      }
    };
    const result = calculateManglikDosha(input);
    expect(result.status).toBe('NEUTRAL');
    expect(result.details.fromAscendant).toBe(false);
    expect(result.details.fromMoon).toBe(false);
    expect(result.details.fromVenus).toBe(false);
    expect(result.severity).toBe('NONE');
  });

  it('TEST 4: Dosha Strong (All References Affected)', () => {
    // Ascendant=Taurus, Mars@8fromAsc (Sagittarius), Mars@4fromMoon (Virgo), Mars@8fromVenus (Taurus)
    const input = {
      divisional_charts: {
        'D-1_rasi': {
          Ascendant: { sign: 'Taurus' },
          Mars: { sign: 'Sagittarius' },
          Moon: { sign: 'Virgo' },
          Venus: { sign: 'Taurus' }
        }
      }
    };
    const result = calculateManglikDosha(input);
    expect(result.status).toBe('PRESENT');
    expect(result.details.fromAscendant).toBe(true);
    expect(result.details.fromMoon).toBe(true);
    expect(result.details.fromVenus).toBe(true);
    expect(result.severity).toBe('STRONG');
  });

  it('Exception: Cancelled when Mars is conjunct Jupiter', () => {
    const input = {
      divisional_charts: {
        'D-1_rasi': {
          Ascendant: { sign: 'Gemini' },
          Mars: { sign: 'Scorpio' },
          Jupiter: { sign: 'Scorpio' },
          Moon: { sign: 'Gemini' },
          Venus: { sign: 'Gemini' }
        }
      }
    };
    const result = calculateManglikDosha(input);
    expect(result.status).toBe('CANCELLED');
    expect(result.reason.toLowerCase()).toContain('jupiter');
  });
});
