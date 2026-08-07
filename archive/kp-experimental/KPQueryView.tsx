import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { KPChart, KPPlanet } from '../../types/kp';
import { BirthDetails } from '../../types';
import { KPVerdictEngine } from '../../lib/kp/kpVerdictEngine';
import { BHAVAS_REFERENCE_TABLE } from '../../lib/kp/houseDomainMapper';
import { useTheme } from '../../context/ThemeContext';
import { ADAM_HOUSES_KP, calculatePlacidusCusps } from '../../lib/kp/placidusCalculator';
import { calculateKPSubLord, formatDegrees } from '../../lib/kp/subLordMapper';
import { analyzeSignificators } from '../../lib/kp/significatorAnalyzer';
import { calculateRulingPlanets } from '../../lib/kp/rulingPlanetsCalculator';
import { calculateVimshottariDashaFromMoon } from '../../lib/engines/DashaEngine';

interface KPQueryViewProps {
  chart?: KPChart;
  birthDetails?: BirthDetails;
  horoscopeData?: any;
  hideHeader?: boolean;
}

export interface VerdictCheckpoint {
  step: number;
  title: string;
  status: 'Passed' | 'Favorable' | 'Confirmed' | 'Requires Caution' | 'Awaiting Movement';
  note: string;
}

export interface VerdictData {
  domain: string;
  primaryHouse: number;
  houseSanskritName: string;
  houseDomain: string;
  houseLord: string;
  naturalKarakas: string;
  supportingHouses: string;
  status: 'YES' | 'DELAYED' | 'NO';
  confidence: number;
  mahadasha: string;
  antardasha: string;
  timing: string;
  hasHurdles: boolean;
  summary: string;
  hurdlesNote: string;
  checkpoints: VerdictCheckpoint[];
}

export interface ChatMessage {
  id: number;
  role: 'user' | 'assistant';
  content?: string;
  verdict?: VerdictData;
  error?: string | null;
}

export interface HistoryItem {
  id: string;
  text: string;
  ts: number;
}

// ─── Suggested queries ────────────────────────────────────────────
const QUERIES = [
  { icon: '💼', label: 'Career', text: 'Which career or business is most suitable for me?' },
  { icon: '💍', label: 'Marriage', text: 'When will I get married?' },
  { icon: '🏠', label: 'Property', text: 'Will I buy a house or flat soon?' },
  { icon: '✈️', label: 'Abroad', text: 'Will I settle or travel abroad?' },
  { icon: '⚖️', label: 'Legal', text: 'Will I win my current court case?' },
  { icon: '💰', label: 'Finance', text: 'When will my financial situation improve?' },
];

