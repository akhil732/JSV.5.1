/**
 * Script normalizer for Indian languages (Telugu, Hindi) to ensure
 * Unicode NFC form consistency for string matching, search filters, and DB storage.
 */
export const normalizeTeluguScript = (text: string): string => {
  if (!text) return '';
  return text.normalize('NFC');
};

export const normalizeScript = (text: string, language: 'en' | 'te' | 'hi'): string => {
  if (!text) return '';
  const normalized = text.normalize('NFC');
  if (language === 'te' || language === 'hi') {
    // Additional Indic normalization if needed
    return normalized;
  }
  return normalized;
};
