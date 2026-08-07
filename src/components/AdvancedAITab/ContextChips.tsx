import React from 'react';
import { BarChart2, Home, Star, ChevronRight } from 'lucide-react';

export interface ContextData {
  activeDasha: {
    lord: string;
    antardasha: string;
    startYear?: string | number;
    endYear?: string | number;
    periodText?: string;
  };
  houseFocus: {
    house: string | number;
    domain: string;
  };
  cuspSubLord: {
    lord: string;
    strength?: string;
    placement?: string;
    aspects?: string;
  };
  kpVerdict: {
    verdict: 'YES' | 'NO' | 'DELAYED' | string;
    confidence: number;
    reasons?: string[];
  };
  rulingPlanets: string[];
}

interface ContextChipsProps {
  data: ContextData;
  onClick: () => void;
}

export const ContextChips: React.FC<ContextChipsProps> = ({ data, onClick }) => {
  const isVerdictYes = data.kpVerdict.verdict === 'YES';
  const isVerdictNo = data.kpVerdict.verdict === 'NO';

  return (
    <div className="flex items-center gap-2 px-4 py-2 overflow-x-auto max-w-full no-scrollbar">
      <span className="text-[10px] font-mono text-[#6B7280] uppercase tracking-wider shrink-0 hidden sm:inline">
        Context:
      </span>

      {/* Active Dasha Chip */}
      <button
        onClick={onClick}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#10141F] border border-[#1E2433] hover:border-amber-500/50 text-xs transition-all cursor-pointer whitespace-nowrap shrink-0 group"
      >
        <BarChart2 className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
        <span className="text-[#9CA3AF]">Dasha:</span>
        <span className="font-semibold text-[#F5F5F7] font-mono">
          {data.activeDasha.lord} ({data.activeDasha.antardasha})
        </span>
      </button>

      {/* House Focus Chip */}
      <button
        onClick={onClick}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#10141F] border border-[#1E2433] hover:border-sky-500/50 text-xs transition-all cursor-pointer whitespace-nowrap shrink-0 group"
      >
        <Home className="w-3.5 h-3.5 text-sky-400 group-hover:scale-110 transition-transform" />
        <span className="text-[#9CA3AF]">House:</span>
        <span className="font-semibold text-[#F5F5F7] font-mono">
          H{data.houseFocus.house} ({data.houseFocus.domain})
        </span>
      </button>

      {/* Vedic Promise Chip */}
      <button
        onClick={onClick}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#10141F] border border-[#1E2433] hover:border-emerald-500/50 text-xs transition-all cursor-pointer whitespace-nowrap shrink-0 group"
      >
        <Star className={`w-3.5 h-3.5 ${isVerdictYes ? 'text-emerald-400' : isVerdictNo ? 'text-rose-400' : 'text-amber-400'} group-hover:scale-110 transition-transform`} />
        <span className="text-[#9CA3AF]">Vedic Promise:</span>
        <span className={`font-bold font-mono px-1.5 py-0.2 rounded text-[11px] ${
          isVerdictYes
            ? 'bg-emerald-500/20 text-emerald-300'
            : isVerdictNo
            ? 'bg-rose-500/20 text-rose-300'
            : 'bg-amber-500/20 text-amber-300'
        }`}>
          {data.kpVerdict.verdict} ({data.kpVerdict.confidence}%)
        </span>
      </button>

      {/* Arrow helper */}
      <button
        onClick={onClick}
        className="text-[11px] text-amber-400 hover:underline flex items-center gap-0.5 ml-auto shrink-0 font-mono"
      >
        <span>View Details</span>
        <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
