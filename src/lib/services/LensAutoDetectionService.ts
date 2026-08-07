import { ConsultationPersona } from './EnhancedGeminiConsultationService';

export interface AnalyticalLens {
  id: ConsultationPersona;
  label: string;
  description: string;
  systemPrompt: string;
  supportedIntents: string[];
  confidenceThreshold: number;
}

export class LensAutoDetectionService {
  private static readonly lensConfigs: Record<ConsultationPersona, AnalyticalLens> = {
    classical_parashari: {
      id: 'classical_parashari',
      label: 'Vedic Predictive & Timing',
      description: 'Grounded in D1 Rasi, D9 Navamsha, D10 Dashamsha, Vimshottari Dasha, and Gochar w.r.t Moon',
      systemPrompt: 'You are a Master Vedic Astrologer following classical Parashara methodology...',
      supportedIntents: ['timing', 'career', 'marriage', 'health', 'finance', 'judgment'],
      confidenceThreshold: 75,
    },
    vedic_divisional: {
      id: 'vedic_divisional',
      label: 'Divisional Charts & Yogas',
      description: 'Focus on D1–D10 divisional charts, classical Yogas, house lord dignities',
      systemPrompt: 'You are a Classical Vedic Astrology expert analyzing divisional charts and yogas...',
      supportedIntents: ['character', 'strength', 'yoga', 'divisional', 'fortunes'],
      confidenceThreshold: 65,
    },
    vedic_remedial: {
      id: 'vedic_remedial',
      label: 'Vedic Remedies & Upaya',
      description: 'Traditional remedies: Mantras, Stotrams, Fasting/Vrat, Daan, Temple devotions',
      systemPrompt: 'You are a Classical Vedic remedies guide providing traditional Upaya...',
      supportedIntents: ['remedy', 'upaya', 'mantra', 'daan', 'vrat', 'puja'],
      confidenceThreshold: 70,
    },
    kp_stellar: {
      id: 'kp_stellar',
      label: 'KP Stellar Astrology',
      description: 'Krishnamurti Paddhati cuspal sub lord analysis, house significators & stellar timing',
      systemPrompt: 'You are a Krishnamurti Paddhati (KP) Stellar Astrology expert...',
      supportedIntents: ['kp', 'sublord', 'cusp', 'verdict', 'starlord', 'promise'],
      confidenceThreshold: 80,
    },
    quick: {
      id: 'quick',
      label: 'QUICK Astro Engine (Telugu)',
      description: 'Structured comprehensive astrological analysis in Telugu focusing on birth profiles, Dashas, and Gochara transits',
      systemPrompt: 'You are the QUICK Astro Engine, an expert Vedic Astrologer providing precise structured analysis in Telugu.',
      supportedIntents: ['quick', 'telugu', 'analysis', 'structured', 'comprehensive'],
      confidenceThreshold: 70,
    }
  };

  private static readonly intentKeywords: Record<string, string[]> = {
    timing: ['when', 'timing', 'year', 'month', 'period', 'dasha', 'transit', 'window', 'gochar'],
    career: ['career', 'job', 'business', 'promotion', 'profession', '10th', 'dashamsha', 'd10'],
    marriage: ['marriage', 'marry', 'partner', 'relationship', '7th', 'spouse', 'wedding', 'navamsha', 'd9'],
    health: ['health', 'disease', 'illness', 'medical', '6th', '12th', 'recovery', 'dosha'],
    finance: ['money', 'finance', 'wealth', 'income', 'loss', '2nd', '11th', 'gains'],
    remedy: ['remedy', 'remedies', 'puja', 'mantra', 'donation', 'daan', 'vrat', 'stotram', 'upaya'],
    strength: ['strength', 'weak', 'strong', 'exaltation', 'debilitation', 'planet', 'dignity'],
    yoga: ['yoga', 'combination', 'auspicious', 'inauspicious', 'raj yoga', 'dhana yoga', 'gajakesari'],
  };

  /**
   * Detect optimal lens based on query intent
   */
  static detectIntent(query: string): ConsultationPersona {
    const lowerQuery = query.toLowerCase();
    if (lowerQuery.includes('quick') || lowerQuery.includes('telugu') || lowerQuery.includes('త్వరిత')) {
      return 'quick';
    }
    const scores: Record<ConsultationPersona, number> = {
      classical_parashari: 0,
      vedic_divisional: 0,
      vedic_remedial: 0,
      kp_stellar: 0,
      quick: 0,
    };

    // Score based on keyword matches
    Object.entries(this.intentKeywords).forEach(([intent, keywords]) => {
      keywords.forEach((keyword) => {
        if (lowerQuery.includes(keyword)) {
          if (['timing', 'career', 'marriage', 'health', 'finance'].includes(intent)) {
            scores.classical_parashari += 3;
          }
          if (['strength', 'yoga', 'divisional'].includes(intent)) {
            scores.vedic_divisional += 3;
          }
          if (['remedy', 'upaya'].includes(intent)) {
            scores.vedic_remedial += 3;
          }
        }
      });
    });

    const maxScore = Math.max(scores.classical_parashari, scores.vedic_divisional, scores.vedic_remedial);
    if (maxScore === 0) {
      return 'classical_parashari'; // Default to Vedic Predictive
    }
    if (scores.classical_parashari >= scores.vedic_divisional && scores.classical_parashari >= scores.vedic_remedial) {
      return 'classical_parashari';
    }
    if (scores.vedic_divisional > scores.classical_parashari && scores.vedic_divisional >= scores.vedic_remedial) {
      return 'vedic_divisional';
    }
    return 'vedic_remedial';
  }

  /**
   * Get lens configuration
   */
  static getLensConfig(lensId: ConsultationPersona): AnalyticalLens {
    return this.lensConfigs[lensId] || this.lensConfigs['classical_parashari'];
  }

  /**
   * Get all lenses
   */
  static getAllLenses(): AnalyticalLens[] {
    return Object.values(this.lensConfigs);
  }
}

