import { EnhancedQueryConsultationEngine } from "../engines/QueryConsultationEngine";
import { calculateActiveDasha } from "../engines/DashaEngine";
import { calculateTransits } from "../engines/TransitEngine";
import { calculateManglikDosha } from "../manglikDosha";
import type { BirthDetails } from "../../types";
import { ChartDataValidator, type CanonicalChartData } from "../engines/ChartDataValidator";
import { ReasoningEngine } from "../engines/ReasoningEngine";
import { PresentationEngine } from "../engines/PresentationEngine";
import { CONSULTATION_CONSTRAINTS } from "../engines/ConsultationConstraints";
import {
  computeUnifiedKPGroundTruth,
  buildSystemPrompt as buildUnifiedSystemPrompt
} from "../../components/AdvancedAITab/UnifiedKPGroundTruthEngine";

export type ConsultationPersona = "classical_parashari" | "vedic_divisional" | "vedic_remedial" | "kp_stellar" | "quick";

export interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  metadata?: {
    queryDomain?: string;
    confidence?: number;
    sources?: Array<{ title: string; url: string }>;
    vedicGroundTruths?: VedicGroundTruths;
    kpGroundTruths?: VedicGroundTruths; // backward compatibility alias
    persona?: ConsultationPersona;
  };
}

export interface VedicGroundTruths {
  domain: string;
  targetHouse: number;
  targetHouseLord: string;
  rasiSign: string;
  navamshaSign: string;
  divisionalFocus: string;
  vedicPromise: "YES" | "DELAYED" | "NO";
  gatekeeperStatus: "OPEN" | "RESTRICTED";
  confidenceScore: number;
  timing: string;
  explanation: string;
  obstacles: string[];
  activeDasha: string;
  moonSign: string;
  transitsSummary: string;
  activeYogas: string[];
  majorHouseAlignment: Array<{
    house: number;
    name: string;
    houseLord: string;
    promise: "YES" | "DELAYED" | "NO";
    status: "OPEN" | "RESTRICTED";
  }>;
  // Aliases for legacy component bindings
  cuspSubLord?: string;
  cuspPromise?: "YES" | "DELAYED" | "NO";
  rulingPlanets?: string[];
  majorHouseGatekeepers?: Array<{
    house: number;
    name: string;
    subLord: string;
    promise: "YES" | "DELAYED" | "NO";
    status: "OPEN" | "RESTRICTED";
  }>;
}

export type KPGroundTruths = VedicGroundTruths;

export interface EnhancedConsultationRequest {
  birthData: BirthDetails;
  horoscopeData?: any;
  userQuery: string;
  conversationHistory: ConversationMessage[];
  persona?: ConsultationPersona;
  userId?: string;
  language?: "en" | "hi" | "te";
}

export class ConsultationError extends Error {
  constructor(message: string, public originalError?: Error | unknown) {
    super(message);
    this.name = "ConsultationError";
  }
}

const SIGNS = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
const SIGN_LORDS: Record<string, string> = {
  Aries: "Mars", Taurus: "Venus", Gemini: "Mercury", Cancer: "Moon",
  Leo: "Sun", Virgo: "Mercury", Libra: "Venus", Scorpio: "Mars",
  Sagittarius: "Jupiter", Capricorn: "Saturn", Aquarius: "Saturn", Pisces: "Jupiter"
};

function getHouseSign(lagnaSign: string, houseNumber: number): string {
  const idx = SIGNS.indexOf(lagnaSign);
  if (idx === -1) return "Taurus";
  return SIGNS[(idx + houseNumber - 1) % 12];
}

export class EnhancedGeminiConsultationService {
  private queryEngine: EnhancedQueryConsultationEngine;

  constructor() {
    this.queryEngine = new EnhancedQueryConsultationEngine();
  }

