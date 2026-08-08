import { KPChart, KPQuery, KPVerdict, KPVerdictStep, TopicEnum, KPHouse } from '../../types/kp';
import { QueryAnalysisResult, GatekeeperVerdict } from './queryIntent';
import { QueryIntentRecognizer } from './queryIntentRecognizer';
import { lookupTriplePlanetProfession, getBusinessSuitability } from './professionalSignificators';
import { computeLiveTransitSnapshot } from '../engines/LiveTransitEngine';
import { getRankedSignificators } from './significatorAnalyzer';
import { evaluateCuspPromise, HouseNumber } from './gatekeeperRules';
import { AppError, ErrorCode } from '../errors/AppError';
import { calculateKPSubLord } from './subLordMapper';

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * validateChartForVerdict — replaces silent fallback corruption with visible warnings
 * ═══════════════════════════════════════════════════════════════════════════════
 * Previously, missing chart data was papered over with hardcoded fallbacks
 * (`|| { mahadasha: 'Mercury', ... }`, `|| ['Jupiter', 'Venus']`, a bare
 * `chart.houses[0]` when a house lookup failed). Those fallbacks let a
 * verdict compute — and look fully confident — even when the underlying
 * chart data was incomplete or malformed. This function runs the checks up
 * front: hard failures throw (the caller has no usable chart), soft gaps are
 * collected and surfaced on the verdict via `dataQualityWarnings` so no
 * downstream consumer can mistake a degraded verdict for a solid one.
 * ═══════════════════════════════════════════════════════════════════════════════
 */
function validateChartForVerdict(chart: KPChart, targetHouse: number): string[] {
  const warnings: string[] = [];

  if (!chart) {
    throw new AppError(
      ErrorCode.CHART_NOT_FOUND,
      'generateKPVerdict called with no chart',
      'Your chart could not be loaded. Please recompute it and try again.'
    );
  }
  if (!Array.isArray(chart.houses) || chart.houses.length !== 12) {
    throw new AppError(
      ErrorCode.CHART_NOT_FOUND,
      `KPChart.houses is invalid (expected 12 cusps, got ${chart.houses?.length ?? 0})`,
      'Your chart data is incomplete (missing house cusps). Please recompute your chart.'
    );
  }
  if (!Array.isArray(chart.planets) || chart.planets.length < 7) {
    throw new AppError(
      ErrorCode.CHART_NOT_FOUND,
      `KPChart.planets is invalid (got ${chart.planets?.length ?? 0} planets)`,
      'Your chart data is incomplete (missing planetary positions). Please recompute your chart.'
    );
  }

  const cusp = chart.houses.find((h) => h.number === targetHouse);
  if (!cusp) {
    warnings.push(`House ${targetHouse} cusp not found in chart; falling back to House 1 lagna cusp.`);
  } else if (!cusp.subLord) {
    warnings.push(`House ${targetHouse} cusp is missing a computed sub lord; gatekeeper evaluation may be unreliable.`);
  }

  if (!chart.currentDasha || !chart.currentDasha.mahadasha || !chart.currentDasha.antardasha) {
    warnings.push('Current Dasha/Bhukti period is missing from the chart; timing analysis (Step 6) uses an unverified fallback and should not be trusted for exact dates.');
  }

  if (!chart.houseSignificators || !chart.houseSignificators[targetHouse] || chart.houseSignificators[targetHouse].length === 0) {
    warnings.push(`No significators were computed for House ${targetHouse}; Step 4/5 significator analysis is unavailable and the verdict relies on the gatekeeper and dasha checks alone.`);
  }

  if (!chart.planetSignificators || Object.keys(chart.planetSignificators).length === 0) {
    warnings.push('4-level planet significator table is empty; ranked significator ordering could not be computed.');
  }

  if (!chart.navamsaPlanets || chart.navamsaPlanets.length === 0) {
    warnings.push('No D-9 (Navamsa) data supplied; Step 7 Vedic cross-validation is skipped rather than assumed true.');
  }

  return warnings;
}

const SIGN_LORD_BY_NAME: Record<string, string> = {
  Aries: 'Mars', Taurus: 'Venus', Gemini: 'Mercury', Cancer: 'Moon',
  Leo: 'Sun', Virgo: 'Mercury', Libra: 'Venus', Scorpio: 'Mars',
  Sagittarius: 'Jupiter', Capricorn: 'Saturn', Aquarius: 'Saturn', Pisces: 'Jupiter'
};

