import React, { useState } from 'react';
import { KPHouse } from '../../types/kp';
import { Info, HelpCircle } from 'lucide-react';

interface CuspTableProps {
  houses: KPHouse[];
}

const HOUSE_MEANINGS: Record<number, { title: string; meaning: string }> = {
  1: { title: 'Self / Health', meaning: 'Personality, vitality, longevity, general success' },
  2: { title: 'Wealth / Family', meaning: 'Financial accumulation, speech, family assets' },
  3: { title: 'Courage / Travel', meaning: 'Communication, siblings, short journeys, effort' },
  4: { title: 'Home / Property', meaning: 'Mother, land, vehicles, education, comforts' },
  5: { title: 'Children / Wisdom', meaning: 'Progeny, intelligence, speculation, romance' },
  6: { title: 'Service / Health', meaning: 'Litigation, debts, diseases, competitive success' },
  7: { title: 'Marriage / Union', meaning: 'Spouse, business partnerships, legal contracts' },
  8: { title: 'Transformation', meaning: 'Longevity, legacy, unexpected gains, research' },
  9: { title: 'Luck / Religion', meaning: 'Father, higher learning, pilgrimages, long travel' },
  10: { title: 'Career / Status', meaning: 'Profession, government honor, public prestige' },
  11: { title: 'Gains / Desires', meaning: 'Fulfillment of hopes, profits, elder siblings' },
  12: { title: 'Expenses / Foreign', meaning: 'Foreign travel, confinement, isolation, salvation' },
};

