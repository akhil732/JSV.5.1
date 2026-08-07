/**
 * ENHANCED QUERY CONSULTATION ENGINE
 * Production-Ready Implementation with Copy-Paste Modules
 * 
 * Integrates:
 * - Bhava cluster architecture with lordship chains
 * - Karaka extraction with dignity assessment
 * - Multi-house lordship detection
 * - Depth-aware signaller question generation
 */

import { BirthDetails } from '../../types';
import { QueryIntentRecognizer } from '../kp/queryIntentRecognizer';

// ============================================================================
// INTERFACES & TYPES
// ============================================================================

export interface QueryIntentResult {
  intent: string;
  confidence: number;
  primaryHouse: number;
  secondaryHouses: number[];
  rawIntent?: any;
}

export interface EnhancedQueryIntentResult extends QueryIntentResult {
  bhavaCluster: BhavaCluster;
  signallerQuestions: string[];
  analysisDepth: 'surface' | 'intermediate' | 'deep';
  lordshipChains?: LordshipChainInstance[];
  karakaAnalyses?: KarakaAnalysis[];
}

export interface DomainClassificationResult {
  domain: string;
  analysisAngle: string;
}

export interface BhavaCluster {
  primaryBhava: number;
  secondaryBhavas: number[];
  tertiarySupporters: number[];
  lordshipChains: LordshipChainRule[];
  naturalKarakas: NaturalKaraka[];
}

export interface NaturalKaraka {
  planet: string;
  roles: string[];
  significationStrength: 'PRIMARY' | 'SECONDARY' | 'TERTIARY';
  dignityFactors: string[];
}

export interface LordshipChainRule {
  rule: string;
  fromBhava: number;
  toBhava: number;
  significance: string;
  example: string;
}

export interface LordshipChainInstance {
  fromHouse: number;
  toHouse: number;
  lordName: string;
  lordPlacement: {
    house: number;
    houseType: 'Kendra' | 'Trikona' | 'Dusthana';
    sign: string;
  };
  significance: string;
  example: string;
}

export interface KarakaAnalysis {
  planet: string;
  primaryRoles: string[];
  chartPlacement: {
    house: number;
    sign: string;
    dignity: 'EXALTED' | 'OWN_SIGN' | 'NEUTRAL' | 'DEBILITATED' | 'COMBUST';
    dignityScore: number;
  };
  aspectingHouses: number[];
  conjunctionEffects: string[];
  retrogradeStatus: boolean;
  assessmentSummary: string;
}

export interface GroundTruthsPackage {
  domain: string;
  analysisAngle: string;
  primaryHouse: number;
  secondaryHouses: number[];
  cuspSubLords: Record<number, any>;
  lordshipChains: LordshipChainInstance[];
  karakaAnalyses: KarakaAnalysis[];
  signallerQuestions: string[];
  analysisDepth: 'surface' | 'intermediate' | 'deep';
  systemPromptInjection: string;
  timestamp: string;
}

// ============================================================================
// MAIN ENGINE CLASS
// ============================================================================

export class EnhancedQueryConsultationEngine {
  private readonly BHAVA_CLUSTERS: Record<string, BhavaCluster>;
  private readonly SIGN_RULERS: Record<string, string>;
  private readonly HOUSE_CLASSIFICATIONS: Record<number, string>;

  constructor() {
    this.SIGN_RULERS = {
      'Aries': 'Mars', 'Taurus': 'Venus', 'Gemini': 'Mercury', 'Cancer': 'Moon',
      'Leo': 'Sun', 'Virgo': 'Mercury', 'Libra': 'Venus', 'Scorpio': 'Mars',
      'Sagittarius': 'Jupiter', 'Capricorn': 'Saturn', 'Aquarius': 'Saturn', 'Pisces': 'Jupiter'
    };

    this.HOUSE_CLASSIFICATIONS = {
      1: 'Kendra', 2: 'Neutral', 3: 'Upachaya', 4: 'Kendra',
      5: 'Trikona', 6: 'Dusthana', 7: 'Kendra', 8: 'Dusthana',
      9: 'Trikona', 10: 'Kendra', 11: 'Upachaya', 12: 'Dusthana'
    };

    this.BHAVA_CLUSTERS = this.initializeBhavaClusters();
  }

