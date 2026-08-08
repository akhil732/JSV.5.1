import React, { useMemo } from 'react';
import { Clock, Activity, Flame, Shield, ArrowRight } from 'lucide-react';
import { calculateActiveDasha } from '../../../lib/engines/DashaEngine';
import { computeLiveTransitSnapshot } from '../../../lib/engines/LiveTransitEngine';
import styles from './CurrentPhaseCard.module.css';

const PLANET_QUALITIES: Record<string, string> = {
  Sun: 'leadership, vitality, authority, and public recognition',
  Moon: 'emotional balance, intuitive clarity, mind-body alignment, and home focus',
  Mars: 'dynamic energy, courage, ambition, initiative, and overcoming obstacles',
  Mercury: 'intellectual expansion, business strategy, communication, and learning',
  Jupiter: 'wisdom, financial growth, mentorship, dharma, and higher learning',
  Venus: 'harmony in relationships, creative endeavors, luxury, and artistic expression',
  Saturn: 'discipline, hard work, restructuring, perseverance, and long-term gains',
  Rahu: 'innovation, material breakthroughs, unconventional success, and ambition',
  Ketu: 'spiritual insight, detachment, inner awakening, and analytical mastery'
};

function formatDate(d: any): string {
  if (!d) return '-';
  const dateObj = d instanceof Date ? d : new Date(d);
  if (isNaN(dateObj.getTime())) return String(d);
  return dateObj.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export const CurrentPhaseCard: React.FC<{ data: any }> = ({ data }) => {
  const phaseInfo = useMemo(() => {
    const { person, chartData } = data;
    const birthDate = person?.date || '1996-11-01';
    
    // Calculate active dasha using DashaEngine
    const dashaRes = calculateActiveDasha(chartData, birthDate, new Date());
    
    const mdLord = dashaRes.mahadasha.lord;
    const adLord = dashaRes.antardasha.lord;
    const pdLord = dashaRes.pratyantardasha?.lord || 'Venus';

    const mdStart = formatDate(dashaRes.mahadasha.startDate);
    const mdEnd = formatDate(dashaRes.mahadasha.endDate);

    const adStart = formatDate(dashaRes.antardasha.startDate);
    const adEnd = formatDate(dashaRes.antardasha.endDate);

    const adPct = Math.round(dashaRes.antardasha.percentComplete || 45);

    // Major transits (Go-chara)
    const divisionalCharts = chartData?.horoscope?.divisional_charts || chartData?.divisional_charts || {};
    const moonSign = divisionalCharts["D-1_rasi"]?.Moon?.sign || "Aries";
    const transitSnapshot = computeLiveTransitSnapshot(moonSign, new Date());
    const saturnTransitPos = transitSnapshot.positions.Saturn;
    const jupiterTransitPos = transitSnapshot.positions.Jupiter;

    const activeSaturnTransit = `${saturnTransitPos.sign} (Saturn)`;
    const activeJupiterTransit = `${jupiterTransitPos.sign} (Jupiter)`;

    return {
      mdLord,
      adLord,
      pdLord,
      mdStart,
      mdEnd,
      adStart,
      adEnd,
      adPct,
      saturnTransit: activeSaturnTransit,
      jupiterTransit: activeJupiterTransit,
      qualities: PLANET_QUALITIES[adLord] || 'discipline, restructuring, and long-term gains'
    };
  }, [data]);

  return (
    <div className={styles.phaseCard}>
      <div className={styles.titleHeader}>
        <h2 className={styles.title}>
          <Clock className="w-5 h-5 text-[#F5A623]" />
          CURRENT TIMING ACTIVATION & DASHA VECTOR
        </h2>
        <span className="text-xs font-mono text-[#9CA3AF]">
          Vimshottari Dasha Engine • 2026 Epoch
        </span>
      </div>

      <div className={styles.dhasaGrid}>
        {/* Mahadasha */}
        <div className={styles.dashaBox}>
          <div className={styles.label}>
            <Activity className="w-3.5 h-3.5 text-amber-400" /> Major Cycle (Mahadasha)
          </div>
          <div className={styles.planet}>{phaseInfo.mdLord}</div>
          <div className={styles.dates}>
            {phaseInfo.mdStart} — {phaseInfo.mdEnd}
          </div>
          <span className={`${styles.status} ${styles.statusOngoing}`}>
            Ongoing Cycle
          </span>
        </div>

        {/* Antardasha (ACTIVE) */}
        <div className={`${styles.dashaBox} ${styles.active}`}>
          <div className={styles.label}>
            <Flame className="w-3.5 h-3.5 text-rose-400" /> Active Sub-Period (Antardasha)
          </div>
          <div className={styles.planet}>{phaseInfo.adLord}</div>
          <div className={styles.dates}>
            {phaseInfo.adStart} — {phaseInfo.adEnd}
          </div>
          <span className={`${styles.status} ${styles.statusActive}`}>
            🔴 Active Now ({phaseInfo.adPct}%)
          </span>
          <div className={styles.progressTrack}>
            <div className={styles.progressBar} style={{ width: `${phaseInfo.adPct}%` }} />
          </div>
        </div>

        {/* Pratyantardasha */}
        <div className={styles.dashaBox}>
          <div className={styles.label}>
            <Clock className="w-3.5 h-3.5 text-sky-400" /> Micro-Period (Pratyantar)
          </div>
          <div className={styles.planet}>{phaseInfo.pdLord}</div>
          <div className={styles.dates}>Sub-sub Period</div>
          <span className={`${styles.status} ${styles.statusOngoing}`}>
            Immediate Driver
          </span>
        </div>

        {/* Major Transits */}
        <div className={styles.dashaBox}>
          <div className={styles.label}>
            <Shield className="w-3.5 h-3.5 text-emerald-400" /> Transit Alignment
          </div>
          <div className={styles.planet}>{phaseInfo.jupiterTransit.split(' ')[0]}</div>
          <div className={styles.effect}>{phaseInfo.jupiterTransit}</div>
          <span className={`${styles.status} ${styles.statusTransit}`}>
            🟢 Supportive Transit
          </span>
        </div>
      </div>

      {/* Meaning & Guidance */}
      <div className={styles.meaning}>
        <p>
          <strong>Strategic Direction ({phaseInfo.adLord} Antardasha):</strong> This phase emphasizes <strong>{phaseInfo.qualities}</strong>. Align daily actions with the qualities of {phaseInfo.adLord} to harvest maximum momentum and navigate transit adjustments effectively.
        </p>
      </div>
    </div>
  );
};

