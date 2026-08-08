/**
 * Query Intent Recognizer - Hybrid Keyword + Gemini Semantic Analysis
 * Two-stage system: Fast keyword matching first, then semantic fallback for ambiguous queries
 */

import { 
  QueryIntent, 
  IntentRecognitionResult, 
  LifeDomain,
  UserClarificationResponse,
  IntentDomain
} from './queryIntent';
import { DOMAIN_HOUSE_MAPPING, getPrimaryHouse, DOMAIN_MAPPINGS, detectAmbiguity, getDomainDescription } from './houseDomainMapper';

/**
 * Configuration for confidence thresholds
 */
export const CONFIDENCE_THRESHOLDS = {
  CERTAIN: 85,          // Intent is clear, no clarification needed
  LIKELY: 70,           // Intent is probable, but some ambiguity
  AMBIGUOUS: 50,        // Multiple possible intents
  UNCLEAR: 0            // Intent cannot be determined
};

/**
 * Stage 1: Keyword-based intent recognition
 * Fast, offline, reliable for common queries
 */
export class KeywordMatcher {
  /**
   * Analyze query using keyword matching
   */
  static analyzeQuery(query: string): QueryIntent | null {
    if (!query || query.trim().length === 0) {
      return null;
    }

    const lowerQuery = query.toLowerCase();
    // Normalize special characters and split
    const normalized = lowerQuery.replace(/[?@#$.!,;:]/g, ' ');
    const queryWords = normalized.split(/\s+/).filter(Boolean);

    let bestMatch: {
      domain: LifeDomain;
      confidence: number;
      keywordMatches: string[];
      score: number;
    } | null = null;

    // Iterate through all domains and their patterns
    for (const [domain, config] of Object.entries(DOMAIN_HOUSE_MAPPING)) {
      for (const pattern of config.queryPatterns) {
        const matches = this.findKeywordMatches(
          queryWords,
          pattern.keywords,
          pattern.excludeKeywords || []
        );

        if (matches.length > 0) {
          // Calculate confidence score (if matched, we use the base weightage with a slight bonus for multiple matches)
          const baseConfidence = pattern.weightage;
          const matchRatio = Math.min(matches.length / 2, 1); // Cap at 1 (2 matches = max score, 1 match = decent score)
          const confidence = Math.min(baseConfidence * (0.8 + 0.2 * matchRatio), 100);

          // Bonus for context-free patterns
          const finalConfidence = pattern.contextFree ? confidence + 5 : confidence;

          // Update best match if this is better
          if (!bestMatch || finalConfidence > bestMatch.score) {
            bestMatch = {
              domain: domain as LifeDomain,
              confidence: Math.min(finalConfidence, 100),
              keywordMatches: matches,
              score: finalConfidence
            };
          }
        }
      }
    }

    if (!bestMatch) {
      return null;
    }

    const domainConfig = DOMAIN_HOUSE_MAPPING[bestMatch.domain];

    return {
      domain: bestMatch.domain,
      confidence: bestMatch.confidence,
      primaryHouse: domainConfig.primaryHouse,
      secondaryHouses: domainConfig.secondaryHouses,
      keywordMatches: bestMatch.keywordMatches,
      keywordsMatched: bestMatch.keywordMatches, // Compatibility
      requiresClarification: bestMatch.confidence < CONFIDENCE_THRESHOLDS.CERTAIN
    };
  }

  /**
   * Find matching keywords in query
   */
  private static findKeywordMatches(
    queryWords: string[],
    keywords: string[],
    excludeKeywords: string[]
  ): string[] {
    const matches: string[] = [];

    // Check for exclude keywords first
    for (const exclude of excludeKeywords) {
      if (queryWords.some(word => word.includes(exclude.toLowerCase()))) {
        return []; // Exclude this pattern if negative keywords found
      }
    }

    // Find matching keywords
    const fullQuery = queryWords.join(' ');

    for (const keyword of keywords) {
      const lowerKeyword = keyword.toLowerCase();
      
      // Direct full query substring match (ideal for Telugu words and multi-word phrases)
      if (fullQuery.includes(lowerKeyword)) {
        if (!matches.includes(keyword)) {
          matches.push(keyword);
        }
        continue;
      }

      // Single-word keyword matching
      for (const queryWord of queryWords) {
        const matchesExact = queryWord === lowerKeyword;
        const queryStartsWithKeyword = queryWord.startsWith(lowerKeyword);
        const queryIncludesKeyword = queryWord.includes(lowerKeyword);
        // REMOVED: a former `keywordIncludesQuery` rule matched whenever a
        // short (>=3 char) word from the user's query happened to be a
        // SUBSTRING of a longer keyword (lowerKeyword.includes(queryWord)).
        // That's an unsafe direction: any common short word that happens to
        // sit inside some domain's keyword string falsely triggers that
        // domain, regardless of meaning. Confirmed in production testing:
        // "Should I do more prayer and meditation for peace?" (a SPIRITUAL
        // query) was misclassified as FINANCE, because the query word "for"
        // is a substring of the FINANCE keyword "fortune". The forward
        // rules above (queryStartsWithKeyword / queryIncludesKeyword —
        // keyword found inside the user's actual word, e.g. "marriages"
        // still contains "marriage") already handle legitimate
        // typo/inflection matching safely; this reverse rule added no safe
        // matching value and was a source of silent misclassification for
        // any query containing common short words.

        if (matchesExact || queryStartsWithKeyword || queryIncludesKeyword) {
          if (!matches.includes(keyword)) {
            matches.push(keyword);
          }
          break;
        }
      }
    }

    return matches;
  }
}

/**
 * Stage 2: Semantic analysis via Gemini API
 * Used when keyword matching confidence is below threshold
 */
export class SemanticAnalyzer {
  private static readonly GEMINI_MODEL = 'gemini-3.5-flash';

  /**
   * Analyze query semantically using Gemini
   */
  static async analyzeSemanticIntent(query: string): Promise<QueryIntent | null> {
    try {
      // In browser, securely route through backend endpoint
      if (typeof window !== 'undefined') {
        const response = await fetch('/api/kp/recognize-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query })
        });

        if (response.ok) {
          const data = await response.json();
          if (data && data.intent) {
            return {
              domain: data.intent.domain as LifeDomain,
              confidence: data.intent.confidence || 75,
              primaryHouse: data.intent.primaryHouse,
              secondaryHouses: data.intent.secondaryHouses || [],
              keywordMatches: [],
              keywordsMatched: [],
              requiresClarification: !!data.intent.requiresClarification,
              alternativeDomains: data.intent.alternativeDomains || []
            };
          }
        }
        return null;
      }

      // Server-side / Node execution fallback (using process.env.GEMINI_API_KEY)
      const apiKey = typeof process !== 'undefined' && process?.env ? process.env.GEMINI_API_KEY : '';
      if (!apiKey) {
        return null;
      }

      const prompt = this.buildSemanticPrompt(query);
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.GEMINI_MODEL}:generateContent?key=${apiKey}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      });

