export const ENEMY_YONI_PAIRS: [string, string][] = [
  ['Dog', 'Deer'],
  ['Serpent', 'Mongoose'],
  ['Lion', 'Elephant'],
  ['Horse', 'Bull'],
  ['Cow', 'Tiger'],
  ['Cat', 'Rat'],
  ['Monkey', 'Goat']
];

export function normalizeYoni(yoni: string): string {
  if (!yoni) return '';
  const lower = yoni.toLowerCase().trim();
  if (lower.includes('dog')) return 'Dog';
  if (lower.includes('deer')) return 'Deer';
  if (lower.includes('serpent') || lower.includes('snake')) return 'Serpent';
  if (lower.includes('mongoose')) return 'Mongoose';
  if (lower.includes('lion')) return 'Lion';
  if (lower.includes('elephant')) return 'Elephant';
  if (lower.includes('horse')) return 'Horse';
  if (lower.includes('bull') || lower.includes('cow')) return 'Bull';
  if (lower.includes('tiger')) return 'Tiger';
  if (lower.includes('cat')) return 'Cat';
  if (lower.includes('rat') || lower.includes('mouse')) return 'Rat';
  if (lower.includes('monkey')) return 'Monkey';
  if (lower.includes('goat')) return 'Goat';
  return yoni;
}

export function isEnemyYoni(yoni1: string, yoni2: string): boolean {
  const norm1 = normalizeYoni(yoni1);
  const norm2 = normalizeYoni(yoni2);
  return ENEMY_YONI_PAIRS.some(pair =>
    (normalizeYoni(pair[0]) === norm1 && normalizeYoni(pair[1]) === norm2) ||
    (normalizeYoni(pair[0]) === norm2 && normalizeYoni(pair[1]) === norm1)
  );
}

export interface YoniKutaResult {
  score: number;
  maxScore: number;
  isUnfavourable: boolean;
  compatibility: string;
  boyYoni: string;
  girlYoni: string;
}

export function calculateYoniKuta(boyYoni: string, girlYoni: string): YoniKutaResult {
  const bNorm = normalizeYoni(boyYoni);
  const gNorm = normalizeYoni(girlYoni);

  if (bNorm && gNorm && bNorm === gNorm) {
    return {
      score: 4,
      maxScore: 4,
      isUnfavourable: false,
      compatibility: 'Same Yoni',
      boyYoni,
      girlYoni
    };
  }
  if (isEnemyYoni(boyYoni, girlYoni)) {
    return {
      score: 0,
      maxScore: 4,
      isUnfavourable: true,
      compatibility: 'Enemy Yoni',
      boyYoni,
      girlYoni
    };
  }
  return {
    score: 1,
    maxScore: 4,
    isUnfavourable: false,
    compatibility: 'Neutral',
    boyYoni,
    girlYoni
  };
}
