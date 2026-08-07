import { useState } from "react";
import {
  EnhancedGeminiConsultationService,
  ConversationMessage,
  ConsultationPersona,
  VedicGroundTruths
} from "../lib/services/EnhancedGeminiConsultationService";
import type { BirthDetails } from "../types";

export interface SubmitQueryParams {
  birthData: BirthDetails;
  horoscopeData?: any;
  userQuery: string;
  conversationHistory: ConversationMessage[];
  persona?: ConsultationPersona;
  sessionId?: string;
  userId?: string;
  language?: "en" | "hi" | "te";
  onChunk?: (text: string) => void;
}

export interface ConsultationHookResponse {
  content: string;
  metadata?: {
    queryDomain?: string;
    confidence?: number;
    kpGroundTruths?: VedicGroundTruths;
    persona?: ConsultationPersona;
  };
}

export const useQueryConsultation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const service = new EnhancedGeminiConsultationService();

  const submitQuery = async (
    params: SubmitQueryParams
  ): Promise<ConsultationHookResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      let response: ConversationMessage;

      if (params.onChunk) {
        response = await service.generateStreamingConsultationResponse(
          {
            birthData: params.birthData,
            horoscopeData: params.horoscopeData,
            userQuery: params.userQuery,
            conversationHistory: params.conversationHistory,
            persona: params.persona,
            userId: params.userId,
            language: params.language
          },
          params.onChunk
        );
      } else {
        response = await service.generateConsultationResponse({
          birthData: params.birthData,
          horoscopeData: params.horoscopeData,
          userQuery: params.userQuery,
          conversationHistory: params.conversationHistory,
          persona: params.persona,
          userId: params.userId,
          language: params.language
        });
      }

      return {
        content: response.content,
        metadata: response.metadata
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";

      let errorCode = "API_ERROR";
      if (errorMessage.includes("429")) errorCode = "RATE_LIMIT";
      if (errorMessage.includes("timeout")) errorCode = "API_TIMEOUT";
      if (errorMessage.includes("network")) errorCode = "NETWORK_ERROR";

      setError(errorCode);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const computeKPGroundTruths = (
    userQuery: string,
    birthData: BirthDetails,
    horoscopeData?: any
  ): VedicGroundTruths => {
    return service.computeKPGroundTruths(userQuery, birthData, horoscopeData);
  };

  return { isLoading, error, submitQuery, computeKPGroundTruths };
};
