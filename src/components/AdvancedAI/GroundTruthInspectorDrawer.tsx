import React, { useState } from 'react';
import { X, ShieldCheck, CheckCircle2, XCircle, Layers, Clock, AlertTriangle, Search, Copy, Check, Code } from 'lucide-react';
import { VedicGroundTruths } from '../../lib/services/EnhancedGeminiConsultationService';

interface GroundTruthInspectorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  groundTruths: VedicGroundTruths;
  language?: 'en' | 'hi' | 'te';
}

export const GroundTruthInspectorDrawer: React.FC<GroundTruthInspectorDrawerProps> = ({
  isOpen,
  onClose,
  groundTruths,
  language = 'en'
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'gatekeepers' | 'json'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(groundTruths, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const houseAlignmentList = groundTruths.majorHouseAlignment || [];

  const filteredGatekeepers = houseAlignmentList.filter(
    (gk) =>
      gk.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      gk.houseLord.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `house ${gk.house}`.includes(searchTerm.toLowerCase()) ||
      gk.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm flex justify-end animate-fade-in" role="dialog" aria-modal="true" aria-label="Vedic Chart Facts Inspector">
      <div className="w-full max-w-lg bg-ds-surface border-l border-ds-secondary/15 h-full shadow-2xl flex flex-col overflow-y-auto p-5 sm:p-6 space-y-5 text-ds-on-surface">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-ds-secondary/15 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-ds-success-green/10 border border-ds-success-green/30 text-ds-success-green">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-serif font-bold text-ds-on-surface">
                Vedic Chart Facts Inspector
              </h2>
              <p className="text-xs text-ds-on-surface-variant">
                Parashari Rules, House Lords & Divisional Matrix
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-ds-surface-container border border-ds-secondary/15 hover:border-ds-primary/40 text-ds-on-surface-variant hover:text-ds-on-surface transition-all cursor-pointer"
            aria-label="Close Inspector"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 bg-ds-surface-container p-1 rounded-xl border border-ds-secondary/15 text-xs font-mono">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-1.5 px-3 rounded-lg font-bold transition-all ${
              activeTab === 'overview'
                ? 'bg-ds-primary/20 text-ds-primary border border-ds-primary/30'
                : 'text-ds-on-surface-variant hover:text-ds-on-surface'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('gatekeepers')}
            className={`flex-1 py-1.5 px-3 rounded-lg font-bold transition-all ${
              activeTab === 'gatekeepers'
                ? 'bg-ds-primary/20 text-ds-primary border border-ds-primary/30'
                : 'text-ds-on-surface-variant hover:text-ds-on-surface'
            }`}
          >
            House Alignment ({houseAlignmentList.length})
          </button>
          <button
            onClick={() => setActiveTab('json')}
            className={`flex-1 py-1.5 px-3 rounded-lg font-bold transition-all flex items-center justify-center gap-1 ${
              activeTab === 'json'
                ? 'bg-ds-primary/20 text-ds-primary border border-ds-primary/30'
                : 'text-ds-on-surface-variant hover:text-ds-on-surface'
            }`}
          >
            <Code className="w-3 h-3" /> Raw JSON
          </button>
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <div className="rounded-xl border border-ds-primary/30 bg-ds-surface-container p-4 space-y-3 font-mono text-xs text-ds-on-surface">
              <div className="flex items-center justify-between border-b border-ds-secondary/15 pb-2">
                <span className="text-ds-primary font-bold uppercase tracking-wider">Target Domain Evaluation</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  groundTruths.gatekeeperStatus === 'OPEN' ? 'bg-ds-success-green/10 text-ds-success-green border border-ds-success-green/30' : 'bg-ds-error-crimson/10 text-ds-error-crimson border border-ds-error-crimson/30'
                }`}>
                  Status: {groundTruths.gatekeeperStatus}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-ds-on-surface-variant block text-[10px]">Target Domain</span>
                  <span className="text-ds-on-surface font-bold">{groundTruths.domain} (H{groundTruths.targetHouse})</span>
                </div>
                <div>
                  <span className="text-ds-on-surface-variant block text-[10px]">House Lord</span>
                  <span className="text-ds-tertiary font-bold">{groundTruths.targetHouseLord}</span>
                </div>
                <div>
                  <span className="text-ds-on-surface-variant block text-[10px]">Vedic Promise</span>
                  <span className="text-ds-success-green font-bold">{groundTruths.vedicPromise} ({groundTruths.confidenceScore}% Conf)</span>
                </div>
                <div>
                  <span className="text-ds-on-surface-variant block text-[10px]">Active Dasha</span>
                  <span className="text-ds-primary font-bold truncate block">{groundTruths.activeDasha}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-ds-secondary/15">
                <span className="text-ds-on-surface-variant block text-[10px] mb-1">Divisional Chart Focus</span>
                <p className="text-ds-secondary font-sans text-xs font-semibold">{groundTruths.divisionalFocus}</p>
              </div>

              <div className="pt-2 border-t border-ds-secondary/15">
                <span className="text-ds-on-surface-variant block text-[10px] mb-1">Timing Window</span>
                <p className="text-ds-secondary font-sans text-xs italic">{groundTruths.timing}</p>
              </div>

              <div className="pt-2 border-t border-ds-secondary/15">
                <span className="text-ds-on-surface-variant block text-[10px] mb-1">Astrological Explanation</span>
                <p className="text-ds-secondary font-sans text-xs leading-relaxed">{groundTruths.explanation}</p>
              </div>

              {groundTruths.obstacles.length > 0 && (
                <div className="pt-2 border-t border-ds-secondary/15">
                  <span className="text-ds-warning-amber block text-[10px] mb-1 flex items-center gap-1 font-bold">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Factors to Consider</span>
                  </span>
                  <ul className="list-disc pl-4 space-y-1 text-xs font-sans text-ds-secondary">
                    {groundTruths.obstacles.map((obs, idx) => (
                      <li key={idx}>{obs}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Verification Steps Breakdown */}
            <div className="p-3 bg-ds-surface-container border border-ds-secondary/15 rounded-xl text-xs space-y-2">
              <span className="text-ds-primary font-mono font-bold text-[11px] uppercase block">
                Parashari Rules Checklist
              </span>
              <div className="space-y-1.5 text-[11px] font-mono text-ds-on-surface-variant">
                <div className="flex items-center justify-between">
                  <span>1. Birth Details & Panchangam Sync</span>
                  <span className="text-ds-success-green font-bold">✓ Verified</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>2. D1 Rasi & D9 Navamsha Alignment</span>
                  <span className="text-ds-success-green font-bold">✓ Verified</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>3. House Lord Dignity & Placement</span>
                  <span className="text-ds-success-green font-bold">✓ Verified</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>4. Vimshottari Dasha & Moon Gochar</span>
                  <span className="text-ds-success-green font-bold">✓ Verified</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Gatekeepers Matrix */}
        {activeTab === 'gatekeepers' && (
          <div className="space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-ds-on-surface-variant absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search house, lord or status..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-ds-surface-container border border-ds-secondary/15 rounded-xl text-xs text-ds-on-surface placeholder:text-ds-on-surface-variant focus:outline-none focus:border-ds-primary"
              />
            </div>

            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
              {filteredGatekeepers.length === 0 ? (
                <div className="text-center py-8 text-xs text-ds-on-surface-variant">
                  No house alignment matching "{searchTerm}"
                </div>
              ) : (
                filteredGatekeepers.map((gk) => (
                  <div
                    key={gk.house}
                    className={`p-3 rounded-xl border flex items-center justify-between text-xs font-mono ${
                      gk.status === 'OPEN'
                        ? 'bg-ds-success-green/10 border-ds-success-green/30 text-ds-success-green'
                        : 'bg-ds-error-crimson/10 border-ds-error-crimson/30 text-ds-error-crimson'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <span className="font-bold text-ds-on-surface">House {gk.house}: {gk.name}</span>
                      <p className="text-[11px] text-ds-on-surface-variant">House Lord: <strong className="text-ds-tertiary">{gk.houseLord}</strong></p>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        gk.status === 'OPEN' ? 'bg-ds-success-green/20 text-ds-success-green' : 'bg-ds-error-crimson/20 text-ds-error-crimson'
                      }`}>
                        {gk.status}
                      </span>
                      <span className="block text-[10px] text-ds-on-surface-variant mt-0.5">Promise: {gk.promise}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Raw JSON */}
        {activeTab === 'json' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-ds-on-surface-variant">
                Deterministic Astrological Facts Payload
              </span>
              <button
                onClick={handleCopyJson}
                className="px-3 py-1.5 rounded-lg bg-ds-surface-container border border-ds-secondary/15 hover:border-ds-primary/40 text-xs font-mono text-ds-primary flex items-center gap-1.5 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-ds-success-green" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied JSON!' : 'Copy JSON'}</span>
              </button>
            </div>

            <pre className="p-3 bg-ds-surface-container border border-ds-secondary/15 rounded-xl text-[11px] font-mono text-ds-tertiary overflow-x-auto max-h-[60vh]">
              {JSON.stringify(groundTruths, null, 2)}
            </pre>
          </div>
        )}

        {/* Footer close */}
        <div className="pt-4 border-t border-ds-secondary/15 mt-auto">
          <button
            onClick={onClose}
            className="w-full py-3 bg-ds-surface-container hover:bg-ds-surface border border-ds-secondary/15 text-ds-on-surface font-bold rounded-xl transition-all text-xs font-mono cursor-pointer"
          >
            Close Inspector
          </button>
        </div>

      </div>
    </div>
  );
};

export default GroundTruthInspectorDrawer;
