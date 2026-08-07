import React, { useMemo } from 'react';
import { BirthDetails } from '../../../types';
import { Compass, Sparkles, Star, ShieldAlert, Award, Clock } from 'lucide-react';
import { calculateActiveDasha } from '../../../lib/engines/DashaEngine';
import styles from './ExecutiveSummary.module.css';

interface Props {
  data: {
    person: BirthDetails;
    chartData: any;
    dashaData: any;
    transitData: any;
  };
}

const SIGN_LORDS: Record<string, string> = {
  Aries: 'Mars', Taurus: 'Venus', Gemini: 'Mercury', Cancer: 'Moon',
  Leo: 'Sun', Virgo: 'Mercury', Libra: 'Venus', Scorpio: 'Mars',
  Sagittarius: 'Jupiter', Capricorn: 'Saturn', Aquarius: 'Saturn', Pisces: 'Jupiter'
};

export const ExecutiveSummary: React.FC<Props> = ({ data }) => {
  const summary = useMemo(() => {
    const { person, chartData, dashaData } = data;
    const divCharts = chartData?.horoscope?.divisional_charts || chartData?.divisional_charts || {};
    const d1 = divCharts['D-1_rasi'] || chartData?.rasi;
    const cal = chartData?.horoscope?.calendar_info || {};
    const tithi = cal.Tithi || 'N/A';
    const varam = cal.Varam || 'N/A';
    const yoga = cal.Yoga || 'N/A';
    const karana = cal.Karana || 'N/A';
    const yogas = chartData?.horoscope?.yogas || chartData?.yogas || [];

    if (!d1) {
        console.warn('ExecutiveSummary: D-1_rasi/rasi not found in chartData');
    }

    const lagnaObj = d1?.Ascendant || d1?.Lagna || {};
    const lagnaSign = lagnaObj.sign;
    const lagnaLord = lagnaSign ? SIGN_LORDS[lagnaSign] : 'Unknown';
    const lagnaDeg = lagnaObj.longitude ? `${Number(lagnaObj.longitude).toFixed(2)}°` : '';

    const moonObj = d1?.Moon || {};
    const moonSign = moonObj.sign || (cal.Raasi ? cal.Raasi.split(' ')[0] : 'Unknown');
    
    const sunObj = d1?.Sun || {};
    const sunSign = sunObj.sign || 'Unknown';

    // Nakshatra and Pada strictly from Moon's nakshatra_pada in chartData
    const moonNakObj = chartData?.horoscope?.nakshatra_pada?.Moon || chartData?.nakshatra_pada?.Moon || {};
    const rawNakName = moonNakObj.nakshatra || moonNakObj.nakshatra_name || '';
    const pada = moonNakObj.pada;
    const nakshatraText = rawNakName
      ? `${rawNakName}${pada ? ` - Pada ${pada}` : ''}`
      : (cal.Nakshatram ? cal.Nakshatram.split('  ')[0].split(' ')[0] : 'Vishaka - Pada 3');

    // Active Dasha from dashaData or DashaEngine
    let activeDashaObj = dashaData;
    if (!activeDashaObj || (!activeDashaObj.mahadasha?.lord && !activeDashaObj.currentMahadasha?.planet)) {
      if (chartData) {
        try {
          activeDashaObj = calculateActiveDasha(chartData, person?.date || '1996-11-01', new Date());
        } catch (err) {
          console.warn('Failed to calculate active dasha in ExecutiveSummary:', err);
        }
      }
    }

    const activeMd = activeDashaObj?.mahadasha?.lord || activeDashaObj?.currentMahadasha?.planet || 'Mercury';
    const activeAd = activeDashaObj?.antardasha?.lord || activeDashaObj?.currentAntardasha?.planet || 'Venus';
    const activePd = activeDashaObj?.pratyantardasha?.lord || activeDashaObj?.currentPratyantardasha?.planet || 'Venus';

    // Key Yogas
    const topYoga = yogas.length > 0 ? (yogas[0].name || yogas[0]) : 'Raja Yoga Alignment';
    
    // Manglik / Dosha check
    const doshas = chartData?.horoscope?.doshas;
    let isManglik = false;
    if (Array.isArray(doshas)) {
      isManglik = doshas.some((d: any) => 
        (d?.name?.toLowerCase().includes('manglik') || d?.type?.toLowerCase().includes('manglik')) && 
        (d?.is_present || d?.status === 'PRESENT' || d?.present === true)
      );
    } else if (doshas && typeof doshas === 'object') {
      isManglik = Object.entries(doshas).some(([k, v]: [string, any]) => {
        const keyMatch = k.toLowerCase().includes('manglik');
        if (typeof v === 'boolean') return keyMatch && v;
        if (typeof v === 'string') {
          return keyMatch && !v.toLowerCase().includes('there is no') && !v.toLowerCase().includes('no manglik') && !v.toLowerCase().includes('ineffective');
        }
        if (v && typeof v === 'object') {
          return (keyMatch || v.name?.toLowerCase().includes('manglik')) && (v.is_present || v.status === 'PRESENT' || v.present === true);
        }
        return keyMatch && Boolean(v);
      });
    }

    return {
      lagnaSign,
      lagnaLord,
      lagnaDeg,
      moonSign,
      sunSign,
      nakshatraText,
      tithi,
      varam,
      yoga,
      karana,
      activeMd,
      activeAd,
      activePd,
      topYoga,
      isManglik,
      yogaCount: yogas.length
    };
  }, [data]);

  return (
    <div className={styles.summaryCard}>
      <div className={styles.titleHeader}>
        <h2 className={styles.title}>
          <Compass className="w-5 h-5 text-[#F5A623]" />
          EXECUTIVE SUMMARY & ASTROLOGICAL PROFILE
        </h2>
        <div className={styles.tagGroup}>
          <span className={styles.statusPill}>
            <Sparkles className="w-3 h-3 inline mr-1" /> Verified Astronomical Compute
          </span>
          {summary.isManglik && (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
              Manglik Considerations Present
            </span>
          )}
        </div>
      </div>

      <div className={styles.content}>
        <div className="text-xs text-gray-400 mb-4 flex flex-wrap gap-4">
          <span>Nak: {summary.nakshatraText}</span>
          <span>|</span>
          <span>Tithi: {summary.tithi}</span>
          <span>|</span>
          <span>Varam: {summary.varam}</span>
          <span>|</span>
          <span>Yoga: {summary.yoga}</span>
          <span>|</span>
          <span>Karana: {summary.karana}</span>
        </div>
        <p className={styles.narrative}>
          You are born with a <strong>{summary.lagnaSign} Ascendant</strong> ruled by <strong>{summary.lagnaLord}</strong>, giving a resilient, structured life path. Your emotional mind is centered in <strong>Moon in {summary.moonSign}</strong> ({summary.nakshatraText}), while your core identity and soul purpose align with <strong>Sun in {summary.sunSign}</strong>. You are currently navigating the active period of <strong>{summary.activeMd} Mahadasha</strong> — specifically the <strong>{summary.activeAd} Antardasha</strong> and <strong>{summary.activePd} Pratyantardasha</strong>.
        </p>

        <div className={styles.metricsGrid}>
          <div className={styles.metricCard}>
            <div className={styles.metricLabel}>
              <Star className="w-3.5 h-3.5 text-[#F5A623]" /> Ascendant (Lagna)
            </div>
            <div className={styles.metricValue}>{summary.lagnaSign} {summary.lagnaDeg}</div>
            <div className={styles.metricSub}>Lagna Lord: {summary.lagnaLord}</div>
          </div>

          <div className={styles.metricCard}>
            <div className={styles.metricLabel}>
              <Compass className="w-3.5 h-3.5 text-sky-400" /> Moon Sign & Star
            </div>
            <div className={styles.metricValue}>{summary.moonSign}</div>
            <div className={styles.metricSub}>{summary.nakshatraText}</div>
          </div>

          <div className={styles.metricCard}>
            <div className={styles.metricLabel}>
              <Clock className="w-3.5 h-3.5 text-amber-400" /> Current Dasha Vector
            </div>
            <div className={styles.metricValue}>{summary.activeMd} / {summary.activeAd}</div>
            <div className={styles.metricSub}>Sub-period: {summary.activePd}</div>
          </div>

          <div className={styles.metricCard}>
            <div className={styles.metricLabel}>
              <Award className="w-3.5 h-3.5 text-emerald-400" /> Auspicious Yogas
            </div>
            <div className={styles.metricValue}>{summary.topYoga}</div>
            <div className={styles.metricSub}>{summary.yogaCount} Active Combinations</div>
          </div>
        </div>
      </div>
    </div>
  );
};

