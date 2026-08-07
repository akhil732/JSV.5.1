import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { BirthDetails } from '../types';
import { useAdvancedAIChat } from '../hooks/useAdvancedAIChat';
import { useTextStreamBuffer } from '../hooks/useTextStreamBuffer';
import { EnhancedGeminiConsultationService, ConsultationPersona } from '../lib/services/EnhancedGeminiConsultationService';
import { calculateActiveDasha } from '../lib/engines/DashaEngine';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { GroundTruthInspectorDrawer } from './AdvancedAI/GroundTruthInspectorDrawer';
import ReactMarkdown from 'react-markdown';
import { Copy, Check, Search, MessageSquare, AlertCircle } from 'lucide-react';

interface AdvancedAITabProps {
  birthDetails?: BirthDetails;
  birthData?: BirthDetails;
  horoscopeData?: any;
  language?: 'en' | 'hi' | 'te';
  onBack?: () => void;
  profiles?: any[];
  onSelectProfile?: (profile: any) => void;
}

// ─── Suggested queries in Telugu ──────────────────────────────────
const QUERIES = [
  { icon: '💼', label: 'ఉద్యోగం/కెరీర్', text: 'నాకు ఏ రకమైన ఉద్యోగం లేదా వ్యాపారం అనుకూలంగా ఉంటుంది?' },
  { icon: '💍', label: 'వివాహం', text: 'నాకు వివాహం ఎప్పుడు జరుగుతుంది?' },
  { icon: '🏠', label: 'ఇల్లు/ఆస్తి', text: 'నేను త్వరలోనే సొంత ఇల్లు లేదా స్థలం కొనగలనా?' },
  { icon: '✈️', label: 'విదేశీ ప్రయాణం', text: 'నేను విదేశాలకు వెళ్లే అవకాశం ఉందా లేదా అక్కడ స్థిరపడగలనా?' },
  { icon: '⚖️', label: 'కోర్టు కేసులు', text: 'నాకున్న కోర్టు కేసు లేదా వివాదం నాకు అనుకూలంగా ముగుస్తుందా?' },
  { icon: '💰', label: 'ఆర్థిక పరిస్థితి', text: 'నా ఆర్థిక పరిస్థితి ఎప్పుడు మెరుగుపడుతుంది?' },
];

const PERSONA_LABELS: Record<string, { short: string; full: string }> = {
  quick: { short: 'తెలుగు ఇంజిన్', full: 'Quick Astro Engine (Telugu)' },
};

// ─── Theme-aware color generator — mirrors KP query tab ──────────
function getColors(isDark: boolean) {
  if (isDark) {
    return {
      bg: '#0A0E17',
      surface: '#10141F',
      border: '#1E2433',
      text: '#F5F5F7',
      muted: '#9CA3AF',
      body: '#D1D5DB',
      accent: '#F5A623',
      accentDark: '#D48806',
      emeraldText: '#34d399',
      emeraldBg: 'rgba(16,185,129,0.08)',
      emeraldBorder: 'rgba(16,185,129,0.25)',
      amberText: '#fbbf24',
      amberBg: 'rgba(245,158,11,0.08)',
      amberBorder: 'rgba(245,158,11,0.25)',
      roseText: '#fb7185',
      roseBg: 'rgba(239,68,68,0.08)',
      roseBorder: 'rgba(239,68,68,0.25)',
      skyText: '#38bdf8',
      skyBg: 'rgba(56,189,248,0.08)',
      skyBorder: 'rgba(56,189,248,0.2)',
      headerBg: 'rgba(16,20,31,0.85)',
      inputBg: 'rgba(16,20,31,0.92)',
      userBubbleBg: 'rgba(245,166,35,0.1)',
      userBubbleBorder: 'rgba(245,166,35,0.18)',
      cardHeaderBg: 'rgba(10,14,23,0.45)',
      cpBg: 'rgba(10,14,23,0.6)',
      hurdlesNoteText: '#fde68a',
      emptyIconBg: 'rgba(245,166,35,0.1)',
      emptyIconBorder: 'rgba(245,166,35,0.18)',
      btnHoverBorder: 'rgba(245,166,35,0.3)',
      shadow: 'rgba(0,0,0,0.3)'
    };
  } else {
    return {
      bg: '#F8FAFC',
      surface: '#FFFFFF',
      border: '#E2E8F0',
      text: '#0F172A',
      muted: '#64748B',
      body: '#334155',
      accent: '#D97706',
      accentDark: '#B45309',
      emeraldText: '#059669',
      emeraldBg: 'rgba(16,185,129,0.1)',
      emeraldBorder: 'rgba(16,185,129,0.3)',
      amberText: '#D97706',
      amberBg: 'rgba(245,158,11,0.1)',
      amberBorder: 'rgba(245,158,11,0.3)',
      roseText: '#E11D48',
      roseBg: 'rgba(225,29,72,0.08)',
      roseBorder: 'rgba(225,29,72,0.25)',
      skyText: '#0284C7',
      skyBg: 'rgba(56,189,248,0.1)',
      skyBorder: 'rgba(56,189,248,0.3)',
      headerBg: 'rgba(255,255,255,0.9)',
      inputBg: 'rgba(255,255,255,0.95)',
      userBubbleBg: 'rgba(217,119,6,0.1)',
      userBubbleBorder: 'rgba(217,119,6,0.22)',
      cardHeaderBg: 'rgba(241,245,249,0.8)',
      cpBg: 'rgba(248,250,252,0.95)',
      hurdlesNoteText: '#92400E',
      emptyIconBg: 'rgba(217,119,6,0.1)',
      emptyIconBorder: 'rgba(217,119,6,0.22)',
      btnHoverBorder: 'rgba(217,119,6,0.35)',
      shadow: 'rgba(0,0,0,0.06)'
    };
  }
}

