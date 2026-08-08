import React, { useState } from 'react';
import { KPChart, KPQuery, KPVerdict, TopicEnum } from '../../types/kp';
import { KPConsultationService } from '../../lib/services/KPConsultationService';
import { useLanguage } from '../../context/LanguageContext';
import { Sparkles, HelpCircle, CheckCircle2, Clock, AlertTriangle, ShieldCheck, Copy, Download, Share2, ChevronDown, ChevronUp, AlertCircle, Calendar, MessageSquare, ListTodo, GraduationCap } from 'lucide-react';

interface QueryVerdictPanelProps {
  chart: KPChart;
}

const PRESET_QUERIES: { label: string; question: string; topic: TopicEnum; house: number }[] = [
  { label: '💍 Marriage Timing', question: 'When will I get married?', topic: 'MARRIAGE', house: 7 },
  { label: '💼 Career Shift', question: 'Will I change jobs by end of 2026?', topic: 'CAREER', house: 10 },
  { label: '💰 Financial Growth', question: 'Will I experience wealth gains in 2026-2027?', topic: 'FINANCE', house: 2 },
  { label: '🏥 Health Outlook', question: 'What is my general health prognosis?', topic: 'HEALTH', house: 1 },
  { label: '📚 Higher Education', question: 'Will my educational pursuits succeed?', topic: 'EDUCATION', house: 5 },
  { label: '👨‍👩‍👧 Family & Children', question: 'What are the prospects for family expansion?', topic: 'CHILDREN', house: 5 }
];

