import { useCallback } from 'react';
import { LensAutoDetectionService } from '../lib/services/LensAutoDetectionService';
import { ConsultationPersona } from '../lib/services/EnhancedGeminiConsultationService';

export function useLensAutoDetect() {
  const detectLens = useCallback((query: string): ConsultationPersona => {
    return LensAutoDetectionService.detectIntent(query);
  }, []);

  return { detectLens };
}