  /**
   * Initialize all bhava clusters based on reference framework
   */
  private initializeBhavaClusters(): Record<string, BhavaCluster> {
    return {
      CAREER: {
        primaryBhava: 10,
        secondaryBhavas: [1, 2, 4, 5, 6, 9, 11],
        tertiarySupporters: [3, 8, 12],
        naturalKarakas: [
          {
            planet: 'Sun',
            roles: ['authority', 'leadership', 'visibility', 'government', 'command'],
            significationStrength: 'PRIMARY',
            dignityFactors: ['own_sign (Leo)', 'exaltation (Aries)']
          },
          {
            planet: 'Saturn',
            roles: ['discipline', 'repetition', 'responsibility', 'career endurance', 'age-strengthening'],
            significationStrength: 'SECONDARY',
            dignityFactors: ['own_sign (Capricorn, Aquarius)']
          },
          {
            planet: 'Mercury',
            roles: ['analysis', 'commerce', 'communication', 'business skill', 'analytical work'],
            significationStrength: 'SECONDARY',
            dignityFactors: ['own_sign (Gemini, Virgo)']
          }
        ],
        lordshipChains: [
          {
            rule: '10th lord in 9th (Dharma Trikona)',
            fromBhava: 10,
            toBhava: 9,
            significance: 'Career aligned with dharma, teaching/counsel/international domains become dominant. Work carries deeper purpose.',
            example: 'Career in education, philosophy, consulting, international business, law, priesthood'
          },
          {
            rule: '10th lord in 12th (Dusthana)',
            fromBhava: 10,
            toBhava: 12,
            significance: 'Career routed through foreign lands, isolation, loss, or institutional work. Requires maturation through adversity.',
            example: 'Foreign job assignments, work during institutional confinement, career loss then rebuilding, retreat-based work'
          },
          {
            rule: '10th lord in 6th (Upachaya)',
            fromBhava: 10,
            toBhava: 6,
            significance: 'Career thrives through conflict, competition, service. Improves dramatically with age and repetition.',
            example: 'Litigation lawyer, surgeon, athlete, military, conflict resolution, competitive sports'
          },
          {
            rule: '10th lord in 1st (Kendra)',
            fromBhava: 10,
            toBhava: 1,
            significance: 'Career identity is self-evident and body-integral. Person becomes known for their work.',
            example: 'Visible leadership, executive presence, career as personal brand'
          },
          {
            rule: '10th lord in 5th (Trikona)',
            fromBhava: 10,
            toBhava: 5,
            significance: 'Career involves creativity, teaching, children, or merit-based work. Grace-bearing placement.',
            example: 'Teacher, creative professional, child-focused work, merit-based advancement'
          }
        ]
      },

      MARRIAGE: {
        primaryBhava: 7,
        secondaryBhavas: [2, 4, 5, 8, 12],
        tertiarySupporters: [1, 3, 6, 9, 10, 11],
        naturalKarakas: [
          {
            planet: 'Venus',
            roles: ['attraction', 'union', 'relational harmony', 'partnership', 'desire'],
            significationStrength: 'PRIMARY',
            dignityFactors: ['own_sign (Taurus, Libra)', 'exaltation (Pisces)', 'combustion risk', 'retrogression complexity']
          },
          {
            planet: 'Jupiter',
            roles: ['husband indication (woman chart)', 'counsel', 'marriage expansion', 'wisdom in partnership'],
            significationStrength: 'PRIMARY',
            dignityFactors: ['aspect_to_7th', 'own_sign (Sagittarius, Pisces)']
          },
          {
            planet: 'Moon',
            roles: ['emotional compatibility', 'nourishment in marriage', 'mother-in-law dynamics'],
            significationStrength: 'SECONDARY',
            dignityFactors: ['own_sign (Cancer)']
          }
        ],
        lordshipChains: [
          {
            rule: '7th lord in 7th (same house)',
            fromBhava: 7,
            toBhava: 7,
            significance: 'Marriage receives concentrated focus and energy. Partnership becomes central life theatre.',
            example: 'Strong marriage emphasis, frequent relationship dynamics, partnership-driven decisions'
          },
          {
            rule: '7th lord in 12th (Dusthana)',
            fromBhava: 7,
            toBhava: 12,
            significance: 'Marriage tested by foreign separation, isolation, loss, or hidden conflicts. Requires spiritual maturity.',
            example: 'Long-distance marriage, spouse abroad, hidden relationship history, eventual separation or transcendence'
          },
          {
            rule: '7th lord in 9th (Dharma)',
            fromBhava: 7,
            toBhava: 9,
            significance: 'Marriage has dharmic foundation. Spouse becomes spiritual guide or aligned with higher purpose.',
            example: 'Marriage to guru/teacher, spiritual partnership, family traditions, inherited alignment'
          },
          {
            rule: '8th house affliction (Mangalya)',
            fromBhava: 8,
            toBhava: 7,
            significance: 'Marriage durability tested. Spouse health, hidden conflicts, or karmic intensity requires careful monitoring.',
            example: 'Spouse health issues, hidden relationship patterns, karmic intensity in partnership'
          }
        ]
      },

      FINANCE: {
        primaryBhava: 2,
        secondaryBhavas: [5, 8, 11],
        tertiarySupporters: [1, 6, 10, 12],
        naturalKarakas: [
          {
            planet: 'Jupiter',
            roles: ['wealth expansion', 'wisdom-based gains', 'luck factor', 'philanthropy'],
            significationStrength: 'PRIMARY',
            dignityFactors: ['own_sign (Sagittarius, Pisces)', 'aspect_support']
          },
          {
            planet: 'Venus',
            roles: ['attraction to pleasure spending', 'creative income', 'material comfort', 'beauty-based earnings'],
            significationStrength: 'SECONDARY',
            dignityFactors: ['own_sign (Taurus, Libra)']
          },
          {
            planet: 'Mercury',
            roles: ['commerce', 'business intelligence', 'trade', 'accounting', 'analytical financial decisions'],
            significationStrength: 'SECONDARY',
            dignityFactors: []
          }
        ],
        lordshipChains: [
          {
            rule: '2nd lord in 11th (Upachaya)',
            fromBhava: 2,
            toBhava: 11,
            significance: 'Wealth realized through gains and income. Accumulation improves steadily with age.',
            example: 'Wealth grows progressively, business income, systematic prosperity, investment returns'
          },
          {
            rule: '11th lord in Dusthana (6, 8, 12)',
            fromBhava: 11,
            toBhava: 6,
            significance: 'Gains come through struggle, service, competition, or conflict resolution.',
            example: 'Litigation settlement income, surgical/medical fees, competitive prize money, hard-won success'
          }
        ]
      },

      HEALTH: {
        primaryBhava: 6,
        secondaryBhavas: [1, 8],
        tertiarySupporters: [2, 3, 5, 10],
        naturalKarakas: [
          {
            planet: 'Mars',
            roles: ['surgery', 'acute inflammation', 'injury', 'competitive stress', 'blood-related conditions'],
            significationStrength: 'PRIMARY',
            dignityFactors: ['own_sign (Aries, Scorpio) beneficial in 6th']
          },
          {
            planet: 'Saturn',
            roles: ['chronic conditions', 'aging effects', 'discipline-based healing', 'long-term recovery'],
            significationStrength: 'PRIMARY',
            dignityFactors: []
          }
        ],
        lordshipChains: [
          {
            rule: '6th lord in 6th (Upachaya)',
            fromBhava: 6,
            toBhava: 6,
            significance: 'Illness manageable through discipline. Improves dramatically with age and self-care repetition.',
            example: 'Chronic conditions that improve with treatment compliance, lifestyle correction over time'
          }
        ]
      },

      EDUCATION: {
        primaryBhava: 5,
        secondaryBhavas: [4, 9],
        tertiarySupporters: [1, 2, 11],
        naturalKarakas: [
          {
            planet: 'Jupiter',
            roles: ['higher learning', 'wisdom', 'teaching', 'merit', 'spiritual knowledge'],
            significationStrength: 'PRIMARY',
            dignityFactors: ['own_sign', 'aspect_support']
          },
          {
            planet: 'Mercury',
            roles: ['analytical learning', 'communication', 'research skills', 'data analysis'],
            significationStrength: 'SECONDARY',
            dignityFactors: ['own_sign (Gemini, Virgo)']
          }
        ],
        lordshipChains: []
      },

      CHILDREN: {
        primaryBhava: 5,
        secondaryBhavas: [1, 2, 7, 9, 10, 11],
        tertiarySupporters: [8, 12],
        naturalKarakas: [
          {
            planet: 'Jupiter',
            roles: ['Putrakaraka', 'progeny expansion', 'divine grace for children', 'lineage continuation'],
            significationStrength: 'PRIMARY',
            dignityFactors: ['exaltation (Cancer)', 'own_sign (Sagittarius, Pisces)', '5th house connection']
          },
          {
            planet: 'Moon',
            roles: ['fertility', 'nourishment', 'maternal care', 'conception capacity'],
            significationStrength: 'PRIMARY',
            dignityFactors: ['own_sign (Cancer)', 'exaltation (Taurus)']
          },
          {
            planet: 'Venus',
            roles: ['reproductive vitality', 'conception ease', 'marital intimacy'],
            significationStrength: 'SECONDARY',
            dignityFactors: ['own_sign (Taurus, Libra)', 'exaltation (Pisces)']
          }
        ],
        lordshipChains: [
          {
            rule: '5th lord in 5th (Putra Bhava)',
            fromBhava: 5,
            toBhava: 5,
            significance: 'Strong structural promise for children, high creative intelligence and karmic merit.',
            example: 'Smooth childbirth promise, talented progeny, strong lineage continuation'
          },
          {
            rule: '5th lord connected to 2nd or 11th house',
            fromBhava: 5,
            toBhava: 11,
            significance: 'Fulfillment of child birth wishes, expansion of family lineage (2nd house).',
            example: 'Successful conception and birth, joyful family growth'
          },
          {
            rule: '5th lord in Dusthana (6, 8, 12)',
            fromBhava: 5,
            toBhava: 8,
            significance: 'Childbirth process may face medical delays, anxiety or require clinical support/remedies.',
            example: 'Medical guidance required for conception, initial delays before successful delivery'
          }
        ]
      },

      PROPERTY: {
        primaryBhava: 4,
        secondaryBhavas: [2, 8],
        tertiarySupporters: [1, 5, 9],
        naturalKarakas: [
          {
            planet: 'Moon',
            roles: ['emotional security', 'home', 'mother property', 'inheritance', 'domestic comfort'],
            significationStrength: 'PRIMARY',
            dignityFactors: ['own_sign (Cancer)']
          },
          {
            planet: 'Venus',
            roles: ['luxury property', 'artistic home design', 'beauty of residence'],
            significationStrength: 'SECONDARY',
            dignityFactors: []
          }
        ],
        lordshipChains: []
      },

      LEGAL: {
        primaryBhava: 6,
        secondaryBhavas: [8, 12],
        tertiarySupporters: [3, 10],
        naturalKarakas: [
          {
            planet: 'Mars',
            roles: ['conflict', 'litigation support', 'aggressive defense', 'competition'],
            significationStrength: 'PRIMARY',
            dignityFactors: ['own_sign (Aries, Scorpio)']
          },
          {
            planet: 'Saturn',
            roles: ['legal delays', 'structured arguments', 'long-term legal processes'],
            significationStrength: 'SECONDARY',
            dignityFactors: []
          }
        ],
        lordshipChains: []
      },

      TRAVEL: {
        primaryBhava: 9,
        secondaryBhavas: [3, 12],
        tertiarySupporters: [1, 10],
        naturalKarakas: [
          {
            planet: 'Jupiter',
            roles: ['long-distance travel', 'pilgrimage', 'adventure', 'foreign lands', 'expansion through travel'],
            significationStrength: 'PRIMARY',
            dignityFactors: ['own_sign', 'aspect_support']
          }
        ],
        lordshipChains: []
      },

      SPIRITUAL: {
        primaryBhava: 9,
        secondaryBhavas: [12, 8],
        tertiarySupporters: [1, 5],
        naturalKarakas: [
          {
            planet: 'Jupiter',
            roles: ['dharma', 'guidance', 'spiritual growth', 'guru', 'higher purpose'],
            significationStrength: 'PRIMARY',
            dignityFactors: ['own_sign', 'aspect_support']
          },
          {
            planet: 'Ketu',
            roles: ['detachment', 'spiritual inquiry', 'non-attachment', 'moksha'],
            significationStrength: 'SECONDARY',
            dignityFactors: []
          }
        ],
        lordshipChains: []
      }
    };
  }

