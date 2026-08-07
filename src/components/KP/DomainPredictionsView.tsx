import React, { useState } from 'react';
import { KPChart, TopicEnum, KPVerdict } from '../../types/kp';
import { generateKPVerdict } from '../../lib/kp/kpVerdictEngine';
import { CheckCircle2, Clock, AlertTriangle, ChevronRight, X, Sparkles, ShieldCheck } from 'lucide-react';

interface DomainPredictionsViewProps {
  chart: KPChart;
}

const DOMAINS: { name: string; topic: TopicEnum; house: number; icon: string; description: string }[] = [
  { name: 'FINANCE & WEALTH', topic: 'FINANCE', house: 2, icon: '💰', description: 'Accumulation of wealth, assets, and liquid financial inflows' },
  { name: 'MARRIAGE & UNION', topic: 'MARRIAGE', house: 7, icon: '💍', description: 'Life partnership, marital harmony, and legal contracts' },
  { name: 'CAREER & STATUS', topic: 'CAREER', house: 10, icon: '💼', description: 'Professional advancement, leadership, and public reputation' },
  { name: 'HEALTH & VITALITY', topic: 'HEALTH', house: 1, icon: '🏥', description: 'Physical stamina, illness resistance, and overall longevity' },
  { name: 'EDUCATION & INTELLECT', topic: 'EDUCATION', house: 5, icon: '📚', description: 'Higher studies, academic success, and analytical intelligence' },
  { name: 'CHILDREN & LINEAGE', topic: 'CHILDREN', house: 5, icon: '👨‍👩‍👧‍👦', description: 'Progeny prospects, child welfare, and creative inheritance' }
];

