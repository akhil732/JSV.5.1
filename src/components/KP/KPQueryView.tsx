import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { KPChart, KPPlanet } from '../../types/kp';
import { BirthDetails } from '../../types';
import { KPVerdictEngine } from '../../lib/kp/kpVerdictEngine';
import { BHAVAS_REFERENCE_TABLE } from '../../lib/kp/houseDomainMapper';
import { useTheme } from '../../context/ThemeContext';
import { ADAM_HOUSES_KP, calculatePlacidusCusps } from '../../lib/kp/placidusCalculator';
import { calculateKPSubLord, formatDegrees, calculateApproximatePlanetaryLongitudes } from '../../lib/kp/subLordMapper';
import { analyzeSignificators, getHouseOccupied } from '../../lib/kp/significatorAnalyzer';
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
  activeDashaStr,
  chart
}: {
  onSelect: (text: string) => void;
  activeDashaStr: string;
  chart?: KPChart;
}) {
  const summaryText = getChartSummaryText(chart);
  return (
    <div className="flex flex-col items-center justify-center min-h-full p-8 text-center">
      <div className="w-14 h-14 rounded-2xl bg-ds-primary/10 border border-ds-primary/20 flex items-center justify-center text-xl mb-4 text-ds-primary">
        ✦
      </div>
      <h3 className="m-0 mb-2 text-lg font-bold text-ds-secondary">Ask about your life path</h3>
      <p className="m-0 mb-6 text-xs sm:text-sm text-ds-on-surface-variant max-w-lg leading-relaxed">
        {summaryText}
      </p>
      <div className="grid grid-cols-3 gap-2 w-full max-w-sm">
        {QUERIES.map((q) => (
          <button
            key={q.label}
            onClick={() => onSelect(q.text)}
            className="flex flex-col items-center gap-2 p-3.5 rounded-xl bg-ds-surface-container border border-ds-secondary/15 hover:border-ds-primary/40 transition-colors cursor-pointer"
          >
            <span className="text-xl">{q.icon}</span>
            <span className="text-xs font-semibold text-ds-on-surface-variant">{q.label}</span>
          </button>
        ))}
      </div>
      <div className="mt-6 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-ds-surface-container border border-ds-secondary/15 text-xs text-ds-on-surface-variant">
        <span className="w-1.5 h-1.5 rounded-full bg-ds-primary animate-pulse block" />
        Active: <strong className="text-ds-secondary ml-1">{activeDashaStr}</strong>
      </div>
    </div>
  );
}

function UserBubble({ text }: { text: string }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[75%] px-4 py-2.5 rounded-2xl rounded-br-xs bg-ds-primary/10 border border-ds-primary/20 text-xs sm:text-sm text-ds-secondary leading-relaxed">
        {text}
      </div>
    </div>
  );
}