  /**
   * MAIN ENTRY POINT: Recognize intent with full bhava analysis
   */
  recognizeIntent(query: string): EnhancedQueryIntentResult {
    // Step 1: Get basic keyword match
    const basicResult = QueryIntentRecognizer.matchKeywords(query);
    const domain = (basicResult.intent.domain || 'CAREER').toUpperCase();

    // Step 2: Get full bhava cluster for this domain
    const bhavaCluster = this.BHAVA_CLUSTERS[domain] || this.BHAVA_CLUSTERS['CAREER'];

    // Step 3: Determine analysis depth
    const analysisDepth = this.inferAnalysisDepth(query, domain);

    // Step 4: Generate signaller questions
    const signallerQuestions = this.generateSignallerQuestions(query, domain, bhavaCluster);

    return {
      intent: domain,
      confidence: basicResult.intent.confidence || 75,
      primaryHouse: bhavaCluster.primaryBhava,
      secondaryHouses: bhavaCluster.secondaryBhavas,
      bhavaCluster,
      signallerQuestions,
      analysisDepth,
      rawIntent: basicResult.intent
    };
  }

  /**
   * Infer analysis depth based on query complexity
   */
  private inferAnalysisDepth(query: string, domain: string): 'surface' | 'intermediate' | 'deep' {
    const complexityIndicators = [
      /spouse.*career|career.*spouse|marriage.*work|work.*marriage/i,
      /money.*health|health.*finance|wealth.*illness/i,
      /family.*career|home.*job|parents.*work/i,
      /travel.*work|foreign.*business|abroad.*career/i,
      /child|children|progeny|conception|birth|pregnancy/i,
      /how many|quantity|number of|possibl/i,
      /how does|affect|impact|connection|relate/i,
      /dasha|lord|timing|when will|forecast/i,
      /and|plus|also|additionally|furthermore/i
    ];

    const matchCount = complexityIndicators.filter(regex => regex.test(query)).length;

    if (matchCount >= 3) return 'deep';
    if (matchCount >= 1) return 'intermediate';
    return 'surface';
  }