      if (!response.ok) {
        console.warn('Gemini API direct call returned non-OK status:', response.statusText);
        return null;
      }

      const data = await response.json();
      const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      return this.parseSemanticResponse(responseText, query);
    } catch (error) {
      console.error('Semantic analysis error:', error);
      return null;
    }
  }

  /**
   * Build prompt for semantic analysis
   */
  private static buildSemanticPrompt(query: string): string {
    const domains = Object.keys(DOMAIN_HOUSE_MAPPING).join(', ');

    return `You are a Vedic astrology query classifier. Analyze the user's question and determine the PRIMARY life domain it relates to.

User Query: "${query}"

Possible domains: ${domains}

Respond with ONLY a JSON object (no markdown, no explanation):
{
  "domain": "DOMAIN_NAME",
  "confidence": 85,
  "reasoning": "Brief explanation",
  "alternativeDomains": ["DOMAIN2", "DOMAIN3"]
}

Domain definitions:
- CAREER: Questions about profession, jobs, business, work suitability
- FINANCE: Questions about wealth, money, income, investments, loans
- MARRIAGE: Questions about marriage timing, partnerships, spouse
- HEALTH: Questions about disease, medical conditions, vitality
- EDUCATION: Questions about studies, exams, learning, courses
- CHILDREN: Questions about children, child birth, progeny, pregnancy, fertility, conception, family expansion, kids
- PROPERTY: Questions about houses, land, real estate, inheritance
- LEGAL: Questions about court cases, disputes, litigation
- TRAVEL: Questions about foreign travel, migration, overseas
- SPIRITUAL: Questions about religion, spirituality, dharma
- RELATIONSHIPS: Questions about friendships, family, social connections

Return ONLY valid JSON, no other text.`;
  }

  /**
   * Parse semantic response from Gemini
   */
  private static parseSemanticResponse(responseText: string, query: string): QueryIntent | null {
    try {
      let cleanedResponse = responseText.replace(/```json\n?|\n?```/g, '').trim();
      const parsed = JSON.parse(cleanedResponse);

      if (!parsed.domain || !Object.keys(DOMAIN_HOUSE_MAPPING).includes(parsed.domain)) {
        return null;
      }

      const domainConfig = DOMAIN_HOUSE_MAPPING[parsed.domain as LifeDomain];

      return {
        domain: parsed.domain as LifeDomain,
        confidence: parsed.confidence || 75,
        primaryHouse: domainConfig.primaryHouse,
        secondaryHouses: domainConfig.secondaryHouses,
        keywordMatches: [],
        keywordsMatched: [],
        requiresClarification: (parsed.confidence || 75) < CONFIDENCE_THRESHOLDS.CERTAIN
      };
    } catch (error) {
      console.error('Failed to parse semantic response:', error);
      return null;
    }
  }
}

