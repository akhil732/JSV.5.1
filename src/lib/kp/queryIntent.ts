/**
 * Query Intent Recognition & Domain Mapping Types
 * Based on KP Astrology principles for deterministic query classification
 */

import { KPVerdictStep, RulingPlanets } from '../../types/kp';

/**
 * Life domain categories aligned with KP house significations
 */
export type LifeDomain = 
  | 'CAREER' 
  | 'FINANCE' 
  | 'MARRIAGE' 
  | 'HEALTH' 
  | 'EDUCATION' 
  | 'CHILDREN'
  | 'PROPERTY' 
  | 'LEGAL' 
  | 'TRAVEL'
  | 'SPIRITUAL'
  | 'RELATIONSHIPS';

export type IntentDomain = LifeDomain; // Alias for backwards-compatibility

/**
 * Primary house and secondary houses for each domain
 * Based on KP textbook house significations
 */
export interface DomainHouseMapping {
  domain: LifeDomain;
  primaryHouse: number;      // Main house for this domain
  secondaryHouses: number[];  // Supporting houses
  tertiarySub?: string[];     // Optional sub-categories
}

/**
 * Query intent with confidence scoring
 */
export interface QueryIntent {
  domain: LifeDomain;
  confidence: number;         // 0-100
  primaryHouse: number;
  secondaryHouses: number[];
  keywordMatches: string[];   // Keywords that triggered this intent
  keywordsMatched: string[];  // Alias for backward compatibility
  requiresClarification: boolean;
  alternativeIntents?: QueryIntent[]; // For ambiguous queries
  alternativeDomains?: IntentDomain[]; // Backward compatibility
}

/**
 * Result of intent recognition process
 */
export interface IntentRecognitionResult {
  query: string;
  intent: QueryIntent;
  detectionMethod: 'KEYWORD' | 'SEMANTIC' | 'USER_INPUT';
  timestamp: number;
  rawScores: Record<IntentDomain, number>;
}

/**
 * KP Professional Significator combination
 * Triple-planet rule: Sub-Lord + Constellation Lord + Sign Lord
 */
export interface ProfessionalSignificator {
  signLord: string;           // Sign lord (e.g., Mars for Aries)
  constellationLord: string;  // Constellation lord (e.g., Sun)
  subLord: string;            // Sub-lord (e.g., Sun, Moon, Mars, etc.)
  professions: string[];      // List of suitable professions
  profession?: string;        // Backward compatibility
  details?: string;           // Backward compatibility
  characteristics?: string;   // Professional characteristics
  confidence?: number;        // How strong this significator is (0-100)
}

/**
 * House cusp sub-lord gatekeeper verdict
 */
export interface GatekeeperVerdict {
  houseNumber?: number;
  cuspSubLord?: string;
  verdict?: 'YES' | 'DELAYED' | 'NO';
  status: 'YES' | 'DELAYED' | 'NO'; // Compatibility
  isFavorable: boolean; // Compatibility
  hasUnfavorable: boolean; // Compatibility
  signifiedHouses?: number[];
  explanation?: string;
  reasoning: string; // Compatibility
  confidence: number;
}

/**
 * Complete query analysis result
 */
export interface QueryAnalysisResult {
  originalQuery: string;
  intent: QueryIntent;
  house: number;
  houseCuspSubLord: string;
  gatekeeperVerdict: GatekeeperVerdict;
  professionalSignificators: any[]; // Supports both old string[] and new ProfessionalSignificator[]
  activeMaxadasha: string;
  activeBhukti: string;
  /**
   * Active Pratyantardasha (PD) lord and exact date range, when the chart's
   * full 120-year timeline was available to compute it. PD is a finer
   * timing unit than Bhukti — narrows a multi-year Antardasha window down
   * to a period typically weeks-to-months long.
   */
  activePratyantardasha?: string;
  activePratyantardashaStart?: string;
  activePratyantardashaEnd?: string;
  timing: any; // Can be string or structured timing object
  analysisSteps: any[];  // Steps can be KPVerdictStep[] or string[]
  confidence: number;       // Overall confidence (0-100)
  /**
   * Topic-specific obstacle/caution text produced by the verdict engine
   * (e.g. retrograde significators, malefic cusp connections, D-9
   * conflicts). Prefer this over any hardcoded generic caution string —
   * it reflects the actual topic (children/career/marriage/etc.), not a
   * one-size-fits-all "legal/financial paperwork" message.
   */
  obstacles?: string[];
  /**
   * Jargon-free 2-4 sentence synthesis of promise + PD timing + Ruling
   * Planet convergence, meant to be the primary thing a non-technical
   * reader sees. The full technical `analysisSteps` remain available
   * underneath for anyone who wants the underlying working.
   */
  plainSummary?: string;
  /**
   * Ruling Planets (RP) micro-timing cross-check — the live planetary
   * signature of the exact moment the question is asked, cross-referenced
   * against this house's significators and active Dasha lords. See
   * kpVerdictEngine.ts's synthesizeRulingPlanets() for the full rationale.
   */
  rulingPlanetConfirmation?: {
    rulingPlanets: RulingPlanets;
    overlappingPlanets: string[];
    topTierMatch: boolean;
    convergenceLevel: 'HIGH' | 'MODERATE' | 'LOW';
    synthesis: string;
  };
  requiredClarification?: {
    question: string;
    options: string[];
  };
}

/**
 * Clarification response from user
 */
export interface UserClarificationResponse {
  originalQuery: string;
  clarificationQuestion: string;
  selectedOption: string;
  finalIntent: QueryIntent;
}

/**
 * Keyword pattern for intent matching
 */
export interface KeywordPattern {
  domain: LifeDomain;
  keywords: string[];
  weightage: number;        // Importance of this match (0-100)
  contextFree: boolean;     // Can match without additional context
  excludeKeywords?: string[]; // Keywords that would exclude this intent
}

/**
 * Domain-to-houses lookup table
 */
export interface DomainConfig {
  domain: LifeDomain;
  primaryHouse: number;
  secondaryHouses: number[];
  kutas?: string[];         // For marriage: Yoni, Guna, Bhakut, etc.
  doshas?: string[];        // For marriage: Manglik, etc.
  significators?: string[]; // Planets that signify this domain
  queryPatterns: KeywordPattern[];
}

export interface ClarificationOption {
  text: string;
  domain: IntentDomain;
  primaryHouse: number;
}

export interface ClarificationDetails {
  question: string;
  options: string[];
}