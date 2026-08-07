import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, RotateCcw } from 'lucide-react';
import { PLANET_STRENGTHS } from '../data/astroData';

export const DashaStrengthBar: React.FC = () => {
  const [alanLeo, setAlanLeo] = useState(false);

  return (
    <div className="bg-white border-b border-gray-200 p-3 sm:p-4 space-y-3">
      {/* Top Header Row with Navigation Arrows */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-2">
        <div className="flex items-center space-x-2">
          {/* Navigation Arrows */}
          <div className="flex items-center space-x-1">
            <button className="p-1 border border-gray-200 rounded hover:bg-gray-50 text-gray-600">
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
            <button className="p-1 border border-gray-200 rounded hover:bg-gray-50 text-gray-600">
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button className="p-1 border border-gray-200 rounded hover:bg-gray-50 text-gray-600">
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Dasha Title & Info */}
          <div className="text-xs text-gray-800">
            <span className="font-bold text-gray-900">Mercury Mahadasha</span>{' '}
            <span className="text-gray-500">2014 - 2030 (17 years)</span>{' '}
            <span className="text-gray-300 mx-1">|</span>{' '}
            <span className="text-gray-600">Dasha Influencer - </span>
            <span className="font-bold text-purple-800">Jupiter</span>{' '}
            <span className="text-gray-500">(Bhava: 8, House: 8) - Pure (all +)</span>{' '}
            <span className="text-gray-300 mx-1">|</span>{' '}
            <span className="text-gray-600">Strongest - </span>
            <span className="font-bold text-purple-800">Jupiter</span>
          </div>
        </div>

        {/* Big Overall Dasha Score Badge */}
        <div className="px-2.5 py-1 bg-teal-50 border border-teal-300 text-teal-800 font-extrabold text-xs rounded-md shadow-2xs">
          94
        </div>
      </div>

      {/* Planetary Strengths Row + Saturn Sub-card */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
        {/* Planet Chips Grid */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {PLANET_STRENGTHS.map((planet) => (
            <div
              key={planet.code}
              className="flex items-center space-x-1.5 px-2.5 py-1 bg-white border border-gray-200 rounded-full shadow-2xs"
            >
              <span className="text-gray-500">{planet.symbol}</span>
              <span className="font-medium text-gray-800">{planet.name}</span>
              <span className={`font-bold ${planet.score >= 70 ? 'text-teal-600' : 'text-amber-600'}`}>
                {planet.score}
              </span>
            </div>
          ))}
        </div>

        {/* Saturn Specific Card */}
        <div className="bg-purple-50/60 border border-purple-200 rounded-md p-2 text-[11px] flex items-center space-x-3 text-purple-900 self-stretch lg:self-auto">
          <div className="flex items-center space-x-1.5">
            <span className="text-purple-700">♄</span>
            <span className="font-bold">Saturn</span>
            <span className="bg-purple-600 text-white font-bold text-[10px] px-1.5 py-0.5 rounded">
              86 <span className="font-normal opacity-80">R4</span>
            </span>
          </div>
          <div className="text-[10px] text-purple-700 border-l border-purple-200 pl-2">
            <div>02 Feb 2028 — 13 Oct 2030</div>
            <div className="text-purple-600 font-medium">DI: Ju (8-8 H-8) St: Ju</div>
          </div>
        </div>
      </div>

      {/* Timeline Slider with Year Ticks */}
      <div className="space-y-1 pt-1">
        <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-3/4 bg-purple-600 rounded-full" />
          {/* Thumb marker at 2026 position */}
          <div className="absolute left-[72%] top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-purple-700 rounded-full shadow-xs" />
        </div>
        <div className="flex justify-between text-[10px] text-gray-400 font-mono px-1">
          <span>2014</span>
          <span>2016</span>
          <span>2018</span>
          <span>2020</span>
          <span>2022</span>
          <span>2024</span>
          <span>2026</span>
          <span>2028</span>
          <span className="text-gray-700 font-bold">2030</span>
        </div>
      </div>

      {/* Bottom Toggle Bar: Alan Leo Analysis */}
      <div className="flex items-center justify-between text-xs pt-1 border-t border-gray-100">
        <span className="font-bold text-gray-800">Alan Leo Analysis</span>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setAlanLeo(!alanLeo)}
            className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors ${
              alanLeo ? 'bg-purple-600 justify-end' : 'bg-gray-300 justify-start'
            }`}
          >
            <div className="w-4 h-4 bg-white rounded-full shadow-md" />
          </button>
          <span className="text-[11px] font-medium text-gray-500">{alanLeo ? 'On' : 'Off'}</span>
        </div>
      </div>
    </div>
  );
};