/**
 * Clarification Dialog Manager
 */
export class ClarificationManager {
  /**
   * Generate clarification question for ambiguous intent
   */
  static generateClarificationQuestion(
    query: string,
    primaryDomain: LifeDomain,
    alternativeDomains?: LifeDomain[]
  ): { question: string; options: string[] } {
    // Special case for ambiguous domains
    if (primaryDomain === 'FINANCE' && alternativeDomains?.includes('CAREER')) {
      return {
        question: 'Is your question about business/career or about financial gains/wealth?',
        options: [
          'Business type/career suitability (CAREER)',
          'Financial gains/wealth accumulation (FINANCE)',
          'Both - Business profitability'
        ]
      };
    }

    if (primaryDomain === 'MARRIAGE' && alternativeDomains?.includes('RELATIONSHIPS')) {
      return {
        question: 'Is your question about marriage specifically or general relationships?',
        options: [
          'Marriage/Partnership (MARRIAGE)',
          'Friendships/Family (RELATIONSHIPS)',
          'Both'
        ]
      };
    }

    if (primaryDomain === 'TRAVEL' && alternativeDomains?.includes('PROPERTY')) {
      return {
        question: 'Is your question about traveling abroad or settling/moving permanently?',
        options: [
          'Temporary travel/visit (TRAVEL)',
          'Permanent settlement/property (PROPERTY)',
          'Both'
        ]
      };
    }

    // Generic clarification
    return {
      question: `Your question might relate to ${primaryDomain}. Is this correct?`,
      options: [
        `Yes, ${primaryDomain}`,
        'No, something else',
        'Show me alternatives'
      ]
    };
  }

  /**
   * Process user's clarification response
   */
  static processClarificationResponse(
    response: UserClarificationResponse
  ): QueryIntent {
    const selectedDomain =
      this.mapResponseToDomain(response.selectedOption) ||
      response.finalIntent?.domain ||
      'CAREER';

    const domainConfig = DOMAIN_HOUSE_MAPPING[selectedDomain] || DOMAIN_HOUSE_MAPPING.CAREER;

    return {
      domain: selectedDomain,
      confidence: 95, // Confidence increases after user clarification
      primaryHouse: domainConfig.primaryHouse,
      secondaryHouses: domainConfig.secondaryHouses,
      keywordMatches: [],
      keywordsMatched: [],
      requiresClarification: false
    };
  }

