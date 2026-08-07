export interface AstroTerm {
  en: string;
  te: string;
  hi: string;
  category: 'ui' | 'planet' | 'sign' | 'house' | 'kuta' | 'dosha' | 'kp' | 'dasha' | 'general';
}

export const ASTROLOGICAL_TERMS_MAP: Record<string, AstroTerm> = {
  // UI & General
  title: { en: "Jyothishya Sanathanam", te: "జ్యోతిష్య సనాతనం", hi: "ज्योतिष सनातनम", category: "ui" },
  birth_chart: { en: "Birth Chart Report", te: "జన్మ కుండలి నివేదిక", hi: "जन्म कुंडली रिपोर्ट", category: "ui" },
  ai_consultation: { en: "AI Consultation", te: "ఏఐ జ్యోతిష్య సలహా", hi: "एआई ज्योतिषीय सलाह", category: "ui" },
  marriage_match: { en: "Marriage Matching", te: "వివాహ పొంతన", hi: "विवाह मिलान", category: "ui" },
  kp_analysis: { en: "KP Analysis & Significators", te: "కేపీ విశ్లేషణ & సూచికలు", hi: "केपी विश्लेषण", category: "ui" },
  panchangam: { en: "Today's Panchangam", te: "నేటి పంచాంగం", hi: "आज का पंचांग", category: "ui" },
  profile_management: { en: "Birth Profiles", te: "జన్మ ప్రొఫైల్స్", hi: "प्रोफाइल प्रबंधन", category: "ui" },
  
  // Table Headers
  planet: { en: "Planet", te: "గ్రహం", hi: "ग्रह", category: "general" },
  sign: { en: "Sign", te: "రాశి", hi: "राशि", category: "general" },
  degree: { en: "Degree", te: "డిగ్రీ", hi: "अंश", category: "general" },
  speed: { en: "Speed", te: "వేగం", hi: "गति", category: "general" },
  house: { en: "House", te: "గృహం", hi: "भाव", category: "general" },
  nakshatra: { en: "Nakshatra", te: "నక్షత్రం", hi: "नक्षत्र", category: "general" },
  lord: { en: "Lord", te: "అధిపతి", hi: "स्वामी", category: "general" },
  sub_lord: { en: "Sub-Lord", te: "ఉప-అధిపతి", hi: "उप-स्वामी", category: "kp" },

  // Planets
  sun: { en: "Sun", te: "సూర్యుడు", hi: "सूर्य", category: "planet" },
  moon: { en: "Moon", te: "చంద్రుడు", hi: "चंद्र", category: "planet" },
  mars: { en: "Mars", te: "కుజుడు", hi: "मंगल", category: "planet" },
  mercury: { en: "Mercury", te: "బుధుడు", hi: "बुध", category: "planet" },
  jupiter: { en: "Jupiter", te: "గురుడు", hi: "गुरु", category: "planet" },
  venus: { en: "Venus", te: "శుక్రుడు", hi: "शुक्र", category: "planet" },
  saturn: { en: "Saturn", te: "శని", hi: "शनि", category: "planet" },
  rahu: { en: "Rahu", te: "రాహువు", hi: "राहु", category: "planet" },
  ketu: { en: "Ketu", te: "కేతువు", hi: "केतु", category: "planet" },

  // Signs / Rasis
  aries: { en: "Aries", te: "మేషం", hi: "मेष", category: "sign" },
  taurus: { en: "Taurus", te: "వృషభం", hi: "वृषभ", category: "sign" },
  gemini: { en: "Gemini", te: "మిథునం", hi: "मिथुन", category: "sign" },
  cancer: { en: "Cancer", te: "కర్కాటకం", hi: "कर्क", category: "sign" },
  leo: { en: "Leo", te: "సింహం", hi: "सिंह", category: "sign" },
  virgo: { en: "Virgo", te: "కన్య", hi: "कन्या", category: "sign" },
  libra: { en: "Libra", te: "తుల", hi: "तुला", category: "sign" },
  scorpio: { en: "Scorpio", te: "వృశ్చికం", hi: "वृश्चिक", category: "sign" },
  sagittarius: { en: "Sagittarius", te: "ధనుస్సు", hi: "धनु", category: "sign" },
  capricorn: { en: "Capricorn", te: "మకరం", hi: "मकर", category: "sign" },
  aquarius: { en: "Aquarius", te: "కుంభం", hi: "कुंभ", category: "sign" },
  pisces: { en: "Pisces", te: "మీనం", hi: "मीन", category: "sign" },

  // Kutas (Marriage Match)
  varna_kuta: { en: "Varna Kuta", te: "వర్ణ కుట", hi: "वर्ण कूट", category: "kuta" },
  vashya_kuta: { en: "Vashya Kuta", te: "వశ్య కుట", hi: "वश्य कूट", category: "kuta" },
  dina_kuta: { en: "Dina Kuta", te: "దిన కుట", hi: "दिन कूट", category: "kuta" },
  yoni_kuta: { en: "Yoni Kuta", te: "యోని కుట", hi: "योनि कूट", category: "kuta" },
  gana_kuta: { en: "Gana Kuta", te: "గణ కుట", hi: "गण कूट", category: "kuta" },
  bhakoot_kuta: { en: "Bhakoot Kuta", te: "భకూట కుట", hi: "भकूट कूट", category: "kuta" },
  rajju_kuta: { en: "Rajju Kuta", te: "రజ్జు కుట", hi: "रज्जु कूट", category: "kuta" },
  nakshatra_kuta: { en: "Nakshatra Kuta", te: "నక్షత్ర కుట", hi: "नक्षत्र कूट", category: "kuta" },

  // Doshas
  manglik_dosha: { en: "Manglik Dosha", te: "కుజ దోషం", hi: "मांगलिक दोष", category: "dosha" },
  rajju_dosha: { en: "Rajju Dosha", te: "రజ్జు దోషం", hi: "रज्जु दोष", category: "dosha" },
  bhakoot_dosha: { en: "Bhakoot Dosha", te: "భకూట దోషం", hi: "भकूट दोष", category: "dosha" },
  kalasarpa_dosha: { en: "Kala Sarpa Dosha", te: "కాలసర్ప దోషం", hi: "कालसर्प दोष", category: "dosha" },

  // Dashas
  mahadasha: { en: "Mahadasha", te: "మహాదశ", hi: "महादशा", category: "dasha" },
  antardasha: { en: "Antardasha", te: "అంతర్దశ", hi: "अन्तर्दशा", category: "dasha" },
  pratyantardasha: { en: "Pratyantardasha", te: "ప్రత్యంతర్దశ", hi: "प्रत्यन्तर्दशा", category: "dasha" },

  // KP & Advanced
  significator: { en: "Significator", te: "సూచిక (సిగ్నిఫికేటర్)", hi: "सूचक", category: "kp" },
  cusp: { en: "Cusp", te: "కస్ప్ (భావ మధ్యం)", hi: "भाव मध्य", category: "kp" },
  ruling_planets: { en: "Ruling Planets", te: "పరిపాలక గ్రహాలు", hi: "शासी ग्रह", category: "kp" }
};
