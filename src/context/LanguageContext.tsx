import React, { createContext, useContext, useState, useEffect } from 'react';
import { ASTROLOGICAL_TERMS_MAP } from '../lib/i18n/astrologicalTerms';
import { normalizeTeluguScript } from '../lib/i18n/scriptNormalizer';

export type Language = 'en' | 'te' | 'hi';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('app_language');
    if (saved === 'en' || saved === 'te' || saved === 'hi') {
      return saved as Language;
    }
    return 'te'; // Default to Telugu for regional preference
  });

  useEffect(() => {
    localStorage.setItem('app_language', language);
    // Set html lang attribute
    document.documentElement.setAttribute('lang', language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    const term = ASTROLOGICAL_TERMS_MAP[key];
    if (!term) {
      // Fallback: check if key itself has spaced format or return key
      return key;
    }
    return normalizeTeluguScript(term[language] || term.en);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
