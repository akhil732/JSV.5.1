import React, { useState } from 'react';
import { Clock, ChevronDown, ChevronRight, Grid } from 'lucide-react';
import { getFullDashaTimeline, getAntardashasForMd } from '../lib/engines/DashaEngine';

const PLANET_TRANSLATIONS: Record<string, Record<'en' | 'hi' | 'te', string>> = {
  "Sun": { en: "Sun", hi: "सूर्य (Sun)", te: "సూర్యుడు (Sun)" },
  "Moon": { en: "Moon", hi: "चंद्रма (Moon)", te: "చంద్రుడు (Moon)" },
  "Mars": { en: "Mars", hi: "मंगल (Mars)", te: "కుజుడు (Mars)" },
  "Mercury": { en: "Mercury", hi: "बुध (Mercury)", te: "బుధుడు (Mercury)" },
  "Jupiter": { en: "Jupiter", hi: "गुरु (Jupiter)", te: "గురుడు (Jupiter)" },
  "Venus": { en: "Venus", hi: "शुक्र (Venus)", te: "శుక్రుడు (Venus)" },
  "Saturn": { en: "Saturn", hi: "शनि (Saturn)", te: "శని (Saturn)" },
  "Rahu": { en: "Rahu", hi: "राहु (Rahu)", te: "రాహువు (Rahu)" },
  "Ketu": { en: "Ketu", hi: "केतु (Ketu)", te: "కేతువు (Ketu)" },
  "Ascendant": { en: "Ascendant", hi: "लग्न (Lagna)", te: "లగ్నం (Lagna)" }
};

interface VimshottariDashaViewProps {
  horoscopeData: any;
  birthDateStr: string;
  language: 'en' | 'hi' | 'te';
}

