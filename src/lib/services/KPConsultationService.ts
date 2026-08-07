import { KPChart, KPQuery, KPVerdict } from '../../types/kp';
import { generateKPVerdict } from '../kp/kpVerdictEngine';

export class KPConsultationService {
  /**
   * Generates a KP Verdict enriched with Gemini LLM analytical commentary via server API endpoint
   */
  static async getKPVerdict(query: KPQuery, chart: KPChart, language: 'en' | 'hi' | 'te' = 'en'): Promise<KPVerdict> {
    // First compute deterministic rule-based verdict
    const baseVerdict = generateKPVerdict(query, chart);

    try {
      const response = await fetch('/api/kp/verdict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, chart, baseVerdict, language })
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.verdict) {
          return {
            ...baseVerdict,
            explanation: data.verdict.explanation || baseVerdict.explanation,
            timing: data.verdict.timing || baseVerdict.timing,
            contextualization: data.verdict.contextualization,
            reasoning: {
              ...baseVerdict.reasoning,
              ...(data.verdict.reasoning || {})
            }
          };
        }
      }
    } catch (err) {
      console.warn('[KPConsultationService] Failed to reach server Gemini API, returning local KP verdict engine output:', err);
    }

    return baseVerdict;
  }
}
