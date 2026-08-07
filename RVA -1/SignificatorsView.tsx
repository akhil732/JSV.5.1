import React from 'react';
import { PLANET_SIGNIFICATORS, HOUSE_SIGNIFICATORS } from '../data/astroData';

export const SignificatorsView: React.FC = () => {
  return (
    <div className="bg-white border-b border-gray-200 p-4 space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs">
        {/* Left Column: Significators - Planet View */}
        <div className="border border-gray-200 rounded-md p-3 bg-white shadow-2xs flex flex-col justify-between">
          <div>
            <div className="font-bold text-gray-800 text-xs mb-2">Significators - Planet View</div>
            <table className="w-full text-left border-collapse text-[11px]">
              <thead>
                <tr className="bg-purple-50/70 border-y border-purple-100 text-purple-900 font-semibold text-[10px]">
                  <th className="py-1.5 px-3">Planet</th>
                  <th className="py-1.5 px-3 text-center">(A)</th>
                  <th className="py-1.5 px-3 text-center">(B)</th>
                  <th className="py-1.5 px-3 text-center">(C)</th>
                  <th className="py-1.5 px-3 text-center">(D)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {PLANET_SIGNIFICATORS.map((row) => (
                  <tr key={row.planet} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-1.5 px-3 font-bold text-gray-800">{row.planet}</td>
                    <td className="py-1.5 px-3 text-center text-gray-700">{row.a || '-'}</td>
                    <td className="py-1.5 px-3 text-center text-gray-700">{row.b || '-'}</td>
                    <td className="py-1.5 px-3 text-center text-gray-700">{row.c || '-'}</td>
                    <td className="py-1.5 px-3 text-center text-gray-700">{row.d || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-3 pt-2 border-t border-gray-100 text-[9.5px] text-gray-500 bg-gray-50/60 p-2 rounded">
            <span className="font-bold text-gray-700">(A)</span> = Star Lord's Bhava |{' '}
            <span className="font-bold text-gray-700">(B)</span> = Planet's Bhava |{' '}
            <span className="font-bold text-gray-700">(C)</span> = Star Lord's Houses |{' '}
            <span className="font-bold text-gray-700">(D)</span> = Planet's Houses
          </div>
        </div>

        {/* Right Column: Significators - House View */}
        <div className="border border-gray-200 rounded-md p-3 bg-white shadow-2xs">
          <div className="font-bold text-gray-800 text-xs mb-2">Significators - House View</div>
          <table className="w-full text-left border-collapse text-[11px]">
            <thead>
              <tr className="bg-purple-50/70 border-y border-purple-100 text-purple-900 font-semibold text-[10px]">
                <th className="py-1.5 px-3 w-12">House</th>
                <th className="py-1.5 px-3">Planets</th>
                <th className="py-1.5 px-3">Planets</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {HOUSE_SIGNIFICATORS.map((row) => (
                <tr key={row.house} className="hover:bg-gray-50/70 transition-colors">
                  <td className="py-1.5 px-3 font-bold text-gray-800">{row.house}</td>
                  <td className="py-1.5 px-3 text-gray-700">{row.planets1 || '-'}</td>
                  <td className="py-1.5 px-3 text-gray-700">{row.planets2 || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
