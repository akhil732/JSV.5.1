import React, { useState } from 'react';
import { ArrowLeft, X, ChevronDown, ChevronUp, ShieldCheck, CheckCircle2, AlertCircle, Clock, Star, Sliders, ExternalLink, Download } from 'lucide-react';
import { ContextData } from './ContextChips';

interface ContextDrawerProps {
  data: ContextData;
  onClose: () => void;
  onOpenInspector?: () => void;
  onExportReport?: () => void;
}

export const ContextDrawer: React.FC<ContextDrawerProps> = ({
  data,
  onClose,
  onOpenInspector,
  onExportReport
}) => {
  const [expandedSection, setExpandedSection] = useState<string | null>('house');

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const isVerdictYes = data.kpVerdict.verdict === 'YES';
  const isVerdictNo = data.kpVerdict.verdict === 'NO';

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="fixed right-0 top-0 bottom-0 w-full sm:w-[420px] bg-ds-surface border-l border-ds-secondary/15 z-50 flex flex-col shadow-2xl animate-in slide-in-from-right duration-300 text-ds-on-surface">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-ds-secondary/15 bg-ds-surface-container">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 text-xs font-mono text-ds-primary hover:text-ds-primary/80 cursor-pointer font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Consultation</span>
          </button>
          <h2 className="text-sm font-serif font-bold text-ds-on-surface">
            Birth Chart Context
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-ds-surface border border-ds-secondary/15 text-ds-on-surface-variant hover:text-ds-on-surface cursor-pointer shadow-xs"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
          {/* Vedic Promise Badge Card */}
          <section className={`p-4 rounded-2xl border ${
            isVerdictYes
              ? 'bg-ds-success-green/10 border-ds-success-green/40 text-ds-success-green'
              : isVerdictNo
              ? 'bg-ds-error-crimson/10 border-ds-error-crimson/40 text-ds-error-crimson'
              : 'bg-ds-primary/10 border-ds-primary/40 text-ds-primary'
          } space-y-2.5 shadow-xs`}>
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-[10px] uppercase tracking-wider text-ds-on-surface-variant">
                Vedic Chart Promise Verdict
              </span>
              <span className={`px-2.5 py-1 rounded-full font-mono font-extrabold text-xs shadow-sm ${
                isVerdictYes
                  ? 'bg-ds-success-green text-white'
                  : isVerdictNo
                  ? 'bg-ds-error-crimson text-white'
                  : 'bg-ds-primary text-white'
              }`}>
                {data.kpVerdict.verdict} ({data.kpVerdict.confidence}%)
              </span>
            </div>

            {data.kpVerdict.reasons && data.kpVerdict.reasons.length > 0 && (
              <ul className="space-y-1 pl-4 list-disc text-xs text-ds-on-surface font-medium">
                {data.kpVerdict.reasons.map((reason, idx) => (
                  <li key={idx}>{reason}</li>
                ))}
              </ul>
            )}
          </section>

          {/* Active Dasha Section */}
          <section className="bg-ds-surface-container border border-ds-secondary/15 rounded-2xl p-4 space-y-2 shadow-xs">
            <h3 className="font-mono font-bold text-[11px] uppercase tracking-wider text-ds-primary flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>Vimshottari Dasha Period</span>
            </h3>
            <div className="space-y-1">
              <p className="text-sm font-bold text-ds-on-surface">
                {data.activeDasha.lord} Mahadasha
                {data.activeDasha.startYear && ` (${data.activeDasha.startYear}–${data.activeDasha.endYear})`}
              </p>
              <p className="text-xs text-ds-secondary font-mono font-bold">
                + {data.activeDasha.antardasha} Antardasha {data.activeDasha.periodText && `(${data.activeDasha.periodText})`}
              </p>
            </div>
          </section>

          {/* House Focus Section */}
          <section className="bg-ds-surface-container border border-ds-secondary/15 rounded-2xl p-4 space-y-2 shadow-xs">
            <div className="flex items-center justify-between">
              <h3 className="font-mono font-bold text-[11px] uppercase tracking-wider text-ds-secondary">
                House & Divisional Focus
              </h3>
              <button
                onClick={() => toggleSection('house')}
                className="text-xs text-ds-primary hover:underline flex items-center gap-1 cursor-pointer font-bold"
              >
                {expandedSection === 'house' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                <span>{expandedSection === 'house' ? 'Collapse' : 'Expand'}</span>
              </button>
            </div>

            <p className="text-sm font-bold text-ds-on-surface">
              House {data.houseFocus.house} ({data.houseFocus.domain})
            </p>

            {expandedSection === 'house' && (
              <div className="pt-2 border-t border-ds-secondary/15 space-y-1.5 text-ds-on-surface-variant text-xs leading-relaxed animate-in fade-in font-medium">
                <p>
                  Grounded in D1 Rasi & Divisional Chart alignment. House {data.houseFocus.house} governs primary significations for {data.houseFocus.domain}.
                </p>
                <div className="p-2 rounded bg-ds-surface border border-ds-secondary/15 font-mono text-[11px] text-ds-on-surface">
                  <span>House Lord: </span>
                  <strong className="text-ds-primary">{data.cuspSubLord.lord}</strong>
                </div>
              </div>
            )}
          </section>

          {/* House Lord Details */}
          <section className="bg-ds-surface-container border border-ds-secondary/15 rounded-2xl p-4 space-y-2 shadow-xs">
            <h3 className="font-mono font-bold text-[11px] uppercase tracking-wider text-ds-success-green">
              House Lord & Dignity Evaluation
            </h3>
            <div className="space-y-1.5 text-xs text-ds-on-surface-variant">
              <div className="flex items-center justify-between">
                <span className="font-medium">House Lord Planet:</span>
                <strong className="text-ds-primary font-mono text-sm">{data.cuspSubLord.lord}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Significator Strength:</span>
                <span className="text-ds-success-green font-bold">{data.cuspSubLord.strength || 'Strong (✓)'}</span>
              </div>
              {data.cuspSubLord.placement && (
                <div className="flex items-center justify-between">
                  <span className="font-medium">Placement:</span>
                  <span className="text-ds-on-surface font-mono font-bold">{data.cuspSubLord.placement}</span>
                </div>
              )}
            </div>
          </section>

          {/* Key Astrological Factors */}
          <section className="bg-ds-surface-container border border-ds-secondary/15 rounded-2xl p-4 space-y-2 shadow-xs">
            <h3 className="font-mono font-bold text-[11px] uppercase tracking-wider text-ds-tertiary">
              Key Astrological Factors
            </h3>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {data.rulingPlanets.map((planet, idx) => (
                <span
                  key={`${planet}-${idx}`}
                  className="px-2.5 py-1 rounded-lg bg-ds-surface border border-ds-secondary/15 text-ds-primary font-mono font-bold text-xs shadow-sm"
                >
                  {planet}
                </span>
              ))}
            </div>
          </section>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-ds-secondary/15 bg-ds-surface-container flex gap-2">
          {onOpenInspector && (
            <button
              onClick={onOpenInspector}
              className="flex-1 py-2.5 px-3 rounded-xl bg-ds-success-green/10 hover:bg-ds-success-green/20 border border-ds-success-green/30 text-ds-success-green font-bold text-xs font-mono flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-sm"
            >
              <Sliders className="w-4 h-4" />
              <span>Full Analysis Matrix</span>
            </button>
          )}

          {onExportReport && (
            <button
              onClick={onExportReport}
              className="py-2.5 px-3 rounded-xl bg-ds-surface hover:bg-ds-surface-container border border-ds-secondary/15 text-ds-on-surface font-bold text-xs font-mono flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-sm"
            >
              <Download className="w-4 h-4 text-ds-primary" />
              <span>Export</span>
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default ContextDrawer;
