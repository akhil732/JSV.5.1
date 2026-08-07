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
import { Info } from 'lucide-react';
import { TRANSIT_GRAPH_DATA } from '../data/astroData';

export const AshtakavargaChart: React.FC = () => {
  const [viewMode, setViewMode] = useState<'Day' | 'Week' | 'Month'>('Month');
  const [enabled, setEnabled] = useState(true);

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
    <div className="bg-white border-b border-gray-200 p-4 space-y-4">
      {/* Top Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-gray-100">
        <h2 className="text-xs font-bold text-gray-900 tracking-tight">
          Ashtakavarga Transit Strength
        </h2>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Year selector boxes */}
          <div className="flex items-center space-x-1">
            <span className="px-2 py-0.5 border border-gray-300 rounded bg-gray-50 text-gray-700 font-mono text-[11px]">
              2026
            </span>
            <span className="px-2 py-0.5 border border-gray-300 rounded bg-gray-50 text-gray-700 font-mono text-[11px]">
              2027
            </span>
          </div>

          <button className="p-1 text-gray-400 hover:text-gray-600 bg-gray-100 rounded-full">
            <Info className="w-3.5 h-3.5" />
          </button>

          {/* Day / Week / Month Mode Segmented Control */}
          <div className="flex items-center bg-gray-100 p-0.5 rounded-md border border-gray-200 text-[11px]">
            {(['Day', 'Week', 'Month'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-2.5 py-0.5 rounded font-medium transition-all ${
                  viewMode === mode
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          {/* Generate Graph Button */}
          <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded transition-colors shadow-2xs">
            Generate Graph
          </button>

          {/* On / Off Toggle */}
          <div className="flex items-center space-x-1.5 pl-2 border-l border-gray-200">
            <button
              onClick={() => setEnabled(!enabled)}
              className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                enabled ? 'bg-emerald-500 justify-end' : 'bg-gray-300 justify-start'
              }`}
            >
              <div className="w-4 h-4 bg-white rounded-full shadow-xs" />
            </button>
            <span className="text-[11px] font-medium text-gray-600">{enabled ? 'On' : 'Off'}</span>
          </div>
        </div>
      </div>

      {enabled && (
        <div className="space-y-3">
          {/* Checkboxes Row */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-gray-700 bg-gray-50/60 p-2.5 rounded-md border border-gray-100">
            {(Object.keys(planets) as Array<keyof typeof planets>).map((planet) => (
              <label key={planet} className="flex items-center space-x-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={planets[planet]}
                  onChange={() => togglePlanet(planet)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5"
                />
                <span className="text-gray-800">{planet}</span>
              </label>
            ))}
          </div>

          {/* Interactive Recharts Graph */}
          <div className="border border-gray-200 rounded-md p-3 bg-white">
            <div className="flex justify-center items-center text-[10px] text-gray-500 mb-2 space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span>
              <span className="font-semibold text-gray-700">Transit Strength</span>
            </div>

            <div className="w-full h-64 md:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={TRANSIT_GRAPH_DATA}
                  margin={{ top: 10, right: 20, left: 0, bottom: 20 }}
                >
                  <defs>
                    <linearGradient id="colorStrength" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: '#64748B' }}
                    tickLine={false}
                    axisLine={{ stroke: '#E2E8F0' }}
                  />
                  <YAxis
                    domain={[24, 32]}
                    tick={{ fontSize: 10, fill: '#64748B' }}
                    tickLine={false}
                    axisLine={{ stroke: '#E2E8F0' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderColor: '#E2E8F0',
                      borderRadius: '6px',
                      fontSize: '11px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="strength"
                    stroke="#2563EB"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorStrength)"
                    dot={{ r: 3, fill: '#1D4ED8', strokeWidth: 1, stroke: '#FFFFFF' }}
                    activeDot={{ r: 5 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Metric Overview Cards below chart */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-gray-50/80 border border-gray-200 p-3 rounded-md">
              <div className="text-[10px] text-gray-500 font-medium">Average Strength</div>
              <div className="text-base font-bold text-gray-900 mt-0.5">28.8</div>
            </div>
            <div className="bg-gray-50/80 border border-gray-200 p-3 rounded-md">
              <div className="text-[10px] text-gray-500 font-medium">Peak Strength</div>
              <div className="text-base font-bold text-emerald-600 mt-0.5">32</div>
            </div>
            <div className="bg-gray-50/80 border border-gray-200 p-3 rounded-md">
              <div className="text-[10px] text-gray-500 font-medium">Lowest Strength</div>
              <div className="text-base font-bold text-rose-600 mt-0.5">24</div>
            </div>
            <div className="bg-gray-50/80 border border-gray-200 p-3 rounded-md">
              <div className="text-[10px] text-gray-500 font-medium">Best Period</div>
              <div className="text-xs font-bold text-blue-600 mt-1 font-mono">2026-01-01</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
