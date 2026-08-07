import { describe, it, expect } from 'vitest';
import { calculateYoniKuta, isEnemyYoni } from '../../lib/yoniKutaCalculator';

describe('Yoni Kuta Calculator utility', () => {
  it('Enemy yoni test: Dog and Deer (Ardra / Mrigashirsha)', () => {
    const result = calculateYoniKuta('Dog', 'Deer');
    expect(result.score).toBe(0);
    expect(result.isUnfavourable).toBe(true);
    expect(result.compatibility).toBe('Enemy Yoni');
  });

  it('Enemy yoni test: Serpent and Mongoose (Rohini / Ashlesha)', () => {
    const result = calculateYoniKuta('Serpent', 'Mongoose');
    expect(result.score).toBe(0);
    expect(result.isUnfavourable).toBe(true);
    expect(result.compatibility).toBe('Enemy Yoni');
  });

  it('Enemy yoni test: Lion and Elephant', () => {
    const result = calculateYoniKuta('Lion', 'Elephant');
    expect(result.score).toBe(0);
    expect(result.isUnfavourable).toBe(true);
    expect(result.compatibility).toBe('Enemy Yoni');
  });

  it('Enemy yoni test: Horse and Bull', () => {
    const result = calculateYoniKuta('Horse', 'Bull');
    expect(result.score).toBe(0);
    expect(result.isUnfavourable).toBe(true);
    expect(result.compatibility).toBe('Enemy Yoni');
  });

  it('Enemy yoni test: Cow and Tiger', () => {
    const result = calculateYoniKuta('Cow', 'Tiger');
    expect(result.score).toBe(0);
    expect(result.isUnfavourable).toBe(true);
    expect(result.compatibility).toBe('Enemy Yoni');
  });

  it('Enemy yoni test: Cat and Rat', () => {
    const result = calculateYoniKuta('Cat', 'Rat');
    expect(result.score).toBe(0);
    expect(result.isUnfavourable).toBe(true);
    expect(result.compatibility).toBe('Enemy Yoni');
  });

  it('Enemy yoni test: Monkey and Goat', () => {
    const result = calculateYoniKuta('Monkey', 'Goat');
    expect(result.score).toBe(0);
    expect(result.isUnfavourable).toBe(true);
    expect(result.compatibility).toBe('Enemy Yoni');
  });

  it('Same yoni test: Horse and Horse (Ashwini / Shatabhisha)', () => {
    const result = calculateYoniKuta('Horse', 'Horse');
    expect(result.score).toBe(4);
    expect(result.isUnfavourable).toBe(false);
    expect(result.compatibility).toBe('Same Yoni');
  });

  it('Neutral test: Horse and Elephant', () => {
    const result = calculateYoniKuta('Horse', 'Elephant');
    expect(result.score).toBe(1);
    expect(result.isUnfavourable).toBe(false);
    expect(result.compatibility).toBe('Neutral');
  });
});
