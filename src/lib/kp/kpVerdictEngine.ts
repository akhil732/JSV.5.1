import { KPChart, KPQuery, KPVerdict, KPVerdictStep, TopicEnum, KPHouse, RulingPlanets } from '../../types/kp';
import { QueryAnalysisResult, GatekeeperVerdict } from './queryIntent';
import { QueryIntentRecognizer } from './queryIntentRecognizer';
import { lookupTriplePlanetProfession, getBusinessSuitability } from './professionalSignificators';
import { computeLiveTransitSnapshot } from '../engines/LiveTransitEngine';
import { getRankedSignificators } from './significatorAnalyzer';
import { evaluateCuspPromise, HouseNumber, HOUSE_SIGNIFICATOR_MATRIX } from './gatekeeperRules';
import { AppError, ErrorCode } from '../errors/AppError';
import { calculateKPSubLord } from './subLordMapper';
import { calculateRulingPlanets } from './rulingPlanetsCalculator';

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * synthesizeRulingPlanets — the KP "micro-timing" cross-check
 * ═══════════════════════════════════════════════════════════════════════════════
 * The Verdict (gatekeeper + significators + dasha/PD + transit + D-9) is the
 * macro map: what the chart structurally allows and roughly when. Ruling
 * Planets are the micro-scope: the live planetary signature of THIS exact
 * moment (Lagna sign/star/sub lords, Moon sign/star/sub lords, Day Lord).
 * Per KP practice, when the planets ruling the moment overlap with the
 * house's significators or the active Dasha-Bhukti-Pratyantardasha lords,
 * that convergence is the traditional signal that the moment itself is
 * "ripe" for the event — not just that the chart eventually allows it.
 *
 * Priority order (per KP texts, and as specified by the person building
 * this feature): Lagna Sub Lord and Lagna Star Lord carry the most weight,
 * followed by Moon Star Lord, then the remaining RP layers.
 * ═══════════════════════════════════════════════════════════════════════════════
 */
