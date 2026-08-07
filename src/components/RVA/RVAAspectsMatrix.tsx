import React, { useState } from 'react';
import { ASPECT_CELLS_DATA } from './rvaData';

export const RVAAspectsMatrix: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'planet' | 'house' | 'western'>('planet');

  const planetsList = ['Su', 'Mo', 'Ma', 'Me', 'Ju', 'Ve', 'Sa', 'Ra', 'Ke', 'Ur', 'Ne', 'Pl'];

  // Lookup helper for aspect cell
  const getAspect = (rowP: string, colP: string) => {
    return ASPECT_CELLS_DATA.find(
      (a) =>
        (a.rowPlanet === rowP && a.colPlanet === colP) ||
        (a.rowPlanet === colP && a.colPlanet === rowP)
    );
  };

  return (
    <div className="bg-ds-surface border-b border-ds-secondary/15 p-4 sm:p-6 space-y-4">
      {/* Tab Switcher Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-ds-secondary/15 pb-3">
        <div>
          <h2 className="font-serif font-extrabold text-ds-secondary text-base">
            Astrological Aspects Grid Matrix
          </h2>
          <p className="text-xs text-ds-on-surface-variant font-medium mt-0.5">
            Inter-Planetary & House Aspects (Soft vs. Hard Aspects)
          </p>
        </div>

        <div className="flex items-center bg-ds-surface-container border border-ds-secondary/20 p-1 rounded-xl text-xs font-semibold shadow-2xs">
          {[
            { id: 'planet', label: 'Planet Aspects' },
            { id: 'house', label: 'House Aspects' },
            { id: 'western', label: 'Western Orbs' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-ds-secondary text-ds-on-secondary shadow-xs font-bold'
                  : 'text-ds-on-surface-variant hover:text-ds-secondary'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Aspects Grid Table */}
      <div className="overflow-x-auto border border-ds-secondary/15 rounded-2xl bg-ds-surface shadow-xs">
        <table className="w-full text-center border-collapse text-[10px]">
          <thead>
            <tr className="bg-ds-surface-container border-b border-ds-secondary/15 text-ds-secondary font-bold font-mono">
              <th className="p-2.5 border-r border-ds-secondary/15 w-12 bg-ds-surface-variant"></th>
              {planetsList.map((p) => (
                <th key={p} className="p-2.5 border-r border-ds-secondary/15 min-w-[65px] font-serif text-xs">
                  {p}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-ds-secondary/10 font-mono">
            {planetsList.map((rowPlanet, rIdx) => (
              <tr key={rowPlanet} className="hover:bg-ds-surface-container/30 transition-colors">
                <td className="p-2.5 font-serif font-bold text-ds-secondary bg-ds-surface-container/60 border-r border-ds-secondary/15 text-xs">
                  {rowPlanet}
                </td>
                {planetsList.map((colPlanet, cIdx) => {
                  if (rIdx >= cIdx) {
                    // Lower triangle empty
                    return <td key={colPlanet} className="p-2 border-r border-ds-secondary/10 bg-ds-surface-container/20"></td>;
                  }

                  const cell = getAspect(rowPlanet, colPlanet);

                  if (!cell) {
                    return <td key={colPlanet} className="p-2 border-r border-ds-secondary/10"></td>;
                  }

                  return (
                    <td
                      key={colPlanet}
                      className="p-1.5 border-r border-ds-secondary/10 leading-tight"
                    >
                      <div
                        className={`font-bold text-[10px] ${
                          cell.type === 'hard' ? 'text-ds-error-crimson' : 'text-ds-success-green'
                        }`}
                      >
                        {cell.label}
                      </div>
                      <div className="text-[9px] text-ds-on-surface-variant">{cell.angle}</div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-[11px] font-sans text-ds-on-surface-variant bg-ds-surface-container/60 p-2.5 rounded-xl border border-ds-secondary/10">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-ds-success-green" />
          <span>Soft Aspects (Trine, Sextile, Vigintile, Biquintile) — Beneficial Harmony</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-ds-error-crimson" />
          <span>Hard Aspects (Square, Opposition, Conjunction, Semisquare) — Dynamic Tension</span>
        </div>
      </div>
    </div>
  );
};
