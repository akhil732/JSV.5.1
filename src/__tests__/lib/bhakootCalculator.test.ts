import { describe, it, expect } from 'vitest';
import { calculateBhakoot, areFriendlyOrSameLords, normalizeSignIndex } from '../../lib/bhakootCalculator';

describe('Bhakoot Calculator (Rasi Relationship Rules)', () => {
  it('normalizes sign names and indices accurately', () => {
    expect(normalizeSignIndex('Aries')).toBe(1);
    expect(normalizeSignIndex('Mesha')).toBe(1);
    expect(normalizeSignIndex('Virgo')).toBe(6);
    expect(normalizeSignIndex('Kanya')).toBe(6);
    expect(normalizeSignIndex('Pisces')).toBe(12);
    expect(normalizeSignIndex(12)).toBe(12);
    expect(normalizeSignIndex(0)).toBe(1); // 0-indexed to 1-indexed
  });

  describe('6-8 Relationship (Shadashtaka Dosha)', () => {
    it('detects 6-8 Shadashtaka Dosha between Aries and Virgo (0 points, Unfavourable)', () => {
      const res = calculateBhakoot('Aries', 'Virgo');
      expect(res.relationshipType).toBe('6-8');
      expect(res.doshaName).toBe('Shadashtaka');
      expect(res.isUnfavourable).toBe(true);
      expect(res.score).toBe(0);
      expect(res.maxScore).toBe(7);
    });

    it('cancels 6-8 Dosha between Aries and Scorpio due to Same Rashi Lord (Mars)', () => {
      const res = calculateBhakoot('Aries', 'Scorpio');
      expect(res.relationshipType).toBe('6-8');
      expect(res.isUnfavourable).toBe(false);
      expect(res.isCancelled).toBe(true);
      expect(res.score).toBe(7);
      expect(res.cancellationReason).toContain('Same Rashi Lord (Mars)');
    });

    it('cancels 6-8 Dosha between Taurus and Libra due to Same Rashi Lord (Venus)', () => {
      const res = calculateBhakoot('Taurus', 'Libra');
      expect(res.relationshipType).toBe('6-8');
      expect(res.isUnfavourable).toBe(false);
      expect(res.isCancelled).toBe(true);
      expect(res.score).toBe(7);
      expect(res.cancellationReason).toContain('Same Rashi Lord (Venus)');
    });

    it('cancels 6-8 Dosha between Leo and Pisces due to Friendly Rashi Lords (Sun & Jupiter)', () => {
      const res = calculateBhakoot('Leo', 'Pisces');
      expect(res.relationshipType).toBe('6-8');
      expect(res.isUnfavourable).toBe(false);
      expect(res.isCancelled).toBe(true);
      expect(res.score).toBe(7);
      expect(res.cancellationReason).toContain('Friendly Rashi Lords (Sun & Jupiter)');
    });
  });

  describe('5-9 Relationship (Navapanchama Dosha)', () => {
    it('evaluates 5-9 relationship between Aries and Leo and cancels due to Friendly Lords (Mars & Sun)', () => {
      const res = calculateBhakoot('Aries', 'Leo');
      expect(res.relationshipType).toBe('5-9');
      expect(res.doshaName).toBe('Navapanchama');
      expect(res.isCancelled).toBe(true);
      expect(res.score).toBe(7);
      expect(res.cancellationReason).toContain('Friendly Rashi Lords');
    });

    it('evaluates 5-9 relationship between Gemini and Libra and cancels due to Friendly Lords (Mercury & Venus)', () => {
      const res = calculateBhakoot('Gemini', 'Libra');
      expect(res.relationshipType).toBe('5-9');
      expect(res.doshaName).toBe('Navapanchama');
      expect(res.isCancelled).toBe(true);
      expect(res.score).toBe(7);
    });
  });

  describe('2-12 Relationship (Dwirdwadasha Dosha)', () => {
    it('detects 2-12 Dwirdwadasha Dosha between Aries and Taurus (0 points, Unfavourable)', () => {
      const res = calculateBhakoot('Aries', 'Taurus');
      expect(res.relationshipType).toBe('2-12');
      expect(res.doshaName).toBe('Dwirdwadasha');
      expect(res.isUnfavourable).toBe(true);
      expect(res.score).toBe(0);
    });

    it('cancels 2-12 Dosha between Capricorn and Aquarius due to Same Rashi Lord (Saturn)', () => {
      const res = calculateBhakoot('Capricorn', 'Aquarius');
      expect(res.relationshipType).toBe('2-12');
      expect(res.isUnfavourable).toBe(false);
      expect(res.isCancelled).toBe(true);
      expect(res.score).toBe(7);
      expect(res.cancellationReason).toContain('Same Rashi Lord (Saturn)');
    });

    it('cancels 2-12 Dosha between Taurus and Gemini due to Friendly Rashi Lords (Venus & Mercury)', () => {
      const res = calculateBhakoot('Taurus', 'Gemini');
      expect(res.relationshipType).toBe('2-12');
      expect(res.isUnfavourable).toBe(false);
      expect(res.isCancelled).toBe(true);
      expect(res.score).toBe(7);
      expect(res.cancellationReason).toContain('Friendly Rashi Lords (Venus & Mercury)');
    });
  });

  describe('Naturally Compatible Pairs (1-1, 3-11, 4-10, 7-7)', () => {
    it('awards full 7 points for 3-11 relationship (Aries and Gemini)', () => {
      const res = calculateBhakoot('Aries', 'Gemini');
      expect(res.relationshipType).toBe('3-11');
      expect(res.isUnfavourable).toBe(false);
      expect(res.score).toBe(7);
      expect(res.compatibility).toContain('Favourable');
    });

    it('awards full 7 points for 7-7 relationship (Aries and Libra)', () => {
      const res = calculateBhakoot('Aries', 'Libra');
      expect(res.relationshipType).toBe('7-7');
      expect(res.isUnfavourable).toBe(false);
      expect(res.score).toBe(7);
    });
  });
});
