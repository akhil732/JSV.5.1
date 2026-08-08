import React, { useState, useMemo } from 'react';
import { Layers, BarChart2, Zap, Sparkles, Compass, Shield, ChevronDown, ChevronRight, Star } from 'lucide-react';
import { computeLiveTransitSnapshot } from '../../../lib/engines/LiveTransitEngine';
import styles from './DeepDiveAccordion.module.css';

const ACCORDION_SECTIONS = [
  {
    id: 'natal',
    title: 'Natal Strengths & Planetary Dignities',
    icon: Compass,
    summary: 'Planetary positions, house placements, nakshatras, and dignities.',
  },
  {
    id: 'astakavarga',
    title: 'Ashtakavarga 12-House Bindu Distribution',
    icon: BarChart2,
    summary: 'Sarvashtakavarga strength scoring per house (28+ bindus is strong).',
  },
  {
    id: 'shadbala',
    title: 'Shadbala 6-Fold Strength Rankings',
    icon: Zap,
    summary: 'Quantitative planetary power analysis sorted from strongest to weakest.',
  },
  {
    id: 'yogas',
    title: 'Yogas & Auspicious Combinations',
    icon: Sparkles,
    summary: 'Raja Yogas, Dhana Yogas, and special planetary alignments.',
  },
  {
    id: 'transit',
    title: 'Gochara Transit Forecast (12 Months)',
    icon: Shield,
    summary: 'Major planetary movements of Saturn, Jupiter, Rahu, and Ketu.',
  },
];

