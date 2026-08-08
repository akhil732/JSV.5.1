/**
 * House Domain Mapper - KP Astrology House Significations
 * Source: Prof. K.S. Krishnamurti's textbook on Predictive Stellar Astrology
 */

import { DomainConfig, LifeDomain, KeywordPattern } from './queryIntent';

export interface BhavaInfo {
  house: number;
  sanskritName: string;
  domainName: string;
  tellsAbout: string;
  controls: string;
}

export const BHAVAS_REFERENCE_TABLE: Record<number, BhavaInfo> = {
  1: {
    house: 1,
    sanskritName: 'Lagna Bhav',
    domainName: 'Yourself & Personality',
    tellsAbout: 'Yourself & Personality',
    controls: 'Appearance, Health, Mindset, First Impressions'
  },
  2: {
    house: 2,
    sanskritName: 'Dhana Bhav',
    domainName: 'Wealth & Speech',
    tellsAbout: 'Wealth & Speech',
    controls: 'Savings, family lineage, voice, food habits'
  },
  3: {
    house: 3,
    sanskritName: 'Parakrama Bhav',
    domainName: 'Courage & Communication',
    tellsAbout: 'Courage & Communication',
    controls: 'Willpower, social media, writing, and younger siblings'
  },
  4: {
    house: 4,
    sanskritName: 'Sukha Bhav',
    domainName: 'Home & Peace',
    tellsAbout: 'Home & Peace',
    controls: 'Mother, childhood, property, inner happiness'
  },
  5: {
    house: 5,
    sanskritName: 'Putra Bhav',
    domainName: 'Intellect & Creativity',
    tellsAbout: 'Intellect & Creativity / Children',
    controls: 'Romance, education, children, progeny, past life karma'
  },
  6: {
    house: 6,
    sanskritName: 'Shatru Bhav',
    domainName: 'Obstacles & Routine',
    tellsAbout: 'Obstacles & Routine',
    controls: 'Daily job, health, debts, competition'
  },
  7: {
    house: 7,
    sanskritName: 'Yuvati Bhav',
    domainName: 'Marriage & Partnerships',
    tellsAbout: 'Marriage & Partnerships',
    controls: 'Spouse, business partners, public relations'
  },
  8: {
    house: 8,
    sanskritName: 'Mrityu Bhav',
    domainName: 'Transformation & Secrets',
    tellsAbout: 'Transformation & Secrets',
    controls: 'Sudden changes, occult, research, inheritance'
  },
  9: {
    house: 9,
    sanskritName: 'Bhagya Bhav',
    domainName: 'Luck & Wisdom',
    tellsAbout: 'Luck & Wisdom',
    controls: 'Father, higher studies, travel, life purpose'
  },
  10: {
    house: 10,
    sanskritName: 'Karma Bhav',
    domainName: 'Career & Reputation',
    tellsAbout: 'Career & Reputation',
    controls: 'Profession, status, public image, authority'
  },
  11: {
    house: 11,
    sanskritName: 'Labha Bhav',
    domainName: 'Gains & Networks',
    tellsAbout: 'Gains & Networks',
    controls: 'Income, social circles, wishes, and elder siblings'
  },
  12: {
    house: 12,
    sanskritName: 'Vyaya Bhav',
    domainName: 'Loss & Liberation',
    tellsAbout: 'Loss & Liberation',
    controls: 'Expenses, foreign lands, spirituality, isolation'
  }
};

/**
 * Complete mapping of life domains to astrological houses
 * Primary house is used for intent classification
 * Secondary houses provide supporting analysis
 */
