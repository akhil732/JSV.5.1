import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { VIMSHOTTARI_DASHA_PERIODS } from '../data/astroData';

export const VimshottariDashaAccordion: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0); // First item default open

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="bg-white border-b border-gray-200 p-4 space-y-3">
      {/* Section Title Header Bar */}
      <div className="bg-purple-100/70 border border-purple-200 text-purple-950 px-4 py-2 rounded-md font-bold text-xs tracking-wide">
        Vimshottari Dasha
      </div>

      {/* Accordion list */}
      <div className="space-y-1.5 text-xs">
        {VIMSHOTTARI_DASHA_PERIODS.map((item, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="border border-gray-200 rounded-md overflow-hidden transition-all bg-white shadow-2xs"
            >
              <button
                onClick={() => toggleAccordion(idx)}
                className="w-full px-3 py-2 flex items-center space-x-2 text-left bg-gray-50/80 hover:bg-purple-50/50 transition-colors"
              >
                <div className="w-4 h-4 border border-gray-300 rounded flex items-center justify-center bg-white text-gray-600">
                  {isOpen ? <Minus className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                </div>
                <span className="font-medium text-gray-800">
                  {item.planet} From {item.startDate} to {item.endDate}
                </span>
              </button>

              {isOpen && (
                <div className="p-3 bg-white border-t border-gray-100 text-[11px] text-gray-600 space-y-1">
                  <div className="font-semibold text-purple-900 pb-1">
                    Antardasha Breakdown for {item.planet}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 font-mono text-[10px]">
                    <div className="bg-gray-50 p-2 rounded border border-gray-100">
                      <span className="font-bold text-gray-800">{item.planet} - {item.planet}</span>
                      <div className="text-gray-500">13-10-2013 → 08-03-2016</div>
                    </div>
                    <div className="bg-gray-50 p-2 rounded border border-gray-100">
                      <span className="font-bold text-gray-800">{item.planet} - Ketu</span>
                      <div className="text-gray-500">08-03-2016 → 06-03-2017</div>
                    </div>
                    <div className="bg-gray-50 p-2 rounded border border-gray-100">
                      <span className="font-bold text-gray-800">{item.planet} - Venus</span>
                      <div className="text-gray-500">06-03-2017 → 05-01-2020</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
