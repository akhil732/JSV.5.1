import React, { useState } from 'react';
import { SIGN_MAP, PLANETS_SHORT } from './DivisionalChart';
import { Search, Sparkles, SlidersHorizontal, Eye } from 'lucide-react';

const GRAHA_DETAILS: Record<string, { sanskrit: string; color: string; marriageRole: string }> = {
  "Ascendant": { sanskrit: "Lagna", color: "#F5A623", marriageRole: "Physical Vitality, Temperament & Self-Identity" },
  "Sun": { sanskrit: "Surya", color: "#FF5A5F", marriageRole: "Self-Respect, Leadership & Mutual Pride" },
  "Moon": { sanskrit: "Chandra", color: "#E0E6ED", marriageRole: "Emotional Mindset, Daily Home Comfort & Nurturing" },
  "Mars": { sanskrit: "Mangala", color: "#FF3366", marriageRole: "Physical Passion, Energy Drive & Conflict Style" },
  "Mercury": { sanskrit: "Budha", color: "#34D399", marriageRole: "Intellectual Communication, Wit & Household Logic" },
  "Jupiter": { sanskrit: "Guru", color: "#FBBF24", marriageRole: "Wisdom, Spiritual Values & Prosperity" },
  "Venus": { sanskrit: "Shukra", color: "#F472B6", marriageRole: "Primary Significator of Love, Affection & Marital Bliss" },
  "Saturn": { sanskrit: "Shani", color: "#8B5CF6", marriageRole: "Commitment, Discipline, Longevity & Patience" },
  "Rahu": { sanskrit: "Rahu", color: "#6B7280", marriageRole: "Unconventional Ambitions & Material Growth" },
  "Ketu": { sanskrit: "Ketu", color: "#4B5563", marriageRole: "Spiritual Detachment & Deeper Insight" }
};

const GRAHA_ORDER = [
  "Ascendant",
  "Venus",
  "Mars",
  "Jupiter",
  "Moon",
  "Sun",
  "Mercury",
  "Saturn",
  "Rahu",
  "Ketu"
];

interface PlanetTableProps {
  horoscopeData: any;
  language?: 'en' | 'hi' | 'te';
}