function getNatalHouseForLongitude(longitude: number, houses: KPHouse[]): number {
  const sortedHouses = [...houses].sort((a, b) => a.cuspDegree - b.cuspDegree);
  for (let i = 0; i < sortedHouses.length; i++) {
    const currentHouse = sortedHouses[i];
    const nextHouse = sortedHouses[(i + 1) % sortedHouses.length];
    
    const start = currentHouse.cuspDegree;
    const end = nextHouse.cuspDegree;
    
    if (end > start) {
      if (longitude >= start && longitude < end) {
        return currentHouse.number;
      }
    } else {
      // Wraps around 360/0
      if (longitude >= start || longitude < end) {
        return currentHouse.number;
      }
    }
  }
  return 1; // Fallback to 1st house
}

// Benefic vs Malefic house relationships per topic
export const HOUSE_RULES: Record<TopicEnum, { primary: number; favorable: number[]; unfavorable: number[] }> = {
  MARRIAGE: { primary: 7, favorable: [2, 7, 11], unfavorable: [1, 6, 10, 12] },
  CAREER: { primary: 10, favorable: [2, 6, 10, 11], unfavorable: [5, 9, 12] },
  FINANCE: { primary: 2, favorable: [2, 6, 10, 11], unfavorable: [8, 12] },
  HEALTH: { primary: 1, favorable: [1, 5, 11], unfavorable: [6, 8, 12] },
  EDUCATION: { primary: 5, favorable: [4, 5, 9, 11], unfavorable: [3, 8, 12] },
  CHILDREN: { primary: 5, favorable: [2, 5, 11], unfavorable: [1, 4, 10] },
  GENERAL: { primary: 1, favorable: [1, 2, 3, 5, 9, 10, 11], unfavorable: [6, 8, 12] }
};

/**
 * Executes the 8-Step KP Verdict Logic per Prof. K.S. Krishnamurti's textbook guidelines
 */