  /**
   * Computes deterministic Unified KP Chart Ground Truths for the user query.
   * Single source of truth across all consultation personas.
   */
  public computeKPGroundTruths(
    userQuery: string,
    birthData: BirthDetails,
    horoscopeData?: any
  ): VedicGroundTruths {
    const unified = computeUnifiedKPGroundTruth(userQuery, birthData, horoscopeData);

    const targetHouse = unified.topic === 'CAREER' ? 10 : unified.topic === 'MARRIAGE' ? 7 : unified.topic === 'FINANCE' ? 2 : unified.topic === 'HEALTH' ? 1 : 1;

    const majorHouses = [
      { house: 1, name: "Self / Health" },
      { house: 2, name: "Finance / Wealth" },
      { house: 4, name: "Home / Property" },
      { house: 5, name: "Children / Creativity" },
      { house: 6, name: "Service / Vitality" },
      { house: 7, name: "Marriage / Union" },
      { house: 9, name: "Fortune / Higher Ed" },
      { house: 10, name: "Career / Status" },
      { house: 11, name: "Gains / Fulfill" },
      { house: 12, name: "Moksha / Foreign" }
    ];

    const majorHouseAlignment = majorHouses.map(h => ({
      house: h.house,
      name: h.name,
      houseLord: unified.cuspSubLord,
      promise: unified.promise,
      status: (unified.promise === 'NO' ? 'RESTRICTED' : 'OPEN') as 'OPEN' | 'RESTRICTED'
    }));

    return {
      domain: unified.houseDomain,
      targetHouse,
      targetHouseLord: unified.cuspSubLord,
      rasiSign: 'Natal Rasi',
      navamshaSign: 'Navamsha Alignment',
      divisionalFocus: 'KP Stellar & Divisional Alignment',
      vedicPromise: unified.promise,
      gatekeeperStatus: unified.promise === 'NO' ? 'RESTRICTED' : 'OPEN',
      confidenceScore: unified.confidenceScore,
      timing: unified.timing,
      explanation: `KP Cusp Sub-Lord (${unified.cuspSubLord}) signifies houses [${unified.cuspSubLordHouses.join(', ')}]. KP Verdict: ${unified.promise}. Active Dasha: ${unified.activeVimshottariDesc}.`,
      obstacles: unified.promise === 'NO' ? ['Cusp sub-lord signifies unfavorable houses'] : unified.promise === 'DELAYED' ? ['Obstacles or delays indicated by sub-lord significations'] : [],
      activeDasha: unified.activeVimshottariDesc,
      moonSign: horoscopeData?.horoscope?.planets?.Moon?.sign || 'Aries',
      transitsSummary: `Moon Transit Modulation: ${unified.transitModulation}`,
      activeYogas: ['KP Cusp Sub Lord Rule', 'Vimshottari Dasha Alignment'],
      majorHouseAlignment,
      cuspSubLord: unified.cuspSubLord,
      cuspPromise: unified.promise,
      rulingPlanets: [unified.cuspSubLord, unified.activeMahadasha, unified.activeAntardasha],
      majorHouseGatekeepers: majorHouseAlignment.map(m => ({
        house: m.house,
        name: m.name,
        subLord: m.houseLord,
        promise: m.promise,
        status: m.status
      }))
    };
  }

  /**
   * Generate consultation response.
   */
  async generateConsultationResponse(
    request: EnhancedConsultationRequest
  ): Promise<ConversationMessage> {
    let canonicalChart: CanonicalChartData | undefined;
    try {
      if (request.horoscopeData) {
        try {
          canonicalChart = ChartDataValidator.validateConsistency(
            request.horoscopeData,
            request.birthData
          );
        } catch (validationError: any) {
          if (validationError?.message?.includes('CHART_DATA')) {
            return {
              role: "assistant",
              content: `చార్ట్ డేటా సమస్య: జాతకం పూర్తిగా లేదా సరిగ్గా లోడ్ కాలేదు. (${validationError.message})`,
              timestamp: new Date(),
              metadata: { persona: request.persona || "quick" }
            };
          }
        }
      }

      const queryIntent = this.queryEngine.recognizeIntent(request.userQuery);
      const domainClassification = this.queryEngine.classifyDomain(queryIntent);

      const vedicGroundTruths = this.computeKPGroundTruths(
        request.userQuery,
        request.birthData,
        request.horoscopeData
      );

      const consultationFacts = this.computeConsultationFacts(
        request.birthData,
        request.horoscopeData
      );

      if (!this.validateDataSafety(consultationFacts)) {
        throw new ConsultationError("Data safety validation failed: raw ephemeris data detected");
      }

      const persona = request.persona || "classical_parashari";
      const systemPrompt = this.buildSystemPrompt(
        domainClassification,
        queryIntent,
        vedicGroundTruths,
        persona,
        request.language || "en"
      );

      const userMessage = this.buildUserMessage(
        request.userQuery,
        consultationFacts,
        domainClassification,
        request.conversationHistory
      );

      const responseText = await this.callGeminiWithRetry(
        systemPrompt,
        userMessage,
        request.conversationHistory,
        persona,
        request.language || "en"
      );

      return {
        role: "assistant",
        content: responseText,
        timestamp: new Date(),
        metadata: {
          queryDomain: domainClassification.domain,
          confidence: queryIntent.confidence,
          vedicGroundTruths,
          kpGroundTruths: vedicGroundTruths,
          persona
        }
      };
    } catch (error) {
      console.warn("Enhanced consultation warning (using deterministic fallback):", error);
      return {
        role: "assistant",
        content: this.generateFallbackConsultationResponse(request.userQuery, request.birthData, request.horoscopeData, request.language),
        timestamp: new Date(),
        metadata: {
          persona: request.persona || "classical_parashari"
        }
      };
    }
  }