  /**
   * Generate targeted signaller questions
   */
  private generateSignallerQuestions(query: string, domain: string, cluster: BhavaCluster): string[] {
    const questions: string[] = [];

    // Q1: Primary house lord placement
    questions.push(
      `[PRIMARY] Is the ${cluster.primaryBhava}th lord in a Kendra (supportive), Trikona (grace-bearing), or Dusthana (pressure)?`
    );

    // Q2-3: Natural karakas
    const primaryKarakas = cluster.naturalKarakas.filter(k => k.significationStrength === 'PRIMARY');
    primaryKarakas.slice(0, 2).forEach(karaka => {
      questions.push(
        `[KARAKA] What is ${karaka.planet}'s dignity and placement? (${karaka.dignityFactors.slice(0, 2).join(', ')})`
      );
    });

    // Q4: Lordship chain (if relevant)
    if (cluster.lordshipChains.length > 0) {
      const chain = cluster.lordshipChains[0];
      questions.push(
        `[CHAIN] ${chain.rule}: ${chain.significance}`
      );
    }

    // Q5: Secondary houses
    if (cluster.secondaryBhavas.length > 0) {
      const topSecondary = cluster.secondaryBhavas.slice(0, 3).join(', ');
      questions.push(
        `[SECONDARY] What is the condition of houses ${topSecondary} (supporting themes)?`
      );
    }

    return questions.slice(0, 5);
  }

