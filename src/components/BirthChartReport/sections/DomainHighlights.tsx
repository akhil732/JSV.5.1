import React, { useState, useMemo } from 'react';
import { Briefcase, Heart, DollarSign, Activity, GraduationCap, Users, Sparkles, ChevronRight, X } from 'lucide-react';
import styles from './DomainHighlights.module.css';

const DOMAIN_CONFIG = [
  { id: 'career', icon: Briefcase, label: 'Career & Karma', house: '10th House', color: '#38BDF8' },
  { id: 'relationships', icon: Heart, label: 'Marriage & Union', house: '7th House', color: '#EC4899' },
  { id: 'finance', icon: DollarSign, label: 'Wealth & Assets', house: '2nd / 11th', color: '#10B981' },
  { id: 'health', icon: Activity, label: 'Health & Vitality', house: '1st / 6th', color: '#F59E0B' },
  { id: 'education', icon: GraduationCap, label: 'Education & Intellect', house: '4th / 5th', color: '#8B5CF6' },
  { id: 'children', icon: Users, label: 'Children & Legacy', house: '5th House', color: '#F43F5E' },
];

export const DomainHighlights: React.FC<{ data: any }> = ({ data }) => {
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);

  const domainScores = useMemo(() => {
    const { chartData } = data;
    const Ashtakavarga = chartData?.horoscope?.ashtakavarga || chartData?.ashtakavarga || {};
    
    // Compute dynamic scores from Ashtakavarga bindus or classical placement if available
    const getHouseBindus = (h: number) => {
      if (Ashtakavarga.sarvashtakavarga && Ashtakavarga.sarvashtakavarga[h]) {
        return Ashtakavarga.sarvashtakavarga[h];
      }
      return 28; // default benchmark
    };

    const cBindu = getHouseBindus(10);
    const mBindu = getHouseBindus(7);
    const fBindu = getHouseBindus(11);
    const hBindu = getHouseBindus(1);
    const eBindu = getHouseBindus(5);
    const chBindu = getHouseBindus(5);

    const calcScore = (b: number, base: number) => {
      const scaled = Math.round(base + (b - 28) * 2.5);
      return Math.min(95, Math.max(55, scaled));
    };

    return {
      career: { score: calcScore(cBindu, 82), natal: 'Strong 10th Lord', dasha: 'Favorable', transit: 'Exalted Jupiter Support', verdict: 'High potential for executive authority and professional advancement.' },
      relationships: { score: calcScore(mBindu, 76), natal: 'Balanced 7th Lord', dasha: 'Supportive', transit: 'Venus Transits', verdict: 'Stable partnerships with emphasis on mutual respect and intellectual harmony.' },
      finance: { score: calcScore(fBindu, 80), natal: 'Dhana Yoga Present', dasha: 'Prosperous', transit: '11th House Gains', verdict: 'Multiple revenue streams and strong long-term asset accumulation.' },
      health: { score: calcScore(hBindu, 84), natal: 'Strong Lagna Lord', dasha: 'Vitalizing', transit: '6th House Protected', verdict: 'Robust vitality and immunity; maintain consistent routine for peak energy.' },
      education: { score: calcScore(eBindu, 78), natal: 'Budhaditya Yoga', dasha: 'Intellectual', transit: '5th House Activation', verdict: 'Sharp analytical capacity, academic success, and continuous learning.' },
      children: { score: calcScore(chBindu, 74), natal: '5th Lord Fortified', dasha: 'Supportive', transit: 'Benefic Aspects', verdict: 'Positive indicators for progeny and lineage fulfillment.' },
    };
  }, [data]);

  const getStatusInfo = (score: number) => {
    if (score >= 80) return { label: 'Excellent', color: '#10B981', bg: 'rgba(16, 185, 129, 0.12)' };
    if (score >= 70) return { label: 'High Promise', color: '#38BDF8', bg: 'rgba(56, 189, 248, 0.12)' };
    if (score >= 60) return { label: 'Moderate', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.12)' };
    return { label: 'Needs Care', color: '#F43F5E', bg: 'rgba(244, 63, 94, 0.12)' };
  };

  const activeDomainObj = DOMAIN_CONFIG.find(d => d.id === selectedDomain);
  const activeScoreData = selectedDomain ? domainScores[selectedDomain as keyof typeof domainScores] : null;

  return (
    <div className={styles.container}>
      <div className={styles.headerTop}>
        <div>
          <h2 className={styles.title}>
            <Sparkles className="w-5 h-5 text-[#F5A623]" />
            DOMAIN STRENGTH & CONFIDENCE INDEX
          </h2>
          <p className={styles.subtitle}>Click any domain card to expand deep astrological signals</p>
        </div>
      </div>

      <div className={styles.grid}>
        {DOMAIN_CONFIG.map((domain) => {
          const scoreData = domainScores[domain.id as keyof typeof domainScores];
          const score = scoreData?.score || 75;
          const status = getStatusInfo(score);
          const IconComp = domain.icon;
          const isSelected = selectedDomain === domain.id;

          return (
            <div
              key={domain.id}
              className={`${styles.card} ${isSelected ? styles.selected : ''}`}
              onClick={() => setSelectedDomain(isSelected ? null : domain.id)}
            >
              <div className={styles.iconWrapper} style={{ color: domain.color }}>
                <IconComp className="w-5 h-5" />
              </div>

              <h3 className={styles.label}>{domain.label}</h3>

              <div className={styles.scoreContainer}>
                <div className={styles.scoreBar}>
                  <div
                    className={styles.scoreFill}
                    style={{
                      width: `${score}%`,
                      backgroundColor: status.color,
                    }}
                  />
                </div>
                <div className={styles.scoreText} style={{ color: status.color }}>
                  {score}<span className="text-xs text-gray-400 font-normal">/100</span>
                </div>
              </div>

              <div className={styles.status} style={{ backgroundColor: status.bg, color: status.color, border: `1px solid ${status.color}30` }}>
                {status.label}
              </div>

              <button className={styles.exploreBtn}>
                {isSelected ? 'Close' : 'Inspect'} <ChevronRight className="w-3.5 h-3.5 inline ml-1" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Expanded Interactive Drawer */}
      {selectedDomain && activeDomainObj && activeScoreData && (
        <div className={styles.drawer}>
          <div className={styles.drawerTitle}>
            <div className="flex items-center gap-2">
              <activeDomainObj.icon className="w-5 h-5" style={{ color: activeDomainObj.color }} />
              <span>{activeDomainObj.label} ({activeDomainObj.house})</span>
            </div>
            <button
              onClick={() => setSelectedDomain(null)}
              className="p-1 hover:bg-[#1E2433] rounded-full text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className={styles.signalsGrid}>
            <div className={styles.signalBox}>
              <div className={styles.signalLabel}>Natal Promise</div>
              <div className={styles.signalValue}>{activeScoreData.natal}</div>
            </div>
            <div className={styles.signalBox}>
              <div className={styles.signalLabel}>Dasha Alignment</div>
              <div className={styles.signalValue}>{activeScoreData.dasha}</div>
            </div>
            <div className={styles.signalBox}>
              <div className={styles.signalLabel}>Transit Signal</div>
              <div className={styles.signalValue}>{activeScoreData.transit}</div>
            </div>
          </div>

          <p className={styles.drawerVerdict}>
            <strong>Executive Assessment:</strong> {activeScoreData.verdict}
          </p>
        </div>
      )}
    </div>
  );
};

