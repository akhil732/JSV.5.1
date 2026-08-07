import React from 'react';
import { PLANET_SIGNIFICATORS, HOUSE_SIGNIFICATORS } from './rvaData';

export const RVASignificators: React.FC = () => {
  return (
    <div className="bg-ds-surface border-b border-ds-secondary/15 p-4 sm:p-6 space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
        {/* Left Column: Significators - Planet View */}
        <div className="border border-ds-secondary/15 rounded-2xl p-4 bg-ds-surface shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-ds-secondary/10 pb-2 mb-3">
              <h3 className="font-serif font-bold text-ds-secondary text-sm">
                KP Significators — Planet Perspective
              </h3>
              <span className="text-[10px] font-mono font-bold bg-ds-primary/10 text-ds-primary px-2.5 py-0.5 rounded-full">
                4-Fold ABCD Method
              </span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-ds-secondary/10">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-ds-surface-container border-b border-ds-secondary/15 text-ds-secondary font-bold text-[11px]">
                    <th className="py-2 px-3">Planet</th>
                    <th className="py-2 px-3 text-center">(A) Star Bhava</th>
                    <th className="py-2 px-3 text-center">(B) Planet Bhava</th>
                    <th className="py-2 px-3 text-center">(C) Star Houses</th>
                    <th className="py-2 px-3 text-center">(D) Planet Houses</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ds-secondary/10 font-mono">
                  {PLANET_SIGNIFICATORS.map((row) => (
                    <tr key={row.planet} className="hover:bg-ds-surface-container/50 transition-colors">
                      <td className="py-2 px-3 font-serif font-bold text-ds-secondary">{row.planet}</td>
                      <td className="py-2 px-3 text-center text-ds-primary font-bold">{row.a || '—'}</td>
                      <td className="py-2 px-3 text-center text-ds-secondary font-bold">{row.b || '—'}</td>
                      <td className="py-2 px-3 text-center text-ds-on-surface">{row.c || '—'}</td>
                      <td className="py-2 px-3 text-center text-ds-on-surface">{row.d || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="pt-2 border-t border-ds-secondary/10 text-[10.5px] text-ds-on-surface-variant bg-ds-surface-container/60 p-3 rounded-xl font-sans leading-relaxed">
            <strong className="text-ds-primary">(A)</strong> = Star Lord's Occupied Bhava &bull;{' '}
            <strong className="text-ds-secondary">(B)</strong> = Planet's Occupied Bhava &bull;{' '}
            <strong className="text-ds-secondary">(C)</strong> = Star Lord's Owned Houses &bull;{' '}
            <strong className="text-ds-secondary">(D)</strong> = Planet's Owned Houses
          </div>
        </div>

        {/* Right Column: Significators - House View */}
        <div className="border border-ds-secondary/15 rounded-2xl p-4 bg-ds-surface shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-ds-secondary/10 pb-2 mb-3">
            <h3 className="font-serif font-bold text-ds-secondary text-sm">
              KP Significators — House Perspective
            </h3>
            <span className="text-[10px] font-mono font-bold bg-ds-tertiary/20 text-ds-secondary px-2.5 py-0.5 rounded-full">
              Houses I — XII
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-ds-secondary/10">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-ds-surface-container border-b border-ds-secondary/15 text-ds-secondary font-bold text-[11px]">
                  <th className="py-2 px-3 w-20">House</th>
                  <th className="py-2 px-3">Primary Significators (Grade A & B)</th>
                  <th className="py-2 px-3">Secondary Significators (Grade C & D)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ds-secondary/10 font-mono">
                {HOUSE_SIGNIFICATORS.map((row) => (
                  <tr key={row.house} className="hover:bg-ds-surface-container/50 transition-colors">
                    <td className="py-2 px-3 font-serif font-bold text-ds-secondary">{row.house}</td>
                    <td className="py-2 px-3 font-bold text-ds-primary">{row.planets1 || '—'}</td>
                    <td className="py-2 px-3 font-medium text-ds-secondary">{row.planets2 || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
