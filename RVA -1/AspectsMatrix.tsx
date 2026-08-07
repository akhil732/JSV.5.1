import React, { useState } from 'react';
import { ASPECT_CELLS_DATA } from '../data/astroData';

export const AspectsMatrix: React.FC = () => {
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
    <div className="bg-white border-b border-gray-200 p-4 space-y-3">
      {/* Tab Switcher Header */}
      <div className="flex items-center space-x-6 border-b border-gray-200 text-xs font-bold">
        <button
          onClick={() => setActiveTab('planet')}
          className={`pb-2 border-b-2 transition-colors ${
            activeTab === 'planet'
              ? 'border-purple-600 text-purple-900'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          Planet Aspects
        </button>
        <button
          onClick={() => setActiveTab('house')}
          className={`pb-2 border-b-2 transition-colors ${
            activeTab === 'house'
              ? 'border-purple-600 text-purple-900'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          House Aspects
        </button>
        <button
          onClick={() => setActiveTab('western')}
          className={`pb-2 border-b-2 transition-colors ${
            activeTab === 'western'
              ? 'border-purple-600 text-purple-900'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          Western Aspects
        </button>
      </div>

      {/* Aspects Grid Table */}
      <div className="overflow-x-auto border border-gray-200 rounded-md shadow-2xs">
        <table className="w-full text-center border-collapse text-[10px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold">
              <th className="p-2 border-r border-gray-200 w-12 bg-gray-100"></th>
              {planetsList.map((p) => (
                <th key={p} className="p-2 border-r border-gray-200 min-w-[70px]">
                  {p}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {planetsList.map((rowPlanet, rIdx) => (
              <tr key={rowPlanet} className="hover:bg-gray-50/50">
                <td className="p-2 font-bold text-gray-800 bg-gray-50 border-r border-gray-200">
                  {rowPlanet}
                </td>
                {planetsList.map((colPlanet, cIdx) => {
                  if (rIdx >= cIdx) {
                    // Lower triangle or diagonal empty
                    return <td key={colPlanet} className="p-2 border-r border-gray-100 bg-gray-50/30"></td>;
                  }

                  const cell = getAspect(rowPlanet, colPlanet);

                  if (!cell) {
                    return <td key={colPlanet} className="p-2 border-r border-gray-100"></td>;
                  }

                  return (
                    <td
                      key={colPlanet}
                      className="p-1.5 border-r border-gray-100 leading-tight font-sans"
                    >
                      <div
                        className={`font-semibold ${
                          cell.type === 'hard' ? 'text-rose-600' : 'text-emerald-600'
                        }`}
                      >
                        {cell.label}
                      </div>
                      <div className="text-[9px] text-gray-500 font-mono">{cell.angle}</div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
