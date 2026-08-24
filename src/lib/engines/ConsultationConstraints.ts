export const CONSULTATION_CONSTRAINTS = {
  // Never invent facts
  NEVER_INVENT_PLANETARY_DATA: {
    rule: 'Planetary positions and house cusps must come strictly from Layer 1 (ChartDataValidator / CalculationEngine) only.',
    violation: 'Inventing degrees, signs, or house positions not present in verified ground truth.',
    penalty: 'Reject response or replace with verified fallback data.'
  },

  // Never make unsupported jumps
  EVIDENCE_REQUIREMENT: {
    rule: 'Every astrological claim must cite specific supporting factors and clear reasoning chains (Placement → Lordship → Dasha → Transit).',
    violation: 'Jumping from "Mercury in 9th house" to "Earning via IT and foreign travel" without explicit house connection.',
    penalty: 'Lower confidence level to LOW or rewrite claim with verified factors.'
  },

  // Never over-commit
  CONFIDENCE_HONESTY: {
    rule: 'Match confidence statements to actual calculated confidence score and gatekeeper status. Use probabilistic language ("may manifest", "is supported") for transits/future windows.',
    violation: 'Calling a period a "Golden Period" or stating absolute guarantees.',
    penalty: 'Convert absolute language to probabilistic terms.'
  },

  // Never unsolicited prescriptions
  REMEDY_REQUIREMENT: {
    rule: 'Only generate remedy prescriptions if user explicitly requests remedies or if chart shows severe affliction.',
    violation: 'Unsolicited prescription of expensive gems or complex rituals.',
    penalty: 'Remove unsolicited remedy blocks from report.'
  },

  // Never false attribution
  SOURCE_VERIFICATION: {
    rule: 'Only cite classical texts (Parasara, Phaladeepika, KP Reader) if the specific rule is verified.',
    violation: 'Attributing arbitrary remedies or modern assertions to classical texts.',
    penalty: 'Rephrase as "traditional practice" or "KP method".'
  },

  // Dasha Sub-Lord Permissibility & Mutual Axis Rule
  DASHA_SUB_LORD_PERMISSIBILITY: {
    rule: 'The active sub-lord (Antardasha lord) can ONLY deliver results permitted by the main Dasha lord. When sitting in a 6-8 (Shashtashtaka) or 2-12 (Dwadasashtaka) relationship in natal or transits, it acts as a stress test causing friction, mental stress, health vulnerabilities, or sudden obstacles.',
    violation: 'Claiming an Antardasha lord delivers full favorable results independently while sitting on a 6-8 or 2-12 axis with the main Dasha lord.',
    penalty: 'Add friction/obstacle qualification and lower confidence for rapid realization.'
  }
};
