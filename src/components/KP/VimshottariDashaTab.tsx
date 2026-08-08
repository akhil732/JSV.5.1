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

  const targetDate = new Date();

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
      <div className="bg-ds-surface border border-ds-primary/30 rounded-2xl p-6 shadow-ds-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-ds-primary/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-ds-secondary/15 pb-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-ds-primary" />
              <h2 className="text-xl font-serif font-bold text-ds-secondary">
                VIMSHOTTARI DASHA TIMELINE
              </h2>
            </div>
          </div>

          <div className="bg-ds-surface-container border border-ds-secondary/15 px-4 py-2 rounded-xl flex items-center gap-3">
            <Clock className="w-4 h-4 text-ds-primary" />
            <div className="text-xs">
              <span className="text-ds-on-surface-variant">Active MD Balance:</span>{' '}
              <strong className="text-ds-primary font-mono">{dashaInfo.remainingBalanceYears.toFixed(2)} Years</strong>
            </div>
          </div>
        </div>

        {/* 3 Active Dasha Tiers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Mahadasha Card */}
          <div className="bg-ds-surface-container border border-ds-primary/40 rounded-xl p-4 space-y-3 relative">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wider font-bold text-ds-primary bg-ds-primary/10 px-2 py-0.5 rounded">
                Mahadasha (Major)
              </span>
              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-3 h-3" /> ACTIVE
              </span>
            </div>
            <div>
              <div className="text-2xl font-serif font-bold text-ds-secondary tracking-wide">
                {dashaInfo.mahadasha}
              </div>
              <p className="text-[11px] text-ds-on-surface-variant mt-0.5">
                {formatDate(dashaInfo.mahadashaStart)} — {formatDate(dashaInfo.mahadashaEnd)}
              </p>
            </div>
          </div>

          {/* Antardasha Card */}
          <div className="bg-ds-surface-container border border-ds-primary/30 rounded-xl p-4 space-y-3 relative">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wider font-bold text-ds-primary bg-ds-primary/10 px-2 py-0.5 rounded">
                Antardasha (Bhukti)
              </span>
              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-3 h-3" /> ACTIVE
              </span>
            </div>
            <div>
              <div className="text-2xl font-serif font-bold text-ds-secondary tracking-wide">
                {dashaInfo.antardasha}
              </div>
              <p className="text-[11px] text-ds-on-surface-variant mt-0.5">
                {formatDate(dashaInfo.antardashaStart)} — {formatDate(dashaInfo.antardashaEnd)}
              </p>
            </div>
          </div>

          {/* Pratyantardasha Card */}
          <div className="bg-ds-surface-container border border-ds-secondary/15 rounded-xl p-4 space-y-3 relative">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wider font-bold text-ds-on-surface-variant bg-ds-surface px-2 py-0.5 rounded border border-ds-secondary/10">
                Pratyantardasha (Sub-Sub)
              </span>
              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-3 h-3" /> ACTIVE
              </span>
            </div>
            <div>
              <div className="text-2xl font-serif font-bold text-ds-secondary tracking-wide">
                {dashaInfo.pratyantardasha}
              </div>
              <p className="text-[11px] text-ds-on-surface-variant mt-0.5">
                {dashaInfo.pratyantardashaStart ? formatDate(dashaInfo.pratyantardashaStart) : 'Active'} — {dashaInfo.pratyantardashaEnd ? formatDate(dashaInfo.pratyantardashaEnd) : 'Active'}
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Dasha Cycle Tree Table */}
      <div className="bg-ds-surface border border-ds-secondary/15 rounded-2xl p-5 shadow-ds-sm space-y-4">
        <div className="flex items-center justify-between border-b border-ds-secondary/15 pb-3">
          <h3 className="text-base font-serif font-bold text-ds-secondary flex items-center gap-2">
            <Calendar className="w-4 h-4 text-ds-primary" />
            Full 120-Year Mahadasha Sequence
          </h3>
          <span className="text-xs text-ds-on-surface-variant">
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
                    ? 'border-ds-primary/50 bg-ds-primary/10'
                    : 'border-ds-secondary/15 bg-ds-surface-container hover:border-ds-primary/30'
                }`}
              >
                {/* Mahadasha Header Row */}
                <div
                  onClick={() => setExpandedMd(isExpanded ? null : md.lord)}
                  className="p-3.5 px-4 flex items-center justify-between cursor-pointer select-none"
                >
                  <div className="flex items-center gap-3">
                    <button className="text-ds-on-surface-variant hover:text-ds-secondary">
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-ds-primary" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-ds-secondary font-serif">
                          {md.lord} Mahadasha
                        </span>
                        <span className="text-[10px] text-ds-on-surface-variant font-mono">
                          ({md.totalDuration} Yrs)
                        </span>
                        {isCurrentMd && (
                          <span className="text-[9px] uppercase font-bold bg-ds-primary text-ds-on-primary px-2 py-0.5 rounded-full">
                            Active
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-ds-on-surface-variant mt-0.5">
                        {formatDate(md.startDate)} to {formatDate(md.endDate)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {isCurrentMd && (
                      <div className="w-24 hidden sm:block">
                        <div className="flex justify-between text-[10px] text-ds-on-surface-variant mb-1 font-mono">
                          <span>Elapsed</span>
                          <span>{pct}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-ds-secondary/15 rounded-full overflow-hidden">
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
                  <div className="border-t border-ds-secondary/15 bg-ds-surface p-3 pl-8 space-y-1.5">
                    <div className="text-[10px] uppercase font-mono tracking-wider text-ds-on-surface-variant mb-2">
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
                              ? 'border-ds-primary/40 bg-ds-primary/5'
                              : 'border-ds-secondary/15 bg-ds-surface-container'
                          }`}
                        >
                          <div
                            onClick={() => setExpandedAd(isAdExpanded ? null : `${md.lord}-${ad.lord}`)}
                            className="flex items-center justify-between cursor-pointer"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-ds-secondary">
                                {md.lord} — {ad.lord}
                              </span>
                              {isCurrentAd && (
                                <span className="text-[9px] uppercase font-bold bg-emerald-500 text-white px-1.5 py-0.2 rounded">
                                  Current Bhukti
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-ds-on-surface-variant font-mono">
                              {formatDate(ad.startDate)} ~ {formatDate(ad.endDate)}
                            </div>
                          </div>

                          {/* Pratyantardashas */}
                          {isAdExpanded && ad.pratyantardashas && (
                            <div className="mt-2 pt-2 border-t border-ds-secondary/15 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                              {ad.pratyantardashas.map((pd, pdIdx) => {
                                const isCurrentPd = isCurrentAd && pd.lord === dashaInfo.pratyantardasha;
                                return (
                                  <div
                                    key={pd.lord + pdIdx}
                                    className={`p-2 rounded border text-xs font-mono ${
                                      isCurrentPd
                                        ? 'border-amber-400/50 bg-amber-500/10 text-amber-600 dark:text-amber-300 font-bold'
                                        : 'border-ds-secondary/15 bg-ds-surface text-ds-on-surface-variant'
                                    }`}
                                  >
                                    <div className="flex items-center justify-between">
                                      <span>PD: {pd.lord}</span>
                                      {isCurrentPd && <span className="text-[9px] text-amber-500 font-bold">★ NOW</span>}
                                    </div>
                                    <div className="text-[10px] text-ds-on-surface-variant/80 mt-0.5">
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