  /**
   * Streaming consultation generator.
   */
  async generateStreamingConsultationResponse(
    request: EnhancedConsultationRequest,
    onChunk: (accumulatedText: string) => void
  ): Promise<ConversationMessage> {
    const queryIntent = this.queryEngine.recognizeIntent(request.userQuery);
    const domainClassification = this.queryEngine.classifyDomain(queryIntent);

    const vedicGroundTruths = this.computeKPGroundTruths(
      request.userQuery,
      request.birthData,
      request.horoscopeData
    );

    const consultationFacts = this.computeConsultationFacts(
      request.birthData,
      request.horoscopeData
    );

    const persona = request.persona || "classical_parashari";
    const systemPrompt = this.buildSystemPrompt(
      domainClassification,
      queryIntent,
      vedicGroundTruths,
      persona,
      request.language || "en"
    );

    const userMessage = this.buildUserMessage(
      request.userQuery,
      consultationFacts,
      domainClassification,
      request.conversationHistory
    );

    let accumulatedText = "";

    try {
      const res = await fetch("/api/advanced-ai/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `${systemPrompt}\n\n${userMessage}`,
          systemInstructionOverride: systemPrompt,
          userQuery: request.userQuery,
          conversationHistory: request.conversationHistory,
          persona,
          language: request.language || "en"
        })
      });

      if (res.ok && res.body) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const dataStr = line.slice(6).trim();
              if (!dataStr) continue;
              try {
                const parsed = JSON.parse(dataStr);
                if (parsed.text) {
                  accumulatedText += parsed.text;
                  onChunk(accumulatedText);
                }
                if (parsed.done) break;
              } catch (e) {
                // ignore SSE parse errors
              }
            }
          }
        }
      }

      if (accumulatedText.trim()) {
        return {
          role: "assistant",
          content: accumulatedText,
          timestamp: new Date(),
          metadata: {
            queryDomain: domainClassification.domain,
            confidence: queryIntent.confidence,
            vedicGroundTruths,
            kpGroundTruths: vedicGroundTruths,
            persona
          }
        };
      }
    } catch (err) {
      console.warn("Streaming SSE failed, falling back to non-streaming response:", err);
    }

    // Fallback if streaming failed
    const fallbackMessage = await this.generateConsultationResponse(request);
    onChunk(fallbackMessage.content);
    return fallbackMessage;
  }

  /**
   * Compute deterministic astrological facts from birth data & horoscope.
   */
  public computeConsultationFacts(birthData: BirthDetails, horoscopeData?: any): Record<string, any> {
    const bDate = birthData?.date || "1996-11-01";
    let dashaSummary = "Dasha information unavailable";
    let mahadasha = "Unknown";
    let antardasha = "Unknown";
    let remainingYears = 0;

    try {
      const activeDasha = calculateActiveDasha(horoscopeData || {}, bDate);
      mahadasha = activeDasha.mahadasha.lord;
      antardasha = activeDasha.antardasha.lord;
      remainingYears = Number(activeDasha.remainingBalance.toFixed(1));
      dashaSummary = `${mahadasha} Mahadasha - ${antardasha} Antardasha (${remainingYears} years remaining)`;
    } catch (e) {
      // Fallback
    }

    let transitSummary: any = { saturn: "Neutral", jupiter: "Supportive" };
    try {
      const moonSign = horoscopeData?.horoscope?.divisional_charts?.["D-1_rasi"]?.Moon?.sign || "Moon Sign";
      const transits = calculateTransits(moonSign);
      transitSummary = {
        saturn: `Saturn in ${transits.saturn.sign} (${transits.saturn.houseFromMoon}th from Moon - ${transits.saturn.classification})`,
        jupiter: `Jupiter in ${transits.jupiter.sign} (${transits.jupiter.houseFromMoon}th from Moon - ${transits.jupiter.classification})`,
        overallPhase: transits.summary.currentPhase
      };
    } catch (e) {
      // Fallback
    }

    let doshasSummary: any = {};
    try {
      const manglik = calculateManglikDosha(horoscopeData || {});
      doshasSummary = {
        manglik: {
          status: manglik.status,
          severity: manglik.severity,
          reason: manglik.reason
        }
      };
    } catch (e) {
      doshasSummary = { manglik: { status: "NEUTRAL" } };
    }

    return {
      nativeInfo: {
        name: birthData.name || "Native",
        gender: birthData.gender || "Not specified"
      },
      dashaPhase: {
        mahadasha,
        antardasha,
        remainingYears,
        summary: dashaSummary
      },
      transits: transitSummary,
      doshas: doshasSummary
    };
  }

  private buildSystemPrompt(
    domainClassification: any,
    queryIntent: any,
    vedicGroundTruths: VedicGroundTruths,
    persona: ConsultationPersona,
    language: "en" | "hi" | "te"
  ): string {
    const unified = computeUnifiedKPGroundTruth(queryIntent?.rawQuery || queryIntent?.intent || 'general query', {} as any, {});
    return buildUnifiedSystemPrompt(persona, unified);
  }

  private buildUserMessage(
    userQuery: string,
    facts: Record<string, any>,
    classification: any,
    conversationHistory: ConversationMessage[]
  ): string {
    let message = `USER QUERY: "${userQuery}"\n\n`;
    message += `PRE-COMPUTED ASTROLOGICAL FACTS:\n${JSON.stringify(facts, null, 2)}\n\n`;
    message += `DOMAIN FOCUS: ${classification.domain}\n`;
    message += `SUGGESTED ANALYSIS ANGLE: ${classification.analysisAngle}\n`;

    if (conversationHistory.length > 0) {
      message += `\nCONVERSATION CONTEXT (last 4 exchanges):\n`;
      conversationHistory.slice(-8).forEach(msg => {
        message += `${msg.role.toUpperCase()}: ${msg.content}\n`;
      });
    }

    return message;
  }

  private async callGeminiWithRetry(
    systemPrompt: string,
    userMessage: string,
    conversationHistory: ConversationMessage[],
    persona: ConsultationPersona,
    language: "en" | "hi" | "te",
    maxRetries: number = 2
  ): Promise<string> {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const fullPrompt = `${systemPrompt}\n\n${userMessage}`;

        const res = await fetch("/api/advanced-ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: fullPrompt,
            systemInstructionOverride: systemPrompt,
            userQuery: userMessage,
            conversationHistory,
            persona,
            language
          })
        });

        if (res.ok) {
          const data = await res.json();
          if (data?.answer) {
            return data.answer;
          }
        } else if (res.status === 429 && attempt < maxRetries) {
          const backoff = Math.pow(2, attempt) * 1000;
          await new Promise(r => setTimeout(r, backoff));
          continue;
        }
      } catch (err) {
        if (attempt < maxRetries) {
          await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
          continue;
        }
      }
    }

    return this.generateFallbackConsultationResponse(userMessage);
  }

  public validateDataSafety(data: any): boolean {
    if (!data) return true;
    const forbiddenKeys = [
      "rawEphemeris",
      "coordinateMatrix"
    ];

    const dataKeys = JSON.stringify(data).toLowerCase();
    return !forbiddenKeys.some(key => dataKeys.includes(key.toLowerCase()));
  }

  private generateFallbackConsultationResponse(
    userMessage: string,
    birthData?: BirthDetails,
    horoscopeData?: any,
    language: "en" | "hi" | "te" = "te"
  ): string {
    const defaultBirthDetails: BirthDetails = birthData || {
      name: "Native",
      gender: "Male",
      date: new Date().toISOString().split('T')[0],
      time: "12:00",
      approximateTime: false,
      place: "Hyderabad",
      latitude: 17.385,
      longitude: 78.486,
      timezone: 5.5
    };

    let canonicalChart: CanonicalChartData | undefined;
    if (horoscopeData) {
      try {
        canonicalChart = ChartDataValidator.validateConsistency(horoscopeData, defaultBirthDetails);
      } catch (e) {
        // Fallback
      }
    }

    const groundTruth = computeUnifiedKPGroundTruth(userMessage, defaultBirthDetails, horoscopeData || {});
    const claims = ReasoningEngine.generateAstrologicalClaims(groundTruth, userMessage, canonicalChart);

    return PresentationEngine.generateTeluguReport(
      claims,
      groundTruth,
      userMessage,
      canonicalChart,
      language === "te" ? "te" : "en"
    );
  }
}

