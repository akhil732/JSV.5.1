import React from 'react';
import { Heart, Briefcase, TrendingUp, Clock, ShieldAlert, Sparkles } from 'lucide-react';
import { BirthDetails } from '../../types';

export interface TopicTemplate {
  id: string;
  lucideIcon: React.ReactNode;
  title: string;
  subtitle: string;
  query: string;
}

const DEFAULT_TOPICS: TopicTemplate[] = [
  {
    id: 'marriage-timing',
    lucideIcon: <Heart className="w-4 h-4 text-rose-400" />,
    title: 'Marriage & Timing',
    subtitle: 'When will I marry? Compatibility?',
    query: 'When is my auspicious marriage window based on my Dasha timing and 7th house sub-lord analysis?'
  },
  {
    id: 'career-promotion',
    lucideIcon: <Briefcase className="w-4 h-4 text-sky-400" />,
    title: 'Career & Promotion',
    subtitle: 'What does my 10th House indicate?',
    query: 'What does my 10th house cusp sub-lord indicate for career growth, elevation, and promotions?'
  },
  {
    id: 'wealth-finances',
    lucideIcon: <TrendingUp className="w-4 h-4 text-emerald-400" />,
    title: 'Wealth & Finances',
    subtitle: '2nd & 11th sub-lord analysis',
    query: 'How do my 2nd and 11th house sub-lords promise financial gains and wealth inflow in my active Dasha?'
  },
  {
    id: 'dasha-transits',
    lucideIcon: <Clock className="w-4 h-4 text-amber-400" />,
    title: 'Dasha & Transits',
    subtitle: 'Current timing & favorable dates',
    query: 'What are my current Dasha-Bhukti periods and how do Saturn and Jupiter transits influence my overall timing?'
  },
  {
    id: 'health-wellness',
    lucideIcon: <ShieldAlert className="w-4 h-4 text-emerald-400" />,
    title: 'Health & Wellness',
    subtitle: '6th House & Dosha vitality',
    query: 'What does my 6th house cusp sub-lord and active Dasha signify regarding health, energy levels, and vitality?'
  },
  {
    id: 'spiritual-growth',
    lucideIcon: <Sparkles className="w-4 h-4 text-purple-400" />,
    title: 'Spiritual Growth',
    subtitle: '9th & 12th House insights',
    query: 'How do my 9th and 12th house sub-lords support spiritual expansion, higher wisdom, and inner peace?'
  }
];

interface TopicCardsProps {
  onSelectTopic: (queryText: string) => void;
  summaryText?: string;
  birthDetails?: BirthDetails;
}

export const TopicCards: React.FC<TopicCardsProps> = ({ onSelectTopic, summaryText, birthDetails }) => {
  const defaultSummaryText = "You are born with a Aquarius Ascendant ruled by Saturn, giving a resilient, structured life path. Your emotional mind is centered in Moon in Libra (Vishakha - Pada 3), while your core identity and soul purpose align with Sun in Libra. You are currently navigating the active period of Mercury Mahadasha — specifically the Venus Antardasha and Venus Pratyantardasha.";

  const profileText = birthDetails
    ? `${birthDetails.name}, ${birthDetails.date} at ${birthDetails.time}, ${birthDetails.place}`
    : "I. MEENAKSHI, 1949-08-08 at 11:00:00, Jaggampeta";

  return (
    <div className="w-full max-w-2xl mx-auto py-2 sm:py-4 px-2 sm:px-4 animate-fade-in space-y-2.5">
      <div className="text-center space-y-1.5">
        <div className="text-[11px] sm:text-xs font-bold font-mono text-ds-primary bg-ds-primary/10 border border-ds-primary/20 px-3 py-1 rounded-xl inline-block max-w-full truncate shadow-2xs">
          {profileText}
        </div>
        <p className="text-xs sm:text-sm text-ds-on-surface-variant leading-relaxed max-w-xl mx-auto font-sans font-medium">
          {summaryText || defaultSummaryText}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:gap-3 pt-1">
        {DEFAULT_TOPICS.map((topic) => (
          <button
            key={topic.id}
            onClick={() => onSelectTopic(topic.query)}
            className="group p-2.5 sm:p-3 bg-ds-surface border border-ds-secondary/15 hover:border-ds-primary/60 rounded-xl text-left transition-all duration-200 hover:-translate-y-0.5 shadow-xs hover:shadow-sm cursor-pointer flex flex-col justify-between space-y-1.5 min-h-[72px]"
          >
            <div className="flex items-center justify-between">
              <div className="p-1.5 rounded-lg bg-ds-surface-container border border-ds-secondary/10 group-hover:border-ds-primary/20 transition-colors">
                {topic.lucideIcon}
              </div>
            </div>

            <div>
              <h3 className="text-xs sm:text-sm font-bold text-ds-secondary group-hover:text-ds-primary transition-colors truncate">
                {topic.title}
              </h3>
              <p className="text-[10px] sm:text-xs text-ds-on-surface-variant mt-0.5 truncate font-medium">
                {topic.subtitle}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