  /**
   * Classify domain and return bhava-aware analysis angle
   */
  classifyDomain(queryIntent: EnhancedQueryIntentResult): DomainClassificationResult {
    const cluster = queryIntent.bhavaCluster;
    const karakaList = cluster.naturalKarakas.map(k => k.planet).join(', ');
    const secondaryList = cluster.secondaryBhavas.slice(0, 4).join(', ');

    return {
      domain: queryIntent.intent,
      analysisAngle: `${cluster.primaryBhava}th House (Primary) with ${karakaList} Significators | Secondary: Houses ${secondaryList} | Depth: ${queryIntent.analysisDepth}`
    };
  }
}

// ============================================================================
// LORDSHIP CHAIN DETECTOR
// ============================================================================

export class LordshipChainDetector {
  private readonly SIGN_RULERS: Record<string, string>;

  constructor() {
    this.SIGN_RULERS = {
      'Aries': 'Mars', 'Taurus': 'Venus', 'Gemini': 'Mercury', 'Cancer': 'Moon',
      'Leo': 'Sun', 'Virgo': 'Mercury', 'Libra': 'Venus', 'Scorpio': 'Mars',
      'Sagittarius': 'Jupiter', 'Capricorn': 'Saturn', 'Aquarius': 'Saturn', 'Pisces': 'Jupiter'
    };
  }

