import React, { useState } from 'react';
import { KPPlanet, PlanetSignificatorLevels, DashaInfo } from '../../types/kp';
import { ChevronDown, ChevronUp, AlertCircle, Sparkles } from 'lucide-react';

interface PlanetSignificatorsTableProps {
  planets: KPPlanet[];
  planetSignificators: Record<string, PlanetSignificatorLevels>;
  currentDasha?: DashaInfo;
}

export const PlanetSignificatorsTable: React.FC<PlanetSignificatorsTableProps> = ({
  planets,
  planetSignificators,
  currentDasha = { mahadasha: 'Mercury', antardasha: 'Venus' }
}) => {
  const [expandedPlanet, setExpandedPlanet] = useState<string | null>(null);

  const getSubLordQuality = (subLordName: string) => {
    if (['Jupiter', 'Venus', 'Mercury', 'Sun'].includes(subLordName)) {
      return { label: 'BENEFIC', style: 'bg-[#27AE60]/10 text-[#27AE60] border-[#27AE60]/20' };
    } else if (['Moon', 'Mars'].includes(subLordName)) {
      return { label: 'MIXED', style: 'bg-[#F39C12]/10 text-[#F39C12] border-[#F39C12]/20' };
    }
    return { label: 'RESTRICTIVE', style: 'bg-[#C0392B]/10 text-[#C0392B] border-[#C0392B]/20' };
  };

  const getDashaStatus = (planetName: string) => {
    if (currentDasha.antardasha === planetName) {
      return { label: '📍 BHUKTI', style: 'bg-ds-primary/15 text-ds-primary border-ds-primary/30' };
    }
    if (currentDasha.mahadasha === planetName) {
      return { label: '⚡ MAHADASHA', style: 'bg-ds-secondary/15 text-ds-secondary border-ds-secondary/30' };
    }
    return { label: '⏳ INACTIVE', style: 'bg-ds-surface-container text-ds-on-surface-variant border-ds-secondary/10' };
  };

  return (
    <div className="bg-ds-surface border border-ds-secondary/15 rounded-ds-xl p-4 sm:p-6 shadow-ds-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-ds-secondary/10 pb-3">
        <div>
          <h3 className="text-base sm:text-lg font-serif font-bold text-ds-secondary flex items-center gap-2">
            <span className="text-ds-primary">🪐</span> KP Planetary Sub Lords & 4-Level Significators
          </h3>
          <p className="text-xs text-ds-on-surface-variant mt-0.5 font-medium">
            L1 (Star Lord of Occupant), L2 (Occupant), L3 (Star Lord of Owner), L4 (Owner)
          </p>
        </div>
        <div className="text-xs font-mono bg-ds-surface-container text-ds-on-surface-variant px-3 py-1.5 rounded-ds-lg border border-ds-secondary/15 font-bold">
          Active: <strong className="text-ds-primary">{currentDasha.mahadasha} MD — {currentDasha.antardasha} AD</strong>
        </div>
      </div>

      {/* Responsive View: Stacked Cards on Mobile (< 640px) */}
      <div className="space-y-3 sm:hidden">
        {planets.map((planet) => {
          const sigs = planetSignificators[planet.name] || { level1: [], level2: [], level3: [], level4: [] };
          const quality = getSubLordQuality(planet.subLord);
          const dashaStatus = getDashaStatus(planet.name);
          const isExpanded = expandedPlanet === planet.name;

          return (
            <div key={planet.name} className="bg-ds-surface-container/60 border border-ds-secondary/15 rounded-xl p-3.5 space-y-3 shadow-2xs">
              <div 
                onClick={() => setExpandedPlanet(isExpanded ? null : planet.name)}
                className="flex items-center justify-between cursor-pointer min-h-[44px]"
              >
                <div className="flex items-center gap-2">
                  <span className="font-bold font-serif text-ds-secondary text-base">{planet.name}</span>
                  {planet.isRetrograde && (
                    <span className="text-[10px] bg-ds-warning-amber/10 text-ds-warning-amber border border-ds-warning-amber/20 px-1.5 py-0.5 rounded font-mono font-bold">
                      Rx
                    </span>
                  )}
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${quality.style}`}>
                    {quality.label}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${dashaStatus.style}`}>
                    {dashaStatus.label}
                  </span>
                  {isExpanded ? <ChevronUp className="w-5 h-5 text-ds-primary" /> : <ChevronDown className="w-5 h-5 text-ds-on-surface-variant" />}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono border-t border-ds-secondary/10 pt-2">
                <div><span className="text-ds-on-surface-variant">Sign:</span> <strong className="text-ds-secondary">{planet.sign}</strong></div>
                <div><span className="text-ds-on-surface-variant">Sub Lord:</span> <strong className="text-ds-primary">{planet.subLord}</strong></div>
                <div><span className="text-ds-on-surface-variant">Sign Lord:</span> <strong className="text-ds-secondary">{planet.signLord}</strong></div>
                <div><span className="text-ds-on-surface-variant">Star Lord:</span> <strong className="text-ds-secondary">{planet.starLord}</strong></div>
              </div>

              <div className="grid grid-cols-4 gap-1 text-center font-mono text-xs pt-1 bg-ds-surface p-2 rounded-lg border border-ds-secondary/10">
                <div><span className="text-[10px] block text-emerald-600 font-bold">L1</span>{sigs.level1.length ? sigs.level1.join(',') : '—'}</div>
                <div><span className="text-[10px] block text-sky-600 font-bold">L2</span>{sigs.level2.length ? sigs.level2.join(',') : '—'}</div>
                <div><span className="text-[10px] block text-purple-600 font-bold">L3</span>{sigs.level3.length ? sigs.level3.join(',') : '—'}</div>
                <div><span className="text-[10px] block text-amber-600 font-bold">L4</span>{sigs.level4.length ? sigs.level4.join(',') : '—'}</div>
              </div>

              {isExpanded && (
                <div className="bg-ds-surface p-3 rounded-lg border border-ds-secondary/15 space-y-2 text-xs animate-in fade-in">
                  <div className="font-bold text-ds-primary">Degree: {planet.formattedDegree} in {planet.sign}</div>
                  <p className="text-[11px] text-ds-on-surface-variant font-medium">
                    Level 1 (Star Lord houses: {sigs.level1.join(', ') || 'None'}), Level 2 (Occupant houses: {sigs.level2.join(', ') || 'None'}), Level 3 (Star Lord owned: {sigs.level3.join(', ') || 'None'}), Level 4 (Owner houses: {sigs.level4.join(', ') || 'None'}).
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Desktop Table View */}
      <div className="hidden sm:block overflow-x-auto rounded-ds-lg border border-ds-secondary/15 max-h-[600px] overflow-y-auto">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className="sticky top-0 z-10">
            <tr className="border-b border-ds-secondary/15 text-ds-on-surface-variant font-bold bg-ds-surface-container uppercase text-[10px] tracking-wider shadow-xs">
              <th className="py-3 px-3 bg-ds-surface-container">Planet</th>
              <th className="py-3 px-3 bg-ds-surface-container">Rashi</th>
              <th className="py-3 px-3 bg-ds-surface-container">Sign Lord</th>
              <th className="py-3 px-3 bg-ds-surface-container">Star Lord</th>
              <th className="py-3 px-3 text-ds-primary bg-ds-surface-container">Sub Lord</th>
              <th className="py-3 px-3 text-center bg-ds-surface-container">Quality</th>
              <th className="py-3 px-3 text-center bg-ds-surface-container">Dasha</th>
              <th className="py-3 px-3 text-center bg-ds-surface-container">L1</th>
              <th className="py-3 px-3 text-center bg-ds-surface-container">L2</th>
              <th className="py-3 px-3 text-center bg-ds-surface-container">L3</th>
              <th className="py-3 px-3 text-center bg-ds-surface-container">L4</th>
              <th className="py-3 px-3 text-center bg-ds-surface-container">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ds-secondary/10 text-ds-on-surface bg-ds-surface">
            {planets.map((planet, index) => {
              const sigs = planetSignificators[planet.name] || { level1: [], level2: [], level3: [], level4: [] };
              const quality = getSubLordQuality(planet.subLord);
              const dashaStatus = getDashaStatus(planet.name);
              const isExpanded = expandedPlanet === planet.name;

              return (
                <React.Fragment key={planet.name}>
                  <tr
                    onClick={() => setExpandedPlanet(isExpanded ? null : planet.name)}
                    className={`hover:bg-ds-surface-container transition-colors cursor-pointer min-h-[44px] ${index % 2 === 1 ? 'bg-ds-surface-container/30' : ''}`}
                  >
                    <td className="py-3 px-3 font-bold text-ds-secondary whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span>{planet.name}</span>
                        {planet.isRetrograde && (
                          <span className="text-[9px] bg-ds-warning-amber/10 text-ds-warning-amber border border-ds-warning-amber/20 px-1.5 py-0.5 rounded font-mono font-bold">
                            Rx
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-ds-on-surface-variant whitespace-nowrap font-medium">{planet.sign}</td>
                    <td className="py-3 px-3 whitespace-nowrap">{planet.signLord}</td>
                    <td className="py-3 px-3 whitespace-nowrap">{planet.starLord}</td>
                    <td className="py-3 px-3 font-bold text-ds-primary bg-ds-primary/5 whitespace-nowrap">{planet.subLord}</td>
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${quality.style}`}>
                        {quality.label}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${dashaStatus.style}`}>
                        {dashaStatus.label}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-emerald-600 dark:text-emerald-400 font-bold whitespace-nowrap">
                      {sigs.level1.length > 0 ? sigs.level1.join(',') : '—'}
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-sky-600 dark:text-sky-400 font-bold whitespace-nowrap">
                      {sigs.level2.length > 0 ? sigs.level2.join(',') : '—'}
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-purple-600 dark:text-purple-400 font-bold whitespace-nowrap">
                      {sigs.level3.length > 0 ? sigs.level3.join(',') : '—'}
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-amber-600 dark:text-amber-400 font-bold whitespace-nowrap">
                      {sigs.level4.length > 0 ? sigs.level4.join(',') : '—'}
                    </td>
                    <td className="py-3 px-3 text-center text-ds-on-surface-variant whitespace-nowrap">
                      <span className="p-2 inline-flex items-center justify-center">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </span>
                    </td>
                  </tr>

                  {/* Expandable Detail Drawer */}
                  {isExpanded && (
                    <tr className="bg-ds-surface-container border-b border-ds-secondary/15">
                      <td colSpan={12} className="p-4 space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ds-secondary/10 pb-2">
                          <span className="font-bold text-ds-primary flex items-center gap-1.5">
                            <Sparkles className="w-4 h-4" /> 4-Level Significator Analysis for {planet.name}
                          </span>
                          <span className="text-[11px] text-ds-on-surface-variant font-medium">
                            Degree: <strong className="text-ds-secondary font-mono">{planet.formattedDegree}</strong> in {planet.sign}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                          {[
                            { label: 'Level 1 (Strongest)', houses: sigs.level1, color: 'emerald', desc: 'Houses occupied by star lord' },
                            { label: 'Level 2 (Strong)', houses: sigs.level2, color: 'sky', desc: 'House directly occupied' },
                            { label: 'Level 3 (Moderate)', houses: sigs.level3, color: 'purple', desc: 'Houses owned by star lord' },
                            { label: 'Level 4 (Secondary)', houses: sigs.level4, color: 'amber', desc: 'Houses owned directly' },
                          ].map((l, i) => (
                            <div key={i} className="bg-ds-surface p-3 rounded-xl border border-ds-secondary/15 shadow-2xs">
                              <span className={`font-bold text-${l.color}-600 dark:text-${l.color}-400 block mb-1`}>{l.label}</span>
                              <span className="text-ds-on-surface-variant font-medium">{l.desc}:</span>
                              <div className={`font-mono text-${l.color}-600 dark:text-${l.color}-400 font-bold mt-1 text-sm`}>
                                {l.houses.length > 0 ? `[${l.houses.join(', ')}]` : 'None'}
                              </div>
                            </div>
                          ))}
                        </div>

                        {(planet.isRetrograde || planet.isCombust) && (
                          <div className="bg-[#F39C12]/5 border border-[#F39C12]/20 p-2.5 rounded-lg text-[#F39C12] text-xs flex items-center gap-2 font-medium">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <span>
                              <strong>Astronomical Modification:</strong> {planet.name}{' '}
                              {planet.isRetrograde ? 'is in Retrograde' : ''}
                              {planet.isCombust ? ' & is Combust' : ''}. In KP methodology, sub-lord significations are retained, but timing activation requires careful transit confirmation.
                            </span>
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