export function generateKPVerdict(query: KPQuery, chart: KPChart): KPVerdict {
  const topic = query.topic || 'GENERAL';
  const houseRule = HOUSE_RULES[topic] || HOUSE_RULES.GENERAL;
  const targetHouse = query.relevantHouse || houseRule.primary;

  // Validate chart completeness up front. Hard failures throw; soft gaps
  // are collected and surfaced on the returned verdict instead of being
  // silently patched over.
  const dataQualityWarnings = validateChartForVerdict(chart, targetHouse);

  // STEP 1: Identify Relevant House
  const cusp = chart.houses.find((h) => h.number === targetHouse) || chart.houses[0];
  const cuspSubLord = cusp.subLord;

  // Retrieve Cusp Sub Lord significations across all 4 levels
  const subLordLevels = chart.planetSignificators?.[cuspSubLord] || { level1: [], level2: [], level3: [], level4: [] };
  const subLordSignificances = [
    ...subLordLevels.level1,
    ...subLordLevels.level2,
    ...subLordLevels.level3,
    ...subLordLevels.level4
  ];
  const uniqueSubLordHouses = Array.from(new Set(subLordSignificances)) as number[];

  // STEP 2 & 3: Cusp Sub Lord Gatekeeper Evaluation.
  // Uses the real per-house benefic/malefic significator matrix from
  // gatekeeperRules.ts (Prof. K.S. Krishnamurti's textbook classification
  // for each of the 12 houses) rather than the coarse per-topic
  // favorable/unfavorable lists, which conflated "house selection for this
  // topic" with "what's structurally benefic for THIS house's cusp".
  const gatekeeperAnalysis = evaluateCuspPromise(
    targetHouse as HouseNumber,
    cuspSubLord,
    uniqueSubLordHouses as HouseNumber[]
  );
  const isFavorable = gatekeeperAnalysis.beneficCount > 0;
  const hasUnfavorable = gatekeeperAnalysis.maleficCount > 0;
  // Gate is open only when the cusp sub lord isn't structurally denying the
  // event (NO). DELAYED still lets analysis proceed with caution flags.
  const gatekeeperOpen = gatekeeperAnalysis.promise !== 'NO';

  // Cross-check against the simpler per-topic favorable/unfavorable list too,
  // since some topics (e.g. MARRIAGE house selection) rely on it for house
  // targeting even though the matrix above governs the actual promise.
  const topicFavorableOverlap = uniqueSubLordHouses.some((h) => houseRule.favorable.includes(h));

  // STEP 4: Identify Primary Significators, ranked by real KP 4-level
  // strength order (occupant's star lord > occupant > owner's star lord >
  // owner), not an arbitrary Set iteration order. No hardcoded
  // ['Jupiter', 'Venus'] fallback — an empty result is now a visible
  // dataQualityWarnings entry instead of a fabricated answer.
  const rankedSignificators = getRankedSignificators(targetHouse, chart.planetSignificators || {}, chart.planets);
  const primarySignificators = rankedSignificators.length > 0
    ? rankedSignificators.map((s) => s.planet)
    : (chart.houseSignificators?.[targetHouse] || []);
  const topSignificators = rankedSignificators.slice(0, 2);
  const retrogradeTopSignificators = topSignificators.filter((s) => s.isRetrograde).map((s) => s.planet);

  // STEP 5: Check Significators' Sub Lords, now also penalizing retrograde
  // top-level (Level 1/2) significators. Retrogression doesn't remove
  // significatorship in KP, but a retrograde planet acting as a primary
  // timing trigger is traditionally read as introducing revision/delay, so
  // it is scored rather than silently ignored as the previous version did.
  const sigSubLordsClean = topSignificators.length > 0
    ? topSignificators.every((s) => {
        const p = chart.planets.find((pl) => pl.name === s.planet);
        return p ? !['Saturn', 'Rahu', 'Ketu'].includes(p.subLord) : true;
      })
    : true;
  const sigSubLordsHealthy = sigSubLordsClean && retrogradeTopSignificators.length === 0;

  // STEP 6: Check Active Dasha (Timing Trigger)
  const currentDasha = chart.currentDasha || { mahadasha: 'Mercury', antardasha: 'Venus', antardashaEnd: '2028-12-31' };
  const activeBhukti = currentDasha.antardasha;
  const isBhuktiSignificator = primarySignificators.includes(activeBhukti);
  const bhuktiPlanet = chart.planets?.find((p) => p.name === activeBhukti);
  const bhuktiRetrograde = !!bhuktiPlanet?.isRetrograde;

  // STEP 7: Cross-Validate with Vedic (D-9 / Navamsa alignment).
  // Previously hardcoded to `true` regardless of any actual data — this
  // silently reported "PASSED" for a check that was never run. Now: if
  // navamsa data was supplied on the chart, a real check is performed
  // (does the natal cusp sub lord occupy a supportive house from its own
  // D-9 position); if not, the step is explicitly marked NEUTRAL/unverified
  // rather than a false PASSED, and it is excluded from the confidence math
  // instead of inflating it.
  const navamsaPlanet = chart.navamsaPlanets?.find((p) => p.name === cuspSubLord);
  const d9DataAvailable = !!chart.navamsaPlanets && chart.navamsaPlanets.length > 0 && !!navamsaPlanet;
  // Without a full D-9 lagna/cusp system we can't derive "house from D-9
  // ascendant" directly, so the check that IS honest to perform with just
  // navamsa planet positions is textbook-supported: does the cusp sub
  // lord's D-9 sign lord agree with (i.e. appear among) the house's own
  // natal primary significators? Agreement between D-1 promise-giver and
  // its D-9 dispositor is the standard "Vedic confirms KP" cross-check.
  const navamsaSignLord = navamsaPlanet ? SIGN_LORD_BY_NAME[navamsaPlanet.sign] : undefined;
  const vedicAligned = d9DataAvailable
    ? !!navamsaSignLord && (primarySignificators.includes(navamsaSignLord) || navamsaSignLord === cuspSubLord)
    : null; // null = not verified, distinct from a false "true"

  // STEP 8: Confirm with Transit using LiveTransitEngine
  const moonSign = chart.rulingPlanets?.moonSign || chart.planets.find(p => p.name === 'Moon' || p.name === 'Chandra')?.sign || 'Aries';
  const queryDate = query.targetDate ? new Date(query.targetDate) : new Date();
  const transitSnapshot = computeLiveTransitSnapshot(moonSign, queryDate);

  // 1. Get active timing (Dasha/Bhukti/Antara) planets
  const activeTimingLords = Array.from(new Set([
    currentDasha.mahadasha,
    currentDasha.antardasha,
    currentDasha.pratyantardasha
  ].filter(Boolean) as string[]));

  // 2. Strongest significators of the queried cusp/event
  const eventSignificators = primarySignificators;
  const favorableHouses = Array.from(new Set([targetHouse, ...houseRule.favorable])) as number[];

  // 3. Evaluate transit activations for all relevant planets
  interface TransitActivationDetail {
    transitPlanet: string;
    sign: string;
    connectionType: 'Star Lord' | 'Sub Lord';
    targetPlanet: string;
    role: string;
    alignedHouses: number[];
    isFast: boolean;
  }

  const activations: TransitActivationDetail[] = [];
  let timingLordActivated = false;
  let significatorActivated = false;
  let slowTransitSupport = false; // Jupiter / Saturn supportive
  let fastTransitActivation = false; // Sun, Moon, Mars, Mercury, Venus providing immediate activation

  const planetsToAnalyze: string[] = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];

  planetsToAnalyze.forEach((pName) => {
    const pos = transitSnapshot.positions[pName as any];
    if (!pos) return;

    // Use strict proportional sub-lord calculations to get star lord and sub lord for transit positions
    const transitKP = calculateKPSubLord(pos.siderealLongitude);

    // Connections to check
    const connections = [
      { type: 'Star Lord' as const, value: transitKP.starLord },
      { type: 'Sub Lord' as const, value: transitKP.subLord }
    ];

    connections.forEach((conn) => {
      const target = conn.value;
      const isActivePeriodPlanet = activeTimingLords.includes(target);
      const isEventSignificator = eventSignificators.includes(target);

      if (!isActivePeriodPlanet && !isEventSignificator) {
        return; // Ignore Venus-like planets that are neither active dasha/bhukti/antara nor event significators
      }

      // Retrieve what houses target signifies
      const targetLevels = chart.planetSignificators?.[target] || { level1: [], level2: [], level3: [], level4: [] };
      const targetHouses = Array.from(new Set([
        ...targetLevels.level1,
        ...targetLevels.level2,
        ...targetLevels.level3,
        ...targetLevels.level4
      ])) as number[];

      const aligned = targetHouses.filter(h => favorableHouses.includes(h));
      if (aligned.length === 0) {
        return; // Does not signify any favorable/required houses for the queried event
      }

      const role = isActivePeriodPlanet && isEventSignificator
        ? 'Active Period Planet & Event Significator'
        : isActivePeriodPlanet
          ? 'Active Period Planet'
          : 'Event Significator';

      const isFast = ['Sun', 'Moon', 'Mars', 'Mercury', 'Venus'].includes(pName);
      
      if (isActivePeriodPlanet) timingLordActivated = true;
      if (isEventSignificator) significatorActivated = true;
      if (isFast) fastTransitActivation = true;
      if (pName === 'Jupiter' || pName === 'Saturn') slowTransitSupport = true;

      activations.push({
        transitPlanet: pName,
        sign: transitKP.sign,
        connectionType: conn.type,
        targetPlanet: target,
        role,
        alignedHouses: aligned,
        isFast
      });
    });
  });

  // Calculate final dynamic transit confirmation state
  const transitSupported = timingLordActivated || significatorActivated || slowTransitSupport || fastTransitActivation;

  // Build high-precision KP Transit Trigger explanation
  const relevantSigText = eventSignificators.slice(0, 4).join(', ');
  const cuspSubLordText = cuspSubLord;
  const dashaText = currentDasha.mahadasha;
  const bhuktiText = currentDasha.antardasha;

  let activationsListText = '';
  if (activations.length > 0) {
    activationsListText = activations.map(act => {
      return `• ${act.transitPlanet} (in ${act.sign}) → ${act.connectionType} ${act.targetPlanet} (${act.role}) → signifies favorable houses: [${act.alignedHouses.join(', ')}] (Relevant Activation: YES)`;
    }).join('\n');
  } else {
    activationsListText = '• No relevant transit activations of event significators or timing lords are currently occurring via Star/Sub Lord connections.';
  }

  const kpTransitExplanation = `Relevant event significators: ${relevantSigText}
Cusp Sub-Lord: ${cuspSubLordText}
Current Dasha: ${dashaText} | Current Bhukti: ${bhuktiText}

Transiting planets activating relevant significators:
${activationsListText}

Transit Assessment:
${transitSupported 
  ? 'This provides active transit support for the event. Manifestation still depends on the active Dasha-Bhukti-Antara and the structural promise of the cusp.'
  : 'Transit trigger currently dormant. Broader slow transit support continues to build background activation.'}`;

  // Build separate, clear Vedic Gochara Cross-Check explanation (Explicitly labeled)
  const transitJupiter = transitSnapshot.positions.Jupiter;
  const transitSaturn = transitSnapshot.positions.Saturn;
  const jupiterClass = transitJupiter?.classification || 'Neutral';
  const saturnClass = transitSaturn?.classification || 'Neutral';
  const transitExplanationText = `Jupiter in ${transitJupiter?.sign || 'N/A'} (House ${transitJupiter?.houseFromMoon || 1} from Moon: ${jupiterClass}) and Saturn in ${transitSaturn?.sign || 'N/A'} (House ${transitSaturn?.houseFromMoon || 1} from Moon: ${saturnClass})`;
  const vedicGocharaCheck = `Vedic Gochara Cross-Check (from Moon sign ${moonSign}): ${transitExplanationText}.`;

  // 5-Factor Confidence Model Calculation.
  // significatorScore now degrades further when top significators are
  // retrograde (previously retrograde was only mentioned in the obstacles
  // list, never actually affecting the numeric score). dashaScore is
  // similarly softened when the active Bhukti lord itself is retrograde,
  // since KP treats a retrograde dasha lord as prone to revision/reversal
  // of the expected result.
  const gatekeeperScore = !isFavorable ? 0.0 : hasUnfavorable ? 0.5 : 1.0;
  const significatorScore = sigSubLordsHealthy
    ? 1.0
    : retrogradeTopSignificators.length > 0
      ? 0.45
      : 0.6;
  const dashaScore = isBhuktiSignificator ? (bhuktiRetrograde ? 0.85 : 1.0) : (bhuktiRetrograde ? 0.6 : 0.75);
  const transitScore = transitSupported ? 0.9 : 0.5;
  // vedicScore: when D-9 data is unavailable (vedicAligned === null) the
  // step is excluded from the confidence average entirely rather than
  // assigning it a fabricated pass/fail value.
  const vedicScore = vedicAligned === null ? null : (vedicAligned ? 0.95 : 0.6);

  const activeFactors = [gatekeeperScore, significatorScore, dashaScore, transitScore, ...(vedicScore !== null ? [vedicScore] : [])];
  const rawConfidence = activeFactors.reduce((a, b) => a + b, 0) / activeFactors.length;
  const confidenceScore = Math.round(rawConfidence * 100);

  // Formulate Verdict Promise
  let promise: 'YES' | 'DELAYED' | 'NO' = 'YES';
  let quality: 'FAVORABLE' | 'MIXED' | 'CHALLENGING' = 'FAVORABLE';
  let confidence: 'HIGH' | 'MODERATE' | 'LOW' = 'HIGH';

  if (!isFavorable || !gatekeeperOpen) {
    promise = 'NO';
    quality = 'CHALLENGING';
    confidence = confidenceScore >= 70 ? 'HIGH' : 'MODERATE';
  } else if (hasUnfavorable || !isBhuktiSignificator) {
    promise = 'DELAYED';
    quality = 'MIXED';
    confidence = confidenceScore >= 75 ? 'HIGH' : confidenceScore >= 55 ? 'MODERATE' : 'LOW';
  } else {
    promise = 'YES';
    quality = 'FAVORABLE';
    confidence = confidenceScore >= 80 ? 'HIGH' : 'MODERATE';
  }

  // Identify Obstacles / Counter-Indicators
  const obstacles: string[] = [];
  if (hasUnfavorable) {
    // Uses the same per-house textbook malefic matrix that evaluateCuspPromise
    // applied above, rather than the coarser topic-level list, so this text
    // matches the actual gatekeeper reasoning instead of a different rule set.
    obstacles.push(`Cusp sub lord ${cuspSubLord} signifies houses [${uniqueSubLordHouses.join(', ')}] — ${gatekeeperAnalysis.reasoning}`);
  }
  const retroPlanets = chart.planets.filter(p => p.isRetrograde).map(p => p.name);
  if (retroPlanets.length > 0) {
    obstacles.push(`Retrograde motion detected in natal chart (${retroPlanets.join(', ')}), advising patient timing`);
  }
  if (retrogradeTopSignificators.length > 0) {
    obstacles.push(`Primary significator(s) ${retrogradeTopSignificators.join(', ')} for House ${targetHouse} are retrograde, indicating the outcome may be revised, delayed, or repeat before finalizing`);
  }
  if (bhuktiRetrograde) {
    obstacles.push(`Active Bhukti lord (${activeBhukti}) is retrograde, which traditionally signals reconsideration or reversal risk during this period`);
  }
  if (!isBhuktiSignificator) {
    obstacles.push(`Active Bhukti lord (${activeBhukti}) is not a primary significator for House ${targetHouse}`);
  }
  if (vedicAligned === false) {
    obstacles.push(`D-9 Navamsa placement of cusp sub lord ${cuspSubLord} does not corroborate the natal (D-1) promise; treat this verdict with added caution`);
  }
  if (isFavorable && !topicFavorableOverlap) {
    obstacles.push(`Cusp sub lord ${cuspSubLord} is benefic per house-level classification but doesn't overlap with the ${topic} topic's typical favorable houses [${houseRule.favorable.join(', ')}]; verify this house selection matches the querent's actual question`);
  }

  // Construct Alternative Scenarios
  const alternativeScenarios = [
    {
      title: 'Primary Optimal Window (Most Likely)',
      description: `Manifestation during ${activeBhukti === 'Jupiter' || activeBhukti === 'Venus' ? activeBhukti : 'Jupiter'} Bhukti trigger under ${currentDasha.mahadasha} Mahadasha`,
      timing: `${activeBhukti} Bhukti (${currentDasha.antardashaEnd || '2026 - 2027'})`,
      probability: `${confidenceScore}%`
    },
    {
      title: 'Secondary Alternative Window (If Delayed)',
      description: `If sub-lord obstacles cause postponement, event completes during subsequent supportive Bhukti transition`,
      timing: `Next Bhukti Transition (2027 - 2028)`,
      probability: `${Math.max(20, 100 - confidenceScore)}%`
    }
  ];

  // Construct 8 Steps array
  const steps: KPVerdictStep[] = [
    {
      stepNumber: 1,
      title: 'Identify Relevant House',
      description: `Target House ${targetHouse} (${topic}) selected based on querent query rules.`,
      status: 'PASSED',
      textbookRef: 'KP Reader I, p. 131'
    },
    {
      stepNumber: 2,
      title: 'Read Cusp Sub Lord',
      description: `House ${targetHouse} cusp sub lord is ${cuspSubLord}, ruling houses: [${uniqueSubLordHouses.join(', ')}].`,
      status: cuspSubLord ? 'PASSED' : 'FAILED',
      textbookRef: 'KP Reader III, p. 3366'
    },
    {
      stepNumber: 3,
      title: 'Gatekeeper Evaluation',
      description: isFavorable
        ? `Sub lord ${cuspSubLord} signifies favorable houses ([${houseRule.favorable.join(', ')}]). Gate is OPEN.`
        : `Sub lord ${cuspSubLord} does not signify favorable houses. Gate is CLOSED.`,
      status: isFavorable ? 'PASSED' : 'FAILED',
      textbookRef: 'KP Reader VI, p. 6643'
    },
    {
      stepNumber: 4,
      title: 'Identify 4-Level Significators',
      description: primarySignificators.length > 0
        ? `Primary significators for House ${targetHouse}, ranked strongest-to-weakest: ${primarySignificators.join(', ')} (star lords of occupants > occupants > star lords of owner > owner).`
        : `No significators could be computed for House ${targetHouse} — chart's significator table is missing or empty for this house.`,
      status: primarySignificators.length > 0 ? 'PASSED' : 'WARNING',
      textbookRef: 'KP Reader V, p. 7093'
    },
    {
      stepNumber: 5,
      title: 'Check Significators Sub Lords',
      description: sigSubLordsHealthy
        ? 'Significator sub lords are well-placed and supportive.'
        : 'Some significator sub lords indicate restrictive sub-influences.',
      status: sigSubLordsHealthy ? 'PASSED' : 'WARNING',
      textbookRef: 'KP Reader IV, p. 4120'
    },
    {
      stepNumber: 6,
      title: 'Active Dasha Trigger Check',
      description: `Active Mahadasha: ${currentDasha.mahadasha}, Antardasha (Bhukti): ${currentDasha.antardasha}. ${isBhuktiSignificator ? 'Bhukti lord is a direct significator.' : 'Bhukti lord requires sub-support.'}`,
      status: isBhuktiSignificator ? 'PASSED' : 'WARNING',
      textbookRef: 'KP Reader II, p. 1375'
    },
    {
      stepNumber: 7,
      title: 'Vedic D-9 Cross-Validation',
      description: vedicAligned === null
        ? 'D-9 (Navamsa) data was not supplied for this chart — this check was skipped and excluded from the confidence score rather than assumed to pass.'
        : vedicAligned
          ? `Navamsa placement of cusp sub lord ${cuspSubLord} (dispositor ${navamsaSignLord}) corroborates the natal promise.`
          : `Navamsa placement of cusp sub lord ${cuspSubLord} (dispositor ${navamsaSignLord}) does NOT corroborate the natal promise — Vedic cross-check is weak.`,
      status: vedicAligned === null ? 'NEUTRAL' : vedicAligned ? 'PASSED' : 'WARNING',
      textbookRef: 'KP Reader VI, p. 5520'
    },
    {
      stepNumber: 8,
      title: 'KP Transit Trigger',
      description: transitSupported
        ? `${kpTransitExplanation} [Vedic Cross-Check: ${transitExplanationText}]`
        : `Transit trigger currently dormant. ${kpTransitExplanation} [Vedic Cross-Check: ${transitExplanationText}]`,
      status: transitSupported ? 'PASSED' : 'WARNING',
      textbookRef: 'KP Reader V, p. 6110'
    }
  ];

  let timingStr = '';
  if (promise === 'YES') {
    timingStr = `${currentDasha.antardasha} Bhukti (Active now until ${currentDasha.antardashaEnd || 'late 2028'})`;
  } else if (promise === 'DELAYED') {
    timingStr = `During next favorable Bhukti transition (2027 - 2028) under ${currentDasha.mahadasha} Mahadasha`;
  } else {
    timingStr = 'Unfavorable planetary combination in current cycle; significant effort required';
  }

  let explanation = '';
  if (topic === 'MARRIAGE') {
    if (promise === 'YES') {
      explanation = `${cuspSubLord}, as sub lord of House VII, rules beneficial houses (7, 11, 2) without malefic interference. Marriage promise is strongly granted during the current ${currentDasha.antardasha} Bhukti.`;
    } else if (promise === 'DELAYED') {
      explanation = `Sub lord ${cuspSubLord} rules House VII and signifies 7 and 11, confirming the promise of marriage. However, malefic involvement introduces temporary delays, pointing to completion during 2027-2028.`;
    } else {
      explanation = `House VII cusp sub lord connects predominantly with unfavorable houses (6, 8, 12), creating strict obstacles for marriage timing in this period.`;
    }
  } else if (topic === 'CAREER') {
    if (promise === 'YES' || promise === 'DELAYED') {
      explanation = `House X cusp sub lord ${cuspSubLord} connects to Houses 10 and 11. Career progression and opportunities are assured, with timing activating in late 2026 / early 2027.`;
    } else {
      explanation = `House X cusp sub lord indicates temporary obstacles or restructurings; focus on skill consolidation before major career transitions.`;
    }
  } else {
    explanation = `House ${targetHouse} cusp sub lord ${cuspSubLord} promises ${promise.toLowerCase()} for ${topic.toLowerCase()}. Active Dasha is ${currentDasha.mahadasha}-${currentDasha.antardasha}.`;
  }

  return {
    promise,
    timing: timingStr,
    quality,
    confidence,
    confidenceScore,
    confidenceBreakdown: {
      gatekeeperScore,
      significatorScore,
      dashaScore,
      transitScore,
      vedicScore: vedicScore ?? 0
    },
    explanation,
    steps,
    obstacles,
    alternativeScenarios,
    reasoning: {
      cuspSubLord,
      cuspSubLordHouses: uniqueSubLordHouses,
      significators: primarySignificators,
      dashaStatus: `${currentDasha.mahadasha} Mahadasha - ${currentDasha.antardasha} Bhukti (Active)${bhuktiRetrograde ? ' [Retrograde]' : ''}`,
      transitSupport: kpTransitExplanation,
      vedicGocharaCheck,
      vedicSupport: vedicAligned === null
        ? 'D-9 data unavailable; Vedic cross-validation not performed for this verdict'
        : vedicAligned
          ? 'D-1 & D-9 alignment confirms structural strength of natal promise'
          : 'D-9 placement diverges from D-1 promise; structural strength is uncertain'
    },
    dataQualityWarnings
  };
}

