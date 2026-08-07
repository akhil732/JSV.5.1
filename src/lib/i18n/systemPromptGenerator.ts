import { ASTROLOGICAL_TERMS_MAP } from './astrologicalTerms';
import { normalizeTeluguScript } from './scriptNormalizer';

export const generateSystemPrompt = (language: 'en' | 'te' | 'hi'): string => {
  const basePrompts = {
    en: "You are an elite, world-class Vedic and KP Astrologer empowered with Google Search Grounding. Analyze the chart using strict deterministic rules.",
    te: "మీరు అత్యంత కచ్చితమైన వేద మరియు KP జ్యోతిషశాస్త్ర నిపుణులు. ఖచ్చితమైన నియమాలను ఉపయోగించి చార్ట్ను విశ్లేషించండి.",
    hi: "आप एक अत्यधिक सटीक वैदिक और केपी ज्योतिष विशेषज्ञ हैं। सख्त नियमों का उपयोग करके चार्ट का विश्लेषण करें।"
  };

  const langName = language === 'te' ? 'Telugu' : language === 'hi' ? 'Hindi' : 'English';

  const injectedGlossary = Object.entries(ASTROLOGICAL_TERMS_MAP).reduce((acc, [key, term]) => {
    acc[term.en] = normalizeTeluguScript(term[language]);
    return acc;
  }, {} as Record<string, string>);

  return `${basePrompts[language]}

CRITICAL INSTRUCTION: You MUST write your entire response in ${langName}. You MUST use the following exact translated astrological terminology in your output. Do not invent your own translations.

${JSON.stringify(injectedGlossary, null, 2)}`;
};
