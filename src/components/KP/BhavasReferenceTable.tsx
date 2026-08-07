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
    <div className="bg-ds-surface border border-ds-secondary/15 rounded-2xl p-5 sm:p-6 shadow-ds-sm space-y-4">
      {/* Header */}
      <div
        className="flex items-center justify-between cursor-pointer border-b border-ds-secondary/10 pb-3 select-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-ds-primary/10 border border-ds-primary/30 flex items-center justify-center text-ds-primary">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-serif font-bold text-ds-secondary flex items-center gap-2">
              12 Bhavas Reference Table (KP House Significations)
            </h3>
            <p className="text-xs text-ds-on-surface-variant">
              Prof. K.S. Krishnamurti textbook reference for house domains &amp; significations
            </p>
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
          className="p-1.5 rounded-lg bg-ds-surface-container border border-ds-secondary/15 text-ds-on-surface-variant hover:text-ds-secondary transition-colors cursor-pointer"
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
              <Search className="w-3.5 h-3.5 text-ds-on-surface-variant absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter by house, sanskrit name, or keyword (e.g. Wealth, Spouse, Career)..."
                className="w-full bg-ds-surface-container border border-ds-secondary/15 rounded-xl pl-9 pr-3 py-1.5 text-xs text-ds-secondary focus:outline-none focus:border-ds-primary transition-colors"
              />
            </div>

            {/* Quick house filter pills */}
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
              <button
                onClick={() => setSelectedHouseFilter(null)}
                className={`px-2 py-1 rounded-md text-[10px] font-bold border transition-colors cursor-pointer whitespace-nowrap ${
                  selectedHouseFilter === null
                    ? 'bg-ds-primary/20 border-ds-primary text-ds-primary'
                    : 'bg-ds-surface-container border-ds-secondary/15 text-ds-on-surface-variant hover:text-ds-secondary'
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
                        ? 'bg-ds-primary text-ds-on-primary border-ds-primary'
                        : isCurrentTarget
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50 animate-pulse'
                        : 'bg-ds-surface-container border-ds-secondary/15 text-ds-on-surface-variant hover:text-ds-secondary'
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
                      ? 'bg-ds-primary/10 border-ds-primary shadow-md ring-1 ring-ds-primary/40'
                      : 'bg-ds-surface-container border-ds-secondary/15 hover:border-ds-secondary/30'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center ${
                          isActive
                            ? 'bg-ds-primary text-ds-on-primary'
                            : 'bg-ds-surface text-ds-primary border border-ds-secondary/15'
                        }`}
                      >
                        {bhava.house}
                      </span>
                      <div>
                        <h4 className="text-xs font-bold text-ds-secondary leading-none">
                          House {bhava.house}
                        </h4>
                        <span className="text-[10px] font-serif text-ds-primary">
                          {bhava.sanskritName}
                        </span>
                      </div>
                    </div>
                    {isActive && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 uppercase">
                        Query Target
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-ds-on-surface-variant uppercase block">
                        Domain
                      </span>
                      <p className="text-ds-secondary font-semibold text-xs">{bhava.domainName}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-ds-on-surface-variant uppercase block mt-1">
                        Controls &amp; Significations
                      </span>
                      <p className="text-ds-on-surface-variant text-xs leading-relaxed">{bhava.controls}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredBhavas.length === 0 && (
            <div className="p-4 text-center text-xs text-ds-on-surface-variant bg-ds-surface-container rounded-xl border border-ds-secondary/15">
              No houses matching "{searchQuery}" found in the reference table.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