const ago = (ts: number) => {
  const d = Date.now() - ts;
  if (d < 60000) return 'ఇప్పుడే (just now)';
  if (d < 3600000) return `${Math.floor(d / 60000)}ని॥ క్రితం`;
  if (d < 86400000) return `${Math.floor(d / 3600000)}గం॥ క్రితం`;
  return new Date(ts).toLocaleDateString();
};

import { ASTROLOGICAL_TERMS_MAP } from '../lib/i18n/astrologicalTerms';

function getTeluguTerm(term: string) {
  const key = term.toLowerCase();
  return ASTROLOGICAL_TERMS_MAP[key]?.te || term;
}

function getChartSummaryText(horoscopeData?: any, birthDetails?: BirthDetails): string {
  const d1 = horoscopeData?.horoscope?.divisional_charts?.["D-1_rasi"] || horoscopeData?.rasi || {};
  const SIGN_LORDS: Record<string, string> = {
    Aries: "Mars", Taurus: "Venus", Gemini: "Mercury", Cancer: "Moon",
    Leo: "Sun", Virgo: "Mercury", Libra: "Venus", Scorpio: "Mars",
    Sagittarius: "Jupiter", Capricorn: "Saturn", Aquarius: "Saturn", Pisces: "Jupiter"
  };

  const ascSign = d1?.Ascendant?.sign || d1?.Lagna?.sign || 'Aquarius';
  const ascLord = SIGN_LORDS[ascSign] || 'Saturn';
  const moonSign = d1?.Moon?.sign || 'Libra';
  const moonNakshatra = d1?.Moon?.nakshatra ? `${d1.Moon.nakshatra}${d1.Moon.pada ? ` - Pada ${d1.Moon.pada}` : ''}` : 'Unknown';
  const sunSign = d1?.Sun?.sign || 'Libra';

  let md = 'Mercury';
  let ad = 'Venus';
  let pd = 'Venus';

  if (horoscopeData && birthDetails) {
    try {
      const activeDashaObj = calculateActiveDasha(horoscopeData, birthDetails?.date || '1996-11-11', new Date());
      if (activeDashaObj) {
        md = activeDashaObj.mahadasha?.lord || md;
        ad = activeDashaObj.antardasha?.lord || ad;
        pd = activeDashaObj.pratyantardasha?.lord || ad;
      }
    } catch (e) {}
  }

  const teluguAscSign = getTeluguTerm(ascSign);
  const teluguAscLord = getTeluguTerm(ascLord);
  const teluguMoonSign = getTeluguTerm(moonSign);
  const teluguSunSign = getTeluguTerm(sunSign);
  const teluguMd = getTeluguTerm(md);
  const teluguAd = getTeluguTerm(ad);
  const teluguPd = getTeluguTerm(pd);

  return `మీరు ${teluguAscLord} పాలించే ${teluguAscSign} లగ్నంలో జన్మించారు, ఇది దృఢమైన మరియు క్రమశిక్షణతో కూడిన జీవిత పథాన్ని ఇస్తుంది. మీ భావోద్వేగ మనస్సు ${teluguMoonSign} రాశిలోని చంద్రునిపై (${moonNakshatra}) కేంద్రీకృతమై ఉంది, అలాగే మీ ఆత్మ ఉద్దేశం ${teluguSunSign} రాశిలోని సూర్యునితో సమలేఖనం చేయబడింది. ప్రస్తుతం మీరు ${teluguMd} మహాదశలో — ${teluguAd} అంతర్దశ మరియు ${teluguPd} ప్రత్యంతర్దశ కాలంలో ఉన్నారు.`;
}

