/**
 * Cusp Sub Lord Gatekeeper Logic
 * Textbook Reference: Prof. K.S. Krishnamurti's Predictive Stellar Astrology
 * Pages: 6643-6828
 */

export type HouseNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
export type CuspPromise = 'YES' | 'DELAYED' | 'NO';

export interface HouseSignificatorInfo {
  house: HouseNumber;
  houseName: string;
  houseLord: string;
  keywords: string[];
  beneficSignifications: HouseNumber[];
  maleficSignifications: HouseNumber[];
}

export const HOUSE_SIGNIFICATOR_MATRIX: HouseSignificatorInfo[] = [
  {
    house: 1,
    houseName: 'Ascendant / Self / Health / Personality',
    houseLord: 'Sun',
    keywords: ['health', 'personality', 'effort', 'success', 'resistance', 'longevity'],
    beneficSignifications: [1, 2, 4, 5, 7, 9, 10, 11],
    maleficSignifications: [6, 8, 12],
  },
  {
    house: 2,
    houseName: 'Finance / Wealth / Speech / Family',
    houseLord: 'Mercury',
    keywords: ['money', 'income', 'speech', 'family', 'food', 'jewels'],
    beneficSignifications: [1, 2, 4, 5, 7, 9, 10, 11],
    maleficSignifications: [6, 8, 12],
  },
  {
    house: 3,
    houseName: 'Siblings / Communication / Short Travels',
    houseLord: 'Venus',
    keywords: ['brothers', 'sisters', 'communication', 'writing', 'neighbors', 'short journeys'],
    beneficSignifications: [1, 2, 3, 4, 5, 7, 9, 10, 11],
    maleficSignifications: [6, 8, 12],
  },
  {
    house: 4,
    houseName: 'Mother / Property / Home / Education',
    houseLord: 'Mars',
    keywords: ['mother', 'property', 'home', 'land', 'mines', 'education', 'vehicles'],
    beneficSignifications: [1, 2, 4, 5, 7, 9, 10, 11],
    maleficSignifications: [6, 8, 12],
  },
  {
    house: 5,
    houseName: 'Children / Creativity / Speculation / Romance',
    houseLord: 'Sun',
    keywords: ['children', 'creativity', 'speculation', 'romance', 'entertainment', 'music', 'sports'],
    beneficSignifications: [1, 2, 4, 5, 7, 9, 10, 11],
    maleficSignifications: [6, 8, 12],
  },
  {
    house: 6,
    houseName: 'Health / Service / Enemies / Debts',
    houseLord: 'Venus',
    keywords: ['disease', 'health', 'enemies', 'debts', 'service', 'litigation', 'pets'],
    beneficSignifications: [1, 2, 3, 4, 5, 10, 11],
    maleficSignifications: [6, 7, 8, 9, 12],
  },
  {
    house: 7,
    houseName: 'Marriage / Partnership / Spouse / Public Relations',
    houseLord: 'Mercury',
    keywords: ['marriage', 'partnership', 'spouse', 'union', 'business partner', 'public relations'],
    beneficSignifications: [1, 2, 4, 5, 7, 9, 10, 11],
    maleficSignifications: [6, 8, 12],
  },
  {
    house: 8,
    houseName: 'Longevity / Inheritance / Occult / Transformation',
    houseLord: 'Moon',
    keywords: ['longevity', 'inheritance', 'legacy', 'insurance', 'occult', 'hidden matters'],
    beneficSignifications: [1, 2, 4, 5, 10, 11],
    maleficSignifications: [6, 7, 8, 9, 12],
  },
  {
    house: 9,
    houseName: 'Father / Luck / Long Journeys / Higher Learning / Religion',
    houseLord: 'Mars',
    keywords: ['father', 'luck', 'long journeys', 'higher learning', 'religion', 'philosophy'],
    beneficSignifications: [1, 2, 4, 5, 7, 9, 10, 11],
    maleficSignifications: [6, 8, 12],
  },
  {
    house: 10,
    houseName: 'Career / Status / Honor / Reputation / Government',
    houseLord: 'Sun',
    keywords: ['career', 'profession', 'status', 'honor', 'reputation', 'government', 'prestige'],
    beneficSignifications: [1, 2, 4, 5, 7, 9, 10, 11],
    maleficSignifications: [6, 8, 12],
  },
  {
    house: 11,
    houseName: 'Gains / Friends / Fulfillment of Desires',
    houseLord: 'Mercury',
    keywords: ['gains', 'profits', 'friends', 'fulfillment', 'large income', 'benefactors'],
    beneficSignifications: [1, 2, 4, 5, 7, 9, 10, 11],
    maleficSignifications: [6, 8, 12],
  },
  {
    house: 12,
    houseName: 'Losses / Confinement / Isolation / Expenses / Foreign Travel',
    houseLord: 'Venus',
    keywords: ['loss', 'confinement', 'isolation', 'expenses', 'foreign travel', 'hospitalization'],
    beneficSignifications: [1, 4, 5, 9, 10, 11],
    maleficSignifications: [2, 6, 7, 8, 12],
  },
];

