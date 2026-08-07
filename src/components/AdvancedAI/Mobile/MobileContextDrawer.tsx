import React from 'react';
import { X, ChevronDown, Download, MapPin, Calendar, Clock, Sparkles, ShieldCheck } from 'lucide-react';
import { ContextData } from '../../AdvancedAITab/index';
import { BirthDetails } from '../../../types';

interface MobileContextDrawerProps {
  data: ContextData;
  birthDetails: BirthDetails;
  isOpen: boolean;
  onClose: () => void;
  onOpenInspector?: () => void;
  onExportReport?: () => void;
}

export const MobileContextDrawer: React.FC<MobileContextDrawerProps> = ({
  data,
  birthDetails,
  isOpen,
  onClose,
  onOpenInspector,
  onExportReport
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Slide-Up Drawer */}
      <div className="relative w-full max-w-lg bg-ds-surface border-t border-ds-secondary/15 rounded-t-3xl shadow-2xl z-10 max-h-[85vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-250 text-ds-on-surface">
        {/* Drag Handle & Close Header */}
        <div className="flex flex-col items-center pt-2.5 pb-2 px-4 border-b border-ds-secondary/15 bg-ds-surface-container relative">
          <div className="w-10 h-1 bg-ds-secondary/20 rounded-full mb-2 cursor-pointer" onClick={onClose} />
          <div className="w-full flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-ds-primary font-mono">
              <Sparkles className="w-3.5 h-3.5" />
              <span>KP ASTROLOGICAL CONTEXT</span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-full bg-ds-surface hover:bg-ds-surface-container text-ds-on-surface-variant hover:text-ds-on-surface cursor-pointer"
              aria-label="Close Context"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Context Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-ds-surface/50">
          {/* Section 1: Birth Details */}
          <section className="p-3 bg-ds-surface border border-ds-secondary/15 rounded-2xl space-y-1.5">
            <div className="flex items-center gap-2 text-[11px] font-mono font-bold text-ds-on-surface-variant uppercase tracking-wider">
              <span>📍 Birth Context</span>
            </div>
            <p className="text-sm font-bold text-ds-on-surface">
              {birthDetails.name || 'Native'}
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs text-ds-on-surface-variant font-mono pt-1">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-ds-primary shrink-0" />
                <span>{birthDetails.date}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-ds-primary shrink-0" />
                <span>{birthDetails.time}</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-ds-on-surface-variant font-mono truncate pt-0.5">
              <MapPin className="w-3.5 h-3.5 text-ds-primary shrink-0" />
              <span className="truncate">{birthDetails.place || 'Unknown Location'}</span>
            </div>
          </section>

          {/* Section 2: Active Dasha */}
          <section className="p-3 bg-ds-surface border border-ds-secondary/15 rounded-2xl space-y-1">
            <div className="flex items-center gap-2 text-[11px] font-mono font-bold text-ds-on-surface-variant uppercase tracking-wider">
              <span>📊 Active Vimshottari Dasha</span>
            </div>
            <p className="text-xs font-bold text-ds-primary font-mono">
              {data.activeDasha.lord} Mahadasha ({data.activeDasha.startYear}–{data.activeDasha.endYear})
            </p>
            <p className="text-xs text-ds-on-surface">
              + {data.activeDasha.antardasha} Antardasha
            </p>
            <p className="text-[11px] text-ds-on-surface-variant italic">
              {data.activeDasha.periodText}
            </p>
          </section>

          {/* Section 3: House Focus & Sub Lord */}
          <section className="p-3 bg-ds-surface border border-ds-secondary/15 rounded-2xl space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-mono font-bold text-ds-on-surface-variant uppercase">
              <span>🏠 House Focus &amp; Sub Lord</span>
              <span className="text-ds-primary">House {data.houseFocus.house}</span>
            </div>
            <p className="text-xs font-semibold text-ds-on-surface">
              {data.houseFocus.domain}
            </p>
            <div className="p-2 bg-ds-surface-container border border-ds-secondary/15 rounded-xl space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-ds-on-surface-variant">Cusp Sub-Lord:</span>
                <span className="font-bold text-ds-primary font-mono">{data.cuspSubLord.lord}</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-ds-on-surface-variant">Significator Status:</span>
                <span className="text-ds-success-green font-mono">{data.cuspSubLord.strength}</span>
              </div>
            </div>
          </section>

          {/* Section 4: KP Verdict Promise */}
          <section className="p-3 bg-ds-primary/10 border border-ds-primary/30 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold text-ds-primary uppercase tracking-wider">
                ⭐ KP Structural Verdict
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold ${
                data.kpVerdict.verdict === 'YES'
                  ? 'bg-ds-success-green/20 text-ds-success-green border border-ds-success-green/30'
                  : data.kpVerdict.verdict === 'DELAYED'
                  ? 'bg-ds-primary/20 text-ds-primary border border-ds-primary/30'
                  : 'bg-ds-error-crimson/20 text-ds-error-crimson border border-ds-error-crimson/30'
              }`}>
                {data.kpVerdict.verdict} ({data.kpVerdict.confidence}%)
              </span>
            </div>

            <ul className="space-y-1 text-xs text-ds-on-surface pl-1">
              {data.kpVerdict.reasons.map((r, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-ds-primary font-bold">•</span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Section 5: Ruling Planets */}
          <section className="p-3 bg-ds-surface border border-ds-secondary/15 rounded-2xl space-y-1.5">
            <div className="text-[11px] font-mono font-bold text-ds-on-surface-variant uppercase">
              👥 Ruling Planets
            </div>
            <div className="flex items-center gap-2 flex-wrap pt-0.5">
              {data.rulingPlanets.map((p, idx) => (
                <span
                  key={`${p}-${idx}`}
                  className="px-2.5 py-1 bg-ds-surface-container border border-ds-primary/30 rounded-lg text-xs font-mono font-bold text-ds-primary"
                >
                  {p}
                </span>
              ))}
            </div>
          </section>
        </div>

        {/* Footer actions */}
        <div className="p-3 border-t border-[#2C3E50]/10 bg-[#FDFBF7] flex items-center gap-2">
          {onOpenInspector && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenInspector();
              }}
              className="flex-1 py-2 px-3 bg-white hover:bg-[#2C3E50]/5 border border-[#2C3E50]/10 text-teal-600 rounded-xl text-xs font-semibold font-mono flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
              <span>Quick Inspector</span>
            </button>
          )}

          {onExportReport && (
            <button
              type="button"
              onClick={onExportReport}
              className="flex-1 py-2 px-3 bg-[#E67E22] hover:bg-[#c95c1f] text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Report</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