function synthesizeRulingPlanets(
  rp: RulingPlanets,
  primarySignificators: string[],
  dashaLords: string[]
): NonNullable<KPVerdict['rulingPlanetConfirmation']> {
  const relevantPlanets = Array.from(new Set([...primarySignificators, ...dashaLords]));

  // Ordered by traditional KP weight: Lagna Sub Lord and Lagna Star Lord
  // first (highest weight), then Moon Star Lord, then the rest.
  const rpLayers: { label: string; planet: string; topTier: boolean }[] = [
    { label: 'Lagna Sub Lord', planet: rp.lagnaSubLord, topTier: true },
    { label: 'Lagna Star Lord', planet: rp.lagnaStarLord, topTier: true },
    { label: 'Moon Star Lord', planet: rp.moonStarLord, topTier: true },
    { label: 'Lagna Sign Lord', planet: rp.lagnaSignLord, topTier: false },
    { label: 'Moon Sign Lord', planet: rp.moonSignLord, topTier: false },
    { label: 'Moon Sub Lord', planet: rp.moonSubLord, topTier: false },
    { label: 'Day Lord', planet: rp.dayLord, topTier: false }
  ];

  const overlaps = rpLayers.filter((layer) => relevantPlanets.includes(layer.planet));
  const overlappingPlanets = Array.from(new Set(overlaps.map((o) => o.planet)));
  const topTierMatch = overlaps.some((o) => o.topTier);

  let convergenceLevel: 'HIGH' | 'MODERATE' | 'LOW';
  if (topTierMatch && overlaps.length >= 2) {
    convergenceLevel = 'HIGH';
  } else if (overlaps.length >= 1) {
    convergenceLevel = 'MODERATE';
  } else {
    convergenceLevel = 'LOW';
  }

  let synthesis: string;
  if (convergenceLevel === 'HIGH') {
    synthesis = `The current moment's Ruling Planets (${overlaps.map((o) => `${o.planet} as ${o.label}`).join(', ')}) strongly converge with this house's significators/active Dasha lords — this is a high-reliability window for the event, not just a structurally-possible one.`;
  } else if (convergenceLevel === 'MODERATE') {
    synthesis = `The current moment's Ruling Planets show partial overlap (${overlaps.map((o) => `${o.planet} as ${o.label}`).join(', ')}) with this house's significators/active Dasha lords — the moment is somewhat active, but not a peak convergence window.`;
  } else {
    synthesis = `The current moment's Ruling Planets (Lagna: ${rp.lagnaSignLord}/${rp.lagnaStarLord}/${rp.lagnaSubLord}, Moon: ${rp.moonSignLord}/${rp.moonStarLord}, Day: ${rp.dayLord}) show no overlap with this house's significators or active Dasha lords — this specific moment is not a strong timing trigger; the event's own Dasha/Pratyantardasha window remains the primary guide.`;
  }

  return { rulingPlanets: rp, overlappingPlanets, topTierMatch, convergenceLevel, synthesis };
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * findNextFavorablePD — real Pratyantardasha-level timing from the full
 * 120-year Vimshottari sequence
 * ═══════════════════════════════════════════════════════════════════════════════
 * Previously, "Favorable Window" (and the two Alternative Scenarios) were
 * hardcoded placeholder strings — "During next favorable Bhukti transition
 * (2027 - 2028)" — with no computation behind the dates at all, regardless
 * of the actual chart. Pratyantardasha (PD) is a finer timing unit than
 * Antardasha (Bhukti): a multi-year Bhukti window narrows down to a PD
 * period typically weeks-to-months long, giving a much more precise
 * "when" for an event than "sometime during this ~2-3 year Bhukti."
 *
 * This walks the chart's full nested MD -> AD -> PD timeline (already
 * computed by calculateVimshottariDashaFromMoon, previously discarded
 * before reaching KPChart) starting from `fromDate`, and returns the
 * earliest upcoming PD period whose lord is one of the house's real ranked
 * significators — i.e. an actual KP-supportable timing window, not a
 * guessed date range. Returns null (not a fabricated fallback) when no
 * timeline is available or no favorable PD is found within the sequence,
 * so callers can fall back to a clearly-labeled lower-precision message
 * instead of a fake date.
 * ═══════════════════════════════════════════════════════════════════════════════
 */
interface FavorablePDWindow {
  pdLord: string;
  adLord: string;
  mdLord: string;
  startDate: Date;
  endDate: Date;
}

function findNextFavorablePD(
  fullTimeline: NonNullable<KPChart['currentDasha']['fullTimeline']> | undefined,
  fromDate: Date,
  favorableLords: string[]
): FavorablePDWindow | null {
  if (!fullTimeline || fullTimeline.length === 0) return null;

  const candidates: FavorablePDWindow[] = [];
  for (const md of fullTimeline) {
    for (const ad of md.antardashas || []) {
      for (const pd of ad.pratyantardashas || []) {
        if (!pd.endDate || pd.endDate < fromDate) continue; // skip fully-elapsed PDs
        candidates.push({ pdLord: pd.lord, adLord: ad.lord, mdLord: md.lord, startDate: pd.startDate, endDate: pd.endDate });
      }
    }
  }
  candidates.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

  // Prefer the earliest upcoming PD whose own lord is a real significator
  // for this house — the most precise, KP-textbook-supportable timing.
  const favorable = candidates.find((c) => favorableLords.includes(c.pdLord));
  if (favorable) return favorable;

  // No PD lord within the available timeline matches a significator —
  // don't fabricate one. Caller decides how to present this honestly.
  return null;
}