export const DOMAIN_HOUSE_MAPPING: Record<LifeDomain, DomainConfig> = {
  CAREER: {
    domain: 'CAREER',
    primaryHouse: 10,      // 10th house = Profession, Career, Public Status
    secondaryHouses: [6, 11], // 6th = Service, 11th = Gains from profession
    significators: ['Sun (Government/Status)', 'Mercury (Trade/Intellect)', 'Mars (Action/Tech)', 'Saturn (Labor/Persistence)'],
    doshas: ['10th Lord in 6/8/12', 'Saturn-Rahu Affliction'],
    queryPatterns: [
      {
        domain: 'CAREER',
        keywords: ['business', 'profession', 'career', 'job', 'work', 'employment', 'employed', 'employ', 'suitable', 'job fit', 'ఉద్యోగం', 'వ్యాపారం', 'వృత్తి', 'పని', 'ప్రోమోషన్', 'ఆఫీసు', 'కంపెనీ', 'కొలువు', 'udyogam', 'vyaparam', 'vrutti'],
        weightage: 95,
        contextFree: true
      },
      {
        domain: 'CAREER',
        keywords: ['occupation', 'vocation', 'trade', 'industry', 'sector', 'ఉద్యోగ', 'ప్రమోషన్'],
        weightage: 85,
        contextFree: true
      },
      {
        domain: 'CAREER',
        keywords: ['startup', 'entrepreneur', 'self-employed', 'independent', 'స్వయం ఉపాధి'],
        weightage: 80,
        contextFree: true
      },
      {
        domain: 'CAREER',
        keywords: ['promotion', 'advancement', 'growth', 'progress', 'development', 'పదోన్నతి'],
        weightage: 75,
        contextFree: false
      },
      {
        domain: 'CAREER',
        keywords: ['transfer', 'relocation', 'change', 'shift', 'మారడం', 'మార్పు'],
        weightage: 70,
        contextFree: false,
        excludeKeywords: ['job', 'city'] // "relocation to city" might be travel
      }
    ]
  },

  FINANCE: {
    domain: 'FINANCE',
    primaryHouse: 2,       // 2nd house = Wealth, Finance, Acquisition
    secondaryHouses: [11, 8], // 11th = Gains/Income, 8th = Inheritance
    significators: ['Jupiter (Wealth)', 'Mercury (Business)', 'Venus (Prosperity)', '2nd Cusp (Accumulation)'],
    doshas: ['Daridra Yoga Indicator', 'Lagna/2nd Lord in 12th'],
    queryPatterns: [
      {
        domain: 'FINANCE',
        keywords: ['wealth', 'fortune', 'money', 'income', 'earnings', 'salary', 'financial', 'ధనం', 'డబ్బు', 'ఆదాయం', 'లాభం', 'సంపాదన', 'జీతం', 'ఆర్థిక', 'dhanam', 'dabbu', 'aadhayam', 'aarthika'],
        weightage: 95,
        contextFree: true
      },
      {
        domain: 'FINANCE',
        keywords: ['profit', 'gain', 'business', 'investment', 'invest', 'returns', 'పెట్టుబడి'],
        weightage: 85,
        contextFree: false // "business" could be CAREER or FINANCE
      },
      {
        domain: 'FINANCE',
        keywords: ['loan', 'debt', 'borrowing', 'credit', 'financial', 'రుణం', 'అప్పు'],
        weightage: 90,
        contextFree: true
      },
      {
        domain: 'FINANCE',
        keywords: ['rich', 'prosperity', 'abundance', 'affluent', 'ఐశ్వర్యం', 'శ్రీ'],
        weightage: 80,
        contextFree: true
      },
      {
        domain: 'FINANCE',
        keywords: ['raise', 'increment', 'bonus', 'gratuity', 'pension', 'పెంపు'],
        weightage: 85,
        contextFree: false
      }
    ]
  },

  MARRIAGE: {
    domain: 'MARRIAGE',
    primaryHouse: 7,       // 7th house = Marriage, Partnership, Spouse
    secondaryHouses: [1, 5], // 1st = Self, 5th = Romance
    kutas: ['Nadi Kuta (Health)', 'Bhakoot Kuta (Emotional)', 'Gana Kuta (Temperament)', 'Graha Maitri (Friendship)'],
    doshas: ['Kuja Dosha (Mars Affliction)', '7th Lord in 6/8/12'],
    significators: ['Venus (Love/Spouse)', 'Jupiter (Wisdom/Alliance)', '7th Cusp (Union)'],
    queryPatterns: [
      {
        domain: 'MARRIAGE',
        keywords: ['marriage', 'married', 'wedding', 'matrimony', 'spouse', 'partner', 'వివాహం', 'పెళ్లి', 'వివాహ', 'కళ్యాణం', 'సంబంధం', 'భార్య', 'భర్త', 'వరుడు', 'వధువు', 'శ్రీమతి', 'పత్ని', 'పతి', 'పెళ్ళి', 'దాంపత్యం', 'జోడి', 'vivaham', 'pelli', 'kalyanam'],
        weightage: 98,
        contextFree: true
      },
      {
        domain: 'MARRIAGE',
        keywords: ['love', 'relationship', 'affair', 'romance', 'engagement', 'ప్రేమ', 'ప్రేమికుడు', 'ప్రేమికురాలు', 'నిశ్చితార్థం'],
        weightage: 85,
        contextFree: false
      },
      {
        domain: 'MARRIAGE',
        keywords: ['compatibility', 'match', 'suitable', 'fit', 'కుజ దోషం', 'పొంతన'],
        weightage: 75,
        contextFree: false,
        excludeKeywords: ['career', 'job', 'profession']
      },
      {
        domain: 'MARRIAGE',
        keywords: ['timing', 'when', 'age', 'year', 'ఎప్పుడు', 'కాలం'],
        weightage: 70,
        contextFree: false
      },
      {
        domain: 'MARRIAGE',
        keywords: ['delay', 'late', 'obstacle', 'ఆలస్యం', 'అడ్డంకి'],
        weightage: 65,
        contextFree: false
      }
    ]
  },

  HEALTH: {
    domain: 'HEALTH',
    primaryHouse: 6,       // 6th house = Disease, Health, Medical
    secondaryHouses: [1, 8], // 1st = Physical body, 8th = Longevity/Chronic
    significators: ['Sun (Vitality)', '6th Cusp (Disease)', '8th Cusp (Chronic)', '12th Cusp (Hospitalization)'],
    doshas: ['Sade Sati Impact', '6th Lord affliction', 'Maraka/Badhaka association'],
    queryPatterns: [
      {
        domain: 'HEALTH',
        keywords: ['health', 'disease', 'illness', 'medical', 'doctor', 'hospital', 'ఆరోగ్యం', 'వ్యాధి', 'జబ్బు', 'అనారోగ్యం', 'వైద్యం', 'రోగాలు', 'ఆసుపత్రి', 'aarogyam', 'vyadhi', 'jabbu'],
        weightage: 95,
        contextFree: true
      },
      {
        domain: 'HEALTH',
        keywords: ['ailment', 'sick', 'fever', 'pain', 'injury', 'accident', 'నొప్పి', 'గాయం', 'ప్రమాదం'],
        weightage: 90,
        contextFree: true
      },
      {
        domain: 'HEALTH',
        keywords: ['recovery', 'cure', 'treatment', 'surgery', 'medicine', 'నయం', 'మందులు', 'చికిత్స', 'శస్త్రచికిత్స'],
        weightage: 85,
        contextFree: true
      },
      {
        domain: 'HEALTH',
        keywords: ['fitness', 'vitality', 'energy', 'strength', 'stamina', 'బలం', 'శక్తి'],
        weightage: 90,
        contextFree: true
      },
      {
        domain: 'HEALTH',
        keywords: ['longevity', 'lifespan', 'mortality', 'age', 'ఆయుష్షు'],
        weightage: 60,
        contextFree: false
      }
    ]
  },

  EDUCATION: {
    domain: 'EDUCATION',
    primaryHouse: 5,       // 5th house = Education, Learning, Intelligence
    secondaryHouses: [4, 9], // 4th = School, 9th = Higher learning
    significators: ['Mercury (Intellect)', 'Jupiter (Wisdom)', '4th Cusp (Foundational)', '5th Cusp (Higher Ed)'],
    doshas: ['Kemadruma Yoga', 'Mercury combust/retrograde'],
    queryPatterns: [
      {
        domain: 'EDUCATION',
        keywords: ['education', 'studies', 'exam', 'academic', 'university', 'school', 'college', 'degree', 'course', 'engineering', 'graduation', 'admission', 'చదువు', 'విద్య', 'పరీక్ష', 'పాఠశాల', 'కళాశాల', 'విశ్వవిద్యాలయం', 'విద్యాభ్యాసం', 'ర్యాంకు', 'మార్కులు', 'chaduvu', 'vidya', 'pareeksha'],
        weightage: 95,
        contextFree: true
      },
      {
        domain: 'EDUCATION',
        keywords: ['learning', 'course', 'degree', 'qualification', 'knowledge', 'జ్ఞానం', 'కోర్సు', 'డిగ్రీ'],
        weightage: 90,
        contextFree: true
      },
      {
        domain: 'EDUCATION',
        keywords: ['scholarship', 'admission', 'entrance', 'test', 'examination', 'ప్రవేశం', 'పరీక్షలు'],
        weightage: 85,
        contextFree: true
      }
    ]
  },

  CHILDREN: {
    domain: 'CHILDREN',
    primaryHouse: 5,       // 5th house = Putra Bhava (Children, Intellect, Procreation, Past Life Karma)
    secondaryHouses: [1, 2, 7, 9, 10, 11],
    significators: ['Jupiter (Putrakaraka)', '5th Cusp Sub Lord (Procreation Promise)', 'Moon (Fertility)', 'Venus (Conception)'],
    doshas: ['Putra Dosha', '5th Lord in 6/8/12', 'Santan Pratibandhak Yoga'],
    queryPatterns: [
      {
        domain: 'CHILDREN',
        keywords: ['childbirth', 'child birth', 'procreation', 'fertility', 'conception', 'pregnancy', 'pregnant', 'children', 'child', 'baby', 'babies', 'conceive', 'putra', 'santan', 'progeny', 'పిల్లలు', 'సంతానం', 'బాబు', 'పాప', 'కడుపు', 'గర్భం', 'ప్రసవం', 'పిల్లల', 'pillalu', 'santhanam', 'putra'],
        weightage: 95,
        contextFree: true
      },
      {
        domain: 'CHILDREN',
        keywords: ['how many children', 'timing of child', 'when child', 'possibility of child', 'child prospects', 'family expansion', 'సంతాన యోగం'],
        weightage: 95,
        contextFree: true
      },
      {
        domain: 'CHILDREN',
        keywords: ['son', 'daughter', 'kids', 'paternity', 'maternity', 'కుమారుడు', 'కుమార్తె'],
        weightage: 85,
        contextFree: false
      }
    ]
  },

  PROPERTY: {
    domain: 'PROPERTY',
    primaryHouse: 4,       // 4th house = Property, Real Estate, Home
    secondaryHouses: [2, 9],
    significators: ['Mars (Land/Property)', 'Venus (Luxury/Comfort)', '4th Cusp (Home/Vehicles)'],
    doshas: ['4th House affliction by malefics'],
    queryPatterns: [
      {
        domain: 'PROPERTY',
        keywords: ['property', 'house', 'home', 'real estate', 'land', 'building', 'ఆస్తి', 'ఇల్లు', 'భూమి', 'స్థలం', 'ఫ్లాట్', 'భవనం', 'వాహనం', 'కారు', 'aasti', 'illu', 'bhoomi'],
        weightage: 95,
        contextFree: true
      },
      {
        domain: 'PROPERTY',
        keywords: ['apartment', 'flat', 'bungalow', 'villa', 'residence', 'గృహం'],
        weightage: 90,
        contextFree: true
      },
      {
        domain: 'PROPERTY',
        keywords: ['purchase', 'buy', 'sell', 'acquisition', 'disposal', 'కొనుగోలు', 'అమ్మకం'],
        weightage: 85,
        contextFree: false
      }
    ]
  },

  LEGAL: {
    domain: 'LEGAL',
    primaryHouse: 6,       // 6th house = Disputes, Enemies, Litigation
    secondaryHouses: [8, 12],
    significators: ['Mars (Litigation)', 'Jupiter (Justice)', '6th Cusp (Disputes)', '12th Cusp (Confinement)'],
    doshas: ['Bandhana Yoga (Confinement)', '6th Lord in 12th'],
    queryPatterns: [
      {
        domain: 'LEGAL',
        keywords: ['court', 'legal', 'law', 'lawsuit', 'case', 'judge', 'justice', 'కోర్టు', 'కేసు', 'న్యాయస్థానం', 'వివాదం', 'చట్టం', 'లాయర్', 'న్యాయం', 'తీర్పు'],
        weightage: 95,
        contextFree: true
      },
      {
        domain: 'LEGAL',
        keywords: ['dispute', 'litigation', 'trial', 'verdict', 'judgment', 'తగాదా'],
        weightage: 90,
        contextFree: true
      }
    ]
  },

  TRAVEL: {
    domain: 'TRAVEL',
    primaryHouse: 12,      // 12th house = Foreign Travel, Distant Lands
    secondaryHouses: [9, 3],
    significators: ['Moon (Water travel)', 'Rahu (Foreign lands)', '3rd Cusp (Short trips)', '9th/12th Cusps (Long/Foreign trips)'],
    doshas: ['Rahu-Ketu transit blockages'],
    queryPatterns: [
      {
        domain: 'TRAVEL',
        keywords: ['travel', 'abroad', 'foreign', 'migration', 'migrate', 'movement', 'journey', 'visa', 'passport', 'relocate', 'relocation', 'ప్రయాణం', 'విదేశీ', 'విదేశాలకు', 'విదేశం', 'వీసా', 'పాస్‌పోర్ట్', 'వలస', 'యాత్ర', 'prayanam', 'videshi'],
        weightage: 95,
        contextFree: true
      },
      {
        domain: 'TRAVEL',
        keywords: ['overseas', 'international', 'immigration', 'emigration', 'విదేశీ ప్రయాణం'],
        weightage: 90,
        contextFree: true
      }
    ]
  },

  SPIRITUAL: {
    domain: 'SPIRITUAL',
    primaryHouse: 9,       // 9th house = Spirituality, Dharma, Fortune
    secondaryHouses: [12, 5],
    significators: ['Jupiter (Guru/Dharma)', 'Ketu (Moksha/Renunciation)', '9th Cusp (Religion)', '12th Cusp (Solitude)'],
    doshas: ['Guruchandal Yoga'],
    queryPatterns: [
      {
        domain: 'SPIRITUAL',
        keywords: ['spiritual', 'religion', 'faith', 'god', 'prayer', 'meditation', 'temple', 'worship', 'blessing', 'blessings', 'pilgrimage', 'moksha', 'dharma', 'guru', 'ఆధ్యాత్మికం', 'పూజ', 'దేవుడు', 'మంత్రం', 'జపం', 'గురువు', 'భక్తి', 'ధర్మం', 'ఆలయం'],
        weightage: 95,
        contextFree: true
      }
    ]
  },

  RELATIONSHIPS: {
    domain: 'RELATIONSHIPS',
    primaryHouse: 7,       // 7th house = Relationships & Partnerships
    secondaryHouses: [11, 5],
    significators: ['Venus (Romance)', 'Moon (Emotional bond)', '5th Cusp (Love/Affairs)', '11th Cusp (Friendships)'],
    doshas: ['5th Lord combust/debilitated'],
    queryPatterns: [
      {
        domain: 'RELATIONSHIPS',
        keywords: ['relationship', 'friend', 'friendship', 'social', 'connection', 'స్నేహం', 'మిత్రులు', 'బంధువులు', 'సంబంధాలు', 'స్నేహితులు', 'బంధం'],
        weightage: 85,
        contextFree: true,
        excludeKeywords: ['marriage', 'spouse', 'partner', 'వివాహం', 'పెళ్లి']
      },
      {
        // "Family" and "peace in the family" are interpersonal-harmony
        // queries about relations with family members, not a wealth/2nd-
        // house question and not specifically about the home/4th house —
        // they fit RELATIONSHIPS (7th house = relations with others)
        // better than any other domain currently modeled. Kept as a
        // separate, lower-weighted pattern (not merged into the primary
        // pattern above) since "family" alone is a weaker signal than
        // "relationship"/"friendship" and shouldn't dominate a query that
        // also contains a stronger domain-specific word.
        domain: 'RELATIONSHIPS',
        keywords: ['family harmony', 'family peace', 'peace in my family', 'peace in the family', 'family bond', 'family relations'],
        weightage: 80,
        contextFree: true,
        excludeKeywords: ['marriage', 'spouse', 'partner', 'wealth', 'money', 'finance', 'వివాహం', 'పెళ్లి']
      }
    ]
  }
};