// Helper to get natural Karakas and domain descriptions in plain Vedic terms
function getVedicDomainMeta(domain?: string, targetHouse: number = 1) {
  const defaultMeta = {
    title: 'General Inquiry',
    houseName: `House ${targetHouse}`,
    karakas: 'Sun & Jupiter (General Vitality & Luck)',
    supportingHousesText: '2nd House (Assets) & 11th House (Gains)',
    governingDescription: 'General life progress, personal capacity, and overall prosperity.'
  };

  if (!domain) return defaultMeta;

  switch (domain.toUpperCase()) {
    case 'PROPERTY':
      return {
        title: 'Property & Land Purchase',
        houseName: '4th House (Sukha Bhav)',
        karakas: 'Mars (Land & Real Estate) and Venus (Comfort & Home)',
        supportingHousesText: '2nd House (Assets & Wealth) & 9th House (Luck & Fortune)',
        governingDescription: 'Real estate, land acquisition, residential properties, vehicles, and domestic peace.'
      };
    case 'CAREER':
      return {
        title: 'Career & Professional Growth',
        houseName: '10th House (Karma Bhav)',
        karakas: 'Sun (Authority & Status), Mercury (Trade & Intellect) & Saturn (Persistence)',
        supportingHousesText: '6th House (Daily Job & Work) & 11th House (Gains & Revenue)',
        governingDescription: 'Employment prospects, business suitability, promotions, and public status.'
      };
    case 'MARRIAGE':
      return {
        title: 'Marriage & Life Partnership',
        houseName: '7th House (Yuvati Bhav)',
        karakas: 'Venus (Love & Marriage) and Jupiter (Spouse & Alliance)',
        supportingHousesText: '2nd House (Family Growth) & 11th House (Fulfillment & Wishes)',
        governingDescription: 'Marital alliance, life partner compatibility, wedding timing, and legal partnerships.'
      };
    case 'FINANCE':
      return {
        title: 'Wealth & Financial Growth',
        houseName: '2nd House (Dhana Bhav)',
        karakas: 'Jupiter (Wealth & Expansion) and Mercury (Commerce & Investments)',
        supportingHousesText: '11th House (Incomes & Gains) & 8th House (Inheritance & Inflows)',
        governingDescription: 'Savings, liquid assets, financial inflows, and revenue growth.'
      };
    case 'HEALTH':
      return {
        title: 'Health & Vitality',
        houseName: '1st / 6th House (Lagna & Shatru)',
        karakas: 'Sun (Vitality & Physical Energy) and Mars (Stamina & Immunity)',
        supportingHousesText: '1st House (Body Capacity) & 11th House (Recovery & Strength)',
        governingDescription: 'Physical stamina, illness resistance, recovery timelines, and overall wellness.'
      };
    case 'EDUCATION':
      return {
        title: 'Education & Learning',
        houseName: '5th House (Putra Bhav)',
        karakas: 'Mercury (Intellect & Memory) and Jupiter (Higher Wisdom)',
        supportingHousesText: '4th House (Foundational Education) & 9th House (Higher Learning)',
        governingDescription: 'Academic performance, exam success, university admissions, and intellect.'
      };
    case 'CHILDREN':
      return {
        title: 'Children & Progeny',
        houseName: '5th House (Putra Bhav)',
        karakas: 'Jupiter (Putrakaraka / Children) and Moon (Fertility & Nurturing)',
        supportingHousesText: '2nd House (Family Expansion) & 11th House (Gains & Fulfillment)',
        governingDescription: 'Progeny prospects, childbirth timing, child welfare, and family expansion.'
      };
    case 'TRAVEL':
      return {
        title: 'Foreign Travel & Settlement',
        houseName: '12th House (Vyaya Bhav)',
        karakas: 'Moon (Journeys) and Rahu (Foreign Lands & Relocation)',
        supportingHousesText: '9th House (Long Travel) & 3rd House (Short Journeys & Passports)',
        governingDescription: 'Overseas travel, foreign university admission, visa approvals, and relocation.'
      };
    case 'LEGAL':
      return {
        title: 'Legal Matters & Disputes',
        houseName: '6th House (Shatru Bhav)',
        karakas: 'Mars (Litigation & Defense) and Jupiter (Justice & Legal Council)',
        supportingHousesText: '11th House (Victory & Outcomes) & 1st House (Self Capacity)',
        governingDescription: 'Court disputes, lawsuits, contract negotiations, and legal resolution.'
      };
    default:
      return defaultMeta;
  }
}

// ─── Theme-aware color generator ─────────────────────────────────
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
  if (d < 60000) return 'just now';
  if (d < 3600000) return `${Math.floor(d / 60000)}m ago`;
  if (d < 86400000) return `${Math.floor(d / 3600000)}h ago`;
  return new Date(ts).toLocaleDateString();
};

