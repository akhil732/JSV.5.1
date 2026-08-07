import React, { useState } from 'react';
import { Sparkles, User, History, Download, ChevronDown, RefreshCw, X, Sliders } from 'lucide-react';
import { BirthDetails } from '../../types';

interface HeaderProps {
  birthDetails: BirthDetails;
  profiles?: any[];
  onSelectProfile?: (profile: any) => void;
  onOpenHistory: () => void;
  onDownloadReport: () => void;
  onOpenInspector: () => void;
  historyCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  birthDetails,
  profiles = [],
  onSelectProfile,
  onOpenHistory,
  onDownloadReport,
  onOpenInspector,
  historyCount = 0
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="ai-minimal-header flex items-center justify-between px-4 sm:px-6 py-3 border-b border-ds-secondary/15 bg-ds-surface/90 backdrop-blur-md sticky top-0 z-30 shadow-sm">
      {/* Left: User Badge / Profile Selection Dropdown */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-ds-surface-container border border-ds-secondary/15 hover:border-ds-primary/50 text-xs text-ds-secondary transition-all cursor-pointer shadow-2xs font-bold"
            aria-label="User Profile Dropdown"
          >
            <div className="w-5 h-5 rounded-full bg-ds-primary/10 text-ds-primary flex items-center justify-center font-bold text-[10px] border border-ds-primary/20">
              {birthDetails.name ? birthDetails.name[0].toUpperCase() : 'N'}
            </div>
            <span className="font-serif tracking-wide max-w-[140px] sm:max-w-[180px] truncate">
              {birthDetails.name || 'Native'}
            </span>
            <span className="text-[10px] text-ds-on-surface-variant hidden sm:inline font-mono font-bold">
              ({birthDetails.date})
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-ds-on-surface-variant" />
          </button>

          {dropdownOpen && (
            <div
              className="absolute left-0 mt-2 w-64 bg-ds-surface border border-ds-secondary/15 rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in duration-150"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="border-b border-ds-secondary/15 pb-2 mb-2">
                <p className="text-xs font-bold text-ds-secondary truncate font-serif">{birthDetails.name}</p>
                <p className="text-[11px] text-ds-on-surface-variant font-mono font-bold">
                  {birthDetails.date} at {birthDetails.time}
                </p>
                <p className="text-[11px] text-ds-on-surface-variant/60 truncate font-medium">{birthDetails.place}</p>
              </div>

              {profiles.length > 0 && (
                <div className="space-y-1">
                  <p className="text-[10px] font-mono uppercase tracking-wider text-ds-primary font-bold px-2 py-1">
                    Switch Profile
                  </p>
                  <div className="max-h-36 overflow-y-auto space-y-1 custom-scrollbar">
                    {profiles.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          if (onSelectProfile) onSelectProfile(p);
                          setDropdownOpen(false);
                        }}
                        className={`w-full text-left px-2 py-1.5 rounded-lg text-xs flex items-center justify-between hover:bg-ds-surface-container transition-colors ${
                          p.name === birthDetails.name ? 'text-ds-primary font-bold bg-ds-primary/10' : 'text-ds-secondary'
                        }`}
                      >
                        <span className="truncate">{p.name}</span>
                        <span className="text-[10px] text-ds-on-surface-variant/60 font-mono font-bold">{p.date}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={() => setDropdownOpen(false)}
                className="w-full mt-2 pt-2 border-t border-ds-secondary/15 text-center text-xs text-ds-on-surface-variant hover:text-ds-secondary font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* History Trigger Button */}
        <button
          onClick={onOpenHistory}
          className="px-3 py-1.5 rounded-xl bg-ds-surface-container border border-ds-secondary/15 hover:border-ds-primary/40 text-xs text-ds-secondary hover:text-ds-primary flex items-center gap-2 transition-all cursor-pointer relative shadow-2xs font-bold"
          title="Query History"
          aria-label="Open Query History"
        >
          <History className="w-4 h-4 text-ds-primary" />
          <span className="hidden sm:inline font-mono">History</span>
          {historyCount > 0 && (
            <span className="bg-ds-primary/10 text-ds-primary text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold border border-ds-primary/20">
              {historyCount}
            </span>
          )}
        </button>

        {/* Inspector Button */}
        <button
          onClick={onOpenInspector}
          className="px-3 py-1.5 rounded-xl bg-ds-surface-container border border-ds-secondary/15 hover:border-ds-success-green/40 text-xs text-ds-success-green flex items-center gap-2 transition-all cursor-pointer hidden md:flex shadow-2xs font-bold"
          title="Inspect Ground Truth Matrix"
          aria-label="Inspect Ground Truth Matrix"
        >
          <Sliders className="w-4 h-4 text-ds-success-green" />
          <span className="font-mono">Inspector</span>
        </button>

        {/* Download Report Button */}
        <button
          onClick={onDownloadReport}
          className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-ds-surface-container border border-ds-secondary/15 hover:border-ds-primary/40 text-xs text-ds-secondary hover:text-ds-primary flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs font-bold"
          title="Export Consultation Report"
          aria-label="Export Consultation Report"
        >
          <Download className="w-4 h-4 text-ds-primary" />
          <span className="hidden lg:inline font-mono">Export</span>
        </button>
      </div>
    </header>
  );
};