export const VimshottariDashaView: React.FC<VimshottariDashaViewProps> = ({ horoscopeData, birthDateStr, language }) => {
  const dashaTimeline = getFullDashaTimeline(horoscopeData, birthDateStr);
  const mds = dashaTimeline.map((m, idx) => ({
    id: `md-${m.lord}-${idx}`,
    lord: m.lord,
    start: m.startDate,
    end: m.endDate,
    duration: m.totalDuration
  }));

  // State to track expanded Mahadashas
  const [expandedMds, setExpandedMds] = useState<Record<string, boolean>>({});
  // Mode toggle
  const [activeFilter, setActiveFilter] = useState<'all' | 'current'>('all');

  const now = new Date(); // Anchored date consistent with report calculations

  // Function to get Antardashas for a Mahadasha
  const getAntardashas = (md: any) => {
    const ads = getAntardashasForMd(horoscopeData, birthDateStr, md.lord);
    return ads.map((ad, idx) => ({
      id: `ad-${md.lord}-${ad.lord}-${idx}`,
      lord: ad.lord,
      start: ad.startDate,
      end: ad.endDate,
      duration: ad.totalDuration
    }));
  };

  const handleToggleExpand = (mdId: string) => {
    setExpandedMds(prev => ({ ...prev, [mdId]: !prev[mdId] }));
  };

  const handleExpandAll = () => {
    const nextState: Record<string, boolean> = {};
    mds.forEach(m => {
      nextState[m.id] = true;
    });
    setExpandedMds(nextState);
  };

  const handleCollapseAll = () => {
    setExpandedMds({});
  };

  const handleJumpToCurrent = () => {
    setActiveFilter('all');
    const currentActive = mds.find(m => now >= m.start && now <= m.end);
    if (currentActive) {
      setExpandedMds(prev => ({ ...prev, [currentActive.id]: true }));
      setTimeout(() => {
        const el = document.getElementById(currentActive.id);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  };

  const formatLocalDate = (date: Date): string => {
    return date.toLocaleDateString(language === 'en' ? 'en-US' : language === 'hi' ? 'hi-IN' : 'te-IN', {
      month: 'short',
      day: '2-digit',
      year: 'numeric'
    });
  };

  const formatLocalDuration = (years: number): string => {
    const y = Math.floor(years);
    const d = Math.round((years - y) * 365.25);
    
    const yLabel = language === 'en' ? 'y' : language === 'hi' ? 'वर्ष' : 'సం.';
    const dLabel = language === 'en' ? 'd' : language === 'hi' ? 'दिन' : 'రోజులు';

    if (y > 0 && d > 0) return `${y}${yLabel} ${d}${dLabel}`;
    if (y > 0) return `${y}${yLabel}`;
    return `${d}${dLabel}`;
  };

  const getRemainingTimeText = (endDate: Date, startDate: Date) => {
    if (now >= endDate) return language === 'en' ? 'Completed' : language === 'hi' ? 'पूर्ण' : 'పూర్తయింది';
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const years = Math.floor(diffDays / 365);
    const remainingDaysAfterYears = diffDays % 365;
    const months = Math.floor(remainingDaysAfterYears / 30.4375);
    const days = Math.round(remainingDaysAfterYears % 30.4375);

    const yLabel = language === 'en' ? 'y' : language === 'hi' ? 'व' : 'సం.';
    const mLabel = language === 'en' ? 'm' : language === 'hi' ? 'म' : 'నె.';
    const dLabel = language === 'en' ? 'd' : language === 'hi' ? 'दि' : 'రో.';
    const remLabel = language === 'en' ? 'remaining' : language === 'hi' ? 'शेष' : 'మిగిలి ఉంది';

    let text = "";
    if (years > 0) text += `${years}${yLabel} `;
    if (months > 0) text += `${months}${mLabel} `;
    if (days > 0 || text === "") text += `${days}${dLabel} `;
    return `${text} ${remLabel}`;
  };

  const renderProgressBar = (startDate: Date, endDate: Date) => {
    const totalDurationMs = endDate.getTime() - startDate.getTime();
    const elapsedMs = now.getTime() - startDate.getTime();
    const percent = Math.max(0, Math.min(100, (elapsedMs / totalDurationMs) * 100));

    const filledBlocks = Math.round((percent / 100) * 12);
    const emptyBlocks = 12 - filledBlocks;
    const blockProgressBar = "█".repeat(filledBlocks) + "░".repeat(emptyBlocks);

    return (
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-[10px] font-mono mt-1 text-[#E67E22]">
        <span className="tracking-tight text-base">{blockProgressBar}</span>
        <span className="font-bold">{getRemainingTimeText(endDate, startDate)}</span>
      </div>
    );
  };

  const labels = {
    en: {
      title: "Vimshottari Dasha Timeline",
      desc: "Vedic planetary progression cycles calculated based on Moon's nakshatra position.",
      expandAll: "Expand All",
      collapseAll: "Collapse All",
      viewAll: "All Dashas",
      viewCurrent: "Current Active",
      now: "Now",
      planet: "Planet Cycle",
      timeline: "Auspicious Interval",
      duration: "Duration"
    },
    hi: {
      title: "विंशोत्तरी दशा समयावधि",
      desc: "चंद्रमा की नक्षत्र स्थिति के आधार पर गणना की गई वैदिक ग्रह चक्र प्रगति।",
      expandAll: "सभी विस्तृत करें",
      collapseAll: "सभी संकुचित करें",
      viewAll: "सभी दशाएं",
      viewCurrent: "केवल सक्रिय",
      now: "सक्रिय",
      planet: "ग्रह चक्र",
      timeline: "शुभ समयांतराल",
      duration: "अवधि"
    },
    te: {
      title: "వింశోత్తరి దశ కాలక్రమం",
      desc: "చంద్రుని నక్షత్ర స్థానం ఆధారంగా లెక్కించబడిన వైదిక గ్రహ కాలచక్రం.",
      expandAll: "అన్నీ విస్తరించు",
      collapseAll: "అన్నీ కుదించు",
      viewAll: "అన్ని దశలు",
      viewCurrent: "ప్రస్తుత దశ",
      now: "ప్రస్తుతం",
      planet: "గ్రహ కాలం",
      timeline: "శుభ కాలవ్యవధి",
      duration: "వ్యవధి"
    }
  }[language];

  // Auto-expand current active dasha on mount
  React.useEffect(() => {
    const currentActive = mds.find(m => now >= m.start && now <= m.end);
    if (currentActive) {
      setExpandedMds(prev => ({ ...prev, [currentActive.id]: true }));
    }
  }, []);

  return (
    <div className="rounded-ds-xl border border-ds-secondary/15 bg-ds-surface overflow-hidden shadow-ds-sm flex flex-col">
      {/* Title block */}
      <div className="px-6 py-5 border-b border-ds-secondary/10 bg-ds-surface-container flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-sm sm:text-base font-serif font-bold text-ds-secondary flex items-center gap-2">
            <Clock className="w-5 h-5 text-ds-primary" /> {labels.title}
          </h3>
          <p className="text-[10px] text-ds-on-surface-variant mt-0.5 font-medium">
            {labels.desc}
          </p>
        </div>

        {/* Action Toggles & Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Jump to Current Button */}
          <button
            onClick={handleJumpToCurrent}
            className="px-3 py-1.5 bg-ds-primary/10 hover:bg-ds-primary/20 text-ds-primary border border-ds-primary/30 rounded-ds-md text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
          >
            <span>🎯</span> Jump to Current Period
          </button>

          {/* View Filter */}
          <div className="flex bg-ds-surface rounded-ds-lg p-0.5 border border-ds-secondary/15 text-[10px] font-bold">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1 rounded-ds-md transition-all cursor-pointer ${
                activeFilter === 'all' ? 'bg-ds-primary text-ds-on-primary shadow-2xs' : 'text-ds-on-surface-variant hover:text-ds-secondary'
              }`}
            >
              {labels.viewAll}
            </button>
            <button
              onClick={() => setActiveFilter('current')}
              className={`px-3 py-1 rounded-ds-md transition-all cursor-pointer ${
                activeFilter === 'current' ? 'bg-ds-primary text-ds-on-primary shadow-2xs' : 'text-ds-on-surface-variant hover:text-ds-secondary'
              }`}
            >
              {labels.viewCurrent}
            </button>
          </div>

          {/* Expand/Collapse buttons */}
          {activeFilter === 'all' && (
            <div className="flex gap-1.5 text-[9px] font-mono text-ds-on-surface-variant">
              <button
                onClick={handleExpandAll}
                className="px-2 py-1 bg-ds-surface hover:bg-ds-surface-container border border-ds-secondary/15 rounded-ds-md transition-all cursor-pointer hover:text-ds-primary font-bold"
              >
                {labels.expandAll}
              </button>
              <button
                onClick={handleCollapseAll}
                className="px-2 py-1 bg-ds-surface hover:bg-ds-surface-container border border-ds-secondary/15 rounded-ds-md transition-all cursor-pointer hover:text-ds-primary font-bold"
              >
                {labels.collapseAll}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Dasha List Table */}
      <div className="p-4 sm:p-6 overflow-x-auto">
        <div className="min-w-[600px] border border-ds-secondary/10 rounded-ds-xl overflow-hidden bg-ds-surface shadow-xs">
          {/* Table Header Row */}
          <div className="grid grid-cols-12 bg-ds-secondary/10 text-ds-on-surface-variant font-sans text-[10px] uppercase border-b border-ds-secondary/10 font-bold py-3 px-4 tracking-wider">
            <div className="col-span-1"></div>
            <div className="col-span-4">{labels.planet}</div>
            <div className="col-span-5">{labels.timeline}</div>
            <div className="col-span-2 text-right">{labels.duration}</div>
          </div>

          <div className="divide-y divide-ds-secondary/10">
            {mds.map((md) => {
              const isMdActive = now >= md.start && now <= md.end;
              const isExpanded = expandedMds[md.id];
              const ads = getAntardashas(md);

              // If filter is current active, skip inactive Mahadashas
              if (activeFilter === 'current' && !isMdActive) {
                return null;
              }

              const transMdName = PLANET_TRANSLATIONS[md.lord]?.[language] || md.lord;

              return (
                <div key={md.id} id={md.id} className="transition-all">
                  {/* Mahadasha Row */}
                  <div
                    onClick={() => handleToggleExpand(md.id)}
                    className={`grid grid-cols-12 items-center py-3.5 px-4 text-xs cursor-pointer transition-all hover:bg-ds-surface-container ${
                      isMdActive
                        ? 'bg-ds-primary/10 border-l-4 border-ds-primary pl-[13px] font-semibold text-ds-secondary'
                        : 'text-ds-secondary'
                    }`}
                  >
                    {/* Expand/Collapse Chevron */}
                    <div className="col-span-1 flex items-center justify-start text-ds-on-surface-variant">
                      {isExpanded ? <ChevronDown className="w-4 h-4 text-ds-primary" /> : <ChevronRight className="w-4 h-4" />}
                    </div>

                    {/* Planet Name */}
                    <div className="col-span-4 flex items-center gap-2">
                      <span className="font-serif font-bold text-[13px] text-ds-secondary group-hover:text-ds-primary transition-colors">
                        {transMdName}
                      </span>
                      {isMdActive && (
                        <span className="bg-ds-primary/10 border border-ds-primary/30 text-ds-primary font-mono text-[8px] px-1.5 py-0.5 rounded-ds-md uppercase font-bold animate-pulse shrink-0">
                          {labels.now}
                        </span>
                      )}
                    </div>

                    {/* Interval */}
                    <div className="col-span-5 text-ds-on-surface-variant font-mono text-[11px] font-bold flex items-center gap-1">
                      <span>{formatLocalDate(md.start)}</span>
                      <span className="text-ds-primary">→</span>
                      <span>{formatLocalDate(md.end)}</span>
                    </div>

                    {/* Duration */}
                    <div className="col-span-2 text-right font-mono text-ds-primary font-bold text-[11px]">
                      {formatLocalDuration(md.duration)}
                    </div>
                  </div>

                  {/* Antardashas (sub-rows) */}
                  {isExpanded && (
                    <div className="bg-ds-surface-container/50 border-t border-ds-secondary/10 divide-y divide-ds-secondary/10">
                      {ads.map((ad) => {
                        const isAdActive = now >= ad.start && now <= ad.end;
                        const transAdName = PLANET_TRANSLATIONS[ad.lord]?.[language] || ad.lord;

                        if (activeFilter === 'current' && !isAdActive) {
                          return null;
                        }

                        return (
                          <div
                            key={ad.id}
                            className={`grid grid-cols-12 items-center py-3 px-4 text-[11px] font-sans ${
                              isAdActive
                                ? 'bg-ds-primary/10 text-ds-secondary font-bold'
                                : 'text-ds-on-surface-variant hover:text-ds-secondary'
                            }`}
                          >
                            <div className="col-span-1 flex items-center justify-end pr-2 text-ds-primary/30 font-mono">
                              ├─
                            </div>

                            {/* Sub Planet Name */}
                            <div className="col-span-4 pl-1">
                              <span className="font-serif font-bold">{transAdName}</span>
                              {isAdActive && (
                                <span className="ml-1.5 bg-ds-primary/10 text-ds-primary text-[8px] px-1 py-0.1 border border-ds-primary/20 rounded-ds-md font-mono font-bold uppercase">
                                  {labels.now}
                                </span>
                              )}
                            </div>

                            {/* Interval & Optional Progress Bar */}
                            <div className="col-span-5 flex flex-col justify-center">
                              <div className="font-mono text-[10px] text-ds-on-surface-variant/70 font-bold">
                                {formatLocalDate(ad.start)} → {formatLocalDate(ad.end)}
                              </div>
                              {isAdActive && renderProgressBar(ad.start, ad.end)}
                            </div>

                            {/* Sub Duration */}
                            <div className="col-span-2 text-right font-mono text-ds-primary/70 font-bold text-[10px]">
                              {formatLocalDuration(ad.duration)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
