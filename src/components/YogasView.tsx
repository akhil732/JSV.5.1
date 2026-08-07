import React from 'react';

interface YogasViewProps {
  yogas: any;
  language?: 'en' | 'hi' | 'te';
}

const IMPORTANT_YOGAS = [
  "Raja Yoga", "Maha Purusha Yoga", "Gaja Kesari Yoga",
  "Dhana Yoga", "Neecha Bhanga Raja Yoga",
  "Pancha Mahapurusha Yoga",
  "Ruchaka", "Bhadra", "Hamsa", "Malavya", "Sasa"
];

export const YogasView: React.FC<YogasViewProps> = ({ yogas }) => {
  const yogaList = yogas?.yoga_list || {};
  
  const filteredEntries = Object.entries(yogaList).filter(([key, yogaArr]: [string, any]) => {
    if (!Array.isArray(yogaArr) || yogaArr.length < 4) return false;
    const yogaName = yogaArr[1] || "";
    return IMPORTANT_YOGAS.some(importantYoga => 
      yogaName.toLowerCase().includes(importantYoga.toLowerCase())
    );
  });

  const totalFound = filteredEntries.length;

  return (
    <div className="rounded-ds-xl border border-ds-secondary/15 bg-ds-surface overflow-hidden shadow-ds-sm flex flex-col">
      <div className="bg-ds-surface-container px-6 py-4 border-b border-ds-secondary/10 flex justify-between items-center">
        <h4 className="text-sm font-serif font-bold text-ds-success-green flex items-center gap-1.5 uppercase tracking-wide">
          🌟 Active Auspicious Yogas ({totalFound})
        </h4>
        <span className="text-[10px] bg-ds-success-green/10 border border-ds-success-green/20 text-ds-success-green px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
          Karmic Alignments
        </span>
      </div>

      <div className="p-6">
        {filteredEntries.length === 0 ? (
          <div className="text-center py-8 text-ds-on-surface-variant">
            <p className="text-sm font-bold font-serif">No Active Yogas Detected</p>
            <p className="text-xs mt-1">There are no prominent planetary combinations marked active in this chart.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[460px] overflow-y-auto pr-2 custom-scrollbar">
            {filteredEntries.map(([key, yogaArr]: [string, any]) => {
              const [divChart, yogaName] = yogaArr;

              return (
                <div
                  key={key}
                  className="bg-ds-surface-container border border-ds-secondary/10 p-4 rounded-ds-lg flex items-center justify-between hover:border-ds-success-green/30 transition-all shadow-xs"
                >
                  <div className="text-xs text-ds-success-green font-bold uppercase flex items-center gap-1 tracking-tight">
                    ✦ {yogaName}
                  </div>
                  <span className="bg-ds-secondary/10 text-ds-secondary text-[8px] font-bold px-1.5 py-0.5 rounded border border-ds-secondary/15 uppercase">
                    {divChart}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
