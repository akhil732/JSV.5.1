import { describe, test, expect } from 'vitest';
import { ZODIAC_SIGNS, SIGN_LORDS, formatRemainingTime } from '../../pages/BirthChartPage'; 

describe('Data Extraction Logic', () => {
  test('ZODIAC_SIGNS has 12 elements', () => {
    expect(ZODIAC_SIGNS.length).toBe(12);
  });

  test('SIGN_LORDS covers all zodiac signs', () => {
    ZODIAC_SIGNS.forEach(sign => {
      expect(SIGN_LORDS[sign]).toBeDefined();
    });
  });

  test('formatRemainingTime returns valid format', () => {
    const futureDate = new Date('2027-01-01');
    const result = formatRemainingTime(futureDate);
    expect(result).toMatch(/remaining|Completed/);
  });
});