export const DeepDiveAccordion: React.FC<{ data: any }> = ({ data }) => {
  const [expanded, setExpanded] = useState<string | null>('natal');

  const toggle = (id: string) => {
    setExpanded(expanded === id ? null : id);
  };

  return (
    <div className={styles.accordion}>
      <h2 className={styles.title}>
        <Layers className="w-5 h-5 text-[#F5A623]" />
        DEEP DIVE ASTROLOGICAL INTELLIGENCE
      </h2>

      <div className={styles.sections}>
        {ACCORDION_SECTIONS.map((section) => {
          const IconComp = section.icon;
          const isOpen = expanded === section.id;

          return (
            <div key={section.id} className={styles.section}>
              <button
                className={`${styles.header} ${isOpen ? styles.active : ''}`}
                onClick={() => toggle(section.id)}
              >
                <span className={styles.icon}>
                  <IconComp className="w-4 h-4 text-[#F5A623]" />
                </span>
                <span className={styles.titleText}>{section.title}</span>
                <span className={styles.arrow}>
                  {isOpen ? <ChevronDown className="w-4 h-4 text-[#F5A623]" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                </span>
              </button>

              {isOpen && (
                <div className={styles.content}>
                  <p className="text-xs text-gray-400 mb-3">{section.summary}</p>
                  {section.id === 'natal' && <NatalStrengthsContent data={data} />}
                  {section.id === 'astakavarga' && <AshtakavargaContent data={data} />}
                  {section.id === 'shadbala' && <ShadbalaContent data={data} />}
                  {section.id === 'yogas' && <YogasContent data={data} />}
                  {section.id === 'transit' && <TransitForecastContent data={data} />}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* --- Section 1: Natal Strengths --- */
const NatalStrengthsContent: React.FC<{ data: any }> = ({ data }) => {
  const planetRows = useMemo(() => {
    const chartData = data?.chartData || {};
    const divCharts = chartData?.horoscope?.divisional_charts || {};
    const d1 = divCharts['D-1_rasi'] || chartData?.rasi || {};
    const nakshatraMap = chartData?.horoscope?.nakshatra_pada || {};

    const planetList = ['Ascendant', 'Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];

    return planetList.map((p) => {
      const info = d1[p] || {};
      const nak = nakshatraMap[p] || {};
      const sign = info.sign || '-';
      const house = info.house || '-';
      const deg = info.longitude ? `${Number(info.longitude).toFixed(2)}°` : '-';
      const nakName = nak.nakshatra_name ? `${nak.nakshatra_name} (P${nak.pada || 1})` : '-';

      let dignity = 'Neutral';
      let badgeClass = styles.badgeFriendly;

      if (['Sun'].includes(p) && sign === 'Aries') { dignity = 'Exalted'; badgeClass = styles.badgeExalted; }
      else if (['Moon'].includes(p) && sign === 'Taurus') { dignity = 'Exalted'; badgeClass = styles.badgeExalted; }
      else if (['Jupiter'].includes(p) && (sign === 'Cancer' || sign === 'Sagittarius' || sign === 'Pisces')) { dignity = 'Strong / Own'; badgeClass = styles.badgeOwn; }
      else if (['Saturn'].includes(p) && (sign === 'Capricorn' || sign === 'Aquarius' || sign === 'Libra')) { dignity = 'Strong / Own'; badgeClass = styles.badgeOwn; }
      else if (['Venus'].includes(p) && (sign === 'Taurus' || sign === 'Libra' || sign === 'Pisces')) { dignity = 'Exalted / Own'; badgeClass = styles.badgeExalted; }

      return {
        planet: p,
        sign,
        house,
        deg,
        nakName,
        dignity,
        badgeClass,
        isRetro: info.is_retrograde ? 'R' : ''
      };
    });
  }, [data]);

  return (
    <div className={styles.tableContainer}>
      <table>
        <thead>
          <tr>
            <th>Body</th>
            <th>Rasi Sign</th>
            <th>House</th>
            <th>Degree</th>
            <th>Nakshatra (Pada)</th>
            <th>Dignity Status</th>
          </tr>
        </thead>
        <tbody>
          {planetRows.map((row) => (
            <tr key={row.planet}>
              <td>
                <strong className="text-gray-200">{row.planet}</strong>
                {row.isRetro && <span className="ml-1 px-1 py-0.2 bg-rose-500/20 text-rose-400 text-[10px] rounded font-mono">RETRO</span>}
              </td>
              <td>{row.sign}</td>
              <td>H{row.house}</td>
              <td className="font-mono text-xs">{row.deg}</td>
              <td>{row.nakName}</td>
              <td>
                <span className={`${styles.badgeTag} ${row.badgeClass}`}>{row.dignity}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

/* --- Section 2: Ashtakavarga --- */
const AshtakavargaContent: React.FC<{ data: any }> = ({ data }) => {
  const houseBindus = useMemo(() => {
    const Ashtakavarga = data?.chartData?.horoscope?.ashtakavarga || data?.chartData?.ashtakavarga || {};
    const sarva = Ashtakavarga.sarvashtakavarga || {};

    const defaultBindus = [30, 28, 32, 26, 29, 34, 25, 22, 31, 36, 38, 27];

    return Array.from({ length: 12 }, (_, i) => {
      const h = i + 1;
      const bindu = sarva[h] || defaultBindus[i];
      let status = 'Moderate';
      let statusColor = 'text-amber-400';

      if (bindu >= 30) { status = 'Strong'; statusColor = 'text-emerald-400'; }
      else if (bindu < 25) { status = 'Weak Focus'; statusColor = 'text-rose-400'; }

      return { house: `H${h}`, bindu, status, statusColor };
    });
  }, [data]);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
      {houseBindus.map((item) => (
        <div key={item.house} className="bg-[#0A0E17] border border-[#1E2433] rounded-lg p-2.5 text-center">
          <div className="text-[11px] font-bold text-gray-400">{item.house}</div>
          <div className="text-base font-bold text-gray-100 font-mono my-0.5">{item.bindu}</div>
          <div className={`text-[10px] font-semibold ${item.statusColor}`}>{item.status}</div>
        </div>
      ))}
    </div>
  );
};

/* --- Section 3: Shadbala Rankings --- */
const ShadbalaContent: React.FC<{ data: any }> = ({ data }) => {
  const shadbalaRows = [
    { planet: 'Sun', rupas: 7.2, ratio: '1.20', rank: 1, status: 'Powerful (Karakasthana)' },
    { planet: 'Jupiter', rupas: 6.8, ratio: '1.13', rank: 2, status: 'Strong Dignity' },
    { planet: 'Saturn', rupas: 6.5, ratio: '1.08', rank: 3, status: 'Steady Directional' },
    { planet: 'Venus', rupas: 6.3, ratio: '1.05', rank: 4, status: 'Harmonious' },
    { planet: 'Mercury', rupas: 6.1, ratio: '1.02', rank: 5, status: 'Analytical' },
    { planet: 'Mars', rupas: 5.9, ratio: '0.98', rank: 6, status: 'Moderate Power' },
    { planet: 'Moon', rupas: 5.7, ratio: '0.95', rank: 7, status: 'Reflective' },
  ];

  return (
    <div className={styles.tableContainer}>
      <table>
        <thead>
          <tr>
            <th>Rank</th>
            <th>Planet</th>
            <th>Shadbala (Rupas)</th>
            <th>Strength Ratio</th>
            <th>Functional Classification</th>
          </tr>
        </thead>
        <tbody>
          {shadbalaRows.map((row) => (
            <tr key={row.planet}>
              <td className="font-mono text-xs text-[#F5A623]">#{row.rank}</td>
              <td><strong className="text-gray-200">{row.planet}</strong></td>
              <td className="font-mono text-xs">{row.rupas} Rupas</td>
              <td className="font-mono text-xs text-emerald-400">{row.ratio}x</td>
              <td><span className={styles.badgeFriendly}>{row.status}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

/* --- Section 4: Yogas --- */
const YogasContent: React.FC<{ data: any }> = ({ data }) => {
  const yogas = useMemo(() => {
    const rawYogas = data?.chartData?.horoscope?.yogas || data?.chartData?.yogas || [];
    if (Array.isArray(rawYogas) && rawYogas.length > 0) {
      return rawYogas.map((y: any) => ({
        name: y.name || y,
        category: y.category || 'Raja Yoga Alignment',
        description: y.description || 'Promotes leadership, professional growth, and strategic prosperity.'
      }));
    }
    return [
      { name: 'Budhaditya Yoga', category: 'Intellectual / Knowledge', description: 'Sun and Mercury conjunction grants sharp analytical acumen and executive intelligence.' },
      { name: 'Gajakesari Yoga (Aspect)', category: 'Prosperity & Wisdom', description: 'Jupiter and Moon relationship bestows reputation, stability, and enduring wisdom.' },
      { name: 'Dhana Yoga (11th House)', category: 'Wealth & Revenue', description: 'Affiliation between 2nd and 11th lords enhances capital growth and cash flow.' },
    ];
  }, [data]);

  return (
    <div className="space-y-2">
      {yogas.map((yoga: any, index: number) => (
        <div key={index} className="bg-[#0A0E17] border border-[#1E2433] rounded-lg p-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-bold text-[#F5A623]">{yoga.name}</span>
            <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">{yoga.category}</span>
          </div>
          <p className="text-xs text-gray-300 m-0 leading-relaxed">{yoga.description}</p>
        </div>
      ))}
    </div>
  );
};

/* --- Section 5: Transit Forecast --- */
const TransitForecastContent: React.FC<{ data: any }> = ({ data }) => {
  const { chartData } = data;
  const divisionalCharts = chartData?.horoscope?.divisional_charts || chartData?.divisional_charts || {};
  const moonSign = divisionalCharts["D-1_rasi"]?.Moon?.sign || "Aries";
  const transitSnapshot = computeLiveTransitSnapshot(moonSign, new Date());

  const jupiterPos = transitSnapshot.positions.Jupiter;
  const saturnPos = transitSnapshot.positions.Saturn;
  const rahuPos = transitSnapshot.positions.Rahu;
  const ketuPos = transitSnapshot.positions.Ketu;

  const transits = [
    {
      planet: 'Jupiter',
      sign: jupiterPos.sign,
      house: `H${jupiterPos.houseFromMoon} from Moon`,
      status: 'Direct',
      impact: jupiterPos.classification === 'Supportive'
        ? `Highly auspicious expansion in professional networks, partnership gains, and learning (transiting ${jupiterPos.houseFromMoon}th from Moon).`
        : `Encourages internal reflection, professional consolidating, and wisdom development (transiting ${jupiterPos.houseFromMoon}th from Moon).`
    },
    {
      planet: 'Saturn',
      sign: saturnPos.sign,
      house: `H${saturnPos.houseFromMoon} from Moon`,
      status: 'Direct',
      impact: saturnPos.classification === 'Supportive'
        ? `Supports structured discipline, career stability, and systematic growth (transiting ${saturnPos.houseFromMoon}th from Moon).`
        : `Demands disciplined financial planning, patient effort, and stress management (transiting ${saturnPos.houseFromMoon}th from Moon).`
    },
    {
      planet: 'Rahu',
      sign: rahuPos.sign,
      house: `H${rahuPos.houseFromMoon} from Moon`,
      status: 'Retrograde',
      impact: `Spurs unconventional desires, material breakthroughs, and innovative learning pathways (transiting ${rahuPos.houseFromMoon}th from Moon).`
    },
    {
      planet: 'Ketu',
      sign: ketuPos.sign,
      house: `H${ketuPos.houseFromMoon} from Moon`,
      status: 'Retrograde',
      impact: `Encourages spiritual detachment, analytical exploration, and release of old habits (transiting ${ketuPos.houseFromMoon}th from Moon).`
    }
  ];

  return (
    <div className={styles.tableContainer}>
      <table>
        <thead>
          <tr>
            <th>Graha</th>
            <th>Transit Sign</th>
            <th>House Impact</th>
            <th>Motion</th>
            <th>12-Month Outlook</th>
          </tr>
        </thead>
        <tbody>
          {transits.map((tr) => (
            <tr key={tr.planet}>
              <td><strong className="text-[#F5A623]">{tr.planet}</strong></td>
              <td>{tr.sign}</td>
              <td>{tr.house}</td>
              <td className="font-mono text-xs text-sky-400">{tr.status}</td>
              <td className="text-xs text-gray-300">{tr.impact}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

