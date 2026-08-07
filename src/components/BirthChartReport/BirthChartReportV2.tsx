import React, { useMemo, useState } from 'react';
import { BirthDetails } from '../../types';
import { CurrentPhaseCard } from './sections/CurrentPhaseCard';
import { ExecutiveSummary } from './sections/ExecutiveSummary';
import { DomainHighlights } from './sections/DomainHighlights';
import { DeepDiveAccordion } from './sections/DeepDiveAccordion';
import { Printer, Copy, Check, Globe, Calendar, MapPin, Clock, Award } from 'lucide-react';
import { calculateActiveDasha } from '../../lib/engines/DashaEngine';
import styles from './BirthChartReportV2.module.css';

interface Props {
  person: BirthDetails;
  chartData: any; // From JHora / Swiss Ephemeris / Engine
  dashaData?: any;
  transitData?: any;
}

export const BirthChartReportV2: React.FC<Props> = ({
  person,
  chartData,
  dashaData,
  transitData,
}) => {
  const [copied, setCopied] = useState(false);
  const [lang, setLang] = useState<'en' | 'hi'>('en');

  // Aggregate report data
  const reportData = useMemo(() => {
    let resolvedDasha = dashaData || chartData?.dasha;
    if (!resolvedDasha && chartData) {
      try {
        resolvedDasha = calculateActiveDasha(chartData, person?.date || '1996-11-01', new Date());
      } catch (e) {
        console.warn('Failed to calculate active dasha in BirthChartReportV2:', e);
      }
    }

    return {
      person,
      chartData,
      dashaData: resolvedDasha,
      transitData: transitData || chartData?.transits || { significantTransits: [{ planet: 'Jupiter', house: 7, description: 'Favorable aspect on partnership and harmony' }] },
    };
  }, [person, chartData, dashaData, transitData]);

  const handleCopy = () => {
    const text = `KP ASTROLOGY EXECUTIVE REPORT: ${person.name || 'Native'}\nBirth Date: ${person.date} ${person.time} (${person.place})\nGenerated via High-Precision Engine.`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className={styles.reportContainer}>
      {/* Header */}
      <div className={styles.reportHeader}>
        <div className={styles.headerTop}>
          <div className={styles.titleArea}>
            <h1>
              <span>{person.name || 'Executive Astrology Report'}</span>
              <span className={styles.goldAccent}>✦</span>
            </h1>
            <div className={styles.metadata}>
              <span><Calendar className="w-3.5 h-3.5 inline mr-1 text-[#F5A623]" />{person.date}</span>
              <span>•</span>
              <span><Clock className="w-3.5 h-3.5 inline mr-1 text-[#F5A623]" />{person.time}</span>
              <span>•</span>
              <span><MapPin className="w-3.5 h-3.5 inline mr-1 text-[#F5A623]" />{person.place}</span>
            </div>
          </div>

          <div className={styles.actions}>
            <button
              onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
              className={styles.actionBtn}
              title="Toggle Language"
            >
              <Globe className="w-4 h-4 text-[#F5A623]" />
              {lang === 'en' ? 'EN' : 'HI'}
            </button>
            <button
              onClick={handleCopy}
              className={styles.actionBtn}
              title="Copy Summary"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-gray-400" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
            <button
              onClick={handlePrint}
              className={styles.actionBtn}
              title="Print or Export PDF"
            >
              <Printer className="w-4 h-4 text-gray-400" />
              Print
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Sections */}
      <div className={styles.mainContent}>
        {/* Section 1: Executive Summary */}
        <ExecutiveSummary data={reportData} />

        {/* Section 2: Current Phase */}
        <CurrentPhaseCard data={reportData} />

        {/* Section 3: Domain Highlights */}
        <DomainHighlights data={reportData} />

        {/* Section 4: Deep Dive Accordion */}
        <DeepDiveAccordion data={reportData} />
      </div>
    </div>
  );
};