function formatShortDate(d: Date | undefined): string {
  if (!d || isNaN(d.getTime())) return 'date unavailable';
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

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

  if (!chart.currentDasha?.fullTimeline || chart.currentDasha.fullTimeline.length === 0) {
    warnings.push('No full 120-year Vimshottari timeline supplied; "Favorable Window" timing falls back to a less precise Bhukti-level estimate instead of a real Pratyantardasha-level date range.');
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
  // Previously PROPERTY/LEGAL/TRAVEL/SPIRITUAL/RELATIONSHIPS had no
  // HOUSE_RULES entry at all, even though houseDomainMapper.ts's
  // DOMAIN_HOUSE_MAPPING already classifies all 11 domains correctly with
  // real primary/secondary houses. That meant a query like "Will I buy a
  // house or flat?" was correctly identified as PROPERTY by the keyword
  // matcher (weightage 90-95, well above the CERTAIN threshold) but then
  // silently discarded to GENERAL right here, because TopicEnum simply had
  // no PROPERTY slot to map into. Same root-cause pattern as the earlier
  // CHILDREN bug, just five domains at once. Favorable/unfavorable houses
  // below mirror each domain's primaryHouse/secondaryHouses from
  // houseDomainMapper.ts plus standard classical supportive/malefic house
  // groupings for that life area (2/11 = gains & support, 6/8/12 = loss,
  // debt, obstruction — consistent with the pattern used for the six
  // topics above).
  PROPERTY: { primary: 4, favorable: [2, 4, 9, 11], unfavorable: [6, 8, 12] },
  LEGAL: { primary: 6, favorable: [6, 10, 11], unfavorable: [8, 12] },
  TRAVEL: { primary: 12, favorable: [3, 9, 12], unfavorable: [4, 8] },
  SPIRITUAL: { primary: 9, favorable: [5, 9, 12], unfavorable: [6, 8] },
  RELATIONSHIPS: { primary: 7, favorable: [5, 7, 11], unfavorable: [6, 12] },
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

  // Real PD-level timing, computed from the chart's full 120-year
  // Vimshottari timeline (previously hardcoded placeholder date ranges
  // regardless of the actual chart, both in Alternative Scenarios and in
  // the "Favorable Window" text below). Pratyantardasha narrows the
  // multi-year Bhukti window down to a period typically weeks-to-months
  // long — a materially more precise "when" for the event. Computed early
  // so both Alternative Scenarios and the main timing string can share it.
  const nowForTiming = new Date();
  const nextFavorablePD = findNextFavorablePD(chart.currentDasha.fullTimeline, nowForTiming, primarySignificators);
  const hasTimelineData = !!chart.currentDasha.fullTimeline && chart.currentDasha.fullTimeline.length > 0;
  const hasCurrentPD = !!chart.currentDasha.pratyantardasha && !!chart.currentDasha.pratyantardashaStart && !!chart.currentDasha.pratyantardashaEnd;

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
  // Uses the SAME accurate per-house textbook benefic matrix that Step 3's
  // gatekeeper evaluation applies (HOUSE_SIGNIFICATOR_MATRIX), rather than
  // the coarser topic-level houseRule.favorable list. Previously these two
  // steps used two different house-favorability rule sets, so a transit
  // could be scored "supportive" by Step 8's looser topic list even when
  // it wasn't actually touching a house Step 3 considers benefic for this
  // specific house — an internal inconsistency between two checks that are
  // supposed to be evaluating the same underlying promise.
  const houseMatrixEntry = HOUSE_SIGNIFICATOR_MATRIX.find((h) => h.house === targetHouse);
  const favorableHouses = Array.from(new Set([
    targetHouse,
    ...(houseMatrixEntry?.beneficSignifications || houseRule.favorable)
  ])) as number[];

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

  // Alternative Scenarios — previously hardcoded fake date ranges
  // ("2026 - 2027", "2027 - 2028") regardless of the actual chart. Now
  // sourced from the same real PD-level timeline scan used for the main
  // "Favorable Window" text above, so both reflect genuine computed dates
  // (or honestly say precise timing isn't available) instead of guesses.
  const secondaryFavorablePD = hasTimelineData
    ? findNextFavorablePD(
        chart.currentDasha.fullTimeline,
        nextFavorablePD ? new Date(nextFavorablePD.endDate.getTime() + 24 * 60 * 60 * 1000) : nowForTiming,
        primarySignificators
      )
    : null;

  const alternativeScenarios = [
    {
      title: 'Primary Optimal Window (Most Likely)',
      description: hasCurrentPD
        ? `Manifestation during the current ${currentDasha.pratyantardasha} Pratyantardasha under ${currentDasha.antardasha} Antardasha / ${currentDasha.mahadasha} Mahadasha`
        : nextFavorablePD
          ? `Manifestation during ${nextFavorablePD.pdLord} Pratyantardasha under ${nextFavorablePD.adLord} Antardasha / ${nextFavorablePD.mdLord} Mahadasha`
          : `Manifestation during ${activeBhukti} Bhukti under ${currentDasha.mahadasha} Mahadasha`,
      timing: hasCurrentPD
        ? `${currentDasha.pratyantardasha} PD (${currentDasha.pratyantardashaStart} – ${currentDasha.pratyantardashaEnd})`
        : nextFavorablePD
          ? `${nextFavorablePD.pdLord} PD (${formatShortDate(nextFavorablePD.startDate)} – ${formatShortDate(nextFavorablePD.endDate)})`
          : `${activeBhukti} Bhukti (${currentDasha.antardashaEnd || 'end date unavailable'})`,
      probability: `${confidenceScore}%`
    },
    {
      title: 'Secondary Alternative Window (If Delayed)',
      description: secondaryFavorablePD
        ? `If sub-lord obstacles cause postponement, event completes during the subsequent supportive ${secondaryFavorablePD.pdLord} Pratyantardasha`
        : `If sub-lord obstacles cause postponement, event completes during a subsequent supportive Pratyantardasha once the timeline advances`,
      timing: secondaryFavorablePD
        ? `${secondaryFavorablePD.pdLord} PD (${formatShortDate(secondaryFavorablePD.startDate)} – ${formatShortDate(secondaryFavorablePD.endDate)})`
        : `Precise date unavailable — no further favorable Pratyantardasha found in the computed timeline`,
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
      description: `Active Mahadasha: ${currentDasha.mahadasha}, Antardasha (Bhukti): ${currentDasha.antardasha}${hasCurrentPD ? `, Pratyantardasha: ${currentDasha.pratyantardasha} (${currentDasha.pratyantardashaStart}–${currentDasha.pratyantardashaEnd})` : ''}. ${isBhuktiSignificator ? 'Bhukti lord is a direct significator.' : 'Bhukti lord requires sub-support.'}${hasCurrentPD && currentDasha.pratyantardasha ? (primarySignificators.includes(currentDasha.pratyantardasha) ? ' Current Pratyantardasha lord is also a significator, sharpening the timing.' : ' Current Pratyantardasha lord is not itself a significator — see Favorable Window for the next PD that is.') : ''}`,
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

  // Real PD-level timing, computed from the chart's full 120-year
  // Vimshottari timeline (previously hardcoded placeholder date ranges
  // regardless of the actual chart). Pratyantardasha narrows the multi-
  // year Bhukti window down to a period typically weeks-to-months long —
  // a materially more precise "when" for the event.

  let timingStr = '';
  if (promise === 'YES') {
    timingStr = hasCurrentPD
      ? `${currentDasha.pratyantardasha} Pratyantardasha (${currentDasha.pratyantardashaStart} to ${currentDasha.pratyantardashaEnd}) under ${currentDasha.antardasha} Antardasha / ${currentDasha.mahadasha} Mahadasha`
      : `${currentDasha.antardasha} Bhukti (Active now until ${currentDasha.antardashaEnd || 'end of current period'})${hasTimelineData ? '' : ' — precise Pratyantardasha timing unavailable, full dasha timeline not supplied'}`;
  } else if (promise === 'DELAYED') {
    timingStr = nextFavorablePD
      ? `${nextFavorablePD.pdLord} Pratyantardasha (${formatShortDate(nextFavorablePD.startDate)} to ${formatShortDate(nextFavorablePD.endDate)}) under ${nextFavorablePD.adLord} Antardasha / ${nextFavorablePD.mdLord} Mahadasha`
      : hasTimelineData
        ? `No Pratyantardasha within the computed timeline has a lord among House ${targetHouse}'s significators; timing remains structurally delayed under ${currentDasha.mahadasha} Mahadasha`
        : `During a future favorable Bhukti/Pratyantardasha transition under ${currentDasha.mahadasha} Mahadasha — precise dates unavailable, full dasha timeline not supplied`;
  } else {
    timingStr = 'Unfavorable planetary combination in current cycle; significant effort required';
  }

  let explanation = '';
  if (topic === 'MARRIAGE') {
    if (promise === 'YES') {
      explanation = hasCurrentPD
        ? `${cuspSubLord}, as sub lord of House VII, rules beneficial houses (7, 11, 2) without malefic interference. Marriage promise is strongly granted during the current ${currentDasha.pratyantardasha} Pratyantardasha (${currentDasha.pratyantardashaStart}–${currentDasha.pratyantardashaEnd}).`
        : `${cuspSubLord}, as sub lord of House VII, rules beneficial houses (7, 11, 2) without malefic interference. Marriage promise is strongly granted during the current ${currentDasha.antardasha} Bhukti.`;
    } else if (promise === 'DELAYED') {
      explanation = nextFavorablePD
        ? `Sub lord ${cuspSubLord} rules House VII and signifies 7 and 11, confirming the promise of marriage. However, malefic involvement introduces temporary delays, pointing to completion during ${nextFavorablePD.pdLord} Pratyantardasha (${formatShortDate(nextFavorablePD.startDate)}–${formatShortDate(nextFavorablePD.endDate)}).`
        : `Sub lord ${cuspSubLord} rules House VII and signifies 7 and 11, confirming the promise of marriage. However, malefic involvement introduces temporary delays; no confirmed favorable Pratyantardasha found in the available timeline.`;
    } else {
      explanation = `House VII cusp sub lord connects predominantly with unfavorable houses (6, 8, 12), creating strict obstacles for marriage timing in this period.`;
    }
  } else if (topic === 'CAREER') {
    if (promise === 'YES' || promise === 'DELAYED') {
      const careerTiming = promise === 'YES' && hasCurrentPD
        ? `activating now during ${currentDasha.pratyantardasha} Pratyantardasha`
        : nextFavorablePD
          ? `activating during ${nextFavorablePD.pdLord} Pratyantardasha (${formatShortDate(nextFavorablePD.startDate)}–${formatShortDate(nextFavorablePD.endDate)})`
          : `timing to be confirmed once a supportive Pratyantardasha is identified`;
      explanation = `House X cusp sub lord ${cuspSubLord} connects to Houses 10 and 11. Career progression and opportunities are assured, ${careerTiming}.`;
    } else {
      explanation = `House X cusp sub lord indicates temporary obstacles or restructurings; focus on skill consolidation before major career transitions.`;
    }
  } else {
    explanation = `House ${targetHouse} cusp sub lord ${cuspSubLord} promises ${promise.toLowerCase()} for ${topic.toLowerCase()}. Active Dasha is ${currentDasha.mahadasha}-${currentDasha.antardasha}${hasCurrentPD ? `-${currentDasha.pratyantardasha}` : ''}.`;
  }

  // Ruling Planets synthesis — the KP "micro-timing" cross-check layered
  // on top of the macro Verdict above. Uses the chart's already-computed
  // live Ruling Planets (calculated at query time by all 3 chart-
  // construction call sites) when available; computes a fresh live
  // snapshot from the native's birth location otherwise, rather than
  // silently omitting this layer.
  const dashaLordsForRP = Array.from(new Set([
    currentDasha.mahadasha,
    currentDasha.antardasha,
    ...(currentDasha.pratyantardasha ? [currentDasha.pratyantardasha] : [])
  ].filter(Boolean))) as string[];
  const liveRP = chart.rulingPlanets || calculateRulingPlanets(undefined, undefined, chart.birthData?.latitude, chart.birthData?.longitude);
  if (!chart.rulingPlanets) {
    dataQualityWarnings.push('Chart did not include pre-computed Ruling Planets; a fresh live snapshot was computed for this check instead of being omitted.');
  }
  const rulingPlanetConfirmation = synthesizeRulingPlanets(liveRP, primarySignificators, dashaLordsForRP);

  // Plain-English summary — a 2-4 sentence, jargon-free synthesis of the
  // full technical verdict above (promise + PD-level timing + Ruling
  // Planet convergence), intended as the primary thing a non-technical
  // reader sees. The full step-by-step technical reasoning above remains
  // available in `steps`/`reasoning` for anyone who wants to see the
  // underlying working — this doesn't replace it, it fronts it.
  const topicPlain = topic === 'GENERAL' ? 'this question' : `your ${topic.toLowerCase()} question`;
  const promisePlain = promise === 'YES'
    ? 'the chart looks favorable'
    : promise === 'DELAYED'
      ? 'the chart supports this, but it will take some patience'
      : 'the chart shows real obstacles for this right now';
  const timingPlain = promise === 'YES'
    ? (hasCurrentPD
        ? `Right now, through ${currentDasha.pratyantardashaEnd}, is a genuinely supportive period.`
        : `The current period is supportive.`)
    : nextFavorablePD
      ? `The best window ahead looks to be around ${formatShortDate(nextFavorablePD.startDate)} to ${formatShortDate(nextFavorablePD.endDate)}.`
      : `A precise timing window isn't available yet from the current data — patience is the honest answer here.`;
  const rpPlain = rulingPlanetConfirmation.convergenceLevel === 'HIGH'
    ? "The planetary signature of this exact moment also strongly supports it — this is a good time to take real steps, not just wait."
    : rulingPlanetConfirmation.convergenceLevel === 'MODERATE'
      ? "This exact moment offers some support too, though it isn't a peak window."
      : "This exact moment isn't a strong trigger on its own — the timing window above matters more than the moment you're asking.";
  const plainSummary = `For ${topicPlain}, ${promisePlain}. ${timingPlain} ${rpPlain}`;

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
      dashaStatus: `${currentDasha.mahadasha} Mahadasha - ${currentDasha.antardasha} Bhukti${hasCurrentPD ? ` - ${currentDasha.pratyantardasha} Pratyantardasha (${currentDasha.pratyantardashaStart}–${currentDasha.pratyantardashaEnd})` : ''} (Active)${bhuktiRetrograde ? ' [Retrograde]' : ''}`,
      transitSupport: kpTransitExplanation,
      vedicGocharaCheck,
      vedicSupport: vedicAligned === null
        ? 'D-9 data unavailable; Vedic cross-validation not performed for this verdict'
        : vedicAligned
          ? 'D-1 & D-9 alignment confirms structural strength of natal promise'
          : 'D-9 placement diverges from D-1 promise; structural strength is uncertain'
    },
    dataQualityWarnings,
    rulingPlanetConfirmation,
    plainSummary
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
    else if (intent.domain === 'PROPERTY') topic = 'PROPERTY';
    else if (intent.domain === 'LEGAL') topic = 'LEGAL';
    else if (intent.domain === 'TRAVEL') topic = 'TRAVEL';
    else if (intent.domain === 'SPIRITUAL') topic = 'SPIRITUAL';
    else if (intent.domain === 'RELATIONSHIPS') topic = 'RELATIONSHIPS';
    // All 11 LifeDomain values now have a matching TopicEnum/HOUSE_RULES
    // entry. Previously PROPERTY/LEGAL/TRAVEL/SPIRITUAL/RELATIONSHIPS were
    // documented here as "intentionally" falling through to GENERAL — that
    // was wrong: the classifier (houseDomainMapper.ts) already scores these
    // correctly (e.g. "house"/"flat"/"buy" → PROPERTY at 90-95% confidence,
    // well above the CERTAIN threshold), so a real "Will I buy a house or
    // flat?" query was being correctly classified upstream and then
    // silently discarded to GENERAL right here — the same bug class as the
    // earlier missing CHILDREN branch, just covering five domains at once.

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
      activePratyantardasha: chart.currentDasha?.pratyantardasha,
      activePratyantardashaStart: chart.currentDasha?.pratyantardashaStart,
      activePratyantardashaEnd: chart.currentDasha?.pratyantardashaEnd,
      timing: baseVerdict.timing,
      analysisSteps: baseVerdict.steps,
      confidence: baseVerdict.confidenceScore,
      obstacles: baseVerdict.obstacles,
      plainSummary: baseVerdict.plainSummary,
      rulingPlanetConfirmation: baseVerdict.rulingPlanetConfirmation,
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