import type { AstrologicalClaim } from './AstrologicalClaim';
import type { UnifiedKPGroundTruth } from '../../components/AdvancedAITab/UnifiedKPGroundTruthEngine';
import type { CanonicalChartData } from './ChartDataValidator';

export class PresentationEngine {
  /**
   * Generates a structured Telugu report matching the executive roadmap structure.
   */
  static generateTeluguReport(
    claims: AstrologicalClaim[],
    groundTruth: UnifiedKPGroundTruth,
    userQuery: string,
    canonicalChart?: CanonicalChartData,
    language: 'te' | 'en' = 'te'
  ): string {
    if (language === 'en') {
      return this.generateEnglishReport(claims, groundTruth, userQuery, canonicalChart);
    }

    const verdictLabel = groundTruth.promise === 'YES' 
      ? 'అనుకూలము (Promised)' 
      : groundTruth.promise === 'DELAYED' 
        ? 'మిశ్రమ / ఆలస్యము (Delayed)' 
        : 'పరిమితము / నిరోధకము (Restricted)';

    const confidenceLabel = groundTruth.confidenceScore >= 80 
      ? 'అధికం (High)' 
      : groundTruth.confidenceScore >= 60 
        ? 'మితమైనది (Moderate)' 
        : 'పరిమితం (Low)';

    let report = `═══════════════════════════════════════════════════════════════
తెలుగు ఆస్ట్రో ఇంజిన్ — జాతక విశ్లేషణ
═══════════════════════════════════════════════════════════════

### 📋 మీ ప్రశ్న
"${userQuery}"

---

### 🎯 సంక్షిప్త సమాధానం

**ఫలితం:** ${verdictLabel} — ${groundTruth.houseDomain} పరిధిలో విశ్లేషణ.

**నమ్రత / నమ్మకం:** ${confidenceLabel} (విశ్వసనీయత స్కోరు: ${groundTruth.confidenceScore}%)

**సూచించిన సమయం:** ${groundTruth.timing}

---

### 1️⃣ జన్మ జాతకం ఆధారం

`;

    if (canonicalChart) {
      const planets = canonicalChart.rasi.planets;
      const asc = planets.Ascendant || planets.Lagna || { sign: 'తెలియదు', degree: 0 };
      const moon = planets.Moon || { sign: 'తెలియదు', degree: 0 };
      const sun = planets.Sun || { sign: 'తెలియదు', degree: 0 };

      report += `#### లగ్నం
- **లగ్న రాశి:** ${asc.sign} (${asc.degree}°)
- **స్థితి:** శారీరక, మానసిక ప్రాథమిక బలం

#### చంద్రుడు (మానసిక / సెంటిమెంట్)
- **చంద్ర రాశి:** ${moon.sign} (${moon.degree}°)
- **స్వభావం:** భావోద్వేగ దృక్పథం మరియు ఆలోచనా సరళి

#### సూర్యుడు (ఆత్మ / నిర్ణయాత్మక శక్తి)
- **సూర్య రాశి:** ${sun.sign} (${sun.degree}°)
- **స్వభావం:** ఆత్మవిశ్వాసము మరియు కార్యదక్షత
\n`;
    } else {
      report += `#### లగ్నం & చంద్ర రాశి
- **పరిధి:** ${groundTruth.houseDomain}
- **కస్ప్ సబ్-లార్డ్:** ${groundTruth.cuspSubLord}
\n`;
    }

    report += `---

### 2️⃣ విశ్లేషణ — సంబంధిత ఇళ్ల పరిశీలన (${groundTruth.houseDomain})

| అంశం | వివరాలు |
|------|---------|
| ప్రాథమిక ఇల్లు | ఇల్లు ${groundTruth.primaryHouse} |
| కస్ప్ సబ్-లార్డ్ | ${groundTruth.cuspSubLord} |
| సూచించే ఇళ్లు | [${groundTruth.cuspSubLordHouses.join(', ')}] |
| ప్రధాన సూచకులు | [${groundTruth.primarySignificators.join(', ')}] |

**విశ్లేషణ:** కస్ప్ సబ్-లార్డ్ (${groundTruth.cuspSubLord}) ఇళ్లు [${groundTruth.cuspSubLordHouses.join(', ')}] సూచించడం ద్వారా ఈ వర్గం ఫలితాలు నిర్ణయించబడ్డాయి.

---

### 3️⃣ ప్రస్తుత దశలు

#### సక్రియ దశ
- **ప్రస్తుత వింశోత్తరి దశ:** ${groundTruth.activeVimshottariDesc}
- **మహాదశా నాథుడు:** ${groundTruth.activeMahadasha}
- **అంతర్దశా నాథుడు:** ${groundTruth.activeAntardasha}

| దశ | నాథుడు | స్థితి |
|----|--------|--------|
| Mahadasha | ${groundTruth.activeMahadasha} | సక్రియం |
| Antardasha | ${groundTruth.activeAntardasha} | సక్రియం |

---

### 4️⃣ ప్రస్తుత సంచారాలు (గోచార పరిస్థితి)

- **చంద్ర రాశి నుండి సంచార వాతావరణం:** ${groundTruth.transitModulation}
- **గోచార ప్రభావం:** దశ ద్వారా లభించే ఫలితాలను గోచారం ${groundTruth.transitModulation === 'Supportive' ? 'వేగవంతం చేస్తుంది' : 'సమతుల్యం చేస్తుంది'}.

---

### 5️⃣ తీర్పు & సమయం

#### సమయ పరిధి: ${groundTruth.timing}
- **నిర్ణయం:** ${verdictLabel}
- **కారణం:** కస్ప్ సబ్-లార్డ్ మరియు సక్రియ వింశోత్తరి దశ సంకేతాల కలయిక.

---

### 6️⃣ జాగరూకతలు & సూచనలు

1. **క్రమశిక్షణ కలిగిన విధానం:** ప్రణాళికాబద్ధంగా వ్యూహాత్మక అడుగులు వేయండి.
2. **అనవసర తొందరపాటును నివారించండి:** స్పష్టమైన సమయ వ్యవధి కనిపించేవరకు స్థిరమైన నిర్ణయాలు తీసుకోండి.
3. **ఆర్థిక / వృత్తిపర రక్షణ:** బాధ్యతలను సరిగ్గా అంచనా వేసి నిర్వహించండి.

---

### 7️⃣ చివరి సారాంశం

**భవిష్యత్ దృక్పథం:** మీ జాతకంలో ${groundTruth.houseDomain} విభాగానికి సంబంధించి ${verdictLabel} పరిస్థితి ఉనికిలో ఉంది. ${groundTruth.timing} సమయంలో అనుకూల మార్పులు స్పష్టమవుతాయి.

---

### 📌 డేటా నాణ్యత నోట్
- **లెక్కించిన సమయం:** ${groundTruth.computedAt || new Date().toISOString()}
- **అయనాంశ:** ${canonicalChart?.ayanamshaUsed || 'Lahiri'}
- **విశ్వసనీయత:** ${groundTruth.confidenceScore}% (${confidenceLabel})
${groundTruth.missingDataItems.length > 0 ? `- **పరిమితులు (డేటా కొరత):** ${groundTruth.missingDataItems.join(', ')}` : ''}

═══════════════════════════════════════════════════════════════`;

    return report;
  }

