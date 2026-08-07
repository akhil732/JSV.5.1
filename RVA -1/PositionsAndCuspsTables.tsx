import React from 'react';
import { PLANETARY_POSITIONS, CUSPS_DATA } from '../data/astroData';

export const PositionsAndCuspsTables: React.FC = () => {
  return (
    <div className="bg-white border-b border-gray-200 p-4 space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs">
        {/* Left Table: Planetary Positions */}
        <div className="border border-gray-200 rounded-md p-3 bg-white shadow-2xs overflow-x-auto">
          <div className="mb-2 font-bold text-gray-800 text-xs">Planetary Positions</div>
          <table className="w-full text-left border-collapse text-[10.5px]">
            <thead>
              <tr className="bg-gray-50 border-y border-gray-200 text-gray-500 font-semibold text-[9.5px]">
                <th className="py-1 px-1.5">Su</th>
                <th className="py-1 px-1.5">Cn</th>
                <th className="py-1 px-1.5">17:56:08</th>
                <th className="py-1 px-1.5 text-center">8</th>
                <th className="py-1 px-1.5">Ashlesha (1)</th>
                <th className="py-1 px-1.5">Mo</th>
                <th className="py-1 px-1.5">Me</th>
                <th className="py-1 px-1.5">Me</th>
                <th className="py-1 px-1.5">Ra</th>
                <th className="py-1 px-1.5">Ve</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {PLANETARY_POSITIONS.map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50/70 transition-colors font-mono text-[10px]">
                  <td className="py-1 px-1.5 font-sans font-bold text-gray-900">{row.planet}</td>
                  <td className="py-1 px-1.5 font-sans text-gray-700">{row.sign}</td>
                  <td className="py-1 px-1.5 text-gray-600">{row.longitude}</td>
                  <td className="py-1 px-1.5 text-center text-gray-800 font-sans">{row.house}</td>
                  <td className="py-1 px-1.5 font-sans text-gray-800">{row.nakshatra}</td>
                  <td className="py-1 px-1.5 font-sans text-gray-700">{row.sl}</td>
                  <td className="py-1 px-1.5 font-sans text-gray-700">{row.nl}</td>
                  <td className="py-1 px-1.5 font-sans text-gray-700">{row.sub}</td>
                  <td className="py-1 px-1.5 font-sans text-gray-700">{row.ss}</td>
                  <td className="py-1 px-1.5 font-sans text-gray-700">{row.sss}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Right Table: Cusps / House Positions */}
        <div className="border border-gray-200 rounded-md p-3 bg-white shadow-2xs overflow-x-auto">
          <div className="mb-2 font-bold text-gray-800 text-xs">House Cusps</div>
          <table className="w-full text-left border-collapse text-[10.5px]">
            <thead>
              <tr className="bg-gray-50 border-y border-gray-200 text-gray-500 font-semibold text-[9.5px]">
                <th className="py-1 px-1.5">I</th>
                <th className="py-1 px-1.5">Sg</th>
                <th className="py-1 px-1.5">05:30:04</th>
                <th className="py-1 px-1.5">Mula (2)</th>
                <th className="py-1 px-1.5">Ju</th>
                <th className="py-1 px-1.5">Ke</th>
                <th className="py-1 px-1.5">Ma</th>
                <th className="py-1 px-1.5">Mo</th>
                <th className="py-1 px-1.5">Ra</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {CUSPS_DATA.map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50/70 transition-colors font-mono text-[10px]">
                  <td className="py-1 px-1.5 font-sans font-bold text-gray-900">{row.house}</td>
                  <td className="py-1 px-1.5 font-sans text-gray-700">{row.sign}</td>
                  <td className="py-1 px-1.5 text-gray-600">{row.longitude}</td>
                  <td className="py-1 px-1.5 font-sans text-gray-800">{row.nakshatra}</td>
                  <td className="py-1 px-1.5 font-sans text-gray-700">{row.sl}</td>
                  <td className="py-1 px-1.5 font-sans text-gray-700">{row.nl}</td>
                  <td className="py-1 px-1.5 font-sans text-gray-700">{row.sub}</td>
                  <td className="py-1 px-1.5 font-sans text-gray-700">{row.ss}</td>
                  <td className="py-1 px-1.5 font-sans text-gray-700">{row.sss}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