export const QueryVerdictPanel: React.FC<QueryVerdictPanelProps> = ({ chart }) => {
  const { language } = useLanguage();
  const [selectedTopic, setSelectedTopic] = useState<TopicEnum>('MARRIAGE');
  const [relevantHouse, setRelevantHouse] = useState<number>(7);
  const [customQuestion, setCustomQuestion] = useState<string>('When will I get married?');
  const [verdict, setVerdict] = useState<KPVerdict | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [stepsExpanded, setStepsExpanded] = useState<boolean>(false);
  const [showScoreModal, setShowScoreModal] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const handleSelectPreset = (preset: typeof PRESET_QUERIES[0]) => {
    setSelectedTopic(preset.topic);
    setRelevantHouse(preset.house);
    setCustomQuestion(preset.question);
    runAnalysis({ question: preset.question, topic: preset.topic, relevantHouse: preset.house });
  };

  const runAnalysis = async (queryObj?: KPQuery) => {
    setIsAnalyzing(true);
    const query: KPQuery = queryObj || {
      question: customQuestion,
      topic: selectedTopic,
      relevantHouse
    };

    try {
      const res = await KPConsultationService.getKPVerdict(query, chart, language);
      setVerdict(res);
    } catch (e) {
      console.error('Error generating KP verdict:', e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCopyVerdict = () => {
    if (!verdict) return;
    const text = `KP ASTROLOGY VERDICT
Query: "${customQuestion}"
Promise: ${verdict.promise} (${verdict.quality})
Confidence Score: ${verdict.confidenceScore || 85}% (${verdict.confidence})
Timing: ${verdict.timing}
Explanation: ${verdict.explanation}
Cusp Sub Lord: ${verdict.reasoning.cuspSubLord}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-ds-surface border border-ds-secondary/15 rounded-2xl p-4 sm:p-6 shadow-ds-sm space-y-6">
      <div className="border-b border-ds-secondary/15 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base sm:text-lg font-serif font-bold text-ds-secondary flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-ds-primary" />
            KP Query Prediction Engine
          </h3>
          <p className="text-xs text-ds-on-surface-variant mt-0.5">
            Evaluates Krishnamurti Paddhati 8-step consultation chain & 5-factor confidence model
          </p>
        </div>
      </div>

      {/* Preset Buttons */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-ds-on-surface-variant uppercase tracking-wider block">
          Quick Sample Queries
        </label>
        <div className="flex flex-wrap gap-2">
          {PRESET_QUERIES.map((preset) => (
            <button
              key={preset.label}
              onClick={() => handleSelectPreset(preset)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                customQuestion === preset.question
                  ? 'bg-ds-primary/20 border-ds-primary text-ds-primary'
                  : 'bg-ds-surface-container border-ds-secondary/15 text-ds-on-surface-variant hover:text-ds-secondary hover:border-ds-primary/40'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Query Input Box */}
      <div className="space-y-3 pt-2">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-ds-on-surface-variant mb-1 block">
              Your Specific Question
            </label>
            <input
              type="text"
              value={customQuestion}
              onChange={(e) => setCustomQuestion(e.target.value)}
              placeholder="e.g. When will I get married?"
              className="w-full bg-ds-surface-container border border-ds-secondary/15 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-ds-secondary focus:outline-none focus:border-ds-primary transition-colors"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-ds-on-surface-variant mb-1 block">
              Relevant House
            </label>
            <select
              value={relevantHouse}
              onChange={(e) => setRelevantHouse(Number(e.target.value))}
              className="w-full bg-ds-surface-container border border-ds-secondary/15 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-ds-secondary focus:outline-none focus:border-ds-primary cursor-pointer"
            >
              <option value={1}>House I (Self & Longevity)</option>
              <option value={2}>House II (Wealth & Family)</option>
              <option value={3}>House III (Courage & Siblings)</option>
              <option value={4}>House IV (Property & Home)</option>
              <option value={5}>House V (Children & Education)</option>
              <option value={6}>House VI (Job & Health)</option>
              <option value={7}>House VII (Marriage & Union)</option>
              <option value={8}>House VIII (Transformation)</option>
              <option value={9}>House IX (Higher Knowledge & Fortune)</option>
              <option value={10}>House X (Career & Status)</option>
              <option value={11}>House XI (Gains & Fulfillment)</option>
              <option value={12}>House XII (Expenses & Foreign)</option>
            </select>
          </div>
        </div>

        <button
          onClick={() => runAnalysis()}
          disabled={isAnalyzing}
          className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-ds-primary hover:bg-ds-primary/90 text-white font-bold text-xs sm:text-sm shadow-ds-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          {isAnalyzing ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Evaluating KP Cusp Sub Lords...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" /> Analyze KP Verdict
            </>
          )}
        </button>
      </div>

      {/* Output Verdict Card */}
      {verdict && (
        <div className="bg-ds-surface-container border border-ds-secondary/15 rounded-xl p-5 space-y-6 animate-fade-in">
          {/* Header Bar with Quick Action Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ds-secondary/15 pb-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-ds-on-surface-variant block mb-1">
                KP PROMISE VERDICT
              </span>
              <div className="flex items-center gap-3">
                <span
                  className={`px-3.5 py-1 rounded-full text-xs sm:text-sm font-black border tracking-wider ${
                    verdict.promise === 'YES'
                      ? 'bg-ds-success-green/15 text-ds-success-green border-ds-success-green/40'
                      : verdict.promise === 'DELAYED'
                      ? 'bg-ds-warning-amber/15 text-ds-warning-amber border-ds-warning-amber/40'
                      : 'bg-ds-error-crimson/15 text-ds-error-crimson border-ds-error-crimson/40'
                  }`}
                >
                  {verdict.promise === 'YES' && <CheckCircle2 className="w-4 h-4 inline mr-1" />}
                  {verdict.promise === 'DELAYED' && <Clock className="w-4 h-4 inline mr-1" />}
                  {verdict.promise === 'NO' && <AlertTriangle className="w-4 h-4 inline mr-1" />}
                  PROMISE: {verdict.promise}
                </span>

                <span className="text-xs px-2.5 py-1 rounded-lg bg-ds-surface border border-ds-secondary/15 text-ds-secondary">
                  Quality: <strong className="text-ds-primary">{verdict.quality}</strong>
                </span>
              </div>
            </div>

            {/* Actions & Score */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="text-right">
                <button
                  onClick={() => setShowScoreModal(!showScoreModal)}
                  className="text-xs text-ds-on-surface-variant hover:text-ds-primary transition-colors flex items-center justify-end gap-1 cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-ds-success-green" />
                  <span>Confidence: <strong className="text-ds-secondary font-bold">{verdict.confidenceScore || 85}% ({verdict.confidence})</strong></span>
                  <HelpCircle className="w-3 h-3 text-ds-primary" />
                </button>
                <div className="w-28 h-2 bg-ds-secondary/15 rounded-full overflow-hidden mt-1">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-ds-success-green to-ds-primary"
                    style={{ width: `${verdict.confidenceScore || 85}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-1.5 border-l border-ds-secondary/15 pl-3">
                <button
                  onClick={handleCopyVerdict}
                  title="Copy Verdict text to clipboard"
                  className="p-2 rounded-xl bg-ds-surface hover:bg-ds-surface-container text-ds-on-surface-variant hover:text-ds-secondary border border-ds-secondary/15 transition-all cursor-pointer"
                >
                  <Copy className="w-4 h-4" />
                </button>
                {copied && <span className="text-[10px] text-ds-success-green font-bold">Copied!</span>}
              </div>
            </div>
          </div>

          {/* 5-Factor Score Breakdown Drawer */}
          {showScoreModal && (
            <div className="bg-ds-surface border border-ds-primary/30 rounded-xl p-4 text-xs space-y-3 animate-in fade-in duration-200">
              <div className="flex justify-between items-center border-b border-ds-secondary/15 pb-2 font-bold text-ds-primary">
                <span>5-Factor Mathematical Confidence Score Breakdown</span>
                <span>Total: {verdict.confidenceScore || 85}%</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center">
                <div className="bg-ds-surface-container p-2 rounded-lg border border-ds-secondary/15">
                  <span className="text-ds-on-surface-variant block text-[10px]">Gatekeeper (G)</span>
                  <strong className="text-emerald-600 dark:text-emerald-400 font-mono text-sm">
                    {((verdict.confidenceBreakdown?.gatekeeperScore ?? 1) * 100).toFixed(0)}%
                  </strong>
                </div>
                <div className="bg-ds-surface-container p-2 rounded-lg border border-ds-secondary/15">
                  <span className="text-ds-on-surface-variant block text-[10px]">Significators (S)</span>
                  <strong className="text-sky-600 dark:text-sky-400 font-mono text-sm">
                    {((verdict.confidenceBreakdown?.significatorScore ?? 0.8) * 100).toFixed(0)}%
                  </strong>
                </div>
                <div className="bg-ds-surface-container p-2 rounded-lg border border-ds-secondary/15">
                  <span className="text-ds-on-surface-variant block text-[10px]">Dasha (D)</span>
                  <strong className="text-purple-600 dark:text-purple-400 font-mono text-sm">
                    {((verdict.confidenceBreakdown?.dashaScore ?? 0.9) * 100).toFixed(0)}%
                  </strong>
                </div>
                <div className="bg-ds-surface-container p-2 rounded-lg border border-ds-secondary/15">
                  <span className="text-ds-on-surface-variant block text-[10px]">Transit (T)</span>
                  <strong className="text-amber-600 dark:text-amber-400 font-mono text-sm">
                    {((verdict.confidenceBreakdown?.transitScore ?? 0.85) * 100).toFixed(0)}%
                  </strong>
                </div>
                <div className="bg-ds-surface-container p-2 rounded-lg border border-ds-secondary/15">
                  <span className="text-ds-on-surface-variant block text-[10px]">Vedic D-9 (V)</span>
                  <strong className="text-emerald-600 dark:text-emerald-400 font-mono text-sm">
                    {((verdict.confidenceBreakdown?.vedicScore ?? 0.95) * 100).toFixed(0)}%
                  </strong>
                </div>
              </div>
            </div>
          )}

          {/* Interactive Gantt-style Dasha Timeline */}
          <div className="bg-ds-surface border border-ds-secondary/15 rounded-xl p-4 space-y-3">
            <h4 className="text-xs font-bold text-ds-primary uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-4 h-4" /> Dasha Timeline & Activation Window (Gantt Chart)
            </h4>
            <p className="text-xs text-ds-on-surface-variant">
              Current Mahadasha: <strong className="text-ds-secondary">{chart.currentDasha?.mahadasha || 'Mercury'}</strong> — Active Bhukti: <strong className="text-ds-primary">{chart.currentDasha?.antardasha || 'Venus'}</strong>
            </p>

            <div className="space-y-2 pt-1 text-xs">
              <div className="flex items-center gap-3">
                <span className="w-24 text-right font-medium text-ds-secondary truncate">{chart.currentDasha?.antardasha || 'Venus'} Bhukti</span>
                <div className="flex-1 bg-ds-surface-container h-6 rounded-lg overflow-hidden relative border border-emerald-500/40 p-0.5">
                  <div className="bg-emerald-500/20 h-full rounded text-[10px] font-bold text-emerald-600 dark:text-emerald-300 flex items-center px-2 w-[75%] border-r-2 border-emerald-400">
                    Active Timing Window (Highest Probability {verdict.confidenceScore || 85}%)
                  </div>
                </div>
                <span className="text-[11px] font-mono text-ds-on-surface-variant">Active Now</span>
              </div>

              <div className="flex items-center gap-3">
                <span className="w-24 text-right font-medium text-ds-on-surface-variant truncate">Next Bhukti</span>
                <div className="flex-1 bg-ds-surface-container h-6 rounded-lg overflow-hidden relative border border-ds-secondary/15 p-0.5">
                  <div className="bg-amber-500/10 h-full rounded text-[10px] font-semibold text-amber-600 dark:text-amber-400 flex items-center px-2 w-[50%] ml-[50%] border-r-2 border-amber-400">
                    Secondary Window (Alternative)
                  </div>
                </div>
                <span className="text-[11px] font-mono text-ds-on-surface-variant">2027-2028</span>
              </div>
            </div>
          </div>

          {/* Timing & Explanation */}
          <div className="space-y-3">
            {verdict.contextualization?.acknowledgment && (
              <div className="bg-ds-surface border border-ds-primary/30 rounded-xl p-3 text-xs sm:text-sm text-ds-primary italic leading-relaxed flex items-start gap-2.5">
                <MessageSquare className="w-4 h-4 text-ds-primary mt-0.5 flex-shrink-0" />
                <div>{verdict.contextualization.acknowledgment}</div>
              </div>
            )}

            <div>
              <h4 className="text-xs font-bold text-ds-primary uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Primary Timing Summary
              </h4>
              <p className="text-xs sm:text-sm text-ds-secondary font-semibold bg-ds-surface p-3 rounded-xl border border-ds-secondary/15">
                {verdict.timing}
              </p>
            </div>

            <div>
              <h4 className="text-xs font-bold text-ds-on-surface-variant uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-ds-primary" /> Analytical Commentary
              </h4>
              <p className="text-xs sm:text-sm text-ds-on-surface-variant leading-relaxed bg-ds-surface p-3 rounded-xl border border-ds-secondary/15">
                {verdict.explanation}
              </p>
            </div>

            {verdict.contextualization?.actionPlan && (
              <div className="bg-ds-surface border border-ds-secondary/15 rounded-xl p-4 space-y-2">
                <h4 className="text-xs font-bold text-ds-primary uppercase tracking-wider flex items-center gap-1.5">
                  <ListTodo className="w-4 h-4 text-ds-primary" /> Step-by-Step Action Plan
                </h4>
                <div className="text-xs sm:text-sm text-ds-on-surface-variant leading-relaxed whitespace-pre-line pl-5 border-l border-ds-primary/20">
                  {verdict.contextualization.actionPlan}
                </div>
              </div>
            )}

            {verdict.contextualization?.recommendations && verdict.contextualization.recommendations.length > 0 && (
              <div className="bg-ds-surface border border-ds-secondary/15 rounded-xl p-4 space-y-2">
                <h4 className="text-xs font-bold text-ds-primary uppercase tracking-wider flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-ds-primary" /> Wise Recommendations & Remedies
                </h4>
                <ul className="space-y-1.5 pl-1 text-xs sm:text-sm text-ds-on-surface-variant">
                  {verdict.contextualization.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-2 leading-relaxed">
                      <span className="text-ds-primary flex-shrink-0 mt-1">✦</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {verdict.contextualization?.reassurance && (
              <div className="pt-2 text-center">
                <p className="text-xs text-ds-on-surface-variant italic tracking-wide">
                  "{verdict.contextualization.reassurance}"
                </p>
              </div>
            )}
          </div>

          {/* Obstacles & Counter-Indicators */}
          {verdict.obstacles && verdict.obstacles.length > 0 && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 space-y-2 text-xs">
              <span className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5 text-sm">
                <AlertCircle className="w-4 h-4" /> Potential Obstacles & Restrictive Factors
              </span>
              <ul className="space-y-1 text-amber-700 dark:text-amber-200 list-disc list-inside">
                {verdict.obstacles.map((obs, idx) => (
                  <li key={idx}>{obs}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Alternative Timing Scenarios */}
          {verdict.alternativeScenarios && verdict.alternativeScenarios.length > 0 && (
            <div className="bg-ds-surface border border-ds-secondary/15 rounded-xl p-4 space-y-3">
              <span className="font-bold text-ds-primary flex items-center gap-1.5 text-xs uppercase tracking-wider">
                🔄 Alternative Timing Scenarios & Contingencies
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {verdict.alternativeScenarios.map((scen, idx) => (
                  <div key={idx} className="bg-ds-surface-container border border-ds-secondary/15 p-3 rounded-xl space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-ds-secondary">{scen.title}</span>
                      <span className="text-[10px] font-mono bg-ds-primary/10 text-ds-primary px-2 py-0.5 rounded border border-ds-primary/30">
                        {scen.probability}
                      </span>
                    </div>
                    <p className="text-ds-on-surface-variant text-[11px]">{scen.description}</p>
                    <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 pt-1">
                      Target Window: {scen.timing}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Collapsible 8-Step Breakdown */}
          <div className="bg-ds-surface border border-ds-secondary/15 rounded-xl p-4 space-y-4 text-xs">
            <div
              onClick={() => setStepsExpanded(!stepsExpanded)}
              className="flex items-center justify-between border-b border-ds-secondary/15 pb-2 cursor-pointer hover:opacity-90 transition-opacity"
            >
              <span className="font-bold text-ds-primary flex items-center gap-1.5 text-sm">
                <span>⚡</span> 8-Step KP Textbook Analysis Chain
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-ds-on-surface-variant">
                  {stepsExpanded ? 'Click to Collapse' : 'Click to View All 8 Steps'}
                </span>
                {stepsExpanded ? <ChevronUp className="w-4 h-4 text-ds-primary" /> : <ChevronDown className="w-4 h-4 text-ds-primary" />}
              </div>
            </div>

            {stepsExpanded && (
              <div className="space-y-2 animate-in fade-in duration-200">
                {verdict.steps?.map((step) => (
                  <div key={step.stepNumber} className="bg-ds-surface-container border border-ds-secondary/15 rounded-lg p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-ds-primary/20 text-ds-primary font-bold flex items-center justify-center text-[11px]">
                          {step.stepNumber}
                        </span>
                        <span className="font-bold text-ds-secondary">{step.title}</span>
                        {step.textbookRef && (
                          <span className="text-[10px] font-mono text-ds-on-surface-variant bg-ds-surface px-2 py-0.5 rounded border border-ds-secondary/10">
                            {step.textbookRef}
                          </span>
                        )}
                      </div>
                      <p className="text-ds-on-surface-variant text-[11px] pl-7">{step.description}</p>
                    </div>
                    <div>
                      <span className={`px-2.5 py-1 rounded text-[10px] font-bold ${
                        step.status === 'PASSED' ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' :
                        step.status === 'WARNING' ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30' :
                        'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                      }`}>
                        {step.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-ds-on-surface-variant pt-2 border-t border-ds-secondary/15">
              <div>
                <span className="text-ds-secondary font-medium">House Cusp Sub Lord:</span>{' '}
                <strong className="text-ds-primary">{verdict.reasoning.cuspSubLord}</strong>
              </div>
              <div>
                <span className="text-ds-secondary font-medium">Signified Houses:</span>{' '}
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{verdict.reasoning.cuspSubLordHouses?.join(', ')}</span>
              </div>
              <div>
                <span className="text-ds-secondary font-medium">Primary Significators:</span>{' '}
                <span className="text-ds-secondary font-bold">{verdict.reasoning.significators?.join(', ')}</span>
              </div>
              <div>
                <span className="text-ds-secondary font-medium">Dasha Trigger:</span>{' '}
                <span className="text-sky-600 dark:text-sky-400 font-bold">{verdict.reasoning.dashaStatus}</span>
              </div>
              
              <div className="sm:col-span-2 border-t border-ds-secondary/10 pt-2.5">
                <span className="text-ds-secondary font-medium block mb-0.5">KP Transit Trigger:</span>
                <span className="text-ds-on-surface text-[11px] leading-normal block bg-ds-surface-container/60 p-2 rounded-lg border border-ds-secondary/5 font-sans">
                  {verdict.reasoning.transitSupport}
                </span>
              </div>

              {verdict.reasoning.vedicGocharaCheck && (
                <div className="sm:col-span-2 border-t border-ds-secondary/10 pt-1">
                  <span className="text-ds-secondary font-medium block mb-0.5">Vedic Gochara Cross-Check:</span>
                  <span className="text-ds-on-surface text-[11px] leading-normal block bg-ds-surface-container/60 p-2 rounded-lg border border-ds-secondary/5 font-sans italic">
                    {verdict.reasoning.vedicGocharaCheck}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
