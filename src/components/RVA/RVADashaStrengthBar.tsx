import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, RotateCcw, Sparkles, ShieldCheck, HelpCircle } from 'lucide-react';
import { PLANET_STRENGTHS } from './rvaData';
import { calculateActiveDasha } from '../../lib/engines/DashaEngine';

interface RVADashaStrengthBarProps {
  horoscopeReport?: any;
  birthDateStr?: string;
}

export const RVADashaStrengthBar: React.FC<RVADashaStrengthBarProps> = ({
  horoscopeReport,
  birthDateStr,
}) => {
  const [alanLeo, setAlanLeo] = useState(false);

  let activeMd = "Mercury";
  let mdYears = "(2014 — 2030 • 17 Years)";
  let activeAd = "Jupiter";
  let startYear = 2014;
  let endYear = 2030;
  let percentComplete = 72; // Default mock slider percentage

  if (horoscopeReport) {
    const dashaData = calculateActiveDasha(horoscopeReport, birthDateStr || "1996-11-11", new Date("2026-07-20"));
    if (dashaData && dashaData.mahadasha && dashaData.antardasha) {
      activeMd = dashaData.mahadasha.lord;
      activeAd = dashaData.antardasha.lord;
      startYear = dashaData.mahadasha.startDate.getFullYear();
      endYear = dashaData.mahadasha.endDate.getFullYear();
      mdYears = `(${startYear} — ${endYear} • ${Math.round(dashaData.mahadasha.totalDuration)} Years)`;
      percentComplete = Math.round(dashaData.mahadasha.percentComplete);
    }
  }

  return (
    <div className="bg-ds-surface border-b border-ds-secondary/15 p-4 sm:p-6 space-y-4">
      {/* Top Header & Mahadasha Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 bg-ds-surface-container/60 border border-ds-secondary/15 rounded-2xl p-3.5 sm:px-5">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Navigation controls */}
          <div className="flex items-center space-x-1">
            <button className="p-1.5 border border-ds-secondary/20 rounded-lg hover:bg-ds-surface text-ds-secondary transition-all cursor-pointer">
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
            <button className="p-1.5 border border-ds-secondary/20 rounded-lg hover:bg-ds-surface text-ds-secondary transition-all cursor-pointer">
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button className="p-1.5 border border-ds-secondary/20 rounded-lg hover:bg-ds-surface text-ds-secondary transition-all cursor-pointer">
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Active Dasha Title */}
          <div className="text-xs text-ds-on-surface">
            <span className="font-serif font-extrabold text-ds-secondary text-sm">
              {activeMd} Mahadasha
            </span>{' '}
            <span className="text-ds-on-surface-variant font-mono text-xs">{mdYears}</span>
            <span className="text-ds-secondary/20 mx-2">|</span>
            <span className="text-ds-on-surface-variant font-medium">Dasha Influencer: </span>
            <strong className="text-ds-primary font-bold">{activeAd}</strong>{' '}
            <span className="text-ds-on-surface-variant text-[11px]">(Active Bhukti)</span>
            <span className="text-ds-secondary/20 mx-2">|</span>
            <span className="text-ds-on-surface-variant font-medium">Strongest Planet: </span>
            <strong className="text-ds-success-green font-bold">Mercury (94)</strong>
          </div>
        </div>

        {/* Big Overall Dasha Score Badge */}
        <div className="flex items-center gap-2 bg-ds-success-green/10 border border-ds-success-green/30 px-3.5 py-1.5 rounded-xl">
          <span className="text-xs font-serif font-bold text-ds-secondary">Overall Dasha Score:</span>
          <span className="font-mono font-extrabold text-base text-ds-success-green">94 / 100</span>
        </div>
      </div>

      {/* Planetary Strengths Row + Saturn Specific Card */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Planet Chips Grid */}
        <div className="flex flex-wrap items-center gap-2">
          {PLANET_STRENGTHS.map((planet) => (
            <div
              key={planet.code}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-ds-surface border border-ds-secondary/15 rounded-full shadow-2xs hover:border-ds-primary/40 transition-all"
            >
              <span className="text-ds-secondary text-xs">{planet.symbol}</span>
              <span className="font-bold text-xs text-ds-secondary">{planet.name}</span>
              <span className={`font-mono font-extrabold text-xs ${planet.textColor}`}>
                {planet.score}
              </span>
            </div>
          ))}
        </div>

        {/* Saturn R4 Specific Focus Card */}
        <div className="bg-ds-surface-variant border border-ds-secondary/20 rounded-2xl p-3 text-xs flex items-center justify-between gap-4 text-ds-secondary shadow-2xs">
          <div className="flex items-center space-x-2">
            <span className="w-7 h-7 rounded-lg bg-ds-secondary text-ds-on-secondary flex items-center justify-center font-bold text-sm">
              ♄
            </span>
            <div>
              <div className="font-serif font-bold text-xs text-ds-secondary flex items-center gap-1.5">
                <span>Saturn Phase</span>
                <span className="bg-ds-primary text-white font-mono font-bold text-[10px] px-1.5 py-0.5 rounded-md">
                  86 R4
                </span>
              </div>
              <div className="text-[10px] text-ds-on-surface-variant font-mono">
                02 Feb 2028 — 13 Oct 2030
              </div>
            </div>
          </div>
          <div className="text-[10px] text-ds-on-surface-variant border-l border-ds-secondary/15 pl-3 font-medium">
            <div>DI: Jupiter (8-8 H-8)</div>
            <div className="text-ds-primary font-bold">Strongest: Jupiter</div>
          </div>
        </div>
      </div>

      {/* Interactive Dasha Timeline Slider */}
      <div className="space-y-1.5 pt-1">
        <div className="relative h-2.5 bg-ds-surface-container rounded-full overflow-hidden border border-ds-secondary/10">
          <div className="absolute left-0 top-0 bottom-0 sacred-gradient rounded-full" style={{ width: `${percentComplete}%` }} />
          {/* Active Slider Thumb */}
          <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-ds-surface border-2 border-ds-primary rounded-full shadow-md cursor-pointer hover:scale-110 transition-transform" style={{ left: `calc(${percentComplete}% - 8px)` }} />
        </div>
        <div className="flex justify-between text-[10px] font-mono text-ds-on-surface-variant px-1">
          <span>{startYear}</span>
          <span>{startYear + Math.round((endYear - startYear) * 0.25)}</span>
          <span>{startYear + Math.round((endYear - startYear) * 0.5)}</span>
          <span>{startYear + Math.round((endYear - startYear) * 0.75)}</span>
          <span className="text-ds-primary font-bold">2026 (Now: {percentComplete}%)</span>
          <span>{endYear}</span>
        </div>
      </div>

      {/* Bottom Toggle Bar: Alan Leo Analysis Mode */}
      <div className="flex items-center justify-between text-xs pt-2 border-t border-ds-secondary/10">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-ds-primary" />
          <span className="font-serif font-bold text-ds-secondary">Alan Leo Classical Analysis Rules</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setAlanLeo(!alanLeo)}
            className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${
              alanLeo ? 'bg-ds-primary justify-end' : 'bg-ds-surface-container justify-start border border-ds-secondary/20'
            }`}
          >
            <div className="w-4 h-4 bg-white rounded-full shadow-md" />
          </button>
          <span className="text-[11px] font-bold text-ds-secondary">
            {alanLeo ? 'Enabled' : 'Disabled'}
          </span>
        </div>
      </div>
    </div>
  );
};
