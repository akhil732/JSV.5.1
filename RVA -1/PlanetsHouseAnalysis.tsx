import React, { useState } from 'react';
import { PLANETS_ANALYSIS_DATA, HOUSE_ANALYSIS_DATA } from '../data/astroData';

export const PlanetsHouseAnalysis: React.FC = () => {
  const [sectionEnabled, setSectionEnabled] = useState(true);

  // Helper for color coding scores
  const getScoreColor = (val: number) => {
    if (val >= 80) return 'text-emerald-600 font-bold';
    if (val >= 70) return 'text-emerald-500 font-medium';
    if (val >= 50) return 'text-amber-600 font-medium';
    return 'text-rose-600 font-bold';
  };

  return (
    <div className="bg-white border-b border-gray-200 p-4 space-y-3">
      {/* Top Header Toggle Bar */}
      <div className="flex items-center justify-between pb-2 border-b border-gray-100">
        <h2 className="text-xs font-bold text-gray-900 tracking-tight flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-purple-600"></span>
          Planets & House Analysis
        </h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setSectionEnabled(!sectionEnabled)}
            className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors ${
              sectionEnabled ? 'bg-emerald-500 justify-end' : 'bg-gray-300 justify-start'
            }`}
          >
            <div className="w-4 h-4 bg-white rounded-full shadow-xs" />
          </button>
          <span className="text-[11px] font-medium text-gray-600">
            {sectionEnabled ? 'On' : 'Off'}
          </span>
        </div>
      </div>

      {sectionEnabled && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs">
          {/* Left Column: Planets Analysis */}
          <div className="border border-gray-200 rounded-md p-3 bg-white shadow-2xs flex flex-col justify-between">
            <div>
              {/* Header Controls */}
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-gray-800 text-xs">Planets Analysis</span>
                  <button className="px-2 py-0.5 bg-blue-600 text-white font-medium text-[10px] rounded hover:bg-blue-700">
                    Default
                  </button>
                  <select className="border border-gray-300 rounded px-1.5 py-0.5 text-[10px] bg-white text-gray-700">
                    <option>Rule 4</option>
                    <option>Rule 1</option>
                  </select>
                  <select className="border border-gray-300 rounded px-1.5 py-0.5 text-[10px] bg-white text-gray-700">
                    <option>60 yr</option>
                    <option>120 yr</option>
                  </select>
                </div>
                <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-semibold rounded-full">
                  Sagittarius
                </span>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-[11px]">
                  <thead>
                    <tr className="bg-gray-50 border-y border-gray-200 text-gray-500 font-semibold text-[10px]">
                      <th className="py-1.5 px-2">Planets</th>
                      <th className="py-1.5 px-2 text-center">Light</th>
                      <th className="py-1.5 px-2 text-center">Perf.</th>
                      <th className="py-1.5 px-2 text-center">Resource</th>
                      <th className="py-1.5 px-2 text-center">Capacity</th>
                      <th className="py-1.5 px-2 text-center">SL, Inf</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {PLANETS_ANALYSIS_DATA.map((row) => (
                      <tr key={row.planet} className="hover:bg-gray-50/70 transition-colors">
                        <td className="py-1.5 px-2 font-bold text-gray-800">{row.planet}</td>
                        <td className={`py-1.5 px-2 text-center ${getScoreColor(row.light)}`}>
                          {row.light}
                        </td>
                        <td className={`py-1.5 px-2 text-center ${getScoreColor(row.perf)}`}>
                          {row.perf}
                        </td>
                        <td className={`py-1.5 px-2 text-center ${getScoreColor(row.resource)}`}>
                          {row.resource}
                        </td>
                        <td className="py-1.5 px-2 text-center font-medium">
                          {row.isCustomCapacity ? (
                            <span className="text-xs">
                              <span className="text-rose-600 font-bold">
                                {String(row.capacity).split('/')[0]}
                              </span>
                              <span className="text-gray-400">/</span>
                              <span className="text-emerald-600 font-bold">
                                {String(row.capacity).split('/')[1]}
                              </span>
                            </span>
                          ) : (
                            <span className={getScoreColor(Number(row.capacity))}>
                              {row.capacity}
                            </span>
                          )}
                        </td>
                        <td className="py-1.5 px-2 text-center font-medium text-gray-700">
                          {row.slInf}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer Summary */}
            <div className="mt-3 pt-2 border-t border-gray-100 text-[10px] text-gray-600 leading-normal space-y-1 bg-gray-50/50 p-2 rounded">
              <div>
                <span className="font-bold text-emerald-700">Best Light:</span> Su, Mo, Me, Ve, Ke (100%){' '}
                <span className="text-gray-300">|</span>{' '}
                <span className="font-bold text-emerald-700">Top Perf:</span> Ra 93, Ju 92, Me 91{' '}
                <span className="text-gray-300">|</span>{' '}
                <span className="font-bold text-emerald-700">Top Capacity:</span> Me 94, Su 85, Ve 74
              </div>
              <div>
                <span className="font-bold text-rose-600">Weak Light:</span> Sa 30%{' '}
                <span className="text-gray-300">|</span>{' '}
                <span className="font-bold text-rose-600">Weak Capacity:</span> Sa 36, Ra 67
              </div>
            </div>
          </div>

          {/* Right Column: House Analysis */}
          <div className="border border-gray-200 rounded-md p-3 bg-white shadow-2xs flex flex-col justify-between">
            <div>
              {/* Header Controls */}
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-gray-800 text-xs">House Analysis</span>
                <select className="border border-gray-300 rounded px-1.5 py-0.5 text-[10px] bg-white text-gray-700">
                  <option>60 yr</option>
                  <option>120 yr</option>
                </select>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-[11px]">
                  <thead>
                    <tr className="bg-gray-50 border-y border-gray-200 text-gray-500 font-semibold text-[10px]">
                      <th className="py-1.5 px-2">#</th>
                      <th className="py-1.5 px-2">Occupant</th>
                      <th className="py-1.5 px-2">Lord</th>
                      <th className="py-1.5 px-2">Karaka</th>
                      <th className="py-1.5 px-2 font-bold text-gray-800">Total</th>
                    </tr>
                    <tr className="bg-gray-50/50 text-[9px] text-gray-400 font-mono border-b border-gray-100">
                      <td className="py-0.5 px-2">#</td>
                      <td className="py-0.5 px-2">60</td>
                      <td className="py-0.5 px-2">20</td>
                      <td className="py-0.5 px-2">20</td>
                      <td className="py-0.5 px-2 font-bold">100</td>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {HOUSE_ANALYSIS_DATA.map((row) => (
                      <tr key={row.houseNum} className="hover:bg-gray-50/70 transition-colors">
                        <td className="py-1.5 px-2 font-mono text-gray-500">{row.houseNum}</td>
                        <td className="py-1.5 px-2 font-medium text-emerald-700">{row.occupant}</td>
                        <td className="py-1.5 px-2 font-medium text-gray-700">{row.lord}</td>
                        <td className="py-1.5 px-2 font-medium text-gray-700">{row.karaka}</td>
                        <td className="py-1.5 px-2 font-bold text-emerald-600">{row.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer Summary */}
            <div className="mt-3 pt-2 border-t border-gray-100 text-[10px] text-gray-600 bg-gray-50/50 p-2 rounded flex items-center justify-between">
              <div>
                <span className="font-bold text-emerald-700">Strongest:</span> H3 (102)
              </div>
              <div>
                <span className="font-bold text-rose-600">Weakest:</span> H8 (64)
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