/**
 * Get domain configuration by life domain
 */
export function getDomainConfig(domain: LifeDomain): DomainConfig {
  return DOMAIN_HOUSE_MAPPING[domain];
}

/**
 * Get all houses associated with a domain
 * BACKWARD COMPATIBLE: Returns array as well as having .primary and .secondary properties!
 */
export function getDomainHouses(domain: LifeDomain): number[] & { primary: number; secondary: number[] } {
  const config = DOMAIN_HOUSE_MAPPING[domain];
  const arr = [config.primaryHouse, ...config.secondaryHouses] as any;
  arr.primary = config.primaryHouse;
  arr.secondary = config.secondaryHouses;
  return arr;
}

/**
 * Get primary house for a domain
 */
export function getPrimaryHouse(domain: LifeDomain): number {
  return DOMAIN_HOUSE_MAPPING[domain].primaryHouse;
}

/**
 * Get all domain-specific significators
 */
export function getSignificators(domain: LifeDomain): string[] {
  return DOMAIN_HOUSE_MAPPING[domain].significators || [];
}

/**
 * Find domain by house number
 * Returns primary domain for the house
 */
export function findDomainByHouse(houseNumber: number): LifeDomain | null {
  for (const [domain, config] of Object.entries(DOMAIN_HOUSE_MAPPING)) {
    if (config.primaryHouse === houseNumber) {
      return domain as LifeDomain;
    }
  }
  return null;
}

