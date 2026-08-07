import React, { useState } from 'react';
import { BHAVAS_REFERENCE_TABLE, BhavaInfo } from '../../lib/kp/houseDomainMapper';
import { BookOpen, Search, ChevronDown, ChevronUp } from 'lucide-react';

interface BhavasReferenceTableProps {
  activeHouse?: number | null;
  defaultExpanded?: boolean;
}

export const BhavasReferenceTable: React.FC<BhavasReferenceTableProps> = ({
  activeHouse,
  defaultExpanded = true
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHouseFilter, setSelectedHouseFilter] = useState<number | null>(null);

  const bhavasArray: BhavaInfo[] = Object.values(BHAVAS_REFERENCE_TABLE);

  const filteredBhavas = bhavasArray.filter((bhava) => {
    if (selectedHouseFilter !== null && bhava.house !== selectedHouseFilter) {
      return false;
    }
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      bhava.house.toString() === q ||
      bhava.sanskritName.toLowerCase().includes(q) ||
      bhava.domainName.toLowerCase().includes(q) ||
      bhava.tellsAbout.toLowerCase().includes(q) ||
      bhava.controls.toLowerCase().includes(q)
    );
  });

  return (
    <div className="bg-[#10141F] border border-[#1E2433] rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
      {/* Header */}
      <div
        className="flex items-center justify-between cursor-pointer border-b border-[#1E2433] pb-3 select-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#F5A623]/10 border border-[#F5A623]/30 flex items-center justify-center text-[#F5A623]">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-serif font-bold text-[#F5F5F7] flex items-center gap-2">
              12 Bhavas Reference Table (KP House Significations)
            </h3>
            <p className="text-xs text-[#9CA3AF]">
              Prof. K.S. Krishnamurti textbook reference for house domains &amp; significations
            </p>
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
          className="p-1.5 rounded-lg bg-[#0A0E17] border border-[#1E2433] text-[#9CA3AF] hover:text-[#F5F5F7] transition-colors cursor-pointer"
          aria-label={isExpanded ? 'Collapse Bhavas Table' : 'Expand Bhavas Table'}
        >
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Body */}
      {isExpanded && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Controls: Search and House selector */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-[#9CA3AF] absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter by house, sanskrit name, or keyword (e.g. Wealth, Spouse, Career)..."
                className="w-full bg-[#0A0E17] border border-[#1E2433] rounded-xl pl-9 pr-3 py-1.5 text-xs text-[#F5F5F7] focus:outline-none focus:border-[#F5A623] transition-colors"
              />
            </div>

            {/* Quick house filter pills */}
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
              <button
                onClick={() => setSelectedHouseFilter(null)}
                className={`px-2 py-1 rounded-md text-[10px] font-bold border transition-colors cursor-pointer whitespace-nowrap ${
                  selectedHouseFilter === null
                    ? 'bg-[#F5A623]/20 border-[#F5A623] text-[#F5A623]'
                    : 'bg-[#0A0E17] border-[#1E2433] text-[#9CA3AF] hover:text-[#F5F5F7]'
                }`}
              >
                All (1-12)
              </button>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((h) => {
                const isCurrentTarget = activeHouse === h;
                const isSelected = selectedHouseFilter === h;
                return (
                  <button
                    key={h}
                    onClick={() => setSelectedHouseFilter(isSelected ? null : h)}
                    className={`px-2 py-1 rounded-md text-[10px] font-bold border transition-colors cursor-pointer whitespace-nowrap ${
                      isSelected
                        ? 'bg-[#F5A623] text-[#0A0E17] border-[#F5A623]'
                        : isCurrentTarget
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 animate-pulse'
                        : 'bg-[#0A0E17] border-[#1E2433] text-[#9CA3AF] hover:text-[#F5F5F7]'
                    }`}
                  >
                    H{h}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Grid View */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredBhavas.map((bhava) => {
              const isActive = activeHouse === bhava.house;
              return (
                <div
                  key={bhava.house}
                  className={`p-3.5 rounded-xl border transition-all ${
                    isActive
                      ? 'bg-[#F5A623]/10 border-[#F5A623] shadow-md ring-1 ring-[#F5A623]/40'
                      : 'bg-[#0A0E17]/80 border-[#1E2433] hover:border-[#1E2433]/80'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center ${
                          isActive
                            ? 'bg-[#F5A623] text-[#0A0E17]'
                            : 'bg-[#1E2433] text-[#F5A623]'
                        }`}
                      >
                        {bhava.house}
                      </span>
                      <div>
                        <h4 className="text-xs font-bold text-[#F5F5F7] leading-none">
                          House {bhava.house}
                        </h4>
                        <span className="text-[10px] font-serif text-[#F5A623]">
                          {bhava.sanskritName}
                        </span>
                      </div>
                    </div>
                    {isActive && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase">
                        Query Target
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-[#9CA3AF] uppercase block">
                        Domain
                      </span>
                      <p className="text-[#F5F5F7] font-semibold text-xs">{bhava.domainName}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-[#9CA3AF] uppercase block mt-1">
                        Controls &amp; Significations
                      </span>
                      <p className="text-[#9CA3AF] text-xs leading-relaxed">{bhava.controls}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredBhavas.length === 0 && (
            <div className="p-4 text-center text-xs text-[#9CA3AF] bg-[#0A0E17] rounded-xl border border-[#1E2433]">
              No houses matching "{searchQuery}" found in the reference table.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
