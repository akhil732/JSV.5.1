import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Info, Sparkles, TrendingUp, Award, Calendar, Layers } from 'lucide-react';
import { TRANSIT_GRAPH_DATA } from './rvaData';

export const RVAAshtakavargaChart: React.FC = () => {
  const [viewMode, setViewMode] = useState<'Day' | 'Week' | 'Month'>('Month');
  const [enabled, setEnabled] = useState(true);
  const [selectedYear, setSelectedYear] = useState('2026');

  const [planets, setPlanets] = useState({
    Sun: true,
    Moon: true,
    Mars: true,
    Mercury: true,
    Jupiter: true,
    Venus: true,
    Saturn: true,
  });

  const togglePlanet = (planet: keyof typeof planets) => {
    setPlanets((prev) => ({ ...prev, [planet]: !prev[planet] }));
  };

  return (
    <div className="bg-ds-surface border-b border-ds-secondary/15 p-4 sm:p-6 space-y-4">
      {/* Top Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-ds-secondary/15">
        <div>
          <h2 className="font-serif font-extrabold text-ds-secondary text-base flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-ds-primary" />
            <span>Ashtakavarga Transit Strength Timeline</span>
          </h2>
          <p className="text-xs text-ds-on-surface-variant font-medium mt-0.5">
            Dynamic Binnashtakavarga & Sarvashtakavarga Transit Points
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          {/* Year selector boxes */}
          <div className="flex items-center space-x-1 bg-ds-surface-container border border-ds-secondary/20 p-0.5 rounded-xl">
            {['2026', '2027'].map((yr) => (
              <button
                key={yr}
                onClick={() => setSelectedYear(yr)}
                className={`px-2.5 py-1 rounded-lg font-mono text-xs font-bold transition-all cursor-pointer ${
                  selectedYear === yr
                    ? 'bg-ds-secondary text-ds-on-secondary shadow-xs'
                    : 'text-ds-on-surface-variant hover:text-ds-secondary'
                }`}
              >
                {yr}
              </button>
            ))}
          </div>

          {/* Day / Week / Month Mode Segmented Control */}
          <div className="flex items-center bg-ds-surface-container p-0.5 rounded-xl border border-ds-secondary/20 text-xs font-semibold">
            {(['Day', 'Week', 'Month'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  viewMode === mode
                    ? 'bg-ds-primary text-white shadow-xs'
                    : 'text-ds-on-surface-variant hover:text-ds-secondary'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          {/* Enable Toggle */}
          <div className="flex items-center space-x-2 pl-2 border-l border-ds-secondary/15">
            <button
              onClick={() => setEnabled(!enabled)}
              className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${
                enabled ? 'bg-ds-success-green justify-end' : 'bg-ds-surface-container justify-start border border-ds-secondary/20'
              }`}
            >
              <div className="w-4 h-4 bg-white rounded-full shadow-xs" />
            </button>
            <span className="text-xs font-bold text-ds-secondary">
              {enabled ? 'Active' : 'Hidden'}
            </span>
          </div>
        </div>
      </div>

      {enabled && (
        <div className="space-y-4">
          {/* Planet Filter Toggles */}
          <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-ds-secondary bg-ds-surface-container/60 p-3 rounded-2xl border border-ds-secondary/15">
            <span className="text-[10px] font-bold text-ds-primary uppercase tracking-wider mr-1 font-mono">
              Filter Planets:
            </span>
            {(Object.keys(planets) as Array<keyof typeof planets>).map((planet) => (
              <label
                key={planet}
                className="flex items-center space-x-1.5 cursor-pointer bg-ds-surface px-2.5 py-1 rounded-xl border border-ds-secondary/15 hover:border-ds-primary/30 transition-all"
              >
                <input
                  type="checkbox"
                  checked={planets[planet]}
                  onChange={() => togglePlanet(planet)}
                  className="rounded border-ds-secondary/30 text-ds-primary focus:ring-ds-primary h-3.5 w-3.5 cursor-pointer"
                />
                <span className="font-bold text-xs text-ds-secondary">{planet}</span>
              </label>
            ))}
          </div>

          {/* Interactive Recharts Graph */}
          <div className="border border-ds-secondary/15 rounded-2xl p-4 bg-ds-surface shadow-xs space-y-2">
            <div className="flex justify-between items-center text-xs text-ds-on-surface-variant font-medium pb-2 border-b border-ds-secondary/10">
              <span className="font-serif font-bold text-ds-secondary flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-ds-primary" />
                Transit Ashtakavarga Points Curve ({selectedYear})
              </span>
              <span className="font-mono text-[11px] text-ds-primary font-bold">
                Max Threshold: 56 Points &bull; Baseline: 28 Points
              </span>
            </div>

            <div className="w-full h-64 md:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={TRANSIT_GRAPH_DATA}
                  margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorTransit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--ds-primary, #E67E22)" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="var(--ds-primary, #E67E22)" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(44,62,80,0.08)" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: '#564337', fontFamily: 'JetBrains Mono' }}
                    tickLine={false}
                    axisLine={{ stroke: 'rgba(44,62,80,0.15)' }}
                  />
                  <YAxis
                    domain={[20, 36]}
                    tick={{ fontSize: 10, fill: '#564337', fontFamily: 'JetBrains Mono' }}
                    tickLine={false}
                    axisLine={{ stroke: 'rgba(44,62,80,0.15)' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--ds-surface, #FDFBF7)',
                      borderColor: 'rgba(44,62,80,0.2)',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontFamily: 'Inter',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="strength"
                    stroke="var(--ds-primary, #E67E22)"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorTransit)"
                    dot={{ r: 4, fill: 'var(--ds-secondary, #2C3E50)', strokeWidth: 2, stroke: '#FFFFFF' }}
                    activeDot={{ r: 6, fill: 'var(--ds-primary, #E67E22)' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Metric Overview Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-ds-surface-container/60 border border-ds-secondary/15 p-3.5 rounded-2xl">
              <div className="text-[10px] text-ds-on-surface-variant font-bold uppercase tracking-wider">
                Average Strength
              </div>
              <div className="text-xl font-mono font-extrabold text-ds-secondary mt-1">
                28.8 / 56
              </div>
            </div>
            <div className="bg-ds-surface-container/60 border border-ds-secondary/15 p-3.5 rounded-2xl">
              <div className="text-[10px] text-ds-on-surface-variant font-bold uppercase tracking-wider">
                Peak Transit Score
              </div>
              <div className="text-xl font-mono font-extrabold text-ds-success-green mt-1">
                32.0 (High)
              </div>
            </div>
            <div className="bg-ds-surface-container/60 border border-ds-secondary/15 p-3.5 rounded-2xl">
              <div className="text-[10px] text-ds-on-surface-variant font-bold uppercase tracking-wider">
                Lowest Point
              </div>
              <div className="text-xl font-mono font-extrabold text-ds-error-crimson mt-1">
                24.0 (Dip)
              </div>
            </div>
            <div className="bg-ds-surface-container/60 border border-ds-secondary/15 p-3.5 rounded-2xl">
              <div className="text-[10px] text-ds-on-surface-variant font-bold uppercase tracking-wider">
                Best Transit Period
              </div>
              <div className="text-sm font-mono font-extrabold text-ds-primary mt-1">
                June 2026
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