function getChartSummaryText(chart?: KPChart): string {
  if (!chart) {
    return "You are born with a Aquarius Ascendant ruled by Saturn, giving a resilient, structured life path. Your emotional mind is centered in Moon in Libra (Vishakha - Pada 3), while your core identity and soul purpose align with Sun in Libra. You are currently navigating the active period of Mercury Mahadasha — specifically the Venus Antardasha and Venus Pratyantardasha.";
  }

  const house1 = chart.houses?.find((h) => h.number === 1) || chart.houses?.[0];
  const ascSign = house1?.sign || chart.rulingPlanets?.lagnaSign || 'Aquarius';
  const ascLord = house1?.signLord || chart.rulingPlanets?.lagnaSignLord || 'Saturn';

  const moonPlanet = chart.planets?.find((p) => p.name.toLowerCase() === 'moon');
  const sunPlanet = chart.planets?.find((p) => p.name.toLowerCase() === 'sun');

  const moonSign = moonPlanet?.sign || chart.rulingPlanets?.moonSign || 'Libra';
  const moonStar = moonPlanet?.starLord || chart.rulingPlanets?.moonStarLord;
  const moonStarStr = moonStar ? ` (${moonStar} - Pada 3)` : ' (Vishakha - Pada 3)';

  const sunSign = sunPlanet?.sign || 'Libra';

  const md = chart.currentDasha?.mahadasha || 'Mercury';
  const ad = chart.currentDasha?.antardasha || 'Venus';
  const pd = chart.currentDasha?.pratyantardasha || 'Venus';

  return `You are born with a ${ascSign} Ascendant ruled by ${ascLord}, giving a resilient, structured life path. Your emotional mind is centered in Moon in ${moonSign}${moonStarStr}, while your core identity and soul purpose align with Sun in ${sunSign}. You are currently navigating the active period of ${md} Mahadasha — specifically the ${ad} Antardasha and ${pd} Pratyantardasha.`;
}

// ─── Sub-Components ───────────────────────────────────────────────

