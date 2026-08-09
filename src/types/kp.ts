export type TopicEnum = 'MARRIAGE' | 'CAREER' | 'FINANCE' | 'HEALTH' | 'EDUCATION' | 'CHILDREN' | 'PROPERTY' | 'LEGAL' | 'TRAVEL' | 'SPIRITUAL' | 'RELATIONSHIPS' | 'GENERAL';

export type VerdictPromise = 'YES' | 'DELAYED' | 'NO';
export type QualityLevel = 'FAVORABLE' | 'MIXED' | 'CHALLENGING';
export type ConfidenceLevel = 'HIGH' | 'MODERATE' | 'LOW';

export interface Cusp {
  houseNumber: number; // 1 to 12
  degree: number; // 0 - 360
  formattedDegree: string; // e.g. "11° 24' 15\""
  sign: string; // Zodiac sign name
  signLord: string;
  starLord: string;
  subLord: string;
  subSubLord: string;
}

export interface KPHouse {
  number: number; // 1 to 12
  sign: string;
  formattedDegree: string;
  signLord: string;
  starLord: string;
  subLord: string;
  subSubLord: string;
  cuspDegree: number;
  promise?: 'YES' | 'DELAYED' | 'NO';
  gatekeeperReasoning?: string;
}

export interface KPPlanet {
  name: string;
  sign: string;
  degree: number;
  formattedDegree: string;
  signLord: string;
  starLord: string;
  subLord: string;
  subSubLord: string;
  isRetrograde?: boolean;
  isCombust?: boolean;
  isDebilitated?: boolean;
  significatorOf: number[];
}

export interface PlanetSignificatorLevels {
  level1: number[]; // Star lord of house occupants
  level2: number[]; // House occupants
  level3: number[]; // Star lord of house owner
  level4: number[]; // House owner
}

export interface DashaPeriod {
  planet: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
}

export interface DashaInfo {
  mahadasha: string;
  antardasha: string; // Bhukti
  pratyantardasha?: string;
  sookshmadasha?: string;
  mahadashaEnd?: string;
  antardashaEnd?: string;
  /**
   * Exact start/end dates of the currently active Pratyantardasha (PD).
   * PD is a finer-grained timing unit than Antardasha (Bhukti) — narrowing
   * a multi-year Bhukti window down to a period typically weeks-to-months
   * long. Previously computed by calculateVimshottariDashaFromMoon() but
   * discarded before reaching KPChart, forcing the verdict engine to show
   * a hardcoded placeholder window ("2027 - 2028") instead of a real date.
   */
  pratyantardashaStart?: string;
  pratyantardashaEnd?: string;
  /**
   * The full 120-year Vimshottari Mahadasha sequence, nested down to PD
   * level (MD -> AD -> PD), as already computed by
   * calculateVimshottariDashaFromMoon()'s `timeline` field. Optional —
   * when absent, the verdict engine falls back to the less precise
   * Bhukti-level timing text and flags reduced precision via
   * dataQualityWarnings rather than fabricating dates.
   */
  fullTimeline?: {
    lord: string;
    startDate: Date;
    endDate: Date;
    antardashas: {
      lord: string;
      startDate: Date;
      endDate: Date;
      pratyantardashas: { lord: string; startDate: Date; endDate: Date }[];
    }[];
  }[];
}

export interface RulingPlanets {
  lagnaSign: string;
  lagnaSignLord: string;
  lagnaStarLord: string;
  lagnaSubLord: string;
  lagnaSubSubLord: string;
  moonSign: string;
  moonSignLord: string;
  moonStarLord: string;
  moonSubLord: string;
  moonSubSubLord: string;
  dayLord: string;
  timestamp: string;
}