export const CuspTable: React.FC<CuspTableProps> = ({ houses }) => {
  const [showExplanation, setShowExplanation] = useState(false);

  return (
    <div className="bg-ds-surface border border-ds-secondary/15 rounded-ds-xl p-4 sm:p-6 shadow-ds-sm space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-ds-secondary/10 pb-3">
        <div>
          <h3 className="text-base sm:text-lg font-serif font-bold text-ds-secondary flex items-center gap-2">
            <span className="text-ds-primary">🏛️</span> Placidus House Cusps & CSL Gatekeeper
          </h3>
          <p className="text-xs text-ds-on-surface-variant mt-0.5 font-medium">
            Prof. K.S. Krishnamurti Paddhati Cusp Sub Lord (CSL) Gatekeeper Status
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowExplanation(!showExplanation)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-ds-md bg-ds-primary/10 hover:bg-ds-primary/20 border border-ds-primary/30 text-ds-primary text-xs font-bold transition-all cursor-pointer focus-ring"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            {showExplanation ? 'Hide Rule' : 'Gatekeeper Rule'}
          </button>
          <span className="text-xs font-mono bg-ds-surface-container text-ds-secondary px-2.5 py-1 rounded-ds-full border border-ds-secondary/15 font-bold">
            12 Cusps
          </span>
        </div>
      </div>

      {/* Gatekeeper Explanatory Banner */}
      {showExplanation && (
        <div className="bg-ds-surface-container border border-ds-primary/30 rounded-ds-lg p-4 space-y-2 text-xs text-ds-on-surface-variant animate-in fade-in duration-200 shadow-ds-sm">
          <div className="flex items-center gap-2 font-bold text-ds-primary">
            <Info className="w-4 h-4" />
            <span>Understanding the Cusp Sub-Lord Gatekeeper Rule</span>
          </div>
          <p className="leading-relaxed font-medium">
            In KP Astrology, the <strong>Cusp Sub Lord (CSL)</strong> acts as the final arbiter (gatekeeper) for any house event:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
            <div className="bg-ds-success-green/10 border border-ds-success-green/20 p-2.5 rounded-ds-md text-ds-success-green">
              <strong className="block mb-1">✅ GATE OPEN (YES)</strong>
              Sub lord signifies benefic houses (1, 2, 4, 5, 7, 9, 10, 11). Event is promised.
            </div>
            <div className="bg-ds-warning-amber/10 border border-ds-warning-amber/20 p-2.5 rounded-ds-md text-ds-warning-amber">
              <strong className="block mb-1">⚠️ GATE DELAYED</strong>
              Sub lord signifies mixed influences. Event promises with obstacles/delay.
            </div>
            <div className="bg-ds-error-crimson/10 border border-ds-error-crimson/20 p-2.5 rounded-ds-md text-ds-error-crimson">
              <strong className="block mb-1">❌ GATE CLOSED (NO)</strong>
              Sub lord signifies malefic/denial houses (6, 8, 12).
            </div>
          </div>
        </div>
      )}

      {/* Responsive View: Stacked Cards on Mobile (< 640px), Table on Desktop (>= 640px) */}
      <div className="space-y-3 sm:hidden">
        {houses.map((house) => {
          const info = HOUSE_MEANINGS[house.number] || { title: `House ${house.number}`, meaning: '' };
          const isMaleficSub = ['Saturn', 'Rahu', 'Ketu'].includes(house.subLord);
          const promise = house.promise || (isMaleficSub ? 'DELAYED' : 'YES');

          return (
            <div key={house.number} className="bg-ds-surface-container/60 border border-ds-secondary/15 rounded-xl p-3.5 space-y-2.5 shadow-2xs">
              <div className="flex items-center justify-between border-b border-ds-secondary/10 pb-2">
                <span className="font-bold font-mono text-ds-primary text-sm">
                  House {house.number} — {info.title}
                </span>
                <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                  promise === 'YES'
                    ? 'bg-ds-success-green/10 text-ds-success-green border-ds-success-green/20'
                    : promise === 'DELAYED'
                    ? 'bg-ds-warning-amber/10 text-ds-warning-amber border-ds-warning-amber/20'
                    : 'bg-ds-error-crimson/10 text-ds-error-crimson border-ds-error-crimson/20'
                }`}>
                  {promise === 'YES' ? '✅ OPEN' : promise === 'DELAYED' ? '⚠️ DELAYED' : '❌ CLOSED'}
                </span>
              </div>
              <p className="text-[11px] text-ds-on-surface-variant font-medium">{info.meaning}</p>
              <div className="grid grid-cols-2 gap-2 text-xs pt-1 font-mono">
                <div><span className="text-ds-on-surface-variant">Sign:</span> <strong className="text-ds-secondary">{house.sign} ({house.formattedDegree})</strong></div>
                <div><span className="text-ds-on-surface-variant">Sign Lord:</span> <strong className="text-ds-secondary">{house.signLord}</strong></div>
                <div><span className="text-ds-on-surface-variant">Star Lord:</span> <strong className="text-ds-secondary">{house.starLord}</strong></div>
                <div><span className="text-ds-on-surface-variant">Sub Lord:</span> <strong className="text-ds-primary bg-ds-primary/10 px-1.5 py-0.5 rounded">{house.subLord}</strong></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop Table View */}
      <div className="hidden sm:block overflow-x-auto rounded-ds-lg border border-ds-secondary/15 max-h-[600px] overflow-y-auto">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className="sticky top-0 z-10">
            <tr className="border-b border-ds-secondary/15 text-ds-on-surface-variant font-bold bg-ds-surface-container uppercase text-[10px] tracking-wider shadow-xs">
              <th className="py-3 px-4 bg-ds-surface-container">House</th>
              <th className="py-3 px-4 bg-ds-surface-container">Life Domain</th>
              <th className="py-3 px-4 bg-ds-surface-container">Sign</th>
              <th className="py-3 px-4 bg-ds-surface-container">Degree</th>
              <th className="py-3 px-4 bg-ds-surface-container">Sign Lord</th>
              <th className="py-3 px-4 bg-ds-surface-container">Star Lord</th>
              <th className="py-3 px-4 text-ds-primary bg-ds-surface-container">Sub Lord</th>
              <th className="py-3 px-4 bg-ds-surface-container">Sub-Sub</th>
              <th className="py-3 px-4 text-center bg-ds-surface-container">Gatekeeper</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ds-secondary/10 bg-ds-surface text-ds-on-surface">
            {houses.map((house, index) => {
              const info = HOUSE_MEANINGS[house.number] || { title: `House ${house.number}`, meaning: '' };
              const isMaleficSub = ['Saturn', 'Rahu', 'Ketu'].includes(house.subLord);
              const promise = house.promise || (isMaleficSub ? 'DELAYED' : 'YES');

              return (
                <tr key={house.number} className={`hover:bg-ds-surface-container transition-colors ${index % 2 === 1 ? 'bg-ds-surface-container/30' : ''}`}>
                  <td className="py-3 px-4 font-bold font-mono text-ds-primary whitespace-nowrap">
                    House {house.number}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-ds-secondary block">{info.title}</span>
                    <span className="text-[10px] text-ds-on-surface-variant block line-clamp-1 font-medium">{info.meaning}</span>
                  </td>
                  <td className="py-3 px-4 font-semibold whitespace-nowrap">{house.sign}</td>
                  <td className="py-3 px-4 font-mono text-ds-on-surface-variant font-bold whitespace-nowrap">{house.formattedDegree}</td>
                  <td className="py-3 px-4 whitespace-nowrap">{house.signLord}</td>
                  <td className="py-3 px-4 whitespace-nowrap">{house.starLord}</td>
                  <td className="py-3 px-4 font-bold text-ds-primary bg-ds-primary/10 whitespace-nowrap">
                    {house.subLord}
                  </td>
                  <td className="py-3 px-4 text-ds-on-surface-variant whitespace-nowrap">{house.subSubLord || '—'}</td>
                  <td className="py-3 px-4 text-center whitespace-nowrap">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                      promise === 'YES'
                        ? 'bg-ds-success-green/10 text-ds-success-green border-ds-success-green/20'
                        : promise === 'DELAYED'
                        ? 'bg-ds-warning-amber/10 text-ds-warning-amber border-ds-warning-amber/20'
                        : 'bg-ds-error-crimson/10 text-ds-error-crimson border-ds-error-crimson/20'
                    }`}>
                      {promise === 'YES' ? '✅ OPEN' : promise === 'DELAYED' ? '⚠️ DELAYED' : '❌ CLOSED'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