  /**
   * Map user response to domain
   */
  private static mapResponseToDomain(response: string): LifeDomain | null {
    if (!response) return null;
    const lowerResponse = response.toLowerCase();

    // Extract domain from response
    for (const domain of Object.keys(DOMAIN_HOUSE_MAPPING)) {
      if (lowerResponse.includes(domain.toLowerCase())) {
        return domain as LifeDomain;
      }
    }

    // Common mappings
    if (lowerResponse.includes('career') || lowerResponse.includes('profession') || lowerResponse.includes('job') || lowerResponse.includes('work') || lowerResponse.includes('business')) {
      return 'CAREER';
    }
    if (lowerResponse.includes('finance') || lowerResponse.includes('wealth') || lowerResponse.includes('money') || lowerResponse.includes('gain') || lowerResponse.includes('financial')) {
      return 'FINANCE';
    }
    if (lowerResponse.includes('marriage') || lowerResponse.includes('partner') || lowerResponse.includes('spouse') || lowerResponse.includes('wedding')) {
      return 'MARRIAGE';
    }
    if (lowerResponse.includes('relationship') || lowerResponse.includes('friend') || lowerResponse.includes('family')) {
      return 'RELATIONSHIPS';
    }
    if (lowerResponse.includes('property') || lowerResponse.includes('house') || lowerResponse.includes('land') || lowerResponse.includes('real estate')) {
      return 'PROPERTY';
    }
    if (lowerResponse.includes('health') || lowerResponse.includes('disease') || lowerResponse.includes('medical') || lowerResponse.includes('wellness')) {
      return 'HEALTH';
    }
    if (lowerResponse.includes('education') || lowerResponse.includes('study') || lowerResponse.includes('exam') || lowerResponse.includes('school')) {
      return 'EDUCATION';
    }
    if (lowerResponse.includes('child') || lowerResponse.includes('children') || lowerResponse.includes('progeny') || lowerResponse.includes('kid')) {
      return 'CHILDREN';
    }
    if (lowerResponse.includes('legal') || lowerResponse.includes('court') || lowerResponse.includes('case') || lowerResponse.includes('dispute')) {
      return 'LEGAL';
    }
    if (lowerResponse.includes('travel') || lowerResponse.includes('foreign') || lowerResponse.includes('abroad') || lowerResponse.includes('visit')) {
      return 'TRAVEL';
    }
    if (lowerResponse.includes('spiritual') || lowerResponse.includes('dharma') || lowerResponse.includes('religion')) {
      return 'SPIRITUAL';
    }

    return null;
  }
}

/**
 * Main Query Intent Recognition API
 */
export class QueryIntentRecognizer {
  /**
   * Performs quick local keyword-based intent classification
   * BACKWARD COMPATIBILITY
   */
  static matchKeywords(query: string): IntentRecognitionResult {
    const intent = KeywordMatcher.analyzeQuery(query) || {
      domain: 'CAREER',
      confidence: 30,
      primaryHouse: 10,
      secondaryHouses: [6, 11],
      keywordMatches: [],
      keywordsMatched: [],
      requiresClarification: true
    };

    // Calculate raw scores for visualization in UI debugger
    const rawScores: Record<IntentDomain, number> = {
      CAREER: intent.domain === 'CAREER' ? intent.confidence : 0,
      FINANCE: intent.domain === 'FINANCE' ? intent.confidence : 0,
      MARRIAGE: intent.domain === 'MARRIAGE' ? intent.confidence : 0,
      HEALTH: intent.domain === 'HEALTH' ? intent.confidence : 0,
      EDUCATION: intent.domain === 'EDUCATION' ? intent.confidence : 0,
      CHILDREN: intent.domain === 'CHILDREN' ? intent.confidence : 0,
      PROPERTY: intent.domain === 'PROPERTY' ? intent.confidence : 0,
      LEGAL: intent.domain === 'LEGAL' ? intent.confidence : 0,
      TRAVEL: intent.domain === 'TRAVEL' ? intent.confidence : 0,
      SPIRITUAL: intent.domain === 'SPIRITUAL' ? intent.confidence : 0,
      RELATIONSHIPS: intent.domain === 'RELATIONSHIPS' ? intent.confidence : 0
    };

    // Include custom ambiguity checks
    const matchedDomains = Object.keys(rawScores).filter(k => rawScores[k as LifeDomain] > 0) as LifeDomain[];
    const customAmbiguity = detectAmbiguity(query, matchedDomains);
    if (customAmbiguity) {
      intent.requiresClarification = true;
    }

    return {
      query,
      intent: {
        ...intent,
        keywordsMatched: intent.keywordMatches,
        keywordMatches: intent.keywordMatches
      },
      rawScores,
      timestamp: Date.now(),
      detectionMethod: 'KEYWORD'
    };
  }

