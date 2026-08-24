import type { AstrologicalClaim } from './AstrologicalClaim';
import type { UnifiedKPGroundTruth } from '../../components/AdvancedAITab/UnifiedKPGroundTruthEngine';
import type { CanonicalChartData } from './ChartDataValidator';
import { computeLiveTransitSnapshot } from './LiveTransitEngine';

export class ReasoningEngine {
  /**
   * Deterministically produces evidence-backed claims based on ground truth data and query intent.
   * Eliminates unsupported LLM leaps, arbitrary career predictions, or absolute "golden period" claims.
   */
  static generateAstrologicalClaims(
    groundTruth: UnifiedKPGroundTruth,
    userQuery: string,
    canonicalChart?: CanonicalChartData
  ): AstrologicalClaim[] {
    const claims: AstrologicalClaim[] = [];

    // 1. GATEKEEPER VERDICT CLAIM
    if (groundTruth.promise === 'YES') {
      claims.push({
        claim: `విచారించిన అంశం (${groundTruth.houseDomain}) జాతకంలో అనుకూలంగ స్పష్టంగా వాగ్దానం చేయబడింది.`,
        type: 'VERIFIED_PLACEMENT',
        confidence: 'VERIFIED',
        evidence: {
          factors: [
            `కస్ప్ సబ్-లార్డ్ (${groundTruth.cuspSubLord}) అనుకూల స్థానాలను [${groundTruth.cuspSubLordHouses.join(', ')}] సూచిస్తోంది`
          ],
          reasoning: 'KP గేట్‌కీపర్ సూత్రం: సబ్-లార్డ్ సంబంధిత అనుకూల ఇళ్లను సూచించినప్పుడు ఫలితం సిద్ధించడం నిశ్చయం.',
          source: 'KP Sub-Lord Methodology'
        }
      });
    } else if (groundTruth.promise === 'DELAYED') {
      claims.push({
        claim: `విచారించిన అంశం (${groundTruth.houseDomain}) జాతకంలో సంభవించే అవకాశం ఉంది, కానీ కొంత ఆలస్యం లేదా ఆటంకాలు సూచించబడుతున్నాయి.`,
        type: 'VERIFIED_PLACEMENT',
        confidence: 'VERIFIED',
        evidence: {
          factors: [
            `కస్ప్ సబ్-లార్డ్ (${groundTruth.cuspSubLord}) మిశ్రమ/పరిమిత స్థానాలను సూచిస్తోంది`
          ],
          reasoning: 'KP గేట్‌కీపర్ సూత్రం: మిశ్రమ సంకేతాలు ఉన్నప్పుడు సమయపాలనలో ఆలస్యం లేదా ప్రతిబంధకాలు ఏర్పడతాయి.',
          source: 'KP Sub-Lord Methodology'
        },
        qualifier: 'దశా మరియు అనుకూల సంచారాలు కలిసినప్పుడు మాత్రమే ఫలితం వ్యక్తమవుతుంది.'
      });
    } else {
      claims.push({
        claim: `విచారించిన అంశంలో (${groundTruth.houseDomain}) ప్రస్తుత జాతక స్థితుల ప్రకారం ప్రత్యక్ష అనుకూలత పరిమితంగా ఉంది.`,
        type: 'VERIFIED_PLACEMENT',
        confidence: 'VERIFIED',
        evidence: {
          factors: [
            `కస్ప్ సబ్-లార్డ్ (${groundTruth.cuspSubLord}) ప్రతిబంధక ఇళ్లను సూచిస్తోంది`
          ],
          reasoning: 'KP గేట్‌కీపర్ సూత్రం: నిరోధక ఇళ్ల ప్రభావం ఉన్నప్పుడు ప్రత్యామ్నాయ మార్గాలను అన్వేషించడం ఉత్తమం.',
          source: 'KP Sub-Lord Methodology'
        }
      });
    }

    // 2. DASHA ACTIVATION CLAIM & MUTUAL RELATIONSHIP (6-8 / 2-12 AXIS) CHECK
    if (groundTruth.activeMahadasha && groundTruth.activeAntardasha) {
      const isDelayed = groundTruth.promise === 'DELAYED';
      claims.push({
        claim: `ప్రస్తుత ${groundTruth.activeMahadasha} మహాదశ - ${groundTruth.activeAntardasha} అంతర్దశ ఈ రంగాన్ని సక్రియం చేస్తోంది.`,
        type: 'DASHA_ACTIVATION',
        confidence: 'HIGH',
        evidence: {
          factors: [
            `ప్రస్తుత దశ: ${groundTruth.activeVimshottariDesc}`,
            `వింశోత్తరి దశ సమయం: ${groundTruth.timing}`
          ],
          reasoning: 'వింశోత్తరి దశ సూత్రం: దశానాథుడు మరియు భుక్తినాథుడు చురుగ్గా ఉన్నప్పుడు మాత్రమే జాతక వాగ్దానం బయటకు వస్తుంది. అంతర్దశా నాథుడు సాధించే ఫలితాలు మహాదశా నాథుని అనుమతికి లోబడి ఉంటాయి.',
          source: 'Vimshottari Dasha Engine'
        },
        qualifier: isDelayed ? 'ఆలస్యం తగ్గడానికి క్రమశిక్షణతో కూడిన ప్రణాళిక అవసరం.' : undefined
      });

      // EVALUATE 6-8 (Shashtashtaka) AND 2-12 (Dwadasashtaka) MUTUAL AXIS
      const stressRelationships = this.evaluateDashaRelationship(
        groundTruth.activeMahadasha,
        groundTruth.activeAntardasha,
        canonicalChart
      );

      for (const rel of stressRelationships) {
        claims.push({
          claim: rel.claimTextTelugu,
          type: 'DASHA_ACTIVATION',
          confidence: 'HIGH',
          evidence: {
            factors: [
              `మహాదశా నాథుడు: ${groundTruth.activeMahadasha}`,
              `అంతర్దశా నాథుడు: ${groundTruth.activeAntardasha}`,
              `సంబంధం/అక్షం: ${rel.axisType === 'SHASHTASHTAKA' ? '6-8 (షష్టాష్టకం)' : '2-12 (ద్వాదశాష్టకం)'} [${rel.context}]`
            ],
            reasoning: rel.reasoningTelugu,
            source: 'Vimshottari Dasha & Gochara Relationship Rules'
          },
          qualifier: 'అంతర్దశా నాథుడు మహాదశా నాథుని అనుమతికి లోబడి మాత్రమే ఫలితాలు ఇస్తాడు; 6/8 లేదా 2/12 అక్షం మానసిక ఒత్తిడి, ఆటంకాలు మరియు ఆరోగ్య జాగ్రత్తలను కోరుతుంది.'
        });
      }
    }

    // 3. TRANSIT MODULATION CLAIM (Probabilistic, no "Golden Period" absolute claim)
    if (groundTruth.transitModulation) {
      const isSupportive = groundTruth.transitModulation === 'Supportive';
      claims.push({
        claim: `ప్రస్తుత గ్రహ గోచార సంచారం జాతకానికి ${isSupportive ? 'సహకార' : 'మిశ్రమ/రక్షణాత్మక'} వాతావరణాన్ని అందిస్తోంది.`,
        type: 'TRANSIT_SUPPORT',
        confidence: 'MODERATE',
        evidence: {
          factors: [
            `చంద్రుని నుండి గ్రహ సంచారాల స్థాయి: ${groundTruth.transitModulation}`
          ],
          reasoning: 'గోచార సూత్రం: ప్రధాన గ్రహాల (శని, గురు) సంచారం దశ ద్వారా లభించే ఫలితాలను వేగవంతం లేదా మందగమనం చేస్తాయి.',
          source: 'Gochara Transit Principles'
        },
        qualifier: 'గోచార ఫలితాలు తాత్కాలిక వాతావరణాన్ని మాత్రమే సూచిస్తాయి; మూల జాతక బలమే ముఖ్యం.'
      });
    }

    // 4. TIMING WINDOW CLAIM
    claims.push({
      claim: `సంభావ్య ఫలితాల సమయ పరిధి: ${groundTruth.timing}`,
      type: 'DASHA_ACTIVATION',
      confidence: groundTruth.confidenceScore > 75 ? 'HIGH' : 'MODERATE',
      evidence: {
        factors: [
          `వింశోత్తరి దశల సమయ పరిధులు`,
          `కస్ప్ సబ్-లార్డ్ సంబంధిత ఇళ్ల సూచనలు`
        ],
        reasoning: 'KP పద్ధతి: దశానాథుడు అనుకూల ఇళ్లకు సంబంధించి నడుస్తున్న సమయ వ్యవధిలోనే సంఘటన నెరవేరుతుంది.',
        source: 'KP Timing Engine'
      }
    });

    return claims;
  }