  private static generateEnglishReport(
    claims: AstrologicalClaim[],
    groundTruth: UnifiedKPGroundTruth,
    userQuery: string,
    canonicalChart?: CanonicalChartData
  ): string {
    return `═══════════════════════════════════════════════════════════════
Telugu AI Engine — Astrological Analysis Report
═══════════════════════════════════════════════════════════════

### 📋 Your Query
"${userQuery}"

---

### 🎯 Executive Summary

**Verdict:** ${groundTruth.promise} — Analysis for ${groundTruth.houseDomain}.
**Confidence Level:** ${groundTruth.confidenceScore}%
**Timing Window:** ${groundTruth.timing}

---

### 1️⃣ Natal Foundation
- Primary Domain: ${groundTruth.houseDomain}
- Cusp Sub-Lord: ${groundTruth.cuspSubLord}
- Signified Houses: [${groundTruth.cuspSubLordHouses.join(', ')}]

---

### 2️⃣ Active Dasha & Transits
- Active Dasha: ${groundTruth.activeVimshottariDesc}
- Transit Support: ${groundTruth.transitModulation}

---

### 3️⃣ Evidence-Backed Findings
${claims.map(c => `• **${c.claim}**\n  Reasoning: ${c.evidence.reasoning}`).join('\n\n')}

---

### 📌 Data Quality & Audit
- Ayanamsha: ${canonicalChart?.ayanamshaUsed || 'Lahiri'}
- Calculated At: ${groundTruth.computedAt}
- Confidence: ${groundTruth.confidenceScore}%
═══════════════════════════════════════════════════════════════`;
  }
}
