import React, { useState } from 'react';
import { Printer, HelpCircle, X, BookOpen, Layers } from 'lucide-react';

export const RVAFloatingTools: React.FC = () => {
  const [showDocsModal, setShowDocsModal] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-center space-y-2.5 print:hidden">
        <button
          onClick={handlePrint}
          title="Print or Save PDF Report"
          className="w-11 h-11 rounded-2xl bg-ds-surface text-ds-secondary border border-ds-secondary/20 shadow-lg flex items-center justify-center hover:bg-ds-primary hover:text-white transition-all cursor-pointer active:scale-95"
        >
          <Printer className="w-5 h-5" />
        </button>

        <button
          onClick={() => setShowDocsModal(true)}
          title="RVA Software Documentation"
          className="w-11 h-11 rounded-2xl sacred-gradient text-white shadow-lg flex items-center justify-center hover:opacity-90 transition-all cursor-pointer active:scale-95"
        >
          <HelpCircle className="w-5 h-5" />
        </button>
      </div>

      {/* Docs Modal */}
      {showDocsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ds-secondary/40 backdrop-blur-xs p-4">
          <div className="bg-ds-surface border border-ds-secondary/20 rounded-3xl max-w-lg w-full p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-ds-secondary/15 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl sacred-gradient text-white flex items-center justify-center font-bold text-xs">
                  RVA
                </div>
                <div>
                  <h3 className="font-serif font-bold text-ds-secondary text-lg">
                    RVA Astrology Software Guide
                  </h3>
                  <p className="text-xs text-ds-on-surface-variant font-medium">
                    Technical Architecture & Calculation Methodologies
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDocsModal(false)}
                className="p-1.5 rounded-xl hover:bg-ds-surface-container text-ds-on-surface-variant transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-ds-on-surface leading-relaxed max-h-[60vh] overflow-y-auto pr-1">
              <div className="p-3 bg-ds-surface-container/60 rounded-2xl border border-ds-secondary/10 space-y-1">
                <strong className="text-ds-primary font-serif text-sm block">1. KP System (Krishnamurti Padhdhati)</strong>
                <p className="text-ds-on-surface-variant">
                  Employs Placidus house cusps with exact sub-lord division, 4-fold ABCD significators matrix, and Vimshottari dasha timing.
                </p>
              </div>

              <div className="p-3 bg-ds-surface-container/60 rounded-2xl border border-ds-secondary/10 space-y-1">
                <strong className="text-ds-primary font-serif text-sm block">2. Ashtakavarga Transit Graph</strong>
                <p className="text-ds-on-surface-variant">
                  Tracks cumulative Sarvashtakavarga transit points across 12 signs over 2026—2027 to identify high-potential transits.
                </p>
              </div>

              <div className="p-3 bg-ds-surface-container/60 rounded-2xl border border-ds-secondary/10 space-y-1">
                <strong className="text-ds-primary font-serif text-sm block">3. Triple Chart Suite</strong>
                <p className="text-ds-on-surface-variant">
                  Provides synchronized side-by-side view of Natal (D1), Secondary Progression (1 day = 1 year rate), and live Gochara Transit.
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-ds-secondary/15">
              <button
                onClick={() => setShowDocsModal(false)}
                className="px-4 py-2 bg-ds-secondary text-ds-on-secondary text-xs font-bold rounded-xl cursor-pointer hover:bg-ds-secondary/90 transition-all"
              >
                Close Guide
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