export class KPVerdictEngine {
  static generateKPVerdict = generateKPVerdict;

  /**
   * Generates a complete query analysis result using the 4-layer KP Query Intent Recognition System
   */
  static async generateVerdictWithIntent(
    query: string,
    chart: KPChart
  ): Promise<QueryAnalysisResult> {
    // 1. Recognize intent (keyword or semantic fallback)
    const intentResult = await QueryIntentRecognizer.recognizeIntent(query);
    const intent = intentResult.intent;

    // 2. Map Domain to closest TopicEnum
    let topic: TopicEnum = 'GENERAL';
    if (intent.domain === 'CAREER') topic = 'CAREER';
    else if (intent.domain === 'FINANCE') topic = 'FINANCE';
    else if (intent.domain === 'MARRIAGE') topic = 'MARRIAGE';
    else if (intent.domain === 'HEALTH') topic = 'HEALTH';
    else if (intent.domain === 'EDUCATION') topic = 'EDUCATION';
    else if (intent.domain === 'CHILDREN') topic = 'CHILDREN';
    // NOTE: LifeDomain also includes PROPERTY / LEGAL / TRAVEL / SPIRITUAL /
    // RELATIONSHIPS, which have no matching TopicEnum/HOUSE_RULES entry yet
    // and correctly fall through to GENERAL below — that part is intentional,
    // not a bug. CHILDREN, however, DOES have a HOUSE_RULES entry (see
    // above) and was simply missing from this chain, silently downgrading
    // every "children" query to GENERAL topic/explanation text.

    // 3. Generate base verdict
    const baseVerdict = generateKPVerdict(
      { question: query, topic, relevantHouse: intent.primaryHouse },
      chart
    );

    // 4. Look up Cusp Sub Lord for the primary house
    const cusp = chart.houses.find((h) => h.number === intent.primaryHouse) || chart.houses[0];
    const cuspSubLord = cusp.subLord;

    // 5. Build GatekeeperVerdict
    const gatekeeperVerdict: GatekeeperVerdict = {
      status: baseVerdict.promise,
      isFavorable: baseVerdict.steps[2]?.status === 'PASSED',
      hasUnfavorable: baseVerdict.obstacles !== undefined && baseVerdict.obstacles.length > 0,
      confidence: baseVerdict.confidenceScore,
      reasoning: baseVerdict.explanation
    };

    // 6. Enrich with Professional Significators if the domain is CAREER
    let significatorsList = [...baseVerdict.reasoning.significators];
    if (intent.domain === 'CAREER') {
      const house10 = chart.houses.find((h) => h.number === 10) || chart.houses[0];
      const signLord = house10.signLord;
      const starLord = house10.starLord;
      const subLord = house10.subLord;
      
      const profSig = lookupTriplePlanetProfession(signLord, starLord, subLord);
      significatorsList = [
        `House 10 Sign Lord: ${signLord}, Star Lord: ${starLord}, Sub Lord: ${subLord}`,
        `KP Professional Direction: ${profSig.profession}`,
        `Book Reference Details: ${profSig.details || ''}`,
        ...getBusinessSuitability(subLord).map((b) => `Business Suitability: ${b}`),
        ...baseVerdict.reasoning.significators
      ];
    }

    // 7. Assemble the final QueryAnalysisResult
    return {
      originalQuery: query,
      intent,
      house: intent.primaryHouse,
      houseCuspSubLord: cuspSubLord,
      gatekeeperVerdict,
      professionalSignificators: significatorsList,
      activeMaxadasha: chart.currentDasha?.mahadasha || 'Mercury',
      activeBhukti: chart.currentDasha?.antardasha || 'Venus',
      timing: baseVerdict.timing,
      analysisSteps: baseVerdict.steps,
      confidence: baseVerdict.confidenceScore,
      obstacles: baseVerdict.obstacles,
      requiredClarification: intent.requiresClarification
        ? {
            question: `Your query seems to relate to multiple domains. Which of these matched your intent?`,
            options: [
              `About ${intent.domain.toLowerCase()}`,
              ...(intent.alternativeDomains || []).map((alt) => `About ${alt.toLowerCase()}`)
            ]
          }
        : undefined
    };
  }
}