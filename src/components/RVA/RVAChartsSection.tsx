import React, { useState } from 'react';
import { DivisionalChart } from '../DivisionalChart';
import { ChartInfo } from '../../types/rva';

interface RVAChartsSectionProps {
  horoscopeData?: any;
  transitReport?: any;
  chartData?: {
    name: string;
    date: string;
    time: string;
    lat: string;
    long: string;
    tz: string;
  };
}

export const RVAChartsSection: React.FC<RVAChartsSectionProps> = ({ chartData, horoscopeData, transitReport }) => {
  const [activeFocus, setActiveFocus] = useState<'all' | 'natal' | 'transit'>('all');

  const baseInfo = chartData || {
    name: 'Test Subject',
    date: '2026-08-04',
    time: '15:53:40',
    lat: '17:23 N',
    long: '78:29 E',
    tz: '5.5',
  };

  const natalInfo: ChartInfo = {
    title: 'D1 - Natal Chart',
    ...baseInfo,
  };

  const progressionInfo: ChartInfo = {
    title: 'Secondary Progression',
    ...baseInfo,
  };

  const transitInfo: ChartInfo = {
    title: 'Gochara Transit',
    ...baseInfo,
  };

  return (
    <div className="space-y-4 p-4 sm:p-6 bg-ds-surface border-b border-ds-secondary/15">
      {/* Section Filter Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-ds-surface-container/60 border border-ds-secondary/15 rounded-2xl p-3 sm:px-4">
        <div>
          <h2 className="font-serif font-bold text-ds-secondary text-base flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-ds-primary" />
            <span>RVA Triple Chart Suite</span>
          </h2>
          <p className="text-xs text-ds-on-surface-variant font-medium mt-0.5">
            Synchronized Natal, Progression & Transit Charts
          </p>
        </div>

        {/* View Filter Segmented Control */}
        <div className="flex items-center bg-ds-surface border border-ds-secondary/20 rounded-xl p-1 text-xs font-semibold shadow-xs">
          {[
            { id: 'all', label: 'All Side-by-Side' },
            { id: 'natal', label: 'Natal Only' },
            { id: 'transit', label: 'Transit Only' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFocus(f.id as any)}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                activeFocus === f.id
                  ? 'bg-ds-secondary text-ds-on-secondary shadow-xs'
                  : 'text-ds-on-surface-variant hover:text-ds-secondary'
               }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Layout */}
      <div
        className={`grid gap-4 sm:gap-6 ${
          activeFocus === 'all'
            ? 'grid-cols-1 md:grid-cols-2'
            : 'grid-cols-1 max-w-xl mx-auto'
        }`}
      >
        {(activeFocus === 'all' || activeFocus === 'natal') && (
          <div className="bg-ds-surface border border-ds-secondary/15 rounded-2xl p-3 sm:p-4 flex flex-col h-full shadow-sm">
            <h3 className="font-serif font-bold text-ds-secondary text-sm mb-3">Natal Chart</h3>
            <DivisionalChart horoscopeData={horoscopeData} />
          </div>
        )}
        {(activeFocus === 'all' || activeFocus === 'transit') && (
          <div className="bg-ds-surface border border-ds-secondary/15 rounded-2xl p-3 sm:p-4 flex flex-col h-full shadow-sm">
            <h3 className="font-serif font-bold text-ds-secondary text-sm mb-3">Transit Chart</h3>
            <DivisionalChart horoscopeData={transitReport || horoscopeData} />
          </div>
        )}
      </div>
    </div>
  );
};