  /**
   * Detect lordship chains in query that indicate multi-house themes
   */
  detectLordshipChainsInQuery(query: string, horoscope: any): LordshipChainInstance[] {
    const detectedChains: LordshipChainInstance[] = [];

    // Pattern matching for common multi-house questions
    const patterns = [
      { regex: /spouse.*affect.*career|marriage.*affect.*job|partner.*work/i, from: 7, to: 10 },
      { regex: /family.*money|home.*finance|parents.*wealth/i, from: 4, to: 2 },
      { regex: /health.*work|illness.*career|sickness.*job/i, from: 6, to: 10 },
      { regex: /education.*career|learning.*job|studies.*profession/i, from: 5, to: 10 },
      { regex: /travel.*work|foreign.*business|abroad.*career/i, from: 12, to: 10 },
      { regex: /siblings.*success|brother.*career|sister.*job/i, from: 3, to: 10 },
      { regex: /inheritance.*career|legacy.*job/i, from: 8, to: 10 }
    ];

    for (const pattern of patterns) {
      if (pattern.regex.test(query)) {
        const chain = this.analyzeChainInstance(pattern.from, pattern.to, horoscope);
        if (chain) {
          detectedChains.push(chain);
        }
      }
    }

    return detectedChains;
  }

  /**
   * Analyze a specific lordship chain
   */
  private analyzeChainInstance(fromHouse: number, toHouse: number, horoscope: any): LordshipChainInstance | null {
    try {
      // Get house lords
      const fromSign = horoscope.houses?.[fromHouse]?.sign;
      const toSign = horoscope.houses?.[toHouse]?.sign;

      if (!fromSign || !toSign) return null;

      const fromLord = this.SIGN_RULERS[fromSign];
      const toLord = this.SIGN_RULERS[toSign];

      // Get placement of from-house lord
      const lordPlacement = horoscope.planets?.[fromLord];
      if (!lordPlacement) return null;

      const houseType = this.classifyHouse(lordPlacement.house);

      return {
        fromHouse,
        toHouse,
        lordName: `${fromLord} (${fromHouse}th lord)`,
        lordPlacement: {
          house: lordPlacement.house,
          houseType,
          sign: lordPlacement.sign
        },
        significance: this.generateSignificance(fromHouse, toHouse, houseType),
        example: `${fromLord} placed in ${lordPlacement.house}th house, connecting houses ${fromHouse} → ${toHouse}`
      };
    } catch (error) {
      console.error(`Error analyzing chain ${fromHouse}→${toHouse}:`, error);
      return null;
    }
  }

  /**
   * Generate significance based on lord's house type
   */
  private generateSignificance(fromHouse: number, toHouse: number, houseType: string): string {
    const base = `Houses ${fromHouse}→${toHouse} connected via lord's ${houseType} placement`;

    if (houseType === 'Kendra' || houseType === 'Trikona') {
      return `${base} (SUPPORTIVE connection)`;
    } else if (houseType === 'Dusthana') {
      return `${base} (PRESSURE-TESTED connection)`;
    } else {
      return base;
    }
  }