  /**
   * Evaluates mutual relationship (6-8 Shashtashtaka or 2-12 Dwadasashtaka)
   * between active Dasha Lord and Antardasha Lord in Natal chart and Transits.
   */
  static evaluateDashaRelationship(
    mdLord: string,
    adLord: string,
    canonicalChart?: CanonicalChartData,
    queryDate: Date = new Date()
  ): {
    hasStressAxis: boolean;
    axisType: 'SHASHTASHTAKA' | 'DWADASASHTAKA';
    context: 'NATAL' | 'TRANSIT_MUTUAL' | 'TRANSIT_TO_NATAL';
    mdSign?: string;
    adSign?: string;
    distance: number;
    claimTextTelugu: string;
    reasoningTelugu: string;
  }[] {
    const SIGNS = [
      'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
      'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
    ];

    if (!mdLord || !adLord || mdLord.toLowerCase() === adLord.toLowerCase()) {
      return [];
    }

    const results: ReturnType<typeof ReasoningEngine.evaluateDashaRelationship> = [];

    const getSignIdx = (signName?: string) => {
      if (!signName) return -1;
      return SIGNS.findIndex(s => s.toLowerCase() === signName.trim().toLowerCase());
    };

    // 1. NATAL CHART EVALUATION
    if (canonicalChart?.rasi?.planets) {
      const mdSign = canonicalChart.rasi.planets[mdLord]?.sign;
      const adSign = canonicalChart.rasi.planets[adLord]?.sign;

      const mdIdx = getSignIdx(mdSign);
      const adIdx = getSignIdx(adSign);

      if (mdIdx !== -1 && adIdx !== -1) {
        const distFromMD = ((adIdx - mdIdx + 12) % 12) + 1;
        if (distFromMD === 6 || distFromMD === 8) {
          results.push({
            hasStressAxis: true,
            axisType: 'SHASHTASHTAKA',
            context: 'NATAL',
            mdSign,
            adSign,
            distance: distFromMD,
            claimTextTelugu: `దశా నాథుడు (${mdLord}) మరియు అంతర్దశా నాథుడు (${adLord}) మూల జాతకంలో 6-8 (షష్టాష్టక) ఒత్తిడి అక్షంలో ఉన్నారు (${mdSign} - ${adSign}).`,
            reasoningTelugu: 'దశా-అంతర్దశా నియమం: అంతర్దశా నాథుడు సాధించే ఫలితాలు మహాదశా నాథుని అనుమతికి లోబడి మాత్రమే ఉంటాయి. 6-8 స్థానం మానసిక ఆందోళన, స్వల్ప ఆరోగ్య రుగ్మతలు, మరియు హఠాత్ ప్రతిబంధకాలను పెంచుతుంది.'
          });
        } else if (distFromMD === 2 || distFromMD === 12) {
          results.push({
            hasStressAxis: true,
            axisType: 'DWADASASHTAKA',
            context: 'NATAL',
            mdSign,
            adSign,
            distance: distFromMD,
            claimTextTelugu: `దశా నాథుడు (${mdLord}) మరియు అంతర్దశా నాథుడు (${adLord}) మూల జాతకంలో 2-12 (ద్వాదశాష్టక) స్థానాల్లో ఉన్నారు (${mdSign} - ${adSign}).`,
            reasoningTelugu: 'దశా-అంతర్దశా నియమం: 2-12 అక్షం ఫలితాల విడుదలలో నిరోధకాన్ని, వ్యయాన్ని, మరియు ఒత్తిడిని కలిగిస్తుంది.'
          });
        }
      }
    }

    // 2. LIVE TRANSIT EVALUATION
    try {
      const moonSign = canonicalChart?.rasi?.planets?.Moon?.sign || 'Aries';
      const snapshot = computeLiveTransitSnapshot(moonSign, queryDate);
      const mdTransit = snapshot.positions[mdLord as keyof typeof snapshot.positions];
      const adTransit = snapshot.positions[adLord as keyof typeof snapshot.positions];

      if (mdTransit?.sign && adTransit?.sign) {
        const mdTIdx = getSignIdx(mdTransit.sign);
        const adTIdx = getSignIdx(adTransit.sign);

        if (mdTIdx !== -1 && adTIdx !== -1) {
          const transitDist = ((adTIdx - mdTIdx + 12) % 12) + 1;
          if (transitDist === 6 || transitDist === 8) {
            results.push({
              hasStressAxis: true,
              axisType: 'SHASHTASHTAKA',
              context: 'TRANSIT_MUTUAL',
              mdSign: mdTransit.sign,
              adSign: adTransit.sign,
              distance: transitDist,
              claimTextTelugu: `ప్రస్తుత గోచార సంచారంలో దశా నాథుడు (${mdLord}) మరియు అంతర్దశా నాథుడు (${adLord}) 6-8 (షష్టాష్టక) స్థానాల్లో సంచరిస్తున్నారు (${mdTransit.sign} - ${adTransit.sign}).`,
              reasoningTelugu: 'గోచార నియమం: దశాధిపతుల గోచార 6-8 సంయోగం తాత్కాలిక సవాళ్లు, ప్రతిబంధకాలు, మరియు మానసిక ఒత్తిడిని సృష్టిస్తుంది.'
            });
          } else if (transitDist === 2 || transitDist === 12) {
            results.push({
              hasStressAxis: true,
              axisType: 'DWADASASHTAKA',
              context: 'TRANSIT_MUTUAL',
              mdSign: mdTransit.sign,
              adSign: adTransit.sign,
              distance: transitDist,
              claimTextTelugu: `ప్రస్తుత గోచార సంచారంలో దశా నాథుడు (${mdLord}) మరియు అంతర్దశా నాథుడు (${adLord}) 2-12 (ద్వాదశాష్టక) సంచార అక్షంలో ఉన్నారు (${mdTransit.sign} - ${adTransit.sign}).`,
              reasoningTelugu: 'గోచార నియమం: 2-12 సంచార అక్షం ఫలితాల మందగమనాన్ని, వ్యయాన్ని లేదా నిరోధకాన్ని తెస్తుంది.'
            });
          }
        }
      }
    } catch (e) {
      // Transit evaluation fallback
    }

    return results;
  }
}