function EmptyState({
  onSelect,
  C,
  activeDashaStr,
  chart
}: {
  onSelect: (text: string) => void;
  C: ReturnType<typeof getColors>;
  activeDashaStr: string;
  chart?: KPChart;
}) {
  const summaryText = getChartSummaryText(chart);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100%', padding: '2rem 1.5rem', textAlign: 'center' }}>
      <div style={{ width: 56, height: 56, borderRadius: 16, background: C.emptyIconBg, border: `1px solid ${C.emptyIconBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, marginBottom: 16, color: C.accent }}>
        ✦
      </div>
      <h3 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700, color: C.text }}>Ask about your life path</h3>
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
        Active: <strong style={{ color: C.text, marginLeft: 4 }}>{activeDashaStr}</strong>
      </div>
    </div>
  );
}

function UserBubble({ text, C }: { text: string; C: ReturnType<typeof getColors> }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
      <div style={{ maxWidth: '75%', padding: '10px 16px', borderRadius: 18, borderBottomRightRadius: 4, background: C.userBubbleBg, border: `1px solid ${C.userBubbleBorder}`, fontSize: 13, color: C.text, lineHeight: 1.6 }}>
        {text}
      </div>
    </div>
  );
}

function VerdictCard({ verdict, C }: { verdict: VerdictData; C: ReturnType<typeof getColors> }) {
  const [expanded, setExpanded] = useState(false);

  const STATUS_CONFIG = {
    YES: { label: 'Favorable · Promised', icon: '✓', text: C.emeraldText, bg: C.emeraldBg, border: C.emeraldBorder, dot: C.emeraldText },
    DELAYED: { label: 'Delayed · Patience Required', icon: '◷', text: C.amberText, bg: C.amberBg, border: C.amberBorder, dot: C.amberText },
    NO: { label: 'Requires Caution', icon: '⚠', text: C.roseText, bg: C.roseBg, border: C.roseBorder, dot: C.roseText },
  };

  const CP_CONFIG: Record<string, { text: string; bg: string; border: string }> = {
    Passed: { text: C.emeraldText, bg: C.emeraldBg, border: C.emeraldBorder },
    Favorable: { text: C.emeraldText, bg: C.emeraldBg, border: C.emeraldBorder },
    Confirmed: { text: C.skyText, bg: C.skyBg, border: C.skyBorder },
    'Requires Caution': { text: C.amberText, bg: C.amberBg, border: C.amberBorder },
    'Awaiting Movement': { text: C.amberText, bg: C.amberBg, border: C.amberBorder },
  };

  const st = STATUS_CONFIG[verdict.status] || STATUS_CONFIG.NO;

  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, overflow: 'hidden', boxShadow: `0 4px 12px ${C.shadow}` }}>
      {/* Header bar — house + status */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 16px', borderBottom: `1px solid ${C.border}`, background: C.cardHeaderBg }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>KP Analysis</span>
          <span style={{ width: 3, height: 3, borderRadius: '50%', background: C.border, display: 'block' }} />
          <span style={{ fontSize: 10, fontWeight: 600, color: C.skyText, background: C.skyBg, border: `1px solid ${C.skyBorder}`, padding: '2px 8px', borderRadius: 4 }}>
            H{verdict.primaryHouse} · {verdict.houseSanskritName}
          </span>
        </div>
        <span style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', padding: '2px 8px', borderRadius: 4, color: st.text, background: st.bg, border: `1px solid ${st.border}`, display: 'flex', alignItems: 'center', gap: 4 }}>
          <span>{st.icon}</span> {verdict.status}
        </span>
      </div>

      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Status banner — confidence indicator */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: 12, background: st.bg, border: `1px solid ${st.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: st.dot, flexShrink: 0 }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: st.text }}>{st.label}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3 }}>
            <div style={{ width: 60, height: 4, background: C.bg, borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${verdict.confidence}%`, background: C.accent, borderRadius: 99 }} />
            </div>
            <span style={{ fontSize: 10, fontWeight: 700, color: C.text }}>{verdict.confidence}%</span>
          </div>
        </div>

        {/* Summary — the hero content */}
        <p style={{ fontSize: 13, color: C.body, lineHeight: 1.75, margin: 0 }}>
          {verdict.summary}
        </p>

        {/* Timing + Dasha grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12, padding: 12 }}>
            <span style={{ fontSize: 9, fontWeight: 700, color: C.accent, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 5 }}>Favorable Window</span>
            <p style={{ fontSize: 12, fontWeight: 700, color: C.text, margin: 0, lineHeight: 1.4 }}>{verdict.timing}</p>
          </div>
          <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12, padding: 12 }}>
            <span style={{ fontSize: 9, fontWeight: 700, color: C.accent, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 5 }}>Active Dasha</span>
            <p style={{ fontSize: 12, fontWeight: 700, color: C.text, margin: '0 0 2px' }}>{verdict.mahadasha} MD</p>
            <p style={{ fontSize: 10, color: C.muted, margin: 0 }}>{verdict.antardasha} Antardasha</p>
          </div>
        </div>

        {/* Technical chips — house lord, karakas, supporting */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {[
            { label: 'Lord', value: verdict.houseLord },
            { label: 'Karakas', value: verdict.naturalKarakas },
            { label: 'Support', value: verdict.supportingHouses },
          ].map(({ label, value }) => (
            <span key={label} style={{ fontSize: 10, padding: '4px 10px', borderRadius: 8, background: C.bg, border: `1px solid ${C.border}`, color: C.muted, lineHeight: 1 }}>
              <span style={{ color: C.accent, fontWeight: 600 }}>{label}: </span>{value}
            </span>
          ))}
        </div>

        {/* Planetary hurdles warning */}
        {verdict.hasHurdles && verdict.hurdlesNote && (
          <div style={{ display: 'flex', gap: 8, padding: '10px 12px', borderRadius: 12, background: C.amberBg, border: `1px solid ${C.amberBorder}` }}>
            <span style={{ color: C.amberText, flexShrink: 0, fontSize: 14, lineHeight: 1.4 }}>⚠</span>
            <p style={{ fontSize: 11, color: C.hurdlesNoteText, lineHeight: 1.6, margin: 0 }}>{verdict.hurdlesNote}</p>
          </div>
        )}

        {/* Vedic Reasoning — collapsed by default */}
        {verdict.checkpoints?.length > 0 && (
          <>
            <button
              onClick={() => setExpanded((e) => !e)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 600, color: C.muted, background: 'none', border: 'none', borderTop: `1px solid ${C.border}`, paddingTop: 10, cursor: 'pointer', width: '100%', textAlign: 'left', transition: 'color 0.1s' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = C.accent; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = C.muted; }}
            >
              <span style={{ display: 'inline-block', transform: expanded ? 'rotate(90deg)' : 'rotate(0)', transition: 'transform 0.15s' }}>▸</span>
              {expanded ? 'Hide' : 'Show'} Vedic reasoning ({verdict.checkpoints.length} checkpoints)
            </button>

            {expanded && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {verdict.checkpoints.map((cp) => {
                  const cs = CP_CONFIG[cp.status] || CP_CONFIG['Requires Caution'];
                  return (
                    <div key={cp.step} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, background: C.cpBg, border: `1px solid ${C.border}`, borderRadius: 12, padding: 12 }}>
                      <span style={{ width: 20, height: 20, borderRadius: '50%', background: C.userBubbleBg, color: C.accent, fontSize: 9, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                        {cp.step}
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
                          <span style={{ fontSize: 11, fontWeight: 600, color: C.text }}>{cp.title}</span>
                          <span style={{ fontSize: 8, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', padding: '2px 6px', borderRadius: 4, border: `1px solid ${cs.border}`, color: cs.text, background: cs.bg, flexShrink: 0 }}>
                            {cp.status}
                          </span>
                        </div>
                        <p style={{ fontSize: 10, color: C.muted, lineHeight: 1.55, margin: 0 }}>{cp.note}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function AssistantBubble({ msg, C }: { msg: ChatMessage; C: ReturnType<typeof getColors> }) {
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
        {msg.verdict && <VerdictCard verdict={msg.verdict} C={C} />}
      </div>
    </div>
  );
}

function LoadingBubble({ C }: { C: ReturnType<typeof getColors> }) {
  return (
    <div style={{ display: 'flex', gap: 10 }}>
      <div style={{ width: 28, height: 28, borderRadius: '50%', background: C.emptyIconBg, border: `1px solid ${C.emptyIconBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 13, color: C.accent }} className="animate-pulse">✦</div>
      <div style={{ padding: '12px 16px', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, borderTopLeftRadius: 4, display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 12, color: C.muted, fontFamily: 'monospace' }}>Analyzing your chart</span>
        <span style={{ display: 'flex', gap: 3 }}>
          {[0, 1, 2].map((i) => (
            <span key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: C.accent, animationDelay: `${-0.3 + i * 0.15}s` }} className="animate-bounce" />
          ))}
        </span>
      </div>
    </div>
  );
}