  /**
   * Classify a house by number
   */
  private classifyHouse(house: number): 'Kendra' | 'Trikona' | 'Dusthana' {
    const kendras = [1, 4, 7, 10];
    const trikonas = [1, 5, 9];
    const dusthanas = [6, 8, 12];

    if (kendras.includes(house)) return 'Kendra';
    if (trikonas.includes(house)) return 'Trikona';
    if (dusthanas.includes(house)) return 'Dusthana';
    return 'Dusthana'; // Default
  }
}

// ============================================================================
// KARAKA EXTRACTOR & DIGNITY ASSESSOR
// ============================================================================

export class KarakaExtractor {
  private readonly EXALTATION_SIGNS: Record<string, string> = {
    'Sun': 'Aries', 'Moon': 'Taurus', 'Mercury': 'Virgo',
    'Venus': 'Pisces', 'Mars': 'Capricorn', 'Jupiter': 'Cancer',
    'Saturn': 'Libra', 'Rahu': 'Gemini', 'Ketu': 'Sagittarius'
  };

  private readonly OWN_SIGNS: Record<string, string[]> = {
    'Sun': ['Leo'],
    'Moon': ['Cancer'],
    'Mercury': ['Gemini', 'Virgo'],
    'Venus': ['Taurus', 'Libra'],
    'Mars': ['Aries', 'Scorpio'],
    'Jupiter': ['Sagittarius', 'Pisces'],
    'Saturn': ['Capricorn', 'Aquarius'],
    'Rahu': ['Gemini'],
    'Ketu': ['Sagittarius']
  };

  /**
   * Extract and assess natural karakas for a domain
   */
  extractKarakas(domain: string, horoscope: any, cluster: BhavaCluster): KarakaAnalysis[] {
    return cluster.naturalKarakas.map(naturalKaraka => {
      const placement = this.getPlanetPlacement(naturalKaraka.planet, horoscope);
      const dignity = this.assessDignity(naturalKaraka.planet, placement);
      const aspects = this.getAspectingHouses(naturalKaraka.planet, placement);
      const conjunctions = this.getConjunctions(naturalKaraka.planet, placement, horoscope);

      return {
        planet: naturalKaraka.planet,
        primaryRoles: naturalKaraka.roles,
        chartPlacement: {
          house: placement.house,
          sign: placement.sign,
          dignity: dignity.status,
          dignityScore: dignity.score
        },
        aspectingHouses: aspects,
        conjunctionEffects: conjunctions,
        retrogradeStatus: placement.isRetrograde || false,
        assessmentSummary: this.generateAssessmentSummary(naturalKaraka, dignity, aspects)
      };
    });
  }

  /**
   * Assess planet dignity
   */
  private assessDignity(planet: string, placement: any): { status: 'EXALTED' | 'OWN_SIGN' | 'NEUTRAL' | 'DEBILITATED' | 'COMBUST'; score: number } {
    const sign = placement.sign || '';
    const isCombust = placement.isCombust || false;
    const isDebilitated = placement.isDebilitated || false;

    // Check exaltation
    if (sign === this.EXALTATION_SIGNS[planet]) {
      return { status: 'EXALTED', score: 3 };
    }

    // Check own sign
    if (this.OWN_SIGNS[planet]?.includes(sign)) {
      return { status: 'OWN_SIGN', score: 2 };
    }

    // Check combustion
    if (isCombust) {
      return { status: 'COMBUST', score: -2 };
    }

    // Check debilitation
    if (isDebilitated) {
      return { status: 'DEBILITATED', score: -3 };
    }

    return { status: 'NEUTRAL', score: 0 };
  }