export const DomainPredictionsView: React.FC<DomainPredictionsViewProps> = ({ chart }) => {
  const [activeModalDomain, setActiveModalDomain] = useState<{ domainName: string; icon: string; verdict: KPVerdict; house: number } | null>(null);

  // Compute verdicts for summary ranking
  const domainVerdicts = DOMAINS.map(d => ({
    ...d,
    verdict: generateKPVerdict({ question: `How is my ${d.name}?`, topic: d.topic, relevantHouse: d.house }, chart),
    cusp: chart.houses.find(h => h.number === d.house) || chart.houses[0]
  }));

  const favorableDomains = domainVerdicts.filter(d => d.verdict.promise === 'YES');
  const delayedDomains = domainVerdicts.filter(d => d.verdict.promise === 'DELAYED');
  const challengingDomains = domainVerdicts.filter(d => d.verdict.promise === 'NO');

  return (
    <div className="space-y-6">
      {/* Overview Banner & Ranking Summary */}
      <div className="bg-ds-surface border border-ds-secondary/15 rounded-ds-xl p-4 sm:p-6 shadow-ds-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-ds-secondary/15 pb-3">
          <div>
            <h3 className="text-base sm:text-lg font-serif font-bold text-ds-secondary flex items-center gap-2">
              <span className="text-ds-primary">📊</span> 6-Domain KP Life Assessment Grid
            </h3>
            <p className="text-xs text-ds-on-surface-variant mt-0.5">
              Systematic evaluation of key life areas based on corresponding house cusp sub lord gatekeepers
            </p>
          </div>
          <span className="text-xs font-mono bg-ds-primary/10 text-ds-primary px-3 py-1 rounded-full border border-ds-primary/30 self-start sm:self-auto">
            6 Pillars Verified
          </span>
        </div>

        {/* Domain Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="bg-ds-success-green/10 border border-ds-success-green/20 p-3 rounded-ds-lg text-ds-success-green">
            <span className="font-bold block mb-1">🟢 High Opportunity Pillars ({favorableDomains.length})</span>
            <span className="text-ds-success-green/90">
              {favorableDomains.map(d => d.name).join(', ') || 'None currently active'}
            </span>
          </div>

          <div className="bg-ds-warning-amber/10 border border-ds-warning-amber/20 p-3 rounded-ds-lg text-ds-warning-amber">
            <span className="font-bold block mb-1">🟡 Pillars Needing Patience ({delayedDomains.length})</span>
            <span className="text-ds-warning-amber/90">
              {delayedDomains.map(d => d.name).join(', ') || 'None'}
            </span>
          </div>

          <div className="bg-ds-error-crimson/10 border border-ds-error-crimson/20 p-3 rounded-ds-lg text-ds-error-crimson">
            <span className="font-bold block mb-1">🔴 Areas Requiring Caution ({challengingDomains.length})</span>
            <span className="text-ds-error-crimson/90">
              {challengingDomains.map(d => d.name).join(', ') || 'None'}
            </span>
          </div>
        </div>
      </div>

      {/* Grid of 6 Domain Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {domainVerdicts.map((domain) => {
          const { verdict, cusp } = domain;

          return (
            <div
              key={domain.name}
              className="bg-ds-surface border border-ds-secondary/15 hover:border-ds-primary/50 rounded-ds-xl p-5 space-y-4 shadow-ds-sm transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-2xl">{domain.icon}</span>
                    <h4 className="text-sm font-bold text-ds-secondary mt-1">{domain.name}</h4>
                    <p className="text-[11px] text-ds-on-surface-variant line-clamp-1">{domain.description}</p>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                      verdict.promise === 'YES'
                        ? 'bg-ds-success-green/15 text-ds-success-green border-ds-success-green/30'
                        : verdict.promise === 'DELAYED'
                        ? 'bg-ds-warning-amber/15 text-ds-warning-amber border-ds-warning-amber/30'
                        : 'bg-ds-error-crimson/15 text-ds-error-crimson border-ds-error-crimson/30'
                    }`}
                  >
                    {verdict.promise === 'YES' && <CheckCircle2 className="w-3 h-3 inline mr-1" />}
                    {verdict.promise === 'DELAYED' && <Clock className="w-3 h-3 inline mr-1" />}
                    {verdict.promise === 'NO' && <AlertTriangle className="w-3 h-3 inline mr-1" />}
                    {verdict.promise}
                  </span>
                </div>

                {/* Sub Lord & Confidence Score */}
                <div className="bg-ds-surface-container border border-ds-secondary/10 rounded-ds-lg p-3 space-y-2 text-xs">
                  <div className="flex justify-between text-ds-on-surface-variant">
                    <span>House {domain.house} Cusp Sub Lord:</span>
                    <strong className="text-ds-primary">{cusp.subLord}</strong>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-ds-on-surface-variant">Confidence:</span>
                      <span className="font-bold text-ds-secondary">{verdict.confidenceScore || 85}% ({verdict.confidence})</span>
                    </div>
                    <div className="w-full bg-ds-secondary/15 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-ds-success-green to-ds-primary h-full rounded-full"
                        style={{ width: `${verdict.confidenceScore || 85}%` }}
                      />
                    </div>
                  </div>
                </div>

                <p className="text-xs text-ds-on-surface-variant leading-relaxed line-clamp-3">
                  {verdict.explanation}
                </p>
              </div>

              <button
                onClick={() => setActiveModalDomain({ domainName: domain.name, icon: domain.icon, verdict, house: domain.house })}
                className="w-full py-2 rounded-ds-lg bg-ds-surface-container hover:bg-ds-primary/10 border border-ds-secondary/15 hover:border-ds-primary/40 text-xs font-semibold text-ds-primary transition-all flex items-center justify-center gap-1.5 cursor-pointer focus-ring"
              >
                Full 8-Step Analysis <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Detail Modal */}
      {activeModalDomain && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-ds-surface border border-ds-secondary/20 max-w-2xl w-full rounded-ds-xl p-6 space-y-5 shadow-ds-elevated max-h-[90vh] overflow-y-auto animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-ds-secondary/15 pb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{activeModalDomain.icon}</span>
                <div>
                  <h3 className="text-lg font-serif font-bold text-ds-secondary">
                    {activeModalDomain.domainName} — Full KP Analysis
                  </h3>
                  <p className="text-xs text-ds-on-surface-variant">
                    Relevant House {activeModalDomain.house} Cusp Sub Lord Gatekeeper Verdict
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveModalDomain(null)}
                className="p-1.5 rounded-ds-lg bg-ds-surface-container hover:bg-ds-secondary/10 text-ds-on-surface-variant hover:text-ds-secondary cursor-pointer focus-ring"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Verdict Summary Bar */}
            <div className="bg-ds-surface-container border border-ds-secondary/15 p-4 rounded-ds-lg flex items-center justify-between">
              <div>
                <span className="text-xs text-ds-on-surface-variant block">Verdict Promise</span>
                <span className="text-sm font-bold text-ds-primary">{activeModalDomain.verdict.promise} ({activeModalDomain.verdict.quality})</span>
              </div>
              <div className="text-right">
                <span className="text-xs text-ds-on-surface-variant block">Confidence Score</span>
                <span className="text-sm font-bold text-ds-success-green">{activeModalDomain.verdict.confidenceScore || 85}%</span>
              </div>
            </div>

            {/* 8-Step Verification List */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-ds-primary uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" /> 8-Step KP Verification Steps
              </h4>
              {activeModalDomain.verdict.steps.map((step) => (
                <div key={step.stepNumber} className="bg-ds-surface-container border border-ds-secondary/15 rounded-ds-md p-3 text-xs space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-ds-secondary">Step {step.stepNumber}: {step.title}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      step.status === 'PASSED' ? 'bg-ds-success-green/15 text-ds-success-green border border-ds-success-green/30' : 'bg-ds-warning-amber/15 text-ds-warning-amber border border-ds-warning-amber/30'
                    }`}>
                      {step.status}
                    </span>
                  </div>
                  <p className="text-ds-on-surface-variant">{step.description}</p>
                </div>
              ))}
            </div>

            <button
              onClick={() => setActiveModalDomain(null)}
              className="w-full py-2.5 rounded-ds-lg bg-ds-primary text-ds-on-primary font-bold text-xs hover:brightness-110 cursor-pointer focus-ring"
            >
              Close Analysis Window
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
