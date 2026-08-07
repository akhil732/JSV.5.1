import React, { useState } from 'react';
import { BirthDetails } from '../types';
import { Sparkles, Send, Copy, Check, HelpCircle, Clock, ShieldCheck, ChevronRight, AlertCircle, RefreshCw } from 'lucide-react';
import { generateSuggestedQuestions } from '../lib/engines/QueryConsultationEngine';
import { callGeminiConsultation, ConsultationResponse } from '../lib/services/GeminiConsultationService';
import { useAstrologyCache } from '../hooks/useAstrologyCache';

interface QueryConsultationTabProps {
  birthDetails: BirthDetails;
  horoscopeData: any;
  language: 'en' | 'hi' | 'te';
}

interface ThinkingStage {
  id: string;
  label: string;
  complete: boolean;
}

export const QueryConsultationTab: React.FC<QueryConsultationTabProps> = ({
  birthDetails,
  horoscopeData,
  language
}) => {
  const [question, setQuestion] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [thinkingStages, setThinkingStages] = useState<ThinkingStage[]>([]);
  const [response, setResponse] = useState<ConsultationResponse | null>(null);
  const [recentQuestions, setRecentQuestions] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const moonSign = horoscopeData?.horoscope?.divisional_charts?.["D-1_rasi"]?.Moon?.sign || "Aries";
  const cache = useAstrologyCache(horoscopeData, birthDetails.date, moonSign);

  const suggestedQuestions = generateSuggestedQuestions(birthDetails, horoscopeData, language);

  const handleSubmitQuestion = async (qText?: string) => {
    const q = (qText !== undefined ? qText : question).trim();
    if (!q) return;

    setIsThinking(true);
    setResponse(null);
    setError(null);

    const stages: ThinkingStage[] = [
      { id: '1', label: language === 'hi' ? 'जन्म कुंडली पढ़ी जा रही है...' : language === 'te' ? 'జాతక చక్రం పరిశీలించబడుతోంది...' : 'Reading Birth Chart...', complete: false },
      { id: '2', label: language === 'hi' ? 'विंशोत्तरी दशा का मूल्यांकन...' : language === 'te' ? 'వింశోత్తరీ దశ విశ్లేషణ...' : 'Evaluating Dasha...', complete: false },
      { id: '3', label: language === 'hi' ? 'गोचर पारगमन का विश्लेषण...' : language === 'te' ? 'గోచార గ్రహ సంచార పరిశీలన...' : 'Evaluating Transit...', complete: false },
      { id: '4', label: language === 'hi' ? 'शुभ समय खिड़कियों की गणना...' : language === 'te' ? 'శుభ సమయ కాలగణన...' : 'Calculating Timing...', complete: false },
      { id: '5', label: language === 'hi' ? 'परामर्श संदर्भ तैयार हो रहा है...' : language === 'te' ? 'సంప్రదింపుల సందర్భం సిద్ధమవుతోంది...' : 'Building Consultation...', complete: false },
      { id: '6', label: language === 'hi' ? 'विशेषज्ञ ज्योतिषीय विश्लेषण...' : language === 'te' ? 'నిపుణుల జ్యోతిష్య విశ్లేషణ రచన...' : 'Writing Expert Analysis...', complete: false }
    ];

    setThinkingStages(stages);

    try {
      // Simulate smooth progress through stages
      for (let i = 0; i < stages.length; i++) {
        await new Promise(r => setTimeout(r, 350));
        setThinkingStages(prev => prev.map((s, idx) => idx === i ? { ...s, complete: true } : s));
      }

      const geminiResult = await callGeminiConsultation(birthDetails, horoscopeData, q, language);

      setResponse(geminiResult);
      setRecentQuestions(prev => [q, ...prev.filter(item => item !== q)].slice(0, 5));
    } catch (err: any) {
      console.error(err);
      setError('Consultation computation failed. Please try again.');
    } finally {
      setIsThinking(false);
    }
  };

  const handleCopy = () => {
    if (!response) return;
    const text = `Jyothishya Sanathanam AI Consultation\nQuestion: ${response.directAnswer}\nSummary: ${response.summary}\nConfidence: ${response.confidenceRating}%`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const labels = {
    en: {
      title: "AI Query Consultation Engine",
      subtitle: "Ask your birth chart anything. Backed by deterministic Parashari engines and safe AI interpretation.",
      placeholder: "e.g., When will I get my next career promotion or change?",
      askBtn: "Ask Chart",
      suggested: "Suggested Questions for Your Chart",
      recent: "Recent Questions",
      confidence: "Confidence Score",
      supporting: "Supporting Factors",
      risks: "Risks & Cautions",
      timing: "Timing Outlook",
      recommendations: "Expert Recommendations",
      remedies: "Classical Remedies",
      copy: "Copy Response",
      copied: "Copied!",
      dismiss: "Dismiss"
    },
    hi: {
      title: "एआई प्रश्न परामर्श इंजन",
      subtitle: "अपनी जन्म कुंडली से कुछ भी पूछें। नियतात्मक पारशरी इंजन और सुरक्षित एआई द्वारा संचालित।",
      placeholder: "जैसे, मेरी अगली करियर पदोन्नति कब होगी?",
      askBtn: "प्रश्न पूछें",
      suggested: "आपकी कुंडली के लिए सुझाए गए प्रश्न",
      recent: "हाल के प्रश्न",
      confidence: "विश्वास स्कोर",
      supporting: "सहायक कारक",
      risks: "जोखिम और सावधानियां",
      timing: "समय दृष्टिकोण",
      recommendations: "विशेषज्ञ सिफारिशें",
      remedies: "शास्त्रीय उपाय",
      copy: "प्रतिकृति प्रतिलिपि",
      copied: "कॉपी हो गया!",
      dismiss: "खारिज करें"
    },
    te: {
      title: "AI ప్రశ్న సంప్రదింపు ఇంజిన్",
      subtitle: "మీ జాతక చక్రం గురించి ఏ ప్రశ్ననైనా అడగండి. పరాశర శాస్త్ర గణనలు మరియు సురక్షిత AI నిపుణ విశ్లేషణ.",
      placeholder: "ఉదా: నా తదుపరి ఉద్యోగ పదోన్నతి ఎప్పుడు ఉంటుంది?",
      askBtn: "ప్రశ్న అడుగు",
      suggested: "మీ జాతకానికి తగిన ప్రశ్నలు",
      recent: "ఇటీవలి ప్రశ్నలు",
      confidence: "విశ్వసనీయత స్కోరు",
      supporting: "అనుకూల అంశాలు",
      risks: "ప్రమాదాలు & జాగ్రత్తలు",
      timing: "సమయ దృక్పథం",
      recommendations: "నిపుణుల సిఫార్సులు",
      remedies: "శాస్త్రీయ పరిహారాలు",
      copy: "సమాధానం కాపీ చేయి",
      copied: "కాపీ చేయబడింది!",
      dismiss: "విస్మరించు"
    }
  }[language];

  return (
    <div className="space-y-8 animate-fade-in pb-12 w-full">
      {/* Hero Banner */}
      <div className="rounded-2xl border border-[#1E2433] bg-gradient-to-r from-[#10141F] via-[#151C2C] to-[#10141F] p-6 sm:p-8 shadow-xl">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#F5F5F7]">
              {labels.title}
            </h2>
            <p className="text-xs text-[#9CA3AF] mt-0.5">
              {labels.subtitle}
            </p>
          </div>
        </div>

        {/* Input Box */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmitQuestion()}
              placeholder={labels.placeholder}
              data-testid="question-input"
              className="w-full bg-[#0A0E17] border border-[#1E2433] focus:border-amber-500/50 rounded-xl px-4 py-3.5 text-sm text-[#F5F5F7] placeholder-[#6B7280] outline-none transition-all shadow-inner"
            />
          </div>
          <button
            onClick={() => handleSubmitQuestion()}
            disabled={isThinking || !question.trim()}
            data-testid="submit-button"
            className="px-6 py-3.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-[#0A0E17] font-bold rounded-xl transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <Send className="w-4 h-4" />
            <span>{labels.askBtn}</span>
          </button>
        </div>

        {/* Suggested Questions Carousel */}
        <div className="mt-5" data-testid="suggested-questions">
          <p className="text-[11px] font-mono text-[#9CA3AF] mb-2 uppercase tracking-wider">
            {labels.suggested}
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((sq, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setQuestion(sq);
                  handleSubmitQuestion(sq);
                }}
                className="px-3 py-1.5 bg-[#0A0E17] hover:bg-amber-500/10 border border-[#1E2433] hover:border-amber-500/30 text-xs text-[#D1D5DB] hover:text-amber-400 rounded-lg transition-all cursor-pointer flex items-center gap-1.5"
              >
                <HelpCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>{sq}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error Notice */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-sm">Error</p>
            <p className="text-xs text-red-300 mt-0.5">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="text-xs text-red-400 hover:underline">
            {labels.dismiss}
          </button>
        </div>
      )}

      {/* Thinking Timeline Display */}
      {isThinking && (
        <div className="rounded-2xl border border-[#1E2433] bg-[#10141F] p-6 shadow-xl animate-fade-in" data-testid="thinking-timeline">
          <div className="flex items-center gap-2 mb-4">
            <RefreshCw className="w-4 h-4 text-amber-500 animate-spin" />
            <h3 className="text-sm font-serif font-bold text-[#F5F5F7]">
              Consultation Engine in Progress...
            </h3>
          </div>
          <div className="space-y-3">
            {thinkingStages.map((stage, i) => (
              <div key={stage.id} className="flex items-center gap-3 text-xs font-mono">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${stage.complete ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-[#1E2433] text-[#9CA3AF]'}`}>
                  {stage.complete ? '✓' : i + 1}
                </div>
                <span className={stage.complete ? 'text-[#F5F5F7]' : 'text-[#6B7280]'}>
                  {stage.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Consultation Response Display */}
      {response && !isThinking && (
        <div className="rounded-2xl border border-amber-500/30 bg-[#10141F] shadow-2xl overflow-hidden animate-fade-in" data-testid="consultation-response">
          {/* Header Bar */}
          <div className="px-6 py-4 bg-[#151C2C] border-b border-[#1E2433] flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-500" />
              <h3 className="text-sm sm:text-base font-serif font-bold text-[#F5F5F7]">
                Expert Astrological Consultation
              </h3>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full text-xs font-mono font-bold text-amber-400" data-testid="confidence-score">
                {labels.confidence}: {response.confidenceRating}%
              </div>
              
              <button
                onClick={handleCopy}
                data-testid="copy-button"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0A0E17] hover:bg-[#1E2433] border border-[#1E2433] text-xs font-mono text-[#D1D5DB] rounded-lg transition-all cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-amber-500" />}
                <span data-testid={copied ? "copy-success" : undefined}>{copied ? labels.copied : labels.copy}</span>
              </button>
            </div>
          </div>

          {/* Response Body Content */}
          <div className="p-6 sm:p-8 space-y-6">
            
            {/* Direct Answer & Summary */}
            <div className="p-5 rounded-xl bg-[#0A0E17] border border-[#1E2433] space-y-3">
              <h4 className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold">
                Direct Answer & Synthesis
              </h4>
              <p className="text-sm sm:text-base font-serif text-[#F5F5F7] leading-relaxed">
                {response.directAnswer}
              </p>
              <p className="text-xs text-[#9CA3AF] leading-relaxed">
                {response.whyThisConclusion}
              </p>
            </div>

            {/* Grid of Influences */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Dasha & Transit */}
              <div className="p-5 rounded-xl bg-[#0A0E17]/50 border border-[#1E2433] space-y-3">
                <h5 className="text-xs font-mono uppercase tracking-wider text-[#9CA3AF] font-bold flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-500" />
                  Dasha & Transit Context
                </h5>
                <p className="text-xs text-[#D1D5DB] leading-relaxed">
                  <strong className="text-[#F5F5F7]">Dasha:</strong> {response.dashaInfluence}
                </p>
                <p className="text-xs text-[#D1D5DB] leading-relaxed">
                  <strong className="text-[#F5F5F7]">Transit:</strong> {response.transitInfluence}
                </p>
              </div>

              {/* Opportunities & Risks */}
              <div className="p-5 rounded-xl bg-[#0A0E17]/50 border border-[#1E2433] space-y-3">
                <h5 className="text-xs font-mono uppercase tracking-wider text-[#9CA3AF] font-bold flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  Opportunities & Cautions
                </h5>
                <p className="text-xs text-[#D1D5DB] leading-relaxed">
                  <strong className="text-emerald-400">Opportunities:</strong> {response.opportunities}
                </p>
                <p className="text-xs text-[#D1D5DB] leading-relaxed">
                  <strong className="text-amber-400">Risks:</strong> {response.risks}
                </p>
              </div>
            </div>

            {/* Timing & Recommendations */}
            <div className="p-5 rounded-xl bg-[#0A0E17] border border-[#1E2433] space-y-4">
              <div>
                <h5 className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold mb-1">
                  {labels.timing}
                </h5>
                <p className="text-xs text-[#D1D5DB]">{response.timingOutlook}</p>
              </div>
              <div className="border-t border-[#1E2433] pt-4">
                <h5 className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold mb-1">
                  {labels.recommendations}
                </h5>
                <p className="text-xs text-[#D1D5DB]">{response.recommendations}</p>
              </div>
              {response.remedies && (
                <div className="border-t border-[#1E2433] pt-4">
                  <h5 className="text-xs font-mono uppercase tracking-wider text-sky-400 font-bold mb-1">
                    {labels.remedies}
                  </h5>
                  <p className="text-xs text-[#D1D5DB]">{response.remedies}</p>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* Recent Questions History */}
      {recentQuestions.length > 0 && (
        <div className="rounded-2xl border border-[#1E2433] bg-[#10141F] p-6 shadow-lg" data-testid="recent-questions">
          <h3 className="text-sm font-serif font-bold text-[#F5F5F7] mb-3">
            {labels.recent}
          </h3>
          <div className="space-y-2">
            {recentQuestions.map((rq, idx) => (
              <div
                key={idx}
                onClick={() => {
                  setQuestion(rq);
                  handleSubmitQuestion(rq);
                }}
                className="p-3 bg-[#0A0E17] hover:bg-[#151D2F] border border-[#1E2433] hover:border-amber-500/30 rounded-xl transition-all cursor-pointer flex items-center justify-between text-xs text-[#D1D5DB]"
              >
                <span>{rq}</span>
                <ChevronRight className="w-4 h-4 text-[#6B7280]" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