// ─── Empty State ──────────────────────────────────────────────────
function EmptyState({
  onSelect,
  C,
  activeDashaStr,
  horoscopeData,
  birthDetails
}: {
  onSelect: (text: string) => void;
  C: ReturnType<typeof getColors>;
  activeDashaStr: string;
  horoscopeData?: any;
  birthDetails?: BirthDetails;
}) {
  const summaryText = getChartSummaryText(horoscopeData, birthDetails);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100%', padding: '2rem 1.5rem', textAlign: 'center' }}>
      <div style={{ width: 56, height: 56, borderRadius: 16, background: C.emptyIconBg, border: `1px solid ${C.emptyIconBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, marginBottom: 16, color: C.accent }}>
        ✦
      </div>
      <h3 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700, color: C.text }}>మీ జాతకం గురించి అడగండి</h3>
      <p style={{ margin: '0 0 24px', fontSize: 13, color: C.muted, maxWidth: 520, lineHeight: 1.65 }}>
        {summaryText}
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, width: '100%', maxWidth: 380 }}>
        {QUERIES.map((q) => (
          <button
            key={q.label}
            onClick={() => onSelect(q.text)}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7, padding: '14px 8px', borderRadius: 12, background: C.surface, border: `1px solid ${C.border}`, cursor: 'pointer', transition: 'border-color 0.15s, transform 0.1s' }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.btnHoverBorder; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.border; }}
          >
            <span style={{ fontSize: 20 }}>{q.icon}</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: C.muted }}>{q.label}</span>
          </button>
        ))}
      </div>
      <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', gap: 7, padding: '6px 14px', borderRadius: 99, background: C.surface, border: `1px solid ${C.border}`, fontSize: 11, color: C.muted }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.accent, display: 'block' }} className="animate-pulse" />
        లెన్స్: <strong style={{ color: C.text, marginLeft: 4, marginRight: 8 }}>త్వరిత తెలుగు ఇంజిన్</strong>
        · ప్రస్తుతం నడుస్తున్న దశా: <strong style={{ color: C.text, marginLeft: 4 }}>{activeDashaStr}</strong>
      </div>
    </div>
  );
}

// ─── User Bubble ──────────────────────────────────────────────────
function UserBubble({ text, C }: { text: string; C: ReturnType<typeof getColors> }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
      <div style={{ maxWidth: '75%', padding: '10px 16px', borderRadius: 18, borderBottomRightRadius: 4, background: C.userBubbleBg, border: `1px solid ${C.userBubbleBorder}`, fontSize: 13, color: C.text, lineHeight: 1.6 }}>
        {text}
      </div>
    </div>
  );
}

// ─── Assistant Response Card ──────────────────────────────────────
function AssistantResponseCard({
  msg,
  C,
  onOpenInspector,
  onSendFollowUp
}: {
  msg: any;
  C: ReturnType<typeof getColors>;
  onOpenInspector?: () => void;
  onSendFollowUp?: (text: string) => void;
}) {
  const [copied, setCopied] = useState(false);
  const metadata = msg.metadata || {};
  const kpGt = metadata.kpGroundTruths;
  const domain = metadata.queryDomain || (kpGt?.domain) || 'GENERAL';
  const confidence = metadata.confidence || (kpGt?.confidenceScore) || 85;

  const handleCopy = () => {
    navigator.clipboard.writeText(msg.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const statusLabel = kpGt?.vedicPromise === 'YES' ? 'అనుకూలం · యోగం ఉంది' : kpGt?.vedicPromise === 'DELAYED' ? 'ఆలస్యం · ఓపిక అవసరం' : 'జాగ్రత్త అవసరం';
  const statusIcon = kpGt?.vedicPromise === 'YES' ? '✓' : kpGt?.vedicPromise === 'DELAYED' ? '◷' : '⚠';
  const statusColor = kpGt?.vedicPromise === 'YES' ? C.emeraldText : kpGt?.vedicPromise === 'DELAYED' ? C.amberText : C.roseText;
  const statusBg = kpGt?.vedicPromise === 'YES' ? C.emeraldBg : kpGt?.vedicPromise === 'DELAYED' ? C.amberBg : C.roseBg;
  const statusBorder = kpGt?.vedicPromise === 'YES' ? C.emeraldBorder : kpGt?.vedicPromise === 'DELAYED' ? C.amberBorder : C.roseBorder;

  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, overflow: 'hidden', boxShadow: `0 4px 12px ${C.shadow}` }}>
      {/* Header bar — system + domain badge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 16px', borderBottom: `1px solid ${C.border}`, background: C.cardHeaderBg }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: C.accent, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            తెలుగు జ్యోతిష విశ్లేషణ
          </span>
          {domain && (
            <>
              <span style={{ width: 3, height: 3, borderRadius: '50%', background: C.border, display: 'block' }} />
              <span style={{ fontSize: 10, fontWeight: 600, color: C.skyText, background: C.skyBg, border: `1px solid ${C.skyBorder}`, padding: '2px 8px', borderRadius: 4 }}>
                {domain}
              </span>
            </>
          )}
        </div>
        {confidence && (
          <span style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', padding: '2px 8px', borderRadius: 4, color: C.emeraldText, background: C.emeraldBg, border: `1px solid ${C.emeraldBorder}` }}>
            {confidence}% ఖచ్చితత్వం
          </span>
        )}
      </div>

      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Optional Ground Truth Status Banner if available */}
        {kpGt && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: 12, background: statusBg, border: `1px solid ${statusBorder}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: statusColor, flexShrink: 0 }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: statusColor }}>{statusLabel}</span>
            </div>
            <span style={{ fontSize: 11, fontWeight: 600, color: C.text }}>
              భావ అధిపతి: <strong style={{ color: C.accent }}>{kpGt.targetHouseLord || 'Venus'}</strong>
            </span>
          </div>
        )}

        {/* Formatted Markdown Content */}
        <div className="prose max-w-none" style={{ fontSize: 13, color: C.body, lineHeight: 1.75 }}>
          <ReactMarkdown
            components={{
              h1: ({ children }) => (
                <h1 style={{ fontSize: 14, fontWeight: 700, color: C.text, marginTop: 12, marginBottom: 6, borderBottom: `1px solid ${C.border}`, paddingBottom: 4 }}>
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2 style={{ fontSize: 13, fontWeight: 700, color: C.text, marginTop: 10, marginBottom: 4 }}>
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 style={{ fontSize: 12, fontWeight: 700, color: C.accent, marginTop: 8, marginBottom: 4 }}>
                  {children}
                </h3>
              ),
              p: ({ children }) => (
                <p style={{ marginTop: 4, marginBottom: 8, lineHeight: 1.75, color: C.body }}>{children}</p>
              ),
              ul: ({ children }) => (
                <ul style={{ paddingLeft: 18, marginTop: 4, marginBottom: 8 }}>{children}</ul>
              ),
              li: ({ children }) => (
                <li style={{ marginTop: 2, marginBottom: 2, color: C.body }}>{children}</li>
              ),
              strong: ({ children }) => (
                <strong style={{ fontWeight: 700, color: C.text }}>{children}</strong>
              )
            }}
          >
            {msg.content}
          </ReactMarkdown>
        </div>

        {/* Action Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8, borderTop: `1px solid ${C.border}`, marginTop: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {onOpenInspector && (
              <button
                onClick={onOpenInspector}
                style={{ fontSize: 11, fontWeight: 600, color: C.emeraldText, background: C.emeraldBg, border: `1px solid ${C.emeraldBorder}`, padding: '4px 10px', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, transition: 'all 0.1s' }}
              >
                <Search className="w-3 h-3" />
                <span>గణాంకాలు చూడండి (Inspect Facts)</span>
              </button>
            )}

            {onSendFollowUp && (
              <button
                onClick={() => onSendFollowUp(`దయచేసి దీని గురించి మరికొన్ని వివరాలు తెలపండి.`)}
                style={{ fontSize: 11, fontWeight: 600, color: C.skyText, background: C.skyBg, border: `1px solid ${C.skyBorder}`, padding: '4px 10px', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, transition: 'all 0.1s' }}
              >
                <MessageSquare className="w-3 h-3" />
                <span>మరిన్ని ప్రశ్నలు (Follow-up)</span>
              </button>
            )}
          </div>

          <button
            onClick={handleCopy}
            style={{ fontSize: 11, color: C.muted, background: 'none', border: `1px solid ${C.border}`, borderRadius: 8, padding: '4px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, transition: 'all 0.1s' }}
            title="Copy response"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Assistant Bubble Container ───────────────────────────────────
function AssistantBubble({
  msg,
  C,
  onOpenInspector,
  onSendFollowUp
}: {
  msg: any;
  C: ReturnType<typeof getColors>;
  onOpenInspector?: () => void;
  onSendFollowUp?: (text: string) => void;
}) {
  if (msg.error) {
    return (
      <div style={{ display: 'flex', gap: 10 }}>
        <div style={{ width: 28, height: 28, borderRadius: '50%', background: C.roseBg, border: `1px solid ${C.roseBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2, fontSize: 13, color: C.roseText }}>✦</div>
        <div style={{ padding: '10px 14px', background: C.roseBg, border: `1px solid ${C.roseBorder}`, borderRadius: 16, borderTopLeftRadius: 4, fontSize: 12, color: C.roseText, lineHeight: 1.6 }}>
          {msg.error}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', gap: 10, width: '100%' }}>
      <div style={{ width: 28, height: 28, borderRadius: '50%', background: C.emptyIconBg, border: `1px solid ${C.emptyIconBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 4, fontSize: 13, color: C.accent }}>✦</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <AssistantResponseCard msg={msg} C={C} onOpenInspector={onOpenInspector} onSendFollowUp={onSendFollowUp} />
      </div>
    </div>
  );
}

// ─── Streaming / Loading Indicator Bubbles ────────────────────────
function LoadingBubble({ C, text }: { C: ReturnType<typeof getColors>; text?: string }) {
  return (
    <div style={{ display: 'flex', gap: 10 }}>
      <div style={{ width: 28, height: 28, borderRadius: '50%', background: C.emptyIconBg, border: `1px solid ${C.emptyIconBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 13, color: C.accent }} className="animate-pulse">✦</div>
      <div style={{ padding: '12px 16px', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, borderTopLeftRadius: 4, display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 12, color: C.muted, fontFamily: 'monospace' }}>{text || 'విశ్లేషిస్తున్నాము...'}</span>
        <span style={{ display: 'flex', gap: 3 }}>
          {[0, 1, 2].map((i) => (
            <span key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: C.accent, animationDelay: `${-0.3 + i * 0.15}s` }} className="animate-bounce" />
          ))}
        </span>
      </div>
    </div>
  );
}

// ─── Session History Drawer Panel ─────────────────────────────────
function SessionHistoryPanel({
  isOpen,
  sessions,
  activeSessionId,
  onClose,
  onSelectSession,
  onDeleteSession,
  onClearAllSessions,
  C
}: {
  isOpen: boolean;
  sessions: any[];
  activeSessionId: string;
  onClose: () => void;
  onSelectSession: (id: string) => void;
  onDeleteSession: (id: string) => void;
  onClearAllSessions: () => void;
  C: ReturnType<typeof getColors>;
}) {
  if (!isOpen) return null;
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 50, display: 'flex' }}>
      <div style={{ width: 280, background: C.surface, borderRight: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', height: '100%', boxShadow: `4px 0 16px ${C.shadow}` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: C.accent, textTransform: 'uppercase', letterSpacing: '0.08em' }}>సంభాషణల చరిత్ర (History)</span>
          <button onClick={onClose} style={{ color: C.muted, background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', lineHeight: 1, padding: '0 2px' }}>×</button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {sessions.length === 0 ? (
            <p style={{ fontSize: 12, color: C.muted, textAlign: 'center', padding: '32px 0' }}>సంభాషణలు లేవు (No chats)</p>
          ) : (
            sessions.map((session) => {
              const isActive = session.id === activeSessionId;
              return (
                <div
                  key={session.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    borderRadius: 10,
                    background: isActive ? C.userBubbleBg : 'none',
                    border: `1px solid ${isActive ? C.userBubbleBorder : 'transparent'}`,
                    transition: 'all 0.1s'
                  }}
                >
                  <button
                    onClick={() => { onSelectSession(session.id); onClose(); }}
                    style={{ flex: 1, textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', outline: 'none', padding: 0 }}
                  >
                    <p style={{ fontSize: 12, fontWeight: isActive ? 700 : 500, color: C.text, lineHeight: 1.5, margin: '0 0 3px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {session.title || 'సంభాషణ (Chat)'}
                    </p>
                    <span style={{ fontSize: 10, color: C.muted }}>{ago(session.timestamp)}</span>
                  </button>
                  <button
                    onClick={() => onDeleteSession(session.id)}
                    style={{ color: C.roseText, background: 'none', border: 'none', cursor: 'pointer', padding: '4px 6px', fontSize: 14, fontWeight: 'bold', marginLeft: 6 }}
                    title="Delete Chat"
                  >
                    ×
                  </button>
                </div>
              );
            })
          )}
        </div>
        {sessions.length > 0 && (
          <div style={{ padding: '10px 16px', borderTop: `1px solid ${C.border}`, flexShrink: 0 }}>
            <button onClick={onClearAllSessions} style={{ width: '100%', fontSize: 11, color: C.roseText, background: 'none', border: 'none', cursor: 'pointer', padding: '6px 0', fontWeight: 600 }}>
              చరిత్రను తుడిచివేయి (Clear All)
            </button>
          </div>
        )}
      </div>
      <div style={{ flex: 1, background: 'rgba(0,0,0,0.4)' }} onClick={onClose} />
    </div>
  );
}

// ─── Input Bar ────────────────────────────────────────────────────
function InputBar({
  value,
  onChange,
  onSend,
  isLoading,
  isEmpty,
  onSelectSuggestion,
  inputRef,
  C
}: {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  isLoading: boolean;
  isEmpty: boolean;
  onSelectSuggestion: (t: string) => void;
  inputRef: React.RefObject<HTMLInputElement>;
  C: ReturnType<typeof getColors>;
}) {
  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div style={{ flexShrink: 0, borderTop: `1px solid ${C.border}`, background: C.inputBg, backdropFilter: 'blur(8px)' }}>
      {isEmpty && (
        <div style={{ padding: '12px 16px 4px', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {QUERIES.map((q) => (
            <button
              key={q.label}
              onClick={() => onSelectSuggestion(q.text)}
              style={{ fontSize: 10, fontWeight: 600, color: C.muted, padding: '4px 10px', borderRadius: 8, background: C.bg, border: `1px solid ${C.border}`, cursor: 'pointer', transition: 'all 0.1s' }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.btnHoverBorder; e.currentTarget.style.color = C.text; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.muted; }}
            >
              {q.icon} {q.label}
            </button>
          ))}
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px' }}>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKey}
          disabled={isLoading}
          placeholder="ఉద్యోగం, వివాహం, ఆస్తులు, ఆరోగ్యం గురించి అడగండి..."
          style={{ flex: 1, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12, padding: '10px 16px', fontSize: 13, color: C.text, outline: 'none', transition: 'border-color 0.15s', opacity: isLoading ? 0.55 : 1 }}
          onFocus={(e) => { e.target.style.borderColor = C.accent; }}
          onBlur={(e) => { e.target.style.borderColor = C.border; }}
        />
        <button
          onClick={onSend}
          disabled={isLoading || !value.trim()}
          style={{ width: 40, height: 40, borderRadius: 12, flexShrink: 0, background: (!isLoading && value.trim()) ? C.accent : C.border, border: 'none', cursor: (!isLoading && value.trim()) ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: (!isLoading && value.trim()) ? '#FFFFFF' : C.muted, fontWeight: 900, transition: 'background 0.15s' }}
        >
          {isLoading ? (
            <span style={{ width: 16, height: 16, border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%' }} className="animate-spin" />
          ) : (
            '↑'
          )}
        </button>
      </div>
    </div>
  );
}

// ─── Main Advanced AI Tab Component ────────────────────────────────
export const AdvancedAITab: React.FC<AdvancedAITabProps> = ({
  birthDetails,
  birthData,
  horoscopeData,
  language = 'te',
  profiles = [],
  onSelectProfile
}) => {
  const { isDark } = useTheme();
  const C = getColors(isDark);
  const { user } = useAuth();

  const effectiveBirthDetails: BirthDetails = birthDetails || birthData || {
    name: 'Akhil',
    date: '1996-11-11',
    time: '13:50:00',
    approximateTime: false,
    place: 'Jaggampeta',
    gender: 'Male',
    latitude: 17.17,
    longitude: 82.0611,
    timezone: 5.5
  };

  const {
    messages,
    isLoading,
    streamingText,
    error,
    sessions,
    activeSessionId,
    sendMessage,
    startNewSession,
    loadSession,
    deleteSession,
    clearAllSessions
  } = useAdvancedAIChat({
    birthData: effectiveBirthDetails,
    horoscopeData,
    userId: user?.uid,
    language: 'te'
  });

  const bufferedStreamingText = useTextStreamBuffer(streamingText, isLoading, 50);

  const [input, setInput] = useState('');
  const [historyOpen, setHistoryOpen] = useState(false);
  const [inspectorOpen, setInspectorOpen] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingText, isLoading]);

  const activeDashaStr = useMemo(() => {
    if (horoscopeData) {
      try {
        const activeDashaObj = calculateActiveDasha(horoscopeData, effectiveBirthDetails?.date || '1996-11-11', new Date());
        if (activeDashaObj) {
          return `${activeDashaObj.mahadasha?.lord || 'Saturn'} MD → ${activeDashaObj.antardasha?.lord || 'Rahu'} AD`;
        }
      } catch (e) {}
    }
    return 'Saturn MD → Rahu AD';
  }, [horoscopeData, effectiveBirthDetails]);

  const service = useRef(new EnhancedGeminiConsultationService()).current;

  // Active query and computed ground truths for inspector
  const activeQuery = messages.length > 0 ? messages[messages.length - 1].content : 'When will I get married?';
  const kpGroundTruths = service.computeKPGroundTruths(activeQuery, effectiveBirthDetails, horoscopeData);

  const handleSend = useCallback(
    (overrideText?: string) => {
      const q = (typeof overrideText === 'string' ? overrideText : input).trim();
      if (!q || isLoading) return;

      setInput('');
      sendMessage(q);
      setTimeout(() => inputRef.current?.focus(), 100);
    },
    [input, isLoading, sendMessage]
  );

  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', height: 680, background: C.bg, color: C.text, overflow: 'hidden', fontFamily: 'system-ui, -apple-system, sans-serif', borderRadius: 16, border: `1px solid ${C.border}`, boxShadow: `0 8px 24px ${C.shadow}` }}>
      <SessionHistoryPanel
        isOpen={historyOpen}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onClose={() => setHistoryOpen(false)}
        onSelectSession={loadSession}
        onDeleteSession={deleteSession}
        onClearAllSessions={clearAllSessions}
        C={C}
      />

      {/* Header */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px 12px', padding: '10px 14px', borderBottom: `1px solid ${C.border}`, background: C.headerBg, backdropFilter: 'blur(8px)', flexShrink: 0 }}>
        {profiles.length > 1 && onSelectProfile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <select
              value={effectiveBirthDetails.name}
              onChange={(e) => {
                const found = profiles.find((p) => p.name === e.target.value);
                if (found) onSelectProfile(found);
              }}
              style={{ background: C.surface, color: C.text, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 11, padding: '4px 8px', outline: 'none', maxWidth: '100%' }}
            >
              {profiles.map((p) => (
                <option key={p.id || p.name} value={p.name}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Header Right Actions */}
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginLeft: 'auto' }}>
          {/* Static Telugu Astro Engine Badge */}
          <div style={{
            fontSize: 11,
            fontWeight: 700,
            background: C.emptyIconBg,
            color: C.accent,
            border: `1px solid ${C.emptyIconBorder}`,
            borderRadius: 8,
            padding: '5px 10px',
            display: 'flex',
            alignItems: 'center',
            gap: 5
          }}>
            <span>తెలుగు ఆస్ట్రో ఇంజిన్ (Telugu AI)</span>
          </div>

          <button
            onClick={() => startNewSession()}
            style={{ fontSize: 11, fontWeight: 700, color: C.muted, padding: '5px 10px', borderRadius: 8, background: 'none', border: `1px solid ${C.border}`, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.1s' }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.btnHoverBorder; e.currentTarget.style.color = C.text; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.muted; }}
          >
            కొత్త చాట్ (New Chat)
          </button>

          <button
            onClick={() => setHistoryOpen(true)}
            style={{ fontSize: 11, fontWeight: 700, color: C.muted, padding: '5px 10px', borderRadius: 8, background: 'none', border: `1px solid ${C.border}`, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap', transition: 'all 0.1s' }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.btnHoverBorder; e.currentTarget.style.color = C.text; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.muted; }}
          >
            ⏱ చరిత్ర (History) {sessions.length > 0 && <span style={{ color: C.accent }}>({sessions.length})</span>}
          </button>
        </div>
      </header>

      {/* Main Body - KP Query View or Classical AI Chat */}
      <main style={{ flex: 1, overflowY: 'auto' }}>
        {messages.length === 0 ? (
          <EmptyState
            onSelect={handleSend}
            C={C}
            activeDashaStr={activeDashaStr}
            horoscopeData={horoscopeData}
            birthDetails={effectiveBirthDetails}
          />
        ) : (
          <div style={{ maxWidth: 680, margin: '0 auto', padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: 20 }}>
            {messages.map((msg, idx) =>
              msg.role === 'user' ? (
                <UserBubble key={idx} text={msg.content} C={C} />
              ) : (
                <AssistantBubble
                  key={idx}
                  msg={msg}
                  C={C}
                  onOpenInspector={() => setInspectorOpen(true)}
                  onSendFollowUp={handleSend}
                />
              )
            )}

            {/* Live Streaming Response */}
            {(streamingText || bufferedStreamingText) && (
              <AssistantBubble
                msg={{
                  role: 'assistant',
                  content: bufferedStreamingText || streamingText,
                  metadata: { persona: 'quick', queryDomain: 'STREAMING' }
                }}
                C={C}
              />
            )}

            {/* Loading Indicator */}
            {isLoading && !streamingText && !bufferedStreamingText && (
              <LoadingBubble C={C} text="తెలుగు ఆస్ట్రో విశ్లేషణ సిద్ధమవుతోంది..." />
            )}

            {/* Error Notification */}
            {error && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '10px 14px', borderRadius: 12, background: C.roseBg, border: `1px solid ${C.roseBorder}`, color: C.roseText, fontSize: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <AlertCircle className="w-4 h-4" />
                  <span>గమనిక: {error}</span>
                </div>
                <button
                  onClick={() => handleSend('Retry last query')}
                  style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 6, background: C.roseText, color: '#FFFFFF', border: 'none', cursor: 'pointer' }}
                >
                  మళ్లీ ప్రయత్నించు
                </button>
              </div>
            )}

            <div ref={scrollRef} />
          </div>
        )}
      </main>

      {/* Input Bar */}
      <InputBar
        inputRef={inputRef}
        value={input}
        onChange={setInput}
        onSend={() => handleSend()}
        isLoading={isLoading}
        isEmpty={messages.length === 0}
        onSelectSuggestion={handleSend}
        C={C}
      />

      {/* Ground Truth Inspector Drawer */}
      <GroundTruthInspectorDrawer
        isOpen={inspectorOpen}
        onClose={() => setInspectorOpen(false)}
        groundTruths={kpGroundTruths}
        language="te"
      />
    </div>
  );
};

export default AdvancedAITab;
