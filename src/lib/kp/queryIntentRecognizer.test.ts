/**
 * Query Intent Recognizer - Comprehensive Test Suite
 * Tests keyword matching, semantic analysis, and clarification flows
 */

import { describe, test, expect } from 'vitest';
import {
  QueryIntentRecognizer,
  KeywordMatcher,
  ClarificationManager,
  CONFIDENCE_THRESHOLDS
} from './queryIntentRecognizer';
import { LifeDomain } from './queryIntent';

describe('QueryIntentRecognizer', () => {
  describe('Career/Profession Queries', () => {
    test('Should recognize business suitability query', () => {
      const result = KeywordMatcher.analyzeQuery('Which business is suitable for me');
      expect(result).not.toBeNull();
      expect(result?.domain).toBe('CAREER');
      expect(result?.confidence).toBeGreaterThan(80);
    });

    test('Should recognize profession query', () => {
      const result = KeywordMatcher.analyzeQuery('What profession will suit me best?');
      expect(result).not.toBeNull();
      expect(result?.domain).toBe('CAREER');
      expect(result?.primaryHouse).toBe(10);
    });

    test('Should recognize job change query', () => {
      const result = KeywordMatcher.analyzeQuery('Should I change my job?');
      expect(result).not.toBeNull();
      expect(result?.domain).toBe('CAREER');
    });

    test('Should recognize startup/business query', () => {
      const result = KeywordMatcher.analyzeQuery('Should I start my own business?');
      expect(result).not.toBeNull();
      expect(result?.domain).toBe('CAREER');
    });

    test('Should recognize career advancement query', () => {
      const result = KeywordMatcher.analyzeQuery('Will I get promotion in my career?');
      expect(result).not.toBeNull();
      expect(result?.domain).toBe('CAREER');
    });

    test('Should recognize employment query', () => {
      const result = KeywordMatcher.analyzeQuery('When will I get employed?');
      expect(result).not.toBeNull();
      expect(result?.domain).toBe('CAREER');
    });
  });

  describe('Finance/Wealth Queries', () => {
    test('Should recognize wealth query', () => {
      const result = KeywordMatcher.analyzeQuery('Will I become wealthy?');
      expect(result).not.toBeNull();
      expect(result?.domain).toBe('FINANCE');
      expect(result?.primaryHouse).toBe(2);
    });

    test('Should recognize income query', () => {
      const result = KeywordMatcher.analyzeQuery('Will my income increase?');
      expect(result).not.toBeNull();
      expect(result?.domain).toBe('FINANCE');
    });

    test('Should recognize loan repayment query', () => {
      const result = KeywordMatcher.analyzeQuery('When can I clear off my loan?');
      expect(result).not.toBeNull();
      expect(result?.domain).toBe('FINANCE');
    });

    test('Should recognize investment query', () => {
      const result = KeywordMatcher.analyzeQuery('Should I invest in this opportunity?');
      expect(result).not.toBeNull();
      expect(result?.domain).toBe('FINANCE');
    });

    test('Should recognize salary query', () => {
      const result = KeywordMatcher.analyzeQuery('When will I get my first salary?');
      expect(result).not.toBeNull();
      expect(result?.domain).toBe('FINANCE');
    });
  });

  describe('Marriage/Partnership Queries', () => {
    test('Should recognize marriage timing query', () => {
      const result = KeywordMatcher.analyzeQuery('When will I get married?');
      expect(result).not.toBeNull();
      expect(result?.domain).toBe('MARRIAGE');
      expect(result?.primaryHouse).toBe(7);
    });

    test('Should recognize spouse query', () => {
      const result = KeywordMatcher.analyzeQuery('Will I marry the person I love?');
      expect(result).not.toBeNull();
      expect(result?.domain).toBe('MARRIAGE');
    });

    test('Should recognize marriage compatibility query', () => {
      const result = KeywordMatcher.analyzeQuery('Are we compatible for marriage?');
      expect(result).not.toBeNull();
      expect(result?.domain).toBe('MARRIAGE');
    });

    test('Should recognize engagement query', () => {
      const result = KeywordMatcher.analyzeQuery('Will I get engaged this year?');
      expect(result).not.toBeNull();
      expect(result?.domain).toBe('MARRIAGE');
    });

    test('Should recognize marriage delay query', () => {
      const result = KeywordMatcher.analyzeQuery('Why is my marriage getting delayed?');
      expect(result).not.toBeNull();
      expect(result?.domain).toBe('MARRIAGE');
    });
  });

  describe('Health Queries', () => {
    test('Should recognize health query', () => {
      const result = KeywordMatcher.analyzeQuery('Will my health improve?');
      expect(result).not.toBeNull();
      expect(result?.domain).toBe('HEALTH');
      expect(result?.primaryHouse).toBe(6);
    });

    test('Should recognize disease query', () => {
      const result = KeywordMatcher.analyzeQuery('Will I recover from this disease?');
      expect(result).not.toBeNull();
      expect(result?.domain).toBe('HEALTH');
    });

    test('Should recognize medical treatment query', () => {
      const result = KeywordMatcher.analyzeQuery('Will my surgery be successful?');
      expect(result).not.toBeNull();
      expect(result?.domain).toBe('HEALTH');
    });

    test('Should recognize fitness query', () => {
      const result = KeywordMatcher.analyzeQuery('How is my overall fitness and vitality?');
      expect(result).not.toBeNull();
      expect(result?.domain).toBe('HEALTH');
    });
  });

  describe('Education Queries', () => {
    test('Should recognize education query', () => {
      const result = KeywordMatcher.analyzeQuery('Will I succeed in my studies?');
      expect(result).not.toBeNull();
      expect(result?.domain).toBe('EDUCATION');
      expect(result?.primaryHouse).toBe(5);
    });

    test('Should recognize exam query', () => {
      const result = KeywordMatcher.analyzeQuery('Will I pass my exams?');
      expect(result).not.toBeNull();
      expect(result?.domain).toBe('EDUCATION');
    });

    test('Should recognize scholarship query', () => {
      const result = KeywordMatcher.analyzeQuery('Will I get a scholarship?');
      expect(result).not.toBeNull();
      expect(result?.domain).toBe('EDUCATION');
    });

    test('Should recognize higher education query', () => {
      const result = KeywordMatcher.analyzeQuery('Should I pursue engineering?');
      expect(result).not.toBeNull();
      expect(result?.domain).toBe('EDUCATION');
    });
  });

  describe('Children/Progeny Queries', () => {
    test('Should recognize child birth timing and quantity query', () => {
      const result = KeywordMatcher.analyzeQuery('What is the ideal timing for child birth and how many children are possible?');
      expect(result).not.toBeNull();
      expect(result?.domain).toBe('CHILDREN');
      expect(result?.primaryHouse).toBe(5);
    });

    test('Should recognize pregnancy and conception query', () => {
      const result = KeywordMatcher.analyzeQuery('When will we conceive a baby?');
      expect(result).not.toBeNull();
      expect(result?.domain).toBe('CHILDREN');
      expect(result?.primaryHouse).toBe(5);
    });

    test('Should recognize progeny prospects query', () => {
      const result = KeywordMatcher.analyzeQuery('What are my progeny prospects and child luck?');
      expect(result).not.toBeNull();
      expect(result?.domain).toBe('CHILDREN');
    });
  });

  describe('Property Queries', () => {
    test('Should recognize house purchase query', () => {
      const result = KeywordMatcher.analyzeQuery('When can I buy a house?');
      expect(result).not.toBeNull();
      expect(result?.domain).toBe('PROPERTY');
      expect(result?.primaryHouse).toBe(4);
    });

    test('Should recognize real estate query', () => {
      const result = KeywordMatcher.analyzeQuery('Is this a good property to invest?');
      expect(result).not.toBeNull();
      expect(result?.domain).toBe('PROPERTY');
    });

    test('Should recognize inheritance query', () => {
      const result = KeywordMatcher.analyzeQuery('Will I inherit ancestral property?');
      expect(result).not.toBeNull();
      expect(result?.domain).toBe('PROPERTY');
    });

    test('Should recognize land query', () => {
      const result = KeywordMatcher.analyzeQuery('Will I be able to own land?');
      expect(result).not.toBeNull();
      expect(result?.domain).toBe('PROPERTY');
    });
  });

  describe('Travel/Migration Queries', () => {
    test('Should recognize foreign travel query', () => {
      const result = KeywordMatcher.analyzeQuery('Will I travel abroad?');
      expect(result).not.toBeNull();
      expect(result?.domain).toBe('TRAVEL');
      expect(result?.primaryHouse).toBe(12);
    });

    test('Should recognize overseas settlement query', () => {
      const result = KeywordMatcher.analyzeQuery('Should I migrate to another country?');
      expect(result).not.toBeNull();
      expect(result?.domain).toBe('TRAVEL');
    });

    test('Should recognize visa query', () => {
      const result = KeywordMatcher.analyzeQuery('Will I get a visa for the USA?');
      expect(result).not.toBeNull();
      expect(result?.domain).toBe('TRAVEL');
    });
  });

  describe('Legal Queries', () => {
    test('Should recognize court case query', () => {
      const result = KeywordMatcher.analyzeQuery('Will I win my court case?');
      expect(result).not.toBeNull();
      expect(result?.domain).toBe('LEGAL');
      expect(result?.primaryHouse).toBe(6);
    });

    test('Should recognize litigation query', () => {
      const result = KeywordMatcher.analyzeQuery('What will be the outcome of this lawsuit?');
      expect(result).not.toBeNull();
      expect(result?.domain).toBe('LEGAL');
    });
  });

  describe('Spiritual Queries', () => {
    test('Should recognize spiritual query', () => {
      const result = KeywordMatcher.analyzeQuery('Will I find spiritual enlightenment?');
      expect(result).not.toBeNull();
      expect(result?.domain).toBe('SPIRITUAL');
      expect(result?.primaryHouse).toBe(9);
    });

    test('Should recognize meditation query', () => {
      const result = KeywordMatcher.analyzeQuery('Should I practice meditation?');
      expect(result).not.toBeNull();
      expect(result?.domain).toBe('SPIRITUAL');
    });
  });

  describe('Relationship Queries', () => {
    test('Should recognize friendship query', () => {
      const result = KeywordMatcher.analyzeQuery('Will this friendship last?');
      expect(result).not.toBeNull();
      expect(result?.domain).toBe('RELATIONSHIPS');
      expect(result?.primaryHouse).toBe(7);
    });

    test('Should recognize family query', () => {
      const result = KeywordMatcher.analyzeQuery('Will there be peace in my family?');
      expect(result).not.toBeNull();
      expect(result?.domain).toBe('RELATIONSHIPS');
    });
  });

  describe('Ambiguous Queries', () => {
    test('Should flag business query as potentially career or finance', () => {
      const result = KeywordMatcher.analyzeQuery('Will my business succeed?');
      expect(result).not.toBeNull();
      if (result?.confidence && result.confidence < CONFIDENCE_THRESHOLDS.CERTAIN) {
        expect(result.requiresClarification).toBe(true);
      }
    });

    test('Should handle unclear query gracefully', () => {
      const result = KeywordMatcher.analyzeQuery('What will happen in my life?');
      expect(result).toBeNull(); // Too vague for keyword matching
    });
  });

  describe('Clarification Manager', () => {
    test('Should generate clarification for career vs finance', () => {
      const clarification = ClarificationManager.generateClarificationQuestion(
        'Will my business succeed?',
        'CAREER',
        ['FINANCE']
      );
      expect(clarification.question).toBeDefined();
      expect(clarification.options.length).toBeGreaterThan(0);
    });

    test('Should process user clarification response', () => {
      const response = {
        originalQuery: 'Will my business succeed?',
        clarificationQuestion: 'Is your question about business/career or about financial gains?',
        selectedOption: 'Business type/career suitability (CAREER)',
        finalIntent: {
          domain: 'CAREER' as LifeDomain,
          confidence: 95,
          primaryHouse: 10,
          secondaryHouses: [6, 11],
          keywordMatches: [],
          keywordsMatched: [],
          requiresClarification: false
        }
      };

      const result = ClarificationManager.processClarificationResponse(response);
      expect(result.domain).toBe('CAREER');
      expect(result.confidence).toBe(95);
      expect(result.requiresClarification).toBe(false);
    });
  });

  describe('Confidence Scoring', () => {
    test('Should assign high confidence to clear queries', () => {
      const result = KeywordMatcher.analyzeQuery('Will I get married?');
      expect(result?.confidence).toBeGreaterThan(CONFIDENCE_THRESHOLDS.CERTAIN);
    });

    test('Should include keyword matches in result', () => {
      const result = KeywordMatcher.analyzeQuery('Which business should I start?');
      expect(result?.keywordMatches).toBeDefined();
      expect(result?.keywordMatches.length).toBeGreaterThan(0);
    });
  });

  describe('House Mapping', () => {
    test('Career queries should map to 10th house', () => {
      const result = KeywordMatcher.analyzeQuery('What is my ideal profession?');
      expect(result?.primaryHouse).toBe(10);
    });

    test('Finance queries should map to 2nd house', () => {
      const result = KeywordMatcher.analyzeQuery('Will I be rich?');
      expect(result?.primaryHouse).toBe(2);
    });

    test('Marriage queries should map to 7th house', () => {
      const result = KeywordMatcher.analyzeQuery('When will I marry?');
      expect(result?.primaryHouse).toBe(7);
    });
  });

  describe('Edge Cases', () => {
    test('Should handle empty query', () => {
      const result = KeywordMatcher.analyzeQuery('');
      expect(result).toBeNull();
    });

    test('Should handle query with special characters', () => {
      const result = KeywordMatcher.analyzeQuery('Will I get married??? @#$');
      expect(result).not.toBeNull();
      expect(result?.domain).toBe('MARRIAGE');
    });

    test('Should handle mixed case query', () => {
      const result = KeywordMatcher.analyzeQuery('WILL I BECOME A DOCTOR?');
      expect(result).not.toBeNull();
      expect(['HEALTH', 'CAREER', 'EDUCATION']).toContain(result?.domain);
    });

    test('Should handle query with extra whitespace', () => {
      const result = KeywordMatcher.analyzeQuery('   When will   I   marry   ');
      expect(result).not.toBeNull();
      expect(result?.domain).toBe('MARRIAGE');
    });
  });
});