export interface CuspPromiseAnalysis {
  house: HouseNumber;
  cuspDegree: number;
  signLord: string;
  starLord: string;
  subLord: string;
  subLordSignifications: HouseNumber[];
  beneficCount: number;
  maleficCount: number;
  promise: CuspPromise;
  reasoning: string;
  textbookReference: string;
}

export function evaluateCuspPromise(
  house: HouseNumber,
  subLord: string,
  subLordSignifications: HouseNumber[]
): CuspPromiseAnalysis {
  const houseInfo = HOUSE_SIGNIFICATOR_MATRIX[house - 1] || HOUSE_SIGNIFICATOR_MATRIX[0];
  
  const beneficCount = subLordSignifications.filter(h =>
    houseInfo.beneficSignifications.includes(h)
  ).length;
  
  const maleficCount = subLordSignifications.filter(h =>
    houseInfo.maleficSignifications.includes(h)
  ).length;
  
  let promise: CuspPromise;
  let reasoning: string;
  let textbookReference: string;
  
  if (beneficCount === 0 && maleficCount > 0) {
    promise = 'NO';
    reasoning = `Sub lord ${subLord} signifies ONLY malefic houses: ${subLordSignifications.join(', ')}. Event is structurally DENIED.`;
    textbookReference = 'Page 3403-3404, 6643-6828';
  } else if (beneficCount > 0 && subLordSignifications.includes(12)) {
    promise = 'DELAYED';
    reasoning = `Sub lord ${subLord} signifies beneficial houses AND 12 (Loss/Delay). Event is PROMISED but DELAYED.`;
    textbookReference = 'Page 6725-6738';
  } else if (beneficCount > 0 && maleficCount === 0) {
    promise = 'YES';
    reasoning = `Sub lord ${subLord} signifies ONLY beneficial houses: ${subLordSignifications.join(', ')}. Event is PROMISED.`;
    textbookReference = 'Page 6689-6715';
  } else {
    promise = 'DELAYED';
    reasoning = `Sub lord ${subLord} has mixed significations. Event has obstacles/challenges.`;
    textbookReference = 'Page 6694-6715';
  }
  
  return {
    house,
    cuspDegree: 0,
    signLord: '',
    starLord: '',
    subLord,
    subLordSignifications,
    beneficCount,
    maleficCount,
    promise,
    reasoning,
    textbookReference,
  };
}

export function performSteps1Through3(
  house: HouseNumber,
  cuspDegree: number,
  signLord: string,
  starLord: string,
  subLord: string,
  subLordSignifications: HouseNumber[]
) {
  const analysis = evaluateCuspPromise(house, subLord, subLordSignifications);
  const canProceed = analysis.promise !== 'NO';
  const gatekeeperMessage = canProceed
    ? `✅ GATE OPEN: Sub lord allows further analysis.`
    : `❌ GATE CLOSED: Event structurally DENIED.`;
    
  return {
    house,
    houseName: HOUSE_SIGNIFICATOR_MATRIX[house - 1]?.houseName || '',
    cuspDegree,
    signLord,
    starLord,
    subLord,
    subLordSignifications,
    gatekeeperAnalysis: analysis,
    canProceedToStep4: canProceed,
    gatekeeperMessage,
  };
}