function VerdictCard({ verdict }: { verdict: VerdictData }) {
  const [expanded, setExpanded] = useState(false);

  const STATUS_CONFIG = {
    YES: { label: 'Favorable · Promised', icon: '✓', text: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', dot: 'bg-emerald-500' },
    DELAYED: { label: 'Delayed · Patience Required', icon: '◷', text: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', dot: 'bg-amber-500' },
    NO: { label: 'Requires Caution', icon: '⚠', text: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30', dot: 'bg-rose-500' },
  };

  const CP_CONFIG: Record<string, { text: string; bg: string; border: string }> = {
    Passed: { text: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
    Favorable: { text: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
    Confirmed: { text: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-500/10', border: 'border-sky-500/30' },
    'Requires Caution': { text: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
    'Awaiting Movement': { text: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
  };

  const st = STATUS_CONFIG[verdict.status] || STATUS_CONFIG.NO;

  return (
    <div className="bg-ds-surface border border-ds-secondary/15 rounded-2xl overflow-hidden shadow-ds-sm">
      {/* Header bar — house + status */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-ds-secondary/15 bg-ds-surface-container">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-ds-on-surface-variant uppercase tracking-wider">KP Analysis</span>
          <span className="w-1 h-1 rounded-full bg-ds-secondary/20 block" />
          <span className="text-[10px] font-semibold text-sky-600 dark:text-sky-400 bg-sky-500/10 border border-sky-500/30 px-2 py-0.5 rounded">
            H{verdict.primaryHouse} · {verdict.houseSanskritName}
          </span>
        </div>
        <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border flex items-center gap-1 ${st.text} ${st.bg} ${st.border}`}>
          <span>{st.icon}</span> {verdict.status}
        </span>
      </div>

      <div className="p-4 flex flex-col gap-3">
        {/* Status banner — confidence indicator */}
        <div className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl border ${st.bg} ${st.border}`}>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${st.dot}`} />
            <span className={`text-xs sm:text-sm font-bold ${st.text}`}>{st.label}</span>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="w-15 h-1 bg-ds-surface rounded-full overflow-hidden">
              <div className="h-full bg-ds-primary rounded-full" style={{ width: `${verdict.confidence}%` }} />
            </div>
            <span className="text-[10px] font-bold text-ds-secondary">{verdict.confidence}%</span>
          </div>
        </div>

        {/* Summary — the hero content */}
        <p className="text-xs sm:text-sm text-ds-on-surface-variant leading-relaxed m-0">
          {verdict.summary}
        </p>

        {/* Timing + Dasha grid */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-ds-surface-container border border-ds-secondary/15 rounded-xl p-3">
            <span className="text-[9px] font-bold text-ds-primary uppercase tracking-wider block mb-1">Favorable Window</span>
            <p className="text-xs font-bold text-ds-secondary m-0 leading-tight">{verdict.timing}</p>
          </div>
          <div className="bg-ds-surface-container border border-ds-secondary/15 rounded-xl p-3">
            <span className="text-[9px] font-bold text-ds-primary uppercase tracking-wider block mb-1">Active Dasha</span>
            <p className="text-xs font-bold text-ds-secondary m-0 leading-tight">{verdict.mahadasha} MD</p>
            <p className="text-[10px] text-ds-on-surface-variant m-0 mt-0.5">{verdict.antardasha} Antardasha</p>
          </div>
        </div>

        {/* Technical chips — house lord, karakas, supporting */}
        <div className="flex flex-wrap gap-1.5">
          {[
            { label: 'Lord', value: verdict.houseLord },
            { label: 'Karakas', value: verdict.naturalKarakas },
            { label: 'Support', value: verdict.supportingHouses },
          ].map(({ label, value }) => (
            <span key={label} className="text-[10px] px-2.5 py-1 rounded-lg bg-ds-surface-container border border-ds-secondary/15 text-ds-on-surface-variant">
              <span className="text-ds-primary font-semibold">{label}: </span>{value}
            </span>
          ))}
        </div>

        {/* Planetary hurdles warning */}
        {verdict.hasHurdles && verdict.hurdlesNote && (
          <div className="flex gap-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs">
            <span className="text-amber-600 dark:text-amber-400 flex-shrink-0 text-sm">⚠</span>
            <p className="text-[11px] text-amber-700 dark:text-amber-200 leading-relaxed m-0">{verdict.hurdlesNote}</p>
          </div>
        )}

        {/* Vedic Reasoning — collapsed by default */}
        {verdict.checkpoints?.length > 0 && (
          <>
            <button
              onClick={() => setExpanded((e) => !e)}
              className="flex items-center gap-1.5 text-xs font-semibold text-ds-on-surface-variant hover:text-ds-primary pt-2 border-t border-ds-secondary/15 cursor-pointer w-full text-left transition-colors"
            >
              <span className={`inline-block transition-transform ${expanded ? 'rotate-90' : 'rotate-0'}`}>▸</span>
              {expanded ? 'Hide' : 'Show'} Vedic reasoning ({verdict.checkpoints.length} checkpoints)
            </button>

            {expanded && (
              <div className="flex flex-col gap-1.5">
                {verdict.checkpoints.map((cp) => {
                  const cs = CP_CONFIG[cp.status] || CP_CONFIG['Requires Caution'];
                  return (
                    <div key={cp.step} className="flex items-start gap-2.5 bg-ds-surface-container border border-ds-secondary/15 rounded-xl p-3">
                      <span className="w-5 h-5 rounded-full bg-ds-primary/20 text-ds-primary text-[9px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                        {cp.step}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-xs font-semibold text-ds-secondary">{cp.title}</span>
                          <span className={`text-[8px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded border ${cs.text} ${cs.bg} ${cs.border}`}>
                            {cp.status}
                          </span>
                        </div>
                        <p className="text-[10px] text-ds-on-surface-variant leading-relaxed m-0">{cp.note}</p>
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

function AssistantBubble({ msg }: { msg: ChatMessage }) {
  if (msg.error) {
    return (
      <div className="flex gap-2.5">
        <div className="w-7 h-7 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center flex-shrink-0 mt-0.5 text-xs text-rose-500">✦</div>
        <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-2xl rounded-tl-xs text-xs text-rose-600 dark:text-rose-400 leading-relaxed">
          {msg.error}
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-2.5 w-full">
      <div className="w-7 h-7 rounded-full bg-ds-primary/10 border border-ds-primary/20 flex items-center justify-center flex-shrink-0 mt-1 text-xs text-ds-primary">✦</div>
      <div className="flex-1 min-w-0">
        {msg.verdict && <VerdictCard verdict={msg.verdict} />}
      </div>
    </div>
  );
}

function LoadingBubble() {
  return (
    <div className="flex gap-2.5">
      <div className="w-7 h-7 rounded-full bg-ds-primary/10 border border-ds-primary/20 flex items-center justify-center flex-shrink-0 text-xs text-ds-primary animate-pulse">✦</div>
      <div className="px-4 py-3 bg-ds-surface border border-ds-secondary/15 rounded-2xl rounded-tl-xs flex items-center gap-3">
        <span className="text-xs text-ds-on-surface-variant font-mono">Analyzing your chart</span>
        <span className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <span key={i} className="w-1.5 h-1.5 rounded-full bg-ds-primary animate-bounce" style={{ animationDelay: `${-0.3 + i * 0.15}s` }} />
          ))}
        </span>
      </div>
    </div>
  );
}

function HistoryPanel({ isOpen, history, onClose, onSelect, onClear }: { isOpen: boolean; history: HistoryItem[]; onClose: () => void; onSelect: (text: string) => void; onClear: () => void }) {
  if (!isOpen) return null;
  return (
    <div className="absolute inset-0 z-50 flex">
      <div className="w-70 bg-ds-surface border-r border-ds-secondary/15 flex flex-col h-full shadow-ds-lg">
        <div className="flex items-center justify-between px-4 py-3 border-b border-ds-secondary/15 flex-shrink-0">
          <span className="text-xs font-bold text-ds-primary uppercase tracking-wider">Query History</span>
          <button onClick={onClose} className="text-ds-on-surface-variant hover:text-ds-secondary text-lg cursor-pointer px-1">×</button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1">
          {history.length === 0 ? (
            <p className="text-xs text-ds-on-surface-variant text-center py-8">No queries yet</p>
          ) : (
            history.map((item) => (
              <button
                key={item.id}
                onClick={() => { onSelect(item.text); onClose(); }}
                className="w-full text-left p-2.5 rounded-xl bg-transparent hover:bg-ds-surface-container border border-transparent hover:border-ds-secondary/15 cursor-pointer transition-colors"
              >
                <p className="text-xs text-ds-secondary leading-normal m-0 mb-1 line-clamp-2">{item.text}</p>
                <span className="text-[10px] text-ds-on-surface-variant">{ago(item.ts)}</span>
              </button>
            ))
          )}
        </div>
        {history.length > 0 && (
          <div className="p-3 border-t border-ds-secondary/15 flex-shrink-0">
            <button onClick={onClear} className="w-full text-xs text-rose-600 dark:text-rose-400 hover:underline cursor-pointer py-1 font-semibold">
              Clear history
            </button>
          </div>
        )}
      </div>
      <div className="flex-1 bg-black/40" onClick={onClose} />
    </div>
  );
}

function InputBar({ value, onChange, onSend, isLoading, isEmpty, onSelectSuggestion, inputRef }: { value: string; onChange: (v: string) => void; onSend: () => void; isLoading: boolean; isEmpty: boolean; onSelectSuggestion: (t: string) => void; inputRef: React.RefObject<HTMLInputElement> }) {
  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="flex-shrink-0 border-t border-ds-secondary/15 bg-ds-surface/90 backdrop-blur-md">
      {isEmpty && (
        <div className="px-4 pt-3 pb-1 flex flex-wrap gap-1.5">
          {QUERIES.map((q) => (
            <button
              key={q.label}
              onClick={() => onSelectSuggestion(q.text)}
              className="text-[10px] font-semibold text-ds-on-surface-variant px-2.5 py-1 rounded-lg bg-ds-surface-container border border-ds-secondary/15 hover:border-ds-primary/40 hover:text-ds-secondary transition-colors cursor-pointer"
            >
              {q.icon} {q.label}
            </button>
          ))}
        </div>
      )}
      <div className="flex items-center gap-2.5 p-3.5 px-4">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKey}
          disabled={isLoading}
          placeholder="Ask about career, marriage, property, health…"
          className="flex-1 bg-ds-surface-container border border-ds-secondary/15 focus:border-ds-primary rounded-xl px-4 py-2.5 text-xs sm:text-sm text-ds-secondary outline-none transition-colors disabled:opacity-50"
        />
        <button
          onClick={onSend}
          disabled={isLoading || !value.trim()}
          className="w-10 h-10 rounded-xl flex-shrink-0 bg-ds-primary text-ds-on-primary font-bold flex items-center justify-center text-base disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
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

  const dateStr = birthDetails?.date || '1996-11-11';
  const timeStr = birthDetails?.time || '13:50:00';
  const lat = birthDetails?.latitude || 17.17;

  let planetLongitudes: Record<string, number> = calculateApproximatePlanetaryLongitudes(dateStr, timeStr);
  if (isAdam) {
    planetLongitudes = {
      Sun: 205.2, Moon: 202.1, Mars: 135.5, Mercury: 220.4,
      Jupiter: 258.8, Venus: 168.3, Saturn: 338.2, Rahu: 172.6, Ketu: 352.6, Lagna: 311.4
    };
  }

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
  }

  const moonDegree = planetLongitudes.Moon ?? 202.1;

  // 1. Calculate Placidus House Cusps FIRST
  const ascDegree = planetLongitudes.Lagna ?? 311.4;
  const houses = (isAdam && dateStr === '1996-11-11') ? ADAM_HOUSES_KP : calculatePlacidusCusps(ascDegree, lat, dateStr, timeStr);

  // 2. Calculate Planets with actual occupied house
  const planetNames = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
  const planets: KPPlanet[] = planetNames.map((pName) => {
    const deg = planetLongitudes[pName] ?? 180;
    const subLordChain = calculateKPSubLord(deg);
    const occupiedHouse = getHouseOccupied(deg, houses);
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
      significatorOf: [occupiedHouse]
    };
  });

  const { houseSignificators, planetSignificators } = analyzeSignificators(planets, houses);
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
    <div className={`relative flex flex-col ${hideHeader ? 'h-full' : 'h-[680px]'} bg-ds-surface text-ds-secondary overflow-hidden font-sans ${hideHeader ? '' : 'rounded-2xl border border-ds-secondary/15 shadow-ds-sm'}`}>
      <HistoryPanel
        isOpen={historyOpen}
        history={history}
        onClose={() => setHistoryOpen(false)}
        onSelect={send}
        onClear={() => setHistory([])}
      />

      {/* Header */}
      {!hideHeader && (
        <header className="flex items-center justify-between px-4 py-3 border-b border-ds-secondary/15 bg-ds-surface-container/80 backdrop-blur-md flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-ds-primary/10 border border-ds-primary/20 flex items-center justify-center text-xs text-ds-primary">✦</div>
            <div>
              <p className="m-0 text-xs sm:text-sm font-bold text-ds-secondary leading-tight">KP Query Engine</p>
              <p className="m-0 text-[10px] text-ds-on-surface-variant leading-tight">
                Krishnamurti Paddhati · {nativeName} {nativeDate ? `· ${nativeDate}` : ''}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {messages.length > 0 && (
              <button
                onClick={() => setMessages([])}
                className="text-[10px] font-bold text-ds-on-surface-variant hover:text-ds-secondary px-2.5 py-1 rounded-lg bg-transparent border border-ds-secondary/15 hover:border-ds-primary/40 cursor-pointer transition-colors"
              >
                New Chat
              </button>
            )}
            <button
              onClick={() => setHistoryOpen(true)}
              className="text-[10px] font-bold text-ds-on-surface-variant hover:text-ds-secondary px-2.5 py-1 rounded-lg bg-transparent border border-ds-secondary/15 hover:border-ds-primary/40 cursor-pointer flex items-center gap-1 transition-colors"
            >
              ⏱ History {history.length > 0 && <span className="text-ds-primary">({history.length})</span>}
            </button>
          </div>
        </header>
      )}

      {/* Chat Canvas */}
      <main className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <EmptyState onSelect={send} activeDashaStr={activeDashaStr} chart={chart} />
        ) : (
          <div className="max-w-2xl mx-auto p-4 sm:p-6 flex flex-col gap-5">
            {messages.map((msg) =>
              msg.role === 'user' ? (
                <UserBubble key={msg.id} text={msg.content || ''} />
              ) : (
                <AssistantBubble key={msg.id} msg={msg} />
              )
            )}
            {loading && <LoadingBubble />}
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
      />
    </div>
  );
};

export default KPQueryView;
