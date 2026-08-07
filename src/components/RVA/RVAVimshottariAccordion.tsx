import React, { useState } from 'react';
import { Plus, Minus, Clock, Calendar } from 'lucide-react';
import { VIMSHOTTARI_DASHA_PERIODS } from './rvaData';
import { getFullDashaTimeline, getAntardashasForMd } from '../../lib/engines/DashaEngine';

interface RVAVimshottariAccordionProps {
  horoscopeReport?: any;
  birthDateStr?: string;
}

const formatDateDMY = (date: Date): string => {
  const d = date.getDate();
  const m = date.getMonth() + 1;
  const y = date.getFullYear();
  return `${d.toString().padStart(2, '0')}-${m.toString().padStart(2, '0')}-${y}`;
};

export const RVAVimshottariAccordion: React.FC<RVAVimshottariAccordionProps> = ({
  horoscopeReport,
  birthDateStr,
}) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0); // Mercury open by default

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  let periods = VIMSHOTTARI_DASHA_PERIODS;
  if (horoscopeReport) {
    const timeline = getFullDashaTimeline(horoscopeReport, birthDateStr || '1996-11-11');
    periods = timeline.map((m) => ({
      planet: m.lord,
      startDate: formatDateDMY(m.startDate),
      endDate: formatDateDMY(m.endDate),
    }));
  }

  const getDynamicAntardashas = (planet: string) => {
    if (!horoscopeReport) {
      // Mock antardashas for fallback
      return [
        { planet, subPlanet: planet, start: '13-10-2013', end: '08-03-2016' },
        { planet, subPlanet: 'Ketu', start: '08-03-2016', end: '06-03-2017' },
        { planet, subPlanet: 'Venus', start: '06-03-2017', end: '05-01-2020' },
        { planet, subPlanet: 'Sun', start: '05-01-2020', end: '11-11-2020' },
        { planet, subPlanet: 'Moon', start: '11-11-2020', end: '12-04-2022' },
        { planet, subPlanet: 'Mars', start: '12-04-2022', end: '09-04-2023' },
      ];
    }
    const ads = getAntardashasForMd(horoscopeReport, birthDateStr || '1996-11-11', planet);
    return ads.map((ad) => ({
      planet,
      subPlanet: ad.lord,
      start: formatDateDMY(ad.startDate),
      end: formatDateDMY(ad.endDate),
    }));
  };

  return (
    <div className="bg-ds-surface border-b border-ds-secondary/15 p-4 sm:p-6 space-y-4">
      {/* Section Title Header Bar */}
      <div className="flex items-center justify-between border-b border-ds-secondary/15 pb-3">
        <div>
          <h2 className="font-serif font-extrabold text-ds-secondary text-base flex items-center gap-2">
            <Clock className="w-4 h-4 text-ds-primary" />
            <span>Vimshottari Dasha Hierarchy (120-Year Cycle)</span>
          </h2>
          <p className="text-xs text-ds-on-surface-variant font-medium mt-0.5">
            Mahadasha & Antardasha Time Windows
          </p>
        </div>
        <span className="text-[10px] font-mono font-bold bg-ds-primary/10 text-ds-primary border border-ds-primary/20 px-3 py-1 rounded-full">
          Nakshatra Dasha System
        </span>
      </div>

      {/* Accordion List */}
      <div className="space-y-2 text-xs">
        {periods.map((item, idx) => {
          const isOpen = openIndex === idx;
          const antardashas = isOpen ? getDynamicAntardashas(item.planet) : [];
          return (
            <div
              key={idx}
              className={`border rounded-2xl overflow-hidden transition-all shadow-2xs ${
                isOpen
                  ? 'border-ds-primary/40 bg-ds-surface'
                  : 'border-ds-secondary/15 bg-ds-surface hover:border-ds-secondary/30'
              }`}
            >
              <button
                onClick={() => toggleAccordion(idx)}
                className="w-full px-4 py-3 flex items-center justify-between text-left bg-ds-surface-container/50 hover:bg-ds-surface-container transition-colors cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs transition-colors ${
                    isOpen ? 'bg-ds-primary text-white' : 'bg-ds-surface border border-ds-secondary/20 text-ds-secondary'
                  }`}>
                    {isOpen ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                  </div>
                  <div>
                    <span className="font-serif font-bold text-ds-secondary text-sm">
                      {item.planet} Mahadasha
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 font-mono text-xs text-ds-on-surface-variant font-medium">
                  <Calendar className="w-3.5 h-3.5 text-ds-primary" />
                  <span>{item.startDate} &rarr; {item.endDate}</span>
                </div>
              </button>

              {isOpen && (
                <div className="p-4 bg-ds-surface border-t border-ds-secondary/10 space-y-3">
                  <div className="font-serif font-bold text-xs text-ds-primary flex items-center justify-between border-b border-ds-secondary/10 pb-1.5">
                    <span>Antardasha Breakdown for {item.planet}</span>
                    <span className="font-mono text-[10px] text-ds-on-surface-variant">9 Sub-periods</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
                    {antardashas.map((ad, adIdx) => (
                      <div key={adIdx} className="bg-ds-surface-container/60 p-3 rounded-xl border border-ds-secondary/10 space-y-1">
                        <div className="font-serif font-bold text-ds-secondary">
                          {ad.planet} — {ad.subPlanet}
                        </div>
                        <div className="text-[11px] text-ds-primary font-bold">
                          {ad.start} &rarr; {ad.end}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