export interface KPChart {
  birthData: {
    name: string;
    gender: 'Male' | 'Female';
    date: string;
    time: string;
    place: string;
    latitude: number;
    longitude: number;
    timezone: number;
  };
  planets: KPPlanet[];
  houses: KPHouse[];
  rulingPlanets: RulingPlanets;
  currentDasha: DashaInfo;
  houseSignificators: Record<number, string[]>;
  planetSignificators: Record<string, PlanetSignificatorLevels>;
  /**
   * Optional D-9 (Navamsa) planetary positions. When present, the verdict
   * engine performs a genuine Vedic cross-validation (Step 7) instead of
   * reporting a hardcoded pass. Consumers building KPChart objects should
   * populate this from the D9 divisional chart when available.
   */
  navamsaPlanets?: KPPlanet[];
}

export interface KPQuery {
  question: string;
  topic: TopicEnum;
  relevantHouse: number;
  targetDate?: string;
}

export interface KPVerdictStep {
  stepNumber: number;
  title: string;
  description: string;
  status: 'PASSED' | 'WARNING' | 'FAILED' | 'NEUTRAL';
  textbookRef?: string;
}

export interface KPVerdict {
  promise: VerdictPromise;
  timing: string;
  quality: QualityLevel;
  confidence: ConfidenceLevel;
  confidenceScore: number; // 0 - 100 percentage
  confidenceBreakdown?: {
    gatekeeperScore: number; // 0.0 - 1.0
    significatorScore: number; // 0.0 - 1.0
    dashaScore: number; // 0.0 - 1.0
    transitScore: number; // 0.0 - 1.0
    vedicScore: number; // 0.0 - 1.0
  };
  explanation: string;
  steps: KPVerdictStep[];
  obstacles?: string[];
  alternativeScenarios?: {
    title: string;
    description: string;
    timing: string;
    probability: string;
  }[];
  reasoning: {
    cuspSubLord: string;
    cuspSubLordHouses: number[];
    significators: string[];
    dashaStatus: string;
    transitSupport: string;
    vedicGocharaCheck?: string;
    vedicSupport: string;
  };
  contextualization?: {
    acknowledgment: string;
    recommendations: string[];
    reassurance: string;
    actionPlan: string;
  };
  /**
   * Surfaces data-completeness issues that affected this verdict (e.g. no
   * D9 data supplied, no significators found for the house, missing dasha
   * info that forced a fallback). Empty array means no known gaps. This
   * replaces prior silent fallbacks so callers/UI can flag low-trust
   * verdicts instead of presenting them with false confidence.
   */
  dataQualityWarnings?: string[];
  /**
   * Ruling Planets (RP) synthesis — the KP "micro-timing" cross-check.
   * While the Verdict's Dasha/Bhukti/Pratyantardasha analysis establishes
   * the macro promise (what the chart allows and roughly when), Ruling
   * Planets represent the live planetary signature of the exact moment the
   * question is asked (Lagna sign/star/sub lords, Moon sign/star/sub
   * lords, Day Lord). When the planets ruling THIS moment overlap with the
   * house's significators or the active Dasha lords, that convergence is
   * the traditional KP signal that the moment itself is "ripe" — not just
   * that the chart structurally allows the event eventually.
   */
  rulingPlanetConfirmation?: {
    rulingPlanets: RulingPlanets;
    /** Planets appearing in both the RP list and (significators or active dasha lords), most-important first. */
    overlappingPlanets: string[];
    /** Whether the traditionally most-weighted RP layers (Lagna Sub Lord, Lagna Star Lord, Moon Star Lord) are among the overlaps. */
    topTierMatch: boolean;
    convergenceLevel: 'HIGH' | 'MODERATE' | 'LOW';
    synthesis: string;
  };
  /**
   * A short, plain-English summary of the verdict for a non-technical
   * reader, synthesizing promise + timing + RP confirmation into 2-4
   * sentences without KP jargon (house numbers, sub-lord chains, textbook
   * refs). The full technical `steps`/`reasoning` remain available for
   * anyone who wants to see the underlying working.
   */
  plainSummary?: string;
}

export interface DomainPrediction {
  topic: TopicEnum;
  domainName: string;
  icon: string;
  houses: number[];
  verdict: KPVerdict;
}