/**
 * Get domain description
 */
export function getDomainDescription(domain: LifeDomain): string {
  const descriptions: Record<LifeDomain, string> = {
    CAREER: 'Career progression, profession, business suitability, and status',
    FINANCE: 'Wealth accumulation, money, monetary gains, and investments',
    MARRIAGE: 'Marriage promise, alliance, spouse, and nuptial timing',
    HEALTH: 'Vitality, diseases, illnesses, and surgery/recovery prognosis',
    EDUCATION: 'Academic studies, exams, college admission, and success',
    CHILDREN: 'Procreation, child birth timing, progeny prospects, family growth, intellect, and past life merit',
    PROPERTY: 'Purchasing or selling land, house, vehicles, and assets',
    LEGAL: 'Litigations, court cases, lawsuits, disputes, and legal outcomes',
    TRAVEL: 'Foreign travel, immigration, visas, and relocation',
    SPIRITUAL: 'Spiritual path, initiation, mantra, temples, and higher learning',
    RELATIONSHIPS: 'Love affairs, romantic bonds, partners, and friendships'
  };
  return descriptions[domain] || '';
}

/**
 * Backwards compatibility helper representing DOMAIN_MAPPINGS list
 */
export const DOMAIN_MAPPINGS = Object.entries(DOMAIN_HOUSE_MAPPING).map(([domain, config]) => ({
  domain: domain as LifeDomain,
  primaryHouse: config.primaryHouse,
  secondaryHouses: config.secondaryHouses,
  description: getDomainDescription(domain as LifeDomain),
  keywords: config.queryPatterns.flatMap(p => p.keywords.map(k => ({ word: k, weight: p.weightage })))
}));

