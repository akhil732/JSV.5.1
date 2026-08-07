import React, { useState } from 'react';
import { PLANETS_ANALYSIS_DATA, HOUSE_ANALYSIS_DATA } from './rvaData';

interface RVAPlanetsHouseAnalysisProps {
  horoscopeReport?: any;
}

export const RVAPlanetsHouseAnalysis: React.FC<RVAPlanetsHouseAnalysisProps> = ({
  horoscopeReport,
}) => {
  const [sectionEnabled, setSectionEnabled] = useState(true);
  const [selectedRule, setSelectedRule] = useState('Rule 4');
  const [selectedScale, setSelectedScale] = useState('60 yr');

  // Score color helper
  const getScoreColor = (val: number) => {
    if (val >= 80) return 'text-ds-success-green font-bold';
    if (val >= 70) return 'text-ds-primary font-bold';
    if (val >= 50) return 'text-ds-warning-amber font-semibold';
    return 'text-ds-error-crimson font-bold';
  };

  let lagnaSign = "Sagittarius";
  if (horoscopeReport) {
    lagnaSign = horoscopeReport?.horoscope?.divisional_charts?.["D-1_rasi"]?.Ascendant?.sign || "Sagittarius";
  }

  return (
    <div className="bg-ds-surface border-b border-ds-secondary/15 p-4 sm:p-6 space-y-4">
      {/* Top Header Toggle Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-ds-secondary/15">
        <h2 className="font-serif font-extrabold text-ds-secondary text-base flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-ds-primary" />
          Planets & House Strength Analysis
        </h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setSectionEnabled(!sectionEnabled)}
            className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${
              sectionEnabled ? 'bg-ds-success-green justify-end' : 'bg-ds-surface-container justify-start border border-ds-secondary/20'
            }`}
          >
            <div className="w-4 h-4 bg-white rounded-full shadow-xs" />
          </button>
          <span className="text-xs font-bold text-ds-secondary">
            {sectionEnabled ? 'Enabled' : 'Disabled'}
          </span>
        </div>
      </div>

      {sectionEnabled && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
          {/* Left Column: Planets Analysis */}
          <div className="border border-ds-secondary/15 rounded-2xl p-4 bg-ds-surface shadow-xs flex flex-col justify-between space-y-4">
            <div>
              {/* Header Controls */}
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div className="flex items-center space-x-2">
                  <span className="font-serif font-bold text-ds-secondary text-sm">
                    Planets Analysis
                  </span>
                  <select
                    value={selectedRule}
                    onChange={(e) => setSelectedRule(e.target.value)}
                    className="border border-ds-secondary/20 rounded-lg px-2 py-0.5 text-xs bg-ds-surface-container text-ds-secondary font-medium"
                  >
                    <option>Rule 4</option>
                    <option>Rule 1</option>
                  </select>
                  <select
                    value={selectedScale}
                    onChange={(e) => setSelectedScale(e.target.value)}
                    className="border border-ds-secondary/20 rounded-lg px-2 py-0.5 text-xs bg-ds-surface-container text-ds-secondary font-medium"
                  >
                    <option>60 yr</option>
                    <option>120 yr</option>
                  </select>
                </div>
                <span className="px-2.5 py-0.5 bg-ds-primary/10 border border-ds-primary/20 text-ds-primary text-[11px] font-bold rounded-full font-mono">
                  Lagna: {lagnaSign}
                </span>
              </div>

              {/* Table */}
              <div className="overflow-x-auto rounded-xl border border-ds-secondary/10">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-ds-surface-container border-b border-ds-secondary/15 text-ds-on-surface-variant font-bold text-[11px]">
                      <th className="py-2 px-2.5">Planet</th>
                      <th className="py-2 px-2.5 text-center">Light</th>
                      <th className="py-2 px-2.5 text-center">Perf.</th>
                      <th className="py-2 px-2.5 text-center">Resource</th>
                      <th className="py-2 px-2.5 text-center">Capacity</th>
                      <th className="py-2 px-2.5 text-center">SL & Inf</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ds-secondary/10 font-mono">
                    {PLANETS_ANALYSIS_DATA.map((row) => (
                      <tr key={row.planet} className="hover:bg-ds-surface-container/50 transition-colors">
                        <td className="py-2 px-2.5 font-serif font-bold text-ds-secondary">{row.planet}</td>
                        <td className={`py-2 px-2.5 text-center ${getScoreColor(row.light)}`}>
                          {row.light}%
                        </td>
                        <td className={`py-2 px-2.5 text-center ${getScoreColor(row.perf)}`}>
                          {row.perf}
                        </td>
                        <td className={`py-2 px-2.5 text-center ${getScoreColor(row.resource)}`}>
                          {row.resource}
                        </td>
                        <td className="py-2 px-2.5 text-center">
                          {row.isCustomCapacity ? (
                            <span className="text-xs">
                              <span className="text-ds-error-crimson font-bold">
                                {String(row.capacity).split('/')[0]}
                              </span>
                              <span className="text-ds-on-surface-variant/40 mx-0.5">/</span>
                              <span className="text-ds-success-green font-bold">
                                {String(row.capacity).split('/')[1]}
                              </span>
                            </span>
                          ) : (
                            <span className={getScoreColor(Number(row.capacity))}>
                              {row.capacity}
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-2.5 text-center font-sans font-bold text-ds-secondary">
                          {row.slInf}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer Summary */}
            <div className="pt-2 border-t border-ds-secondary/10 text-[11px] text-ds-on-surface-variant leading-relaxed space-y-1 bg-ds-surface-container/60 p-3 rounded-xl font-sans">
              <div>
                <strong className="text-ds-success-green">Best Light:</strong> Sun, Moon, Mercury, Venus, Ketu (100%){' '}
                <span className="text-ds-secondary/20 mx-1">|</span>{' '}
                <strong className="text-ds-success-green">Top Performance:</strong> Rahu (93), Jupiter (92), Mercury (91){' '}
                <span className="text-ds-secondary/20 mx-1">|</span>{' '}
                <strong className="text-ds-success-green">Top Capacity:</strong> Mercury (94), Sun (85)
              </div>
              <div>
                <strong className="text-ds-error-crimson">Weak Light:</strong> Saturn (30%){' '}
                <span className="text-ds-secondary/20 mx-1">|</span>{' '}
                <strong className="text-ds-error-crimson">Weak Capacity:</strong> Saturn (36)
              </div>
            </div>
          </div>

          {/* Right Column: House Analysis */}
          <div className="border border-ds-secondary/15 rounded-2xl p-4 bg-ds-surface shadow-xs flex flex-col justify-between space-y-4">
            <div>
              {/* Header Controls */}
              <div className="flex items-center justify-between mb-3">
                <span className="font-serif font-bold text-ds-secondary text-sm">
                  House Analysis (Bhava Strengths)
                </span>
                <select
                  value={selectedScale}
                  onChange={(e) => setSelectedScale(e.target.value)}
                  className="border border-ds-secondary/20 rounded-lg px-2 py-0.5 text-xs bg-ds-surface-container text-ds-secondary font-medium"
                >
                  <option>60 yr</option>
                  <option>120 yr</option>
                </select>
              </div>

              {/* Table */}
              <div className="overflow-x-auto rounded-xl border border-ds-secondary/10">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-ds-surface-container border-b border-ds-secondary/15 text-ds-on-surface-variant font-bold text-[11px]">
                      <th className="py-2 px-2.5">House</th>
                      <th className="py-2 px-2.5">Occupant Score</th>
                      <th className="py-2 px-2.5">Lord Score</th>
                      <th className="py-2 px-2.5">Karaka Score</th>
                      <th className="py-2 px-2.5 font-serif font-bold text-ds-secondary">Total Bhava Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ds-secondary/10 font-mono">
                    {HOUSE_ANALYSIS_DATA.map((row) => (
                      <tr key={row.houseNum} className="hover:bg-ds-surface-container/50 transition-colors">
                        <td className="py-2 px-2.5 font-serif font-bold text-ds-secondary">H{row.houseNum}</td>
                        <td className="py-2 px-2.5 font-medium text-ds-success-green">{row.occupant}</td>
                        <td className="py-2 px-2.5 text-ds-on-surface">{row.lord}</td>
                        <td className="py-2 px-2.5 text-ds-on-surface">{row.karaka}</td>
                        <td className="py-2 px-2.5 font-bold text-ds-primary">{row.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer Summary */}
            <div className="pt-2 border-t border-ds-secondary/10 text-[11px] text-ds-on-surface-variant bg-ds-surface-container/60 p-3 rounded-xl flex items-center justify-between font-sans">
              <div>
                <strong className="text-ds-success-green font-bold">Strongest House:</strong> House 3 (102.0) &bull; House 7 (90.0)
              </div>
              <div>
                <strong className="text-ds-error-crimson font-bold">Weakest House:</strong> House 8 (64.0)
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
