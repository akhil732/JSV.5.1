import React, { useState } from 'react';
import { CalculatedDashaInfo } from '../../lib/engines/DashaEngine';
import { Clock, Calendar, ChevronRight, ChevronDown, Sparkles, Shield, CheckCircle2 } from 'lucide-react';

interface VimshottariDashaTabProps {
  dashaInfo: CalculatedDashaInfo;
  nativeName: string;
  birthDate: string;
}

export const VimshottariDashaTab: React.FC<VimshottariDashaTabProps> = ({
  dashaInfo,
  nativeName,
  birthDate
}) => {
  const [expandedMd, setExpandedMd] = useState<string | null>(dashaInfo.mahadasha);
  const [expandedAd, setExpandedAd] = useState<string | null>(dashaInfo.antardasha);

  const targetDate = new Date("2026-07-26");

  const formatDate = (d: Date | string) => {
    const dateObj = typeof d === 'string' ? new Date(d) : d;
    if (isNaN(dateObj.getTime())) return String(d);
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateProgress = (start: Date, end: Date) => {
    const total = end.getTime() - start.getTime();
    if (total <= 0) return 0;
    const elapsed = targetDate.getTime() - start.getTime();
    const pct = (elapsed / total) * 100;
    return Math.max(0, Math.min(100, Math.round(pct * 10) / 10));
  };

  return (
    <div className="space-y-6">
      {/* Hero Active Dasha Banner */}
      <div className="bg-gradient-to-br from-[#10141F] via-[#161D2F] to-[#10141F] border border-[#F5A623]/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#F5A623]/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1E2433] pb-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#F5A623]" />
              <h2 className="text-xl font-serif font-bold text-[#F5F5F7]">
                VIMSHOTTARI DASHA TIMELINE
              </h2>
            </div>
          </div>

          <div className="bg-[#0A0E17]/80 border border-[#1E2433] px-4 py-2 rounded-xl flex items-center gap-3">
            <Clock className="w-4 h-4 text-[#F5A623]" />
            <div className="text-xs">
              <span className="text-[#9CA3AF]">Active MD Balance:</span>{' '}
              <strong className="text-[#F5A623] font-mono">{dashaInfo.remainingBalanceYears.toFixed(2)} Years</strong>
            </div>
          </div>
        </div>

        {/* 3 Active Dasha Tiers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Mahadasha Card */}
          <div className="bg-[#0A0E17]/90 border border-[#F5A623]/40 rounded-xl p-4 space-y-3 relative">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wider font-bold text-[#F5A623] bg-[#F5A623]/10 px-2 py-0.5 rounded">
                Mahadasha (Major)
              </span>
              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                <CheckCircle2 className="w-3 h-3" /> ACTIVE
              </span>
            </div>
            <div>
              <div className="text-2xl font-serif font-bold text-white tracking-wide">
                {dashaInfo.mahadasha}
              </div>
              <p className="text-[11px] text-[#9CA3AF] mt-0.5">
                {formatDate(dashaInfo.mahadashaStart)} — {formatDate(dashaInfo.mahadashaEnd)}
              </p>
            </div>
          </div>

          {/* Antardasha Card */}
          <div className="bg-[#0A0E17]/90 border border-[#F5A623]/30 rounded-xl p-4 space-y-3 relative">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wider font-bold text-[#F5A623] bg-[#F5A623]/10 px-2 py-0.5 rounded">
                Antardasha (Bhukti)
              </span>
              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                <CheckCircle2 className="w-3 h-3" /> ACTIVE
              </span>
            </div>
            <div>
              <div className="text-2xl font-serif font-bold text-white tracking-wide">
                {dashaInfo.antardasha}
              </div>
              <p className="text-[11px] text-[#9CA3AF] mt-0.5">
                {formatDate(dashaInfo.antardashaStart)} — {formatDate(dashaInfo.antardashaEnd)}
              </p>
            </div>
          </div>

          {/* Pratyantardasha Card */}
          <div className="bg-[#0A0E17]/90 border border-[#1E2433] rounded-xl p-4 space-y-3 relative">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wider font-bold text-[#A0AEC0] bg-[#1E2433] px-2 py-0.5 rounded">
                Pratyantardasha (Sub-Sub)
              </span>
              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                <CheckCircle2 className="w-3 h-3" /> ACTIVE
              </span>
            </div>
            <div>
              <div className="text-2xl font-serif font-bold text-white tracking-wide">
                {dashaInfo.pratyantardasha}
              </div>
              <p className="text-[11px] text-[#9CA3AF] mt-0.5">
                {dashaInfo.pratyantardashaStart ? formatDate(dashaInfo.pratyantardashaStart) : 'Active'} — {dashaInfo.pratyantardashaEnd ? formatDate(dashaInfo.pratyantardashaEnd) : 'Active'}
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Dasha Cycle Tree Table */}
      <div className="bg-[#10141F] border border-[#1E2433] rounded-2xl p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-[#1E2433] pb-3">
          <h3 className="text-base font-serif font-bold text-[#F5F5F7] flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#F5A623]" />
            Full 120-Year Mahadasha Sequence
          </h3>
          <span className="text-xs text-[#9CA3AF]">
            Click any Mahadasha to expand Antardashas
          </span>
        </div>

        <div className="space-y-2">
          {dashaInfo.timeline.map((md, idx) => {
            const isCurrentMd = md.lord === dashaInfo.mahadasha;
            const isExpanded = expandedMd === md.lord;
            const pct = calculateProgress(md.startDate, md.endDate);

            return (
              <div
                key={md.lord + idx}
                className={`border rounded-xl transition-all overflow-hidden ${
                  isCurrentMd
                    ? 'border-[#F5A623]/50 bg-[#141A2B]'
                    : 'border-[#1E2433] bg-[#0A0E17]/60 hover:bg-[#0A0E17]'
                }`}
              >
                {/* Mahadasha Header Row */}
                <div
                  onClick={() => setExpandedMd(isExpanded ? null : md.lord)}
                  className="p-3.5 px-4 flex items-center justify-between cursor-pointer select-none"
                >
                  <div className="flex items-center gap-3">
                    <button className="text-[#9CA3AF] hover:text-white">
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-[#F5A623]" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white font-serif">
                          {md.lord} Mahadasha
                        </span>
                        <span className="text-[10px] text-[#A0AEC0] font-mono">
                          ({md.totalDuration} Yrs)
                        </span>
                        {isCurrentMd && (
                          <span className="text-[9px] uppercase font-bold bg-[#F5A623] text-black px-2 py-0.5 rounded-full">
                            Active
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-[#9CA3AF] mt-0.5">
                        {formatDate(md.startDate)} to {formatDate(md.endDate)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {isCurrentMd && (
                      <div className="w-24 hidden sm:block">
                        <div className="flex justify-between text-[10px] text-[#9CA3AF] mb-1 font-mono">
                          <span>Elapsed</span>
                          <span>{pct}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-[#1E2433] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Sub-Antardashas List */}
                {isExpanded && (
                  <div className="border-t border-[#1E2433] bg-[#0A0E17] p-3 pl-8 space-y-1.5">
                    <div className="text-[10px] uppercase font-mono tracking-wider text-[#A0AEC0] mb-2">
                      Antardashas (Sub-Periods) under {md.lord} Mahadasha
                    </div>
                    {md.antardashas.map((ad, adIdx) => {
                      const isCurrentAd = isCurrentMd && ad.lord === dashaInfo.antardasha;
                      const adPct = calculateProgress(ad.startDate, ad.endDate);
                      const isAdExpanded = expandedAd === `${md.lord}-${ad.lord}`;

                      return (
                        <div
                          key={ad.lord + adIdx}
                          className={`rounded-lg border p-2.5 transition-all ${
                            isCurrentAd
                              ? 'border-[#F5A623]/40 bg-[#10141F]'
                              : 'border-[#1E2433]/60 bg-[#10141F]/40'
                          }`}
                        >
                          <div
                            onClick={() => setExpandedAd(isAdExpanded ? null : `${md.lord}-${ad.lord}`)}
                            className="flex items-center justify-between cursor-pointer"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-[#F5F5F7]">
                                {md.lord} — {ad.lord}
                              </span>
                              {isCurrentAd && (
                                <span className="text-[9px] uppercase font-bold bg-emerald-500 text-black px-1.5 py-0.2 rounded">
                                  Current Bhukti
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-[#9CA3AF] font-mono">
                              {formatDate(ad.startDate)} ~ {formatDate(ad.endDate)}
                            </div>
                          </div>

                          {/* Pratyantardashas */}
                          {isAdExpanded && ad.pratyantardashas && (
                            <div className="mt-2 pt-2 border-t border-[#1E2433] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                              {ad.pratyantardashas.map((pd, pdIdx) => {
                                const isCurrentPd = isCurrentAd && pd.lord === dashaInfo.pratyantardasha;
                                return (
                                  <div
                                    key={pd.lord + pdIdx}
                                    className={`p-2 rounded border text-xs font-mono ${
                                      isCurrentPd
                                        ? 'border-amber-400/50 bg-amber-500/10 text-amber-300 font-bold'
                                        : 'border-[#1E2433] bg-[#0A0E17] text-[#A0AEC0]'
                                    }`}
                                  >
                                    <div className="flex items-center justify-between">
                                      <span>PD: {pd.lord}</span>
                                      {isCurrentPd && <span className="text-[9px] text-amber-400">★ NOW</span>}
                                    </div>
                                    <div className="text-[10px] text-[#718096] mt-0.5">
                                      {formatDate(pd.startDate)} - {formatDate(pd.endDate)}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