export const CLARIFICATION_MAP = {
  BUSINESS_SUCCESS: {
    question: 'Is your question about business types/career suitability or financial profits and wealth gains?',
    options: [
      { text: 'Business/career suitability and type of profession', domain: 'CAREER' as LifeDomain, primaryHouse: 10 },
      { text: 'Financial gains, profits, and wealth accumulation', domain: 'FINANCE' as LifeDomain, primaryHouse: 2 }
    ]
  },
  RELOCATION: {
    question: 'Is your question about permanent foreign settlement/relocation abroad or purchasing residential property/house?',
    options: [
      { text: 'Foreign travel, visa, and relocation abroad', domain: 'TRAVEL' as LifeDomain, primaryHouse: 12 },
      { text: 'Buying a home, flat, or residential property locally', domain: 'PROPERTY' as LifeDomain, primaryHouse: 4 }
    ]
  },
  ROMANTIC_PARTNER: {
    question: 'Is your query about marriage and lifelong partnership, or dating, romantic affairs, and love connections?',
    options: [
      { text: 'Marriage prospects and timing', domain: 'MARRIAGE' as LifeDomain, primaryHouse: 7 },
      { text: 'Love affair, romantic connection, or dating', domain: 'RELATIONSHIPS' as LifeDomain, primaryHouse: 7 }
    ]
  }
};

/**
 * Checks if a query is ambiguous and returns clarification details
 */
export function detectAmbiguity(query: string, matchedDomains: LifeDomain[]): any | null {
  const queryLower = query.toLowerCase();

  if (
    (queryLower.includes('business') || queryLower.includes('company') || queryLower.includes('startup')) &&
    (queryLower.includes('profit') || queryLower.includes('succeed') || queryLower.includes('wealth') || queryLower.includes('grow'))
  ) {
    return CLARIFICATION_MAP.BUSINESS_SUCCESS;
  }

  if (queryLower.includes('relocate') || queryLower.includes('settle') || queryLower.includes('move')) {
    if (queryLower.includes('house') || queryLower.includes('property') || queryLower.includes('buy')) {
      return CLARIFICATION_MAP.RELOCATION;
    }
  }

  if (queryLower.includes('partner') || queryLower.includes('love') || queryLower.includes('meet')) {
    if (!queryLower.includes('marry') && !queryLower.includes('marriage')) {
      return CLARIFICATION_MAP.ROMANTIC_PARTNER;
    }
  }

  return null;
}