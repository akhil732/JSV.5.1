import { computeLiveTransitSnapshot } from './LiveTransitEngine';

export interface TransitPosition {
  sign: string;
  houseFromMoon: number;
  classification: 'Supportive' | 'Neutral' | 'Challenging';
  strength: number; // 1 to 5
  areas: string[];
}

export interface TransitSummary {
  currentPhase: 'Supportive' | 'Neutral' | 'Challenging';
  opportunities: string[];
  challenges: string[];
}

export interface TransitData {
  saturn: TransitPosition;
  jupiter: TransitPosition;
  summary: TransitSummary;
}

export function calculateTransits(moonSign: string, reportDate: Date = new Date()): TransitData {
  const snapshot = computeLiveTransitSnapshot(moonSign, reportDate);
  const saturnPos = snapshot.positions.Saturn;
  const jupiterPos = snapshot.positions.Jupiter;

  const saturnClass = saturnPos.classification;
  const jupiterClass = jupiterPos.classification;

  const saturnStrength = saturnClass === 'Supportive' ? 4 : saturnClass === 'Neutral' ? 3 : 2;
  const jupiterStrength = jupiterClass === 'Supportive' ? 4.5 : jupiterClass === 'Neutral' ? 3 : 1.5;

  const opportunities: string[] = [];
  const challenges: string[] = [];

  if (jupiterClass === 'Supportive') {
    opportunities.push(`Jupiter transiting ${jupiterPos.houseFromMoon}th from Moon brings wisdom, expansion, and auspicious guidance.`);
  } else {
    opportunities.push(`Jupiter transit encourages internal reflection and spiritual grounding.`);
  }

  if (saturnClass === 'Supportive') {
    opportunities.push(`Saturn transiting ${saturnPos.houseFromMoon}th from Moon rewards disciplined effort and professional persistence.`);
  } else {
    challenges.push(`Saturn transit in ${saturnPos.houseFromMoon}th from Moon requires patience, stress management, and steady perseverance.`);
  }

  const overallPhase = (jupiterStrength + saturnStrength >= 7.5) ? 'Supportive' : (jupiterStrength + saturnStrength >= 5) ? 'Neutral' : 'Challenging';

  return {
    saturn: {
      sign: saturnPos.sign,
      houseFromMoon: saturnPos.houseFromMoon,
      classification: saturnClass,
      strength: saturnStrength,
      areas: ["Career discipline", "Karmic balancing", "Long-term foundations"]
    },
    jupiter: {
      sign: jupiterPos.sign,
      houseFromMoon: jupiterPos.houseFromMoon,
      classification: jupiterClass,
      strength: jupiterStrength,
      areas: ["Wealth expansion", "Wisdom & mentoring", "Spiritual growth"]
    },
    summary: {
      currentPhase: overallPhase as any,
      opportunities,
      challenges
    }
  };
}

export class TransitEngine {
  constructor(public kpChart?: any, public birthDetails?: any) {}

  evaluateMoonTransit(moonSign: string = 'Aries'): 'Supportive' | 'Neutral' | 'Challenging' {
    const data = calculateTransits(moonSign);
    return data.summary.currentPhase || 'Neutral';
  }
}

