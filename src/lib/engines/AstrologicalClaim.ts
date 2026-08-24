export type ClaimType = 
  | 'VERIFIED_PLACEMENT'
  | 'VERIFIED_LORDSHIP'
  | 'HOUSE_SIGNIFICATION'
  | 'DASHA_ACTIVATION'
  | 'TRANSIT_SUPPORT'
  | 'INTERPRETIVE_INFERENCE'
  | 'REMEDIAL_SUGGESTION';

export type ClaimConfidence = 'VERIFIED' | 'HIGH' | 'MODERATE' | 'LOW' | 'SPECULATIVE';

export interface AstrologicalClaim {
  claim: string;  // e.g., "Earning through intellectual/technical fields is possible"
  type: ClaimType;
  confidence: ClaimConfidence;
  evidence: {
    factors: string[];  // e.g., ["Mercury placement in 8th house", "2nd & 11th house signification"]
    reasoning: string;  // Explicit rule or principle
    source?: string;    // e.g., "KP Sub-Lord Analysis" or "Parashari Hora"
  };
  qualifier?: string;  // e.g., "Conditional on Mercury Dasha phase and transit alignment"
}

export function formatClaimTeluguWithEvidence(claim: AstrologicalClaim, language: 'te' | 'en' = 'te'): string {
  const confidenceSymbol = {
    'VERIFIED': '✓',
    'HIGH': '✓✓',
    'MODERATE': '→',
    'LOW': '?',
    'SPECULATIVE': '◊'
  }[claim.confidence];

  if (language === 'te') {
    return `
${confidenceSymbol} **${claim.claim}**

📌 **కారణాలు:** ${claim.evidence.factors.join(', ')}

📖 **సూత్రం:** ${claim.evidence.reasoning}

${claim.qualifier ? `⚠️ **నిబంధన:** ${claim.qualifier}` : ''}
    `.trim();
  } else {
    return `
${confidenceSymbol} **${claim.claim}**

📌 **Evidence:** ${claim.evidence.factors.join(', ')}

📖 **Rule:** ${claim.evidence.reasoning}

${claim.qualifier ? `⚠️ **Qualifier:** ${claim.qualifier}` : ''}
    `.trim();
  }
}
