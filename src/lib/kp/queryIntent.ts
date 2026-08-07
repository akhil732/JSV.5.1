/**
 * Query Intent Recognition & Domain Mapping Types
 * Based on KP Astrology principles for deterministic query classification
 */

import { KPVerdictStep } from '../../types/kp';

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
  timing: any; // Can be string or structured timing object
  analysisSteps: any[];  // Steps can be KPVerdictStep[] or string[]
  confidence: number;       // Overall confidence (0-100)
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