export const PlanetTable: React.FC<PlanetTableProps> = ({ horoscopeData, language = 'en' }) => {
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [searchQuery, setSearchQuery] = useState('');

  const currentChart = horoscopeData?.horoscope?.divisional_charts?.["D-1_rasi"] || {};
  const nakshatraPada = horoscopeData?.horoscope?.nakshatra_pada || {};
  const retrogradePlanets = horoscopeData?.horoscope?.planetary_states?.retrograde_planets || [];

  const filteredGrahas = GRAHA_ORDER.filter(g => {
    if (!searchQuery) return true;
    const details = GRAHA_DETAILS[g];
    const rasiData = currentChart[g];
    const query = searchQuery.toLowerCase();
    return (
      g.toLowerCase().includes(query) ||
      (details?.sanskrit || '').toLowerCase().includes(query) ||
      (rasiData?.sign || '').toLowerCase().includes(query)
    );
  });

  return (
    <div className="rounded-ds-xl border border-ds-outline bg-ds-surface overflow-hidden shadow-ds-sm flex flex-col space-y-4 p-5 sm:p-6">
      
      {/* Header & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-ds-outline pb-4">
        <div>
          <h3 className="text-base sm:text-lg font-serif font-bold text-ds-on-surface tracking-wide uppercase flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-ds-primary" />
            <span>Planetary Coordinates & Insights</span>
          </h3>
          <p className="text-xs text-ds-on-surface-variant mt-0.5 font-medium">
            Key relationship significators and precise celestial placements
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-ds-surface rounded-ds-xl p-1 border border-ds-outline shadow-2xs">
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1.5 rounded-ds-md text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer focus-ring ${
                viewMode === 'cards'
                  ? 'bg-ds-primary text-ds-surface shadow-sm'
                  : 'text-ds-on-surface-variant hover:text-ds-on-surface'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Insight Cards</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-ds-md text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer focus-ring ${
                viewMode === 'table'
                  ? 'bg-ds-primary text-ds-surface shadow-sm'
                  : 'text-ds-on-surface-variant hover:text-ds-on-surface'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Detailed Table</span>
            </button>
          </div>
        </div>
      </div>

      {/* MODE 1: INSIGHT CARDS */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {GRAHA_ORDER.slice(0, 6).map((grahaName) => {
            const rasiData = currentChart[grahaName];
            const naksData = nakshatraPada[grahaName];
            const isRetro = grahaName !== 'Ascendant' && retrogradePlanets.includes(grahaName);
            const details = GRAHA_DETAILS[grahaName];

            return (
              <div
                key={grahaName}
                className="bg-ds-surface border border-ds-outline hover:border-ds-primary/30 p-4 rounded-ds-xl space-y-2 transition-all hover:shadow-ds-sm"
              >
                <div className="flex items-center justify-between border-b border-ds-outline pb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: details.color }} />
                    <span className="text-xs font-bold text-ds-on-surface">{grahaName}</span>
                    <span className="text-[10px] text-ds-primary font-mono font-bold">({details.sanskrit})</span>
                  </div>

                  {isRetro && (
                    <span className="text-[9px] bg-ds-error-crimson/10 text-ds-error-crimson border border-ds-error-crimson/20 px-2 py-0.5 rounded-full font-mono font-bold">
                      Retrograde (Rx)
                    </span>
                  )}
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-ds-on-surface-variant font-medium">Placement:</span>
                  <span className="font-bold text-ds-primary font-mono">
                    {rasiData ? `${rasiData.longitude.toFixed(2)}° in ${rasiData.sign}` : 'N/A'}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-ds-on-surface-variant font-medium">Nakshatra:</span>
                  <span className="font-bold text-ds-success-green">
                    {naksData ? `${naksData.nakshatra} (Pada ${naksData.pada})` : 'N/A'}
                  </span>
                </div>

                <div className="bg-ds-surface-variant/40 p-2.5 rounded-ds-lg border border-ds-outline text-[11px] text-ds-on-surface-variant leading-relaxed">
                  <strong className="text-ds-on-surface">Marital Impact:</strong> {details.marriageRole}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODE 2: DETAILED TABLE */}
      {viewMode === 'table' && (
        <div className="space-y-3">
          <div className="relative max-w-sm">
            <input
              type="text"
              placeholder="Filter planets or signs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-ds-surface border border-ds-outline rounded-ds-xl pl-9 pr-4 py-2 text-xs text-ds-on-surface focus:outline-none focus:border-ds-primary font-mono placeholder-ds-on-surface-variant/50 focus-ring"
            />
            <Search className="w-4 h-4 text-ds-on-surface-variant absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          <div className="overflow-x-auto rounded-ds-xl border border-ds-outline">
            <table className="w-full text-left text-xs text-ds-on-surface">
              <thead className="bg-ds-surface-variant/30 text-[10px] uppercase font-mono font-bold text-ds-on-surface-variant">
                <tr>
                  <th className="py-3 px-4 border-b border-ds-outline">Graha (Planet)</th>
                  <th className="py-3 px-4 border-b border-ds-outline">Sign & Degrees</th>
                  <th className="py-3 px-4 border-b border-ds-outline">Nakshatra & Pada</th>
                  <th className="py-3 px-4 border-b border-ds-outline text-right">Nakshatra Lord</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ds-outline/50 bg-ds-surface">
                {filteredGrahas.map((grahaName, idx) => {
                  const rasiData = currentChart[grahaName];
                  const naksData = nakshatraPada[grahaName];
                  const isRetro = grahaName !== 'Ascendant' && retrogradePlanets.includes(grahaName);
                  const details = GRAHA_DETAILS[grahaName] || { sanskrit: grahaName, color: "#9CA3AF" };

                  return (
                    <tr key={grahaName} className={idx % 2 === 0 ? 'bg-transparent' : 'bg-ds-surface-variant/20 hover:bg-ds-surface-variant/40'}>
                      <td className="py-3 px-4 font-bold flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: details.color }} />
                        <span>{grahaName}</span>
                        <span className="text-[10px] text-ds-primary font-mono font-bold">({details.sanskrit})</span>
                        {isRetro && (
                          <span className="text-[8px] bg-ds-error-crimson/10 text-ds-error-crimson border border-ds-error-crimson/20 px-1 rounded font-mono font-bold">
                            Rx
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono text-ds-primary font-bold">
                        {rasiData ? `${rasiData.longitude.toFixed(2)}° ${rasiData.sign}` : 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-ds-success-green font-semibold">
                        {naksData ? `${naksData.nakshatra} (P${naksData.pada})` : 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-ds-on-surface-variant font-medium">
                        {naksData?.nakshatra_lord || 'N/A'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="border-t border-ds-outline pt-3 text-[10px] text-ds-on-surface-variant flex items-center justify-between font-mono font-bold">
        <span>Ayanamsa: {horoscopeData?.horoscope?.ayanamsa_value?.toFixed(6) || '24.12'}°</span>
        <span>Julian Day: {horoscopeData?.horoscope?.julian_day || 'N/A'}</span>
      </div>
    </div>
  );
};

export default PlanetTable;