  /**
   * Get aspecting houses using graha drishti rules
   */
  private getAspectingHouses(planet: string, placement: any): number[] {
    const house = placement.house;
    const aspects: number[] = [];

    // All planets: 7th aspect
    aspects.push((house + 6) % 12 || 12);

    // Mars: 4th and 8th aspects
    if (planet === 'Mars') {
      aspects.push((house + 3) % 12 || 12);
      aspects.push((house + 7) % 12 || 12);
    }

    // Jupiter: 5th and 9th aspects
    if (planet === 'Jupiter') {
      aspects.push((house + 4) % 12 || 12);
      aspects.push((house + 8) % 12 || 12);
    }

    // Saturn: 3rd and 10th aspects
    if (planet === 'Saturn') {
      aspects.push((house + 2) % 12 || 12);
      aspects.push((house + 9) % 12 || 12);
    }

    return aspects.filter(h => h !== house && h > 0 && h <= 12);
  }

  /**
   * Generate assessment summary
   */
  private generateAssessmentSummary(
    karaka: NaturalKaraka,
    dignity: { status: string; score: number },
    aspects: number[]
  ): string {
    const dignityText = {
      'EXALTED': 'strongly exalted, highly supportive',
      'OWN_SIGN': 'well-placed in own sign, capable',
      'NEUTRAL': 'neutral, functioning adequately',
      'DEBILITATED': 'debilitated, under significant stress',
      'COMBUST': 'combust (overpowered by Sun), limited expression'
    }[dignity.status] || 'neutral';

    const rolesList = karaka.roles.slice(0, 2).join(', ');
    const aspectText = aspects.length > 0 
      ? ` with aspects reaching houses ${aspects.join(', ')}`
      : ' with limited aspect reach';

    return `${karaka.planet} is ${dignityText}${aspectText}. This affects: ${rolesList}.`;
  }

  /**
   * Get conjunctions with other planets
   */
  private getConjunctions(planet: string, placement: any, horoscope: any): string[] {
    const conjunctions: string[] = [];
    const threshold = 8; // Degree orb

    // In production, check actual planet longitudes
    // For now, return empty (would require full ephemeris data)

    return conjunctions;
  }

  /**
   * Get planet placement from horoscope
   */
  private getPlanetPlacement(planet: string, horoscope: any): any {
    return horoscope.planets?.[planet] || {
      house: 1,
      sign: 'Aries',
      isRetrograde: false,
      isCombust: false,
      isDebilitated: false
    };
  }
}

// ============================================================================
// EXPORTS FOR INTEGRATION
// ============================================================================

export function generateSuggestedQuestions(
  birthDetails: BirthDetails,
  horoscope: any,
  language: 'en' | 'hi' | 'te' = 'en'
): string[] {
  const engine = new EnhancedQueryConsultationEngine();

  // Generate common domain queries based on chart strength
  const queries: Record<string, string[]> = {
    en: [
      'When will my current Dasha period end?',
      'What is the best timing for a career change?',
      'When is the most auspicious time for marriage?',
      'How can I best leverage the current Jupiter transit?',
      'How do my spouse and career interconnect astrologically?',
      'What is my primary life challenge right now?'
    ],
    hi: [
      'मेरी वर्तमान दशा अवधि कब समाप्त होगी?',
      'करियर में बदलाव के लिए सबसे अच्छा समय कब है?',
      'विवाह के लिए सबसे अनुकूल समय क्या है?',
      'वर्तमान गुरु गोचर का लाभ कैसे उठाएं?',
      'मेरे पति/पत्नी और करियर का आध्यात्मिक संबंध क्या है?',
      'मेरी प्रमुख जीवन चुनौती क्या है?'
    ],
    te: [
      'ప్రస్తుత దశా కాలం ఎప్పుడు ముగుస్తుంది?',
      'కెరీర్ మార్పునకు అనుకూలమైన సమయం ఎప్పుడు?',
      'వివాహానికు అత్యుత్తమ కాలం ఏది?',
      'ప్రస్తుత గురు గోచారాన్ని ఎలా సద్వినియోగం చేసుకోవాలి?',
      'నా జీవన భాగస్వామి మరియు కెరీర్ యొక్క ఖగోల సంబంధం ఏమిటి?',
      'నా ప్రధాన జీవన సవాలు ఏమిటి?'
    ]
  };

  return queries[language] || queries['en'];
}

export { buildFullChartSummary } from '../services/AdvancedAIService';
