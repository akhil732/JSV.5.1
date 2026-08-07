import React, { useState } from 'react';
import { ShieldCheck, Layers, ChevronRight, CheckCircle2, XCircle, Clock, X, ChevronDown, ChevronUp } from 'lucide-react';
import { VedicGroundTruths } from '../../lib/services/EnhancedGeminiConsultationService';

interface StickyGroundTruthBadgeProps {
  groundTruths: VedicGroundTruths;
  onOpenInspector: () => void;
  language?: 'en' | 'hi' | 'te';
}

export const StickyGroundTruthBadge: React.FC<StickyGroundTruthBadgeProps> = ({
  groundTruths,
  onOpenInspector,
  language = 'en'
}) => {
  const [isDismissed, setIsDismissed] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (isDismissed) return null;

  const isOpen = groundTruths.gatekeeperStatus === 'OPEN';

  const promiseBg = isOpen
    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
    : groundTruths.vedicPromise === 'DELAYED'
    ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
    : 'bg-rose-500/10 text-rose-400 border-rose-500/30';

  if (isCollapsed) {
    return (
      <div className="sticky top-0 z-20 bg-[#131C2E]/95 backdrop-blur-md border border-[#334155] rounded-xl px-3 py-1.5 shadow-md flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setIsCollapsed(false)}>
          <ShieldCheck className="w-4 h-4 text-teal-400" />
          <span className="text-xs font-mono font-bold text-teal-300">
            Vedic Chart Facts (H{groundTruths.targetHouse} • {groundTruths.targetHouseLord})
          </span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold ${
            isOpen ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
          }`}>
            {groundTruths.vedicPromise} ({groundTruths.confidenceScore}%)
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onOpenInspector}
            className="text-[11px] font-mono text-teal-400 hover:underline px-1.5"
          >
            Inspect
          </button>
          <button
            onClick={() => setIsCollapsed(false)}
            className="p-1 text-[#94A3B8] hover:text-white"
            title="Expand ground truth badge"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="sticky top-0 z-20 bg-[#131C2E]/95 backdrop-blur-md border border-[#334155] hover:border-teal-500/40 rounded-xl p-3 shadow-xl transition-all mb-2">
      {/* Top Header Row */}
      <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-[#334155]/60">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-teal-500/15 border border-teal-500/30 text-teal-400 shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold font-mono text-teal-300 tracking-wide uppercase">
                Vedic Parashari Verification
              </span>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-teal-500/10 text-teal-300 border border-teal-500/20">
                Verified
              </span>
            </div>
            <p className="text-[11px] text-[#94A3B8]">
              D1 Rasi, D9 Navamsha, D10 &amp; Vimshottari Dasha Rules
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={onOpenInspector}
            className="px-2.5 py-1.5 rounded-lg bg-[#0F172A] border border-[#334155] hover:border-teal-500/50 text-xs font-mono text-teal-300 hover:text-teal-200 transition-all flex items-center gap-1.5 cursor-pointer"
            title="Open Ground Truth Inspector Drawer"
            aria-label="Inspect Chart Data"
          >
            <Layers className="w-3.5 h-3.5 text-teal-400" />
            <span className="hidden sm:inline">Inspect Chart</span>
            <ChevronRight className="w-3.5 h-3.5 opacity-70" />
          </button>

          <button
            onClick={() => setIsCollapsed(true)}
            className="p-1.5 rounded-lg bg-[#0F172A] border border-[#334155] text-[#94A3B8] hover:text-white transition-all cursor-pointer"
            title="Collapse badge"
            aria-label="Collapse ground truth badge"
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setIsDismissed(true)}
            className="p-1.5 rounded-lg bg-[#0F172A] border border-[#334155] text-[#94A3B8] hover:text-rose-400 transition-all cursor-pointer"
            title="Dismiss badge"
            aria-label="Dismiss ground truth badge"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Structured Pills Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
        {/* House Focus Pill */}
        <div className="flex flex-col p-1.5 px-2 rounded-lg bg-[#0F172A]/80 border border-[#334155] hover:border-amber-500/30 transition-all cursor-pointer" onClick={onOpenInspector}>
          <span className="text-[10px] text-[#94A3B8] font-medium uppercase tracking-wider">
            House Focus
          </span>
          <span className="font-bold text-amber-300 truncate mt-0.5">
            H{groundTruths.targetHouse} • {groundTruths.domain}
          </span>
        </div>

        {/* House Lord Pill */}
        <div className="flex flex-col p-1.5 px-2 rounded-lg bg-[#0F172A]/80 border border-[#334155] hover:border-amber-500/30 transition-all cursor-pointer" onClick={onOpenInspector}>
          <span className="text-[10px] text-[#94A3B8] font-medium uppercase tracking-wider">
            House Lord
          </span>
          <span className="font-bold text-sky-300 truncate mt-0.5">
            {groundTruths.targetHouseLord || 'Venus'}
          </span>
        </div>

        {/* Vedic Promise Verdict Pill */}
        <div className={`flex flex-col p-1.5 px-2 rounded-lg border ${promiseBg} transition-all cursor-pointer`} onClick={onOpenInspector}>
          <span className="text-[10px] opacity-80 font-medium uppercase tracking-wider">
            Vedic Promise Verdict
          </span>
          <span className="font-bold inline-flex items-center gap-1 mt-0.5 truncate">
            {isOpen ? (
              <CheckCircle2 className="w-3 h-3 shrink-0" />
            ) : (
              <XCircle className="w-3 h-3 shrink-0" />
            )}
            {groundTruths.vedicPromise} ({groundTruths.confidenceScore}%)
          </span>
        </div>

        {/* Active Dasha Pill */}
        <div className="flex flex-col p-1.5 px-2 rounded-lg bg-[#0F172A]/80 border border-[#334155] hover:border-amber-500/30 transition-all cursor-pointer" onClick={onOpenInspector}>
          <span className="text-[10px] text-[#94A3B8] font-medium uppercase tracking-wider flex items-center gap-1">
            <Clock className="w-2.5 h-2.5 text-sky-400" /> Active Dasha
          </span>
          <span className="font-bold text-indigo-300 truncate mt-0.5">
            {groundTruths.activeDasha || 'Mercury-Maha'}
          </span>
        </div>
      </div>
    </div>
  );
};

