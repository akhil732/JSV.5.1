/**
 * Query Intent Debugger Component
 * Displays query intent analysis results, confidence scores, and clarification dialog
 * 
 * Purpose: Show users (and developers) how the KP query system understands their questions
 */

import React, { useState, useEffect } from 'react';
import { ChevronDown, AlertCircle, CheckCircle, HelpCircle } from 'lucide-react';
import {
  QueryIntent,
  IntentRecognitionResult,
  UserClarificationResponse
} from '../../lib/kp/queryIntent';
import { QueryIntentRecognizer, CONFIDENCE_THRESHOLDS } from '../../lib/kp/queryIntentRecognizer';
import { getDomainConfig } from '../../lib/kp/houseDomainMapper';

interface QueryIntentDebuggerProps {
  query: string;
  onIntentSelected: (intent: QueryIntent) => void;
  showDebugInfo?: boolean;
}

/**
 * Main component for query intent analysis
 */
export const QueryIntentDebugger: React.FC<QueryIntentDebuggerProps> = ({
  query,
  onIntentSelected,
  showDebugInfo = false
}) => {
  const [result, setResult] = useState<IntentRecognitionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [clarificationResponse, setClarificationResponse] = useState<string | null>(null);
  const [finalIntent, setFinalIntent] = useState<QueryIntent | null>(null);

  // Analyze query when it changes
  useEffect(() => {
    if (!query.trim()) {
      setResult(null);
      return;
    }

    const analyzeQuery = async () => {
      setLoading(true);
      try {
        const analysisResult = await QueryIntentRecognizer.recognizeIntent(query);
        setResult(analysisResult);
        setClarificationResponse(null);
      } finally {
        setLoading(false);
      }
    };

    // Debounce analysis
    const timer = setTimeout(analyzeQuery, 500);
    return () => clearTimeout(timer);
  }, [query]);

  // Handle clarification response
  const handleClarificationResponse = (option: string) => {
    if (!result) return;

    const response: UserClarificationResponse = {
      originalQuery: query,
      clarificationQuestion: QueryIntentRecognizer.getClarificationOptions(result.intent)?.question || '',
      selectedOption: option,
      finalIntent: QueryIntentRecognizer.processClarification({
        originalQuery: query,
        clarificationQuestion: '',
        selectedOption: option,
        finalIntent: result.intent
      })
    };

    setClarificationResponse(option);
    const finalIntentResult = response.finalIntent;
    setFinalIntent(finalIntentResult);
    onIntentSelected(finalIntentResult);
  };

  const handleConfirmIntent = () => {
    if (result?.intent) {
      onIntentSelected(result.intent);
    }
  };

  if (!query.trim()) {
    return (
      <div className="p-3 bg-ds-surface rounded-ds-xl border border-ds-outline">
        <p className="text-ds-on-surface-variant text-xs">Enter a query to analyze intent...</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-3 bg-ds-surface rounded-ds-xl border border-ds-outline">
        <div className="flex items-center gap-2">
          <div className="animate-spin w-4 h-4 border-2 border-ds-primary border-t-transparent rounded-full" role="status" aria-label="Analyzing"></div>
          <p className="text-xs text-ds-primary">Analyzing query intent...</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="p-3 bg-ds-primary/10 rounded-ds-xl border border-ds-primary/30" role="alert">
        <div className="flex items-center gap-2 text-ds-primary">
          <AlertCircle size={16} aria-hidden="true" />
          <p className="text-xs">Unable to determine intent. Please try rephrasing your question.</p>
        </div>
      </div>
    );
  }

  const intent = finalIntent || result.intent;
  const domainConfig = getDomainConfig(intent.domain);
  const confidenceColor = getConfidenceColor(intent.confidence);
  const clarificationOptions = QueryIntentRecognizer.getClarificationOptions(result.intent);

  return (
    <div className="space-y-3 text-[#F5F5F7]">
      {/* Main Intent Result */}
      <div className={`p-4 rounded-xl border ${confidenceColor.border} ${confidenceColor.bg}`}>
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-base flex items-center gap-2 text-[#F5F5F7]">
              {confidenceColor.icon}
              <span>{intent.domain}</span>
            </h3>
            <p className={`text-xs mt-0.5 ${confidenceColor.text}`}>
              Confidence: {intent.confidence.toFixed(0)}%
            </p>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-mono text-[#9CA3AF]">
              Detection: {result.detectionMethod}
            </div>
          </div>
        </div>

        {/* House Information */}
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="bg-ds-surface/80 p-2.5 rounded-ds-md border border-ds-outline">
            <p className="text-[10px] uppercase font-bold text-ds-on-surface-variant">Primary House</p>
            <p className="text-base font-bold text-ds-primary">{intent.primaryHouse}</p>
          </div>
          <div className="bg-ds-surface/80 p-2.5 rounded-ds-md border border-ds-outline">
            <p className="text-[10px] uppercase font-bold text-ds-on-surface-variant">Secondary Houses</p>
            <p className="text-base font-bold text-ds-on-surface">{intent.secondaryHouses.join(', ')}</p>
          </div>
        </div>

        {/* Keyword Matches */}
        {intent.keywordMatches && intent.keywordMatches.length > 0 && (
          <div className="mt-3">
            <p className="text-[10px] font-bold text-ds-on-surface-variant uppercase mb-1">Keyword Matches:</p>
            <div className="flex flex-wrap gap-1">
              {intent.keywordMatches.map((keyword) => (
                <span key={keyword} className="text-[11px] bg-ds-surface text-ds-on-surface border border-ds-outline px-2 py-0.5 rounded">
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Domain Details */}
      <div className="p-3 bg-ds-surface rounded-ds-xl border border-ds-outline text-ds-on-surface">
        <h4 className="font-bold text-xs mb-2 flex items-center gap-1.5 text-ds-primary">
          <span aria-hidden="true">💡</span>
          Domain Information &amp; Significators
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div>
            <p className="text-ds-on-surface-variant text-[10px] uppercase font-bold">Significators</p>
            <p className="font-medium text-ds-on-surface">{domainConfig.significators?.join(', ')}</p>
          </div>
          {domainConfig.kutas && (
            <div>
              <p className="text-ds-on-surface-variant text-[10px] uppercase font-bold">Kutas (for marriage)</p>
              <p className="font-medium text-ds-on-surface">{domainConfig.kutas.join(', ')}</p>
            </div>
          )}
          {domainConfig.doshas && (
            <div>
              <p className="text-ds-on-surface-variant text-[10px] uppercase font-bold">Doshas</p>
              <p className="font-medium text-ds-on-surface">{domainConfig.doshas.join(', ')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Clarification Dialog (if needed) */}
      {clarificationOptions && !clarificationResponse && (
        <ClarificationDialog
          question={clarificationOptions.question}
          options={clarificationOptions.options}
          onSelect={handleClarificationResponse}
        />
      )}

      {/* Clarification Response */}
      {clarificationResponse && finalIntent && (
        <div className="p-3 bg-ds-success-green/10 rounded-ds-xl border border-ds-success-green/30 text-ds-success-green" role="status">
          <div className="flex items-start gap-2">
            <CheckCircle className="text-ds-success-green flex-shrink-0 mt-0.5" size={16} aria-hidden="true" />
            <div>
              <p className="font-bold text-xs">Intent Confirmed</p>
              <p className="text-xs mt-0.5 text-ds-success-green/80">
                Your question is mapped to <strong>{finalIntent.domain}</strong> (House {finalIntent.primaryHouse})
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Debug Information */}
      {showDebugInfo && (
        <DebugPanel result={result} intent={intent} />
      )}

      {/* Action Buttons */}
      {!clarificationResponse && (
        <div className="flex gap-2">
          <button
            onClick={handleConfirmIntent}
            disabled={intent.requiresClarification && !clarificationResponse}
            className={`flex-1 py-2 px-4 rounded-ds-xl font-bold text-xs transition-colors cursor-pointer focus-ring ${
              intent.requiresClarification && !clarificationResponse
                ? 'bg-ds-surface-variant text-ds-on-surface-variant cursor-not-allowed'
                : 'bg-ds-primary text-ds-surface hover:bg-ds-primary/90'
            }`}
          >
            Confirm Intent
          </button>
        </div>
      )}
    </div>
  );
};

/**
 * Clarification Dialog Component
 */
interface ClarificationDialogProps {
  question: string;
  options: string[];
  onSelect: (option: string) => void;
}

const ClarificationDialog: React.FC<ClarificationDialogProps> = ({
  question,
  options,
  onSelect
}) => {
  return (
    <div className="p-4 bg-ds-primary/10 rounded-ds-xl border border-ds-primary/30 text-ds-primary">
      <div className="flex items-start gap-2 mb-3">
        <HelpCircle className="text-ds-primary flex-shrink-0 mt-0.5" size={18} aria-hidden="true" />
        <div>
          <p className="font-bold text-xs uppercase tracking-wider text-ds-primary">Clarification Needed</p>
          <p className="text-xs sm:text-sm text-ds-on-surface mt-1">{question}</p>
        </div>
      </div>

      <div className="space-y-2">
        {options.map((option, index) => (
          <button
            key={index}
            onClick={() => onSelect(option)}
            className="w-full text-left p-2.5 bg-ds-surface rounded-ds-md border border-ds-outline hover:border-ds-primary/50 hover:bg-ds-primary/10 transition-colors text-xs text-ds-on-surface font-medium cursor-pointer focus-ring"
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
};

/**
 * Debug Panel Component (for development)
 */
interface DebugPanelProps {
  result: IntentRecognitionResult;
  intent: QueryIntent;
}

const DebugPanel: React.FC<DebugPanelProps> = ({ result, intent }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="p-3 bg-ds-surface text-ds-on-surface border border-ds-outline rounded-ds-xl font-mono text-[11px]">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center gap-2 text-left hover:text-ds-primary cursor-pointer focus-ring"
        aria-expanded={isExpanded}
        aria-controls="debug-panel-content"
      >
        <ChevronDown size={14} style={{ transform: isExpanded ? 'rotate(180deg)' : '' }} aria-hidden="true" />
        <span>Debug Information</span>
      </button>

      {isExpanded && (
        <div id="debug-panel-content" className="mt-2 space-y-1 text-ds-on-surface-variant pt-2 border-t border-ds-outline">
          <div>
            <span className="text-ds-primary">detection:</span> {result.detectionMethod}
          </div>
          <div>
            <span className="text-ds-primary">domain:</span> {intent.domain}
          </div>
          <div>
            <span className="text-ds-primary">confidence:</span> {intent.confidence.toFixed(2)}%
          </div>
          <div>
            <span className="text-ds-primary">requiresClarification:</span> {String(intent.requiresClarification)}
          </div>
          <div>
            <span className="text-ds-primary">keywordMatches:</span> [{intent.keywordMatches?.join(', ')}]
          </div>
          <div>
            <span className="text-ds-primary">timestamp:</span> {new Date(result.timestamp).toISOString()}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Utility function to get color classes based on confidence
 */
function getConfidenceColor(confidence: number): {
  border: string;
  bg: string;
  text: string;
  icon: React.ReactNode;
} {
  if (confidence >= CONFIDENCE_THRESHOLDS.CERTAIN) {
    return {
      border: 'border-emerald-500/30',
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-400',
      icon: <CheckCircle size={18} className="text-emerald-400" />
    };
  } else if (confidence >= CONFIDENCE_THRESHOLDS.LIKELY) {
    return {
      border: 'border-sky-500/30',
      bg: 'bg-sky-500/10',
      text: 'text-sky-400',
      icon: <HelpCircle size={18} className="text-sky-400" />
    };
  } else {
    return {
      border: 'border-amber-500/30',
      bg: 'bg-amber-500/10',
      text: 'text-amber-400',
      icon: <AlertCircle size={18} className="text-amber-400" />
    };
  }
}

export default QueryIntentDebugger;
