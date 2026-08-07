export interface AstroGlossaryItem {
  term: string;
  sanskrit: string;
  category: 'kuta' | 'dosha' | 'chart' | 'planet';
  shortMeaning: string;
  fullDescription: string;
  maxScore?: number;
  whyItMatters: string;
  severityScale?: string;
  populationContext?: string;
  remedies?: string[];
  marriageInsight?: string;
}

export const ASTRO_GLOSSARY: Record<string, AstroGlossaryItem> = {
  // --- KUTAS ---
  "Varna Kuta": {
    term: "Varna Kuta",
    sanskrit: "वर्ण कूट",
    category: "kuta",
    shortMeaning: "Spiritual & Ego Alignment",
    fullDescription: "Evaluates spiritual harmony, ego alignment, and mutual respect in life goals.",
    maxScore: 1,
    whyItMatters: "Ensures both partners share compatible values and don't clash on fundamental life philosophy.",
    marriageInsight: "A high score indicates effortless mutual respect without ego power struggles."
  },
  "Vashya Kuta": {
    term: "Vashya Kuta",
    sanskrit: "वश्य कूट",
    category: "kuta",
    shortMeaning: "Mutual Attraction & Influence",
    fullDescription: "Measures mutual magnetism, equality of influence, and power balance between partners.",
    maxScore: 2,
    whyItMatters: "Determines whether one partner dominates or if both feel equal in decision making.",
    marriageInsight: "Balanced magnetism prevents feelings of resentment or one-sided control."
  },
  "Dina Kuta": {
    term: "Dina Kuta",
    sanskrit: "दिन कूट",
    category: "kuta",
    shortMeaning: "Health, Longevity & Daily Vibe",
    fullDescription: "Calculated from birth stars (Nakshatras) to assess day-to-day comfort and vitality.",
    maxScore: 3,
    whyItMatters: "Fosters routine harmony, mutual well-being, and sustained health over decades.",
    marriageInsight: "Brings day-to-day ease and shared physical stamina in household routines."
  },
  "Yoni Kuta": {
    term: "Yoni Kuta",
    sanskrit: "योनि कूट",
    category: "kuta",
    shortMeaning: "Intimacy & Physical Harmony",
    fullDescription: "Based on animal symbols assigned to birth stars, measuring romantic and physical chemistry.",
    maxScore: 4,
    whyItMatters: "Deep physical and emotional attraction nurtures long-term warmth and bonding.",
    marriageInsight: "Favorable matches build instinctive affection and natural physical comfort."
  },
  "Gana Kuta": {
    term: "Gana Kuta",
    sanskrit: "गण कूट",
    category: "kuta",
    shortMeaning: "Temperament & Mindset Match",
    fullDescription: "Categorizes temperaments into Deva (Divine/Gentle), Manushya (Human/Pragmatic), and Rakshasa (Fiery/Ambitious).",
    maxScore: 6,
    whyItMatters: "Crucial for day-to-day communication and conflict resolution styles.",
    marriageInsight: "Matching temperaments prevents misunderstandings during stressful life moments."
  },
  "Bhakoot Kuta": {
    term: "Bhakoot Kuta",
    sanskrit: "भकूट कूट",
    category: "kuta",
    shortMeaning: "Emotional Bond & Prosperity",
    fullDescription: "Evaluates the relative position of birth moons to ensure emotional closeness and growth.",
    maxScore: 7,
    whyItMatters: "Guards against emotional distance, family conflicts, and financial stagnation.",
    marriageInsight: "Strong Bhakoot creates deep emotional empathy and joint prosperity."
  },
  "Rajju Kuta": {
    term: "Rajju Kuta",
    sanskrit: "रज्जु कूट",
    category: "kuta",
    shortMeaning: "Longevity & Marital Bond Strength",
    fullDescription: "Assesses physical wellbeing and durability of the marital union based on Nakshatra body zones.",
    maxScore: 5,
    whyItMatters: "Considered one of the most vital rules for relationship stability and long life.",
    marriageInsight: "Protects the longevity of the partnership through changing life phases."
  },
  "Nakshatra Kuta": {
    term: "Nakshatra Kuta",
    sanskrit: "नक्षत्र कूट (स्त्री-दीर्घ)",
    category: "kuta",
    shortMeaning: "Psychological Chemistry",
    fullDescription: "Measures fundamental psychological compatibility and deep soul resonance.",
    maxScore: 8,
    whyItMatters: "Builds unspoken understanding and intuitive empathy between partners.",
    marriageInsight: "High Nakshatra compatibility allows partners to finish each other's sentences."
  },

  // --- DOSHAS ---
  "Manglik Dosha": {
    term: "Manglik Dosha",
    sanskrit: "मंगल दोष (कुज दोष)",
    category: "dosha",
    shortMeaning: "Mars Energy Placement",
    fullDescription: "Occurs when Mars is positioned in houses 1, 2, 4, 7, 8, or 12 relative to Ascendant, Moon, or Venus.",
    whyItMatters: "Mars represents high drive, passion, and assertiveness which need constructive outlets in marriage.",
    severityScale: "Mild | Moderate | Cancelled | Serious",
    populationContext: "Affects roughly 40-50% of natal charts. Many successful, enduring marriages exist with Mars placement.",
    remedies: [
      "Marry after age 28 when Mars energy naturally matures.",
      "Chant Hanuman Chalisa or Mangal Stotram regularly.",
      "Perform a simple Mangal Shanti Pooja or charity on Tuesdays.",
      "Focus on active communication and constructive physical exercise together."
    ],
    marriageInsight: "High energy can be channeled into shared ambitions, sports, and passionate goals."
  },
  "Rajju Dosha": {
    term: "Rajju Dosha",
    sanskrit: "रज्जु दोष",
    category: "dosha",
    shortMeaning: "Nakshatra Body Zone Overlap",
    fullDescription: "Occurs when both birth stars belong to the exact same Rajju (Sira, Kantha, Udara, Kati, or Pada).",
    whyItMatters: "May create occasional friction in health or travel routines if unaddressed.",
    severityScale: "Mild to Moderate",
    populationContext: "Very common when partners share birth star categories.",
    remedies: [
      "Perform Mritunjaya Japa or Lord Shiva worship.",
      "Perform Pada Pooja during marriage ceremonies.",
      "Wear gemstone remedies as recommended by a trusted astrologer."
    ],
    marriageInsight: "Awareness of individual health needs easily mitigates potential stress."
  },
  "Bhakoot Dosha": {
    term: "Bhakoot Dosha",
    sanskrit: "भकूट दोष",
    category: "dosha",
    shortMeaning: "Moon Sign Angle Friction",
    fullDescription: "Occurs when Moon signs are in 2/12, 5/9, or 6/8 positions relative to each other.",
    whyItMatters: "Can lead to temporary differences in emotional expression or financial priorities.",
    severityScale: "Mild | Moderate (Cancelled if Moon lords are friendly)",
    populationContext: "Often mitigated or cancelled automatically if the ruling planets of both Moon signs are friends (e.g. Sun & Jupiter).",
    remedies: [
      "Perform Lord Vishnu or Lakshmi Pooja.",
      "Practice active listening and financial transparency.",
      "Chant Moon mantras (Om Som Somaya Namah)."
    ],
    marriageInsight: "Open dialogue converts emotional differences into complementary strengths."
  },

  // --- CHARTS ---
  "Rasi Chart": {
    term: "Rasi Chart (D-1)",
    sanskrit: "लग्न कुण्डली",
    category: "chart",
    shortMeaning: "Foundation Birth Chart",
    fullDescription: "The primary snapshot of the heavens at the exact moment and place of birth.",
    whyItMatters: "Forms the master baseline for all astrological analysis, planetary strengths, and house positions.",
    marriageInsight: "Shows baseline temperament, physical vitality, and core identity."
  },
  "Navamsa Chart": {
    term: "Navamsa Chart (D-9)",
    sanskrit: "नवांश कुण्डली",
    category: "chart",
    shortMeaning: "Marriage & Soul Potential Chart",
    fullDescription: "The 9th harmonic chart specifically dedicated to marriage, life partner traits, and inner soul strength.",
    whyItMatters: "Crucial for verifying whether positive birth chart indications will blossom after marriage.",
    marriageInsight: "Often reveals deeper relationship contentment and partner character than D-1 alone."
  },

  // --- PLANETS ---
  "Sun": {
    term: "Sun (Surya)",
    sanskrit: "सूर्य",
    category: "planet",
    shortMeaning: "Identity & Self-Worth",
    fullDescription: "Represents ego, soul energy, vitality, and leadership style.",
    whyItMatters: "Determines how partners handle respect, confidence, and public identity.",
    marriageInsight: "Well-placed Sun brings mutual pride, honesty, and inspiring leadership."
  },
  "Moon": {
    term: "Moon (Chandra)",
    sanskrit: "चन्द्र",
    category: "planet",
    shortMeaning: "Emotions & Nurturing",
    fullDescription: "Represents the mind, feelings, maternal instinct, and intuitive empathy.",
    whyItMatters: "Forms the cornerstone of daily emotional comfort and closeness.",
    marriageInsight: "Strong Moon harmony creates a peaceful, emotionally secure home environment."
  },
  "Mars": {
    term: "Mars (Mangala)",
    sanskrit: "मंगल",
    category: "planet",
    shortMeaning: "Drive & Passion",
    fullDescription: "Represents physical stamina, ambition, courage, and sexual drive.",
    whyItMatters: "Controls excitement, passion, and how anger or disagreement is handled.",
    marriageInsight: "Channeled constructively, Mars drives shared projects and dynamic passion."
  },
  "Venus": {
    term: "Venus (Shukra)",
    sanskrit: "शुक्र",
    category: "planet",
    shortMeaning: "Love, Harmony & Romance",
    fullDescription: "The primary significator of marriage, affection, aesthetics, and marital joy.",
    whyItMatters: "Determines how partners express affection, romance, and artistic appreciation.",
    marriageInsight: "Afflicted Venus needs extra care in romantic gestures; exalted Venus brings lifelong affection."
  }
};