  /**
   * Recognize intent from user query
   * Strategy: Keyword first (fast), Semantic second (accurate)
   */
  static async recognizeIntent(query: string): Promise<IntentRecognitionResult> {
    const timestamp = Date.now();

    // Stage 1: Keyword matching
    const keywordIntent = KeywordMatcher.analyzeQuery(query);

    // If we have a certain matching and no custom ambiguity, return immediately
    const matchedDomains = keywordIntent ? [keywordIntent.domain] : [];
    const customAmbiguity = detectAmbiguity(query, matchedDomains);

    if (keywordIntent && keywordIntent.confidence >= CONFIDENCE_THRESHOLDS.CERTAIN && !customAmbiguity) {
      return {
        query,
        intent: {
          ...keywordIntent,
          keywordsMatched: keywordIntent.keywordMatches,
          keywordMatches: keywordIntent.keywordMatches
        },
        detectionMethod: 'KEYWORD',
        timestamp,
        rawScores: {
          CAREER: keywordIntent.domain === 'CAREER' ? keywordIntent.confidence : 0,
          FINANCE: keywordIntent.domain === 'FINANCE' ? keywordIntent.confidence : 0,
          MARRIAGE: keywordIntent.domain === 'MARRIAGE' ? keywordIntent.confidence : 0,
          HEALTH: keywordIntent.domain === 'HEALTH' ? keywordIntent.confidence : 0,
          EDUCATION: keywordIntent.domain === 'EDUCATION' ? keywordIntent.confidence : 0,
          CHILDREN: keywordIntent.domain === 'CHILDREN' ? keywordIntent.confidence : 0,
          PROPERTY: keywordIntent.domain === 'PROPERTY' ? keywordIntent.confidence : 0,
          LEGAL: keywordIntent.domain === 'LEGAL' ? keywordIntent.confidence : 0,
          TRAVEL: keywordIntent.domain === 'TRAVEL' ? keywordIntent.confidence : 0,
          SPIRITUAL: keywordIntent.domain === 'SPIRITUAL' ? keywordIntent.confidence : 0,
          RELATIONSHIPS: keywordIntent.domain === 'RELATIONSHIPS' ? keywordIntent.confidence : 0
        }
      };
    }

    // Stage 2: Semantic analysis for low-confidence or ambiguous queries
    const semanticIntent = await SemanticAnalyzer.analyzeSemanticIntent(query);

    if (semanticIntent) {
      return {
        query,
        intent: {
          ...semanticIntent,
          keywordsMatched: semanticIntent.keywordMatches,
          keywordMatches: semanticIntent.keywordMatches
        },
        detectionMethod: 'SEMANTIC',
        timestamp,
        rawScores: {
          CAREER: semanticIntent.domain === 'CAREER' ? semanticIntent.confidence : 0,
          FINANCE: semanticIntent.domain === 'FINANCE' ? semanticIntent.confidence : 0,
          MARRIAGE: semanticIntent.domain === 'MARRIAGE' ? semanticIntent.confidence : 0,
          HEALTH: semanticIntent.domain === 'HEALTH' ? semanticIntent.confidence : 0,
          EDUCATION: semanticIntent.domain === 'EDUCATION' ? semanticIntent.confidence : 0,
          CHILDREN: semanticIntent.domain === 'CHILDREN' ? semanticIntent.confidence : 0,
          PROPERTY: semanticIntent.domain === 'PROPERTY' ? semanticIntent.confidence : 0,
          LEGAL: semanticIntent.domain === 'LEGAL' ? semanticIntent.confidence : 0,
          TRAVEL: semanticIntent.domain === 'TRAVEL' ? semanticIntent.confidence : 0,
          SPIRITUAL: semanticIntent.domain === 'SPIRITUAL' ? semanticIntent.confidence : 0,
          RELATIONSHIPS: semanticIntent.domain === 'RELATIONSHIPS' ? semanticIntent.confidence : 0
        }
      };
    }

    // Fallback: Return best keyword match
    if (keywordIntent) {
      return {
        query,
        intent: {
          ...keywordIntent,
          keywordsMatched: keywordIntent.keywordMatches,
          keywordMatches: keywordIntent.keywordMatches
        },
        detectionMethod: 'KEYWORD',
        timestamp,
        rawScores: {
          CAREER: keywordIntent.domain === 'CAREER' ? keywordIntent.confidence : 0,
          FINANCE: keywordIntent.domain === 'FINANCE' ? keywordIntent.confidence : 0,
          MARRIAGE: keywordIntent.domain === 'MARRIAGE' ? keywordIntent.confidence : 0,
          HEALTH: keywordIntent.domain === 'HEALTH' ? keywordIntent.confidence : 0,
          EDUCATION: keywordIntent.domain === 'EDUCATION' ? keywordIntent.confidence : 0,
          CHILDREN: keywordIntent.domain === 'CHILDREN' ? keywordIntent.confidence : 0,
          PROPERTY: keywordIntent.domain === 'PROPERTY' ? keywordIntent.confidence : 0,
          LEGAL: keywordIntent.domain === 'LEGAL' ? keywordIntent.confidence : 0,
          TRAVEL: keywordIntent.domain === 'TRAVEL' ? keywordIntent.confidence : 0,
          SPIRITUAL: keywordIntent.domain === 'SPIRITUAL' ? keywordIntent.confidence : 0,
          RELATIONSHIPS: keywordIntent.domain === 'RELATIONSHIPS' ? keywordIntent.confidence : 0
        }
      };
    }

    // Last resort: Return generic intent
    return {
      query,
      intent: {
        domain: 'CAREER',
        confidence: 30,
        primaryHouse: 10,
        secondaryHouses: [6, 11],
        keywordMatches: [],
        keywordsMatched: [],
        requiresClarification: true
      },
      detectionMethod: 'KEYWORD',
      timestamp,
      rawScores: {
        CAREER: 30,
        FINANCE: 0,
        MARRIAGE: 0,
        HEALTH: 0,
        EDUCATION: 0,
        CHILDREN: 0,
        PROPERTY: 0,
        LEGAL: 0,
        TRAVEL: 0,
        SPIRITUAL: 0,
        RELATIONSHIPS: 0
      }
    };
  }

  /**
   * Get clarification options for ambiguous query
   */
  static getClarificationOptions(
    intent: QueryIntent
  ): { question: string; options: string[] } | null {
    const matchedDomains = [intent.domain, ...(intent.alternativeDomains || [])];
    const customAmbiguity = detectAmbiguity('', matchedDomains);
    if (customAmbiguity) {
      return {
        question: customAmbiguity.question,
        options: customAmbiguity.options.map((opt: any) => typeof opt === 'string' ? opt : opt.text)
      };
    }

    return ClarificationManager.generateClarificationQuestion(
      '',
      intent.domain,
      intent.alternativeIntents?.map(i => i.domain) || intent.alternativeDomains
    );
  }

  /**
   * Process user clarification
   */
  static processClarification(response: UserClarificationResponse): QueryIntent {
    return ClarificationManager.processClarificationResponse(response);
  }
}

/**
 * Export for convenience
 */
// Already exported inline at class definitions