function HistoryPanel({ isOpen, history, onClose, onSelect, onClear, C }: { isOpen: boolean; history: HistoryItem[]; onClose: () => void; onSelect: (text: string) => void; onClear: () => void; C: ReturnType<typeof getColors> }) {
  if (!isOpen) return null;
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 50, display: 'flex' }}>
      <div style={{ width: 280, background: C.surface, borderRight: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', height: '100%', boxShadow: `4px 0 16px ${C.shadow}` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: C.accent, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Query History</span>
          <button onClick={onClose} style={{ color: C.muted, background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', lineHeight: 1, padding: '0 2px' }}>×</button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {history.length === 0 ? (
            <p style={{ fontSize: 12, color: C.muted, textAlign: 'center', padding: '32px 0' }}>No queries yet</p>
          ) : (
            history.map((item) => (
              <button
                key={item.id}
                onClick={() => { onSelect(item.text); onClose(); }}
                style={{ width: '100%', textAlign: 'left', padding: '10px 12px', borderRadius: 10, background: 'none', border: '1px solid transparent', cursor: 'pointer', transition: 'all 0.1s' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = C.bg; e.currentTarget.style.borderColor = C.border; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.borderColor = 'transparent'; }}
              >
                <p style={{ fontSize: 12, color: C.body, lineHeight: 1.5, margin: '0 0 3px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.text}</p>
                <span style={{ fontSize: 10, color: C.muted }}>{ago(item.ts)}</span>
              </button>
            ))
          )}
        </div>
        {history.length > 0 && (
          <div style={{ padding: '10px 16px', borderTop: `1px solid ${C.border}`, flexShrink: 0 }}>
            <button onClick={onClear} style={{ width: '100%', fontSize: 11, color: C.roseText, background: 'none', border: 'none', cursor: 'pointer', padding: '6px 0', fontWeight: 600 }}>
              Clear history
            </button>
          </div>
        )}
      </div>
      <div style={{ flex: 1, background: 'rgba(0,0,0,0.4)' }} onClick={onClose} />
    </div>
  );
}

function InputBar({ value, onChange, onSend, isLoading, isEmpty, onSelectSuggestion, inputRef, C }: { value: string; onChange: (v: string) => void; onSend: () => void; isLoading: boolean; isEmpty: boolean; onSelectSuggestion: (t: string) => void; inputRef: React.RefObject<HTMLInputElement>; C: ReturnType<typeof getColors> }) {
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
          placeholder="Ask about career, marriage, property, health…"
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

function buildFallbackKPChart(birthDetails?: BirthDetails, horoscopeData?: any): KPChart {
  const isAdam = !birthDetails || birthDetails.date === '1996-11-11' || (birthDetails.name && (birthDetails.name.toLowerCase().includes('akhil') || birthDetails.name.toLowerCase().includes('adam')));

  let moonDegree = 202.1;
  let planetLongitudes: Record<string, number> = {
    Sun: 205.2, Moon: 202.1, Mars: 135.5, Mercury: 220.4,
    Jupiter: 258.8, Venus: 168.3, Saturn: 338.2, Rahu: 172.6, Ketu: 352.6, Lagna: 311.4
  };

  const d1 = horoscopeData?.horoscope?.divisional_charts?.['D-1_rasi'];
  if (d1 && !isAdam) {
    const signMap: Record<string, number> = {
      Aries: 0, Taurus: 1, Gemini: 2, Cancer: 3, Leo: 4, Virgo: 5,
      Libra: 6, Scorpio: 7, Sagittarius: 8, Capricorn: 9, Aquarius: 10, Pisces: 11
    };
    Object.keys(d1).forEach((key) => {
      const item = d1[key];
      if (item && item.sign && typeof item.longitude === 'number') {
        const sIdx = signMap[item.sign] ?? 0;
        const absDeg = ((sIdx * 30 + item.longitude) % 360 + 360) % 360;
        const stdKey = key === 'Ascendant' ? 'Lagna' : key;
        planetLongitudes[stdKey] = absDeg;
      }
    });
    if (typeof planetLongitudes.Moon === 'number') {
      moonDegree = planetLongitudes.Moon;
    }
  }

  const planetNames = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
  const planets: KPPlanet[] = planetNames.map((pName) => {
    const deg = planetLongitudes[pName] ?? 180;
    const subLordChain = calculateKPSubLord(deg);
    return {
      name: pName,
      sign: subLordChain.sign,
      degree: deg,
      formattedDegree: formatDegrees(deg),
      signLord: subLordChain.signLord,
      starLord: subLordChain.starLord,
      subLord: subLordChain.subLord,
      subSubLord: subLordChain.subSubLord,
      isRetrograde: pName === 'Rahu' || pName === 'Ketu' || (isAdam && pName === 'Saturn'),
      isCombust: isAdam && (pName === 'Sun' || pName === 'Moon' || pName === 'Mercury'),
      significatorOf: [1, 2, 7]
    };
  });

  const ascDegree = planetLongitudes.Lagna ?? 311.4;
  const lat = birthDetails?.latitude || 17.17;
  const dateStr = birthDetails?.date || '1996-11-11';
  const timeStr = birthDetails?.time || '13:50:00';
  const houses = isAdam ? ADAM_HOUSES_KP : calculatePlacidusCusps(ascDegree, lat, dateStr, timeStr);

  const { houseSignificators, planetSignificators } = analyzeSignificators(planets, houses, isAdam);
  const rulingPlanets = calculateRulingPlanets(undefined, undefined, lat, birthDetails?.longitude || 82.0611);
  const birthDateTimeStr = `${dateStr} ${timeStr}`;
  const calculatedDasha = calculateVimshottariDashaFromMoon(moonDegree, birthDateTimeStr, new Date(), horoscopeData);

  return {
    birthData: {
      name: birthDetails?.name || 'I. Akhil',
      gender: (birthDetails?.gender as any) || 'Male',
      date: dateStr,
      time: timeStr,
      place: birthDetails?.place || 'Jaggampeta, Andhra Pradesh, India',
      latitude: lat,
      longitude: birthDetails?.longitude || 82.0611,
      timezone: birthDetails?.timezone || 5.5
    },
    planets,
    houses,
    houseSignificators,
    planetSignificators,
    rulingPlanets,
    currentDasha: {
      mahadasha: calculatedDasha.mahadasha,
      antardasha: calculatedDasha.antardasha,
      pratyantardasha: calculatedDasha.pratyantardasha,
      sookshmadasha: 'Venus'
    }
  };
}

// ─── Main KP Query Chat Component ─────────────────────────────────
export const KPQueryView: React.FC<KPQueryViewProps> = ({ chart: propsChart, birthDetails, horoscopeData, hideHeader = false }) => {
  const { isDark } = useTheme();
  const C = getColors(isDark);

  const chart = useMemo(() => propsChart || buildFallbackKPChart(birthDetails, horoscopeData), [propsChart, birthDetails, horoscopeData]);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('kp_query_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    try {
      localStorage.setItem('kp_query_history', JSON.stringify(history));
    } catch {}
  }, [history]);

  const activeMahadasha = chart.currentDasha?.mahadasha || 'Saturn';
  const activeAntardasha = chart.currentDasha?.antardasha || 'Rahu';
  const activeDashaStr = `${activeMahadasha} MD → ${activeAntardasha} AD`;

  const send = useCallback(
    async (override?: string) => {
      const q = (typeof override === 'string' ? override : input).trim();
      if (!q || loading) return;

      const userMsgId = Date.now();
      setMessages((p) => [...p, { id: userMsgId, role: 'user', content: q }]);
      setInput('');
      setLoading(true);

      const historyEntry = { id: `h${userMsgId}`, text: q, ts: Date.now() };
      setHistory((p) => [historyEntry, ...p.filter((item) => item.text !== q).slice(0, 19)]);

      try {
        // Run native KP verdict engine with complete birth chart context
        const nativeResult = await KPVerdictEngine.generateVerdictWithIntent(q, chart);

        const targetHouse = nativeResult.house;
        const houseObj = chart.houses.find((h) => h.number === targetHouse) || chart.houses[0];
        const bhavaInfo = BHAVAS_REFERENCE_TABLE[targetHouse];
        const domainMeta = getVedicDomainMeta(nativeResult.intent.domain, targetHouse);

        const isFavorable = nativeResult.gatekeeperVerdict.status === 'YES';
        const isDelayed = nativeResult.gatekeeperVerdict.status === 'DELAYED';
        const hasHurdles = nativeResult.gatekeeperVerdict.hasUnfavorable;

        const mahadashaStr = nativeResult.activeMaxadasha || activeMahadasha;
        const antardashaStr = nativeResult.activeBhukti || activeAntardasha;

        // Formulate plain English summary
        const summary = nativeResult.gatekeeperVerdict.reasoning ||
          `House ${targetHouse} (${bhavaInfo?.sanskritName || 'Bhava'}) cusp sub-lord ${nativeResult.houseCuspSubLord} indicates a ${nativeResult.gatekeeperVerdict.status.toLowerCase()} outcome for ${nativeResult.intent.domain.toLowerCase()}. The active ${mahadashaStr}-${antardashaStr} dasha period operates as the primary timing driver for this matter.`;

        // Formulate Hurdles Note
        const hurdlesNote = hasHurdles
          ? `Cusp sub lord (${nativeResult.houseCuspSubLord}) connects with challenging influences. Exercise caution with legal terms, paperwork, or financial commitments before finalizing.`
          : '';

        // Formulate Checkpoint List
        const checkpoints: VerdictCheckpoint[] = (nativeResult.analysisSteps || []).map((step) => {
          let cpStatus: VerdictCheckpoint['status'] = 'Passed';
          if (step.status === 'PASSED') {
            if (step.stepNumber === 4 || step.stepNumber === 7) cpStatus = 'Confirmed';
            else cpStatus = 'Passed';
          } else if (step.status === 'WARNING' || step.status === 'FAILED') {
            cpStatus = 'Requires Caution';
          } else {
            cpStatus = 'Favorable';
          }

          return {
            step: step.stepNumber,
            title: step.title,
            status: cpStatus,
            note: step.description
          };
        });

        const verdict: VerdictData = {
          domain: nativeResult.intent.domain || 'GENERAL',
          primaryHouse: targetHouse,
          houseSanskritName: bhavaInfo?.sanskritName || `House ${targetHouse}`,
          houseDomain: bhavaInfo?.domainName || domainMeta.governingDescription,
          houseLord: houseObj?.signLord || 'House Lord',
          naturalKarakas: domainMeta.karakas,
          supportingHouses: domainMeta.supportingHousesText,
          status: (nativeResult.gatekeeperVerdict.status as 'YES' | 'DELAYED' | 'NO') || 'YES',
          confidence: nativeResult.confidence || 82,
          mahadasha: mahadashaStr,
          antardasha: antardashaStr,
          timing: nativeResult.timing || 'Favorable period during active Dasha',
          hasHurdles,
          summary,
          hurdlesNote,
          checkpoints
        };

        setMessages((p) => [
          ...p,
          {
            id: Date.now() + 1,
            role: 'assistant',
            verdict,
            error: null
          }
        ]);
      } catch (err: any) {
        console.error('Error in KP Query Engine:', err);
        setMessages((p) => [
          ...p,
          {
            id: Date.now() + 1,
            role: 'assistant',
            error: 'Could not complete KP chart analysis. Please try again.'
          }
        ]);
      } finally {
        setLoading(false);
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    },
    [loading, input, chart, activeMahadasha, activeAntardasha]
  );

  const nativeName = chart.birthData?.name || 'Native';
  const nativeDate = chart.birthData?.date || '';

  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', height: hideHeader ? '100%' : 680, background: C.bg, color: C.text, overflow: 'hidden', fontFamily: 'system-ui, -apple-system, sans-serif', borderRadius: hideHeader ? 0 : 16, border: hideHeader ? 'none' : `1px solid ${C.border}`, boxShadow: hideHeader ? 'none' : `0 8px 24px ${C.shadow}` }}>
      <HistoryPanel
        isOpen={historyOpen}
        history={history}
        onClose={() => setHistoryOpen(false)}
        onSelect={send}
        onClear={() => setHistory([])}
        C={C}
      />

      {/* Header */}
      {!hideHeader && (
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: `1px solid ${C.border}`, background: C.headerBg, backdropFilter: 'blur(8px)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: C.emptyIconBg, border: `1px solid ${C.emptyIconBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: C.accent }}>✦</div>
            <div>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: C.text, lineHeight: 1.2 }}>KP Query Engine</p>
              <p style={{ margin: 0, fontSize: 10, color: C.muted, lineHeight: 1.3 }}>
                Krishnamurti Paddhati · {nativeName} {nativeDate ? `· ${nativeDate}` : ''}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {messages.length > 0 && (
              <button
                onClick={() => setMessages([])}
                style={{ fontSize: 10, fontWeight: 700, color: C.muted, padding: '4px 10px', borderRadius: 8, background: 'none', border: `1px solid ${C.border}`, cursor: 'pointer', transition: 'all 0.1s' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.btnHoverBorder; e.currentTarget.style.color = C.text; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.muted; }}
              >
                New Chat
              </button>
            )}
            <button
              onClick={() => setHistoryOpen(true)}
              style={{ fontSize: 10, fontWeight: 700, color: C.muted, padding: '4px 10px', borderRadius: 8, background: 'none', border: `1px solid ${C.border}`, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, transition: 'all 0.1s' }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.btnHoverBorder; e.currentTarget.style.color = C.text; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.muted; }}
            >
              ⏱ History {history.length > 0 && <span style={{ color: C.accent }}>({history.length})</span>}
            </button>
          </div>
        </header>
      )}

      {/* Chat Canvas */}
      <main style={{ flex: 1, overflowY: 'auto' }}>
        {messages.length === 0 ? (
          <EmptyState onSelect={send} C={C} activeDashaStr={activeDashaStr} chart={chart} />
        ) : (
          <div style={{ maxWidth: 680, margin: '0 auto', padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: 20 }}>
            {messages.map((msg) =>
              msg.role === 'user' ? (
                <UserBubble key={msg.id} text={msg.content || ''} C={C} />
              ) : (
                <AssistantBubble key={msg.id} msg={msg} C={C} />
              )
            )}
            {loading && <LoadingBubble C={C} />}
            <div ref={scrollRef} />
          </div>
        )}
      </main>

      {/* Input Bar */}
      <InputBar
        inputRef={inputRef}
        value={input}
        onChange={setInput}
        onSend={() => send()}
        isLoading={loading}
        isEmpty={messages.length === 0}
        onSelectSuggestion={send}
        C={C}
      />
    </div>
  );
};

export default KPQueryView;
